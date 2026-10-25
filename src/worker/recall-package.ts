// ─── v1.5 Recall 邏輯 ───
//
// 統一 recall 入口（供 cron-ttl、cron-refetch 呼叫）。
// 效果：
//   1. packages.status = 'recalled'
//   2. KV status 標記 recalled
//   3. recall_log 寫入
//   4. sync_queue 入隊（unpublish）

import type { Env } from "./env";

interface RecallOpts {
  reason: string;
  replacementPackageId?: string | null;
  decidedBy?: string;
}

export async function recallPackage(
  env: Env,
  packageId: string,
  opts: RecallOpts
): Promise<boolean> {
  const nowIso = new Date().toISOString();
  try {
    // 1. 更新 packages.status
    await env.DB.prepare(
      "UPDATE packages SET status='recalled', updated_at=? WHERE package_id=?"
    ).bind(nowIso, packageId).run();

    // 2. KV status（供 buy.ts / status.ts 即時讀取）
    await env.KV.put(`status:${packageId}`, "recalled");

    // 3. replacement（如提供）
    if (opts.replacementPackageId) {
      await env.KV.put(`replacement:${packageId}`, opts.replacementPackageId);
    }

    // 4. recall_log
    await env.DB.prepare(
      `INSERT INTO recall_log (package_id, reason, replacement_package_id, decided_at, decided_by)
       VALUES (?,?,?,?,?)`
    ).bind(
      packageId,
      opts.reason,
      opts.replacementPackageId ?? null,
      nowIso,
      opts.decidedBy ?? "cron"
    ).run();

    // 5. sync_queue：通知市集下架
    await env.DB.prepare(
      `INSERT OR IGNORE INTO sync_queue (id, package_id, target, action, created_at)
       VALUES (?, 'bazaar', 'unpublish', ?)
       UNION ALL SELECT ?, 'agent402', 'unpublish', ?
       UNION ALL SELECT ?, 'mcp_so', 'unpublish', ?
       UNION ALL SELECT ?, 'datapoint', 'unpublish', ?`
    ).bind(
      `${packageId}:bazaar:recall`, packageId, packageId, nowIso,
      `${packageId}:agent402:recall`, packageId,
      `${packageId}:mcp_so:recall`,
      `${packageId}:datapoint:recall`
    ).run();

    return true;
  } catch (e) {
    console.error("recallPackage failed:", e);
    return false;
  }
}
