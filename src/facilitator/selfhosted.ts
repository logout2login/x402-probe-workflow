// ─── v1.12 Selfhosted Facilitator（真實實作）───
//
// SELFHOSTED_PRIVATE_KEY = 自託 facilitator EOA（testnet: 0x1930… / mainnet: 待換 key）。
// 兩條 rail（由 payment payload 決定）：
//
//   Rail A（plain capture，testnet 現用）：
//     agent 已直接轉 USDC 到 facilitator EOA（capture tx = paymentPayload.payload.txHash）
//     → on-chain 驗證 Transfer(payer → SELFHOSTED) 成功 + 金額範圍
//     → settle：平移到 env.PAY_TO（PAY_TO == SELFHOSTED 時 pass-through，零額外 tx）
//
//   Rail B（signed authorization，mainnet 標準）：
//     agent 簽 canonical 指令（asset|to|value|validAfter|validBefore|nonce|payer），
//     放喺 payload.authorization = base64(JSON)
//     → viem verifyMessage（on-chain ecrecover）驗 payer 簽名
//     → nonce 去重（KV permitnonce:{payer}:{nonce}）+ 有效期 window
//     → settle：facilitator 出 gas 提 USDC permit + transferFrom（payer 直接 → PAY_TO，
//       無 capture bounce）；allowance 已夠時直接 transferFrom
//
// 安全約束：
//   - 每個 ok:true 必須有 on-chain 證據（capture event / permit+transferFrom receipt）
//   - 金額 guard：capture 路 v ∈ [amount, 2×amount]；signed 路 value 必須 = amount
//   - to 必須 == env.PAY_TO（facilitator 唔會自行決定收款方）
//   - mainnet 無 authorization 直接拒（plain capture 只准 testnet 用）

