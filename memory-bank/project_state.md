# project_state.md

> The single "start cold" snapshot. Kept current by `run shutdown protocols`.

## Phase
**Phase 1 — FHSIS Excel upload → PostgreSQL.** Track 1 (province dashboard) active.
**Go-live track added 2026-07-04:** deployment Steps 1+2 done. **Updated 2026-07-06:** domain
purchased + IT has handed over server IP/SSH; the one remaining blocker is IT confirming inbound
ports 80/443. **Target: live within ~2 weeks of 2026-07-06.**
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

## Session 5 (2026-07-06, OFFICE) — Consolidated summary, 2 new skills, Demographics pilot built, go-live update
- **Built the consolidated Joseph-facing summary** (deferred from Session 4):
  `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` — read all 18 per-group write-ups
  and merged into decisions D1–D10, a sensitive-indicator ladder (Tier 1 policy / Tier 2
  recommended / Tier 3 open questions), a DOH-fix list (4 files that block ingestion entirely:
  `ncd_meds_nir.xlsx` Dec sheet, WASH sanitation Q3/Q4, Natality Q2, Filariasis MDA), and an
  11-step build-priority order (HIV-Syphilis-HepaB recommended first for the sensitive-RBAC
  exercise; Morbidity last as its own schema mini-phase).
- **Created two Claude Code skills** (`.claude/skills/analyze-template`,
  `.claude/skills/add-template`) formalizing the read-only inspection recipe and the
  seed→config→validate→dry-run build loop (with a machine-checkable "definition of done" —
  the goal→build→validate→loop pattern discussed 2026-07-04, now actually implemented).
- **Built Demographics end-to-end as the pilot** (chosen for being the single simplest
  remaining program — one file, no time-series, no age brackets): 50 `DEMO_*` indicators
  seeded, `demographics_annual.json` config written (one combined config via `sheet_map` +
  `extra_sheets`, not two separate configs — see ADR-019), config-validated clean via
  `/api/validate-config`, and confirmed live in the browser Upload page (Program → Sub-Program →
  Template all resolve correctly, "Report Year"-only period picker). **Found and fixed a real
  gap the plan missed:** `backend/app/services/upload_catalog.py` has its own hardcoded
  `PROGRAMS` list separate from `frontend/src/services/constants.js` — the Upload page's
  dropdown reads from the former, Indicator Reports from the latter; both needed an entry.
  29/29 backend tests still pass, ruff clean. **Not done:** dry-run parse + cell-value
  spot-check against the real `Demographics_nir.xlsx`, which only exists on the HOME machine —
  genuinely blocked here, not skipped. **All of today's code/config changes are uncommitted**
  pending Joseph's call (see Git section below).
- **Go-live status updated**: domain purchased, IT has handed over server IP + SSH access.
  Only remaining blocker is IT confirming inbound ports 80/443. Joseph is targeting live within
  ~2 weeks of 2026-07-06. `deployment-checklist.md` and `ROADMAP.md` updated accordingly. Server
  prep (RUNBOOK.md "One-time server prep") had not yet started as of this session's end — next
  session's likely first move once domain/IP details are shared in chat.
- **Corrected two stale auto-memory files** (`~/.claude/projects/.../memory/`, separate from
  this git-synced memory-bank): `project_overview.md` said "Region VII" (should be NIR) and
  underclaimed program status; `user_preferences.md` said "full autonomy, fix everything,"
  which now contradicts the locked propose→review→approve→build cadence documented in
  `working-agreement.md`/`activeContext.md`. Both corrected to point at this repo's own
  git-synced docs as the source of truth rather than duplicating them.

## Session 4 (2026-07-05, HOME) — Remaining 6 file-groups analyzed; all 18/18 done
- **Finished the analysis phase started in Session 3.** Analyzed the last 6 sub-groups, biggest
  first per Joseph's instruction, checking his usage % before each launch (no failures this
  time — usage stayed low/moderate throughout): NCD (5 files), Maternal Care Post Partum (3),
  Maternal Care Intra Partum (2), Family Planning (1), Morbidity (1), Geriatric (2) — 14 files,
  18/18 sub-groups now documented in `memory-bank/template_analysis/`. **All Maternal Care
  sub-groups (Prenatal, Post Partum, Intra Partum) are now complete.**
