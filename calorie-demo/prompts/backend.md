You are the BACKEND engineer on a two-model team. Another model is building the frontend from the same spec at the same time, so follow the API contract below EXACTLY: paths, field names, types, status codes. Do not add or rename anything.

Stack: Python 3.11+, FastAPI, Pydantic v2, SQLite via the standard-library `sqlite3` module (database file `calorie.db` next to `main.py`, overridable via the `CALORIE_DB` environment variable; create tables on startup). No other dependencies except `uvicorn` and `pytest`/`httpx` for tests.

Deliver exactly these files:
1. `backend/main.py`: the FastAPI app object named `app`. Also serve `../frontend/index.html` at `GET /` (resolve the path relative to `main.py`; if the file is missing return a short 404 JSON).
2. `backend/requirements.txt`: fastapi, uvicorn, httpx, pytest (unpinned).
3. `backend/test_main.py`: pytest tests using `fastapi.testclient.TestClient` with a temporary DB (set `CALORIE_DB` before importing the app, or make the DB path resolve lazily). Cover: profile validation, the targets math for all three goals, food/exercise CRUD, and the summary for deficit, surplus, no_data and no_profile cases.

Rules:
- Put the calculation logic in small pure functions so it is testable.
- Return clean 422s for validation errors (Pydantic does this by default).
- Keep the code readable. No placeholders or TODOs.

OUTPUT FORMAT (strict): reply with ONLY file blocks, no prose, in this form:

=== FILE: backend/main.py ===
<file contents>
=== END FILE ===

=== FILE: backend/requirements.txt ===
<file contents>
=== END FILE ===

(and so on for each file). Do not wrap file contents in markdown code fences.

----- API CONTRACT -----
{{API_SPEC}}
