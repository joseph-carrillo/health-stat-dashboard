# activeContext.md

## Current Session Goal (next time)
Continue **upload pipeline** (next FHSIS file) OR build **Trends** line chart when ready. See `session-handoff.md`.

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (latest session)
- Immunization **File 4 (DPT-HiB-HepB 1/2/3)** — parse, stage, approve to `health_data`
- `commit.py` approve: force DQC bypass + transaction savepoints for duplicate inserts
- `scripts/start.ps1` — restart backend if port 8000 already in use
- Overview maps/ranking — selectable indicator (CPAB, BCG, HepaB, DPT1/2/3 %)
- Viz planning: pipeline before new charts; Trends = line chart when multi-month

## What Happens Next
1. `run startup protocols`
2. Next file in Child Care Immunization (files 5–8) OR Nutrition first file
3. Optional: commit/push any local changes if shutdown push missed files

## Daily Startup (or use script)
1. `run startup protocols` OR `.\scripts\start.ps1`
2. Open http://localhost:5173

## API and Frontend Ports
- API: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: admin / Admin@2026!
- Dev bypass: dev / dev (REMOVE BEFORE GO-LIVE)
- Test: jsmith / Test@2026! (program_manager, CHILD_CARE)

## Local Database
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026

## ICTU Server Status
Pending approval — deploy checklist still TODO (Friday Track 1 item)
