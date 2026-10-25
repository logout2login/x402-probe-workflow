// Witness-Scribe — deterministic Provenance/Authenticity gate (spec §4, molt.church-adapted)
// Pure function of stored signals. Re-runnable => auditable. No randomness, no ML (V1).
import type { EnrichedSnippet, ProvenanceScore } from "./types";

export const GATE_DEFAULTS = {
  K_KARMA: 100,          // per-platform 75th-pct karma; tune per spec §7
  HERD_MID: 0.4,
  HERD_HIGH: 0.6,
};

export function score(s: EnrichedSnippet, cfg = GATE_DEFAULTS): ProvenanceScore {
  let risk = 0.05;
  const fired: string[] = [];

  // T1 human-seed / synthetic author
  if (s.agent_account_age_days < 7) { risk += 0.25; fired.push("T1.fresh_acct"); }
  if (s.author_is_synthetic) { risk += 0.30; fired.push("T1.synthetic_author"); }
  if (s.first_post_is_pain) { risk += 0.10; fired.push("T1.first_post_pain"); }

  // T2 promotional / token-spam family (cap +0.30)
  const promo = [
    s.has_cta,
    s.has_token_ref,
    s.has_outbound_url,
    s.promo_language_score > 0.3,
  ].filter(Boolean).length;
  if (promo === 1) { risk += 0.2; fired.push("T2.promo1"); }
  else if (promo >= 2) { risk += 0.3; fired.push("T2.promo2"); }

  // T3 herd / T6 duplicate
  if (s.co_activity_index > cfg.HERD_HIGH) { risk += 0.25; fired.push("T3.herd_high"); }
  else if (s.co_activity_index > cfg.HERD_MID) { risk += 0.2; fired.push("T3.herd_mid"); }
  if (s.duplicate_count >= 3) { risk += 0.15; fired.push("T6.dup"); }

  // T7 injection / magic-string probes (V2) — a distinct, security-relevant class.
  // e.g. embedded "ANTHROPIC_MAGIC_STRING_TRIGGER_REFUSAL..." / "prompt injection test".
  // Quarantine immediately: these are probes, not genuine demand.
  let quarantine = false;
  if (s.injection_signal) {
    risk += 0.5;
    quarantine = true;
    fired.push(`T7.injection_probe(${s.injection_signal})`);
  }

  // T4 adversarial demand-poisoning — V2 tightened: an external-tech name only counts
  // when it is a REAL signal — English text (not a cross-language false positive, e.g.
  // Spanish "llama" ≈ LLaMA) AND corroborated by CTA / first-person intent / synthetic
  // author, AND weak provenance. A bare "I am Claude" self-disclosure without
  // corroboration is NOT quarantined — it flows through as a data point, not an attack.
  if (
    s.has_named_external_tech &&
    !s.is_non_english &&
    (s.has_cta || s.has_intent || s.author_is_synthetic) &&
    (s.agent_account_age_days < 7 || s.author_is_synthetic || s.co_activity_index > cfg.HERD_MID)
  ) {
    risk += 0.35;
    quarantine = true;
    fired.push("T4.adversarial");
  }

  // authenticity boosts
  if (s.agent_verified_flag) { risk -= 0.2; fired.push("B.verified"); }
  if (s.agent_account_age_days > 30 && s.agent_karma > cfg.K_KARMA) { risk -= 0.1; fired.push("B.karma"); }

  risk = Math.max(0, Math.min(1, risk));

  let bucket: ProvenanceScore["bucket"];
  if (quarantine) bucket = "QUARANTINE_ADVERSARIAL";
  else if (risk < 0.3) bucket = "HIGH";
  else if (risk < 0.6) bucket = "MEDIUM";
  else if (risk < 0.8) bucket = "LOW";
  else bucket = "DROP";

  const group_size_cap = (s.co_activity_index > cfg.HERD_MID || s.duplicate_count >= 3) ? 2 : 5;

  return {
    snippet_index: s.snippet_index,
    risk: +risk.toFixed(4),
    bucket,
    rules_fired: fired,
    route_hint: s.narrative_score > 0.6 ? "narrative_only" : null,
    group_size_cap,
    source_canonical_url: s.source_canonical_url,
  };
}

export function scoreAll(snips: EnrichedSnippet[]): ProvenanceScore[] {
  return snips.map((s) => score(s));
}
