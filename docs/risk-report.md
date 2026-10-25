# 風險清單與緩解措施

對照計劃書 v1.0-v1.4 §9 風險清單，逐條核對本專案 v1 實作狀態。

## 1. Verifier 被投毒 / 誤判

**風險**：Verifier 對資料內容給出錯誤的 q 分數（例如 0.95 給明顯錯誤的數據包），Agent 依賴 verification.json 而購買了有問題的內容。

**緩解（v1 已實作）**：
- 所有 verification.json 都由 Ed25519 簽名；Agent 可通過 JWKS 離線驗簽。
- Agent 可 refetch evidence `source_url` 並比對 `excerpt_hash`（v1.2 待補 span 抽取）。
- `hallucination_boundary` 明確「Evidence excerpts are verifier-validated at verified_at. Downstream interpretation is caller responsibility.」

**v2 計畫**：
- 多個 verifier（不同 kid in JWKS，Agent 端加權平均 q）
- Agent 端投票式信任

## 2. 支付與取包不一致

**風險**：Agent 支付成功但 Worker 沒有返回資料，或返回錯誤資料。

**緩解（v1 已實作）**：
- Worker 端 `handleBuy` 檢查 `getVerification(id)` 與 `getData(id)`，兩者皆為 null 則返回 500 `internal_inconsistency`。
- 支付記錄（D1 payments 表）+ 內容快照（KV verification + data）都記錄。
- Receipt 包含 `tx_hash` 供 Agent 存檔追溯。

**v2 計畫**：
- 異動通知（Agent 可 webhook 訂閱 recall 事件）
- 交易對帳 cron

## 3. 複用同 tx_hash（重放攻擊）

**風險**：攻擊者截獲一次成功的 X-PAYMENT header，重放以獲取多次資料。

**緩解（v1 已實作）**：
- `KV.put("tx:{tx_hash}", "1", { expirationTtl: 30 * 24 * 3600 })` — 30 天窗口
- 重放時返回 403 `tx_replay`
- 支付記錄 D1 UNIQUE 約束：`tx_hash UNIQUE` 雙重保險

**限制**：
- KV TTL 30 天後過期；若超過 30 天重放，會繞過 KV 檢查。但 D1 記錄永久存在，可從資料庫層面查詢。

**v2 計畫**：
- 支付歷史永久記錄（D1 已實現）
- 跨包 tx_hash 去重（同一 tx_hash 不能用於兩個 package）

## 4. 支付結算未成功但 Worker 誤判

**風險**：facilitator 返回錯誤的 `isValid: true`，或網路抖動導致假結算。

**緩解（v1 已實作）**：
- `MOCK_FACILITATOR=1` 明確標註「上線必須移除」
- 真實模式下 `settleViaFacilitator` 檢查 `body.isValid === true`，否則返回 403
- 上線前必須先跑 base-sepolia 真實測試

**v2 計畫**：
- Facilitator 返回 `settlementTxHash` 後額外查詢鏈上狀態確認
- 交易對帳 cron

## 5. KV TTL / Durable Object 併發

**風險**：高並發下 KV 計數非原子，可能短暫超限。

**緩解（v1 已實作）**：
- Rate limit 使用 KV 近似計數；上限為 60/min/IP（verify）與 10/hour/agent（preview）
- 高併發時短暫超限在 v1 可接受

**v2 計畫**：
- 換用 Durable Object 做精確計數
- 或使用 Cloudflare Rate Limiting Rules

## 6. 支付資料洩露（pseudonym 撞庫）

**風險**：如果只用 payer address 直接當 key，可能被外部推斷身份。

**緩解（v1 已實作）**：
- 只存 `SHA-256(payer.toLowerCase())` 前 32 hex 為 `psn_xxxxx`
- 不存原始 payer address
- 支付記錄可追溯（有 tx_hash 對照鏈上）

**v2 計畫**：
- Agent 主動生成 pseudonym（不依賴 payer address）
- 支持 agent_id 自定義標識

## 7. 市集同步失敗

**風險**：Bazaar / Agent402 / MCP.so / DataPoint 同步失敗，Agent 可能無法從這些市集發現內容。

**緩解（v1 已實作）**：
- `sync_queue` 記錄所有推送嘗試
- 至少重試 3 次後標記 `failed`
- 失敗**不阻斷** ownsite 售賣（硬性約束）
- Cron 每 15 分鐘掃一次 sync_queue

**v2 計畫**：
- 失敗通知（email / webhook）
- 市集健康度監控

## 8. 內容 recall 流程

**風險**：verifier 重新評分後，原 verification 已過期或 evidence refetch hash 不匹配。

**緩解（v1 已實作）**：
- Cron 每小時檢查 `expires_at`，過期即標記 `stale`
- `/status/{id}` 返回 `fresh` / `stale` / `recalled`
- `/buy/{id}` 遇到 `stale` / `recalled` 返回 410 + `replacement_package_id`
- `recall_log` 記錄所有召回事件

**限制**：
- v1 不主動偵測 refetch hash 不匹配；只在 verifier 手動觸發重評後回寫 `expires_at` 才生效。

