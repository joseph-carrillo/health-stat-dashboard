# Runbook

Operational procedures for the containerized stack. All commands run from the repo root.

## Start / stop

```bash
cp .env.example .env             # first time only
docker compose up -d --build     # start db + backend + frontend
docker compose ps                # check status (db should be "healthy")
docker compose logs -f backend   # tail backend logs
docker compose down              # stop everything (keeps the DB volume)
docker compose down -v           # stop AND delete the DB volume (destroys data)
```

- Frontend: http://localhost:5173 · Backend docs: http://localhost:8000/docs

PowerShell convenience wrappers exist: `scripts\start.ps1`, `scripts\stop.ps1`,
`scripts\health-check.ps1`.

## First-time DB bootstrap

```bash
docker compose exec backend python backend/bootstrap_db.py
```

Creates the schema, seeds reference data (locations, programs, periods, indicators), and
creates the `admin` user.

## Reset / reseed the database

```bash
docker compose down -v           # drop the volume
docker compose up -d
docker compose exec backend python backend/bootstrap_db.py
```

Or run the SQL by hand inside the db container:

```bash
docker compose exec -T db psql -U doh_admin -d doh_nir_dashboard < backend/app/core/schema.slq
docker compose exec -T db psql -U doh_admin -d doh_nir_dashboard < backend/app/core/seed_locations.sql
docker compose exec -T db psql -U doh_admin -d doh_nir_dashboard < backend/app/core/seed_indicators_immunization.sql
```

## Backup / restore

```bash
# Backup
docker compose exec -T db pg_dump -U doh_admin doh_nir_dashboard > backup_$(date +%F).sql

# Restore (into a running, empty DB)
docker compose exec -T db psql -U doh_admin -d doh_nir_dashboard < backup_2026-06-17.sql
```

## Production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

SPA on port 80 (nginx), `/api` proxied to the backend (gunicorn). Set strong `DB_PASSWORD`,
`JWT_SECRET_KEY`, and a real `CORS_ORIGINS` in `.env` first.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `compose up` errors "DB_PASSWORD must be set" | No `.env` | `cp .env.example .env` |
| Login returns 500, logs show "password cannot be longer than 72 bytes" | bcrypt ≥4.1 pulled in | ensure `bcrypt>=4.0,<4.1` in `requirements.txt`, rebuild backend |
| Frontend loads but `/api` calls fail | proxy target wrong | confirm `VITE_PROXY_TARGET=http://backend:8000` in compose |
| Backend can't reach DB | using `localhost` inside container | `DB_HOST` must be `db` in compose |
| Port already in use | host process on 5173/8000/5432 | stop it or change the published port |
| Code change not reflected | rebuild needed for deps; source is hot-mounted | `docker compose up -d --build backend` |

## Rebuild after dependency changes

```bash
docker compose build backend     # or frontend
docker compose up -d backend
```

Source files are bind-mounted in dev (hot reload); only dependency or Dockerfile changes need
a rebuild.
