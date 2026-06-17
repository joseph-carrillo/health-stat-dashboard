# Health Statistics Dashboard (DOH-NIR CHD, Region VII)

A web dashboard for ingesting, validating, and reporting Field Health Services Information
System (FHSIS) health statistics for the Department of Health — National Immunization Registry,
Center for Health Development Region VII (Central Visayas), Philippines.

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend:** FastAPI (Python 3.12)
- **Database:** PostgreSQL 15
- **Everything runs in Docker.**

## Quickstart

```bash
cp .env.example .env                 # first time only — fill in values
docker compose up -d --build         # start db + backend + frontend
docker compose exec backend python backend/bootstrap_db.py   # first time only: schema + seed + admin
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

Stop with `docker compose down`. Tail logs with `docker compose logs -f backend`.

### Test credentials
| User | Password | Role |
|---|---|---|
| `admin` | `Admin@2026!` | full admin |
| `jsmith` | `Test@2026!` | program_manager (CHILD_CARE) |
| `dev` | `dev` | offline dev bypass (no DB) |

## Production parity

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Runs gunicorn behind nginx — the built SPA is served on port 80 and `/api` is proxied to the
backend container.

## How it works (at a glance)

Excel upload → parse (config-driven) → stage → conflict review → approve → commit to `health_data`.
Adding a new Excel template means adding one JSON config — no parser code changes.

## Documentation

| Doc | What's in it |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System layout, request flow, upload pipeline, auth/RBAC |
| [DATA_MODEL.md](DATA_MODEL.md) | Database schema (narrow/tall), key tables, uniqueness rules |
| [DECISIONS_LOG.md](DECISIONS_LOG.md) | Architecture Decision Records (append-only) |
| [SECURITY.md](SECURITY.md) | Roles, JWT, audit, Data Privacy Act, sensitive indicators, known gaps |
| [RUNBOOK.md](RUNBOOK.md) | Operating the stack: start/stop, bootstrap, backup/restore, troubleshooting |
| [ROADMAP.md](ROADMAP.md) | Phases, milestones, what's done / next |
| [GLOSSARY.md](GLOSSARY.md) | Domain terms (FHSIS, DQC, PSGC, LGU, MAM/SAM, …) |
| [FILE_STRUCTURE.md](FILE_STRUCTURE.md) | Directory layout and rationale |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Conventions, workflow, adding a template |
| [CLAUDE.md](CLAUDE.md) | Guidance for Claude Code + session protocols |

Session memory lives in [`memory-bank/`](memory-bank/MEMORY.md).
