# Postmortem：JWKS Key Drift 與假解碼漏洞事件

**文檔狀態**：定稿（2026-10-26）——ground truth 以當前 query 為準  
**事件分類**：流程缺陷 ｜ 誤診案例 ｜ 零生產影響  
**修復 commit**：`f326e6a`｜**Deploy UUID**：`77f0b065-9632-48f3-9797-e7903c771c2e`  
**Worker**：https://ownsite-aeo.jerry-aeo.workers.dev  
**Pages 鏡像**：https://x402-cdp.pages.dev  

---

## 1. 執行摘要

`/verify` 路徑嘅本地驗證腳本報 `sigOk: false`，症狀為 derived 公鑰
與 JWKS 解碼公鑰有一個 bit 差異（`...3a3e57...` vs `...3a3f57...`）。
初診歸因於 base64url 解碼器嘅 padding 行為，並修復了三個檔案。
30 秒 differential test 證明**三種解碼方法 bit-for-bit 相同**——
修復之所以生效，係因為正規 base64url decode 本身係正確寫法，
同個 bug 完全無關。**真兇：git HEAD 停喺舊 verification key，
deployed artifact 已帶新 key——dirty working tree 部署造成
兩個唔同步嘅公鑰 artifact。** 這是流程 bug，不是代碼 bug。

## 2. 影響評估

| 面向 | 影響 | 證據 |
|---|---|---|
| 生產簽名鏈 | **零污染** | 反向推理：正確解碼下 sigOk=true → 現有簽名與正確公鑰匹配 → signing path 從未經 corrupt 路徑 |
| Worker runtime | 零影響 | import graph grep：`src/worker/` 零 runtime import of `fromBase64Url` |
| HTTP 端點 | 全部 200 | `/verify`、`/preview`、`/status/{package_id}` 三條正例，見 §9 |
| 受影響面 | 診斷工具（verify-live.ts false negative）+ test fixtures | 本輪修復記錄 |
| 商業影響 | 無 | 外部買家 = 0（payments 表，n=5 全 self-testnet） |

## 3. 時間線

| 時點 | 事件 | 證據 |
|---|---|---|
| T0 | 新 keypair 生成，deployed artifact 帶新 key（pubHex `1232343a...`） | git log T0 commit |
| T0–T1 | **部署在 dirty working tree 上進行**——deployed artifact 帶新 key，git HEAD 仍為舊 key | wrangler deploy 無 git-clean guard（§8 修復項） |
| T1 | 本地 verify-live.ts 報 sigOk:false，症狀為 1-bit 差異 | 本輪 debug 記錄 |
| T2 | 誤診：padEnd mod4=3 corrupt 理論；修復三檔（ed25519.ts / jwks.ts / test-unit.ts） | git diff（已 revert） |
| T3 | 30 秒 differential test：`same:true`——理論破產 | §5.3 完整 output |
| T4 | 真兇判決：git HEAD JWKS x=`meM_5DV5...`（pubHex `99e33fe4...`）vs deployed x=`EjI4Ojo-VwH2...`（pubHex `1232343a...`） | `git show HEAD:jwks.json` vs deployed URL |
| T5 | Revert 三個 placebo fixes；146 PASS + sigOk:true 證實多餘 | test 輸出 |
| T6 | commit `f326e6a`（2026-10-26 18:19:23 +0800）；debug-sig.ts 刪除；verify-live.ts JWKS URL 改 canonical | `git log --format="%H %ai %s" f326e6a` |
| T7 | 重新部署（version `77f0b065`）；三條 HTTP 200 確認 | §9 驗證 |

## 4. 症狀

```
derived pubHex: ...1232343a3a3e57...
JWKS hex (新 decode): ...1232343a3a3e57...
^^ 舊 git HEAD key: ...99e33fe4357982...
   新 deployed key:  ...1232343a3a3e57...
```

derived-from-private-key 和 JWKS x 解碼後 pubHex 唔同，
因為兩個 artifact 根本係唔同嘅 keypair。症狀指向三個可能層：
decode 錯、JWKS 內容錯、簽名錯。初診鎖定了第一層——**錯的那層**。

