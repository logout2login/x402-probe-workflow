// ─── test-agent ───
// Phase 1 DoD 測試 Agent：不讀任何人類文件，只依賴 agent.json + agent-index + verify
// 完成「發現 → 離線驗簽 → preview → 402 → 購買 → 驗簽 → TTL」全流程。
//
// 使用模式：
//   --mock           （預設）本地 mock 模式，不需 wrangler dev
//   --base <url>     真實模式，對運行中的 Worker（http://localhost:8787）
//
// 硬性約束：
//   - 本 Agent 不寫入任何私鑰或 payment header 到檔案。
//   - 真實 payment 需要人類準備 base-sepolia 錢包與 faucet；v1 只跑到 402 challenge。
//   - MOCK_FACILITATOR 模式下 payment header 為 mock，不上鏈。

import { readFileSync } from "node:fs";
import { canonicalize } from "../src/crypto/canonical";
import { generateKeypair, verifyCanonical } from "../src/crypto/ed25519";
import { buildJwks, firstPubKeyHexFromJwks } from "../src/crypto/jwks";
import { buildVerification } from "../src/publisher/build-verification";
import { aeoGate } from "../src/publisher/publish-guard";
import type { AgentCard, AgentIndex, JWKS, Verification, X402Accept } from "../src/shared/types";

const args = process.argv.slice(2);
const MOCK = args.includes("--mock") || !args.includes("--base");
const BASE = MOCK
  ? "http://mock:0"
  : args[args.indexOf("--base") + 1] ?? "http://localhost:8787";

let pass = 0, fail = 0;
const steps: string[] = [];
function step(ok: boolean, msg: string) {
  if (ok) { pass++; steps.push(`  ✅ ${msg}`); }
  else { fail++; steps.push(`  ❌ ${msg}`); }
}

type HttpResp = { status: number; ok: boolean; json: () => Promise<unknown> };

// ─── Mock KV ───
const mockKV = new Map<string, string>();
const mockPayments = new Set<string>();

async function seedMock(): Promise<void> {
  const kp = await generateKeypair();
  const verifierOut = JSON.parse(
    readFileSync("fixtures/sample-verifier-output.json", "utf8")
  );
  const data = JSON.parse(readFileSync("fixtures/sample-data.json", "utf8"));
  const v = await buildVerification(verifierOut, data, kp.privateKeyHex, {
    schemaUrl: "https://ownsite.dev/schemas/verification-v1.json",
    verifierVersion: "v2.3.1",
  });
  const pkgId = v.package_id;
  mockKV.set(`verify:${pkgId}`, JSON.stringify(v));
  mockKV.set(`pkg:${pkgId}`, JSON.stringify({ title: "AI Agent Adoption Q4 2026", data }));
  mockKV.set(
    `meta:${pkgId}`,
    JSON.stringify({
      package_id: pkgId,
      tier: "featured",
      title: "AI Agent Adoption Q4 2026",
      q: v.q,
      evidence_count: v.evidence_count,
      expires_at: v.expires_at,
    })
  );
  const index: AgentIndex = {
    spec_version: "1.0",
    generated_at: new Date().toISOString(),
    packages: [
      {
        package_id: pkgId,
        title: "AI Agent Adoption Q4 2026",
        q: v.q,
        q_effective: 0.79,
        evidence_count: v.evidence_count,
        source_diversity: v.source_diversity,
        verified_at: v.verified_at,
        expires_at: v.expires_at,
        tier: "featured",
        preview_url: `${BASE}/preview/${pkgId}`,
        verify_url: `${BASE}/verify/${pkgId}`,
        paid_url: `${BASE}/buy/${pkgId}`,
        price_usdc: "1.00",
        status: "fresh",
      },
    ],
  };
  mockKV.set("index", JSON.stringify(index));
  const jwks = buildJwks(kp.publicKeyHex, "verifier-mock");
  mockKV.set("jwks", JSON.stringify(jwks));
}

