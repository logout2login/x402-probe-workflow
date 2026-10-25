# 佔位符替換表

上線前所有佔位符必須替換為真實值。若任一項未替換，Agent 無法完成端到端流程。

## wrangler.toml

| 佔位符 | 位置 | 替換為 | 來源 |
|---|---|---|---|
| `REPLACE_WITH_YOUR_DOMAIN` | `[vars] OWNSTIE_BASE` | `https://your-actual-domain.com` | 你選擇的域名 |
| `REPLACE_KV_NAMESPACE_ID` | `[[kv_namespaces]] id` | Cloudflare KV id | `npx wrangler kv namespace create KV` |
| `REPLACE_D1_DATABASE_ID` | `[[d1_databases]] database_id` | Cloudflare D1 id | `npx wrangler d1 create ownsite-aeo` |
| `REPLACE_WITH_YOUR_DOMAIN` | `public/.well-known/agent.json` 全域 | 真實域名 | 全域替換 |

## 付款相關（wrangler secrets，絕不入 vars）

| Secret | 說明 | 來源 |
|---|---|---|
| `PAY_TO` | 收款錢包地址（0x...） | 你的錢包 |
| `FACILITATOR_URL` | CDP x402 facilitator base URL | https://portal.cdp.coinbase.com |
| `CDP_API_KEY` | CDP 平台 API key | CDP 帳號 |
| `CDP_PRIVATE_KEY` | CDP merchant 私鑰 | CDP 帳號 |
| `SYNC_SIGNING_KEY` | `/internal/sync` 共享密鑰 | `openssl rand -hex 32` |
| `CURSOR_SECRET` | v1.13 cursor 簽名 HMAC 密鑰 | `openssl rand -hex 32` |
| `REVERIFY_SECRET` | v1.8 `/reverify` endpoint 共享密鑰 | `openssl rand -hex 32` |
| `SELFHOSTED_PRIVATE_KEY` | v1.12 selfhosted facilitator 私鑰 | EIP-3009 簽名用 |
| `VERIFIER_ENDPOINT` | v1.8 verifier 服務 base URL | verifier 部署後提供 |

## 市集 API Key（v1.7，Phase 2）

| Secret | 說明 |
|---|---|
| `MARKET_BAZAAR_API_KEY` | Coinbase Bazaar / CDP merchant |
| `MARKET_AGENT402_API_KEY` | Agent402 marketplace |
| `MARKET_MCP_SO_API_KEY` | MCP.so marketplace |
| `MARKET_DATAPPOINT_API_KEY` | DataPoint marketplace |

## CI 相關（GitHub Actions Secrets）

| Secret | 說明 |
|---|---|
| `VERIFIER_PUBLIC_KEY_HEX` | Ed25519 公鑰 hex（`npm run gen-keypair` 產生） |
| `SYNC_SIGNING_KEY` | 同 wrangler secret |
| `BAZAAR_API_KEY`（Phase 2） | Bazaar API key |
| `AGENT402_API_KEY`（Phase 2） | Agent402 API key |
| `MCP_SO_API_KEY`（Phase 2） | MCP.so API key |

## 網路與 asset（wrangler.toml vars）

| 變量 | 佔位符 | 替換為 |
|---|---|---|
| `NETWORK` | `eip155:84532` | 保持不變（Base Sepolia）；Phase 2 上線改 `eip155:8453`（Base mainnet） |
| `ASSET_USDC` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Base Sepolia USDC（Phase 1 測試）；Phase 2 改為 `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

**注意**：Base mainnet 與 Sepolia **chainId 不同**：
- Base mainnet：chainId `8453` → CAIP-2 `eip155:8453`
- Base Sepolia：chainId `84532` → CAIP-2 `eip155:84532`

兩者 USDC contract 地址也不同。Phase 1 用 Sepolia（測試），Phase 2 上線改 mainnet。

## public/.well-known/agent.json

| 欄位 | 佔位符 | 替換為 |
|---|---|---|
| `url` | `https://REPLACE_WITH_YOUR_DOMAIN/a2a/v1` | 你的真實 URL |
| `extensions.ownsite_verification.verification_spec` | `https://REPLACE_WITH_YOUR_DOMAIN/...` | 真實 URL |
| `extensions.ownsite_verification.jwks_url` | 同上 | 同上 |
| `extensions.ownsite_verification.index_url` | 同上 | 同上 |
| `extensions.ownsite_verification.trust_query_endpoint` | 同上 | 同上 |
| `extensions.ownsite_verification.status_endpoint` | 同上 | 同上 |
| `extensions.ownsite_verification.mcp_endpoint` | 同上 | 同上 |

## public/.well-known/jwks.json

| 欄位 | 佔位符 | 替換為 |
|---|---|---|
| `keys[0].x` | `REPLACE_WITH_BASE64URL_PUBLIC_KEY_32_BYTES` | `npm run gen-keypair` 產生的 `JWK.x` 值 |
| `keys[0].kid` | `verifier-1` | 保持不變或改為你的 key id |

## public/.well-known/agent-index.json

**佔位符**：
```json
{
  "_comment": "PLACEHOLDER — 由 `npm run build-index` 或 `npm run publish-static` 生成真實索引。",
  "packages": []
}
```

**替換方式**：執行 `npm run publish-static` 或 `npm run publish-package`，會自動覆蓋。

## fixtures/sample-verifier-output.json

| 欄位 | 說明 |
|---|---|
| `excerpt_sha256_hex` | 目前是佔位 hex（例如 `3a7bd3e2...`）；**必須**由 verifier 真實計算後替換 |
| `source_url` | 目前是 example.org/statista.com 等；必須替換為真實 evidence URL |
| `accessed_at` | 目前是假日期；必須改為 verifier 實際訪問時間 |
| `q_breakdown` | 目前為樣本值；verifier 應產出真實分數 |

**警告**：若在測試環境跑通端到端流程但 production 使用佔位 fixture，Agent 會驗簽失敗或 refetch hash 不匹配。

## scripts/publish-static.ts

| 變量 | 預設值 | 說明 |
|---|---|---|
| `OWNSTIE_BASE` | `https://REPLACE_WITH_YOUR_DOMAIN` | 從環境變量讀取；本地執行時必須設定 |

## CI workflow

| 檔案 | 佔位符 |
|---|---|
| `.github/workflows/pages-deploy.yml` | `VERIFIER_PUBLIC_KEY_HEX` secret |
| `.github/workflows/sync-manifest.yml` | `BAZAAR_API_KEY`、`AGENT402_API_KEY`、`MCP_SO_API_KEY`（Phase 2） |

## 檢查指令

執行以下命令確認沒有未替換的佔位符：

```bash
# 全域搜尋 REPLACE_ 前綴
grep -r "REPLACE_" --include="*.json" --include="*.toml" --include="*.ts" --include="*.yml" .
# 預期輸出：只在本文檔與註釋中出現

# 搜尋 PLACEHOLDER
grep -r "PLACEHOLDER" --include="*.json" --include="*.ts" .
# 預期輸出：僅在 wrangler.toml 的 PAY_TO 註釋中出現
```

若上述命令返回意外結果，說明佔位符未替換。
