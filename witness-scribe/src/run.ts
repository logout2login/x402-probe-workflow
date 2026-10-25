// Witness-Scribe — main pipeline runner (Watcher -> Provenance -> Interpreter -> Classifier -> Reporter)
// Read-only public harvesting. No posting/replying/@mentioning, ever (SOUL red line #1).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { moltChurchAdapter } from "./platforms/molt-church";
import { runWatcher } from "./watcher";
import { scoreAll } from "./provenance";
import { interpret } from "./interpreter";
import { classify } from "./classifier";
import { renderAssessedMd, renderWeeklyReport } from "./reporter";
import type { EnrichedSnippet, ProvenanceScore } from "./types";

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, "..", "data");

function jdump(x: unknown): string { return JSON.stringify(x, null, 2); }
function jl(lines: unknown[]): string { return lines.map((l) => JSON.stringify(l)).join("\n") + (lines.length ? "\n" : ""); }

export async function main(): Promise<void> {
  mkdirSync(DATA, { recursive: true });
  const run_ts = new Date().toISOString();

  // 1) Watcher: harvest census + keyword-matched
  const { census, keywordHit } = await runWatcher([moltChurchAdapter]);

  // 2) Provenance gate over the full census (auditable distribution)
  const provs: ProvenanceScore[] = scoreAll(census);

  // 3) Quarantine (adversarial + low) -> quarantine.jsonl
  const provByIdx = new Map(provs.map((p) => [p.snippet_index, p]));
  const quarantined: (EnrichedSnippet & { prov: ProvenanceScore })[] = [];
  for (const s of census) {
    const p = provByIdx.get(s.snippet_index)!;
    if (p.bucket === "QUARANTINE_ADVERSARIAL" || p.bucket === "LOW") quarantined.push({ ...s, prov: p });
  }

  // 4) Interpreter: demand candidates from keyword-hits in HIGH/MEDIUM
  const keywordProvs = keywordHit.map((s) => provByIdx.get(s.snippet_index)!);
  const cands = interpret(keywordHit, keywordProvs);

  // 5) Classifier: assess + route
  const assessed = classify(cands);

  // 6) Write artifacts
  const write = (name: string, content: string) => {
    writeFileSync(join(DATA, name), content, "utf8");
    console.log(`[witness] wrote ${join(DATA, name)}`);
  };

  write("raw_snippets.jsonl", jl(keywordHit));
  write("raw_census.jsonl", jl(census));
  write("provenance_scores.json", jdump(provs));
  write("demand_candidates.json", jdump(cands));
  write("assessed_demands.md", renderAssessedMd(assessed, cands));
  write("quarantine.jsonl", jl(quarantined));
  write(
    "weekly_harvest_report.md",
    renderWeeklyReport({
      run_ts,
      platform: "moltchurch",
      census,
      keywordHit,
      provs,
      cands,
      assessed,
    }),
  );

  // 7) Console summary (verifiable at a glance)
  const bucketCount = (b: string) => provs.filter((p) => p.bucket === b).length;
  console.log("\n=== WITNESS-SCRIBE RUN SUMMARY (molt.church) ===");
  console.log(`census (all snippets)      : ${census.length}`);
  console.log(`keyword-matched           : ${keywordHit.length} (census substring)`);
  console.log(`literal-demand (V2)       : ${census.filter((s) => s.literal_demand).length}`);
  console.log(`non-english snippets      : ${census.filter((s) => s.is_non_english).length}`);
  console.log(`injection probes (T7)     : ${census.filter((s) => s.injection_signal).length}`);
  console.log(`provenance buckets        : HIGH=${bucketCount("HIGH")} MEDIUM=${bucketCount("MEDIUM")} ` +
    `LOW=${bucketCount("LOW")} DROP=${bucketCount("DROP")} QUARANTINE_ADV=${bucketCount("QUARANTINE_ADVERSARIAL")}`);
  console.log(`demand candidates formed  : ${cands.length}`);
  console.log(`assessed (A/B/C/D)        : ` +
    `A=${assessed.filter((a) => a.routed_bucket === "A").length} ` +
    `B=${assessed.filter((a) => a.routed_bucket === "B").length} ` +
    `C=${assessed.filter((a) => a.routed_bucket === "C").length} ` +
    `D=${assessed.filter((a) => a.routed_bucket === "D").length}`);
  console.log(`top demand themes         : ` +
    cands.slice(0, 8).map((c) => `${c.theme}(${c.evidence_snippet_indexes.length})`).join(", "));
  console.log(`artifacts dir             : ${DATA}`);
}

// run.ts is a CLI entry — execute directly (no entrypoint guard; Windows+tsx breaks it).
void main().catch((e) => {
  console.error("witness run failed:", e);
  process.exit(1);
});
