# Calorie Tracker: API contract (v1)

This is the single source of truth. The backend and frontend are built by different
models from this file alone, so it must be followed **exactly** (paths, field names,
types, status codes).

Single user, no auth. All bodies and responses are JSON. Dates are `YYYY-MM-DD`.

## Domain rules

- **Goals**: `fat_loss`, `muscle_gain`, `recomp`.
- **Lifestyle** (daily living, *excluding* logged workouts) → multiplier:
  `sedentary` 1.2, `light` 1.375, `moderate` 1.55, `active` 1.725.
- **BMR** (Mifflin-St Jeor): `10*weight_kg + 6.25*height_cm - 5*age + 5` (male),
  `... - 161` (female).
- **maintenance_kcal** = `round(BMR * multiplier)`.
- **target_kcal** = `round(maintenance_kcal * f)`, `f` = 0.80 fat_loss, 1.10 muscle_gain, 1.00 recomp.
- **target_protein_g** = `round(weight_kg * p)`, `p` = 2.0 fat_loss, 2.0 muscle_gain, 2.2 recomp.
- **Daily expenditure** = `maintenance_kcal + sum(exercise kcal_burned for that date)`.
- **Daily intake** = `sum(food kcal for that date)`.
- **balance_kcal** = `intake - expenditure` (negative = deficit, positive = surplus).
- **status**: `no_data` if no food logged; else `deficit` if balance < -100, `surplus` if balance > 100, else `maintenance`.
- **on_track** (null when status is `no_data` or no profile):
  - fat_loss: intake <= target_kcal
  - muscle_gain: intake >= target_kcal
  - recomp: |intake - target_kcal| <= 150

## Endpoints

### `GET /api/health` → 200
`{"status": "ok"}`

### `PUT /api/profile` → 200
Request (all required):
```json
{"sex": "male|female", "age": 30, "height_cm": 178, "weight_kg": 82.5,
 "lifestyle": "sedentary|light|moderate|active", "goal": "fat_loss|muscle_gain|recomp"}
```
Validation: age 10-100, height_cm 100-250, weight_kg 30-300. Invalid → 422.
Response: the saved profile (same shape).

### `GET /api/profile` → 200 | 404
Profile, or 404 `{"detail": "profile not set"}`.

### `GET /api/targets` → 200 | 404
404 if no profile. Response:
```json
{"bmr": 1800, "maintenance_kcal": 2790, "target_kcal": 2232, "target_protein_g": 165, "goal": "fat_loss"}
```

### `POST /api/food` → 201
Request: `{"date": "2026-01-15", "name": "Chicken bowl", "kcal": 650, "protein_g": 45}`
`date` optional (default today, server local date). `protein_g` optional (default 0).
Validation: name non-empty, kcal 0-5000, protein_g 0-500. Invalid → 422.
Response: `{"id": 1, "date": "...", "name": "...", "kcal": 650, "protein_g": 45}`

### `GET /api/food?date=YYYY-MM-DD` → 200
`date` optional (default today). Returns a list of food entries, ordered by id ascending.

### `DELETE /api/food/{id}` → 204 | 404

### `POST /api/exercise` → 201
Request: `{"date": "2026-01-15", "name": "Run 5k", "kcal_burned": 400}`
`date` optional. Validation: name non-empty, kcal_burned 0-3000. Invalid → 422.
Response: `{"id": 1, "date": "...", "name": "...", "kcal_burned": 400}`

### `GET /api/exercise?date=YYYY-MM-DD` → 200
List of exercise entries, ordered by id ascending.

### `DELETE /api/exercise/{id}` → 204 | 404

### `GET /api/summary?date=YYYY-MM-DD` → 200
`date` optional (default today). Works without a profile (profile-dependent fields are null).
```json
{
  "date": "2026-01-15",
  "intake_kcal": 2100,
  "protein_g": 140,
  "exercise_kcal": 400,
  "maintenance_kcal": 2790,
  "expenditure_kcal": 3190,
  "balance_kcal": -1090,
  "status": "deficit",
  "target_kcal": 2232,
  "target_protein_g": 165,
  "goal": "fat_loss",
  "on_track": true
}
```
Without a profile: `maintenance_kcal`, `expenditure_kcal`, `balance_kcal`, `target_kcal`,
`target_protein_g`, `goal`, `on_track` are `null` and `status` is `no_profile`
(`status` precedence: `no_profile` first, then `no_data`, then the rules above).

## Serving

The backend (FastAPI app object `app` in `backend/main.py`) also serves the frontend:
`GET /` returns `frontend/index.html`. The frontend is one self-contained
`frontend/index.html` (inline CSS and JS, no build step, no external CDN) that calls the
API with relative URLs (`/api/...`).
