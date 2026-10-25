# 上線檢查清單

使用前複製本文件，勾選每項後再上線。

## ☐ Phase 1：項目骨架

- ☐ GitHub repo 已建立並 push 初始 commit
- ☐ GitHub Pages 已啟用（Source = GitHub Actions）
- ☐ `.gitignore` 已排除所有密鑰檔案
- ☐ `wrangler.toml` 佔位符已替換（見 placeholder-replacements.md）
- ☐ `npm install` 通過
- ☐ `npm run check` 通過（無型別錯誤）

## ☐ Phase 2：密碼學 + Publisher

- ☐ Ed25519 密鑰對已產生（`npm run gen-keypair`）
- ☐ PRIVATE_HEX 已複製到 1Password / Keychain
- ☐ PUBLIC_HEX 已放入 GitHub Actions Secret `VERIFIER_PUBLIC_KEY_HEX`
- ☐ `public/.well-known/jwks.json` 已更新為真實公鑰
- ☐ 真實 verifier 輸出已取代 `fixtures/sample-verifier-output.json`
- ☐ `excerpt_sha256_hex` 已由 verifier 真實計算（不是佔位 hex）
- ☐ `npm run test:unit` 通過（期望 78/78）

## ☐ Phase 3：Worker + Sync

- ☐ Cloudflare KV namespace 已建立，id 已填入 wrangler.toml
- ☐ Cloudflare D1 database 已建立，id 已填入 wrangler.toml
- ☐ `wrangler d1 execute --remote --file=schema/d1.sql` 已執行
- ☐ 所有 wrangler secrets 已設定：
  - ☐ PAY_TO
  - ☐ FACILITATOR_URL（Phase 2 才需要真實值）
  - ☐ CDP_API_KEY（Phase 2）
  - ☐ CDP_PRIVATE_KEY（Phase 2）
  - ☐ VERIFIER_SIGNER_PRIVATE_KEY
  - ☐ SYNC_SIGNING_KEY
- ☐ MOCK_FACILITATOR 已設為 "1"（僅本地）或 "0"（上線）
- ☐ Cron triggers 已啟用（wrangler.toml）
- ☐ GitHub Actions Secrets 已設定：
  - ☐ VERIFIER_PUBLIC_KEY_HEX
  - ☐ SYNC_SIGNING_KEY
  - ☐ BAZAAR_API_KEY（Phase 2）
  - ☐ AGENT402_API_KEY（Phase 2）
  - ☐ MCP_SO_API_KEY（Phase 2）
- ☐ `npm run test:sync` 通過（期望 12/12）

## ☐ Phase 4：測試

- ☐ `npm run test:unit` 通過
- ☐ `npm run test:sync` 通過
- ☐ `npm run test:agent`（mock 模式）通過（期望 25/25）
- ☐ wrangler dev 已本地運行（可選）
- ☐ `npm run test:agent -- --base http://localhost:8787` 通過（可選）
- ☐ 至少一個真實內容包通過 build-verification
- ☐ Verification 已簽名並寫入 KV（若走真實環境）

## ☐ Phase 5：文件與部署

- ☐ README.md 完整（架構、快速開始、授權）
- ☐ docs/deployment.md 已閱讀並確認步驟可行
- ☐ docs/placeholder-replacements.md 所有佔位符已替換
- ☐ docs/risk-report.md 已閱讀
- ☐ docs/v2-backlog.md 已閱讀（明確 v1 不做的範圍）
- ☐ 上線日期已排定
- ☐ 事故應變連絡人已知會

## ☐ 上線前最終檢查

- ☐ `MOCK_FACILITATOR` 已設為 "0"（真實模式）
- ☐ `PAY_TO` 是真實收款地址（不是 0xPLACEHOLDER）
- ☐ `ASSET_USDC` 是 base-sepolia 或 mainnet 的真實 USDC 地址
- ☐ `OWNSTIE_BASE` 是真實域名
- ☐ `FACILITATOR_URL` 是真實 CDP URL
- ☐ `.well-known/agent.json` 的 `extensions.ownsite_verification` 所有 URL 已替換
- ☐ `/healthz` 端點可訪問並返回 `ok: true`
- ☐ `/internal/sync` 首次同步成功（KV 已寫入 wellknown:* keys）
- ☐ `/verify/{pkg}` 可返回真實 verification.json
- ☐ `/buy/{pkg}` 無 X-PAYMENT 返回 402
- ☐ `/mcp` POST initialize 返回 instructions

## ☐ 上線後 24 小時監控

