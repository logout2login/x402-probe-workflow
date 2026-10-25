// ─── Demand-Report: witness-scribe demand as sellable x402 packages ───
//
// API:
//   POST /api/demand/request          — submit demand request (topic + pseudonym)
//   GET  /api/demand/request/:id      — status + report (once completed)
//   GET  /api/demand/reports          — list completed report packages
//   GET  /api/demand/reports/:pid     — full report data
//   POST /api/admin/demand-candidates — upload demand_candidates.json (admin auth)
//
// Cron (every 15 min): runDemandCron() → processes pending → creates packages
//
// NOTE: 現有報告照常出售；此模組是新增的 forum demand reports 產品線。

import type { Env } from "./env";
import { json } from "./http";
import { LISTED_MIN_Q, LISTED_MIN_EVIDENCE } from "../shared/constants";

const REPORT_TIER_LISTED = "listed";
const REPORT_TIER_BLOCKED = "blocked";

// ─── POST /api/demand/request ────────────────────────────────────────────────
export async function handlePostDemandRequest(req: Request, env: Env): Promise<Response> {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.topic !== "string" || body.topic.trim().length < 1) {
    return json({ error: "topic is required (min 1 char)" }, 400);
  }
  const pseudonym = (typeof body.pseudonym === "string" && body.pseudonym.trim())
    ? body.pseudonym.trim().slice(0, 64)
    : crypto.randomUUID().slice(0, 8);

  const topic = body.topic.trim().toLowerCase();
  const id = `dr-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO demand_requests (id, topic, pseudonym, status, created_at)
     VALUES (?, ?, ?, 'pending', ?)`
  ).bind(id, topic, pseudonym, now).run();

  // Schedule sync immediately (cron will pick it up, but queue it now too)
  await scheduleDemandSync(env, id);

  return json({
    request_id: id,
    topic,
    pseudonym,
    status: "pending",
    created_at: now,
    message: "Request queued. Check status via GET /api/demand/request/:id",
  }, 201);
}

// ─── GET /api/demand/request/:id ─────────────────────────────────────────────
export async function handleGetDemandRequest(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const id = url.pathname.split("/").filter(Boolean).pop();
  if (!id) return json({ error: "request_id required" }, 400);

  const row = await env.DB.prepare(
    `SELECT id, topic, pseudonym, status, package_id, created_at, completed_at, error
     FROM demand_requests WHERE id=?`
  ).bind(id).first();
  if (!row) return json({ error: "not found" }, 404);

  if (row.status === "completed" && row.package_id) {
    const pkg = await env.DB.prepare(
      `SELECT package_id, title, tier, q, evidence_count, verified_at, expires_at, status
       FROM packages WHERE package_id=?`
    ).bind(row.package_id).first();
    return json({
      request_id: row.id,
      topic: row.topic,
      pseudonym: row.pseudonym,
      status: row.status,
      package_id: row.package_id,
      created_at: row.created_at,
      completed_at: row.completed_at,
      package: pkg ?? null,
    });
  }

  return json({
    request_id: row.id,
    topic: row.topic,
    pseudonym: row.pseudonym,
    status: row.status,
    created_at: row.created_at,
    completed_at: row.completed_at,
    error: row.error ?? null,
  });
}

