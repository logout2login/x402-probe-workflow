import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
const pub = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org", { timeout: 20000 }) });
const rc = await pub.getTransactionReceipt({ hash: "0x8d697b6aea4ca086452fbe67adabf4d63f8f4cb58731d4e1388412311e1b0b50" });
console.log("num logs:", rc.logs.length);
for (const [i, log] of rc.logs.entries()) {
  console.log(`[log ${i}] addr=${log.address}`);
  log.topics.forEach((t, ti) => console.log(`   topic[${ti}]=${String(t)}`));
  console.log(`   data=${log.data}`);
}
