# activeContext.md

## Current Session Goal
Foundation hardening from Sentinel-FMS: full-stack containerization, session protocols, and a
root foundation-doc suite. Branch `chore/containerize-and-foundation-docs`.

## Strategic Decision (unchanged)
Two-Track strategy: Track 1 province dashboard for ops feedback; Track 2 LGU/barangay later.

## What Was Just Completed (June 17 — Foundation hardening)
- Containerized backend + frontend (multi-stage Dockerfiles) alongside the DB; full dev
  `docker-compose.yml` + `docker-compose.prod.yml` (gunicorn + nginx)
- Env-driven config: `.env`/`.env.example`, compose sources DB creds, configurable CORS
- Fixed login 500: pinned `bcrypt>=4.0,<4.1` (passlib 1.7.4 breaks on bcrypt ≥4.1)
- Session protocols added to `CLAUDE.md` (`startup protocols` / `run shutdown protocols`)
- `memory-bank/MEMORY.md` index + `project_state.md` added
- Root foundation docs: README, ARCHITECTURE, DATA_MODEL, DECISIONS_LOG, SECURITY, RUNBOOK,
  ROADMAP, GLOSSARY, FILE_STRUCTURE, CONTRIBUTING
- `scripts/start.ps1` & `stop.ps1` now wrap `docker compose` (with `-Native` fallback)
- Verified end-to-end: stack up, `/docs` 200, frontend 200, login via proxy returns JWT

## What Happens Next
1. Commit + push this branch (pending Joseph's go-ahead)
2. Continue Immunization uploads using validate → stage → approve
3. Fix legacy bad CPAB_PCT rows by approving incoming values where conflicts appear

## Daily Startup (two machines)
1. `run startup protocols` OR `.\scripts\sync.ps1` then `.\scripts\start.ps1`
2. Open http://localhost:5173

## API and Frontend Ports
- API: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: admin / Admin@2026!

## Local Database
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026
