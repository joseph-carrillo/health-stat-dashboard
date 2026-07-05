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

### Templates — Child Care (done)
- [x] Immunization File 1 (CPAB / BCG / HepaB)
- [x] Immunization File 4 (DPT-HiB-HepB)
- [x] Nutrition Files 1–6 (incl. File 6 annual MAM/SAM)
- [x] Management of the Sick 1–3 (Vitamin A, diarrhea/pneumonia)
- [x] Birth-dose % fix (CPAB/BCG/HepaB stored 100× too large) + reusable data-quality audit
- [x] SBI (Annual) — Td (#9), MR (#10), HPV (#11) configs + 27 indicators
- [ ] Remaining Immunization files (5–8) — when real data arrives

### Build out the other 10 programs (← active focus, 2026-07-01)
Only CHILD_CARE has indicators seeded (247); the other 10 programs have 0. Per-program build
loop (analyze → seed indicators → write configs → validate → dry-run → Joseph tests), **one
program end-to-end at a time**. Files land in `backend/data/<PROGRAM_CODE>/` (folders scaffolded).
Recipe: `memory-bank/adding_templates.md`.
- [x] Scaffold `backend/data/<PROGRAM_CODE>/` intake folders (10 programs)
- [x] All 10 programs' `.xlsx` files dropped 2026-07-05 (46 files, 18 natural sub-groups)
- [ ] **Analysis phase (in progress): 12/18 sub-groups documented** in
      `memory-bank/template_analysis/` — Infectious Disease (Schisto, Filariasis,
      HIV-Syphilis-HepaB, Rabies, STH, Leprosy), WASH, Demographics, Oral Health, Vital Stats
      (Mortality, Natality), Maternal Care Prenatal. Remaining: Maternal Care Post Partum +
      Intra Partum, NCD, Geriatric, Family Planning, Morbidity.
- [ ] Maternal Care and Services (Prenatal analyzed; Post Partum + Intra Partum pending)
- [ ] Family Planning Services (file dropped, analysis pending)
- [ ] Vital Statistics (Mortality + Natality analyzed; indicators/config not yet built)
- [ ] Morbidity (file dropped, analysis pending)
- [ ] Infectious Disease Prevention and Control (all 6 sub-diseases analyzed; indicators/config
      not yet built — Rabies needs a parser change first, see below)
- [ ] Non-Communicable Disease Prevention and Control (files dropped, analysis pending)
- [ ] Oral Health Care and Services (analyzed — needs a parser change first, see below)
- [ ] Geriatric Health (files dropped, analysis pending)
- [ ] Demographics (analyzed; needs a new `formula_type="ratio"` — not a coverage %)
- [ ] Water, Sanitation, and Hygiene (WASH) (analyzed — `envi_sanitation_zod_nir.xlsx` Q3/Q4
      structure fix still needed from DOH before this template can be built)

**Schema/parser decisions surfaced by the analysis, needed before seeding starts:**
- New `formula_type` for non-percentage rate multipliers (×1,000 / ×10,000 / ×100,000) — needed
  by Leprosy, Rabies, and both Vital Stats files; Demographics needs a `formula_type="ratio"`
  (population-per-resource, unbounded, not a coverage %).
- Parser change: `extra_sheets` currently assumes a fixed sheet name reused every period: it
  cannot express Rabies's period-varying sub-templates (`Qtr1a`/`Qtr2a`/… vs a static tab) or
  Oral Health's row-stacked age-group/quarter dimensions.
- New DQC rule type for "sum of parts = / ≤ whole" reconciliation checks (Rabies groups b/d) —
  `run_dqc_rules()` only supports `over_threshold` and `sequence` today.

### Remaining
- [ ] GeoJSON choropleth maps (`frontend/public/geojson/`)
- [ ] Deployment to IT's server (self-managed: SSH, public-facing, .com domain) — full plan in
      `memory-bank/deployment-checklist.md` (hardening → infra → go-live = v1.0.0)

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
- [x] **E+G. Thresholds → config + first real tests** — moved coverage/alert cut-offs into
  `backend/app/core/thresholds.py` (one ratio-scale source of truth), merged the duplicate
  band-classifier functions, and shipped `test_thresholds.py` (happy-path + edges). Found and
  fixed a real bug while consolidating: the Home scorecard compared ratio values against
  percent-scale thresholds, so it always showed "Below Target" with a garbled percent — see
  ADR-012. _Done 2026-07-01._
- [x] **I. CI gate (pytest)** — `.github/workflows/ci.yml` runs the backend pytest suite on
  every push/PR to `main`. _Done 2026-07-01._
- [x] **I2. Frontend lint gate** — cleaned up all 32 ESLint errors: fixed the `vite.config.js`
  Node/browser env gap, deleted ~10 dead imports/variables, and turned off two React-Compiler-
  only rules (`set-state-in-effect`, `preserve-manual-memoization`) that don't apply — this app
  doesn't use React Compiler, and the flagged pattern (fetch-on-mount with a cleanup flag) is
  the codebase's deliberate, safe convention on every data page. Added `frontend-lint` as a
  second CI job (`npm ci` + `npm run lint`). 9 non-blocking warnings remain (missing hook deps),
  not part of this cleanup. _Done 2026-07-01._
- [x] **I3. Python lint gate** — installed `ruff` (`requirements-dev.txt`), fixed the 2 issues
  it found (unused imports in `auth.py` and `upload_catalog.py`), and added `ruff check` as a
  step in the `backend-tests` CI job. _Done 2026-07-01._
- [x] **F. Pin Python deps** — `requirements.txt` now uses exact `==` versions (was `>=`),
  matching what's actually installed and running. Rebuilt the backend image and re-verified
  clean. _Done 2026-07-01._
- [ ] **F. Privacy** — small-cell suppression (needs owner decision: cut-off count).
  ~~fix `SECURITY.md`~~ — doc side done 2026-07-04 (now correctly says full exclusion).
- [ ] **F. Data dictionary + provenance** — per-indicator numerator/denominator/bands; lock it.

## Deferred best-practices (next foundation pass)
- [x] Fail-fast on missing secrets (removed `os.getenv` fallbacks; `app/core/env.py`) —
  _done 2026-07-04, go-live checklist Step 1_
- [x] bcrypt → argon2 migration (upgrade-on-login; bootstrap creates argon2) — _done 2026-07-04_
- [ ] Split `backend/main.py` (~1300 lines) and oversized frontend pages (>800 lines)
- [ ] Roadmap milestones: add explicit exit criteria per phase

## Pending (external — team / higher ops)
- Template fixes: envi_sanitation, nata_lb_abr, morta_mmr, pre_gd_screening, Vitamin A, schisto
- Clarifications: BHW ratio, MAM denominator, 8ANC denominator, cervical cancer denominator
