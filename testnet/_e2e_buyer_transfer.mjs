// One-shot E2E: buyer (0x009C) transfers 0.5 USDC -> facilitator EOA (0x1930) on Base Sepolia.
// Prints the txHash so it can be wrapped in the x402 x-payment header.
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "node:fs";

const rpc = process.env.GAS_RPC_URL || "https://sepolia.base.org";
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const facilitator = "0x1930cd61d3C3328923EcCFDCa8Ed322a17F556Dd";
const amount = 500000n; // 0.5 USDC (6 decimals)

const abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

const buyerInfo = JSON.parse(readFileSync(new URL(".buyer.json", import.meta.url), "utf8"));
const account = privateKeyToAccount(buyerInfo.privateKey);
if (account.address.toLowerCase() !== buyerInfo.address.toLowerCase()) {
  console.error("KEY/ADDRESS MISMATCH:", account.address, "vs", buyerInfo.address); process.exit(1);
}
console.log("buyer:", account.address, "(matches .buyer.json)");
const wallet = createWalletClient({ account, chain: baseSepolia, transport: http(rpc) });
const pub = createPublicClient({ chain: baseSepolia, transport: http(rpc) });

const balBefore = await pub.readContract({ abi, address: USDC, functionName: "balanceOf", args: [account.address] });
const facBefore = await pub.readContract({ abi, address: USDC, functionName: "balanceOf", args: [facilitator] });
console.log("buyer USDC before:", balBefore.toString());
console.log("facilitator USDC before:", facBefore.toString());

const txHash = await wallet.writeContract({ abi, address: USDC, functionName: "transfer", args: [facilitator, amount] });
console.log("USDC transfer txHash:", txHash);

const rcpt = await pub.waitForTransactionReceipt({ hash: txHash, timeout: 120000 });
console.log("receipt status:", rcpt.status, "block:", rcpt.blockNumber.toString());
const facAfter = await pub.readContract({ abi, address: USDC, functionName: "balanceOf", args: [facilitator] });
console.log("facilitator USDC after:", facAfter.toString());
console.log("RESULT_TXHASH", txHash);
