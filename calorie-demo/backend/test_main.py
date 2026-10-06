import os
import tempfile

os.environ["CALORIE_DB"] = os.path.join(tempfile.mkdtemp(), "test.db")

import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)

PROFILE = {"sex": "male", "age": 30, "height_cm": 178, "weight_kg": 82.5,
           "lifestyle": "moderate", "goal": "fat_loss"}


@pytest.fixture(autouse=True)
def fresh_db(tmp_path, monkeypatch):
    monkeypatch.setenv("CALORIE_DB", str(tmp_path / "t.db"))


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_profile_404_then_saved():
    assert client.get("/api/profile").status_code == 404
    assert client.get("/api/targets").status_code == 404
    r = client.put("/api/profile", json=PROFILE)
    assert r.status_code == 200 and r.json() == PROFILE
    assert client.get("/api/profile").json() == PROFILE


@pytest.mark.parametrize("field,value", [("age", 9), ("age", 101), ("height_cm", 99), ("height_cm", 251),
                                         ("weight_kg", 29), ("weight_kg", 301), ("sex", "x"),
                                         ("lifestyle", "x"), ("goal", "x")])
def test_profile_validation(field, value):
    assert client.put("/api/profile", json={**PROFILE, field: value}).status_code == 422


def test_targets_math_all_goals():
    # BMR = 825 + 1112.5 - 150 + 5 = 1792.5 ; maintenance = round(1792.5*1.55) = 2778
    expected = {"fat_loss": (2222, 165), "muscle_gain": (3056, 165), "recomp": (2778, 182)}
    for goal, (kcal, protein) in expected.items():
        client.put("/api/profile", json={**PROFILE, "goal": goal})
        t = client.get("/api/targets").json()
        assert t["maintenance_kcal"] == 2778
        assert t["target_kcal"] == kcal and t["target_protein_g"] == protein and t["goal"] == goal


def test_bmr_female():
    assert main.calc_bmr("female", 30, 165, 60) == 600 + 1031.25 - 150 - 161


def test_status_and_on_track_helpers():
    assert main.calc_status(False, 0) == "no_data"
    assert main.calc_status(True, -101) == "deficit"
    assert main.calc_status(True, 101) == "surplus"
    assert main.calc_status(True, 100) == "maintenance"
    assert main.calc_on_track("fat_loss", 2000, 2000) and not main.calc_on_track("fat_loss", 2001, 2000)
    assert main.calc_on_track("muscle_gain", 2000, 2000) and not main.calc_on_track("muscle_gain", 1999, 2000)
    assert main.calc_on_track("recomp", 2150, 2000) and not main.calc_on_track("recomp", 2151, 2000)


def test_food_crud():
    r = client.post("/api/food", json={"date": "2026-01-15", "name": "Chicken bowl", "kcal": 650, "protein_g": 45})
    assert r.status_code == 201
    assert r.json() == {"id": 1, "date": "2026-01-15", "name": "Chicken bowl", "kcal": 650, "protein_g": 45}
    client.post("/api/food", json={"date": "2026-01-15", "name": "Rice", "kcal": 200})
    items = client.get("/api/food?date=2026-01-15").json()
    assert [i["id"] for i in items] == [1, 2] and items[1]["protein_g"] == 0
    assert client.get("/api/food?date=2026-01-16").json() == []
    assert client.delete("/api/food/1").status_code == 204
    assert client.delete("/api/food/1").status_code == 404
    assert len(client.get("/api/food?date=2026-01-15").json()) == 1


def test_food_default_date_and_validation():
    r = client.post("/api/food", json={"name": "Apple", "kcal": 80})
    assert r.json()["date"] == main._today()
    for bad in [{"name": "", "kcal": 1}, {"name": "x", "kcal": -1}, {"name": "x", "kcal": 5001},
                {"name": "x", "kcal": 1, "protein_g": 501}, {"name": "x", "kcal": 1, "date": "nope"}]:
        assert client.post("/api/food", json=bad).status_code == 422


def test_exercise_crud():
    r = client.post("/api/exercise", json={"date": "2026-01-15", "name": "Run 5k", "kcal_burned": 400})
    assert r.status_code == 201
    assert r.json() == {"id": 1, "date": "2026-01-15", "name": "Run 5k", "kcal_burned": 400}
    assert len(client.get("/api/exercise?date=2026-01-15").json()) == 1
    assert client.post("/api/exercise", json={"name": "x", "kcal_burned": 3001}).status_code == 422
    assert client.post("/api/exercise", json={"name": "", "kcal_burned": 1}).status_code == 422
    assert client.delete("/api/exercise/1").status_code == 204
    assert client.delete("/api/exercise/1").status_code == 404


def test_summary_no_profile():
    s = client.get("/api/summary?date=2026-01-15").json()
    assert s["status"] == "no_profile" and s["maintenance_kcal"] is None and s["on_track"] is None


def test_summary_no_data():
    client.put("/api/profile", json=PROFILE)
    s = client.get("/api/summary?date=2026-01-15").json()
    assert s["status"] == "no_data" and s["on_track"] is None and s["maintenance_kcal"] == 2778


def test_summary_deficit():
    client.put("/api/profile", json=PROFILE)
    d = "2026-01-15"
    client.post("/api/food", json={"date": d, "name": "Meal", "kcal": 2100, "protein_g": 140})
    client.post("/api/exercise", json={"date": d, "name": "Run", "kcal_burned": 400})
    s = client.get(f"/api/summary?date={d}").json()
    assert s == {"date": d, "intake_kcal": 2100, "protein_g": 140, "exercise_kcal": 400,
                 "maintenance_kcal": 2778, "expenditure_kcal": 3178, "balance_kcal": -1078,
                 "status": "deficit", "target_kcal": 2222, "target_protein_g": 165,
                 "goal": "fat_loss", "on_track": True}


def test_summary_surplus_and_maintenance():
    client.put("/api/profile", json={**PROFILE, "goal": "muscle_gain"})
    client.post("/api/food", json={"date": "2026-02-01", "name": "Big", "kcal": 3000})
    s = client.get("/api/summary?date=2026-02-01").json()
    assert s["status"] == "surplus" and s["on_track"] is False
    client.post("/api/food", json={"date": "2026-02-02", "name": "Even", "kcal": 2778})
    assert client.get("/api/summary?date=2026-02-02").json()["status"] == "maintenance"


def test_bad_query_date():
    assert client.get("/api/summary?date=bad").status_code == 422


def test_index_serves_frontend():
    r = client.get("/")
    assert r.status_code == 200 and "html" in r.headers["content-type"]
