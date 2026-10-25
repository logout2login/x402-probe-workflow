// ─── 共用類型定義 ───
// 所有模組共享；Worker、Publisher、Test Agent 都用同一份。

export interface EvidenceItem {
  evidence_id: string;
  source_url: string;
  source_type: string;
  accessed_at: string; // ISO 8601 UTC
  excerpt_hash: string; // "sha256:<hex>"
  span: string;         // 例如 "para 4-7"
  verifier_score: number;
}

export interface QBreakdown {
  source_coverage: number;
  freshness: number;
  internal_consistency: number;
  claim_specificity: number;
  // 允許擴充，但不入簽名範圍
  [k: string]: number;
}

export interface Verification {
  package_id: string;
  spec_version: "1.0";
  q: number;
  q_effective?: number;
  q_breakdown: QBreakdown;
  evidence: EvidenceItem[];
  evidence_count: number;
  source_diversity: number;
  verified_at: string;
  expires_at: string;
  verifier_version: string;
  verifier_signature: string; // "ed25519:<base64url>"
  data_hash: string;          // "sha256:<hex>"
  schema_url: string;
  license: string;
  hallucination_boundary: string;
}

export interface PackageIndexEntry {
  package_id: string;
  title: string;
  q: number;
  q_effective: number;
  evidence_count: number;
  source_diversity: number;
  verified_at: string;
  expires_at: string;
  tier: "listed" | "featured";
  origin: "publisher" | "demand" | "demo";
  preview_url: string;
  verify_url: string;
  paid_url: string;
  price_usdc: string;
  status: "fresh";
  machine_tags?: string[];
}

export interface AgentIndex {
  spec_version: "1.0" | "1.1";
  generated_at: string;
  packages: PackageIndexEntry[];
}

export type Tier = "blocked" | "stale" | "listed" | "featured" | "unlisted";

export interface GateResult {
  tier: Tier;
  listed: boolean;
  featured: boolean;
  reasons: string[];
}

export interface X402Accept {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra: { name: string; version: string };
}

export interface X402PaymentPayload {
  scheme: "exact";
  network: string;
  payload: {
    txHash: string;
    payer: string;
    authorization?: string; // EIP-3009 transferWithAuthorization
    signature?: string;
  };
}

export interface PurchaseResponse {
  data: unknown;
  verification_snapshot: Verification & { snapshotted_at: string };
  receipt: {
    tx_hash: string;
    network: string;
    amount_usdc: string;
    purchased_at: string;
  };
}

export interface PaymentRecord {
  id?: number;
  agent_pseudonym: string;
  package_id: string;
  amount_usdc: string;
  tx_hash: string;
  called_at: string;
}

export interface JWK {
  kty: "OKP";
  crv: "Ed25519";
  x: string; // base64url encoded 32-byte public key
  kid: string;
  use: "sig";
  alg: "EdDSA";
}

export interface JWKS {
  keys: JWK[];
}

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  protocolVersion: string;
  capabilities: { streaming: boolean; pushNotifications: boolean };
  skills: Array<{
    id: string;
    name: string;
    description: string;
    inputModes: string[];
    outputModes: string[];
  }>;
  extensions: {
    ownsite_verification: {
      verification_spec: string;
      jwks_url: string;
      index_url: string;
      preview_policy: string;
      payment_protocols: string[];
      supported_networks: string[];
      currency: string;
      trust_query_endpoint: string;
      status_endpoint: string;
    };
  };
}

// ─── Publisher 輸入 ───
export interface VerifierOutput {
  package_id: string;
  q: number;
  q_breakdown: QBreakdown;
  evidence: Array<{
    evidence_id: string;
    source_url: string;
    source_type: string;
    accessed_at: string;
    span: string;
    // verifier 內部欄位；publisher 會轉為 excerpt_hash
    excerpt_sha256_hex: string;
    verifier_score: number;
  }>;
  verified_at: string;
  expires_at: string;
  verifier_version: string;
  // 可選，用於 index 標題
  title?: string;
}

// ─── Sync queue entry ───
export interface SyncQueueEntry {
  id: string;
  package_id: string;
  action: "publish" | "unpublish" | "recall" | "update";
  created_at: string;
  attempts: number;
  last_error?: string;
}
