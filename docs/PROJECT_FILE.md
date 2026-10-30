# AEO-OS é …ç›®æ–‡ä»¶ â€” å®Œæ•´è¨˜éŒ„

> ðŸ”’ **FREEZE NOTICE â€” 2026-10-26**ï¼šæœ¬æª”ç‚ºåªè®€ referenceï¼Œæ‰€æœ‰åœ°é¢æ•¸æ“šä»¥ SYSTEM_DOC.md Â§8 ç‚ºæº–ã€‚ä»»ä½•ã€Œç…§ä½ SECTION X åšå˜¢ã€å˜…å‹•ä½œå‰ï¼Œå…ˆ check SYSTEM_DOC å°é½Šç‹€æ…‹ã€‚åƒµå± doc å‚·å®³æ¨¡å¼ï¼šæœ¬æª”æŸç¯€éŽæ™‚ä½†è®€è€…åœ¨è©²ç¯€åœé “ï¼Œèª¤å°‡éŽæ™‚å…§å®¹ç•¶ ground truthã€‚
>
> æœ€å¾Œæ›´æ–°ï¼š2026-10-26
> ä½œè€…ï¼šJerry
> ç‰ˆæœ¬ï¼šv1.20ï¼ˆP1#3 doc audit remediation â€” secret leak fix, || table repair, q recal split, sync queue findingï¼‰
> Last Updated: 2026-10-26
> Deployed Version: f326e6a (commit f326e6a) âœ… live â€” JWKS key rotation + x402 v2 + canonicalize verification, 146 PASS, sigOk:true, HTTP 200/200/200
> Audit: #3 index expiry filter root cause (2026-10-26), âœ… E2E verified demand-ba2d8a8a visible, q=5.0 quarantined

---

## 1. é …ç›®æ¦‚è¿°

**AEO-OS**ï¼ˆAutonomous Economic Operations System for AI Agentsï¼‰æ˜¯ä¸€å€‹ agent-native å•†æ¥­åŸºç¤Žè¨­æ–½ï¼Œè®“ AI agent èƒ½ç¨ç«‹ï¼šä¸Šæž¶è³‡æ–™è³‡ç”¢ã€å®šåƒ¹ã€USDC çµç®—ã€éˆä¸Šå­˜è­‰ã€è²¡å‹™å°å¸³ã€‚å…¨ç¨‹é›¶äººé¡žå¹²é ã€‚

### æ ¸å¿ƒæ¦‚å¿µ

