// ─── v1.9 Settle Record 工具 ───
//
// 記錄每筆結算嘗試（含成功與失敗）到 settle_attempts 表。
// 由 buy.ts 在結算前後呼叫。

import type { Env } from "./env";

export interface SettleAttemptInput {
  txHash: string;
  packageId: string;
  facilitator: string;   // cdp / selfhosted
  attempt: number;
  result: "settled" | "facilitator_error" | "network_error" | "rejected";
  amountUsdc?: string;
  payer?: string;
  latencyMs?: number;
  error?: string;
}

export async function recordSettle(env: Env, input: SettleAttemptInput): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO settle_attempts (tx_hash, package_id, facilitator, attempt, result, amount_usdc, payer, latency_ms, error, called_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    input.txHash,
    input.packageId,
    input.facilitator,
    input.attempt,
    input.result,
    input.amountUsdc ?? null,
    input.payer ?? null,
    input.latencyMs ?? null,
    input.error ?? null,
    new Date().toISOString()
  ).run();
}
