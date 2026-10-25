// ─── v1.6 Dashboard Cron ───
//
// 每日 00:30 UTC 聚合前一日的 KPI 到 kpi_snapshot 表。
// 對應 wrangler.toml 的 "30 0 * * *" cron。

import type { Env } from "./env";

interface DashboardStats {
  day: string;
  metrics_written: number;
}

export async function runDashboardCron(env: Env): Promise<DashboardStats> {
  const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const stats: DashboardStats = { day: yesterday, metrics_written: 0 };

  const yesterdayStart = new Date(yesterday).toISOString();
  const yesterdayEnd = today;

  const [verifyCount, buySuccess, buyFailed, refetchOk, refetchTotal,
        settleOk, settleFail, listCount, featuredCount, heldCount] = await Promise.all([
    countKpi(env, "verify_calls", yesterday),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM payments
       WHERE called_at >= ? AND called_at < ? AND status='settled'`
    ).bind(yesterdayStart, yesterdayEnd).first<{ c: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM settle_attempts
       WHERE called_at >= ? AND called_at < ? AND result != 'settled'`
    ).bind(yesterdayStart, yesterdayEnd).first<{ c: number }>(),
    env.DB.prepare(
      `SELECT SUM(CASE WHEN matched=1 THEN 1 ELSE 0 END) as ok
       FROM refetch_events WHERE sampled_at >= ? AND sampled_at < ?`
    ).bind(yesterdayStart, yesterdayEnd).first<{ ok: number | null }>(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM refetch_events
       WHERE sampled_at >= ? AND sampled_at < ?`
    ).bind(yesterdayStart, yesterdayEnd).first<{ c: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM settle_attempts
       WHERE called_at >= ? AND called_at < ? AND result='settled'`
    ).bind(yesterdayStart, yesterdayEnd).first<{ c: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM settle_attempts
       WHERE called_at >= ? AND called_at < ? AND result != 'settled'`
    ).bind(yesterdayStart, yesterdayEnd).first<{ c: number }>(),
    env.DB.prepare("SELECT COUNT(*) as c FROM packages WHERE tier='listed'").first<{ c: number }>(),
    env.DB.prepare("SELECT COUNT(*) as c FROM packages WHERE tier='featured'").first<{ c: number }>(),
    env.DB.prepare("SELECT COUNT(*) as c FROM packages WHERE held_since IS NOT NULL").first<{ c: number }>(),
  ]);

  const metrics: Array<[string, number]> = [
    ["verify_calls", verifyCount],
    ["buy_successes", buySuccess?.c ?? 0],
    ["buy_failed", buyFailed?.c ?? 0],
    ["refetch_ok", refetchOk?.ok ?? 0],
    ["refetch_total", refetchTotal?.c ?? 0],
    ["settle_ok", settleOk?.c ?? 0],
    ["settle_fail", settleFail?.c ?? 0],
    ["packages_listed_total", listCount?.c ?? 0],
    ["packages_featured_total", featuredCount?.c ?? 0],
    ["packages_held", heldCount?.c ?? 0],
  ];

  if (refetchTotal?.c) {
    metrics.push(["refetch_pass_rate",
      Math.round(((refetchOk?.ok ?? 0) / refetchTotal.c) * 10000) / 10000]);
  }
  if ((settleOk?.c ?? 0) + (settleFail?.c ?? 0) > 0) {
    metrics.push(["settle_success_rate",
      Math.round((settleOk?.c ?? 0) / ((settleOk?.c ?? 0) + (settleFail?.c ?? 0)) * 10000) / 10000]);
  }

  for (const [metric, value] of metrics) {
    await env.DB.prepare(
      "INSERT INTO kpi_snapshot (day, metric, value) VALUES (?, ?, ?)"
    ).bind(yesterday, metric, value).run();
    stats.metrics_written += 1;
  }

  return stats;
}

async function countKpi(env: Env, metric: string, day: string): Promise<number> {
  const { results } = await env.DB.prepare(
    "SELECT value FROM kpi_snapshot WHERE day=? AND metric=? ORDER BY created_at DESC LIMIT 1"
  ).bind(day, metric).all<{ value: number }>();
  return results[0]?.value ?? 0;
}
