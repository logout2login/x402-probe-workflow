// ─── x402 支付閘 ───
//
// 402 響應結構（與 Bazaar 兼容）：
// {
//   "x402Version": 1,
//   "accepts": [{
//     "scheme": "exact",
//     "network": "eip155:8453",
//     "maxAmountRequired": "500000",   // 6 位小數 base units
//     "resource": "https://.../buy/{id}",
//     "description": "...",
//     "mimeType": "application/json",
//     "payTo": "0x...",
//     "maxTimeoutSeconds": 300,
//     "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//     "extra": { "name": "USDC", "version": "2" }
//   }]
// }
//
// Worker 處理順序（§3.4）：
//   1. 無 X-PAYMENT → 返回 402 + accepts
//   2. 解碼 payment，檢查 scheme/network 匹配
//   3. KV 檢查 tx_hash 是否已消費（防重放）
//   4. 調用 CDP facilitator verify-and-settle
//   5. 寫入支付記錄（只存 SHA-256 派生 agent_pseudonym）
//   6. 返回 { data, verification_snapshot, receipt }
//
// 硬性約束：Worker 不重算 q、不重拉 evidence；只驗支付是否真實結算。

import {
  PRICE_FEATURED_6DECIMAL,
  PRICE_STANDARD_6DECIMAL,
  TX_REPLAY_TTL_SECONDS,
} from "../shared/constants";
import type { Env } from "./env";
import { json } from "./http";
import { derivePseudonym } from "./pseudonym";
import { routeAndSettle } from "../facilitator/router";
import { canonicalize, sha256Hex } from "../crypto/canonical";
import type { X402Accept, X402PaymentPayload, Verification } from "../shared/types";

export interface PackageMeta {
  package_id: string;
  tier: "listed" | "featured";
  title: string;
  q: number;
  evidence_count: number;
  expires_at: string;
}

export async function handleBuy(
  req: Request,
  env: Env,
  opts: {
    // Worker 在 index.ts 中注入，避免 circular dep
    getPackageStatus: (id: string) => Promise<string | null>;
    getReplacement: (id: string) => Promise<string | null>;
    getPackageMeta: (id: string) => Promise<PackageMeta | null>;
    getData: (id: string) => Promise<unknown>;
    getVerification: (id: string) => Promise<Verification | null>;
  }
): Promise<Response> {
  const id = parseIdFromPath(req.url);
  if (!id) return json({ error: "invalid_package_id" }, 400);

  // 檢查 recall / stale 狀態
  const status = await opts.getPackageStatus(id);
  if (status === "recalled") {
    const replacement = await opts.getReplacement(id);
    return json(
      { error: "pack_recalled", replacement_package_id: replacement ?? null },
      410
    );
  }
  if (status === "stale") {
    // stale 允許購買但響應帶 stale=true 標記（對應計劃書 §5.2）
    // 但 v1 保守：stale 也返回 410 + replacement
    const replacement = await opts.getReplacement(id);
    return json(
      { error: "pack_stale", replacement_package_id: replacement ?? null },
      410
    );
  }

  const paymentHeader = req.headers.get("x-payment");
  if (!paymentHeader) {
    const meta = await opts.getPackageMeta(id);
    if (!meta) return json({ error: "not_found" }, 404);
    return paymentRequiredResponse(id, meta, env);
  }

  let payment: X402PaymentPayload;
  try {
    payment = JSON.parse(atob(paymentHeader)) as X402PaymentPayload;
  } catch {
    return json({ error: "bad_payment_header" }, 400);
  }

  if (payment.scheme !== "exact") {
    return json({ error: "unsupported_scheme" }, 403);
  }
  if (payment.network !== env.NETWORK) {
    return json({ error: "unsupported_network" }, 403);
  }

  const txHash = payment.payload?.txHash;
  if (!txHash) return json({ error: "missing_tx_hash" }, 400);

  // 防重放
  const seen = await env.KV.get(`tx:${txHash}`);
  if (seen) {
    return json({ error: "tx_replay" }, 403);
  }

  // 結算（v1.12: 走 facilitator router）
  const settle = await routeAndSettle(env, {
    payment,
    packageId: id,
    amountRequired: PRICE_STANDARD_6DECIMAL,
  });

  if (!settle.ok) {
    return json({ error: "settlement_failed", reason: settle.error }, 403);
  }

  // 標記 tx 已消費
  await env.KV.put(`tx:${txHash}`, "1", {
    expirationTtl: TX_REPLAY_TTL_SECONDS,
  });

  // 寫入 D1 支付記錄（只存 pseudonym，不存原始 payer）
  const pseudonym = await derivePseudonym(settle.payer);
  await env.DB.prepare(
    "INSERT INTO payments (agent_pseudonym, package_id, amount_usdc, tx_hash, network, called_at) VALUES (?,?,?,?,?,?)"
  )
    .bind(pseudonym, id, settle.amount, txHash, env.NETWORK, new Date().toISOString())
    .run();

  // 取回 data + verification
  const [data, verification] = await Promise.all([
    opts.getData(id),
    opts.getVerification(id),
  ]);
  if (!data || !verification) {
    // 結算成功但內容不存在：這是嚴重錯誤。
    // 上線前必須確保 KV 與支付記錄一致。
    return json(
      { error: "internal_inconsistency", tx_hash: txHash },
      500
    );
  }

  const purchasedAt = new Date().toISOString();
  return json({
    data,
    verification_snapshot: {
      ...verification,
      snapshotted_at: purchasedAt,
    },
    current_data_hash: "sha256:" + sha256Hex(canonicalize(data)),
    receipt: {
      tx_hash: txHash,
      network: env.NETWORK,
      amount_usdc: settle.amount,
      purchased_at: purchasedAt,
    },
  });
}

