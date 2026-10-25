// ─── v1.7 MCP.so Adapter ───
import type {
  HealthResult, MarketplaceAdapter, MarketplaceEnv, PackageForSync, SyncResult,
} from "../adapter";

export class MCPSoAdapter implements MarketplaceAdapter {
  readonly name = "mcp_so" as const;
  readonly baseUrl = "https://mcp.so/api";

  async healthCheck(env: MarketplaceEnv): Promise<HealthResult> {
    if (!env.MARKET_MCP_SO_API_KEY) return { ok: false, error: "no_api_key" };
    return { ok: true };
  }

  async publish(env: MarketplaceEnv, pkg: PackageForSync): Promise<SyncResult> {
    if (!env.MARKET_MCP_SO_API_KEY) return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/tools`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.MARKET_MCP_SO_API_KEY}`,
        },
        body: JSON.stringify({
          name: `verified_${pkg.package_id}`,
          description: `Machine-verified research: q=${pkg.q.toFixed(2)}, evidence=${pkg.evidence_count}. Call ${pkg.verify_url} for full verification.`,
          endpoint: pkg.paid_url,
          pricing: { type: "per_call", amount: pkg.price_usdc },
          tags: ["verified-data", "machine-verifiable"],
        }),
      });
      if (!r.ok) return { ok: false, error: `http_${r.status}` };
      const body = (await r.json()) as { id?: string };
      return { ok: true, external_id: body.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }

  async unpublish(env: MarketplaceEnv, pkg: PackageForSync): Promise<SyncResult> {
    if (!env.MARKET_MCP_SO_API_KEY) return { ok: false, error: "no_api_key" };
    return { ok: true, external_id: undefined };
  }
}
