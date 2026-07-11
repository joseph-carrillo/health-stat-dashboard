# session-handoff.md

## Last Updated
2026-07-11, **session 10** (HOME machine, hostname `_hansell_` — second session this day).
Joseph pre-approved building ALL remaining programs autonomously ("I'll inspect once all
programs done"), I built the D1/D2 rate uplift + Vital Stats Mortality, then he **stopped the
build ~30 min in to conserve his usage limit** and ordered this detailed shutdown. Code + docs
committed TOGETHER (his explicit choice when asked per the pending-code rule). **Session-10
commit: `b9f87b5`** (+ this hash-recording docs commit on top) — push verified at shutdown.

## ⚠️ STANDING INSTRUCTIONS FROM JOSEPH (Session 10 — carry to EVERY future session)
1. **Model policy (also in root CLAUDE.md "Model & Token Policy"):** main/orchestrator session
   runs **Opus 4.8**; every Agent-tool sub-agent runs **Sonnet 5** (`model: "sonnet"`). Remind
   him at startup if the session isn't on Opus 4.8.
2. **Token conservation:** targeted file reads only, batch independent calls, brief narration,
   reuse established patterns instead of re-investigating. The Session-10 build burned heavily
   in ~30 min — that's the ceiling to stay under.
3. **Cadence:** commit + push each unit of work as soon as it's green; **after each finished
   program, STOP and ping Joseph — ask whether to continue** (he manages a 5-hour usage window).
4. His build pre-approval stands: make the remaining D-decisions pragmatically, document each
   as a PROPOSED ADR he can reverse, never ingest known-garbage source data.

## Current Objective
**Resume the program build-out at the exact cut-off point** (see "Next Session" below). All
remaining programs are pre-approved to build. ADR-023 (rates stored already-multiplied) is
PROPOSED — get Joseph's ratification early next session, since Natality/Leprosy/Filariasis
build on the same convention. Other live tracks unchanged: (1) Joseph's UI golden-path check of
Sessions 9+10 then real uploads; (2) go-live Step 3 (ports 80/443 pending with IT); (3) ESR
Google Sheets setup (parked); (4) PHRIC follow-ups (future, unscoped).

## Done This Session — Session 10 (2026-07-11 later, HOME `_hansell_`) — CUT OFF MID-BUILD
- **D1/D2 rate/ratio display uplift (ADR-023, PROPOSED):**
  - `backend/app/services/analytics.py`: new `display_unit()`; `list_indicators` +
    `get_indicator_meta` expose `rate_multiplier`/`unit`; `get_coverage` returns `unit` and
    gives status bands to percentages ONLY (rate/ratio → `status: null`); `get_trend` returns
    display-ready values (percentage ×100 — **fixes a real pre-existing bug**: Trends showed
    "0.04%" for 4% coverage) + `unit`; `_combine_slice_values` treats `_RATE` like `_PCT`
    (never summed across slices, recomputed from raw via config formula).
  - `frontend/src/pages/analytics/Trends.jsx`: uses the API's `unit` (space-separated for
    "per 1,000"-style), dead `maxOverride` removed.
  - `backend/tests/test_rate_display.py`: 10 new tests (display_unit, rate-slice aggregation,
    status bands). **48 tests total pass; ruff clean; eslint clean on touched files.**
  - Storage convention (THE key decision to ratify): rates stored ALREADY MULTIPLIED
    (62.5 = "per 100,000"); config formulas multiply explicitly; `rate_multiplier` is only the
    unit label. Excel-face report page needed zero changes (rate columns are plain numbers).
- **Vital Stats Mortality (first program on the uplift):**
  - 38 `MORTA_*` indicators seeded (`seed_indicators.py` new VITAL_STATS section; **seeded live
    in THIS machine's DB** — run `bootstrap_db.py` on the office machine to get them there).
  - `configs/morta_mmr.json` (MMR 'a' sheets Q1a-Q4a: 13 raw + 23 computed; NIR rollup row
    skipped via `data_start_row: 1`; col 33 mapped by index as Indirect-combined — its header
    label lies, FLAG M1) + `configs/morta_imr.json` (IMR 'b' sheets; shared `MORTA_LB_TOTAL`
    code with MMR so the second upload's livebirths dedupe as unchanged). Annual sheets are
    rollups — not ingested.
  - Both `/api/validate-config` clean. Dry-run Q1 vs the real file: MMR 4 rows/144 staged/
    0 errors/0 DQC; IMR 4 rows/12/0/0. **12 spot-checked values match Excel's cached cells
    exactly** (NegOr MMR chain 98.28009828 → 49.14004914 → 147.4201474; IMR 2.618/13.268).
    Q2-Q4 sheets are empty in the source (known Q1-only pattern, not a bug).
  - Registered in `upload_catalog.py` (new VITAL_STATS program, Mortality sub-program —
    verified live via `/api/upload-catalog`) and `constants.js` TEMPLATES.
- **Root CLAUDE.md**: new "Model & Token Policy" section (see standing instructions above).
- **NOT done — the exact cut-off:** (1) the Excel-face render check
  (`/api/template-report` for `morta_mmr`/`morta_imr`) — I was grepping `backend/main.py` for
  that endpoint's exact params when stopped; it's the ONLY unchecked definition-of-done box for
  Mortality. (2) Live browser click-through (extension not connected). (3) Every program after
  Mortality — see "Next Session". A scratchpad helper (`api.py`, session temp dir — will NOT
  survive) did auth'd API calls; recreate trivially if needed (login is OAuth2 FORM data, not
  JSON; MSYS path-mangling: use query strings or `MSYS2_ARG_CONV_EXCL="*"`).

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

## Next Session — first moves (the Session-10 resume plan)
0. `startup protocols` (git sync FIRST). **Check the model is Opus 4.8; use Sonnet 5 for any
   sub-agents; ping Joseph after each finished program** (standing instructions above).
1. **Ask Joseph to ratify ADR-023** (rates stored already-multiplied) — one yes/no; everything
   rate-based (Natality, Leprosy, Filariasis) builds on it.
2. **Finish Mortality's last DoD box:** hit `/api/template-report` (endpoint is in
   `backend/main.py` — find its exact params, that grep is where Session 10 stopped) for
   `morta_mmr` + `morta_imr`, confirm layout + rows render. Then Mortality is DONE — ping Joseph.
