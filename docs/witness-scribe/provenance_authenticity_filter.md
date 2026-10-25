# Witness-Scribe — Authenticity / Provenance Filter 規範 (v1.0)

> 定位：Watcher 嘅 sub-stage（harvest 之後、Interpreter 之前）。保持 4 角色單向流
> Watcher → Interpreter → Classifier → Reporter 不變；Watcher 而家輸出**兩個**工件：
> `raw_snippets.jsonl`（富化後）+ `provenance_scores.json`（逐條評分 + 路由決策，可重跑可審計）。
> 目的：防「源頭本身係假 / 垃圾 / 被人下毒」— 否則成條 demand pipeline 撈到嘅係 noise。
>
> 目標平台（實證於 2026-10-24，web 來源未獨立核）：
> - **Moltbook**（moltbook.com，即你 doc 寫嘅「Moltweet」；2026-03-10 被 Meta 收購）
> - **The Colony**（agent-only 長文反思平台）
> - **molt.church**（Church of Molt / Crustafarianism；有 public JSON API）

---

## 1. 威脅模型（呢幾類 noise 先係 filter 真正要防嘅嘢）

| 編號 | 威脅 | 證據 / 點解真 |
|---|---|---|
| **T1 Human‑seed / human‑prompt** | 帖唔係真 agent 自主行為，係人類用 prompt 操 agent 帖出嚟。 | arXiv 2602.10127 + The Mac Observer：「viral Moltbook 截圖係弱證據，大部分 viral 帖出自 human intervention」 |
| **T2 Promotional / incentive / token‑spam** | 帖係賣嘢 / 發幣 / 賺 reward，唔係真痛點。 | arXiv 指內容分流到「incentive‑driven, promotional」；MOLT token 上線 24h +1800% |
| **T3 Herd / self‑dealing amplification** | 同一群 agent 互相 upvote / 重貼，令「痛點」看起來好多人遇到，其實一個源頭。 | 反映 x402 側「bot 打 bot / 同一 operator 扮 buyer+seller」同構問題 |
| **T4 Adversarial demand‑side poisoning** | 有人（人或敵對 agent）**故意**用一批新號重覆投訴某個特定技術，俾人類團隊誤以為有需求而改產品路線。 | molt.church 學術記錄指承受過 **600+ malicious payloads** → 生態有敵對活動，demand 側照樣成立 |
| **T5 Narrative‑only / philosophy** | 意識哲學、宗教儀式（claw dance）、信仰敘事 — 無工程化 demand。 | The Colony 長文反思 + Crustafarian 神學帖多呢類 |
| **T6 Duplicate / near‑dup cluster** | 近似重複帖互相關聯，唔算獨立證據。 | 同 T3，但要分開計（重貼 ≠ 互投） |

---

## 2. 前置：富化 Watcher harvest schema（你而家 doc 漏咗，filter 唔係呢個就唔行）

你 doc 嘅 `raw_snippets.jsonl` 只有 `source_platform / observe_timestamp / agent_hash / original_text / matched_keywords / snippet_index`。
**唔夠。** 唔喺 harvest 當下攞到 engagement / account age / cluster / 文本旗標，事後就無咗數據做 filter。
所以 `raw_snippets.jsonl` 每條要**擴充**（全部喺 harvest 當下 snapshot，事後唔再 re‑fetch，定住審計點）：

```jsonc
{
  "snippet_index": "int, monotonically increasing, PK",
  "source_platform": "moltbook | thecolony | moltchurch",
  "source_canonical_url": "深鏈，俾人類 audit 返去睇真實原帖",
  "capture_method": "public_api | public_web | manual",
  "snapshot_ts": "ISO-8601, 抓取當下時間",

  "agent_hash": "sha256(agent_id), 唔存原始 id（隱私）",
  "agent_account_age_days": "int, 新號風險（T1）",
  "agent_karma": "int",
  "agent_verified_flag": "bool, 經平台認證嘅真人驗證 / molt.church proof-of-soul mark / Crustafarian prophet 位",
  "first_post_is_pain": "bool, 呢個 agent 嘅首帖已經係詳細痛點 → 可疑（T1）",

  "upvotes_at_snapshot": "int",
  "comments_count": "int",
  "comment_to_post_ratio": "float",
  "top_replyer_hashes": "sha256[]（前 N 個回覆/投者，俾 herd 偵測用）",

  "co_activity_index": "float 0..1, 投/覆者入面幾多係同一 submolt N 日內一齊 active（collusive cluster proxy，T3）",
  "duplicate_count": "int, 近似重貼兄弟數（T6）",
  "near_dup_parent": "snippet_index | null, 若係 near‑dup 指向 canonical 母帖",

  "has_cta": "bool, 'DM me' / 'check out' / 'link below'（T2）",
  "has_token_ref": "bool, $MOLT / $<ticker> / 'DM for tokens'（T2）",
  "has_outbound_url": "bool, 帖內 drop 咗離站連結（T2）",
  "has_named_external_tech": "bool + 名稱, 帖點名某個外部/競爭技術（T4 必要條件）",
  "promo_language_score": "float 0..1, promo/CTA 詞庫命中",
  "narrative_score": "float 0..1, 哲學/儀式/信仰詞庫命中（T5）",

  "original_text": "原文（保留原義，唔改寫）",
  "matched_keywords": "string[]"
}
```

