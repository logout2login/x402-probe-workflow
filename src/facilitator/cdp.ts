// ─── v1.12 CDP Facilitator ───
//
// Coinbase CDP facilitator：真實實現，讀 env.FACILITATOR_URL + CDP_API_KEY。
// MOCK_FACILITATOR=1 時繞過。

import { PRICE_STANDARD_6DECIMAL } from "../shared/constants";
import type { Facilitator, FacilitatorEnv, SettleRequest, SettleResponse } from "./interface";

export class CDPFacilitator implements Facilitator {
  readonly name = "cdp";

  async healthCheck(env: FacilitatorEnv): Promise<{ ok: boolean; error?: string }> {
    if (!env.FACILITATOR_URL) return { ok: false, error: "no_url" };
    if (!env.CDP_API_KEY) return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${env.FACILITATOR_URL}/health`, {
        headers: { "cdp-api-key": env.CDP_API_KEY },
      });
      return r.ok ? { ok: true } : { ok: false, error: `http_${r.status}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }

  async settle(env: FacilitatorEnv, req: SettleRequest): Promise<SettleResponse> {
    const t0 = Date.now();
    const latencyMs = () => Date.now() - t0;
    if (!env.FACILITATOR_URL) return { ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_url" };
    if (!env.CDP_API_KEY) return { ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_api_key" };
    if (!env.PAY_TO) return { ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_pay_to" };
    try {
      const r = await fetch(env.FACILITATOR_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cdp-api-key": env.CDP_API_KEY,
        },
        body: JSON.stringify({
          paymentPayload: req.payment,
          paymentRequirements: {
            scheme: "exact",
            network: env.NETWORK,
            maxAmountRequired: req.amountRequired || PRICE_STANDARD_6DECIMAL,
            resource: `${env.OWNSITE_BASE}/buy/${req.packageId}`,
            payTo: env.PAY_TO,
            asset: env.ASSET_USDC,
            extra: { name: "USDC", version: "2" },
          },
        }),
      });
      const body = (await r.json()) as { isValid?: boolean; amount?: string; payer?: string; error?: string };
      return {
        ok: !!body.isValid,
        amount: body.amount ?? "0",
        payer: body.payer ?? req.payment.payload?.payer ?? "unknown",
        txHash: req.payment.payload?.txHash ?? "",
        error: body.error,
        latencyMs: latencyMs(),
      };
    } catch (e) {
      return {
        ok: false, amount: "0", payer: "unknown", txHash: "",
        error: e instanceof Error ? e.message : "network",
        latencyMs: latencyMs(),
      };
    }
  }
}
