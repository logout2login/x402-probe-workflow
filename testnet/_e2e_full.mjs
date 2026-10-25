import { createWalletClient, createPublicClient, http, parseAbi, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://ownsite-aeo-testnet.jerry-aeo.workers.dev";
const PK = JSON.parse(readFileSync(join(process.cwd(), "testnet", ".buyer.json"), "utf8")).privateKey;
const USDC = "0x036Cbd53842c5426634e7929541EC2318f3dcF7e";
const USDC_ABI = parseAbi(["function transfer(address,uint256)", "function balanceOf(address)", "function allowance(address,address)"]);
const w = createWalletClient({ account: privateKeyToAccount(PK), chain: baseSepolia, transport: http() });
const p = createPublicClient({ chain: baseSepolia, transport: http() });
const bal = (a) => p.readContract({ address: a, abi: USDC_ABI, functionName: "balanceOf", args: [w.account.address] });
const dec = (h) => JSON.parse(Buffer.from(h, "base64").toString("utf8"));

// STEP 1: fresh 402
const r1 = await fetch(`${BASE}/buy/e2e-x402-0001`);
if (r1.status !== 402) { console.log("UNEXPECTED non-402 first:", r1.status, await r1.text()); process.exit(0); }
const x402 = dec(r1.headers.get("x402"));
const payTo = x402.payment.payload.payTo;
const amount = BigInt(x402.payment.payload.amount);
console.log("[1] 402 OK — payTo=", payTo, " amount=", Number(amount)/1e6, "USDC");
console.log("    buyer before:", (await bal(USDC))/1e6, "USDC");

// STEP 2: buyer transfers USDC -> payTo
const h = await w.writeContract({ address: USDC, abi: USDC_ABI, functionName: "transfer", args: [payTo, amount] });
console.log("[2] transfer txHash=", h, " gas=", await (await p.getTransaction({ hash: h })).gasUsed.toString());
await p.waitForTransactionReceipt({ hash: h, timeout: 60000 });
console.log("    buyer after :", (await bal(USDC))/1e6, "USDC");

// STEP 3: settle with the NEW txHash
const settleHeader = btoa(JSON.stringify({ scheme: "exact", network: x402.payment.network, payload: { payer: w.account.address, txHash: h } }));
const r3 = await fetch(`${BASE}/buy/e2e-x402-0001`, { headers: { "x-payment": settleHeader } });
const j = await r3.json();
console.log("[3] settle ->", r3.status, JSON.stringify(j, null, 2).slice(0, 600));
