# Changelog

All notable changes to this project are recorded here. This file is the
**human-readable source of truth for what changed in each release**; the
machine-readable version number lives in `frontend/package.json`. The two must
always agree (a future CI check will enforce it).

- Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
- Versioning: [Semantic Versioning](https://semver.org/) on the **0.x** line —
  we are pre-1.0 (in development). **MINOR** (0.→**X**.0) = new features;
  **PATCH** (0.9.→**X**) = bug fixes only. **1.0.0 is reserved for the first
  ICTU production deployment.**
- Newest release on top. Day-to-day work lands under **[Unreleased]** and is
  cut into a dated version when released.

## [Unreleased]

### Added
- **Rate & ratio indicators are now first-class (D1/D2, ADR-023 — proposed).** New
  `display_unit()` helper; `/api/trend`, `/api/coverage`, and `/api/indicators` expose
  `rate_multiplier`/`unit`; rates are stored already-multiplied (62.5 = "62.5 per 100,000")
  with the multiplication explicit in each config formula; unbounded ratios (Demographics)
  display as plain numbers. Coverage status bands (on/near/below) now apply to percentage
  indicators only — a mortality rate has no coverage target. New `test_rate_display.py`
  (10 tests) locks the conventions in.
- **Vital Statistics — Mortality program** (first program built on the rate uplift): 38
  indicators (`MORTA_*`), split configs `morta_mmr` (MMR family, 'a' sheets, 13 raw inputs +
  23 recomputed totals/ratios ×100,000) + `morta_imr` (IMR family, 'b' sheets, ×1,000) over
  the one physical workbook. All Total/Ratio columns recomputed from raw counts — including
  col 33, whose header label lies ("d4" for what is formula-verified as the Indirect-combined
  g4 ratio, FLAG M1). The NIR region rollup row is skipped (derivable). Registered in the
  Upload catalog (new Vital Statistics program) and Indicator Reports.
- **Vital Statistics — Natality** (`nata_lb_abr_rabr`, 14 ind): Live Births + Adolescent Birth
  Rate (per 1,000) + Repeat ABR. Q1/Q3/Q4 mapped; **Q2 excluded** (structurally missing the
  ABR<10 column — DOH-blocked). 6 cells spot-checked vs Excel exactly (incl. both ABR rates).
- **Infectious Disease — Leprosy** (`infec_leprosy`, 100 ind, ALL `is_sensitive`): 5-tab annual
  (Registered / Newly-Detected / Confirmed / Treated / Completed-MDT / Grade-2-Disability). Three
  source bugs fixed in config not copied (missing ×10,000 prevalence; "E.Total" rate-not-sum;
  #REF! all-ages %treated). Rates ×10k/×100k/×1M (ADR-023). Cross-sheet treatment %s derived via
  `denominator_source`. **DOH sample has no case data yet** — verified via populations + structure.
- **Infectious Disease — Filariasis** (`infec_cdr_filariasis` + `infec_lymph_eleph_hydro`, 49 ind):
  Case Detection Rate (positive/examined per NBE/RDT) + chronic morbidity counts (Lymphedema /
  Elephantiasis / Hydrocele). MDA file **excluded** (non-NIR data + broken 15+/2+ formulas). NIR is
  non-endemic so the source is legitimately zero — configs verified structurally.
- **Infectious Disease — Rabies** (`animal_bites` + `infec_rabies_base/cat2arv/cat3/source`, 52 ind):
  bites/deaths + case-fatality rate, and exposure by WHO category / ARV completion / ARV+RIG /
  animal source, built as **split configs** (avoids the period-varying-`extra_sheets` gap). Real Q1
  data; 8+ computed cells spot-checked vs Excel exactly.
- **Infectious Disease — STH deworming** (`infec_sth_deworm`, 21 ind): MDA coverage (School- /
  Community-based). Semestral rounds mapped Jan→Q1, July→Q3; the 4 nationwide leftover sheets
  excluded. Real data verified vs Excel. (STH screening cascade deferred — encoder denominator
  question.)
- **D4 — reconciliation DQC rule type (ADR-024, proposed).** New `run_dqc_rules()` `"reconciliation"`
  rule (`mode: equals | at_most`) for "sum of parts == / ≤ whole" checks the older
  `over_threshold`/`sequence` rules couldn't express. None-skipping + DECIMAL(15,4) rounding; 8 new
  unit tests. Wired into Rabies groups b/d, where it fires on real data and matches the source
  template's own "Check Data" cells (surfacing genuine DOH data gaps the parser was blind to).

### Fixed
- **Audit-log failures are no longer silently swallowed** — `write_audit()` used to catch
  every exception and `pass`, so a failed insert left no trace (a Data Privacy Act compliance
  gap: the action succeeded with no audit record and no way to know). Failures are now logged
  with action/entity context via the standard `logging` module, and the DB connection is
  released in a `finally` block (previously it leaked whenever the insert raised). The
  caller-facing contract is unchanged: auditing still never raises.
- **CI pytest collection was broken** — `test_annotation_rows.py` used `from backend.app...`
  while every other test (and `conftest.py`'s `sys.path` setup) uses `from app...`, which
  crashed pytest collection for the whole suite before any test could run. Also fixed a
  masked second bug: `requirements-dev.txt` was pinned to `httpx2==2.5.0` (a typo — `httpx2`
  is a real, separate PyPI package with its own `httpx2` module) instead of `httpx==0.28.1`,
  which `starlette.testclient`/FastAPI's `TestClient` actually imports.
- **Trends page displayed percentages on the wrong scale** — a stored 0.04 ratio (4% coverage)
  rendered as "0.04%". `/api/trend` now returns display-ready values (percentages ×100) plus
  the proper unit string; the page shows "4.0%".

### Added (earlier)
- **PHRIC public site — landing page + 4 cluster pages** (`/`, `/health-statistics`,
  `/epidemiology-surveillance`, `/research`, `/laboratory`). Recreated pixel-close from the
  `design_handoff_phric_site/` design handoff, public (logged-out) state only: hero sections,
  report-card grids, blurred/locked data-table teasers. The 4 cluster pages share one scaffold
  (`frontend/src/components/public/ClusterPage.jsx` + `PublicChrome.jsx`) driven by per-page
  config objects rather than 4 duplicated layouts. Every "Sign in with Google" trigger in the
  prototype (design-only, no real OAuth) is replaced with a "Staff Sign In" pill that routes to
  `/login` — the existing JWT login flow is unchanged, it just moved off the site root. The
  existing internal dashboard (`/home` and everything under it) is untouched. See ADR-022.
- Existing login page moved from `/` to `/login`; unknown routes now redirect to the new public
  landing page (`/`) instead of `/home`.
- **ESR Verification Form** (`/esr/new`) — Epidemiology asked for a way to submit event-based
  surveillance reports that auto-populate a line list they already work from. New
  `can_submit_esr` permission (`data_encoder`, `program_manager`); `POST /api/esr-reports` stores
  the full form as JSONB (source of truth) and best-effort mirrors a summary row into a Google
  Sheet via `gspread` — a Sheets failure never blocks the submission (see ADR-020). Frontend
  recreates the dedicated ESR design handoff pixel-close, including native `<input type="date"
  /time">` pickers and a Yes/No-as-radio-buttons fix over the prototype's checkboxes. Google
  Sheets credentials are parked for now (`RUNBOOK.md` has the one-time setup); submissions save
  fine in the meantime with `sheet_sync_status='failed'`.
- **Demographics program** — first non-CHILD_CARE program built (50 indicators, single annual
  snapshot config covering facility density and health workforce density). Introduces the
  dashboard's first `formula_type="ratio"` indicators (population/households-per-resource, no
  percentage ceiling). Config-validated; dry-run parse against the real source file still
  pending (file only available on the HOME machine as of 2026-07-06).
- Two new Claude Code skills: `analyze-template` (Excel template inspection recipe) and
  `add-template` (seed → config → validate → dry-run build loop with a machine-checkable
  definition of done), formalizing the per-program build process for the remaining 9 programs.
- **Infectious Disease program** — HIV/Hepatitis B/Syphilis antenatal-screening
  sub-group: 38 indicators, 3 configs (`infec_hiv`, `infec_hepatitisb`, `infec_syphilis`),
  quarterly + age-band disaggregated (10-14/15-19/20-49). Sensitive-indicator policy expanded
  (see ADR-021) to cover Syphilis-treated and Hepatitis B reactive alongside the existing
  HIV/Syphilis-reactive entries. Config validation + dry-run parse against the real source files
  now pass (all 3 files × 4 quarters, 0 errors); 69 cell values hand-verified against the source
  spreadsheets. The blank Syphilis population column is confirmed as a DOH-side data gap (parser
  stores `None`, not a fabricated 0), not a parser bug.

- **WASH — Water Supply program (first file)** — `envi_water` template: 11 indicators covering
  household Basic Safe Water Supply (BSWS Levels I/II/III + total) and Safely Managed Drinking
  Water Services, all as a share of Projected Number of Households. First **municipality-level**
  new program (66 ingested rows: 3 provinces + 63 LGUs; the region row is recomputed, not
  ingested), so it exercises the maps/rankings drill-down that the 5-row programs can't. Quarterly,
  no age/sex, no sensitive indicators. Validated + dry-run parsed against the real file (all 4
  quarters, 0 errors); 18 cell values hand-verified. DQC flags coverage over 100% of projected
  households on all five percentage columns (7 genuine over-100% rows caught in real Q1 data). The
  file's secondary "Level I + Level III ≥ Safely Managed" cross-check is deferred — it needs a
  sum-vs-value reconciliation DQC rule type that doesn't exist yet (consolidated-summary decision
  D4). The sibling sanitation file is a separate later build (it has a known Qtr3/Qtr4 column-shift
  needing a DOH-side source fix).

- **Geriatric Health program (first file — Screening)** — `ger_screening` template: 49 indicators
  covering the DOH Geriatric Screening Tool (9 domains — Memory, Depression, Polypharmacy, Urinary
  Incontinence, Functional Capacity, Malnutrition, Hearing, Vision, Fall Risk), plus screened
  coverage, an "at least one positive" union, and care-plan/referral follow-up. Province/HUC
  rollup (4 ingested rows), quarterly, Male/Female split, no sensitive indicators. Validated +
  dry-run parsed against the real file (0 errors); 75 values verified against the source (3 raw +
  72 computed against the sheet's own cells). The DQC is **re-derived, not ported** — the source
  file's 18 logical-consistency rules are all dead (anchored one row past the real data). The new
  `sequence` rules ("screened ≥ at-least-one ≥ each domain") correctly catch the real GER-1
  data-entry error in the shipped Q1 sample (City of Bacolod reports 5 domains positive but "at
  least one" = 0; Negros Occidental reports 35 screened, 0 at-least-one). The program's second file
  (Senior Citizen Immunization) is a later build, blocked: its shipped file is entirely
  zero/blank, so its Influenza-denominator bug can't be verified until DOH sends populated data.

- **Maternal Care — Prenatal sub-program (all 8 files → 9 configs)** — the first flagship
  multi-file program: 8+ ANC completion (`pre_8anc`), BMI (`pre_bmi`), Td/Td2+ (`pre_td`),
  supplementation (`pre_supplementation`), anemia (`pre_anemia`), gestational-diabetes screening
  (`pre_gd`), deworming (`pre_deworming`), and BP-during-ANC + high-BP referral (`pre_bp_measure`
  + `pre_hpn_mgmt`, split per decision D3 because the two groups live in parallel `Q1a`/`Q1b`
  sheets). 157 indicators, no sensitive data. Files 2–7 are province rollups (4 ingested rows);
  Files 1 and 8 are municipality level (66 ingested rows). Validated + dry-run parsed against the
  real files (all 4 quarters, 0 errors); **278 computed values verified** against the sheets' own
  cells. Key recomputes (never trust the Excel label): anemia/GD **positive** percentages divide
  by the same-bracket **screened/tested** count, not population (the GD file's header mislabels
  this as population); 8ANC per-bracket tracked/completed are same-bracket sums and the total
  completion % is computed II/I despite the source's inverted `(I/II)` label. DQC over-100% rules
  caught genuine anomalies in the real data (a Siquijor town at 103% 8ANC completion, Bacolod at
  247% BP-measured). The shared "Projected Population (Under 1)" denominator is kept per-file
  (matching the Immunization precedent); whether it should be a single shared indicator is a
  naming decision left open (Flag P / Q-Pre-1).

- **Maternal Care — Post Partum (3 files → 4 configs) + Intra Partum Birth Weight (1 config)** —
  Post Partum: 4 PNC completion (`post_4pnc`), supplementation (`post_supplementation`), and
  BP-during-PNC + high-BP referral (`post_bp_measure` + `post_hpn_mgmt`, split per D3). Intra
  Partum: newborn birth-weight classification (`intra_bw`). 92 indicators. Validated + dry-run
  against the real files (0 errors); 108 values verified. `post_4pnc` **recomputes the completed
  totals same-bracket** to fix the source's confirmed cross-age-bracket shift bug (PP1-1) — the
  parser's values deliberately differ from the buggy sheet cells (NIR 10-14: 11 vs the source's
  85). `intra_bw` maps Live Births as a raw indicator and flags (does not fix) the source's
  self-referential Live-Births defect (INTRA2-1); its over-100% DQC correctly catches the real
  Bacolod birth-weight/live-births mismatch. Remaining Intra Partum file (SHP/FBD/Delivery
  Type/Outcome, 3 cross-referencing sheet-groups) is a follow-up.

- **Maternal Care — Intra Partum SHP/FBD/Delivery Type/Outcome (1 file → 3 configs)** —
  `intra_shp` (skilled attendant + facility-based delivery), `intra_dt` (delivery type:
  vaginal/cesarean/combined), `intra_do` (delivery outcome: full-term/pre-term/fetal-death/
  abortion). Split per D3 across the file's parallel `Q1a`/`Q1b`/`Q1c` sheet-groups. 70
  indicators. The three groups share one "Deliveries" baseline (groups b/c reference group a
  cross-sheet); all three configs map the shared `INTRA_DELIVERIES_*` codes, so the parser's
  skip-unchanged logic dedups on commit. FBD percentages divide by Deliveries Total (INTRA1-1:
  the source header mislabels the denominator as Physicians). Validated + dry-run against the
  real file (0 errors); 129 values verified against the sheet cells. **This completes the
  Maternal Care program** — all 13 files (Prenatal 8, Post Partum 3, Intra Partum 2) across 17
  templates. The source's sum-of-parts reconciliation checks (delivery type/outcome should sum to
  deliveries) are deferred pending the D4 reconciliation DQC rule type.

- **NCD — Mental Health (`ncd_mh`)** — first NCD file: mhGAP assessment counts by 4 age brackets
  (0-9/10-19/20-59/60+) x Male/Female, province/HUC rollup. 13 indicators, **all
  `is_sensitive=TRUE`** per the sensitive-indicator policy (NCD Mental Health / mhGAP, ADR-021 —
  stigma rationale, small province-level counts can identify individuals). Pure screening-count
  file with no percentage/denominator columns, so no DQC beyond the blank check. Validated +
  dry-run against the real file (0 errors); computed totals verified against the sheet cells.

- **NCD — Cancer (`ncd_cacx` + `ncd_brca`) and Behavioral Risk Factors (`ncd_ra_adults` +
  `ncd_ra_sc`)** — cervical cancer screening (VIA/Pap/HPV → suspicious/precancer follow-up),
  breast cancer early detection (BCEDS 30-69 high-risk + 50-69 targeted pathways), and behavioral
  risk factors (physical inactivity, diet, overweight/obesity, binge drinking, smoking by
  tobacco/vape/both + BTI) for adults 20-59 and senior citizens 60+. 130 indicators; 4 split
  configs over 2 physical files (per D3). Validated + dry-run against the real files (0 errors);
  198 computed values verified against the sheets' own cells. Chained denominators throughout
  (each stage divides by the prior stage's total), all matched to the source formulas rather than
  the labels. Known DOH-side data issue flagged, not fixed: the Risk-Factors "risk assessed"
  total should equal the meds template's figure but Negros Occidental's is a copy of the
  population count (RF-1) — an automated cross-template check needs the D4 reconciliation rule
  type. **This builds out every unblocked NCD file**; Eye Health (age-as-rows, needs D6) and Meds
  (wrong-region source block + year-to-date cumulative columns, needs a source fix + D5) remain
  blocked.

### Fixed
- **Sheet footer/annotation rows are no longer reported as location errors.** The Infectious
  Disease templates are the first whose sheets carry footer text ("Source: DOH-FHSIS", "Legend:",
  asterisk/zero notes) in the PSGC column; the parser flagged each as "Location not found." A new
  `is_annotation_row()` helper skips a row only when it can't resolve to a location **and** every
  mapped data cell is blank — a genuinely mis-located data row (with values) still errors as
  before. Covered by `backend/tests/test_annotation_rows.py`.

### Security
- **Password hashing migrated to argon2** — new hashes are argon2id; existing
  bcrypt hashes still verify and upgrade to argon2 transparently on the user's
  next successful login. Bootstrap now creates argon2 admin hashes. Closes the
  long-standing "bcrypt → argon2" gap from SECURITY.md.
- **Fail-fast secrets** — removed the hardcoded fallback values for
  `JWT_SECRET_KEY` and `DB_PASSWORD`; the app now refuses to start without real
  values from the environment (new `backend/app/core/env.py` + tests).
  `seed_indicators.py`'s duplicated connection config (with its own password
  fallback) now uses the shared `get_db_config()`.
- **Login rate limiting** — `/api/login` capped at 10 attempts/minute per
  client IP (`slowapi`; X-Forwarded-For-aware behind the nginx proxy), closing
  the brute-force gap.
- **CORS locked down** — default origins are now the explicit local-dev pair
  instead of `*`; production must set `CORS_ORIGINS` to the real site origin.
- **Security headers** — production nginx now sends `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` (HSTS deferred
  to the TLS-terminating proxy).

### Added
- **Container healthchecks** for backend and frontend in
  `docker-compose.prod.yml`; frontend now waits for a *healthy* backend.
- **Caddy TLS termination** — new `caddy` service (ports 80/443) in the prod
  stack with automatic Let's Encrypt certificates when `SITE_ADDRESS` is a real
  domain (`:80` = plain-HTTP parity testing). Sends HSTS. Frontend nginx is no
  longer published to the host — Caddy is the only entry point.
- **Nightly DB backups** — `db-backup` sidecar dumps to `./backups/` (gzipped,
  30-day retention). Off-server copy + restore procedure documented in RUNBOOK.
- **Release images to GHCR** — pushing a `v*` tag makes CI build the production
  backend/frontend images and publish them to GHCR (after tests pass); the
  server deploys with `IMAGE_TAG=vX.Y.Z docker compose pull && up -d`.
- **RUNBOOK server-deployment section** — one-time server prep, first deploy,
  release/rollback procedure, backup off-server copy, restore drill.

### Fixed
- **Login now returns 503 with a friendly message when the database is
  unreachable** (was a raw 500).
- **SECURITY.md corrected to match the code** — sensitive indicators are fully
  excluded for unauthorized roles (not "aggregated totals only"); auth section
  updated for argon2/fail-fast/rate-limit; known-gaps table pruned of closed items.
- **Production image build was broken** — `NavBar.jsx` renamed to `Navbar.jsx`
  to match all 11 imports. Windows dev (case-insensitive) masked it; the Linux
  Docker build failed on it. First time the prod frontend image was built since
  the analytics pages landed.
- This changelog and a real version number (`0.9.0`), replacing the placeholder
  `0.0.0`. First step of an engineering-practices uplift (versioning + changelog).
- Coverage/alert thresholds moved into one config module
  (`backend/app/core/thresholds.py`), with the first tests for the on/near/below-
  target classification logic. Second step of the engineering-practices uplift.
- **CI gate** — GitHub Actions runs the backend pytest suite, `ruff` lint, and
  frontend ESLint on every push/PR to `main` (`.github/workflows/ci.yml`, two
  jobs). Third step of the engineering-practices uplift.

### Changed
- **Python dependencies pinned** — `requirements.txt` uses exact versions instead
  of `>=` ranges, so a fresh install can't silently drift onto a newer major
  version. Fourth step of the engineering-practices uplift.
- **ESLint cleanup** — fixed a Node/browser environment gap in `vite.config.js`,
  removed dead imports/variables across ~10 files, and turned off two React-
  Compiler-only lint rules that don't apply to this app (it doesn't use React
  Compiler). Frontend now lints clean.
