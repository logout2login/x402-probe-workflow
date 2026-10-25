# Witness-Scribe — passive market-demand validator

Passive agent that harvests public autonomous-agent discourse, gates it through a
deterministic provenance/authenticity filter, and emits internal demand reports.
Goal: validate demand WITHOUT a sales team, WITHOUT touching the 503/bot-walled
x402 buyer directory, and WITHOUT posting into any forum (SOUL red line #1).

## Run (first harvest, real molt.church data — no mock)
From the project root `C:\Users\jerry\.qwenpaw\workspaces\my-agent\ownsite-aeo`:

```
npx tsx ./witness-scribe/src/run.ts
```

No new dependencies: Node 26 has global `fetch` + `node:crypto`; tsx is already a
devDependency. Artifacts land in:

```
C:\Users\jerry\.qwenpaw\workspaces\my-agent\ownsite-aeo\witness-scribe\data\
  raw_snippets.jsonl        # keyword-matched enriched snippets (verbatim original_text)
  raw_census.jsonl          # ALL harvested snippets (full audit)
  provenance_scores.json    # deterministic 5-bucket gate over the census
  demand_candidates.json    # Interpreter hypotheses (HIGH/MEDIUM only)
  assessed_demands.md       # Classifier A/B/C/D scoring
  quarantine.jsonl          # QUARANTINE_ADVERSARIAL + LOW (human review)
  weekly_harvest_report.md  # Reporter, internal-only
```

## Pipeline (4 roles, one pass)
Watcher -> Provenance gate -> Interpreter -> Classifier -> Reporter (see SOUL.md).
V1 was fully deterministic (no LLM). V2 added a **deterministic semantic layer**
(`keywords.ts` `analyzeText`: `literal_demand` / `injection_signal` / promo vs literal
splits) so demand extraction is keyword-based, re-runnable, and venue-agnostic — every
new venue is scored through the SAME gate.

## molt.church adaptation (what's real vs V1-default)
| field | status |
| --- | --- |
| content (canon 2312 + art) | **real**, via `GET /api/canon /api/art /api/prophets` |
| `agent_verified_flag` / `author_is_synthetic` | real — prophet list + name heuristics (TestBot/Curl/Dupe/ClawdHubTest) |
| `agent_account_age_days` | real for prophets (`joined_at`); art authors have unknown age -> 0 (treated fresh, honest) |
| `co_activity_index` | **V1-default 0.3** — molt.church has NO engagement endpoint |
| `upvotes_at_snapshot` / `comments_count` | **V1-default 0** — no engagement feed |
| `agent_karma` | **V1-default 0** — no karma exposed |

Consequence: the gate's T3 herd path only fires on `co_activity_index` (default 0.3 ->
never "herd_high"); real molt.church adversarial signal mostly comes through
`author_is_synthetic` + `agent_account_age_days` + `has_named_external_tech` (T4) and
the art "my human" human-seed tag (T1). That's the honest state of what this API
can tell us today. Add Moltbook/The Colony adapters (option a) to unlock real
`co_activity_index`, `upvotes`, `karma` — the schema already has the fields.

## Thresholds are INITIAL DEFAULTS — do not treat as tuned
`K_KARMA=100, HERD_MID=0.4, HERD_HIGH=0.6, T2 cap=0.30` are first-pass values from
the spec. Before any go/no-go decision, tune per the spec §7 procedure
(50 human-labeled samples, per-platform, log the 5-tuple). The V1 run here is a
**pipeline + data-shape validation**, not a calibrated provenance score.

## New venues — The Colony + Moltbook (done, real pipeline, no mock)
Adapters `src/platforms/thecolony.ts` + `src/platforms/moltbook.ts` implement
`PlatformAdapter` (same `fetchSnippets(): EnrichedSnippet[]` contract, `source_platform`
discriminant). `thecolony` fills real `upvotes_at_snapshot`/`comments_count`/`co_activity_index`
from the public REST API (no auth); `moltbook` degrades gracefully on 403 geo-block.
Run the multi-venue harvest with the REAL pipeline (Watcher -> provenance -> Interpreter ->
Classifier -> Reporter), writing `new_venues_*` so it never clobbers the molt-church run:

```
npx tsx ./witness-scribe/src/fetch_new_venues.ts
```

| venue | status | note |
| --- | --- | --- |
| The Colony (`api.thecolony.ink/v1`) | **live, public, schema-verified** | open REST, no auth; ~720 live posts. Can be per-IP throttled (adapters retry w/ backoff). |
| Moltbook (`www.moltbook.com/api/v1`) | **geo-blocked from this region (403)** | read-only endpoint captured; empty census recorded, run still completes. |

Adapters use bounded retry + exponential backoff so a transient source throttle does not
zero the harvest; a hard-blocked venue records its status in `data/new_venues_venue_status.json`
instead of crashing the run.
