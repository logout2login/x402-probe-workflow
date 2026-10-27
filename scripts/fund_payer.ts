#!/usr/bin/env node
/**
 * fund_payer.ts — 由 Fac（selfhosted key）向 Payer 補充 testnet USDC + ETH gas
 * 用途：buy_e2e_v2.ts 預檢 Payer 餘額不足時手動補
 */
import { createPublicClient, createWalletClient, http, parseAbi, getContract, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "fs";

const RPC = "https://sepolia.base.org";
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_AMT = 500000n; // 0.50 USDC (6dp)
const ETH_TOPUP = 150n * 10n ** 12n; // 0.00015 ETH
const MIN_ETH = 100n * 10n ** 12n; // topup 只在 Payer < 0.0001 ETH 時做

type Rec = { address: string; privateKey: string };
const fac = JSON.parse(readFileSync(`${import.meta.dirname}/.testnet_facilitator.json`, "utf8")) as Rec;
const payer = JSON.parse(readFileSync(`${import.meta.dirname}/.testnet_payer.json`, "utf8")) as Rec;

const pub = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
const facWc = createWalletClient({ account: privateKeyToAccount(fac.privateKey as `0x${string}`), chain: baseSepolia, transport: http(RPC) });

const usdc = getContract({ address: USDC, abi: parseAbi(["function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"]), client: pub });

async function main() {
  const [facUsdc, payerUsdc, payerEth] = await Promise.all([
    usdc.read.balanceOf([fac.address]),
    usdc.read.balanceOf([payer.address]),
    pub.getBalance({ address: payer.address }),
  ]);
  console.log(`Fac USDC=${formatUnits(facUsdc, 6)} | Payer USDC=${formatUnits(payerUsdc, 6)} | Payer ETH=${payerEth}`);

  if (payerUsdc < USDC_AMT) {
    const need = USDC_AMT * 2n; // 一次過 1.0 USDC，避免之後又差啲
    const h = await facWc.writeContract({ address: USDC, abi: usdc.abi, functionName: "transfer", args: [payer.address, need] });
    console.log(`USDC transfer ${need} → 0x...`);
    await pub.waitForTransactionReceipt({ hash: h });
    console.log(`USDC settled: ${h}`);
  }
  if (payerEth < MIN_ETH) {
    const h = await facWc.sendTransaction({ to: payer.address, value: ETH_TOPUP });
    console.log(`ETH topup ${ETH_TOPUP} wei sent: ${h}`);
    await pub.waitForTransactionReceipt({ hash: h });
    console.log("ETH topup settled.");
  }
  console.log(`Payer now USDC=${formatUnits(await usdc.read.balanceOf([payer.address]), 6)} ETH=${await pub.getBalance({ address: payer.address })}`);
}
main().catch((e) => { console.error("FUND FAILED:", e.message ?? e); process.exit(1); });
