# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev Stack Startup

The whole stack is containerized — DB, backend, and frontend each run as a service.
Copy the env template once, then bring everything up:

```bash
cp .env.example .env            # first time only; fill in values
docker compose up -d --build    # starts db + backend + frontend
docker compose exec backend python backend/bootstrap_db.py   # first time only: schema + seed + admin
```

Frontend: `http://localhost:5173` — Backend docs: `http://localhost:8000/docs`

```bash
docker compose logs -f backend  # tail logs
docker compose down             # stop everything
```

**Production parity:** `docker compose -f docker-compose.prod.yml up -d --build` runs gunicorn
behind nginx (SPA served on port 80, `/api` proxied to the backend).

Running pieces on the host instead of in containers still works (`uvicorn backend.main:app
--reload` and `cd frontend && npm run dev`) — Vite falls back to `localhost:8000` and the
backend reads the same `.env`.

**Test credentials:**
- `admin` / `Admin@2026!` — full admin access
- `jsmith` / `Test@2026!` — program_manager, CHILD_CARE program
- `dev` / `dev` — offline dev bypass (no DB needed)

## Session Protocols

Short commands Joseph uses to drive a session. When he types one, follow it exactly.

### `startup protocols`
1. **Load memory** — read `memory-bank/MEMORY.md` (the index), then each linked file
   (`project_state.md`, `activeContext.md`, `progress.md`, `session-handoff.md`).
2. **Check git** — `git fetch origin --quiet`, `git status -sb`, `git log --oneline -10`.
   Joseph works from an office desktop *and* a laptop, so if behind origin, `git pull --rebase`
   before any new work.
3. **Bring up the stack** — `docker compose up -d`; wait for `db` healthy
   (`docker compose ps`), then confirm `http://localhost:8000/docs` and `:5173` respond.
4. **Self-diagnose** — read `ROADMAP.md` and `memory-bank/project_state.md`; cross-reference
   against the git log and the actual file tree. Flag anything marked done that isn't in code.
5. **Brief Joseph** — current phase + status, what was last built (from git log, not memory),
   open items in priority order with the recommended next one highlighted, any blockers. Then
   ask: "What do you want to tackle?" **This is a briefing, not a build trigger — do not build
   until he responds.**

### `run shutdown protocols`
1. **Sync docs** — update `ROADMAP.md` (mark done milestones, fix stale text) and append a new
   ADR to `DECISIONS_LOG.md` if a locked decision changed this session (never edit old ADRs).
2. **Sync memory** — update `memory-bank/project_state.md` (done / open in priority order /
   branch + push status / anything needed to start cold), plus `activeContext.md` and
   `session-handoff.md`. Add a pointer in `MEMORY.md` for any new memory file.
3. **Commit** — shutdown commits are **docs + memory only**. If there are pending *code*
   changes, halt and ask Joseph how to handle them. Otherwise commit with
   `docs(shutdown): sync docs and memory — <date>`.
4. **Push** — `git pull --rebase origin <branch>` then push. Halt and ask on rebase conflicts.
5. **Stop the stack** — `docker compose down`.
6. **Report** — what shipped, commit hash, push status, services stopped, top 1–2 next items.

### Other triggers
- `status` / `where are we` — concise: current phase, last milestone, next action, blockers.
- `audit this` — adversarial review; find the flaws, don't praise.
- `go` — the previous proposal is approved; proceed with the build.

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

PostgreSQL 15 via Docker. Connection config lives in `backend/app/core/db.py`, read from
environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) with local
dev fallbacks. Compose injects them from `.env`; inside the network the host is `db`.

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

- Secrets are env-driven (`.env`) but `db.py`/`auth.py` still keep insecure dev *fallbacks*;
  production should fail-fast on missing env (tracked as a follow-up, not yet done).
- Password hashing is bcrypt; Sentinel-FMS uses argon2 — not yet migrated.
- No automated tests — backend `tests/` directory exists but is empty; no CI yet.
- `backend/main.py` (1100+ lines) and a few frontend pages exceed the 800-line cap and
  should be split.
