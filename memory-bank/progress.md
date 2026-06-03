# progress.md

## Status: Track 1 Immunization File 1 E2E verified — Child Care module partial (1/15 files)

## Completed
- Full stack setup (React + FastAPI + PostgreSQL + Docker)
- All tools installed on office desktop and personal laptop
- GitHub repo synced on both machines
- Memory bank and Claude Project set up
- April 20 stakeholder meeting attended
- Survey of ExeCom, ManCom, Program Managers conducted
- All 63 FHSIS Excel templates analyzed
- 107 official indicators cross-referenced from DOH memorandum
- fhsis_template_analysis.md completed (in project knowledge)
- Database schema designed (7 tables + users table)
- Project folder skeleton created
- PostgreSQL running in Docker (verified on both machines)
- DBeaver connected on both machines
- All 7 tables + users table created
- 128 NIR locations seeded
- 11 programs seeded (official DOH names)
- 34 report periods seeded (2025 + 2026)
- 43 Immunization indicators seeded
- Parser config created (cpab_bcg_hepa.json)
- Excel parser service built (parser.py)
- Commit approval service built (commit.py)
- Full pipeline tested: 2,667 rows parsed → staged → committed
- FastAPI endpoints built and tested (13 endpoints)
- JWT authentication working
- User registration system built
- Admin role assignment working
- React frontend set up with Vite
- DOH branding applied (DM 2025-0600)
- Login page built with official colors, fonts, logos
- Password show/hide toggle added
- Dev bypass added for laptop development
- Sidebar navigation built (role-based)
- Home page built (program scorecard + alerts)
- Overview page built (maps + ranking — mock data)
- Skeleton placeholder pages built for all sections
- All pages wired in App.jsx with RBAC route protection
- Real data confirmed in database (500+ rows, Immunization program)
- Two-Track strategy documented and approved
- Session startup/shutdown protocols + Cursor rules + track1-verify script
- Overview/Home/Coverage/Rankings on live APIs (Jan 2026 demo period)
- Overview GeoJSON name matching (locationNames.js)
- Indicator Report header rowSpan fix
- User verified Excel vs Indicator Report (Immunization File 1)

## In Progress
- Child Care module: 14 FHSIS files remaining (Immunization files 4–8, Sick, Nutrition, SBI)
- ICTU server deployment
- RBAC demo path testing (admin vs program_manager)

## Track 1 — Province Dashboard (End of May 2026)
1. ✅ Database schema and seed data
2. ✅ Parser for File 1 (CPAB/BCG/HepaB)
3. ✅ Commit approval system
4. ✅ FastAPI endpoints (13 total)
5. ✅ Auth and JWT login
6. ✅ User registration and role management
7. ✅ React frontend with DOH branding
8. ✅ Login page
9. ✅ Sidebar navigation
10. ✅ Home page
11. ✅ Overview page (live coverage-summary)
12. ✅ Skeleton placeholder pages
13. ✅ Province-level APIs in use (coverage-summary, coverage-breakdown, health-data)
14. ✅ Connect real data to maps and cards (Jan 2026)
15. ⬜ Deploy to ICTU server
16. ⬜ Internal testing and feedback (partial — user verified File 1 numbers)

## Track 2 — LGU/Barangay Dashboard (End of June 2026)
1. ⬜ Fix FHSIS template errors (6 files)
2. ⬜ Build LGU level parsers
3. ⬜ Coverage page (bar charts + tables)
4. ⬜ Trends page (line graphs)
5. ⬜ Rankings page
6. ⬜ Program Targets page
7. ⬜ Data Availability page
8. ⬜ Management page
9. ⬜ Upgrade maps to municipality/barangay level
10. ⬜ Expand to remaining 62 FHSIS files

## Pending Team Actions (Template Errors to Fix)
- envi_sanitation_zod_nir.xlsx — Fix Qtr3 and Qtr4 structure
- nata_lb_abr_rabr_nir.xlsx — Add missing ABR <10 column to Q2
- morta_mmr_imr_nir.xlsx — Fix col 33 label (d4 → g4)
- 6__pre_gd_screening_nir.xlsx — Fix col Z formula (g/h → g/a)
- 2_3_Vitamin_A_supplementation_nir.xlsx — Fix col 11 formula
- infec_schisto_5-14, 15-19, 20-59, 60above — Fix Qtr1b col D and Qtr1d col J

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

## ICTU Server Status
- OS: Windows Server 2022
- Access: SSH preferred
- Docker: To be installed by ICTU
- Domain: IP address only
- Network: Intranet + Internet
- Status: Pending approval

## Local Database Credentials (Development Only)
- Host: localhost | Port: 5432
- Database: doh_nir_dashboard
- Username: doh_admin | Password: doh_password_2026

## API Credentials (Development Only)
- Admin: admin / Admin@2026!
- Dev bypass: dev / dev (REMOVE BEFORE GO-LIVE)
- Test user: jsmith / Test@2026! (program_manager, CHILD_CARE)
- API docs: http://localhost:8000/docs