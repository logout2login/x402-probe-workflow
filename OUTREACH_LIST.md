# Outreach List v1 — x402.org/facilitator 失效通知

## 數據摘要
- **總受影響倉庫數**: 6,024
- **實際代碼倉庫數**: 2,756 (排除 README/文檔)
- **失效根源**: CDP Facilitator `/platform/v2/x402/verify` 和 `/settle` 端點已遷移至 `https://facilitator.cdp.coinbase.com`，舊域名 `https://x402.org/facilitator/` 返回 404
- **官方證據**: GitHub issue [x402-foundation/x402#2207](https://github.com/x402-foundation/x402/issues/2207) 證實此問題

## 高優先級對象 (Top 20)

| # | 倉庫 | 路徑 | 語言 | 風險 | 聯絡方式 |
|---|------|------|------|------|----------|
| 1 | x402-foundation/x402 | examples/go/servers/gin/main.go | Go | 官方示例 | GitHub org |
| 2 | x402-foundation/x402 | examples/go/servers/echo/main.go | Go | 官方示例 | GitHub org |
| 3 | x402-foundation/x402 | go/http/facilitator_client.go | Go | 官方 SDK | GitHub org |
| 4 | x402-foundation/x402 | examples/python/servers/advanced/all_networks.py | Python | 官方示例 | GitHub org |
| 5 | GetBindu/Bindu | bindu/settings.py | Python | 生產配置 | GitHub |
| 6 | basementstudio/xmcp | examples/x402-http/src/middleware.ts | TypeScript | 中間件 | GitHub |
| 7 | nirholas/three.ws | robinhood/hood-api/src/lib/env.ts | TypeScript | API 配置 | GitHub |
| 8 | LeoYeAI/openclaw-master-skills | skills/runtime-sentinel/scripts/src/payment.rs | Rust | 支付模組 | GitHub |
| 9 | codespar/mcp-dev-latam | examples/x402-demo/server.ts | TypeScript | 示範代碼 | GitHub |
| 10 | Now-Or-Neverr/solana-x402-payment | api/index.js | JavaScript | 生產 API | GitHub |
| 11 | anolilab/lunora | packages/x402/src/facilitator.ts | TypeScript | 核心依賴 | GitHub |
| 12 | Goncafer47/Stablecoin-Payment-Gateway | actions/settings.py | Python | 生產配置 | GitHub |
| 13 | XSpoonAi/spoon-core | spoon_ai/payments/config.py | Python | 支付配置 | GitHub |
| 14 | wevm/mppx | examples/x402-express/src/server.ts | TypeScript | 示例代碼 | GitHub |
| 15 | Fewsats/proxy402 | routes/config.go | Go | 代理配置 | GitHub |
| 16 | HyperdustLabs/hyper-facilitator | go/pkg/coinbasefacilitator/cdp.go | Go | Facilitator 實現 | GitHub |
| 17 | dabit3/a2a-x402-typescript | x402_a2a/core/protocol.ts | TypeScript | 協議實現 | GitHub |
| 18 | NaniDAO/agentek | packages/shared/x402/constants.ts | TypeScript | 常量定義 | GitHub |
| 19 | nirholas/cryptocurrency.cv | src/app/api/health/route.ts | TypeScript | Health check | GitHub |
| 20 | nirholas/cryptocurrency.cv | src/lib/x402/config.ts | TypeScript | X402 配置 | GitHub |

## 第二批對象 (Top 21-50)

| # | 倉庫 | 路徑 | 語言 |
|---|------|------|------|
| 21 | usehelix/helix | packages/api/src/server.ts | TypeScript |
| 22 | dabit3/a2a-x402-typescript | x402_a2a/core/facilitator.ts | TypeScript |
| 23 | nirholas/memescope-monday | lib/x402.ts | TypeScript |
| 24 | HyperdustLabs/hyper-facilitator | go/bin/proxy_demo.go | Go |
| 25 | Eskyee/agentbot-opensource | web/lib/x402.ts | TypeScript |
| 26 | graphprotocol/gateway-x | src/config.rs | Rust |
| 27 | nirholas/universal-crypto-mcp | x402/python/x402/http/constants.py | Python |
| 28 | runxhq/runx | scripts/x402-interop.mjs | JavaScript |
| 29 | anolilab/lunora | packages/x402/src/config.ts | TypeScript |
| 30 | paolobietolini/caddy-x402 | (Caddy middleware) | Go |
| 31 | nirholas/x402-skill-registry | src/seed.ts | TypeScript |
| 32 | nirholas/x402-skill-registry | src/payments.ts | TypeScript |
| 33 | nirholas/x402-skill-registry | public/.well-known/x402 | 配置 |
| 34 | nirholas/x402-skill-registry | examples/agent-client.ts | TypeScript |

## Outreach 策略

### 第一輪 (Immediate)
1. **x402-foundation/x402** - 官方仓库，直接開 issue/PR
2. **HyperdustLabs/hyper-facilitator** - Facilitator 實現，可能需要更新
3. **anolilab/lunora** - 核心依賴包

### 第二輪 (Week 1)
4. **GetBindu/Bindu** - 生產配置
5. **Goncafer47/Stablecoin-Payment-Gateway** - 生產配置
6. **XSpoonAi/spoon-core** - 支付配置
7. **Now-Or-Neverr/solana-x402-payment** - 生產 API

### 第三輪 (Week 2)
8. **其餘 top 20 倉庫** - 批量 issue 通知

## 訊息模板

```markdown
## ⚠️ x402.org/facilitator 已失效

您的倉庫硬編碼了舊的 x402 Facilitator 端點：
```
https://x402.org/facilitator/platform/v2/x402/verify
https://x402.org/facilitator/platform/v2/x402/settle
```

這兩個端點目前已返回 404。CDP 已將 Facilitator 遷移至：
```
https://facilitator.cdp.coinbase.com/platform/v2/x402/verify
https://facilitator.cdp.coinbase.com/platform/v2/x402/settle
```

**影響**: 所有依賴此端點的 x402 支付功能將失敗。

**修復建議**:
1. 更新代碼中的端點 URL
2. 測試新的 Facilitator 端點
3. 如有問題，請參照：https://github.com/logout2login/x402-probe-workflow

**證據**:
- Probe 數據: https://logout2login.github.io/x402-probe-workflow/
- 官方 Issue: x402-foundation/x402#2207
```

## 驗證清單

- [ ] 已發送 issue 給 x402-foundation/x402
- [ ] 已發送 issue 給 HyperdustLabs/hyper-facilitator
- [ ] 已發送 issue 給 anolilab/lunora
- [ ] 已發送 issue 給 GetBindu/Bindu
- [ ] 已發送 issue 給 Goncafer47/Stablecoin-Payment-Gateway
- [ ] 已發送 issue 給 XSpoonAi/spoon-core
- [ ] 已發送 issue 給 Now-Or-Neverr/solana-x402-payment
- [ ] 已發送 issue 給其餘 top 20 倉庫

## 附錄

### 相關資源
- Probe Dashboard: https://logout2login.github.io/x402-probe-workflow/
- Seed Seller Dashboard: https://logout2login.github.io/seed-seller-v1/
- GitHub Issue: https://github.com/x402-foundation/x402/issues/2207
- Code Search: https://github.com/search?q=x402.org%2Ffacilitator&type=code

### 技術細節
- 失效時間: 2026-05-06 前後開始出現 404
- 官方確認: CDP 已遷移 Facilitator 端點
- 影響範圍: 6,024 個 GitHub 倉庫，其中 2,756 個包含實際代碼
