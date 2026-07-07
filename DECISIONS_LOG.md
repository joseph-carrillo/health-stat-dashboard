# Decisions Log (ADRs)

Append-only record of architecture decisions. **Never edit a past ADR** — supersede it with
a new one. Newest at the bottom.

---

## ADR-001 — Narrow/tall schema for health values
**Status:** Accepted · **Date:** 2026 (foundation)
One row per `(indicator, location, period, value)` instead of wide columns-per-indicator.
**Why:** new indicators become data, not migrations; matches the config-driven parser and the
FHSIS template variety. **Trade-off:** queries pivot at read time; mitigated by indexes on
`indicator_id`, `location_id`, `period_id`.

## ADR-002 — Config-driven Excel parser
**Status:** Accepted · **Date:** 2026 (foundation)
Each Excel template maps to a JSON config in `backend/app/services/configs/`; the parser is
generic. **Why:** adding a template is a config change, not code. **Trade-off:** config schema
must be expressive enough (handled via DQC rules + computed-indicator definitions).

## ADR-003 — JWT auth stored in localStorage
**Status:** Accepted · **Date:** 2026 (foundation)
HS256 JWT, 8-hour expiry; token in `localStorage`, decoded client-side for role-gated UI.
**Why:** simple for a single-page internal tool; server still enforces roles via
`require_permission`. **Trade-off:** localStorage is XSS-exposed — the server, not the client
check, is the security boundary. Revisit (httpOnly cookie) before external exposure.

## ADR-004 — Validate-first upload with staging deltas
**Status:** Accepted · **Date:** 2026-06-10
Upload-to-staging is gated behind a dry-run "Validate Only"; only new/changed rows are staged;
conflicts are raised only on real value differences (percentages normalized to ratio first).
**Why:** keeps the staging area clean and review focused on genuine conflicts.

## ADR-005 — Two-track delivery strategy
**Status:** Accepted · **Date:** 2026
Track 1 = province-level dashboard (current), to get operational feedback fast. Track 2 =
LGU/barangay drill-down (later). **Why:** ship value before tackling the larger location set.

## ADR-006 — Full-stack containerization
**Status:** Accepted · **Date:** 2026-06-17
Backend and frontend are containerized alongside the already-containerized DB; `docker compose
up` runs the whole stack, with a separate `docker-compose.prod.yml` (gunicorn + nginx).
**Why:** reproducible environments across Joseph's two machines, a clean answer to IT ("yes,
the website is containerized"), and a deployable production image. Secrets moved to `.env`
(env-driven), CORS made configurable. **Trade-off:** `db.py`/`auth.py` still keep insecure
dev fallbacks (fail-fast deferred); bcrypt pinned `>=4.0,<4.1` because passlib 1.7.4 breaks on
bcrypt ≥4.1.

## ADR-007 — Sentinel-style session protocols + foundation docs
**Status:** Accepted · **Date:** 2026-06-17
Adopted Sentinel-FMS's `startup protocols` / `run shutdown protocols` discipline (in
`CLAUDE.md`), a `memory-bank/MEMORY.md` index + `project_state.md`, and a root foundation-doc
suite. **Why:** consistent, cold-start-friendly sessions across two machines and a durable
written record. Local-first single mode (no Sentinel "LIVE-DIRECT" branch — this tool has no
public live site).

## ADR-008 — `reset db protocols` (data-only DB reset)
**Status:** Accepted · **Date:** 2026-06-18
Added a `reset db protocols` session command + `scripts/reset-db.ps1` that **truncates only
`health_data` + `staging_health_data`** (RESTART IDENTITY), preserving reference data
(locations, indicators, periods), users, roles, and `audit_log`. Protocol shows row counts and
requires confirmation before wiping. **Why:** repeatable clean slate for verifying uploaded
values/bugs without re-seeding the whole DB. **Trade-off:** databases are not git-synced, so
each machine resets independently; reference data must already be seeded (see ADR-002 / the
indicator backfill note in `project_state.md`).

