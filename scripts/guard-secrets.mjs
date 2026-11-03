// scripts/guard-secrets.mjs — pre-push secret gate (v1, 2026-11-03)
// Blocks any staged change that contains private-key / secret material.
// Exit 0 = safe to push.  Exit 1 = BLOCKED; the caller must NOT git push.
//
// Designed to NOT false-positive on legitimate public on-chain data in
// logs/scan_events.json (event topic hashes + event data are bare 0x64-hex
// on "data"/"topics" lines with no key/secret keyword on the same line).
//
// Rules:
//   1. Any staged file whose PATH matches a known secret pattern -> block.
//   2. Any staged line that is a PEM private key block -> block.
//   3. Any staged line containing a known-leaked key prefix -> block.
//   4. Any staged line that has a 0x[64-hex] literal AND a key/secret
//      keyword on the SAME line -> block (catches new key literals).

import { execSync } from "node:child_process";

const KNOWN_KEY_PREFIXES = [
  "0xe6bed232", // leaked facilitator key (history)
  "0x5fec660c", // leaked payer key (history)
  "0x7631ca92", // leaked verify-TX key (history)
];

// Secret FILE paths (data files, NOT scripts). Scripts like _check_fac.ts are
// caught by the content rule below; only true secret artifacts match here.
const SECRET_FILE_RE = new RegExp(
  "(^|/)(?:" +
    "\\.secrets[^/]*\\.(env|json|txt)" +            // .secrets*.env/json/txt
    "|\\.secrets[^/]*$" +                            // .secrets*
    "|.*\\.pem$" +                                   // *.pem
    "|.*\\.key$" +                                   // *.key
    "|.*secret[^/]*\\.env$" +                        // *secret*.env
    "|.*private[^/]*\\.json$" +                      // *private*.json
    "|Gen-Keypair\\.txt$" +
    "|\\.mainnet_keys\\.json$" +
    "|\\.hedera_mainnet_key\\.json$" +
  ")$", "i"
);

// Keyword that, if present on the SAME line as a 0x64-hex literal, marks it
// as a private key / secret (rather than an on-chain topic hash or tx hash).
const KEYWORD_RE =
  /private\s*key|privatekey|signer\s*private|signerprivate|secret|passphrase|mnemonic|api[_-]?key|api[_-]?token|auth[_-]?token|\bsecret\s*[:=]|\bkey\s*[:=]/i;

const HEX64 = /0x[0-9a-fA-F]{64}\b/;
const PEM = /-----BEGIN [A-Z ]*PRIVATE KEY-----/i;

function fail(msg, ctx) {
  console.error("❌ SECRET GUARD BLOCKED: " + msg);
  if (ctx && ctx.length) {
    console.error("   offending lines:");
    for (const l of ctx) console.error("   | " + l.slice(0, 200));
  }
  process.exit(1);
}

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    return "";
  }
}

// ---- Rule 1: staged file paths ----
const stagedFiles = sh("git diff --cached --name-only")
  .split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
for (const f of stagedFiles) {
  if (SECRET_FILE_RE.test(f)) fail("staged secret file path: " + f, [f]);
}

// ---- Rules 2-4: staged content ----
const diff = sh("git diff --cached");
const lines = diff.split(/\r?\n/);
for (const l of lines) {
  if (PEM.test(l)) fail("PEM private key block detected", [l]);
  for (const kp of KNOWN_KEY_PREFIXES) {
    if (l.includes(kp)) fail("known-leaked key prefix " + kp + " detected", [l]);
  }
  if (HEX64.test(l) && KEYWORD_RE.test(l)) {
    fail("64-hex secret literal on a key/secret line", [l]);
  }
}

console.log("✅ guard: no secrets in staged diff (" + stagedFiles.length + " file(s), " + lines.length + " line(s))");
