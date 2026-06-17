# Roadmap

> Checklist of milestones. `startup protocols` cross-references this against the git log and
> `memory-bank/project_state.md`. Keep it honest — `[x]` means it's actually in code.

## Phase 1 — FHSIS Excel upload → PostgreSQL (current)

### Foundation
- [x] Database schema + seed (128 locations, 11 programs, 34 periods, indicators)
- [x] Config-driven parser + DQC rules
- [x] Validate-first upload → staging (deltas) → conflict review → approve → commit
- [x] JWT auth, RBAC, user/role management, audit logging
- [x] React frontend with DOH branding
- [x] Full-stack containerization (db + backend + frontend) + prod compose
- [x] Sentinel-style session protocols + foundation docs

### Analytics
- [x] Home scorecard
- [x] Overview (multi-indicator)
- [x] Overview at-a-glance — 11-program performance grid (latest period per program, click-to-drill)
- [x] Coverage + Rankings (province / HUC grouping)
- [x] Trends (SVG)
- [x] Indicator Reports (API-driven, province filter, computed columns, NIR rollup)
- [x] Data Availability, Targets

### Templates
- [x] Immunization File 1 (CPAB / BCG / HepaB)
- [x] Immunization File 4 (DPT-HiB-HepB)
- [x] Nutrition Files 1–6 (incl. File 6 annual MAM/SAM)
- [x] Management of the Sick 1–3 (Vitamin A, diarrhea/pneumonia)
- [x] Birth-dose % fix (CPAB/BCG/HepaB stored 100× too large) + reusable data-quality audit
- [x] SBI (Annual) — Td (#9), MR (#10), HPV (#11) configs + 27 indicators
- [ ] Remaining Immunization files (5–8) — when real data arrives

### Remaining
- [ ] GeoJSON choropleth maps (`frontend/public/geojson/`)
- [ ] ICTU deployment

## Phase 2 — Web form input (future)
- [ ] Web form mirroring the FHSIS template → PostgreSQL (replaces Excel upload)
- [ ] Build so it does not block on Phase 1 internals

## Track 2 — LGU / barangay drill-down (future)
- [ ] Sub-province location reporting and dashboards

## Deferred best-practices (next foundation pass)
- [ ] Fail-fast on missing secrets (remove `os.getenv` fallbacks)
- [ ] bcrypt → argon2 migration
- [ ] ruff / mypy / pytest tooling + GitHub Actions CI
- [ ] Split `backend/main.py` (1100+ lines) and oversized frontend pages (>800 lines)

## Pending (external — team / higher ops)
- Template fixes: envi_sanitation, nata_lb_abr, morta_mmr, pre_gd_screening, Vitamin A, schisto
- Clarifications: BHW ratio, MAM denominator, 8ANC denominator, cervical cancer denominator
