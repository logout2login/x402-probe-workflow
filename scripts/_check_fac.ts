import { privateKeyToAccount } from 'viem/accounts';
const facPk = '0xe6bed232ee4d88ba0c8e70ff40a7fddfb8a5d849219ed348a6171388695f9de0';
const acct = privateKeyToAccount(facPk as `0x${string}`);
console.log('Testnet facilitator address:', acct.address);
