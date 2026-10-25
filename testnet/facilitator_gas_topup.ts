// Testnet gas top-up: facilitator (0x1930, funded, pass-through) -> test buyer.
//
// Plain-ERC-20 x402 settle on Base Sepolia (token lacks EIP-3009) is
// gas-anchored by the FACILITATOR EOA, NOT by an external faucet/donor:
//   step 0  facilitator -> buyer   0.00012 ETH   (gas top-up)
//   step 1  buyer signs            USDC.transfer(facilitator, amt)  "capture"
//   step 2  facilitator signs      USDC.transfer(payTo, amt)        "settle"
// The facilitator is pass-through (net ~0). 0.00015 ETH already on it covers all.
//
//   npx tsx testnet/facilitator_gas_topup.ts
//
// viem-only (ethers/@coinbase/x402 are NOT installed in this project).
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org";
const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x036CbD238DA678d43B0B54C1A64d1510fF278F7e";
const TOPUP_ETH = "0.00012";            // facilitator -> buyer
const TOPUP_WEI = 120000000000000n;     // 0.00012 ETH
const GAS_BUF_WEI = 10000000000000n;    // 0.00001 ETH buffer for the facilitator's own tx gas
const MIN_BUYER_ETH = 0.0001;           // buyer needs >= this to sign a USDC transfer

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) { console.error(`ASSERTION FAILED: ${msg}`); process.exit(1); }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fac = JSON.parse(readFileSync(resolve(root, "scripts", ".testnet_facilitator.json"), "utf-8"));
const buyer = JSON.parse(readFileSync(resolve(root, "testnet", ".buyer.json"), "utf-8"));
assert(fac?.privateKey, "facilitator key missing");
assert(buyer?.address, "buyer address missing");

async function main() {
  const account = privateKeyToAccount(String(fac.privateKey));
  const facAddr = account.address;
  const buyerAddr: `0x${string}` = buyer.address;
  const pub = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });
  const wal = createWalletClient({ account, chain: baseSepolia, transport: http(RPC_URL) });

  const facEth = await pub.getBalance({ address: facAddr });
  const buyerEth = await pub.getBalance({ address: buyerAddr });
  console.log(`facilitator ${facAddr}  ETH=${Number(facEth) / 1e18}`);
  console.log(`buyer       ${buyerAddr}  ETH=${Number(buyerEth) / 1e18}  USDC=${USDC_ADDRESS}`);

  if (Number(buyerEth) / 1e18 >= MIN_BUYER_ETH) {
    console.log("buyer already has enough gas - nothing to do.");
    return;
  }
  const NEED = TOPUP_WEI + GAS_BUF_WEI;
  if (facEth < NEED) {
    console.error(`facilitator ETH too low (${Number(facEth) / 1e18}) to top up + keep gas. Needs ${Number(NEED) / 1e18} ETH. Re-faucet the facilitator first.`);
    process.exit(1);
  }

  const hash = await wal.sendTransaction({
    to: buyerAddr,
    value: TOPUP_WEI,
    chain: baseSepolia,
  });
  console.log(`top-up tx sent: ${hash}`);
  const rcpt = await pub.waitForTransactionReceipt({ hash, timeout: 60_000 });
  assert(rcpt.status === "success", "top-up tx reverted");
  console.log(`top-up CONFIRMED  block=${rcpt.blockNumber}  status=success`);

  const after = await pub.getBalance({ address: buyerAddr });
  console.log(`buyer ETH now = ${Number(after) / 1e18}`);
  const out = { ts: new Date().toISOString(), chainId: 84532, facilitator: facAddr, buyer: buyerAddr, amountEth: TOPUP_ETH, txHash: hash, block: Number(rcpt.blockNumber), status: "success" };
  writeFileSync(resolve(root, "testnet", ".gas_topup.json"), JSON.stringify(out, null, 2));
  console.log(`persisted -> testnet/.gas_topup.json`);
}

main().catch((e) => { console.error(`gas top-up FAILED: ${e?.message ?? e}`); process.exit(1); });
