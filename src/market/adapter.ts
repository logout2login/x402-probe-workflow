// ─── v1.7 Marketplace Adapter 介面 ───
//
// 每個市集實作同一個介面，由 registry.ts 統一註冊，由 sync.ts 驅動。
//
// 硬性約束：
//   - 各 adapter 只在 mock 模式或真實 secret 都設定時運行
//   - 失敗不中斷整個 sync 循環
//   - 錯誤寫入 last_error，重試上限 3 次

export interface MarketplaceAdapter {
  readonly name: "bazaar" | "agent402" | "mcp_so" | "datapoint";
  readonly baseUrl: string;

  /** 健康檢查：不實際推送，只驗證認證可用 */
  healthCheck(env: MarketplaceEnv): Promise<HealthResult>;

  /** 發布 package 到市集 */
  publish(env: MarketplaceEnv, pkg: PackageForSync): Promise<SyncResult>;

  /** 從市集下架 package */
  unpublish(env: MarketplaceEnv, pkg: PackageForSync): Promise<SyncResult>;
}

export interface MarketplaceEnv {
  FACILITATOR_URL?: string;
  MARKET_BAZAAR_API_KEY?: string;
  MARKET_AGENT402_API_KEY?: string;
  MARKET_MCP_SO_API_KEY?: string;
  MARKET_DATAPPOINT_API_KEY?: string;
  OWNSITE_BASE: string;
  NETWORK: string;
  ASSET_USDC: string;
}

export interface PackageForSync {
  package_id: string;
  title: string;
  q: number;
  evidence_count: number;
  verified_at: string;
  expires_at: string;
  tier: "listed" | "featured";
  price_usdc: string;
  paid_url: string;
  verify_url: string;
  preview_url: string;
}

export interface SyncResult {
  ok: boolean;
  external_id?: string;
  error?: string;
}

export interface HealthResult {
  ok: boolean;
  error?: string;
}
