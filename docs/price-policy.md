# 定價策略（Pricing Policy）— 決策記錄

- 日期: 2026-10-23
- 狀態: **LOCKED**（決策人: Jerry）
- 邊界: 實作 = my-agent（業務代碼 + D1 v3 遷移）；審計 + 驗證 = Hermes；`secret put` / `deploy` / 上鏈 = 人工 stop-line。

## 1. 價格分層

| 類型 | 單價 (micro-USDC/次) | USDC 展示 |
|---|---|---|
| 默認 agent call | `900` | `0.0009 USDC` |
| 高價值 endpoint（report / 人工審核 / 高價值數據包） | `1000000` | `1.00 USDC` |
| 新 agent 試用 | 首 100 次免費（`0`）或促銷 `100` | `0` / `0.0001 USDC` |

> 原則：**0.0009 係流量價，1.00 係價值價**。0.0009 唔做「二選一」；先上 0.0009 做默認，用 `settle_hourly/daily` 批量收錢。

## 2. 表示約定（已核實 `schema/d1.sql`）

- `payments.amount_usdc` = **TEXT**，6 位小數 base units（comment: `"500000" = $0.50`）→ **已係 micro-USDC 整數表示**。
- `marketplace_listings.price_usdc` = **TEXT**，nullable（第 127 行）。
- `settle_attempts.amount_usdc` / `settle_hourly.total_amount_usdc` / `settle_daily.total_amount_usdc` = TEXT，同一 convention。

**結論：唔使新加 `price_micro_usdc` 欄。** 實際改動 = 設 default + 加最低結算門檻 + 離線 ledger。

## 3. 數字快查（micro-USDC）

- `0.0009 USDC` = **900**
- `0.0001 USDC` = **100**
- `1.00 USDC` = **1,000,000**
- `5.00 USDC` = **5,000,000**

## 4. my-agent 要實作嘅改動

1. **默認 listing 價**：建 agent 默認 listing 時 `marketplace_listings.price_usdc = '900'`（app-layer default，避免 SQLite 加 NOT NULL DEFAULT 嘅遷移風險；高價值 listing 用 `'1000000'`）。
2. **最低結算門檻**：新 config `MIN_SETTLE_MICRO_USDC = 1000000`（1 USDC；可調 `5000000` = 5 USDC）。放 Worker `[vars]`（非 secret）或 D1 config 行。
3. **離線 ledger 累計**：新增 D1 表（v3 遷移）：
   ```sql
   CREATE TABLE IF NOT EXISTS settle_ledger (
     payer TEXT PRIMARY KEY,
     pending_micro_usdc TEXT NOT NULL DEFAULT '0',
     pending_count INTEGER NOT NULL DEFAULT 0,
     updated_at TEXT NOT NULL DEFAULT (datetime('now'))
   );
   ```
   - x402 支付 handler 唔逐筆上鏈：記 `payments(status='pending_settle')` + 加到 `settle_ledger.pending_micro_usdc`。
4. **淨額上鏈**：settle cron（現有 `45 * * * *` hourly）改邏輯：per-payer `pending_micro_usdc ≥ MIN_SETTLE_MICRO_USDC` 先觸發 facilitator 淨額 settle（一次上鏈，`facilitator_hourly/daily` 記 net），其餘繼續 pend。
5. **新 agent 試用**：用 `settle_ledger.pending_count` 判斷，前 100 次 `0` 或促銷 `100`。
6. **UI 顯示**：顯示 `0.0009 USDC`，label 標明「按累計結算（≥$1 上鏈）」。

## 5. 落 Step 3 前前置條件

- 先完成 key → 1Password → `npx wrangler secret put VERIFIER_SIGNER_PRIVATE_KEY`。
- Step 3 若要先填一個數上線，填 **`0.0009`**（=`900` micro-USDC）。
