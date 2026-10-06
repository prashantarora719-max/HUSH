#!/usr/bin/env python3
"""Multi-LLM orchestrator for the calorie-tracker demo.

Claude Code drives this script. Each stage sends a prompt (prompts/<stage>.md with the
API spec injected) to one provider's API, parses the `=== FILE: path ===` blocks out of
the reply, writes them into the project, and appends an entry to logs/orchestration.jsonl
with tokens, latency and cost.

Usage:
  python orchestrator/orchestrate.py models            # list models each key can use
  python orchestrator/orchestrate.py run backend       # run one stage
  python orchestrator/orchestrate.py run frontend
  python orchestrator/orchestrate.py report            # write logs/COST_REPORT.md
Env: GEMINI_API_KEY, OPENAI_API_KEY (never logged).
"""
import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
LOG = ROOT / "logs" / "orchestration.jsonl"
RESP_DIR = ROOT / "logs" / "responses"
CONFIG = json.loads((ROOT / "orchestrator" / "config.json").read_text())
PRICING = json.loads((ROOT / "orchestrator" / "pricing.json").read_text())
TIMEOUT = 900  # seconds; large code generations can be slow

FILE_RE = re.compile(r"=== FILE: (?P<path>\S+) ===\n(?P<body>.*?)\n=== END FILE ===", re.S)


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# --- providers -------------------------------------------------------------
def post_with_retry(url, retries=5, **kw):
    """Retry transient overload errors (429 is NOT retried: it means quota, not load)."""
    for attempt in range(retries):
        r = requests.post(url, timeout=TIMEOUT, **kw)
        if r.status_code not in (500, 502, 503, 504) or attempt == retries - 1:
            return r
        wait = 5 * 2 ** attempt
        print(f"  HTTP {r.status_code}, retrying in {wait}s ({attempt + 1}/{retries - 1})")
        time.sleep(wait)


def call_gemini(model, prompt):
    key = os.environ["GEMINI_API_KEY"]
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    r = post_with_retry(
        url,
        headers={"x-goog-api-key": key, "content-type": "application/json"},
        json={"contents": [{"role": "user", "parts": [{"text": prompt}]}]},
    )
    if r.status_code != 200:
        raise RuntimeError(f"gemini HTTP {r.status_code}: {r.text[:500]}")
    d = r.json()
    cand = (d.get("candidates") or [{}])[0]
    text = "".join(p.get("text", "") for p in cand.get("content", {}).get("parts", []))
    u = d.get("usageMetadata", {})
    return text, {
        "input_tokens": u.get("promptTokenCount", 0),
        # thinking tokens are billed as output tokens
        "output_tokens": u.get("candidatesTokenCount", 0) + u.get("thoughtsTokenCount", 0),
        "finish_reason": cand.get("finishReason"),
    }


def call_openai(model, prompt):
    key = os.environ["OPENAI_API_KEY"]
    r = post_with_retry(
        "https://api.openai.com/v1/responses",
        headers={"authorization": f"Bearer {key}", "content-type": "application/json"},
        json={"model": model, "input": prompt},
    )
    if r.status_code != 200:
        raise RuntimeError(f"openai HTTP {r.status_code}: {r.text[:500]}")
    d = r.json()
    text = "".join(
        c.get("text", "")
        for item in d.get("output", [])
        if item.get("type") == "message"
        for c in item.get("content", [])
        if c.get("type") == "output_text"
    )
    u = d.get("usage", {})
    return text, {
        "input_tokens": u.get("input_tokens", 0),
        "output_tokens": u.get("output_tokens", 0),  # includes reasoning tokens
        "finish_reason": d.get("status"),
    }


PROVIDERS = {"gemini": call_gemini, "openai": call_openai}


# --- cost ------------------------------------------------------------------
def cost_usd(model, in_tok, out_tok):
    p = PRICING.get("models", {}).get(model)
    if not p or p.get("input_per_mtok") is None or p.get("output_per_mtok") is None:
        return None
    return round(in_tok * p["input_per_mtok"] / 1e6 + out_tok * p["output_per_mtok"] / 1e6, 6)


