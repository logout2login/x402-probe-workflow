// ─── v1.11 Agent-Index 分頁 + ETag ───
//
// GET /.well-known/agent-index.json
//   ?page=N&limit=N&min_q=&min_evidence=&max_age_days=&tier=&cursor=<signed>
//
// 回應 header：ETag、Cache-Control
// 回應 body：{ spec_version, generated_at, page, limit, total, next_cursor, packages }
//
// ETag：sha256(canonical JSON of {generated_at, page, limit, packages})

import { sha256 } from "@noble/hashes/sha256";
import type { Env } from "./env";
import { json } from "./http";
import { queryIndexRows, type IndexQueryOpts } from "./agent-index-query";
import { decodeCursor, encodeCursor } from "./cursor";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function handleAgentIndexQuery(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10)));
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const page = Math.floor(offset / limit) + 1;

  const cursorRaw = url.searchParams.get("cursor");
  if (cursorRaw) {
    const decoded = decodeCursor(cursorRaw, env.CURSOR_SECRET);
    if (!decoded) return json({ error: "bad_cursor" }, 400);
  }

  const opts: IndexQueryOpts = {
    minQ: parseFloatOrUndefined(url.searchParams.get("min_q")),
    minEvidence: parseIntOrUndefined(url.searchParams.get("min_evidence")),
    maxAgeDays: parseIntOrUndefined(url.searchParams.get("max_age_days")),
    tier: (url.searchParams.get("tier") as "listed" | "featured" | "all") ?? "all",
    keyword: url.searchParams.get("keyword") ?? undefined,
  };

  const index = await queryIndexRows(env, opts);

  // 手動分頁
  const total = index.packages.length;
  const pageStart = offset;
  const pageEnd = Math.min(offset + limit, total);
  const pageItems = index.packages.slice(pageStart, pageEnd);

  const hasMore = pageEnd < total;
  const nextCursor = hasMore ? encodeCursor(
    env.CURSOR_SECRET,
    { offset: pageEnd, limit, generated_at: index.generated_at, exp: Date.now() + 6 * 3600 * 1000 }
  ) : null;

  // ETag 計算
  const canonicalPayload = JSON.stringify({
    generated_at: index.generated_at,
    page, limit,
    package_ids: pageItems.map(p => p.package_id),
  });
  const etag = `W/"${hash256hex(canonicalPayload)}"`;

  // 304 Not Modified
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        etag,
        "cache-control": `public, max-age=${env.AGENT_INDEX_CACHE_TTL || 300}`,
        vary: "accept-encoding, cursor, if-none-match",
      },
    });
  }

  const cacheTtl = parseInt(env.AGENT_INDEX_CACHE_TTL || "300", 10);
  const body = {
    spec_version: "1.1",
    generated_at: index.generated_at,
    page,
    limit,
    total,
    next_cursor: nextCursor,
    packages: pageItems,
  };

  return json(body, 200, {
    etag,
    "cache-control": `public, max-age=${cacheTtl}`,
    vary: "accept-encoding, cursor, if-none-match",
  });
}

function parseFloatOrUndefined(s: string | null): number | undefined {
  if (!s) return undefined;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

function parseIntOrUndefined(s: string | null): number | undefined {
  if (!s) return undefined;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

function hash256hex(s: string): string {
  const bytes = new TextEncoder().encode(s);
  return Array.from(sha256(bytes)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// 避免 tree-shake 移除
void json;
