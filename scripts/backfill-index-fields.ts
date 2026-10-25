// ─── v1.11 backfill-index-fields.ts ───
//
// 從現有 agent-index.json 填充 packages 表的 source_diversity 等欄位。
// 僅在首次升級到 v1.11 時執行。

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface IndexEntry {
  package_id: string;
  source_diversity?: number;
  q_effective?: number;
  machine_tags?: string[];
}

const INPUT = process.argv[2] ?? resolve("data/agent-index.json");
const index = JSON.parse(readFileSync(INPUT, "utf-8")) as { packages: IndexEntry[] };

console.log(`── v1.11 index fields 回填 ──`);
console.log(`來源：${INPUT}`);
console.log(`總數：${index.packages.length}\n`);

const statements = index.packages.map(p => {
  const sd = p.source_diversity ?? 0;
  return `UPDATE packages SET source_diversity=${sd} WHERE package_id='${p.package_id}'`;
}).join(";\n");

console.log(`SQL：\n`);
console.log(statements);
