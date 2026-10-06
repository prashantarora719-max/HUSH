# Nutrition strategy (nutritionist agent) — v1, 2026-10-06

**Inputs:** 31M, 180 cm, 105 kg, ~25% BF (est.), vegetarian incl. eggs/dairy/paneer/whey isolate, Indian home cooking, ~1-1.75 h/day walkpad + 5 lifting days.

**Energy.** Mifflin-St Jeor BMR ≈ 2,025 kcal; Katch-McArdle (LBM ~79 kg) ≈ 2,075. With ~5 lifts/wk + ~10k steps, TDEE ≈ 2,900-3,000 (±250). Target loss 0.5-0.6 kg/wk (≈0.5% BW/wk; Helms 2014 range 0.5-1%) ⇒ deficit ≈ 600-650 kcal ⇒ **2,300 kcal/day**. This is an estimate: the weekly check-in recalibrates it from the 14-day trend.

**Macros (per day):** Protein ~170-180 g (≈1.65-1.75 g/kg BW, ≈2.2 g/kg lean mass; Morton 2018 plateau ~1.6, higher in a deficit per Helms), fat 55-90 g (≥0.6 g/kg), carbs 230-250 g, fibre 35-50 g. Protein spread across 5 feedings at ~25-45 g each (leucine ~2.5-3 g/meal; whey isolate x2 supplies ~50 g).

**Why not 95 kg:** 10 kg in 87 days = ~0.85 kg/wk. At 25% BF that is at the edge of muscle-sparing rates and leaves no slack for Diwali/travel. Base case is ~98 kg; 95 kg is a stretch we pursue only if the trend and strength both hold.

**Phases:** Weeks 1-2 calibrate (water/glycogen drop of 1-2 kg is normal). Weeks 3-12 adjust via the decision table in the tracker. A 5-7 day maintenance week is triggered (not scheduled) by 2 of: hunger ≥4/5, sleep < 6.5 h, strength down 2 weeks, adherence < 80%.

**Vegetarian watch-list:** B12 (untested — add to next panel), vitamin D (very low: 60,000 IU/wk per your nutritionist, take with a fat-containing meal, re-test after ~8 weeks), zinc and omega-3 (consider algal DHA/EPA), iron/ferritin (reported good).

**Skin (acne / seb-derm):** evidence linking whey/dairy and high glycaemic load to acne is observational and individual. Use isolate only (drop concentrate), keep dahi/paneer, and judge skin over 4 weeks. Treatment decisions (including medicated shampoos) belong to a dermatologist.

**Meals:** see `tracker.xlsx` → *Daily Meals* (87 days, exact grams; raw weights for dal/rice/atta). Regenerate with `python3 fitness/tools/build_tracker.py --kcal <N>` after a calorie change.
