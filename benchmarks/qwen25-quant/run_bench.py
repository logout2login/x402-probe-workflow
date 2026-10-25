#!/usr/bin/env python3
"""
run_bench.py — Qwen2.5 quantization quality × speed benchmark runner.

For each Ollama variant:
  - warmup 1 item
  - run all 30 evalset items deterministically (temperature=0, num_seed=42, num_predict=160)
  - score each item (normalized substring match against accepted reference forms)
  - record per-item timing (Ollama eval_count / eval_duration => tokens/sec)
  - record model file size + best-effort peak RSS of the Ollama runner process

Outputs (in this directory):
  raw-outputs/<variant_sanitized>.jsonl   — full raw responses + per-item metrics
  results.json                            — aggregated benchmark report

Usage:
  python3 run_bench.py                  # all variants in VARIANTS
  python3 run_bench.py qwen2.5:0.5b-q4_0 qwen2.5:0.5b-q8_0
"""

import json
import os
import re
import subprocess
import sys
import time
import urllib.request

OLLAMA = "http://localhost:11434"
HERE = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(HERE, "raw-outputs")

VARIANTS = [
    "qwen2.5:0.5b-q4_0",
    "qwen2.5:0.5b-q8_0",
    "qwen2.5:1.5b-q4_0",
    "qwen2.5:1.5b-q8_0",
    "qwen2.5:3b-q4_0",
    "qwen2.5:3b-q8_0",
]

GEN_OPTIONS = {"temperature": 0, "num_seed": 42, "num_predict": 160, "top_k": 1}


def sanitize(name: str) -> str:
    return name.replace(":", "_").replace(".", "_")


def norm(s: str) -> str:
    """Normalize for matching: casefold, strip all whitespace."""
    return re.sub(r"\s+", "", s).casefold()


