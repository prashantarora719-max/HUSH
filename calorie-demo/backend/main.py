import os
import sqlite3
from datetime import date as date_cls
from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, field_validator

BASE_DIR = Path(__file__).resolve().parent
FRONTEND = BASE_DIR.parent / "frontend" / "index.html"

LIFESTYLE_MULT = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725}
KCAL_FACTOR = {"fat_loss": 0.80, "muscle_gain": 1.10, "recomp": 1.00}
PROTEIN_PER_KG = {"fat_loss": 2.0, "muscle_gain": 2.0, "recomp": 2.2}

app = FastAPI(title="Calorie Tracker")


# ---------- pure calculation helpers ----------

def round_half_up(x: float) -> int:
    return int(x + 0.5) if x >= 0 else -int(-x + 0.5)


def calc_bmr(sex: str, age: int, height_cm: float, weight_kg: float) -> float:
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    return base + 5 if sex == "male" else base - 161


def calc_targets(profile: dict) -> dict:
    bmr = calc_bmr(profile["sex"], profile["age"], profile["height_cm"], profile["weight_kg"])
    maintenance = round_half_up(bmr * LIFESTYLE_MULT[profile["lifestyle"]])
    goal = profile["goal"]
    return {
        "bmr": round_half_up(bmr),
        "maintenance_kcal": maintenance,
        "target_kcal": round_half_up(maintenance * KCAL_FACTOR[goal]),
        "target_protein_g": round_half_up(profile["weight_kg"] * PROTEIN_PER_KG[goal]),
        "goal": goal,
    }


def calc_status(intake_logged: bool, balance: int) -> str:
    if not intake_logged:
        return "no_data"
    if balance < -100:
        return "deficit"
    if balance > 100:
        return "surplus"
    return "maintenance"


def calc_on_track(goal: str, intake: int, target_kcal: int) -> bool:
    if goal == "fat_loss":
        return intake <= target_kcal
    if goal == "muscle_gain":
        return intake >= target_kcal
    return abs(intake - target_kcal) <= 150


# ---------- database ----------

