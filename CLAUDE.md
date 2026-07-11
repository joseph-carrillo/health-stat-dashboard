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

## Model & Token Policy (standing instruction, 2026-07-11)

Joseph's usage limit burns fast (a Session-10 build burned heavily in ~30 min). Rules,
every session, until he says otherwise:

- **Main/orchestrator session: Opus 4.8** (Joseph sets it via `/model`; if the session is
  running on something else, remind him at startup).
- **Sub-agents spawned via the Agent tool: always pass `model: "sonnet"` (Sonnet 5).**
  Never spawn sub-agents on Opus, and never spawn them at all unless the task genuinely
  needs one — inline work costs less than a cold agent re-deriving context.
- **Conserve tokens:** read only the file ranges needed (no full re-reads of large files),
  batch independent tool calls, keep narration brief, prefer container-side one-liners over
  multi-step exploration. When a build has many similar units (e.g. many template configs),
  reuse the established pattern instead of re-investigating each one.
- **Commit + push as soon as a unit of work is green** so nothing is stranded if the limit
  hits mid-build; pause and ask before starting the next unit when Joseph has asked for
  check-ins (he did in Session 10: "ping me after each program").

## Session Protocols

Short commands Joseph uses to drive a session. When he types one, follow it exactly.

### `startup protocols`
1. **Sync git FIRST** — `git fetch origin --quiet`, `git status -sb`, `git log --oneline -10`,
   `git stash list`. Joseph works from an office desktop *and* a laptop; if behind origin,
   `git pull --rebase` **before reading any memory-bank file** — memory files are git-synced,
   so reading them pre-pull briefs you from the other machine's past. If the tree is dirty or
   the pull conflicts, stop and show Joseph the state — never improvise a merge.
2. **Surface machine-local state** — everything GitHub does NOT carry between machines:
   uncommitted changes, stash entries, `.xlsx` files present/absent in `backend/data/*/`
   (gitignored), missing `.env`. Compare against the "Machine-local state" section of
   `session-handoff.md`; call out anything this machine has that memory doesn't know about,
   or vice versa.
3. **Load memory** — read `memory-bank/MEMORY.md` (the index), then each linked file
   (`project_state.md`, `activeContext.md`, `progress.md`, `session-handoff.md`).
4. **Bring up the stack** — `docker compose up -d`; wait for `db` healthy
   (`docker compose ps`), then confirm `http://localhost:8000/docs` and `:5173` respond.
   If reference data looks stale (fresh clone, indicator counts off), run
   `docker compose exec backend python backend/bootstrap_db.py` — it's idempotent.
5. **Self-diagnose** — read `ROADMAP.md` and `memory-bank/project_state.md`; cross-reference
   against the git log and the actual file tree. Flag anything marked done that isn't in code.
6. **Brief Joseph** — which machine this is, current phase + status, what was last built (from
   git log, not memory), machine-local state from step 2, open items in priority order with the
   recommended next one highlighted, any blockers. Then ask: "What do you want to tackle?"
   **This is a briefing, not a build trigger — do not build until he responds.**

### `run shutdown protocols`
1. **Sync docs** — update `ROADMAP.md` (mark done milestones, fix stale text); append a new
   ADR to `DECISIONS_LOG.md` if a locked decision changed this session (never edit old ADRs);
   verify every code change shipped this session has a line under `[Unreleased]` in
   `CHANGELOG.md`.