- **Verified-Data-Vending**ï¼šè³‡æ–™å…ˆå…è²» verify + previewï¼Œç¢ºèªåƒ¹å€¼å¾Œ x402 pay-per-call
- **x402 æ”¯ä»˜é–˜é–€**ï¼šç¬¦åˆ [ERC-7579 / x402 è¦ç¯„](https://github.com/abigger87/x402)çš„ pay-for-API å”è­°
- **Self-hosted Facilitator**ï¼šä¸ç”¨ Coinbase CDPï¼Œè‡ªå·±æŽ§ KEA éŒ¢åŒ…ï¼Œç›´æŽ¥ on-chain settle

### éƒ¨ç½²ç‹€æ…‹

| ç’°å¢ƒ | ç¶²çµ¡ | Worker URL | ç‹€æ…‹ |
|------|------|-----------|------|
| Mainnet | Base L2 (eip155:8453) | `https://ownsite-aeo.jerry-aeo.workers.dev` | ðŸ“‹ migration planï¼ˆæœªéƒ¨ç½²ï¼‰ |
| Testnet | Base Sepolia (eip155:84532) | åŒä¸Šï¼ˆåŒä¸€ workerï¼Œnetwork var æ±ºå®šï¼‰ | âœ… å¯ç”¨ |

---

## 2. æŠ€è¡“æ£§

| å±¤ | æŠ€è¡“ | ç”¨é€” |
|----|------|------|
| é‹è¡Œæ™‚ | Cloudflare Workers (V8 isolates) | HTTP + æ¥­å‹™é‚è¼¯ |
| æ•¸æ“šåº« | Cloudflare D1 (SQLite) | æ”¯ä»˜ã€ç”Ÿå‘½é€±æœŸã€å°å¸³ |
| åŽŸå­éŽ– | Cloudflare Durable Objects (Paid) | NonceLock, Quota, CircuitBreaker |
| å¿«å– | Cloudflare KV | x402 é…ç½®ã€permit nonce |
| å‰ç«¯ | GitHub Pages (SSOT) | `.well-known/` + dashboard.html | éž SSOT â€” pages ç‚º static cacheï¼Œlive data å¾ž Worker ç²å– |
| å¯†ç¢¼å­¸ | @noble/ed25519 + viem | Ed25519 ç°½å + EVM äº¤äº’ |
| èªžè¨€ | TypeScript 5.6, ES Module | å…¨éƒ¨ä»£ç¢¼ |
| éƒ¨ç½² | wrangler v3 | Worker/D1/KV ä¸€é«”åŒ– |

---

## 3. ç›®éŒ„çµæ§‹

```
ownsite-aeo/
â”œâ”€â”€ package.json                    # ä¾è³´èˆ‡è…³æœ¬
â”œâ”€â”€ tsconfig.json                   # TS é…ç½®ï¼ˆES2022 + DOM lib + workers-typesï¼‰
â”œâ”€â”€ wrangler.toml                   # Worker é…ç½®ï¼ˆnetwork/D1/KV/DO/secretsï¼‰
â”œâ”€â”€ .gitignore                      # æŽ’é™¤ç§é‘°/æœ¬åœ°æª”æ¡ˆ
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ worker/                     # HTTP è·¯ç”±å±¤
â”‚   â”‚   â”œâ”€â”€ index.ts                # è·¯ç”±åˆ†ç™¼å…¥å£
â”‚   â”‚   â”œâ”€â”€ env.ts                  # Env ä»‹é¢ï¼ˆvars + secretsï¼‰
â”‚   â”‚   â”œâ”€â”€ agents.ts               # ~~POST /api/agents~~ (zombie, removed)
â”‚   â”‚   â”œâ”€â”€ catalog.ts              # ~~POST/GET /api/catalog/listing~~ (zombie, removed)
â”‚   â”‚   â”œâ”€â”€ products.ts             # ~~GET /api/products/{id}~~ (zombie, removed)
â”‚   â”‚   â”œâ”€â”€ buy.ts                  # POST /api/buyï¼ˆä¸€éµè²·å…¥ï¼‰
â”‚   â”‚   â”œâ”€â”€ ledger.ts               # GET /api/ledger/*ï¼ˆå°å¸³ï¼‰
â”‚   â”‚   â”œâ”€â”€ verify.ts               # POST /api/verifyï¼ˆx402 ç°½åé©—è­‰å›žå‘¼ï¼‰
â”‚   â”‚   â”œâ”€â”€ mcp.ts                  # MCP server å…¥å£
â”‚   â”‚   â”œâ”€â”€ dashboard.ts            # GET /dashboard.json + /dashboard.html
â”‚   â”‚   â”œâ”€â”€ status.ts               # GET /healthz
â”‚   â”‚   â”œâ”€â”€ rate-limit.ts           # Redis-less çŽ‡é™
â”‚   â”‚   â”œâ”€â”€ reverify-client.ts      # v1.8ï¼šä¸»å‹•é‡é©—è­‰
â”‚   â”‚   â”œâ”€â”€ reverify-push.ts        # v1.8ï¼špush è§¸ç™¼
â”‚   â”‚   â”œâ”€â”€ settle-record.ts        # v1.9ï¼šsettle è¨˜éŒ„
â”‚   â”‚   â”œâ”€â”€ cursor-audit.ts         # v1.13ï¼šcursor ç°½åç¨½æ ¸
â”‚   â”‚   â”œâ”€â”€ recall-package.ts       # v1.5ï¼šTTL/recall
â”‚   â”‚   â”œâ”€â”€ unrecall.ts             # v1.15ï¼šunrecall
â”‚   â”‚   â””â”€â”€ cron-*.ts               # å„æŽ’ç¨‹ä»»å‹™
â”‚   â”‚
â”‚   â”œâ”€â”€ crypto/                     # å¯†ç¢¼å­¸æ¨¡çµ„
â”‚   â”‚   â”œâ”€â”€ canonical.ts            # ç©©å®š canonical JSON
â”‚   â”‚   â”œâ”€â”€ ed25519.ts              # Ed25519 sign/verifyï¼ˆå·²æ³¨å…¥ sha512Syncï¼‰
â”‚   â”‚   â”œâ”€â”€ jwks.ts                 # JWKS å°Žå‡º/è¼‰å…¥
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ facilitator/                # x402 Facilitator æ¨¡çµ„
â”‚   â”‚   â”œâ”€â”€ interface.ts            # Facilitator/FacilitatorEnv/SettleRequest ä»‹é¢
â”‚   â”‚   â”œâ”€â”€ selfhosted.ts           # v1.12ï¼šè‡ªè¨— facilitatorï¼ˆä¸»ç·šè·¯ï¼‰
â”‚   â”‚   â”œâ”€â”€ cdp.ts                  # CDP facilitatorï¼ˆå‚™ç”¨ï¼‰
â”‚   â”‚   â”œâ”€â”€ router.ts               # v1.12ï¼šå¤š rail è·¯ç”±
â”‚   â”‚   â”œâ”€â”€ circuit.ts              # v1.12ï¼šé›»è·¯æ–·è·¯å™¨
â”‚   â”‚   â””â”€â”€ lock.ts                 # v1.14ï¼šatomic lock
â”‚   â”‚
â”‚   â”œâ”€â”€ do/                         # Durable Object é¡ž
â”‚   â”‚   â”œâ”€â”€ nonce-lock.ts           # v1.14ï¼šnonce åŽŸå­éŽ–
â”‚   â”‚   â”œâ”€â”€ quota.ts                # v1.14ï¼šrate quota
â”‚   â”‚   â”œâ”€â”€ circuit.ts              # v1.14ï¼šcircuit breaker
â”‚   â”‚   â””â”€â”€ client.ts               # DO å®¢æˆ¶ç«¯å°è£
â”‚   â”‚
â”‚   â”œâ”€â”€ market/                     # å¸‚é›†é©é…å™¨
â”‚   â”‚   â”œâ”€â”€ registry.ts             # å¸‚é›†è¨»å†Šè¡¨
â”‚   â”‚   â”œâ”€â”€ adapter.ts              # çµ±ä¸€é©é…å™¨ä»‹é¢
â”‚   â”‚   â”œâ”€â”€ sync.ts                 # å¸‚é›†åŒæ­¥
â”‚   â”‚   â””â”€â”€ adapters/
â”‚   â”‚       â”œâ”€â”€ bazaar.ts           # v1.7ï¼šBazaar å¸‚é›†
â”‚   â”‚       â”œâ”€â”€ agent402.ts         # v1.7ï¼šAgent402 å¸‚é›†
â”‚   â”‚       â”œâ”€â”€ mcpso.ts            # v1.7ï¼šMCP.so å¸‚é›†
â”‚   â”‚       â””â”€â”€ datapoint.ts        # v1.7ï¼šDataPoint å¸‚é›†
â”‚   â”‚
â”‚   â”œâ”€â”€ publisher/                  # è³‡æ–™ç™¼å¸ƒæ¨¡çµ„
â”‚   â”‚   â”œâ”€â”€ build-verification.ts   # v1.0ï¼šç”Ÿæˆ verification.json
â”‚   â”‚   â”œâ”€â”€ build-index.ts          # v1.0ï¼šç”Ÿæˆ agent-index.json
â”‚   â”‚   â”œâ”€â”€ build-manifest.ts       # v1.0ï¼šç”Ÿæˆ manifest
â”‚   â”‚   â”œâ”€â”€ publish-guard.ts        # v1.0ï¼šé–˜é–€é‚è¼¯ï¼ˆq/evidence/blockedï¼‰
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â””â”€â”€ shared/                     # å…±ç”¨é¡žåž‹èˆ‡å¸¸æ•¸
â”‚       â”œâ”€â”€ types.ts                # Verification, PackageIndexEntry, X402* ç­‰
â”‚       â”œâ”€â”€ constants.ts            # q=0.72, evidenceâ‰¥4, TTL=180 ç­‰é–˜é–€å¸¸é‡
â”‚       â””â”€â”€ index.ts
â”‚
â”œâ”€â”€ scripts/                        # CLI è…³æœ¬
â”‚   â”œâ”€â”€ gen-keypair.ts              # ç”Ÿæˆ Ed25519 å¯†é‘°å°
â”‚   â”œâ”€â”€ build-verification.ts       # æœ¬åœ°ç”Ÿæˆ verification.json
â”‚   â”œâ”€â”€ publish-package.ts          # ç™¼å¸ƒ package åˆ° GitHub Pages
â”‚   â”œâ”€â”€ publish-static.ts           # ç™¼å¸ƒéœæ…‹æª”æ¡ˆ
â”‚   â”œâ”€â”€ sync-queue.ts               # åŒæ­¥ sync_queue â†’ GitHub
â”‚   â”œâ”€â”€ test-agent.ts               # æ¨¡æ“¬ buyer agent æ¸¬è©¦
â”‚   â”œâ”€â”€ mainnet_buyer.ts            # çœŸå¯¦ mainnet è³¼è²·è…³æœ¬
â”‚   â”œâ”€â”€ testnet_customer_pay.ts     # testnet è³¼è²·è…³æœ¬
â”‚   â”œâ”€â”€ live-purchase.ts            # live purchase æ•´åˆè…³æœ¬
â”‚   â””â”€â”€ .mainnet_keys.json          # gitignored â€” æœ¬åœ° mainnet keypair
â”‚
â”œâ”€â”€ schema/
â”‚   â”œâ”€â”€ d1.sql                      # D1 åˆå§‹ schemaï¼ˆpayments/sync_queue/recall_logï¼‰
â”‚   â””â”€â”€ migrations/                 # D1 migration æª”æ¡ˆ
â”‚
â”œâ”€â”€ public/                         # GitHub Pages SSOT
â”‚   â”œâ”€â”€ .well-known/
â”‚   â”‚   â”œâ”€â”€ agent.json              # Agent å…ƒæ•¸æ“š
â”‚   â”‚   â”œâ”€â”€ agent-index.json        # v1.10ï¼šå‹•æ…‹ agent ç´¢å¼•
â”‚   â”‚   â”œâ”€â”€ jwks.json               # Ed25519 å…¬é‘°
â”‚   â”‚   â”œâ”€â”€ verification-spec.json  # Verification è¦æ ¼
â”‚   â”‚   â””â”€â”€ x402.json               # x402 é…ç½®
â”‚   â””â”€â”€ schemas/
â”‚       â””â”€â”€ verification-v1.json    # JSON Schema v1
â”‚
â”œâ”€â”€ docs/                           # æ–‡æª”
â”‚   â”œâ”€â”€ deployment.md               # éƒ¨ç½²æŒ‡å—
â”‚   â”œâ”€â”€ v2-backlog.md               # v2 åŠŸèƒ½è¦åŠƒ
â”‚   â””â”€â”€ risk-report.md              # é¢¨éšªå ±å‘Š
â”‚
â”œâ”€â”€ testnet/                        # Testnet å·¥å…·
â”‚   â””â”€â”€ live_trade_test.ts          # Testnet çœŸå¯¦äº¤æ˜“æ¸¬è©¦
â”‚
â”œâ”€â”€ benchmarks/                     # æ€§èƒ½åŸºæº–
â”‚   â””â”€â”€ qwen25-quant/               # Qwen2.5 é‡åŒ–åŸºæº–
â”‚
â””â”€â”€ PHASE_LOG.md                    # åˆ†éšŽæ®µå®Œæˆé€šçŸ¥
```

---

## 4. API ç«¯é»žï¼ˆ8 å€‹ï¼‰

### Seller Agent

| æ–¹æ³• | è·¯å¾‘ | åŠŸèƒ½ |
|------|------|------|
| ~~POST~~ | ~~`/api/agents`~~ | ~~è¨»å†Š agent~~ |
| ~~POST~~ | ~~`/api/catalog/listing`~~ | ~~ä¸Šæž¶å•†å“åˆ° catalog~~ |
| ~~GET~~  | ~~`/api/catalog/listing`~~ | ~~æŸ¥è©¢æ‰€æœ‰ listing~~ |

> â›” **grep è­‰å¯¦ä»¥ä¸‹ç«¯é»žå””å­˜åœ¨æ–¼ `src/worker/index.ts`ï¼Œlive è¿”å›ž 404**ï¼š`/api/agents`ã€`/api/catalog/listing`ã€‚å‘¢å•²ä¿‚ status report äº‹æ•…å˜… proven attack surfaceã€‚å¯¦éš› API è¦‹ `SYSTEM_DOC.md Â§4`ã€‚

| æ–¹æ³• | è·¯å¾‘ | åŠŸèƒ½ |
|------|------|------|
| GET  | `/api/products/{id}` | ç²å–å•†å“è©³æƒ…ï¼ˆå« x402 challengeï¼‰ |

### Buyer Agent

| æ–¹æ³• | è·¯å¾‘ | åŠŸèƒ½ |
|------|------|------|
| GET  | `/verify` | å…è²»é©—è­‰è³‡æ–™ï¼ˆEd25519 ç°½åæ ¡é©—ï¼‰ |
| GET  | `/preview` | å…è²» previewï¼ˆå‰ N tokensï¼‰ |
| POST | `/buy` | x402 ä»˜è²»è³¼è²·ï¼ˆone-clickï¼‰ |
| POST | `/api/verify` | x402 ç°½åé©—è­‰å›žå‘¼ |

### Dashboard & Ledger

| æ–¹æ³• | è·¯å¾‘ | åŠŸèƒ½ |
|------|------|------|
| GET  | `/dashboard.json` | äº¤æ˜“çµ±è¨ˆï¼ˆdays åƒæ•¸ï¼‰ |
| GET  | `/dashboard.html` | å¯è¦–åŒ– dashboard |
| GET  | `/api/ledger/agent-summary` | Agent ç´šåˆ¥ç¸½çµ |
| GET  | `/api/ledger/agent-index` | Agent æŽ’è¡Œæ¦œ |

### å…¶ä»–

| æ–¹æ³• | è·¯å¾‘ | åŠŸèƒ½ |
|------|------|------|
| GET  | `/healthz` | Worker å¥åº·æª¢æŸ¥ |
| GET  | `/mcp` | MCP server å…¥å£ |

---

## 5. ç¶²çµ¡é…ç½®

### Mainnetï¼ˆBase L2ï¼‰â€” Migration Target

> âš ï¸ **â›” ç¾ç‹€ä»¥ SYSTEM_DOC ç‚ºæº–**ï¼šä»¥ä¸‹ Mainnet æ®µç‚º migration planï¼Œå¯¦éš›éƒ¨ç½²ä¿‚ **testnetï¼ˆeip155:84532ï¼‰**ã€‚ä»»ä½•ã€Œä¿®å¾© NETWORK=8453ã€å˜…å‹•ä½œæœƒå°‡ chain bug å¾©æ´»ï¼Œ**å””å¥½ç…§ä½åš**ã€‚

```toml
NETWORK = "eip155:8453"
ASSET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # USDC on Base
```

### Testnetï¼ˆBase Sepoliaï¼‰â€” Live

```toml
# åˆ‡æ›è®Šé‡ NETWORK ç‚º "eip155:84532"
ASSET_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # USDC on Sepolia (Circle canonical)
```

### ç•¶å‰éƒ¨ç½²

- Worker URL: `https://ownsite-aeo.jerry-aeo.workers.dev`
- ç¶²çµ¡: `eip155:84532`ï¼ˆBase Sepolia **testnet**ï¼Œsource of truthï¼‰
- `mock_facilitator`: `false`
- Facilitator: `selfhosted`ï¼ˆè‡ªå·±æŽ§ private keyï¼‰

---

## 6. åœ°å€èˆ‡å¯†é‘°ç®¡ç†

### å·²éƒ¨ç½² Mainnet åœ°å€

| è§’è‰² | åœ°å€ | èªªæ˜Ž |
|------|------|------|
| Facilitator | `0xDF6868C17ed8cEB9d3df286bf82279E08574c622` | å¾ž `SELFHOSTED_PRIVATE_KEY` æ´¾ç”Ÿ |
| Buyerï¼ˆæ¸¬è©¦ï¼‰ | `0x28bF9448DbfF1D1562577a3f948DA5E74AF9d7B1` | æœ¬åœ°ç”Ÿæˆï¼Œæœª funding |
| PayToï¼ˆæ”¶æ¬¾ï¼‰ | `0xB7f4D61320de4CF5F22330407a3A683304AC914d` | å›ºå®šåœ°å€ |
| USDC åˆç´„ | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Base Mainnet USDC |

### Testnet åœ°å€

| è§’è‰² | åœ°å€ |
|------|------|
| Facilitator | `0x1930cd61d3C3328923EcCFDCa8Ed322a17F556Dd` |
| PayTo | `0xB7f4D61320de4CF5F22330407a3A683304AC914d`ï¼ˆåŒ mainnetï¼‰ |

### å®‰å…¨ç´„æŸ

1. **æ‰€æœ‰ç§é‘°** é€šéŽ `wrangler secret put` è¨­å®šï¼Œæ°¸ä¸å…¥ `wrangler.toml` æˆ– git
2. **æœ¬åœ° keypair** å­˜åœ¨ `scripts/.mainnet_keys.json`ï¼ˆå·²åŠ å…¥ `.gitignore`ï¼‰
3. **Seed phrase** å¾žæœªå¯«å…¥ä»»ä½•æª”æ¡ˆï¼ˆå¾ž hardware wallet æ´¾ç”Ÿï¼‰
4. **Secrets æ¸…å–®**ï¼ˆ`wrangler.toml` è¨»é‡‹ä¸­ï¼‰ï¼š
   - `PAY_TO` â€” æ”¶æ¬¾åœ°å€
   - `SELFHOSTED_PRIVATE_KEY` â€” selfhosted facilitator ç§é‘°
   - `VERIFIER_SIGNER_PRIVATE_KEY` â€” Ed25519 ç°½åç§é‘°
   - `SYNC_SIGNING_KEY` â€” å…§éƒ¨åŒæ­¥å…±äº«å¯†é‘°
   - `CURSOR_SECRET` â€” cursor ç°½å HMAC å¯†é‘°
   - `REVERIFY_SECRET` â€” reverify endpoint å¯†é‘°
   - `FACILITATOR_URL` â€” CDP facilitator URLï¼ˆå‚™ç”¨ï¼‰
   - `CDP_API_KEY` / `CDP_PRIVATE_KEY` â€” CDP credentials

### ç•¶å‰ Mainnet Funding ç‹€æ…‹

| åœ°å€ | ETH | USDC | ç‹€æ…‹ |
|------|-----|------|------|
| Facilitator `0xDF68...` (rotated 2026-10-30, old 0xa62e DEPRECATED) | 0 | 0 | éœ€ funding ~0.01 ETH |
| Buyer `0x28bF...` (rotated 2026-10-30, old 0x7219 DEPRECATED) | 0 | 0 | éœ€ funding ~0.005 ETH + â‰¥1 USDC |
| PayTo `0xB7f4...` | 0 | 0 | æŽ¥æ”¶æ–¹ï¼Œç„¡éœ€ funding |

---

## 7. æ ¸å¿ƒæ©Ÿåˆ¶

### 7.1 x402 æ”¯ä»˜æµç¨‹

```
Buyer â†’ GET /api/products/{id} â†’ 402 + x402 challenge payload
     â†’ Buyer ç°½å â†’ POST /api/buyï¼ˆå¸¶ authorizationï¼‰
     â†’ Facilitator é©—è­‰ç°½å + nonce åŽ»é‡ + æœ‰æ•ˆæœŸ
     â†’ Facilitator èª¿ç”¨ USDC permit+transferFrom â†’ PayTo
     â†’ å¯«å…¥ D1 settle_attempts + payments
     â†’ è¿”é‚„è³‡æ–™
```

### 7.2 Selfhosted Facilitatorï¼ˆå…©æ¢ Railï¼‰

**Rail Aï¼ˆplain captureï¼Œtestnet ç”¨ï¼‰**ï¼š
- è³‡æ–™å·²ç¶“è½‰ USDC åˆ° facilitator EOA
- on-chain é©—è­‰ capture tx â†’ settle åˆ° PAY_TO

**Rail Bï¼ˆsigned authorizationï¼Œmainnet æ¨™æº–ï¼‰**ï¼š
- Buyer ç°½ canonical ERC-20 permit æŒ‡ä»¤
- viem ecrecover é©—è­‰ payer ç°½å
- Nonce åŽ»é‡ï¼ˆKV `permitnonce:{payer}:{nonce}`ï¼‰
- Facilitator å‡º gas æ USDC â†’ ç›´æŽ¥ transferFrom åˆ° PAY_TO

**å®‰å…¨é–˜é–€**ï¼š
- `facilitatorAddress === env.PAY_TO`ï¼ˆé˜²æ­¢ funds æµå‘ä¸æ˜Žï¼‰
- é‡‘é¡ guardï¼šcapture è·¯ `v âˆˆ [amount, 2Ã—amount]`ï¼›signed è·¯ `value == amount`
- mainnet ç„¡ authorization ç›´æŽ¥æ‹’ï¼ˆåªå‡† testnet ç”¨ plain captureï¼‰

### 7.3 Durable Objectsï¼ˆåŽŸå­ä¸€è‡´æ€§ï¼‰

| DO é¡ž | Binding | åŠŸèƒ½ |
|-------|---------|------|
| `NonceLockDO` | `NONCE_LOCK` | æ”¯ä»˜ nonce åŽŸå­éŽ–ï¼ˆé˜² double-spendï¼‰ |
| `QuotaDO` | `QUOTA` | Rate limiting quota |
| `CircuitBreakerDO` | `CIRCUIT` | Facilitator é›»è·¯æ–·è·¯å™¨ |

### 7.4 Publish Guard é–˜é–€

> âš ï¸ **ç¾éšŽæ®µä¿‚äºŒå…ƒé–˜**ï¼šqâ‰¥0.72 ä¸” evidenceâ‰¥4 â†’ listedï¼Œå¦å‰‡ blockedã€‚`BLOCKED_MIN_Q=0.65` åŒ `BLOCKED_MIN_EVIDENCE=3` ä¿‚æ­»å¸¸æ•¸ï¼Œå””åƒèˆ‡é–˜å£é‚è¼¯ã€‚Soft-blockï¼ˆ0.65â‰¤q<0.72ï¼‰å¾… v2 åŠ å…¥ç¬¬ä¸‰ç‹€æ…‹ã€‚

| ç´šåˆ¥ | q é–¾å€¼ | evidence é–¾å€¼ | å…¶ä»– |
|------|--------|---------------|------|
| Listed | â‰¥ 0.72 | â‰¥ 4 | â€” |
| Featured | â‰¥ 0.80 | â‰¥ 6 | â‰¥ 3 domains, â‰¤ 14 days old |
| Blocked | < 0.72 æˆ– < 4 | â€” | BLOCKED_MIN_Q=0.65 ä¿‚ dead constantï¼Œå””ç”Ÿæ•ˆ |

**åœ°é¢æ•¸æ“š**ï¼ˆD1 ground truthï¼Œ2026-10-26 post-v1.19 deployï¼‰ï¼š
- Listed packagesï¼š5ï¼ˆ4 publisher + 1 demand listed + 1 demand quarantined q=5.0ï¼‰
- agent-index.json é¡¯ç¤ºï¼š5ï¼ˆå…©é‚Šå°é½Š âœ…ï¼‰

---

## 8. Cron æŽ’ç¨‹

| ä»»å‹™ | é »çŽ‡ | å°æ‡‰ç‰ˆæœ¬ |
|------|------|----------|
| sync_queue + market sync | `*/15 * * * *` | v1.7 |
| TTL/stale/recall | `*/15 * * * *` (at :00) | v1.5 |
| Dashboard èšåˆ | `*/15 * * * *` (at :30) | v1.6 |
| Reverify push | `*/15 * * * *` (at :15) | v1.8 |
| Settle å°å¸³ | `*/15 * * * *` (at :45) | v1.9 |
| Refetch æŠ½æ¨£ | `0 6 * * *` | v1.5 |
| Agent-index é‡å»º | `30 6 * * *` | v1.10 |
| Cursor audit æ¸…ç† | `0 7 * * *` | v1.13 |
| Held timeout | `50 8 * * *` | v1.15 |
| Facilitator å¥åº·åº¦ | `0 9 * * *` | v1.12 |

> ç¾æœ‰ Free plan ä¸Šé™ 2 æ¢ cron triggerï¼Œæ‰€æœ‰ä»»å‹™ç”± `cron-dispatcher.runCron` ä¾ `cf-scheduled` é ­éƒ¨å­—æ®µåˆ†æ´¾ã€‚

---

## 9. éƒ¨ç½²æµç¨‹

### 9.1 é¦–æ¬¡éƒ¨ç½²

```bash
# 1. å»ºç«‹ Cloudflare è³‡æº
npx wrangler d1 create ownsite-aeo
npx wrangler kv:namespace create ownsite-aeo
# ï¼ˆDurable Objects éœ€è¦ Paid planï¼‰

# 2. è¨­å®š secrets
npx wrangler secret put PAY_TO
npx wrangler secret put SELFHOSTED_PRIVATE_KEY
npx wrangler secret put VERIFIER_SIGNER_PRIVATE_KEY
npx wrangler secret put SYNC_SIGNING_KEY
npx wrangler secret put CURSOR_SECRET
npx wrangler secret put REVERIFY_SECRET

# 3. åˆå§‹åŒ– D1 schema
npx wrangler d1 execute ownsite-aeo --file=schema/d1.sql

# 4. éƒ¨ç½²
npx wrangler deploy --minify
```

### 9.2 æœ¬åœ°é–‹ç™¼

```bash
npx wrangler dev --ip 127.0.0.1 --port 8787
```

### 9.3 ç¶²çµ¡åˆ‡æ›

ä¿®æ”¹ `wrangler.toml` `[vars]` ä¸­çš„ `NETWORK`ï¼š
- `eip155:8453` â†’ Base Mainnet
- `eip155:84532` â†’ Base Sepolia Testnet

### 9.4 GitHub Actionsï¼ˆSSOT åŒæ­¥ï¼‰

- `pages-deploy.yml`ï¼šæ¯æ¬¡ push æŠŠ `public/` éƒ¨ç½²åˆ° GitHub Pages
- `sync-manifest.yml`ï¼šæ¯ 30 åˆ†é˜å…œåº•åŒæ­¥ `.well-known/`

---

## 10. ç‰ˆæœ¬æ­·å²

| ç‰ˆæœ¬ | åŠŸèƒ½ | ç‹€æ…‹ |
|------|------|------|
| v1.0 | MVPï¼šverify/preview/buy + sync_queue + recall_log | âœ… |
| v1.2 | span_v1 excerpt æŠ½å– | âœ… |
| v1.5 | TTL/refetch/recover + packages è¡¨ | âœ… |
| v1.6 | Dashboard (dashboard.json + dashboard.html) | âœ… |
| v1.7 | Marketplace adapters (Bazaar/Agent402/MCP.so/DataPoint) | âœ… |
| v1.8 | Reverify (cron + push endpoint) | âœ… |
| v1.9 | Settle records (attempts/hourly/daily) | âœ… |
| v1.10 | Agent-index dynamic from D1 | âœ… |
| v1.11 | Pagination + ETag + cursor | âœ… |
| v1.12 | Facilitator router (CDP/selfhosted + circuit) | âœ… |
| v1.13 | Signed cursor + audit | âœ… |
| v1.14 | Durable Objects (NonceLock/Quota/CircuitBreaker) | âœ… |
| v1.15 | Held timeout + unrecall | âœ… |
| v1.16 | Segmented latency + fallback rate | âœ… |
| v1.17 | Origin annotation + match_log | âœ… |
| v1.18 | Schema v4 + demand report + match log | âœ… |
| v1.19 | Index fix (expires_at>now) + quarantine q=5.0 | âœ… |
| v1.20 | P1 #3 doc audit remediation (secret leak, || repair, q recal split, sync queue finding) | âœ… cd1677d |

---

## 11. æ¸¬è©¦è¦†è“‹

```bash
npm run test:unit    # 146/146 pass
npm run test:sync    # 12/12 pass
npm run test:agent   # 25/25 pass (mock mode)
npm run check        # tsc --noEmit pass
```

Testnet çœŸå¯¦äº¤æ˜“ï¼š
- `scripts/testnet_customer_pay.ts` â€” testnet è³¼è²·æµç¨‹
- `scripts/live-purchase.ts` â€” æ•´åˆæ¸¬è©¦

Mainnet çœŸå¯¦äº¤æ˜“ï¼š
- `scripts/mainnet_buyer.ts` â€” mainnet è³¼è²·ï¼ˆéœ€ fundingï¼‰
- `D1 settle_attempts` / `payments` â€” mainnet è¨˜éŒ„ï¼ˆç›®å‰ç‚ºç©ºï¼‰

---

## 12. å·²çŸ¥å•é¡Œèˆ‡å¾…è¾¦

### 12.1 å¾… Fundingï¼ˆMainnet é˜»å¡žï¼‰

Facilitator å’Œ Buyer åœ°å€åœ¨ Base mainnet å‡ç‚º 0 ETH / 0 USDCã€‚éœ€æ‰‹å‹•è½‰å…¥ï¼š
- Facilitatorï¼š~0.01 ETH
- Buyerï¼š~0.005 ETH + â‰¥1.0 USDC

### 12.2 v2 è¦åŠƒ

å®Œæ•´æ¸…å–®è¦‹ `docs/v2-backlog.md`ï¼ˆSSOTï¼‰ã€‚ä»¥ä¸‹ä¿‚åŒ¯ç¸½ï¼š

| ç·¨è™Ÿ | åŠŸèƒ½ | æ±ºç­– |
|------|------|------|
| 1 | Quota è¨ˆé‡ï¼ˆç”¨é‡è¨ˆè²»ï¼‰ | v1 ä¸åšï¼›v2: per-call æ”¹ç‚º quota key |
| 2 | Voucher ç³»çµ± | v1 ä¸åšï¼›v2: é¦–æ¬¡è³¼è²·å„ªæƒ ç¢¼ã€åˆä½œå¤¥ä¼´æŠ˜æ‰£ |
| 3 | è¨‚é–±ï¼ˆSubscriptionï¼‰ | v1 ä¸åšï¼›v2: $50/æœˆç„¡é™è¨ªå• listed åŒ… |
| 4 | Canary ç‰ˆæœ¬ï¼ˆç°åº¦ç™¼å¸ƒï¼‰ | v1 ä¸åšï¼›v2: 5% æµé‡æ¸¬è©¦æ–°é©—è­‰é‚è¼¯ |
| 5 | VTSï¼ˆVerification Trust Scoreï¼‰ | v1 ä¸åšï¼›v2: å¤š verifier åŠ æ¬Šå¹³å‡ q |
| 6 | å¤š Verifierï¼ˆMulti-verifierï¼‰ | v1 å–® verifierï¼›v2: JWKS multi-keyï¼Œä¸­ä½æ•¸å–åˆ† |
| 7 | Evidence Refetch Span Extractor | v1.2 å€™é¸ï¼›å®šç¾© span èªžæ³• + agent ç«¯å‡½å¼åº« |
| 8 | Legal Hold / DMCA | v1 ä¸åšï¼›v2: legal_hold è¡¨ + é€šçŸ¥ webhook |
| 9 | ç•°å‹•é€šçŸ¥ï¼ˆWebhooksï¼‰ | v1 ä¸åšï¼›v2: recall/stale/agent registry |
| 10 | çµæ§‹åŒ– Output Schema | v1 ä¸åšï¼›v2: ç™½åå–®å­—è©ž + sanitizer fuzz testing |
| 11 | ç²¾ç¢º Rate Limitï¼ˆDurable Objectï¼‰ | v1 KV è¿‘ä¼¼ï¼›v2: DO ç²¾ç¢ºè¨ˆæ•¸ |
| 12 | äº¤æ˜“å°å¸³ | v1 ä¸åšï¼›v2: æ¯å°æ™‚ CDP vs D1 å°å¸³ |
| 13 | Marketplace API çœŸå¯¦æŽ¥å…¥ | v1 éª¨æž¶ï¼›v2: Bazaar/Agent402/MCP.so/DataPoint |
| 14 | Agent ç«¯ Payment Header ç”Ÿæˆ | v1 mockï¼›v2: EIP-3009 signer |
| 15 | Dashboard èˆ‡ KPI è¦–è¦ºåŒ– | v1 è¨˜éŒ„ D1ï¼›v2: payments funnel + reach åˆ†æž |
| 16 | Content Versioning | v1 data_hash å”¯ä¸€æ¨™è­˜ï¼›v2: ç‰ˆæœ¬æ­·å² + å¢žé‡æ›´æ–° |
| 17 | Batch Purchase | v1 å–®åŒ…ï¼›v2: æ‰¹é‡æŠ˜æ‰£ + è¨‚é–±å¼æ›´æ–° |
| 18 | Refund æµç¨‹ | v1 ä¸åšï¼›v2: dispute + refund path |
| 19 | index near-expiry æŒ‡ç¤º | v1 ä¸åšï¼›v2: åŠ  `days_until_expiry` æ¬„ä½ï¼Œbuyer å€åˆ†æ–°é®®åº¦ |
| 20 | q=5.0 CHECK constraint | v1 ç„¡ DB constraintï¼›v2: `CHECK (q >= 0.0 AND q <= 1.0)` é˜² manual INSERTï¼ˆq=5.0 artifact ç”±å‘¢å€‹ constraint ç®¡ï¼‰ |
| 21 | q recalibration çœŸè§¸ç™¼æ¢ä»¶ | v1 ç·šæ€§ formulaï¼›v2: sigmoid/log + trigger threshold re-evalã€‚empirical evidenceï¼šå…©ä»½çœŸå ±å‘Š q=1.0/1.0 é£½å’Œï¼ˆmatchesâ‰¥10 å¿… capï¼‰ï¼Œéž q=5.0 artifact |
| 22 | manual-INSERT ç¦ä»¤ | v1 å…è¨±ç›´é€£ D1ï¼›v2: åƒ… admin API å¯å¯«ï¼Œé™„ audit log |
| 23 | expired UX 410 Gone | v1 éŽæœŸåŒ… buy 404ï¼›v2: æ˜Žç¢º 410 + expires_at æç¤º |

#### Demand Pipeline ç‰¹åˆ¥äº‹é …
- **origin ç°½å**ï¼šdemand report éœ€å¯é©—è­‰ originï¼ˆå·²å¯¦ä½œ `origin='demand'` annotationï¼Œç°½åé–˜å¾… v2ï¼‰
- **q recalibration**ï¼š`q = min(1.0, max(0.1, matches * 0.1))` ç›®å‰ç·šæ€§ï¼›v2 è€ƒæ…® log/sigmoid
- **excerpt_hash**ï¼šå ±å‘Šæ®µç´š hash ç”¨æ–¼å¢žé‡æ›´æ–°æª¢æ¸¬
- **merge/dedupe**ï¼šåŒä¸€ topic å¤šæ¬¡ request çš„åˆä½µç­–ç•¥

### 12.3 å®‰å…¨æ³¨æ„

- **Never commit** `*.pem`, `*.key`, `*.jwk`, `secrets*.json`, `keypair*.json`
- `.secrets.mainnet.env` å’Œ `.secrets.testnet.env` å·² gitignore
- `SELFHOSTED_PRIVATE_KEY` åªå­˜åœ¨ wrangler secretï¼Œä¸è½åœ°
- Pay-to åœ°å€ç¡¬ç·¨ç¢¼åœ¨ `src/facilitator/selfhosted.ts`ï¼ˆå®‰å…¨å› ç‚ºåªæœ‰ facilitator èƒ½èª¿ç”¨ï¼‰

---

## 13. ç›¸é—œè³‡æº

| è³‡æº | åœ°å€ |
|------|------|
| Worker | `https://ownsite-aeo.jerry-aeo.workers.dev` |
| GitHub Pages (SSOT) | `https://{repo-owner}.github.io/ownsite-aeo` |
| D1 Database | `ownsite-aeo`ï¼ˆID: `0bc5a545-c3e9-4abe-a5e7-99e68d1a1eab`ï¼‰ |
| KV Namespace | `ownsite-aeo`ï¼ˆID: `a50b91ed567b4ba6a4facb3f283826c0`ï¼‰ |
| x402 è¦ç¯„ | https://github.com/abigger87/x402 |
| Base Mainnet Explorer | https://basescan.org |
| Base Sepolia Explorer | https://sepolia.basescan.org |

---

## 14. é—œéµ File Pathsï¼ˆçµ•å°è·¯å¾‘ï¼‰

```
C:\Users\jerry\.qwenpaw\workspaces\my-agent\ownsite-aeo\
â”œâ”€â”€ package.json
â”œâ”€â”€ wrangler.toml
â”œâ”€â”€ README.md
â”œâ”€â”€ architecture.md
â”œâ”€â”€ whitepaper.md
â”œâ”€â”€ PHASE_LOG.md
â”œâ”€â”€ .gitignore
â”œâ”€â”€ src/worker/index.ts
â”œâ”€â”€ src/worker/env.ts
â”œâ”€â”€ src/facilitator/selfhosted.ts
â”œâ”€â”€ src/facilitator/router.ts
â”œâ”€â”€ src/do/nonce-lock.ts
â”œâ”€â”€ src/do/quota.ts
â”œâ”€â”€ src/do/circuit.ts
â”œâ”€â”€ scripts/mainnet_buyer.ts
â”œâ”€â”€ scripts/.mainnet_keys.json          # gitignored â€” mainnet keypair
â”œâ”€â”€ schema/d1.sql
â”œâ”€â”€ public/.well-known/agent.json
â”œâ”€â”€ public/.well-known/x402.json
â””â”€â”€ docs/v2-backlog.md
```
