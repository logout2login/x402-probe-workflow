// ─── v1.7 Market Sync 編排器 ───
//
// 掃 sync_queue 中的 marketplace 目標（bazaar/agent402/mcp_so/datapoint），
// 呼叫對應 adapter，將結果寫回 marketplace_listings 表。
//
// 硬性約束：sync 失敗不阻斷 ownsite 售賣；每目標重試 3 次後標記 failed。

import { MARKET_ADAPTERS } from "./registry";
import { withRetry } from "./retry";
import type { Env } from "../worker/env";
import type { PackageForSync } from "./adapter";

interface MarketStats {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

export async function runMarketSync(env: Env): Promise<MarketStats> {
  const stats: MarketStats = { processed: 0, succeeded: 0, failed: 0, skipped: 0 };

  const queueTargets = ["bazaar", "agent402", "mcp_so", "datapoint"];
  const queueResult = await env.DB.prepare(
    `SELECT * FROM sync_queue
     WHERE status='pending' AND target IN ('bazaar','agent402','mcp_so','datapoint')
       AND attempts < 3
     ORDER BY created_at ASC LIMIT 30`
  ).all<{ id: string; package_id: string; target: string; action: string; attempts: number }>();

  void queueTargets;

  for (const row of queueResult.results) {
    stats.processed += 1;
    const adapter = MARKET_ADAPTERS[row.target];
    if (!adapter) {
      await markFailed(env, row.id, row.target, `unknown_target:${row.target}`, row.attempts);
      stats.failed += 1;
      continue;
    }

    const pkg = await loadPackageForSync(env, row.package_id);
    if (!pkg) {
      await markSkipped(env, row.id, row.attempts);
      stats.skipped += 1;
      continue;
    }

    const marketEnv = extractMarketEnv(env);
    const action = row.action === "publish" ? "publish" : "unpublish";

    const result = await withRetry(async () => {
      const r = action === "publish" ? await adapter.publish(marketEnv, pkg) : await adapter.unpublish(marketEnv, pkg);
      if (!r.ok) throw new Error(r.error ?? "sync_failed");
      return r;
    });

    if (result.ok && result.result) {
      await env.DB.prepare(
        `INSERT INTO marketplace_listings (package_id, target, external_id, price_usdc, status, last_sync_at, attempts)
         VALUES (?,?,?,?,?,?,?)
         ON CONFLICT DO NOTHING`
      ).bind(
        row.package_id, row.target, result.result.external_id ?? null,
        pkg.price_usdc, action === "publish" ? "live" : "removed",
        new Date().toISOString(), row.attempts + 1
      ).run();

      await env.DB.prepare(
        "UPDATE sync_queue SET status='done', attempts=?, last_attempt_at=? WHERE id=?"
      ).bind(row.attempts + 1, new Date().toISOString(), row.id).run();
      stats.succeeded += 1;
    } else {
      await markFailed(env, row.id, row.target, result.error ?? "unknown", row.attempts);
      stats.failed += 1;
    }
  }

  return stats;
}

async function loadPackageForSync(env: Env, packageId: string): Promise<PackageForSync | null> {
  const row = await env.DB.prepare(
    `SELECT package_id, title, q, evidence_count, verified_at, expires_at, tier
     FROM packages WHERE package_id=? AND status IN ('fresh','stale')`
  ).bind(packageId).first<{
    package_id: string; title: string; q: number; evidence_count: number;
    verified_at: string; expires_at: string; tier: string;
  }>();
  if (!row) return null;
  const priceUsdc = row.tier === "featured" ? "1000000" : "500000";
  return {
    package_id: row.package_id,
    title: row.title,
    q: row.q,
    evidence_count: row.evidence_count,
    verified_at: row.verified_at,
    expires_at: row.expires_at,
    tier: row.tier as "listed" | "featured",
    price_usdc: priceUsdc,
    paid_url: `${env.OWNSITE_BASE}/buy/${row.package_id}`,
    verify_url: `${env.OWNSITE_BASE}/verify/${row.package_id}`,
    preview_url: `${env.OWNSITE_BASE}/preview/${row.package_id}`,
  };
}

function extractMarketEnv(env: Env) {
  return {
    FACILITATOR_URL: env.FACILITATOR_URL,
    MARKET_BAZAAR_API_KEY: env.MARKET_BAZAAR_API_KEY,
    MARKET_AGENT402_API_KEY: env.MARKET_AGENT402_API_KEY,
    MARKET_MCP_SO_API_KEY: env.MARKET_MCP_SO_API_KEY,
    MARKET_DATAPPOINT_API_KEY: env.MARKET_DATAPPOINT_API_KEY,
    OWNSITE_BASE: env.OWNSITE_BASE,
    NETWORK: env.NETWORK,
    ASSET_USDC: env.ASSET_USDC,
  };
}

async function markFailed(
  env: Env,
  id: string,
  _target: string,
  error: string,
  attempts: number
) {
  await env.DB.prepare(
    "UPDATE sync_queue SET attempts=?, last_error=?, last_attempt_at=?, status=? WHERE id=?"
  ).bind(
    attempts + 1, error, new Date().toISOString(),
    attempts + 1 >= 3 ? "failed" : "pending",
    id
  ).run();
}

async function markSkipped(env: Env, id: string, attempts: number) {
  await env.DB.prepare(
    "UPDATE sync_queue SET status='skipped', attempts=?, last_attempt_at=? WHERE id=?"
  ).bind(attempts, new Date().toISOString(), id).run();
}
