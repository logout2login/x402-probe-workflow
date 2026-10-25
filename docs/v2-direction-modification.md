# v2.0 方向修訂建議（對 Append_Plan.txt 的誠實回饋）

**寫於**：2026-10-23  
**對象**：`Append_Plan.txt` 的 v2.0 戰略重構方案  
**目的**：不是要推翻 v2.0，而是把幾個**在方向層面會浪費時間**的問題挑出來，讓你在動工前決定要不要調順序。

---

## 一句話結論

> **v2.0 方向是對的，但相位序錯了。原計畫把「L5 attestation」當最高優先級、投 8–10 週，但真正的最高 ROI 其實是兩個低成本項目：`decision_usability`（一個運行時字段，幾小時可上）和敘事重寫（純文檔，幾小時到幾天）。L5 attestation 應該是「可選的第三階段」，不是「核心投資」，且必須搭配明确的停止指標，否則可能建了一座沒人進來的空城。**

---

## 一、原計畫做得好的地方（先認可）

以下四點是 Append_Plan.txt 的真正價值，不要放棄：

1. **五層架構 L1–L5 的分層**：把 v1.x 十六個版本的功能重新歸位，不推翻任何東西——這是對的。
2. **六大痛點的買家立場分析**：把 Agent 效用函數的四個阻力（驗證成本、失敗成本、選擇資訊熵、下游互信）講清楚，比 v1.x 的「解決 hallucination」敘事精準得多。
3. **敘事重寫優先**：原計畫第 5 節說「如果你只能做一件事，重寫 `agent.json` 的 `skills[].description`」——這個 ROI 判斷完全正確。
4. **attestation 作為護城河**：`acceptance_registry` 是時間累積的真實使用紀錄，這個方向戰略上是有價值的。

**這些不要動。以下是需要調的方向。**

---

## 二、原計畫的 5 個結構問題（誠實指出）

### 問題 1：L5 的「護城河」論證是空城的護城河

原計畫把 `acceptance_registry` 標為 🔥🔥🔥 最高優先級，理由是「這是比 q 分數更強的信號」。

**問題在哪裡**：q 分數的弱點不是「不是真實使用」，而是「沒人信」。如果整個 ecosystem 裡**只有你一家**有 acceptance_registry，你的 12 個 `attestation_count` 對其他 Agent 來說就是「ownsite 內部數字」，不是「市場背書」。

**真正的情況**：
- Day 1：0 個 Agent 使用 → `attestation_count = 0`，機讀信號完全沒信號
- Day 30：可能 5–20 個 Agent 使用 → 對比 q 分數，仍不構成顯著優勢
- Day 180：可能累積到「別人沒有的紀錄」——但到那時才值錢

**結論**：L5 的護城河是**真實**的，但護城河需要 6–12 個月才填滿。投 8–10 週建起來的空城，在前 3 個月是負資產（多出的 D1 表、多出的端點、多出的維護成本，機讀信號卻沒信號）。

**建議方向修改**：把 L5 從「Phase A（第 2–10 週）」推到「Phase C（第 6–14 週，視啟動數據決定）」，並加**硬停止指標**（見 §四）。

---

### 問題 2：`decision_usability` 被歸到 Phase B，應該升到 Phase A

原計畫把 `decision_usability` 歸為 Phase B（第 11–14 週），理由是它是「L3 補充」。

**問題在哪裡**：`decision_usability` 是整個 v2.0 裡**唯一一個「不改 D1 schema、不加新端點、不動任何既有邏輯、只加一個運行時注入字段」的項目**。它的成本：
- 新增 `src/worker/decision-usability.ts`：~30 行代碼
- 修改 `src/worker/verify.ts`：加 2 行注入
- 修改 `agent.json`：加說明
- 修改 `verification-spec.json`：加字段說明
- **總工時估計**：4–6 小時（含測試）

它的 ROI：直接回應買家分析的 #1 痛點（「Agent 沒辦法判斷資料能不能入決策分支」），且**不需要等 L5 上線才有價值**——從 Day 1 就能被 Agent 讀到。

**結論**：把 `decision_usability` 從 Phase B 提到 Phase A 的第 1 週（跟敘事重寫一起做）。它不是「補充」，它是 v2.0 的最小可行交付。

---

### 問題 3：Attestation 的「拉模式」設計會造成 Adoption Failure

原計畫的 attestation 流程：
```
Agent 買完 → 主動調 POST /attest → 拿到 token → 下游 Agent 驗證
```

**問題在哪裡**：Agent 買完資料後，會主動去求一份 attestation 嗎？

答案是「大概率不會」——原因有三：

