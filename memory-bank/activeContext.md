# activeContext.md

## Current Session Goal
Overview redesign + wire the Child Care card. Work goes directly on `main` (sole developer).

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (2026-06-18 — office machine)
- **Startup:** pulled 12 commits from laptop; created missing `.env` from template.
- **Ranking consolidated** onto the Rankings page (removed from Overview); Rankings broadened
  to the full indicator set via shared `overviewIndicators.js` (pct/total/denom per option).
- **Removed the 4 summary cards** from Overview (above the maps).
- **`reset db protocols`** added (`scripts/reset-db.ps1` + CLAUDE.md) — truncates
  health_data + staging only. Ran it (wiped 6192 + 22459 rows).
- **Vite HMR fix** for Docker-on-Windows (`server.watch.usePolling`) — no more manual restarts.
- **Indicator backfill:** office DB was missing 204 indicators (Nutrition/Sick/SBI) →
  `bootstrap_db.py` → now 247.
- **Child Care expandable card:** 4 sub-area mini-cards with UI-selectable KPI dropdowns,
  backed by new `GET /api/overview/indicator` (frequency-agnostic latest-period rollup).
- **Data uploaded for testing:** CPAB Jan+Feb, FIC Jan, Mgt of Sick File 2 (Q1).

## What Happens Next
1. Confirm Child Care sub-area flagship KPIs with the program team.
2. Generalize maps/Rankings beyond monthly so quarterly/annual indicators render.
3. Investigate missing Feb FIC.
4. Relabel Overview filters/subtitle (they only drive the maps now).

## API and Frontend Ports
- API: http://localhost:8000/docs  ·  Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: admin / Admin@2026!

## Local Database
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026
