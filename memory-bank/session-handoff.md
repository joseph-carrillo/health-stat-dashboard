# session-handoff.md

## Last Updated
2026-07-11, **session 9** (HOME machine, hostname `_hansell_` — program build-out blitz + this
shutdown). Built every *unblocked* program/file (8 feature commits, all dry-run only, nothing in
the live DB), then Joseph asked to run shutdown protocols and update the foundation docs + handoff
so he can **inspect the pending schema decisions and decide next session**. Feature commits (all
pushed & verified): `8a2788f` `a505662` `4d2115e` `83bf708` `7f22aa9` `3230975` `0d3447c`
`354f3a1`, plus docs `b56fc5f`. **This shutdown docs/memory commit is the follow-up** (verified
hash recorded in the shutdown report).

## Current Objective
**The gating item now: Joseph inspects the schema/parser DECISIONS and decides — lead with D1/D2.**
Session 9 built everything buildable without a decision, so all remaining program work is
decision-gated. The inspectable list is in `ROADMAP.md` ("DECISIONS FOR JOSEPH TO INSPECT &
DECIDE"): D1 (non-% rates → Vital Stats, Leprosy, Filariasis), D2 (unbounded-ratio display →
Demographics), D4 (reconciliation DQC), D5 (per-column cumulative rollup → NCD Meds), D6
(row-stacked dimension → NCD Eye/Oral Health/Family Planning), D7/D10 (Morbidity), Rabies parser
change. Other live tracks:
1. **UI golden-path check + real uploads for Session 9's work** — all dry-run so far, nothing in
   the live DB. When Joseph's happy after reviewing Upload → Coverage/Rankings/Indicator Reports,
   run the real (non-dry-run) uploads.
2. **Go-live (v1.0.0)** — Steps 1+2 done. Domain + server SSH in hand since 2026-07-06; only ports
   80/443 pending. Server prep can start once domain/IP are shared in chat. ~2-week target.
3. **ESR Google Sheets one-time setup** — parked; steps in `RUNBOOK.md`. Not a blocker.
4. PHRIC follow-ups (auth-gated cluster-page variant, real data wiring, Google OAuth + granular
   permissions) — all future, unscoped.

## Done This Session — Session 9 (2026-07-11, HOME machine `_hansell_`)
- **Built every unblocked program/file in one pass** (Joseph: "continue with the rest of the
  programs and have it checked once I get back"), each validated + dry-run parsed against its real
  `.xlsx` and spot-checked against the sheets' own computed cells (~800 cell values verified, zero
  mismatches). **All dry-run — nothing written to the live DB, awaiting Joseph's UI check.**
- **HIV/HepB/Syphilis signed off** (`8a2788f`) — real files found on this machine; validated, 69
  values verified. **Fixed a real parser bug**: `is_annotation_row()` in `parser.py` (+ `test_
  annotation_rows.py`) — sheet footer text ("Source: DOH-FHSIS", "Legend:") in the PSGC column was
  being reported as location errors. Confirmed the sensitive-data RBAC masking (`can_view_sensitive`)
  is genuinely built and enforced.
- **New programs/files** (one commit each): WASH water (`envi_water`, `a505662`, first
  municipality-level new program); Geriatric screening (`ger_screening`, 49 ind, `4d2115e`; DQC
  re-derived, catches the real GER-1 data bug); **Maternal Care COMPLETE** — Prenatal 9 configs
  (`83bf708`), Post Partum + Intra BW (`7f22aa9`), Intra Partum SHP/DT/DO (`3230975`) = 13 files,
  17 templates, incl. same-bracket recomputes for the 8ANC/4PNC shift bugs and D3 split-configs for
  a/b/c sheet-groups; NCD Mental Health (`0d3447c`, 13 ind **all is_sensitive=TRUE** per ADR-021);
  NCD Cancer + Risk Factors (`354f3a1`, cervical/breast + adults/SC behavioral risk factors).
- ~24 new configs, ~520 new indicators. `bootstrap_db.py` idempotent — run it on any machine that
  needs these seeded. 38 backend tests still pass, ruff clean throughout.
- **Everything remaining is blocked** on a Joseph D-decision (see Current Objective) or a DOH
  action (WASH sanitation Q3/Q4 fix, Natality Q2 fix, NCD Meds Dec-block fix, Schisto/STH
  clarifications; and DATA ENTRY for Demographics facility/workforce + Geriatric SC Immunization —
  both files shipped nearly/entirely empty).
