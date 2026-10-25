import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
const pub = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org", { timeout: 20000 }) });
const txHash = "0x8d697b6aea4ca086452fbe67adabf4d63f8f4cb58731d4e1388412311e1b0b50";
const payer = "0x009c8d8504ca603931a98ad6fa688f3fe9a57e43";
const facilitator = "0x1930cd61d3c3328923ecfcddca8ed322a17f556dd";
const usdc = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
const SIG = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df52fcb2c"; // Transfer
const rc = await pub.getTransactionReceipt({ hash: txHash });
console.log("receipt status:", rc.status);
let captured = null;
for (const log of rc.logs) {
  const addr = log.address.toLowerCase();
  if (addr !== usdc) continue;
  if (log.topics.length < 3) continue;
  if (String(log.topics[0]).toLowerCase() !== SIG) continue;
  const from = "0x" + String(log.topics[1]).slice(26).toLowerCase();
  const to = "0x" + String(log.topics[2]).slice(26).toLowerCase();
  console.log("USDC Transfer event: from=", from, " to=", to, " data=", log.data);
  if (from !== payer || to !== facilitator) continue;
  captured = BigInt(log.data);
}
console.log("captured:", captured);
console.log(captured===null ? "=> capture_transfer_not_found (worker would reject)" : "=> MATCH, captured="+Number(captured)/1e6+" USDC");
