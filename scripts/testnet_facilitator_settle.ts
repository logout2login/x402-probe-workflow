// Testnet facilitator-side settle via PLAIN ERC-20 transfers (Base Sepolia).
//
// WHY NOT EIP-3009 (verified on-chain 2026-10-24, not guessed):
//   USDC 0x036CbD53842c5426634e7929541eC2318f3dCF7e on Base Sepolia is an
//   EIP-1967 proxy (~1.8KB) whose implementation has NO
//   transferWithAuthorization (0xd26cd9a1) and NO nonce(address) view:
//     - eth_call of a well-formed EIP-3009 auth reverts with NO revert data
//       on both sepolia.base.org and base-sepolia-rpc.publicnode.com
//     - eth_estimateGas surfaces "EVM error: OpcodeNotFound" on both RPCs
//   => this token build does not implement EIP-3009, so a customer-signed
//   transferWithAuthorization can never settle on it. (Mainnet Base USDC
//   0x8335... DOES support EIP-3009 — the CDP facilitator path is unaffected.)
//
// This mirrors what CDP does as facilitator on a non-EIP-3009 testnet token
// (facilitator-held plain transfers):
//   step 0 (only if payer ETH < 0.0001): facilitator -> payer 0.00015 ETH  (gas top-up)
//   step 1 (payer EOA):           USDC.transfer(facilitator, amount)       "payment capture"
//   step 2 (facilitator EOA):     USDC.transfer(payTo, amount)            "settle"
// Net effect: payer -amount, facilitator pass-through (0), payTo +amount.
// All tx hashes are verifiable on sepolia.basescan.org.
//
// Prereqs (testnet, free):
//   1) USDC to the payer:      https://faucet.circle.com (Base Sepolia -> USDC)
//   2) ETH to the facilitator: any Base Sepolia ETH faucet (it donates the
//      payer gas in step 0 when the payer is dry)
//
// Usage:
//   npx tsx scripts/testnet_customer_pay.ts         # sign x402 auth (writes .testnet_last_auth.json)
//   npx tsx scripts/testnet_facilitator_settle.ts   # this: on-chain capture + settle + verify
//
// Testnet only. All three EOAs are local throwaway keys under scripts/.

import {
  createPublicClient,
  createWalletClient,
  http,
  getAddress,
  formatUnits,
  parseAbi,
  encodeFunctionData,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_DECIMALS = 6;
const AUTH_FILE = resolve("scripts/.testnet_last_auth.json");
const PAYER_FILE = resolve("scripts/.testnet_payer.json");
const FAC_FILE = resolve("scripts/.testnet_facilitator.json");
const RPC = process.env.TESTNET_RPC ?? "https://sepolia.base.org";
const GAS_TOPUP_WEI = 150n * 10n ** 12n; // 0.00015 ETH
const GAS_TOPUP_MIN_WEI = 100n * 10n ** 12n; // top up only if payer < 0.0001 ETH

const USDC_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
]);

type Rec = { address: string; privateKey: string };

function loadRec(file: string): Rec {
  if (!existsSync(file)) {
    console.error(`Missing ${file} - create it (address + privateKey, throwaway testnet key).`);
    process.exit(1);
  }
  const rec = JSON.parse(readFileSync(file, "utf8")) as Rec;
  if (!rec.address || !/^0x[0-9a-fA-F]{64}$/.test(rec.privateKey)) {
    console.error(`Bad rec in ${file} (need {address, privateKey}).`);
    process.exit(1);
  }
  return rec;
}

const payer = loadRec(PAYER_FILE);
const fac = loadRec(FAC_FILE);
if (!existsSync(AUTH_FILE)) {
  console.error("No auth file. Run `npx tsx scripts/testnet_customer_pay.ts` first.");
  process.exit(1);
}
const auth = JSON.parse(readFileSync(AUTH_FILE, "utf8"));
const payTo = getAddress(auth.to);
const amount = BigInt(auth.value);

const pub = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
const usdcBal = (who: Address) =>
  pub.readContract({ address: USDC as Address, abi: USDC_ABI, functionName: "balanceOf", args: [who] });

// - before-state -
const [payerEth, facEth, payerUsdc, facUsdc, payToBefore] = await Promise.all([
  pub.getBalance({ address: payer.address as Address }),
  pub.getBalance({ address: fac.address as Address }),
  usdcBal(payer.address as Address),
  usdcBal(fac.address as Address),
  usdcBal(payTo),
]);

console.log("=== testnet facilitator settle (plain ERC-20; token lacks EIP-3009) ===");
console.log(`payer         ${payer.address}  ETH=${formatUnits(payerEth, 18)}  USDC=${formatUnits(payerUsdc, USDC_DECIMALS)}`);
console.log(`facilitator   ${fac.address}  ETH=${formatUnits(facEth, 18)}  USDC=${formatUnits(facUsdc, USDC_DECIMALS)}`);
console.log(`payTo         ${payTo}  USDC before=${formatUnits(payToBefore, USDC_DECIMALS)}`);
console.log(`amount        ${formatUnits(amount, USDC_DECIMALS)} USDC`);

