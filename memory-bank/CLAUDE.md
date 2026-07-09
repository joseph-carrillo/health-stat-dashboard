# CLAUDE.md

## Project
DOH-NIR CHD Health Statistics Dashboard (Philippines)
Stack: React + FastAPI + PostgreSQL + Docker
Repo: health-stat-dashboard (private)

## Builder Profile
- Data Analyst, not a programmer
- Teach while building
- Two machines: office desktop + personal laptop (WFH Fridays)
- Sync via GitHub

## Non-Negotiable Rules
- Free/open-source tools only
- RBAC enforced on all features
- No PHI/PII in plain text
- Audit logging on all data changes
- Philippines Data Privacy Act compliance
- Modules max 800 lines
- Always: Plan → Review → Build

## Data Source
- Phase 1: FHSIS Excel templates (monthly/quarterly/annual) → PostgreSQL
- Phase 2 (future): Web form mirroring Excel template → PostgreSQL
- Excel is input only in Phase 1. Phase 2 replaces upload with direct web input.
- Build Phase 1 so it does NOT block Phase 2

## Sensitive Indicators
- HIV reactive cases
- Syphilis reactive cases
- Syphilis treated cases (being treated discloses reactive status)
- Hepatitis B reactive cases
- Morbidity template's HIV/Syphilis disease-count rows (once Morbidity is built)
- Leprosy (stigma-based; small province-level counts can identify individuals)
- NCD Mental Health / mhGAP screening (same stigma rationale as Leprosy)
- These require extra RBAC restrictions at API level
- Dashboard shows aggregated totals only for unauthorized roles

*(Expanded 2026-07-09 from the original HIV/Syphilis-reactive-only policy — see
`memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` §3 for the tier rationale.)*

## Current Status
See progress.md

## Session Protocols
**Single source of truth: root `CLAUDE.md` → "Session Protocols".** Follow those steps exactly;
this file intentionally does not duplicate them (duplicated copies drifted apart once already).
The one rule worth repeating because it protects the two-machine workflow: **sync git BEFORE
reading memory files** — memory is git-synced, so reading pre-pull loads the other machine's
stale snapshot.
