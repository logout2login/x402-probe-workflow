# ownsite-aeo — Verified-Data-Vending (Agentic AEO) v1.0

Verifier-signed 可驗證資料資產發布 + x402 付費閘門。

> **所有數字可喺 Basescan 重現。** 本專案只做真鏈上結算（Base mainnet, eip155:8453, 真 USDC `0x833589…2913`），不做模擬。

## 🛒 Live storefront — buy the verified GEMM package

The live AEO-OS x402 marketplace is serving a verified, Ed25519-signed data package. Buy it (or verify it free) with the endpoints below:

> **Your x402 settlement failing?** Coinbase CDP facilitator `/verify` rejects spec-compliant v2 payloads (upstream bug #2832 — triggered when `resource.description` > 500 chars). This storefront already ships **≤500-char descriptions**, so CDP `/verify` accepts our payments **today** — no waiting for the upstream fix. Every package is Ed25519-signed and independently verifiable.

- **Storefront (crawlable):** <https://ownsite-aeo.logout3login-a74.workers.dev/>
- **Buy the GEMM Φ-phase package** — `gemm-phi-irisxe-20261013`, $0.50 USDC (Base mainnet): <https://ownsite-aeo.logout3login-a74.workers.dev/buy/gemm-phi-irisxe-20261013>
- **Free verification certificate** (q=0.82, 4 evidence, Ed25519-signed): <https://ownsite-aeo.logout3login-a74.workers.dev/verify/gemm-phi-irisxe-20261013>
- **Live packages index** (`/.well-known/agent-index.json`): <https://ownsite-aeo.logout3login-a74.workers.dev/.well-known/agent-index.json>

> x402 v2 · Network: **Base mainnet** (eip155:8453) · Asset: USDC `0x833589…2913` · payTo `0xB7f4…914d`

## 💳 Payment options

- **x402 (Base mainnet USDC)** — standard flow: `GET /buy/{id}` → 402 → sign voucher → `POST` → settle.
- **Direct transfer** (if the CDP facilitator 500/400s on you): send USDC on Base to `0xB7f4D61320de4CF5F22330407a3A683304AC914d`, then reply with the tx hash → manual delivery within 1h. Never blocks your purchase on a facilitator bug.

## 版本歷史

| 版本 | 功能 | 狀態 |
|---|---|---|
| v1.0 | MVP：verify/preview/buy + sync_queue + recall_log | ✅ 已實作 |
| v1.2 | span_v1 excerpt 抽取 | ✅ 已實作 |
| v1.5 | TTL/refetch/recover + packages 表 | ✅ 已實作 |
| v1.6 | Dashboard (dashboard.json + dashboard.html) | ✅ 已實作 |
| v1.7 | Marketplace adapters (Bazaar/Agent402/MCP.so/DataPoint) | ✅ 已實作 |
| v1.8 | Reverify (cron + push endpoint) | ✅ 已實作 |
| v1.9 | Settle records (attempts/hourly/daily) | ✅ 已實作 |
| v1.10 | Agent-index dynamic from D1 | ✅ 已實作 |
| v1.11 | Pagination + ETag + cursor | ✅ 已實作 |
| v1.12 | Facilitator router (CDP/selfhosted + circuit) | ✅ 已實作 |
| v1.13 | Signed cursor + audit | ✅ 已實作 |
| v1.14 | Durable Objects (NonceLock/Quota/CircuitBreaker) | ✅ 已實作 |
| v1.15 | Held timeout + unrecall | ✅ 已實作 |
| v1.16 | Segmented latency + fallback rate | ✅ 已實作 |

## 硬性約束

1. **絕不寫入密鑰**：任何檔案、`wrangler.toml` vars、GitHub Actions Secret 都不放 `PRIVATE_HEX`、`PAY_TO`、CDP API key。所有機密通過 `wrangler secret put` 設定。
2. **v1 範圍最簡**：只到「免費 verify → 免費 preview → x402 pay-per-call → TTL/recall」。quota / voucher / 訂閱 / canary / VTS / 多 verifier 全部 v2（見 `docs/v2-backlog.md`）。
3. **SSOT 是唯一可信源**：GitHub Pages `public/.well-known/*`；Worker KV/D1 僅作運行時副本。sync-manifest + GitHub Action + cron 兜底同步。
4. **底層 verifier 閘門不變**：`q ≥ 0.72`、`evidence ≥ 4`。PublishGuard AEO gate 在其上加 Featured / Stale / Blocked 分級。
5. **真鏈上結算**：所有 x402 settle 喺 Base mainnet (8453) 真 USDC 執行，CDP gasless。無 Sepolia 模擬。

## 系統架構

```
Verifier ─┐
Builder ──┼→ verification.json (Ed25519-signed)
Data ─────┘     ↓
              Publisher (build-verification + build-index + build-manifest)
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
   GitHub Pages                    Cloudflare Worker
   (public/.well-known/*)          (KV + D1)
   [SSOT]                          ↓
                                  ↓
              Agent (via /.well-known, /verify, /preview, /buy, /mcp)
                        ↓
                   CDP x402 Facilitator
                        ↓
                     Base mainnet (8453)
                     (USDC settlement)
```

## 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. Type check
npm run check

# 3. 產生 Ed25519 密鑰對（一次性）
npm run gen-keypair
# 立即複製 PRIVATE_HEX 到 1Password / Keychain

# 4. 本地生成 verification.json
$env:VERIFIER_PRIVATE_KEY_HEX="<64-hex>"    # PowerShell
export VERIFIER_PRIVATE_KEY_HEX="<64-hex>"  # bash
$env:OWNSTIE_BASE="https://ownsite.example.com"
npm run publish-package

# 5. 跑測試
npm run test:unit    # 78/78 pass
npm run test:sync    # 12/12 pass
npm run test:agent   # 25/25 pass (mock mode)

# 6. 本地 wrangler dev + 真實 test-agent（可選）
npx wrangler dev --ip 127.0.0.1 --port 8787
npx tsx scripts/test-agent.ts --base http://localhost:8787
```

## 目錄結構

```
ownsite-aeo/
├── package.json                    # Node 20+, ESM, dependencies
├── tsconfig.json                   # ES2022 + DOM + @cloudflare/workers-types
├── wrangler.toml                   # Worker 配置（含佔位符）
├── .gitignore                      # 排除密鑰/本地檔案
├── .env.example                    # 環境變量範本（僅佔位符）
├── README.md                       # 本文件
├── PHASE_LOG.md                    # 分階段完成通知記錄
│
├── src/
│   ├── shared/                     # 類型 + 常數
│   │   ├── types.ts
│   │   └── constants.ts            # 所有閘門數字單一來源
│   ├── crypto/                     # Ed25519 + canonical + JWKS
│   │   ├── canonical.ts            # sorted keys + sha256Hex
│   │   ├── ed25519.ts              # sign / verify + hex/base64url
│   │   └── jwks.ts                 # JWK builder
│   ├── publisher/                  # build-verification / -index / -manifest + gate
│   │   ├── build-verification.ts   # sign verification.json
│   │   ├── build-index.ts          # agent-index.json generator
│   │   ├── build-manifest.ts       # sync-queue entries
│   │   └── publish-guard.ts        # AEO gate (Blocked/Stale/Listed/Featured)
│   └── worker/                     # Cloudflare Workers
│       ├── index.ts                # main routing
│       ├── env.ts                  # Env interface
│       ├── http.ts                 # CORS + JSON helpers
│       ├── rate-limit.ts           # KV rate limit
│       ├── pseudonym.ts            # SHA-256 pseudonym
│       ├── verify.ts               # GET /verify/{id}
│       ├── preview.ts              # GET /preview/{id}
│       ├── status.ts               # GET /status/{id}
│       ├── buy.ts                  # GET /buy/{id} (x402)
│       ├── mcp.ts                  # POST /mcp (JSON-RPC 2.0)
│       ├── internal-sync.ts        # POST /internal/sync
│       ├── sync-cron.ts            # cron: sync_queue + stale/recall
│       └── cdp-facilitator.ts      # CDP wrapper (Phase 2)
│
├── scripts/
│   ├── gen-keypair.ts              # 產生 Ed25519 key pair
│   ├── build-verification.ts       # fixture → verification.json
│   ├── publish-package.ts          # 組合腳本
│   ├── publish-static.ts           # 更新 public/*
│   ├── sync-queue.ts               # 市集同步（Phase 2 接真實 API）
│   ├── test-unit.ts                # 78 assertions
│   ├── test-sync.ts                # 12 assertions
│   └── test-agent.ts               # 25 assertions (mock + live)
│
├── schema/
│   ├── d1.sql                      # payments / sync_queue / recall_log / kpi
│   ├── verification-v1.json        # JSON Schema
│   └── aeo-gate.yaml               # 可讀閘門規則
│
├── fixtures/
│   ├── sample-verifier-output.json # 6 evidence 樣板
│   └── sample-data.json            # 樣板資料包
│
├── public/                         # GitHub Pages SSOT
│   ├── index.html
│   ├── .well-known/
│   │   ├── agent.json              # Agent Card
│   │   ├── agent-index.json        # Package index
│   │   ├── jwks.json               # Ed25519 public key
│   │   └── verification-spec.json  # Verification spec
│   └── schemas/
│       └── verification-v1.json
│
├── .github/workflows/
│   ├── ci.yml                      # PR/push → test + type-check
│   ├── sync-manifest.yml           # 每 30 分鐘同步到市集
│   └── pages-deploy.yml            # public/ → GitHub Pages
│
└── docs/
    ├── deployment.md               # 完整部署手冊
    ├── checklist.md                # 上線檢查清單
    ├── placeholder-replacements.md # 佔位符替換表
    ├── risk-report.md              # 風險清單與緩解
    └── v2-backlog.md               # v2 推後功能清單
```

## 端點一覽

| 端點 | 認證 | 費用 | Rate Limit | 用途 |
|---|---|---|---|---|
| `GET /.well-known/agent.json` | — | 免費 | — | Agent 發現入口 |
| `GET /.well-known/agent-index.json` | — | 免費 | — | 列出 Listed+Featured 包 |
| `GET /.well-known/jwks.json` | — | 免費 | — | Ed25519 公鑰 |
| `GET /verify/{id}` | User-Agent | 免費 | 60/min/IP | 完整 verification.json |
| `GET /preview/{id}` | User-Agent | 免費 | 10/hour/agent | 前 3 條記錄 |
| `GET /status/{id}` | User-Agent | 免費 | 60/min/IP | fresh / stale / recalled |
| `GET /buy/{id}` | X-PAYMENT | $0.50 / $1.00 USDC | 依付款 | 完整 data + snapshot + receipt |
| `POST /mcp` | — | 依 tool | — | MCP 4 tools |
| `POST /internal/sync` | X-SYNC-KEY | — | — | KV 副本同步 |
| `GET /healthz` | — | — | — | 健康檢查 |

## 定價

- **Standard (Listed)**：$0.50 USDC / package
- **Featured**：$1.00 USDC / package

## Trust Model

1. Every listed package carries an Ed25519-signed `verification.json`。
2. Agent 調用 `GET /verify/{id}` 免費取得完整 verification。
3. Agent 用 `jwks.json` 離線驗簽（**不需信 Worker**）。
4. Agent 可 refetch evidence `source_url` 並比對 `excerpt_hash`（v1.2 補完 span 抽取）。
5. TTL 由 `expires_at` 執行；過期返回 410 + `replacement_package_id`。

## 相關文件

- **PHASE_LOG.md** — 分階段完成通知（Phase 1-5）
- **docs/deployment.md** — 完整部署手冊
- **docs/checklist.md** — 上線檢查清單
- **docs/placeholder-replacements.md** — 佔位符替換表
- **docs/risk-report.md** — 風險清單與緩解措施
- **docs/v2-backlog.md** — v2 推後功能清單（v1 明確不做）

## 測試

```bash
npm run test:unit    # 78/78 pass
npm run test:sync    # 12/12 pass
npm run test:agent   # 25/25 pass (mock mode)
```

## 授權

MIT。verifier 輸出、Agent Card、verification.json 結構遵循計劃書 v1.0–v1.4 規定。

---

## 深入文件

- **架構細節**：見 [`architecture.md`](./architecture.md)
- **商業模式與技術原理**：見 [`whitepaper.md`](./whitepaper.md)
- **歷史迭代記錄**：見上方「版本歷史」表（v1.0 - v1.16）
