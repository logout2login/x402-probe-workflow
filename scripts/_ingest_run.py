#!/usr/bin/env python3
"""Build and run ingest SQL for demand candidates."""
import json, hashlib, subprocess, sys, os
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, "witness-scribe", "data")
JSON_PATH = os.path.join(DATA_DIR, "demand_candidates_v2.json")

with open(JSON_PATH, encoding="utf-8") as f:
    data = json.load(f)

json_str = json.dumps(data, ensure_ascii=False, indent=2)
hash_val = hashlib.sha256(json_str.encode("utf-8")).hexdigest()[:16]
loaded_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

print(f"Candidates: {len(data)}")
print(f"Hash: {hash_val}")
print(f"Loaded at: {loaded_at}")
print(f"JSON bytes: {len(json_str.encode('utf-8')):,}")

# Escape single quotes for SQL
json_escaped = json_str.replace("'", "''")
sql = (
    f"INSERT INTO demand_candidates_cache (loaded_at, json, hash)\n"
    f"VALUES ('{loaded_at}', '{json_escaped}', '{hash_val}')\n"
    f"ON CONFLICT(hash) DO UPDATE SET json=excluded.json, loaded_at=excluded.loaded_at;"
)

# Write SQL to temp file
sql_path = os.path.join(DATA_DIR, "_ingest_tmp.sql")
with open(sql_path, "w", encoding="utf-8") as f:
    f.write(sql)

print(f"SQL written to {sql_path} ({len(sql):,} chars)")

# Run wrangler d1 execute with --file
cmd = ["npx", "wrangler", "d1", "execute", "ownsite-aeo", "--remote", "--file", sql_path, "--json"]
result = subprocess.run(cmd, capture_output=True, text=True, cwd=BASE, timeout=120)
print(f"Exit code: {result.returncode}")
if result.stdout:
    print(f"stdout: {result.stdout[:500]}")
if result.stderr:
    print(f"stderr: {result.stderr[:500]}")

# Cleanup
os.remove(sql_path)
print("Done.")
