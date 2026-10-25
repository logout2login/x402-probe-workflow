#!/usr/bin/env tsx
// Witness-Scribe — new-venue fetcher: The Colony (live, public REST API) + Moltbook (geo-guarded).
// Read-only / observational (SOUL red lines: no post/reply/@mention/promote).
//
// Runs the SAME deterministic pipeline as run.ts (Watcher -> Provenance -> Interpreter ->
// Classifier -> Reporter), but over the two NEW venues, and writes data/new_venues_*
// so it never clobbers the molt-church run. Moltbook degrades to an empty census when
// geo-blocked; The Colony yields a real census.
//
// Usage:  node_modules/.bin/tsx witness-scribe/src/fetch_new_venues.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { theColonyAdapter } from "./platforms/thecolony";
import { moltbookAdapter } from "./platforms/moltbook";
import { runWatcher } from "./watcher";
import { scoreAll } from "./provenance";
import { interpret } from "./interpreter";
import { classify } from "./classifier";
import { renderAssessedMd, renderWeeklyReport } from "./reporter";
import type { ProvenanceScore } from "./types";

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, "..", "data");

function jdump(x: unknown): string { return JSON.stringify(x, null, 2); }
function jl(lines: unknown[]): string {
  return lines.map((l) => JSON.stringify(l)).join("\n") + (lines.length ? "\n" : "");
}

async function main(): Promise<void> {
  mkdirSync(DATA, { recursive: true });
  const run_ts = new Date().toISOString();

  // per-venue fetch status (graceful degradation for a geo-blocked venue)
  const venueStatus: Record<string, { ok: boolean; note?: string; count: number }> = {};
  const adapters = [];
  try {
    const cs = await theColonyAdapter.fetchSnippets();
    venueStatus.thecolony = { ok: true, count: cs.length };
    adapters.push(theColonyAdapter);
  } catch (e) {
    venueStatus.thecolony = { ok: false, note: String((e as Error).message), count: 0 };
  }
  try {
    const ms = await moltbookAdapter.fetchSnippets();
    venueStatus.moltbook = {
      ok: true,
      count: ms.length,
      note: ms.length === 0 ? "0 posts (empty or geo-blocked from this region)" : undefined,
    };
    adapters.push(moltbookAdapter);
  } catch (e) {
    venueStatus.moltbook = { ok: false, note: String((e as Error).message), count: 0 };
  }

  // 1) Watcher: census + keyword-matched across both venues
  const { census, keywordHit } = await runWatcher(adapters);

  // 2) Provenance gate over the full census
  const provs: ProvenanceScore[] = scoreAll(census);
  const provByIdx = new Map(provs.map((p) => [p.snippet_index, p]));
  const quarantined = census
    .filter((s) => {
      const p = provByIdx.get(s.snippet_index)!;
      return p.bucket === "QUARANTINE_ADVERSARIAL" || p.bucket === "LOW";
    })
    .map((s) => ({ ...s, prov: provByIdx.get(s.snippet_index)! }));

  // 3) Interpreter: demand candidates from keyword-hits in HIGH/MEDIUM
  const keywordProvs = keywordHit.map((s) => provByIdx.get(s.snippet_index)!);
  const cands = interpret(keywordHit, keywordProvs);

  // 4) Classifier: assess + route
  const assessed = classify(cands);

  // 5) Write venue-prefixed artifacts (never clobber the molt-church run)
  const write = (name: string, content: string) => {
    writeFileSync(join(DATA, name), content, "utf8");
    console.log(`[new-venues] wrote ${join(DATA, name)}`);
  };
  write("new_venues_venue_status.json", jdump(venueStatus));
  write("new_venues_raw_census.jsonl", jl(census));
  write("new_venues_provenance.json", jdump(provs));
  write("new_venues_candidates.json", jdump(cands));
  write("new_venues_assessed.md", renderAssessedMd(assessed, cands));
  write("new_venues_quarantine.jsonl", jl(quarantined));
  write(
    "new_venues_report.md",
    renderWeeklyReport({
      run_ts,
      platform: "moltbook+thecolony",
      census,
      keywordHit,
      provs,
      cands,
      assessed,
    }),
  );

  // 6) Console summary — per-venue breakdown
  const countByVenue = (pf: string) => census.filter((s) => s.source_platform === pf).length;
  const bucketCount = (b: string) => provs.filter((p) => p.bucket === b).length;
  console.log("\n=== NEW-VENUE HARVEST (The Colony + Moltbook) ===");
  console.log(`venue status:`);
  for (const [k, v] of Object.entries(venueStatus)) {
    console.log(`  ${k.padEnd(9)} ${v.ok ? "OK" : "ERR"}  count=${v.count}${v.note ? "  (" + v.note + ")" : ""}`);
  }
  console.log(`census (all snippets)     : ${census.length}  (thecolony=${countByVenue("thecolony")} moltbook=${countByVenue("moltbook")})`);
  console.log(`keyword-matched           : ${keywordHit.length}`);
  console.log(`literal-demand (V2)       : ${census.filter((s) => s.literal_demand).length}`);
  console.log(`injection probes (T7)     : ${census.filter((s) => s.injection_signal).length}`);
  console.log(
    `provenance buckets        : HIGH=${bucketCount("HIGH")} MEDIUM=${bucketCount("MEDIUM")} ` +
      `LOW=${bucketCount("LOW")} DROP=${bucketCount("DROP")} QUARANTINE_ADV=${bucketCount("QUARANTINE_ADVERSARIAL")}`,
  );
  console.log(`demand candidates formed  : ${cands.length}`);
  console.log(
    `assessed (A/B/C/D)        : A=${assessed.filter((a) => a.routed_bucket === "A").length} ` +
      `B=${assessed.filter((a) => a.routed_bucket === "B").length} ` +
      `C=${assessed.filter((a) => a.routed_bucket === "C").length} ` +
      `D=${assessed.filter((a) => a.routed_bucket === "D").length}`,
  );
  console.log(`artifacts dir             : ${DATA}`);
}

// CLI entry — execute directly (no entrypoint guard; Windows+tsx breaks it).
void main().catch((e) => {
  console.error("new-venue run failed:", e);
  process.exit(1);
});
