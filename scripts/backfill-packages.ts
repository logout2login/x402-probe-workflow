// ─── v1.5 backfill-packages.ts ───
//
// 從 KV 已存在的 verification.json 重建 D1 packages 表。
// 第一次部署 v1.5 時執行，之後不需再跑。
//
// 用法：
//   npx wrangler d1 execute ownsite-aeo --local --command "
//     SELECT COUNT(*) FROM packages;"
//   npx wrangler kv key list KV --local --prefix="verify:"
//   tsx scripts/backfill-packages.ts
//
// 注意：此腳本假設 wrangler dev 啟動狀態；否則請改用 wrangler d1 execute。

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface PackageEntry {
  package_id: string;
  title: string;
  q: number;
  evidence_count: number;
  source_diversity: number;
  verified_at: string;
  expires_at: string;
  tier: "listed" | "featured";
  data_hash: string;
}

const INPUT = process.argv[2] ?? resolve("data/packages.json");
const entries = JSON.parse(readFileSync(INPUT, "utf-8")) as PackageEntry[];

console.log(`── v1.5 packages 回填 ──`);
console.log(`來源：${INPUT}`);
console.log(`總數：${entries.length}\n`);

// 產生 SQL 插入語句
const statements = entries.map(p => `
  INSERT OR REPLACE INTO packages (package_id, title, q, evidence_count, source_diversity, verified_at, expires_at, tier, data_hash, status, created_at, updated_at)
  VALUES ('${p.package_id}', '${p.title.replace(/'/g, "''")}', ${p.q}, ${p.evidence_count}, ${p.source_diversity}, '${p.verified_at}', '${p.expires_at}', '${p.tier}', '${p.data_hash}', 'fresh', datetime('now'), datetime('now'))
`).join(";\n");

console.log(`SQL（可貼到 wrangler d1 execute）：\n`);
console.log(statements);
console.log(`\n執行：wrangler d1 execute ownsite-aeo --remote --file=<paste_above>`);
