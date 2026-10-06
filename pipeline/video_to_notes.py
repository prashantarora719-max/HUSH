#!/usr/bin/env python3
"""YouTube URL -> Gemini -> markdown note + Anki CSV + index entry.

Usage:
  python3 pipeline/video_to_notes.py URL [--goal "..."] [--model MODEL]
  python3 pipeline/video_to_notes.py --from-json sample.json   # render only, no API call

The API key is read from the GEMINI_API_KEY environment variable
(or a gitignored .env file in the repo root). Never pass it on the command line.
"""
import argparse
import csv
import datetime as dt
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOTES = ROOT / "notes"
PROFILE = ROOT / "pipeline" / "profile.md"
DEFAULT_MODEL = "gemini-2.5-flash"
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def load_env():
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


STR = {"type": "STRING"}
SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "title": STR,
        "topic": STR,
        "tldr": {"type": "ARRAY", "items": STR},
        "key_ideas": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
            "timestamp": STR, "idea": STR, "why_it_matters": STR},
            "required": ["timestamp", "idea", "why_it_matters"]}},
        "frameworks": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
            "name": STR, "explanation": STR}, "required": ["name", "explanation"]}},
        "actions": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
            "action": STR, "when": STR, "done_when": STR, "fits_my_life": STR},
            "required": ["action", "when", "done_when", "fits_my_life"]}},
        "recall_questions": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
            "timestamp": STR, "question": STR, "answer": STR},
            "required": ["timestamp", "question", "answer"]}},
        "critique": {"type": "ARRAY", "items": STR},
    },
    "required": ["title", "topic", "tldr", "key_ideas", "frameworks", "actions",
                 "recall_questions", "critique"],
}


def build_prompt(goal, profile):
    return f"""You are a rigorous learning coach. Watch the attached video and produce notes
for someone who wants to learn this topic DEEPLY, not skim it.

Learner goal for this video: {goal or "learn the topic deeply and apply it"}

Learner profile (actions MUST fit this; if a field is still a placeholder, assume a
busy full-time professional and say so in fits_my_life):
{profile}

Rules:
- Only use what is in the video. Do not invent claims, studies or numbers.
- Timestamps in MM:SS (or H:MM:SS) pointing to where the point is made.
- tldr: 3 short lines.
- key_ideas: 8-12 items, in video order.
- frameworks: named models/rules/protocols from the video (may be empty).
- actions: AT MOST 3. Each must be concrete: what to do, when/trigger, and a clear
  'done when' check. fits_my_life explains how it fits work and keeps balance
  (sleep, work load, recovery). Prefer small and sustainable over heroic.
- recall_questions: 10-15 question/answer pairs that test understanding, not trivia.
- critique: 2-5 points on what is weak, missing, oversimplified or evidence-light,
  and where the creator may have a bias or product to sell. For health/fitness claims,
  flag anything that should be checked with a professional.
"""


def call_gemini(url, prompt, model, key):
    body = {
        "contents": [{"parts": [{"file_data": {"file_uri": url}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json",
                             "responseSchema": SCHEMA, "temperature": 0.3},
    }
    req = urllib.request.Request(
        API.format(model=model), data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Gemini API error {e.code}: {e.read().decode()[:600]}")
    try:
        return json.loads(data["candidates"][0]["content"]["parts"][0]["text"])
    except (KeyError, IndexError, json.JSONDecodeError):
        sys.exit(f"Unexpected Gemini response: {json.dumps(data)[:600]}")


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "video"


def render(d, url):
    today = dt.date.today()
    reviews = [(today + dt.timedelta(days=n)).isoformat() for n in (1, 3, 7, 21)]
    L = [f"# {d['title']}", "",
         f"- Source: {url}", f"- Topic: {d['topic']}", f"- Date: {today.isoformat()}",
         f"- Review on: {', '.join(reviews)}", "", "## TL;DR", ""]
    L += [f"- {x}" for x in d["tldr"]]
    L += ["", "## Key ideas", ""]
    for i in d["key_ideas"]:
        L.append(f"- **[{i['timestamp']}]** {i['idea']} — _why it matters:_ {i['why_it_matters']}")
    if d["frameworks"]:
        L += ["", "## Frameworks", ""]
        L += [f"- **{f['name']}**: {f['explanation']}" for f in d["frameworks"]]
    L += ["", "## Actions (this week)", ""]
    for n, a in enumerate(d["actions"], 1):
        L += [f"{n}. [ ] **{a['action']}**",
              f"   - When: {a['when']}", f"   - Done when: {a['done_when']}",
              f"   - Fits my life: {a['fits_my_life']}"]
    L += ["", "## Recall (answer from memory before looking)", ""]
    for q in d["recall_questions"]:
        L += [f"- **[{q['timestamp']}] {q['question']}**",
              f"  <details><summary>Answer</summary>{q['answer']}</details>"]
    L += ["", "## Critique / what to double-check", ""]
    L += [f"- {c}" for c in d["critique"]]
    L += ["", "## My reflection (fill in after the week)", "",
          "- What I did:", "- What worked / didn't:", "- What I'll change:", ""]
    return "\n".join(L)


def write_outputs(d, url):
    NOTES.mkdir(exist_ok=True)
    base = f"{dt.date.today().isoformat()}-{slugify(d['title'])}"
    md, cards = NOTES / f"{base}.md", NOTES / f"{base}-anki.csv"
    md.write_text(render(d, url))
    with cards.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Front", "Back", "Tags"])
        for q in d["recall_questions"]:
            w.writerow([q["question"], f"{q['answer']} (video @ {q['timestamp']})",
                        f"{slugify(d['topic'])} {slugify(d['title'])}"])
    index = NOTES / "INDEX.md"
    if not index.exists():
        index.write_text("# Video notes index\n\n| Date | Topic | Note | Flashcards |\n|---|---|---|---|\n")
    with index.open("a") as f:
        f.write(f"| {dt.date.today().isoformat()} | {d['topic']} | [{d['title']}]({md.name}) | [csv]({cards.name}) |\n")
    return md, cards


def main():
    p = argparse.ArgumentParser()
    p.add_argument("url", nargs="?")
    p.add_argument("--goal", default="")
    p.add_argument("--model", default=None)
    p.add_argument("--from-json", help="render from a saved JSON, skip the API")
    a = p.parse_args()
    load_env()
    if a.from_json:
        d, url = json.loads(Path(a.from_json).read_text()), a.url or "(sample)"
    else:
        if not a.url:
            p.error("URL required")
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            sys.exit("GEMINI_API_KEY is not set. Add it as an environment variable "
                     "(see README) — do not paste it into chat or commit it.")
        profile = PROFILE.read_text() if PROFILE.exists() else ""
        model = a.model or os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)
        d, url = call_gemini(a.url, build_prompt(a.goal, profile), model, key), a.url
        (NOTES / "raw").mkdir(parents=True, exist_ok=True)
        (NOTES / "raw" / f"{dt.date.today().isoformat()}-{slugify(d['title'])}.json").write_text(
            json.dumps(d, indent=2))
    md, cards = write_outputs(d, url)
    print(f"Wrote {md.relative_to(ROOT)} and {cards.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
