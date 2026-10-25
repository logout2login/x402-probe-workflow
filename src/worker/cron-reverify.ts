// ─── v1.8 Reverify Cron ───
//
// 每小時 15 分觸發，掃描 stale 或接近過期（<72h）的 packages，
// 向 verifier 請求重新評分。若新 q >= RECALL_Q_THRESHOLD 且新 verified_at 更新，
// 則寫入 KV verify:*、更新 packages，並把 recall_log 標記為 unrecall。
//
// 硬性約束：
//   - 每次只處理 LEASE 未過期的包（防止競態）
//   - 記錄 reverify_attempts 供 audit
//   - 失敗不中斷整個 cron

import { RECALL_Q_THRESHOLD } from "../shared/constants";
import type { Env } from "./env";
import { callVerifierForReverify } from "./reverify-client";
import { recallPackage } from "./recall-package";

interface ReverifyStats {
  scanned: number;
  leased: number;
  success: number;
  low_q: number;
  no_change: number;
  verifier_error: number;
  timed_out: number;
  now_recalled: number;
}

export async function runReverifyCron(env: Env): Promise<ReverifyStats> {
  const stats: ReverifyStats = {
    scanned: 0, leased: 0, success: 0, low_q: 0, no_change: 0,
    verifier_error: 0, timed_out: 0, now_recalled: 0,
  };

  const leaseHours = parseInt(env.REVERIFY_LEASE_HOURS || "24", 10);
  const now = Date.now();
  const warningBoundary = now + 72 * 3600_000;
  const workerId = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { results } = await env.DB.prepare(
    `SELECT p.*,
            (SELECT leased_until FROM reverify_leases WHERE package_id=p.package_id) as lease_until
     FROM packages p
     WHERE p.status IN ('fresh','stale')
       AND p.expires_at <= ?
     ORDER BY p.expires_at ASC
     LIMIT 20`
  ).bind(new Date(warningBoundary).toISOString()).all<{
    package_id: string;
    status: string;
    q: number;
    verified_at: string;
    expires_at: string;
    lease_until: string | null;
  }>();

  for (const pkg of results) {
    stats.scanned += 1;

    // 檢查 lease 是否可用（防重複）
    if (pkg.lease_until && new Date(pkg.lease_until).getTime() > now) {
      continue;
    }

    // 建立/續期 lease
    await env.DB.prepare(
      `INSERT INTO reverify_leases (package_id, leased_by, leased_until, attempt)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(package_id) DO UPDATE SET leased_until=excluded.leased_until, leased_by=excluded.leased_by`
    ).bind(
      pkg.package_id, workerId,
      new Date(now + leaseHours * 3600_000).toISOString()
    ).run().catch(() => { /* ignore conflict */ });
    stats.leased += 1;

    const t0 = Date.now();
    const result = await callVerifierForReverify(env, pkg.package_id, {
      q: pkg.q, verified_at: pkg.verified_at, expires_at: pkg.expires_at,
    });
    const finishedAt = new Date().toISOString();

    if (!result.ok) {
      if (result.reason?.includes("timeout")) stats.timed_out += 1;
      else stats.verifier_error += 1;
      await recordAttempt(env, pkg.package_id, "verifier_error", pkg.q, null, null, null, `reason=${result.reason}`, t0, finishedAt);
      continue;
    }

    // 若新 q 低於 recall 門檻，觸發 recall
    if ((result.newQ ?? pkg.q) < RECALL_Q_THRESHOLD) {
      await recallPackage(env, pkg.package_id, {
        reason: `reverify_low_q_${result.newQ}`,
        decidedBy: "cron-reverify",
      });
      stats.now_recalled += 1;
      await recordAttempt(env, pkg.package_id, "low_q", pkg.q, result.newQ ?? null, result.newVerifiedAt ?? null, result.newExpiresAt ?? null, "below_threshold", t0, finishedAt);
      continue;
    }

    // 若無變化（同 q、同 expires_at）
    if (result.newQ === pkg.q && result.newExpiresAt === pkg.expires_at) {
      await recordAttempt(env, pkg.package_id, "no_change", pkg.q, result.newQ ?? null, result.newVerifiedAt ?? null, result.newExpiresAt ?? null, "same_values", t0, finishedAt);
      stats.no_change += 1;
      continue;
    }

    // 寫入新版 verification
    if (result.newVerification) {
      await env.KV.put(`verify:${pkg.package_id}`, JSON.stringify(result.newVerification));
      await env.DB.prepare(
        "UPDATE packages SET q=?, verified_at=?, expires_at=?, status='fresh', held_since=NULL, held_days=0, updated_at=? WHERE package_id=?"
      ).bind(
        result.newQ ?? pkg.q,
        result.newVerifiedAt ?? pkg.verified_at,
        result.newExpiresAt ?? pkg.expires_at,
        finishedAt,
        pkg.package_id
      ).run();
      await env.KV.put(`status:${pkg.package_id}`, "fresh");
      // 若之前 recall，標記 unrecall
      if (pkg.status === "recalled") {
        await env.DB.prepare(
          "UPDATE recall_log SET unrecall_at=?, unrecall_by=? WHERE package_id=? AND unrecall_at IS NULL"
        ).bind(finishedAt, "cron-reverify", pkg.package_id).run();
      }
      stats.success += 1;
    } else {
      await recordAttempt(env, pkg.package_id, "no_change", pkg.q, result.newQ ?? null, result.newVerifiedAt ?? null, result.newExpiresAt ?? null, "no_verification_json", t0, finishedAt);
      stats.no_change += 1;
    }

    // 釋放 lease
    await env.DB.prepare("DELETE FROM reverify_leases WHERE package_id=?").bind(pkg.package_id).run();
  }

  return stats;
}

async function recordAttempt(
  env: Env,
  pkgId: string,
  result: string,
  oldQ: number | null,
  newQ: number | null,
  newVerifiedAt: string | null,
  newExpiresAt: string | null,
  detail: string,
  startMs: number,
  finishedAt: string
) {
  await env.DB.prepare(
    `INSERT INTO reverify_attempts (package_id, attempt, result, old_q, new_q, new_verified_at, new_expires_at, detail, started_at, finished_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(pkgId, 1, result, oldQ, newQ, newVerifiedAt, newExpiresAt, detail, new Date(startMs).toISOString(), finishedAt).run();
}
