# project_state.md

> The single "start cold" snapshot. Kept current by `run shutdown protocols`.

## Phase
**Phase 1 — FHSIS Excel upload → PostgreSQL.** Track 1 (province dashboard) active.
Phase 2 (web form input) and Track 2 (LGU/barangay) are future.

## Current focus (as of 2026-06-17)
Foundation hardening: full-stack containerization + Sentinel-style session protocols and
foundation docs. Branch `chore/containerize-and-foundation-docs`.

## Done
- Full stack (React 19 + FastAPI + PostgreSQL 15) working on both machines
- Reference data seeded: 128 NIR locations, 11 programs, 34 periods, immunization + nutrition indicators
- Upload pipeline: validate-first → staging (deltas only) → conflict review → approve → commit
- Templates live: Immunization File 1 (CPAB/BCG/HepaB) + File 4 (DPT-HiB-HepB), Nutrition 1–6, Sick 1–3
- Analytics: Home scorecard, Overview, Coverage, Rankings, Trends, Indicator Reports (API-driven), Data Availability, Targets
- Auth: JWT login, RBAC, user/role management, audit logging
- **Containerization (this session):** backend + frontend Dockerfiles, full dev `docker-compose.yml`,
  `docker-compose.prod.yml`, `.env`/`.env.example`, env-driven CORS
- **Foundation docs (this session):** root doc suite + memory-bank index + project_state

## Open work (priority order)
1. Re-upload / approve CPAB with validate-first flow; fix legacy bad `CPAB_PCT` rows (143% vs 1.44%) via "Use incoming"
2. File 6 Nutritional Status (Expanded NIR folder) — validate then stage
3. SBI (Annual) config + seed
4. Remaining Immunization files (5–8)
5. GeoJSON choropleth maps in `frontend/public/geojson/`
6. ICTU deployment

## Deferred best-practices (next foundation pass)
- Fail-fast on missing secrets (remove `os.getenv` fallbacks in `db.py`/`auth.py`)
- bcrypt → argon2 migration
- ruff/mypy/pytest tooling + GitHub Actions CI
- Split `backend/main.py` (1100+ lines) and oversized frontend pages (>800 lines)

## Git
- Branch: `chore/containerize-and-foundation-docs` (off `main`)
- Not yet committed/pushed (waiting on Joseph)

## Local dev
- Stack: `docker compose up -d --build` → frontend `:5173`, backend `:8000/docs`, db `:5432`
- DB: `doh_nir_dashboard` · `doh_admin` / `doh_password_2026`
- Admin login: `admin` / `Admin@2026!`
