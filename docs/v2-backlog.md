# v2 推後功能清單

**v1 明確不做**：以下功能全部標記為 v2 候選，本專案代碼不實現。這樣做是為了保持 v1 範圍最簡，專注於「發現 → 驗證 → 購買 → 存檔 → 生命週期」最短路徑。

## 1. Quota 計量（用量計費）

**v1 決策**：不實作。每筆購買都是 pay-per-call，一次一單。

**v2 候選功能**：
- 購買包內含 quota（例如 $10 買 100 次）
- Agent 端 token 化（用 quota key 換 data，不需每次付 x402）
- 餘額查詢端點

## 2. Voucher 系統（代金券 / 折扣碼）

**v1 決策**：不實作。所有定價固定：listed $0.50、featured $1.00。

**v2 候選功能**：
- 首次購買優惠碼
- 合作夥伴折扣
- 定期活動定價

## 3. 訂閱（Subscription）

**v1 決策**：不實作。沒有月費、沒有訂閱。

**v2 候選功能**：
- 月費 $50 無限訪問所有 listed 包
- 訂閱者享有 refresh 權限（過期自動更新）
- 訂閱管理面板

## 4. Canary 版本（灰度發布）

**v1 決策**：不實作。所有變化直接上線。

**v2 候選功能**：
- 5% 流量測試新版驗證邏輯
- Feature flag（FeatureFlags.io 或自訂）

## 5. VTS（Verification Trust Score）

**v1 決策**：不實作。沒有第三方評分機構。

**v2 候選功能**：
- 多個 verifier 對同一包打分
- Agent 端加權平均 q
- Verifier 信任度隨時間累積

## 6. 多 Verifier（Multi-verifier）

**v1 決策**：不實作。只支持單個 verifier（`verifier-1`）。

**v2 候選功能**：
- JWKS 多 key（`kid` 區分不同 verifier）
- Agent 端驗證任一 key 都可接受
- 多 verifier 對同一包打分，取中位數

## 7. Evidence Refetch Span Extractor

**v1 決策**：不實作。Agent 端不 refetch evidence。

**v1.2 候選功能**（可視為 v1.1）：
- 定義 span 語法（para / heading / table rows）
- Agent 端 span extractor 函式庫
- 端到端 refetch 測試

## 8. Legal Hold / DMCA

**v1 決策**：不做法律流程。只實作 recall（技術下架）。

**v2 候選功能**：
- DMCA legal_hold 表與通知
- Legal contact 表
- 異動通知 webhooks

## 9. 異動通知（Webhooks）

**v1 決策**：不實作。Agent 需主動輪詢 `/status`。

**v2 候選功能**：
- Recall webhook（新回購包）
- Stale warning webhook（過期前 72h）
- Agent webhook registry（在 KV 記錄所有訂閱者）

## 10. 結構化 Output Schema（Sanitized Description）

**v1 決策**：不實作。只使用 REJECT_PATTERNS 啟發式過濾。

**v2 候選功能**：
- Description 只能是白名單字詞組合
- Structured fields（不允許自由文字）
- Sanitizer 函式庫 + fuzz testing

## 11. 精確 Rate Limit（Durable Object）

**v1 決策**：不實作。使用 KV 近似計數。

**v2 候選功能**：
- Durable Object 做精確計數
- Cloudflare Rate Limiting Rules
- 精確的 per-agent quota

## 12. 交易對帳

**v1 決策**：不實作。若結算成功但寫入失敗，需人工處理。

**v2 候選功能**：
- Cron 每小時對帳 CDP transactions vs D1 payments
- 差異自動補償
- 對帳報告

## 13. Marketplace API 真實接入

**v1 決策**：`scripts/sync-queue.ts` 有骨架，但不實作真實 API 調用。

**v2 候選功能**：
- Bazaar API（Coinbase）
- Agent402 API
- MCP.so API
- DataPoint API

## 14. Agent 端 Payment Header 生成

**v1 決策**：test-agent 使用 mock payment。真實 EIP-3009 transferWithAuthorization 簽名不在 v1 範圍。

**v2 候選功能**：
- TypeScript EIP-3009 signer 函式庫
- Agent 端 test payment flow
- Multi-network support（不僅 Base）

## 15. Dashboard 與 KPI 視覺化

