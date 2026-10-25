// ─── v1.7 Marketplace Registry ───
//
// 統一註冊 4 個 adapter。若 secret 未設定，adapter 仍加入 registry 但會在
// sync 時回報 no_api_key 錯誤並跳過。

import { BazaarAdapter } from "./adapters/bazaar";
import { Agent402Adapter } from "./adapters/agent402";
import { MCPSoAdapter } from "./adapters/mcpso";
import { DataPointAdapter } from "./adapters/datapoint";
import type { MarketplaceAdapter } from "./adapter";

export const MARKET_ADAPTERS: Record<string, MarketplaceAdapter> = {
  bazaar: new BazaarAdapter(),
  agent402: new Agent402Adapter(),
  mcp_so: new MCPSoAdapter(),
  datapoint: new DataPointAdapter(),
};

export function getAdapter(name: string): MarketplaceAdapter | undefined {
  return MARKET_ADAPTERS[name];
}

export function allAdapters(): MarketplaceAdapter[] {
  return Object.values(MARKET_ADAPTERS);
}
