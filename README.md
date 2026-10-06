# HUSH — video to notes pipeline

Turns a public YouTube URL into a revision note (markdown), Anki flashcards (CSV with
timestamps) and an index entry, using the Gemini API to watch the video.

## Setup
1. Edit `pipeline/profile.md` so actions fit your real work and life.
2. Add your Gemini key as the environment variable `GEMINI_API_KEY`:
   - Cloud session: environment menu in the session title bar -> Edit -> add `GEMINI_API_KEY`
     (under API credentials if offered, otherwise as an environment variable). Start a new session after.
   - Local: create a `.env` file in the repo root with `GEMINI_API_KEY=...` (it is gitignored).
3. Never paste the key into chat or commit it.

## Run
    python3 pipeline/video_to_notes.py "https://www.youtube.com/watch?v=..." --goal "build a sustainable routine"

Outputs go to `notes/` (`*.md`, `*-anki.csv`, `INDEX.md`, raw JSON in `notes/raw/`).
Import the CSV in Anki: File -> Import, comma-separated, first row as header, fields Front/Back/Tags.

Limits: public/unlisted videos only; free tier caps daily YouTube video processing.
