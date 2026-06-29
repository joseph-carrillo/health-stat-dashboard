# activeContext.md

## Current Session Goal
**Engineering-practices uplift** — bring proven practices from a sibling production project into
this dashboard, adapted (don't copy blindly, no new frameworks). Work directly on `main`.

## How the owner wants to work (read this)
Joseph is a **data analyst, not a coder**. Write code he can read; explain every non-obvious
command/pattern in plain language ("smart 10-year-old"). Be a **cold auditor, not a yes-man** —
if a request is wrong/risky, say so and propose an alternative. Strict cadence:
**propose → he reviews → he approves → you build.** One reversible change at a time, verified
before the next. Never dump many files at once. Flag any new dependency and ask first.
See `working-agreement.md` for the deeper context (burnout → "manage, don't grind").

## What Was Just Completed (2026-06-29)
- **Audit** of the repo vs practices A–I. Headline: already strong on docs/ADRs/protocols/commit
  hygiene; real gaps are testing, changelog, and a few health-data correctness/privacy items.
- **Step C — versioning + changelog (DONE, committed `ff40ba1`):** `CHANGELOG.md` (Keep a
  Changelog), `package.json` 0.0.0→0.9.0 (source of truth), footer now shows `v0.9.0 · <commit>`.
  Verified: frontend restarts clean, `:5173` 200. Decision logged as ADR-011.

## What Happens Next — recommended: Step E+G
Move the hardcoded coverage/alert thresholds out of `backend/app/services/analytics.py`
(`NEAR_TARGET=80`, `_ON_TARGET=0.95`, `_BELOW_TARGET=0.80`, plus the "<80%" / "over-100%"
Needs-Attention rules) into **one config module**, and ship the **first real tests** for the
band-classification logic (happy path + edges). This demonstrates practices E (config) + G
(tests) + H (logic in a tested function) at once, and the numbers are owner-verifiable.
Then: I (CI gate) → F (pin Python deps) → F (small-cell suppression, needs his cut-off decision)
→ F (data dictionary). Full list in ROADMAP "Engineering-practices uplift".

## Decisions waiting on Joseph
- (when we reach Step F privacy) the **small-cell suppression cut-off** — what count is too small
  to display (common: <5 or <10). Domain call, only he can set it.

## API and Frontend Ports
- API: http://localhost:8000/docs  ·  Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: admin / Admin@2026!

## Local Database
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026
