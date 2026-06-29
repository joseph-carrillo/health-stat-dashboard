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

## Current focus (as of 2026-06-29)
**Engineering-practices uplift** — adapting proven practices from a sibling production project,
one reversible step at a time (propose → review → approve → build). Owner is a data analyst, not
a coder: write readable code, explain in plain language, be a cold auditor not a yes-man.
**Step C (versioning + changelog) DONE this session** — see below. **Next: step E+G** (move the
hardcoded coverage/alert thresholds in `analytics.py` into a config module, with the first real
tests). Full plan + audit findings in ROADMAP "Engineering-practices uplift" + ADR-011.

The Overview redesign work (prior focus) remains closed out (tip was `6da0943`).

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

## Overview redesign — DONE (2026-06-24)
The redesign loop is complete. Shipped across this session + 2026-06-18:
- Ranking moved to Rankings page; 4 summary cards removed; Rankings broadened via shared
  `overviewIndicators.js`.
- 11-program at-a-glance grid; Child Care card now lists **every** sub-area KPI at once
  (Immunization 10 / Nutrition 11 / Sick 5 / SBI 6), no-data as "—", click-to-drill. Backed by
  batch `GET /api/overview/indicators?codes=…` (replaced the per-sub-area dropdown + 4 single
  `GET /api/overview/indicator` calls; that endpoint still exists/unused by Overview).
- **Maps + Rankings frequency-agnostic:** `resolve_coverage_period()` in `main.py` resolves
  monthly via `month`, quarterly/annual to latest period with data. Endpoints return
  `period_label`/`period_type`; UI shows "Showing: <period>" + disables Month for non-monthly.
- **Needs Attention panel** (`GET /api/overview/needs-attention`): bottom LGUs, over-100% DQC
  flags, stopped-reporting (computed vs **prior period**, not the 66 roster — avoids false alarms
  for province-aggregated indicators).
- Overview header rescoped to whole-page; filters captioned "Map filters"; period in a maps header.
- Config knobs: `OVERVIEW_AREAS` + `PROGRAM_FLAGSHIPS` (`analytics.py`), `CHILD_CARE_SUBAREAS`
  (`overviewIndicators.js`).
**Resume here:** the all-indicators card is Child Care-only by design; extending it to the other
10 programs needs their indicators seeded first.

## Open work (priority order)
**Engineering-practices uplift (active):**
- E+G. **Thresholds → config + first real tests** ← recommended next. Move `NEAR_TARGET=80`,
  `_ON_TARGET=0.95`, `_BELOW_TARGET=0.80` (and the "<80%" / "over-100%" Needs-Attention rules)
  out of `analytics.py` into one config module; ship happy-path + edge tests for the band logic.
- I. CI gate (GitHub Actions: pytest + lint). F. Pin Python deps (exact versions).
- F. Privacy: small-cell suppression (needs owner decision on the cut-off count) + fix
  `SECURITY.md` (claims sensitive = "aggregated totals only"; code does full exclusion — code wins).
- F. Per-indicator data dictionary + provenance doc.

**Product backlog:**
1. Extend the all-indicators card pattern to the other 10 programs — **blocked**: only
   CHILD_CARE has indicators seeded. Seed indicators for the other programs first (#2 below).
2. Seed indicators for the other 10 programs (only CHILD_CARE has them) — then their Overview
   cards stop showing "no data".
3. Investigate **missing Feb FIC** (only Jan FIC landed; Feb File 8 sheet blank or unapproved?)
4. Remaining Immunization files (5–8) — when real data arrives
5. ICTU deployment (pending IT: Linux VM for Docker, SSH vs RDP)
6. Deferred best-practices: fail-fast secrets, bcrypt→argon2, CI, split `main.py` (now ~1300 lines)

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
- **2026-06-29 session:** `ff40ba1` (feat: changelog + version v0.9.0) + the docs(shutdown)
  commit. Also pulled the prior shutdown's housekeeping (`4bdb3f7` untracks settings.local.json,
  `28a0356` working-agreement memory).
- **2026-06-24 session** pushed tip `6da0943`: `41c5bbd` (frequency-agnostic maps/Rankings),
  `8835a3b` (Overview header/filters relabel), `7df2707` (Needs Attention), `6da0943` (Child
  Care all-KPI card).
- `.claude/settings.local.json` is now **gitignored** (untracked, per-machine) — was untracked
  in `4bdb3f7`.

## Local dev
- Stack: `docker compose up -d --build` → frontend `:5173`, backend `:8000/docs`, db `:5432`
- DB: `doh_nir_dashboard` · `doh_admin` / `doh_password_2026`
- Admin login: `admin` / `Admin@2026!`