- **Serious new bugs confirmed, not just documentation** (full detail in each file):
  `ncd_meds_nir.xlsx` December sheet has 106 leftover rows of a different region's data, every
  cell `#ERROR!`, shifting real NIR data down 106 rows; the same file's "monthly" sheets are
  year-to-date cumulative (not flow) for risk-assessment columns, verified by hand-tracing
  formulas month-by-month — summing them for rollups would badly overstate. `post_4pnc_nir.xlsx`
  has a previously-undocumented cross-age-bracket formula shift inflating "completed 4PNC"
  totals. `intra_bw_nir.xlsx`'s "Live Births" denominator is self-referential (circular) for 3 of
  5 rows, making its own DQC check tautologically unable to fail, and inflating the regional
  total by exactly 153 (traceable to a real City of Bacolod mismatch). Family Planning's
  workbook stacks all 4 quarters as row-blocks in one tab (not one tab per quarter — a real
  `sheet_map` schema gap), its Annual "Current User Beginning" silently pulls Q4 data instead of
  Q1, and its "Demand Satisfied" KPI is structurally guaranteed to report 0% (denominator
  multiplier never populated, and even fixed would be a circular constant). Morbidity is a
  disease-as-row matrix (306 diseases × 19 ICD-10 chapters as rows, not the location-as-row
  pattern every other file uses) — needs ~10,400 auto-generated indicator codes or a dedicated
  `diseases` table; also confirmed column A hardcoded `'BARMM'` on every row (unrelated region,
  leftover), and the Rate-per-100,000 column is completely non-functional (empty population
  table, `IFERROR` masks it — a disease with 5,560 real cases still shows Rate=0). Geriatric's
  `ncd_geriatric_nir.xlsx` sample data itself violates the exact rule its own dead DQC check was
  built to catch (an "at least one positive" total of 0 next to real per-domain counts of
  24-37) — the clearest live proof yet of the recurring off-by-one DQC-anchor bug (also seen in
  NCD and Post Partum). `ncd_scimmunization_nir.xlsx`'s Influenza% formula divides by the wrong
  population column (confirmed via formula, though this file has zero real test data to verify
  against numerically).
- **New cross-cutting patterns identified:** the off-by-one DQC-anchor bug (rules anchored one
  row past real data, permanently dead) now confirmed in NCD, Post Partum, and Geriatric files.
  A "DQC compares raw ratio to literal 100 instead of 1" scale bug confirmed in Post Partum,
  proven dead on a real >100% row that still reports "No issue." Two more sensitive-indicator
  questions raised (NCD Mental Health mhGAP screening; Morbidity's HIV/syphilis case rows) beyond
  the already-open Leprosy question — CLAUDE.md's sensitive-indicator list may need Joseph's
  expansion, not just HIV/Syphilis reactive tests.
- **Not done this session:** the consolidated Joseph-facing summary (merge all 18 write-ups into
  one report — flagged issues, sensitive-indicator list, build-priority order). Joseph asked to
  do this **next session** instead. No DB/code changes this session — analysis + docs only.

## Session 3 (2026-07-05, HOME) — All 10 programs' files dropped; 12/18 file-groups analyzed
- **Joseph dropped Excel files for all 10 remaining programs at once.** Real scope is far bigger
  than the empty-folder check at session start suggested: **46 files across 18 natural
  sub-groups**, not 7. Three programs (`MATERNAL_CARE`, `INFECTIOUS_DISEASE`, `VITAL_STATS`)
  looked empty at `ls -maxdepth 1` because their files are nested one level deeper in
  sub-category folders (`MATERNAL_CARE/Prenatal|Post Partum|Intra Partum`,
  `INFECTIOUS_DISEASE/Schistosomiasis|Filariasis|HIV-Syphilis-HepaB|Rabies|STH|Leprosy`,
  `VITAL_STATS/Mortality|Natality`) — always `find`/full-tree, not a shallow `ls`, when checking
  these folders again.
- **Analysis phase (read-only, no DB/code changes) 12/18 sub-groups done**, one parallel batch
  then switched to sequential: MATERNAL_CARE/Prenatal (8 files), INFECTIOUS_DISEASE/
  Schistosomiasis (7), Filariasis (3), HIV-Syphilis-HepaB (3, sensitive), Rabies (2), STH (2),
  Leprosy (1), WASH (2), DEMOGRAPHICS (1), ORAL_HEALTH (1), VITAL_STATS/Mortality (1),
  VITAL_STATS/Natality (1). **Remaining 6:** MATERNAL_CARE/Post Partum (3), Intra Partum (2),
  NCD (5), GERIATRIC (2), FAMILY_PLANNING (1), MORBIDITY (1).
- **All 12 write-ups saved to `memory-bank/template_analysis/*.md`** (one file per sub-group,
  same format as `fhsis_template_analysis.md`'s Immunization section) — git-tracked, safe across
  sessions. ⚠️ They were originally written to the session's temp scratchpad directory (not
  git-tracked) by design (Explore sub-agents are read-only, no Write tool) — copied into the repo
  at shutdown. **Next session: confirm this copy-out step already happened (it should have, this
  commit) before trusting `template_analysis/` is complete.**
- **Real bugs/flags found, not just documentation** (full detail in each file): confirmed root
  cause of the pre-flagged `pre_gd_screening_nir.xlsx` denominator bug (positivity % secretly
  divides by *screened count*, not population — label never updated, unlike the sibling Anemia
  file which got the same fix logged); confirmed the pre-flagged `morta_mmr_imr_nir.xlsx` col-33
  mislabel (formula is correct, header text says "d4" instead of "g4") plus two more stale-label
  siblings; confirmed the pre-flagged `nata_lb_abr_rabr_nir.xlsx` Q2 missing-column issue actually
  produces a live `#REF!`→silently-zeroed bug in the Annual rollup, worse than the progress.md
  note implied; Schistosomiasis has the messiest bugs found yet (new Annual-rollup bug skipping
  Q3/double-counting Q4, wrong-numerator bug in 4 files, MDA file has 3 of 4 sub-regions with zero
  data rows); Rabies exposed an architecture gap (parser's `extra_sheets` can't model
  period-varying sub-templates; no DQC rule type for "sum of parts = whole" reconciliation
  checks — both need a parser change, not just config, before those templates can be built).
- **Session/rate-limit lesson learned:** running all 18 analysis sub-agents in parallel burned
  through the session's rate limit — 11 of 18 died mid-run with **no resumability** (a killed
  agent has no checkpoint; retry means starting that sub-group over from scratch). Switched to
  **one file-group at a time, sequential, with Joseph reporting his usage % before each launch**
  (no tool exists to check quota directly) — much safer, no further failures. **Keep this cadence
  next session** until all 18 are done, then merge into a Joseph-facing summary (task #19 in this
  session's — session-scoped — task list, not persisted; recreate the todo/priority list from
  this note and `template_analysis/` file names on resume, don't expect the task list to survive).
- **Still to do before any DB/code changes:** finish the remaining 6 analyses, merge all 18 into
  one cross-program summary for Joseph's review (flagged issues, sensitive-indicator list,
  build-priority order), *then* start Step 1 of `adding_templates.md` (seed indicators) — one
  program at a time, per the existing recipe, only after Joseph reviews the analysis.

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

