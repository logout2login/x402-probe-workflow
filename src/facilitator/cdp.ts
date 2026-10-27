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
    // CDP REST（platform/v2/x402）冇 /health 端點 — 唔好 404 打電路；
    // auth 問題會喺 settle 時以 401 fail-fast  surfaced，唔需要預先 health gate
    if (env.FACILITATOR_URL.includes("cdp.coinbase.com")) return { ok: true };
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
        signal: AbortSignal.timeout(30_000),
      });
      // 401/403 = key 死 / 格式錯：retry 無用，fail-fast 俾 router 即時 fallback
      if (r.status === 401 || r.status === 403) {
        const errText = await r.text().catch(() => "");
        return {
          ok: false, amount: "0", payer: "unknown", txHash: "",
          error: `cdp_auth_failed: HTTP ${r.status} ${errText.slice(0, 160)}`,
          latencyMs: latencyMs(),
        };
      }
      const body = (await r.json()) as {
        isValid?: boolean; amount?: string; payer?: string; error?: string; transaction?: string;
      };
      return {
        ok: !!body.isValid,
        amount: body.amount ?? "0",
        payer: body.payer ?? req.payment.payload?.payer ?? "unknown",
        // CDP 係廣播者：tx hash 來自 CDP 回應（transaction 欄位），唔係買家 payload
        txHash: body.transaction ?? req.payment.payload?.txHash ?? "",
        // fail 時 dump 原始回應入 error → D1 可讀，debug response 格式用
        error: body.error ?? (body.isValid ? undefined : `cdp_resp: ${JSON.stringify(body).slice(0, 200)}`),
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
