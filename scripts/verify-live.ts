import { verifyCanonical } from '../src/crypto/ed25519';
import { canonicalize } from '../src/crypto/canonical';

const v = await fetch('https://ownsite-aeo.jerry-aeo.workers.dev/verify/research-2026-q4-ai-agent-adoption').then(r=>r.json());
console.log('sig:', v.verifier_signature.slice(0,50));
console.log('data_hash:', v.data_hash);

const signed = { data_hash: v.data_hash, evidence_count: v.evidence_count, expires_at: v.expires_at, package_id: v.package_id, q: v.q, verified_at: v.verified_at };
const canon = canonicalize(signed);
console.log('canon:', canon);

const jwks = await fetch('https://ownsite-aeo.jerry-aeo.workers.dev/.well-known/jwks.json').then(r=>r.json());
const x = jwks.keys[0].x;
console.log('JWKS x:', x);
const pubHex = Buffer.from(x, 'base64url').toString('hex');
console.log('pubHex:', pubHex);

const ok = await verifyCanonical(canon, v.verifier_signature, pubHex);
console.log('sigOk:', ok);
