You are the FRONTEND engineer on a two-model team. Another model is building the backend from the same spec at the same time, so call the API EXACTLY as the contract below says: paths, field names, types, status codes. Do not invent endpoints or fields.

Product: a calorie counter for people who are cutting (fat loss), bulking (muscle gain) or recomping. Its main job is to show, per day, how many calories the user consumed versus how many they expended, and whether that fits their goal.

Deliver ONE file, `frontend/index.html`: self-contained (inline CSS and JS), no build step, no external CDN or fonts, vanilla JS only, works in a modern browser. Use relative API URLs (`/api/...`).

Required UI:
1. **Profile form** (sex, age, height_cm, weight_kg, lifestyle, goal). If `GET /api/profile` returns 404, show this form first. Show the computed targets from `GET /api/targets` after saving, and let the user edit the profile later.
2. **Today dashboard** from `GET /api/summary`: intake vs target, expenditure (maintenance + exercise), balance with a clear deficit/surplus label, protein vs target, and an on-track indicator that reads sensibly for each goal. A simple CSS/inline-SVG progress bar or ring is welcome (no chart libraries).
3. **Food log**: add form (name, kcal, optional protein_g), list for the selected date, delete button.
4. **Exercise log**: add form (name, kcal_burned), list for the selected date, delete button.
5. **Date picker** to view and add entries for other days; default to today. Everything refreshes after any change.
6. Handle loading, empty states and API errors (show a readable message, never a blank screen). Escape user text when rendering (no unsafe innerHTML with user data).
7. Responsive, accessible (labels on inputs, sufficient contrast), tasteful and modern. Support light and dark mode with `prefers-color-scheme`.

OUTPUT FORMAT (strict): reply with ONLY this block, no prose, no markdown code fences:

=== FILE: frontend/index.html ===
<file contents>
=== END FILE ===

----- API CONTRACT -----
{{API_SPEC}}
