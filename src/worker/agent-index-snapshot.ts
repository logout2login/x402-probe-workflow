// ─── v1.11 Cursor Snapshot（供 agent-index 快取） ───
//
// 定期 dump 一份最新的 index 快照到 KV cache:agent-index:* 讓 index.ts
// 在 hot path 讀取時避免每次查 DB。

import type { Env } from "./env";
import { queryIndexRows } from "./agent-index-query";

interface SnapshotStats {
  generated_at: string;
  packages: number;
  cache_ttl_seconds: number;
}

export async function runAgentIndexSnapshot(env: Env): Promise<SnapshotStats> {
  const index = await queryIndexRows(env);
  const ttl = parseInt(env.AGENT_INDEX_CACHE_TTL || "300", 10);
  await env.KV.put("cache:agent-index:default", JSON.stringify(index), {
    expirationTtl: ttl * 60, // 5x 主 TTL 保證快取覆蓋
  });
  return {
    generated_at: index.generated_at,
    packages: index.packages.length,
    cache_ttl_seconds: ttl,
  };
}
