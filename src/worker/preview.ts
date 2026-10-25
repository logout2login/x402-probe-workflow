// ─── /preview/{package_id} ───
// 免費、每 Agent 10 req/hour、返回前 N 條記錄或摘要。

import type { Env } from "./env";
import { json } from "./http";
import {
  checkRateLimit,
  hasUserAgent,
  requestIdentity,
} from "./rate-limit";

export async function handlePreview(req: Request, env: Env): Promise<Response> {
  if (!hasUserAgent(req)) {
    return json({ error: "user_agent_required" }, 400);
  }
  const id = parseId(req.url, "/preview/");
  if (!id) return json({ error: "invalid_package_id" }, 400);

  const agentId = requestIdentity(req);
  const limit = parseInt(env.PREVIEW_RATE_LIMIT_PER_HOUR || "10", 10);
  const rl = await checkRateLimit(env, {
    key: `rl:preview:${agentId}`,
    limit,
    windowSeconds: 3600,
  });
  if (!rl.ok) {
    return json({ error: "rate_limited", retry_after_ms: rl.resetAt - Date.now() }, 429);
  }

  const pkg = await env.KV.get(`pkg:${id}`, "json") as
    | { data?: unknown; title?: string }
    | null;
  if (!pkg) {
    return json({ error: "not_found" }, 404);
  }

  const verification = await env.KV.get(`verify:${id}`, "json") as {
    q: number;
    evidence_count: number;
    verified_at: string;
    expires_at: string;
  } | null;

  const raw = pkg.data ?? pkg;
  const preview = excerptRecords(raw, 3);

  return json({
    package_id: id,
    preview: true,
    title: pkg.title,
    records: preview,
    total_records: Array.isArray(raw) ? raw.length : 1,
    verification_summary: verification
      ? {
          q: verification.q,
          evidence_count: verification.evidence_count,
          verified_at: verification.verified_at,
          expires_at: verification.expires_at,
        }
      : null,
    full_url: `${env.OWNSITE_BASE}/buy/${id}`,
  });
}

function excerptRecords(data: unknown, n: number): unknown {
  if (Array.isArray(data)) return data.slice(0, n);
  if (data && typeof data === "object" && "records" in (data as object)) {
    const arr = (data as { records: unknown[] }).records;
    if (Array.isArray(arr)) return arr.slice(0, n);
  }
  // 只返回前幾個 key（不暴露完整）
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj).slice(0, n);
    return Object.fromEntries(keys.map(k => [k, obj[k]]));
  }
  return [data];
}

function parseId(url: string, prefix: string): string | null {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  if (parts[0] !== prefix.slice(1, -1)) return null;
  return parts.length === 2 ? decodeURIComponent(parts[1]!) : null;
}
