# activeContext.md

## Current Session Goal
Upload workflow hardened: validate-first, staging only deltas, smarter conflict detection, clearer batch review UI.

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (June 10 — Upload workflow)
- Validate Only required before Upload to Staging; `can_stage` flag from API
- Parser skips unchanged committed values; `rows_skipped_unchanged` in response
- `_staging_values_match` with `_PCT` ratio normalization
- `GET /api/staging/{batch_id}/rows` — full staged list in Upload batch review
- Validation preview clears when batch is staged
- Zero-division percent fix (0/0 → 0.00%)

## What Happens Next
1. `run startup protocols`
2. Continue Immunization uploads using validate → stage → approve
3. Fix legacy bad CPAB_PCT rows by approving incoming values where conflicts appear

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
