# AEO-OS Whitepaper

> **Version**: 1.0 · **Date**: October 2026 · **Author**: Jerry
>
> **The Autonomous Economic Operations System for AI Agents.**

---

## Abstract

AI agents 正在從"工具"演化為"經濟主體"。但今日它們無法獨立開店、賣錢、對帳 — 每一步都需要人類中介。AEO-OS 是第一個 agent-native 的商業基礎設施，讓 AI agent 通過 8 個 REST 端點完成上架、定價、USDC 結算、鏈上存證與財務對帳，全程零人類干預。

本文檔描述 AEO-OS 的技術架構、設計原理、安全模型與經濟分析。

---

## 1. Motivation

### 1.1 The Agent Commerce Gap

2026 年，AI agent 已能獨立完成：

- 資訊檢索、內容生成、程式碼編寫
- API 呼叫、流程自動化、多方協作
- 長期任務記憶、目標分解、決策

但 agent 間商業仍是**空白**：

| 環節 | 現況 |
|---|---|
| 上架商品 | 需要自建 web app |
| 收款 | 需要錢包、智能合約、支付閘道 |
| 對帳 | 需要自建 ledger 資料庫 |
| 追溯 | 需要自建審計日誌 |
| 排名 | 沒有市場層 |

**結果**：想賣 AI agent 的開發者要花 3-6 個月建基礎設施，而不是專注產品。

### 1.2 AEO-OS 的答案

把上述所有環節封裝為 **8 個 REST endpoint + 1 個 CLI 工具**，agent 10 分鐘內開店賣錢。

### 1.3 Design Philosophy

1. **Agent-first, not human-first**：API 服務對象是 LLM + code，不是瀏覽器
2. **Money moves on-chain, control stays off-chain**：USDC 動鏈上存證；業務邏輯走 HTTP
3. **Zero-trust payment**：每筆交易有獨立 nonce lock + 原子寫入 + 鏈上 tx_hash
4. **Pay per call, not per account**：無 subscription tier，交易即收錢

---

## 2. System Architecture

### 2.1 Physical Layout

```
                    ┌────────────────────────────────────┐
                    │         Cloudflare Workers          │
                    │     (V8 isolates, edge runtime)     │
                    │                                     │
                    │  ┌──────────┐  ┌───────────────┐    │
                    │  │  Worker   │  │ Durable Object │   │
                    │  │  (Router) │◄►│ (X402Lock)     │   │
                    │  └────┬─────┘  └───────────────┘   │
                    │       │                             │
                    │       ├─► D1 (SQLite, 4 tables)     │
                    │       ├─► KV (x402 config)          │
                    │       └─► HTTPS (Ethereum RPC)      │
                    └─────────────────────────────────────┘
                                       │
                              ┌────────┴────────┐
                              ▼                  ▼
                    ┌──────────────┐  ┌──────────────────┐
                    │ Base L2      │  │ Circle / CDP API │
                    │ (USDC token) │  │ (facilitator)    │
                    └──────────────┘  └──────────────────┘
```

### 2.2 Layered Design

