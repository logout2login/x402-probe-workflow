// ─── Pseudonym 派生 ───
// 只存 SHA-256 派生標識，不存原始 payer 地址。
// 使用 Web Crypto API（Cloudflare Workers 原生支持，不需 node:crypto）。

export async function derivePseudonym(payer: string): Promise<string> {
  const normalized = payer.toLowerCase().trim();
  const enc = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", enc as BufferSource);
  const hex = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
  return "psn_" + hex;
}
