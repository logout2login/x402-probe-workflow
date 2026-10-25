// ─── /mcp — Model Context Protocol Server ───
// JSON-RPC 2.0，只做四個 tool：
//   1. list_verified_packages(min_q?, min_evidence?, max_age_days?) — 免費
//   2. get_verification(package_id) — 免費
//   3. purchase_package(package_id) — x402-gated（返回 402 流程指引）
//   4. check_status(package_id) — 免費
//
// initialize 的 instructions 必須寫明：
//   "Always call get_verification before purchase_package.
//    Verification is free and does not consume quota."

import type { Env } from "./env";
import { json } from "./http";
import { MCP_TOOLS, MCP_INSTRUCTIONS } from "./mcp-tools";

export interface McpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export async function handleMcp(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  let body: McpRequest;
  try {
    body = (await req.json()) as McpRequest;
  } catch {
    return json<McpResponse>({
      jsonrpc: "2.0",
      id: 0,
      error: { code: -32700, message: "parse_error" },
    });
  }

  const { id, method, params } = body;

  switch (method) {
    case "initialize":
      return json<McpResponse>({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "ownsite-verified-data", version: "1.0.0" },
          instructions: MCP_INSTRUCTIONS,
        },
      });

    case "tools/list":
      return json<McpResponse>({
        jsonrpc: "2.0",
        id,
        result: { tools: MCP_TOOLS },
      });

    case "tools/call": {
      const name = (params?.name as string | undefined) ?? "";
      const args = (params?.arguments as Record<string, unknown> | undefined) ?? {};

      if (name === "list_verified_packages") {
        const index = (await env.KV.get(
          "wellknown:/.well-known/agent-index.json",
          "json"
        )) as { packages: Array<Record<string, unknown>> } | null;
        let pkgs = index?.packages ?? [];
        const minQ = args.min_q as number | undefined;
        const minEv = args.min_evidence as number | undefined;
        const maxAgeDays = args.max_age_days as number | undefined;
        if (minQ != null) pkgs = pkgs.filter(p => Number(p.q) >= minQ);
        if (minEv != null) pkgs = pkgs.filter(p => Number(p.evidence_count) >= minEv);
        if (maxAgeDays != null) {
          const now = Date.now();
          pkgs = pkgs.filter(p => {
            const v = new Date(String(p.verified_at)).getTime();
            return (now - v) <= maxAgeDays * 86400_000;
          });
        }
        return mcpSuccess(id, { packages: pkgs });
      }

      if (name === "get_verification") {
        const v = await env.KV.get(`verify:${args.package_id}`, "json");
        if (!v) return mcpError(id, -32001, "not_found");
        return mcpSuccess(id, v);
      }

      if (name === "check_status") {
        const status = (await env.KV.get(`status:${args.package_id}`)) ?? "unknown";
        const replacement = await env.KV.get(`replacement:${args.package_id}`);
        return mcpSuccess(id, { status, replacement_package_id: replacement ?? null });
      }

      if (name === "purchase_package") {
        // MCP 不做 x402 流；指回 HTTP 端點
        return mcpError(id, -32000, "use_http_402_flow", {
          buy_url: `${env.OWNSITE_BASE}/buy/${args.package_id}`,
        });
      }

      return mcpError(id, -32602, `unknown_tool:${name}`);
    }

    default:
      return json<McpResponse>({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "method_not_found" },
      });
  }
}

function mcpSuccess(id: string | number, data: unknown): Response {
  return json<McpResponse>({
    jsonrpc: "2.0",
    id,
    result: { content: [{ type: "text", text: JSON.stringify(data) }] },
  });
}

function mcpError(
  id: string | number,
  code: number,
  message: string,
  data?: unknown
): Response {
  return json<McpResponse>({
    jsonrpc: "2.0",
    id,
    error: { code, message, ...(data ? { data } : {}) },
  });
}
