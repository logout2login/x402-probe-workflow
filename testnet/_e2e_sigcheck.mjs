import { keccak256, stringToHex, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
const correct = keccak256(stringToHex("Transfer(address,address,uint256)"));
console.log("CORRECT Transfer sig     :", correct);
const codeSig = "0xddf252ad1be2c89a69c75a739c2772d6f2fb78b5f24e8e974e1417f2730a3868"; // selfhosted.ts:35
console.log("code selfhosted.ts:35    :", codeSig, " CORRECT?", codeSig.toLowerCase() === correct.toLowerCase());
const pub = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org", { timeout: 20000 }) });
const rc = await pub.getTransactionReceipt({ hash: "0x8d697b6aea4ca086452fbe67adabf4d63f8f4cb58731d4e1388412311e1b0b50" });
const t0 = String(rc.logs[0].topics[0]);
console.log("chain topic[0]          :", t0, " CORRECT?", t0.toLowerCase() === correct.toLowerCase());
console.log("chain == code?", t0.toLowerCase() === codeSig.toLowerCase());
