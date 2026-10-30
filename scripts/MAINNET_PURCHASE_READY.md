# Mainnet Purchase Ready

> âš ï¸ **2026-10-30 SECURITY ROTATION** â€” èˆŠ facilitator/buyer ç§é‘°ï¼ˆ`0xa62e...` / `0x7219...`ï¼‰å–º 2026-10-26 è¢« commit å…¥ public repo è€Œæ´©æ¼ï¼Œ**å·²æ£„ç”¨ï¼ˆDEPRECATEDï¼‰**ï¼Œ$0 å””å¥½å†å…¥éŒ¢ã€‚æ–°éŒ¢åŒ…è¦‹ä¸‹è¡¨ï¼Œæ–°ç§é‘°å­˜æœ¬åœ° `new_production_keys.json`ï¼ˆå””å¥½ commitï¼‰ã€‚

## Status
- Worker: `https://ownsite-aeo.jerry-aeo.workers.dev` â€” **Base Mainnet** (eip155:8453), `mock_facilitator=false`
- Facilitator derived from `SELFHOSTED_PRIVATE_KEY` (wrangler secret)
- Buyer script fixed to use new facilitator address

## Addresses to Fund (Base Mainnet)

| Role | Address | Needs |
|------|---------|-------|
| Facilitator | `0xDF6868C17ed8cEB9d3df286bf82279E08574c622` | ~0.01 ETH (gas for permit+transferFrom) |
| Buyer | `0x28bF9448DbfF1D1562577a3f948DA5E74AF9d7B1` | ~0.005 ETH + >= 1.0 USDC |
| PayTo | `0xB7f4D61320de4CF5F22330407a3A683304AC914d` | (receives USDC) |

## Funding Steps

1. Open MetaMask / Coinbase Wallet â†’ add Base network if not present
2. Send ETH to both addresses above
3. Send 1+ USDC to buyer address
4. Wait ~30s for confirmations

## Run Purchase (after funding)

```bash
cd C:/Users/jerry/.qwenpaw/workspaces/my-agent/ownsite-aeo
NODE BuyerPrivateKey=0x<BUYER_PRIVATE_KEY_FROM_ENV> AMOUNT_USDC=1.0 npx tsx scripts/mainnet_buyer.ts
```

## Files Modified
- `wrangler.toml` â€” `NETWORK = "eip155:8453"` (unchanged)
- `wrangler secret SELFHOSTED_PRIVATE_KEY` â€” updated (new keypair)
- `scripts/mainnet_buyer.ts` â€” fixed hardcoded facilitator address
- `scripts/.mainnet_keys.json` â€” generated (gitignored)

## Security
- Private keys stored ONLY in wrangler secrets + local `.mainnet_keys.json`
- `.mainnet_keys.json` added to `.gitignore`
- Seed phrase never written to disk
