// ─── CDP Facilitator Wrapper ───
//
// Coinbase Developer Platform (CDP) x402 facilitator 端點：
//   POST https://api.cdp.coinbase.com/platform/v2/x402
//
// 請求：
// {
//   "paymentPayload": {...},
//   "paymentRequirements": {...}
// }
//
// 響應：
// {
//   "isValid": true,
//   "amount": "5000",     // 6 位小數 base units
//   "payer": "0x...",
//   "settlementTxHash": "0x..."
// }
//
// 硬性約束：
//   1. CDP_API_KEY 必須 wrangler secret put，絕不入 wrangler.toml vars。
//   2. MOCK_FACILITATOR=1 時繞過真實調用（僅本地測試）。
//   3. 結算失敗時不收錢、不返貨（對應 §9 風險：settle 失敗零資損）。

import type { Env } from "./env";

export interface PaymentPayload {
  scheme: "exact";
  network: string;
  payload: {
    txHash: string;
    payer: string;
    signature?: string;
  };
}

export interface PaymentRequirements {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  resource: string;
  payTo: string;
  asset: string;
  extra?: Record<string, string>;
}

export interface FacilitatorResponse {
  isValid: boolean;
  amount?: string;
  payer?: string;
  settlementTxHash?: string;
  error?: string;
}

export async function verifyAndSettle(
  payment: PaymentPayload,
  requirements: PaymentRequirements,
  env: Env
): Promise<FacilitatorResponse> {
  if (env.MOCK_FACILITATOR === "1") {
    // v1.20：production guard — 唔准 mock 交差
    if (typeof process !== "undefined" && (process as any).env?.ENVIRONMENT === "production") {
      throw new Error("FATAL: MOCK_FACILITATOR forbidden in production");
    }
    // local / preview 允許 mock（保留本地開發能力）
    return {
      isValid: !!payment.payload?.txHash,
      amount: requirements.maxAmountRequired,
      payer: payment.payload?.payer ?? "0xmockpayer",
      settlementTxHash: "0xmock_settle_" + Date.now(),
    };
  }

  if (!env.FACILITATOR_URL) {
    return { isValid: false, error: "FACILITATOR_URL not configured" };
  }

  const headers: Record<string, string> = { "content-type": "application/json" };
  if (env.CDP_API_KEY) headers["cdp-api-key"] = env.CDP_API_KEY;

  const res = await fetch(env.FACILITATOR_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      x402Version: 2,
      paymentPayload: payment,
      paymentRequirements: requirements,
    }),
  });

  if (!res.ok) {
    return { isValid: false, error: `facilitator_http_${res.status}` };
  }

  return (await res.json()) as FacilitatorResponse;
}

// ─── CDP JWT（Phase 2 使用）───
// CDP API 通常使用 Bearer JWT，由 merchant 私有金鑰簽名。
// 這裡提供結構，實際實現依賴 @noble/curves/secp256k1 或 web3-eth 等。
//
// 硬性約束：CDP_PRIVATE_KEY 必須 wrangler secret put；絕不入 vars。
// v1 使用 mock facilitator 時不需要 JWT；上線後再實作。

export interface CdpJwtClaims {
  iss: string;         // 例如 "ownsite-aeo"
  sub: string;         // 例如 "0x{merchant}"
  iat: number;         // unix seconds
  exp: number;         // unix seconds（通常 1 小時內）
  jti?: string;        // unique request id
}

export interface CdpJwtPlaceholder {
  // 待補：簽名邏輯。Phase 2 接入真實 CDP 時實作。
  sign(claims: CdpJwtClaims, privateKey: string): Promise<string>;
}

export const CDPRoles = {
  merchant: "merchant",
  facilitator: "facilitator",
  payer: "payer",
} as const;
