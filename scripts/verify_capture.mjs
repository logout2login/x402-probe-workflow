import { createPublicClient, http, keccak256, stringToHex } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const RPC = 'https://sepolia.base.org';
const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const PAYER = '0x3076670654bf5586eb42ff5853bd96ccff99c6fa';
const TX = '0x7631ca92a76e9c9cc8753273146bca447eedb53656b8f56d42e32a6281befd3b';
const SELFHOSTED_KEY = '0xe6bed232ee4d88ba0c8e70ff40a7fddfb8a5d849219ed348a6171388695f9de0';

const pub = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
const sig = keccak256(stringToHex('Transfer(address,address,uint256)'));
const facilitatorAddress = privateKeyToAccount(SELFHOSTED_KEY).address.toLowerCase();
const usdc = USDC.toLowerCase();

console.log('facilitatorAddress:', facilitatorAddress);
console.log('usdc:', usdc);

const rc = await pub.getTransactionReceipt({ hash: TX });
let passed = false;
for (const log of rc.logs) {
  const logAddrMatch = String(log.address).toLowerCase() === usdc;
  const topic0Match = String(log.topics[0]).toLowerCase() === sig;
  const from = '0x' + String(log.topics[1]).slice(26).toLowerCase();
  const to = '0x' + String(log.topics[2]).slice(26).toLowerCase();
  const fromMatch = from === PAYER.toLowerCase();
  const toMatch = to === facilitatorAddress;
  const amount = BigInt(log.data);

  console.log('log addr match:', logAddrMatch);
  console.log('topic0 match:', topic0Match);
  console.log('from match:', fromMatch, '(from:', from, 'payer:', PAYER.toLowerCase(), ')');
  console.log('to match:', toMatch, '(to:', to, 'fac:', facilitatorAddress, ')');
  console.log('amount:', amount, '>= 500000:', amount >= 500000n);

  if (logAddrMatch && topic0Match && fromMatch && toMatch && amount >= 500000n) {
    passed = true;
  }
}
console.log('\nALL CHECKS PASS:', passed);
