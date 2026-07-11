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
  pytest==9.1.1 ruff==0.15.20 httpx==0.28.1` (requirements-dev.txt is NOT mounted into the
  container; `httpx` — plain, no "2" — is required by `starlette.testclient`/FastAPI's
  `TestClient` for the ESR endpoint tests). **`httpx2==2.5.0` was a typo** that sat in
  `requirements-dev.txt` for several sessions: `httpx2` is a real, separate PyPI package
  (different top-level module) so `pip install` silently succeeded while `TestClient` stayed
  broken. Fixed 2026-07-11 — see `session-handoff.md`. Then
  `docker compose exec backend python -m pytest backend/tests/ -q` (48 tests).
- **Clean slate for testing:** type `reset db protocols` (truncates `health_data`/
  `staging_health_data` only — **does not touch the new `esr_reports` table**, which has one
  real test row from this session's browser verification, `id=1` "Test Measles Cluster").

## Session 10 (2026-07-11 later, HOME `_hansell_`) — D1/D2 + Mortality built; CUT OFF by usage limit
Joseph: "continue working on the programs… I'll inspect once all programs done" — then, ~30 min
in, **stopped the build to conserve his usage limit** and asked for a detailed shutdown + a
standing model policy (see below). He also set a cadence mid-session: **after each finished
program, ping him and ask whether to continue** — that cadence stands next session.

**DONE this session (all committed together with this docs sync, per his choice):**
- **D1/D2 rate/ratio display uplift — ADR-023, PROPOSED (needs his ratification):** rates stored
  already-multiplied (config formulas do `… * 100000` explicitly; `rate_multiplier` is only the
  display-unit label); new `display_unit()`; `/api/trend` now display-ready (fixes a real
  pre-existing bug: Trends showed "0.04%" for 4% coverage); `/api/coverage` + `/api/indicators`
  expose `rate_multiplier`/`unit`; status bands (on/near/below) now percentage-only; `_RATE`
  codes never summed across slices (recomputed like `_PCT`). Files: `analytics.py`,
  `Trends.jsx`, `test_rate_display.py` (10 new tests).
- **Vital Stats Mortality built:** 38 `MORTA_*` indicators seeded (live in THIS machine's DB);
  split configs `morta_mmr` + `morta_imr` over the one workbook (per the analysis' option a);
  NIR rollup row skipped (`data_start_row: 1`, sibling convention); col-33 mapped by index as
  Indirect-combined (label lies, FLAG M1); registered in `upload_catalog.py` (new VITAL_STATS
  program) + `constants.js`. Validated clean; dry-run Q1 green (MMR 4 rows/144 staged/0 errors;
  IMR 4 rows/12/0); **12 cell values spot-checked = Excel's own cached values exactly**
  (NegOr: 98.28009828, 49.14004914, 147.4201474; IMR: 2.618…, 13.2678…). 48 backend tests pass,
  ruff clean, eslint clean on touched files.

**NOT done / cut off mid-step (the exact resume point):**
- **The Excel-face render check for the 2 new templates** (`/api/template-report?template_id=
  morta_mmr|morta_imr`) — I was grepping main.py for the endpoint's exact param names when
  Joseph stopped the build. Everything else in add-template's definition of done is checked.
- No live browser click-through (Chrome extension not connected, third session running).
- Tasks NOT started: Natality, Leprosy, Filariasis, Demographics dry-run finish, D4, Rabies,
  STH, D6 (Eye/Oral/FP), D5 (NCD Meds), Morbidity — the full per-task plan with per-program
  notes is in `session-handoff.md` "Next Session".

**Standing policy added to root CLAUDE.md ("Model & Token Policy"), carry it EVERY session:**
Opus 4.8 as main/orchestrator; sub-agents via Agent tool ALWAYS `model: "sonnet"` (Sonnet 5);
token-conservation habits; commit+push per green unit; ping-per-program cadence.
Joseph: "continue with the rest of the programs and have it checked once I get back." Built every
program/file that is unblocked (no schema decision, no DOH fix needed), one at a time, each
validated + dry-run parsed against its real `.xlsx` and spot-checked against the sheets' own cells.
**Nothing written to the live DB — all dry-run only; awaiting Joseph's UI golden-path check.**
Commits (all pushed, verified): `8a2788f` (parser fix + HIV/HepB/Syphilis finish), `a505662`
(WASH water), `4d2115e` (Geriatric screening), `83bf708` (Maternal Care Prenatal, 9 configs),
`7f22aa9` (MC Post Partum + Intra Partum Birth Weight), `3230975` (MC Intra Partum
SHP/DT/Outcome — completes Maternal Care), `0d3447c` (NCD Mental Health, sensitive), `354f3a1`
(NCD Cancer + Risk Factors).
- **HIV/HepB/Syphilis signed off** — real files found on this machine; validated, 69 cell values
  verified. **Fixed a real parser bug** (`is_annotation_row` in `parser.py` + `test_annotation_rows.py`):
  sheet footer text ("Source: DOH-FHSIS", "Legend:") in the PSGC column was being reported as
  location errors. Confirmed the sensitive-data RBAC masking is genuinely built (`can_view_sensitive`).
- **New programs/files built (all config-only unless noted):** WASH water (`envi_water`, first
  municipality-level new program); Geriatric screening (`ger_screening`, 49 ind; re-derived DQC
  catches the real GER-1 data bug); **Maternal Care COMPLETE** — Prenatal (9 configs), Post Partum
  (4), Intra Partum (4) = 17 templates, 13 files, incl. same-bracket recomputes for the 8ANC/4PNC
  shift bugs and split configs (D3) for the a/b/c sheet-groups; NCD Mental Health (`ncd_mh`, 13
  ind, **all is_sensitive=TRUE** per ADR-021), NCD Cancer (`ncd_cacx` + `ncd_brca`), NCD Risk
  Factors (`ncd_ra_adults` + `ncd_ra_sc`).
- ~24 new configs, ~520 new indicators seeded. `bootstrap_db.py` idempotent; run it on any machine
  that needs these seeded. 38 backend tests still pass, ruff clean throughout.
- **Everything remaining is genuinely blocked** on a Joseph decision or DOH action (see the
  updated "Open work" and the consolidated summary §5/§7):
  - **D1/D2 (non-% rates + unbounded ratios, not supported end-to-end):** Vital Stats (Mortality,
    Natality), Leprosy, Filariasis CDR/Lymph, Demographics ratio *display*.
  - **D6 (row-dimension mechanism):** NCD Eye Health (age-as-rows), Oral Health, Family Planning.
  - **D5 (per-column cumulative rollup) + source fix:** NCD Meds (also has the 106-row wrong-region
    Dec block).
  - **D4 (sum-of-parts reconciliation DQC rule type):** deferred sub-rules in WASH water, Intra
    Partum DT/DO, NCD Risk Factors cross-template check, STH.
  - **D7/D10 (disease-as-row schema):** Morbidity.
  - **Parser change (period-varying extra_sheets):** Rabies.
  - **DOH source fixes / clarifications:** WASH sanitation (stray Q3/Q4 col), Natality Q2 col,
    Schistosomiasis (scope Qs), Filariasis MDA (wrong region).
  - **Blocked on DOH entering real data:** Demographics facility/workforce (file has only
    population), Geriatric SC Immunization (file entirely zero/blank).
- **Not done:** live browser UI check (Chrome extension not connected this session — same as
  Session 8); real (non-dry-run) uploads (held for Joseph's golden-path review); full shutdown
  doc/memory ceremony beyond this entry (run `run shutdown protocols` when ready).

## Session 8 (2026-07-10, HOME) — PHRIC public site: landing + 4 cluster pages built
- **Joseph pivoted the PHRIC site from "parked" to "build now."** He wants the public-facing
  skeleton up and linkable to internal clients before higher-up approval for full public access —
  even though only the Health Statistics dashboard has real data behind it today. He'd separately
  found a design handoff bundle (`design_handoff_phric_site/`, an untracked folder on this
  machine's Desktop) matching one Joseph confirmed he already has as `PHRIC site.zip` in his
  Downloads folder — same 12 files, verified byte-identical via zip listing, so the repo copy was
  redundant and moved out (see Machine-local state below), not deleted.
- **Four architecture decisions locked via direct questions before building** (ADR-022): same
  React app, not a separate frontend; landing page becomes the site root (`/`), existing `Login`
  moves to `/login`; the 4 cluster pages (Health Statistics, Epidemiology Surveillance, Research,
  Laboratory) ship **public-state only** — the design's logged-in variant (unblurred tables,
  working downloads) is real future work, not built this session; Epi Surveillance's
  "+ Submit ESR Report" button links to the existing `/esr/new` form rather than rebuilding it.
- **Built end-to-end:** `frontend/src/pages/public/` (Landing, HealthStatistics,
  EpidemiologySurveillance, Research, Laboratory) + a shared scaffold
  (`frontend/src/components/public/ClusterPage.jsx`, `PublicChrome.jsx`, `publicTheme.js`,
  `public.css`) — the 4 structurally-identical cluster pages (gov bar → header → hero → report
  cards → blur-locked table → footer) are driven by per-page config objects through one scaffold
  component instead of 4 copies of the same JSX. Fonts (Sora + Plus Jakarta Sans) added to
  `index.html`; the DOH/PHRIC logo copied into `frontend/public/images/phric-logo.png`.
- **Every "Sign in with Google" trigger in the prototype was design-only** (the handoff's own
  README says so — no real OAuth, just a `isLoggedIn` boolean flip) — replaced with a
  "Staff Sign In" pill that routes to `/login`; the real JWT login flow is completely unchanged,
  it just moved off the site root.
- **`App.jsx` rewired**: `/` → `Landing`, `/login` → the existing `Login` page,
  `ProtectedRoute`/`PermissionRoute` redirect to `/login` (was `/`), catch-all redirects to `/`
  (was `/home`). `services/api.js`'s 401 interceptor and `Navbar`'s logout also updated to
  `/login`. All existing protected/admin routes under `/home` untouched.
- **Verified:** ESLint clean (0 errors project-wide — 9 pre-existing warnings in unrelated old
  files, none in new code), production build compiles clean, all 5 new routes + the logo asset
  return 200 on the running dev server. **Not done: a live browser click-through** — the Claude
  Chrome extension wasn't connected this session. Joseph reviewed the pages himself in his own
  browser afterward and confirmed they look right ("checked the pages, all good for me").
- **Committed and pushed this session** — asked Joseph how to handle the pending code per the
  halt-and-ask rule; he chose to commit it together with docs/memory. See Git section below.

## Session 7 (2026-07-09, OFFICE) — Infectious Disease (HIV/HepB/Syphilis) build started
- **Started the next program per the build-priority order**: HIV-Syphilis-HepaB antenatal
  screening, the recommended-first sub-group of `INFECTIOUS_DISEASE` (smallest clean group,
  exercises sensitive-data RBAC end-to-end). 38 indicators seeded (`HIV_*`/`HEPB_*`/`SYPH_*`,
  quarterly, age-band disaggregated 10-14/15-19/20-49; Syphilis has an extra Treated group HIV
  and HepB don't). 3 configs written: `infec_hiv.json`, `infec_hepatitisb.json`,
  `infec_syphilis.json` — each parses clean as JSON, columns line up with the seeded codes.
  Registered in both `upload_catalog.py` (`INFECTIOUS_DISEASE` program, "Infectious Disease"
  sub-program) and `constants.js` `TEMPLATES` — the two-places gotcha from the Demographics
  build, applied correctly this time without re-discovering it.
- **Sensitive-indicator policy expanded** (ADR-021): CLAUDE.md's list now also covers
  Syphilis-treated (discloses reactive status one hop removed), Hepatitis B reactive,
  Morbidity's future HIV/syphilis rows, Leprosy, and NCD Mental Health/mhGAP — promoting the
  consolidated summary's Tier 2/3 candidates into locked Tier 1 policy. All new sensitive
  indicator codes seeded with `is_sensitive=True`.
- **Indicators confirmed live in this (office) machine's DB** — `bootstrap_db.py` was run this
  session; `SELECT count(*) ... WHERE program=INFECTIOUS_DISEASE` = 38, matches the seed file.
- **Not yet done — genuinely blocked, not skipped:** `/api/validate-config` check and dry-run
  parse + cell-value spot-check against the real `infec_hiv_nir.xlsx`/`infec_hepatitisb_nir.xlsx`/
  `infec_syphilis_nir.xlsx` files. This (office) machine's `backend/data/INFECTIOUS_DISEASE/`
  only has the placeholder `.txt` — need to confirm which machine (if either) actually has these
  3 real files before that step can happen; unlike Demographics, this wasn't confirmed to be
  HOME-only, just unconfirmed. **First move next session: locate the real files, then finish the
  `add-template` skill's definition of done for this sub-group.**
- **Committed and pushed this session** (Joseph explicitly asked to commit + push the code, then
  run full shutdown protocols) — code commit `87950a4`, docs/memory shutdown commit follows (see
  Git section below).
- Remaining `INFECTIOUS_DISEASE` sub-groups not yet started: Schistosomiasis, Filariasis,
  Rabies, STH, Leprosy — all analyzed (Session 3), none built yet. Rabies still needs the
  `extra_sheets` parser change (period-varying sub-templates) before it can be built.

## Session 6 (2026-07-07, OFFICE) — ESR Verification Form built + Google Sheets line list (parked)
- **Context:** Joseph shared two design handoffs — a big future **PHRIC public site** bundle
  (`design_handoff_phric_site/`) and a **dedicated, more precise ESR Verification Form handoff**
  (`design_handoff_esr_verification_form/`, verified against the real DOH paper form). Only the
  ESR form was built this session, prompted by an immediate ask from Epidemiology: a form that
  auto-populates a Google Sheets line list they already use to digest events. Full ROADMAP entry
  under "PHRIC site + ESR reporting."
- **Scoping decisions locked before building** (see plan file / ADR-020): custom form → our
  FastAPI backend → Google Sheets push (not a bare Google Form); full form, not a stripped
  subset; ship on the **existing** JWT/role system (new `can_submit_esr` permission bit) — real
  **Google OAuth login + granular per-user permissions**, which Joseph asked about mid-scoping,
  was explicitly deferred to its own future initiative rather than bundled in (today's auth is
  100% username/password JWT, 100% role-derived permissions, zero per-user override anywhere in
  the schema); `gspread` + `google-auth` approved as new Python deps; v1 is submit-only, no
  listing/detail view (Epi reads the Sheet itself), Save Draft stays `localStorage`-only.
- **Built end-to-end, verified in the browser, not just unit-tested:**
  - Backend: `esr_reports` table (JSONB payload + `sheet_sync_status`/`sheet_sync_error`,
    modeled on the `audit_log.details` JSONB precedent — the only one in the schema), new
    `can_submit_esr` permission (`data_encoder`/`program_manager` true, `mancom`/`execom`
    false), `POST /api/esr-reports` (**the codebase's first Pydantic request model**,
    `app/schemas/esr_report.py` — every other endpoint takes raw `dict`, justified here by the
    payload's depth), `backend/app/services/google_sheets.py` (lazy `require_env` reads so CI/
    other machines aren't forced to have Google credentials just to boot or test). A Sheets
    failure **never** fails the submission — DB write is the source of record, Sheets is a
    best-effort mirror (ADR-020). 4 new tests (permission-gate, successful submit + audit,
    Sheets-failure resilience, validation), all mocked (no real DB/Google API in CI) — confirmed
    by hitting the real endpoint live: DB row + both `esr_submit`/`esr_sheet_sync_failed` audit
    entries landed correctly with `ESR_SHEET_ID` intentionally unset.
  - Frontend: `/esr/new` (gated route + sidebar link via the new permission), 8 new files under
    `frontend/src/pages/esr/` recreating the dedicated handoff pixel-close — own header/design
    system (Poppins/Mulish, green `#15764a`), not the app's Navbar chrome, since this is a
    different visual system from today's dashboard by design. `gspread`/`google-auth` pinned at
    whatever exact versions resolved on install (`6.2.1`/`2.55.1`), matching the repo's
    exact-pin convention; `httpx2==2.5.0` added to `requirements-dev.txt` (test-only, needed by
    `TestClient` — this environment's fork uses `httpx2`, not `httpx`).
  - **Found and fixed one real bug while wiring the schema file**: `bootstrap_db.py`'s
    `split_statements()` naively splits the whole SQL file on every `;`, **including ones inside
    `--` comments** — a semicolon in an early comment-block sentence ("submitted report; the
    whole form...") silently truncated the real `CREATE TABLE` statement and leaked stray
    comment text into it, so the table wasn't created even though the script reported "skipped
    (already present)" (a false-positive from the script's blanket try/except). Root-caused via
    manual `psql` apply + inspecting `split_statements()`'s actual output; fixed by rewording the
    comment to avoid the embedded semicolon, not by touching the fragile splitter itself — flag
    this splitter fragility if a future `.slq`/`.sql` file's comments ever use semicolons in
    prose.
- **4 rounds of UI polish after Joseph reviewed it live**, each verified in-browser via
  screenshot before moving on: (1) centered the Yes/No radio pair in III.d Assistance-needed's
  table column (was left-aligned in the cell); (2) IV. Response's per-row Status changed from a
  3-way radio cluster to a `<select>` dropdown (pending/ongoing/done); (3) fixed "Epidemiology
  Bureau" rendering in a mismatched serif fallback font — root cause was two-fold: `index.html`
  never actually loads Poppins/Mulish (only Barlow/Montserrat, for the rest of the dashboard),
  and the "Epidemiology Bureau" line itself had `fontFamily: "'Poppins'"` hardcoded **with no
  fallback stack**, unlike every other Poppins usage on the page (which goes through
  `esrStyles.js`'s `fonts.heading` and safely falls back to `system-ui, sans-serif`) — fixed
  both (added the Google Fonts `<link>` for Poppins/Mulish to `index.html`, switched the one
  hardcoded string to the shared `fonts.heading` token); (4)
    all 9 date/time fields (Detection, Filter and Verification, Assessment, Response) switched
    from free-text `mm/dd/yyyy`/`00:00 AM/PM` inputs to native `<input type="date"/"time">` —
    gives a real calendar/clock picker like Google Forms with zero new dependencies; values now
    serialize as ISO date/24h-time strings instead of free text (harmless — every field is a
    plain `Optional[str]` in the Pydantic model, no backend change needed).
- **Not done / explicitly parked, per Joseph:** Google Sheets credentials (service account +
  Sheet + `ESR_SHEET_ID`) — he said "let's park the google sheet for now." One-time setup steps
  are documented in `RUNBOOK.md`'s new section so this is a self-serve pickup later, not a
  blocker to remember contextually.
- **Committed and pushed this session** (see Git section below) — Joseph explicitly said
  "commit everything," matching the Session 5 precedent of bundling code with docs/memory when
  he opts in.

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

## Current focus (as of 2026-07-10, end of session 8)
Three tracks now, running in parallel:
1. **Go-live (v1.0.0).** `memory-bank/deployment-checklist.md` is the working checklist.
   Steps 1 (hardening) + 2 (deploy infra) DONE and verified end-to-end. **Domain purchased and
   IT has handed over server IP + SSH as of 2026-07-06** — the one remaining blocker is IT
   confirming inbound ports 80/443. Joseph is targeting live within ~2 weeks. Next concrete step:
   server prep (`RUNBOOK.md → Production — server deployment → One-time server prep`) once
   domain/IP are shared in chat — doesn't need to wait on the ports confirmation.
2. **Building out the other 10 programs.** Analysis phase COMPLETE (18/18, Session 3+4) and
   **consolidated into one summary** (Session 5):
   `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` — decisions D1–D10, sensitive-
   indicator ladder, DOH fix list, 11-step build-priority order. **Demographics built** —
   indicators + config done, `formula_type="ratio"` now real (was schema-only before). Blocked
   only on dry-run testing against the real file (HOME machine). **HIV-Syphilis-HepaB started
   Session 7** (2026-07-09) — 38 indicators + 3 configs done, registered, seeded live in this
   machine's DB; blocked on locating the real `infec_*_nir.xlsx` files for dry-run testing.
   Recipe: `.claude/skills/add-template` (formalizes what was `memory-bank/adding_templates.md`).
   This is the demo content for the health-professional higher-ups; deployment is only the
   delivery vehicle.
3. **PHRIC site + ESR reporting (Session 6, expanded Session 8).** Full ROADMAP.md entry under
   "PHRIC site + ESR reporting." ESR Verification Form built end-to-end (`/esr/new`, Session 6).
   **Session 8 pivot: the public site is no longer parked** — landing page + all 4 cluster pages
   (Health Statistics, Epidemiology Surveillance, Research, Laboratory) built public-state-only,
   pixel-close to the design handoff (ADR-022), committed and pushed. Still open: the auth-gated
   ("logged-in") variant of the 4 cluster pages, wiring real backend data into them, Google
   Sheets credentials for ESR (parked), and the Google OAuth + granular-permissions overhaul
   (deferred to its own initiative).

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
  DEMOGRAPHICS (50, committed `b07ac1f`) + INFECTIOUS_DISEASE (38, committed `87950a4`, Session
  7 — HIV/HepB/Syphilis sub-group only). Other 8 programs still have 0 indicators (current
  focus to fix, per the build-priority order).
- Upload pipeline: validate-first → staging (deltas) → conflict review → approve → commit.
- CHILD_CARE templates live: Immunization File 1 + 4, Nutrition 1–6, Sick 1–3, SBI annual.
  16 configs in `backend/app/services/configs/`, plus `demographics_annual.json`
  (config-validated; dry-run parse against the real file still pending, HOME machine only) and
  `infec_hiv.json`/`infec_hepatitisb.json`/`infec_syphilis.json` (structure-validated as JSON;
  `/api/validate-config` + dry-run parse against real files still pending, Session 7).
- Analytics: Home scorecard, Overview (11-program grid + Child Care all-KPI card + Needs
  Attention), Coverage, Rankings, Trends, Indicator Reports, Data Availability, Targets.
- Auth: JWT login (argon2 passwords), RBAC, user/role management, audit logging, rate-limited
  login. CI: pytest (33) + ruff + eslint on every push; GHCR images on version tags.
- **ESR Verification Form** (Session 6): `/esr/new`, `esr_reports` table (JSONB), best-effort
  Google Sheets mirror on submit (ADR-020). Google Sheets credentials parked — see RUNBOOK.md.
- **PHRIC public site — landing + 4 cluster pages** (Session 8, committed): `/`,
  `/health-statistics`, `/epidemiology-surveillance`, `/research`, `/laboratory`, public-state
  only (ADR-022). Login moved to `/login`.

## Open work (priority order — updated at Session 10 shutdown)
1. **Resume the program build-out where Session 10 was cut off** (full per-program plan +
   resume point: `session-handoff.md` "Next Session"). Order: finish the Mortality Excel-face
   render check → Natality → Leprosy → Filariasis CDR/Lymph → Demographics dry-run finish →
   D4 reconciliation DQC → Rabies + STH → D6 (Eye Health/Oral Health/Family Planning) →
   D5 + NCD Meds → Morbidity (own mini-phase, last). **Cadence: ping Joseph after each
   finished program and ask whether to continue.** ADR-023 (rates) needs his ratification.
2. **Joseph's UI golden-path check of Sessions 9+10 work, then real uploads** — everything is
   still dry-run only; nothing in the live DB beyond seeds.
3. **Go-live Step 3** — domain + SSH in hand (2026-07-06); waiting on IT for ports 80/443.
   Server prep can start in parallel (RUNBOOK). 2-week target from 07-06 has slipped — re-ask.
4. **Google Sheets setup for ESR reports** (parked; self-serve steps in RUNBOOK.md).
5. **PHRIC public site follow-ups**: auth-gated cluster-page variant; real data wiring;
   Google OAuth + granular permissions (own design pass).
6. **Parked decisions** (Joseph, when ready): stash@{0} Overview Card (this HOME machine);
   small-cell suppression cutoff; data-dictionary greenlight; one `is_sensitive` bit vs tiered
   RBAC (ADR-021 open question).
7. Remaining CHILD_CARE Immunization files 5–8 when real data arrives.
8. Deferred refactors: split `backend/main.py` (~1400 lines) + oversized frontend pages;
   9 cosmetic ESLint warnings.
9. **Blocked on DOH (not us):** WASH sanitation Q3/Q4 col, Natality Q2 col, NCD Meds Dec block,
   Schisto/STH clarifications, Filariasis MDA scope; data entry for Demographics
   facility/workforce + Geriatric SC Immunization.

## Done this session (session 8), closed out
- ✅ PHRIC public site landing + 4 cluster pages built, Joseph-reviewed live, committed and
  pushed together with this docs/memory sync (his choice, per the halt-and-ask rule) — see
  Session 8 log above and Git section below.

## Done this session (session 7), closed out
- ✅ Infectious Disease (HIV/HepB/Syphilis) — 38 indicators seeded + 3 configs written +
  registered in both catalogs + sensitive-indicator policy expanded (ADR-021) — see Session 7
  log above. Not signed off: dry-run parse against real files (blocked, files not located yet).

## Done this session (session 6), closed out
- ✅ ESR Verification Form built end-to-end (backend + frontend), verified live in the browser,
  4 rounds of UI polish after Joseph's review — see Session 6 log above for full detail.
- ✅ Google Sheets integration wired but credentials intentionally parked per Joseph.

## Done session 5, closed out
- ✅ Consolidated summary built, 2 new skills created, Demographics pilot built end-to-end
  (indicators + config + validation + UI confirmation) — see Session 5 log above for full detail.
- ✅ Go-live blockers narrowed from 3 to 1 (domain + SSH done; ports pending).

## Data currently in DB (per-machine — DBs are NOT git-synced, check on whichever machine you're on)
**Office machine (confirmed 2026-07-09, Session 7):** `health_data` and `staging_health_data`
both at 7,538 rows (CHILD_CARE test data), `esr_reports` has 1 real row (`id=1`, "Test Measles
Cluster", from Session 6's live browser verification). Indicators: CHILD_CARE 247 +
DEMOGRAPHICS 50 + INFECTIOUS_DISEASE 38 (all three confirmed seeded live this session).
**HOME machine (last confirmed 2026-07-04, may be stale — re-check there):** Jan 2026 monthly
(CPAB/BCG/HepaB, DPT-HiB-HepB, OPV, IPV, PCV, MMR, FIC — 6,072 rows/92 indicators), Q1 2026
quarterly (Nutrition, Sick — 295 rows/74 indicators), Annual 2026 (Nutrition MAM/SAM, SBI
Td/MR/HPV — 396 rows/27 indicators). No February data of any kind (confirmed 2026-07-04).
NOTE: admin's password hash is argon2 on both machines (upgraded live during testing).

## Git
- Work goes **directly on `main`** (sole developer). Push when done.
- **2026-07-10 session 8 (HOME, hostname `_hansell_`):** per the shutdown protocol's halt-and-ask
  rule, Joseph was asked how to handle the pending PHRIC public site frontend code (5 new page
  files, 4 new shared component files, 4 modified files — `App.jsx`, `index.html`, `Navbar.jsx`,
  `services/api.js`) — he chose to commit it together with this docs/memory sync. See
  `session-handoff.md` for the verified pushed commit hash.
- **2026-07-09 session 7 (OFFICE):** Joseph asked to commit + push the Infectious Disease code
  immediately, then run full shutdown protocols. Code committed as `87950a4`; docs/memory
  shutdown sync committed and pushed separately (see `session-handoff.md` for the verified hash).
- **2026-07-06 session (OFFICE):** pulled clean to `c2cb1e9` at startup (10 commits behind from
  the 3 HOME sessions on 07-04/07-05). Asked Joseph explicitly how to handle the pending code
  (Demographics build) vs. docs/memory at shutdown, per the halt-and-ask rule — **he chose to
  commit everything together**. Pushed as `b07ac1f`, verified (local/origin match, no "ahead").
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
