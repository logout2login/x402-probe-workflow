// ─── build-manifest ───
// 產生 sync-queue 條目，供 Cron Worker 推送到各市集（Bazaar / Agent402 / MCP.so）。
// 不推數據本體，只推：package_id + resource_url + price + q + expires_at。
//
// 硬性約束：sync-queue 同步失敗不阻斷 ownsite 售賣。

import type { AgentIndex, SyncQueueEntry } from "../shared/types";

export interface ManifestTarget {
  id: "bazaar" | "agent402" | "mcp_so" | "datapoint";
  endpoint: string;
}

export function buildSyncManifest(
  index: AgentIndex,
  targets: ManifestTarget[],
  opts: { now: Date; base: string }
): SyncQueueEntry[] {
  const entries: SyncQueueEntry[] = [];
  for (const pkg of index.packages) {
    for (const t of targets) {
      entries.push({
        id: `${t.id}:${pkg.package_id}`,
        package_id: pkg.package_id,
        action: "publish",
        created_at: opts.now.toISOString(),
        attempts: 0,
      });
    }
  }
  // manifest 本身不攜帶 payload；Cron Worker 讀到 entry 後從 AgentIndex / KV 取最新值。
  void opts.base;
  return entries;
}

// manifest 描述：供市集同步器讀取，包含每個條目的 payload
export interface SyncPayload {
  targets: ManifestTarget[];
  generated_at: string;
  entries: Array<{
    target: ManifestTarget;
    package_id: string;
    payload: {
      resource_url: string;
      price_usdc: string;
      q: number;
      evidence_count: number;
      expires_at: string;
      tier: "listed" | "featured";
      verify_url: string;
    };
  }>;
}

export function buildSyncPayload(
  index: AgentIndex,
  targets: ManifestTarget[],
  base: string
): SyncPayload {
  const entries: SyncPayload["entries"] = [];
  for (const t of targets) {
    for (const pkg of index.packages) {
      entries.push({
        target: t,
        package_id: pkg.package_id,
        payload: {
          resource_url: `${base}/buy/${pkg.package_id}`,
          price_usdc: pkg.price_usdc,
          q: pkg.q,
          evidence_count: pkg.evidence_count,
          expires_at: pkg.expires_at,
          tier: pkg.tier,
          verify_url: pkg.verify_url,
        },
      });
    }
  }
  return { targets, generated_at: index.generated_at, entries };
}