**v1 決策**：不實作。只記錄數據到 D1。

**v2 候選功能**：
- Payments 日 KPI 圖表
- Conversion funnel（verify → buy）
- Marketplace reach 分析

## 16. Content Versioning（資料版本歷史）

**v1 決策**：不實作。data_hash 是唯一版本標識。

**v2 候選功能**：
- 資料版本歷史表
- Agent 可指定版本
- 增量更新通知

## 17. Batch Purchase

**v1 決策**：不實作。每次只能買一個包。

**v2 候選功能**：
- 一筆交易購買多個包
- 批量折扣
- 訂閱式批量更新

## 18. Refund 流程

**v1 決策**：不實作。若支付失敗由 facilitator 處理。

**v2 候選功能**：
- Agent 申請退款（24 小時內）
- 人工審核 + 自動退款
- 退款記錄（D1 refunds 表）

---

## 明確 v1 包含範圍（對照上表）

| 項目 | v1 狀態 |
|---|---|
| 發現（agent.json + agent-index） | ✅ |
| 離線驗簽（Ed25519 + JWKS） | ✅ |
| 支付（x402 pay-per-call） | ✅ |
| TTL / Stale / Recall | ✅ |
| Preview（免費限速） | ✅ |
| MCP Server（4 tools） | ✅ |
| SSOT + KV 副本同步 | ✅ |
| PublishGuard 分級 | ✅ |
| Rate limit（KV 近似） | ✅ |
| Marketplace sync 骨架 | ✅ 骨架 |
| Quota / Voucher / 訂閱 | ❌ v2 |
| Canary / VTS / 多 verifier | ❌ v2 |
| Legal hold / Webhooks | ❌ v2 |
| 精確 rate limit / 對帳 | ❌ v2 |
| 真實 marketplace API | ❌ v2 |
| Agent 端 EIP-3009 簽名 | ❌ v2 |

---

## P1 #2 審計發現（2026-10-26 Hermes Audit #2）

### 已修復
| 項目 | 狀態 |
|---|---|
| origin='demand' INSERT/UPDATE | ✅ demand-report.ts:221,227 |
| match_distribution_log INSERT | ✅ demand-report.ts:260（非致命 try/catch） |
| D1 schema migration v1.18c | ✅ demand_candidates_cache (single-row) |
| shadow workspace `nsite-aeo` | ✅ 已刪除 |
| DEMAND_ADMIN_SECRET rotation | ✅ 已旋轉，舊值 aeo-demand-admin-2024 撤銷 |
| candidates triad validation | ✅ 337/337 完整（representative_quote + source_canonical_url + created_at） |
| source breakdown derivation | ✅ 從 provenance.source_canonical_url 推導，非 top-level source |
| 分佈閘門 max<50% | ✅ moltchurch 48.1%（過閘） |
| ingestion provenance script | ✅ scripts/ingest_candidates.py |
| new-behaviour unit tests | ✅ test-unit.ts §9 (9a-9g) |

### 待處理（v2 backlog）
| 項目 | 原因 |
|---|---|
| admin endpoint merge-dedupe | 單 row 設計下 UNIQUE hash 無意義；其他腳本經 admin API 上載時重複會靜默入池。建議：admin POST 前先查 hash，若已存在則 REPLACE 或 merge，而非 INSERT 新 row |
| demand_candidates_cache dedupe at API level | 同上；需 merge logic + conflict resolution（如保留較新的 verified_at） |
| q-history query traceability | current q=0.81（非 0.76），0.76 來源未追溯（需保留 query log 或 changelog） |
| match_distribution_log retention policy | 有 INSERT 但無讀取邏輯（僅 gate-tuning feedback loop）；可加 SELECT FOR ANALYTICS 端點 |
| q formula 三候選 | current q=0.81 使用單一 formula，待決定：(a) 多 verifier 加權平均 (b) 最低分 (c) 中位數，需實驗對比 |
| never-fired audit check | 現無 cron 定期驗證所有 package 的 evidence 有效性；待實作 periodic reverify 任務 |
| excerpt_hash 持久化 | cron-refetch.ts 已支援 excerpt_hash 比較邏輯，但 D1 尚未寫入 excerpt_hash 列（需 schema migration + 現有包回填） |

