// ─── live-purchase ───
// 真實跑完整閉環（Base Sepolia 測試網）：
//   1) GET /buy/:id → 402 challenge（payTo / asset / network / maxAmount）
//   2) payer EOA 直轉 USDC 到 payTo（Rail A plain capture）→ txHash
//   3) POST /buy/:id + X-PAYMENT(base64 JSON) → Worker 上鏈驗證 Transfer → 200 + data + verification_snapshot + receipt
//   4) 下游離線驗證：GET /jwks → Ed25519 公開金 → verify sha256(canonical(signed_fields)) + data_hash 對帳
//   5) GET /verify/:id → attestation 狀態
//
// 用法：npx tsx scripts/live-purchase.ts
// 消耗：0.5 USDC（payer testnet）+ gas（testnet ETH）
import { readFileSync } from "node:fs";
import { createWalletClient, http, parseAbi, publicActions, encodeAbiParameters } from "viem";
import { baseSepolia } from "viem/chains";
import { canonicalize, sha256Hex } from "../src/crypto/canonical.js";
import { verifyCanonical } from "../src/crypto/ed25519.js";
import { firstPubKeyHexFromJwks } from "../src/crypto/jwks.js";
import { SIGNING_FIELDS } from "../src/shared/constants.js";
import type { JWKS } from "../src/shared/types.js";

const BASE = "https://ownsite-aeo.jerry-aeo.workers.dev";
const PACKAGE_ID = "research-2026-q4-ai-agent-adoption";
const RPC = "https://sepolia.base.org";
const AMOUNT = 500_000n; // 0.5 USDC, 6 decimals（PRICE_STANDARD）

const usdcAbi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
]);

function step(n: string) { console.log(`\n── step ${n} ` + "─".repeat(50)); }

async function main() {
  // ── 0) 載入 payer key ──
  const payerKey = JSON.parse(readFileSync(new URL("./.testnet_payer.json", import.meta.url), "utf8"));
  const wallet = createWalletClient({ account: payerKey.privateKey, chain: baseSepolia, transport: http(RPC) }).extend(publicActions);
  const payer = wallet.account.address;
  console.log(`payer = ${payer}`);

  step("1/5: 402 challenge");
  const ch = await fetch(`${BASE}/buy/${PACKAGE_ID}`);
  const challenge = (await ch.json()) as { x402Version: number; accepts: Array<{ scheme: string; network: string; maxAmountRequired: string; payTo: string; asset: string }> };
  if (ch.status !== 402) throw new Error(`expect 402, got ${ch.status}`);
  const acc = challenge.accepts[0];
  if (!acc) throw new Error("no accepts in challenge response");
  console.log(`challenge OK: network=${acc.network} asset=${acc.asset} payTo=${acc.payTo} max=${acc.maxAmountRequired}`);
  const payTo = acc.payTo;
  if (payTo === "0xPLACEHOLDER_PAY_TO") throw new Error("PAY_TO secret missing on live worker");

  // ── 2) 上鏈轉 USDC（Rail A plain capture）──
  step("2/5: USDC transfer payer → payTo");
  const usdcClient = { wallet, address: acc.asset as `0x${string}`, abi: usdcAbi };
  const balBefore = await wallet.readContract({ ...usdcClient, functionName: "balanceOf", args: [payer] } as never);
  console.log(`payer USDC before = ${Number(balBefore) / 1e6}`);
  if (BigInt(Number(balBefore)) < AMOUNT) throw new Error("payer USDC balance insufficient — run testnet_setup faucet top-up");
  const txHash = await wallet.writeContract({
    ...usdcClient,
    functionName: "transfer",
    args: [payTo, AMOUNT],
  } as never);
  console.log(`transfer sent txHash=${txHash}`);
  const receipt = await wallet.waitForTransactionReceipt({ hash: txHash, timeout: 90_000 });
  if (receipt.status !== "success") throw new Error("transfer tx failed on-chain");
  console.log(`receipt: status=success block=${receipt.blockNumber} gasUsed=${receipt.gasUsed}`);
  console.log(`explorer: https://sepolia.basescan.org/tx/${txHash}`);

  // ── 3) POST /buy + X-PAYMENT ──
  step("3/5: POST /buy + X-PAYMENT (capture verify + settle)");
  const paymentHeader = Buffer.from(JSON.stringify({
    scheme: "exact",
    network: acc.network,
    payload: { txHash, payer },
  })).toString("base64");
  const buy = await fetch(`${BASE}/buy/${PACKAGE_ID}`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-PAYMENT": paymentHeader },
  });
  const body = await buy.json() as { data?: unknown; verification_snapshot?: any; receipt?: any; error?: string; reason?: string };
  console.log(`POST /buy → ${buy.status}`);
  if (buy.status !== 200) throw new Error(`purchase failed: ${JSON.stringify(body)}`);
  const v = body.verification_snapshot;
  console.log(`delivery OK: data keys=[${Object.keys(body.data ?? {}).join(",")}] | receipt.tx=${body.receipt.tx_hash.slice(0, 18)}… amount=${body.receipt.amount_usdc}`);

  // ── 4) 下游離線驗證（JWKS + Ed25519 + data_hash）──
  step("4/5: downstream offline verification (JWKS)");
  const jwks = (await (await fetch(`${BASE}/jwks`)).json()) as JWKS;
  const pubHex = firstPubKeyHexFromJwks(jwks, v.kid ?? undefined);
  const signedFields: Record<string, unknown> = {};
  for (const k of SIGNING_FIELDS) signedFields[k] = v[k];
  const sigOk = await verifyCanonical(canonicalize(signedFields), v.verifier_signature, pubHex);
  const expectedDataHash = "sha256:" + sha256Hex(canonicalize(body.data));
  const hashOk = expectedDataHash === v.data_hash;
  console.log(`JWKS kid=${v.kid ?? jwks.keys[0]?.kid} pubLen=${pubHex.length}`);
  console.log(`Ed25519 signature over signed_fields: ${sigOk ? "VALID ✅" : "INVALID ❌"}`);
  console.log(`data_hash: expected=${expectedDataHash.slice(0, 30)}… got=${v.data_hash.slice(0, 30)}… match=${hashOk ? "✅" : "❌"}`);
  if (!sigOk || !hashOk) throw new Error("attestation verification failed");

  // ── 5) /verify/:id ──
  step("5/5: GET /verify/:id (downstream endpoint)");
  const vr = await fetch(`${BASE}/verify/${PACKAGE_ID}`);
  const vBody = await vr.json();
  console.log(`/verify → ${vr.status}: ${JSON.stringify(vBody).slice(0, 400)}`);

  console.log(`\n══ LIVE LOOP COMPLETE ══\n402→pay→settle→deliver→attestation→verify all green.`);
}

main().catch(e => { console.error(`\nLIVE PURCHASE FAILED: ${e?.message ?? e}`); process.exit(1); });
