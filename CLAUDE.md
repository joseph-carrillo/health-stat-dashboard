# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev Stack Startup

Three things must run simultaneously. Start in this order:

```bash
# 1. Database (Docker)
docker-compose up -d

# 2. Backend (from repo root)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# 3. Frontend (separate terminal)
cd frontend && npm run dev
```

Frontend: `http://localhost:5173` — Backend docs: `http://localhost:8000/docs`

**Test credentials:**
- `admin` / `Admin@2026!` — full admin access
- `jsmith` / `Test@2026!` — program_manager, CHILD_CARE program
- `dev` / `dev` — offline dev bypass (no DB needed)

## Architecture Overview

This is a **React + FastAPI + PostgreSQL** dashboard for DOH Region VII health statistics. The frontend proxies all `/api/*` requests to `localhost:8000` via Vite config — no environment variable needed in dev.

```
health-stat-dashboard/
├── frontend/          # React 19 + Vite + Tailwind CSS 4
│   └── src/
│       ├── App.jsx           # Router — public / protected / admin-only routes
│       ├── services/api.js   # Axios instance; auto-injects Bearer token, handles 401 logout
│       ├── pages/            # One file per page; analytics/ is a sub-folder
│       └── components/       # Navbar (role-aware sidebar), management tabs
├── backend/
│   ├── main.py               # All FastAPI routes (~13 endpoints), DB config, CORS
│   └── app/
│       ├── core/             # auth.py (JWT + RBAC), DB seed scripts, schema.sql
│       └── services/
│           ├── parser.py     # Config-driven Excel parser + DQC rules
│           ├── commit.py     # Batch approval, conflict resolution
│           └── configs/      # One JSON per Excel template (cpab_bcg_hepa.json)
└── docker-compose.yml        # PostgreSQL 15, port 5432, volume postgres_data
```

## Database

PostgreSQL 15 via Docker. Connection hardcoded in `backend/main.py`:
- Host: `localhost:5432`, DB: `doh_nir_dashboard`, User: `doh_admin`, Password: `doh_password_2026`

**Schema pattern:** Narrow/tall — one row per (indicator, location, period, value). Key tables:
- `health_data` — production values; unique on `(indicator_id, location_id, period_id)`
- `staging_health_data` — pre-approval staging with conflict tracking
- `locations` (128 rows), `indicators` (43 rows), `report_periods` (34 rows) — all seeded via SQL in `backend/app/core/`

To reset/seed the DB from scratch:
```bash
psql -U doh_admin -d doh_nir_dashboard -f backend/app/core/schema.slq
psql -U doh_admin -d doh_nir_dashboard -f backend/app/core/seed_locations.sql
psql -U doh_admin -d doh_nir_dashboard -f backend/app/core/seed_indicators_immunization.sql
```

## Data Upload Pipeline

Excel upload → Parse → Stage → Conflict review → Approve → Commit to `health_data`

1. **Parser** (`services/parser.py`): reads a JSON config (`services/configs/`) that maps Excel columns to indicator codes. Stops at blank PSGC. Applies 20+ DQC rules. Computes derived indicators (totals, percentages). Writes to `staging_health_data` with a UUID batch ID.
2. **Conflict detection**: a row conflicts when its `(indicator_id, location_id, period_id)` already exists in `health_data`. Both old and new values are stored in staging.
3. **Commit** (`services/commit.py`): after the user resolves conflicts in the UI, `POST /api/staging/{batch_id}/approve` moves accepted rows to `health_data`.

Adding support for a new Excel template = add a new JSON config file; no parser code changes needed.

## Auth & RBAC

JWT tokens (8-hour expiry, secret hardcoded in `backend/app/core/auth.py`). Token stored in `localStorage`, decoded client-side in pages via `atob(token.split('.')[1])` for role checks. Server enforces roles via FastAPI dependency injection.

Roles: `admin`, `data_encoder`, `program_manager`, `mancom`, `execom`. Admin-only routes in the frontend are guarded in `App.jsx`; API routes check via the `require_permission` dependency.

## Frontend Conventions

- **Styles**: inline JS objects (`const styles = { ... }` at bottom of each file). No CSS modules or Tailwind utility classes in JSX — Tailwind is imported globally but pages use inline styles.
- **Location order**: `LOCATION_ORDER` array in `IndicatorReport.jsx` defines the fixed display order matching the Excel file. Province headers have `isHeader: true`; child LGUs follow immediately. Filters and subtotals derive from this structure at render time.
- **No test suite** — backend `tests/` directory exists but is empty.

## Known Gaps

- No `requirements.txt` — backend Python dependencies must be installed manually (fastapi, uvicorn, psycopg2-binary, pandas, openpyxl, python-jose, passlib[bcrypt]).
- Database credentials and JWT secret are hardcoded in source; must be moved to environment variables before production.
- CORS in `main.py` allows all origins (`*`).
