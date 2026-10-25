// ─── Ed25519 簽名 / 驗簽 ───
//
// 使用 @noble/ed25519 v2.x。
// v2 必須通過 ed.etc.sha512Sync 注入 sha512。
//
// 簽名對象：sha256(canonical(signed_fields))，不是整個 verification.json。
// signed_fields = package_id, q, evidence_count, verified_at, expires_at, data_hash。
//
// 硬性約束：本模組只接受 hex 字符串作為私鑰/公鑰。
// 不要在任何檔案中硬編碼私鑰。

import * as ed from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha256";
import { sha512 } from "@noble/hashes/sha512";

// ─── 注入 sha512（v2 API）───
// ed25519 內部調用 sha512(digest)，digest 是長度可變的位元組拼接
// （H || 0^{128} || k || m），必須一次性 hash。
const etc = ed.etc as unknown as {
  sha512Sync?: (...a: Uint8Array[]) => Uint8Array;
};
if (!etc.sha512Sync) {
  etc.sha512Sync = (...arrs: Uint8Array[]) => {
    const total = arrs.reduce((n, a) => n + a.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const a of arrs) {
      out.set(a, off);
      off += a.length;
    }
    return sha512(out);
  };
}

const enc = new TextEncoder();

export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

export function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]+$/.test(hex)) throw new Error("hex: invalid chars");
  if (hex.length % 2 !== 0) throw new Error("hex: odd length");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 對 canonical JSON 字串做 Ed25519 簽名。
 * 簽名對象 = sha256(canonical)。
 */
export async function signCanonical(canonicalStr: string, privKeyHex: string): Promise<string> {
  const priv = hexToBytes(privKeyHex);
  if (priv.length !== 32) throw new Error(`ed25519 private key must be 32 bytes, got ${priv.length}`);
  const digest = sha256(enc.encode(canonicalStr));
  const sig = await ed.signAsync(digest, priv);
  return "ed25519:" + toBase64Url(sig);
}

/** 驗簽。canonicalStr 必須與簽名時完全一致。 */
export async function verifyCanonical(
  canonicalStr: string,
  signature: string,
  pubKeyHex: string
): Promise<boolean> {
  if (!signature.startsWith("ed25519:")) return false;
  try {
    const sig = fromBase64Url(signature.slice("ed25519:".length));
    const pub = hexToBytes(pubKeyHex);
    if (sig.length !== 64 || pub.length !== 32) return false;
    const digest = sha256(enc.encode(canonicalStr));
    return await ed.verifyAsync(sig, digest, pub);
  } catch {
    return false;
  }
}

export async function getPublicKey(privKeyHex: string): Promise<Uint8Array> {
  return ed.getPublicKeyAsync(hexToBytes(privKeyHex));
}

export async function generateKeypair(): Promise<{ privateKeyHex: string; publicKeyHex: string }> {
  const priv = ed.utils.randomPrivateKey();
  const pub = await ed.getPublicKeyAsync(priv);
  return { privateKeyHex: bytesToHex(priv), publicKeyHex: bytesToHex(pub) };
}