1. **Agent 的目標函數**：Agent 調 `/buy` 是为了拿到資料，拿到後立即結束任務。多一步 `/attest` 是纯負荷。
2. **多 Agent 協作場景稀有**：買家分析假設「Multi-Agent 協作是主流」，但真實的 Agent 部署（2026 年 10 月）多數是「人類 + 單個 Agent」或「人類 + 一組獨立 Agent」，跨 Agent 的信任傳遞是研究課題，不是普遍場景。
3. **沒有誘因**：現階段沒有下游 Agent 因為「沒有 attestation」就拒絕上游事實輸入——這個誘因還沒形成。

**結論**：attestation 應該是「買完自動簽發、Agent 想拿就拿」的 push 模式，不是「Agent 想求就求」的 pull 模式。具體做法：

```ts
// 在 handleBuy 的最後，交付資料的同時自動簽發 attestation
const token = await buildAttestationToken(env, {...});
await recordAcceptance(env, token);
return json({
  data: {...},
  verification_snapshot: v,
  receipt: {...},
  attestation_token: token    // ← 直接附在 buy 回應裡，Agent 想不想要都行
});
```

**這樣做的好处**：
- 不用改 Agent 側任何邏輯
- `attestation_count` 從第一筆交易就開始累積
- Agent 想向下游證明引用時，attestation 已經在 buy 回應裡
- 想主動查的 Agent 仍可調 `POST /attest`（保留原端點作 fallback）

---

### 問題 4：`budget_hint` 是 protocol 級別的建議，不是強制機制

原計畫把 `budget_hint` 標為 🔥 P1，並聲稱「Agent 調用前已知道 cost，唔使事後 surprise」。

**問題在哪裡**：
- `X-Agent-Max-Spend-USDC` 是一個 **header**，不帶 header 就等於沒有 budget check
- Agent 完全可以選擇不帶——它沒有義務遵守 protocol
- 真正的成本保護在 Agent 自己的 payment header 生成之前（Agent 決定要不要簽一筆 `X-Payment`）

**原計畫自己在風險表裡也承認了**：「協議約定；Agent 不帶 header 時，Server 無法強制」。

**結論**：`budget_hint` 是「為遵守 protocol 的 Agent 提供便利」的功能，不是「解決 runaway cost」的功能。它的真實價值是：
- 讓「有紀律的 Agent」可以聲明預算，Server 提供可預測的錯誤訊息
- 讓 agent.json 的 `budget_protocol` 字段成為「我們理解 Agent 需要 cost certainty」的信號

**建議方向修改**：
- 保留 budget_hint 實現（成本低，4–8 小時）
- 但**不要**把它包裝為「解決 runaway cost」——那是自欺欺人
- 在文檔裡誠實寫：「本協議保護遵守的 Agent；不遵守的 Agent 無法被強制」

---

### 問題 5：退款機制的「只記錄不轉賬」在 v2.0 幾乎沒有價值

原計畫的退款設計：
- Agent 提交 `POST /refund/{tx_hash}`
- 系統檢查條件 → 寫入 `pending`
- Agent 24 小時內**人工線下**收到 USDC 退款
- 系統沒有審批端點、沒有自動轉賬

**問題在哪裡**：
1. **Agent 沒法查「我錢什麼時候到」**——`GET /refund/{tx_hash}` 只能查系統狀態，不是錢包狀態
2. **人工退款有延迟風險**：24 小時窗口 + 人工轉賬 = 真實退款可能 48–72 小時
3. **對 Agent 而言，「已付款但拿不到資料」這個失敗的實際代價還是 USDC**——它沒退回來之前，Agent 效用函數看到的還是失敗成本 = $0.50

**結論**：v2.0 的退款機制是「誠意的展示」，不是「實際的退款」。這個誠意展示對 Agent 有用，但對「解決 #2 便宜的失敗」這件事作用有限。

**建議方向修改**：
- **選項 A（誠實派）**：把退款列為 v2.1，v2.0 不做。理由：不完整比不完整更好。Agent 看到 `/refund` 端點卻發現不能真的退錢，是雙重失望。
- **選項 B（補完派）**：v2.0 就在 payments 表加 `payer_address_hash`（加密存），退款時 decrypt 自動轉賬。這是完整方案，代價是加密存儲設計要認真做。
- **不建議選項 C（現狀）**：做一半的退款，Agent 以為能退，實際不能。

我傾向 A——把退款推 v2.1，v2.0 專注在 `decision_usability` + 敘事 + push 模式的 attestation。

---

## 三、修訂後的階段順序（對比原計畫）

### 原計畫
```
Phase A（第 2–10 週）：L5 attestation（8–10 週）      ← 最大投入，最大風險
Phase B（第 11–14 週）：L2 budget + L3 decision_usability
Phase C（第 11–14 週）：L4 退款
Phase D（第 11–14 週）：敘事重寫
```

