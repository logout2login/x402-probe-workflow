// ─── /verify/{package_id} ───
// 免費、60 req/min/IP、返回完整 verification.json。
// 這是核心轉化引擎：Agent 用 JWKS 離線驗簽，不需信 Worker、不需信市集。

import type { Env } from "./env";
import { json } from "./http";
import {
  checkRateLimit,
  hasUserAgent,
  requestIdentity,
  requestIp,
} from "./rate-limit";

export async function handleVerify(req: Request, env: Env): Promise<Response> {
  if (!hasUserAgent(req)) {
    return json({ error: "user_agent_required" }, 400);
  }
  const id = parseId(req.url, "/verify/");
  if (!id) return json({ error: "invalid_package_id" }, 400);

  // 速率限制（60 req/min/IP）
  const limit = parseInt(env.VERIFY_RATE_LIMIT_PER_MIN || "60", 10);
  const rl = await checkRateLimit(env, {
    key: `rl:verify:${requestIp(req)}`,
    limit,
    windowSeconds: 60,
  });
  if (!rl.ok) {
    return json({ error: "rate_limited", retry_after_ms: rl.resetAt - Date.now() }, 429);
  }

  // 記錄 pseudonym 用於 KPI（不持久化）
  const agentId = requestIdentity(req);
  void agentId;

  // KV 讀取 verification（key 結構：`verify:{id}`）
  const verification = await env.KV.get(`verify:${id}`, "json");
  if (!verification) {
    return json({ error: "not_found" }, 404);
  }

  return json(verification, 200, {
    "cache-control": "public, max-age=60",
    "x-remaining-rate-limit": String(rl.remaining),
  });
}

function parseId(url: string, prefix: string): string | null {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  // /verify/{id} → parts = ["verify", "{id}"]
  if (parts[0] !== prefix.slice(1, -1)) return null;
  return parts.length === 2 ? decodeURIComponent(parts[1]!) : null;
}