async function mockGet(
  url: string,
  headers: Record<string, string> = {}
): Promise<HttpResp> {
  const u = new URL(url);
  const ok = (body: unknown): HttpResp => ({
    status: 200,
    ok: true,
    json: async () => body,
  });
  const err = (status: number, body: unknown): HttpResp => ({
    status,
    ok: false,
    json: async () => body,
  });

  if (u.pathname === "/.well-known/agent.json") {
    return ok(JSON.parse(readFileSync("public/.well-known/agent.json", "utf8")));
  }
  if (u.pathname === "/.well-known/agent-index.json") {
    return ok(JSON.parse(mockKV.get("index") ?? "{}"));
  }
  if (u.pathname === "/.well-known/jwks.json") {
    return ok(JSON.parse(mockKV.get("jwks") ?? "{}"));
  }
  if (u.pathname.startsWith("/verify/")) {
    const id = u.pathname.split("/verify/")[1]!;
    const raw = mockKV.get(`verify:${id}`);
    return raw ? ok(JSON.parse(raw)) : err(404, { error: "not_found" });
  }
  if (u.pathname.startsWith("/preview/")) {
    const id = u.pathname.split("/preview/")[1]!;
    const raw = mockKV.get(`pkg:${id}`);
    if (!raw) return err(404, { error: "not_found" });
    const parsed = JSON.parse(raw);
    return ok({
      package_id: id,
      preview: true,
      records: Array.isArray(parsed?.data) ? parsed.data.slice(0, 3) : [parsed?.data],
      verification_summary: mockKV.has(`verify:${id}`)
        ? JSON.parse(mockKV.get(`verify:${id}`)!).q
        : null,
      full_url: `${BASE}/buy/${id}`,
    });
  }
  if (u.pathname.startsWith("/status/")) {
    const id = u.pathname.split("/status/")[1]!;
    const status = mockKV.get(`status:${id}`) ?? "fresh";
    return ok({ package_id: id, status, replacement_package_id: null });
  }
  if (u.pathname.startsWith("/buy/")) {
    const id = u.pathname.split("/buy/")[1]!;
    const paymentHeader = headers["x-payment"] ?? headers["X-PAYMENT"];
    if (!paymentHeader) {
      const meta = JSON.parse(mockKV.get(`meta:${id}`)!);
      return err(402, {
        x402Version: 1,
        accepts: [
          {
            scheme: "exact",
            network: "eip155:8453",
            maxAmountRequired: "1000000",
            resource: `${BASE}/buy/${id}`,
            description: `${meta.title} - q=${meta.q}, evidence=${meta.evidence_count}`,
            mimeType: "application/json",
            payTo: "0xmock",
            maxTimeoutSeconds: 300,
            asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            extra: { name: "USDC", version: "2" },
          },
        ],
      });
    }
    let payment: { payload?: { txHash?: string } };
    try {
      payment = JSON.parse(atob(paymentHeader));
    } catch {
      return err(400, { error: "bad_payment" });
    }
    const txHash = payment.payload?.txHash ?? "";
    if (mockPayments.has(txHash)) return err(403, { error: "tx_replay" });
    mockPayments.add(txHash);
    const verification = JSON.parse(mockKV.get(`verify:${id}`)!);
    const pkg = JSON.parse(mockKV.get(`pkg:${id}`)!);
    return ok({
      data: pkg.data,
      verification_snapshot: {
        ...verification,
        snapshotted_at: new Date().toISOString(),
      },
      receipt: {
        tx_hash: txHash,
        network: "eip155:8453",
        amount_usdc: "1000000",
        purchased_at: new Date().toISOString(),
      },
    });
  }
  return err(404, { error: "not_found" });
}

async function httpGet(
  url: string,
  headers: Record<string, string> = {}
): Promise<HttpResp> {
  const r = await fetch(url, {
    headers: { "user-agent": "ownsite-test-agent/1.0", ...headers },
  });
  return { status: r.status, ok: r.ok, json: async () => r.json() };
}