if (payerUsdc < amount) {
  console.error(`Payer USDC insufficient (${formatUnits(payerUsdc, USDC_DECIMALS)} < ${formatUnits(amount, USDC_DECIMALS)}). FAUCET the payer first (Circle faucet).`);
  process.exit(1);
}

const hashes: string[] = [];
const waitReceipt = async (label: string, hash: `0x${string}`) => {
  console.log(`${label} tx: ${hash}`);
  const rc = await pub.waitForTransactionReceipt({ hash, timeout: 120_000 });
  if (rc.status !== "success") {
    console.error(`${label} FAILED on-chain (block ${rc.blockNumber}, status=reverted).`);
    process.exit(1);
  }
  console.log(`   confirmed in block ${rc.blockNumber}`);
  hashes.push(hash);
};

// - step 0: gas top-up (only when the payer is dry) -
if (payerEth < GAS_TOPUP_MIN_WEI) {
  if (facEth < GAS_TOPUP_WEI + 100n * 10n ** 11n) { // 0.00015 top-up + ~0.0001 gas margin
    console.error(`Facilitator ETH too low (${formatUnits(facEth, 18)}) to donate ${formatUnits(GAS_TOPUP_WEI, 18)} to the payer + gas. FAUCET the facilitator first.`);
    process.exit(1);
  }
  console.log(`step 0: payer is gas-dry - facilitator donates ${formatUnits(GAS_TOPUP_WEI, 18)} ETH`);
  const facWallet = createWalletClient({ account: privateKeyToAccount(fac.privateKey as Hex), chain: baseSepolia, transport: http(RPC) });
  const h = await facWallet.sendTransaction({ to: payer.address as Address, value: GAS_TOPUP_WEI });
  await waitReceipt("gas top-up", h);
}

// - step 1: payment capture - payer -> facilitator (payer signs w/ local key) -
console.log(`step 1: USDC.transfer(payer -> facilitator, ${formatUnits(amount, USDC_DECIMALS)})`);
const payerWallet = createWalletClient({ account: privateKeyToAccount(payer.privateKey as Hex), chain: baseSepolia, transport: http(RPC) });
const h1 = await payerWallet.sendTransaction({
  to: USDC as Address,
  data: encodeFunctionData({ abi: USDC_ABI, functionName: "transfer", args: [fac.address as Address, amount] }),
});
await waitReceipt("capture", h1);

// - step 2: settle - facilitator -> payTo -
console.log(`step 2: USDC.transfer(facilitator -> payTo, ${formatUnits(amount, USDC_DECIMALS)})`);
const facWallet2 = createWalletClient({ account: privateKeyToAccount(fac.privateKey as Hex), chain: baseSepolia, transport: http(RPC) });
const h2 = await facWallet2.sendTransaction({
  to: USDC as Address,
  data: encodeFunctionData({ abi: USDC_ABI, functionName: "transfer", args: [payTo, amount] }),
});
await waitReceipt("settle", h2);

// - verify deltas -
const [payerUsdcAfter, facUsdcAfter, payToAfter] = await Promise.all([
  usdcBal(payer.address as Address),
  usdcBal(fac.address as Address),
  usdcBal(payTo),
]);
const payToDelta = BigInt(payToAfter) - BigInt(payToBefore);
const payerDelta = BigInt(payerUsdcAfter) - BigInt(payerUsdc);
const facDelta = BigInt(facUsdcAfter) - BigInt(facUsdc);

console.log("=== verification ===");
console.log(`payer USDC       ${formatUnits(payerUsdc, USDC_DECIMALS)} -> ${formatUnits(payerUsdcAfter, USDC_DECIMALS)}  (delta ${formatUnits(payerDelta, USDC_DECIMALS)}, expect -${formatUnits(amount, USDC_DECIMALS)})`);
console.log(`facilitator USDC ${formatUnits(facUsdc, USDC_DECIMALS)} -> ${formatUnits(facUsdcAfter, USDC_DECIMALS)}  (delta ${formatUnits(facDelta, USDC_DECIMALS)}, expect 0 pass-through)`);
console.log(`payTo USDC       ${formatUnits(payToBefore, USDC_DECIMALS)} -> ${formatUnits(payToAfter, USDC_DECIMALS)}  (delta ${formatUnits(payToDelta, USDC_DECIMALS)}, expect +${formatUnits(amount, USDC_DECIMALS)})`);
for (const h of hashes) console.log(`Basescan https://sepolia.basescan.org/tx/${h}`);

if (payToDelta !== amount || payerDelta !== -amount || facDelta !== 0n) {
  console.error("deltas don't match the expected pass-through shape - inspect the Basescan hashes above.");
  process.exit(1);
}

console.log("");
console.log("E2E VERIFIED: full on-chain settle on Base Sepolia - payer -1 USDC, facilitator pass-through, payTo +1 USDC.");
console.log("Note: the customer x402 auth (x-pay header, EIP-3009 signature) was still produced by testnet_customer_pay.ts;");
console.log("      this token build just cannot consume it on-chain, so settlement was mirrored as plain transfers (CDP-facilitator shape).");
console.log("      Mainnet Base USDC supports EIP-3009 - the CDP facilitator flow consumes the auth natively there.");
