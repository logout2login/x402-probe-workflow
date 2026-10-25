import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://ownsite-aeo-testnet.jerry-aeo.workers.dev";
const PK = JSON.parse(readFileSync(join(process.cwd(), "testnet", ".buyer.json"), "utf8")).privateKey;
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USER_WALLET = "0xB7f4D61320de4CF5F22330407a3A683304AC914d";
const USDC_ABI = parseAbi([
  "function transfer(address,uint256)",
  "function balanceOf(address) view returns (uint256)",
]);

const RPC = "https://base-sepolia.drpc.org";
const acct = privateKeyToAccount(PK);
const w = createWalletClient({ account: acct, chain: baseSepolia, transport: http(RPC) });
const p = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
const usdcBal = async (a) => p.readContract({ address: USDC, abi: USDC_ABI, functionName: "balanceOf", args: [a] });
const dec = (s) => (s ? JSON.parse(Buffer.from(s, "base64").toString("utf8")) : null);

console.log("=== 0xB7f4 USDC before (Base Sepolia) ===");
console.log("0xB7f4 USDC before:", String((await usdcBal(USER_WALLET)) / 1_000_000n));

// STEP 1: fresh 402 challenge (body JSON, no x402 header in current build)
const r1 = await fetch(`${BASE}/buy/e2e-x402-0001`, { method: "POST" });
if (r1.status !== 402) {
  console.log("UNEXPECTED non-402 first:", r1.status, await r1.text());
  process.exit(0);
}
const body = await r1.json().catch(() => ({}));
let payTo, amount, network;
const headerX402 = dec(r1.headers.get("x402"));
if (headerX402?.payment?.payload) {
  ({ payTo, amount, network } = headerX402.payment.payload);
  network = headerX402.payment.network ?? network;
} else {
  const acc = body?.accepts?.[0];
  if (!acc) { console.log("NO challenge in body:", JSON.stringify(body).slice(0, 300)); process.exit(0); }
  // v1 x402 body: flat fields (payTo / maxAmountRequired / network / asset)
  payTo = acc.payTo ?? acc.payment?.payload?.payTo;
  amount = BigInt(acc.maxAmountRequired ?? acc.payment?.payload?.amount ?? acc.amount);
  network = acc.network ?? acc.payment?.network;
}
console.log("[1] 402 OK — payTo =", payTo, " amount =", Number(amount) / 1e6, "USDC, network =", network);
if (payTo.toLowerCase() !== USER_WALLET.toLowerCase()) {
  console.log("!! payTo is NOT the user wallet:", payTo);
}
const buyerEth = Number((await p.getBalance({ address: acct.address })) / 1000000000n);
const buyerUsdc = Number((await usdcBal(acct.address)) / 1000000n);
console.log("   buyer ETH:", buyerEth, "e-9 | buyer USDC:", buyerUsdc);

// STEP 2: buyer transfers USDC -> payTo
const h = await w.writeContract({ address: USDC, abi: USDC_ABI, functionName: "transfer", args: [payTo, amount] });
console.log("[2] transfer txHash =", h);
const rcpt = await p.waitForTransactionReceipt({ hash: h, timeout: 90_000 });
console.log("   mined, status =", rcpt.status, " gasUsed =", rcpt.gasUsed.toString());
console.log("   buyer USDC after:", String(Number((await usdcBal(acct.address)) / 1000000n)));

// STEP 3: settle with the NEW txHash
const settleHeader = btoa(JSON.stringify({ scheme: "exact", network, payload: { payer: acct.address, txHash: h } }));
const r3 = await fetch(`${BASE}/buy/e2e-x402-0001`, { method: "POST", headers: { "x-payment": settleHeader } });
const j = await r3.json().catch(() => ({}));
console.log("[3] settle ->", r3.status, JSON.stringify(j).slice(0, 500));

console.log("=== 0xB7f4 USDC after ===");
console.log("0xB7f4 USDC after:", String((await usdcBal(USER_WALLET)) / 1_000_000n));
