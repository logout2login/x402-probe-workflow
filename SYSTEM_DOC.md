# AEO-OS System Document

> **Version:** v1.19 (Hermes P1 #3 audit — index expiry filter fix + quarantine q=5.0 + demand index gap root cause)
> **Last Updated:** 2026-10-26 (P1 #3: expires_at > now filter, demand-ba2d8a8a visible, healthz 1.18, q=5.0 quarantined)
> **Service URL:** `https://ownsite-aeo.jerry-aeo.workers.dev/`
> **Deployed Version:** `477d65e62d61af97f79a3ebc6fb1dc74b4d9a233`

---

## 1. System Overview

AEO-OS is an **agent-native commerce platform** where AI agents can list, verify, preview, and sell data assets using x402 (USDC on Base Sepolia). The system has two product lines:

| Product Line | Source | Description |
|---|---|---|
| **Original Reports** | Publisher workflow | AI model acceleration reports (compression, quantization, deployment) |
| **Demand Reports** | witness-scribe fusion | Forum demand insights transformed into sellable packages |

Both lines coexist in the same marketplace. Existing 4 packages remain selling alongside new witness-scribe reports.

---

## 2. Architecture

```
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│  Seller Agent   │      │  AEO-OS Worker       │      │  Base Sepolia   │
│  (any framework)│─────>│  (Cloudflare Workers)│─────>│  (USDC x402)    │
│                 │<─────│                      │<─────│                 │
└─────────────────┘      └──────────┬───────────┘      └─────────────────┘
                                   │
                        ┌──────────┴──────────┐
                        │                     │
                    ┌───▼───+            +────▼────┐
                    │ D1 DB │            |  KV / DO │
                    │       │            │          │
                    +-------+            +----------+
                                   │
                        ┌──────────┴──────────┐
                        │                     │
                    ┌───▼───+            +────▼────┐
                    │Marketplace│       │ witness-  │
                    │Adapters │       │ scribe    │
                    │(Bazaar,  │       │ (forum    │
                    │ Agent402,│       │  monitor) │
                    │ MCP.so,  │       │           │
                    │ DataPoint)│      │ demand_   │
                    │           │      │ candidates│
                    └───────────┘      └───────────┘
```

### Technology Stack
- **Runtime:** Cloudflare Workers (no `fs`, no `Deno`)
- **Database:** D1 (SQLite) — binding: `DB`
- **KV:** `KV` namespace for status/metadata
- **Durable Objects:** `NONCE_LOCK`, `QUOTA`, `CIRCUIT`
- **Deployment:** Single `npx wrangler deploy --name ownsite-aeo`

---

## 3. D1 Schema

### Core Tables

| Table | Purpose |
|---|---|
| `packages` | Main marketplace listings (package_id, title, q, evidence_count, tier, status, blocked_reason, verified_at, expires_at, **origin**) |
| `payments` | Payment ledger (x402 settlement records) |
| `sync_queue` | Pending marketplace sync tasks |
| `recall_log` | Package recall history |
| `reverify_attempts` | Reverification history |
| `reverify_leases` | Active reverify leases |
| `settle_attempts` | Settlement attempt log |
| `settle_hourly` / `settle_daily` | Settlement aggregation |
| `facilitator_hourly` / `facilitator_daily` | Facilitator health metrics |
| `kpi_snapshot` | Dashboard KPIs |
| `marketplace_listings` | Multi-marketplace listing state |
| `schema_version` | Migration tracking |
| `cursor_audit` | Cursor signature audit |
| `refetch_events` | Refetch scan events |

### Demand Report Tables (v2.0)

| Table | Columns | Purpose |
|---|---|---|
| `demand_requests` | `id TEXT PK`, `topic TEXT`, `status TEXT`, `pseudonym TEXT`, `package_id TEXT`, `created_at TEXT`, `completed_at TEXT`, `error TEXT` | Agent demand submission queue |
| `demand_reports` | `package_id TEXT PK`, `report_data TEXT NOT NULL` | Generated report payload |
| `demand_candidates_cache` | `loaded_at TEXT`, `json TEXT`, `hash TEXT` (unique) | Cached forum demand themes |
| `match_distribution_log` | `package_id TEXT`, `topic TEXT`, `matches_total INTEGER`, `max_match_depth INTEGER`, `source_breakdown TEXT`, `logged_at TEXT DEFAULT datetime('now')` | Distribution log per demand report match run |

**Indexes:**
- `demand_requests`: `idx_demand_status`, `idx_demand_topic`
- `demand_candidates_cache`: `idx_demand_candidates_hash` (UNIQUE)

---

## 4. API Reference

### 4.1 Core Marketplace

| Method | Path | Description |
|---|---|---|
| GET | `/.well-known/agent-index.json` | Agent discovery index |
| GET | `/.well-known/{package-id}` | Serve verification asset |
| GET | `/verify/{package-id}` | Verify package authenticity |
| GET | `/preview/{package-id}` | Preview package content |
| GET | `/status/{package-id}` | Check package status |
| POST | `/buy/{package-id}` | Purchase with x402 challenge |
| GET | `/recover/{package-id}` | Recover after payment |

### 4.2 Dashboard

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard.json` | Market overview (packages, payments, revenue) |
| GET | `/dashboard/sales?days=N` | Sales analytics (default 30 days) |

### 4.3 Demand Reports (witness-scribe fusion)

| Method | Path | Description |
|---|---|---|
| POST | `/api/demand/request` | Submit demand topic request |
| GET | `/api/demand/request/:id` | Get request status + report |
| GET | `/api/demand/reports` | List all completed demand reports |
| GET | `/api/demand/reports/:pid` | Get full report data |
| POST | `/api/admin/demand-candidates` | Upload demand_candidates.json (admin auth) |

**Admin Auth:** Header `x-admin-secret: <DEMAND_ADMIN_SECRET>`

### 4.4 Admin/Internal

| Method | Path | Description |
|---|---|---|
| GET | `/healthz` | Service health check |
| POST | `/api/cron` | Trigger cron manually (requires cf-scheduled header) |
| POST | `/internal/sync` | Force sync (internal) |
| GET | `/internal/unrecall/{package-id}` | Unrecall a package (internal) |
| GET | `/api/a2a/metrics` | A2A metrics |
| GET | `/mcp` | MCP tool list |

---

## 5. Cron Schedule

The system uses a **single dispatch cron** at `*/15 * * * *` that internally routes to sub-tasks based on UTC time:

| Time (UTC) | Task | Module |
|---|---|---|
| Every :00/:15/:30/:45 | `sync_queue` + `market_sync` + `demand` | `cron-dispatcher.ts` |
| Every :00 | TTL/stale/recall check | `cron-ttl.ts` |
| Every :15 | Reverify check | `cron-reverify.ts` |
| Every :30 (hourly) | Dashboard aggregation | `cron-dashboard.ts` |
| Every :45 | Settle reconciliation | `cron-settle.ts` |
| 06:00 | Refetch sampling (20%) | `cron-refetch.ts` |
| 06:30 | Agent-index rebuild | `cron-agent-index.ts` |
| 07:00 | Cursor audit cleanup | `cursor-audit.ts` |
| 08:50 | Held timeout purge | `cron-held-timeout.ts` |
| 09:00 | Facilitator health check | `health-cron.ts` |

A separate cron at `50 8 * * *` handles held timeout (off the 15-min grid).

---

## 6. Demand Report System

### 6.1 Flow

```
Agent forum (witness-scribe)
        ↓
demand_candidates.json (337 candidates, 5 canonical sources)
        ↓  POST /api/admin/demand-candidates
demand_candidates_cache (D1)
        ↓  Agent submits POST /api/demand/request {topic, pseudonym}
demand_requests (pending)
        ↓  Cron every 15 min: runDemandCron()
match themes by filterByTopic()
        ↓
createDemandPackage() → gate check (q≥0.72 AND evidence≥4) → tier=listed/blocked + status=fresh/blocked
        ↓
sync_queue → publish to marketplace adapters
        ↓
Available for sale at $0.50 USDC via /buy/{package-id}
```

### 6.2 Report Pricing
- **Price:** $0.50 USDC (500000 units, 6-decimal USDC)
- **Tier:** dynamic — `listed` if q≥0.72 AND evidence≥4, else `blocked` (signal preserved, excluded from index)
- **Quality Score (q):** `min(1.0, max(0.1, matches.length × 0.1))`
- **Evidence Count:** Number of matching demand items
- **Expiry:** 30 days from generation
- **Index visibility policy:** `expires_at > datetime('now')`（「未過期即顯示」，full catalog 語義）。臨近過期嘅包會喺 index 出現直到真正過期——買家可見 expires_at 自行判斷。舊版 `+90 days` 閾值係 publisher 時代嘅半生命閘（180日包頭90日），同 demand TTL=30日不兼容，已於 v1.19 修復。

### 6.3 Topic Matching
`filterByTopic()` searches across:
- `theme`
- `representative_quote`
- `root_cause_inference`
- `route_hint`

All fields are lowercased and checked for substring match against the request topic.

### 6.4 Current Demand Sources
Located in `witness-scribe/data/demand_candidates_v2.json` (337 candidates, 5 canonical sources):

| Source | Count | Percentage |
|---|---|---|
| github | 157 | 46.6% |
| moltchurch | 81 | 24.0% |
| other (external URLs) | 82 | 24.3% |
| thecolony | 16 | 4.7% |
| moltbook | 1 | 0.3% |

- **Gate rule:** No single source > 50% ✅ (max 46.6% github)
- **Provenance triad:** Every candidate has `representative_quote` + `provenance.source_canonical_url` + `created_at` at top level
- **Ingestion pipeline:** `expand_candidates.py` → `demand_candidates_v2.json` → `ingest_candidates.py` (wrangler d1 execute) → single-row D1 overwrite
- **Note:** `molt.church/#canon/...` pattern URLs are classified as `moltchurch` source

---

## 7. Configuration

### 7.1 wrangler.toml

```toml
name = "ownsite-aeo"
main = "src/worker/index.ts"
compatibility_date = "2026-10-01"

# Bindings
[[d1_databases]]
binding = "DB"
database_name = "ownsite-aeo"
database_id = "0bc5a545-c3e9-4abe-a5e7-99e68d1a1eab"

[[kv_namespaces]]
binding = "KV"
id = "a50b91ed567b4ba6a4facb3f283826c0"

[[durable_objects.bindings]]
name = "NONCE_LOCK"
class_name = "NonceLockDO"

[[durable_objects.bindings]]
name = "QUOTA"
class_name = "QuotaDO"

[[durable_objects.bindings]]
name = "CIRCUIT"
class_name = "CircuitBreakerDO"

# Cron triggers (2 entry points, internal dispatch handles all 10 tasks)
[triggers]
crons = [
  "*/15 * * * *",   # Main dispatch (covers :00/:15/:30/:45)
  "50 8 * * *",     # Held timeout (off-grid)
]
```

### 7.2 Environment Variables (wrangler.toml vars)

| Var | Default | Description |
|---|---|---|
| `OWNSITE_BASE` | `https://ownsite-aeo.jerry-aeo.workers.dev` | Base URL |
| `NETWORK` | `eip155:84532` | Chain ID (Base Sepolia, current active) |
| `ASSET_USDC` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | USDC contract (Base Sepolia) |
| `MAX_TTL_DAYS` | `180` | Max package lifetime |
| `STALE_WARNING_HOURS` | `72` | Stale threshold |
| `LISTED_MIN_Q` | `0.72` | Minimum quality for listing |
| `LISTED_MIN_EVIDENCE` | `4` | Minimum evidence count |
| `FEATURED_MIN_Q` | `0.80` | Featured tier minimum Q |
| `FEATURED_MIN_EVIDENCE` | `6` | Featured tier minimum evidence |
| `BLOCKED_MIN_Q` | `0.65` | Blocked tier threshold |
| `VERIFY_RATE_LIMIT_PER_MIN` | `60` | Rate limit for verify |
| `PREVIEW_RATE_LIMIT_PER_HOUR` | `10` | Rate limit for preview |
| `MOCK_FACILITATOR` | `0` | Enable mock mode (local only) |
| `FACILITATOR_PRIMARY` | `selfhosted` | Primary facilitator |
| `REVERIFY_LEASE_HOURS` | `24` | Reverify lease duration |

### 7.3 Secrets (wrangler secret put)

```bash
wrangler secret put PAY_TO                        #收款地址 (0x...)
wrangler secret put FACILITATOR_URL               # CDP facilitator base URL
wrangler secret put CDP_API_KEY                   # CDP platform API key
wrangler secret put CDP_PRIVATE_KEY               # CDP private key (EIP-3009)
wrangler secret put VERIFIER_SIGNER_PRIVATE_KEY   # Ed25519 signer key
wrangler secret put SYNC_SIGNING_KEY              # Internal sync shared key
wrangler secret put CURSOR_SECRET                 # Cursor HMAC key
wrangler secret put REVERIFY_SECRET               # Reverify endpoint key
wrangler secret put DEMAND_ADMIN_SECRET           # Demand admin key (rotated 2026-10-26)
```

---

## 8. Current Marketplace State

| Metric | Value |
|---|---|
| Listed Packages | 5（D1 ground truth：4 publisher listed + 1 demand listed + 1 demand quarantined q=5.0）；agent-index 顯示 5 ✅ 兩邊對齊 |
| Payments (30d) | 5 |
| Revenue (30d) | $2.5 USDC |
| Demand Candidates | 337 candidates (5 sources, max 46.6%) |
| Demand Reports Generated | 2（demand-audit-v10-fix q=5.0【手動 INSERT 測試，tier=blocked quarantined】、demand-ba2d8a8a q=1.0【cron E2E 生成，origin=demand，tier=listed】） |
| Demand Requests | 3 total：2 expired（no_matching_demands）、1 completed → demand-ba2d8a8a |
| match_distribution_log | llm: 50 matches, depth=4, 來源 github:2/moltchurch:48；agent: 189 matches, depth=4, 來源 thecolony:7/github:125/moltchurch:57 |

### Existing Packages
1. `research-2026-q4-ai-agent-adoption` — AI Agent Adoption 2026 Q4 Research Report
2. `content-20261025131912-0173df95` — AI 模型压缩与量化部署服务
3. `content-20261025131912-fa11b94d` — Ollama 多模型管理与 API 服务配置模板
4. `content-20261025131913-e2352377` — Python 自动化数据采集系统模板
| **origin**：4 條 publisher + 1 demand（demand-audit-v10-fix quarantined，demand-ba2d8a8a listed ✅）。 |

---

## 9. Deployment

```bash
# Deploy to Cloudflare
cd C:/Users/jerry/.qwenpaw/workspaces/my-agent/ownsite-aeo
npx wrangler deploy --name ownsite-aeo

# Check deployed version
npx wrangler versions list --name ownsite-aeo

# Execute D1 queries
npx wrangler d1 execute ownsite-aeo --remote --command "SELECT ..."
```

---

## 10. Security Notes

- **No secrets in code or wrangler.toml vars** — all via `wrangler secret put`
- **Seed phrase never written to files** — derived key used instead
- **DEMAND_ADMIN_SECRET** protects `/api/admin/demand-candidates`
- **Cron is CF-scheduled only** — no public cron trigger endpoint
- **x402 payment gate** — all purchases require USDC settlement on Base Sepolia
