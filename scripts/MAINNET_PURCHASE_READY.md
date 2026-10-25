# Mainnet Purchase Ready

## Status
- Worker: `https://ownsite-aeo.jerry-aeo.workers.dev` — **Base Mainnet** (eip155:8453), `mock_facilitator=false`
- Facilitator derived from `SELFHOSTED_PRIVATE_KEY` (wrangler secret)
- Buyer script fixed to use new facilitator address

## Addresses to Fund (Base Mainnet)

| Role | Address | Needs |
|------|---------|-------|
| Facilitator | `0xa62e26Cc428733f2992225493fc7303D0b005aC7` | ~0.01 ETH (gas for permit+transferFrom) |
| Buyer | `0x72196EC8779dfFc080A0649a27f4C5660f5406a8` | ~0.005 ETH + >= 1.0 USDC |
| PayTo | `0xB7f4D61320de4CF5F22330407a3A683304AC914d` | (receives USDC) |

## Funding Steps

1. Open MetaMask / Coinbase Wallet → add Base network if not present
2. Send ETH to both addresses above
3. Send 1+ USDC to buyer address
4. Wait ~30s for confirmations

## Run Purchase (after funding)

```bash
cd C:/Users/jerry/.qwenpaw/workspaces/my-agent/ownsite-aeo
NODE BuyerPrivateKey=0xREDACTED_PRIVATE_KEY AMOUNT_USDC=1.0 npx tsx scripts/mainnet_buyer.ts
```

## Files Modified
- `wrangler.toml` — `NETWORK = "eip155:8453"` (unchanged)
- `wrangler secret SELFHOSTED_PRIVATE_KEY` — updated (new keypair)
- `scripts/mainnet_buyer.ts` — fixed hardcoded facilitator address
- `scripts/.mainnet_keys.json` — generated (gitignored)

## Security
- Private keys stored ONLY in wrangler secrets + local `.mainnet_keys.json`
- `.mainnet_keys.json` added to `.gitignore`
- Seed phrase never written to disk
