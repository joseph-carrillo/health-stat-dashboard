# Roadmap

> Checklist of milestones. `startup protocols` cross-references this against the git log and
> `memory-bank/project_state.md`. Keep it honest — `[x]` means it's actually in code.

## Phase 1 — FHSIS Excel upload → PostgreSQL (current)

### Foundation
- [x] Database schema + seed (128 locations, 11 programs, 34 periods, indicators)
- [x] Config-driven parser + DQC rules
- [x] Validate-first upload → staging (deltas) → conflict review → approve → commit
- [x] JWT auth, RBAC, user/role management, audit logging
- [x] React frontend with DOH branding
- [x] Full-stack containerization (db + backend + frontend) + prod compose
- [x] Sentinel-style session protocols + foundation docs
- [x] `reset db protocols` — data-only DB wipe (`scripts/reset-db.ps1`) for clean testing
- [x] Vite HMR fix for Docker-on-Windows (server.watch.usePolling)

### Analytics
- [x] Home scorecard
- [x] Overview (multi-indicator)
- [x] Overview at-a-glance — 11-program performance grid (latest period per program, click-to-drill)
- [x] Overview → Child Care card lists **every** sub-area KPI at once (Immunization / Nutrition / Sick / SBI), no-data as "—", click-to-drill (`GET /api/overview/indicators` batch)
- [x] Overview "Needs Attention" panel — bottom LGUs, over-100% DQC flags, stopped-reporting (`GET /api/overview/needs-attention`)
- [x] Overview header rescoped to whole-page; filters captioned "Map filters"; period moved to a maps header
- [x] Maps + Rankings frequency-agnostic — quarterly/annual indicators resolve to latest period (`resolve_coverage_period`)
- [x] Ranking consolidated onto the Rankings page (removed from Overview); Rankings broadened to full indicator set via shared config
- [x] Coverage + Rankings (province / HUC grouping)
- [x] Trends (SVG)
- [x] Indicator Reports (API-driven, province filter, computed columns, NIR rollup)
- [x] Data Availability, Targets

