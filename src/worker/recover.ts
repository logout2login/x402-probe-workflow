// ─── v1.5 Recover endpoint ───
//
// GET /recover/{id} — 讓 Agent 拉取 replacement package。
// 若原包 recalled，返回 replacement_package_id 及其 verification_snapshot。
//
// 使用情境：Agent 發現購買的包被 recall，需要重新找 replacement。

import type { Env } from "./env";
import { json } from "./http";

export async function handleRecover(req: Request, env: Env): Promise<Response> {
  const id = parseIdFromPath(req.url);
  if (!id) return json({ error: "invalid_package_id" }, 400);

  const status = await env.KV.get(`status:${id}`);
  if (status !== "recalled") {
    return json({ error: "package_not_recalled", status }, 400);
  }

  const replacementId = await env.KV.get(`replacement:${id}`);
  if (!replacementId) {
    return json({ error: "no_replacement_available", recalled_package_id: id }, 410);
  }

  const replacementVerify = await env.KV.get(`verify:${replacementId}`, "json") as
    | { package_id?: string; q?: number; evidence_count?: number; verified_at?: string; expires_at?: string; verification_signature?: string; spec_version?: string }
    | null;

  if (!replacementVerify) {
    return json({ error: "replacement_verification_missing", replacement_id: replacementId }, 500);
  }

  return json({
    recalled_package_id: id,
    replacement_package_id: replacementId,
    replacement_verification: replacementVerify,
    replacement_paid_url: `${env.OWNSITE_BASE}/buy/${replacementId}`,
    replacement_verify_url: `${env.OWNSITE_BASE}/verify/${replacementId}`,
    note: "Recovery is technical only. Agent must re-verify replacement signature before purchase.",
  });
}

function parseIdFromPath(url: string): string | null {
  const m = url.match(/\/recover\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]!) : null;
}
