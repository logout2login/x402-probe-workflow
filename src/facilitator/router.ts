// ─── v1.12 Facilitator Router ───
//
// 按優先順序調用 facilitators：primary（cdp）→ fallback（selfhosted）。
// 若 primary circuit open 則直接跳到 fallback。
// 結果寫入 settle_attempts 表。

import type { Env } from "../worker/env";
import { recordSettle } from "../worker/settle-record";
import { CDPFacilitator } from "./cdp";
import { SelfHostedFacilitator } from "./selfhosted";
import { CircuitBreaker } from "./circuit";
import type { SettleResponse } from "./interface";

const cdp = new CDPFacilitator();
const selfhosted = new SelfHostedFacilitator();

export async function routeAndSettle(
  env: Env,
  opts: {
    payment: { scheme: "exact"; network: string; payload: { txHash: string; payer: string; authorization?: string; signature?: string } };
    packageId: string;
    amountRequired: string;
    facilitatorName?: string;
  }
): Promise<SettleResponse & { facilitator: string; circuit_opened: string[] }> {
  const primary = opts.facilitatorName ?? env.FACILITATOR_PRIMARY ?? "cdp";
  const order = primary === "cdp" ? ["cdp", "selfhosted"] : ["selfhosted", "cdp"];
  const circuitBreakers: Record<string, CircuitBreaker> = {
    cdp: new CircuitBreaker({
      openAfter: parseInt(env.FACILITATOR_CIRCUIT_OPEN_AFTER || "5", 10),
      halfAfterMs: parseInt(env.FACILITATOR_CIRCUIT_HALF_AFTER || "60000", 10),
    }),
    selfhosted: new CircuitBreaker({
      openAfter: parseInt(env.FACILITATOR_CIRCUIT_OPEN_AFTER || "5", 10),
      halfAfterMs: parseInt(env.FACILITATOR_CIRCUIT_HALF_AFTER || "60000", 10),
    }),
  };

  const circuitOpened: string[] = [];
  const facEnv = {
    FACILITATOR_URL: env.FACILITATOR_URL,
    CDP_API_KEY: env.CDP_API_KEY,
    CDP_PRIVATE_KEY: env.CDP_PRIVATE_KEY,
    SELFHOSTED_PRIVATE_KEY: env.SELFHOSTED_PRIVATE_KEY,
    PAY_TO: env.PAY_TO,
    NETWORK: env.NETWORK,
    ASSET_USDC: env.ASSET_USDC,
    OWNSITE_BASE: env.OWNSITE_BASE,
    KV: env.KV, // v1.15：簽名 rail nonce 去重 + KV circuit breaker
  };

  const openAfter = parseInt(env.FACILITATOR_CIRCUIT_OPEN_AFTER || "5", 10);
  const halfAfterMs = parseInt(env.FACILITATOR_CIRCUIT_HALF_AFTER || "60000", 10);

  for (const name of order) {
    // 1. circuit breaker 檢查：KV 持久化版（跨 request 有效）；無 KV 時 fallback 記憶體版
    let open = false;
    let halfProbe = false;
    if (env.KV) {
      const g = await kvCircuitGate(env.KV, name, openAfter, halfAfterMs);
      open = g.open;
      halfProbe = g.half;
    } else {
      open = !circuitBreakers[name]!.canProceed();
    }
    if (open) {
      circuitOpened.push(name);
      continue;
    }
    const fac = name === "cdp" ? cdp : selfhosted;
    const req = {
      payment: opts.payment,
      packageId: opts.packageId,
      amountRequired: opts.amountRequired,
    };

    if (env.MOCK_FACILITATOR === "1") {
      // v1.20：production guard — 唔准 mock 交差
      if (process.env.ENVIRONMENT === "production") {
        throw new Error("FATAL: MOCK_FACILITATOR forbidden in production");
      }
      // local / preview 允許 mock（保留本地開發能力）
      const res: SettleResponse = {
        ok: true,
        amount: opts.amountRequired,
        payer: opts.payment.payload?.payer ?? "0xmock",
        txHash: opts.payment.payload?.txHash ?? "",
        latencyMs: 1,
      };
      if (env.KV) await env.KV.delete("cb:" + name).catch(() => {});
      else circuitBreakers[name]!.recordSuccess();
      await recordSettle(env, {
        txHash: res.txHash,
        packageId: opts.packageId,
        facilitator: name,
        attempt: 1,
        result: "settled",
        amountUsdc: res.amount,
        payer: res.payer,
        network: opts.payment.network,
        latencyMs: 1,
      });
      return { ...res, facilitator: name, circuit_opened: circuitOpened };
    }

    const res = await fac.settle(facEnv, req);
    if (res.ok) {
      if (env.KV) await env.KV.delete("cb:" + name).catch(() => {}); // 成功 → 重置 circuit
      else circuitBreakers[name]!.recordSuccess();
      await recordSettle(env, {
        txHash: res.txHash,
        packageId: opts.packageId,
        facilitator: name,
        attempt: 1,
        result: "settled",
        amountUsdc: res.amount,
        payer: res.payer,
        network: opts.payment.network,
        latencyMs: res.latencyMs,
      });
      return { ...res, facilitator: name, circuit_opened: circuitOpened };
    } else {
      if (env.KV) await kvCircuitFail(env.KV, name, openAfter, halfProbe);
      else circuitBreakers[name]!.recordFailure();
      await recordSettle(env, {
        txHash: opts.payment.payload?.txHash ?? "",
        packageId: opts.packageId,
        facilitator: name,
        attempt: 1,
        result: "facilitator_error",
        error: res.error,
        network: opts.payment.network,
        latencyMs: res.latencyMs,
      });
      continue; // 嘗試下一個
    }
  }

  return {
    ok: false,
    amount: "0",
    payer: "unknown",
    txHash: opts.payment.payload?.txHash ?? "",
    error: "all_facilitators_failed",
    facilitator: "none",
    circuit_opened: circuitOpened,
  };
}

// ─── v1.15: KV circuit breaker helper ───
// cb:{name} = {f, openedAt?} — f = 連續失敗次數；達 openAfter 打 openedAt（open 期）；
// openedAt + halfAfterMs 到期後放一次 half-open probe；probe 成功 → 刪除 key（reset）。

async function kvCircuitGate(
  kv: KVNamespace,
  name: string,
  openAfter: number,
  halfAfterMs: number,
): Promise<{ open: boolean; half: boolean }> {
  const raw = (await kv.get("cb:" + name, "json").catch(() => null)) as
    | { f?: number; openedAt?: number }
    | null;
  if (!raw || !raw.f) return { open: false, half: false };
  if (typeof raw.openedAt === "number") {
    if (Date.now() - raw.openedAt < halfAfterMs) return { open: true, half: false }; // open 期間
    return { open: false, half: true }; // half-open probe
  }
  if (raw.f >= openAfter) return { open: true, half: false };
  return { open: false, half: false };
}

async function kvCircuitFail(
  kv: KVNamespace,
  name: string,
  openAfter: number,
  wasHalfProbe: boolean,
): Promise<void> {
  const raw = (await kv.get("cb:" + name, "json").catch(() => null)) as { f?: number } | null;
  const f = (raw?.f ?? 0) + 1;
  const v: { f: number; openedAt?: number } = { f };
  if (f >= openAfter || wasHalfProbe) v.openedAt = Date.now(); // 達標或 probe 失敗 → open
  await kv.put("cb:" + name, JSON.stringify(v), { expirationTtl: 3600 }).catch(() => {});
}
