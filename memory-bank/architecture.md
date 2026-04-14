# architecture.md

## Tech Stack
| Layer | Tool |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Excel Parser | pandas + openpyxl |
| Auth | JWT + bcrypt |
| Containers | Docker + docker-compose |
| DB Viewer | DBeaver |
| Version Control | Git + GitHub (private) |
| Hosting (start) | Railway or Render (free tier) |

## Data Flow
Excel Upload → FastAPI Parser → Validation Layer → PostgreSQL → FastAPI API → React Dashboard

## Future Data Flow (Phase 2)
Web Form (mirrors Excel) → FastAPI → Validation Layer → PostgreSQL → FastAPI API → React Dashboard

## Folder Structure (planned)

health-stat-dashboard/
├── memory-bank/
├── backend/
│   ├── app/
│   │   ├── api/          # route handlers
│   │   ├── core/         # config, security
│   │   ├── models/       # database models
│   │   ├── schemas/      # data validation
│   │   ├── services/     # business logic
│   │   └── utils/        # helpers
│   ├── tests/
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/     # API calls
│   │   └── utils/
│   └── index.html
├── docker-compose.yml
└── .gitignore