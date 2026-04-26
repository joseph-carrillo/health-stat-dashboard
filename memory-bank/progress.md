# progress.md

## Status: Template Analysis Complete — Ready for Schema Design

## Completed
- Chose Option B architecture (React + FastAPI + PostgreSQL + Docker)
- Installed all tools on office desktop and personal laptop
- Created private GitHub repository (health-stat-dashboard)
- Set up memory-bank folder with all 4 files
- Set up Claude Project with instructions and knowledge files
- Attended April 20 stakeholder meeting
- Conducted survey of ExeCom, ManCom, and Program Managers
- Analyzed ALL 63 Excel templates across all programs
- Cross-referenced 107 official indicators from DOH memorandum
- Completed fhsis_template_analysis.md (added to project knowledge)
- Confirmed all denominator types, DQC rules, and formula types
- Logged all template errors for team correction
- Designed database schema (7 tables)
- Confirmed parser design (config-driven)
- Confirmed RBAC design (5 roles)
- Confirmed conflict handling strategy (Option C — stage and review)

## Programs Analyzed
| Program | Files | Status |
|---|---|---|
| Child Care (4 subfolders) | 15 | ✅ |
| Demographics | 1 | ✅ |
| Environmental Health | 2 | ✅ |
| Family Planning | 1 | ✅ |
| Geriatric Health | 2 | ✅ |
| Maternal Care (3 subfolders) | 13 | ✅ |
| Morbidity | 1 | ✅ |
| NCD | 5 | ✅ |
| Oral Health | 1 | ✅ |
| Vital Statistics | 2 | ✅ |
| Infectious Disease (6 subfolders) | 16 | ✅ |
| TB | 0 | Out of scope |

## Pending Team Actions (Template Errors to Fix)
- `envi_sanitation_zod_nir.xlsx` — Fix Qtr3 and Qtr4 structure (extra column, missing rows)
- `nata_lb_abr_rabr_nir.xlsx` — Add missing ABR <10 column to Q2 sheet
- `morta_mmr_imr_nir.xlsx` — Fix col 33 label (d4 → g4)
- `2__pre_nutritional_status_bmi_nir.xlsx` — Fix col V label (Low BMI → High BMI) ✅ Done
- `6__pre_gd_screening_nir.xlsx` — Fix col Z formula (g/h → g/a)
- `2_3_Vitamin_A_supplementation_nir.xlsx` — Fix col 11 formula (g/h → i/f)
- `infec_schisto_5-14, 15-19, 20-59, 60above` — Fix Qtr1b col D and Qtr1d col J labels

## Parked Items
- Morbidity file — needs per-LGU and barangay expansion
- Animal bites file — rate multiplier unclear, parked
- Filariasis MDA file — wrong locations (other regions), excluded
- NCD HUC barangay rows — missing across multiple files

## Next Steps
1. Build project folder skeleton
2. Set up Docker and PostgreSQL locally
3. Create database schema (7 tables)
4. Write first parser config (start with Immunization File 1)
5. Build Excel parser service
6. Build validation engine
7. Build FastAPI endpoints
8. Build auth and RBAC
9. Build frontend (last)

## Schema Update — indicators table
Add two columns based on technical breakdown file:
- target_value (decimal) — the 2026 performance target
- target_year (integer) — the year the target applies to
