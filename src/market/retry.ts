// ─── v1.7 Retry 工具 ───
//
// 指數退避重試。用於 pushToMarket。

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  cfg: RetryConfig = DEFAULT_RETRY
): Promise<{ ok: boolean; result?: T; error?: string; attempts: number }> {
  let lastErr: string = "unknown";
  for (let i = 1; i <= cfg.maxAttempts; i++) {
    try {
      const result = await fn();
      return { ok: true, result, attempts: i };
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "unknown_error";
      if (i === cfg.maxAttempts) break;
      await new Promise(resolve =>
        setTimeout(resolve, Math.min(cfg.baseDelayMs * 2 ** (i - 1), cfg.maxDelayMs))
      );
    }
  }
  return { ok: false, error: lastErr, attempts: cfg.maxAttempts };
}