def http_post(path: str, payload: dict, timeout: int = 300):
    req = urllib.request.Request(
        OLLAMA + path,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def http_get(path: str):
    with urllib.request.urlopen(OLLAMA + path, timeout=30) as r:
        return json.loads(r.read().decode())


def score_item(item: dict, response: str) -> bool:
    n = norm(response)
    return any(norm(ref) in n for ref in item["refs"])


def item_metrics(gen: dict, wall_start: float):
    eval_count = gen.get("eval_count", 0)
    eval_dur = gen.get("eval_duration", 0) / 1e9
    prompt_dur = gen.get("prompt_eval_duration", 0) / 1e9
    wall = time.time() - wall_start
    return {
        "tokens": eval_count,
        "tok_s": round(eval_count / eval_dur, 3) if eval_dur > 0 else None,
        "gen_s": round(eval_dur, 3),
        "prompt_eval_s": round(prompt_dur, 3),
        "wall_s": round(wall, 3),
        "stop": gen.get("stop"),
    }


def process_wmic_peak_kb() -> int:
    """Best-effort: sum WorkingSetSize (KB) of ollama processes after a variant run."""
    try:
        out = subprocess.run(
            "wmic process where \"name like 'ollama%'\" get WorkingSetSize /format:list",
            shell=True, capture_output=True, text=True, timeout=30,
        ).stdout
        total = 0
        for m in re.finditer(r"WorkingSetSize=(\d+)", out):
            total += int(m.group(1))
        return total
    except Exception:
        return -1


def main() -> None:
    args = [a for a in sys.argv[1:] if a in VARIANTS] or VARIANTS
    os.makedirs(RAW_DIR, exist_ok=True)

    evalset = json.load(open(os.path.join(HERE, "evalset.json"), encoding="utf-8"))
    items = evalset["items"]

    ollama_version = http_get("/api/version").get("version", "?")
    model_info = {m["name"]: m for m in http_get("/api/tags")["models"]}

    report = {
        "suite": evalset["suite"],
        "suite_version": evalset["version"],
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "ollama_version": ollama_version,
        "system": {
            "os": "Windows 11 (Hermes/MSYS host)",
            "cpu": "Intel Core i7-1195G7 @ 2.90GHz",
            "gpu": "Intel Iris Xe (iGPU)",
            "ram_gb": 31.7,
            "note": "CPU-inference box; Ollama Windows build. Quantization quality is device-independent; speed figures are this hardware's CPU reference point.",
        },
        "gen_options": GEN_OPTIONS,
        "n_items": len(items),
        "variants": [],
    }

    for variant in args:
        v = sanitize(variant)
        print(f"=== {variant} ===", flush=True)
        info = model_info.get(variant, {})
        size_gb = round(info.get("size", 0) / 1e9, 3)

        raw_path = os.path.join(RAW_DIR, f"{v}.jsonl")
        records = []
        passes = 0

        # warmup (not counted)
        warm = http_post("/api/generate", {
            "model": variant, "prompt": "Reply with the single word: ok",
            "stream": False, "options": {**GEN_OPTIONS, "num_predict": 8},
        })
        print(f"  warmup ok ({warm.get('eval_count')} tok)", flush=True)

        t_start = time.time()
        for item in items:
            t0 = time.time()
            try:
                gen = http_post("/api/generate", {
                    "model": variant, "prompt": item["prompt"], "stream": False,
                    "options": GEN_OPTIONS,
                })
                response = gen.get("response", "")
                m = item_metrics(gen, t0)
                passed = score_item(item, response)
                rec = {
                    "item_id": item["id"], "cat": item["cat"],
                    "prompt": item["prompt"], "refs": item["refs"],
                    "response": response, "pass": passed, **m,
                    "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }
            except Exception as e:
                rec = {
                    "item_id": item["id"], "cat": item["cat"], "prompt": item["prompt"],
                    "refs": item["refs"], "response": None, "pass": False,
                    "error": str(e)[:200],
                }
            if rec["pass"]:
                passes += 1
            records.append(rec)
            with open(raw_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            print(f"  [{item['id']:>2}/{len(items)}] {'PASS' if rec['pass'] else 'fail'} ({rec.get('wall_s','?')}s)", flush=True)

        wall_total = time.time() - t_start
        tok_total = sum(r.get("tokens") or 0 for r in records)
        speed_samples = [r["tok_s"] for r in records if r.get("tok_s")]
        median_tok_s = sorted(speed_samples)[len(speed_samples) // 2] if speed_samples else None
        cat_acc = {}
        for cat, ids in evalset["categories"].items():
            c = [r for r in records if r["cat"] == cat]
            cat_acc[cat] = {"n": len(c), "pass": sum(1 for r in c if r["pass"]),
                            "acc": round(sum(1 for r in c if r["pass"]) / len(c), 4) if c else None}
        rss_kb = process_wmic_peak_kb()

        entry = {
            "variant": variant,
            "quantization": info.get("details", {}).get("quantization_level", "?"),
            "parameter_size": info.get("details", {}).get("parameter_size", "?"),
            "model_size_gb": size_gb,
            "runner_peak_rss_kb": rss_kb,
            "n_items": len(records),
            "n_pass": passes,
            "accuracy": round(passes / len(records), 4),
            "category_accuracy": cat_acc,
            "median_tok_s": median_tok_s,
            "p10_tok_s": sorted(speed_samples)[max(0, len(speed_samples) // 10)] if speed_samples else None,
            "p90_tok_s": sorted(speed_samples)[min(len(speed_samples) - 1, len(speed_samples) * 9 // 10)] if speed_samples else None,
            "total_generated_tokens": tok_total,
            "wall_total_s": round(wall_total, 1),
        }
        report["variants"].append(entry)
        print(f"  accuracy {passes}/{len(records)}  median {median_tok_s} tok/s  ({wall_total:.0f}s)", flush=True)

    json.dump(report, open(os.path.join(HERE, "results.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"\n✅ results.json written ({len(report['variants'])} variants)")


if __name__ == "__main__":
    main()
