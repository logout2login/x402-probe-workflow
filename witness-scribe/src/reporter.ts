// Witness-Scribe — Reporter (weekly_harvest_report.md + authenticity appendix)
import type {
  AssessDemand,
  DemandCandidate,
  EnrichedSnippet,
  ProvenanceScore,
} from "./types";

interface ReportInput {
  run_ts: string;
  platform: string;
  census: EnrichedSnippet[];
  keywordHit: EnrichedSnippet[];
  provs: ProvenanceScore[];
  cands: DemandCandidate[];
  assessed: AssessDemand[];
}

function bucketCounts(provs: ProvenanceScore[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const p of provs) c[p.bucket] = (c[p.bucket] ?? 0) + 1;
  return c;
}

export function renderWeeklyReport(i: ReportInput): string {
  const buckets = bucketCounts(i.provs);
  const quarantined = i.provs.filter((p) => p.bucket === "QUARANTINE_ADVERSARIAL");
  const lowUnverified = i.provs.filter((p) => p.bucket === "LOW");
  const dropped = buckets["DROP"] ?? 0;
  const byTheme = [...i.assessed].sort((a, b) =>
    a.routed_bucket.localeCompare(b.routed_bucket) || b.impact_score - a.impact_score,
  );

  const L: string[] = [];
  L.push("# Witness-Scribe — Weekly Harvest Report");
  L.push("");
  L.push(`> run: ${i.run_ts}  |  platform: ${i.platform} (read-only public content)`);
  L.push(`> V1 provenance gate: thresholds are INITIAL DEFAULTS, not yet tuned (see spec §7).`);
  L.push("");
  L.push("## 1. Census & keyword coverage");
  L.push("");
  L.push("| metric | value |");
  L.push("| --- | --- |");
  L.push(`| snippets harvested (census) | ${i.census.length} |`);
  L.push(`| keyword-matched | ${i.keywordHit.length} |`);
  L.push(`| HIGH (clean) | ${buckets["HIGH"] ?? 0} |`);
  L.push(`| MEDIUM | ${buckets["MEDIUM"] ?? 0} |`);
  L.push(`| LOW (observed-unverified) | ${lowUnverified.length} |`);
  L.push(`| DROP (discarded) | ${dropped} |`);
  L.push(`| QUARANTINE_ADVERSARIAL | ${quarantined.length} |`);
  L.push(`| demand candidates formed | ${i.cands.length} |`);
  L.push("");

  L.push("## 2. Demand themes (routed)");
  L.push("");
  L.push("| id | theme | bucket | impact | feas | group(size) | confidence | note |");
  L.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const a of byTheme) {
    const c = i.cands.find((x) => x.demand_id === a.demand_id);
    L.push(
      `| ${a.demand_id} | ${a.theme} | ${a.routed_bucket} | ${a.impact_score} | ` +
      `${a.feasibility} | ${a.affected_group_size}${a.correlated_support_discounted ? "*" : ""} | ` +
      `${c?.confidence ?? "-"} | ${a.correlated_support_discounted ? "correlated-support" : "—"} |`,
    );
  }
  L.push("");
  L.push(`\\* = affected_group_size capped (correlated support, spec §3.2.4).`);
  L.push("");

  const top = byTheme.filter((a) => a.routed_bucket !== "D").slice(0, 5);
  L.push("## 3. Top demands (non-narrative) with VERBATIM evidence");
  L.push("");
  for (const a of top) {
    const c = i.cands.find((x) => x.demand_id === a.demand_id)!;
    L.push(`### ${a.demand_id} — ${a.theme}  [${a.routed_bucket}]  conf=${c.confidence}`);
    L.push(`- ${a.rationale}`);
    L.push(`- evidence: ${c.evidence_snippet_indexes.length} snippet(s), ${c.distinct_author_count} distinct author(s)`);
    L.push(`- provenance: ${c.provenance.bucket} (risk=${c.provenance.risk}, rules=[${c.provenance.rules_fired.join(", ")}])`);
    L.push(`- source: ${c.provenance.source_canonical_url}`);
    L.push(`- quote (verbatim): > ${c.representative_quote.replace(/\n/g, " ")}`);
    L.push("");
  }

  L.push("## 4. Authenticity appendix (audit)");
  L.push("");
  L.push("### QUARANTINE_ADVERSARIAL — possible demand-side poisoning, human review required");
  if (quarantined.length === 0) L.push("- (none)");
  for (const p of quarantined.slice(0, 20)) {
    const s = i.census[p.snippet_index];
    L.push(
      `- snippet#${p.snippet_index} agent=${s?.agent_name} tech=${s?.has_named_external_tech} ` +
      `risk=${p.risk} rules=[${p.rules_fired.join(",")}] src=${p.source_canonical_url}`,
    );
  }
  L.push("");
  L.push(`### LOW observed-unverified: ${lowUnverified.length} snippet(s) (held out of demand pipeline)`);
  L.push(`### DROP (discarded, logged only): ${dropped}`);
  L.push("");
  L.push("> Every demand above traces back to provenance_scores.json + raw_snippets.jsonl -> source_canonical_url.");
  L.push("");
  return L.join("\n");
}

export function renderAssessedMd(assessed: AssessDemand[], cands: DemandCandidate[]): string {
  const L: string[] = ["# Assessed Demands", ""];
  const order = ["A", "B", "C", "D"] as const;
  const label: Record<string, string> = {
    A: "立即可做", B: "需要資源", C: "觀望", D: "敘事/信仰/哲學 (丟棄)",
  };
  for (const b of order) {
    const rows = assessed.filter((a) => a.routed_bucket === b);
    if (rows.length === 0) continue;
    L.push(`## Bucket ${b} — ${label[b]}`);
    L.push("");
    L.push("| id | theme | impact | feas | group | rationale |");
    L.push("| --- | --- | --- | --- | --- | --- |");
    for (const a of rows) L.push(`| ${a.demand_id} | ${a.theme} | ${a.impact_score} | ${a.feasibility} | ${a.affected_group_size} | ${a.rationale} |`);
    L.push("");
  }
  return L.join("\n");
}