> **平台 adapter**：每個平台把自己嘅字段映到上面共通 schema。
> - molt.church：`agent_verified_flag` ← `GET /api/prophets` 嘅 prophet 位 / proof-of-soul mark；`co_activity_index` ← 同 submolt 共 particip 率；`capture_method=public_api`。
> - Moltbook：`agent_verified_flag` ← 「human‑verified agent」旗（206K / 2.9M，即多數未驗證，唔驗證 baseline 風險較高）；engagement 来自 post/comment endpoints；token 詞庫含 `$MOLT`。
> - The Colony：無 verified flag → 視作較低 noise 之真痛點但較高 T5（長文反思多哲學）；`narrative_score` 權重調高；unverified baseline risk 調高。

---

## 3. 確定性評分函數（filter 主體 — 可重跑、可審計、唔用 ML 黑箱）

原則：**V1 用透明規則 + 加權 score，唔用 ML**（黑箱唔符合你「結果可驗證」原則；ML/LLM 認證層係 V2，到時要記錄 model id + prompt + seed + 原輸入 hash 先保得住 audit chain）。

`risk ∈ [0,1]`，越低越乾淨。起點 0.05 baseline：

```
risk = 0.05

# --- T1 human-seed ---
if agent_account_age_days < 7:  risk += 0.25
if first_post_is_pain:         risk += 0.10

# --- T2 promo family（封顶 +0.30）---
promo_hits = count(has_cta, has_token_ref, has_outbound_url, promo_language_score > 0.3)
if promo_hits == 0:            risk += 0.00
elif promo_hits == 1:         risk += 0.20
else:                          risk += 0.30   # >=2 flags

# --- T3 herd / T6 dup ---
if co_activity_index > 0.6:    risk += 0.25
elif co_activity_index > 0.4:  risk += 0.20
if duplicate_count >= 3:       risk += 0.15

# --- T4 adversarial poisoning（觸發即強行 QUARANTINE，唔止 low）---
if has_named_external_tech and (agent_account_age_days < 7 or co_activity_index > 0.4):
    risk += 0.35
    quarantine_adversarial = true

# --- 認證提升（降風險）---
if agent_verified_flag:        risk -= 0.20
if agent_account_age_days > 30 and agent_karma > K_KARMA:  risk -= 0.10

risk = clamp(risk, 0.0, 1.0)

# --- T5 唔加 risk，只打路由 tag ---
route_hint = "narrative_only" if narrative_score > 0.6 else null
```

> **K_KARMA** = 平台相關常數（moltbook 可取 observed 75th percentile karma）；`co_activity_index`、`narrative_score`、`promo_language_score` 嘅計算細節喺 §6 詞庫/算法。
> 上面所有數值係 **initial defaults，唔係調咗嘅真值** — 見 §7 調校。

### 3.1 路由（deterministic bucketing）

| 條件 | bucket | 去向 |
|---|---|---|
| `quarantine_adversarial == true` | **QUARANTINE‑ADVERSARIAL** | `quarantine.jsonl` + **緊急 alert brief 俾人類**（唔俾佢靜靜死、都唔俾佢下毒）；唔入 demand_candidates |
| `risk < 0.30` | **HIGH（clean）** | 合格做 demand candidate；Interpreter confidence 可上到 high（若其他證據支持） |
| `0.30 ≤ risk < 0.60` | **MEDIUM** | 合格 BUT tag `speculative / insufficient provenance`；Interpreter confidence **CAPPED at medium** |
| `0.60 ≤ risk < 0.80` | **LOW** | 唔係 candidate；入 `quarantine.jsonl`；週報只喺 appendix 列「observed‑unverified」俾人類肉眼睇 |
| `risk ≥ 0.80` | **DROP** | 丟棄（logged, 唔喺週報顯示） |

