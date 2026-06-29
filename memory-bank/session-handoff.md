# session-handoff.md

## Last Updated
2026-06-29 (Engineering-practices uplift started: Step C — versioning + changelog — shipped)

## Current Objective
Engineering-practices uplift: adapt proven practices (A–I) from a sibling production project,
one reversible step at a time. Cadence: **propose → owner reviews → owner approves → build.**
Owner is a data analyst, not a coder — readable code, plain-language explanations, cold-auditor
honesty. (See `activeContext.md` + `working-agreement.md`.)

## Done This Session
- **Audit** vs practices A–I (in chat). Already strong: foundation docs, ADRs, session
  protocols, conventional commits. Gaps: testing (1 real test), no changelog/semver, hardcoded
  alert thresholds, no small-cell suppression, unpinned Python deps, SECURITY.md privacy claim
  overstates the code.
- **Step C — versioning + changelog (committed `ff40ba1`):** `CHANGELOG.md` (Keep a Changelog),
  `package.json` 0.0.0→**0.9.0** (source of truth), Vite injects it, footer shows
  `v0.9.0 · <commit>`. Verified clean. ADR-011 logged. **1.0.0 = first ICTU deploy.**
- Pulled prior shutdown housekeeping; `.claude/settings.local.json` now gitignored.

## Next Session — recommended: Step E+G (thresholds → config + first tests)
Move `NEAR_TARGET=80`, `_ON_TARGET=0.95`, `_BELOW_TARGET=0.80` (and the "<80%" / "over-100%"
Needs-Attention rules) out of `backend/app/services/analytics.py` into one config module; ship
happy-path + edge tests for the band logic. Then I (CI), F (pin deps), F (small-cell
suppression — needs owner's cut-off decision), F (data dictionary). Full list: ROADMAP
"Engineering-practices uplift".

## Notes / Gotchas
- **Changelog discipline:** every change now lands a line under `[Unreleased]` in `CHANGELOG.md`;
  on release, bump `package.json` to match (PATCH=fix, MINOR=feature). They must stay in sync.
- **PowerShell here-strings** for git commit messages broke this session — use `git commit -F
  <file>` (write the message to the scratchpad) instead.
- DBs are NOT git-synced. New machine: copy `.env`, run `bootstrap_db.py`, then upload data.
- Only CHILD_CARE has indicators seeded; other 10 program cards show "no data".
- Data in DB: 247 indicators, 7,538 health_data rows; staging_health_data also ~7,538 (a lot of
  un-cleared staging — worth a look before a clean upload test).

## First Command Next Session
```
run startup protocols
```
