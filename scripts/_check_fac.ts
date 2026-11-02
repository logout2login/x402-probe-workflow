import { privateKeyToAccount } from 'viem/accounts';
const facPk = '0xREDACTED_FAC';
const acct = privateKeyToAccount(facPk as `0x${string}`);
console.log('Testnet facilitator address:', acct.address);
