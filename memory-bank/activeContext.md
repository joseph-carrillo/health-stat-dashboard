# activeContext.md

## Current Session Goal
Nutrition (Child Care) upload pipeline complete for Files 1–6. Indicator Reports show computed totals, NIR rollup, and MAM/SAM sheet toggle for annual File 6.

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (June 9 — Nutrition + reports)
- **Nutrition configs** — `nut_breastfeeding_lbw`, `nut_vitamin_a`, `nut_mnp`, `nut_lns_sq`, `nut_mam_sam_annual` (+ seed via `seed_indicators.py`)
- **Upload UI** — catalog-driven program/sub-program/file; annual templates show Report Year only; MAM/SAM hint on File 6
- **Parser** — `extra_sheets` (MAM+SAM one upload), `ensure_period_id`, `report_sheets_from_config`
- **Analytics** — annual period SQL (NULL-safe), always `_recompute_row_values`, `sheet_name` param for reports
- **Indicator Reports** — generic NIR synthesis via formulas; Total/% fixed; area filter retained
- **Sick child** — diarrhea/pneumonia + vitamin A templates; DQC highlight on diarrhea template only

## What Happens Next
1. `run startup protocols`
2. Confirm File 6 upload approved in staging if user hasn’t finished
3. SBI (Annual) OR Immunization files 5–8 OR GeoJSON maps

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
