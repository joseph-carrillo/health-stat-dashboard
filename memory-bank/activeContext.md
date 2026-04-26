# activeContext.md

## Current Session Goal
Month 1 foundation is complete. Next session starts database table creation.

## What Was Just Completed
- Project folder skeleton created and committed to GitHub
- .gitignore created
- docker-compose.yml created
- backend/main.py entry point created
- PostgreSQL 15 running in Docker — verified
- DBeaver connected to local database — verified
- All committed to GitHub

## What Happens Next (Start Here)
Next session — seed reference data into the database:

Step 1 — Load locations (PSGC codes for NIR)
Step 2 — Load programs (Child Care, Maternal Care, etc.)
Step 3 — Load indicators (start with Immunization program)
Step 4 — Write first parser config JSON for Immunization File 1

## Key Decisions Already Made
- Stack: React + FastAPI + PostgreSQL + Docker
- 7-table schema: locations, programs, indicators, report_periods,
  health_data, staging_health_data, reference_populations
- Config-driven parser (one JSON per template)
- Conflict handling: Option C (stage and review)
- RBAC: 5 roles (Admin, Data Encoder, Program Manager, ManCom, ExeCom)
- TB out of scope now, addable later without schema changes
- Phase 2: web form to replace Excel upload (future)

## Local Database (Development)
- Host: localhost | Port: 5432
- Database: doh_nir_dashboard
- Username: doh_admin | Password: doh_password_2026
- Start with: docker-compose up -d
- Stop with: docker-compose down

## Office Desktop Monday Checklist
1. git pull origin main
2. Start Docker Desktop
3. docker-compose up -d
4. Open DBeaver — connection already saved

## Critical Reference
fhsis_template_analysis.md is in project knowledge.
Always search it before making any parser or schema decisions.