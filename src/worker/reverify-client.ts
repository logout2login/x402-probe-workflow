// ─── v1.8 Reverify Client ───
//
// Worker 側呼叫外部 verifier 服務，取得新版 verification.json。
//
// 契約：
//   POST $VERIFIER_ENDPOINT/reverify
//   Headers: { x-reverify-secret: $REVERIFY_SECRET, content-type: application/json }
//   Body:    { package_id, current_q, current_expires_at, current_verified_at }
//   200     : { verification_json: {...}, q_delta, reason? }
//   4xx/5xx : { error: string }

import type { Env } from "./env";

export interface ReverifyResult {
  ok: boolean;
  newVerification?: unknown;
  oldQ?: number;
  newQ?: number;
  newVerifiedAt?: string;
  newExpiresAt?: string;
  reason?: string;
}

export async function callVerifierForReverify(
  env: Env,
  packageId: string,
  current: { q: number; verified_at: string; expires_at: string }
): Promise<ReverifyResult> {
  if (!env.VERIFIER_ENDPOINT) return { ok: false, reason: "no_verifier_endpoint" };
  if (!env.REVERIFY_SECRET) return { ok: false, reason: "no_reverify_secret" };

  try {
    const r = await fetch(`${env.VERIFIER_ENDPOINT.replace(/\/$/, "")}/reverify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-reverify-secret": env.REVERIFY_SECRET,
      },
      body: JSON.stringify({
        package_id: packageId,
        current_q: current.q,
        current_verified_at: current.verified_at,
        current_expires_at: current.expires_at,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) {
      return { ok: false, reason: `http_${r.status}` };
    }
    const body = (await r.json()) as {
      verification_json?: unknown;
      new_q?: number;
      new_verified_at?: string;
      new_expires_at?: string;
      reason?: string;
    };
    return {
      ok: true,
      newVerification: body.verification_json,
      oldQ: current.q,
      newQ: body.new_q,
      newVerifiedAt: body.new_verified_at,
      newExpiresAt: body.new_expires_at,
      reason: body.reason,
    };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "verifier_error",
    };
  }
}
