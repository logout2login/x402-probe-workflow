// ─── v1.14 NonceLock Durable Object ───
//
// 用於 tx_hash 防重放的精確鎖。
// 每次 acquire(txHash) 保證同 txHash 只有一個 request 進入 settle。
//
// RPC 介面：
//   acquire(txHash, ttlSeconds) -> { ok, holder }
//   release(txHash)
//   peek(txHash) -> { holder, expiresAt }

import { DurableObject } from "cloudflare:workers";

interface NonceLockState {
  holder: string | null;
  expiresAt: number;
}

export class NonceLockDO extends DurableObject {
  private locks: Map<string, NonceLockState> = new Map();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const body = (await request.json().catch(() => ({}))) as { txHash?: string; ttlSeconds?: number };
    const action = url.searchParams.get("action") ?? "acquire";

    switch (action) {
      case "acquire":
        return this.handleAcquire(body.txHash ?? "", body.ttlSeconds ?? 60);
      case "release":
        return this.handleRelease(body.txHash ?? "");
      case "peek":
        return this.handlePeek(body.txHash ?? "");
      default:
        return json({ error: "unknown_action" }, 400);
    }
  }

  private handleAcquire(txHash: string, ttlSeconds: number): Response {
    const now = Date.now();
    const cur = this.locks.get(txHash);
    if (cur && cur.expiresAt > now) {
      return json({ ok: false, holder: cur.holder });
    }
    this.locks.set(txHash, { holder: `req-${now}-${Math.random().toString(36).slice(2)}`, expiresAt: now + ttlSeconds * 1000 });
    return json({ ok: true, txHash });
  }

  private handleRelease(txHash: string): Response {
    this.locks.delete(txHash);
    return json({ ok: true });
  }

  private handlePeek(txHash: string): Response {
    return json({ holder: this.locks.get(txHash) ?? null });
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
