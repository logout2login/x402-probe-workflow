// ─── v1.5 Refetch Cron ───
//
// 每日 06:00 UTC 抽樣 20% 的 active packages 的 evidence，refetch 並比對
// excerpt_hash。連續 2 次 fail 觸發 recall。
//
// 硬性約束：
//   - 只抽樣，不覆蓋全部（避免 source 封鎖 / 速率限制）
//   - 結果寫入 refetch_events 表
//   - 抽樣失敗不中斷整個 cron
//   - 抽樣時使用 User-Agent 標記为 ownsite-aeo-refetch-bot

import { sha256 } from "@noble/hashes/sha256";
import type { Env } from "./env";
import { recallPackage } from "./recall-package";

interface RefetchStats {
  run_id: string;
  sampled_packages: number;
  sampled_evidence: number;
  matched: number;
  mismatched: number;
  network_errors: number;
  not_found: number;
  content_changed: number;
  recalls_triggered: number;
}

export async function runRefetchScan(env: Env): Promise<RefetchStats> {
  const runId = `refetch-${Date.now()}`;
  const sampleRate = parseFloat(env.REFETCH_SAMPLE_RATE || "0.20");
  const consecutiveFails = parseInt(env.REFETCH_CONSECUTIVE_FAILS || "2", 10);
  const nowIso = new Date().toISOString();

  const stats: RefetchStats = {
    run_id: runId,
    sampled_packages: 0,
    sampled_evidence: 0,
    matched: 0,
    mismatched: 0,
    network_errors: 0,
    not_found: 0,
    content_changed: 0,
    recalls_triggered: 0,
  };

  // 抽樣 packages（fresh 或 stale，不抽 recalled）
  const { results: activePkgs } = await env.DB.prepare(
    `SELECT package_id FROM packages WHERE status IN ('fresh','stale') ORDER BY RANDOM()`
  ).all<{ package_id: string }>();

  const sampleSize = Math.max(1, Math.ceil(activePkgs.length * sampleRate));
  const sampledPkgs = activePkgs.slice(0, sampleSize);
  stats.sampled_packages = sampledPkgs.length;

  for (const { package_id: pkgId } of sampledPkgs) {
    const verifyRaw = await env.KV.get(`verify:${pkgId}`);
    if (!verifyRaw) continue;
    let verification: { evidence?: Array<{ evidence_id: string; source_url: string; excerpt_hash: string }> };
    try {
      verification = JSON.parse(verifyRaw) as typeof verification;
    } catch {
      continue;
    }
    if (!verification.evidence?.length) continue;

    let consecutiveFailsLocal = 0;

    for (const ev of verification.evidence.slice(0, 5)) { // 每包最多抽 5 條
      stats.sampled_evidence += 1;
      const t0 = Date.now();
      const result = await refetchAndCompare(ev.source_url, ev.excerpt_hash);
      const latency = Date.now() - t0;

      await env.DB.prepare(
        `INSERT INTO refetch_events
         (package_id, evidence_id, source_url, excerpt_hash, matched, refetch_status, latency_ms, sampled_at, run_id)
         VALUES (?,?,?,?,?,?,?,?,?)`
      ).bind(
        pkgId,
        ev.evidence_id,
        ev.source_url,
        ev.excerpt_hash,
        result.matched ? 1 : 0,
        result.status,
        latency,
        nowIso,
        runId
      ).run();

      if (result.matched) {
        stats.matched += 1;
      } else if (result.status === "network_error") {
        stats.network_errors += 1;
      } else if (result.status === "not_found") {
        stats.not_found += 1;
      } else if (result.status === "content_changed") {
        stats.content_changed += 1;
        consecutiveFailsLocal += 1;
      } else {
        stats.mismatched += 1;
      }
    }

    // 連續 fail 觸發 recall
    if (consecutiveFailsLocal >= consecutiveFails) {
      const ok = await recallPackage(env, pkgId, {
        reason: `refetch_hash_mismatch_${consecutiveFailsLocal}/${consecutiveFails}`,
        decidedBy: "cron-refetch",
      });
      if (ok) stats.recalls_triggered += 1;
    }
  }

  return stats;
}

interface RefetchResult {
  matched: boolean;
  status: "ok" | "network_error" | "content_changed" | "not_found";
}

async function refetchAndCompare(
  sourceUrl: string,
  expectedHash: string
): Promise<RefetchResult> {
  try {
    const resp = await fetch(sourceUrl, {
      headers: { "user-agent": "ownsite-aeo-refetch-bot/1.5" },
      redirect: "follow",
    });
    if (!resp.ok) {
      if (resp.status === 404) return { matched: false, status: "not_found" };
      return { matched: false, status: "network_error" };
    }
    const text = await resp.text();
    // 精確 span 抽取需要 span_v1 grammar（v1.2 候選）；
    // 這裡做「整頁 hash」比對作為 fallback —— 若 hash 相符即 matched。
    const pageHash = "sha256:" + Array.from(sha256(new TextEncoder().encode(text))).map(b => b.toString(16).padStart(2, "0")).join("");
    if (pageHash === expectedHash) return { matched: true, status: "ok" };
    return { matched: false, status: "content_changed" };
  } catch {
    return { matched: false, status: "network_error" };
  }
}
