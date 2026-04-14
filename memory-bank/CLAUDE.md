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
- Excel is input only in Phase 1. Phase 2 replaces the upload with direct web input.
- Build Phase 1 so it does NOT block Phase 2

## Current Status
See progress.md

## Session Start Protocol
Always read activeContext.md first before doing anything.
This tells you what was last completed and what to do next.