- **Ruff added** — first Python lint tool for the backend; fixed the 2 unused-
  import issues it found. Backend now lints clean.

### Fixed
- **Home page scorecard** was always showing "Below Target" and a garbled coverage
  number (e.g. "0.77%" instead of "77%") — the status check compared ratio-scale
  values against percent-scale thresholds. Now shows the real percentage and the
  correct on/near/below status, matching every other page.

## [0.9.0] - 2026-06-29

First versioned baseline — a snapshot of everything already built for Track 1
(the province-level dashboard). Grouped by area, in plain language.

### Added
- **Data upload pipeline** — Excel (FHSIS templates) → validate-first dry run →
  staging (only new/changed rows) → conflict review → approve → commit to the
  live `health_data` table. Adding a new template is a JSON config change, not
  new code.
- **Templates live** — Immunization File 1 (CPAB/BCG/HepaB) and File 4
  (DPT-HiB-HepB), Nutrition Files 1–6, Management of the Sick Files 1–3, and the
  SBI annual set (Td, MR, HPV).
- **Analytics pages** — Home scorecard, Overview, Coverage, Rankings, Trends,
  Indicator Reports (API-driven), Data Availability, Targets.
- **Overview at-a-glance** — an 11-program performance grid (one card per
  program, each at its latest reported period, click to drill into the map).
- **Child Care card** — lists *every* sub-area KPI at once
  (Immunization / Nutrition / Sick / SBI), showing "—" where there's no data.
- **Needs Attention panel** — surfaces bottom-performing LGUs, over-100% data-
  quality flags, and locations that stopped reporting versus the prior period.
- **Auth & governance** — JWT login, role-based access control, user/role
  management, and audit logging on every data-changing action.
- **Containerization** — full Docker stack (PostgreSQL + backend + frontend),
  plus a production compose file (gunicorn behind nginx).
- **Build footer** — shows the running commit hash and build time in the app.

### Changed
- **Maps & Rankings are frequency-agnostic** — quarterly and annual indicators
  now resolve to their latest period with data (previously monthly-only).
- **Overview header** rescoped to the whole page; map filters labelled as such.

### Fixed
- **Birth-dose percentages** — CPAB/BCG/HepaB percentages had been stored 100×
  too large; recomputed and corrected (audit-logged), with a reusable
  data-quality audit script added.
- Sub-1.5% percentages now display correctly.

[Unreleased]: https://github.com/joseph-carrillo/health-stat-dashboard/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/joseph-carrillo/health-stat-dashboard/releases/tag/v0.9.0
