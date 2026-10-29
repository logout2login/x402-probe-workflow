#!/usr/bin/env node
// switch-testnet.cjs — 回滾去 Base Sepolia（84532）
// 用法: node scripts/switch-testnet.cjs   （讀 scripts/.secrets.testnet.env）
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const envFile = path.join(__dirname, ".secrets.testnet.env");
const tomlFile = path.join(root, "wrangler.toml");

if (fs.existsSync(envFile)) {
  const pairs = [];
  for (const raw of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const l = raw.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i < 1) continue;
    pairs.push([l.slice(0, i).trim(), l.slice(i + 1).trim()]);
  }
  const toPut = pairs.filter(([, v]) => v && !v.startsWith("<"));
  if (toPut.length) {
    console.log("=== secrets (" + toPut.length + " keys) ===");
    for (const [k, v] of toPut) {
      console.log("\n$ npx wrangler secret put " + k);
      // wrangler v3: value via stdin
      const cmd = `echo ${JSON.stringify(v)} | npx wrangler secret put ${k}`;
      execSync(cmd, { cwd: root, stdio: "inherit", shell: "cmd.exe" });
    }
  }
}

let toml = fs.readFileSync(tomlFile, "utf8");
const before = toml;
toml = toml
  .replace(/^NETWORK\s*=?.*$/m, 'NETWORK = "eip155:84532"                           # Base Sepolia (Phase 1 testnet)')
  .replace(/^ASSET_USDC\s*=?.*$/m, 'ASSET_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # Base Sepolia USDC (Circle canonical, 6 dec)')
  .replace(/^FACILITATOR_PRIMARY\s*=?.*$/m, 'FACILITATOR_PRIMARY = "selfhosted"                  # testnet：gas donor 做 primary，CDP fallback');
if (toml === before) {
  console.log("wrangler.toml 已經係 testnet 設定，跳過 patch");
} else {
  fs.writeFileSync(tomlFile, toml);
  console.log("wrangler.toml → NETWORK=eip155:84532, ASSET_USDC=0x036C…");
}
console.log("\n$ npx wrangler deploy");
execSync("npx wrangler deploy", { cwd: root, stdio: "inherit", shell: "cmd.exe" });
console.log("\nDONE — testnet restored.");
