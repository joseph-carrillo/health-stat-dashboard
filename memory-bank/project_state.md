# project_state.md

> The single "start cold" snapshot. Kept current by `run shutdown protocols`.

## Phase
**Phase 1 — FHSIS Excel upload → PostgreSQL.** Track 1 (province dashboard) active.
Phase 2 (web form input) and Track 2 (LGU/barangay) are future.

## ⚠️ STARTUP REMINDER — per-machine DB state (DBs are NOT git-synced)
Each machine has its own Docker DB. After cloning/pulling on a machine:
- **`.env` is gitignored** — if missing, `docker compose` fails ("DB_PASSWORD missing").
  Copy it: `Copy-Item .env.example .env` (template has working local-dev values).
- **Indicators may be stale.** Fix is idempotent:
  `docker compose exec backend python backend/bootstrap_db.py` → backfills all.
  (office DB at 247 indicators — all CHILD_CARE — done 2026-06-18).
- **pytest/ruff install per-container.** The dev image doesn't bundle them; CI installs
  from `requirements-dev.txt`. To run tests locally after the stack is up:
  `docker compose exec backend pip install -r requirements-dev.txt` then
  `docker compose exec backend python -m pytest backend/tests/ -q`.
- **Clean slate for testing:** type `reset db protocols` (truncates data, keeps indicators).

## Current focus (as of 2026-07-01)
**PIVOT — building out the other 10 programs.** The engineering-practices uplift is essentially
done this session (see below); the next big thread is **seeding indicators + writing parser
configs for the 10 non-Child-Care programs**, so their Overview cards stop showing "no data".

**The plan Joseph approved:** he drops the real FHSIS Excel files into per-program folders under
`backend/data/<PROGRAM_CODE>/` (already scaffolded this session — see below); then, **one program
at a time, end-to-end**, Claude: analyzes each file column-by-column (into
`fhsis_template_analysis.md`, same rigor as Child Care) → seeds indicators
(`backend/app/core/seed_indicators.py`) → writes JSON config(s)
(`backend/app/services/configs/`) → validates → dry-run parses → hands to Joseph to upload/test.
Recipe: `memory-bank/adding_templates.md`. **Do NOT analyze all 10 at once** — one program fully,
reviewed, before the next. Order: "whichever program's files are ready first."

**Next session first move:** check which `backend/data/<PROGRAM>/` folders now contain `.xlsx`
files (`ls backend/data/*/`), list what's there, confirm the read with Joseph, then start that
program's analysis. If no files dropped yet, Joseph needs to add them first.

## Engineering-practices uplift — DONE this session (2026-07-01)
Adapted from a sibling production project, one reversible step at a time. Shipped:
- **E+G. Thresholds → config + first real tests** (`7f0f547`). New `backend/app/core/thresholds.py`
  (ratio-scale `ON_TARGET_RATIO=0.95`, `NEAR_TARGET_RATIO=0.80`, `OVER_REPORT_RATIO=1.0`), merged
  the two duplicate band-classifier fns into one `status_for`, added `backend/tests/test_thresholds.py`.
  **Fixed a real bug found while consolidating:** Home scorecard compared ratio values against
  percent-scale thresholds → every program showed "Below Target" and Home.jsx rendered "0.77%"
  instead of "77%". Now matches the `value*100` display used by every other page. ADR-012.
- **I. CI gate** (`0196e82`). `.github/workflows/ci.yml`: backend job = pytest + ruff, frontend
  job = eslint. Runs on push/PR to main. ADR-013/015/016.
- **F. Pin Python deps** (`0196e82`). `requirements.txt` now exact `==` (pinned from the running
  container; note this locks `pandas==3.0.3`, already proven). `requirements-dev.txt` adds
  `ruff==0.15.20`, pins `pytest==9.1.1`. ADR-014.
- **Lint cleanup** (`0196e82`). Backend: removed 2 unused imports. Frontend: fixed vite.config.js
  Node-env gap, removed dead imports/vars across ~8 files, disabled 2 React-Compiler-only ESLint
  rules that don't apply (app doesn't use React Compiler). Both lint clean now. ADR-015.
