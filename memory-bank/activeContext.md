# activeContext.md

## Current Session Goal
Close out the Overview redesign. Work goes directly on `main` (sole developer).

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (2026-06-24 — office machine)
- **Maps + Rankings frequency-agnostic:** `resolve_coverage_period()` (`main.py`) — monthly uses
  `month`, quarterly/annual resolve to latest period with data. `coverage-summary` /
  `coverage-breakdown` return `period_label`/`period_type`; UI shows "Showing: <period>" and
  disables the Month dropdown for non-monthly indicators.
- **Overview header rescoped** to the whole page; filters captioned "Map filters"; selected
  indicator + period moved to a header above the maps.
- **"Needs Attention" panel** (`GET /api/overview/needs-attention`): bottom LGUs (<80%),
  over-100% DQC flags, stopped-reporting (vs **prior period**, not the 66 roster).
- **Child Care card lists every sub-area KPI** (no dropdown), no-data as "—", click-to-drill.
  New batch `GET /api/overview/indicators?codes=…`. Child Care only — other 10 programs unchanged.
- All pushed to `origin/main`, tip `6da0943`.

## What Happens Next
1. Seed indicators for the other 10 programs (only CHILD_CARE has them) → then extend the
   all-indicators card pattern to those programs.
2. Investigate missing Feb FIC (only Jan landed).

## API and Frontend Ports
- API: http://localhost:8000/docs  ·  Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: admin / Admin@2026!

## Local Database
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026
