#!/usr/bin/env tsx
// ============================================================================
// prepare_mainnet.ts — Base mainnet 上線 pipeline
//
// 用法:
//   Phase 1（安全，唔改 production）:
//     1. 貼新 CDP key 入  .secrets/mainnet_cdp_key.txt  （CDP Portal 簽發）
//     2. npx tsx scripts/prepare_mainnet.ts
//        - 直接 probe CDP REST verify（read-only、免費）驗證 key 有冇死
//        - wrangler secret put CDP_API_KEY / FACILITATOR_URL
//        - 提示跑 sepolia E2E 驗證 CDP rail（D1 查 cdp row）
//
//   Phase 2（改 production，要本人確認）:
//     npx tsx scripts/prepare_mainnet.ts --mainnet
//       - toml flip: NETWORK=8453 / ASSET_USDC=mainnet / FACILITATOR_PRIMARY=cdp
//       - commit + wrangler deploy
//       - 提示跑 mainnet E2E（真實 USDC）
//
// 注意:
//   - key 只存 .secrets/（已 gitignore），死 key 唔入檔
//   - wrangler secret 係 write-only，放咗就讀唔返
// ============================================================================
import { execSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const KEY_FILE = path.join(ROOT, ".secrets", "mainnet_cdp_key.txt");
const WORKER = "ownsite-aeo";
const CDP_BASE = "https://api.cdp.coinbase.com/platform";
const CDP_VERIFY = `${CDP_BASE}/v2/x402/verify`;
const CDP_SETTLE = `${CDP_BASE}/v2/x402/settle`;

const MAINNET = process.argv.includes("--mainnet");

function sh(cmd: string, opts: { input?: string; timeoutMs?: number } = {}) {
  const res = execSync(cmd, {
    cwd: ROOT,
    encoding: "utf8",
    timeout: opts.timeoutMs ?? 120_000,
    // 唔好洩 key 入 log
    stdio: opts.input ? ["pipe", "pipe", "inherit"] : "inherit",
    input: opts.input,
  });
  return res.trim();
}

function secretPut(name: string, value: string) {
  // 非 TTY：wrangler secret put 從 stdin 讀值（printf 唔加尾換行）
  const viaShell = spawnSync(
    "sh",
    [
      "-c",
      `printf '%s' ${JSON.stringify(value)} | npx wrangler secret put ${name} --name=${WORKER}`,
    ],
    { cwd: ROOT, encoding: "utf8", timeout: 90_000, stdio: ["ignore", "pipe", "inherit"] },
  );
  const out = (viaShell.stdout ?? "").trim();
  if (viaShell.status !== 0) {
    console.error(`[secretPut] ${name} 失敗 (exit ${viaShell.status})\n${out}`);
    process.exit(1);
  }
  console.log(`[secretPut] ${name} → 已寫入 Cloudflare (value 唔顯示)\n  raw: ${out}`);
}

async function main() {
  // ── key 位檢查 ──
  if (!existsSync(KEY_FILE)) {
    mkdirSync(path.dirname(KEY_FILE), { recursive: true });
    writeFileSync(
      KEY_FILE,
      "// 貼新 CDP API key 喺呢度（一行，CDP Portal: https://portal.cdp.coinbase.com/api-keys/secret）\n",
    );
    console.error(
      `[ERROR] 搵唔到 ${KEY_FILE}\n` +
        `已建 template。貼 key 後重跑。key 唔會入 git（.gitignore 已蓋 .secrets/）。`,
    );
    process.exit(1);
  }
  const key = readFileSync(KEY_FILE, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("//"))
    .pop();
  if (!key || key.length < 20) {
    // fallback: scripts/.secrets.mainnet.env 嘅 CDP_API_KEY
    const envPath = path.join(ROOT, "scripts", ".secrets.mainnet.env");
    if (existsSync(envPath)) {
      const m = readFileSync(envPath, "utf8").match(/^CDP_API_KEY=(.+)$/m);
      const k2 = m ? m[1].trim() : undefined;
      if (k2 && k2.length >= 20) {
        console.log(`[1/3] key 檔冇值 → fallback 用 scripts/.secrets.mainnet.env 嘅 CDP_API_KEY (${k2.length} chars)`);
      } else {
        console.error(`[ERROR] ${KEY_FILE} 同 .secrets.mainnet.env 都冇有效 key。貼 key 後重跑。`);
        process.exit(1);
      }
      key = k2 ?? "";
    } else {
      console.error(`[ERROR] ${KEY_FILE} 冇有效 key 行（目前係 template）。貼 key 後重跑。`);
      process.exit(1);
    }
  } else {
    console.log(`[1/3] key 讀到 (${key.length} chars, 唔顯示內容)`);
  }

  // ── Phase 1a: 直接 probe CDP REST verify（read-only 免費）──
  // 用一個最小 x402 v2 payload shape probe：目標唔係真 verify 成功，
  // 而係證明 auth 通：任何「非 401/403」HTTP 回應 = key 有效。
  const probeBody = JSON.stringify({
    payload: "0x",
    paymentRequirements: {
      scheme: "exact",
      network: "eip155:8453",
      maxAmountRequired: "0.000001",
      resource: "https://ownsite-aeo.jerry-aeo.workers.dev/buy/probe",
      payTo: "0x0000000000000000000000000000000000000001",
      asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
  });
  let authOk = false;
  try {
    const t0 = Date.now();
    const r = await fetch(CDP_VERIFY, {
      method: "POST",
      headers: { "content-type": "application/json", "cdp-api-key": key },
      body: probeBody,
      signal: AbortSignal.timeout(30_000),
    });
    const text = await r.text();
    console.log(
      `[2/3] CDP REST probe → HTTP ${r.status} (${Date.now() - t0}ms)\n` +
        `  body: ${text.slice(0, 300)}`,
    );
    if (r.status === 401 || r.status === 403) {
      console.error(`[FATAL] key 被 CDP 拒絕 (HTTP ${r.status})。`);
      console.error(`  → 個 key 死咗 / 格式錯 / Portal 未生效。去 Portal 重新簽發。`);
      process.exit(1);
    }
    authOk = true;
    console.log(`  ✓ auth 通（非 401/403 = key 有效；其他錯誤碼係 payload shape 問題，唔影響 auth）`);
  } catch (e) {
    console.error(`[FATAL] probe 失敗: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  if (MAINNET) {
    // ── Phase 2: 寫 secrets + toml flip + deploy ──
    secretPut("CDP_API_KEY", key);
    secretPut("FACILITATOR_URL", CDP_SETTLE);
    console.log(`[3/3] toml flip + commit + deploy（production 改動）`);
    const tomlPath = path.join(ROOT, "wrangler.toml");
    let toml = readFileSync(tomlPath, "utf8");
    const before = toml;
    toml = toml
      .replace('NETWORK = "eip155:84532"', 'NETWORK = "eip155:8453"')
      .replace(
        /ASSET_USDC = "0x0365\w+"/,
        'ASSET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"',
      )
      .replace('FACILITATOR_PRIMARY = "selfhosted"', 'FACILITATOR_PRIMARY = "cdp"');
    if (toml === before) {
      console.error("[FATAL] toml 冇改動 — 行格式同預期唔符，停止。手動核對 wrangler.toml。");
      process.exit(1);
    }
    writeFileSync(tomlPath, toml);
    console.log("  toml diff:\n" + before.split("\n").map((l, i) => (toml.split("\n")[i] ?? "") !== l ? `    - ${l}\n    + ${toml.split("\n")[i]}` : null).filter(Boolean).join("\n"));
    sh("git add wrangler.toml .gitignore src/ && git commit -m 'mainnet: Base 8453 + CDP primary + mainnet USDC'");
    const dep = sh("npx wrangler deploy --name=" + WORKER, { timeoutMs: 300_000 });
    console.log(dep.split("\n").slice(-6).join("\n"));
    console.log(`\n✅ mainnet 上線完成。`);
    console.log(`下一步（真實 USDC，要本人確認）:`);
    console.log(`  npx tsx scripts/e2e_buy_v2.ts   # 買家側（e2e_buy_v2 會跟 toml NETWORK）`);
    console.log(`  node -e "...D1 query settle_attempts..."  # 查 cdp row`);
    return;
  }

  // ── Phase 1b: 只更新 worker secrets（sepolia 環境，CDP 會俾 router fail-fast）──
  secretPut("CDP_API_KEY", key);
  secretPut("FACILITATOR_URL", CDP_SETTLE);
  console.log(`[3/3] secrets 已更新（sepolia production worker，即刻生效，冇 redeploy）`);
  console.log(`\n✅ Phase 1 完成。下一步:`);
  console.log(`  1. npx tsx scripts/e2e_buy_v2.ts   # sepolia E2E，CDP rail 會行一次`);
  console.log(`  2. 查 D1: 最新 settle_attempts 有冇 cdp row + error 欄（cdp_auth_failed / cdp_resp dump）`);
  console.log(`  3. CDP 通晒先 → 跑  npx tsx scripts/prepare_mainnet.ts --mainnet  （要本人確認）`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
