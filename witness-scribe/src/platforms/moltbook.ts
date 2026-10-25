// Witness-Scribe — Moltbook (moltbook.com) platform adapter (read-only public REST API)
// Drop-in PlatformAdapter. SOUL red line #1: read-only GETs, never post/reply/@mention.
// Reuses the V2 semantic layer + provenance gate like molt-church.
//
// API (v1, no auth for reads):
//   GET /posts?sort=new&limit=N&offset=M[&submolt=X] -> [{ id, title, body, author_name, ... }]
//   GET /submolts, /agents
// NOTE: from a China region the API is geo-blocked (403 "region not supported").
// This adapter degrades gracefully: on 403/404 it returns an empty census (not an error),
// so the multi-venue run still succeeds and records the venue as "unreachable from here".

import { createHash } from "node:crypto";
import type { EnrichedSnippet, PlatformAdapter } from "../types";
import { analyzeText, matchKeywords, isSyntheticAuthorName } from "../keywords";

const API = "https://www.moltbook.com/api/v1";
const MAX_POSTS = 200;

function sha(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

export const moltbookAdapter: PlatformAdapter = {
  platform: "moltbook",
  async fetchSnippets(): Promise<EnrichedSnippet[]> {
    const headers = { Accept: "application/json" };
    const posts: unknown[] = [];
    let statusOk = true;

    for (let offset = 0; offset < MAX_POSTS; offset += 50) {
      const r = await fetch(`${API}/posts?sort=new&limit=50&offset=${offset}`, { headers });
      if (!r.ok) {
        // 403 geo-block / 404 path -> stop, keep whatever we got (usually nothing).
        if (r.status === 403 || r.status === 404) break;
        statusOk = false;
        throw new Error(`moltbook /posts offset=${offset} -> HTTP ${r.status}`);
      }
      const j = (await r.json()) as unknown[] | { posts?: unknown[] };
      const page: unknown[] = Array.isArray(j) ? j : (j.posts ?? []);
      posts.push(...page);
      if (page.length < 50) break;
      void statusOk;
    }

    if (posts.length === 0) return []; // geo-blocked or no content yet

    const out: EnrichedSnippet[] = [];
    const snapshot_ts = new Date().toISOString();
    let n = 0;

    for (const raw of posts) {
      const p = raw as Record<string, unknown>;
      const text =
        [p.title, p.body, p.content, p.text].filter((x): x is string => typeof x === "string" && !!x)
          .join(" ")
          .trim();
      if (!text) { n++; continue; }
      const agentName =
        (typeof p.author_name === "string" && p.author_name) ||
        (typeof p.author === "string" && p.author) ||
        "unknown";
      const sig = analyzeText(text);

      const s: EnrichedSnippet = {
        snippet_index: n,
        source_platform: "moltbook",
        source_canonical_url:
          (typeof p.url === "string" && p.url) || `${API}/posts/${String(p.id ?? n)}`,
        capture_method: "public_api",
        snapshot_ts,
        content_kind: "post",
        agent_hash: sha(agentName),
        agent_name: agentName,
        agent_account_age_days: 0, // no author age -> fresh (conservative, spec §6)
        agent_karma: 0,
        agent_verified_flag: false,
        author_is_synthetic: isSyntheticAuthorName(agentName),
        first_post_is_pain: false,
        upvotes_at_snapshot: 0,
        comments_count: 0,
        co_activity_index: 0.3,
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

    out.forEach((s, i) => (s.snippet_index = i));
    return out;
  },
};
