// ─── Worker 環境介面 ───
// 與 wrangler.toml 綁定對應。所有機密通過 wrangler secret put 設定。

export interface Env {
  // Bindings
  KV: KVNamespace;
  DB: D1Database;
  ASSETS?: Fetcher;

  // Durable Objects（v1.14）
  NONCE_LOCK?: DurableObjectNamespace;
  QUOTA?: DurableObjectNamespace;
  CIRCUIT?: DurableObjectNamespace;

  // Vars（非敏感，可入 wrangler.toml）
  OWNSITE_BASE: string;
  NETWORK: string;
  ASSET_USDC: string;
  NETWORK_MAINNET: string;
  ASSET_USDC_MAINNET: string;
  MAX_TTL_DAYS: string;
  STALE_WARNING_HOURS: string;
  HELD_MAX_DAYS: string;                    // v1.15
  LISTED_MIN_Q: string;
  LISTED_MIN_EVIDENCE: string;
  FEATURED_MIN_Q: string;
  FEATURED_MIN_EVIDENCE: string;
  FEATURED_MIN_DOMAINS: string;
  FEATURED_MAX_AGE_DAYS: string;
  BLOCKED_MIN_Q: string;
  BLOCKED_MIN_EVIDENCE: string;
  VERIFY_RATE_LIMIT_PER_MIN: string;
  PREVIEW_RATE_LIMIT_PER_HOUR: string;
  MOCK_FACILITATOR: string;
  REFETCH_SAMPLE_RATE: string;              // v1.5
  REFETCH_CONSECUTIVE_FAILS: string;        // v1.5
  AGENT_INDEX_PAGE_SIZE: string;            // v1.11
  AGENT_INDEX_CACHE_TTL: string;            // v1.11
  FACILITATOR_PRIMARY: string;              // v1.12
  FACILITATOR_CIRCUIT_OPEN_AFTER: string;   // v1.12
  FACILITATOR_CIRCUIT_HALF_AFTER: string;   // v1.12
  REVERIFY_LEASE_HOURS: string;             // v1.8

  // Secrets
  PAY_TO?: string;
  FACILITATOR_URL?: string;
  CDP_API_KEY?: string;
  CDP_KEY_ID?: string;                        // v1.15: CDP Portal secret key 對（JWT auth）
  CDP_KEY_SECRET?: string;                    // v1.15
  CDP_PRIVATE_KEY?: string;
  VERIFIER_SIGNER_PRIVATE_KEY?: string;
  SYNC_SIGNING_KEY?: string;
  CURSOR_SECRET?: string;                   // v1.13
  REVERIFY_SECRET?: string;                 // v1.8
  SELFHOSTED_PRIVATE_KEY?: string;          // v1.12
  MARKET_BAZAAR_API_KEY?: string;           // v1.7
  MARKET_AGENT402_API_KEY?: string;         // v1.7
  MARKET_MCP_SO_API_KEY?: string;           // v1.7
  MARKET_DATAPPOINT_API_KEY?: string;       // v1.7
  VERIFIER_ENDPOINT?: string;               // v1.8

  // Demand report admin secret
  DEMAND_ADMIN_SECRET?: string;
}
