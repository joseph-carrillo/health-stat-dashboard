# session-handoff.md

## Last Updated
2026-07-12, **session 12** (HOME machine, hostname `_hansell_`). Big autonomous build session:
Joseph said "continue building the programs, do this alone, ping me after each program is done."
Built **every remaining config-only program** (Natality, Leprosy, Filariasis, Rabies, STH
deworming) + the **D4 reconciliation DQC rule type**, closed Mortality's last render-check and
Demographics' dry-run. 6 feature commits, all pushed & green. Then paused: everything left needs a
Joseph schema/parser decision (D5/D6/D7) or a DOH/encoder action. Docs + memory synced here.
**Session-12 feature commits (all pushed, verified):** `37c517c` Natality, `8418cc4` Leprosy,
`3f47e1c` Filariasis, `4ac8193` Rabies, `1200aa5` STH deworm, `98ecc04` D4. Shutdown docs/memory
commit follows on top.

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
**All config-only programs are DONE. Everything remaining needs a Joseph decision or a DOH/encoder
action** — do NOT start these without his direction (they're schema/parser one-way doors):
- **D6 — row-stacked parsing** → unblocks **NCD Eye Health, Oral Health, Family Planning** (3
  programs, 3 stacking patterns). Joseph's likely next pick; design the `row_filter` mechanism and
  run it past him before wiring configs.
- **D5 — per-column rollup override** → NCD Meds (+ DOH must fix the 106-row Dec block).
- **D7/D10 — disease-as-row `diseases` table** → Morbidity. Biggest change, its own mini-phase.
- **STH cascade (File 2)** → blocked on encoder (Jane Galo): does Confirmed/Treated % divide by
  Screened or Suspected? (formula says Screened, change_log says Suspected).
- **Schistosomiasis / WASH Sanitation** → DOH source fixes.

Two one-liners from Joseph would unblock a lot: **ratify/reverse ADR-023** (rates) and
**ADR-024** (D4 reconciliation) — both PROPOSED, everything built rides on them. Other live
tracks unchanged: (1) Joseph's UI golden-path check of Sessions 9–12 then real uploads;
(2) go-live Step 3 (ports 80/443 pending with IT); (3) ESR Google Sheets setup (parked).

## Done This Session — Session 12 (2026-07-12, HOME `_hansell_`) — 5 programs + D4
Joseph: "continue building the programs, do this alone, ping me after each program is done, remember
my model policy." Built every remaining **config-only** program, one at a time, each validated +
dry-run parsed against the real `.xlsx` and spot-checked against the sheet's own cells; committed +
pushed per unit. **All dry-run — nothing in the live DB.** Ran on Opus 4.8, no sub-agents spawned.
- **Mortality** — closed its last definition-of-done box (the `/api/template-report` Excel-face
  render check for `morta_mmr`/`morta_imr`: 36/3 cols, 66 rows, structure correct). No commit —
  verification only. Mortality now fully DONE.
- **Natality** (`37c517c`, `nata_lb_abr_rabr`, 14 ind) — Q1/Q3/Q4 mapped, **Q2 EXCLUDED**
  (structurally missing the ABR<10 column — DOH-blocked, FLAG 1). Rates per 1,000 (ADR-023).
  6 cells spot-checked vs Excel exactly (incl. both ABR rates, RABR %).
- **Leprosy** (`8418cc4`, `infec_leprosy`, 100 ind, **ALL is_sensitive**) — 5-tab annual via
  extra_sheets. **3 source bugs fixed in config**: missing ×10,000 prevalence, "E.Total"
  rate-not-sum, #REF! all-ages %treated (derived via `denominator_source`). Rates ×10k/×100k/×1M.
  **DOH file has NO case data yet** (pop-only) — verified via populations + structure/alignment.
- **Filariasis** (`3f47e1c`, `infec_cdr_filariasis` + `infec_lymph_eleph_hydro`, 49 ind) — CDR
  (positive/examined per NBE/RDT) + morbidity counts. **MDA file EXCLUDED** (non-NIR data + broken
  15+/2+ formulas). NIR non-endemic so source is legitimately zero — verified structurally.
- **Rabies** (`4ac8193`, `animal_bites` + 4 split configs, 52 ind) — bites/CFR + exposure by WHO
  category / ARV completion / ARV+RIG / animal source. **Split configs** (avoids period-varying
  extra_sheets gap). **Real Q1 data** — 8+ computed cells verified vs Excel exactly.
- **STH deworming** (`1200aa5`, `infec_sth_deworm`, 21 ind) — MDA coverage SB/CB; semestral rounds
  mapped Jan→Q1/July→Q3, 4 nationwide leftover sheets excluded. Real data verified vs Excel.
  **STH cascade (File 2) NOT built** — encoder denominator question (F2-1), no real data.
- **D4 reconciliation DQC** (`98ecc04`, ADR-024 PROPOSED) — new `run_dqc_rules()` rule_type
  `"reconciliation"` (equals/at_most), 8 unit tests, wired into Rabies groups b/d where it fires on
  real data and **matches the source template's own "Check Data" cells** (real DOH data gaps).
- **Demographics** — finished its previously-blocked dry-run (real file is HOME-only): population
  spot-checks vs Excel exactly, cross-validates with Leprosy's populations; facility/workforce blank
  (DOH gap). No code change (pre-built Session 5), now verified.
- 56 backend tests pass, ruff + eslint clean throughout. **INFECTIOUS_DISEASE now 260 ind,
  VITAL_STATS 52.** 8 of 11 program areas now have all currently-buildable content done.

## Done This Session — Session 11 (2026-07-11, HOME `_hansell_`) — CI fix only
Not a resume of the build-out — Joseph opened with a CI failure report. Handled it standalone:
- **Fixed CI pytest collection crash:** `test_annotation_rows.py` imported
  `from backend.app.services.parser import ...`; every other test file (and `conftest.py`'s
  `sys.path` insert) uses `from app...`. The mismatched import crashed collection for the whole
  suite — CI never ran any of the other 47 tests, it just errored out immediately.
- **Fixing that exposed a second, masked bug:** `requirements-dev.txt` pinned `httpx2==2.5.0`
  instead of `httpx==0.28.1`. `httpx2` is a real, separate PyPI package (same author, own
  top-level `httpx2` module) — `pip install` succeeded silently, but `starlette.testclient`
  (FastAPI's `TestClient`, used by `test_esr_reports.py`) imports plain `httpx`, so it still
  broke. CI never reached this error because the annotation_rows crash always aborted collection
  first. **This file and `activeContext.md` had wrongly documented `httpx2` as expected
  behavior across several past sessions — corrected both.**
- Verified locally (pip installed both requirements files, ran pytest + ruff on the host):
  **48/48 tests pass, ruff clean.** Committed and pushed directly as `10b6a7a` — CHANGELOG
  `[Unreleased] → Fixed` entry included in the same commit.
- **"Image release was skipped" — explained, not a bug.** `.github/workflows/ci.yml`'s
  `release-images` job is gated `if: startsWith(github.ref, 'refs/tags/v')`; it only builds/pushes
  Docker images on a `v*` tag push, never on a plain push to `main`.
- Spun up the local stack (`docker compose up -d --build`): db healthy, backend + frontend up,
  `:8000/docs` and `:5173` both verified 200. Gave Joseph the test admin login (`admin` /
  `Admin@2026!` — already documented in root `CLAUDE.md`, nothing new to memorize).

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

## Next Session — first moves (all config-only programs are DONE; everything left needs a decision)
0. `startup protocols` (git sync FIRST). Model Opus 4.8; Sonnet 5 for any sub-agents; ping after
   each finished program (standing instructions above).
1. **Get two one-liners from Joseph:** ratify/reverse **ADR-023** (rates) and **ADR-024** (D4
   reconciliation). Everything built this session rides on them.
2. **Pick the next target with Joseph.** Recommended: **D6 (row-stacked parsing)** — one mechanism
   unblocks THREE programs (NCD Eye Health = age-as-rows, Oral Health = quarters+age stacked,
   Family Planning = quarters stacked). **Design the `row_filter` config-key mechanism and run the
   approach past Joseph BEFORE wiring configs** — it's an undecided one-way door. Then build the 3
   (FP: source CUB_A from Q1 not Q4; EXCLUDE the structurally-dead Demand Satisfied KPI; Beginning/
   Ending stocks need D5).
3. **Other buildable-with-a-decision items** (each needs Joseph or an encoder/DOH answer first):
   - **D5 per-column rollup override** (`rollup:"last"`) → **NCD Meds** (build Jan–Nov, DOH must fix
     the 106-row wrong-region Dec block).
   - **Morbidity LAST** — its own mini-phase: D7 `diseases` table + D10 name→PSGC lookup; HIV/
     syphilis rows sensitive; store None not 0 for the dead Rate column.
   - **STH cascade (File 2)** — blocked on encoder (Jane Galo): Confirmed/Treated % ÷ Screened or
     ÷ Suspected? Build once answered (4 split configs, cross-sheet denominators via
     `denominator_source`, add Treated≤Confirmed reconciliation via D4).
   - **Schistosomiasis / WASH Sanitation** — DOH source fixes; do not build until fixed.
4. **Deferred D4 backfills** (mechanism exists, just add `dqc_rules` entries): Intra Partum DT/DO,
   NCD Risk-Factors cross-template, Leprosy Registered≥Confirmed≥Treated≥Completed, STH cascade.
5. Standing asks when Joseph surfaces: UI golden-path check of Sessions 9–12 then REAL uploads;
   ports 80/443 status; ESR Google Sheets setup; parked decisions (stash@{0}, small-cell cutoff,
   data dictionary, is_sensitive granularity).

## Machine-local state (things GitHub does NOT sync — required section per shutdown protocol)
As of shutdown 2026-07-12, **session 12** (HOME machine, hostname `_hansell_`):
- **This machine (HOME): clean after this shutdown commit** — all 6 feature commits were pushed
  per-unit mid-session (`37c517c`/`8418cc4`/`3f47e1c`/`4ac8193`/`1200aa5`/`98ecc04`); this docs/
  memory sync is a separate commit on top, also pushed (verified, no "ahead"). Docker stack was up
  during the session and is stopped by this shutdown (step 5).
- **DB deltas this session (per-machine, NOT git-synced):** ~223 new indicators seeded HERE via
  `bootstrap_db.py` (14 NATA_ + 100 LEP_ + 49 FILA_ + 52 RABIES_ + 21 STH_DW_ ... minus a couple of
  reused codes). The **OFFICE machine does NOT have them** — run
  `docker compose exec backend python backend/bootstrap_db.py` there (idempotent). **No
  health_data/staging writes — all uploads were `dry_run=true`.** Indicator totals now:
  INFECTIOUS_DISEASE 260, VITAL_STATS 52 (plus the pre-existing CHILD_CARE 247, MATERNAL_CARE 319,
  NCD 143, DEMOGRAPHICS 50, GERIATRIC 49, WASH 11).
- **The real program `.xlsx` source files live ONLY on this (HOME) machine** (gitignored) — every
  dry-run/verify this session ran here. The OFFICE machine does not have them, so re-running
  dry-runs there needs the files copied over first. Rabies/STH/Natality have real data; Leprosy &
  Filariasis source files are empty of case data at DOH (Filariasis genuinely — NIR non-endemic;
  Leprosy a data-entry gap) — same "empty at DOH" bucket as Demographics facility/workforce and
  Geriatric SC-Immunization.
- **Both stashes still present on this machine** (`stash@{0}` = untested Overview Card feature,
  parked; `stash@{1}` = older "indicator-reports-area-filter", provenance unknown) — unchanged.
- **`secrets/` folder** — not touched; still empty except the `.gitkeep`. `.env` (per-machine,
  HOME): not touched this session.
- **Source files confirmed empty/near-empty at DOH** (flagged for DOH data entry, not parser bugs):
  `DEMOGRAPHICS/Demographics_nir.xlsx` (population only), `GERIATRIC/ncd_scimmunization_nir.xlsx`
  (zero/blank), `INFECTIOUS_DISEASE/Leprosy/infec_leprosy_nir.xlsx` (population only), both
  Filariasis NIR files (legitimately zero — non-endemic).

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