export function paymentRequiredResponse(
  id: string,
  meta: PackageMeta,
  env: Env
): Response {
  const accept: X402Accept = {
    scheme: "exact",
    network: env.NETWORK,
    amount:
      meta.tier === "featured" ? PRICE_FEATURED_6DECIMAL : PRICE_STANDARD_6DECIMAL,
    resource: `${env.OWNSITE_BASE}/buy/${id}`,
    description: `${meta.title} — q=${meta.q.toFixed(2)}, evidence=${meta.evidence_count}, expires ${meta.expires_at.slice(0, 10)}`,
    mimeType: "application/json",
    payTo: env.PAY_TO ?? "0xPLACEHOLDER_PAY_TO",
    maxTimeoutSeconds: 300,
    asset: env.ASSET_USDC,
    extra: { name: "USDC", version: "2" },
    extensions: {
      bazaar: {
        info: { input: { type: "http", method: "GET" }, output: { example: "application/json" } },
        name: meta.title ?? "Agent2Agent Service",
        description: `${meta.title} — x402 verified capability (q=${meta.q.toFixed(2)})`,
        tags: ["agent", "x402", "a2a", meta.tier ?? "standard"],
        schema: { type: "object", url: `${env.OWNSITE_BASE}/.well-known/agent-index.json` },
      },
    },
  };
  const payload = {
    x402Version: 2,
    resource: {
      url: accept.resource,
      description: accept.description,
    },
    accepts: [accept],
    extensions: accept.extensions,
  };
  return new Response(
    JSON.stringify(payload),
    {
      status: 402,
      headers: {
        "content-type": "application/json",
        "PAYMENT-REQUIRED": Buffer.from(JSON.stringify(payload)).toString("base64"),
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type, x-payment, PAYMENT-SIGNATURE",
      }
    }
  );
}

// NOTE: mockSettle 和 settleViaFacilitator 已被 src/facilitator/router.ts 取代。
// router 統一處理 CDP + selfhosted 雙 facilitator、circuit breaker、settle_attempts 記錄。

function parseIdFromPath(url: string): string | null {
  const m = url.match(/\/buy\/([^/?#]+)/);
  if (!m) return null;
  return decodeURIComponent(m[1]!);
}
