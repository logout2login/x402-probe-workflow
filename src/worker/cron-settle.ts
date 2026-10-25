// ─── v1.9 Settle Aggregation Cron ───
//
// 每小時 45 分觸發：
//   1. 聚合本小時 settle_attempts → settle_hourly
//   2. 每日 09:00 UTC 觸發時聚合前一日 → settle_daily（含 fallback_rate）

import type { Env } from "./env";

interface SettleHourlyStats {
  hour: string;
  rows: number;
}

export async function runSettleCron(env: Env): Promise<SettleHourlyStats> {
  const now = new Date();
  const hourStart = new Date(now);
  hourStart.setUTCMinutes(0, 0, 0);
  hourStart.setUTCHours(hourStart.getUTCHours() - 1); // 上小時
  const hourEnd = new Date(hourStart.getTime() + 3600_000);

  const { results } = await env.DB.prepare(
    `SELECT facilitator, result, latency_ms, amount_usdc
     FROM settle_attempts
     WHERE called_at >= ? AND called_at < ?`
  ).bind(
    hourStart.toISOString(),
    hourEnd.toISOString()
  ).all<{ facilitator: string; result: string; latency_ms: number | null; amount_usdc: string | null }>();

  // 按 facilitator 分組
  const byFacilitator: Record<string, { settled: number; failed: number; latencies: number[]; totalAmount: number }> = {};
  for (const r of results) {
    if (!byFacilitator[r.facilitator]) {
      byFacilitator[r.facilitator] = { settled: 0, failed: 0, latencies: [], totalAmount: 0 };
    }
    const f = byFacilitator[r.facilitator]!;
    if (r.result === "settled") {
      f.settled += 1;
      f.totalAmount += parseInt(r.amount_usdc ?? "0", 10);
    } else {
      f.failed += 1;
    }
    if (r.latency_ms) f.latencies.push(r.latency_ms);
  }

  let rows = 0;
  const hourKey = hourStart.toISOString().slice(0, 13) + ":00:00Z";
  for (const [facilitator, agg] of Object.entries(byFacilitator)) {
    const sorted = agg.latencies.sort((a, b) => a - b);
    const avg = sorted.length > 0 ? Math.round(sorted.reduce((s, x) => s + x, 0) / sorted.length) : null;
    const p95 = sorted.length > 0 ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))]! : null;
    await env.DB.prepare(
      `INSERT INTO settle_hourly (hour, facilitator, settled, failed, total_amount_usdc, avg_latency_ms, p95_latency_ms)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(hour, facilitator) DO UPDATE SET
         settled=excluded.settled, failed=excluded.failed,
         total_amount_usdc=excluded.total_amount_usdc,
         avg_latency_ms=excluded.avg_latency_ms, p95_latency_ms=excluded.p95_latency_ms`
    ).bind(hourKey, facilitator, agg.settled, agg.failed, String(agg.totalAmount), avg, p95).run();
    rows += 1;
  }

  // 每日聚合（09:00 UTC 觸發）
  if (now.getUTCHours() === 9) {
    await aggregateDaily(env);
  }

  return { hour: hourKey, rows };
}

async function aggregateDaily(env: Env) {
  const day = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
  const dayStart = new Date(day).toISOString();
  const dayEnd = new Date(new Date(dayStart).getTime() + 86400_000).toISOString();

  const { results: settleRows } = await env.DB.prepare(
    `SELECT facilitator, result, amount_usdc
     FROM settle_attempts
     WHERE called_at >= ? AND called_at < ?`
  ).bind(dayStart, dayEnd).all<{ facilitator: string; result: string; amount_usdc: string | null }>();

  const totals: Record<string, { settled: number; failed: number; amount: number }> = {};
  for (const r of settleRows) {
    if (!totals[r.facilitator]) totals[r.facilitator] = { settled: 0, failed: 0, amount: 0 };
    const t = totals[r.facilitator]!;
    if (r.result === "settled") {
      t.settled += 1;
      t.amount += parseInt(r.amount_usdc ?? "0", 10);
    } else {
      t.failed += 1;
    }
  }

  const { results: pkgs } = await env.DB.prepare(
    `SELECT COUNT(DISTINCT package_id) as c FROM payments WHERE called_at >= ? AND called_at < ?`
  ).bind(dayStart, dayEnd).all<{ c: number }>();
  const { results: agents } = await env.DB.prepare(
    `SELECT COUNT(DISTINCT agent_pseudonym) as c FROM payments WHERE called_at >= ? AND called_at < ?`
  ).bind(dayStart, dayEnd).all<{ c: number }>();

  for (const [facilitator, agg] of Object.entries(totals)) {
    const totalAll = Object.values(totals).reduce((s, x) => s + x.failed, 0);
    const fallbackRate = totalAll > 0 ? Math.round((agg.failed / totalAll) * 10000) / 10000 : 0;
    await env.DB.prepare(
      `INSERT INTO settle_daily (day, facilitator, settled, failed, total_amount_usdc, unique_packages, unique_agents, fallback_rate)
       VALUES (?,?,?,?,?,?,?,?)
       ON CONFLICT(day, facilitator) DO UPDATE SET
         settled=excluded.settled, failed=excluded.failed,
         total_amount_usdc=excluded.total_amount_usdc,
         unique_packages=excluded.unique_packages,
         unique_agents=excluded.unique_agents,
         fallback_rate=excluded.fallback_rate`
    ).bind(day, facilitator, agg.settled, agg.failed, String(agg.amount), pkgs[0]?.c ?? 0, agents[0]?.c ?? 0, fallbackRate).run();
  }
}
