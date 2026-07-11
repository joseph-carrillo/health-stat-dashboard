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