2. **Sync memory** — update `memory-bank/project_state.md` (done / open in priority order /
   branch + push status / anything needed to start cold), plus `activeContext.md` and
   `session-handoff.md`. Add a pointer in `MEMORY.md` for any new memory file.
   `session-handoff.md` must always record: **which machine** (office/laptop), the **pushed
   commit hash**, and a **"Machine-local state" section** listing everything GitHub won't
   sync — uncommitted changes, `git stash list` output, new `.xlsx` files in `backend/data/`,
   `.env` edits. If there is none, write "none". **Nothing machine-local goes unlogged** (the
   2026-07-03 Overview-Card stash went stale precisely because it wasn't logged).
3. **Commit** — shutdown commits are **docs + memory only**. If there are pending *code*
   changes, log them in session-handoff first (step 2), then halt and ask Joseph how to handle
   them. Otherwise commit with `docs(shutdown): sync docs and memory — <date>`.
4. **Push and verify** — `git pull --rebase origin <branch>`, push, then confirm with
   `git status -sb` that local and origin match (no "ahead"). An unpushed shutdown strands the
   session on this machine. Halt and ask on rebase conflicts.
5. **Stop the stack** — `docker compose down`.
6. **Report** — what shipped, commit hash, push **verified**, machine-local leftovers (if any),
   services stopped, top 1–2 next items.

### `reset db protocols`
Wipes uploaded data for a clean testing slate — use when verifying values/bugs from a
known-empty state. **Truncates only `health_data` + `staging_health_data`**; reference data
(locations, indicators, report_periods), users, roles, and `audit_log` are preserved.
1. **Show the damage** — run the row counts for both tables and state exactly how many rows
   will be deleted.
2. **Confirm** — ask Joseph to confirm. **Do not delete anything until he says yes.**
3. **Wipe** — on confirmation, run `.\scripts\reset-db.ps1 -Force` (the script truncates both
   tables with `RESTART IDENTITY`). The stack must be up (`db` container running).
4. **Report** — new row counts (both should be 0) and confirm reference data is intact.

### Other triggers
- `status` / `where are we` — concise: current phase, last milestone, next action, blockers.
- `audit this` — adversarial review; find the flaws, don't praise.
- `go` — the previous proposal is approved; proceed with the build.

## Architecture Overview

This is a **React + FastAPI + PostgreSQL** dashboard for DOH Negros Island Region (NIR) CHD health statistics. The frontend proxies all `/api/*` requests to `localhost:8000` via Vite config — no environment variable needed in dev.

```
health-stat-dashboard/
├── frontend/          # React 19 + Vite + Tailwind CSS 4
│   └── src/
│       ├── App.jsx           # Router — public / protected / admin-only routes
│       ├── services/api.js   # Axios instance; auto-injects Bearer token, handles 401 logout
│       ├── pages/            # One file per page; analytics/ is a sub-folder
│       └── components/       # Navbar (role-aware sidebar), management tabs
├── backend/
│   ├── main.py               # All FastAPI routes (~40 endpoints), DB config, CORS
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
- `locations` (128 rows), `indicators` (247 rows — CHILD_CARE only; the other 10 programs are pending), `report_periods` (34 rows)

To reset/seed the DB from scratch (idempotent — safe to re-run):
```bash
docker compose exec backend python backend/bootstrap_db.py
```

## Data Upload Pipeline

Excel upload → Parse → Stage → Conflict review → Approve → Commit to `health_data`

1. **Parser** (`services/parser.py`): reads a JSON config (`services/configs/`) that maps Excel columns to indicator codes. Stops at blank PSGC. Applies 20+ DQC rules. Computes derived indicators (totals, percentages). Writes to `staging_health_data` with a UUID batch ID.
2. **Conflict detection**: a row conflicts when its `(indicator_id, location_id, period_id)` already exists in `health_data`. Both old and new values are stored in staging.
3. **Commit** (`services/commit.py`): after the user resolves conflicts in the UI, `POST /api/staging/{batch_id}/approve` moves accepted rows to `health_data`.

Adding support for a new Excel template = add a new JSON config file; no parser code changes needed.

## Auth & RBAC

JWT tokens (8-hour expiry; secret from `JWT_SECRET_KEY` env var — fail-fast, no fallback: the app refuses to boot without it, see `backend/app/core/env.py`). Passwords are argon2 (legacy bcrypt upgrades on login); `/api/login` is rate-limited 10/min/IP. Token stored in `localStorage`, decoded client-side in pages via `atob(token.split('.')[1])` for role checks. Server enforces roles via FastAPI dependency injection.

Roles: `admin`, `data_encoder`, `program_manager`, `mancom`, `execom`. Admin-only routes in the frontend are guarded in `App.jsx`; API routes check via the `require_permission` dependency.

## Frontend Conventions

- **Styles**: inline JS objects (`const styles = { ... }` at bottom of each file). No CSS modules or Tailwind utility classes in JSX — Tailwind is imported globally but pages use inline styles.
- **Location order**: `LOCATION_ORDER` array in `IndicatorReport.jsx` defines the fixed display order matching the Excel file. Province headers have `isHeader: true`; child LGUs follow immediately. Filters and subtotals derive from this structure at render time.
- **Tests/CI**: backend has a small pytest suite (`backend/tests/`); CI (`.github/workflows/ci.yml`) runs pytest + ruff + eslint on every push/PR to main.

## Known Gaps

- Test coverage is thin — CI runs pytest + ruff + eslint, but only env, thresholds,
  pct-ratio, and password hashing have real tests so far.
- `backend/main.py` (~1200 lines) and a few frontend pages exceed the 800-line cap and
  should be split.
- (Closed 2026-07-04: fail-fast secrets via `app/core/env.py`; bcrypt→argon2 with
  upgrade-on-login. See CHANGELOG.)
