# progress.md

## Status: Go-live Steps 1+2 done; Step 3 waits on domain + server; 10 programs wait on files (July 4)

## Latest Session (July 4 — HOME) — Deployment infrastructure (checklist Steps 1+2) + argon2
- Deployment plan locked with IT (self-managed server, SSH, public, `.com` domain) →
  `memory-bank/deployment-checklist.md` created; ADR-017
- Step 1 hardening (`da851f9`): fail-fast secrets, login rate limit (10/min/IP), CORS lock,
  nginx security headers, prod healthchecks; `test_env.py`
- Step 2 infra (`0edef57`): Caddy auto-TLS, nightly pg_dump sidecar → `./backups`,
  CI publishes GHCR images on `v*` tags, RUNBOOK server-deployment guide;
  verified end-to-end in isolated compose project
- Fixed silently-broken prod image build: `NavBar.jsx` → `Navbar.jsx` (Windows case-insensitive
  masked it); nginx IPv6 listener + 127.0.0.1 healthcheck
- argon2 migration with upgrade-on-login (`f1a0dc6`, ADR-018); login 503 when DB down;
  SECURITY.md corrected (sensitive = full exclusion); 29 tests, ruff clean
- Session protocols hardened (git-sync-before-memory, machine-local state tracking);
  machine labels corrected — both stashes live on the HOME machine, not office
- Permissions allowlist added (`.claude/settings.json`, tracked)

## Latest Session (June 17) — Overview at-a-glance (all programs)
- New `analytics.overview_programs(year)` + `GET /api/overview/programs?year=`
- `Overview.jsx`: 11-program performance grid (one card per program), each using that
  program's latest reported period; click a card to drill the map into its flagship
- `PROGRAM_FLAGSHIPS` config (CHILD_CARE→FIC_PCT; others average % indicators)
- Fixed flagship-period selection bug (was picking program-wide latest = Annual SBI)
- Verified Child Care FIC 4.29% (Jan 2026, 66/66) against direct DB AVG

## Status: Track 1 — Nutrition 1–6, Sick 1–3, Immunization 1+4; upload workflow validate-first (June 10)

## Latest Session (June 10) — Upload validate-first + staging cleanup
- Validate Only gates Upload to Staging; no DB writes on dry run
- Staging skips unchanged values; conflicts only on real diffs; PCT ratio-normalized compare
- Batch review: all staged rows API + table; validation preview hidden after stage
- 0÷0 → 0.00%; Upload.jsx parse error fixed
- User testing CPAB re-upload: legacy CPAB_PCT bad values (143% vs 1.44%) — use incoming to fix

## Session (June 9) — Nutrition pipeline + report fixes
- Nutrition Files 1–5 quarterly + File 6 annual (MAM/SAM dual-sheet upload)
- Upload catalog API + refactored Upload page; `uploadPrograms.js` helpers
- Parser: multi-sheet annual, `ensure_period_id`, filename validation
- Indicator Reports: filter layout, annual/MAM-SAM views, computed Total/%, generic NIR rollup
- Percentage display normalized (DB ratio → UI percent); DQC red cells on diarrhea template only
- Management of the Sick configs (vitamin A, diarrhea/pneumonia)
- Debug helper: `backend/scripts/inspect_excel.py`

## Session (June 9 earlier) — Merge + Indicator Reports filter
- Resolved diverged `main` (local office commit + 11 remote laptop commits)
- Kept local: `main.py` (RBAC/audit), `IndicatorReports`, `Management` users/audit, `Home`
- Kept remote: `Overview`, `Coverage`, `Rankings` (multi-indicator, HUC fixes)
- Added province dashboard endpoints to local `main.py` for remote analytics pages
- Indicator Reports: province/HUC highlight + area filter (PSGC prefixes)
- Startup fix: `scripts/sync.ps1`, faster `health-check.ps1`, protocol docs updated

## Session (May 30 — office) — Live Verification + Indicator Reports
- Full local stack verified; File 1 Excel end-to-end (1,386 rows, Jan 2026)
- API-driven Indicator Reports (`/analytics/reports`) — template layout from config JSON
- RBAC on template report endpoints; `display` block in configs
- Bug fixes: `is_computed` column drift, UTF-8 config loading, stale batch cleared

## Session (laptop — remote commits) — File 4 + analytics polish
- Immunization File 4 (DPT-HiB-HepB): `dpt_hib_hepb123.json`, upload + approve + report
- `commit.py`: `force=True` DQC bypass, savepoints on duplicate key
- Overview: multi-indicator dropdown (CPAB, BCG, HepaB, DPT1/2/3 %)
- Coverage/Rankings: `coverage-breakdown` API with province/HUC grouping
- `scripts/start.ps1`, session protocols, `session-handoff.md`

## Completed (foundation)
- Full stack (React + FastAPI + PostgreSQL + Docker) on both machines
- 128 NIR locations, 11 programs, 34 periods, Immunization indicators seeded
- Parser + commit pipeline; JWT auth; DOH branding; Upload with staging/conflicts
- Home scorecard; Targets; Data Availability; Trends (SVG); Management user admin
- `adding_templates.md` recipe for remaining files

## Build Order (Vertical Slice)
1. ✅ Database schema and seed data
2. ✅ Parser File 1 (CPAB/BCG/HepaB) + File 4 (DPT-HiB-HepB)
3. ✅ Commit approval system (incl. force approve)
4. ✅ FastAPI endpoints (~30 incl. province dashboard APIs)
5. ✅ Auth and JWT login
6. ✅ User registration and role management
7. ✅ React frontend with DOH branding
8. ✅ Dashboard pages (Home local; Overview/Coverage/Rankings remote build)
9. ✅ Upload page (dry-run, staging, conflict resolution)
10. ✅ Indicator Reports (API-driven + province filter + computed columns + NIR rollup)
11. 🔄 Child Care templates — Immunization 1+4, Nutrition 1–6, Sick 1–3 (remaining immunization + SBI annual)
12. ⬜ GeoJSON maps in `frontend/public/geojson/`
13. ⬜ ICTU deploy

## Remaining To Verify / Do
- File 6 Nutritional Status upload/approve from Expanded NIR folder (if not completed)
- Drop GeoJSON for Overview choropleths
- Confirm HepaB >24h == HepaB <=24h in File 1 upload
- Next template per `adding_templates.md`

## Pending Team Actions (Template Errors)
- `envi_sanitation_zod_nir.xlsx` — Fix Qtr3 and Qtr4 structure
- `nata_lb_abr_rabr_nir.xlsx` — Add missing ABR <10 column to Q2
- `morta_mmr_imr_nir.xlsx` — Fix col 33 label (d4 → g4)
- `6__pre_gd_screening_nir.xlsx` — Fix col Z formula (g/h → g/a)
- `2_3_Vitamin_A_supplementation_nir.xlsx` — Fix col 11 formula
- infec_schisto files — Fix Qtr1b col D and Qtr1d col J

## Pending Clarifications (Higher Ops)
- BHW ratio, MAM denominator, 8ANC denominator, cervical cancer denominator

## Parked Items
- Morbidity per-LGU/barangay; Animal bites rate; Filariasis MDA; NCD HUC barangays

## Local Database (Development)
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026

## API Credentials (Development)
- Admin: admin / Admin@2026!
- Test: jsmith / Test@2026! (program_manager, CHILD_CARE)
