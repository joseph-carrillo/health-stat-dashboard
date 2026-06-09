# activeContext.md

## Current Session Goal
Synced office + laptop via merge (June 9). Continue Track 1 upload pipeline OR maps GeoJSON drop-in.

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (June 9 — merge + Indicator Reports)
- **Git merge** resolved: local kept `main.py`, `IndicatorReports`, `Management` (users/audit), `Home`; remote kept `Overview`, `Coverage`, `Rankings`
- **Surgical add to local `main.py`:** `/api/coverage-summary`, `/api/coverage-breakdown`, `/api/batches/history` (required by remote analytics pages); `approve_batch(force=True)`
- **Indicator Reports** (`/analytics/reports`): province/HUC row highlight + area filter (Negros Occidental, Oriental, Siquijor, Bacolod HUC)
- **Startup protocols fixed:** `scripts/sync.ps1` (fast fail, no silent merge abort), faster `health-check.ps1` (no `Test-NetConnection` hang)

## What Was Completed Earlier (remote / laptop sessions)
- Immunization **File 4 (DPT-HiB-HepB 1/2/3)** — parse, stage, approve to `health_data`
- `commit.py` approve: force DQC bypass + transaction savepoints for duplicate inserts
- `scripts/start.ps1` — restart backend if port 8000 already in use
- Overview maps/ranking — selectable indicator (CPAB, BCG, HepaB, DPT1/2/3 %)
- Session startup/shutdown protocols + Cursor rules

## What Was Completed Earlier (local / office — May 30)
- File 1 E2E verified (CPAB/BCG/HepaB, Jan 2026, 1,386 rows)
- API-driven Indicator Reports page (template config layout)
- RBAC, audit log, upload dry-run, Management user admin

## What Happens Next
1. `run startup protocols` (uses `scripts/sync.ps1` then `scripts/start.ps1`)
2. Drop `NIR.geojson` + `HUC.geojson` into `frontend/public/geojson/` for Overview maps
3. Next Immunization file (5–8) OR Nutrition — per `adding_templates.md`
4. **Push** this merge to GitHub so the other machine can `sync.ps1`

## Daily Startup (two machines)
1. `run startup protocols` OR `.\scripts\sync.ps1` then `.\scripts\start.ps1`
2. Open http://localhost:5173

## API and Frontend Ports
- API: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: admin / Admin@2026!
- Test: jsmith / Test@2026! (program_manager, CHILD_CARE)

## Local Database
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026

## ICTU Server Status
Pending approval — deploy checklist still TODO
