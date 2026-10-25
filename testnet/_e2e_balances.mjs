import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
const rpc = "https://sepolia.base.org";
const pub = createPublicClient({ chain: baseSepolia, transport: http(rpc) });
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const usdc = [{ type:"function", name:"balanceOf", stateMutability:"view", inputs:[{name:"a",type:"address"}], outputs:[{name:"",type:"uint256"}] }];
for (const a of ["0x009C8d8504cA603931a98aD6FA688F3fE9A57E43","0x15E5B9cDd061C790FC66460DFAeDdfc95125D071","0x1930cd61d3C3328923EcCFDCa8Ed322a17F556Dd"]) {
  const eth = await pub.getBalance({ address: a });
  const us = await pub.readContract({ abi: usdc, address: USDC, functionName:"balanceOf", args:[a] }).catch(e=>("ERR "+e.message));
  console.log(a, "\n  ETH=", (Number(eth)/1e18).toPrecision(6)+"", " USDC=", (typeof us==="bigint"? Number(us)/1e6 : us));
}
