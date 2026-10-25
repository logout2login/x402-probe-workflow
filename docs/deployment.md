# ownsite-aeo — 部署手冊

## 一、系統架構

```
┌─────────────────────────────────────────────────────────────────┐
│  SSOT (唯一可信源)                                              │
│  GitHub Pages: public/.well-known/*                             │
│  ├─ agent.json        (Agent Card)                              │
│  ├─ agent-index.json  (Listed + Featured 包清單)               │
│  ├─ jwks.json         (Ed25519 公鑰)                           │
│  └─ verification-spec.json                                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓ (cron sync 到 KV)
┌─────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker (ownsite-aeo)                                │
│  ├─ KV: verification / status / rate-limit buckets / tx replay  │
│  ├─ D1: payments / sync_queue / recall_log / kpi_snapshot       │
│  └─ Cron: sync_queue + stale/recall 檢查                        │
└─────────────────────────────────────────────────────────────────┘
        ↓                    ↓                    ↓
   Agent (MCP/HTTP)    Marketplace           Publisher
                     (Bazaar/Agent402/       (build → verify →
                      MCP.so/DataPoint)       sync → deploy)
```

## 二、環境需求

- **Node.js ≥ 20**（本專案已測試 Node 24）
- **npm ≥ 11**
- **GitHub 帳號**（免費 plan 即可）
- **Cloudflare 帳號**（免費 plan 可跑；Durable Objects 建議 Pro）
- **Coinbase Developer Platform (CDP)** 帳號（Phase 2 起需要）
- **base-sepolia 測試代幣**（Phase 2 起需要；faucet: https://faucet.circle.com）

## 三、Step 1：建立 GitHub repo

1. 到 GitHub 建立新 repo（例如 `logout2login/ownsite-aeo`）。
2. `git clone` 後 cd 進入，`git add . && git commit -m "chore: initial scaffold" && git push`。
3. 在 repo Settings → Pages → Source 選擇 **GitHub Actions**。
4. Settings → Secrets and variables → Actions，添加 Secrets：
   - `VERIFIER_PUBLIC_KEY_HEX`（Phase 2 產生後填；先留空）
   - `SYNC_SIGNING_KEY`（可用 `openssl rand -hex 32` 生成）

## 四、Step 2：本地開發環境

```bash
# 1. 安裝依賴
npm install

# 2. 產生 Ed25519 密鑰對（一次性）
npm run gen-keypair
# 輸出：
#   PRIVATE_HEX = a8c66...   ← 複製到 1Password / Keychain
#   PUBLIC_HEX  = cfc79...   ← 之後放入 GitHub Actions Secret
#   JWKS_BASE64URL = z8eVd...

# 3. 設定本地環境變量（Windows PowerShell 範例）
$env:VERIFIER_PRIVATE_KEY_HEX = "<64-hex>"
$env:OWNSTIE_BASE = "https://ownsite.example.com"

# 4. 產生 verification.json
npm run publish-package

# 5. 檢查產物
cat build-output/*.json    # signed verification
cat public/.well-known/agent-index.json
```

## 五、Step 3：Cloudflare 資源建立

```bash
# 1. 建立 KV namespace
npx wrangler kv namespace create KV
# 輸出 example: "Created KV namespace with id: abcd1234..."
# 把 id 複製到 wrangler.toml 的 [[kv_namespaces]] id 欄位

# 2. 建立 D1 database
npx wrangler d1 create ownsite-aeo
# 輸出 database_id；複製到 wrangler.toml

# 3. 部署 D1 schema（Phase 4 完成後可執行）
npx wrangler d1 execute ownsite-aeo --remote --file=schema/d1.sql

# 4. 設定 wrangler secrets（絕不入 wrangler.toml vars）
npx wrangler secret set PAY_TO --binding=PAY_TO
npx wrangler secret set FACILITATOR_URL --binding=FACILITATOR_URL
npx wrangler secret set CDP_API_KEY --binding=CDP_API_KEY
npx wrangler secret set CDP_PRIVATE_KEY --binding=CDP_PRIVATE_KEY
npx wrangler secret set VERIFIER_SIGNER_PRIVATE_KEY --binding=VERIFIER_SIGNER_PRIVATE_KEY
npx wrangler secret set SYNC_SIGNING_KEY --binding=SYNC_SIGNING_KEY
```