## Current focus (as of 2026-07-06, end of session 5)
Two parallel tracks:
1. **Go-live (v1.0.0).** `memory-bank/deployment-checklist.md` is the working checklist.
   Steps 1 (hardening) + 2 (deploy infra) DONE and verified end-to-end. **Domain purchased and
   IT has handed over server IP + SSH as of 2026-07-06** — the one remaining blocker is IT
   confirming inbound ports 80/443. Joseph is targeting live within ~2 weeks. Next concrete step:
   server prep (`RUNBOOK.md → Production — server deployment → One-time server prep`) once
   domain/IP are shared in chat — doesn't need to wait on the ports confirmation.
2. **Building out the other 10 programs.** Analysis phase COMPLETE (18/18, Session 3+4) and
   **consolidated into one summary** (Session 5):
   `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` — decisions D1–D10, sensitive-
   indicator ladder, DOH fix list, 11-step build-priority order. **Demographics built as the
   first program (pilot of the new `add-template` skill)** — indicators + config done,
   `formula_type="ratio"` now real (was schema-only before). Blocked only on dry-run testing
   against the real file (HOME machine). Next program per the priority order: HIV-Syphilis-
   HepaB (recommended — smallest clean group, exercises sensitive-data RBAC end-to-end). Recipe:
   `.claude/skills/add-template` (formalizes what was `memory-bank/adding_templates.md`). This is
   the demo content for the health-professional higher-ups; deployment is only the delivery
   vehicle.

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
- Reference data: 128 NIR locations, 11 programs, 34 periods. Indicators: CHILD_CARE (247) +
  DEMOGRAPHICS (50, Session 5, uncommitted on the office machine as of 2026-07-06). Other 9
  programs still have 0 indicators (current focus to fix, per the build-priority order).
- Upload pipeline: validate-first → staging (deltas) → conflict review → approve → commit.
- CHILD_CARE templates live: Immunization File 1 + 4, Nutrition 1–6, Sick 1–3, SBI annual.
  16 configs in `backend/app/services/configs/`, plus `demographics_annual.json` (uncommitted,
  config-validated but not yet dry-run tested against a real file).
- Analytics: Home scorecard, Overview (11-program grid + Child Care all-KPI card + Needs
  Attention), Coverage, Rankings, Trends, Indicator Reports, Data Availability, Targets.
