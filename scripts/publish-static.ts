// ─── publish-static ───
//
// 讀取 build-output/*.json，重新生成 public/.well-known/* 與 public/schemas/*.json。
// 由 GitHub Actions pages-deploy.yml 觸發，也可以本地跑。
//
// 硬性約束：此腳本只寫入 public/（SSOT），私鑰絕不參與寫入。

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { buildIndex } from "../src/publisher/build-index";
import type { Verification, VerifierOutput } from "../src/shared/types";

const BASE = process.env.OWNSITE_BASE ?? "https://REPLACE_WITH_YOUR_DOMAIN";
const outDir = "build-output";

// 讀取 build-output 中的所有 verification.json
let bundles: Array<{
  id: string;
  title?: string;
  verification: Verification;
  data: unknown;
}> = [];

if (existsSync(outDir)) {
  for (const f of readdirSync(outDir)) {
    if (f.endsWith(".json")) {
      const raw = JSON.parse(readFileSync(`${outDir}/${f}`, "utf8"));
      if (raw && typeof raw === "object" && "package_id" in raw) {
        bundles.push({
          id: raw.package_id,
          title: raw.title,
          verification: raw,
          data: { _note: "data not included in verification; retrieved at /preview or /buy" },
        });
      }
    }
  }
}

const now = new Date();
const index = buildIndex(bundles, { now, base: BASE });
writeFileSync("public/.well-known/agent-index.json", JSON.stringify(index, null, 2) + "\n");
console.log(`✅ public/.well-known/agent-index.json written (${index.packages.length} packages)`);

// 更新 agent.json 中的域名（如果 placeholder 還在）
const agentJson = JSON.parse(readFileSync("public/.well-known/agent.json", "utf8"));
function replacePlaceholders(obj: unknown): unknown {
  if (typeof obj === "string") return obj.replace(/REPLACE_WITH_YOUR_DOMAIN/g, BASE.replace(/^https?:\/\//, ""));
  if (Array.isArray(obj)) return obj.map(replacePlaceholders);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, replacePlaceholders(v)]));
  }
  return obj;
}
const fixedAgent = replacePlaceholders(agentJson);
writeFileSync("public/.well-known/agent.json", JSON.stringify(fixedAgent, null, 2) + "\n");

console.log("✅ publish-static complete");
