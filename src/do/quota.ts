// ─── v1.14 Quota Durable Object ───
//
// 精確 per-agent quota 計數。取代 KV 近似計數。
//
// RPC 介面：
//   check(key, limit, windowSeconds) -> { ok, remaining, resetAt }
//   reset(key)

import { DurableObject } from "cloudflare:workers";

interface QuotaState {
  count: number;
  bucketStart: number;
  windowSeconds: number;
}

export class QuotaDO extends DurableObject {
  private quotas: Map<string, QuotaState> = new Map();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? "check";
    const body = (await request.json().catch(() => ({}))) as { key?: string; limit?: number; windowSeconds?: number };

    switch (action) {
      case "check":
        return this.handleCheck(body.key ?? "", body.limit ?? 1, body.windowSeconds ?? 60);
      case "reset":
        this.quotas.delete(body.key ?? "");
        return json({ ok: true });
      default:
        return json({ error: "unknown_action" }, 400);
    }
  }

  private handleCheck(key: string, limit: number, windowSeconds: number): Response {
    const now = Date.now();
    const bucketStart = Math.floor(now / (windowSeconds * 1000));
    const cur = this.quotas.get(key);
    const isNewBucket = !cur || cur.bucketStart !== bucketStart;
    const count = isNewBucket ? 0 : cur!.count;

    if (count >= limit) {
      return json({ ok: false, remaining: 0, resetAt: (bucketStart + 1) * windowSeconds * 1000 });
    }

    this.quotas.set(key, { count: count + 1, bucketStart, windowSeconds });
    const resetAt = (bucketStart + 1) * windowSeconds * 1000;
    return json({ ok: true, remaining: limit - count - 1, resetAt });
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
