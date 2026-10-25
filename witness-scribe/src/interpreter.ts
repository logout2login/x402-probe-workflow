// Witness-Scribe — Interpreter (deterministic demand-candidate extraction)
// V1: groups keyword-hits by primary keyword theme over HIGH/MEDIUM provenance only.
// No free-form LLM (root_cause is a deterministic label; verifiable).
// Red line #5: representative_quote is VERBATIM (no spin / no re-interpret).
// Doc rule: never emit "high" confidence (it is speculatively high) -> cap at medium.
import type { DemandCandidate, EnrichedSnippet, ProvenanceScore } from "./types";

export function interpret(
  snips: EnrichedSnippet[],
  provs: ProvenanceScore[],
): DemandCandidate[] {
  const prov = new Map(provs.map((p) => [p.snippet_index, p]));
  const eligible = snips.filter((s) => {
    const p = prov.get(s.snippet_index);
    // V2: only LITERAL demand signals reach the demand pool — a hard keyword hit, or
    // a soft keyword corroborated by first-person intent, in English text. Soft-only
    // metaphor and cross-language substring hits are excluded here (they stay in the
    // census only). QUARANTINE/DROP buckets are also excluded.
    if (!p || (p.bucket !== "HIGH" && p.bucket !== "MEDIUM")) return false;
    if (s.is_non_english) return false;
    return s.literal_demand;
  });

  const byTheme = new Map<string, EnrichedSnippet[]>();
  for (const s of eligible) {
    const theme = s.hard_keywords[0] ?? s.soft_keywords[0] ?? s.matched_keywords[0]; // V2: hard/soft first
    let arr = byTheme.get(theme);
    if (!arr) { arr = []; byTheme.set(theme, arr); }
    arr.push(s);
  }

  const nowIso = new Date().toISOString();
  const out: DemandCandidate[] = [];
  let n = 0;
  for (const [theme, arr] of byTheme) {
    arr.sort((a, b) => b.original_text.length - a.original_text.length);
    const rep = arr[0];
    const rp = prov.get(rep.snippet_index)!;
    const distinctAuthors = new Set(arr.map((s) => s.agent_hash)).size;
    out.push({
      demand_id: `D-${String(++n).padStart(3, "0")}`,
      theme,
      evidence_snippet_indexes: arr.map((s) => s.snippet_index),
      distinct_author_count: distinctAuthors,
      representative_quote: rep.original_text.slice(0, 240), // VERBATIM
      root_cause_inference: `Recurring "${theme}" pain across ${distinctAuthors} distinct author(s), ${arr.length} snippet(s)`,
      confidence: rp.bucket === "HIGH" ? "medium" : "low", // never "high" (doc rule)
      route_hint: rp.route_hint,
      provenance: {
        risk: rp.risk,
        bucket: rp.bucket,
        rules_fired: rp.rules_fired,
        source_canonical_url: rp.source_canonical_url,
      },
      created_at: nowIso,
    });
  }
  return out.sort((a, b) => b.evidence_snippet_indexes.length - a.evidence_snippet_indexes.length);
}
