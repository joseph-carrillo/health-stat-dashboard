# session-handoff.md

## Last Updated
2026-07-05, session 4 (HOME machine — remaining 6 file-groups analyzed, 18/18 total complete;
no DB/code changes this session, docs-only)

## Current Objective
Two parallel tracks:
1. **Go-live (v1.0.0)** — Steps 1+2 of `deployment-checklist.md` are DONE and verified; Step 3
   (the actual deploy) waits only on **Joseph buying the .com domain** and **IT handing over
   server IP + SSH** (+ confirm ports 80/443 open). When those arrive, follow
   `RUNBOOK.md → Production — server deployment`, then tag `v1.0.0`.
2. **Build out the 10 non-Child-Care programs** — files landed 2026-07-05: **46 files across 18
   natural sub-groups**. **Analysis phase now COMPLETE: 18/18 sub-groups analyzed**, write-ups
   in `memory-bank/template_analysis/`. **Next session: merge all 18 into one Joseph-facing
   summary** (flagged issues, sensitive-indicator list, build-priority order) — Joseph explicitly
   asked to do this next session rather than now. **Do NOT start seeding indicators/configs**
   until that summary is built and Joseph has reviewed it.

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
2. Ask Joseph: domain bought? server credentials from IT? → if yes, Step 3 go-live per RUNBOOK.
3. **Build the consolidated summary** — analysis phase is done (18/18). Read all 18 files in
   `memory-bank/template_analysis/` and merge into one Joseph-facing report (flagged issues,
   sensitive-indicator list, build-priority order) before any indicator seeding starts. Several
   schema questions need his decision after that (`formula_type="rate"`/`"ratio"`,
   period-varying `extra_sheets`, "sum of parts" DQC rule type, per-column rollup override,
   Family Planning's stacked-quarters `sheet_map` shape, Morbidity's disease-as-row schema — see
   `project_state.md` Open work #3 and `ROADMAP.md`'s "Schema/parser decisions surfaced").
4. Parked decisions when Joseph's ready: stash@{0} fate (HOME machine), small-cell cutoff
   (<5 or <10), data-dictionary greenlight, and whether to expand the sensitive-indicator list
   (NCD Mental Health, Morbidity HIV/syphilis rows, Leprosy).

## Machine-local state (things GitHub does NOT sync — required section per shutdown protocol)
As of shutdown 2026-07-05, session 4 (HOME machine):
- **HOME machine (this one): `stash@{0}`** = untested Overview Card feature (parked by Joseph,
  decision pending); **`stash@{1}`** = older "indicator-reports-area-filter", provenance
  unknown. Unchanged from prior sessions — do not exist on the office desktop.
- **Office machine**: should be clean at `19d6871` (or later once this session's commit is
  pushed); will fast-forward on next pull. No known local state.
- `backend/data/<PROGRAM>/` subfolders: **full of real `.xlsx` files on this machine** (46 files
  across all 10 programs, dropped 2026-07-05 session 3 by Joseph — unchanged this session).
  These raw Excel files are gitignored per `CLAUDE.md` (`Raw .xlsx under backend/data/
  gitignored`) — they exist only on this machine, will NOT sync via git. If work resumes on a
  different machine, the files need to be re-copied there manually, or all further
  analysis/testing should stay on this machine until the per-program build is complete.
- HOME machine has **no `gh` CLI** — check CI via the browser Actions tab here.
- `.env` (per-machine): unchanged from last session (`CORS_ORIGINS=http://localhost:5173,http://localhost`).

## Notes / Gotchas
- **Uncommitted code: none.** This session was docs-only (analysis write-ups + memory sync) —
  no application code changed.
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

## First Command Next Session
```
startup protocols
```
