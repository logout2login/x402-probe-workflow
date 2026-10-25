import { createPublicClient, http, parseAbi, isHex } from "viem";
import { baseSepolia } from "viem/chains";
const p = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org", { timeout: 20000 }) });
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const TR = parseAbi(["event Transfer(address indexed from, address indexed to, uint256 value)"])
  .find(x => x.type === "event");
const BUYER = "0x009C8d8504cA603931a98aD6FA688F3fE9A57E43";
const USER  = "0xB7f4D61320de4CF5F22330407a3A683304AC914d";
const latest = await p.getBlockNumber();
console.log("latest block:", latest.toString());

// Bounded USDC IN to the buyer (funding) — last 2M blocks, split into 250k windows
async function logsIn(from, to) {
  try { return await p.getLogs({ address: USDC, event: TR, args: { to: BUYER }, fromBlock: from, toBlock: to }); }
  catch { return []; }
}
let all = [];
const STEP = 250000n;
for (let f = 1n; f <= latest; f += STEP) {
  const t = f + STEP - 1n > latest ? latest : f + STEP - 1n;
  const r = await logsIn(f, t);
  all = all.concat(r);
  if (all.length > 0) break; // stop at first window that has funding
}
console.log("\nUSDC IN to 0x009C (buyer) found:", all.length);
for (const l of all) {
  const from = String(l.args.from), val = Number(l.args.value)/1e6;
  const marker = from.toLowerCase()===USER.toLowerCase() ? "   <-- YOUR 0xB7f4 FUNDED IT" : "";
  const marker2 = from.toLowerCase()==="0x0000000000000000000000000000000000000000" ? "   (mint/burn)" : "";
  console.log(`  blk ${l.blockNumber}: ${val} USDC from ${from}${marker}${marker2}`);
}

// Also: who are the OUT recipients (where did the buyer's USDC go)?
console.log("\nUSDC OUT from 0x009C (buyer):");
let out = [];
for (let f = 1n; f <= latest; f += STEP) {
  const t = f + STEP - 1n > latest ? latest : f + STEP - 1n;
  try { const r = await p.getLogs({ address: USDC, event: TR, args: { from: BUYER }, fromBlock: f, toBlock: t }); out = out.concat(r); } catch {}
}
for (const l of out) console.log(`  blk ${l.blockNumber}: ${Number(l.args.value)/1e6} USDC to ${String(l.args.to)}  tx ${String(l.transactionHash).slice(0,18)}…`);
