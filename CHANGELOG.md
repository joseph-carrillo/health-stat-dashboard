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
- This changelog and a real version number (`0.9.0`), replacing the placeholder
  `0.0.0`. First step of an engineering-practices uplift (versioning + changelog).

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
