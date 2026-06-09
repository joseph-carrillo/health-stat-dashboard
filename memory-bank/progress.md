# progress.md

## Status: Track 1 — Immunization Files 1+4, Nutrition Files 1–6, Sick Child Files 1–3; Indicator Reports polished (June 9)

## Latest Session (June 9) — Nutrition pipeline + report fixes
- Nutrition Files 1–5 quarterly + File 6 annual (MAM/SAM dual-sheet upload)
- Upload catalog API + refactored Upload page; `uploadPrograms.js` helpers
- Parser: multi-sheet annual, `ensure_period_id`, filename validation
- Indicator Reports: filter layout, annual/MAM-SAM views, computed Total/%, generic NIR rollup
- Percentage display normalized (DB ratio → UI percent); DQC red cells on diarrhea template only
- Management of the Sick configs (vitamin A, diarrhea/pneumonia)
- Debug helper: `backend/scripts/inspect_excel.py`

## Session (June 9 earlier) — Merge + Indicator Reports filter
- Resolved diverged `main` (local office commit + 11 remote laptop commits)
- Kept local: `main.py` (RBAC/audit), `IndicatorReports`, `Management` users/audit, `Home`
- Kept remote: `Overview`, `Coverage`, `Rankings` (multi-indicator, HUC fixes)
- Added province dashboard endpoints to local `main.py` for remote analytics pages
- Indicator Reports: province/HUC highlight + area filter (PSGC prefixes)
- Startup fix: `scripts/sync.ps1`, faster `health-check.ps1`, protocol docs updated

## Session (May 30 — office) — Live Verification + Indicator Reports
- Full local stack verified; File 1 Excel end-to-end (1,386 rows, Jan 2026)
- API-driven Indicator Reports (`/analytics/reports`) — template layout from config JSON
- RBAC on template report endpoints; `display` block in configs
- Bug fixes: `is_computed` column drift, UTF-8 config loading, stale batch cleared

## Session (laptop — remote commits) — File 4 + analytics polish
- Immunization File 4 (DPT-HiB-HepB): `dpt_hib_hepb123.json`, upload + approve + report
- `commit.py`: `force=True` DQC bypass, savepoints on duplicate key
- Overview: multi-indicator dropdown (CPAB, BCG, HepaB, DPT1/2/3 %)
- Coverage/Rankings: `coverage-breakdown` API with province/HUC grouping
- `scripts/start.ps1`, session protocols, `session-handoff.md`

## Completed (foundation)
- Full stack (React + FastAPI + PostgreSQL + Docker) on both machines
- 128 NIR locations, 11 programs, 34 periods, Immunization indicators seeded
- Parser + commit pipeline; JWT auth; DOH branding; Upload with staging/conflicts
- Home scorecard; Targets; Data Availability; Trends (SVG); Management user admin
- `adding_templates.md` recipe for remaining files

## Build Order (Vertical Slice)
1. ✅ Database schema and seed data
2. ✅ Parser File 1 (CPAB/BCG/HepaB) + File 4 (DPT-HiB-HepB)
3. ✅ Commit approval system (incl. force approve)
4. ✅ FastAPI endpoints (~30 incl. province dashboard APIs)
5. ✅ Auth and JWT login
6. ✅ User registration and role management
7. ✅ React frontend with DOH branding
8. ✅ Dashboard pages (Home local; Overview/Coverage/Rankings remote build)
9. ✅ Upload page (dry-run, staging, conflict resolution)
10. ✅ Indicator Reports (API-driven + province filter + computed columns + NIR rollup)
11. 🔄 Child Care templates — Immunization 1+4, Nutrition 1–6, Sick 1–3 (remaining immunization + SBI annual)
12. ⬜ GeoJSON maps in `frontend/public/geojson/`
13. ⬜ ICTU deploy

## Remaining To Verify / Do
- File 6 Nutritional Status upload/approve from Expanded NIR folder (if not completed)
- Drop GeoJSON for Overview choropleths
- Confirm HepaB >24h == HepaB <=24h in File 1 upload
- Next template per `adding_templates.md`

## Pending Team Actions (Template Errors)
- `envi_sanitation_zod_nir.xlsx` — Fix Qtr3 and Qtr4 structure
- `nata_lb_abr_rabr_nir.xlsx` — Add missing ABR <10 column to Q2
- `morta_mmr_imr_nir.xlsx` — Fix col 33 label (d4 → g4)
- `6__pre_gd_screening_nir.xlsx` — Fix col Z formula (g/h → g/a)
- `2_3_Vitamin_A_supplementation_nir.xlsx` — Fix col 11 formula
- infec_schisto files — Fix Qtr1b col D and Qtr1d col J

## Pending Clarifications (Higher Ops)
- BHW ratio, MAM denominator, 8ANC denominator, cervical cancer denominator

## Parked Items
- Morbidity per-LGU/barangay; Animal bites rate; Filariasis MDA; NCD HUC barangays

## Local Database (Development)
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026

## API Credentials (Development)
- Admin: admin / Admin@2026!
- Test: jsmith / Test@2026! (program_manager, CHILD_CARE)
