// ─── /status/{package_id} ───
// 免費、返回 fresh / stale / recalled + replacement。

import type { Env } from "./env";
import { json } from "./http";
import { checkRateLimit, hasUserAgent, requestIp } from "./rate-limit";

export async function handleStatus(req: Request, env: Env): Promise<Response> {
  if (!hasUserAgent(req)) {
    return json({ error: "user_agent_required" }, 400);
  }
  const id = parseId(req.url, "/status/");
  if (!id) return json({ error: "invalid_package_id" }, 400);

  const limit = parseInt(env.VERIFY_RATE_LIMIT_PER_MIN || "60", 10);
  const rl = await checkRateLimit(env, {
    key: `rl:status:${requestIp(req)}`,
    limit,
    windowSeconds: 60,
  });
  if (!rl.ok) return json({ error: "rate_limited" }, 429);

  const status = (await env.KV.get(`status:${id}`)) ?? "unknown";
  const replacement = await env.KV.get(`replacement:${id}`);

  return json({
    package_id: id,
    status,
    replacement_package_id: replacement ?? null,
  });
}

function parseId(url: string, prefix: string): string | null {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  if (parts[0] !== prefix.slice(1)) return null;
  return parts.length === 2 ? decodeURIComponent(parts[1]!) : null;
}
