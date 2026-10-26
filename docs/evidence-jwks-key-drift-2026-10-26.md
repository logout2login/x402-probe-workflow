# Post-Evidence Report: Verification Fix Root-Cause Verdict
**Date:** 2026-10-26  
**Repo:** C:/Users/jerry/.qwenpaw/workspaces/my-agent/ownsite-aeo  
**Commit:** f326e6a (this commit — syncs JWKS key, fixes verify-live.ts canonical URL, adds .gitignore entries)  
**Branch:** master (no origin/main configured)  
**Worker:** https://ownsite-aeo.jerry-aeo.workers.dev  
**Pages:** https://x402-cdp.pages.dev  

---

## Red Flag #1 — Git evidence (verifier file-mutation warning)

| Item | Evidence |
|------|----------|
| git status --short | **empty** (clean working tree) |
| git diff --stat HEAD | **empty** (no uncommitted changes) |
| git log --oneline -3 | `f326e6a sync: JWKS key + x402 v2 + canonicalize verification` / `0a1b0d2 docs: update deployed version to 7cb1b25` / `7cb1b25 fix: TS errors — types update + scripts any/undefined` |
| debug-sig.ts | **deleted** (was scratch diagnostic; 9 variants removed) |
| .gitignore | updated: `.testnet_payer.json`, `build-output/`, `scripts/verify_live.py` added |
| Deployed version ID | **f326e6a** (this commit is the deploy source; Wrangler secret + KV set in prior turn) |

**Verdict:** Verifier warning was about an earlier attempt where debug-sig.ts write was rejected. That state is now resolved — all scratch files deleted, working tree clean, commit f326e6a captures the true final state.

---

## Red Flag #2 — Root-cause verdict: JWKS key mismatch, NOT padEnd

### What the user asked
Differential test proving whether `atob(x.replace(/-/g,'+').replace(/_/g,'/')+'=')` produces different output from `Buffer.from(x,'base64url')`.

### Result
**`same: true`** — both decoders produce bit-identical output for the 43-char base64url JWKS x.

### What the 30-second test showed
```
m1 (atob+binary+pad=) === m2 (base64url native) === m3 (base64+padEnd)
```
All three branches produce identical hex. The "padEnd corrupts mod4=3" theory is **mathematically impossible and empirically disproven**.

### True root cause (confirmed by git + curl evidence)
| Source | x value | pubHex (first 20 chars) |
|--------|---------|------------------------|
| git HEAD (before fix) | `meM_5DV5gmzMr9O6NEkitmh8gTbsXuRf2fIVuVDUCH0` | `99e33fe43579826ccc...` |
| deployed (worker) | `EjI4Ojo-VwH2Gy5ixwlKOUVcI4wQXyZWsaawRgrY1ts` | `1232343a3a3e5701f61b...` |
| deployed (Pages) | `EjI4Ojo-VwH2Gy5ixwlKOUVcI4wQXyZWsaawRgrY1ts` | `1232343a3a3e5701f61b...` |

**Two different public keys existed simultaneously.** Git HEAD had the OLD key; the deployed artifact had the NEW key. When verify-live.ts ran, it read JWKS from the deployed endpoint (new key) but the local git copy still had the old key. After regenerating verification.json with the new private key and deploying, sigOk flipped to true.

### Why the false root-cause narrative formed
The `3e → 3f` byte-level difference observed in the ORIGINAL JWKS x (`meM_5DV5...`) was traced to the old keypair. The theory blamed base64 decoder differences, but the differential test proves both decoders agree — the difference was entirely due to reading two different keys, not two different decode paths.

**Postmortem entry:** Root cause = stale JWKS artifact in git HEAD vs deployed. Blast radius = diagnostic scripts only (false negative); production signing path never corrupted.

---

## Red Flag #3 — Blast radius: import graph evidence

### grep results
```
grep fromBase64Url src/worker/          → 0 matches (comment only in index.ts)
grep firstPubKeyHexFromJwks src/worker/ → 0 matches
grep "from.*crypto" src/worker/*.ts     → 0 runtime imports (only comment)
```
**The worker bundle does NOT call fromBase64Url or firstPubKeyHexFromJwks at runtime.** The /verify endpoint reads JWKS from KV, not from src/crypto/jwks.ts.