import { createPublicClient, createWalletClient, http, toHex, keccak256, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import type { Facilitator, FacilitatorEnv, SettleRequest, SettleResponse } from "./interface";

const RPCS: Record<string, string[]> = {
  "eip155:8453": ["https://mainnet.base.org", "https://base.llamarpc.com"],
  "eip155:84532": ["https://sepolia.base.org", "https://base-sepolia.gateway.tenderly.co"],
};

// Canonical ERC-20 Transfer(address,address,uint256) event signature.
// 運行時由 event signature string 做 keccak 自導出（唔係 hardcoded 魔術字串），
// 確保同鏈上實際 emit 嘅 topics[0] 永遠一致 —— v1.12 之前 hardcoded 錯值導致
// capture-verify 永遠 mismatch → "capture_transfer_not_found"。
const USDC_TRANSFER_SIG = keccak256(stringToHex("Transfer(address,address,uint256)"));

const USDC_ABI = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "permit",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "nonces",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export class SelfHostedFacilitator implements Facilitator {
  readonly name = "selfhosted";

  async healthCheck(env: FacilitatorEnv): Promise<{ ok: boolean; error?: string }> {
    // no key：capture-verify-only 模式（PAY_TO 設定咗即 healthy；settle 只做零 tx 驗證）
    if (!env.SELFHOSTED_PRIVATE_KEY) {
      if (env.PAY_TO && !env.PAY_TO.includes("PLACEHOLDER")) return { ok: true };
      return { ok: false, error: "no_selfhosted_key" };
    }
    if (!env.PAY_TO) return { ok: false, error: "no_pay_to" };
    try {
      const transport = http(RPCS[env.NETWORK]?.[0] ?? "https://sepolia.base.org", {
        timeout: 20_000,
        batch: false,
      });
      const publicClient = createPublicClient({ chain: env.NETWORK === "eip155:8453" ? base : baseSepolia, transport });
      const c = await publicClient.getBlockNumber();
      return { ok: c > 0n };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }

  async settle(env: FacilitatorEnv, req: SettleRequest): Promise<SettleResponse> {
    const t0 = Date.now();
    const done = (patch: Omit<SettleResponse, "latencyMs">): SettleResponse => ({
      ...patch,
      latencyMs: Date.now() - t0,
    });

    const key = env.SELFHOSTED_PRIVATE_KEY;
    const hasAuth = Boolean(req.payment.payload?.authorization);
    // no key：僅容許 capture-verify-only（buyer 直接 pay PAY_TO，settle 零 tx）。signed authorization 仍需 key。
    if (!key && hasAuth) {
      return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_selfhosted_key" });
    }
    const payTo = env.PAY_TO;
    if (!payTo || payTo.includes("PLACEHOLDER")) {
      return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_pay_to" });
    }
    const amount = BigInt(req.amountRequired || "500000");
    const authorization = req.payment.payload?.authorization;

    const rpcs = RPCS[env.NETWORK];
    if (!rpcs) return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "unsupported_network:" + env.NETWORK });
    const chain = env.NETWORK === "eip155:8453" ? base : baseSepolia;
    const publicClient = createPublicClient({ chain, transport: http(rpcs[0], { timeout: 20_000, batch: false }) });

    if (authorization) {
      return this.settleSigned(env, publicClient, req, payTo, amount, done);
    }
    return this.settleCapture(env, publicClient, req, payTo, amount, done);
  }

  // ── Rail A: plain capture（testnet）──
  private async settleCapture(
    env: FacilitatorEnv,
    publicClient: any,
    req: SettleRequest,
    payTo: string,
    amount: bigint,
    done: (p: any) => SettleResponse,
  ): Promise<SettleResponse> {
    if (env.NETWORK === "eip155:8453") {
      return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "mainnet_requires_authorization" });
    }

    const payer = req.payment.payload?.payer;
    const txHash = req.payment.payload?.txHash;
    if (!payer || !txHash) {
      return done({ ok: false, amount: "0", payer: payer ?? "unknown", txHash: txHash ?? "", error: "missing_capture_fields" });
    }

    let receipt: any;
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    } catch {
      return done({ ok: false, amount: "0", payer, txHash, error: "capture_tx_not_found" });
    }
    if (receipt.status !== "success") {
      return done({ ok: false, amount: "0", payer, txHash, error: "capture_tx_reverted" });
    }

    // no key：capture 目的地即 PAY_TO 本身（pass-through，零 settle tx）
    const key = env.SELFHOSTED_PRIVATE_KEY;
    const facilitatorAddress = key ? privateKeyToAccount(key as `0x${string}`).address.toLowerCase() : payTo.toLowerCase();
    const usdc = env.ASSET_USDC.toLowerCase();

    let captured: bigint | null = null;
    const debugLog: string[] = [];
    for (const log of receipt.logs) {
      const logAddr = String(log.address).toLowerCase();
      const t0 = String(log.topics[0]).toLowerCase();
      const t1 = String(log.topics[1]).slice(26).toLowerCase();
      const t2 = String(log.topics[2]).slice(26).toLowerCase();
      const from = "0x" + t1;
      const to = "0x" + t2;
      debugLog.push(`log:addr=${logAddr} usdc=${usdc} match=${logAddr===usdc} | t0=${t0} sig=${USDC_TRANSFER_SIG} match=${t0===USDC_TRANSFER_SIG} | from=${from} payer=${payer.toLowerCase()} match=${from===payer.toLowerCase()} | to=${to} fac=${facilitatorAddress} match=${to===facilitatorAddress}`);
      if (String(log.address).toLowerCase() !== usdc) continue;
      if (log.topics.length < 3) continue;
      if (String(log.topics[0]).toLowerCase() !== USDC_TRANSFER_SIG) continue;
      if (from !== payer.toLowerCase() || to !== facilitatorAddress) continue;
      captured = BigInt(log.data);
      break;
    }
    console.log("[selfhosted] settleCapture logs:", JSON.stringify(debugLog));
    if (captured === null || captured === 0n) {
      return done({ ok: false, amount: "0", payer, txHash, error: "capture_transfer_not_found" });
    }
    if (captured < amount) {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "capture_underpaid" });
    }
    if (captured > 2n * amount) {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "capture_overpaid_guard" });
    }

    // settle：平移到 PAY_TO（pass-through 時零 tx）
    if (payTo.toLowerCase() === facilitatorAddress) {
      return done({ ok: true, amount: captured.toString(), payer, txHash });
    }

    const account = privateKeyToAccount(env.SELFHOSTED_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({ account, chain: publicClient.chain, transport: publicClient.transport });
    let settleHash: `0x${string}`;
    try {
      settleHash = await walletClient.writeContract({
        address: env.ASSET_USDC as `0x${string}`,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [payTo as `0x${string}`, captured],
        chain: publicClient.chain,
      });
    } catch (e: any) {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "settle_submit_failed:" + String(e?.shortMessage ?? e) });
    }
    let sr: any;
    try {
      sr = await publicClient.waitForTransactionReceipt({ hash: settleHash, timeout: 60_000 });
    } catch {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "settle_pending_timeout:" + settleHash });
    }
    if (sr.status !== "success") {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "settle_reverted:" + settleHash });
    }
    return done({ ok: true, amount: captured.toString(), payer, txHash: settleHash });
  }

  // ── Rail B: signed authorization（mainnet 標準）──
  private async settleSigned(
    env: FacilitatorEnv,
    publicClient: any,
    req: SettleRequest,
    payTo: string,
    amount: bigint,
    done: (p: any) => SettleResponse,
  ): Promise<SettleResponse> {
    const payer = req.payment.payload?.payer;
    if (!payer) return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "missing_payer" });

    let auth: any;
    try {
      auth = JSON.parse(atob(req.payment.payload!.authorization!));
    } catch {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "authorization_malformed" });
    }

    if (String(auth.asset ?? "").toLowerCase() !== env.ASSET_USDC.toLowerCase()) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_asset_mismatch" });
    }
    if (String(auth.to ?? "").toLowerCase() !== payTo.toLowerCase()) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_to_mismatch" });
    }
    let authValue: bigint;
    try {
      authValue = BigInt(auth.value);
    } catch {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_value_invalid" });
    }
    if (authValue !== amount) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_value_mismatch" });
    }
    const nowS = Math.floor(Date.now() / 1000);
    const validAfter: number = Number(auth.validAfter ?? 0);
    const validBefore: number = Number(auth.validBefore ?? 0);
    if (!Number.isFinite(validBefore) || nowS < validAfter || nowS > validBefore) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_outside_window" });
    }
    const nonce = String(auth.nonce ?? "");
    if (!nonce) return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_no_nonce" });

    // 簽名驗證（canonical 格式，跟 buyer 端對齊）
    const canonical = [env.ASSET_USDC, payTo, amount.toString(), validAfter, validBefore, nonce, payer].join("|");
    const verified = await publicClient
      .verifyMessage({
        address: payer as `0x${string}`,
        message: { raw: toHex(canonical) },
        signature: auth.signature as `0x${string}`,
      })
      .catch(() => false);
    if (!verified) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_signature_invalid" });
    }

    // nonce 去重（KV）
    const nkey = `permitnonce:${payer.toLowerCase()}:${nonce}`;
    if (env.KV) {
      const used = await env.KV.get(nkey);
      if (used) return done({ ok: false, amount: "0", payer, txHash: "", error: "nonce_reused" });
    }

    const account = privateKeyToAccount(env.SELFHOSTED_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({ account, chain: publicClient.chain, transport: publicClient.transport });
    const usdc = env.ASSET_USDC as `0x${string}`;

    const allowance = (await publicClient
      .readContract({ address: usdc, abi: USDC_ABI, functionName: "allowance", args: [payer as `0x${string}`, payTo as `0x${string}`] })
      .catch(() => 0n)) as bigint;

    if (allowance < amount) {
      const onChainNonce = (await publicClient
        .readContract({ address: usdc, abi: USDC_ABI, functionName: "nonces", args: [payer as `0x${string}`] })
        .catch(() => 0n)) as bigint;
      if (BigInt(nonce) < onChainNonce) {
        return done({ ok: false, amount: "0", payer, txHash: "", error: "nonce_consumed_onchain" });
      }
      const v = Number(auth.v ?? 27);
      const r = auth.r as `0x${string}`;
      const s = auth.s as `0x${string}`;
      if (!r || !s) return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_missing_rs" });
      let permitHash: `0x${string}`;
      try {
        permitHash = await walletClient.writeContract({
          address: usdc,
          abi: USDC_ABI,
          functionName: "permit",
          args: [payer as `0x${string}`, payTo as `0x${string}`, amount, BigInt(validBefore), BigInt(nonce), v, r, s],
          chain: publicClient.chain,
        });
      } catch (e: any) {
        return done({ ok: false, amount: "0", payer, txHash: "", error: "permit_submit_failed:" + String(e?.shortMessage ?? e) });
      }
      let pr: any;
      try {
        pr = await publicClient.waitForTransactionReceipt({ hash: permitHash, timeout: 60_000 });
      } catch {
        return done({ ok: false, amount: "0", payer, txHash: permitHash, error: "permit_pending_timeout" });
      }
      if (pr.status !== "success") {
        return done({ ok: false, amount: "0", payer, txHash: permitHash, error: "permit_reverted" });
      }
    }

    let settleHash: `0x${string}`;
    try {
      settleHash = await walletClient.writeContract({
        address: usdc,
        abi: USDC_ABI,
        functionName: "transferFrom",
        args: [payer as `0x${string}`, payTo as `0x${string}`, amount],
        chain: publicClient.chain,
      });
    } catch (e: any) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "settle_submit_failed:" + String(e?.shortMessage ?? e) });
    }
    let sr: any;
    try {
      sr = await publicClient.waitForTransactionReceipt({ hash: settleHash, timeout: 60_000 });
    } catch {
      return done({ ok: false, amount: "0", payer, txHash: settleHash, error: "settle_pending_timeout" });
    }
    if (sr.status !== "success") {
      return done({ ok: false, amount: "0", payer, txHash: settleHash, error: "settle_reverted" });
    }

    if (env.KV) {
      await env.KV.put(nkey, "1", { expirationTtl: 30 * 24 * 3600 });
    }
    return done({ ok: true, amount: amount.toString(), payer, txHash: settleHash });
  }
}
