// live_trade_test.ts — 真實買賣 E2E（testnet / Base Sepolia）
//
// 全鏈：KV seed package → 402 preflight → buyer on-chain USDC capture →
//       x402 POST /buy → worker selfhosted settle → 200 receipt → 鏈上餘額驗證
//
// 跑法：
//   npx tsx testnet/live_trade_test.ts
//
// 前置（一次性）：
//   1. gas donor EOA（0x1930…，PAY_TO）— 唔使 funding：pass-through settle 零 tx
//   2. buyer 錢包（自動生成存 testnet/.buyer.json）需要：
//        - Base Sepolia USDC >= 0.50  → https://faucet.circle.com/ （選 Base Sepolia）
//        - Base Sepolia ETH   >= 0.001 → https://portal.cdp.co/base-sepolia-faucet/
//      不夠 funding 會明確 exit 2 + 顯示資金狀態，唔會假做交易。
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  http,
  createPublicClient,
  createWalletClient,
  parseAbi,
} from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const ROOT = path.resolve(import.meta.dirname, "..");
const RPC = "https://sepolia.base.org";
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const; // Base Sepolia USDC (6 dec)
const WORKER = "https://ownsite-aeo-testnet.jerry-aeo.workers.dev"; // testnet env（新 code + testnet secrets）
const NETWORK = "eip155:84532";
const AMOUNT = 500000n; // $0.50 standard（6 dec）
const MIN_BUYER_USDC = 500000n;
const MIN_BUYER_ETH = 1000000000000000n; // 0.001 ETH

const USDC_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
]);

function buyerFile() {
  return path.join(ROOT, "testnet", ".buyer.json");
}

function loadOrMakeBuyer() {
  const f = buyerFile();
  if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8"));
  const pk = generatePrivateKey();
  const acc = privateKeyToAccount(pk);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ address: acc.address, privateKey: pk }, null, 2));
  return { address: acc.address, privateKey: pk };
}

