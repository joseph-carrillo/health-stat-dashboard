# activeContext.md

## Current Session Goal (next time)
Choose next build lane: Child Care Immunization File 4, Child Care Nutrition, or new health program — see `session-handoff.md`.

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (latest session)
- **Immunization File 1 E2E signed off** by user (Excel matches Indicator Report)
- Track 1 Tue/Wed: live APIs on Home, Overview, Coverage, Rankings; `TRACK1-API-MAP.md`
- Overview map: 63/63 LGU match via `frontend/src/utils/locationNames.js`
- Indicator Report header alignment (Target Pop. spans 2 rows)
- Dev tooling: startup/shutdown scripts, Cursor rules, `track1-verify.ps1`
- **Child Care scope clarified:** 15 FHSIS files total; only File 1 (CPAB/BCG/HepaB) built end-to-end

## What Happens Next
1. `run startup protocols`
2. User picks Lane A / B / C (see session-handoff)
3. Or Track 1 Thursday: RBAC + ICTU deploy prep

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
