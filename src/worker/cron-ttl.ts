// ─── v1.5 TTL Cron ───
//
// 每小時掃描 packages：
//   1. expires_at < now → stale
//   2. expires_at < now + 72h → 標記 held_since（首次進入預警窗口）
//   3. status='stale' 且 held_days >= HELD_MAX_DAYS → recall（自動下架）
//
// 硬性約束：
//   - Recall 是技術下架，保留 replacement 提示
//   - 寫入 recall_log 供 audit
//   - 同步至 sync_queue 讓市集同步下架

import type { Env } from "./env";
import { recallPackage } from "./recall-package";

interface TtlStats {
  scanned: number;
  marked_stale: number;
  marked_held: number;
  auto_recalled: number;
  skipped: number;
}

export async function runTtlCron(env: Env): Promise<TtlStats> {
  const stats: TtlStats = {
    scanned: 0,
    marked_stale: 0,
    marked_held: 0,
    auto_recalled: 0,
    skipped: 0,
  };

  const STALE_WARNING_HOURS = parseInt(env.STALE_WARNING_HOURS || "72", 10);
  const HELD_MAX_DAYS = parseInt(env.HELD_MAX_DAYS || "14", 10);
  const now = Date.now();
  const warningBoundary = now + STALE_WARNING_HOURS * 3600_000;

  const { results } = await env.DB.prepare(
    "SELECT * FROM packages WHERE status IN ('fresh','stale') ORDER BY expires_at ASC"
  ).all<{
    package_id: string;
    status: string;
    expires_at: string;
    held_since: string | null;
    held_days: number;
    tier: string;
  }>();

  for (const pkg of results) {
    stats.scanned += 1;
    const expiresAt = new Date(pkg.expires_at).getTime();
    const nowIso = new Date(now).toISOString();

    if (pkg.status === "fresh" && expiresAt <= now) {
      await env.DB.prepare(
        "UPDATE packages SET status='stale', held_since=?, updated_at=? WHERE package_id=?"
      ).bind(nowIso, nowIso, pkg.package_id).run();
      await env.KV.put(`status:${pkg.package_id}`, "stale");
      stats.marked_stale += 1;
      continue;
    }

    if (pkg.status === "fresh" && expiresAt <= warningBoundary && !pkg.held_since) {
      await env.DB.prepare(
        "UPDATE packages SET held_since=?, updated_at=? WHERE package_id=?"
      ).bind(nowIso, nowIso, pkg.package_id).run();
      stats.marked_held += 1;
      continue;
    }

    if (pkg.status === "stale" && pkg.held_days >= HELD_MAX_DAYS) {
      const ok = await recallPackage(env, pkg.package_id, {
        reason: `auto_recall_held_${pkg.held_days}d`,
        decidedBy: "cron-ttl",
      });
      if (ok) stats.auto_recalled += 1;
      else stats.skipped += 1;
    }
  }

  return stats;
}
