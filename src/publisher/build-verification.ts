// ─── build-verification ───
// 由 verifier 輸出 + data 內容 + Ed25519 私鑰 → verification.json（含簽名）。
//
// 簽名覆蓋範圍：canonical({package_id, q, evidence_count, verified_at, expires_at, data_hash})
// 對以上 6 個字段的 canonical JSON 做 sha256，再用 Ed25519 簽名。

import { canonicalize, sha256Hex } from "../crypto/canonical";
import { signCanonical } from "../crypto/ed25519";
import { HALUCINATION_BOUNDARY_TEMPLATE, SIGNING_FIELDS } from "../shared/constants";
import type { Verification, VerifierOutput } from "../shared/types";

export interface BuildVerificationOpts {
  schemaUrl: string;       // 例如 https://ownsite.dev/schemas/research-package-v2.json
  verifierVersion: string; // 例如 v2.3.1
  license?: string;        // 預設 "commercial-use-permitted"
  hallucinationBoundary?: string; // 若省略，用模板
}

export async function buildVerification(
  v: VerifierOutput,
  data: unknown,
  privKeyHex: string,
  opts: BuildVerificationOpts
): Promise<Verification> {
  if (!v.package_id || !v.verified_at || !v.expires_at || typeof v.q !== "number") {
    throw new Error("buildVerification: invalid verifier output");
  }
  if (typeof privKeyHex !== "string" || privKeyHex.length !== 64) {
    throw new Error("buildVerification: privateKeyHex must be 64-hex-char string");
  }

  // 轉換 evidence：verifier 用 excerpt_sha256_hex，verification.json 用 excerpt_hash
  const evidence = v.evidence.map(e => ({
    evidence_id: e.evidence_id,
    source_url: e.source_url,
    source_type: e.source_type,
    accessed_at: e.accessed_at,
    excerpt_hash: "sha256:" + e.excerpt_sha256_hex,
    span: e.span,
    verifier_score: e.verifier_score,
  }));

  const dataHash = "sha256:" + sha256Hex(canonicalize(data));

  const signedFields: Record<string, unknown> = {};
  for (const k of SIGNING_FIELDS) {
    signedFields[k] =
      k === "data_hash" ? dataHash :
      k === "evidence_count" ? evidence.length :
      (v as unknown as Record<string, unknown>)[k];
  }
  const signature = await signCanonical(canonicalize(signedFields), privKeyHex);

  const domains = new Set(
    evidence.map(e => {
      try { return new URL(e.source_url).hostname; } catch { return ""; }
    }).filter(Boolean)
  );
  const sourceDiversity = Math.min(1, domains.size / Math.max(3, evidence.length));

  return {
    package_id: v.package_id,
    spec_version: "1.0",
    q: v.q,
    q_breakdown: v.q_breakdown,
    evidence,
    evidence_count: evidence.length,
    source_diversity: Number(sourceDiversity.toFixed(2)),
    verified_at: v.verified_at,
    expires_at: v.expires_at,
    verifier_version: opts.verifierVersion,
    verifier_signature: signature,
    data_hash: dataHash,
    schema_url: opts.schemaUrl,
    license: opts.license ?? "commercial-use-permitted",
    hallucination_boundary: opts.hallucinationBoundary ?? HALUCINATION_BOUNDARY_TEMPLATE,
  };
}

// ─── 驗簽（供 test agent 使用）───
export async function verifySignature(
  v: Verification,
  pubKeyHex: string
): Promise<boolean> {
  const { verifyCanonical } = await import("../crypto/ed25519");
  const signedFields: Record<string, unknown> = {};
  for (const k of SIGNING_FIELDS) signedFields[k] = v[k as keyof Verification];
  return verifyCanonical(canonicalize(signedFields), v.verifier_signature, pubKeyHex);
}
