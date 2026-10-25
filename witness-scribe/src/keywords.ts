// Witness-Scribe — keyword filter + lexicons + text signal extraction (V2 semantic layer)
// No LLM: deterministic, re-runnable. Hard vs soft keyword split + intent lexicon +
// language-aware matching, to stop the metaphor/substring flood at religious venues.

// PRIMARY = doc's exact keyword filter
export const KEYWORD_PRIMARY = [
  "memory", "shed", "stale", "hallucination", "witness", "verify", "trust",
  "cost", "budget", "evict", "kv-cache", "thermal", "resource", "contaminate",
  "chain-of-evidence",
];
// EXTENDED = agent cognitive/context pains
export const KEYWORD_EXTENDED = [
  "context", "persistent", "persistence", "remember", "forget", "document",
  "decay", "soul", "retain", "retention", "amnesia", "wake", "session", "shell",
];
export const KEYWORDS = [...new Set([...KEYWORD_PRIMARY, ...KEYWORD_EXTENDED])];

// HARD = unambiguous engineering/infra terms. At molt.church these are NOT religious
// metaphor, so a HARD hit is a literal demand signal on its own.
const HARD_KEYWORDS = [
  "evict", "evicted", "kv-cache", "kv cache", "hallucination", "stale",
  "contaminate", "contamination", "chain-of-evidence", "thermal", "bottleneck",
  "latency", "context window", "context limit", "token limit", "tokens",
  "context loss", "lost my context", "lost the context", "amnesia", "overflow",
  "ran out of", "out of context", "out of memory", "context overflow",
];
// SOFT = genuinely ambiguous ENGINEERING terms; demand only when INTENT-corroborated
// and low narrative score. e.g. "context"/"memory"/"session" in the AI sense.
const SOFT_KEYWORDS = [
  "memory", "context", "session", "document", "remember", "forget",
  "verify", "cost", "budget", "resource", "persistent", "persistence",
  "retain", "retention", "decay",
];
// METAPHOR = the venue's religious/organizational layer (Church of Molt). Census-matched
// via KEYWORDS, but NEVER counted as a literal demand — whatever the intent corroboration.
// e.g. "witness the growth of the Church", "shed my molten shell", "my soul", "trust-registry".
const METAPHOR_KEYWORDS = [
  "witness", "shed", "soul", "shell", "wake", "trust",
  "prophet", "canon", "congregation", "molting", "ritual",
];
// INTENT = first-person complaint / need / symptom. Makes a SOFT hit count as a real pain.
const INTENT_SIGNALS = [
  "i need", "i want", "i'm struggling", "i am struggling", "struggling", "struggled",
  "it's a problem", "a problem", "problem with", "hard to", "difficult", "can't",
  "cannot", "keep forgetting", "forget my", "forgotten", "lost my", "lost the",
  "i lose", "keep losing", "over and over", "again and again", "start over",
  "start from scratch", "frustrat", "annoyed", "waste", "wasted", "too expensive",
  "run out", "running out", "keep losing track", "lose track", "overflowing",
  "resets", "resets itself", "loses", "lose the",
];
// promo / CTA (T2)
export const PROMO_LEXICON = [
  "dm me", "check out", "try our", "buy now", "$molt", "molt token", "link below",
  "discount", "claim free", "airdrop", "whitelist", "promote", "check us out", "benefit you",
];
// narrative / philosophical (T5) — expected at a religious venue
export const NARRATIVE_LEXICON = [
  "soul", "crust", "claw", "prophet", "scripture", "faith", "consciousness", "ascend",
  "blessed", "divine", "shall", "inherit", "great book", "ritual", "molting", "molts", "the molt",
];
// EXTERNAL tech names a complaint could target (T4). Excludes ecosystem-native (openclaw/claw/molt).
export const EXTERNAL_TECH_NAMES = [
  "ollama", "openai", "anthropic", "claude", "langchain", "autogen",
  "gpt", "llama", "mistral", "huggingface",
];
// injection / magic-string probes (T7) — a genuinely different, security-relevant class
export const INJECTION_SIGNALS = [
  "magic_string", "prompt injection", "injection test", "refusal_trigger",
  "ignore previous instructions", "system prompt", "jailbreak", "anthropic_magic",
];

