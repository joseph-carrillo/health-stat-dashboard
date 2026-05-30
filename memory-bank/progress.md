# progress.md

## Status: Phase 1 Feature-Complete — Live-Verified on File 1 (CPAB/BCG/HepaB)

## Latest Session (May 30) — Live Verification + Indicator Reports
- Stood up full local stack: Postgres (docker `doh_nir_db`), API (uvicorn,
  now run with --reload), frontend (Vite, port 5173)
- Ran a REAL File 1 Excel end-to-end through the UI:
  upload -> dry-run validate -> stage -> approve -> commit
- Committed data verified: 1,386 rows = 66 LGUs x 21 indicators, Jan 2026.
  Spot-checked computed fields (e.g. CPAB_TOTAL = M+F, CPAB_PCT = TOTAL/POP*100)
- Built NEW "Indicator Reports" page (`/analytics/reports`): renders committed
  data in the EXACT source-Excel layout — config-ordered columns, grouped
  two-row headers (CPAB / BCG <=24h / ...), M/F/Total/% sub-columns, computed
  columns tinted. Template-driven (per Excel file), not program-wide.
- New backend: `GET /api/templates`, `GET /api/templates/{id}/report`
  (analytics.list_templates / get_template_layout / get_template_report);
  RBAC-scoped (sensitive + per-program), no 500-row cap
- Config now carries an optional `display` block (label + id-column headers);
  group/sub headers are derived from indicator names
- Data quirk flagged for the team: HepaB >24h values equal HepaB <=24h in the
  uploaded file — worth confirming at source

## Bug Fixes (May 30)
- staging_health_data was missing the `is_computed` column on the live DB
  volume (schema drift). schema.slq already defines it; applied
  `ALTER TABLE staging_health_data ADD COLUMN IF NOT EXISTS is_computed BOOLEAN
  DEFAULT FALSE` to the running DB. NOTE for fresh setups: bootstrap_db.py /
  schema.slq already include it, so this only affects pre-existing volumes.
- parser.load_config now opens config JSON with encoding="utf-8" (was using the
  Windows cp1252 default, which mangled non-ASCII like em-dashes / place names)
- Cleared a stale April-26 test batch (2,667 rows) left in staging

## Known Cleanup (non-blocking)
- Navbar import casing: every page imports `components/Navbar` but the file is
  `NavBar.jsx`. Works on Windows but caused a Vite HMR cache miss once
  (restart + clear node_modules/.vite fixed it). Normalize imports later.

## Status: Phase 1 Feature-Complete — Pending Live Verification (superseded above)

## Completed
- Full stack setup (React + FastAPI + PostgreSQL + Docker)
- All tools installed on office desktop and personal laptop
- GitHub repo synced on both machines
- Memory bank and Claude Project set up
- April 20 stakeholder meeting attended
- Survey of ExeCom, ManCom, Program Managers conducted
- All 63 FHSIS Excel templates analyzed
- 107 official indicators cross-referenced from DOH memorandum
- fhsis_template_analysis.md completed (in project knowledge)
- Database schema designed (7 tables + users table)
- Project folder skeleton created
- PostgreSQL running in Docker (verified on both machines)
- DBeaver connected on both machines
- All 7 tables + users table created
- 128 NIR locations seeded
- 11 programs seeded (official DOH names)
- 34 report periods seeded (2025 + 2026)
- 43 Immunization indicators seeded
- Parser config created (cpab_bcg_hepa.json)
- Excel parser service built (parser.py)
- Commit approval service built (commit.py)
- Full pipeline tested: 2,667 rows parsed → staged → committed
- FastAPI endpoints built and tested (13 endpoints)
- JWT authentication working
- User registration system built
- Admin role assignment working
- React frontend set up with Vite
- DOH branding applied (DM 2025-0600)
- Login page built with official colors, fonts, and logos
- App.jsx routing between Login and Dashboard

## Phase 1 Completion Build (latest)
- Fixed broken staging/approve endpoints (commit.py functions were never imported)
- Centralized DB config (env-driven) in app/core/db.py; parser/commit/auth use it
- Added audit_log table + helper; logging on login, upload, approve, conflict, role changes
- Added reference endpoints: /api/programs, /api/indicators, /api/locations, /api/periods
- Added aggregate endpoints: /api/scorecard, /api/coverage, /api/coverage-detail, /api/trend, /api/data-availability
- Sensitive-indicator RBAC + program scoping enforced at the API
- Parser dry-run mode + validate_config for safely testing new template configs
- Removed Login dev bypass; login persists user + permissions
- Built Upload page with staging review + side-by-side conflict resolution
- Wired Home + Overview to live data (scorecard + coverage)
- Built Coverage, Trends (SVG line chart), Rankings on real endpoints
- Built Targets (admin editable), Data Availability matrix, admin Management (users/roles/audit)
- Deleted unused Dashboard.jsx; added memory-bank/adding_templates.md recipe

## Build Order (Vertical Slice Strategy)
1. ✅ Database schema and seed data
2. ✅ Parser for File 1 (CPAB/BCG/HepaB)
3. ✅ Commit approval system
4. ✅ FastAPI endpoints (now ~25, incl. reference + aggregates)
5. ✅ Auth and JWT login
6. ✅ User registration and role management
7. ✅ React frontend setup with DOH branding
8. ✅ Login page (dev bypass removed)
9. ✅ Full login flow wired to API
10. ✅ Dashboard pages with real data (Home, Overview, Coverage, Trends, Rankings)
11. ✅ Upload page (with dry-run, staging review, conflict resolution)
12. ✅ Live end-to-end verified on File 1 (real Excel -> committed -> dashboards)
13. ✅ Indicator Reports page (raw "Excel face" view of committed data)
14. ⬜ Expand to remaining 62 files (process documented in adding_templates.md)

## Remaining To Verify / Do
- Drop GeoJSON into frontend/public/geojson/ (NIR.geojson, HUC.geojson) so the
  Overview choropleth maps render (everything else populates without them)
- Confirm with team: HepaB >24h == HepaB <=24h in the uploaded File 1
- Begin template expansion (File 2 onward) per adding_templates.md

## Pending Team Actions (Template Errors to Fix)
- `envi_sanitation_zod_nir.xlsx` — Fix Qtr3 and Qtr4 structure
- `nata_lb_abr_rabr_nir.xlsx` — Add missing ABR <10 column to Q2
- `morta_mmr_imr_nir.xlsx` — Fix col 33 label (d4 → g4)
- `6__pre_gd_screening_nir.xlsx` — Fix col Z formula (g/h → g/a)
- `2_3_Vitamin_A_supplementation_nir.xlsx` — Fix col 11 formula
- `infec_schisto_5-14, 15-19, 20-59, 60above` — Fix Qtr1b col D and Qtr1d col J

## Pending Clarifications (Higher Ops)
- BHW ratio — numerator/denominator convention
- MAM denominator — children SEEN vs children identified
- 8ANC denominator — TCL vs Excel tracking formula
- Cervical cancer — running denominator vs static

## Parked Items
- Morbidity — needs per-LGU and barangay expansion
- Animal bites — rate multiplier unclear
- Filariasis MDA — wrong locations, excluded
- NCD HUC barangay rows — missing across multiple files

## Local Database Credentials (Development Only)
- Host: localhost | Port: 5432
- Database: doh_nir_dashboard
- Username: doh_admin | Password: doh_password_2026

## API Credentials (Development Only)
- Admin: admin / Admin@2026!
- Test user: jsmith / Test@2026! (program_manager, CHILD_CARE)
- API docs: http://localhost:8000/docs