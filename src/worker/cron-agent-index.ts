// ─── v1.10 Cron: Agent-Index Snapshot 定時刷新 ───
//
// 每日 06:30 UTC 觸發。
// 對應 wrangler.toml 的 "30 6 * * *" cron。

import type { Env } from "./env";
import { runAgentIndexSnapshot } from "./agent-index-snapshot";

export async function runAgentIndexCron(env: Env) {
  return runAgentIndexSnapshot(env);
}
