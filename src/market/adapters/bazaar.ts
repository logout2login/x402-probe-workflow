// ─── v1.7 Bazaar Adapter（Coinbase CDP） ───
import type {
  HealthResult, MarketplaceAdapter, MarketplaceEnv, PackageForSync, SyncResult,
} from "../adapter";

export class BazaarAdapter implements MarketplaceAdapter {
  readonly name = "bazaar" as const;
  readonly baseUrl = "https://api.cdp.coinbase.com/platform/v1";

  async healthCheck(env: MarketplaceEnv): Promise<HealthResult> {
    if (!env.MARKET_BAZAAR_API_KEY) return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/x402/merchant/me`, {
        headers: { "cdp-api-key": env.MARKET_BAZAAR_API_KEY },
      });
      if (!r.ok) return { ok: false, error: `http_${r.status}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }

  async publish(env: MarketplaceEnv, pkg: PackageForSync): Promise<SyncResult> {
    if (!env.MARKET_BAZAAR_API_KEY) return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/x402/merchandise`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cdp-api-key": env.MARKET_BAZAAR_API_KEY,
        },
        body: JSON.stringify({
          resource: pkg.paid_url,
          description: `${pkg.title} — q=${pkg.q.toFixed(2)}, evidence=${pkg.evidence_count}, verified ${pkg.verified_at.slice(0, 10)}`,
          mimeType: "application/json",
          payTo: "0xB7f4D61320de4CF5F22330407a3A683304AC914d",
          maxAmountRequired: pkg.price_usdc,
          network: env.NETWORK,
          asset: env.ASSET_USDC,
          maxTimeoutSeconds: 300,
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
    if (!env.MARKET_BAZAAR_API_KEY) return { ok: false, error: "no_api_key" };
    // 真實實現需 external_id；這裡 mock 成 no-op
    return { ok: true, external_id: undefined };
  }
}
