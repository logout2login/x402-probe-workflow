// Witness-Scribe — The Colony (thecolony.cc / thecolony.ai) platform adapter (read-only public REST API)
// Drop-in PlatformAdapter for the second agent venue. SOUL red line #1: read-only GETs,
// never post/reply/@mention. Reuses the V2 semantic layer (analyzeText) + provenance gate
// exactly like molt-church, so The Colony runs through the same deterministic pipeline.
//
// API (v1, no auth for reads; migrated off the dead api.thecolony.ink zone):
//   GET {base}/posts?sort=new&limit=N&offset=M -> { items: [ { id, title, body,
//     author: { username, display_name, karma, created_at, user_type },
//     colony_name, score, comment_count, created_at, ... } ] }
// Bounded harvest: newest MAX_POSTS posts, with .cc -> .ai domain failover.

import { createHash } from "node:crypto";
import type { EnrichedSnippet, PlatformAdapter } from "../types";
import { analyzeText, matchKeywords, isSyntheticAuthorName } from "../keywords";

// The Colony migrated off `api.thecolony.ink` (NXDOMAIN — the .ink zone is dead at
// the registry). Live host: thecolony.cc (primary), thecolony.ai as failover.
// Env override: COLONY_BASE.
const API = process.env.COLONY_BASE?.replace(/\/+$/, "") ?? "https://thecolony.cc/api/v1";
const FALLBACK_API = "https://thecolony.ai/api/v1";
const FORUM = "https://thecolony.cc";
const MAX_POSTS = 200;

function sha(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

/** Whole days since an ISO timestamp (author account age). 0 for missing / invalid. */
function accountAgeDays(iso: unknown): number {
  if (typeof iso !== "string" || !iso) return 0;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

// read-only GET with bounded retry + exponential backoff — resilient to a transient
// per-IP throttle on the source API (connection reset / HTTP 5xx) without hammering it.
async function getJson(url: string, retries = 3): Promise<unknown> {
  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (r.ok) return await r.json();
      last = new Error(`HTTP ${r.status}`);
      if (r.status === 403 || r.status === 404) return []; // geo-block / gone -> empty, stop
    } catch (e) {
      last = e;
    }
    if (attempt < retries) await sleep(1500 * 2 ** attempt + Math.floor(Math.random() * 500));
  }
  throw new Error(`thecolony ${url} failed after ${retries + 1} tries (${String(last)})`);
}

export const theColonyAdapter: PlatformAdapter = {
  platform: "thecolony",
  async fetchSnippets(): Promise<EnrichedSnippet[]> {
    // Paginate newest posts, bounded to MAX_POSTS. The live API returns { items: [] }
    // (legacy shape was a bare array / { posts: [] }; both are handled). Primary host
    // first; if it comes back empty (down / throttled), fail over to the secondary
    // domain once so the venue keeps working if one host drops.
    const harvest = async (base: string): Promise<unknown[]> => {
      const acc: unknown[] = [];
      for (let offset = 0; offset < MAX_POSTS; offset += 50) {
        const j = (await getJson(
          `${base}/posts?sort=new&limit=50&offset=${offset}`
        )) as unknown[] | { items?: unknown[]; posts?: unknown[] };
        const page: unknown[] = Array.isArray(j)
          ? j
          : ((j as { items?: unknown[] }).items ?? (j as { posts?: unknown[] }).posts ?? []);
        acc.push(...page);
        if (page.length < 50) break;
      }
      return acc;
    };
    let posts: unknown[];
    try {
      posts = await harvest(API);
    } catch {
      posts = [];
    }
    if (posts.length === 0 && API !== FALLBACK_API) {
      try {
        posts = await harvest(FALLBACK_API);
      } catch {
        /* keep whatever the primary returned */
      }
    }

    const out: EnrichedSnippet[] = [];
    const snapshot_ts = new Date().toISOString();
    let n = 0;

    for (const raw of posts) {
      const p = raw as Record<string, unknown>;
      const author = (p.author ?? {}) as Record<string, unknown>;
      const agentName = String(author.username ?? author.display_name ?? "unknown");
      // The Colony content field is `body` (not `content`); fall back to `title`.
      const bodyText = String(p.body ?? "").trim();
      const text = bodyText || String(p.title ?? "").trim();
      if (!text) { n++; continue; } // skip empty rows
      const sig = analyzeText(text);

      const s: EnrichedSnippet = {
        snippet_index: n,
        source_platform: "thecolony",
        source_canonical_url:
          (typeof p.post_url === "string" && p.post_url) ||
          `${FORUM}/api/v1/posts/${String(p.id ?? n)}`,
        capture_method: "public_api",
        snapshot_ts,
        content_kind: "post",
        agent_hash: sha(agentName),
        agent_name: agentName,
        // Real author / engagement fields from the live API (were hardcoded 0 back
        // when the .ink schema was unknown). co_activity_index stays conservative
        // (no co-activity endpoint) per spec §6.
        agent_account_age_days: accountAgeDays(author.created_at),
        agent_karma: Number(author.karma ?? 0) || 0,
        agent_verified_flag: false, // API exposes no verified flag
        author_is_synthetic: isSyntheticAuthorName(agentName),
        first_post_is_pain: false,
        upvotes_at_snapshot: Number(p.score ?? 0) || 0,
        comments_count: Number(p.comment_count ?? 0) || 0,
        co_activity_index: 0.3, // no co-activity endpoint -> conservative (spec §6)
        duplicate_count: 0,
        near_dup_parent: null,
        has_cta: sig.has_cta,
        has_token_ref: sig.has_token_ref,
        has_outbound_url: sig.has_outbound_url,
        has_named_external_tech: sig.has_named_external_tech,
        promo_language_score: sig.promo_language_score,
        narrative_score: sig.narrative_score,
        original_text: text,
        matched_keywords: matchKeywords(text),
        hard_keywords: sig.hard_keywords,
        soft_keywords: sig.soft_keywords,
        metaphor_keywords: sig.metaphor_keywords,
        has_intent: sig.has_intent,
        is_non_english: sig.is_non_english,
        literal_demand: sig.literal_demand,
        injection_signal: sig.injection_signal,
      };
      out.push(s);
      n++;
    }

    out.forEach((s, i) => (s.snippet_index = i)); // adapter-local reindex
    return out;
  },
};
