# project_state.md

> The single "start cold" snapshot. Kept current by `run shutdown protocols`.

## Phase
**Phase 1 — FHSIS Excel upload → PostgreSQL.** Track 1 (province dashboard) active.
**Go-live track added 2026-07-04:** deployment Steps 1+2 done; Step 3 waits on domain + server.
Phase 2 (web form input) and Track 2 (LGU/barangay) are future.

## ⚠️ STARTUP REMINDER — per-machine DB state (DBs are NOT git-synced)
Each machine has its own Docker DB. After cloning/pulling on a machine:
- **`.env` is gitignored** — if missing, `docker compose` fails ("DB_PASSWORD missing").
  Copy it: `Copy-Item .env.example .env` (template has working local-dev values).
  NOTE (2026-07-04): secrets are now **fail-fast** — the backend refuses to boot without
  `DB_PASSWORD` and `JWT_SECRET_KEY` in the environment. `.env.example` carries dev values.
- **Indicators may be stale.** Fix is idempotent:
  `docker compose exec backend python backend/bootstrap_db.py` → backfills all.
- **pytest/ruff install per-container**: `docker compose exec backend pip install
  pytest==9.1.1 ruff==0.15.20` (requirements-dev.txt is NOT mounted into the container), then
  `docker compose exec backend python -m pytest backend/tests/ -q` (29 tests).
- **Clean slate for testing:** type `reset db protocols` (truncates data, keeps indicators).

## Session 2 (2026-07-04, HOME) — CI check, Feb FIC investigation, foundation docs audit
- **CI confirmed green** for all three morning pushes (`da851f9`, `0edef57`, `f1a0dc6`) plus
  the shutdown commit — checked via GitHub REST API using the stored git credential (no `gh`
  CLI needed; a repeatable no-`gh` method for this machine going forward).
- **Missing Feb FIC investigated — not a bug.** `health_data`, `staging_health_data`, and the
  full `audit_log` (114 events, survives resets) all confirm: no February upload was ever
  attempted for FIC or any other file, on any template. Only Jan (monthly) / Q1 (quarterly) /
  Annual periods exist. **Corrects a memory error**: earlier notes below said this machine's
  DB holds "CPAB (Jan + Feb)" — wrong, there is zero Feb data here. If Joseph has a Feb sheet,
  drop it in and upload; otherwise this is expected (program has only issued Jan so far).
- **Foundation docs audit** (`ca754a1`, pushed): scanned all 12 root docs against actual code/
  DB. Fixed real errors, not just staleness: README/GLOSSARY said the dashboard serves
  **"Region VII / Central Visayas"** — wrong, it's **Negros Island Region (NIR)**; GLOSSARY
  defined **SBI as "Sick/Birth indicator set"** — wrong, it's School-Based Immunization (the
  Td/MR/HPV files already live); CONTRIBUTING told contributors to **branch and never commit
  to main** — the opposite of the locked direct-to-main workflow; CONTRIBUTING/CLAUDE.md/
  README still described **bcrypt, no fail-fast secrets, no CI, `dev`/`dev` login bypass** —
  all closed/removed as of the July 4 morning session. Also fixed stale counts (indicators
  ~43→247, routes ~30→39, `backend/tests/` "empty"→4 modules/29 tests) and prod topology
  (missing Caddy + db-backup sidecar). SECURITY.md/RUNBOOK.md/CHANGELOG.md/ROADMAP.md/
  DECISIONS_LOG.md were already accurate — no changes needed there.
- **Agentic build-loop discussed** (no code/decision yet): Joseph asked whether the workflow
  can shift toward goal→build→validate→loop instead of step-by-step approval. Proposed pilot:
  next program build-out, framed as a goal with a machine-checkable "definition of done"
  (indicator seed count, DQC-clean parse, row count matches sheet, N spot-checked cell values,
  pytest green) — approve the goal once, loop internally until green, surface only the
  finished result for his UI check. Not yet built; would need `adding_templates.md` updated
  with a "definition of done" template when he's ready to try it. See [[working-agreement]].

## Current focus (as of 2026-07-04)
Two parallel tracks:
1. **Go-live (v1.0.0).** `memory-bank/deployment-checklist.md` is the working checklist.
   Steps 1 (hardening) + 2 (deploy infra) DONE and verified end-to-end. Step 3 blocked on:
   Joseph buys the `.com` domain; IT hands over server IP + SSH; confirm ports 80/443.
   Then follow `RUNBOOK.md → Production — server deployment` and tag `v1.0.0`.
2. **Building out the other 10 programs.** Still blocked — no `.xlsx` in any
   `backend/data/<PROGRAM>/` folder. When files land: **one program end-to-end at a time**
   (analyze → seed → configs → validate → dry-run → Joseph tests). Recipe:
   `memory-bank/adding_templates.md`. This is the demo content for the health-professional
   higher-ups; deployment is only the delivery vehicle.

## Shipped 2026-07-04 (HOME machine) — deployment infrastructure
- **Step 1 hardening** (`da851f9`): fail-fast secrets (`app/core/env.py`; also killed a third
  fallback hiding in `seed_indicators.py`), login rate limit 10/min/IP (slowapi,
  X-Forwarded-For-aware), CORS locked (no `*`), nginx security headers, prod healthchecks,
  `test_env.py`. ADR in checklist context.
