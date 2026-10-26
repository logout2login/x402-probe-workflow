# AEO-OS 項目文件 — 完整記錄

> 最後更新：2026-10-26
> 作者：Jerry
> 版本：v1.18（demand pipeline + data_hash fix + match log + safeMatches gate + NETWORK banner + tier comment + §12.2 backlog merge）
> Last Updated: 2026-10-26
> Deployed Version: db92ba36 (origin:db92ba369bb5)
> Audit: #2 origin/matchlog/safeMatches (2026-10-25/26), ✅ E2E verified 2026-10-26

---

## 1. 項目概述

**AEO-OS**（Autonomous Economic Operations System for AI Agents）是一個 agent-native 商業基礎設施，讓 AI agent 能獨立：上架資料資產、定價、USDC 結算、鏈上存證、財務對帳。全程零人類干預。

### 核心概念

- **Verified-Data-Vending**：資料先免費 verify + preview，確認價值後 x402 pay-per-call
- **x402 支付閘門**：符合 [ERC-7579 / x402 規範](https://github.com/abigger87/x402)的 pay-for-API 協議
- **Self-hosted Facilitator**：不用 Coinbase CDP，自己控 KEA 錢包，直接 on-chain settle

### 部署狀態

| 環境 | 網絡 | Worker URL | 狀態 |
|------|------|-----------|------|
| Mainnet | Base L2 (eip155:8453) | `https://ownsite-aeo.jerry-aeo.workers.dev` | ✅ 部署中 |
| Testnet | Base Sepolia (eip155:84532) | 同上（同一 worker，network var 決定） | ✅ 可用 |

---

## 2. 技術棧

| 層 | 技術 | 用途 |
|----|------|------|
| 運行時 | Cloudflare Workers (V8 isolates) | HTTP + 業務邏輯 |
| 數據庫 | Cloudflare D1 (SQLite) | 支付、生命週期、對帳 |
| 原子鎖 | Cloudflare Durable Objects (Paid) | NonceLock, Quota, CircuitBreaker |
| 快取 | Cloudflare KV | x402 配置、permit nonce |
| 前端 | GitHub Pages (SSOT) | `.well-known/` + dashboard.html |
| 密碼學 | @noble/ed25519 + viem | Ed25519 簽名 + EVM 交互 |
| 語言 | TypeScript 5.6, ES Module | 全部代碼 |
| 部署 | wrangler v3 | Worker/D1/KV 一體化 |

---

## 3. 目錄結構

```
ownsite-aeo/
├── package.json                    # 依賴與腳本
├── tsconfig.json                   # TS 配置（ES2022 + DOM lib + workers-types）
├── wrangler.toml                   # Worker 配置（network/D1/KV/DO/secrets）
├── .gitignore                      # 排除私鑰/本地檔案
│
├── src/
│   ├── worker/                     # HTTP 路由層
│   │   ├── index.ts                # 路由分發入口
│   │   ├── env.ts                  # Env 介面（vars + secrets）
│   │   ├── agents.ts               # POST /api/agents
│   │   ├── catalog.ts              # POST/GET /api/catalog/listing
│   │   ├── products.ts             # GET /api/products/{id}（402 flow）
│   │   ├── buy.ts                  # POST /api/buy（一鍵買入）
│   │   ├── ledger.ts               # GET /api/ledger/*（對帳）
│   │   ├── verify.ts               # POST /api/verify（x402 簽名驗證回呼）
│   │   ├── mcp.ts                  # MCP server 入口
│   │   ├── dashboard.ts            # GET /dashboard.json + /dashboard.html
│   │   ├── status.ts               # GET /healthz
│   │   ├── rate-limit.ts           # Redis-less 率限
│   │   ├── reverify-client.ts      # v1.8：主動重驗證
│   │   ├── reverify-push.ts        # v1.8：push 觸發
│   │   ├── settle-record.ts        # v1.9：settle 記錄
│   │   ├── cursor-audit.ts         # v1.13：cursor 簽名稽核
│   │   ├── recall-package.ts       # v1.5：TTL/recall
│   │   ├── unrecall.ts             # v1.15：unrecall
│   │   └── cron-*.ts               # 各排程任務
│   │
│   ├── crypto/                     # 密碼學模組
│   │   ├── canonical.ts            # 穩定 canonical JSON
│   │   ├── ed25519.ts              # Ed25519 sign/verify（已注入 sha512Sync）
│   │   ├── jwks.ts                 # JWKS 導出/載入
│   │   └── index.ts
│   │
│   ├── facilitator/                # x402 Facilitator 模組
│   │   ├── interface.ts            # Facilitator/FacilitatorEnv/SettleRequest 介面
│   │   ├── selfhosted.ts           # v1.12：自託 facilitator（主線路）
│   │   ├── cdp.ts                  # CDP facilitator（備用）
│   │   ├── router.ts               # v1.12：多 rail 路由
│   │   ├── circuit.ts              # v1.12：電路斷路器
│   │   └── lock.ts                 # v1.14：atomic lock
│   │
│   ├── do/                         # Durable Object 類
│   │   ├── nonce-lock.ts           # v1.14：nonce 原子鎖
│   │   ├── quota.ts                # v1.14：rate quota
│   │   ├── circuit.ts              # v1.14：circuit breaker
│   │   └── client.ts               # DO 客戶端封裝
│   │
│   ├── market/                     # 市集適配器
│   │   ├── registry.ts             # 市集註冊表
│   │   ├── adapter.ts              # 統一適配器介面
│   │   ├── sync.ts                 # 市集同步
│   │   └── adapters/
│   │       ├── bazaar.ts           # v1.7：Bazaar 市集
│   │       ├── agent402.ts         # v1.7：Agent402 市集
│   │       ├── mcpso.ts            # v1.7：MCP.so 市集
│   │       └── datapoint.ts        # v1.7：DataPoint 市集
│   │
│   ├── publisher/                  # 資料發布模組
│   │   ├── build-verification.ts   # v1.0：生成 verification.json
│   │   ├── build-index.ts          # v1.0：生成 agent-index.json
│   │   ├── build-manifest.ts       # v1.0：生成 manifest
│   │   ├── publish-guard.ts        # v1.0：閘門邏輯（q/evidence/blocked）
│   │   └── index.ts
│   │
│   └── shared/                     # 共用類型與常數
│       ├── types.ts                # Verification, PackageIndexEntry, X402* 等
│       ├── constants.ts            # q=0.72, evidence≥4, TTL=180 等閘門常量
│       └── index.ts
│
├── scripts/                        # CLI 腳本
│   ├── gen-keypair.ts              # 生成 Ed25519 密鑰對
│   ├── build-verification.ts       # 本地生成 verification.json
│   ├── publish-package.ts          # 發布 package 到 GitHub Pages
│   ├── publish-static.ts           # 發布靜態檔案
│   ├── sync-queue.ts               # 同步 sync_queue → GitHub
│   ├── test-agent.ts               # 模擬 buyer agent 測試
│   ├── mainnet_buyer.ts            # 真實 mainnet 購買腳本
│   ├── testnet_customer_pay.ts     # testnet 購買腳本
│   ├── live-purchase.ts            # live purchase 整合腳本
│   └── .mainnet_keys.json          # gitignored — 本地 mainnet keypair
│
├── schema/
│   ├── d1.sql                      # D1 初始 schema（payments/sync_queue/recall_log）
│   └── migrations/                 # D1 migration 檔案
│
├── public/                         # GitHub Pages SSOT
│   ├── .well-known/
│   │   ├── agent.json              # Agent 元數據
│   │   ├── agent-index.json        # v1.10：動態 agent 索引
│   │   ├── jwks.json               # Ed25519 公鑰
│   │   ├── verification-spec.json  # Verification 規格
│   │   └── x402.json               # x402 配置
│   └── schemas/
│       └── verification-v1.json    # JSON Schema v1
│
├── docs/                           # 文檔
│   ├── deployment.md               # 部署指南
│   ├── v2-backlog.md               # v2 功能規劃
│   └── risk-report.md              # 風險報告
│
├── testnet/                        # Testnet 工具
│   └── live_trade_test.ts          # Testnet 真實交易測試
│
├── benchmarks/                     # 性能基準
│   └── qwen25-quant/               # Qwen2.5 量化基準
│
└── PHASE_LOG.md                    # 分階段完成通知
```

---

## 4. API 端點（8 個）

### Seller Agent

| 方法 | 路徑 | 功能 |
|------|------|------|
| POST | `/api/agents` | 註冊 agent（生成 pseudonym + wallet） |
| POST | `/api/catalog/listing` | 上架商品到 catalog |
| GET  | `/api/catalog/listing` | 查詢所有 listing |
| GET  | `/api/products/{id}` | 獲取商品詳情（含 x402 challenge） |

### Buyer Agent

| 方法 | 路徑 | 功能 |
|------|------|------|
| GET  | `/verify` | 免費驗證資料（Ed25519 簽名校驗） |
| GET  | `/preview` | 免費 preview（前 N tokens） |
| POST | `/buy` | x402 付費購買（one-click） |
| POST | `/api/verify` | x402 簽名驗證回呼 |

### Dashboard & Ledger

| 方法 | 路徑 | 功能 |
|------|------|------|
| GET  | `/dashboard.json` | 交易統計（days 參數） |
| GET  | `/dashboard.html` | 可視化 dashboard |
| GET  | `/api/ledger/agent-summary` | Agent 級別總結 |
| GET  | `/api/ledger/agent-index` | Agent 排行榜 |

### 其他

| 方法 | 路徑 | 功能 |
|------|------|------|
| GET  | `/healthz` | Worker 健康檢查 |
| GET  | `/mcp` | MCP server 入口 |

---

## 5. 網絡配置

### Mainnet（Base L2）

```toml
NETWORK = "eip155:8453"
ASSET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # USDC on Base
```

### Testnet（Base Sepolia）

```toml
# 切換變量 NETWORK 為 "eip155:84532"
ASSET_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # USDC on Sepolia (Circle canonical)
```

### 當前部署

> ⚠️ **⛔ 現狀以 SYSTEM_DOC 為準**：以下 Mainnet 段為 migration plan，實際部署係 **testnet（eip155:84532）**。任何「修復 NETWORK=8453」嘅動作會將 chain bug 復活，**唔好照住做**。

### Mainnet（Base L2）— Migration Target

```toml
NETWORK = "eip155:8453"
ASSET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # USDC on Base
```

### Testnet（Base Sepolia）— Live

```toml
# 切換變量 NETWORK 為 "eip155:84532"
ASSET_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # USDC on Sepolia (Circle canonical)
```

### 當前部署

- Worker URL: `https://ownsite-aeo.jerry-aeo.workers.dev`
- 網絡: `eip155:84532`（Base Sepolia **testnet**，source of truth）
- `mock_facilitator`: `false`
- Facilitator: `selfhosted`（自己控 private key）

---

## 6. 地址與密鑰管理

### 已部署 Mainnet 地址

| 角色 | 地址 | 說明 |
|------|------|------|
| Facilitator | `0xa62e26Cc428733f2992225493fc7303D0b005aC7` | 從 `SELFHOSTED_PRIVATE_KEY` 派生 |
| Buyer（測試） | `0x72196EC8779dfFc080A0649a27f4C5660f5406a8` | 本地生成，未 funding |
| PayTo（收款） | `0xB7f4D61320de4CF5F22330407a3A683304AC914d` | 固定地址 |
| USDC 合約 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Base Mainnet USDC |

### Testnet 地址

| 角色 | 地址 |
|------|------|
| Facilitator | `0x1930cd61d3C3328923EcCFDCa8Ed322a17F556Dd` |
| PayTo | `0xB7f4D61320de4CF5F22330407a3A683304AC914d`（同 mainnet） |

### 安全約束

1. **所有私鑰** 通過 `wrangler secret put` 設定，永不入 `wrangler.toml` 或 git
2. **本地 keypair** 存在 `scripts/.mainnet_keys.json`（已加入 `.gitignore`）
3. **Seed phrase** 從未寫入任何檔案（從 hardware wallet 派生）
4. **Secrets 清單**（`wrangler.toml` 註釋中）：
   - `PAY_TO` — 收款地址
   - `SELFHOSTED_PRIVATE_KEY` — selfhosted facilitator 私鑰
   - `VERIFIER_SIGNER_PRIVATE_KEY` — Ed25519 簽名私鑰
   - `SYNC_SIGNING_KEY` — 內部同步共享密鑰
   - `CURSOR_SECRET` — cursor 簽名 HMAC 密鑰
   - `REVERIFY_SECRET` — reverify endpoint 密鑰
   - `FACILITATOR_URL` — CDP facilitator URL（備用）
   - `CDP_API_KEY` / `CDP_PRIVATE_KEY` — CDP credentials

### 當前 Mainnet Funding 狀態

| 地址 | ETH | USDC | 狀態 |
|------|-----|------|------|
| Facilitator `0xa62e...` | 0 | 0 | 需 funding ~0.01 ETH |
| Buyer `0x7219...` | 0 | 0 | 需 funding ~0.005 ETH + ≥1 USDC |
| PayTo `0xB7f4...` | 0 | 0 | 接收方，無需 funding |

---

## 7. 核心機制

### 7.1 x402 支付流程

```
Buyer → GET /api/products/{id} → 402 + x402 challenge payload
     → Buyer 簽名 → POST /api/buy（帶 authorization）
     → Facilitator 驗證簽名 + nonce 去重 + 有效期
     → Facilitator 調用 USDC permit+transferFrom → PayTo
     → 寫入 D1 settle_attempts + payments
     → 返還資料
```

### 7.2 Selfhosted Facilitator（兩條 Rail）

**Rail A（plain capture，testnet 用）**：
- 資料已經轉 USDC 到 facilitator EOA
- on-chain 驗證 capture tx → settle 到 PAY_TO

**Rail B（signed authorization，mainnet 標準）**：
- Buyer 簽 canonical ERC-20 permit 指令
- viem ecrecover 驗證 payer 簽名
- Nonce 去重（KV `permitnonce:{payer}:{nonce}`）
- Facilitator 出 gas 提 USDC → 直接 transferFrom 到 PAY_TO

**安全閘門**：
- `facilitatorAddress === env.PAY_TO`（防止 funds 流向不明）
- 金額 guard：capture 路 `v ∈ [amount, 2×amount]`；signed 路 `value == amount`
- mainnet 無 authorization 直接拒（只准 testnet 用 plain capture）

### 7.3 Durable Objects（原子一致性）

| DO 類 | Binding | 功能 |
|-------|---------|------|
| `NonceLockDO` | `NONCE_LOCK` | 支付 nonce 原子鎖（防 double-spend） |
| `QuotaDO` | `QUOTA` | Rate limiting quota |
| `CircuitBreakerDO` | `CIRCUIT` | Facilitator 電路斷路器 |

### 7.4 Publish Guard 閘門

| 級別 | q 閾值 | evidence 閾值 | 其他 |
|------|--------|---------------|------|
| Listed | ≥ 0.72 | ≥ 4 | — |
| Featured | ≥ 0.80 | ≥ 6 | ≥ 3 domains, ≤ 14 days old |
| Blocked | < 0.65 | < 3 | — |

---

## 8. Cron 排程

| 任務 | 頻率 | 對應版本 |
|------|------|----------|
| sync_queue + market sync | `*/15 * * * *` | v1.7 |
| TTL/stale/recall | `*/15 * * * *` (at :00) | v1.5 |
| Dashboard 聚合 | `*/15 * * * *` (at :30) | v1.6 |
| Reverify push | `*/15 * * * *` (at :15) | v1.8 |
| Settle 對帳 | `*/15 * * * *` (at :45) | v1.9 |
| Refetch 抽樣 | `0 6 * * *` | v1.5 |
| Agent-index 重建 | `30 6 * * *` | v1.10 |
| Cursor audit 清理 | `0 7 * * *` | v1.13 |
| Held timeout | `50 8 * * *` | v1.15 |
| Facilitator 健康度 | `0 9 * * *` | v1.12 |

> 現有 Free plan 上限 2 條 cron trigger，所有任務由 `cron-dispatcher.runCron` 依 `cf-scheduled` 頭部字段分派。

---

## 9. 部署流程

### 9.1 首次部署

```bash
# 1. 建立 Cloudflare 資源
npx wrangler d1 create ownsite-aeo
npx wrangler kv:namespace create ownsite-aeo
# （Durable Objects 需要 Paid plan）

# 2. 設定 secrets
npx wrangler secret put PAY_TO
npx wrangler secret put SELFHOSTED_PRIVATE_KEY
npx wrangler secret put VERIFIER_SIGNER_PRIVATE_KEY
npx wrangler secret put SYNC_SIGNING_KEY
npx wrangler secret put CURSOR_SECRET
npx wrangler secret put REVERIFY_SECRET

# 3. 初始化 D1 schema
npx wrangler d1 execute ownsite-aeo --file=schema/d1.sql

# 4. 部署
npx wrangler deploy --minify
```

### 9.2 本地開發

```bash
npx wrangler dev --ip 127.0.0.1 --port 8787
```

### 9.3 網絡切換

修改 `wrangler.toml` `[vars]` 中的 `NETWORK`：
- `eip155:8453` → Base Mainnet
- `eip155:84532` → Base Sepolia Testnet

### 9.4 GitHub Actions（SSOT 同步）

- `pages-deploy.yml`：每次 push 把 `public/` 部署到 GitHub Pages
- `sync-manifest.yml`：每 30 分鐘兜底同步 `.well-known/`

---

## 10. 版本歷史

| 版本 | 功能 | 狀態 |
|------|------|------|
| v1.0 | MVP：verify/preview/buy + sync_queue + recall_log | ✅ |
| v1.2 | span_v1 excerpt 抽取 | ✅ |
| v1.5 | TTL/refetch/recover + packages 表 | ✅ |
| v1.6 | Dashboard (dashboard.json + dashboard.html) | ✅ |
| v1.7 | Marketplace adapters (Bazaar/Agent402/MCP.so/DataPoint) | ✅ |
| v1.8 | Reverify (cron + push endpoint) | ✅ |
| v1.9 | Settle records (attempts/hourly/daily) | ✅ |
| v1.10 | Agent-index dynamic from D1 | ✅ |
| v1.11 | Pagination + ETag + cursor | ✅ |
| v1.12 | Facilitator router (CDP/selfhosted + circuit) | ✅ |
| v1.13 | Signed cursor + audit | ✅ |
| v1.14 | Durable Objects (NonceLock/Quota/CircuitBreaker) | ✅ |
| v1.15 | Held timeout + unrecall | ✅ |
| v1.16 | Segmented latency + fallback rate | ✅ |

---

## 11. 測試覆蓋

```bash
npm run test:unit    # 78/78 pass
npm run test:sync    # 12/12 pass
npm run test:agent   # 25/25 pass (mock mode)
npm run check        # tsc --noEmit pass
```

Testnet 真實交易：
- `scripts/testnet_customer_pay.ts` — testnet 購買流程
- `scripts/live-purchase.ts` — 整合測試

Mainnet 真實交易：
- `scripts/mainnet_buyer.ts` — mainnet 購買（需 funding）
- `D1 settle_attempts` / `payments` — mainnet 記錄（目前為空）

---

## 12. 已知問題與待辦

### 12.1 待 Funding（Mainnet 阻塞）

Facilitator 和 Buyer 地址在 Base mainnet 均為 0 ETH / 0 USDC。需手動轉入：
- Facilitator：~0.01 ETH
- Buyer：~0.005 ETH + ≥1.0 USDC

### 12.2 v2 規劃

完整清單見 `docs/v2-backlog.md`（SSOT）。以下係匯總：

| 編號 | 功能 | 決策 |
|------|------|------|
| 1 | Quota 計量（用量計費） | v1 不做；v2: per-call 改為 quota key |
| 2 | Voucher 系統 | v1 不做；v2: 首次購買優惠碼、合作夥伴折扣 |
| 3 | 訂閱（Subscription） | v1 不做；v2: $50/月無限訪問 listed 包 |
| 4 | Canary 版本（灰度發布） | v1 不做；v2: 5% 流量測試新驗證邏輯 |
| 5 | VTS（Verification Trust Score） | v1 不做；v2: 多 verifier 加權平均 q |
| 6 | 多 Verifier（Multi-verifier） | v1 單 verifier；v2: JWKS multi-key，中位數取分 |
| 7 | Evidence Refetch Span Extractor | v1.2 候選；定義 span 語法 + agent 端函式庫 |
| 8 | Legal Hold / DMCA | v1 不做；v2: legal_hold 表 + 通知 webhook |
| 9 | 異動通知（Webhooks） | v1 不做；v2: recall/stale/agent registry |
| 10 | 結構化 Output Schema | v1 不做；v2: 白名單字詞 + sanitizer fuzz testing |
| 11 | 精確 Rate Limit（Durable Object） | v1 KV 近似；v2: DO 精確計數 |
| 12 | 交易對帳 | v1 不做；v2: 每小時 CDP vs D1 對帳 |
| 13 | Marketplace API 真實接入 | v1 骨架；v2: Bazaar/Agent402/MCP.so/DataPoint |
| 14 | Agent 端 Payment Header 生成 | v1 mock；v2: EIP-3009 signer |
| 15 | Dashboard 與 KPI 視覺化 | v1 記錄 D1；v2: payments funnel + reach 分析 |
| 16 | Content Versioning | v1 data_hash 唯一標識；v2: 版本歷史 + 增量更新 |
| 17 | Batch Purchase | v1 單包；v2: 批量折扣 + 訂閱式更新 |
| 18 | Refund 流程 | v1 不做；v2: dispute + refund path |

#### Demand Pipeline 特別事項
- **origin 簽名**：demand report 需可驗證 origin（已實作 `origin='demand'` annotation，簽名閘待 v2）
- **q recalibration**：`q = min(1.0, max(0.1, matches * 0.1))` 目前線性；v2 考慮 log/sigmoid
- **excerpt_hash**：報告段級 hash 用於增量更新檢測
- **merge/dedupe**：同一 topic 多次 request 的合併策略

### 12.3 安全注意

- **Never commit** `*.pem`, `*.key`, `*.jwk`, `secrets*.json`, `keypair*.json`
- `.secrets.mainnet.env` 和 `.secrets.testnet.env` 已 gitignore
- `SELFHOSTED_PRIVATE_KEY` 只存在 wrangler secret，不落地
- Pay-to 地址硬編碼在 `src/facilitator/selfhosted.ts`（安全因為只有 facilitator 能調用）

---

## 13. 相關資源

| 資源 | 地址 |
|------|------|
| Worker | `https://ownsite-aeo.jerry-aeo.workers.dev` |
| GitHub Pages (SSOT) | `https://{repo-owner}.github.io/ownsite-aeo` |
| D1 Database | `ownsite-aeo`（ID: `0bc5a545-c3e9-4abe-a5e7-99e68d1a1eab`） |
| KV Namespace | `ownsite-aeo`（ID: `a50b91ed567b4ba6a4facb3f283826c0`） |
| x402 規範 | https://github.com/abigger87/x402 |
| Base Mainnet Explorer | https://basescan.org |
| Base Sepolia Explorer | https://sepolia.basescan.org |

---

## 14. 關鍵 File Paths（絕對路徑）

```
C:\Users\jerry\.qwenpaw\workspaces\my-agent\ownsite-aeo\
├── package.json
├── wrangler.toml
├── README.md
├── architecture.md
├── whitepaper.md
├── PHASE_LOG.md
├── .gitignore
├── src/worker/index.ts
├── src/worker/env.ts
├── src/facilitator/selfhosted.ts
├── src/facilitator/router.ts
├── src/do/nonce-lock.ts
├── src/do/quota.ts
├── src/do/circuit.ts
├── scripts/mainnet_buyer.ts
├── scripts/.mainnet_keys.json          # gitignored — mainnet keypair
├── schema/d1.sql
├── public/.well-known/agent.json
├── public/.well-known/x402.json
└── docs/v2-backlog.md
```
