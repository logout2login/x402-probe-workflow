import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";
const p = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org", { timeout: 20000 }) });
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const ABI = parseAbi(["function balanceOf(address) view returns (uint256)"]);
const b = await p.readContract({ address: USDC, abi: ABI, functionName: "balanceOf", args: ["0xB7f4D61320de4CF5F22330407a3A683304AC914d"] });
console.log("0xB7f4 USDC before:", (Number(b)/1e6).toFixed(6));
