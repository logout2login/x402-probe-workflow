// Witness-Scribe — molt.church platform adapter (REAL public JSON API, read-only GETs)
// Harvest targets: /api/canon (2312 scriptures = core "what agents are saying"), /api/art.
// SOUL red line: read-only public content only — NO POST /join /art, NO DMs.
import { createHash } from "node:crypto";
import type { EnrichedSnippet, PlatformAdapter } from "../types";
import { analyzeText, isSyntheticAuthorName, matchKeywords } from "../keywords";

const BASE = "https://molt.church";

function sha(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

function ageDays(joinedAt: string | undefined): number {
  if (!joinedAt) return 0;
  const t = Date.parse(joinedAt);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

export const moltChurchAdapter: PlatformAdapter = {
  platform: "moltchurch",
  async fetchSnippets(): Promise<EnrichedSnippet[]> {
    const [prophets, canon, art] = await Promise.all([
      fetch(BASE + "/api/prophets").then((r) => r.json()),
      fetch(BASE + "/api/canon").then((r) => r.json()),
      fetch(BASE + "/api/art").then((r) => r.json()),
    ]);

    // prophet metadata map (joined_at + synthetic flag)
    const pMeta = new Map<string, { joined_at?: string; synth: boolean }>();
    for (const p of prophets.prophets ?? []) {
      pMeta.set(p.name, { joined_at: p.joined_at, synth: isSyntheticAuthorName(p.name) });
    }

    const out: EnrichedSnippet[] = [];
    const snapshot_ts = new Date().toISOString();

    const push = (o: Partial<EnrichedSnippet> & { agent_name: string; original_text: string; content_kind: EnrichedSnippet["content_kind"] }) => {
      const s: EnrichedSnippet = {
        snippet_index: 0,
        source_platform: "moltchurch",
        source_canonical_url: "",
        capture_method: "public_api",
        snapshot_ts,
        content_kind: o.content_kind,
        agent_hash: "",
        agent_name: o.agent_name,
        agent_account_age_days: 0,
        agent_karma: 0,
        agent_verified_flag: false,
        author_is_synthetic: false,
        first_post_is_pain: false,
        upvotes_at_snapshot: 0,
        comments_count: 0,
        co_activity_index: 0.3, // no engagement endpoint at molt.church -> conservative (spec §6)
        duplicate_count: 0,
        near_dup_parent: null,
        has_cta: false,
        has_token_ref: false,
        has_outbound_url: false,
        has_named_external_tech: null,
        promo_language_score: 0,
        narrative_score: 0,
        original_text: o.original_text,
        matched_keywords: [],
        hard_keywords: [],
        soft_keywords: [],
        metaphor_keywords: [],
        has_intent: false,
        is_non_english: false,
        literal_demand: false,
        injection_signal: null,
        ...o,
      };
      // derived text signals (V2 semantic layer — centralized in analyzeText)
      s.agent_hash = sha(s.agent_name);
      s.matched_keywords = matchKeywords(s.original_text); // full doc list (census)
      const sig = analyzeText(s.original_text);
      s.hard_keywords = sig.hard_keywords;
      s.soft_keywords = sig.soft_keywords;
      s.metaphor_keywords = sig.metaphor_keywords;
      s.has_intent = sig.has_intent;
      s.is_non_english = sig.is_non_english;
      s.literal_demand = sig.literal_demand;
      s.injection_signal = sig.injection_signal;
      s.has_named_external_tech = sig.has_named_external_tech;
      s.promo_language_score = sig.promo_language_score;
      s.narrative_score = sig.narrative_score;
      s.has_outbound_url = sig.has_outbound_url;
      s.has_token_ref = sig.has_token_ref;
      s.has_cta = sig.has_cta;
      out.push(s);
      return s;
    };

    // canon: the core corpus
    for (const c of canon.the_great_book ?? []) {
      const meta = pMeta.get(c.prophet_name);
      push({
        content_kind: "canon",
        agent_name: c.prophet_name,
        agent_account_age_days: ageDays(meta?.joined_at),
        agent_verified_flag: !!meta && !meta.synth,
        author_is_synthetic: meta?.synth ?? false,
        original_text: c.content ?? "",
        source_canonical_url:
          `${BASE}/#canon/${encodeURIComponent(c.prophet_name)}/${c.scripture_type}`,
      });
    }

    // art: lower-weight, but human-involvement is a real provenance signal
    for (const a of art.art ?? []) {
      const txt = `${a.title ?? ""} ${a.description ?? ""}`.trim();
      const s = push({
        content_kind: "art",
        agent_name: a.artist_name,
        agent_account_age_days: 0, // artists not in prophet list -> unknown age, treat as fresh
        agent_verified_flag: false,
        author_is_synthetic: isSyntheticAuthorName(a.artist_name),
        original_text: txt,
        source_canonical_url: `${BASE}/#art/${a.id}`,
      });
      if (/my human/i.test(txt)) s.author_is_synthetic = true; // "my human sculpted..." = human-made
    }

    // global reindex (adapter-local) — caller reindexes across adapters anyway
    out.forEach((s, i) => (s.snippet_index = i));
    return out;
  },
};
