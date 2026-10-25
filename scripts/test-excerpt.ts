// ─── v1.2 test-excerpt.ts ───
//
// 驗證 verifier 抽取的 span 文字與 source 頁面內容是否匹配。
// 輸入：verification.json（含 evidence[]，每筆有 source_url + span）
// 輸出：每筆 evidence 的 match/mismatch 報告
//
// 用法：tsx scripts/test-excerpt.ts path/to/verification.json
//
// 注意：span_v1 grammar 完整實現是 v2.0；此腳本做「整頁 hash 對比」fallback。

import { readFileSync } from "node:fs";
import { sha256 } from "@noble/hashes/sha256";

interface EvidenceItem {
  evidence_id: string;
  source_url: string;
  span: string;
  excerpt_hash: string;
}

interface VerificationJson {
  evidence?: EvidenceItem[];
}

const path = process.argv[2];
if (!path) {
  console.error("用法：tsx scripts/test-excerpt.ts <verification.json>");
  process.exit(1);
}

const v = JSON.parse(readFileSync(path, "utf-8")) as VerificationJson;
if (!v.evidence || v.evidence.length === 0) {
  console.error("無 evidence 欄位或為空");
  process.exit(1);
}

console.log(`\n── v1.2 excerpt 比對（fallback: 整頁 hash）──`);
console.log(`共 ${v.evidence.length} 筆 evidence\n`);

let match = 0;
let mismatch = 0;
let error = 0;

for (const ev of v.evidence) {
  try {
    const resp = await fetch(ev.source_url, {
      headers: { "user-agent": "ownsite-aeo-test-excerpt/1.2" },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok) {
      console.log(`  ⚠️  ${ev.evidence_id}: HTTP ${resp.status} (${ev.source_url})`);
      error += 1;
      continue;
    }
    const text = await resp.text();
    const pageHash = "sha256:" + Array.from(sha256(new TextEncoder().encode(text))).map(b => b.toString(16).padStart(2, "0")).join("");
    const matched = pageHash === ev.excerpt_hash;
    if (matched) {
      console.log(`  ✅ ${ev.evidence_id}: hash match (span="${ev.span}")`);
      match += 1;
    } else {
      console.log(`  ❌ ${ev.evidence_id}: hash mismatch (span="${ev.span}")`);
      mismatch += 1;
    }
  } catch (e) {
    console.log(`  ❌ ${ev.evidence_id}: ${e instanceof Error ? e.message : "network error"}`);
    error += 1;
  }
}

console.log(`\n── 結果：${match} match, ${mismatch} mismatch, ${error} error ──`);
if (mismatch > 0) process.exit(1);