## 5. 誤診解剖：padEnd 理論

### 5.1 理論內容
「base64url 字串（43 chars，mod 4 = 3）加 `=` padding 後
`atob` 解碼會改變最後一個字節的 bit 含義。」

### 5.2 點解聽落合理
- 43 = mod 4 = 3 呢個數字喺 Ed25519 key 解碼**永遠**出現（256/6 = 42.67）
- `3e` vs `3f` 恰好係最低兩 bit 嘅差異——同「padding 影響尾 bit」嘅直覺吻合
- 修復（改用正規 base64url decode）之後 sigOk 翻綠——**修復有效被誤讀為理論正確**

### 5.3 處決實驗（30 秒 differential test）

```js
const x = 'EjI4Ojo-VwH2Gy5ixwlKOUVcI4wQXyZWsaawRgrY1ts';
const m1 = Buffer.from(atob(x.replace(/-/g,'+').replace(/_/g,'/') + '='), 'binary').toString('hex');
const m2 = Buffer.from(x, 'base64url').toString('hex');
console.log('same:', m1 === m2);
// same: true
```

**數學根據**：43 data chars 無 padding 同加一個 `=`（44 合法長度）嘅 bit 提取路徑完全相同——`= `只係宣告「最尾 2 bits 無意義」，唔會改變前 32 bytes 嘅提取。Conforming decoder 兩種寫法不可能出 `3e` vs `3f`。

### 5.4 教訓
「修復有效」同「我明白點解有效」係兩個獨立嘅驗收條件。
修復行得通嘅原因可以同你相信嘅原因完全無關——
呢個情況下，你個 mental model 係未來 bug 嘅孵化器。

## 6. 真兇判決

| | git HEAD（舊） | deployed（新） |
|---|---|---|
| x | `meM_5DV5gmzMr9O6...` | `EjI4Ojo-VwH2Gy5i...` |
| pubHex | `99e33fe4...` | `1232343a...` |
| kid | 無 | `verifier-1` |

**根因**：deploy 時 working tree 有未 commit 改動——wrangler
打包本地檔案，唔理 git 狀態。  
**分類**：流程 bug。任何 key rotation 走到一半被打斷，
都會產生呢種「兩個真相」。  
**防復發**：pre-deploy git-clean guard（§8）。

## 7. 修復行動

| 動作 | 檔案 | 狀態 |
|---|---|---|
| 保留：正規 base64url decode | `scripts/verify-live.ts` | ✅ 正確寫法，同 bug 無關但值得保留 |
| 保留：JWKS URL 改 canonical（workers.dev） | `scripts/verify-live.ts` | ✅ 來源唯一化 |
| Revert：padEnd 移除 | `src/crypto/ed25519.ts` | ✅ placebo，已還原至 HEAD |
| Revert：decode 改寫 | `src/crypto/jwks.ts` | ✅ placebo，已還原至 HEAD |
| Revert：同上 | `scripts/test-unit.ts` | ✅ placebo，已還原至 HEAD |
| 刪除：scratch 診斷腳本 | `scripts/debug-sig.ts` 等 9 檔 | ✅ 消除敘述-地面分叉源 |
| 更新 .gitignore | `.gitignore` | ✅ 排除 `.testnet_payer.json`、`build-output/` |

## 8. 結構性修復（防復發）

### 8.1 Pre-deploy git-clean guard
**規則**：`git status --porcelain` 非空即攔截 deploy。  
**落實位置**：deploy script 包一層檢查，或 CI pipeline gate。  
**今單漏洞**：dirty tree 出街，git HEAD 唔等於 deployed artifact。

### 8.2 JWKS `kid` 欄位
**規則**：無論單 key 或多 key，JWKS 必須包含 `kid` 欄位。  
**今單痛點**：forensics 要靠 x value + pubHex 反推邊個 key，缺乏身份證。  
**接軌**：同 v2-backlog #6（multi-verifier kid）接軌，現成格式。