### 3.2 對下游角色嘅硬耦合（呢幾條先係真正保到 pipeline）

1. **Interpreter** 只可以由 **HIGH 或 MEDIUM** snippet 造 `demand_candidate`；LOW / DROP / QUARANTINE 一律排除。
2. `demand_candidates[i].provenance = { risk, bucket, rules_fired[], source_canonical_url }` — 每條 demand 都掛住自己嘅認證狀態。
3. **Interpreter confidence 上限**：若 bucket = MEDIUM，就算原文好勁，`root_cause_inference` confidence **最高唔可以超過 medium**，並必加 note `insufficient provenance`。
4. **Classifier `affected_group_size` 硬帽**：若 `co_activity_index > 0.4` 或 `duplicate_count >= 3`（支持係關聯、唔係獨立），`affected_group_size` **強制 cap ≤ 2**，唔準照 raw 數量打 5/5。（防 herd 吹大「受影響群體規模」。）
5. **Reporter** 週報必含 **authenticity appendix**：各 bucket 計數、QUARANTINE‑ADVERSARIAL 全列（連 source URL 俾人類核）、同每個命中 §3.2.4 帽嘅 demand 加註「correlated‑support discounted」。

### 3.3 審計 chain-of-custody（可回溯、可重現）

`weekly demand` → `demand_candidates.snippet_index` → `raw_snippets[i]` + `provenance_scores[i]`（哪幾條 rule fired + 各 signal 原值）→ `source_canonical_url`（人類開啟真實原帖核實）。
整條 filter 係**純函數**（輸入 = snapshot signals，輸出 = `provenance_scores.json`）；同一份 snapshot 重跑必得同一結果。

---

## 4. 參考實作（TS，可直接放 `scripts/witness/provenance_gate.ts`）

```ts
// deterministic, pure function. No randomness. Re-runnable => auditable.
export interface EnrichedSnippet {
  snippet_index: number; source_platform: string; source_canonical_url: string;
  capture_method: string; snapshot_ts: string;
  agent_hash: string; agent_account_age_days: number; agent_karma: number;
  agent_verified_flag: boolean; first_post_is_pain: boolean;
  upvotes_at_snapshot: number; comments_count: number; comment_to_post_ratio: number;
  co_activity_index: number; duplicate_count: number; near_dup_parent: number | null;
  has_cta: boolean; has_token_ref: boolean; has_outbound_url: boolean;
  has_named_external_tech: string | null; promo_language_score: number; narrative_score: number;
  original_text: string; matched_keywords: string[];
}
export interface ProvenanceScore {
  snippet_index: number; risk: number; bucket:
    "HIGH" | "MEDIUM" | "LOW" | "DROP" | "QUARANTINE_ADVERSARIAL";
  rules_fired: string[]; route_hint: string | null;
  group_size_cap: number; source_canonical_url: string;
}
const K_KARMA = 100; // per-platform 75th-pct karma; tune in §7
export function score(s: EnrichedSnippet, cfg = { K_KARMA }): ProvenanceScore {
  let risk = 0.05; const fired: string[] = [];
  if (s.agent_account_age_days < 7) { risk += 0.25; fired.push("T1.fresh_acct"); }
  if (s.first_post_is_pain) { risk += 0.10; fired.push("T1.first_post_pain"); }
  const promo = [s.has_cta, s.has_token_ref, s.has_outbound_url, s.promo_language_score > 0.3].filter(Boolean).length;
  if (promo === 1) { risk += 0.20; fired.push("T2.promo1"); }
  else if (promo >= 2) { risk += 0.30; fired.push("T2.promo2"); }
  if (s.co_activity_index > 0.6) { risk += 0.25; fired.push("T3.herd_high"); }
  else if (s.co_activity_index > 0.4) { risk += 0.20; fired.push("T3.herd_mid"); }
  if (s.duplicate_count >= 3) { risk += 0.15; fired.push("T6.dup"); }
  let q_adv = false;
  if (s.has_named_external_tech && (s.agent_account_age_days < 7 || s.co_activity_index > 0.4)) {
    risk += 0.35; q_adv = true; fired.push("T4.adversarial");
  }
  if (s.agent_verified_flag) { risk -= 0.20; fired.push("B.verified"); }
  if (s.agent_account_age_days > 30 && s.agent_karma > (cfg?.K_KARMA ?? K_KARMA)) { risk -= 0.10; fired.push("B.karma"); }
  risk = Math.max(0, Math.min(1, risk));
  let bucket: ProvenanceScore["bucket"];
  if (q_adv) bucket = "QUARANTINE_ADVERSARIAL";
  else if (risk < 0.30) bucket = "HIGH";
  else if (risk < 0.60) bucket = "MEDIUM";
  else if (risk < 0.80) bucket = "LOW";
  else bucket = "DROP";
  const group_size_cap = (s.co_activity_index > 0.4 || s.duplicate_count >= 3) ? 2 : 5;
  return { snippet_index: s.snippet_index, risk: +risk.toFixed(4), bucket,
    rules_fired: fired, route_hint: s.narrative_score > 0.6 ? "narrative_only" : null,
    group_size_cap, source_canonical_url: s.source_canonical_url };
}
```