// ─── GET /api/demand/reports ─────────────────────────────────────────────────
export async function handleListDemandReports(_req: Request, env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT dr.id as request_id, dr.topic, dr.pseudonym, dr.status,
            dr.package_id, dr.created_at, dr.completed_at,
            p.title, p.q, p.evidence_count, p.tier, p.status as pkg_status,
            p.verified_at, p.expires_at
     FROM demand_requests dr
     LEFT JOIN packages p ON dr.package_id = p.package_id
     WHERE dr.status='completed' AND dr.package_id IS NOT NULL
     ORDER BY dr.completed_at DESC
     LIMIT 50`
  ).all<{
    request_id: string; topic: string; pseudonym: string;
    status: string; package_id: string; created_at: string; completed_at: string | null;
    title: string; q: number; evidence_count: number;
    tier: string; pkg_status: string; verified_at: string; expires_at: string;
  }>();

  return json({ total: rows.results.length, reports: rows.results });
}

// ─── Cron: process all pending demand requests ──────────────────────────────
export async function runDemandCron(env: Env): Promise<{ processed: number; created: number; errors: string[] }> {
  const stats = { processed: 0, created: 0, errors: [] as string[] };

  const pending = await env.DB.prepare(
    `SELECT id, topic FROM demand_requests WHERE status='pending' ORDER BY created_at ASC LIMIT 50`
  ).all<{ id: string; topic: string }>();

  if (!pending.results || pending.results.length === 0) return stats;

  // Load cached demand candidates from D1
  const cached = await env.DB.prepare(
    `SELECT json FROM demand_candidates_cache ORDER BY loaded_at DESC LIMIT 1`
  ).first<{ json: string }>();

  if (!cached) {
    stats.errors.push("no demand_candidates_cache — upload via POST /api/admin/demand-candidates first");
    return stats;
  }

  let candidates: unknown[];
  try {
    candidates = JSON.parse(cached.json) as unknown[];
  } catch {
    stats.errors.push("demand_candidates_cache JSON parse error");
    return stats;
  }

  for (const req of pending.results) {
    stats.processed += 1;
    try {
      const matches = filterByTopic(candidates, req.topic);
      if (matches.length === 0) {
        await updateRequestStatus(env, req.id, "expired", "no_matching_demands");
        continue;
      }

      const packageId = await createDemandPackage(env, req, matches);
      if (!packageId) {
        await updateRequestStatus(env, req.id, "expired", "package_creation_failed");
        continue;
      }

      await scheduleDemandSync(env, req.id);
      stats.created += 1;
    } catch (e) {
      const msg = (e as Error).message;
      stats.errors.push(`${req.id}: ${msg}`);
      await updateRequestStatus(env, req.id, "expired", msg);
    }
  }

  return stats;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function filterByTopic(candidates: unknown[], topic: string): unknown[] {
  return candidates.filter((c) => {
    if (!c || typeof c !== "object") return false;
    const obj = c as Record<string, unknown>;
    const combined = [
      obj.theme,
      obj.representative_quote,
      obj.root_cause_inference,
      obj.route_hint,
    ]
      .filter(Boolean)
      .map(String)
      .join(" ")
      .toLowerCase();
    return combined.includes(topic);
  });
}

async function createDemandPackage(
  env: Env,
  request: { id: string; topic: string },
  matches: unknown[]
): Promise<string | null> {
  const packageId = `demand-${request.id.slice("dr-".length)}`;
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 86400_000).toISOString();

  // Compute q (quality score) from evidence
  const q = Math.min(1.0, Math.max(0.1, matches.length * 0.1));
  const evidenceCount = matches.length;
  const title = `Agent Forum Demand Report: ${request.topic}`;

  // Gate check against LISTED_MIN_Q / LISTED_MIN_EVIDENCE (source of truth in constants.ts)
  const meetsGate = q >= LISTED_MIN_Q && evidenceCount >= LISTED_MIN_EVIDENCE;
  const tier = meetsGate ? REPORT_TIER_LISTED : REPORT_TIER_BLOCKED;
  const status = meetsGate ? "fresh" : "blocked";
  const blockedReason = !meetsGate
    ? `q=${q.toFixed(2)}<${LISTED_MIN_Q} or evidence=${evidenceCount}<${LISTED_MIN_EVIDENCE}`
    : null;

  // Compute report data first (needed for data_hash on both INSERT and UPDATE)
  const dummyMatches: Array<Record<string, unknown>> = matches ?? [];
  const reportData = buildReportData(request.topic, dummyMatches);
  const dataHash = simpleHash(JSON.stringify(reportData));

  // Upsert package
  const existing = await env.DB.prepare(
    `SELECT package_id FROM packages WHERE package_id=?`
  ).bind(packageId).first<{ package_id: string }>();

  if (existing) {
    await env.DB.prepare(
      `UPDATE packages SET title=?, q=?, evidence_count=?,
        verified_at=?, expires_at=?, tier=?, status=?, blocked_reason=?, data_hash=?, updated_at=datetime('now'),
        origin='demand'
       WHERE package_id=?`
    ).bind(title, q, evidenceCount, now, expiresAt, tier, status, blockedReason ?? null, dataHash, packageId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO packages
       (package_id, title, q, evidence_count, verified_at, expires_at, tier, status, blocked_reason, data_hash, created_at, origin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demand')`
    ).bind(packageId, title, q, evidenceCount, now, expiresAt, tier, status, blockedReason, dataHash, now).run();
  }

  // Store report payload in demand_reports (dedicated table)
  await env.DB.prepare(
    `INSERT INTO demand_reports (package_id, report_data)
     VALUES (?, ?)
     ON CONFLICT(package_id) DO UPDATE SET report_data=excluded.report_data`
  ).bind(packageId, JSON.stringify(reportData)).run();

  // Log match distribution for gate-tuning feedback loop
  try {
    const srcCount = {};
    let maxDepth = 0;
    for (const m of (matches ?? [])) {
      const obj = m as Record<string, unknown>;
      const prov = obj.provenance as Record<string, unknown> ?? {};
      const srcUrl = prov.source_canonical_url ?? '';
      const typed = srcUrl.includes('github') ? 'github'
                  : srcUrl.includes('ycombinator') || srcUrl.includes('news.ycombinator') ? 'hn'
                  : srcUrl.includes('moltbook') ? 'moltbook'
                  : srcUrl.includes('thecolony') ? 'thecolony'
                  : 'moltchurch';
      srcCount[typed] = (srcCount[typed] ?? 0) + 1;
      if (obj.theme) maxDepth = Math.max(maxDepth, 4);
      else if (obj.representative_quote) maxDepth = Math.max(maxDepth, 3);
      else if (obj.root_cause_inference) maxDepth = Math.max(maxDepth, 2);
      else if (obj.route_hint) maxDepth = Math.max(maxDepth, 1);
    }
    await env.DB.prepare(
      `INSERT INTO match_distribution_log (package_id, topic, matches_total, max_match_depth, source_breakdown, logged_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).bind(packageId, request.topic, matches.length, maxDepth, JSON.stringify(srcCount)).run();
  } catch (_e) { /* non-fatal: logging must not break package creation */ }

  // Update demand_request status
  const completedAt = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE demand_requests SET status='completed', package_id=?, completed_at=? WHERE id=?`
  ).bind(packageId, completedAt, request.id).run();

  return packageId;
}