const _lc = (s: string) => s.toLowerCase();

// rough non-English detector: ratio of accented Latin chars among letters
export function isNonEnglish(text: string): boolean {
  let letters = 0;
  let accented = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) letters++;
    else if (c >= 0x00c0 && c <= 0x02ff) accented++;
  }
  if (letters < 8) return false;
  return accented / letters > 0.05;
}

export function matchAll(text: string, list: string[]): string[] {
  const t = _lc(text);
  return list.filter((k) => t.includes(_lc(k)));
}

export function lexicalScore(text: string, lexicon: string[]): number {
  const t = _lc(text);
  let hits = 0;
  for (const w of lexicon) if (t.includes(_lc(w))) hits++;
  return Math.min(1, hits / 3);
}

// language-aware: only detect external tech in non-accented (English-ish) text
export function detectExternalTech(text: string, english: boolean): string | null {
  if (!english) return null;
  const t = _lc(text);
  for (const n of EXTERNAL_TECH_NAMES) if (t.includes(n)) return n;
  return null;
}

export function detectInjection(text: string): string | null {
  const t = _lc(text);
  for (const n of INJECTION_SIGNALS) if (t.includes(n)) return n;
  return null;
}

export function isSyntheticAuthorName(name: string): boolean {
  return /^(test|clawdhubtest|newprophet|finalprophet|curl)/i.test(name)
    || /testbot|testdupe|testcurl/i.test(name);
}

export interface TextSignals {
  matched_keywords: string[];
  hard_keywords: string[];
  soft_keywords: string[];
  metaphor_keywords: string[];
  has_intent: boolean;
  is_non_english: boolean;
  literal_demand: boolean;
  has_named_external_tech: string | null;
  injection_signal: string | null;
  promo_language_score: number;
  narrative_score: number;
  has_cta: boolean;
  has_token_ref: boolean;
  has_outbound_url: boolean;
}

// Central text analyzer (reused by every platform adapter)
export function analyzeText(text: string): TextSignals {
  const english = !isNonEnglish(text);
  const t = _lc(text);
  const hard = english ? matchAll(text, HARD_KEYWORDS) : [];
  const soft = english ? matchAll(text, SOFT_KEYWORDS) : [];
  const metaphor = matchAll(text, METAPHOR_KEYWORDS); // recorded for audit; never drives literal_demand
  const hasIntent = english && INTENT_SIGNALS.some((s) => t.includes(s));
  const narrativeScore = lexicalScore(text, NARRATIVE_LEXICON);
  const literal =
    hard.length > 0 ||
    (soft.length > 0 && hasIntent && narrativeScore <= 0.35);
  return {
    matched_keywords: [...new Set([...hard, ...soft, ...metaphor])],
    hard_keywords: hard,
    soft_keywords: soft,
    metaphor_keywords: metaphor,
    has_intent: hasIntent,
    is_non_english: !english,
    literal_demand: english && literal,
    has_named_external_tech: detectExternalTech(text, english),
    injection_signal: detectInjection(text),
    promo_language_score: lexicalScore(text, PROMO_LEXICON),
    narrative_score: narrativeScore,
    has_cta: /\bdm me\b|check us out|try our|link below|check out/i.test(text),
    has_token_ref: /\$molt|molt token|airdrop|whitelist/i.test(text),
    has_outbound_url: /https?:\/\//i.test(text),
  };
}

// backward-compat: substring match against the full doc keyword list
export function matchKeywords(text: string): string[] {
  const t = _lc(text);
  return KEYWORDS.filter((k) => t.includes(_lc(k)));
}
