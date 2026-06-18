# session-handoff.md

## Last Updated
2026-06-18 (Overview redesign + Child Care expandable sub-area card)

## Current Objective
Track 1 province dashboard. Overview now leads with the 11-program grid; Child Care expands
into 4 selectable sub-area KPIs. Ranking lives on the Rankings page only.

## Done This Session
- Ranking moved Overview → Rankings; Rankings broadened to full indicator set (shared config).
- Removed Overview's 4 summary cards.
- `reset db protocols` + `scripts/reset-db.ps1` (data-only wipe); ran it.
- Vite HMR fix for Docker-on-Windows (usePolling).
- Backfilled office DB indicators (43 → 247) via `bootstrap_db.py`.
- Child Care expandable card: 4 sub-area mini-cards, per-area KPI dropdown, new
  `GET /api/overview/indicator` (frequency-agnostic).
- Uploaded test data: CPAB Jan+Feb, FIC Jan, Sick File 2 (Q1).

## Next Session — Pick One
1. Confirm Child Care sub-area flagship KPIs with the program team.
2. Generalize maps + Rankings beyond `period_type='monthly'` (quarterly/annual support).
3. Investigate missing Feb FIC (only Jan landed).
4. Relabel Overview filters as map-scoped + rewrite the subtitle (whole-page scope).

## Notes / Gotchas
- DBs are NOT git-synced. New machine: copy `.env`, run `bootstrap_db.py`, then upload data.
- Maps/Rankings use monthly-only endpoints; quarterly/annual indicators won't render there yet
  (the Child Care sub-area cards use the new frequency-agnostic endpoint and are fine).
- `OVERVIEW_AREAS` + `PROGRAM_FLAGSHIPS` (analytics.py) + `CHILD_CARE_SUBAREAS`
  (overviewIndicators.js) are where sub-area/flagship KPIs are configured.
- Only CHILD_CARE has indicators seeded; the other 10 program cards show "no data".

## First Command Next Session
```
run startup protocols
```
