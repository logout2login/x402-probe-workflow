// ─── JWKS 生成與驗簽助手 ───
// 用於：
//   1. Publisher 生成 jwks.json（寫入 public/.well-known/jwks.json，SSOT）
//   2. Agent 從 jwks.json 取公鑰，做離線 Ed25519 驗簽

import { toBase64Url } from "./ed25519";
import { hexToBytes } from "./ed25519";
import type { JWK, JWKS } from "../shared/types";

export function buildJwks(pubKeyHex: string, kid: string = "verifier-1"): JWKS {
  const pubBytes = hexToBytes(pubKeyHex);
  if (pubBytes.length !== 32) throw new Error(`Ed25519 public key must be 32 bytes, got ${pubBytes.length}`);
  const key: JWK = {
    kty: "OKP",
    crv: "Ed25519",
    x: toBase64Url(pubBytes),
    kid,
    use: "sig",
    alg: "EdDSA",
  };
  return { keys: [key] };
}

export function firstPubKeyHexFromJwks(jwks: JWKS, kid?: string): string {
  const match = kid
    ? jwks.keys.find(k => k.kid === kid)
    : jwks.keys[0];
  if (!match) throw new Error("jwks: no matching key");
  if (match.kty !== "OKP" || match.crv !== "Ed25519") {
    throw new Error("jwks: unsupported key type");
  }
  const bytes = Uint8Array.from(
    atob(match.x.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(match.x.length / 4) * 4, "=")),
    c => c.charCodeAt(0)
  );
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
