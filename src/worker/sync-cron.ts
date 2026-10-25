// ─── Sync Queue 處理（v1.0） ───
//
// v1.5+ 之後：市集目標（bazaar/agent402/mcp_so/datapoint）改由
// src/market/sync.ts 處理；此處只處理非市集目標（如 internal）。
// Cron 主入口請看 cron-dispatcher.ts。

import type { Env } from "./env";

export interface CronStats {
  sync_publish: number;
  sync_fail: number;
  sync_skip: number;
  stale_marked: number;
  recall_marked: number;
}

export async function pushToTarget(
  env: Env,
  row: { package_id: string; target: string; action: string }
): Promise<void> {
  // v1.5+ 後市集目標由 market/sync.ts 處理
  switch (row.target) {
    case "bazaar":
    case "agent402":
    case "mcp_so":
    case "datapoint":
      // 這些目標已被過濾到 runMarketSync，不會進來
      return;
    case "internal":
      void row.package_id;
      void row.action;
      return;
    default:
      throw new Error(`unknown_target:${row.target}`);
  }
  void env;
}