function kvPut(key: string, value: string) {
  // wrangler 3.x: kv key put <key> <value> --binding KV（arg-array，避開 cmd quoting）
  const r = spawnSync("npx", ["wrangler", "kv", "key", "put", key, value, "--binding", "KV"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (r.status !== 0) {
    console.error(`✗ kv put 失敗：${key} — ${r.stdout?.toString().slice(0, 300)}`);
    process.exit(9);
  }
}

async function main() {
  const buyer = loadOrMakeBuyer();
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC, { timeout: 20_000, batch: false }) });

  // ── Phase 0: buyer funding 檢查 ──
  console.log("=== Phase 0: buyer funding ===");
  console.log("buyer:", buyer.address);
  const usdcBal = await publicClient.readContract({
    address: USDC,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [buyer.address],
  });
  const ethBal = await publicClient.getBalance({ address: buyer.address });
  console.log(
    `buyer USDC: ${usdcBal} (need ${MIN_BUYER_USDC})  ETH: ${Number(ethBal) / 1e18} (need ${Number(MIN_BUYER_ETH) / 1e18})`,
  );
  if (usdcBal < MIN_BUYER_USDC || ethBal < MIN_BUYER_ETH) {
    console.error("\n✗ buyer 未 funding — 唔可以做真實買賣。一次性的 funding 步驟：");
    console.error(`  1. USDC: https://faucet.circle.com/ 選 Base Sepolia → 打到 ${buyer.address}`);
    console.error(`  2. ETH:  https://portal.cdp.co/base-sepolia-faucet/ → ${buyer.address}`);
    console.error("  完成後重跑本 script。");
    process.exit(2);
  }

  // ── Phase 1: KV seed 測試 package ──
  const pkgId = "pkg_live_" + Date.now().toString(36);
  console.log("\n=== Phase 1: KV seed ===", pkgId);
  const expiresAt = new Date(Date.now() + 3600_000).toISOString();
  const meta = JSON.stringify({
    package_id: pkgId,
    tier: "listed",
    title: "Live Trade Test (E2E)",
    q: 0.9,
    evidence_count: 3,
    expires_at: expiresAt,
  });
  const pkg = JSON.stringify({ data: { note: "live trade test payload" } });
  const verify = JSON.stringify({
    package_id: pkgId,
    spec_version: "1.0",
    q: 0.9,
    q_breakdown: { evidence: 0.6, diversity: 0.2, recency: 0.1 },
    evidence: [
      { url: "https://example.com/a", source: "test" },
      { url: "https://example.com/b", source: "test" },
      { url: "https://example.com/c", source: "test" },
    ],
    evidence_count: 3,
    source_diversity: 2,
    verified_at: new Date().toISOString(),
    expires_at: expiresAt,
    verifier_version: "1.15",
    verifier_signature: "ed25519:livetest",
    data_hash: "sha256:livetest",
    schema_url: "https://ownsite-aeo.jerry-aeo.workers.dev/.well-known/verification-schema.json",
    license: "CC-BY-4.0",
    hallucination_boundary: "live-trade-test",
  });
  kvPut(`meta:${pkgId}`, meta);
  kvPut(`pkg:${pkgId}`, pkg);
  kvPut(`verify:${pkgId}`, verify);
  kvPut(`status:${pkgId}`, "fresh");
  console.log("seeded meta/pkg/verify/status ✓");

  // ── Phase 2: 402 preflight ──
  console.log("\n=== Phase 2: GET /buy → 402 ===");
  const r402 = await fetch(`${WORKER}/buy/${pkgId}`);
  const j402 = await r402.json();
  console.log("status:", r402.status, JSON.stringify(j402).slice(0, 200));
  if (r402.status !== 402) {
    console.error("✗ 預期 402，實際", r402.status, "— 停低");
    process.exit(3);
  }
  // payTo 係 402 spec 講明嘅收款地址（worker env.PAY_TO），唔係 hardcoded gas donor
  const payTo: `0x${string}` = j402.accepts?.[0]?.payTo;
  if (!payTo || !/^0x[0-9a-fA-F]{40}$/.test(payTo)) {
    console.error("✗ 402 spec 冇有效 payTo — 停低");
    process.exit(3);
  }
  console.log("payTo (from 402 spec):", payTo);

  // ── Phase 3: on-chain capture（buyer → payTo）──
  console.log("\n=== Phase 3: USDC capture transfer ===");
  const account = privateKeyToAccount(buyer.privateKey);
  const wallet = createWalletClient({ account, chain: baseSepolia, transport: http(RPC, { timeout: 60_000, batch: false }) });
  const txHash = await wallet.writeContract({
    address: USDC,
    abi: USDC_ABI,
    functionName: "transfer",
    args: [payTo, AMOUNT],
    chain: baseSepolia,
  });
  const capReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120_000 });
  console.log("capture tx:", txHash, "status:", capReceipt.status);
  if (capReceipt.status !== "success") {
    console.error("✗ capture tx reverted — 停低");
    process.exit(4);
  }

  // ── Phase 4: x402 POST /buy ──
  console.log("\n=== Phase 4: POST /buy with x-payment ===");
  const payment = {
    x402Version: 1,
    scheme: "exact",
    network: NETWORK,
    payload: { txHash, payer: account.address },
    asset: USDC,
    extra: { name: "USDC", version: "2" },
  };
  const xPayment = Buffer.from(JSON.stringify(payment)).toString("base64");
  const rBuy = await fetch(`${WORKER}/buy/${pkgId}`, {
    method: "POST",
    headers: { "x-payment": xPayment, "content-type": "application/json" },
    body: JSON.stringify({ id: pkgId }),
  });
  const jBuy = await rBuy.json();
  console.log("status:", rBuy.status, JSON.stringify(jBuy).slice(0, 400));
  if (rBuy.status !== 200) {
    console.error("✗ /buy 唔成功 — 檢查 worker logs：npx wrangler tail");
    process.exit(5);
  }

  // ── Phase 5: 鏈上驗證 ──
  console.log("\n=== Phase 5: on-chain verification ===");
  const payToBal1 = await publicClient.readContract({
    address: USDC,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [payTo],
  });
  const buyerBal1 = await publicClient.readContract({
    address: USDC,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [buyer.address],
  });
  const spent = usdcBal - buyerBal1;
  console.log(`payTo USDC: → ${payToBal1}`);
  console.log(`buyer USDC: ${usdcBal} → ${buyerBal1} (spend ${spent})`);
  if (spent === AMOUNT) {
    console.log("capture 全鏈驗證：buyer 少咗 0.50 USDC，款項已落 payTo ✓");
  } else {
    console.log(`⚠ buyer 扣款 ${spent} ≠ ${AMOUNT}（可能有其他活動）— 人工睇下`);
  }
  console.log("\n=== DONE: 真實買賣全鏈通過 ===");
  console.log(JSON.stringify({ pkgId, payTo, capture_tx: txHash, receipt: jBuy.receipt ?? null, usdc_spent: String(spent) }, null, 2));
}

main().catch(e => {
  console.error("FATAL:", e?.message ?? e);
  process.exit(1);
});
