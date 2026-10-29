// ─── v1.12 Facilitator 介面 ───
//
// 每個 facilitator 實作同一介面。router.ts 統一調度。

import type { X402PaymentPayload } from "../shared/types";

export interface FacilitatorEnv {
  FACILITATOR_URL?: string;
  /** CDP Portal secret key 對（JWT auth）。取代舊 CDP_API_KEY。 */
  CDP_KEY_ID?: string;
  CDP_KEY_SECRET?: string;
  /** @deprecated 舊 header 認證，唔再使用 */
  CDP_API_KEY?: string;
  CDP_PRIVATE_KEY?: string;
  SELFHOSTED_PRIVATE_KEY?: string;
  PAY_TO?: string;
  NETWORK: string;
  ASSET_USDC: string;
  OWNSITE_BASE: string;
  /** v1.15：settle nonce 去重用（permitnonce:{payer}:{nonce}，Signed rail）。worker 環境恒有。 */
  KV?: KVNamespace;
}

export interface SettleRequest {
  payment: X402PaymentPayload;
  packageId: string;
  amountRequired: string;
}

export interface SettleResponse {
  ok: boolean;
  amount: string;
  payer: string;
  txHash: string;
  error?: string;
  latencyMs?: number;
}

export interface Facilitator {
  readonly name: string;
  healthCheck(env: FacilitatorEnv): Promise<{ ok: boolean; error?: string }>;
  settle(env: FacilitatorEnv, req: SettleRequest): Promise<SettleResponse>;
}
