# activeContext.md

## Current Session Goal
Overview "at a glance": show the performance of every program on one page. Work goes
directly on `main` (sole developer).

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (June 17 — Overview at-a-glance grid)
- Replaced the 4 Child Care sub-area KPI cards on Analytics → Overview with an 11-program
  responsive grid. Each card = one DOH program, showing headline coverage for that program's
  latest reported period in the selected year, status color, reporting count, on/below counts.
- Cards with data are clickable → set the map's indicator to that program's flagship and
  scroll to the map (Tier 2 drill-down).
- Backend: `analytics.overview_programs(year)` + `GET /api/overview/programs?year=`;
  `PROGRAM_FLAGSHIPS` config (CHILD_CARE→FIC_PCT; others average % indicators);
  `_status_for_ratio()` helper.
- Fixed a period-selection bug: latest period is now chosen relative to the flagship
  indicator (was program-wide MAX(period_id), which wrongly picked Annual SBI for Child Care).
- Verified: 11 programs returned; Child Care FIC 4.29% (Jan 2026, 66/66); matches direct DB AVG.

## What Happens Next
1. Phase 2: "Needs attention" panel (bottom LGUs, DQC flags, # not reporting)
2. Confirm flagship KPIs with program team (only CHILD_CARE set so far)
3. Optional: expandable Child Care sub-area detail (old Immunization/Nutrition/Sick/SBI cards)
4. Remaining Immunization files (5–8) when real data arrives

## Daily Startup (two machines)
1. `run startup protocols` OR `.\scripts\sync.ps1` then `.\scripts\start.ps1`
2. Open http://localhost:5173

## API and Frontend Ports
- API: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: admin / Admin@2026!

## Local Database
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026
