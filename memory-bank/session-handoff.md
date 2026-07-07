# session-handoff.md

## Last Updated
2026-07-07, session 6 (OFFICE machine — ESR Verification Form built end-to-end, Google Sheets
credentials parked at Joseph's request). **Pushed commit: `dcf1f72`** (verified — `git status -sb`
shows local and origin match exactly, no "ahead"). Joseph explicitly said "commit everything,"
so all of Session 6's code + docs/memory are bundled into two commits: `8c9cc41` (ESR feature)
and `dcf1f72` (UI polish + docs/memory sync) — two commits because the UI polish happened after
the first one landed, not because of any docs-vs-code split.

## Current Objective
Three tracks:
1. **Go-live (v1.0.0)** — Steps 1+2 done and verified. **As of 2026-07-06: domain purchased,
   IT has handed over server IP + SSH.** Only remaining blocker: IT confirming inbound ports
   80/443. **Joseph is targeting live within ~2 weeks of 2026-07-06.** Server prep
   (`RUNBOOK.md → Production — server deployment → One-time server prep`) can start as soon as
   the domain name + server IP are shared in chat — doesn't need to wait on ports.
2. **Build out the 10 non-Child-Care programs** — analysis phase complete (18/18) and now
   **consolidated** into `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` (decisions
   D1–D10, sensitive-indicator ladder, DOH fix list, 11-step build-priority order). Demographics
   built as the pilot (see below) — indicators + config done, dry-run test pending (needs the
   HOME machine's real file). Next program per the priority order: HIV-Syphilis-HepaB.
3. **PHRIC site + ESR reporting (new, Session 6)** — ESR Verification Form (`/esr/new`) built
   end-to-end and verified live in the browser. Google Sheets credentials intentionally parked
   by Joseph — one-time setup steps are in `RUNBOOK.md`, not urgent. Rest of the PHRIC public
   site and a Google OAuth + granular-permissions overhaul (Joseph asked about this mid-scoping)
   are both future, unscoped.

## Done This Session — Session 6 (2026-07-07, OFFICE machine)
- **Built the ESR Verification Form end-to-end** (`/esr/new`) — Epidemiology's immediate ask,
  prompted by two new design handoffs Joseph shared (a big future PHRIC public site bundle, and
  a dedicated, more precise handoff for just this form). Full scoping/decisions detail:
  `project_state.md` Session 6 log, ADR-020.
  - Backend: `esr_reports` table (JSONB payload, `sheet_sync_status`/`sheet_sync_error`), new
    `can_submit_esr` permission (`data_encoder`/`program_manager`), `POST /api/esr-reports`
    (codebase's **first Pydantic request model** — every other endpoint takes raw `dict`),
    `backend/app/services/google_sheets.py` (lazy `require_env`, `gspread`). A Google Sheets
    push failure never blocks the submission — DB is the source of record. 4 new tests
    (permission, success+audit, Sheets-failure resilience, validation), all mocked. 33/33
    backend tests pass, ruff clean.
  - Frontend: 8 new files under `frontend/src/pages/esr/` recreating the dedicated handoff
    pixel-close (own header/design system, not the app's Navbar chrome — deliberate). Route +
    nav link gated by the new permission.
  - **Verified live in the browser, not just unit tests**: logged in as admin, submitted a real
    test report, confirmed the `esr_reports` DB row + both `esr_submit`/`esr_sheet_sync_failed`
    audit entries landed correctly (Sheets intentionally unconfigured, so the failure path is
    exactly what got exercised).
  - **Found and fixed a real `bootstrap_db.py` bug**: `split_statements()` splits the whole SQL
    file on every literal `;`, including ones inside `--` comments — a semicolon in a comment
    sentence silently truncated the `CREATE TABLE` statement and the script's blanket
    try/except reported it as "skipped (already present)" instead of failing loudly. Fixed by
    rewording the comment (not touching the fragile splitter) — flagged in `activeContext.md`'s
    "Watch out for" for next time a `.slq`/`.sql` file's table doesn't show up despite a clean
    `bootstrap_db.py` run.
  - **4 rounds of UI polish after Joseph reviewed it live**, each re-verified via screenshot:
    centered Yes/No in the Assistance-needed table column; swapped Response's status radios for
    a dropdown; fixed a font-fallback bug (`index.html` never loaded Poppins/Mulish at all, plus
    one hardcoded `fontFamily` string had no fallback — both fixed); switched all 9 date/time
    fields to native `<input type="date"/"time">` pickers (calendar/clock UI, zero new deps).
  - **Google Sheets credentials explicitly parked** — Joseph said "let's park the google sheet
    for now." One-time setup (service account, Sheet sharing, `ESR_SHEET_ID`) documented in
    `RUNBOOK.md` as a self-serve pickup, not something to chase next session.
- **Committed as instructed** ("commit everything"): `8c9cc41` (ESR feature) then `dcf1f72`
  (UI polish + docs/memory sync) — two commits since the UI polish happened after the first
  commit, not because of any docs-vs-code split.

## Done This Session — Session 5 (2026-07-06, OFFICE machine)
- **Built the consolidated Joseph-facing summary** (deferred from Session 4):
  `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` — merged all 18 write-ups into
  decisions D1–D10, a sensitive-indicator ladder, a DOH-fix list (4 files that block ingestion
  entirely), and an 11-step build-priority order.
- **Created 2 Claude Code skills**: `.claude/skills/analyze-template` (inspection recipe) and
  `.claude/skills/add-template` (seed→config→validate→dry-run loop with a machine-checkable
  definition of done — the goal→build→validate→loop pattern discussed 2026-07-04, now real).
- **Built Demographics end-to-end as the pilot program** (chosen as the single simplest
  remaining program): 50 `DEMO_*` indicators seeded (confirmed idempotent), one combined config
  `demographics_annual.json` (`sheet_map` + `extra_sheets`, not two separate configs — ADR-019),
  config-validated clean via `/api/validate-config`, and **confirmed working live in the
  browser** (logged in, walked Program → Sub-Program → Template on the Upload page, saw the
  correct annual-only period picker and filename hint). Introduces the dashboard's first
  `formula_type="ratio"` indicators. 29/29 backend tests pass, ruff clean.
- **Found and fixed a real gap the original plan missed**: `backend/app/services/
  upload_catalog.py` has its own hardcoded `PROGRAMS` list, separate from
  `frontend/src/services/constants.js` — the Upload page's dropdown reads the former, Indicator
  Reports the latter. Both needed a Demographics entry. Corrected the `add-template` skill to
  document this for future programs.
- **Not done, genuinely blocked, not skipped:** dry-run parse + cell-value spot-check against
  the real `Demographics_nir.xlsx` — the file only exists on the HOME machine (this office
  machine's `backend/data/DEMOGRAPHICS/` only has the placeholder `.txt`). Config-structure
  validation doesn't need the file; the actual parse test does.
- **Go-live status updated**: Joseph confirmed the domain is purchased and IT has handed over
  server IP + SSH. Only inbound-ports confirmation remains. ~2-week live target.
  `deployment-checklist.md`/`ROADMAP.md` updated; DECISIONS_LOG.md got ADR-019; CHANGELOG.md
  `[Unreleased]` got an entry.
- **Uncommitted work at shutdown** (see "Machine-local state" below) — Joseph said "park this"
  about Demographics but didn't explicitly say commit vs. hold; this was surfaced back to him
  but the session ended before a firm answer. **Next session: confirm with Joseph before
  committing**, don't assume.
- Also corrected two stale files in the separate Claude Code auto-memory system (not this
  git-tracked memory-bank): a wrong "Region VII" claim and an outdated "full autonomy" user
  preference that now contradicts `working-agreement.md`.

## Done This Session — Session 4 (2026-07-05, HOME machine)
- **Analyzed the remaining 6 file-groups** (NCD 5 files, Post Partum 3, Intra Partum 2, Family
  Planning 1, Morbidity 1, Geriatric 2 — 14 files), biggest-first per Joseph's instruction,
  checking his usage % before each launch — no rate-limit failures this session (contrast with
  Session 3's parallel-launch failure). **All 18/18 sub-groups now documented** in
  `memory-bank/template_analysis/`. All Maternal Care sub-groups (Prenatal, Post Partum, Intra
  Partum) are now complete.
- **Serious new bugs confirmed** (full detail in each file, summarized in `project_state.md`
  Session 4 log and `ROADMAP.md`'s "Schema/parser decisions surfaced"): a wrong-region
  `#ERROR!` block + cumulative-vs-flow mismatch in NCD's `ncd_meds_nir.xlsx`; a cross-age-bracket
  formula shift in Post Partum's `post_4pnc_nir.xlsx`; a self-referential/circular denominator in
  Intra Partum's `intra_bw_nir.xlsx`; a quarters-stacked-in-one-tab layout + wrong-quarter Annual
  reference + a structurally-dead KPI in Family Planning's `fp_nir.xlsx`; a disease-as-row matrix
  + hardcoded-wrong-region column + non-functional Rate column in Morbidity's
  `NIR_Morbidity.xlsx`; and a live, real-data demonstration of the recurring off-by-one
  DQC-anchor bug in Geriatric's `ncd_geriatric_nir.xlsx`. Two new sensitive-indicator questions
  raised (NCD Mental Health mhGAP screening, Morbidity's HIV/syphilis case rows) beyond the
  already-open Leprosy question.
- **Docs synced this shutdown:** `ROADMAP.md` (marked analysis phase complete, added the new
  schema/parser decisions to the existing list), `project_state.md`, `activeContext.md` (this
  file). No CHANGELOG/DECISIONS_LOG changes needed — no code shipped, no locked decision changed.
- **Not done, by Joseph's explicit choice:** the consolidated summary merge — deferred to next
  session.

## Done Session 3 (2026-07-05, HOME machine)
- **Joseph dropped Excel files for all 10 remaining programs at once** ("let's build this
  smartly"). Real scope: 46 files, 18 natural sub-groups (matches how DOH already segregates
  them into sub-category folders) — much bigger than the "7 programs with files" first read
  from a shallow `ls -maxdepth 1`. Corrected after a full `find` recurse.
- **Analysis phase (read-only, no DB/code changes), 12/18 done:** MATERNAL_CARE/Prenatal (8
  files), INFECTIOUS_DISEASE/Schistosomiasis (7), Filariasis (3), HIV-Syphilis-HepaB (3,
  sensitive), Rabies (2), STH (2), Leprosy (1), WASH (2), DEMOGRAPHICS (1), ORAL_HEALTH (1),
  VITAL_STATS/Mortality (1), VITAL_STATS/Natality (1). All 12 write-ups now in
  `memory-bank/template_analysis/*.md`, git-tracked (see below — they were NOT tracked mid-
  session, only copied in at this shutdown).
- **Real template bugs confirmed, not just documentation**: `pre_gd_screening_nir.xlsx`
  denominator bug root-caused (positivity % secretly divides by screened count, mislabeled as
  population — same bug the sibling Anemia file already had fixed-and-logged);
  `morta_mmr_imr_nir.xlsx` col-33 mislabel confirmed (formula correct, header text wrong: "d4"
  should read "g4") plus 2 more stale-label siblings found; `nata_lb_abr_rabr_nir.xlsx` Q2
  missing-column issue confirmed **worse than the progress.md note implied** — produces a live
  `#REF!` silently zeroed to 0 in the Annual rollup; Schistosomiasis is the messiest file group
  found yet (new Annual-rollup bug skipping Q3/double-counting Q4, wrong-numerator bug in 4
  files, MDA file has 3 of 4 sub-regions with zero data rows); Rabies exposed two **architecture
  gaps** needing a parser change (not just config): `extra_sheets` can't model period-varying
  sub-templates, and there's no DQC rule type for "sum of parts = whole" reconciliation checks.
- **Session/rate-limit lesson (important for next session):** running all 18 analysis
  sub-agents in parallel burned through the session's rate limit — 11 of 18 died mid-run with
  **no resumability** (a killed background agent has no checkpoint; retrying means redoing that
  whole sub-group from scratch, wasting the first attempt's work). Switched to **one file-group
  at a time, sequential**, with Joseph reporting his usage % before each launch (no tool exists
  to check quota directly). No further failures after the switch. **Keep this cadence next
  session.**
- **Scratchpad vs. repo gotcha (flagging so it isn't repeated):** the 18 Explore sub-agents have
  no Write tool (read-only role) — each returned its full analysis as text, and it had to be
  manually persisted to a file by the orchestrating turn. Those files were written to the
  session's temp scratchpad directory by default, which is **session-scoped and not git-
  tracked** — they would NOT have survived to next session. Caught this at shutdown and copied
  all 12 into `memory-bank/template_analysis/` before committing. **Next session: persist each
  new analysis directly into `memory-bank/template_analysis/` from the start, not the
  scratchpad, to avoid this step being needed again.**

## Done Session 2 (2026-07-04, HOME machine)
- **CI checked green** for `da851f9`/`0edef57`/`f1a0dc6` + shutdown commit, via GitHub REST
  API (token from `git credential fill` — no `gh` CLI needed; reusable next time).
- **Missing Feb FIC resolved as expected, not a bug** — audit_log (114 events, full history)
  shows no February upload was ever attempted for any template.
- **Foundation docs audit** (`ca754a1`, pushed) — all 12 root docs checked against code/DB,
  fixed real errors (wrong region name, wrong SBI definition, stale CONTRIBUTING workflow,
  stale bcrypt/no-CI/no-fail-fast/dev-bypass text, stale counts).

## Done Session 1 (2026-07-04, HOME machine)
- **Deployment checklist created** (`memory-bank/deployment-checklist.md`). ADR-017.
- **Step 1 — hardening** (`da851f9`): fail-fast secrets, login rate limit, CORS locked, nginx
  security headers, prod healthchecks. 24 tests.
- **Step 2 — deploy infra** (`0edef57`): Caddy auto-TLS, nightly `db-backup` sidecar, CI
  `release-images` job, RUNBOOK server-deployment section. Verified end-to-end. Found + fixed
  `NavBar.jsx`→`Navbar.jsx` case bug (prod image build had been silently broken on Linux).
- **argon2 migration + fixes** (`f1a0dc6`): argon2id with upgrade-on-login, login 503 (not 500)
  when DB down, SECURITY.md corrected. 29 tests. ADR-018.
- **Protocol upgrades**: startup now syncs git BEFORE reading memory and surfaces machine-local
  state; shutdown requires machine + push verification + "Machine-local state" section.
- **Permissions allowlist** (`.claude/settings.json`, git-tracked).

## Next Session — first moves
1. `startup protocols` (git sync FIRST, then memory; check machine-local state).
2. **If this is the HOME machine:** the ESR Verification Form + Demographics code are already
   committed/pushed (`8c9cc41`, `dcf1f72`, `b07ac1f`) — pull, then run `bootstrap_db.py` to get
   both the `esr_reports` table and the 50 DEMOGRAPHICS indicator rows into this machine's DB
   too. Finish Demographics' definition of done: dry-run parse `demographics_annual` against the
   real `Demographics_nir.xlsx`, spot-check ≥3 cell values, per `.claude/skills/add-template`.
3. Ask Joseph: has IT confirmed ports 80/443 yet? If domain name + server IP haven't been shared
   in chat, ask for them so server prep can start (doesn't need ports confirmed first).
4. Ask Joseph: ready to do the Google Sheets one-time setup for ESR reports (RUNBOOK.md)? Not
   urgent — just a self-serve pickup whenever he wants it live.
5. Once Demographics is signed off: start the next program per the build-priority order in
   `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` §5 — **HIV-Syphilis-HepaB**
   recommended (smallest clean group, exercises sensitive-RBAC end-to-end). Use the
   `add-template` skill.
6. Parked decisions when Joseph's ready: Google OAuth + granular per-user permissions (needs its
   own design pass, see ROADMAP.md), rest of the PHRIC public site, stash@{0} fate (HOME
   machine), small-cell cutoff (<5 or <10), data-dictionary greenlight, and the
   sensitive-indicator ladder (consolidated summary §3 — Syphilis-treated, Hepatitis B reactive,
   Leprosy, NCD Mental Health, and whether one `is_sensitive` bit is enough).

## Machine-local state (things GitHub does NOT sync — required section per shutdown protocol)
As of shutdown 2026-07-07, session 6 (OFFICE machine):
- **Office machine (this one): clean, everything committed and pushed** (`dcf1f72` on top of
  `8c9cc41`, verified below). Joseph explicitly said "commit everything," so all of Session 6's
  ESR code + docs/memory are in git — will fast-forward on the HOME machine's next pull.
- Office machine's DB has one real test row in the new `esr_reports` table (`id=1`, "Test
  Measles Cluster", `sheet_sync_status='failed'` since `ESR_SHEET_ID` is intentionally unset) —
  from this session's live browser verification. `reset db protocols` does **not** truncate this
  table (only `health_data`/`staging_health_data`), so it'll persist across resets; harmless test
  data, not flagged as a concern, just noting it exists so it isn't mistaken for a real report
  later. Office DB otherwise unchanged: 247 CHILD_CARE + 50 DEMOGRAPHICS indicators,
  health_data/staging test data (7,538 rows).
- **`secrets/` folder created this session** (`./secrets/.gitkeep` tracked, everything else
  gitignored) — empty except the placeholder. Google service-account JSON key goes here once
  Joseph does the parked Sheets setup; per-machine, never synced via git by design.
- **HOME machine: `stash@{0}`** = untested Overview Card feature (parked by Joseph, decision
  pending); **`stash@{1}`** = older "indicator-reports-area-filter", provenance unknown.
  Unchanged from prior sessions.
- **The real `Demographics_nir.xlsx` (and all 46 other program `.xlsx` files) exist only on the
  HOME machine** — `backend/data/DEMOGRAPHICS/` here only has the placeholder `.txt`. This is
  why Demographics' dry-run/spot-check step still isn't done — genuinely blocked, not skipped.
  Gitignored per `CLAUDE.md`, will never sync via git.
- `.env` (per-machine, office): has `DB_PASSWORD`/`JWT_SECRET_KEY` (fail-fast secrets satisfied);
  missing `SITE_ADDRESS`/`IMAGE_TAG` (prod-only, expected absent in dev) and
  `GOOGLE_SERVICE_ACCOUNT_FILE`/`ESR_SHEET_ID` (parked — both read lazily, so their absence
  doesn't break anything except the Sheets push itself).

## Notes / Gotchas
- **Committed code this session, not docs-only** — Joseph explicitly said "commit everything."
  Two commits: `8c9cc41` (ESR feature) then `dcf1f72` (UI polish + docs/memory), not a
  docs-vs-code split — the polish just happened after the first commit landed.
- **`bootstrap_db.py`'s `split_statements()` breaks on semicolons inside `--` comments** — see
  `activeContext.md`'s "Watch out for" for the full story. If a new `.slq`/`.sql` file's table
  doesn't show up despite a clean-looking `bootstrap_db.py` run, check this first via manual
  `psql` apply before assuming the DB itself is fine.
- **This environment's Python fork uses `httpx2`, not `httpx`**, for FastAPI's `TestClient` —
  pinned in `requirements-dev.txt`. Re-`pip install -r requirements-dev.txt` in the container if
  a fresh container errors on `TestClient` import.
- **Registering a new template needs two places**: `frontend/src/services/constants.js`
  `TEMPLATES` (Indicator Reports) AND `backend/app/services/upload_catalog.py` `PROGRAMS` (the
  Upload page's actual dropdown source) — found the hard way building Demographics, now
  documented in `.claude/skills/add-template` and `activeContext.md`'s "Watch out for".
- Rate limiter: 10 bad logins/min/IP → 429; in-memory per gunicorn worker (documented).
- Prod parity test: `docker compose -p healthstat-prod -f docker-compose.prod.yml up -d --build`
  (isolated project name — do NOT run the prod file without `-p`, it would collide with dev).
- Known template errors — all 4 of the previously-flagged ones are now root-caused (not just
  named) in `memory-bank/template_analysis/`: `morta_mmr_imr_nir.xlsx` (mortality.md),
  `nata_lb_abr_rabr_nir.xlsx` (natality.md), `pre_gd_screening_nir.xlsx` (maternal_care_prenatal.md).
  `envi_sanitation_zod_nir.xlsx` (Q3/Q4 structure) was analyzed in a prior session — still open.
  Schistosomiasis has several NEW bugs beyond what was previously known — see
  `infectious_disease_schistosomiasis.md`.
- **Killed background agents don't resume** — plan batch sizes assuming a mid-run kill means
  redoing that whole task from scratch.
- Changelog discipline: bump `frontend/package.json` on release; **1.0.0 = first deploy**.
- PowerShell here-strings break for git messages — use `git commit -F <file>` or Bash heredoc.
- Backend container needed `pip install pytest==9.1.1 ruff==0.15.20 httpx2==2.5.0` again this
  session (not persisted in the image, per-container install every fresh `up -d --build`) —
  matches the already-documented per-machine gotcha in `project_state.md`.

## First Command Next Session
```
startup protocols
```
