// ─── publish-package ───
//
// 組合腳本：build-verification → build-index → publish-static → push 到 KV（如設定）。
//
// 本地流程：
//   1. npm run gen-keypair           (一次性)
//   2. export VERIFIER_PRIVATE_KEY_HEX=...
//   3. export OWNSITE_BASE=https://my-domain
//   4. npm run publish-package
//
// 上線流程（GitHub Actions）：
//   - CI 讀 VERIFIER_PRIVATE_KEY_HEX 從 Environment Secret
//   - build-verification → build-output/*.json
//   - publish-static → 更新 public/*
//   - commit public/* 到 main → pages-deploy.yml 部署
//   - sync-manifest.yml 定時觸發 /internal/sync 更新 KV 副本

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { buildVerification } from "../src/publisher/build-verification";
import { buildIndex } from "../src/publisher/build-index";
import type { VerifierOutput, Verification } from "../src/shared/types";

const fixturePath = process.argv[2] ?? "fixtures/sample-verifier-output.json";
const dataPath = process.argv[3] ?? "fixtures/sample-data.json";
const privHex = process.env.VERIFIER_PRIVATE_KEY_HEX ?? "";
// OWNSITE_BASE 必須係真實 worker 網域；唔可以跌返 placeholder（否則 schema_url 會係
// "https://REPLACE_WITH_YOUR_DOMAIN/..." 而令信任 gate 破裂）。
const REAL_WORKER_BASE = "https://ownsite-aeo.jerry-aeo.workers.dev";
const BASE = process.env.OWNSITE_BASE ?? REAL_WORKER_BASE;
if (BASE.includes("REPLACE_WITH_YOUR_DOMAIN")) {
  console.error("❌ OWNSITE_BASE 不可為 REPLACE_WITH_YOUR_DOMAIN 佔位符。");
  process.exit(1);
}
if (BASE !== REAL_WORKER_BASE) {
  console.warn(`⚠️ 用自訂 OWNSITE_BASE=${BASE}（非預設 ${REAL_WORKER_BASE}）`);
}

if (!privHex || !/^[0-9a-f]{64}$/.test(privHex)) {
  console.error("❌ VERIFIER_PRIVATE_KEY_HEX missing.");
  process.exit(1);
}

const verifierOut = JSON.parse(readFileSync(fixturePath, "utf8")) as VerifierOutput;
const data = JSON.parse(readFileSync(dataPath, "utf8"));

const verification: Verification = await buildVerification(verifierOut, data, privHex, {
  schemaUrl: `${BASE}/schemas/verification-v1.json`,
  verifierVersion: verifierOut.verifier_version,
});

// 寫入 build-output
const outDir = "build-output";
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/${verification.package_id}.json`, JSON.stringify(verification, null, 2) + "\n");
console.log(`✅ wrote build-output/${verification.package_id}.json`);

// 生成 index（單包）
const index = buildIndex(
  [{ id: verification.package_id, title: verifierOut.title, verification, data }],
  { now: new Date(), base: BASE }
);
writeFileSync("public/.well-known/agent-index.json", JSON.stringify(index, null, 2) + "\n");
console.log(`✅ wrote public/.well-known/agent-index.json`);

console.log(`\nNext steps:`);
console.log(`  1. commit public/* 與 build-output/*`);
console.log(`  2. push 到 GitHub → pages-deploy.yml 自動部署 SSOT`);
console.log(`  3. wrangler deploy → 部署 Worker`);
console.log(`  4. POST /internal/sync 同步 KV 副本（由 CI 或手動）`);
