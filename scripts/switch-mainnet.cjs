#!/usr/bin/env node
// switch-mainnet.cjs — ownsite-aeo 一鍵切 Base mainnet
// 步驟: 1) wrangler secret put (讀 scripts/.secrets.mainnet.env) 2) patch wrangler.toml (NETWORK/ASSET_USDC → 8453/0x8335)
//       3) wrangler deploy 4) health check
// 用法: node scripts/switch-mainnet.cjs   （或 root 嘅 switch_mainnet.bat）
// 回滾: node scripts/switch-testnet.cjs
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const envFile = path.join(__dirname, ".secrets.mainnet.env");
const tomlFile = path.join(root, "wrangler.toml");

if (!fs.existsSync(envFile)) {
  console.error("MISSING: " + envFile + " — 先填值");
  process.exit(1);
}
const pairs = [];
for (const raw of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const l = raw.trim();
  if (!l || l.startsWith("#")) continue;
  const i = l.indexOf("=");
  if (i < 1) continue;
  pairs.push([l.slice(0, i).trim(), l.slice(i + 1).trim()]);
}
const missing = pairs.filter(([, v]) => !v || v.startsWith("<") || /FILL/i.test(v));
if (missing.length) {
  console.error("MISSING VALUES in " + path.basename(envFile) + ": " + missing.map(([k]) => k).join(", "));
  process.exit(1);
}

function sh(cmd, input) {
  console.log("\n$ " + cmd);
  execSync(cmd, { cwd: root, stdio: input ? ["pipe", "inherit", "inherit"] : "inherit", shell: "cmd.exe", input });
}

// ── 1. secrets ──
console.log("=== 1/3 wrangler secret put (" + pairs.length + " keys) ===");
for (const [k, v] of pairs) {
  // wrangler secret put 要 stdin 傳值
  sh(`npx wrangler secret put ${k}`, v + "\n");
}

// ── 2. toml switch ──
console.log("=== 2/3 patch wrangler.toml → eip155:8453 ===");
let toml = fs.readFileSync(tomlFile, "utf8");
const before = toml;
toml = toml
  .replace(/^NETWORK\s*=?.*$/m, 'NETWORK = "eip155:8453"                            # Base mainnet')
  .replace(/^ASSET_USDC\s*=?.*$/m, 'ASSET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # Base mainnet USDC (USD Coin, 6 dec)')
  .replace(/^FACILITATOR_PRIMARY\s*=?.*$/m, 'FACILITATOR_PRIMARY = "cdp"                  # mainnet：CDP primary（唔要靠 selfhosted gas）');
if (toml === before) {
  console.error("toml patch 未命中（NETWORK/ASSET_USDC 行格式改變或已經係 mainnet？）— 手動改 wrangler.toml");
  process.exit(2);
}
fs.writeFileSync(tomlFile, toml);
console.log("wrangler.toml → NETWORK=eip155:8453, ASSET_USDC=0x8335…");

// ── 3. deploy + health ──
console.log("=== 3/3 wrangler deploy + health ===");
sh("npx wrangler deploy");
sh(
  'node -e "fetch(\'https://ownsite-aeo.jerry-aeo.workers.dev/\').then(r=>{const h={};r.headers.forEach((v,k)=>{if(/x402|accept|content-type/i.test(k))h[k]=v});console.log(\'HEALTH\',r.status,h)}).catch(e=>{console.error(\'HEALTH FAIL\',e.message);process.exit(1)})"'
);
console.log("\nDONE — mainnet live. 回滾: node scripts/switch-testnet.cjs");
