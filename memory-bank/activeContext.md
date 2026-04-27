# activeContext.md

## Current Session Goal
Completed. Auth layer is working.

## What Was Just Completed
- FastAPI endpoints fully tested via docs page
- Upload endpoint tested — file uploaded via API successfully
- Batch summary endpoint tested — shows staged data correctly
- Approve endpoint tested — 2,667 rows committed via API
- Auth module created (backend/app/core/auth.py)
- Users table created in database
- First admin user created (username: admin)
- JWT login endpoint working — returns token + permissions
- bcrypt version fixed (downgraded to 4.0.1 for Python 3.14 compatibility)

## What Happens Next (Start Here)
Protect the existing endpoints with authentication.
Then build the frontend.

Step 1 — Add auth protection to endpoints
- Add get_current_user dependency to upload, approve, health-data endpoints
- Test that endpoints reject requests without a valid token
- Test that endpoints accept requests with a valid token

Step 2 — Add more users
- Create users for each role (data_encoder, program_manager, mancom, execom)
- Test that each role can only do what they are allowed to

Step 3 — Start frontend
- Set up React app
- Build login page first
- Build upload page
- Build dashboard page

## Key Auth Details
- Login endpoint: POST /api/login
- Token type: JWT Bearer
- Token expiry: 8 hours (one work day)
- Admin credentials: username=admin, password=Admin@2026!
- Roles: admin, data_encoder, program_manager, mancom, execom

## Local Database (Development)
- Host: localhost | Port: 5432
- Database: doh_nir_dashboard
- Username: doh_admin | Password: doh_password_2026
- Start with: docker-compose up -d
- Stop with: docker-compose down

## Daily Checklist (Office Desktop)
1. git pull origin main
2. docker-compose up -d
3. uvicorn backend.main:app --reload
4. Open second terminal for git commands

## Critical Reference
fhsis_template_analysis.md is in project knowledge.
Always search it before making any parser or schema decisions.