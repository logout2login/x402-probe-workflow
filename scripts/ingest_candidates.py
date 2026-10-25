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


def simple_hash(s: str) -> str:
    """FNV-1a 32-bit — same as simpleHash() in demand-report.ts."""
    h = 0x811c9dc5
    for c in s:
        h ^= ord(c)
        h = (h * 0x01000193) & 0xffffffff
    return format(h, '08x')


def compute_hash(json_bytes: bytes) -> str:
    return simple_hash(json_bytes.decode("utf-8"))


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
    """Call POST /api/admin/demand-candidates on the deployed worker."""
    api_url = "https://aeo.danli.work/api/admin/demand-candidates" if env == "mainnet" else "https://aeo-test.danli.work/api/admin/demand-candidates"
    secret = os.environ.get("DEMAND_ADMIN_SECRET", "")
    if not secret:
        print("ERROR: DEMAND_ADMIN_SECRET not set")
        sys.exit(1)
    payload = json.dumps({"candidates": json.loads(json_str)})
    import urllib.request, urllib.error
    req = urllib.request.Request(
        api_url,
        data=payload.encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-admin-secret": secret,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            print(f"✅ Admin API response: {json.dumps(body, indent=2)}")
            return body
    except urllib.error.HTTPError as e:
        print(f"ERROR: HTTP {e.code}: {e.read().decode()}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"ERROR: URL failed: {e.reason}")
        sys.exit(1)


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

    # Re-serialize as compact JSON (matches admin API's JSON.stringify)
    json_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
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
