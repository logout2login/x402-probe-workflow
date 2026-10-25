// ─── CORS + JSON response 工具 ───

export function json<T = unknown>(
  body: T,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=60",
      ...headers,
    },
  });
}

export function corsOptionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers":
        "content-type, x-payment, x-agent-id, x-sync-key, authorization",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}

export function withCors(res: Response): Response {
  const h = new Headers(res.headers);
  h.set("access-control-allow-origin", "*");
  return new Response(res.body, { status: res.status, headers: h });
}