# --- stages ----------------------------------------------------------------
def run_stage(stage):
    cfg = CONFIG["stages"][stage]
    provider, model = cfg["provider"], cfg["model"]
    if model.startswith("TBD"):
        sys.exit(f"Set a real model for '{stage}' in orchestrator/config.json (run `models` to list).")
    spec = (ROOT / "docs" / "API_SPEC.md").read_text()
    prompt = (ROOT / "prompts" / f"{stage}.md").read_text().replace("{{API_SPEC}}", spec)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    entry = {"ts": now(), "stage": stage, "provider": provider, "model": model,
             "prompt_file": f"prompts/{stage}.md", "prompt_chars": len(prompt)}
    t0 = time.time()
    try:
        text, usage = PROVIDERS[provider](model, prompt)
    except Exception as e:  # log failures too: they are part of the story
        entry.update(status="error", error=str(e)[:500], latency_s=round(time.time() - t0, 1))
        append_log(entry)
        raise
    entry["latency_s"] = round(time.time() - t0, 1)

    resp_path = RESP_DIR / f"{stamp}_{stage}_{provider}.txt"
    resp_path.write_text(text)
    written = []
    allowed = tuple(cfg["allowed_prefixes"])
    for m in FILE_RE.finditer(text):
        rel = m.group("path").strip()
        if rel.startswith("/") or ".." in Path(rel).parts or not rel.startswith(allowed):
            print(f"  skipped (outside {allowed}): {rel}")
            continue
        dest = ROOT / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(m.group("body") + "\n")
        written.append(rel)

    entry.update(
        status="ok" if written else "no_files_parsed",
        **usage,
        cost_usd=cost_usd(model, usage["input_tokens"], usage["output_tokens"]),
        response_file=str(resp_path.relative_to(ROOT)),
        files_written=written,
    )
    append_log(entry)
    print(json.dumps(entry, indent=2))


def append_log(entry):
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a") as f:
        f.write(json.dumps(entry) + "\n")


def list_models():
    if os.environ.get("OPENAI_API_KEY"):
        r = requests.get("https://api.openai.com/v1/models",
                         headers={"authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"}, timeout=60)
        print("openai:", sorted(m["id"] for m in r.json().get("data", [])) if r.ok else r.text[:300])
    else:
        print("openai: OPENAI_API_KEY not set")
    if os.environ.get("GEMINI_API_KEY"):
        r = requests.get("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
                         headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"]}, timeout=60)
        print("gemini:", [m["name"] for m in r.json().get("models", [])] if r.ok else r.text[:300])


def report():
    rows = [json.loads(l) for l in LOG.read_text().splitlines()] if LOG.exists() else []
    lines = ["# Cost & usage report", "",
             "| Time (UTC) | Stage | Provider | Model | Status | In tok | Out tok | Latency | Cost (USD) |",
             "|---|---|---|---|---|---:|---:|---:|---:|"]
    total, unpriced = 0.0, False
    for r in rows:
        c = r.get("cost_usd")
        if c is None:
            unpriced = True
        else:
            total += c
        lines.append(f"| {r['ts']} | {r['stage']} | {r['provider']} | {r['model']} | {r['status']} | "
                     f"{r.get('input_tokens', '-')} | {r.get('output_tokens', '-')} | "
                     f"{r.get('latency_s', '-')}s | {'n/a' if c is None else f'{c:.4f}'} |")
    lines += ["", f"**Total priced cost: ${total:.4f}**" +
              (" (some calls have no price set in orchestrator/pricing.json; tokens are still shown)"
               if unpriced else ""), "",
              f"Prices source: {PRICING.get('_source', 'unknown')}"]
    out = ROOT / "logs" / "COST_REPORT.md"
    out.write_text("\n".join(lines) + "\n")
    print(out.read_text())


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("models")
    sub.add_parser("report")
    rp = sub.add_parser("run")
    rp.add_argument("stage", choices=list(CONFIG["stages"]))
    a = ap.parse_args()
    {"models": list_models, "report": report}.get(a.cmd, lambda: run_stage(a.stage))()
