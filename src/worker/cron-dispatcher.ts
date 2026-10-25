// ─── Cron 分派器 ───
//
// 單一入口 runCron(env)：
//   - 根據 cf-scheduled 觸發時間判斷該跑哪些子 cron
//   - 每個子 cron 錯誤被捕獲，不中斷其他
//
// 排程（對應 wrangler.toml [triggers] crons）：
//   */15 * * * *  — sync_queue + market sync
//   0 * * * *     — stale/recall/TTL (v1.5)
//   30 0 * * *    — daily dashboard 聚合 (v1.6)
//   15 * * * *    — reverify cron (v1.8)
//   45 * * * *    — settle 對帳 (v1.9)
//   0 6 * * *     — refetch 抽樣 (v1.5)
//   30 6 * * *    — agent-index 重建 (v1.10)
//   0 7 * * *     — cursor audit 清理 (v1.13)
//   50 8 * * *    — held timeout (v1.15)
//   0 9 * * *     — facilitator 健康度 (v1.12)

import type { Env } from "./env";
import { pushToTarget, CronStats } from "./sync-cron";
import { runTtlCron } from "./cron-ttl";
import { runRefetchScan } from "./cron-refetch";
import { runDashboardCron } from "./cron-dashboard";
import { runReverifyCron } from "./cron-reverify";
import { runSettleCron } from "./cron-settle";
import { runAgentIndexCron } from "./cron-agent-index";
import { runCursorAuditCron } from "./cursor-audit";
import { runHeldTimeoutCron } from "./cron-held-timeout";
import { runFacilitatorHealthCron } from "../facilitator/health-cron";
import { runMarketSync } from "../market/sync";
import { runDemandCron } from "./demand-report";

interface CronReport {
  ok: boolean;
  scheduled_at: string;
  stats: Record<string, unknown>;
  duration_ms: number;
}

export async function runCron(env: Env, scheduledAt?: string): Promise<Response> {
  const start = Date.now();
  // Cloudflare cf-scheduled header is the string "true", not an ISO timestamp.
  // Only parse as date if it looks like a real ISO-8601 timestamp.
  const parsed = scheduledAt && /^\d{4}-\d{2}-\d{2}T/.test(scheduledAt)
    ? new Date(scheduledAt)
    : new Date();
  const now = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const report: CronReport = {
    ok: true,
    scheduled_at: now.toISOString(),
    stats: {},
    duration_ms: 0,
  };

  const minute = now.getUTCMinutes();
  const hour = now.getUTCHours();
  const day = now.getUTCDate();

  try {
    // ─── */15 * * * * — sync_queue + market sync + demand ───
    if (minute % 15 === 0) {
      report.stats.sync = await runSyncQueue(env);
      report.stats.market = await runMarketSync(env);
      report.stats.demand = await runDemandCron(env);
    }

    // ─── 0 * * * * — TTL/stale/recall ───
    if (minute === 0) {
      report.stats.ttl = await runTtlCron(env);
    }

    // ─── 30 0 * * * — daily dashboard ───
    if (minute === 30 && hour === 0) {
      report.stats.dashboard = await runDashboardCron(env);
    }

    // ─── 15 * * * * — reverify ───
    if (minute === 15) {
      report.stats.reverify = await runReverifyCron(env);
    }

    // ─── 45 * * * * — settle 對帳 ───
    if (minute === 45) {
      report.stats.settle = await runSettleCron(env);
    }

    // ─── 0 6 * * * — refetch 抽樣 ───
    if (minute === 0 && hour === 6) {
      report.stats.refetch = await runRefetchScan(env);
    }

    // ─── 30 6 * * * — agent-index 重建 ───
    if (minute === 30 && hour === 6) {
      report.stats.agent_index = await runAgentIndexCron(env);
    }

    // ─── 0 7 * * * — cursor audit 清理 ───
    if (minute === 0 && hour === 7) {
      report.stats.cursor_audit = await runCursorAuditCron(env);
    }

    // ─── 50 8 * * * — held timeout ───
    if (minute === 50 && hour === 8) {
      report.stats.held_timeout = await runHeldTimeoutCron(env);
    }

    // ─── 0 9 * * * — facilitator 健康度 ───
    if (minute === 0 && hour === 9) {
      report.stats.facilitator_health = await runFacilitatorHealthCron(env);
    }
  } catch (e) {
    report.ok = false;
    report.stats.error = e instanceof Error ? e.message : String(e);
  }

  report.duration_ms = Date.now() - start;
  return new Response(
    JSON.stringify(report),
    { headers: { "content-type": "application/json" } }
  );
}

async function runSyncQueue(env: Env): Promise<CronStats> {
  const stats: CronStats = {
    sync_publish: 0,
    sync_fail: 0,
    sync_skip: 0,
    stale_marked: 0,
    recall_marked: 0,
  };

  const { results: queue } = await env.DB.prepare(
    `SELECT * FROM sync_queue WHERE status='pending'
     AND target NOT IN ('bazaar','agent402','mcp_so','datapoint')
     ORDER BY created_at ASC LIMIT 20`
  ).all<{ id: string; package_id: string; target: string; action: string; attempts: number }>();

  for (const row of queue) {
    if (row.attempts >= 3) {
      await env.DB.prepare(
        "UPDATE sync_queue SET status='failed', last_attempt_at=? WHERE id=?"
      ).bind(new Date().toISOString(), row.id).run();
      stats.sync_fail += 1;
      continue;
    }
    try {
      await pushToTarget(env, row);
      await env.DB.prepare(
        "UPDATE sync_queue SET status='done', attempts=?, last_attempt_at=? WHERE id=?"
      ).bind(row.attempts + 1, new Date().toISOString(), row.id).run();
      stats.sync_publish += 1;
    } catch (e) {
      await env.DB.prepare(
        "UPDATE sync_queue SET attempts=?, last_error=?, last_attempt_at=? WHERE id=?"
      ).bind(row.attempts + 1, String(e), new Date().toISOString(), row.id).run();
      stats.sync_fail += 1;
    }
  }

  return stats;
}