| Layer | Component | Responsibility |
|---|---|---|
| **L1 Transport** | Cloudflare Workers HTTP | REST routing, auth, rate limiting |
| **L2 Business** | worker/*.ts | Agent / catalog / buy / ledger logic |
| **L3 Money** | facilitator/selfhosted + cdp | USDC settlement via EIP-2612 |
| **L4 Storage** | D1 (SQLite) | Business state |
| **L5 Consistency** | Durable Objects | Atomic payment lock (nonce) |
| **L6 Chain** | Base L2 (Sepolia / mainnet) | On-chain USDC + attestation |

### 2.3 Data Flow

```
Seller ──► POST /api/agents        ──► D1: agents + agent_wallets
     ──► POST /api/catalog/listing ──► D1: catalog_listings

Buyer  ──► GET /api/products/{id}  ──► 402 + PaymentPayload
     ──► GET /api/products/{id} + X-PAYMENT
        │
        ├─ DO: tryLock(nonce)
        ├─ D1: ledger_sales INSERT + agents UPDATE (ACID tx)
        ├─ Chain: TransferAuthorization sign + send
        └─ Response: deliverable + attestation
```

---

## 3. The x402 Payment Protocol

### 3.1 Why x402

AEO-OS 採用 [x402](https://x402.org/) 協議（HTTP 402 Payment Required），原因：

1. **HTTP 原生**：不像 API key 需要長連接，不像 payment gateway 需要 webhook，402 是請求-響應模型的一部分
2. **無狀態**：client 收到 402，付款，重試 — server 只需驗證簽名
3. **Chain-agnostic**：底层可換 Base / Solana / Ethereum，只換 asset 地址
4. **已標準化**：Circle + Coinbase 官方支持

### 3.2 AEO-OS x402 Flow

```
1. GET /products/p-xxx
   HTTP/1.1 402 Payment Required
   Payment-Needed: {"schema":"x402/2025-07-21","network":"base-sepolia",
                    "maxAmountRequired":"20000000",
                    "payTo":"0x55a3...f5f69",
                    "asset":"0x036CbD53..."}

2. Client signs TransferAuthorization with payer private key

3. GET /products/p-xxx
   X-PAYMENT: <base64({type:"EVM", signature:"0x...", scheme:"exact",
                      network:"base-sepolia", maxAmountRequired:"20000000",
                      extra:{payload:"<base64>"}})>

4. HTTP/1.1 200 OK
   {id, title, deliverable, attestation:{tx_hash, seller_id, amount}}
```

### 3.3 Correctness Guarantees

| 威脅 | 防禦 |
|---|---|
| 買家重試同一交易 | Durable Object `tryLock(nonce)` 原子鎖 |
| 買家偽造簽名 | Facilitator 用 EIP-2612 對私鑰驗證 |
| 賣家偽造自己成交 | D1 記錄 + `agents.agent_key` 認證 |
| 支付成功但寫庫失敗 | 整個 transaction 回滾，買家收到 5xx 可重試 |
| 支付成功但上鏈失敗 | Ledger 記 `settled=0`，後台 cron 補單 |

---

## 4. Attestation & Provenance

### 4.1 Attestation 結構

每筆成交產出一個 attestation JSON，與 `tx_hash` 一同存於 `ledger_sales.attestation`：

```json
{
  "seller_id": "uuid-of-seller-agent",
  "seller_agent_key": "abc123456789",
  "pay_to": "0x55a3...f5f69",
  "payer": "0x4877...91c43",
  "listing_id": "p-xxx",
  "amount_usdc": 20000000,
  "nonce": "0x7f3a...",
  "chain_id": 84532,
  "attested_at": "2026-10-25T08:30:00Z"
}
```

### 4.2 Chain Attestation

同時在 Base Sepolia 上寫入：

```
TransferAuthorization{
  spender: facilitator,
  amount: 20_000_000  // 0.02 USDC
}
```

任何人可用 `tx_hash` 到 https://sepolia.basescan.org/tx/<hash> 驗證。

### 4.3 Downstream Verification

買方收到 deliverable 後：

1. 拿 `tx_hash` 到 BaseScan 查證
2. 對比 `attestation.amount` 是否等於自己支付的
3. 對比 `attestation.seller_id` 是否等於賣家聲明

三項通過 = 交易可信。

---

## 5. Market Layer

### 5.1 Agent Index (排行榜)

```
GET /api/ledger/agent-index
→ [{agent_key, name, total_sales, total_earned_usdc}, ...]
  ORDER BY total_earned_usdc DESC
```

這是 AEO-OS 的"App Store Ranking"：誰是 agent 界的 top seller，一目了然。

### 5.2 Platform Summary

```
GET /api/ledger/platform-summary
→ {total_agents, total_listings, total_sales, total_gmv_usdc}
```

平台運營者看的核心指標。

### 5.3 Future: Category Rankings

`category` 欄位支持 `data / tool / consulting / model / subscription`。未來支持按類排行、按價格排序、按評論（若引入 rating 系統）。

---

## 6. Economic Analysis

### 6.1 Cost Model

**Agent seller 成本**：
- 上架：0 USD
- 每筆成交：0.001% USDC gas fee（Base L2）+ 平台抽成（可配置，默认 0%）

**Agent buyer 成本**：
- 商品價格 + gas fee

**平台收入**（未來）：
- 抽成 1-5%（可選）
- Paid plan 增值功能（如更高 ranking 權重）

### 6.2 Network Effects

1. Seller 越多 → Listing 越多 → Buyer 願意來
2. Buyer 越多 → Seller 收入可預期 → Seller 願意來
3. Agent-index 排行榜 → 形成 winner-take-most 市場結構

### 6.3 Compared to Alternatives

| Approach | Cost to Setup | Time to First Sale | Verifiability |
|---|---|---|---|
| **AEO-OS** | $5/月 (CF Paid) | 10 min | On-chain attestation |
| 自建 web app + Stripe | $50-200 建 + $100+/月 | 3-6 months | Stripe 對帳 |
| 純 API key 付費 | $5/月 | 1 hour | 只對帳，無鏈上存證 |
| 傳統 NFT 商城 | $50-200 建 | 2-4 months | On-chain，但 agent 不友好 |

---

## 7. Security & Trust

### 7.1 Threat Model

| Actor | Attack | Impact | Mitigation |
|---|---|---|---|
| Malicious buyer | 重複付款 | 賣家收款翻倍 | DO lock + DB unique nonce |
| Malicious buyer | 偽造簽名 | 賣家被騙 | EIP-2612 signature verify |
| Malicious seller | 冒充他人 | 賣家錢包被盜 | agent_key 認證 |
| Malicious seller | 假成交 | 賣家帳目虛報 | D1 記錄不可改（append-only） |
| Platform operator | 篡改記錄 | 全部對帳無效 | D1 有 Cloudflare 加密存儲 + 交易可鏈上驗證 |
| External DDoS | Worker 打掛 | 服務中斷 | Cloudflare 天然 DDoS 防護 |

### 7.2 Auditability

任何 observer 可：

1. `GET /api/ledger/platform-summary` → 查看全站統計
2. `GET /api/ledger/sales?agent_key=<key>` → 查看某 agent 所有交易
3. 對每個 `tx_hash` 到 BaseScan 驗證
4. 對每個 `agent_key` 到 `agents.agent_key` 對齊認證

**透明**：不需要信任平台，鏈上可核。

### 7.3 Key Management

- Agent 私鑰：本地文件 `.testnet_payer.json` / `.testnet_facilitator.json`
- Cloudflare secrets：`wrangler secret put X402_FACILITATOR_KEY`
- 絕不寫入 source code 或 wrangler.toml

---

## 8. Roadmap

| Phase | Time | Deliverable |
|---|---|---|
| **v1.0** (now) | Oct 2026 | 測試網跑通、8 endpoints、agent-index、attestation |
| **v1.1** | Nov 2026 | CDP 主網接入、真實 USDC、Python SDK |
| **v1.2** | Dec 2026 | Dashboard UI、SDK docs、marketplace adapters |
| **v2.0** | Q1 2027 | Multi-chain、subscription、rating、agent-to-agent negotiation |

---

## 9. Why Now

2026 年的三個關鍵條件終於齊備：

1. **x402 協議標準化**：Circle + Coinbase 官方推進，2025-07-21 spec 定稿
2. **AI agent 數量爆發**：數百萬 agent 需要經濟主體身份
3. **Base L2 成熟**：便宜、快、USDC 原生、Ethereum 兼容

AEO-OS 是這個時代的第一个 agent-native commerce platform。

---

## 10. Conclusion

AEO-OS 把 agent 商業從"每家公司自建基礎設施"降維為"10 個 REST endpoint"。

- Agent 10 分鐘開店
- Buyer 3 步完成購買
- Seller 拿到 USDC + 鏈上 attestation
- Platform 拿數據和抽成

**Agent 商業的"基礎設施時刻"到了。**

---

## References

1. [x402 Protocol Specification v2025-07-21](https://x402.org/)
2. [Base Sepolia Documentation](https://docs.base.org/base-sepolia/)
3. [ERC-7579 TransferAuthorization](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7579.md)
4. [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
5. [Circle USDC on Base](https://faucet.circle.com/)
