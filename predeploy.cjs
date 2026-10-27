#!/usr/bin/env node
// ─── v1.20 Predeploy Guard ───
// 部署前強制檢查：MOCK_FACILITATOR 唔准 = "1"，除非 ALLOW_MOCK_DEPLOY=1
// 用法：node predeploy.js
// CI 環境示例：ALLOW_MOCK_DEPLOY=1 npx wrangler deploy

const fs = require("fs");
const path = require("path");

const WRANGLER_TOML = path.join(__dirname, "wrangler.toml");
const ALLOW = process.env.ALLOW_MOCK_DEPLOY === "1";

// 讀取 wrangler.toml 找 MOCK_FACILITATOR
let content;
try {
  content = fs.readFileSync(WRANGLER_TOML, "utf-8");
} catch (e) {
  console.error("[predeploy] ERROR: cannot read wrangler.toml:", e.message);
  process.exit(2);
}

const match = content.match(/^MOCK_FACILITATOR\s*=\s*"([^"]+)"\s*$/m);
if (!match) {
  // 冇 MOCK_FACILITATOR key → 默認 safe
  console.log("[predeploy] OK: MOCK_FACILITATOR key not present (defaults safe)");
  process.exit(0);
}

const value = match[1];
console.log(`[predeploy] MOCK_FACILITATOR = "${value}"`);

if (value === "1") {
  if (ALLOW) {
    console.warn("[predeploy] WARN: MOCK_FACILITATOR=1 but ALLOW_MOCK_DEPLOY=1 — proceeding (CI override)");
    process.exit(0);
  }
  console.error("[predeploy] FATAL: MOCK_FACILITATOR=1 detected in wrangler.toml!");
  console.error("[predeploy]   Production mock is forbidden by design.");
  console.error("[predeploy]   Fix: change to MOCK_FACILITATOR = \"0\" or set ALLOW_MOCK_DEPLOY=1 (CI only).");
  process.exit(1);
}

console.log("[predeploy] OK: MOCK_FACILITATOR=0 — safe to deploy");
process.exit(0);
