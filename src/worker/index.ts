// ─── Worker 主入口（v1.5–v1.16） ───
//
// 路由：
//   /.well-known/agent.json          — SSOT 代理
//   /.well-known/agent-index.json    — v1.10 動態 + v1.11 分頁 + ETag
//   /.well-known/jwks.json           — 靜態
//   /verify/{id}                     — 60 req/min/IP
//   /preview/{id}                    — 10 req/hour/Agent
//   /buy/{id}                        — x402 gated（v1.12 facilitator 路由）
//   /status/{id}                     — fresh/stale/recalled
//   /recover/{id}                    — v1.5 recall 替代
//   /dashboard.json                  — v1.6 公開健康度
//   /reverify/{id}                   — v1.8 push endpoint（需要 secret）
//   /internal/unrecall/{id}          — v1.15 手動恢復
//   /internal/sync                   — 內部簽名同步
//   /mcp                             — JSON-RPC
//   /healthz                         — 健康檢查
//
// Cron: cf-scheduled → runCron（分派到各子 cron）
// DO:   NonceLockDO / QuotaDO / CircuitBreakerDO（v1.14）
//
// 硬性約束：Worker 不做 verifier 的事；不重算 q、不重拉 evidence、不重簽名。

import { corsOptionsResponse, json, withCors } from "./http";
import { handleVerify } from "./verify";
import { handlePreview } from "./preview";
import { handleStatus } from "./status";
import { handleBuy, type PackageMeta } from "./buy";
import { handleMcp } from "./mcp";
import { handleInternalSync } from "./internal-sync";
import { handleRecover } from "./recover";
import { handleDashboard, handleDashboardSales } from "./dashboard";
import { handleReverifyPush } from "./reverify-push";
import { handleUnrecall } from "./unrecall";
import { handleAgentIndexQuery } from "./agent-index";
import { handleA2AMetrics } from "./a2a-metrics";
import { runCron } from "./cron-dispatcher";
import {
  handlePostDemandRequest,
  handleGetDemandRequest,
  handleListDemandReports,
  handleGetDemandReport,
  runDemandCron,
  handlePostDemandCandidates,
} from "./demand-report";
import type { Env } from "./env";
import type { Verification } from "../shared/types";
import { NonceLockDO } from "../do/nonce-lock";
import { QuotaDO } from "../do/quota";
import { CircuitBreakerDO } from "../do/circuit";