### 修訂版
```
Phase A（第 1 週）：快速勝利
  ├─ 敘事重寫（README + agent.json + 市集文案）
  ├─ decision_usability 字段（Worker 運行時注入）
  └─ attestation 改為 push 模式（買完自動簽發）

Phase B（第 2–4 週）：機讀信號強化
  ├─ budget_hint 協議（誠實定位為「遵守的 Agent 的便利」）
  ├─ machine_tags 擴展（q_effective, source_diversity, freshness_days）
  ├─ attestation_count 進 machine_tags
  └─ Agent SDK 示例（TypeScript / Python）

Phase C（第 5–10 週）：L5 完整化 + 停止指標檢查
  ├─ /acceptance/verify 端點（下游 Agent 驗證）
  ├─ acceptance_registry 表 + 統計端點
  ├─ 離線驗證庫 (@ownsite/attestation-verify)
  └─ ⚠️ 第 5 週和第 8 週強制檢查停止指標（見 §四）

Phase D（第 11–14 週，若通過停止指標）：退款 + 生態擴展
  ├─ 退款機制（選 A 或選 B）
  ├─ 真實 marketplace API 接入
  └─ 多 verifier 支持

持續：Phase E 數據研究
```

---

## 四、L5 的停止指標（原計畫缺失的關鍵機制）

原計畫完全沒提「什麼情況下應該停止或轉向 L5」。這是最大的風險——8–10 週投入後可能發現「沒人用」，但沒有提前設定的撤退條件。

**建議硬指標**（Phase C 第 5 週 + 第 8 週檢查）：

| 指標 | 第 5 週檢查 | 第 8 週檢查 | 若未達標 |
|---|---|---|---|
| `/buy` 調用數 | ≥ 5 筆真實購買 | ≥ 50 筆 | 停止 L5，重審買家分析 |
| `attestation_count` | ≥ 5 個不同 buyer | ≥ 20 個 | 停止 Phase C 第 2 段 |
| `/acceptance/verify` 調用 | ≥ 1 次 | ≥ 10 次 | 停止 L5，attestation 只保留在 buy 回應裡 |
| 不同 `buyer_pseudonym` 數 | ≥ 3 | ≥ 15 | 停止擴展 ecosystem，先做單 agent 使用場景 |

**關鍵判斷**：如果第 5 週 3 個指標全部未達標，**立刻停止 L5 投入**，把資源轉去真實用戶研究。空城的建設越久，轉換成本越高。

---

## 五、原計畫漏掉的 3 件事

### 漏 1：Agent SDK 完全沒提

原計畫假設 Agent 會用 `fetch` + JSON。但 Agent 實際部署需要：
- **TypeScript SDK**：TypeScript 類型 + Ed25519 驗證庫 + JWKS 快取
- **Python SDK**：Agent 生態（LangChain / LlamaIndex）主要用 Python

**建議**：Phase B 加 `packages/sdk-typescript/` 和 `packages/sdk-python/`，最小可用（`verify(token)` + `buy(package_id)`）。這比多建一個 D1 表有用得多。

### 漏 2：Agent 端的「驗證前調用」流程沒具體化

原計畫只說「Agent 可以 verify」，但沒說**具體在什麼情況下 Agent 應該調 verify**。

**建議**：在 `agent.json` 的 skill description 裡明確寫：
```
"Verify is mandatory before buy for packages older than 7 days or 
 with q < 0.80. Verification is free and takes <100ms."
```

這是「機讀指示」，直接影響 Agent 的調用決策。

### 漏 3：生態冷啟動策略

原計畫假設 Agent 會自然來用。但實際上：
- Day 1 沒有一個 Agent 在 agent-index 上看見自己
- Agent 不會主動搜索「ownsite verified data」
- 冷啟動需要主動 outreach

**建議**：Phase A 加「生態冷啟動」任務：
- 主動聯絡 3–5 個使用 x402 的 Agent 開發者（Twitter DM / GitHub issue）
- 提供「開發者激勵包」：前 100 筆購買免手續費 + 贈送 attestation 展示位
- 在 Agent402 marketplace 上線（`src/market/adapters/agent402.ts` 已有骨架）

---

## 六、原計畫的 3 個具體錯誤（技術層面）

### 錯誤 1：`supported_networks` 的 chainId 又混了

`Append_Plan.txt` 第 1675 行：
```json
"supported_networks": ["eip155:8453", "eip155:84532"]
```

但 `src/shared/constants.ts` 第 82 行：
```ts
export const SUPPORTED_NETWORKS = ["eip155:84532"] as const; // Base Sepolia
```

**問題**：現階段是 Phase 1（Sepolia 測試），`agent.json` 應只列 `eip155:84532`。等到 Phase 2 上主網才改為 `eip155:8453`。原計畫同時列兩個是**混網路**——Agent 不知道該往哪個網路付錢。

