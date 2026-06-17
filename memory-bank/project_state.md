# project_state.md

> The single "start cold" snapshot. Kept current by `run shutdown protocols`.

## Phase
**Phase 1 — FHSIS Excel upload → PostgreSQL.** Track 1 (province dashboard) active.
Phase 2 (web form input) and Track 2 (LGU/barangay) are future.

## ⚠️ STARTUP REMINDER — per-machine DB fix
The File 1 birth-dose percentage fix (100× error) was **applied on the LAPTOP DB only**.
Databases are NOT synced via git. **On each other machine, after pulling, run once:**
`docker compose exec backend python backend/scripts/fix_birthdose_pct.py --apply`
- Laptop DB: ✅ done (2026-06-17)
- Office DB: ⬜ PENDING — surface this in the startup brief until done, then tick it off.
Verify with `backend/scripts/audit_data_quality.py` (should report "clean").

## Current focus (as of 2026-06-17)
Foundation complete (containerized + docs + protocols) and the birth-dose percentage bug fixed.
Back on Phase 1 feature work: remaining FHSIS templates, then GeoJSON maps.

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
- **Birth-dose % fix (this session):** recomputed File 1 CPAB/BCG/HepaB percentages stored 100×
  too large (244 rows, audit-logged); shipped `audit_data_quality.py` + `fix_birthdose_pct.py`
  + first pytest suite (9 tests). Applied on laptop DB; office DB pending (see reminder above).

## IN PROGRESS — Overview redesign (tiered, all programs)
Agreed design: Tier 1 = executive glance (freshness banner + per-program KPI cards + map +
"needs attention" panel); Tier 2 = expandable per-program detail for program managers.
**Done this session (15% budget slice):**
- Backend `analytics.overview_summary()` + `GET /api/overview/summary` (per-area completeness +
  flagship regional %; flagships: FIC_PCT, NUT_MAM_CURED_PCT, PNEU_ABX_PCT, HPV1_SBI_PCT).
- Frontend `Overview.jsx`: data-completeness banner + 4 KPI cards (Tier 1, top of page).
- Existing map + ranking still render below.
**Next session (resume here):**
1. **"Needs attention" panel** — bottom 5 LGUs + over-100% DQC flag count + # not reporting.
2. **Tier 2 expandable per-program sections** (link out to Coverage/Rankings/Reports).
3. **Confirm flagship KPIs** with the program team (current picks are first-pass straw-man).
4. Trim the old summary cards / ranking if they now duplicate Tier 1.
5. (Later) sparkline trends once >1 period of data exists.

## Open work (priority order)
1. Finish Overview redesign (see IN PROGRESS above)
2. Remaining Immunization files (5–8) — when real data arrives
3. ICTU deployment (pending IT: Linux VM for Docker, SSH vs RDP)
4. Deferred best-practices: fail-fast secrets, bcrypt→argon2, CI

Note: File 6 (Nutrition) + SBI (Annual, Td/MR/HPV) templates are DONE this session.

## Deferred best-practices (next foundation pass)
- Fail-fast on missing secrets (remove `os.getenv` fallbacks in `db.py`/`auth.py`)
- bcrypt → argon2 migration
- ruff/mypy/pytest tooling + GitHub Actions CI
- Split `backend/main.py` (1100+ lines) and oversized frontend pages (>800 lines)

## Git
- Work goes **directly on `main`** (sole developer — no feature branches). Push when done.
- Latest: `692ef0e` birth-dose % fix; `8a2ea98` containerization + docs.

## Local dev
- Stack: `docker compose up -d --build` → frontend `:5173`, backend `:8000/docs`, db `:5432`
- DB: `doh_nir_dashboard` · `doh_admin` / `doh_password_2026`
- Admin login: `admin` / `Admin@2026!`
