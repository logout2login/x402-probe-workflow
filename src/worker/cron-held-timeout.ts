// ─── v1.15 Held Timeout Cron ───
//
// 每日 08:50 UTC 掃描 held_since 已存在且 held_days >= HELD_MAX_DAYS 的
// packages，自動 recall（永久下架，除非人工 unrecall）。
//
// 對應 wrangler.toml 的 "50 8 * * *" cron。

import type { Env } from "./env";
import { recallPackage } from "./recall-package";

interface HeldTimeoutStats {
  scanned: number;
  recalled: number;
  skipped: number;
}

export async function runHeldTimeoutCron(env: Env): Promise<HeldTimeoutStats> {
  const HELD_MAX_DAYS = parseInt(env.HELD_MAX_DAYS || "14", 10);
  const stats: HeldTimeoutStats = { scanned: 0, recalled: 0, skipped: 0 };

  const { results } = await env.DB.prepare(
    `SELECT package_id, held_since, held_days
     FROM packages
     WHERE status IN ('stale','fresh')
       AND held_since IS NOT NULL
       AND held_days >= ?`
  ).bind(HELD_MAX_DAYS).all<{ package_id: string; held_since: string; held_days: number }>();

  for (const row of results) {
    stats.scanned += 1;
    const ok = await recallPackage(env, row.package_id, {
      reason: `held_timeout_${row.held_days}d_since_${row.held_since.slice(0, 10)}`,
      decidedBy: "cron-held-timeout",
    });
    if (ok) stats.recalled += 1;
    else stats.skipped += 1;
  }

  return stats;
}