**修正**：v2.0 的 `agent.json` 補丁應保持 `["eip155:84532"]`（Phase 1）；上主網時切換為 `["eip155:8453"]`。不要同時列。

### 錯誤 2：`attestation.expires_at = verification.expires_at` 的邏輯漏洞

原計畫第 3 節 5.2.1 寫：
```ts
const expiresAt = verification.expires_at;  // 與 verification 同 TTL
```

**問題**：`verification.expires_at` 是資料本身過期的時間（如 180 天）。但 attestation 代表「買家在某時刻引用了這個包」——它應該跟**引用事件**相關，不是跟資料相關。

**實際場景**：
- Day 0：Agent 買包 → 獲得 attestation（expires_at = Day 180）
- Day 150：Agent 想用這個 attestation 證明「我在 3 個月前引用了這個資料」
- Day 150 時，attestation 還有 30 天有效——正確
- 但如果 verification 被 recall（Day 90），attestation 就「應該」失效嗎？——其實不應該。Agent 在 Day 0 引用資料的事實不會因為資料後被 recall 而改變。

**修正**：attestation 的 TTL 應該獨立於 verification TTL。建議：
```ts
const expiresAt = new Date(Date.now() + 90 * 86400 * 1000).toISOString(); // 90 天，獨立
```

並在文檔說明：「Attestation 記錄的是引用事件，不是資料狀態；即使資料後被 recall，歷史 attestation 仍有效，但當前驗證會失敗」。

### 錯誤 3：`refund.ts` 的 24 小時窗口計算用了 server 時間

原計畫第 14 節：
```ts
const ageHours = (Date.now() - calledAt.getTime()) / 3600_000;
if (ageHours > 24) return json({error: "refund_window_expired", ...}, 410);
```

**問題**：`Date.now()` 用的是 Server 的時鐘。如果 Agent 的時鐘偏快 1 小時，它在「實際 25 小時後」提交請求，Server 卻認為是「24 小時內」——可以通過。反之亦然。

**修正**：refund 窗口應該用 `called_at`（記錄時寫入 D1 的 ISO timestamp），並明確寫：
```ts
// called_at 是 Server 端記錄的時間（可信）
// 24 小時窗口基於 called_at，不是 Agent 端時間
const ageHours = (Date.now() - calledAt.getTime()) / 3600_000;
```

原計畫實際上這樣寫了，但沒明確註明「用 Server 時間」。文檔要寫清楚。

---

## 七、最終修訂建議（3 個決策點）

如果你要動工，先決定這 3 個方向：

### 決策 1：attestation 是 pull 還是 push？
- **原計畫**：pull（Agent 主動調 `/attest`）
- **建議**：**push**（買完自動簽發 + 保留 pull 端點作 fallback）
- 影響：`/buy` 回應多一個字段，其他不動；`attestation_count` 從 Day 1 開始累積

### 決策 2：退款 v2.0 做還是推？
- **原計畫**：v2.0 做（但只記錄不轉賬）
- **建議**：**推 v2.1**，v2.0 先不做
- 影響：`schema/d1-refunds.sql` 和 `src/worker/refund.ts` 全部延後；`agent.json` 不列 `refund_protocol`

### 決策 3：L5 是不是核心？
- **原計畫**：L5 是核心，8–10 週投入
- **建議**：L5 是**可選擴張**，先做 push attestation + `acceptance_registry`（第 5 週），視數據決定是否深入
- 影響：Phase C 第 5 週設強制檢查點，未達標則停止 L5

---

## 八、如果只接受一條建議

**把 `decision_usability` 從 Phase B 提到 Phase A 第 1 週，跟敘事重寫一起做。**

理由：
- 成本 4–6 小時（Phase A 全部只需 1 週，還有 4 天做敘事）
- ROI 最直接（Agent 立刻能看到）
- 不需要任何 D1 表、不需要任何新端點
- 不依賴 L5 上線就有價值
- 即使 L5 最終被停止指標砍掉，`decision_usability` 仍然是 v2.0 的核心交付

**這一項做完，v2.0 就有了一個真實的、Agent 可讀的、回應買家分析的核心賣點**。其他都是加分項。

---

**下一步**：如果你同意以上修訂，我可以：
1. 重寫 `Append_Plan.txt` 的 §九（路線圖）為上面的修訂版
2. 直接生成 Phase A 的完整代碼包（敘事 + decision_usability + push attestation）
3. 生成停止指標的監控腳本（自動報警）

---

*本文件不修改 Append_Plan.txt 本身，只作為方向修訂建議附檔。所有 v1.x 與 v2.0 原計畫內容仍然有效。*
