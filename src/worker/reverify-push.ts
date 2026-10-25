// ─── v1.8 /reverify endpoint ───
//
// POST /reverify/{id}
// Headers: x-reverify-secret
// Body: { verification_json: {...} }
//
// 用於 verifier 服務在 reverify 完成後主動推送新 verification。
// Worker 驗簽 shared secret 後寫入 KV verify:*。
//
// 這是 v1.8 的「拉 → 推」備援路徑：cron 是拉，endpoint 是推。

import type { Env } from "./env";
import { json } from "./http";

export async function handleReverifyPush(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = req.headers.get("x-reverify-secret");
  if (!secret || !env.REVERIFY_SECRET || secret !== env.REVERIFY_SECRET) {
    return json({ error: "unauthorized" }, 401);
  }

  const id = parseIdFromPath(req.url);
  if (!id) return json({ error: "invalid_package_id" }, 400);

  let body: { verification_json?: unknown; reason?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  if (!body.verification_json) return json({ error: "missing_verification_json" }, 400);

  await env.KV.put(`verify:${id}`, JSON.stringify(body.verification_json));
  await env.DB.prepare(
    `UPDATE packages SET q=?, verified_at=?, expires_at=?, status='fresh', updated_at=? WHERE package_id=?`
  ).bind(
    (body.verification_json as { q?: number })?.q ?? 0,
    (body.verification_json as { verified_at?: string })?.verified_at ?? new Date().toISOString(),
    (body.verification_json as { expires_at?: string })?.expires_at ?? new Date().toISOString(),
    new Date().toISOString(),
    id
  ).run();
  await env.KV.put(`status:${id}`, "fresh");

  return json({ ok: true, package_id: id, pushed_at: new Date().toISOString() });
}

function parseIdFromPath(url: string): string | null {
  const m = url.match(/\/reverify\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]!) : null;
}
