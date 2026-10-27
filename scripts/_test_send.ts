import {
  createPublicClient,
  http,
  parseAbi,
  encodeFunctionData,
  parseUnits,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const FAC = '0x1930cd61d3C3328923EcCFDCa8Ed322a17F556Dd';
const PK = '0x5fec660ce298b719988989461c7818a7b5b31bc0ee5418a346721fd7718fe31f';
const payer = privateKeyToAccount(PK as `0x${string}`);
const pub = createPublicClient({ chain: baseSepolia, transport: http('https://sepolia.base.org') });

const data = encodeFunctionData({
  abi: parseAbi(['function transfer(address to, uint256 value) returns (bool)']),
  functionName: 'transfer',
  args: [FAC, parseUnits('0.01', 6)],
});

const nonce = await pub.getTransactionCount({ address: payer.address });
console.log('Nonce:', nonce);

const tx = {
  chainId: baseSepolia.id,
  to: USDC,
  data,
  nonce,
  gas: 60000n,
  gasPrice: 1000000000n,
  value: 0n,
  from: payer.address,
};

const signed = await payer.signTransaction(tx);
console.log('Signed hash:', signed.hash);
const sent = await pub.sendTransaction({ serializedTransaction: signed.serialized });
console.log('Sent:', sent);
