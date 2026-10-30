// Mainnet x402 buyer: signs EIP-3009 authorization and submits to facilitator worker.
// Usage:
//   npx tsx scripts/mainnet_buyer.ts                     # interactive: prompts private key
//   NODE BuyerPrivateKey=0x... AMOUNT_USDC=0.5 npx tsx scripts/mainnet_buyer.ts  # non-interactive
//
// Prerequisites:
//   1. Buyer has ETH on Base mainnet (for gas)
//   2. Buyer has USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) on Base mainnet >= AMOUNT_USDC
//   3. Facilitator has ETH on Base mainnet (for gas to call permit+transferFrom)
//
// What happens:
//   1. Check balances
//   2. Sign EIP-3009 authorization (canonical format, not typed-data)
//   3. POST /buy/{resource} with X-PAYMENT header
//   4. Wait for on-chain settle tx
//   5. Verify payTo received USDC

import {
  createPublicClient,
  createWalletClient,
  http,
  getAddress,
  formatUnits,
  parseAbi,
  toHex,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { randomBytes } from "node:crypto";

const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address;
const USDC_DECIMALS = 6;
const FACILITATOR_URL = "https://ownsite-aeo.jerry-aeo.workers.dev";
const NETWORK = "eip155:8453";
const RESOURCE = "research-2026-q4-ai-agent-adoption";

const USDC_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
  "function allowance(address, address) view returns (uint256)",
  "function nonces(address) view returns (uint256)",
]);

// Canonical format (same as facilitator-side verification):
//   asset|to|value|validAfter|validBefore|nonce|payer
function buildCanonical(usdc: string, payTo: string, amount: bigint, validAfter: number, validBefore: number, nonce: string, payer: string): string {
  return [usdc, payTo, amount.toString(), String(validAfter), String(validBefore), nonce, payer].join("|");
}

async function main() {
  const buyerPk = (process.env.BuyerPrivateKey as Hex) || undefined;
  const amountUsdc = parseFloat(process.env.AMOUNT_USDC ?? "0.5");
  const amount = BigInt(Math.round(amountUsdc * 1e6));

  if (!buyerPk) {
    console.log("=== Mainnet x402 Buyer ===");
    console.log("Usage: NODE BuyerPrivateKey=0x... AMOUNT_USDC=0.5 npx tsx scripts/mainnet_buyer.ts");
    console.log("       Or paste your private key below (throwaway recommended).");
    console.log("");
    const readline = await import("node:readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const pkInput = await new Promise<string>((resolve) => {
      rl.question("Buyer private key (0x...): ", (a) => resolve(a.trim()));
    });
    rl.close();
    const pk = pkInput.startsWith("0x") ? pkInput : ("0x" + pkInput) as Hex;
    if (pk.length !== 66) throw new Error("Invalid private key length (need 64 hex chars + 0x)");
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const buyer = privateKeyToAccount(pk as `0x${string}`);
    await run(buyer, amount, amountUsdc);
    return;
  }

  const buyer = privateKeyToAccount(buyerPk);
  await run(buyer, amount, amountUsdc);
}