- **Data-folder scaffold** (`8e09a4e`). 10 `backend/data/<PROGRAM_CODE>/` folders + a
  `_PUT_FILES_HERE.txt` note in each (raw `.xlsx` stay gitignored; the `.txt` markers carry the
  folder structure across machines).

## Done (foundation — unchanged, still true)
- Full stack (React 19 + FastAPI + PostgreSQL 15 + Docker) on both machines; prod compose.
- Reference data: 128 NIR locations, 11 programs, 34 periods. **Indicators: only CHILD_CARE
  seeded (247).** Other 10 programs have 0 indicators (this is the current focus to fix).
- Upload pipeline: validate-first → staging (deltas) → conflict review → approve → commit.
- CHILD_CARE templates live: Immunization File 1 + File 4, Nutrition 1–6, Sick 1–3, SBI annual
  (Td/MR/HPV). 16 configs in `backend/app/services/configs/`.
- Analytics: Home scorecard, Overview (11-program grid + Child Care all-KPI card + Needs
  Attention), Coverage, Rankings, Trends, Indicator Reports, Data Availability, Targets.
- Auth: JWT login, RBAC, user/role management, audit logging.
- Foundation docs (root suite + memory-bank), session protocols, versioning/changelog (v0.9.0).

## Open work (priority order)
**Product — building the 10 programs (active, top priority):**
1. **Per-program build loop** (see Current focus). Start with whichever program's `.xlsx` files
   Joseph has dropped into `backend/data/<PROGRAM>/`. One program end-to-end at a time.
2. Extend the Overview all-indicators card pattern to each program once its indicators are seeded
   (currently CHILD_CARE-only by design).
3. Investigate **missing Feb FIC** (only Jan FIC landed; Feb File 8 sheet blank or unapproved?).
4. Remaining Immunization files 5–8 for CHILD_CARE — when real data arrives.

**Engineering-practices uplift — remaining (both BLOCKED on Joseph's decision, not code):**
- **F. Privacy — small-cell suppression.** Needs Joseph's cut-off count (common: <5 or <10) for
  hiding small counts on sensitive indicators (HIV/syphilis reactive). Also fix `SECURITY.md`
  (claims sensitive = "aggregated totals only"; code does full exclusion — code wins).
- **F. Data dictionary + provenance.** Per-indicator numerator/denominator/target; Claude can
  draft from configs but Joseph must review/lock the domain definitions.
- **I2 follow-up (optional):** 9 non-blocking ESLint warnings remain (missing hook deps); not
  errors, CI passes. Clean up someday.

**Deferred best-practices (lower priority):**
- Fail-fast on missing secrets (remove `os.getenv` fallbacks in `db.py`/`auth.py`).
- bcrypt → argon2 migration.
- Split `backend/main.py` (~1259 lines) and oversized frontend pages (>800 lines).

## Data currently in DB (office, last known)
CPAB (Jan + Feb), FIC (Jan only), Mgt of Sick File 2 (Q1, ~4 LGUs). Mostly CHILD_CARE test data.
Other 10 programs: no indicators, no data.

## Git
- Work goes **directly on `main`** (sole developer — no feature branches). Push when done.
- **2026-07-01 session** pushed tip **`8e09a4e`**. New commits this session:
  `7f0f547` (thresholds+Home fix), `0196e82` (CI+deps+lint), `c62f4b5` (docs),
  `8e09a4e` (data-folder scaffold), plus the shutdown docs/memory commit.
- **CI runs for the first time on GitHub now** — check the repo **Actions** tab; both jobs
  (backend pytest+ruff, frontend eslint) verified green locally in clean containers, but confirm
  the first real run passed.
- `.claude/settings.local.json` is gitignored (per-machine). Raw `.xlsx` in `backend/data/` is
  gitignored; only the `_PUT_FILES_HERE.txt` markers are tracked.

## Local dev
- Stack: `docker compose up -d` → frontend `:5173`, backend `:8000/docs`, db `:5432`
- DB: `doh_nir_dashboard` · `doh_admin` / `doh_password_2026`
- Admin login: `admin` / `Admin@2026!`
