// ─── v1.13 Cursor 簽名 ───
//
// HMAC-SHA256 簽名 cursor，防止客戶端捏造跳頁偏移。
// cursor 格式：base64url(payload) . base64url(hmac_sha256(payload))
//
// payload 包含 offset / limit / generated_at / exp

import { sha256 } from "@noble/hashes/sha256";
import { hmac } from "@noble/hashes/hmac";

export interface CursorPayload {
  offset: number;
  limit: number;
  generated_at: string;
  exp: number; // unix ms
}

const CURSOR_TTL_MS = 6 * 3600 * 1000; // 6 小時

export function encodeCursor(secret: string | undefined, payload: CursorPayload): string {
  const body = JSON.stringify({ ...payload, exp: payload.exp ?? Date.now() + CURSOR_TTL_MS });
  const bodyB64 = btoa(body).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (!secret) return `${bodyB64}.unsigned`;
  const mac = hmac(sha256, new TextEncoder().encode(secret), new TextEncoder().encode(bodyB64));
  const macB64 = btoa(String.fromCharCode(...Array.from(mac))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${bodyB64}.${macB64}`;
}

export function decodeCursor(
  raw: string | null,
  secret: string | undefined
): CursorPayload | null {
  if (!raw) return null;
  const [bodyB64, macB64] = raw.split(".");
  if (!bodyB64 || !macB64) return null;
  if (macB64 === "unsigned" && !secret) {
    // 無 secret 模式：只解，不驗（僅測試用）
  } else if (secret) {
    const expected = hmac(sha256, new TextEncoder().encode(secret), new TextEncoder().encode(bodyB64));
    const expectedB64 = btoa(String.fromCharCode(...expected)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (expectedB64 !== macB64) return null;
  } else {
    return null;
  }
  try {
    const body = JSON.parse(atob(bodyB64.replace(/-/g, "+").replace(/_/g, "/"))) as CursorPayload;
    if (body.exp && body.exp < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}
