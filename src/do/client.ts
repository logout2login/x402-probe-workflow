// ─── v1.14 DO 客戶端 ───
//
// Worker 側的 DO 呼叫封裝。若 DO 綁定未設定，自動降級到 KV / 記憶體實現。

import type { Env } from "../worker/env";

export async function doAcquireNonceLock(
  env: Env,
  txHash: string,
  ttlSeconds = 60
): Promise<{ ok: boolean; holder?: string }> {
  if (!env.NONCE_LOCK) return { ok: true }; // 降級：接受
  try {
    const id = env.NONCE_LOCK.idFromName(txHash);
    const stub = env.NONCE_LOCK.get(id);
    const r = await stub.fetch(new Request(`/nonce-lock?action=acquire`, {
      method: "POST",
      body: JSON.stringify({ txHash, ttlSeconds }),
    }));
    return (await r.json()) as { ok: boolean; holder?: string };
  } catch {
    return { ok: true };
  }
}

export async function doCheckQuota(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  if (!env.QUOTA) {
    // 降級到 KV 近似計數
    const bucketStart = Math.floor(Date.now() / (windowSeconds * 1000));
    const fullKey = `${key}:${bucketStart}`;
    const curRaw = await env.KV.get(fullKey);
    const cur = curRaw ? parseInt(curRaw, 10) : 0;
    if (cur >= limit) {
      return { ok: false, remaining: 0, resetAt: (bucketStart + 1) * windowSeconds * 1000 };
    }
    await env.KV.put(fullKey, String(cur + 1), { expirationTtl: windowSeconds * 2 });
    return { ok: true, remaining: limit - cur - 1, resetAt: (bucketStart + 1) * windowSeconds * 1000 };
  }
  try {
    const id = env.QUOTA.idFromName(key);
    const stub = env.QUOTA.get(id);
    const r = await stub.fetch(new Request(`/quota?action=check`, {
      method: "POST",
      body: JSON.stringify({ key, limit, windowSeconds }),
    }));
    return (await r.json()) as { ok: boolean; remaining: number; resetAt: number };
  } catch {
    return { ok: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
  }
}

export async function doCircuitCanProceed(
  env: Env,
  facilitator: string
): Promise<{ ok: boolean; state: string }> {
  if (!env.CIRCUIT) return { ok: true, state: "closed" };
  try {
    const id = env.CIRCUIT.idFromName(facilitator);
    const stub = env.CIRCUIT.get(id);
    const r = await stub.fetch(new Request(`/circuit?action=can-proceed`));
    return (await r.json()) as { ok: boolean; state: string };
  } catch {
    return { ok: true, state: "closed" };
  }
}

export async function doCircuitRecordResult(
  env: Env,
  facilitator: string,
  success: boolean
): Promise<void> {
  if (!env.CIRCUIT) return;
  try {
    const id = env.CIRCUIT.idFromName(facilitator);
    const stub = env.CIRCUIT.get(id);
    await stub.fetch(new Request(`/circuit?action=${success ? "success" : "failure"}`));
  } catch {
    /* best effort */
  }
}