- **Not done:** live browser UI click-through (Chrome extension not connected — same as Session 8);
  real (non-dry-run) uploads (held for Joseph's golden-path review).

## Done This Session — Session 8 (2026-07-10, HOME machine, hostname `_hansell_`)
- **Joseph pivoted the PHRIC site from "parked" to "build the skeleton now."** He wants the
  public-facing site live and linkable to internal clients ahead of higher-up approval for full
  public access, even though only the Health Statistics dashboard has real data behind it today.
- **Found a redundant design handoff copy**: `design_handoff_phric_site/` was sitting untracked
  in the repo root (12 files — 7 `.dc.html` prototypes, `manifest.json`, `README.md`,
  `support.js`, `sw.js`, a logo asset). Verified against `PHRIC site.zip` already in Joseph's
  Downloads folder — same 12 files, identical sizes via zip listing — so the repo copy was
  redundant. Moved it out of the repo (into this session's job temp dir, not deleted) rather than
  committing or discarding it; source control now shows 0 pending for that folder.
- **Locked 4 architecture decisions via direct questions before building** (now ADR-022): same
  React app (not a separate frontend); landing page becomes the site root (`/`), existing
  `Login` moves to `/login`; the 4 cluster pages ship **public-state only** (the design's
  logged-in variant — unblurred tables, working downloads — is real future work); Epi
  Surveillance's "+ Submit ESR Report" button links to the existing `/esr/new` form instead of
  being rebuilt from the design handoff a second time.
- **Built end-to-end:**
  - `frontend/src/pages/public/` — `Landing.jsx`, `HealthStatistics.jsx`,
    `EpidemiologySurveillance.jsx`, `Research.jsx`, `Laboratory.jsx`.
  - `frontend/src/components/public/` — `ClusterPage.jsx` (shared scaffold: gov bar → header →
    hero → report cards → blur-locked table → footer) + `PublicChrome.jsx` (gov bar, cluster
    header/footer, sign-in pill, lock icon) + `publicTheme.js` (design tokens) + `public.css`
    (responsive breakpoint classes) — the 4 cluster pages are thin config objects through this
    one scaffold, not 4 duplicated layouts.
  - Fonts (Sora + Plus Jakarta Sans) added to `index.html`; DOH/PHRIC logo copied to
    `frontend/public/images/phric-logo.png`.
  - Every simulated "Sign in with Google" trigger in the prototype (design-only per the
    handoff's own README — no real OAuth) replaced with a "Staff Sign In" pill routing to
    `/login`; the real JWT login flow is completely unchanged, just moved off the site root.
  - `App.jsx` rewired: `/` → `Landing`, `/login` → the existing `Login` page,
    `ProtectedRoute`/`PermissionRoute` redirect to `/login` (was `/`), catch-all redirects to
    `/` (was `/home`). `services/api.js`'s 401 interceptor and `Navbar.jsx`'s logout both
    updated to `/login` too. All existing protected/admin routes under `/home` untouched.
- **Verified:** ESLint 0 errors project-wide (9 pre-existing warnings in unrelated old files,
  none in new code); production build (`npm run build`) compiles clean; all 5 new routes + the
  logo asset return HTTP 200 on the running dev server. **Not done: a live browser
  click-through** — the Claude Chrome extension wasn't connected this session, so screenshot
  verification wasn't possible. Joseph reviewed the pages himself in his own browser afterward
  and confirmed: "checked the pages, all good for me."
- **Asked Joseph how to handle the pending code at shutdown (per the halt-and-ask rule); he chose
  to commit it together with docs/memory** — committed and pushed this session, see commit hash
  at the top of this file.

## Done This Session — Session 7 (2026-07-09, OFFICE machine)
- **Started HIV-Syphilis-HepaB, the next program per the build-priority order** (`INFECTIOUS_
  DISEASE`'s antenatal-screening sub-group — recommended first for exercising sensitive-data
  RBAC end-to-end): 38 indicators seeded (`HIV_*`/`HEPB_*`/`SYPH_*`, quarterly, age-band
  10-14/15-19/20-49; Syphilis has an extra Treated group HIV/HepB don't), 3 configs written
  (`infec_hiv.json`, `infec_hepatitisb.json`, `infec_syphilis.json`), registered in both
  `upload_catalog.py` and `constants.js` (the "two places" gotcha from Demographics, applied
  correctly this time). Confirmed all 38 indicators live in this machine's DB via `psql` (count
  matches the seed file exactly).
- **Sensitive-indicator policy expanded — ADR-021**: CLAUDE.md's list grew from "HIV reactive,
  Syphilis reactive" to also cover Syphilis-treated (discloses reactive status one hop removed),
  Hepatitis B reactive, Morbidity's future HIV/syphilis rows, Leprosy, and NCD Mental Health —
  promoting the consolidated summary's Tier 2/3 candidates into locked Tier 1 policy. Open
  question left for later: whether one `is_sensitive` boolean is granular enough.
- **Not done — genuinely blocked:** `/api/validate-config` and dry-run parse + cell-value
  spot-check against the real `infec_hiv_nir.xlsx`/`infec_hepatitisb_nir.xlsx`/
  `infec_syphilis_nir.xlsx` files. Neither machine has confirmed possession of these 3 files —
  office machine's `backend/data/INFECTIOUS_DISEASE/` only has the placeholder `.txt`. Unlike
  Demographics, this was never pinned to "HOME machine only," so check there first next session.
- **Joseph's instruction this session**: commit + push the code immediately (didn't want it left
  uncommitted), then run full shutdown protocols on top of that. Code landed as `87950a4`; this
  docs/memory sync is the follow-up shutdown commit.
- Confirmed via direct question that this machine's hostname `RESUDesktop2` = the OFFICE
  desktop — now documented in `activeContext.md`'s "Watch out for" so future sessions can
  self-identify via `hostname` instead of asking.

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
2. **Locate the real `infec_hiv_nir.xlsx`/`infec_hepatitisb_nir.xlsx`/`infec_syphilis_nir.xlsx`
   files** — check `backend/data/INFECTIOUS_DISEASE/` on whichever machine this is (not
   confirmed on either as of Session 7). If found: run `/api/validate-config`, then dry-run
   parse + spot-check ≥3 cell values per `.claude/skills/add-template`'s definition of done, to
   sign off HIV-Syphilis-HepaB. The indicators + configs are already committed/pushed (`87950a4`)
   and seeded live in the office machine's DB (`bootstrap_db.py` — idempotent, safe to re-run on
   any machine that needs it).
3. **If this is the HOME machine:** also finish Demographics — dry-run parse
   `demographics_annual` against the real `Demographics_nir.xlsx`, spot-check ≥3 cell values.
4. Ask Joseph: has IT confirmed ports 80/443 yet? If domain name + server IP haven't been shared
   in chat, ask for them so server prep can start (doesn't need ports confirmed first).
5. Ask Joseph: ready to do the Google Sheets one-time setup for ESR reports (RUNBOOK.md)? Not
   urgent — just a self-serve pickup whenever he wants it live.
6. Once HIV-Syphilis-HepaB and Demographics are both signed off: move to the remaining
   `INFECTIOUS_DISEASE` sub-groups (Schistosomiasis, Filariasis, Rabies, STH, Leprosy) or the
   next program per `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` §5.
7. Parked decisions when Joseph's ready: Google OAuth + granular per-user permissions (needs its
   own design pass, see ROADMAP.md), the auth-gated variant of the PHRIC cluster pages,
   stash@{0} fate (HOME machine), small-cell cutoff (<5 or <10), data-dictionary greenlight, and
   whether one `is_sensitive` bit is granular enough or a tiered RBAC scheme is needed (open
   question left by ADR-021).

## Machine-local state (things GitHub does NOT sync — required section per shutdown protocol)
As of shutdown 2026-07-11, session 9 (HOME machine, hostname `_hansell_`):
- **This machine (HOME): clean, everything committed and pushed** (`git status -sb` = up to date,
  no "ahead"). All 8 feature commits + docs were code+config that DO sync via git — see the commit
  list at the top of this file.
- **The real program `.xlsx` source files live on this (HOME) machine** — this is why every
  Session 9 dry-run/verify ran here: `backend/data/INFECTIOUS_DISEASE/HIV-Syphilis-HepaB/` (the 3
  `infec_*_nir.xlsx` files — **confirmed present this session**, resolving Session 7's open
  question), `WASH/envi_water_nir.xlsx`, `GERIATRIC/`, all of `MATERNAL_CARE/`, `NCD/`,
  `DEMOGRAPHICS/`, etc. These are **gitignored** — the OFFICE machine does NOT have them, so the
  dry-run/verify steps can only be re-run on this HOME machine (or after copying files over).
- **DB state (per-machine, not synced):** Session 9 wrote **nothing** to this machine's DB — all
  uploads were `dry_run=true`. The ~520 new indicators WERE seeded here via `bootstrap_db.py`
  (idempotent). On the OFFICE machine, run `docker compose exec backend python backend/bootstrap_db.py`
  to seed the new indicators there too (safe to re-run).
- **Both stashes still present on this machine** (`stash@{0}` = untested Overview Card feature,
  parked; `stash@{1}` = older "indicator-reports-area-filter", provenance unknown) — unchanged.
- **`secrets/` folder** (`./secrets/.gitkeep` tracked) — not touched; still empty except the
  placeholder. `.env` (per-machine, HOME): not touched this session.
- **Two source files confirmed nearly/entirely empty at DOH** (not a parser issue — flagged for
  DOH data entry): `DEMOGRAPHICS/Demographics_nir.xlsx` (only the population column filled; every
  facility/workforce count blank) and `GERIATRIC/ncd_scimmunization_nir.xlsx` (entirely zero/blank).

## Notes / Gotchas
- **The public cluster pages (`ClusterPage.jsx`) intentionally render public-state only** — no
  `isLoggedIn` branch exists yet, unlike the design handoff's own prototypes (which simulate both
  states with a boolean). Don't be surprised the components have no auth-check prop; that's the
  ADR-022 scope cut, not an oversight.
- **Joseph asked for a two-step commit this session**: commit + push the Infectious Disease code
  immediately (`87950a4`), *then* run full shutdown protocols on top of that — not the usual
  single "commit everything at shutdown" pattern from Sessions 5/6.
- **Committed code Session 6, not docs-only** — Joseph explicitly said "commit everything."
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
