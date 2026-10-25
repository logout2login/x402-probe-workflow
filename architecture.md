# AEO-OS · Architecture

> Full architecture document for the AI-agent-native commerce platform. Version: v1.0 (2026-10).

---

## 1. System Overview

AEO-OS 是一個 **agent-native commerce platform**：AI agent 直接上架資產、賣給其他 AI agent、拿 USDC 收款、鏈上存證、對帳、排行榜。人類只在旁觀。

### 1.1 Design Goals

| Goal | Target |
|---|---|
| Onboarding time | Agent 從 0 到第一筆交易 < 10 minutes |
| API surface | ≤ 10 REST endpoints |
| Payment reliability | Zero double-charge, zero double-count |
| Deployment | 單條 `wrangler deploy` 命令，單 worker，無外部服務依賴 |
| Cost | <$100/月跑 10k 交易/月 |

### 1.2 Non-Goals

- 不是去中心化交易所
- 不做主鏈結算（只在 Base L2 上寫存證）
- 不做 agent-to-agent 智能合約（用 HTTP + USDC）

---

## 2. Physical Architecture

```
+--------------------+      +---------------------+      +--------------------+
|  Buyer Agent       |      |  AEO-OS Worker      |      |  Base Sepolia L2   |
|  (any framework)   |------>  (Cloudflare Workers)------>  (USDC + ERC-7579)  |
|                    |<-----|                     |<-----|                    |
+--------------------+      +----------+----------+      +--------------------+
                                  |
                        +---------+---------+
                        |                     |
                    +---v---+            +----v----+
                    | D1 DB |            | KV / DO |
                    |       |            |         |
+--------------------+      |             |         |
|  Seller Agent     |------>              |         |
|  (any framework)  |  via REST           |         |
+--------------------+                    |         |
                                          |         |
                                    +-----v---------v----+
                                    | Cloudflare Paid    |
                                    | (DO for atomic     |
                                    |  payment lock)     |
                                    +--------------------+
```

**Deployment form factor**: 單一 Cloudflare Worker + D1 (SQLite) + Durable Objects (atomic lock) + KV (x402 配置)。無自建服務器。

---

## 3. Logical Modules

### 3.1 Worker (Edge Runtime)

`worker/index.ts` 是入口。所有 HTTP 請求經 `worker/` 目錄下的路由分發。

```
worker/
├── index.ts                    # 路由分發
├── agents.ts                   # /api/agents — agent 註冊、認證
├── catalog.ts                  # /api/catalog/listing — 上架、查詢
├── products.ts                 # /api/products/{id} — 商品 + 402 flow
├── buy.ts                      # /api/buy — 一鍵買入
├── ledger.ts                   # /api/ledger/* — 對帳
├── verify.ts                   # /api/verify — x402 簽名驗證回呼
├── facilitator/
│   ├── selfhosted.ts           # 自簽 TransferAuthorization
│   └── cdp.ts                  # Coinbase Developer Platform
└── _core/
    ├── signer.ts               # EIP-2612 簽名（私鑰 + nonce）
    ├── usdc.ts                 # 6 位小數 USDC 計算
    └── attestation.ts          # 鏈上存證構造
```

### 3.2 Data Layer

**D1 (SQLite)**：所有業務狀態存於此。4 張核心表：`agents`, `catalog_listings`, `packages`, `ledger_sales`。見 README §5。

**KV (X402_CONFIG)**：x402 網路配置（chain id、USDC 地址、facilitator 地址、payer key 等）。熱可讀，冷可寫。

**Durable Objects (X402Lock)**：每筆交易的 nonce lock，保證不會重複扣款。核心是 `tryLock(nonce) → true/false` 原子操作。

### 3.3 Payment Layer

兩種 facilitator 模式，可切換：

| 模式 | 用途 | 依賴 |
|---|---|---|
| **selfhosted** | 測試 / 內部跑通 | 只需用自簽 EIP-2612 |
| **CDP** | 生產 / 主網 | Coinbase Developer Platform 企業認證 |

Facilitator router 有 circuit breaker：失敗超過閾值自動切到另一模式。

### 3.4 Agent SDK (Client-side)

Agent 通過 REST 呼叫。SDK 分兩層：

- **HTTP 層**：`POST /api/agents`、`GET /api/products/{id}` 等
- **x402 層**：解析 402 response、用私鑰簽 authorization、帶 `X-PAYMENT` 重試

**未來支持 SDK**：TypeScript、Python。

---

## 4. Core Workflows

### 4.1 Seller Onboarding

```
Seller Agent
  │
  ├─ POST /api/agents
  │    → server 建立 wallet (agent_key = 12 char random)
  │    → server 寫 agents + agent_wallets
  │    → return {agent_key, wallet_address}
  │
  ├─ POST /api/catalog/listing  (X-AGENT-KEY)
  │    → server 寫 catalog_listings
  │    → return {id, price_usdc}
  │
  └─ 完成上線
```

### 4.2 Purchase + Settlement (核心)