## ADR-009 — Overview information architecture: single ranking + Child Care sub-area drill
**Status:** Accepted · **Date:** 2026-06-18
Removed the duplicate LGU ranking and the 4 summary cards from Analytics → Overview. Ranking
now lives only on the **Rankings** page, broadened to the full indicator set via a shared
`overviewIndicators.js` config (each option carries its `pct` / `total` / `denom` codes,
extracted from template formulas). The Child Care program card is now **expandable** into four
sub-area mini-cards (Immunization / Nutrition / Mgt of Sick / SBI), each with a **UI-selectable
KPI dropdown**, backed by a new frequency-agnostic `GET /api/overview/indicator` endpoint that
resolves each indicator's latest reported period. **Why:** one source of truth per view; the
at-a-glance grid stays clean while Child Care (the only program with data) drills into detail.
**Trade-off:** the two maps still use the monthly-only `coverage-summary`, so drilling the map
into a quarterly/annual indicator shows no map data (sub-area cards themselves are correct).
*(Trade-off resolved in ADR-010.)*

## ADR-010 — Frequency-agnostic maps/Rankings, Needs Attention panel, Child Care all-KPI card
**Status:** Accepted · **Date:** 2026-06-24
Three related Overview changes:
1. **Maps + Rankings are now frequency-agnostic.** `coverage-summary` and `coverage-breakdown`
   no longer hardcode `period_type='monthly'`; a new `resolve_coverage_period()` reads the
   indicator's `frequency_type` — monthly uses the `month` param, quarterly/annual resolve to
   the latest period with data. Endpoints return `period_label` + `period_type`; the UI shows a
   "Showing: <period>" tag and disables the Month dropdown for non-monthly indicators. Resolves
   the ADR-009 trade-off. **Note:** this is latest-period *display*, not full period navigation
   (can't yet pick Q1 vs Q2).
2. **"Needs Attention" panel** on Overview (`GET /api/overview/needs-attention`), scoped to the
   selected map indicator: lowest-coverage LGUs (<80%), over-100% values (the same
   `over_threshold` DQC rule as the Indicator Report red cells), and LGUs that **stopped
   reporting**. *Decision:* "stopped reporting" is computed against the **prior period**, not the
   full 66-LGU roster — province-aggregated indicators (e.g. Mgt of Sick reports 4/66) would
   otherwise flag every component LGU as missing, a false alarm.
3. **Child Care card lists every sub-area KPI** instead of one dropdown-selected KPI per
   sub-area. New batch `GET /api/overview/indicators?codes=…` returns rollups for many codes in
   one round-trip. No-data indicators render as "—". **Scope:** Child Care only — the other 10
   program cards are unchanged (pending indicator seeding / real data).
**Also:** Overview page subtitle rescoped to the whole page; the Indicator/Month/Year filters
captioned "Map filters" and the selected-indicator + period moved to a header above the maps.

## ADR-011 — Versioning + changelog (SemVer 0.x + Keep a Changelog)
**Status:** Accepted · **Date:** 2026-06-29
Adopted a human-readable `CHANGELOG.md` (Keep a Changelog format) as the record of what
changed per release, with `frontend/package.json` `version` as the machine-readable source of
truth (the two must agree). SemVer on the **0.x** line while pre-deployment: MINOR for
features, PATCH for fixes; **1.0.0 reserved for the first ICTU production deployment**. The app
footer now shows `v<semver> · <commit>` (Vite reads the version from `package.json` at
build/dev start). Started the project at **0.9.0**. **Why:** answer "what changed / what's
deployed" without reading git; surface a real version to users; set the discipline every later
change uses (each lands a line under `[Unreleased]`). **Why not CalVer:** SemVer distinguishes
feature vs fix at a glance. First step of an engineering-practices uplift (adapted from a
sibling production project) — remaining steps tracked in `ROADMAP.md` / `project_state.md`.
**Trade-off:** changelog/version sync is currently manual; a CI check to enforce it is a later
step in the same uplift.

## ADR-012 — Coverage thresholds moved to config; Home scorecard scale bug fixed
**Status:** Accepted · **Date:** 2026-07-01
Moved the coverage/alert cut-offs out of `analytics.py` into one module,
`backend/app/core/thresholds.py` (`ON_TARGET_RATIO=0.95`, `NEAR_TARGET_RATIO=0.80`,
`OVER_REPORT_RATIO=1.0`), and merged the two duplicate band-classifier functions
(`status_for` / `_status_for_ratio`) into one. While consolidating, found and fixed a real bug:
`status_for`'s old thresholds (`ON_TARGET=95`, `NEAR_TARGET=80`) were percent-scale, but the
values they classified — `percentage`/`rate`/`ratio` indicators — are stored as decimal ratios
(0.0–1.0) per the PCT convention. A ratio never reaches 80, so the Home page scorecard
(`get_scorecard` → `/api/scorecard`) always classified programs as "below target," and
`Home.jsx` displayed the raw ratio with a bare `%` appended (e.g. "0.77%" instead of "77%").
Fixed `get_scorecard`'s rounding (was collapsing the ratio to 1 decimal place) and `Home.jsx`'s
display to match the `value * 100` convention already used by every other page (Coverage,
Rankings, Overview, Indicator Reports). Added `backend/tests/test_thresholds.py` — the first
tests for the band-classification logic, including the exact scale bug as a regression case.
**Why:** a single, tested, ratio-scale source of truth for coverage bands prevents this class of
bug recurring, and the Home page (first thing users see after login) was silently showing wrong
numbers. **Trade-off:** none — pure bug fix + refactor, no behavior change beyond the correction.
Step E+G of the engineering-practices uplift; remaining steps in `ROADMAP.md`.

## ADR-013 — CI gate, scoped to pytest only
**Status:** Accepted · **Date:** 2026-07-01
Added `.github/workflows/ci.yml`: installs from `requirements.txt` + `requirements-dev.txt` and
runs `pytest backend/tests/` on every push/PR to `main`. Deliberately left lint out of the gate
for now: `npm run lint` currently fails with 32 pre-existing ESLint errors (a Node/browser env
gap in `vite.config.js`, plus a handful of real React `setState`-in-effect issues), and no
Python lint tool is installed yet. **Why not fix lint first and gate on everything at once (as
originally scoped in ROADMAP item "I")?** Cleaning up 32 errors across several files is its own
chunk of work, separate from wiring up CI — bundling them would make this step bigger and less
reversible than the "one step at a time" cadence calls for. **Decision on the Python lint tool:**
`ruff` — fast, covers most of flake8 + isort + pyupgrade in one dependency — but not installed
yet; picked now so the choice doesn't get re-litigated later. Follow-ups tracked as ROADMAP I2
(frontend lint gate, after cleanup) and I3 (`ruff` gate, after install). Step I of the
engineering-practices uplift.

## ADR-014 — Pin Python dependencies to exact versions
**Status:** Accepted · **Date:** 2026-07-01
`requirements.txt` switched from `>=` ranges to exact `==` versions, pinned from `pip freeze` in
the running backend container (image built 2026-06-18) — i.e. the versions already proven
working, not a fresh resolve. **Note for the record:** this locks in `pandas==3.0.3`, a major-
version jump from the `>=2.2.0` the range originally allowed. It's already been running for
~2 weeks without incident (this session's Upload/Home verification also passed against it), so
pinning it is lower-risk than it looks — the alternative (re-resolving to a "safer" 2.x) would
be an untested change instead. Rebuilt the backend image against the pinned file and re-verified
`:8000/docs` responds. **Why:** matches the frontend's `package-lock.json` guarantee — a fresh
`pip install` on a new machine can no longer silently drift onto an untested version.
**Trade-off:** this pins direct dependencies only, not a full transitive lock (no `pip-tools` /
`poetry` — that would be a new tool and a bigger step; revisit if drift becomes a real problem).
Step F of the engineering-practices uplift.

## ADR-015 — Frontend lint cleanup: fixed real issues, disabled two rules that don't apply
**Status:** Accepted · **Date:** 2026-07-01
Cleared all 32 pre-existing ESLint errors and added `frontend-lint` (`npm ci` + `npm run lint`)
as a second CI job. Two different kinds of fix:
1. **Genuine issues (19 errors):** `vite.config.js` was linted under browser globals instead of
   Node, so every `process.env` reference errored (`no-undef`) — added a separate Node-env
   config block for it. The rest were dead imports/variables (`useEffect`, `MONTHS`, an unused
   `getUser()` helper, unused `catch` bindings, unused map-callback indices) — deleted, verified
   nothing else referenced them, and confirmed Home/Overview/Indicator Reports still render
   correctly afterward.
2. **Rule doesn't apply here (13 errors):** `react-hooks/set-state-in-effect` and
   `react-hooks/preserve-manual-memoization`, both part of `eslint-plugin-react-hooks` v7's
   "recommended" config, target **React Compiler** projects — this app doesn't use React
   Compiler (no `babel-plugin-react-compiler`). The pattern the first rule flagged
   (`setLoading(true)` synchronously at the top of an effect, then an async fetch, guarded by an
   `active` cleanup flag) is this codebase's consistent, deliberate fetch-on-mount convention
   used on every data page — not a bug. Turned both rules off with a comment explaining why,
   rather than rewriting the pattern across ~10 files for a rule aimed at a different
   architecture. **Trade-off:** if this app adopts React Compiler later, re-enable both rules and
   address them properly at that point. Step I2 of the engineering-practices uplift.

## ADR-016 — Python lint gate (ruff)
**Status:** Accepted · **Date:** 2026-07-01
Added `ruff==0.15.20` to `requirements-dev.txt` and a `ruff check backend/` step in the
`backend-tests` CI job. The backend codebase only had 2 issues (unused imports in `auth.py` and
`upload_catalog.py`), both dead and safely removed — much lighter than the frontend cleanup.
**Why ruff over flake8:** single fast tool covering most of flake8 + isort + pyupgrade; the
default choice for new Python projects (decided earlier in ADR-013, installed now). Verified
`pytest` + `ruff check` both pass in a clean `python:3.12-slim` container against the pinned
`requirements.txt`, matching what CI will run. Closes out the "I. CI gate" item of the
engineering-practices uplift (I, I2, I3 all done).

## ADR-017 — Deployment architecture: self-managed single VM, compose, Caddy, GHCR (2026-07-04)

**Context.** IT provides server space but we manage it ourselves (SSH, public internet,
self-managed backups). IT asked us to purchase a `.com` domain — the `.gov.ph` process is too
slow right now. The site is internal-use at launch but publicly reachable, front-facing later.

**Decision.** Single VM + docker compose; **no Kubernetes/Terraform** (wrong scale for one VM,
one maintainer). Entry point is **Caddy** (80/443, automatic Let's Encrypt when
`SITE_ADDRESS=<domain>`) → nginx SPA → gunicorn → PostgreSQL. Nightly gzipped `pg_dump` via a
`db-backup` sidecar into `./backups` (30-day retention) + weekly manual off-server copy.
Releases: push a `v*` tag → CI tests, builds production images, publishes to **GHCR** → server
runs `IMAGE_TAG=vX.Y.Z docker compose pull && up -d`; rollback is the same command with the
previous tag. Because the URL is public from day one, the Step-1 hardening (fail-fast secrets,
login rate limit, CORS, security headers) was made a launch blocker, not a follow-up.
Full checklist: `memory-bank/deployment-checklist.md`.

**Verified** end-to-end 2026-07-04 in an isolated compose project (all services healthy,
headers via Caddy, bootstrap in prod image, logins through port 80, dump file produced).

## ADR-018 — argon2 password hashing via upgrade-on-login (2026-07-04)

**Context.** Passwords were bcrypt; Sentinel-FMS standard is argon2. A hard cutover would
invalidate existing users or force resets.

**Decision.** passlib `CryptContext(schemes=["argon2","bcrypt"], deprecated=["bcrypt"])`:
new hashes are argon2id, legacy bcrypt hashes keep verifying, and each is re-hashed to argon2
on that user's next successful login — the only moment the plaintext is available. bcrypt stays
pinned 4.0.x (verify-only). Bootstrap creates argon2 hashes from day one. No migration script,
no user impact; stragglers upgrade whenever they next log in.

## ADR-019 — Demographics pilot: `formula_type="ratio"` and single-config snapshot templates (2026-07-06)

**Context.** Demographics was chosen as the first of the 10 remaining programs to build
(simplest: one file, no time-series dimension, no age brackets) — a pilot for the new
`add-template` skill. Its indicators are population/households-per-resource ratios (e.g. "1
doctor per 12,450 people") with no 100% ceiling, structurally different from every indicator
seeded so far (all `formula_type="percentage"` or `"count"`/`"sum"`).

**Decision.** Two small, additive choices, not new machinery:
1. Use `formula_type="ratio"` for these indicators. The DB `CHECK` constraint already allowed
   `'ratio'` and `analytics.py`'s `RATE_FORMULAS` tuple already treated it like
   `percentage`/`rate` for sum-vs-average rollup purposes — this was dead schema until now, not
   a new column. `denominator_source` is a bare `VARCHAR` with no population-only assumption, so
   pointing one indicator's denominator at a `Households` raw indicator instead of `Population`
   needed no code change either.
2. Model the file as **one config** (`demographics_annual.json`) using the existing
   `sheet_map` + `extra_sheets` mechanism — the same pattern `nut_mam_sam_annual.json` already
   uses for its MAM/SAM tab pair — rather than two separate `template_id`s as the raw per-file
   analysis doc first suggested. The two sheets (`BGY & BHS`, `Health Workers`) are unrelated
   indicator domains sharing only PSGC/location/population columns, which is exactly the shape
   `extra_sheets` was built for.

**Not done, deliberately:** Demographics was **not** wired into Coverage.jsx, Rankings.jsx, the
Overview `PROGRAM_FLAGSHIPS`, or the Home scorecard's percentage-style program list — those all
assume a 0–100% coverage scale, and `analytics.py`'s `status_for()` would misclassify a raw
ratio like 12,450 as "on target" if invoked against one. Demographics surfaces through Indicator
Reports and Data Availability only for now, both of which render raw values without a
coverage-status classification. Fixing `status_for()`'s 0–1 assumption for real ratio use is
deferred until/unless a program actually needs a ratio indicator on a coverage-style page.

**Trade-off:** the next non-percentage program (Leprosy/Rabies/Vital Stats, needing
`formula_type="rate"` with a real `×1,000`/`×10,000`/`×100,000` multiplier — the
`rate_multiplier` column already exists but has never been read by any code path) is a
materially bigger lift than this one, since nothing currently applies that multiplier anywhere.
Don't assume "ratio went smoothly" implies "rate will too."

## ADR-020 — ESR reports: JSONB storage + best-effort Google Sheets mirror
**Status:** Accepted · **Date:** 2026-07-07
Epidemiology's ESR Verification Form (`POST /api/esr-reports`) stores the whole submitted form
as one `JSONB` column (`esr_reports.payload`) rather than modeling ~40 fields as narrow/tall
`health_data`-style rows — this is an event-based form submission, not a periodic indicator
value, so the narrow/tall schema doesn't fit; the only existing JSONB precedent in this schema
is `audit_log.details`. On submit, the backend also attempts to push a flattened summary row
into a Google Sheet (`gspread`, service-account auth) that Epidemiology already uses as a line
list. **The Sheets push is best-effort and never fails the request** — the Postgres row is the
source of record; `sheet_sync_status` (`pending`/`synced`/`failed`) plus `sheet_sync_error`
track whether the mirror succeeded, and a failed sync can be backfilled later without losing the
submission. **Why:** an external API (rate limits, credential expiry, network) must not be able
to block a surveillance report from being recorded. **Trade-off:** v1 has no listing/detail view
in our own UI — Epidemiology reads history from the Sheet itself; a failed sync is currently only
visible via the DB column or audit log (`esr_sheet_sync_failed`), not surfaced to the submitter
beyond a soft "will sync shortly" message. This also introduces the codebase's first Pydantic
request model (`app/schemas/esr_report.py`) — every other endpoint validates via raw `dict` —
justified here by the payload's depth (nested objects/arrays) making hand validation error-prone;
not (yet) applied retroactively to existing endpoints.