async function httpPost(
  url: string,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<HttpResp> {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "ownsite-test-agent/1.0",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  return { status: r.status, ok: r.ok, json: async () => r.json() };
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<HttpResp> {
  return MOCK ? mockGet(url, headers) : httpGet(url, headers);
}

async function main() {
  steps.push(`\n═══ Test Agent (mode=${MOCK ? "mock" : "live"}) ═══`);
  steps.push(`BASE = ${BASE}\n`);

  if (MOCK) await seedMock();

  // 1. Discover
  steps.push("\n── Step 1: Discover agent card ──");
  const card = (await (await getJson(`${BASE}/.well-known/agent.json`)).json()) as AgentCard;
  step(!!card?.extensions?.ownsite_verification, "agent.json has ownsite_verification extension");
  step(
    typeof card?.extensions?.ownsite_verification?.jwks_url === "string",
    "jwks_url present"
  );

  // 2. Fetch index
  steps.push("\n── Step 2: Fetch agent-index ──");
  const index = (await (await getJson(`${BASE}/.well-known/agent-index.json`)).json()) as AgentIndex;
  step(index.packages.length > 0, `index has ${index.packages.length} packages`);

  // 3. Filter
  steps.push("\n── Step 3: Filter by q >= 0.72 && evidence >= 4 ──");
  const candidates = index.packages.filter(p => p.q >= 0.72 && p.evidence_count >= 4);
  step(candidates.length > 0, `found ${candidates.length} qualified packages`);
  const pkg = candidates[0]!;

  // 4. Fetch verification
  steps.push(`\n── Step 4: Fetch /verify/${pkg.package_id} ──`);
  const verifyResp = await getJson(`${BASE}/verify/${pkg.package_id}`);
  step(verifyResp.status === 200, `verify returned ${verifyResp.status}`);

  // 5. JWKS + offline verify
  steps.push("\n── Step 5: Fetch JWKS + offline verify ──");
  const jwksResp = await getJson(`${BASE}/.well-known/jwks.json`);
  const jwks = (await jwksResp.json()) as JWKS;

  const verifyResp2 = await getJson(`${BASE}/verify/${pkg.package_id}`);
  const verification = (await verifyResp2.json()) as Verification;

  const signedFields = {
    package_id: verification.package_id,
    q: verification.q,
    evidence_count: verification.evidence_count,
    verified_at: verification.verified_at,
    expires_at: verification.expires_at,
    data_hash: verification.data_hash,
  };
  const pubHex = firstPubKeyHexFromJwks(jwks);
  const sigOk = await verifyCanonical(
    canonicalize(signedFields),
    verification.verifier_signature,
    pubHex
  );
  step(sigOk, "Ed25519 offline signature verified");

  // 6. Preview
  steps.push(`\n── Step 6: Fetch /preview/${pkg.package_id} ──`);
  const previewResp = await getJson(`${BASE}/preview/${pkg.package_id}`, {
    "x-agent-id": "test-agent",
  });
  const preview = (await previewResp.json()) as { preview?: boolean };
  step(!!preview.preview, "preview returned with preview=true");

  // 7. 402 challenge
  steps.push(`\n── Step 7: GET /buy/${pkg.package_id} without payment ──`);
  const challengeResp = await getJson(`${BASE}/buy/${pkg.package_id}`);
  step(challengeResp.status === 402, `expected 402, got ${challengeResp.status}`);
  const challenge = (await challengeResp.json()) as { accepts?: X402Accept[] };
  step(
    Array.isArray(challenge.accepts) && challenge.accepts.length > 0,
    "402 response has accepts array"
  );
  const accept: X402Accept | undefined = challenge.accepts?.[0];
  if (accept) {
    step(accept.scheme === "exact", "scheme = exact");
    step(accept.network === "eip155:8453", "network = eip155:8453 (Base)");
    step(!!accept.asset && accept.asset.startsWith("0x"), "asset is USDC address");
    step(!!accept.payTo, "payTo wallet present");
  }

  // 8. Buy with mock X-PAYMENT
  steps.push(`\n── Step 8: Buy with mock X-PAYMENT ──`);
  const mockPayment = btoa(
    JSON.stringify({
      scheme: "exact",
      network: "eip155:8453",
      payload: { txHash: "0xmock_tx_" + Date.now(), payer: "0xmockpayer" },
    })
  );
  const buyResp = await getJson(`${BASE}/buy/${pkg.package_id}`, { "x-payment": mockPayment });
  step(buyResp.status === 200, `buy returned ${buyResp.status}`);
  const pack = (await buyResp.json()) as {
    data?: unknown;
    verification_snapshot?: Verification & { snapshotted_at?: string };
    receipt?: {
      tx_hash: string;
      network: string;
      amount_usdc: string;
      purchased_at: string;
    };
  };
  step(!!pack.data, "response has data");
  step(!!pack.verification_snapshot, "response has verification_snapshot");
  step(!!pack.receipt, "response has receipt");
  if (pack.receipt) {
    step(
      pack.receipt.tx_hash.startsWith("0xmock_tx_"),
      "receipt tx_hash matches"
    );
    step(pack.receipt.network === "eip155:8453", "receipt network = Base");
  }

  // 9. Replay
  steps.push(`\n── Step 9: Replay same tx_hash ──`);
  const replayResp = await getJson(`${BASE}/buy/${pkg.package_id}`, {
    "x-payment": mockPayment,
  });
  step(replayResp.status === 403, `replay returned ${replayResp.status} (expected 403)`);
  const replay = (await replayResp.json()) as { error?: string };
  step(replay.error === "tx_replay", `replay error = ${replay.error}`);

  // 10. Status
  steps.push(`\n── Step 10: GET /status/${pkg.package_id} ──`);
  const statusResp = await getJson(`${BASE}/status/${pkg.package_id}`);
  const status = (await statusResp.json()) as { status: string };
  step(status.status === "fresh", `status = ${status.status}`);

  // 11. TTL
  steps.push(`\n── Step 11: Check expires_at & compute TTL ──`);
  const exp = new Date(pkg.expires_at);
  const ttlDays = Math.round((exp.getTime() - Date.now()) / 86400_000);
  step(ttlDays > 0, `expires_at in future (${ttlDays} days remaining)`);

  // 12. MCP initialize
  steps.push(`\n── Step 12: MCP initialize (live mode only) ──`);
  if (!MOCK) {
    const mcpResp = await httpPost(
      `${BASE}/mcp`,
      { jsonrpc: "2.0", id: 1, method: "initialize", params: {} }
    );
    const mcpInit = (await mcpResp.json()) as {
      result?: { instructions?: string };
    };
    step(
      !!mcpInit?.result?.instructions?.includes("Always call get_verification"),
      "MCP initialize returns instructions"
    );
  } else {
    step(true, "MCP initialize (skipped in mock mode - requires live Worker)");
  }

  // 13. AEO gate final verification
  steps.push(`\n── Step 13: AEO gate on verified package ──`);
  const g = aeoGate(verification, { now: new Date() });
  step(g.listed, `verified package passed AEO gate (tier=${g.tier})`);

  steps.push(`\n════════════════════════════════════════`);
  steps.push(`  PASS: ${pass}   FAIL: ${fail}`);
  steps.push(`════════════════════════════════════════`);
  console.log(steps.join("\n"));
  if (fail > 0) process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
