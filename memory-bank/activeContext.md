# activeContext.md

## Current Session Goal
Template analysis is complete. Ready to begin building.

## What Was Just Completed
- Analyzed all 63 FHSIS Excel templates
- Cross-referenced 107 official indicators from DOH memorandum
- Completed fhsis_template_analysis.md — added to project knowledge
- Updated all memory-bank files to reflect current state
- Database schema design is finalized (7 tables)
- Parser design is confirmed (config-driven)

## What Happens Next (Start Here)
The next session should begin Month 1 of the build:

Step 1 — Project skeleton
- Create the full folder structure in the GitHub repo
- Set up .gitignore
- Set up docker-compose.yml

Step 2 — Database
- Set up PostgreSQL in Docker
- Create the 7 tables from the schema in architecture.md
- Verify tables in DBeaver

Step 3 — First parser config
- Write the JSON config for Child Care Immunization File 1 (CPAB_BCG_HepaB1)
- This is the proof of concept for the entire ingestion pipeline

## Key Decisions Already Made
- Stack: React + FastAPI + PostgreSQL + Docker
- 7-table schema: locations, programs, indicators, report_periods, health_data, staging_health_data, reference_populations
- Config-driven parser (one JSON per template)
- Conflict handling: Option C (stage and review)
- RBAC: 5 roles (Admin, Data Encoder, Program Manager, ManCom, ExeCom)
- TB out of scope now, addable later without schema changes
- Phase 2: web form to replace Excel upload (future)

## Critical Reference
fhsis_template_analysis.md is in project knowledge.
It contains all template structures, DQC rules, denominators, and formula types.
Always search it before making any parser or schema decisions.

## How to Start a New Session
Paste this into a fresh Claude chat inside the project:
"Template analysis is complete. Read activeContext.md for current status.
Today we are starting Month 1 of the build — project skeleton and database setup."
