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
- [x] `reset db protocols` — data-only DB wipe (`scripts/reset-db.ps1`) for clean testing
- [x] Vite HMR fix for Docker-on-Windows (server.watch.usePolling)

### Analytics
- [x] Home scorecard
- [x] Overview (multi-indicator)
- [x] Overview at-a-glance — 11-program performance grid (latest period per program, click-to-drill)
- [x] Overview → Child Care card lists **every** sub-area KPI at once (Immunization / Nutrition / Sick / SBI), no-data as "—", click-to-drill (`GET /api/overview/indicators` batch)
- [x] Overview "Needs Attention" panel — bottom LGUs, over-100% DQC flags, stopped-reporting (`GET /api/overview/needs-attention`)
- [x] Overview header rescoped to whole-page; filters captioned "Map filters"; period moved to a maps header
- [x] Maps + Rankings frequency-agnostic — quarterly/annual indicators resolve to latest period (`resolve_coverage_period`)
- [x] Ranking consolidated onto the Rankings page (removed from Overview); Rankings broadened to full indicator set via shared config
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

## Engineering-practices uplift (in progress — adapted from sibling production project)
Owner-approved plan, one reversible step at a time (propose → review → approve → build).
- [x] **C. Versioning + changelog** — `CHANGELOG.md` (Keep a Changelog) + SemVer 0.x;
  `package.json` is the source of truth; footer shows `v<semver> · <commit>`. Started 0.9.0,
  1.0.0 = first ICTU deploy (ADR-011). _Done 2026-06-29._
- [ ] **E+G. Thresholds → config + first real tests** — move hardcoded coverage/alert cut-offs
  (`NEAR_TARGET=80`, `_ON_TARGET=0.95`, `_BELOW_TARGET=0.80` in `analytics.py`) into one config
  module, ship with happy-path + edge tests. **← recommended next**
- [ ] **I. CI gate** — GitHub Actions: pytest + lint must pass before shipping.
- [ ] **F. Pin Python deps** — exact versions in `requirements.txt` (frontend already locked).
- [ ] **F. Privacy** — small-cell suppression (needs owner decision: cut-off count); fix
  `SECURITY.md` (it claims sensitive = "aggregated totals only"; code does full exclusion).
- [ ] **F. Data dictionary + provenance** — per-indicator numerator/denominator/bands; lock it.

## Deferred best-practices (next foundation pass)
- [ ] Fail-fast on missing secrets (remove `os.getenv` fallbacks)
- [ ] bcrypt → argon2 migration
- [ ] Split `backend/main.py` (~1300 lines) and oversized frontend pages (>800 lines)
- [ ] Roadmap milestones: add explicit exit criteria per phase

## Pending (external — team / higher ops)
- Template fixes: envi_sanitation, nata_lb_abr, morta_mmr, pre_gd_screening, Vitamin A, schisto
- Clarifications: BHW ratio, MAM denominator, 8ANC denominator, cervical cancer denominator
