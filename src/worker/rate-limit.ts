// ─── Rate Limit（KV 近似計數）───
//
// 已知限制：
//   1. KV put 非原子；高並發下可能短暫超限。
//   2. 上線前建議換 Durable Object 或 Cloudflare Rate Limiting Rules。

import type { Env } from "./env";

export interface RateLimitConfig {
  key: string;         // 例如 "rl:verify:1.2.3.4"
  limit: number;       // 例如 60
  windowSeconds: number; // 例如 60
}

export async function checkRateLimit(
  env: Env,
  cfg: RateLimitConfig
): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const bucketStart = Math.floor(now / (cfg.windowSeconds * 1000));
  const fullKey = `${cfg.key}:${bucketStart}`;
  const curRaw = await env.KV.get(fullKey);
  const cur = curRaw ? parseInt(curRaw, 10) : 0;
  const remaining = Math.max(0, cfg.limit - cur);
  const resetAt = (bucketStart + 1) * cfg.windowSeconds * 1000;

  if (cur >= cfg.limit) {
    return { ok: false, remaining: 0, resetAt };
  }
  await env.KV.put(fullKey, String(cur + 1), { expirationTtl: cfg.windowSeconds * 2 });
  return { ok: true, remaining: remaining - 1, resetAt };
}

// 從 request 中提取「Agent 或 IP」標識
export function requestIdentity(req: Request): string {
  return req.headers.get("x-agent-id") ?? req.headers.get("cf-connecting-ip") ?? "anon";
}

// 從 CF request 中提取 IP（Cloudflare 專屬 header）
export function requestIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
}

// User-Agent 檢查：空 UA 拒絕（防止無聲 crawler）
export function hasUserAgent(req: Request): boolean {
  const ua = req.headers.get("user-agent");
  return !!ua && ua.trim().length > 0;
}