- **Step 2 deploy infra** (`0edef57`): Caddy auto-TLS (Caddyfile; `SITE_ADDRESS` in .env),
  `db-backup` sidecar (nightly gzipped pg_dump → `./backups`, 30-day retention), CI
  `release-images` job (v* tag → tests → GHCR images), prod compose `image:` + `IMAGE_TAG`
  pull-based deploys, RUNBOOK server guide. **Fixed silently-broken prod image build**
  (`NavBar.jsx`→`Navbar.jsx` case bug) + nginx IPv6/healthcheck gotcha. Verified end-to-end in
  isolated compose project (all healthy, headers via Caddy, logins via port 80). ADR-017.
- **argon2 + fixes** (`f1a0dc6`): argon2id hashing with transparent upgrade-on-login (verified
  live), bootstrap creates argon2, login 503 (not 500) when DB down, SECURITY.md corrected
  (sensitive = full exclusion). `test_password_hashing.py`. ADR-018.
- **Session protocols hardened** (root CLAUDE.md): startup = git sync BEFORE memory reads +
  surface machine-local state; shutdown = machine + verified push + "Machine-local state"
  section mandatory in session-handoff. memory-bank/CLAUDE.md now defers to root.
- **Permissions allowlist** (`.claude/settings.json`, tracked): fewer prompts, Joseph-approved.

## Done (foundation — unchanged, still true)
- Full stack (React 19 + FastAPI + PostgreSQL 15 + Docker) on both machines; prod compose
  now: Caddy → nginx → gunicorn → db (+ db-backup sidecar).
- Reference data: 128 NIR locations, 11 programs, 34 periods. **Indicators: only CHILD_CARE
  seeded (247).** Other 10 programs have 0 indicators (current focus to fix).
- Upload pipeline: validate-first → staging (deltas) → conflict review → approve → commit.
- CHILD_CARE templates live: Immunization File 1 + 4, Nutrition 1–6, Sick 1–3, SBI annual.
  16 configs in `backend/app/services/configs/`.
- Analytics: Home scorecard, Overview (11-program grid + Child Care all-KPI card + Needs
  Attention), Coverage, Rankings, Trends, Indicator Reports, Data Availability, Targets.
- Auth: JWT login (argon2 passwords), RBAC, user/role management, audit logging, rate-limited
  login. CI: pytest (29) + ruff + eslint on every push; GHCR images on version tags.

## Open work (priority order)
1. **Go-live Step 3** (blocked on Joseph/IT): buy domain → DNS → SSH → RUNBOOK deploy →
   smoke test → rotate admin password → tag v1.0.0 (bump package.json, cut changelog).
2. **Per-program build loop** (blocked on Joseph dropping `.xlsx` files). Candidate pilot for
   the agentic goal→build→validate→loop workflow discussed this session — see session log.
3. **Parked decisions** (Joseph, when ready): stash@{0} Overview Card — finish or drop (HOME
   machine only); small-cell suppression cutoff (<5 or <10); data-dictionary draft greenlight.
4. Remaining CHILD_CARE Immunization files 5–8 when real data arrives.
5. Deferred refactors: split `backend/main.py` (~1200 lines) + oversized frontend pages;
   9 cosmetic ESLint warnings.

## Done this session, closed out
- ✅ CI checked green (3 pushes + shutdown commit).
- ✅ Missing Feb FIC — resolved as expected (no upload ever attempted), not a bug.
- ✅ Foundation docs audit shipped (`ca754a1`) — see session log for what was fixed.

## Data currently in DB (this = HOME machine)
Jan 2026 monthly (CPAB/BCG/HepaB, DPT-HiB-HepB, OPV, IPV, PCV, MMR, FIC — 6,072 rows across
92 indicators), Q1 2026 quarterly (Nutrition, Sick — 295 rows/74 indicators), Annual 2026
(Nutrition MAM/SAM, SBI Td/MR/HPV — 396 rows/27 indicators). **No February data of any kind**
(confirmed 2026-07-04 — see session log above; corrects the earlier wrong "CPAB Jan+Feb" note).
CHILD_CARE test data only. NOTE: admin's password hash is now argon2 (upgraded live during testing).

## Git
- Work goes **directly on `main`** (sole developer). Push when done.
- **2026-07-04 session (HOME) pushed:** `da851f9` (hardening), `0edef57` (deploy infra),
  `f1a0dc6` (argon2+fixes), plus this shutdown commit. All verified pushed.
- **⚠️ Both stashes live on the HOME machine** (label corrected 2026-07-04 — earlier notes
  wrongly said office): `stash@{0}` Overview Card WIP (parked, decision pending),
  `stash@{1}` "indicator-reports-area-filter" (unknown provenance, ask Joseph).
  Office machine should be clean at `19d6871` and fast-forwards on next pull.
- `.claude/settings.local.json` gitignored (per-machine); `.claude/settings.json` is tracked.
  Raw `.xlsx` under `backend/data/` gitignored; `./backups/` gitignored.

## Local dev
- Stack: `docker compose up -d` → frontend `:5173`, backend `:8000/docs`, db `:5432`
- DB: `doh_nir_dashboard` · `doh_admin` / `doh_password_2026`
- Admin login: `admin` / `Admin@2026!` (**rotate on production deploy** — it's public in repo)
- Prod parity test: `docker compose -p healthstat-prod -f docker-compose.prod.yml up -d --build`
  (always use `-p` — without it the project name collides with dev).
