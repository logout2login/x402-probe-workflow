// ─── sync-queue ───
//
// 讀取 D1 sync_queue（或直接從 index 生成 entries），推送到市集。
// 由 GitHub Actions sync-manifest.yml 每 30 分鐘觸發。
//
// 硬性約束：
//   - 同步失敗不阻斷 ownsite 售賣
//   - 市集 API key 從 GitHub Actions Secrets 讀取，絕不入庫
//   - 不推數據本體，只推 metadata

import { readFileSync } from "node:fs";
import { buildSyncPayload, type ManifestTarget } from "../src/publisher/build-manifest";
import type { AgentIndex } from "../src/shared/types";

const BASE = process.env.OWNSITE_BASE ?? "https://REPLACE_WITH_YOUR_DOMAIN";

const targets: ManifestTarget[] = [
  // Phase 2 才填入真實 endpoint；v1 只保留骨架。
  // { id: "bazaar", endpoint: "https://bazaar.coinbase.com/api/listings" },
  // { id: "agent402", endpoint: "https://agent402.io/api/sell" },
  // { id: "mcp_so", endpoint: "https://mcp.so/api/listings" },
  // { id: "datapoint", endpoint: "https://datapoint.market/api/subsets" },
];

if (targets.length === 0) {
  console.log("ℹ️  No marketplace targets configured (Phase 2 will fill in endpoints).");
  console.log("    To enable, add entries to `targets` array with your API endpoints.");
  process.exit(0);
}

const index = JSON.parse(readFileSync("public/.well-known/agent-index.json", "utf8")) as AgentIndex;
const payload = buildSyncPayload(index, targets, BASE);

for (const entry of payload.entries) {
  const { target, package_id, payload: p } = entry;
  console.log(`📤 ${target}:${package_id} → ${p.resource_url} @ $${p.price_usdc}`);
  // Phase 2 接入真實 API：
  //   const res = await fetch(target.endpoint, {
  //     method: "POST",
  //     headers: {
  //       "content-type": "application/json",
  //       "x-api-key": process.env[`${target.id.toUpperCase()}_API_KEY] ?? "",
  //     },
  //     body: JSON.stringify(p),
  //   });
  //   if (!res.ok) {
  //     // 記錄到 D1 sync_queue.attempts++
  //     continue;
  //   }
  void p;
}

console.log(`✅ sync complete: ${payload.entries.length} entries`);