def db_path() -> str:
    return os.environ.get("CALORIE_DB", str(BASE_DIR / "calorie.db"))


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(db_path())
    conn.row_factory = sqlite3.Row
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            sex TEXT NOT NULL, age INTEGER NOT NULL, height_cm REAL NOT NULL,
            weight_kg REAL NOT NULL, lifestyle TEXT NOT NULL, goal TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS food (
            id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL,
            name TEXT NOT NULL, kcal REAL NOT NULL, protein_g REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS exercise (
            id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL,
            name TEXT NOT NULL, kcal_burned REAL NOT NULL
        );
        """
    )
    return conn


@app.on_event("startup")
def _startup() -> None:
    get_conn().close()


# ---------- models ----------

DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"


def _check_date(v: Optional[str]) -> Optional[str]:
    if v is not None:
        date_cls.fromisoformat(v)  # ValueError -> 422
    return v


class Profile(BaseModel):
    sex: Literal["male", "female"]
    age: int = Field(ge=10, le=100)
    height_cm: float = Field(ge=100, le=250)
    weight_kg: float = Field(ge=30, le=300)
    lifestyle: Literal["sedentary", "light", "moderate", "active"]
    goal: Literal["fat_loss", "muscle_gain", "recomp"]


class FoodIn(BaseModel):
    date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    name: str = Field(min_length=1)
    kcal: float = Field(ge=0, le=5000)
    protein_g: float = Field(default=0, ge=0, le=500)

    _v = field_validator("date")(_check_date)

    @field_validator("name")
    @classmethod
    def _name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v


class ExerciseIn(BaseModel):
    date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    name: str = Field(min_length=1)
    kcal_burned: float = Field(ge=0, le=3000)

    _v = field_validator("date")(_check_date)

    @field_validator("name")
    @classmethod
    def _name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v


def _today() -> str:
    return date_cls.today().isoformat()


def _num(x: float):
    """Return ints for whole numbers so JSON shows 650 rather than 650.0."""
    return int(x) if float(x).is_integer() else x


def _load_profile(conn) -> Optional[dict]:
    row = conn.execute("SELECT sex, age, height_cm, weight_kg, lifestyle, goal FROM profile WHERE id = 1").fetchone()
    if row is None:
        return None
    p = dict(row)
    p["height_cm"], p["weight_kg"] = _num(p["height_cm"]), _num(p["weight_kg"])
    return p


def _food_out(row) -> dict:
    return {"id": row["id"], "date": row["date"], "name": row["name"],
            "kcal": _num(row["kcal"]), "protein_g": _num(row["protein_g"])}


def _exercise_out(row) -> dict:
    return {"id": row["id"], "date": row["date"], "name": row["name"],
            "kcal_burned": _num(row["kcal_burned"])}


def _valid_query_date(d: Optional[str]) -> str:
    if d is None:
        return _today()
    try:
        date_cls.fromisoformat(d)
    except ValueError:
        raise HTTPException(status_code=422, detail="date must be YYYY-MM-DD")
    return d


# ---------- routes ----------

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.put("/api/profile")
def put_profile(p: Profile):
    conn = get_conn()
    with conn:
        conn.execute(
            "INSERT INTO profile (id, sex, age, height_cm, weight_kg, lifestyle, goal) "
            "VALUES (1, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET "
            "sex=excluded.sex, age=excluded.age, height_cm=excluded.height_cm, "
            "weight_kg=excluded.weight_kg, lifestyle=excluded.lifestyle, goal=excluded.goal",
            (p.sex, p.age, p.height_cm, p.weight_kg, p.lifestyle, p.goal),
        )
    out = _load_profile(conn)
    conn.close()
    return out


@app.get("/api/profile")
def get_profile():
    conn = get_conn()
    p = _load_profile(conn)
    conn.close()
    if p is None:
        raise HTTPException(status_code=404, detail="profile not set")
    return p


@app.get("/api/targets")
def get_targets():
    conn = get_conn()
    p = _load_profile(conn)
    conn.close()
    if p is None:
        raise HTTPException(status_code=404, detail="profile not set")
    return calc_targets(p)


@app.post("/api/food", status_code=201)
def add_food(f: FoodIn):
    conn = get_conn()
    with conn:
        cur = conn.execute(
            "INSERT INTO food (date, name, kcal, protein_g) VALUES (?, ?, ?, ?)",
            (f.date or _today(), f.name, f.kcal, f.protein_g),
        )
    row = conn.execute("SELECT * FROM food WHERE id = ?", (cur.lastrowid,)).fetchone()
    conn.close()
    return _food_out(row)


@app.get("/api/food")
def list_food(date: Optional[str] = None):
    d = _valid_query_date(date)
    conn = get_conn()
    rows = conn.execute("SELECT * FROM food WHERE date = ? ORDER BY id", (d,)).fetchall()
    conn.close()
    return [_food_out(r) for r in rows]


@app.delete("/api/food/{entry_id}", status_code=204)
def delete_food(entry_id: int):
    conn = get_conn()
    with conn:
        cur = conn.execute("DELETE FROM food WHERE id = ?", (entry_id,))
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="food entry not found")
    return Response(status_code=204)


@app.post("/api/exercise", status_code=201)
def add_exercise(e: ExerciseIn):
    conn = get_conn()
    with conn:
        cur = conn.execute(
            "INSERT INTO exercise (date, name, kcal_burned) VALUES (?, ?, ?)",
            (e.date or _today(), e.name, e.kcal_burned),
        )
    row = conn.execute("SELECT * FROM exercise WHERE id = ?", (cur.lastrowid,)).fetchone()
    conn.close()
    return _exercise_out(row)


@app.get("/api/exercise")
def list_exercise(date: Optional[str] = None):
    d = _valid_query_date(date)
    conn = get_conn()
    rows = conn.execute("SELECT * FROM exercise WHERE date = ? ORDER BY id", (d,)).fetchall()
    conn.close()
    return [_exercise_out(r) for r in rows]


@app.delete("/api/exercise/{entry_id}", status_code=204)
def delete_exercise(entry_id: int):
    conn = get_conn()
    with conn:
        cur = conn.execute("DELETE FROM exercise WHERE id = ?", (entry_id,))
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="exercise entry not found")
    return Response(status_code=204)


@app.get("/api/summary")
def summary(date: Optional[str] = None):
    d = _valid_query_date(date)
    conn = get_conn()
    food = conn.execute("SELECT COUNT(*) n, COALESCE(SUM(kcal),0) k, COALESCE(SUM(protein_g),0) p "
                        "FROM food WHERE date = ?", (d,)).fetchone()
    ex_kcal = conn.execute("SELECT COALESCE(SUM(kcal_burned),0) FROM exercise WHERE date = ?", (d,)).fetchone()[0]
    profile = _load_profile(conn)
    conn.close()

    intake, protein, exercise = _num(food["k"]), _num(food["p"]), _num(ex_kcal)
    out = {
        "date": d, "intake_kcal": intake, "protein_g": protein, "exercise_kcal": exercise,
        "maintenance_kcal": None, "expenditure_kcal": None, "balance_kcal": None,
        "status": "no_profile", "target_kcal": None, "target_protein_g": None,
        "goal": None, "on_track": None,
    }
    if profile is None:
        return out

    t = calc_targets(profile)
    expenditure = t["maintenance_kcal"] + exercise
    balance = intake - expenditure
    status = calc_status(food["n"] > 0, balance)
    out.update(
        maintenance_kcal=t["maintenance_kcal"], expenditure_kcal=_num(expenditure),
        balance_kcal=_num(balance), status=status, target_kcal=t["target_kcal"],
        target_protein_g=t["target_protein_g"], goal=t["goal"],
        on_track=None if status == "no_data" else calc_on_track(t["goal"], intake, t["target_kcal"]),
    )
    return out


@app.get("/")
def index():
    if not FRONTEND.is_file():
        return JSONResponse({"detail": "frontend not found"}, status_code=404)
    return FileResponse(FRONTEND, media_type="text/html")
