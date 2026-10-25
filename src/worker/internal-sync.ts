// ─── /internal/sync ───
// 由 GitHub Actions / CI 觸發，同步 .well-known/* 到 KV。
// 需要 X-SYNC-KEY header 與 env.SYNC_SIGNING_KEY 匹配（共享密鑰，僅用於同步，非支付）。
//
// 硬性約束：
//   1. 不接受錢包地址、私鑰、CDP key 在此端點。
//   2. 每次同步都原子寫入，防止部分更新。
//   3. 同步失敗不影響 ownsite 售賣（SSOT 仍是 GitHub Pages）。

import { json } from "./http";
import type { Env } from "./env";

export async function handleInternalSync(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }
  const key = req.headers.get("x-sync-key");
  if (!env.SYNC_SIGNING_KEY || key !== env.SYNC_SIGNING_KEY) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: {
    files?: Array<{ path: string; content: string }>;
    clear?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  const results: Array<{ path: string; ok: boolean; error?: string }> = [];
  const ops: Array<Promise<void>> = [];

  for (const f of body.files ?? []) {
    if (!f.path.startsWith("/.well-known/") && !f.path.startsWith("/schemas/")) {
      results.push({ path: f.path, ok: false, error: "not_allowed_path" });
      continue;
    }
    const k = `wellknown:${f.path}`;
    ops.push(
      env.KV.put(k, f.content)
        .then(() => { results.push({ path: f.path, ok: true }); })
        .catch((e) => { results.push({ path: f.path, ok: false, error: String(e) }); })
    );
  }

  for (const path of body.clear ?? []) {
    ops.push(
      env.KV.delete(`wellknown:${path}`)
        .then(() => { results.push({ path, ok: true }); })
        .catch((e) => { results.push({ path, ok: false, error: String(e) }); })
    );
  }

  await Promise.all(ops);
  return json({ results });
}