export { NonceLockDO, QuotaDO, CircuitBreakerDO };

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const p = url.pathname;

    // Cron trigger
    if (req.headers.get("cf-scheduled")) {
      try {
        return await runCron(env, req.headers.get("cf-scheduled") ?? undefined);
      } catch (e) {
        const err = e as Error;
        console.error("[cron] unhandled error:", err?.message ?? String(e));
        return json({ error: err?.message ?? "internal_cron_error", code: 1101 }, 500);
      }
    }

    if (req.method === "OPTIONS") return corsOptionsResponse();

    // .well-known 路由
    if (p === "/.well-known/agent-index.json") {
      return withCors(await handleAgentIndexQuery(req, env));
    }
    if (p.startsWith("/.well-known/")) return serveWellKnown(p, env);

    // Root: return 402 challenge for x402 registry (agent402.tools, etc.)
    if (p === "/" || p === "") {
      const rootPayload = JSON.stringify({
        x402Version: 2,
        error: "Payment Required",
        resource: {
          url: "https://ownsite-aeo.jerry-aeo.workers.dev/",
          description: "AEO-OS Verified Content Marketplace - 4 packages available at /buy/{id}",
        },
        accepts: [{
          scheme: "exact",
          network: env.NETWORK || "eip155:84532",
          amount: "500000",
          asset: env.ASSET_USDC,
          payTo: env.PAY_TO,
          maxTimeoutSeconds: 300,
          mimeType: "application/json",
          extra: { name: "USDC", version: "2" },
        }],
        extensions: {
          bazaar: {
            info: {
              input: { type: "http", method: "GET" },
              output: { example: "application/json" },
            },
            name: "AEO-OS Verified Content Marketplace",
            description: "Agent2Agent capability marketplace with x402 verified packages",
            tags: ["agent", "x402", "a2a", "marketplace"],
            schema: { type: "object", url: `${env.OWNSITE_BASE}/.well-known/agent-index.json` },
          },
        }
      });
      return new Response(rootPayload, {
        status: 402,
        headers: {
          "content-type": "application/json",
          "PAYMENT-REQUIRED": Buffer.from(rootPayload).toString("base64"),
          "x-payment-accepts": "application/json",
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "content-type, x-payment, PAYMENT-SIGNATURE",
        }
      });
    }

    // 內部端點
    if (p === "/internal/sync") return handleInternalSync(req, env);
    if (p.startsWith("/internal/unrecall/")) return handleUnrecall(req, env);

    // 主要路由
    if (p.startsWith("/verify/")) return withCors(await handleVerify(req, env));
    if (p.startsWith("/preview/")) return withCors(await handlePreview(req, env));
    if (p.startsWith("/status/")) return withCors(await handleStatus(req, env));
    if (p.startsWith("/recover/")) return withCors(await handleRecover(req, env));
    if (p.startsWith("/buy/")) {
      return withCors(await handleBuy(req, env, {
        getPackageStatus: async id => await env.KV.get(`status:${id}`),
        getReplacement: async id => await env.KV.get(`replacement:${id}`),
        getPackageMeta: async id => {
          // D1 是 truth source：package 唔喺 D1 就 404，唔好由 KV cache 畀 meta
          const d1Meta = await env.DB.prepare('SELECT package_id, tier, title, q, evidence_count, expires_at FROM packages WHERE package_id = ?').bind(id).first<PackageMeta>();
          if (!d1Meta) return null;
          // D1 存在 → 合併 KV 附加資訊（如果有）
          const kvMeta = await env.KV.get(`meta:${id}`, "json") as PackageMeta | null;
          return kvMeta ?? d1Meta;
        },
        getData: async id => {
          const pkg = await env.KV.get(`pkg:${id}`, "json") as { data?: unknown } | null;
          return pkg?.data ?? pkg;
        },
        getVerification: async id => {
          return await env.KV.get(`verify:${id}`, "json") as Verification | null;
        },
      }));
    }
    if (p.startsWith("/reverify/")) return handleReverifyPush(req, env);
    if (p === "/mcp") return withCors(await handleMcp(req, env));
    if (p === "/dashboard.json") return withCors(await handleDashboard(env));
    if (p.startsWith("/dashboard/sales")) {
      try {
        const days = Math.min(90, Math.max(1, parseInt(new URL(req.url).searchParams.get("days") ?? "30", 10)));
        return withCors(await handleDashboardSales(env, days));
      } catch (e) {
        return json({ error: (e as Error).message }, 500);
      }
    }
    if (p === "/api/a2a/metrics") {
      try {
        return withCors(await handleA2AMetrics(req, env));
      } catch (e) {
        return json({ error: (e as Error).message }, 500);
      }
    }

    // Demand reports (witness-scribe fusion)
    if (p === "/api/demand/request") {
      if (req.method === "POST") return withCors(await handlePostDemandRequest(req, env));
    }
    if (p.startsWith("/api/demand/request/")) return withCors(await handleGetDemandRequest(req, env));
    if (p === "/api/demand/reports") return withCors(await handleListDemandReports(req, env));
    if (p.startsWith("/api/demand/reports/")) return withCors(await handleGetDemandReport(req, env));
    if (p === "/api/admin/demand-candidates") {
      if (req.method === "POST") return withCors(await handlePostDemandCandidates(req, env));
    }

    // 健康檢查
    if (p === "/healthz") {
      return json({
        ok: true,
        service: "ownsite-aeo",
        version: "1.18",
        base: env.OWNSITE_BASE,
        network: env.NETWORK,
        mock_facilitator: env.MOCK_FACILITATOR === "1",
        do_available: {
          nonce_lock: !!env.NONCE_LOCK,
          quota: !!env.QUOTA,
          circuit: !!env.CIRCUIT,
        },
        time: new Date().toISOString(),
      });
    }

    // 靜態資源回落
    if (env.ASSETS) {
      try {
        return await env.ASSETS.fetch(req);
      } catch {
        /* fall through */
      }
    }

    return json({ error: "not_found" }, 404);
  },
};

async function serveWellKnown(p: string, env: Env): Promise<Response> {
  const key = "wellknown:" + p;
  const cached = await env.KV.get(key, "text");
  if (cached) {
    return new Response(cached, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=60",
        "x-source": "worker-kv",
      },
    });
  }
  if (env.ASSETS) {
    try {
      const r = await env.ASSETS.fetch(new Request(`${env.OWNSITE_BASE}${p}`));
      return new Response(r.body, {
        status: r.status,
        headers: {
          ...Object.fromEntries(r.headers.entries()),
          "cache-control": "public, max-age=60",
          "x-source": "github-pages",
        },
      });
    } catch {
      /* fall through */
    }
  }
  return json({ error: "not_found" }, 404);
}
