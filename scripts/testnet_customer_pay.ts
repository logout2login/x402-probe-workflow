// Testnet "customer-side" x402 EIP-3009 USDC payment signer.
// Produces exactly the X-PAYMENT body that /buy's inbound path expects
// (payload.authorization = base64 EIP-3009 USDC transferWithAuthorization),
// and verifies LOCALLY that the signature recovers to the payer address
// (no facilitator, no deploy, no CDP key required).
//
// Usage:
//   tsx scripts/testnet_customer_pay.ts
//   PAY_TO=0x... PRICE=1000000 tsx scripts/testnet_customer_pay.ts
//
// The test payer key is generated once and persisted to
// scripts/.testnet_payer.json so a later faucet+settle E2E reuses the SAME
// address (only that address needs USDC on Base Sepolia). It is a TESTNET
// throwaway key — never fund it with mainnet.

import {
  keccak256,
  encodeAbiParameters,
  verifyHash,
  toHex,
  getAddress,
  type Hex,
} from "viem";
import {
  privateKeyToAccount,
  sign,
  signatureToHex,
} from "viem/accounts";
import { randomBytes } from "node:crypto";
import { Buffer as NodeBuffer } from "node:buffer";
import {
  readFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { resolve } from "node:path";

// ── params (match /buy: Base Sepolia, USDC 6-dec, your payTo) ───────────────
const NETWORK = "eip155:84532"; // Base Sepolia CAIP-2
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Base Sepolia
const PAY_TO =
  process.env.PAY_TO ?? "0xb7f4d61320de4cf5f22330407a3a683304ac914d";
const VALUE = BigInt(process.env.PRICE ?? "1000000"); // base units ($1 = 1000000)
const USDC_DECIMALS = 6;
const VALID_BEFORE = BigInt(Math.floor(Date.now() / 1000) + 3600); // +1h
const VALID_AFTER = 0n;

const PAYER_FILE = resolve("scripts/.testnet_payer.json");

// ── (re)generate a stable testnet payer EOA ─────────────────────────────────
type PayerRec = { address: string; privateKey: string };
function loadOrCreatePayer(): PayerRec {
  if (existsSync(PAYER_FILE)) {
    const rec = JSON.parse(readFileSync(PAYER_FILE, "utf8")) as PayerRec;
    if (rec.address && /^0x[0-9a-f]{64}$/.test(rec.privateKey)) return rec;
  }
  const pk = ("0x" + randomBytes(32).toString("hex")) as Hex;
  const acct = privateKeyToAccount(pk);
  const rec: PayerRec = { address: acct.address, privateKey: pk };
  writeFileSync(PAYER_FILE, JSON.stringify(rec, null, 2));
  return rec;
}

const payer = loadOrCreatePayer();
const from = getAddress(payer.address);
const to = getAddress(PAY_TO);

// USDC EIP-3009 Authorization struct: {nonce, from, to, value, validAfter, validBefore}
// USDC recoverSigner = ecrecover(keccak256(abi.encode(6 fields)) , so the
// signer must produce a signature over the raw keccak digest (NOT EIP-191).
const nonce = 0n; // USDC EIP-3009 nonce is per-contract-account; start 0 for a fresh payer
const signableDigest = keccak256(
  encodeAbiParameters(
    [
      { type: "uint256" }, // nonce
      { type: "address" }, // from
      { type: "address" }, // to
      { type: "uint256" }, // value
      { type: "uint256" }, // validAfter
      { type: "uint256" }, // validBefore
    ],
    [nonce, from, to, VALUE, VALID_AFTER, VALID_BEFORE],
  ),
);
// USDC EIP-3009 signs the keccak digest raw (NOT EIP-191 personal_sign)
const sig = await sign({ hash: signableDigest, privateKey: payer.privateKey as Hex });
const signature = signatureToHex(sig);

// LOCAL VERIFICATION (no facilitator, no chain)
const recovers = await verifyHash({
  hash: signableDigest,
  signature,
  address: from,
});
if (!recovers) {
  console.error("❌ SIGNATURE DOES NOT RECOVER to payer — aborting");
  process.exit(1);
}

// x402 EIP-3009 payload.authorization = base64(JSON of uint256 fields as hex)
const authObj = {
  nonce: toHex(nonce),
  from,
  to,
  value: toHex(VALUE),
  validAfter: toHex(VALID_AFTER),
  validBefore: toHex(VALID_BEFORE),
  signature,
};
const PAYMENT = NodeBuffer.from(JSON.stringify(authObj)).toString("base64");

// Persist the auth so the facilitator-side settle script can pick it up
writeFileSync(
  resolve("scripts/.testnet_last_auth.json"),
  JSON.stringify({ ...authObj, usdc: USDC, network: NETWORK }, null, 2),
);

// Full X-PAYMENT request body for /buy (what buy.ts reads):
const XPAYMENT_BODY = {
  x402_version: 1,
  scheme: "exact",
  network: NETWORK,
  payload: {
    payer: from,
    asset: USDC,
    authorization: PAYMENT,
  },
};

// human-readable dollar figure
const usdcDecimals = VALUE / 10n ** BigInt(USDC_DECIMALS);
const usdcFrac = VALUE % 10n ** BigInt(USDC_DECIMALS);

console.log("=== testnet EIP-3009 USDC payment (customer side) ===");
console.log(`network          ${NETWORK} (Base Sepolia)`);
console.log(`usdc contract    ${USDC}`);
console.log(`payer (test)     ${from}`);
console.log(`payTo            ${to}`);
console.log(`amount           ${usdcDecimals}.${usdcFrac.toString().padStart(USDC_DECIMALS, "0")} USDC (${VALUE} base)`);
console.log(`nonce            ${nonce}   validBefore ${VALID_BEFORE} (+1h)`);
console.log(`signableDigest   ${signableDigest}`);
console.log(`signature        ${signature}`);
console.log(`recover → payer  ${recovers ? "PASS ✅ (matches payer)" : "FAIL ❌"}`);
console.log("");
console.log("X-PAYMENT body (POST /buy with content-type: application/json):");
console.log(JSON.stringify(XPAYMENT_BODY, null, 2));
console.log("");
console.log("curl one-liner (fill in the resource you're buying, e.g. /buy/research-2026-q4-ai-agent-adoption):");
console.log(
  `curl -sS -X POST "$BASE/buy/research-2026-q4-ai-agent-adoption" -H 'content-type: application/json' -H 'X-PAYMENT: $(node -e "process.stdout.write(process.argv[1])" '${PAYMENT}')"`,
);
console.log("");
console.log(
  `Note: for the ON-CHAIN settle step the payer ${from} must hold ${usdcDecimals}.${usdcFrac} USDC on Base Sepolia (CDP faucet or Circle testnet faucet).`,
);