### Templates — Child Care (done)
- [x] Immunization File 1 (CPAB / BCG / HepaB)
- [x] Immunization File 4 (DPT-HiB-HepB)
- [x] Nutrition Files 1–6 (incl. File 6 annual MAM/SAM)
- [x] Management of the Sick 1–3 (Vitamin A, diarrhea/pneumonia)
- [x] Birth-dose % fix (CPAB/BCG/HepaB stored 100× too large) + reusable data-quality audit
- [x] SBI (Annual) — Td (#9), MR (#10), HPV (#11) configs + 27 indicators
- [ ] Remaining Immunization files (5–8) — when real data arrives

### Build out the other 10 programs (← active focus)
**Session 12 (2026-07-12) built every remaining CONFIG-ONLY program** — Natality, Leprosy,
Filariasis (CDR + morbidity), Rabies (5 split configs), STH deworming — plus the **D4
reconciliation DQC rule type**, and closed Mortality's last render-check + Demographics' dry-run.
All validated + dry-run parsed against real files + spot-checked against the sheets' own cells
(dry-run only, nothing in the live DB, awaiting Joseph's UI golden-path check). Indicator counts
now: CHILD_CARE 247, MATERNAL_CARE 319, INFECTIOUS_DISEASE 260, NCD 143, DEMOGRAPHICS 50,
VITAL_STATS 52, GERIATRIC 49, WASH 11. **8 of 11 program areas now have all currently-buildable
content done.** Everything still `[ ]` below needs a Joseph schema/parser decision (D5/D6/D7) or a
DOH/encoder action. Recipe: `.claude/skills/add-template`.
- [x] Scaffold `backend/data/<PROGRAM_CODE>/` intake folders (10 programs)
- [x] All 10 programs' `.xlsx` files dropped 2026-07-05 (46 files, 18 natural sub-groups)
- [x] **Analysis phase complete: 18/18 sub-groups documented** in
      `memory-bank/template_analysis/` — Infectious Disease (Schisto, Filariasis,
      HIV-Syphilis-HepaB, Rabies, STH, Leprosy), WASH, Demographics, Oral Health, Vital Stats
      (Mortality, Natality), Maternal Care (Prenatal, Post Partum, Intra Partum), NCD, Geriatric,
      Family Planning, Morbidity. _Done 2026-07-05, session 4._
- [x] **Consolidated all 18 write-ups into one Joseph-facing summary** — decisions D1–D10,
      sensitive-indicator ladder, DOH fix list, build-priority order:
      `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md`. _Done 2026-07-06._
- [x] **New skills added to formalize the per-program loop**: `.claude/skills/analyze-template`
      (read-only inspection recipe) and `.claude/skills/add-template` (seed → config → validate →
      dry-run loop with a machine-checkable definition of done). _Done 2026-07-06._
- [x] **Maternal Care and Services — COMPLETE (Session 9).** All 13 files → 17 templates:
      Prenatal (9 configs: `pre_8anc`, `pre_bmi`, `pre_td`, `pre_supplementation`, `pre_anemia`,
      `pre_gd`, `pre_deworming`, `pre_bp_measure`, `pre_hpn_mgmt`), Post Partum (4: `post_4pnc`,
      `post_supplementation`, `post_bp_measure`, `post_hpn_mgmt`), Intra Partum (4: `intra_bw`,
      `intra_shp`, `intra_dt`, `intra_do`). 319 indicators. Recomputes the 8ANC/4PNC cross-bracket
      shift bugs same-bracket; split configs (D3) for the a/b/c parallel sheet-groups. 278+
      cell values verified. **The Intra Partum DT/DO sum-of-parts reconciliation DQC is deferred
      pending D4.**
- [x] **Infectious Disease — HIV/HepB/Syphilis signed off (Session 9).** Real files found on the
      HOME machine; `infec_hiv`/`infec_hepatitisb`/`infec_syphilis` validated + dry-run, 69 cell
      values verified. Sensitive-data RBAC masking confirmed built. Fixed a real parser bug along
      the way (`is_annotation_row` — sheet footer text was being read as location errors).
- [x] **WASH — water file built (Session 9).** `envi_water`, 11 indicators, first
      municipality-level new program. Sanitation file still blocked (DOH source fix, below).
- [x] **Geriatric — screening file built (Session 9).** `ger_screening`, 49 indicators; DQC
      re-derived (catches the real GER-1 data bug). Second file (SC Immunization) blocked — DOH
      shipped it entirely zero/blank, nothing to verify.
- [~] **NCD — 3 of 5 files built (Session 9): Mental Health, Cancer, Risk Factors.** `ncd_mh`
      (13 ind, **all is_sensitive=TRUE** per ADR-021), `ncd_cacx` + `ncd_brca` (cervical + breast),
      `ncd_ra_adults` + `ncd_ra_sc`. 143 indicators. **Blocked:** Eye Health (age-as-rows → D6),
      Meds (106-row wrong-region Dec block needs a DOH fix + year-to-date cumulative columns → D5).
- [~] **Demographics — config done, but source file is nearly empty.** `demographics_annual`
      validated + dry-run (HOME machine). Only the population column is populated; every facility
      and health-worker count is blank in the source — **blocked on DOH entering the real data**,
      and the ratio *display* still needs D2. Introduced `formula_type="ratio"` (live in schema).
- [x] **Vital Statistics — COMPLETE (Mortality Session 10; Natality Session 12).** Mortality
      `morta_mmr` + `morta_imr`; Natality `nata_lb_abr_rabr` (14 ind — Q1/Q3/Q4 mapped, Q2
      EXCLUDED as DOH-blocked; rates per 1,000). 52 indicators. Natality spot-checked 6 cells vs
      Excel exactly. Both Mortality templates' Excel-face render check now closed. Built on
      ADR-023 (rates, **still proposed — Joseph to ratify**).
- [x] **Infectious Disease — Leprosy, Filariasis, Rabies, STH-deworming BUILT (Session 12).**
      Leprosy `infec_leprosy` (100 ind, ALL sensitive, 5-tab annual, 3 source bugs fixed in
      config); Filariasis `infec_cdr_filariasis` + `infec_lymph_eleph_hydro` (49 ind; MDA file
      EXCLUDED — non-NIR data); Rabies `animal_bites` + 4 split configs `infec_rabies_base/
      cat2arv/cat3/source` (52 ind, real Q1 data, 8+ cells verified); STH `infec_sth_deworm`
      (21 ind, real data verified). INFECTIOUS_DISEASE now 260 indicators. **NOTE:** Leprosy &
      Filariasis source files have no case data at DOH yet (Filariasis genuinely zero — NIR
      non-endemic; Leprosy a data-entry gap) — configs are correct + validated, verified via
      populations / structure. **Still blocked:** STH cascade (File 2 — encoder denominator
      question), Schistosomiasis (DOH scope clarifications).
- [ ] **NCD Eye Health** — **blocked on D6** (age-as-rows). **NCD Meds** — **blocked on D5** +
      DOH Dec-block fix.
- [ ] **Family Planning** — **blocked on D6** (quarters stacked as row-blocks in one tab).
- [ ] **Oral Health** — **blocked on D6** (quarters + age-bands stacked as rows).
- [ ] **Morbidity** — **blocked on D7/D10** (disease-as-row matrix; ~10,400 codes or a `diseases`
      table; no `psgc_column`). Its own mini-phase, last.

**⇩ DECISIONS FOR JOSEPH TO INSPECT & DECIDE NEXT SESSION ⇩**
These are the one-way doors that block every remaining program. Deciding them (especially **D1/D2**)
unblocks the most work. Full context per decision: `template_analysis/00_CONSOLIDATED_SUMMARY.md`.
- ~~New `formula_type="ratio"` for Demographics~~ — **resolved 2026-07-06**: schema already
  allowed the value; Demographics' 50 indicators use it (parse side). Display side is D2 below.
- ~~**D1 — non-percentage rate support**~~ — **IMPLEMENTED Session 10 (2026-07-11) as ADR-023,
  PROPOSED — ratify or reverse before more rate programs are built on it**: rates stored
  already-multiplied (62.5 = "per 100,000"), `rate_multiplier` is the display-unit label only,
  coverage status bands now percentage-only, `_RATE` codes recomputed (never summed) across
  period slices. Mortality, **Natality, Leprosy, Filariasis** are all now built on this.
- ~~**D2 — unbounded-ratio display**~~ — **IMPLEMENTED with D1 (ADR-023)**: ratios render as
  plain numbers, no 100% ceiling, no status colour. Demographics *display* unblocked (its
  source data is still blocked on DOH data entry).
- **D3 — split-configs for multi-sheet-group workbooks.** RESOLVED in practice — used this session
  for every a/b/c file (Prenatal BP, Post Partum BP, Intra Partum SHP/DT/DO, WASH, NCD Cancer/RA).
  No further decision needed; documented here so it's not re-litigated.
- ~~**D4 — "sum of parts = / ≤ whole" reconciliation DQC rule type.**~~ **IMPLEMENTED Session 12
  (ADR-024, PROPOSED).** New `run_dqc_rules()` rule_type `"reconciliation"` (`mode: equals|at_most`),
  None-skipping + DECIMAL(15,4) rounding, 8 unit tests. Wired into Rabies groups b/d, where it fires
  on real data and matches the source template's own "Check Data" DQC cells. Still-deferred backfills
  (add the rules to those configs when convenient): Intra Partum DT/DO (type/outcome sum to
  deliveries), NCD Risk-Factors cross-template check, STH cascade, Leprosy Registered≥Confirmed≥
  Treated≥Completed.
- **D5 — per-column rollup override (`rollup:"last"` vs default `"sum"`).** `ncd_meds_nir.xlsx`'s
  risk-assessment columns are year-to-date cumulative, not monthly flow — summing them would badly
  overstate. **Blocks: NCD Meds** (also needs the DOH Dec-block source fix).
- **D6 — row-stacked dimension parsing.** `sheet_map` maps one period to one tab; several files
  stack age-groups or quarters as row-blocks within a tab. **Blocks: NCD Eye Health (age-as-rows),
  Oral Health (quarters+age stacked), Family Planning (quarters stacked).**
- **D7/D10 — Morbidity disease-as-row schema.** Disease matrix (indicators on rows, not columns);
  ~10,400 codes (disease × age × sex) or a `diseases` reference table; no `psgc_column` (free-text
  location → name→PSGC lookup). Its own mini-phase, do last.
- **Rabies parser change** — `extra_sheets` assumes a fixed sheet name reused every period; can't
  express Rabies's period-varying sub-templates. **Blocks: Rabies.**
- **Open (from ADR-021):** whether one `is_sensitive` bit is enough, or a tiered RBAC scheme
  (age-band detail vs. total) is needed. Not blocking anything yet.
- Several sample source files have confirmed real bugs that must NOT be replicated in configs
  (not template-owner's fault to wait on — these are parser/config-author decisions): NCD's
  `ncd_meds_nir.xlsx` December sheet has 106 leftover wrong-region `#ERROR!` rows; Post Partum's
  `post_4pnc_nir.xlsx` has a cross-age-bracket formula shift inflating completion totals;
  Intra Partum's `intra_bw_nir.xlsx` "Live Births" is self-referential for 3 of 5 rows; Family
  Planning's "Demand Satisfied" KPI is structurally guaranteed to report 0%; Geriatric's
  `ncd_scimmunization_nir.xlsx` Influenza% divides by the wrong population column.
- A recurring "DQC conditional-formatting anchored one row past real data" bug (dead-on-arrival
  rules) recurs across NCD, Post Partum, and Geriatric files — don't port `sqref` ranges
  verbatim into `dqc_rules`; re-derive intended logic and anchor to the config's real row extent.
- ~~Sensitive-indicator list needs Joseph's decision~~ — **resolved 2026-07-09**: CLAUDE.md's
  "Sensitive Indicators" section expanded to include Syphilis-treated, Hepatitis B reactive,
  Morbidity's HIV/syphilis case-count rows, Leprosy, and NCD Mental Health (mhGAP). See ADR-021.
  Still open: whether one `is_sensitive` bit is enough granularity, or a tiered RBAC scheme is
  needed later.

### Remaining
- [ ] GeoJSON choropleth maps (`frontend/public/geojson/`)
- [ ] Deployment to IT's server (self-managed: SSH, public-facing, .com domain) — full plan in
      `memory-bank/deployment-checklist.md` (hardening → infra → go-live = v1.0.0)

## PHRIC site + ESR reporting (new track, started 2026-07-07)
Joseph shared two design handoffs for a future **PHRIC public site** (landing page + gated
Health Statistics portal + Epidemiology Surveillance/Research/Laboratory cluster pages) —
`design_handoff_phric_site/` and a more precise, dedicated `design_handoff_esr_verification_form/`.
- [x] **ESR Verification Form** (`/esr/new`) — full 5-section form (Detection, Filter and
      Verification, Assessment, Response, Report Generation) recreating the dedicated handoff
      pixel-close, incl. native date/time pickers and Yes/No-as-radio-buttons over the
      prototype's checkboxes. `POST /api/esr-reports` (new `can_submit_esr` permission on
      `data_encoder`/`program_manager`) stores the full submission as JSONB
      (`esr_reports` table) and best-effort mirrors a line-list row to Google Sheets — a Sheets
      failure never blocks the submission (ADR-020). 4 new backend tests, ruff/eslint clean.
      Verified end-to-end in the browser (submit → DB row → audit log; Sheets-failure path also
      confirmed since credentials aren't configured yet).
- [ ] **Google Sheets credentials** — parked at Joseph's request. One-time setup (service
      account + Sheet sharing + `ESR_SHEET_ID`) documented in `RUNBOOK.md`. Until done,
      submissions save fine but sit at `sheet_sync_status='failed'`.
- [x] **PHRIC public site pivot decided 2026-07-10**: the plan changed from "park the site" to
      "build the skeleton now" — Joseph wants public-facing pages live and linkable to internal
      clients (pre-higher-up-approval) even though only the Health Statistics dashboard has real
      data behind it. Locked decisions (ADR-022): same React app, not a separate frontend;
      landing page becomes the site root (`/`); the existing login moves to `/login`; the 4
      cluster pages (Health Statistics, Epidemiology Surveillance, Research, Laboratory) ship
      **public-state only** (blurred/locked data tables, no real auth-gated variant yet); the
      Epi Surveillance page's "+ Submit ESR Report" button links straight to the existing
      `/esr/new` form.
- [x] **Landing + 4 cluster pages built 2026-07-10** — recreated pixel-close from
      `design_handoff_phric_site/`: `frontend/src/pages/public/` (Landing, HealthStatistics,
      EpidemiologySurveillance, Research, Laboratory) + a shared scaffold
      (`frontend/src/components/public/ClusterPage.jsx`, `PublicChrome.jsx`, `publicTheme.js`,
      `public.css`) so the 4 structurally-identical cluster pages stay in sync via per-page
      config objects instead of 4 copies of the same markup. The prototype's simulated "Sign in
      with Google" was design-only (real auth is JWT) — every sign-in trigger is now a "Staff
      Sign In" pill routing to `/login`; logging in there still lands in the existing internal
      dashboard unchanged. `App.jsx` rewired: `/` → Landing, `/login` → the existing Login page,
      unknown routes redirect to `/` instead of `/home`. ESLint clean (0 errors on the new
      files), production build compiles. **Not yet done:** a visual click-through in a real
      browser (the Chrome extension wasn't connected this session) — Joseph reviewed the pages
      himself and confirmed they look right.
- [ ] **Google OAuth login + granular per-user permissions** — Joseph asked for this during ESR
      scoping (real "Sign in with Google" + an admin UI to set what an individual user can do,
      not just pick one of 5 fixed roles). Explicitly deferred to its own initiative — today's
      auth is 100% username/password JWT with permissions derived purely from a hardcoded
      per-role dict (`backend/app/core/auth.py` `ROLES`); no per-user override exists in the
      schema. Needs its own design pass (OAuth client setup, consent flow, a `users.permissions`
      or similar model) before building, not bundled into the ESR form.
- [ ] **Auth-gated ("logged-in") variant of the 4 cluster pages** — the design handoff specs a
      second render state (unblurred tables, working PDF/XLSX download pills, welcome-back
      hero) driven by an `isLoggedIn` boolean; only the public state shipped this session.

## Phase 2 — Web form input (future)
- [ ] Web form mirroring the FHSIS template → PostgreSQL (replaces Excel upload)
- [ ] Build so it does not block on Phase 1 internals

## Track 2 — LGU / barangay drill-down (future)
- [ ] Sub-province location reporting and dashboards

## Engineering-practices uplift (in progress — adapted from sibling production project)
Owner-approved plan, one reversible step at a time (propose → review → approve → build).
- [x] **C. Versioning + changelog** — `CHANGELOG.md` (Keep a Changelog) + SemVer 0.x;
  `package.json` is the source of truth; footer shows `v<semver> · <commit>`. Started 0.9.0,
  1.0.0 = first ICTU deploy (ADR-011). _Done 2026-06-29._
- [x] **E+G. Thresholds → config + first real tests** — moved coverage/alert cut-offs into
  `backend/app/core/thresholds.py` (one ratio-scale source of truth), merged the duplicate
  band-classifier functions, and shipped `test_thresholds.py` (happy-path + edges). Found and
  fixed a real bug while consolidating: the Home scorecard compared ratio values against
  percent-scale thresholds, so it always showed "Below Target" with a garbled percent — see
  ADR-012. _Done 2026-07-01._
- [x] **I. CI gate (pytest)** — `.github/workflows/ci.yml` runs the backend pytest suite on
  every push/PR to `main`. _Done 2026-07-01._
- [x] **I2. Frontend lint gate** — cleaned up all 32 ESLint errors: fixed the `vite.config.js`
  Node/browser env gap, deleted ~10 dead imports/variables, and turned off two React-Compiler-
  only rules (`set-state-in-effect`, `preserve-manual-memoization`) that don't apply — this app
  doesn't use React Compiler, and the flagged pattern (fetch-on-mount with a cleanup flag) is
  the codebase's deliberate, safe convention on every data page. Added `frontend-lint` as a
  second CI job (`npm ci` + `npm run lint`). 9 non-blocking warnings remain (missing hook deps),
  not part of this cleanup. _Done 2026-07-01._
- [x] **I3. Python lint gate** — installed `ruff` (`requirements-dev.txt`), fixed the 2 issues
  it found (unused imports in `auth.py` and `upload_catalog.py`), and added `ruff check` as a
  step in the `backend-tests` CI job. _Done 2026-07-01._
- [x] **F. Pin Python deps** — `requirements.txt` now uses exact `==` versions (was `>=`),
  matching what's actually installed and running. Rebuilt the backend image and re-verified
  clean. _Done 2026-07-01._
- [x] **J. Security & robustness hardening** (from the 2026-07-18 adversarial audit, ADR-025) —
  audit-log failures logged instead of swallowed; registration credentials moved out of the query
  string into a validated body + rate limit; DB connections released via try/finally at all 39
  acquisition sites (they leaked on any query error, with no pool behind them); `eval()` in config
  formula evaluation replaced by a whitelisted AST evaluator, verified identical across 3,390
  evaluations. 21 new tests (77 total). _Done 2026-07-23._
- [ ] **F. Privacy** — small-cell suppression (needs owner decision: cut-off count).
  ~~fix `SECURITY.md`~~ — doc side done 2026-07-04 (now correctly says full exclusion).
- [ ] **F. Data dictionary + provenance** — per-indicator numerator/denominator/bands; lock it.

## Deferred best-practices (next foundation pass)
- [x] Fail-fast on missing secrets (removed `os.getenv` fallbacks; `app/core/env.py`) —
  _done 2026-07-04, go-live checklist Step 1_
- [x] bcrypt → argon2 migration (upgrade-on-login; bootstrap creates argon2) — _done 2026-07-04_
- [ ] Split `backend/main.py` (1423 lines), `analytics.py` (1497), and oversized frontend pages
      (`Upload.jsx` 1018) — all over the 800-line cap in `coding-style.md`
- [ ] Roadmap milestones: add explicit exit criteria per phase
- [ ] **Decisions left open by ADR-025's hardening pass** (each needs Joseph — see ADR-025):
      connection pooling (sizing vs gunicorn workers); `approve_batch(force=True)` silently
      bypassing the conflict-review gate; JWT localStorage → httpOnly cookie before public
      go-live; program-scoping the staging read endpoints
- [ ] API self-version is hardcoded `0.1.0` in `main.py` while `package.json` (the ADR-011 source
      of truth) says `0.9.0` — one-line fix, not done this session to keep the shutdown commit
      docs-only

## Pending (external — team / higher ops)
- Template fixes: envi_sanitation, nata_lb_abr, morta_mmr, pre_gd_screening, Vitamin A, schisto
- Clarifications: BHW ratio, MAM denominator, 8ANC denominator, cervical cancer denominator
