import { createPublicClient, http, parseAbi, getContract, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as fs from 'fs';

const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const FAC = '0x1930cd61d3C3328923EcCFDCa8Ed322a17F556Dd';
const PAY_TO = '0xb7f4d61320de4cf5f22330407a3a683304ac914d';
const RPC = 'https://sepolia.base.org';

const pkData = JSON.parse(fs.readFileSync(`${process.cwd()}/scripts/.testnet_payer.json`, 'utf8'));
const payerAccount = privateKeyToAccount(pkData.privateKey as `0x${string}`);

const pub = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
const usdcContract = getContract({
  address: USDC,
  abi: parseAbi(['function transfer(address to, uint256 value) returns (bool)', 'function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)']),
  client: pub,
});

async function main() {
  const [decimals, payerBal, facBal, payToBal] = await Promise.all([
    usdcContract.read.decimals(),
    usdcContract.read.balanceOf([payerAccount.address]),
    usdcContract.read.balanceOf([FAC]),
    usdcContract.read.balanceOf([PAY_TO]),
  ]);
  console.log('=== Current USDC Balances ===');
  console.log(`Payer  ${payerAccount.address}: ${formatUnits(payerBal, decimals)} USDC`);
  console.log(`Fac    ${FAC}:                ${formatUnits(facBal, decimals)} USDC`);
  console.log(`PAY_TO ${PAY_TO}:             ${formatUnits(payToBal, decimals)} USDC`);
  console.log(`\nCapture tx 0xe6d74ea6 block=50511047`);
}

main().catch(e => console.error('Error:', e.message));
