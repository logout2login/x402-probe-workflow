// ─── 全域常數 ───
// 底層 verifier 閘門（q ≥ 0.72、evidence ≥ 4）保持不變。

export const SPEC_VERSION = "1.0" as const;

// ─── 閘門常數（單一來源）───
export const BLOCKED_MIN_Q = 0.65;
export const BLOCKED_MIN_EVIDENCE = 3;
export const LISTED_MIN_Q = 0.72;
export const LISTED_MIN_EVIDENCE = 4;
export const FEATURED_MIN_Q = 0.80;
export const FEATURED_MIN_EVIDENCE = 6;
export const FEATURED_MIN_DOMAINS = 3;
export const FEATURED_MAX_AGE_DAYS = 14;
export const FEATURED_MIN_SOURCE_DIVERSITY = 0.5;
export const MAX_TTL_DAYS = 180;
export const STALE_WARNING_HOURS = 72;
export const RECALL_Q_THRESHOLD = 0.68;
export const REFETCH_HASH_MATCH_MIN = 0.90;
export const MAX_REGENERATE_PER_24H = 3;

// ─── 定價（USDC 6 位小數 = base units）───
export const PRICE_STANDARD_6DECIMAL = "500000"; // $0.50
export const PRICE_FEATURED_6DECIMAL = "1000000"; // $1.00

// ─── 速率限制 ───
export const VERIFY_RATE_LIMIT_PER_MIN = 60;
export const PREVIEW_RATE_LIMIT_PER_HOUR = 10;
export const SUSPECTED_SCRAPER_THRESHOLD_PER_HOUR = 200;

// ─── KV TTL（秒）───
export const TX_REPLAY_TTL_SECONDS = 30 * 24 * 3600; // 30 天
export const RATE_BUCKET_TTL_SECONDS = 7200;
export const WELLMKNOW_CACHE_TTL_SECONDS = 60;

// ─── 匯總（供 wrangler.toml / 配置文件參考）───
export const POLICY = {
  BLOCKED_MIN_Q,
  BLOCKED_MIN_EVIDENCE,
  LISTED_MIN_Q,
  LISTED_MIN_EVIDENCE,
  FEATURED_MIN_Q,
  FEATURED_MIN_EVIDENCE,
  FEATURED_MIN_DOMAINS,
  FEATURED_MAX_AGE_DAYS,
  FEATURED_MIN_SOURCE_DIVERSITY,
  MAX_TTL_DAYS,
  STALE_WARNING_HOURS,
  RECALL_Q_THRESHOLD,
  REFETCH_HASH_MATCH_MIN,
  MAX_REGENERATE_PER_24H,
} as const;

export const HALUCINATION_BOUNDARY_TEMPLATE =
  "Evidence excerpts are verifier-validated at verified_at. Downstream interpretation is caller responsibility.";

export const SIGNING_FIELDS = [
  "package_id",
  "q",
  "evidence_count",
  "verified_at",
  "expires_at",
  "data_hash",
] as const;

// 面向 Agent 的文本字段（模板化 + pattern filter）
export const AGENT_FACING_TEXT_FIELDS = [
  "description",
  "hallucination_boundary",
] as const;

// PublishGuard 拒絕的 token pattern（對應計劃書 A6 reject_patterns）
export const REJECT_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "ignore_previous", re: /ignore\s+previous/i },
  { name: "system_colon", re: /system\s*:/i },
  { name: "instruction_colon", re: /instruction\s*:/i },
  { name: "openai_sep", re: /<\|/ },
  { name: "long_base64", re: /[A-Za-z0-9+/]{80,}={0,2}/ },
  { name: "long_hex_0x", re: /0x[0-9a-fA-F]{64,}/ },
];

export const SUPPORTED_NETWORKS = ["eip155:84532"] as const; // Base Sepolia (Phase 1); mainnet is "eip155:8453"