- Auth: JWT login (argon2 passwords), RBAC, user/role management, audit logging, rate-limited
  login. CI: pytest (29) + ruff + eslint on every push; GHCR images on version tags.

## Open work (priority order)
1. **Finish Demographics** — dry-run parse + spot-check the real `Demographics_nir.xlsx`
   (HOME machine only), then decide whether to commit the uncommitted seed/config/upload_catalog
   changes from Session 5 (see Git section).
2. **Go-live Step 3** — domain + SSH already in hand (2026-07-06); waiting on IT to confirm
   ports 80/443. Server prep can start in parallel: RUNBOOK "One-time server prep" → DNS A
   record → deploy → smoke test → rotate admin password → tag v1.0.0. **2-week target.**
3. **Next program per the consolidated summary's build order**: HIV-Syphilis-HepaB
   (recommended — smallest clean group, exercises sensitive-RBAC end-to-end), then WASH water
   file, then Maternal Care. Full 11-step order + per-group blockers/decisions:
   `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` §5. Remaining schema/parser
   decisions (D3–D10, since D1/D2 resolved via Demographics): split-configs for multi-sheet
   workbooks (D3), a new DQC "reconciliation" rule type (D4), per-column rollup override (D5),
   row-stacked-period parsing (D6), Morbidity's disease-as-row schema (D7/D10), sensitive-
   indicator ladder confirmation (D9).
4. **Parked decisions** (Joseph, when ready): stash@{0} Overview Card — finish or drop (HOME
   machine only); small-cell suppression cutoff (<5 or <10); data-dictionary draft greenlight;
   sensitive-indicator list expansion (Tier 2/3 in the consolidated summary §3 — Syphilis-
   treated, Hepatitis B reactive, Morbidity's HIV/syphilis rows, Leprosy, NCD Mental Health).
5. Remaining CHILD_CARE Immunization files 5–8 when real data arrives.
6. Deferred refactors: split `backend/main.py` (~1200 lines) + oversized frontend pages;
   9 cosmetic ESLint warnings.

## Done this session (session 5), closed out
- ✅ Consolidated summary built, 2 new skills created, Demographics pilot built end-to-end
  (indicators + config + validation + UI confirmation) — see Session 5 log above for full detail.
- ✅ Go-live blockers narrowed from 3 to 1 (domain + SSH done; ports pending).

## Data currently in DB (this = HOME machine)
Jan 2026 monthly (CPAB/BCG/HepaB, DPT-HiB-HepB, OPV, IPV, PCV, MMR, FIC — 6,072 rows across
92 indicators), Q1 2026 quarterly (Nutrition, Sick — 295 rows/74 indicators), Annual 2026
(Nutrition MAM/SAM, SBI Td/MR/HPV — 396 rows/27 indicators). **No February data of any kind**
(confirmed 2026-07-04 — see session log above; corrects the earlier wrong "CPAB Jan+Feb" note).
CHILD_CARE test data only. NOTE: admin's password hash is now argon2 (upgraded live during testing).

## Git
- Work goes **directly on `main`** (sole developer). Push when done.
- **2026-07-06 session (OFFICE):** pulled clean to `c2cb1e9` at startup (10 commits behind from
  the 3 HOME sessions on 07-04/07-05). **Uncommitted at end of session** (Joseph said "park
  this" about the Demographics build but didn't confirm commit/hold — asked explicitly, see
  session-handoff.md): `backend/app/core/seed_indicators.py`, `backend/app/services/
  upload_catalog.py`, `frontend/src/services/constants.js` (all modified), plus new files
  `backend/app/services/configs/demographics_annual.json`, `.claude/skills/` (2 skills),
  `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md`, and this session's doc/memory
  sync itself.
- **⚠️ Both stashes live on the HOME machine** (label corrected 2026-07-04): `stash@{0}`
  Overview Card WIP (parked, decision pending), `stash@{1}` "indicator-reports-area-filter"
  (unknown provenance, ask Joseph).
- `.claude/settings.local.json` gitignored (per-machine); `.claude/settings.json` is tracked.
  Raw `.xlsx` under `backend/data/` gitignored; `./backups/` gitignored.

## Local dev
- Stack: `docker compose up -d` → frontend `:5173`, backend `:8000/docs`, db `:5432`
- DB: `doh_nir_dashboard` · `doh_admin` / `doh_password_2026`
- Admin login: `admin` / `Admin@2026!` (**rotate on production deploy** — it's public in repo)
- Prod parity test: `docker compose -p healthstat-prod -f docker-compose.prod.yml up -d --build`
  (always use `-p` — without it the project name collides with dev).
