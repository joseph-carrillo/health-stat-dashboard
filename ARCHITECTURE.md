# Architecture

## Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 | SPA; inline-style convention per page |
| Backend | FastAPI (Python 3.12) | `backend/main.py` — ~30 routes |
| Database | PostgreSQL 15 | narrow/tall schema (see [DATA_MODEL.md](DATA_MODEL.md)) |
| Runtime | Docker Compose | three services: `db`, `backend`, `frontend` |

## Service topology

```
Browser ──> frontend (Vite :5173 dev / nginx :80 prod)
                │  /api/* proxied
                ▼
            backend (FastAPI :8000) ──> db (PostgreSQL :5432)
```

- **Dev:** Vite dev server proxies `/api/*` to the backend (`VITE_PROXY_TARGET`,
  default `http://backend:8000` in compose, `http://localhost:8000` on the host).
- **Prod:** nginx serves the built SPA and reverse-proxies `/api/*` to the backend
  (`frontend/nginx.conf`); the backend runs gunicorn + uvicorn workers.
- Inside the compose network the DB host is `db`; on the host it's `localhost`.

## Request flow (auth)

1. `POST /api/login` → `backend/app/core/auth.py` verifies the password (passlib/bcrypt),
   issues a JWT (HS256, 8-hour expiry).
2. Frontend stores the token in `localStorage`; `services/api.js` (axios) injects it as a
   Bearer header and logs the user out on any 401.
3. Pages decode the token client-side (`atob(token.split('.')[1])`) for role-gated UI.
4. The server enforces roles via the `require_permission` FastAPI dependency — client-side
   checks are convenience only, never the security boundary.

## Data upload pipeline

```
Excel ─> parse (config-driven) ─> stage ─> conflict review ─> approve ─> commit
         services/parser.py        staging_health_data        services/commit.py  health_data
```

1. **Parse** (`backend/app/services/parser.py`): reads a JSON config in
   `services/configs/` mapping Excel columns → indicator codes. Stops at blank PSGC,
   applies 20+ DQC (data quality check) rules, computes derived indicators
   (totals, percentages), and writes rows to `staging_health_data` under a UUID `batch_id`.
   Validation runs first (dry run, no writes); staging only persists new/changed rows.
2. **Conflict detection**: a staged row conflicts when its
   `(indicator_id, location_id, period_id)` already exists in `health_data` with a
   different value. Both existing and incoming values are kept in staging for review.
3. **Commit** (`backend/app/services/commit.py`): after the user resolves conflicts,
   `POST /api/staging/{batch_id}/approve` moves accepted rows into `health_data`.

**Adding a template** = add one JSON config in `services/configs/`. No parser code changes.
See `memory-bank/adding_templates.md`.

## Frontend structure

- `App.jsx` — router: public / protected / admin-only routes.
- `services/api.js` — axios instance (token injection, 401 logout).
- `pages/` — one file per page; `analytics/` sub-folder for dashboards.
- `components/` — role-aware `NavBar`, management tabs, charts.
- `config/` — display templates (`indicatorReportTemplates.js`, `overviewIndicators.js`,
  `uploadPrograms.js`).
- Styling: inline JS style objects per file; Tailwind imported globally but not used as
  utility classes in JSX.

## Backend structure

- `main.py` — all routes, app setup, CORS.
- `app/core/` — `auth.py` (JWT + RBAC), `db.py` (env-driven connection), `audit.py`,
  schema + seed SQL/scripts.
- `app/services/` — `parser.py`, `commit.py`, `analytics.py`, `upload_catalog.py`,
  `configs/` (one JSON per template).

See [DATA_MODEL.md](DATA_MODEL.md) for the schema and [SECURITY.md](SECURITY.md) for the
auth/RBAC and compliance model.
