// ─── v1.7 DataPoint Adapter（微子集引流） ───
import type {
  HealthResult, MarketplaceAdapter, MarketplaceEnv, PackageForSync, SyncResult,
} from "../adapter";

export class DataPointAdapter implements MarketplaceAdapter {
  readonly name = "datapoint" as const;
  readonly baseUrl = "https://datapoint.market/api";

  async healthCheck(env: MarketplaceEnv): Promise<HealthResult> {
    if (!env.MARKET_DATAPPOINT_API_KEY) return { ok: false, error: "no_api_key" };
    return { ok: true };
  }

  async publish(env: MarketplaceEnv, pkg: PackageForSync): Promise<SyncResult> {
    if (!env.MARKET_DATAPPOINT_API_KEY) return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/products`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.MARKET_DATAPPOINT_API_KEY,
        },
        body: JSON.stringify({
          name: `${pkg.title} (micro-subset)`,
          description: `q=${pkg.q.toFixed(2)}, evidence=${pkg.evidence_count}. Full package: ${pkg.paid_url} at $0.50.`,
          endpoint: pkg.paid_url,
          price: "0.005",
          tags: ["verified-data", "research-data"],
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
    if (!env.MARKET_DATAPPOINT_API_KEY) return { ok: false, error: "no_api_key" };
    return { ok: true, external_id: undefined };
  }
}
