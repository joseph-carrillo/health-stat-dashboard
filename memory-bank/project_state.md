# project_state.md

> The single "start cold" snapshot. Kept current by `run shutdown protocols`.

## Phase
**Phase 1 — FHSIS Excel upload → PostgreSQL.** Track 1 (province dashboard) active.
Phase 2 (web form input) and Track 2 (LGU/barangay) are future.

## ⚠️ STARTUP REMINDER — per-machine DB state (DBs are NOT git-synced)
Each machine has its own Docker DB. After cloning/pulling on a machine:
- **`.env` is gitignored** — if missing, `docker compose` fails ("DB_PASSWORD missing").
  Copy it: `Copy-Item .env.example .env` (template has working local-dev values).
- **Indicators may be stale.** The office DB was seeded before the Nutrition/Sick/SBI
  templates existed (had only 43 immunization indicators). Fix is idempotent:
  `docker compose exec backend python backend/bootstrap_db.py` → backfills all
  (office DB now at **247 indicators**, done 2026-06-18).
- **Birth-dose 100× fix:** office DB audit reports clean (section [3] none) — not needed here.
  Laptop DB fixed 2026-06-17. Verify any machine with `backend/scripts/audit_data_quality.py`.
- **Clean slate for testing:** type `reset db protocols` (truncates data, keeps indicators).

## Current focus (as of 2026-06-18)
Overview redesign + Child Care wiring. Ranking consolidated to the Rankings page; Overview
summary cards removed; Child Care card now expands into 4 selectable sub-area KPIs. Next:
confirm sub-area flagship KPIs with the program team and upload remaining Child Care files.

## Done
- Full stack (React 19 + FastAPI + PostgreSQL 15) working on both machines
- Reference data seeded: 128 NIR locations, 11 programs, 34 periods, immunization + nutrition indicators
- Upload pipeline: validate-first → staging (deltas only) → conflict review → approve → commit
- Templates live: Immunization File 1 (CPAB/BCG/HepaB) + File 4 (DPT-HiB-HepB), Nutrition 1–6, Sick 1–3
- Analytics: Home scorecard, Overview, Coverage, Rankings, Trends, Indicator Reports (API-driven), Data Availability, Targets
- Auth: JWT login, RBAC, user/role management, audit logging
- **Containerization (this session):** backend + frontend Dockerfiles, full dev `docker-compose.yml`,
  `docker-compose.prod.yml`, `.env`/`.env.example`, env-driven CORS
- **Foundation docs (this session):** root doc suite + memory-bank index + project_state
- **Birth-dose % fix (this session):** recomputed File 1 CPAB/BCG/HepaB percentages stored 100×
  too large (244 rows, audit-logged); shipped `audit_data_quality.py` + `fix_birthdose_pct.py`
  + first pytest suite (9 tests). Applied on laptop DB; office DB pending (see reminder above).

## Overview redesign — status (2026-06-18)
**Done this session:**
- Removed the duplicate LGU **ranking** and the **4 summary cards** from Overview.
- **Rankings page** broadened to the full indicator set via shared `overviewIndicators.js`
  (each option carries pct/total/denom codes; grouped `<optgroup>` selector).
- **Child Care card is now expandable** → 4 sub-area mini-cards (Immunization / Nutrition /
  Mgt of Sick / SBI), each with a **UI dropdown to pick the KPI** (defaults = flagships:
  FIC / MAM cure / Pneumonia abx / HPV1). Big % drills the map.
- New backend `analytics.indicator_overview()` + `GET /api/overview/indicator?indicator_code=&year=`
  — frequency-agnostic, resolves each indicator's latest reported period (monthly/quarterly/annual).
- Old `overview_summary()` / `/api/overview/summary` (4-area) still present but unused by UI.
**Next session (resume here):**
1. **Confirm sub-area flagship KPIs** with the program team (Nutrition/Sick/SBI defaults are
   first-pass; `OVERVIEW_AREAS` + `PROGRAM_FLAGSHIPS` in `analytics.py`).
2. **Maps are monthly-only** (`coverage-summary`/`coverage-breakdown` filter `period_type='monthly'`)
   — generalize so drilling/Rankings work for quarterly/annual indicators.
3. Overview filters + subtitle now only describe the maps — relabel as "Map filters" / rewrite subtitle.
4. "Needs attention" panel (bottom LGUs, DQC flags, # not reporting).
5. Seed indicators for the other 10 programs (only CHILD_CARE has indicators).

## Open work (priority order)
1. Finish Overview redesign (see status above) + confirm Child Care sub-area KPIs
2. Investigate **missing Feb FIC** (only Jan FIC landed; Feb File 8 sheet blank or unapproved?)
3. Remaining Immunization files (5–8) — when real data arrives
4. ICTU deployment (pending IT: Linux VM for Docker, SSH vs RDP)
5. Deferred best-practices: fail-fast secrets, bcrypt→argon2, CI

## Data currently in DB (office, 2026-06-18)
CPAB (Jan + Feb), FIC (Jan only), Mgt of Sick File 2 (Q1, ~4 LGUs). Everything else empty
(DB was wiped this session via `reset db protocols`, then re-uploaded for Child Care testing).

## Deferred best-practices (next foundation pass)
- Fail-fast on missing secrets (remove `os.getenv` fallbacks in `db.py`/`auth.py`)
- bcrypt → argon2 migration
- ruff/mypy/pytest tooling + GitHub Actions CI
- Split `backend/main.py` (1100+ lines) and oversized frontend pages (>800 lines)

## Git
- Work goes **directly on `main`** (sole developer — no feature branches). Push when done.
- Pulled 12 commits from laptop at session start (`29bcf8b` docs shutdown was tip).
- **2026-06-18 session code changes** (Rankings/Overview/config/analytics/main/vite +
  `scripts/reset-db.ps1`) committed at shutdown — see latest commit hash on `main`.

## Local dev
- Stack: `docker compose up -d --build` → frontend `:5173`, backend `:8000/docs`, db `:5432`
- DB: `doh_nir_dashboard` · `doh_admin` / `doh_password_2026`
- Admin login: `admin` / `Admin@2026!`