- ☐ Cloudflare dashboard 檢視 Worker 錯誤率
- ☐ D1 payments 表有結算記錄
- ☐ GitHub Actions 三個 workflow 都通過
- ☐ sync-queue 已清空
- ☐ 收到 Agent 的 verify 請求（可通過 Cloudflare dashboard 的 request logs 觀察）
- ☐ 若收到 payment 失敗：立即檢查 FACILITATOR_URL 與 CDP_API_KEY

## ☐ v1.5–v1.16 新增功能檢查（已實作）

### v1.5 — TTL / Refetch / Recover
- ☐ D1 `packages` 表已建立（`wrangler d1 execute --remote --file=schema/d1.sql`）
- ☐ `refetch_events` 表已建立
- ☐ 首次部署後執行 `scripts/backfill-packages.ts` 填充 packages 表
- ☐ `/recover/{id}` endpoint 可返回 replacement
- ☐ `REFETCH_SAMPLE_RATE` 已設定（預設 0.20）
- ☐ `REFETCH_CONSECUTIVE_FAILS` 已設定（預設 2）

### v1.6 — Dashboard
- ☐ `/dashboard.json` endpoint 返回 200
- ☐ `public/dashboard.html` 可訪問
- ☐ `cron-dashboard` 每日 00:30 UTC 執行

### v1.7 — Marketplace Adapters
- ☐ 4 個 adapter 已實作（Bazaar/Agent402/MCP.so/DataPoint）
- ☐ `marketplace_listings` 表已建立
- ☐ 市集 API key 已設定（Phase 2）

### v1.8 — Reverify
- ☐ `reverify_leases` / `reverify_attempts` 表已建立
- ☐ `VERIFIER_ENDPOINT` secret 已設定
- ☐ `REVERIFY_SECRET` secret 已設定
- ☐ `/reverify/{id}` endpoint 可接收 push

### v1.9 — Settle Records
- ☐ `settle_attempts` / `settle_hourly` / `settle_daily` 表已建立
- ☐ 結算記錄正確寫入 settle_attempts

### v1.10 + v1.11 — Agent-Index Dynamic + Pagination
- ☐ `packages` 表有完整資料（v1.5 backfill 後）
- ☐ `/.well-known/agent-index.json?page=1&limit=50` 返回分頁結果
- ☐ ETag / If-None-Match 返回 304
- ☐ `CURSOR_SECRET` secret 已設定（v1.11 cursor 簽名）
- ☐ 執行 `scripts/backfill-index-fields.ts` 填充 source_diversity

### v1.12 — Facilitator Router
- ☐ `routeAndSettle` 已替換 buy.ts 的硬編碼
- ☐ CDP 與 selfhosted 雙 facilitator 可切換
- ☐ `FACILITATOR_PRIMARY` 已設定（cdp 或 selfhosted）
- ☐ `CircuitBreakerDO` 已綁定（Paid Plan 必須）

### v1.13 — Cursor
- ☐ `cursor_audit` 表已建立
- ☐ cursor 簽名/解碼測試通過（`scripts/test-cursor.ts`）

### v1.14 — Durable Objects
- ☐ `NONCE_LOCK` / `QUOTA` / `CIRCUIT` DO binding 已設定
- ☐ Cloudflare Paid Plan（DO 需要）
- ☐ DO 降級邏輯正常（無 binding 時不阻斷請求）

### v1.15 — Held Timeout + Unrecall
- ☐ `held_since` / `held_days` 欄位已加入 packages 表
- ☐ `POST /internal/unrecall/{id}` 可用
- ☐ `HELD_MAX_DAYS` 已設定（預設 14）

### v1.16 — Segmented Latency + Fallback Rate
- ☐ Dashboard 顯示 P50/P95/P99 延遲
- ☐ `fallback_rate` 指標已計算

### Base Sepolia ChainId（v1.5+ 修正）
- ☐ `NETWORK = "eip155:84532"`（Base Sepolia）
- ☐ `ASSET_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"`
- ☐ Phase 2 上線時改為 `eip155:8453` + `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## ☐ 回滾條件

若出現以下任一情況，立即回滾：
- ☐ 結算成功率 < 95%（24 小時內）
- ☐ 收到 tx replay 數量異常飆升
- ☐ verification 簽名驗證失敗 > 0 次
- ☐ 收到 legal_hold 通知（版權投訴）
- ☐ Agent 掃描速率異常（> 1000 req/hour）

回滾命令：
```bash
npx wrangler deployments list
npx wrangler deployments rollback <id>
```
