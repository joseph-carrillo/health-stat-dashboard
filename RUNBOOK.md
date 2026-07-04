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

## Production — local parity test

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy serves on port 80 (`SITE_ADDRESS=:80` default) → nginx SPA → gunicorn backend.
Nightly DB dumps land in `./backups/`.

## Production — server deployment

The stack: **Caddy** (80/443, automatic Let's Encrypt HTTPS) → **nginx** (SPA + `/api` proxy)
→ **gunicorn** (FastAPI) → **PostgreSQL**, plus a **db-backup** sidecar (nightly `pg_dump`,
30-day retention). We manage the server ourselves (SSH, self-managed backups).

### One-time server prep

1. Install Docker Engine + compose plugin (Ubuntu: `curl -fsSL https://get.docker.com | sh`).
2. Confirm inbound ports **80 and 443** are open (firewall / IT).
3. Point the domain's **DNS A record** at the server IP (at the registrar, or Cloudflare if
   proxying through it).
4. Clone the repo and create the production `.env`:
   ```bash
   git clone https://github.com/joseph-carrillo/health-stat-dashboard.git && cd health-stat-dashboard
   cp .env.example .env
   ```
5. Edit `.env` with **production values** — every one of these matters:
   - `DB_PASSWORD` — long random value: `python3 -c "import secrets; print(secrets.token_urlsafe(24))"`
   - `JWT_SECRET_KEY` — `python3 -c "import secrets; print(secrets.token_urlsafe(48))"`
   - `CORS_ORIGINS=https://<the-domain>` (exactly one origin, no `*`)
   - `SITE_ADDRESS=<the-domain>` (no scheme — this switches Caddy to automatic HTTPS)
   - `IMAGE_TAG=<release>` e.g. `v1.0.0`

### First deploy

```bash
IMAGE_TAG=v1.0.0 docker compose -f docker-compose.prod.yml pull   # from GHCR (or: up -d --build to build on-server)
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend python backend/bootstrap_db.py
```

Then **immediately rotate the admin password** (the bootstrap default is public in the repo):
log in as `admin`, go to Management → Users, change it. Verify: site loads over `https://`,
login works, an upload round-trips.

### Releasing a new version

```bash
# On the dev machine: tag and push — CI tests, builds, and publishes the images.
git tag v1.1.0 && git push origin v1.1.0
# On the server:
IMAGE_TAG=v1.1.0 docker compose -f docker-compose.prod.yml pull
IMAGE_TAG=v1.1.0 docker compose -f docker-compose.prod.yml up -d
```

Rollback = the same two server commands with the previous tag. (Set `IMAGE_TAG` in `.env`
instead of inline to make it sticky.)

### Backups

The `db-backup` service dumps nightly to `./backups/doh_nir_<date>.sql.gz` (30-day retention,
runs automatically). **Weekly, copy the newest dump off the server** — a backup on the same
disk as the database only protects against mistakes, not disk loss:

```bash
scp user@server:~/health-stat-dashboard/backups/doh_nir_$(date +%F).sql.gz .
```

Restore (into a running, empty DB):
```bash
gunzip -c backups/doh_nir_<date>.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U doh_admin -d doh_nir_dashboard
```

Do a restore drill once before go-live so the first real restore isn't the emergency one.

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
