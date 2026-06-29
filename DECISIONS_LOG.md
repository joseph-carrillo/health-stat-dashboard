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
