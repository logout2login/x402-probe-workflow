// ─── build-verification ───
//
// 由 fixture 產生 verification.json（含 Ed25519 簽名）。
// 使用 VERIFIER_PRIVATE_KEY_HEX 環境變量（本地測試可手動設；CI 從 Actions Secret 讀取）。
//
// 用法：
//   export VERIFIER_PRIVATE_KEY_HEX=<64-hex>
//   npm run build-verification -- fixtures/sample-verifier-output.json
//
// 輸出：build-output/verification.json
//
// 硬性約束：VERIFIER_PRIVATE_KEY_HEX 絕不入庫、絕不放 wrangler vars。

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { buildVerification } from "../src/publisher/build-verification";
import type { VerifierOutput } from "../src/shared/types";

const fixturePath = process.argv[2] ?? "fixtures/sample-verifier-output.json";
const dataPath = process.argv[3] ?? "fixtures/sample-data.json";
const privHex = process.env.VERIFIER_PRIVATE_KEY_HEX ?? "";

if (!privHex || !/^[0-9a-f]{64}$/.test(privHex)) {
  console.error("❌ VERIFIER_PRIVATE_KEY_HEX missing or not 64-hex.");
  console.error("   Run `npm run gen-keypair` first, then set env.");
  process.exit(1);
}

const verifierOut = JSON.parse(readFileSync(fixturePath, "utf8")) as VerifierOutput;
const data = JSON.parse(readFileSync(dataPath, "utf8"));

const verification = await buildVerification(verifierOut, data, privHex, {
  schemaUrl: process.env.SCHEMA_URL ?? "https://REPLACE_WITH_YOUR_DOMAIN/schemas/verification-v1.json",
  verifierVersion: verifierOut.verifier_version,
});

const outDir = "build-output";
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/verification.json`, JSON.stringify(verification, null, 2) + "\n", "utf8");

console.log(`✅ verification.json written → ${outDir}/verification.json`);
console.log(`   package_id = ${verification.package_id}`);
console.log(`   q          = ${verification.q}`);
console.log(`   evidence   = ${verification.evidence_count}`);
console.log(`   sig        = ${verification.verifier_signature.slice(0, 40)}...`);
