# progress.md

## Status: Month 1 Complete — Parser Proof of Concept Working

## Completed
- Chose Option B architecture (React + FastAPI + PostgreSQL + Docker)
- Installed all tools on office desktop and personal laptop
- Created private GitHub repository (health-stat-dashboard)
- Set up memory-bank folder and Claude Project
- Attended April 20 stakeholder meeting
- Conducted survey of ExeCom, ManCom, and Program Managers
- Analyzed ALL 63 Excel templates across all programs
- Cross-referenced 107 official indicators from DOH memorandum
- Completed fhsis_template_analysis.md (in project knowledge)
- Designed database schema (7 tables)
- Confirmed parser design, RBAC, and conflict handling strategy
- Created project folder skeleton
- Created .gitignore and docker-compose.yml
- PostgreSQL 15 running in Docker (verified)
- DBeaver connected to local database (verified)
- All 7 database tables created and verified
- 128 NIR locations seeded
- 11 programs seeded (official DOH names)
- 34 report periods seeded (2025 + 2026)
- 43 Immunization indicators seeded
- First parser config created (cpab_bcg_hepa.json)
- Excel parser service built (parser.py)
- First successful parse: 2,667 rows staged, 0 errors, 0 DQC issues

## In Progress
- Building commit approval system (next session)

## Build Order (Vertical Slice Strategy)
1. ✅ Parser for File 1 (CPAB/BCG/HepaB)
2. ⬜ Commit approval system
3. ⬜ FastAPI endpoints (upload, staging, approve, data)
4. ⬜ Auth and RBAC
5. ⬜ Basic frontend for File 1 indicators
6. ⬜ Expand to remaining 62 files

## Pending Team Actions (Template Errors to Fix)
- `envi_sanitation_zod_nir.xlsx` — Fix Qtr3 and Qtr4 structure
- `nata_lb_abr_rabr_nir.xlsx` — Add missing ABR <10 column to Q2
- `morta_mmr_imr_nir.xlsx` — Fix col 33 label (d4 → g4)
- `6__pre_gd_screening_nir.xlsx` — Fix col Z formula (g/h → g/a)
- `2_3_Vitamin_A_supplementation_nir.xlsx` — Fix col 11 formula
- `infec_schisto_5-14, 15-19, 20-59, 60above` — Fix Qtr1b col D and Qtr1d col J

## Pending Clarifications (Higher Ops)
- BHW ratio — numerator/denominator convention
- MAM denominator — children SEEN vs children identified
- 8ANC denominator — TCL vs Excel tracking formula
- Cervical cancer — running denominator vs static

## Parked Items
- Morbidity — needs per-LGU and barangay expansion
- Animal bites — rate multiplier unclear
- Filariasis MDA — wrong locations, excluded
- NCD HUC barangay rows — missing across multiple files

## Local Database Credentials (Development Only)
- Host: localhost | Port: 5432
- Database: doh_nir_dashboard
- Username: doh_admin | Password: doh_password_2026