3. **Build order from there, one program per ping** (per-program notes in the analysis files +
   consolidated summary §5/§7; per-task breakdown existed as session tasks #3-#15, recreate from
   this list): **Natality** (try per-quarter split-configs around the structurally-different Q2 —
   we recompute Annual ourselves so its live `#REF!` doesn't matter; if Q2 can't be expressed,
   build Q1/Q3/Q4 and document Q2 as DOH-blocked) → **Leprosy** (A-only ×5 tabs, ALL
   is_sensitive=TRUE per ADR-021, 3 formula bugs to absorb: missing ×10,000, E.Total
   rate-not-sum, `#REF!`) → **Filariasis CDR + Lymph/Eleph/Hydro** (MDA file EXCLUDED —
   wrong-region data, DOH-blocked) → **Demographics dry-run finish** (real file is HERE on the
   HOME machine; expect only the population column populated) → **D4 reconciliation DQC rule
   type** in `run_dqc_rules()` (+ backfill deferred rules: Intra Partum DT/DO, NCD RF
   cross-template, Leprosy all-ages, STH Treated≤Confirmed, Mortality deaths-vs-zero-LB) →
   **Rabies** (4 split configs — the consolidated summary says split-configs REPLACE the old
   "needs parser change" claim) + **STH** (exclude 4 nationwide leftover sheets; document the
   stage-denominator assumption, flag for encoder) → **D6 row-stacked parsing** (`row_filter`
   config key) then **NCD Eye Health, Oral Health, Family Planning** (FP: source CUB_A from Q1
   not Q4; EXCLUDE the structurally-dead Demand Satisfied KPI; D5 for Beginning/Ending stocks) →
   **D5 rollup override + NCD Meds** (Dec sheet has the 106-row wrong-region block — build
   Jan-Nov, flag Dec) → **Morbidity LAST** (own mini-phase: D7 Option B `diseases` table +
   D10 name→PSGC lookup; HIV/syphilis rows sensitive per ADR-021; store None not 0 for the
   dead Rate column).
   **Schisto stays DOH-blocked** (scope clarifications) — do not build.
4. Standing asks when Joseph surfaces: ports 80/443 status; ESR Google Sheets setup; parked
   decisions (stash@{0}, small-cell cutoff, data dictionary, is_sensitive granularity).

## Machine-local state (things GitHub does NOT sync — required section per shutdown protocol)
As of shutdown 2026-07-11, **session 10** (HOME machine, hostname `_hansell_`):
- **This machine (HOME): clean after this shutdown commit** — code + docs committed together
  and pushed (verified, no "ahead").
- **DB deltas this session (per-machine, NOT git-synced):** +38 `MORTA_*` indicators seeded
  here (VITAL_STATS). The OFFICE machine does NOT have them — run
  `docker compose exec backend python backend/bootstrap_db.py` there (idempotent). No
  health_data/staging writes (dry-run only). Startup row counts here for reference:
  health_data 6,763; staging 19,001; esr_reports 0 on this machine.
- **Session scratchpad helper (`api.py`) lives in the session temp dir — gone next session**;
  recreate if needed (notes in the Session 10 section above).
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
- **`requirements-dev.txt` had a typo (`httpx2==2.5.0`) instead of `httpx==0.28.1`** — `httpx2`
  is a real, separate PyPI package (also by the httpx author) whose top-level module is
  `httpx2`, not `httpx`, so it silently satisfied `pip install` while leaving
  `starlette.testclient`'s `import httpx` broken. Fixed 2026-07-11; this masked a second bug
  (a stray `from backend.app...` import in `test_annotation_rows.py`, which crashed pytest
  collection before the missing-`httpx` error could even surface). If `TestClient` import
  errors resurface, check the pin is still `httpx==0.28.1`, not `httpx2`.
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
