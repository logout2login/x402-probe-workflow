// ─── v1.13 Cursor Audit 清理 Cron ───
//
// 每日 07:00 UTC 清理超過 7 天的 cursor_audit 記錄。
// 對應 wrangler.toml 的 "0 7 * * *" cron。

import type { Env } from "./env";

export async function runCursorAuditCron(env: Env) {
  const cutoff = new Date(Date.now() - 7 * 86400_000).toISOString();
  const result = await env.DB.prepare(
    "DELETE FROM cursor_audit WHERE created_at < ?"
  ).bind(cutoff).run();
  return { deleted: result.meta?.changes ?? 0, cutoff };
}
