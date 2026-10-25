import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";
const p = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org", { timeout: 20000 }) });
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
const TR = USDC_ABI.find(x => x.type === "event");
const BUYER = "0x009C8d8504cA603931a98aD6FA688F3fE9A57E43";
const USER  = "0xB7f4D61320de4CF5F22330407a3A683304AC914d";

async function inspect(label, addr) {
  let code = "", eth = "n/a", usdc = "n/a";
  try { const r = await p.getBytecode({ address: addr }); code = r?.bytecode ?? ""; } catch(e){ code = "ERR:"+e.message; }
  try { const r = await p.getBalance({ address: addr }); eth = (Number(r)/1e18).toFixed(6)+" ETH"; } catch(e){ eth = "ERR:"+e.message; }
  try { const r = await p.readContract({ address: USDC, abi: USDC_ABI, functionName: "balanceOf", args: [addr] }); usdc = (Number(r)/1e6).toFixed(6)+" USDC"; } catch(e){ usdc = "ERR:"+e.message; }
  console.log(`\n[${label}] ${addr}`);
  console.log("  type    :", (code===""||code==="0x") ? "EOA (no code)" : "CONTRACT len="+code.length);
  console.log("  ETH bal :", eth);
  console.log("  USDC bal:", usdc);
}
await inspect("TEST BUYER 0x009C", BUYER);
await inspect("YOUR WALLET 0xB7f4", USER);

console.log("\n=== USDC Transfers involving 0x009C (buyer) ===");
try {
  const inn = await p.getLogs({ address: USDC, event: TR, args: { to: BUYER }, fromBlock: 1, toBlock: "latest" });
  console.log(`  IN  count: ${inn.length}`);
  for (const l of inn) {
    const from = String(l.args.from), val = Number(l.args.value)/1e6;
    const marker = from.toLowerCase()===USER.toLowerCase() ? "   ^^ FUNDED BY YOUR 0xB7f4!" : "";
    console.log(`    ${val} USDC from ${from} (tx ${String(l.transactionHash).slice(0,18)}…  blk ${l.blockNumber})${marker}`);
  }
  const out = await p.getLogs({ address: USDC, event: TR, args: { from: BUYER }, fromBlock: 1, toBlock: "latest" });
  console.log(`  OUT count: ${out.length}`);
  for (const l of out) {
    const to = String(l.args.to), val = Number(l.args.value)/1e6;
    console.log(`    ${val} USDC to ${to} (tx ${String(l.transactionHash).slice(0,18)}…)`);
  }
} catch(e){ console.log("  getLogs failed:", e.message); }

console.log("\n=== Your wallet 0xB7f4 USDC IN (Base Sepolia) ===");
try {
  const uin = await p.getLogs({ address: USDC, event: TR, args: { to: USER }, fromBlock: 1, toBlock: "latest" });
  console.log(`  USDC IN count: ${uin.length}`);
  for (const l of uin.slice(0,5)) console.log(`    from ${String(l.args.from)}  ${Number(l.args.value)/1e6} USDC`);
} catch(e){ console.log("  getLogs failed:", e.message); }
