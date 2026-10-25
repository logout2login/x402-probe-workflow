// ─── test-sync ───
// 邏輯測試：sync-queue entries、sync payload 生成、manifest targets。
// 不實際推送市集（Phase 2 才接真實 API key）。

import { readFileSync } from "node:fs";
import { buildSyncManifest, buildSyncPayload, type ManifestTarget } from "../src/publisher/build-manifest";
import { buildIndex } from "../src/publisher/build-index";
import { buildVerification } from "../src/publisher/build-verification";
import { generateKeypair } from "../src/crypto/ed25519";
import type { AgentIndex, VerifierOutput, Verification } from "../src/shared/types";

let pass = 0, fail = 0;
const results: string[] = [];
function assert(cond: unknown, msg: string) {
  if (cond) { pass++; results.push(`  ✅ ${msg}`); }
  else { fail++; results.push(`  ❌ ${msg}`); }
}

results.push("── sync queue & payload ──");

// 準備 verification + index
const { privateKeyHex } = await generateKeypair();
const verifierOut = JSON.parse(
  readFileSync("fixtures/sample-verifier-output.json", "utf8")
) as VerifierOutput;
const data = JSON.parse(readFileSync("fixtures/sample-data.json", "utf8"));

const verification: Verification = await buildVerification(verifierOut, data, privateKeyHex, {
  schemaUrl: "https://ownsite.dev/schemas/verification-v1.json",
  verifierVersion: "v2.3.1",
});

const index: AgentIndex = buildIndex(
  [{ id: verification.package_id, verification, data }],
  { now: new Date("2026-10-20T00:00:00Z"), base: "https://ownsite.dev" }
);

// sync manifest entries
const targets: ManifestTarget[] = [
  { id: "bazaar", endpoint: "https://bazaar.coinbase.com/api/listings" },
  { id: "agent402", endpoint: "https://agent402.io/api/sell" },
  { id: "mcp_so", endpoint: "https://mcp.so/api/listings" },
  { id: "datapoint", endpoint: "https://datapoint.market/api/subsets" },
];

const entries = buildSyncManifest(index, targets, {
  now: new Date(),
  base: "https://ownsite.dev",
});

assert(entries.length === 4, `1 pkg × 4 targets = 4 entries (got ${entries.length})`);
assert(entries.every(e => e.attempts === 0), "all entries start with attempts=0");
assert(entries.every(e => e.action === "publish"), "all actions = publish");
assert(
  entries.every(e => e.id.includes(":")),
  "all ids have target:package_id format"
);
assert(
  entries.every(e => e.package_id === verification.package_id),
  "all entries reference the package_id"
);

// sync payload
const payload = buildSyncPayload(index, targets, "https://ownsite.dev");
assert(payload.entries.length === 4, `payload has 4 entries`);
assert(
  payload.entries.every(e => e.payload.resource_url.startsWith("https://ownsite.dev/buy/")),
  "resource_url uses buy endpoint"
);
assert(
  payload.entries.every(e => e.payload.q === verification.q),
  "q preserved in payload"
);
assert(
  payload.entries.every(e => e.payload.tier === (verification.package_id.startsWith("research-2026") ? "featured" : "listed")),
  "tier preserved"
);
assert(
  payload.entries.every(e => !("data" in e.payload)),
  "payload does NOT include data body (硬性約束)"
);
assert(
  payload.entries.every(e => e.payload.verify_url.startsWith("https://ownsite.dev/verify/")),
  "verify_url in payload"
);

// 空 index → 空 payload
const emptyIndex: AgentIndex = { spec_version: "1.0", generated_at: new Date().toISOString(), packages: [] };
const emptyPayload = buildSyncPayload(emptyIndex, targets, "https://ownsite.dev");
assert(emptyPayload.entries.length === 0, "empty index → empty payload");

console.log(results.join("\n"));
console.log(`\n════════════════════════════════════════`);
console.log(`  PASS: ${pass}   FAIL: ${fail}`);
console.log(`════════════════════════════════════════`);
if (fail > 0) process.exit(1);