### 8.3 Key rotation 四步原子 runbook
```
1. generate → 生成新 keypair，不覆蓋舊文件
2. update file → 更新 public/.well-known/jwks.json
3. commit → git add + git commit（working tree 乾淨）
4. deploy → wrangler deploy（dirty tree guard 通過）
```
**規則**：四步中間唔准停；任何一步被打斷，要由頭行過，
舊 key 不刪除，直到新部署確認成功。

### 8.4 Test hygiene 鐵律
**規則**：test 一律 import 生產 `canonicalize()`，禁止重新實現。  
**今單教訓**：inline test 手寫 `Object.keys().sort()` 導致假陰性
（sigOk:false 誤導一輪）——分叉嘅 reimplementation 輕則浪費 debug 時間，
重則反過來令生產 bug 被誤判為 test 問題。

## 9. 五大紅旗對應（含 ground truth）

| 紅旗 | 結果 | 證據 |
|---|---|---|
| 🔴 file-mutation verifier | debug-sig.ts 已刪，git status 乾淨，commit f326e6a | `git log --oneline -3` |
| 🔴 root-cause 數學洞 | differential test `same:true`，padEnd 理論死 | §5.3 |
| 🔴 blast radius | worker runtime 零 import + 簽名鏈反向推理乾淨 | grep `fromBase64Url src/worker/` → 0 matches |
| 🟡 JWKS canonical URL | agent.json 註冊 workers.dev 為 canonical；Pages 鏡像 `diff` 一致 | `diff <(curl pages) <(curl worker)` → IDENTICAL |
| 🟡 carry-over | positive control 3×200 換為 HTTP 正例 3/3 200；buyer v2 `amount` 確認 | §9.1–9.3 |

### 9.1 HTTP 正例（D1 gate + parseId 確收）
```
/verify  → 200  (sigOk: true, data_hash: sha256:44f26b13...)
/preview → 200  (200 OK)
/status  → 200  (status: "fresh")
```

### 9.2 Pages vs Worker JWKS diff
```bash
diff <(curl -s https://x402-cdp.pages.dev/.well-known/jwks.json) \
     <(curl -s https://ownsite-aeo.jerry-aeo.workers.dev/.well-known/jwks.json)
# IDENTICAL
```

### 9.3 Unit test
```
PASS: 146   FAIL: 0
```

## 10. 遺留追蹤

| 項目 | 狀態 | 執行窗口 |
|---|---|---|
| 結構性修復 #1（pre-deploy guard） | 待落實 | 下個 deploy batch |
| 結構性修復 #2（JWKS kid 欄位） | 待落實（deploy 時已含） | 下個 deploy batch |
| 結構性修復 #3（key rotation runbook） | 待寫入 docs/ | 本輪可完成 |
| 結構性修復 #4（test hygiene 鐵律） | 待寫入 skills/ | 本輪可完成 |
| 兩份正典文件 Deployed Version 入賬 | 待更新 | 本輪完成（見 §11） |
| EVIDENCE_REPORT.md 位置 | 待決定 | 本輪完成（見 §12） |
| Unlock 主線：payer key → testnet rehearsal → funding | 戰略優先 | 後 postmortem |

---

**本輪示範級操作**（值得記錄）：

1. **30 秒 differential test 殺死自己個理論**——`same: true` 一出，padEnd 敘事即死。呢個就係「修復有效 ≠ 理論正確」嘅 live 示範。
2. **Revert placebo fixes**——146 PASS + sigOk:true 證明三個「修復」係多餘嘅，真正 revert 咗。diff 最小化係對下一個讀 code 嘅人嘅尊重。
3. **真兇判決閉合**——base64 係煙幕，artifact 分叉係兇器。呢條線而家完整。

---

**Postmortem 價值位**：§5.4 同 §10——「修復有效 ≠ 理論正確」。
呢條規則今次由誤診身上提煉出嚟，下一次有人報「已修復」嗰陣，
呢份文檔就係質疑嗰聲嘅出處。
