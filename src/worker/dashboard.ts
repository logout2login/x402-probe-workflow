// ─── v1.6 Dashboard endpoint ───
//
// GET /dashboard.json — 公開系統健康狀態（AEO 免費信任信號）。
// 只暴露聚合指標，不洩露任何 Agent pseudonym 或原始地址。
//
// 響應結構：
// {
//   generated_at, time_range_days,
//   totals: { packages_listed, packages_featured, packages_recalled,
//            payments, revenue_usdc, refetch_pass_rate },
//   funnel: { verify_calls, buy_attempts, buy_successes, buy_rate },
//   latency: { p50, p95, p99 },         // v1.16 分段延遲
//   facilitators: { cdp, selfhosted },  // v1.12
//   refetch: { run_count, pass_rate, consecutive_fail_rate },
//   uptime: { total_days, days_with_zero_paid_calls }
// }

import type { Env } from "./env";
import { json } from "./http";

export async function handleDashboard(env: Env): Promise<Response> {
  const days = Math.min(90, Math.max(1, parseInt(new URL(env.OWNSITE_BASE).searchParams.get("days") ?? "30", 10)));
  const dayAgo = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const [
    pkgsResult,
    paymentsResult,
    settleDaily,
    refetchResult,
    recallResult,
    verifyCount,
    buyCount,
    facilitatorDaily,
  ] = await Promise.all([
    env.DB.prepare(
      "SELECT COUNT(*) as c FROM packages WHERE tier IN ('listed','featured') AND status='fresh'"
    ).first<{ c: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) as c, SUM(CAST(amount_usdc AS REAL))/1000000 as rev
       FROM payments WHERE called_at >= ? AND status='settled'`
    ).bind(dayAgo).first<{ c: number; rev: number | null }>(),
    env.DB.prepare(
      `SELECT facilitator, settled, failed, total_amount_usdc, fallback_rate
       FROM settle_daily WHERE day >= ? ORDER BY day DESC`
    ).bind(dayAgo).all<SettleDailyRow>(),
    env.DB.prepare(
      `SELECT
         COUNT(*) as runs,
         SUM(CASE WHEN matched=1 THEN 1 ELSE 0 END) as ok,
         COUNT(DISTINCT package_id) as unique_pkgs
       FROM refetch_events WHERE sampled_at >= ?`
    ).bind(dayAgo).first<{ runs: number; ok: number | null; unique_pkgs: number }>(),
    env.DB.prepare(
      "SELECT COUNT(*) as c FROM recall_log WHERE decided_at >= ?"
    ).bind(dayAgo).first<{ c: number }>(),
    env.DB.prepare(
      "SELECT value FROM kpi_snapshot WHERE metric='verify_calls' AND day >= ? ORDER BY day DESC"
    ).bind(dayAgo).all<{ value: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM payments WHERE called_at >= ?`
    ).bind(dayAgo).first<{ c: number }>(),
    env.DB.prepare(
      `SELECT facilitator, SUM(healthy_hours) as healthy, SUM(total_hours) as total
       FROM facilitator_daily WHERE day >= ? GROUP BY facilitator`
    ).bind(dayAgo).all<{ facilitator: string; healthy: number | null; total: number | null }>(),
  ]);

  const verifySum = verifyCount.results.reduce((s, r) => s + (r.value || 0), 0);
  const buySuccess = paymentsResult?.c ?? 0;
  const buyAttempts = buyCount?.c ?? 0;

  // 分段延遲（v1.16）
  const latencies = (await env.DB.prepare(
    "SELECT latency_ms FROM settle_attempts WHERE called_at >= ? AND latency_ms IS NOT NULL"
  ).bind(dayAgo).all<{ latency_ms: number }>()).results.map(r => r.latency_ms)
    .sort((a, b) => a - b);
  const latency = percentileStats(latencies);

  // Facilitator 健康度
  const facilitators: Record<string, { healthy_hours: number; total_hours: number; uptime: number }> = {};
  for (const f of facilitatorDaily.results) {
    facilitators[f.facilitator] = {
      healthy_hours: f.healthy ?? 0,
      total_hours: f.total ?? 0,
      uptime: (f.total ?? 0) > 0 ? (f.healthy ?? 0) / (f.total ?? 0) : 1.0,
    };
  }

  // Refetch 統計
  const refetchTotal = refetchResult?.runs ?? 0;
  const refetchOk = refetchResult?.ok ?? 0;

  const body = {
    generated_at: nowIso,
    time_range_days: days,
    totals: {
      packages_listed: pkgsResult?.c ?? 0,
      packages_featured: (await env.DB.prepare(
        "SELECT COUNT(*) as c FROM packages WHERE tier='featured' AND status='fresh'"
      ).first<{ c: number }>())?.c ?? 0,
      packages_recalled_30d: recallResult?.c ?? 0,
      payments_30d: buySuccess,
      revenue_usdc_30d: Math.round((paymentsResult?.rev ?? 0) * 100) / 100,
      refetch_pass_rate: refetchTotal > 0 ? Math.round((refetchOk / refetchTotal) * 10000) / 10000 : null,
    },
    funnel: {
      verify_calls_30d: verifySum,
      buy_attempts_30d: buyAttempts,
      buy_successes_30d: buySuccess,
      verify_to_buy_rate: verifySum > 0 ? Math.round((buySuccess / verifySum) * 10000) / 10000 : null,
      attempt_to_success_rate: buyAttempts > 0 ? Math.round((buySuccess / buyAttempts) * 10000) / 10000 : null,
    },
    latency: latency,
    facilitators: facilitators,
    settle_history: settleDaily.results.slice(0, 30),
    uptime: {
      refetch_runs_30d: refetchTotal,
      refetch_unique_packages: refetchResult?.unique_pkgs ?? 0,
    },
    disclaimer: "Public aggregate metrics. No individual Agent or payer data exposed.",
  };

  return json(body, 200, {
    "cache-control": "public, max-age=300",
  });
}

interface SettleDailyRow {
  facilitator: string;
  settled: number;
  failed: number;
  total_amount_usdc: string;
  fallback_rate: number | null;
}

function percentileStats(sorted: number[]): { p50: number | null; p95: number | null; p99: number | null; count: number } {
  if (sorted.length === 0) return { p50: null, p95: null, p99: null, count: 0 };
  const pct = (p: number) => {
    const idx = Math.min(sorted.length - 1, Math.floor(p / 100 * sorted.length));
    return sorted[idx]!;
  };
  return { p50: pct(50), p95: pct(95), p99: pct(99), count: sorted.length };
}

// 保留引用避免 tree-shake
void json;

export async function handleDashboardSales(env: Env, days: number): Promise<Response> {
  const dayAgo = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
  const results = await env.DB.prepare(
    `SELECT package_id, amount_usdc, called_at, status, agent_pseudonym, tx_hash
     FROM payments WHERE called_at >= ? ORDER BY called_at DESC LIMIT 50`
  ).bind(dayAgo).all<{ package_id: string; amount_usdc: string; called_at: string; status: string; agent_pseudonym: string; tx_hash: string }>();

  return json(results.results ?? []);
}
