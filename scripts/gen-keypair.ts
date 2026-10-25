// ─── gen-keypair ───
// 產生 Ed25519 密鑰對，寫入 stdout。
//
// 硬性約束：
//   - 本腳本只在 trustworthy 環境（開發者本機）運行。
//   - PRIVATE_HEX 絕不寫入檔案、絕不入庫、絕不放 wrangler vars。
//   - PUBLIC_HEX 寫入 public/.well-known/jwks.json（SSOT，可入庫）。
//   - CI 生成 verification.json 時，VERIFIER_PRIVATE_KEY 由 GitHub Actions Environment
//     Secret 讀取（例如 VERIFIER_PRIVATE_KEY_HEX），且只授予在 main 分支使用。
//
// 用法：
//   npm run gen-keypair

import { writeFileSync } from "node:fs";
import { generateKeypair } from "../src/crypto/ed25519";
import { buildJwks } from "../src/crypto/jwks";

const JWK_PATH = "public/.well-known/jwks.json";

const kid = process.env.VERIFIER_KID ?? "verifier-1";

const { privateKeyHex, publicKeyHex } = await generateKeypair();
const jwks = buildJwks(publicKeyHex, kid);

// 寫入 JWKS（只包含公鑰；不含私鑰）
writeFileSync(JWK_PATH, JSON.stringify(jwks, null, 2) + "\n", "utf8");

const lines: string[] = [];
lines.push("=================================================================");
lines.push("Ed25519 Keypair Generated");
lines.push("=================================================================");
lines.push("kid          = " + kid);
lines.push("PRIVATE_HEX  = " + privateKeyHex);
lines.push("PUBLIC_HEX   = " + publicKeyHex);
lines.push("JWK.x (b64url) = " + jwks.keys[0]!.x);
lines.push("");
lines.push("SECURITY (硬性約束)");
lines.push("=================================================================");
lines.push("1. PRIVATE_HEX 立即複製到 1Password / macOS Keychain / Windows");
lines.push("   Credential Manager，然後清除 terminal 歷史。");
lines.push("2. 不要 commit 任何含有 PRIVATE_HEX 的檔案。");
lines.push("3. 不要放在 wrangler.toml vars；用:");
lines.push("     wrangler secret put VERIFIER_SIGNER_PRIVATE_KEY");
lines.push("   （值為上面 PRIVATE_HEX）");
lines.push("4. 若泄露：立即 rotate，並生成新的 jwks.json。");
lines.push("");
lines.push("已寫入: " + JWK_PATH);
lines.push("=================================================================");
console.error(lines.join("\n"));
