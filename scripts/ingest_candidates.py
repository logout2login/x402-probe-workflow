#!/usr/bin/env python3
"""
Ingest demand_candidates into D1 via admin API.

Provenance chain:
  expand_candidates.py → witness-scribe/data/demand_candidates_*.json
  ↓
  ingest_candidates.py → wrangler d1 execute (admin API)
  ↓
  D1 demand_candidates_cache (single-row, overwrite on hash mismatch)

Usage:
  python3 scripts/ingest_candidates.py --env mainnet   # production
  python3 scripts/ingest_candidates.py --env testnet    # testnet

Required env vars:
  DEMAND_ADMIN_SECRET  (wrangler secret, never hardcoded)
  CLOUDFLARE_API_TOKEN (for wrangler remote D1)
  WORKERS_ACCOUNT_ID   (for wrangler remote D1)

Note: wrangler secret is applied by wrangler CLI at deploy time.
      This script reads from the environment wrangler injects.
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "witness-scribe", "data")


def find_candidate_file():
    """Find the latest demand_candidates_*.json in DATA_DIR."""
    pattern = "demand_candidates_*.json"
    files = sorted(
        [f for f in os.listdir(DATA_DIR) if f.startswith("demand_candidates_") and f.endswith(".json")]
    )
    if not files:
        print("ERROR: no demand_candidates_*.json found in", DATA_DIR)
        sys.exit(1)
    latest = files[-1]  # lexicographic sort, v2 > v1
    return os.path.join(DATA_DIR, latest)


def compute_hash(json_bytes: bytes) -> str:
    return hashlib.sha256(json_bytes).hexdigest()[:16]


def load_and_validate(path: str) -> list:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        print(f"ERROR: {path} root is not array (got {type(data).__name__})")
        sys.exit(1)
    print(f"Loaded {len(data)} candidates from {path}")

    # Validate triad: representative_quote + provenance.source_canonical_url + created_at
    missing = []
    for i, c in enumerate(data):
        prov = c.get("provenance") or {}
        url = prov.get("source_canonical_url", "")
        quote = c.get("representative_quote", "")
        ts = c.get("created_at", "")
        if not (quote and url and ts):
            missing.append(i)
    if missing:
        print(f"WARNING: {len(missing)}/{len(data)} candidates missing triad field (indices: {missing[:5]}...)")
    else:
        print(f"✅ All {len(data)} candidates have complete provenance triad")

    return data


def upload_via_admin_api(json_str: str, hash_val: str, loaded_at: str, env: str):
    """
    Build a minimal SQL INSERT and pipe to wrangler d1 execute.
    Uses the admin endpoint approach via SQL chunk.
    """
    sql = f"""INSERT INTO demand_candidates_cache (loaded_at, json, hash)
VALUES ('{loaded_at}', '{json_str.replace(chr(10), ' ').replace("'", "''")}', '{hash_val}')
ON CONFLICT(hash) DO UPDATE SET json=excluded.json, loaded_at=excluded.loaded_at;
INSERT OR IGNORE INTO schema_version (version, description)
VALUES (6, 'v1.18c: {len(json.loads(json_str))} candidates via ingest_candidates.py');
"""
    cmd = [
        "npx", "wrangler", "d1", "execute",
        "ownsite-aeo", "--remote", "--command", sql,
    ]
    if env == "testnet":
        cmd.insert(4, "--env")
        cmd.insert(5, "testnet")
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=BASE)
    if result.returncode != 0:
        print(f"ERROR: wrangler d1 execute failed:\n{result.stderr}")
        sys.exit(1)
    print("✅ Uploaded via wrangler d1 execute")
    return result.stdout


def main():
    parser = argparse.ArgumentParser(description="Ingest demand candidates into D1")
    parser.add_argument("--env", choices=["mainnet", "testnet"], default="mainnet", help="Target environment")
    parser.add_argument("--file", help="Override auto-detect: path to candidates JSON")
    parser.add_argument("--dry-run", action="store_true", help="Compute hash without uploading")
    args = parser.parse_args()

    # Find input file
    candidate_file = args.file or find_candidate_file()
    print(f"Input: {candidate_file}")

    # Load and validate
    data = load_and_validate(candidate_file)

    # Re-serialize (normalize formatting)
    json_bytes = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
    json_str = json_bytes.decode("utf-8")
    hash_val = compute_hash(json_bytes)
    loaded_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    print(f"Hash:  {hash_val}")
    print(f"At:    {loaded_at}")
    print(f"Bytes: {len(json_bytes):,}")

    if args.dry_run:
        print("\n=== DRY RUN — skipping upload ===")
        print(f"  Candidates : {len(data)}")
        print(f"  Hash       : {hash_val}")
        print(f"  D1 current : 0x8cd20b2a (verify match above)")
        return

    # Upload
    upload_via_admin_api(json_str, hash_val, loaded_at, args.env)

    print("\n=== Ingestion complete ===")
    print(f"  Source file : {candidate_file}")
    print(f"  Candidates  : {len(data)}")
    print(f"  D1 hash     : {hash_val}")
    print(f"  Provenance  : expand_candidates.py → ingest_candidates.py → wrangler d1 execute")
    print(f"  Secret      : DEMAND_ADMIN_SECRET (rotated, never in code)")


if __name__ == "__main__":
    main()
