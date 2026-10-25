// ─── Canonical JSON ───
// 穩定、無空白、key 按字典序排序，UTF-8 編碼。
// 這是 Ed25519 簽名的覆蓋範圍。簽名對象是 sha256(canonical(signed_fields))。

import { createHash } from "node:crypto";

export function canonicalize(value: unknown): string {
  if (value === null || value === undefined) return "null";
  const t = typeof value;
  if (t === "string" || t === "boolean") return JSON.stringify(value);
  if (t === "number") {
    if (!Number.isFinite(value)) return "null";
    return String(value);
  }
  if (t === "bigint") return String(value);
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalize).join(",") + "]";
  }
  if (t === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter(k => obj[k] !== undefined).sort();
    return "{" + keys.map(k => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
  }
  throw new Error("canonicalize: unsupported type " + t);
}

export function sha256Hex(input: string | Uint8Array): string {
  const h = createHash("sha256");
  if (typeof input === "string") h.update(input, "utf8");
  else h.update(input);
  return h.digest("hex");
}
