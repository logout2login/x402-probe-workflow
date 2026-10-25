// ─── PublishGuard AEO Gate ───
// 分級：Blocked / Stale / Listed / Featured
// 底層 verifier 閘門（q ≥ 0.72、evidence ≥ 4）保持不變。
// 新增 AEO 專屬檢查：
//   1. schema required fields
//   2. TTL ≤ max_ttl
//   3. 面向 Agent 文本 pattern filter（拒絕 ignore/system:/instruction:/<|/long base64/long 0x-hex）
//   4. 24h 內 verification.json 重生成配額 ≤ 3
//
// 輸入的 v 是 verification.json（含簽名）。gate 不重算 q、不重拉 evidence。

import {
  AGENT_FACING_TEXT_FIELDS,
  BLOCKED_MIN_EVIDENCE,
  BLOCKED_MIN_Q,
  FEATURED_MAX_AGE_DAYS,
  FEATURED_MIN_DOMAINS,
  FEATURED_MIN_EVIDENCE,
  FEATURED_MIN_Q,
  FEATURED_MIN_SOURCE_DIVERSITY,
  LISTED_MIN_EVIDENCE,
  LISTED_MIN_Q,
  MAX_TTL_DAYS,
  REJECT_PATTERNS,
  type GateResult,
} from "../shared";

const REQUIRED_FIELDS = [
  "package_id",
  "spec_version",
  "q",
  "q_breakdown",
  "evidence",
  "evidence_count",
  "source_diversity",
  "verified_at",
  "expires_at",
  "verifier_version",
  "verifier_signature",
  "data_hash",
  "schema_url",
  "license",
  "hallucination_boundary",
] as const;

export interface GateConfig {
  now: Date;
  maxTtlDays?: number;
  lastRegenCount24h?: number;
  // schema 校驗錯誤數（外部注入；本 gate 不解析 JSON Schema）
  schemaValidationErrors?: number;
}

function collectReasons(v: unknown): string[] {
  const reasons: string[] = [];
  if (!v || typeof v !== "object") {
    reasons.push("not_object");
    return reasons;
  }
  const obj = v as Record<string, unknown>;
  for (const k of REQUIRED_FIELDS) {
    if (!(k in obj) || obj[k] === null || obj[k] === undefined) {
      reasons.push(`missing:${k}`);
    }
  }
  return reasons;
}

export function aeoGate(v: unknown, cfg: GateConfig): GateResult {
  const now = cfg.now;
  const maxTtlDays = cfg.maxTtlDays ?? MAX_TTL_DAYS;
  const regenCount = cfg.lastRegenCount24h ?? 0;
  const schemaErrors = cfg.schemaValidationErrors ?? 0;

  const reasons: string[] = [...collectReasons(v)];

  if (reasons.some(r => r.startsWith("missing:"))) {
    return { tier: "blocked", listed: false, featured: false, reasons };
  }

  const obj = v as Record<string, any>;
  const q = Number(obj.q);
  const ec = Number(obj.evidence_count);
  const expires = new Date(obj.expires_at);
  const verified = new Date(obj.verified_at);
  const evidence = Array.isArray(obj.evidence) ? obj.evidence : [];

  // schema validation
  if (schemaErrors > 0) reasons.push(`schema_errors:${schemaErrors}`);

  // blocked: q<0.65, evidence<3
  if (!Number.isFinite(q)) reasons.push("q_not_number");
  if (!Number.isFinite(ec)) reasons.push("evidence_count_not_number");
  if (Number.isFinite(q) && q < BLOCKED_MIN_Q) reasons.push("q_lt_blocked_min");
  if (Number.isFinite(ec) && ec < BLOCKED_MIN_EVIDENCE) reasons.push("evidence_lt_blocked_min");
  if (evidence.length !== ec) reasons.push(`evidence_count_mismatch:${ec}!=${evidence.length}`);

  // TTL
  if (!Number.isNaN(expires.getTime()) && !Number.isNaN(now.getTime())) {
    const maxTtl = new Date(now.getTime() + maxTtlDays * 86400_000);
    if (expires > maxTtl) reasons.push("ttl_exceeds_max");
  }

  // 文本安全
  for (const field of AGENT_FACING_TEXT_FIELDS) {
    const text = obj[field] === undefined ? "" : String(obj[field]);
    for (const { name, re } of REJECT_PATTERNS) {
      if (re.test(text)) reasons.push(`unsafe_text:${field}:${name}`);
    }
  }

  // 配額
  if (regenCount >= 3) reasons.push("regen_quota_exceeded");

  // Stale
  if (!Number.isNaN(expires.getTime()) && expires.getTime() <= now.getTime()) {
    return { tier: "stale", listed: false, featured: false, reasons: [...reasons, "expired"] };
  }

  // Listed 檢查
  const listedOk =
    Number.isFinite(q) && q >= LISTED_MIN_Q &&
    Number.isFinite(ec) && ec >= LISTED_MIN_EVIDENCE &&
    schemaErrors === 0 &&
    !reasons.some(r => r.startsWith("missing:") || r.startsWith("unsafe_text:") || r === "regen_quota_exceeded" || r.startsWith("ttl_"));

  if (!listedOk) {
    return { tier: "blocked", listed: false, featured: false, reasons };
  }

  // Featured 檢查
  const domains = new Set(evidence.map((e: any) => {
    try { return new URL(e.source_url).hostname; } catch { return ""; }
  }).filter(Boolean));
  const ageMs = now.getTime() - verified.getTime();
  const sourceDiversity = Number(obj.source_diversity ?? 0);

  const featured =
    Number.isFinite(q) && q >= FEATURED_MIN_Q &&
    Number.isFinite(ec) && ec >= FEATURED_MIN_EVIDENCE &&
    domains.size >= FEATURED_MIN_DOMAINS &&
    sourceDiversity >= FEATURED_MIN_SOURCE_DIVERSITY &&
    ageMs >= 0 && ageMs <= FEATURED_MAX_AGE_DAYS * 86400_000;

  return { tier: featured ? "featured" : "listed", listed: true, featured, reasons };
}
