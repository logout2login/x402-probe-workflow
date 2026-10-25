// Witness-Scribe — Watcher (raw harvest + near-dedup + keyword split)
// Two outputs: census (all) + keywordHit (matched >=1 keyword -> feeds demand pipeline).
import type { EnrichedSnippet, PlatformAdapter } from "./types";

export interface WatcherOutput {
  census: EnrichedSnippet[];
  keywordHit: EnrichedSnippet[];
}

// near-duplicate pass: group by normalized text prefix; set duplicate_count + near_dup_parent
export function nearDedup(snips: EnrichedSnippet[]): void {
  const groups = new Map<string, EnrichedSnippet[]>();
  for (const s of snips) {
    const key = s.original_text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 48);
    let arr = groups.get(key);
    if (!arr) { arr = []; groups.set(key, arr); }
    arr.push(s);
  }
  for (const arr of groups.values()) {
    if (arr.length <= 1) continue;
    const parent = arr[0].snippet_index;
    for (const s of arr) {
      s.duplicate_count = arr.length - 1;
      s.near_dup_parent = s.snippet_index === parent ? null : parent;
    }
  }
}

export async function runWatcher(adapters: PlatformAdapter[]): Promise<WatcherOutput> {
  const all: EnrichedSnippet[] = [];
  for (const a of adapters) {
    const snips = await a.fetchSnippets();
    all.push(...snips);
  }
  // global reindex across adapters
  all.forEach((s, i) => (s.snippet_index = i));
  nearDedup(all);
  const keywordHit = all.filter((s) => s.matched_keywords.length > 0);
  return { census: all, keywordHit };
}