async function run(buyer: ReturnType<typeof privateKeyToAccount>, amount: bigint, amountUsdc: number) {
  const pub = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
  const buyerAddr = buyer.address as Address;

  // â”€â”€ 1. Balances â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ethBal = await pub.getBalance({ address: buyerAddr });
  const usdcBal = await pub.readContract({
    address: USDC,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [buyerAddr],
  });
  console.log(`\n[1] Buyer: ${buyerAddr}`);
  console.log(`    ETH:  ${formatUnits(ethBal, 18)} ETH`);
  console.log(`    USDC: ${formatUnits(usdcBal, USDC_DECIMALS)} USDC  (need >= ${amountUsdc})`);

  if (usdcBal < amount) {
    console.error(`ERROR: insufficient USDC (${formatUnits(usdcBal, USDC_DECIMALS)} < ${amountUsdc}). Fund wallet with USDC on Base mainnet first.`);
    process.exit(1);
  }
  if (ethBal < 1e16) { // < 0.00001 ETH
    console.error("ERROR: buyer ETH too low (< 0.00001). Need gas to sign + submit tx.");
    process.exit(1);
  }

  // â”€â”€ 2. Get facilitator + payTo addresses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Fetch challenge to get payTo from the response (if available)
  // The facilitator wallet is derived from SELFHOSTED_PRIVATE_KEY in wrangler secrets
  // We need to know it; get from worker endpoint
  let facAddress: Address;
  try {
    const chResp = await fetch(`${FACILITATOR_URL}/buy/${RESOURCE}`);
    const ch = await chResp.json();
    // Challenge doesn't expose payTo directly; use known address
  } catch {}
  facAddress = (process.env.FACILITATOR_ADDRESS as Address) || "0xDF6868C17ed8cEB9d3df286bf82279E08574c622" as Address; // derived from SELFHOSTED_PRIVATE_KEY

  // PayTo wallet (already known)
  const payTo = "0xB7f4D61320de4CF5F22330407a3A683304AC914d" as Address;

  console.log(`\n[2] Facilitator: ${facAddress}`);
  console.log(`    PayTo:       ${payTo}`);
  console.log(`    Amount:      ${amountUsdc} USDC (${amount} base units)`);

  // â”€â”€ 3. Sign EIP-3009 authorization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const validAfter = Math.floor(Date.now() / 1000) - 60; // allow immediately
  const validBefore = validAfter + 300; // 5 min window
  const nonceBytes = randomBytes(8);
  const nonce = nonceBytes.readBigInt64LE().toString();

  const canonical = buildCanonical(
    USDC, payTo, amount, validAfter, validBefore, nonce, buyerAddr,
  );
  console.log(`\n[3] Signing authorization:`);
  console.log(`    canonical: ${canonical}`);

  const signature = await buyer.signMessage({ message: canonical });
  const v = 27; // ecrecover from eth_sign-compatible format
  // Derive r, s from signature (65-byte: r(32) + s(32) + v(1))
  const r = ("0x" + signature.slice(2, 66)) as Hex;
  const s = ("0x" + signature.slice(66, 130)) as Hex;

  const auth = {
    asset: USDC,
    to: payTo,
    value: amount.toString(),
    validAfter,
    validBefore,
    nonce,
    v,
    r,
    s,
    signature,
  };

  const authBase64 = Buffer.from(JSON.stringify(auth)).toString("base64");
  console.log(`    auth (base64): ${authBase64.slice(0, 80)}...`);

  // â”€â”€ 4. Submit to facilitator worker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log(`\n[4] Submitting to ${FACILITATOR_URL}/buy/${RESOURCE} ...`);
  const buyResp = await fetch(`${FACILITATOR_URL}/buy/${RESOURCE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PAYMENT": JSON.stringify({
        scheme: "exact",
        network: NETWORK,
        payload: {
          payer: buyerAddr,
          authorization: authBase64,
        },
      }),
    },
    body: JSON.stringify({ resource: `/buy/${RESOURCE}` }),
  });
  console.log(`    HTTP ${buyResp.status}`);
  const body = await buyResp.json() as { ok?: boolean; error?: string; txHash?: string; amount?: string };
  console.log(`    Response: ${JSON.stringify(body).slice(0, 400)}`);

  if (buyResp.status !== 200) {
    console.error("\nERROR: worker rejected payment.");
    console.error("Possible causes:");
    console.error("  - Facilitator has no ETH (can't pay gas for permit+transferFrom)");
    console.error("  - Facilitator address mismatch");
    console.error("  - Nonce reuse");
    console.error("  - Authorization validation failed");
    process.exit(1);
  }

  if (!body.ok) {
    console.error(`\nERROR: settle failed: ${body.error}`);
    if (body.txHash) console.error(`  txHash: ${body.txHash}`);
    process.exit(1);
  }

  console.log(`\nâœ… SETTLE SUCCESS`);
  const txHash = body.txHash ?? "(none)";
  console.log(`   txHash: ${txHash}`);
  console.log(`   Amount: ${formatUnits(BigInt(body.amount ?? "0"), USDC_DECIMALS)} USDC`);
  console.log(`   Basescan: https://basescan.org/tx/${txHash}`);

  // â”€â”€ 5. Verify payTo received â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log(`\n[5] Verifying payTo balance ...`);
  const payToAfter = await pub.readContract({
    address: USDC,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [payTo],
  });
  console.log(`   payTo USDC after: ${formatUnits(payToAfter, USDC_DECIMALS)}`);
  console.log(`   Basescan: https://basescan.org/tx/${body.txHash}`);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
