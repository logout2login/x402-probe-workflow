// ─── v1.12 CDP Facilitator ───
//
// Coinbase CDP x402 facilitator：api.cdp.coinbase.com/platform/v2/x402/*。
// 認證 = CDP Portal secret key 對（CDP_KEY_ID + CDP_KEY_SECRET）：
//   每次 request 即時簽 JWT（@coinbase/cdp-sdk/auth generateJwt），
//   Authorization: Bearer <jwt>。
// JWT 綁定 method/host/path，120s 過期 → 每次 settle 現簽，唔用 cached token。
// MOCK_FACILITATOR=1 時繞過（router 層）。

import { generateJwt } from "@coinbase/cdp-sdk/auth";
import { PRICE_STANDARD_6DECIMAL } from "../shared/constants";
import type { Facilitator, FacilitatorEnv, SettleRequest, SettleResponse } from "./interface";

async function cdpBearer(env: FacilitatorEnv, url: string, method: string): Promise<Record<string, string>> {
  const u = new URL(url);
  const jwt = await generateJwt({
    apiKeyId: env.CDP_KEY_ID!,
    apiKeySecret: env.CDP_KEY_SECRET!,
    requestMethod: method,
    requestHost: u.hostname,
    requestPath: u.pathname,
    expiresIn: 120,
  });
  return { "content-type": "application/json", Authorization: `Bearer ${jwt}` };
}

export class CDPFacilitator implements Facilitator {
  readonly name = "cdp";

  private hasKeys(env: FacilitatorEnv): boolean {
    return !!(env.CDP_KEY_ID && env.CDP_KEY_SECRET);
  }

  async healthCheck(env: FacilitatorEnv): Promise<{ ok: boolean; error?: string }> {
    if (!env.FACILITATOR_URL) return { ok: false, error: "no_url" };
    if (!this.hasKeys(env)) return { ok: false, error: "no_api_key" };
    // CDP REST（platform/v2/x402）冇 /health 端點 — 唔好 404 打電路；
    // auth 問題會喺 settle 時以 401 fail-fast surfaced，唔需要預先 health gate
    if (env.FACILITATOR_URL.includes("cdp.coinbase.com")) return { ok: true };
    try {
      const headers = await cdpBearer(env, env.FACILITATOR_URL, "GET");
      const r = await fetch(`${env.FACILITATOR_URL}/health`, { headers });
      return r.ok ? { ok: true } : { ok: false, error: `http_${r.status}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }

  async settle(env: FacilitatorEnv, req: SettleRequest): Promise<SettleResponse> {
    const t0 = Date.now();
    const latencyMs = () => Date.now() - t0;
    const fail = (error: string): SettleResponse => ({
      ok: false, amount: "0", payer: "unknown", txHash: "", error, latencyMs: latencyMs(),
    });
    if (!env.FACILITATOR_URL) return fail("no_url");
    if (!this.hasKeys(env)) return fail("no_api_key");
    if (!env.PAY_TO) return fail("no_pay_to");
    try {
      const headers = await cdpBearer(env, env.FACILITATOR_URL, "POST");
      const r = await fetch(env.FACILITATOR_URL, {
        method: "POST",
        headers,
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
      // 401/403 = JWT/key 死：retry 無用，fail-fast 俾 router 即時 fallback
      if (r.status === 401 || r.status === 403) {
        const errText = await r.text().catch(() => "");
        return fail(`cdp_auth_failed: HTTP ${r.status} ${errText.slice(0, 160)}`);
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
      return fail(e instanceof Error ? e.message : "network");
    }
  }
}
