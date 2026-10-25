// gas_topup.ts — 由 gas donor EOA 轉 0.001 Base Sepolia ETH 俾 buyer（解 E2E 買賣唯一 gas gate）
//
// 跑法：
//   npx tsx testnet/gas_topup.ts
//
// 前置：
//   1. 跑 make_gasdonor.bat，將一個「已有 Base Sepolia ETH」嘅 wallet 貼入
//      → scripts/.testnet_gasdonor.json  { address, privateKey }
//   2. testnet/.buyer.json 存在（buyer 0x009C…）
//
// 行為：
//   - 驗 donor Base Sepolia ETH ≥ 0.003（0.001 轉出 + gas 緩衝）
//   - 轉 0.001 ETH 俾 buyer
//   - wait receipt + 印 buyer 新 ETH balance
//   - 成功 exit 0；donor 資金不足 exit 2
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { http, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const ROOT = path.resolve(import.meta.dirname, "..");
const RPC = "https://sepolia.base.org";
const TOPUP = 1000000000000000n;      // 0.001 ETH
const MIN_DONOR = 3000000000000000n;  // 0.003 ETH (buffer for gas)

function loadDonor() {
  const f = path.join(ROOT, "scripts", ".testnet_gasdonor.json");
  if (!existsSync(f)) {
    console.error("✗ 搵唔到 gas donor key：scripts/.testnet_gasdonor.json");
    console.error("  先跑 make_gasdonor.bat 貼入一個有 Base Sepolia ETH 嘅 wallet。");
    process.exit(2);
  }
  const d = JSON.parse(readFileSync(f, "utf8"));
  if (!/^0x[0-9a-f]{64}$/i.test(d.privateKey ?? "")) {
    console.error("✗ donor privateKey 格式唔啱（要 0x + 64 hex）。");
    process.exit(2);
  }
  return d;
}

function loadBuyer() {
  const f = path.join(ROOT, "testnet", ".buyer.json");
  const b = JSON.parse(readFileSync(f, "utf8"));
  return b.address as `0x${string}`;
}

async function main() {
  const donor = loadDonor();
  const buyer = loadBuyer();
  console.log("donor:", donor.address);
  console.log("buyer:", buyer);
  console.log("topup:", Number(TOPUP) / 1e18, "ETH");

  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC, { timeout: 30_000, batch: false }) });

  // 1) donor 資金檢查
  const donorBal = await publicClient.getBalance({ address: donor.address as `0x${string}` });
  console.log("donor ETH:", Number(donorBal) / 1e18, "(need", Number(MIN_DONOR) / 1e18, ")");
  if (donorBal < MIN_DONOR) {
    console.error("\n✗ donor Base Sepolia ETH 唔夠 — 呢個 donor 未有 gas，唔俾到 buyer。");
    console.error("  換一個「已有 Base Sepolia ETH」嘅 wallet，重跑 make_gasdonor.bat。");
    process.exit(2);
  }

  // 2) 轉 0.001 ETH 俾 buyer
  const wallet = createWalletClient({ account: privateKeyToAccount(donor.privateKey as `0x${string}`), chain: baseSepolia, transport: http(RPC, { timeout: 90_000, batch: false }) });
  const before = await publicClient.getBalance({ address: buyer });
  const txHash = await wallet.sendTransaction({
    to: buyer,
    value: TOPUP,
    gas: 21000n,
    chain: baseSepolia,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 180_000 });
  console.log("tx:", txHash, "status:", receipt.status);
  if (receipt.status !== "success") {
    console.error("✗ topup tx reverted — 停低");
    process.exit(4);
  }

  // 3) 驗證 buyer 新 balance
  const after = await publicClient.getBalance({ address: buyer });
  console.log(`buyer ETH: ${Number(before) / 1e18} → ${Number(after) / 1e18}`);
  if (after - before >= TOPUP - 1n) {
    console.log("\n=== DONE: buyer 已獲 gas，可以跑 live_trade_test.ts 完成真實買賣 ===");
  } else {
    console.error("\n⚠ buyer ETH 增幅唔到 0.001 — 人工睇");
  }
}

main().catch((e) => {
  console.error("FATAL:", e?.message ?? e);
  process.exit(1);
});
