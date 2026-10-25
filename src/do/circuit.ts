// ─── v1.14 CircuitBreaker Durable Object ───
//
// 跨 Worker instance 共享的 circuit breaker。
//
// RPC 介面：
//   getState() -> { state, failures, openedAt }
//   canProceed() -> { ok, state }
//   recordSuccess()
//   recordFailure()

import { DurableObject } from "cloudflare:workers";

interface DOState {
  state: "open" | "half-open" | "closed";
  failures: number;
  openedAt: number;
}

export class CircuitBreakerDO extends DurableObject {
  private cbState: DOState = { state: "closed", failures: 0, openedAt: 0 };

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    if (action === "state") return json({ ...this.getFresh() });
    if (action === "can-proceed") {
      const s = this.getFresh();
      return json({ ok: s.state === "closed" || s.state === "half-open", state: s.state });
    }
    if (action === "success") { this.recordSuccess(); return json({ ok: true }); }
    if (action === "failure") { this.recordFailure(); return json({ ok: true, state: this.cbState.state }); }
    return json({ error: "unknown_action" }, 400);
  }

  private getFresh(): DOState {
    if (this.cbState.state === "open" && Date.now() - this.cbState.openedAt > 60_000) {
      this.cbState.state = "half-open";
    }
    return this.cbState;
  }

  private recordSuccess() {
    this.cbState.failures = 0;
    this.cbState.state = "closed";
  }

  private recordFailure() {
    this.cbState.failures += 1;
    if (this.cbState.failures >= 5) {
      this.cbState.state = "open";
      this.cbState.openedAt = Date.now();
    }
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
