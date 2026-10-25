// Witness-Scribe — shared types
export type Platform = "moltchurch" | "moltbook" | "thecolony";

export interface EnrichedSnippet {
  snippet_index: number;
  source_platform: Platform;
  source_canonical_url: string;
  capture_method: "public_api" | "public_web" | "manual";
  snapshot_ts: string;
  content_kind: "canon" | "art" | "message" | "post";
  // author
  agent_hash: string;
  agent_name: string;
  agent_account_age_days: number;
  agent_karma: number;
  agent_verified_flag: boolean;   // legit (non-synthetic) author on this platform
  author_is_synthetic: boolean;   // test/dev bot or human-flagged author
  first_post_is_pain: boolean;
  // engagement snapshot (N/A at molt.church -> conservative defaults, spec §6)
  upvotes_at_snapshot: number;
  comments_count: number;
  co_activity_index: number;      // 0..1 collusive-cluster proxy
  duplicate_count: number;
  near_dup_parent: number | null;
  // textual flags
  has_cta: boolean;
  has_token_ref: boolean;
  has_outbound_url: boolean;
  has_named_external_tech: string | null;
  promo_language_score: number;
  narrative_score: number;
  original_text: string;
  matched_keywords: string[];
  // V2 semantic layer
  hard_keywords: string[];
  soft_keywords: string[];
  metaphor_keywords: string[];
  has_intent: boolean;
  is_non_english: boolean;
  literal_demand: boolean;
  injection_signal: string | null;
}

export interface ProvenanceScore {
  snippet_index: number;
  risk: number;
  bucket: "HIGH" | "MEDIUM" | "LOW" | "DROP" | "QUARANTINE_ADVERSARIAL";
  rules_fired: string[];
  route_hint: string | null;     // "narrative_only" | null
  group_size_cap: number;
  source_canonical_url: string;
}

export interface DemandCandidate {
  demand_id: string;
  theme: string;
  evidence_snippet_indexes: number[];
  distinct_author_count: number;
  representative_quote: string;   // VERBATIM — no spin (red line #5)
  root_cause_inference: string;   // deterministic label, NOT free-form LLM
  confidence: "medium" | "low";   // "high" is never emitted (spec: speculatively high)
  route_hint: string | null;
  provenance: {
    risk: number;
    bucket: ProvenanceScore["bucket"];
    rules_fired: string[];
    source_canonical_url: string;
  };
  created_at: string;
}

export interface AssessDemand {
  demand_id: string;
  theme: string;
  impact_score: number;          // 1-5
  feasibility: number;          // 1-5
  affected_group_size: number;  // 1-5, CAPPED by correlated support
  routed_bucket: "A" | "B" | "C" | "D";
  rationale: string;
  correlated_support_discounted: boolean;
}

export interface PlatformAdapter {
  platform: Platform;
  fetchSnippets(): Promise<EnrichedSnippet[]>;
}
