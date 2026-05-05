# activeContext.md

## Current Session Goal
Completed. Frontend login page built with DOH branding.

## What Was Just Completed
- Protected all API endpoints with JWT authentication
- Added require_permission helper for role-based access
- Built user registration endpoint (POST /api/register)
- Built admin user management endpoints (GET/POST /api/admin/users)
- Added users table to schema.sql
- Fixed role column to allow NULL for pending users
- React frontend set up with Vite
- DOH branding applied (DM 2025-0600):
  - Colors: Deep Navy #1F2A45, Health Blue #0B4BAA, Mint Cream #EEFAF6
  - Fonts: Montserrat (headings) + Barlow (body)
  - DOH Seal, Bagong Pilipinas logo, NIR Wordmark added
- Login page built and displaying correctly
- Dashboard page created (not yet connected to API)
- App.jsx routing between Login and Dashboard

## What Happens Next (Start Here)
Connect the login form to the API and test full login flow in browser.

Step 1 — Test login in browser
- Go to http://localhost:5173
- Login with admin / Admin@2026!
- Should redirect to Dashboard

Step 2 — Fix any connection issues between frontend and API
- API runs on port 8000
- Frontend runs on port 5173
- Proxy is configured in vite.config.js

Step 3 — Build Dashboard page properly
- Show CPAB coverage data in table
- Add month filter
- Show on-target / near-target / below-target status badges

Step 4 — Build Upload page
- Program selector
- Sub-program selector
- File picker
- Month/year selector
- Upload button
- Show batch summary after upload

## Daily Startup Checklist
1. git pull origin main
2. Start Docker Desktop
3. docker-compose up -d
4. uvicorn backend.main:app --reload (Terminal 1)
5. cd frontend && npm run dev (Terminal 2 or 3)
6. Open http://localhost:5173

## API and Frontend Ports
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: username=admin, password=Admin@2026!
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