**注意**：`MOCK_FACILITATOR=1` 保留在 wrangler.toml，僅本地/開發環境使用。**上線前必須移除或改為 "0"**。

## 六、Step 4：本地測試

```bash
# 1. 啟動 wrangler dev（本地 Worker 模擬）
npx wrangler dev --ip 127.0.0.1 --port 8787

# 2. 另一 terminal，執行單元測試
npm run test:unit        # 期望 78/78 pass
npm run test:sync        # 期望 12/12 pass
npm run test:agent       # 期望 25/25 pass (mock 模式)

# 3. 真實模式 test-agent（需要 wrangler dev 運行）
npx tsx scripts/test-agent.ts --base http://localhost:8787
```

## 七、Step 5：部署 Worker

```bash
# 1. 確認 wrangler.toml 佔位符已替換（見 docs/placeholder-replacements.md）
# 2. 確認所有 wrangler secrets 已設定（見上文 Step 3.4）
# 3. 部署
npx wrangler deploy
```

部署後：
- Worker 端點：`https://<subdomain>.<account>.workers.dev` 或自訂域名
- 更新 wrangler.toml 的 `OWNSTIE_BASE` 為實際域名
- 重新部署

## 八、Step 6：GitHub Pages 部署

推送 commit 到 main 後，pages-deploy.yml 會自動執行：
1. `npm run publish-static` 重新生成 `.well-known/*`
2. 上傳 `public/` 到 GitHub Pages
3. 部署後 URL：`https://<username>.github.io/<repo>/`

若使用自訂域名，需在 repo Settings → Pages → Custom domain 設定。

## 九、Step 7：同步 KV 副本

CI 每 30 分鐘觸發 sync-manifest.yml；也可手動觸發：

```bash
curl -X POST https://<worker-url>/internal/sync \
  -H "x-sync-key: $SYNC_SIGNING_KEY" \
  -H "content-type: application/json" \
  -d '{"files": [
    {"path": "/.well-known/agent.json", "content": '"$(cat public/.well-known/agent.json | jq -c .)"'"},
    {"path": "/.well-known/agent-index.json", "content": '"$(cat public/.well-known/agent-index.json | jq -c .)"'"},
    {"path": "/.well-known/jwks.json", "content": '"$(cat public/.well-known/jwks.json | jq -c .)"'"},
    {"path": "/.well-known/verification-spec.json", "content": '"$(cat public/.well-known/verification-spec.json | jq -c .)"'"}
  ]}'
```

## 十、Step 8：真實 x402 測試（Phase 2 起）

1. 準備 base-sepolia 錢包（例如 MetaMask）：
   - 建立新錢包，記下私鑰（**絕不入庫**）
   - 從 https://faucet.circle.com 領取測試 USDC 到付款錢包
2. 從 https://portal.cdp.coinbase.com/ 申請 x402 facilitator：
   - 選擇 Base Sepolia 網絡
   - 設定 `PAY_TO` 為收款錢包地址
   - 取得 CDP API key 與 merchant 私鑰
3. 更新 wrangler secrets：
   ```bash
   npx wrangler secret set PAY_TO          # 收款地址
   npx wrangler secret set FACILITATOR_URL # https://api.cdp.coinbase.com/platform/v2/x402
   npx wrangler secret set CDP_API_KEY
   npx wrangler secret set CDP_PRIVATE_KEY
   ```
4. 移除 wrangler.toml 的 `MOCK_FACILITATOR = "1"` 或改為 `"0"`
5. 重新部署 Worker
6. 測試：
   ```bash
   curl -X GET https://<worker>/buy/<package_id> \
     -H "user-agent: test" \
     # 無 x-payment → 期望 402
   ```
7. 真實購買（需要用 EIP-3009 transferWithAuthorization 簽名，非本專案範圍；Phase 2 補充）

## 十一、Step 9：市集上架（Phase 2 起）

