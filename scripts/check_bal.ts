import { createPublicClient, http, getContract, parseAbi, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as fs from 'fs';
const pkData = JSON.parse(fs.readFileSync('C:/Users/jerry/.qwenpaw/workspaces/my-agent/ownsite-aeo/scripts/.testnet_payer.json','utf8'));
const payer = privateKeyToAccount(pkData.privateKey as `0x${string}`);
const RPC = 'https://sepolia.base.org';
const ASSET_USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const SELFHOSTED_ADDR = '0x4d4B486E6B8D86e2BA9c76868b87622731029a73';
const PUB_TO = '0xB7f4D61320de4CF5F22330407a3A683304AC914d';
const OLD_FAC_ADDR = '0x1930cd61d3C3328923EcCFDCa8Ed322a17F556Dd';
const pub = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
const USDC_ABI = parseAbi(['function balanceOf(address) view returns (uint256)','function decimals() view returns (uint8)']);
const usdc = getContract({ address: ASSET_USDC, abi: USDC_ABI, client: pub });
async function main() {
  const [pb, sf, pt, ofa, dec] = await Promise.all([
    usdc.read.balanceOf([payer.address]),
    usdc.read.balanceOf([SELFHOSTED_ADDR]),
    usdc.read.balanceOf([PUB_TO]),
    usdc.read.balanceOf([OLD_FAC_ADDR]),
    usdc.read.decimals(),
  ]);
  console.log('Payer:', payer.address);
  console.log('  USDC:', formatUnits(pb, dec));
  console.log('SELFHOSTED(0x4d4B):', formatUnits(sf, dec), 'USDC');
  console.log('PAY_TO(0xB7f4):', formatUnits(pt, dec), 'USDC');
  console.log('OLD_FAC(0x1930):', formatUnits(ofa, dec), 'USDC');
}
main().catch(console.error);