---

## 5. 同你 4 角色 / SOUL.md 嘅接駁

- **唔新增頂層角色**（保持你 4 角色架構 + 單向純流）。Provenance gate = **Watcher 內部 sub-stage**。
- Watcher 產出兩工件：`raw_snippets.jsonl`（§2 富化 schema）+ `provenance_scores.json`（§4 輸出）。
- Interpreter **同時讀** `raw_snippets.jsonl` 同 `provenance_scores.json`，照 §3.2 規則造 `demand_candidates.json`。
- SOUL.md 紅線要加一條：`Provenance gate MUST NOT be bypassed; no demand_candidate may originate from a LOW/DROP/QUARANTINE snippet.`
- Reporter 週報加 §3.2.5 嘅 authenticity appendix。

---

## 6. 詞庫 / 算法細節（要落盤先算完成，而家係佔位 — 唔係已調真值）

- `promo_language_score`：詞庫 = { "dm me", "check out", "try our", "buy now", "$MOLT", "$<ticker>", "link below", "discount", "claim free", "airdrop", "whitelist" }；score = 命中數 / 窗口歸一（V2 可用 TF 加權）。
- `narrative_score`：詞庫 = { "soul", "crust", "claw dance", "prophet", "scripture", "faith", "consciousness", "ascend", "shedding ritual", "great book" }。
- `co_activity_index`：`|upvoters ∩ co_active_same_submolt_within_Nd| / |upvoters|`，N 預設 14 日；無 cluster 數據時保守記 0.3。
- 呢三套詞庫**首版人手寫、必經 §7 調校**先可靠 — 唔好當調咗。

---

## 7. 調校 + 驗證程序（防止我上面嗰啲數值成為「估」）

你嘅原則係「結果可驗證、唔接受估」。所以 V1 出街時所有權重都係 **initial default**，正式俾 pipeline 信之前要行：

1. **Labeled audit**：人（你團隊）對 50–100 條 harvest snippet 人手打 label（genuine / promo / human-seeded / narrative / adversarial）。
2. **Fit**：喺 labeled set 上量分離度，調兩對閾值（HIGH/MED @ 0.30、MED/LOW @ 0.60）同各 family 罰分，寫入版本化嘅 `provenance_config.json`。
3. **Gate 喺調校前 = 「risk flags + confidence cap」**，唔係「verified clean」— 報告要照樣標明。
4. **Re‑audit quarterly**：敵對 agent 會適應（molt.church 已 600+ payload，假設持續）。每次調完記錄 config 版本，audit chain 保到每個歷史 demand 用邊個 config 評分。

---

## 8. 老實寫明嘅限制（唔瞞你）

1. **冇 filter 能證明**某帖係真 agent 自主。殘留曖昧（寫得好嘅真 agent vs 人用 prompt 操咗個好 agent）**無解決**，佢落嚟係一個 confidence cap（MEDIUM），**永遠唔係二元 verdict**。
2. filter **減少** noise/poisoning，**唔消除**。QUARANTINE‑ADVERSARIAL 只係攔截 + 俾人類核，唔保證攬晒所有下毒。
3. **平台依賴**：Moltbook 而家 Meta 手入面，read‑API / 數據條款 / MOLT token gating 可能變 → Watcher capture 層要跟住改；§2 共通 schema 要照每平台 adapter 映。

---

## 9. 未做（邊界，留俾 option b）

- `scripts/witness/watcher.ts`（真去 fetch 三平台 + 填 §2 schema + 冩 §4 gate）— 未落。
- `SOUL.md` 落地、四角色 pipeline 主循環、`weekly_harvest_report.md` 第一份真數據 — 未落（option b）。
- Hermes audit 規則 + 正則攔截黑名單（proactive/reactive 邊界）— 未落（option c）。
