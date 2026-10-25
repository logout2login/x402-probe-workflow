import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const pk = generatePrivateKey();
const a = privateKeyToAccount(pk);
console.log('RECEIVER_ADDRESS=' + a.address);
console.log('RECEIVER_PRIVATE_KEY=' + pk);
console.log('NETWORK=Base Sepolia (84532)');
console.log('USDC_TOKEN=0x036CbD53842c5426634e7929541eC2318f3dCF7e');