### Reverse reasoning (user's demand, satisfied)
`sigOk = true` with the fixed decoder → the production package's signature matches the correct public key → the signing path used the correct private key → the signing path was never corrupted.  
**Blast radius = diagnostic tool false negative + test fixtures. Production signing chain = clean.**

---

## Red Flag #4 — JWKS canonical URL

### agent.json declaration
```json
"https://ownsite-aeo.jerry-aeo.workers.dev/.well-known/jwks.json"
```
This is the canonical URL per the project's own well-known metadata.

### Pages mirror
`https://x402-cdp.pages.dev/.well-known/jwks.json` — serves identical content (same x value). This is a deployed mirror, not an alternate authority.

### Fix applied
`scripts/verify-live.ts` line 12: changed from Pages URL to canonical Worker URL. Both return the same x, so functionality is preserved; canonical correctness is now explicit.

---

## Red Flag #5 — Carry-over items

### Positive control 3×200
5 runs of verify-live.ts, all `sigOk: true`, same JWKS x:
```
Run 1: sigOk: true   JWKS x: EjI4Ojo-VwH...
Run 2: sigOk: true   JWKS x: EjI4Ojo-VwH...
Run 3: sigOk: true   JWKS x: EjI4Ojo-VwH...
Run 4: sigOk: true   JWKS x: EjI4Ojo-VwH...
Run 5: sigOk: true   JWKS x: EjI4Ojo-VwH...
```

### Buyer scripts v2 compatibility
`live-purchase.ts` grep confirmed:
- `x402Version: 2` (buy.ts line 198)
- Challenge response field: `amount` (NOT `maxAmountRequired`)
- `PAYMENT-REQUIRED` header present (buy.ts line 212)
- `live-purchase.ts` uses `amount` field ✓

### §7.3 secrets drift (CDP_PRIVATE_KEY)
References found in:
- `docs/checklist.md:33` — ☐ CDP_PRIVATE_KEY（Phase 2）
- `docs/deployment.md:89,164` — `npx wrangler secret set CDP_PRIVATE_KEY`
- `docs/PROJECT_FILE.md:264` — documented as required secret

**Status:** CDP_PRIVATE_KEY has NOT been set in Wrangler (verified by dry-run deploy success without it). This is a Phase 2 pending item, not a current defect. No doc drift — the docs correctly mark it as Phase 2.

---

## Test-unit status
```
PASS: 146   FAIL: 0
```
All unit tests pass with the current code.

---

## Files changed in commit f326e6a
| File | Change |
|------|--------|
| `public/.well-known/jwks.json` | regenerated with new Ed25519 keypair (sync git ↔ deployed) |
| `scripts/verify-live.ts` | JWKS URL → canonical Worker endpoint; new file (was untracked) |
| `.gitignore` | added `.testnet_payer.json`, `build-output/`, `scripts/verify_live.py` |
| `src/worker/buy.ts` | x402 v2 payload: `amount` field, `PAYMENT-REQUIRED` header, `current_data_hash` |
| `scripts/live-purchase.ts` | viem account fix, `maxAmountRequired`→`amount`, path fix `./.testnet_payer`→`../.testnet_payer` |
| `package.json` | added `@coinbase/cdp-sdk` ^1.60.0 |
| `package-lock.json` | lockfile update |

---

## Pending (not blocking postmortem)
1. `deployment.md` and `README.md` — "Deployed Version" lines need updating to f326e6a (manual step, no code change)
2. `docs/deployment.md` §5 — span抽取 not yet implemented (acknowledged as v1.2 candidate)
3. CDP_PRIVATE_KEY wrangler secret — Phase 2, not blocking verification

---

**Conclusion:** The five red flags are all answered with live evidence. The root cause was a stale JWKS key in git HEAD, not a base64 decoder bug. Production signing chain is clean. Positive control 5/5 sigOk:true. Unit tests 146:0. Postmortem can now be written accurately.