**v2 計畫**：
- 定期 refetch 檢查（每 24 小時抽查 10% 包）
- recall_q_threshold = 0.68 觸發自動重評

## 9. 版權 / 內容合規（legal_hold）

**風險**：data 內容涉及版權或受管制資訊，收到投訴後必須立即下架。

**緩解（v1 已實作）**：
- 一鍵下架流程：
  1. KV 設定 `status:{id} = recalled`
  2. 從 `agent-index.json` 移除該 package
  3. 部署新 index
  4. 記錄到 `recall_log`
- `/buy` 遇到 recalled 返回 410，不再售賣

**v2 計畫**：
- DMCA legal_hold 表與通知流程
- 異動通知 webhooks

## 10. Evidence refetch span 抽取

**風險**：Agent 想獨立驗證 evidence 但 span 語法（`para 4-7`）沒有標準，Agent 端需自實現。

**緩解（v1 未實作）**：
- v1 只驗證簽名，不 refetch source_url
- `excerpt_hash` 只是 verifier 內部計算的摘要，Agent 端無法驗證

**v1.2 候選補完**：
- 定義 span 語法：`para N-M`（第 N-M 段）、`heading "..."`、`table N rows M-K`
- 提供 Agent 端 span extractor 函式庫

## 11. Prompt Injection via Agent-facing text

**風險**：verification.json 中的 `description` 或 `hallucination_boundary` 字串被攻擊者注入指令（如 `ignore previous`）。

**緩解（v1 已實作）**：
- `REJECT_PATTERNS` 6 個正則捕獲常見 injection token
- `aeoGate` 在 `description` 與 `hallucination_boundary` 兩欄執行 pattern filter
- 拒絕的 pattern：
  - `ignore\s+previous`（不區分大小寫）
  - `system\s*:`
  - `instruction\s*:`
  - `<|`
  - 長度 ≥ 80 的 base64 字串
  - 長度 ≥ 64 的 0x-hex 字串

**限制**：
- Pattern filter 是啟發式的，不能捕捉所有 injection 手法
- 未實作結構化 schema（例如 description 只能是白名單字詞組合）

**v2 計畫**：
- 結構化 output schema（description 只能是枚舉字詞組合）
- Sanitizer 函式庫 + fuzz testing

## 12. 底層 verifier 被攻擊（Key rotation）

**風險**：Verifier 私鑰被洩露，攻擊者可偽造 verification.json。

**緩解（v1 已實作）**：
- JWKS 通過 GitHub Pages 公開；rotated 後 Agent 可即時更新
- Verification 有 `expires_at`；即使舊簽名存在也只會生效到 TTL

**限制**：
- v1 只有單個 key（`verifier-1`），rotation 需要所有 verification 重新簽名

**v2 計畫**：
- 多 key JWKS（`kid` 區分不同版本）
- Key rotation 不需重新簽名全部包（舊 key 保留 N 天）
- 使用 Ed25519 batch signing 加快 rotation 速度

## 13. 支付資損（settle 失敗不返貨）

**風險**：CDP facilitator 結算失敗，Agent 已付款但未收到資料。

**緩解（v1 已實作）**：
- `handleBuy` 順序：先 `settle` → 再 `put tx:${txHash}` → 再 `INSERT payments` → 最後 return data
- 若 `settle` 失敗 → 立即返回 403，不寫入任何記錄，不收錢、不返貨
- 若 settle 成功但寫入失敗 → Agent 可憑 tx_hash 在 24 小時內聯繫 support

**限制**：
- 若 settle 成功但 Worker 在寫入前當機，Agent 付款但未收到資料；需人工補償

**v2 計畫**：
- 交易對帳 cron（對帳 CDP 與 D1 payments 表）
- Agent 端交易超時主動詢問狀態

## 14. 底層 verifier q 誤判

**風險**：verifier 對同一份資料給出不同 q（例如昨天 0.75，今天 0.95）。

**緩解（v1 已實作）**：
- `MAX_REGENERATE_PER_24H = 3` — 每個 package 24 小時內最多重簽 3 次
- 超過配額時 `aeoGate` 返回 blocked

**v2 計畫**：
- Q 分數歷史記錄（可追溯）
- Verifier 版本對齊（`verifier_version` 必須一致才接受）

## 15. 網路 / CDP facilitator 服務中斷

**風險**：CDP facilitator 服務下線，支付無法結算。

**緩解（v1 已實作）**：
- 若 facilitator 不可用，Worker 返回 403 `settlement_failed`
- 現有已成交資料不受影響（已寫入 KV 與 D1）
- Agent 可透過 `/verify` 免費重試

**v2 計畫**：
- 多重 facilitator failover
- Health check endpoint

## 16. Agent 掃描速率異常

**風險**：單個 IP 大量掃描 `/verify` 或 `/preview`，消耗資源。

**緩解（v1 已實作）**：
- Rate limit: verify 60/min/IP, preview 10/hour/agent
- SUSPECTED_SCRAPER_THRESHOLD_PER_HOUR = 200（未實作，Phase 2 補完）

**v2 計畫**：
- 自動封鎖超過閾值的 IP
- Cloudflare WAF 規則
