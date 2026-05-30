# activeContext.md

## Current Session Goal (May 30 — DONE)
Live-verified Phase 1 end-to-end on File 1 (CPAB/BCG/HepaB) and added the
Indicator Reports page. The stack runs, a real Excel was uploaded and
committed (1,386 rows, Jan 2026), and the raw "Excel face" view works.

## What Was Just Completed (May 30 — Verification + Indicator Reports)
- Full local stack verified: Postgres (docker `doh_nir_db`), API (uvicorn
  --reload, :8000), frontend (Vite, :5173)
- Real File 1 Excel pushed through the UI: validate -> stage -> approve ->
  commit. 66 LGUs x 21 indicators; computed fields spot-checked correct.
- NEW Indicator Reports page (`/analytics/reports`): committed data shown in
  the exact source-Excel layout (config column order, grouped 2-row headers,
  M/F/Total/% sub-columns, computed columns tinted). Template-driven.
- NEW endpoints: GET /api/templates, GET /api/templates/{id}/report
  (analytics.list_templates / get_template_layout / get_template_report)
- Config supports an optional `display` block (label + id-column headers)
- Fixes: added missing staging_health_data.is_computed to the live DB volume;
  parser.load_config now reads JSON as UTF-8; cleared a stale April-26 batch

## Earlier This Build (Phase 1 Completion)
Backend
- app/core/db.py: env-driven DB config shared by parser/commit/auth/analytics
- app/core/audit.py: audit_log table + write_audit; logged on login, upload,
  approve, conflict-resolve, role assign/deactivate, target edits
- Fixed main.py: imports commit.py functions (staging/approve now work);
  passes user_id from JWT into uploads/approvals
- New reference endpoints: /api/programs, /api/indicators, /api/locations,
  /api/periods; new /api/me
- New aggregates: /api/scorecard, /api/coverage, /api/coverage-detail,
  /api/trend, /api/data-availability; /api/indicators/{id}/target (PATCH)
- Sensitive-indicator RBAC + per-program scoping enforced server-side
- parser.py: dry_run mode + validate_config; /api/validate-config endpoint

Frontend
- services/auth.js (getUser/can/logout), services/constants.js (templates,
  months, status colors), expanded services/api.js
- Login dev bypass removed; stores user + permissions
- Upload.jsx: validate (dry-run) -> upload -> batch review -> resolve
  conflicts -> approve
- Home + Overview wired to live scorecard/coverage (mock data removed)
- Coverage, Trends (SVG LineChart), Rankings built on real endpoints
- Targets (admin editable), DataAvailability matrix, Management (pending
  approvals, users, audit) built
- App.jsx: PermissionRoute guards; /upload route added; Dashboard.jsx deleted

## What Happens Next (Start Here)
Phase 1 is live-verified on File 1. Pick up with:

Step 1 — Start the stack (daily checklist below)
- docker-compose up -d
- uvicorn backend.main:app --reload   (run from repo root)
- cd frontend && npm run dev

Step 2 — Maps (quick win)
- Drop NIR.geojson + HUC.geojson into frontend/public/geojson/ so the Overview
  choropleths render. Everything else already populates from committed data.

Step 3 — Expand templates (the main remaining Phase 1 work: 1 of 63 done)
- Follow memory-bank/adding_templates.md for File 2 onward
- Each new template: seed indicators -> write config JSON (+ optional `display`
  block) -> validate-config -> dry-run upload -> register in constants.js
  TEMPLATES -> it auto-appears in Upload AND Indicator Reports

Step 4 — Team follow-ups
- Confirm HepaB >24h vs <=24h equality seen in the uploaded File 1
- Resolve the pending template errors + denominator clarifications (see progress.md)

## Open Tip For Next Session
- If a NavBar/sidebar edit doesn't show after refresh: it's the Navbar import
  casing (`components/Navbar` vs file `NavBar.jsx`) tripping Vite's cache.
  Restart Vite + delete frontend/node_modules/.vite. (Normalize imports to fix.)

## Daily Startup Checklist
1. git pull origin main
2. Start Docker Desktop
3. docker-compose up -d
4. uvicorn backend.main:app --reload (Terminal 1)
5. cd frontend && npm run dev (Terminal 2 or 3)
6. Open http://localhost:5173

## API and Frontend Ports
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: username=admin, password=Admin@2026!
- Test user: username=jsmith, password=Test@2026! (role=program_manager)

## Local Database
- Host: localhost | Port: 5432
- Database: doh_nir_dashboard
- Username: doh_admin | Password: doh_password_2026

## DOH Branding Reference
- Primary colors: #1F2A45 (Deep Navy), #0B4BAA (Health Blue), #EEFAF6 (Mint Cream)
- Fonts: Montserrat (headings), Barlow (body)
- Logo files in: frontend/public/images/
- Branding memo: DM 2025-0600