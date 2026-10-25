// Witness-Scribe — Classifier (score impact/feasibility/affected_group_size + route A/B/C/D)
// affected_group_size HARD-CAPPED to 2 when support is correlated (herd/dup) — spec §3.2.4.
import type { AssessDemand, DemandCandidate } from "./types";

// themes where our attestation/agent infra is plausibly actionable (feasibility proxy)
const ACTIONABLE_THEMES = new Set([
  "memory", "context", "persistent", "persistence", "verify", "trust", "witness",
  "retain", "amnesia", "document", "chain-of-evidence", "resource", "cost", "budget",
]);

export function classify(cands: DemandCandidate[]): AssessDemand[] {
  return cands
    .map((c) => {
      const support = c.evidence_snippet_indexes.length;
      const authors = c.distinct_author_count;
      const correlated = c.provenance.rules_fired.some(
        (r) => r.startsWith("T3") || r.startsWith("T6"),
      );
      let group = Math.min(5, authors);
      if (correlated) group = Math.min(group, 2); // correlated support cap

      const impact = Math.min(5, 1 + Math.floor(support / 3) + (c.confidence === "medium" ? 1 : 0));
      const feasible = ACTIONABLE_THEMES.has(c.theme.toLowerCase());
      const feasibility = feasible ? 4 : 3;

      const narrative =
        c.route_hint === "narrative_only" || /soul|consciousness|faith|ascend/.test(c.theme);

      let routed_bucket: AssessDemand["routed_bucket"];
      if (narrative) routed_bucket = "D";
      else if (feasible && impact >= 3) routed_bucket = "A";
      else if (impact >= 2) routed_bucket = "B";
      else routed_bucket = "C";

      return {
        demand_id: c.demand_id,
        theme: c.theme,
        impact_score: impact,
        feasibility,
        affected_group_size: group,
        routed_bucket,
        rationale:
          `support=${support} snippet(s), ${authors} distinct author(s), confidence=${c.confidence}, ` +
          `provenance=${c.provenance.bucket}${correlated ? "; correlated-support capped to <=2" : ""}`,
        correlated_support_discounted: correlated,
      };
    })
    .sort(
      (a, b) =>
        a.routed_bucket.localeCompare(b.routed_bucket) ||
        b.impact_score - a.impact_score,
    );
}