function buildReportData(topic: string, matches: unknown[]) {
  const items = matches.map((m) => {
    const obj = m as Record<string, unknown>;
    return {
      demand_id: obj.demand_id ?? "",
      theme: obj.theme ?? topic,
      distinct_author_count: obj.distinct_author_count ?? 0,
      evidence_count: Array.isArray(obj.evidence_snippet_indexes)
        ? (obj.evidence_snippet_indexes as unknown[]).length
        : 0,
      representative_quote: (obj.representative_quote as string)?.slice(0, 300) ?? "",
      root_cause_inference: (obj.root_cause_inference as string) ?? "",
      confidence: obj.confidence ?? "low",
      route_hint: obj.route_hint ?? null,
      provenance: obj.provenance ?? {},
      source_url: (obj.provenance as Record<string, unknown>)?.source_canonical_url ?? "",
    };
  });

  return {
    generated_at: new Date().toISOString(),
    topic,
    total_demands: items.length,
    total_authors: items.reduce((s, i) => s + (i.distinct_author_count as number), 0),
    items,
  };
}

async function scheduleDemandSync(env: Env, requestId: string): Promise<void> {
  const pkgId = `demand-${requestId.slice("dr-".length)}`;
  await env.DB.prepare(
    `INSERT INTO sync_queue (package_id, target, action, status, created_at, attempts)
     VALUES (?, 'agent402', 'publish', 'pending', ?, 0)
     ON CONFLICT DO NOTHING`
  ).bind(pkgId, new Date().toISOString()).run();
}

async function updateRequestStatus(
  env: Env,
  id: string,
  status: string,
  errorMsg: string | null
): Promise<void> {
  await env.DB.prepare(
    `UPDATE demand_requests SET status=?, error=?, completed_at=? WHERE id=?`
  ).bind(status, errorMsg, new Date().toISOString(), id).run();
}

function simpleHash(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return "0x" + (h >>> 0).toString(16).padStart(8, "0");
}

// ─── GET /api/demand/reports/:pid ────────────────────────────────────────────
export async function handleGetDemandReport(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const pid = url.pathname.split("/").filter(Boolean).pop();
  if (!pid) return json({ error: "package_id required" }, 400);

  const pkg = await env.DB.prepare(
    `SELECT package_id, title, q, evidence_count, tier, status,
            verified_at, expires_at, created_at
     FROM packages WHERE package_id=? AND package_id LIKE 'demand-%'`
  ).bind(pid).first();
  if (!pkg) return json({ error: "report not found" }, 404);

  const meta = await env.DB.prepare(
    `SELECT report_data FROM demand_reports WHERE package_id=?`
  ).bind(pid).first<{ report_data: string }>();
  if (!meta) return json({ error: "report data not available" }, 404);

  return json({
    package_id: pkg.package_id,
    title: pkg.title,
    q: pkg.q,
    evidence_count: pkg.evidence_count,
    tier: pkg.tier,
    status: pkg.status,
    verified_at: pkg.verified_at,
    expires_at: pkg.expires_at,
    report: JSON.parse(meta.report_data),
  });
}

// ─── POST /api/admin/demand-candidates (admin upload) ────────────────────────
export async function handlePostDemandCandidates(req: Request, env: Env): Promise<Response> {
  const auth = req.headers.get("x-admin-secret");
  if (!auth || auth !== (env.DEMAND_ADMIN_SECRET ?? "")) {
    return json({ error: "unauthorized" }, 401);
  }

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.candidates)) {
    return json({ error: "expected { candidates: [...] }" }, 400);
  }

  const now = new Date().toISOString();
  const jsonStr = JSON.stringify(body.candidates);
  const hash = simpleHash(jsonStr);

  let validCount = 0;
  for (const item of body.candidates) {
    if (item && typeof item === "object" && (item as Record<string, unknown>).theme) {
      validCount += 1;
    }
  }

  await env.DB.prepare(
    `INSERT INTO demand_candidates_cache (loaded_at, json, hash)
     VALUES (?, ?, ?)
     ON CONFLICT DO UPDATE SET json=excluded.json, loaded_at=excluded.loaded_at, hash=excluded.hash`
  ).bind(now, jsonStr, hash).run();

  return json({
    status: "ok",
    loaded_at: now,
    hash,
    total_candidates: body.candidates.length,
    valid_candidates: validCount,
  });
}
