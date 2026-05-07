# activeContext.md

## Current Session Goal
Connect real province-level data to Overview page maps and summary cards.

## Strategic Decision Made Today
Adopted Two-Track deployment strategy:

### Track 1 — Province Level Dashboard (Target: End of May 2026)
- Province level maps colored by coverage
- Summary cards with real numbers
- Program scorecard on Home page
- Deploy to ICTU server for internal feedback

### Track 2 — LGU/Barangay Level Dashboard (Target: End of June 2026)
- Fix FHSIS template errors (see pending list)
- Build LGU level parsers
- Upgrade maps to municipality/barangay level
- Full Coverage, Trends, Rankings pages

## Reason For Decision
- Higher ops want something live now
- Province level data already exists and works
- LGU level files have template errors not yet fixed
- Feedback from live system shapes LGU build correctly

## What Was Just Completed
- Login page connected to API
- Sidebar navigation built
- Home page with program scorecard and alerts
- Skeleton placeholder pages for all sections
- Overview page with maps and ranking (mock data)
- All pages wired in App.jsx with RBAC route protection
- Dev bypass added for laptop development (remove before go-live)

## What Happens Next
Step 1 — Confirm real data in database (done — 500 rows, values present)
Step 2 — Build province level API endpoint
Step 3 — Connect real data to Overview maps and summary cards
Step 4 — Deploy skeleton to ICTU server

## Daily Startup Checklist
1. git pull origin main
2. Start Docker Desktop
3. docker-compose up -d
4. uvicorn backend.main:app --reload (Terminal 1)
5. cd frontend && npm run dev (Terminal 2)
6. Open http://localhost:5173

## API and Frontend Ports
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: username=admin, password=Admin@2026!
- Dev bypass: username=dev, password=dev (REMOVE BEFORE GO-LIVE)
- Test user: username=jsmith, password=Test@2026! (role=program_manager)

## Local Database
- Host: localhost | Port: 5432
- Database: doh_nir_dashboard
- Username: doh_admin | Password: doh_password_2026

## DOH Branding Reference
- Primary colors: #1F2A45 (Deep Navy), #0B4BAA (Health Blue), #EEFAF6 (Mint Cream)
- Fonts: Montserrat (headings), Barlow (body)
- Logo files in: frontend/public/images/
- Branding memo: DM 2025-0600

## ICTU Server Status
- OS: Windows Server 2022
- Access: SSH preferred (FTP not recommended)
- Docker: To be installed by ICTU
- Domain: IP address only (no domain name yet)
- Network: Intranet + Internet access
- Status: Pending approval from higher ops