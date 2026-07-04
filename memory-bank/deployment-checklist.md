# Deployment / Go-Live Checklist — v1.0.0

> Created 2026-07-04. Check items off as they ship; per ADR-011, **v1.0.0 = first live deploy**.
> Plan approved by Joseph 2026-07-04 (see context below). Update this file, not just ROADMAP,
> when a step lands.

## Context (locked 2026-07-04)
- IT gives us space on their server: **we get SSH, server has internet access, site is
  public-internet-facing, and we manage the server + backups ourselves.**
- **Domain: purchase a `.com`** — IT's call, because the `.gov.ph` process is too slow right now.
  Revisit a gov subdomain later when it becomes front-facing officially.
- Usage now is internal-only, but the URL is publicly reachable → **all hardening below is
  mandatory before deploy** (anyone on earth can reach the login page).
- **Demo audience = health-care professionals (higher-ups), not IT.** The demo is the program
  content and dashboards, not the infrastructure. Program build-out (10 remaining programs) is
  the parallel track that makes the demo land — infra just has to work quietly.

## Target architecture (deliberately boring — single VM + compose)
```
domain.com → (optional Cloudflare free proxy) → server
  Caddy (80/443, auto-HTTPS via Let's Encrypt)
    → frontend nginx (SPA + /api proxy) → backend gunicorn → PostgreSQL
  backup sidecar: nightly pg_dump, 30-day retention + weekly off-server copy
Deploy: git tag → GitHub Actions builds images → GHCR → server: compose pull && up -d
```
No Kubernetes, no Terraform — wrong scale for one VM and one maintainer.

## Step 1 — Hardening (code, ~1 session, no IT dependency) — DONE 2026-07-04
- [x] Fail-fast on missing `JWT_SECRET_KEY` / `DB_PASSWORD` — fallbacks removed
      (`app/core/env.py` `require_env`; `db.py` lazy `get_db_config()`; `seed_indicators.py`
      duplicate config consolidated). Verified: image without env refuses to start.
- [x] Rate-limit `/api/login` — slowapi, 10/min per client IP (X-Forwarded-For-aware).
      Verified: 10×401 then 429; valid login still 200.
- [x] Lock down `CORS_ORIGINS` (explicit dev default, prod origin documented in .env.example)
      + security headers in `frontend/nginx.conf` (nosniff, X-Frame-Options DENY,
      Referrer-Policy, Permissions-Policy; HSTS deferred to Caddy). nginx -t verified.
- [x] Healthchecks for backend + frontend in `docker-compose.prod.yml`; frontend waits on
      healthy backend. `compose config` verified.
- [x] Fix stale docs: CLAUDE.md advertised a `dev`/`dev` offline bypass that no longer exists
      in code (verified absent; removed 2026-07-04, along with other stale CLAUDE.md claims).

## Step 2 — Deploy infrastructure (~1 session, no IT dependency) — DONE 2026-07-04
- [x] Caddy service in `docker-compose.prod.yml` + `Caddyfile` — auto-TLS when
      `SITE_ADDRESS=<domain>`, plain HTTP when `:80` (parity testing); sends HSTS; frontend
      no longer published to the host. `caddy validate` clean.
- [x] Backup sidecar (`db-backup`): nightly gzipped `pg_dump` to `./backups/`, 30-day
      retention; weekly off-server copy + restore drill documented in RUNBOOK.
- [x] CI `release-images` job: `v*` tag → tests must pass → backend+frontend production
      images pushed to GHCR; prod compose has `image:` names + `IMAGE_TAG` for
      `pull && up -d` deploys.
- [x] RUNBOOK "Production — server deployment": one-time prep, first deploy, release +
      rollback, backups. **Verified end-to-end 2026-07-04**: full prod stack brought up in
      an isolated compose project — all 5 services healthy, security headers + HSTS through
      Caddy, bootstrap in prod image, bad login 401 / good login 200 via port 80, nightly
      dump file produced. Found & fixed along the way: `NavBar.jsx`→`Navbar.jsx` case bug
      (prod image build was broken on Linux), nginx IPv6 listener + healthcheck 127.0.0.1.

## Step 3 — Go live (needs domain + server access)
- [ ] Buy the .com (Cloudflare Registrar or Namecheap, ~$10–15/yr — only cost in the plan).
      Optional but recommended: Cloudflare free proxy in front (DDoS protection, hides server IP).
- [ ] Point DNS A record at the server; confirm ports 80/443 open inbound (ask IT).
- [ ] SSH in, deploy, run `bootstrap_db.py`, **rotate the admin password** (repo default is
      public), set strong `.env` secrets.
- [ ] Smoke test over HTTPS: login, upload one file, view dashboards.
- [ ] Tag **v1.0.0**, bump `frontend/package.json`, promote CHANGELOG `[Unreleased]` → 1.0.0.

## Waiting on Joseph / IT
- [ ] Domain name choice + purchase
- [ ] Server IP + SSH credentials from IT
- [ ] Confirm inbound 80/443 open on the server

## Parallel track (the actual demo content)
- [ ] Program build-out, one at a time, as `.xlsx` files land in `backend/data/<PROGRAM_CODE>/`
      (recipe: `adding_templates.md`). Launch is fine with CHILD_CARE only; each new program
      ships incrementally after.
