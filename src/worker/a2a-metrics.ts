// ─── A2A Marketing Metrics endpoint ───
//
// GET /api/a2a/metrics?network=eip155:84532（可選，過濾指定網絡）
//
// 回傳真實 x402 交易數據（唔計 testnet，唔用 mock），
// 供 Marketing Plan §8 KPI Dashboard 實時引用。
//
// 響應結構：
// {
//   generated_at, network,
//   totals: { settled_count, total_amount_usdc, avg_amount_usdc,
//             unique_payers, repeat_buyer_rate, failed_count },
//   by_facilitator: { selfhosted: {...}, cdp: {...} },
//   by_network: { [networkTag]: { settled, failed, amount_usdc }, ... },
//   daily_trend: [{ day, count, amount_usdc }],
//   top_packages: [{ package_id, payers, total_amount_usdc }]
// }

import type { Env } from "./env";
import { json } from "./http";

interface SettleRow {
  facilitator: string;
  result: string;
  amount_usdc: string | null;
  payer: string | null;
  called_at: string;
  package_id: string;
  error: string | null;
}

interface DailyTrendRow {
  day: string;
  count: number;
  amount_usdc: number;
}

interface TopPackageRow {
  package_id: string;
  payers: number;
  total_amount_usdc: number;
}

export async function handleA2AMetrics(req: Request, env: Env): Promise<Response> {
  // network 為 required var；undefined → throw（fail-closed，唔好跌向 mainnet）
  const networkTag = env.NETWORK;
  if (!networkTag) throw new Error("NETWORK env missing — fail-closed");

  // 可選 ?network= 參數做 client-side 篩選；不傳則查全部網絡
  const url = new URL(req.url);
  const filterNetwork = url.searchParams.get("network") ?? null;
  const hasFilter = filterNetwork !== null && filterNetwork !== "";
  const queryNetwork = hasFilter ? filterNetwork : networkTag;

  let rows: SettleRow[] = [];
  let dailyTrend: DailyTrendRow[] = [];
  let topPackages: TopPackageRow[] = [];

  try {
    const allResult = await env.DB.prepare(
      `SELECT facilitator, result, amount_usdc, payer, called_at, package_id, error, network
       FROM settle_attempts
       WHERE called_at >= datetime('now', '-90 days')
         AND network = ?
       ORDER BY called_at DESC`
    ).bind(queryNetwork).all<SettleRow>();
    rows = allResult.results ?? [];
  } catch (e) {
    console.error("[a2a-metrics] allQuery error:", e);
  }

  try {
    const dailyResult = await env.DB.prepare(
      `SELECT substr(called_at, 1, 10) as day,
              COUNT(*) as count,
              SUM(CAST(amount_usdc AS REAL)) / 1000000 as amount_usdc
       FROM settle_attempts
       WHERE called_at >= datetime('now', '-90 days')
         AND result = 'settled'
         AND network = ?
       GROUP BY day
       ORDER BY day DESC
       LIMIT 30`
    ).bind(queryNetwork).all<DailyTrendRow>();
    dailyTrend = dailyResult.results ?? [];
  } catch (e) {
    console.error("[a2a-metrics] dailyQuery error:", e);
  }

  try {
    const pkgResult = await env.DB.prepare(
      `SELECT package_id,
              COUNT(DISTINCT payer) as payers,
              SUM(CAST(amount_usdc AS REAL)) / 1000000 as total_amount_usdc
       FROM settle_attempts
       WHERE result = 'settled'
         AND amount_usdc IS NOT NULL
         AND network = ?
       GROUP BY package_id
       ORDER BY total_amount_usdc DESC
       LIMIT 10`
    ).bind(queryNetwork).all<TopPackageRow>();
    topPackages = pkgResult.results ?? [];
  } catch (e) {
    console.error("[a2a-metrics] pkgQuery error:", e);
  }

  const settled = rows.filter(r => r.result === "settled");
  const failed  = rows.filter(r => r.result !== "settled" && r.result !== "");
  const totalAmount = settled.reduce((s, r) => s + (r.amount_usdc ? parseFloat(r.amount_usdc) / 1000000 : 0), 0);
  const uniquePayers = new Set(settled.map(r => r.payer).filter(Boolean)).size;

  // 重複購買率：30 日內有 ≥2 次 settled 交易嘅 payer 比例
  const payerCounts: Record<string, number> = {};
  for (const r of settled) {
    if (r.payer) payerCounts[r.payer] = (payerCounts[r.payer] ?? 0) + 1;
  }
  const repeatBuyers = Object.values(payerCounts).filter(c => c >= 2).length;
  const repeatBuyerRate = uniquePayers > 0 ? Math.round(repeatBuyers / uniquePayers * 100) : 0;

  // 人工干預次數（error 非空代表需要人類介入）
  const humanIntervened = failed.filter(r => r.error && r.error.length > 0).length;

  // 按 facilitator 分類
  const byFacilitator: Record<string, { count: number; amount_usdc: number; unique_payers: number }> = {};
  for (const r of settled) {
    const key = r.facilitator ?? "unknown";
    if (!byFacilitator[key]) byFacilitator[key] = { count: 0, amount_usdc: 0, unique_payers: 0 };
    byFacilitator[key].count++;
    byFacilitator[key].amount_usdc += r.amount_usdc ? parseFloat(r.amount_usdc) / 1000000 : 0;
  }
  // 計算 per-facilitator unique_payers
  const facPayers: Record<string, Set<string>> = {};
  for (const r of settled) {
    const key = r.facilitator ?? "unknown";
    if (!facPayers[key]) facPayers[key] = new Set();
    if (r.payer) facPayers[key].add(r.payer);
  }
  for (const key of Object.keys(byFacilitator)) {
    const f = byFacilitator[key]; if (f) f.unique_payers = facPayers[key]?.size ?? 0;
  }

  // 格式化 daily trend
  const dailyTrendOut = (dailyTrend ?? []).map(r => ({
    day: r.day,
    count: r.count,
    amount_usdc: Math.round(r.amount_usdc * 10000) / 10000,
  })).reverse();

  // by_network：GROUP BY network, result（全網絡可見，唔單網絡filter）
  // 有 ?network= 參數時只顯示該網絡；否則顯示所有網絡 breakdown
  let byNetworkBreakdown: Record<string, { settled: number; failed: number; amount_usdc: number }> = {};
  try {
    const grpResult = await env.DB.prepare(
      `SELECT network, result,
              COUNT(*) as cnt,
              SUM(CASE WHEN result = 'settled' THEN CAST(amount_usdc AS REAL) ELSE 0 END) / 1000000 as usdc
       FROM settle_attempts
       WHERE called_at >= datetime('now', '-90 days')
         AND network = ?
       GROUP BY network, result`
    ).bind(queryNetwork).all<{ network: string; result: string; cnt: number; usdc: number }>();
    const grpRows = grpResult.results ?? [];
    for (const r of grpRows) {
      if (!byNetworkBreakdown[r.network]) byNetworkBreakdown[r.network] = { settled: 0, failed: 0, amount_usdc: 0 };
      const netEntry = byNetworkBreakdown[r.network]!;
      if (r.result === "settled") {
        netEntry.settled += r.cnt;
        netEntry.amount_usdc += r.usdc;
      } else if (r.result !== "") {
        netEntry.failed += r.cnt;
      }
    }
  } catch (e) {
    console.error("[a2a-metrics] byNetworkQuery error:", e);
  }

  const effectiveNetwork = hasFilter ? queryNetwork : "all";
  const dataSourceLabel = hasFilter
    ? `D1 ownsite-aeo (${queryNetwork} settled)`
    : `D1 ownsite-aeo (all networks settled, default NETWORK=${networkTag})`;

  const response = {
    generated_at: new Date().toISOString(),
    network: effectiveNetwork,
    data_source: dataSourceLabel,
    totals: {
      settled_count: settled.length,
      failed_count: failed.length,
      total_amount_usdc: Math.round(totalAmount * 10000) / 10000,
      avg_amount_usdc: settled.length > 0 ? Math.round((totalAmount / settled.length) * 10000) / 10000 : 0,
      unique_payers: uniquePayers,
      repeat_buyer_rate_pct: repeatBuyerRate,
      human_intervention_count: humanIntervened,
    },
    by_facilitator: byFacilitator,
    by_network: byNetworkBreakdown,
    daily_trend: dailyTrendOut,
    top_packages: (topPackages ?? []).map(r => ({
      package_id: r.package_id,
      payers: r.payers,
      total_amount_usdc: Math.round(r.total_amount_usdc * 10000) / 10000,
    })),
  };

  return json(response);
}