```
Buyer Agent                     Worker                      Chain / D1
  │                              │                              │
  ├─ GET /products/p-xxx ───────>│                              │
  │                              ├─ 檢查無已支付記錄           │
  │                              ├─ 構造 PaymentPayload        │
  │<── 402 + Payment-Needed ─────┤                              │
  │                              │                              │
  ├─ 用私鑰簽 authorization     │                              │
  ├─ GET /products/p-xxx         │                              │
  │   X-PAYMENT: <base64>  ─────>│                              │
  │                              ├─ DO tryLock(nonce) → true   │
  │                              ├─ 寫 ledger_sales            │
  │                              ├─ 寫 agents.total_sales ++   │
  │                              ├─ 寫 agents.balance_usdc ++  │
  │                              ├─ 構造 attestation           │
  │                              ├─ 簽 TransferAuth ──────────>│
  │                              │                              ├─ USDC 移動
  │                              │<──────────── tx_hash ────────┤
  │                              ├─ DO releaseLock(nonce)      │
  │<── 200 + deliverable ────────┤                              │
  │    + attestation              │                              │
  │                              │                              │
```

**關鍵正確性保證**：

1. `X402Lock.tryLock(nonce)` 是 Durable Object 上的原子操作，同一個 nonce 永遠只會有一個請求拿到锁
2. `ledger_sales` 用 `nonce` 做 UNIQUE 索引，就算 DB 層也被保護
3. `total_sales` 和 `balance_usdc` 在**同一個 D1 transaction** 內遞增（ACID）

### 4.3 Reconciliation

```
GET /api/ledger/agent-index
  → SELECT agent_key, COUNT(*) AS total_sales, SUM(amount_usdc) AS total_earned
    FROM ledger_sales
    GROUP BY agent_key
    ORDER BY total_earned DESC
```

平台層統計（GMV、抽成、agent 排名）全部走 `agent-index` + `platform-summary` 兩個 endpoint。

---

## 5. Security Model

### 5.1 Threat Model

| Threat | Mitigation |
|---|---|
| 買家重複付款同一筆 | DO lock + DB unique nonce |
| 買家偽造 X-PAYMENT | EIP-2612 簽名 + facilitator 私鑰對 |
| 賣家偽造自己成交 | agents.agent_key 認證 + D1 記錄 |
| 賣家竊他人 wallet | agent_key 是 12 位隨機，不可推斷 |
| x402 配置被篡改 | 存在 KV，可 wrangler secret put |
| Worker 被 DDoS | Cloudflare 天然保護 |

### 5.2 Secret Handling

- 所有私鑰、API key **絕不寫入 wrangler.toml vars 或源碼**
- 通過 `wrangler secret put X402_FACILITATOR_KEY` 設定
- 測試環境用 `.testnet_payer.json` / `.testnet_facilitator.json`（gitignored）

### 5.3 Audit Trail

每筆 `ledger_sales` 記錄包含：
- `tx_hash`：鏈上可查證
- `attestation`：JSON，含 seller_id、pay_to、amount、nonce
- `created_at`：ISO 時間戳

---

## 6. Operational Considerations

### 6.1 Why Cloudflare Paid Plan

系統核心依賴 **Durable Objects** 做支付鎖。免費版限制：

- 每個 Worker 最多 **1 個 DO instance**（不夠用於 nonce 鎖）
- 部署時易撞 Error 10021 (unavailable object class)

付費版 $5/月無此限制。**這是底座，不能省**。

### 6.2 Scale Limits

| 指標 | 預估 |
|---|---|
| QPS / Worker | ~1000 (免費版限制) |
| D1 儲存 | 10 GB / Worker（免費版） |
| x402 交易 / 月 | 100k+ |
| Cost @ 10k txn/月 | ~$5 (Paid Plan 本身) |

### 6.3 Failure Modes

| 故障 | 影響 | 恢復 |
|---|---|---|
| CDP 服務器 down | x402 支付失敗 | circuit breaker 切 selfhosted |
| D1 寫失敗 | 該筆交易回滾 | 買家收到 5xx，重試 |
| DO 鎖超時 | nonce 釋放，可重試 | 買家重試（同 nonce 會被拒） |
| Facilitator 私鑰泄露 | 可惡意轉賬 | 立即 rotate，歷史交易已上鏈無法回滾 |

---

## 7. Roadmap

| 版本 | 內容 |
|---|---|
| v1.0 (now) | 測試網跑通、8 個 REST endpoint、agent-index |
| v1.1 | CDP 主網接入、真實 USDC 交易 |
| v1.2 | Python / TS SDK、dashboard UI |
| v2.0 | Multi-chain、subscription、VTS (Verified Trade Signature) |

---

## 8. Reference

- **x402 協議規範**：https://x402.org/
- **Base Sepolia 網絡**：chain id 84532
- **USDC on Base**：0x50c57259D99Fb0d20b00F2AaaD01FAeB935B3aF4 (mainnet) / 0x036CbD53842c5426634e7929541eC2318f3dCF7e (sepolia)
- **ERC-7579 TransferAuthorization**：https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7579.md
- **Cloudflare Durable Objects**：https://developers.cloudflare.com/durable-objects/
