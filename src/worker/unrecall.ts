// ─── v1.15 Unrecall endpoint ───
//
// POST /internal/unrecall/{id}
// Headers: x-sync-key: $SYNC_SIGNING_KEY
// Body: { reason?: string, new_q?: number, new_expires_at?: string }
//
// 由人工作業使用：誤召回後手動恢復。
// 效果：
//   1. packages.status = 'fresh'，held_since = NULL
//   2. KV status = fresh
//   3. recall_log 標記 unrecall_at + unrecall_by
//   4. 若提供 new_q / new_expires_at，同步更新 verification KV

import type { Env } from "./env";
import { json } from "./http";

export async function handleUnrecall(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const key = req.headers.get("x-sync-key");
  if (!key || !env.SYNC_SIGNING_KEY || key !== env.SYNC_SIGNING_KEY) {
    return json({ error: "unauthorized" }, 401);
  }

  const id = parseIdFromPath(req.url);
  if (!id) return json({ error: "invalid_package_id" }, 400);

  const status = await env.KV.get(`status:${id}`);
  if (status !== "recalled") {
    return json({ error: "not_recalled", current_status: status }, 400);
  }

  let body: { reason?: string; new_q?: number; new_expires_at?: string; new_verified_at?: string };
  try { body = await req.json(); } catch { body = {}; }

  const nowIso = new Date().toISOString();

  // 1. packages.status = fresh
  if (body.new_q != null || body.new_expires_at != null) {
    await env.DB.prepare(
      `UPDATE packages SET status='fresh', held_since=NULL, held_days=0,
        q=?, expires_at=?, verified_at=?, updated_at=?
       WHERE package_id=?`
    ).bind(
      body.new_q ?? null,
      body.new_expires_at ?? null,
      body.new_verified_at ?? nowIso,
      nowIso,
      id
    ).run();
    // 若新 q / expires_at 提供了，重寫 verification
    const curVerify = await env.KV.get(`verify:${id}`, "json") as { q?: number; expires_at?: string; verified_at?: string } | null;
    if (curVerify) {
      await env.KV.put(`verify:${id}`, JSON.stringify({
        ...curVerify,
        ...(body.new_q != null ? { q: body.new_q } : {}),
        ...(body.new_expires_at ? { expires_at: body.new_expires_at } : {}),
        ...(body.new_verified_at ? { verified_at: body.new_verified_at } : {}),
      }));
    }
  } else {
    await env.DB.prepare(
      "UPDATE packages SET status='fresh', held_since=NULL, held_days=0, updated_at=? WHERE package_id=?"
    ).bind(nowIso, id).run();
  }

  // 2. KV status
  await env.KV.put(`status:${id}`, "fresh");
  await env.KV.delete(`replacement:${id}`);

  // 3. recall_log 標記 unrecall
  await env.DB.prepare(
    `UPDATE recall_log SET unrecall_at=?, unrecall_by=?
     WHERE package_id=? AND unrecall_at IS NULL`
  ).bind(nowIso, body.reason ?? "manual-unrecall", id).run();

  return json({
    ok: true,
    package_id: id,
    new_status: "fresh",
    unrecall_reason: body.reason ?? "manual-unrecall",
    unrecall_at: nowIso,
  });
}

function parseIdFromPath(url: string): string | null {
  const m = url.match(/\/internal\/unrecall\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]!) : null;
}
