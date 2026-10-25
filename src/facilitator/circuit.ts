// ─── v1.12 Circuit Breaker ───
//
// 簡單的滑動窗口 circuit breaker。
//   - 連續 openAfter 次失敗 → open
//   - open halfAfter ms 後 → half-open
//   - half-open 若成功 → closed；若失敗 → open
//
// 狀態持久化由 DO（v1.14）或本地記憶體（fallback）。

export type CircuitState = "open" | "half-open" | "closed";

export interface CircuitBreakerConfig {
  openAfter: number;
  halfAfterMs: number;
}

export class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  private state: CircuitState = "closed";

  constructor(private cfg: CircuitBreakerConfig = { openAfter: 5, halfAfterMs: 60_000 }) {}

  get current(): CircuitState {
    if (this.state === "open" && Date.now() - this.openedAt > this.cfg.halfAfterMs) {
      this.state = "half-open";
    }
    return this.state;
  }

  canProceed(): boolean {
    const s = this.current;
    return s === "closed" || s === "half-open";
  }

  recordSuccess() {
    this.failures = 0;
    this.state = "closed";
  }

  recordFailure() {
    this.failures += 1;
    if (this.failures >= this.cfg.openAfter) {
      this.state = "open";
      this.openedAt = Date.now();
    }
  }
}