在 `scripts/sync-queue.ts` 中填入真實 endpoints：

```typescript
const targets: ManifestTarget[] = [
  { id: "bazaar", endpoint: "https://bazaar.coinbase.com/api/listings" },
  { id: "agent402", endpoint: "https://agent402.io/api/sell" },
  { id: "mcp_so", endpoint: "https://mcp.so/api/listings" },
  { id: "datapoint", endpoint: "https://datapoint.market/api/subsets" },
];
```

設定 GitHub Actions Secrets：
- `BAZAAR_API_KEY`
- `AGENT402_API_KEY`
- `MCP_SO_API_KEY`

## 十二、故障排除

### 12.1 `npx wrangler dev` 啟動失敗
- 檢查 `wrangler.toml` 佔位符是否已替換
- 檢查 KV/D1 id 是否正確
- 執行 `npx wrangler whoami` 確認已登入 Cloudflare

### 12.2 test-agent Step 5 驗簽失敗
- 確認 `jwks.json` 的 `x` 欄位與生成 verification 時使用的公鑰一致
- 若 `npm run gen-keypair` 後修改過 jwks.json，重新執行 `npm run publish-package`
- 確認 `canonicalize` 對 signed fields 的排序一致

### 12.3 test-agent Step 7 返回非 402
- 確認 `payTo` 已設定（wrangler secret）
- 確認 `ASSET_USDC` 是真實地址（0x8335...）
- 檢查是否誤設 `MOCK_FACILITATOR=1`（402 challenge 不受影響，但 payment 會通過）

### 12.4 402 payment 失敗
- 確認 payment header 格式（base64 encoded JSON）
- 確認 network = `eip155:8453`
- 確認 facilitator URL 與 CDP_API_KEY 正確
- MOCK 模式下任何 txHash 都被接受；真實模式下需符合 EIP-3009

### 12.5 Cron 未觸發
- 檢查 wrangler.toml 的 `[triggers] crons` 配置
- 到 Cloudflare dashboard 查看 Worker 的 cron 執行記錄
- 手動觸發：`curl -H "cf-scheduled: true" https://<worker>/`

### 12.6 Evidence refetch hash 不匹配
- 這是 v1.2 候選補完項目；span 抽取尚未實作
- 檢查 verifier 輸出的 `excerpt_sha256_hex` 是否對應 `source_url` 上的 `span` 區域
- Agent 端需要實現 HTML 抽取 + sha256

## 十三、監控與日誌

- **Cloudflare Workers Logs**：30 天滾動（免費 plan 有 100k invocations/month 限制）
- **D1 資料表**：payments / sync_queue / recall_log / kpi_snapshot
- **GitHub Actions Logs**：CI 執行記錄

**KPI 指標**（對照計劃書 §8）：
- 發現：`agent-index.json` 日 GET 次數
- 篩選：`/verify` 調用 / index GET 比率
- 轉化：`/buy` 成功結算 / verify 調用比率
- 留存：同一 pseudonym 30 日內再次購買率
- 收入：日 USDC 結算總額

在 `schema/d1.sql` 的 `kpi_snapshot` 表可定期匯出。

## 十四、撤銷與回滾

### 14.1 撤銷一個 package（recall）
1. 在 KV 設定 `status:{package_id}` = `recalled`
2. 若已有 replacement，設定 `replacement:{package_id}` = 新 package_id
3. 從 `agent-index.json` 移除該 package（更新 SSOT + 重新部署）
4. 記錄到 `recall_log` 表（`decided_by` = `publish-guard-cron`）

### 14.2 回滾 Worker 部署
```bash
npx wrangler deployments list     # 查看歷史部署
npx wrangler deployments rollback <id>
```

### 14.3 Key rotation（JWKS）
1. 產生新密鑰對：`npm run gen-keypair`
2. 更新 `public/.well-known/jwks.json` 的 `x` 欄位（v1 只支持單 key；v2 加多 key + kid）
3. 重新簽名所有 verification.json
4. 部署新 jwks.json
5. 通知 Agent 更新（通過 agent.json version 號）
