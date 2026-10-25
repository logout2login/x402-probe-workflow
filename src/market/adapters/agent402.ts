// ─── v1.7 Agent402 Adapter ───
import type {
  HealthResult, MarketplaceAdapter, MarketplaceEnv, PackageForSync, SyncResult,
} from "../adapter";

export class Agent402Adapter implements MarketplaceAdapter {
  readonly name = "agent402" as const;
  readonly baseUrl = "https://agent402.com/api";

  async healthCheck(env: MarketplaceEnv): Promise<HealthResult> {
    if (!env.MARKET_AGENT402_API_KEY) return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/health`, {
        headers: { "authorization": `Bearer ${env.MARKET_AGENT402_API_KEY}` },
      });
      return r.ok ? { ok: true } : { ok: false, error: `http_${r.status}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }

  async publish(env: MarketplaceEnv, pkg: PackageForSync): Promise<SyncResult> {
    if (!env.MARKET_AGENT402_API_KEY) return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/sell`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.MARKET_AGENT402_API_KEY}`,
        },
        body: JSON.stringify({
          name: pkg.title,
          description: `verified data package: q=${pkg.q.toFixed(2)}, evidence=${pkg.evidence_count}`,
          endpoint: pkg.paid_url,
          price: pkg.price_usdc,
          tags: ["verified-data", "machine-verifiable", "x402", "research-data"],
        }),
      });
      if (!r.ok) return { ok: false, error: `http_${r.status}` };
      const body = (await r.json()) as { id?: string; listing_id?: string };
      return { ok: true, external_id: body.id ?? body.listing_id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }

  async unpublish(env: MarketplaceEnv, pkg: PackageForSync): Promise<SyncResult> {
    if (!env.MARKET_AGENT402_API_KEY) return { ok: false, error: "no_api_key" };
    return { ok: true, external_id: undefined };
  }
}
