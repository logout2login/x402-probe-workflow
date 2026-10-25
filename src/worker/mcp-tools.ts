// ─── MCP tool 定義（單一來源，供 Worker 與測試共用）───
// 硬限：只准 4 個 tool。任何新增在此文件即被審計 🚨。

export interface McpToolDef {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, { type: string }>;
    required?: string[];
  };
}

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "list_verified_packages",
    description: "List packages filtered by q, evidence_count and age. Free.",
    inputSchema: {
      type: "object",
      properties: {
        min_q: { type: "number" },
        min_evidence: { type: "integer" },
        max_age_days: { type: "integer" },
      },
    },
  },
  {
    name: "get_verification",
    description: "Return full verification.json. Free and does not consume quota.",
    inputSchema: {
      type: "object",
      required: ["package_id"],
      properties: { package_id: { type: "string" } },
    },
  },
  {
    name: "purchase_package",
    description: "x402-gated purchase. Returns 402 accepts array if no valid payment.",
    inputSchema: {
      type: "object",
      required: ["package_id"],
      properties: { package_id: { type: "string" } },
    },
  },
  {
    name: "check_status",
    description: "Return fresh / stale / recalled and replacement_package_id if any. Free.",
    inputSchema: {
      type: "object",
      required: ["package_id"],
      properties: { package_id: { type: "string" } },
    },
  },
] as const;

export const MCP_INSTRUCTIONS =
  "Always call get_verification before purchase_package. Verification is free and does not consume quota.";

export const MCP_TOOL_NAMES: readonly string[] = MCP_TOOLS.map(t => t.name);
