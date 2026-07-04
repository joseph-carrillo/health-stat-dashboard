# session-handoff.md

## Last Updated
2026-07-04, session 2 (HOME machine — CI check, Feb FIC investigation, foundation docs audit
`ca754a1`, all pushed; no code changes this session)

## Current Objective
Two parallel tracks:
1. **Go-live (v1.0.0)** — Steps 1+2 of `deployment-checklist.md` are DONE and verified; Step 3
   (the actual deploy) waits only on **Joseph buying the .com domain** and **IT handing over
   server IP + SSH** (+ confirm ports 80/443 open). When those arrive, follow
   `RUNBOOK.md → Production — server deployment`, then tag `v1.0.0`.
2. **Build out the 10 non-Child-Care programs** — still blocked: `backend/data/<PROGRAM>/`
   folders are all empty as of end of session. When files land: one program at a time,
   analyze → seed → config → dry-run → Joseph tests. Recipe: `adding_templates.md`.

## Done This Session — Session 2 (2026-07-04, HOME machine)
- **CI checked green** for `da851f9`/`0edef57`/`f1a0dc6` + shutdown commit, via GitHub REST
  API (token from `git credential fill` — no `gh` CLI needed; reusable next time).
- **Missing Feb FIC resolved as expected, not a bug** — audit_log (114 events, full history)
  shows no February upload was ever attempted for any template. Corrected a wrong memory line
  that said this DB had "CPAB Jan+Feb" — it doesn't; Feb data is absent entirely.
- **Foundation docs audit** (`ca754a1`, pushed) — all 12 root docs checked against code/DB.
  Fixed real errors: wrong region name (said Region VII/Central Visayas, should be NIR — Negros
  Island Region), wrong SBI definition in GLOSSARY (said Sick/Birth, it's School-Based
  Immunization), CONTRIBUTING told people to branch instead of the locked direct-to-main flow,
  and several docs still described bcrypt/no-CI/no-fail-fast/dev-bypass that were closed this
  morning. Stale counts fixed too (indicators, routes, test files). SECURITY/RUNBOOK/CHANGELOG/
  ROADMAP/DECISIONS_LOG were already accurate.
- **Discussed (not built): agentic goal→build→validate→loop workflow.** Joseph asked if the
  build process can shift toward defining a goal and letting the loop run to a validated done
  state. Proposed piloting on the next program build-out with a machine-checkable "definition
  of done." No commitment yet — flag this if Joseph brings it up again.

## Done Session 1 (2026-07-04, HOME machine)
- **Deployment checklist created** (`memory-bank/deployment-checklist.md`) after Joseph locked
  the deploy context with IT: self-managed server (SSH, public internet, backups on us),
  purchase a `.com`. ADR-017.
- **Step 1 — hardening** (`da851f9`): fail-fast secrets (`app/core/env.py`; no more hardcoded
  fallbacks anywhere — incl. a third copy found in `seed_indicators.py`), login rate limit
  (10/min/IP, verified 429), CORS locked, nginx security headers, prod healthchecks. 24 tests.
- **Step 2 — deploy infra** (`0edef57`): Caddy auto-TLS (`Caddyfile`, `SITE_ADDRESS` in .env),
  nightly `db-backup` sidecar → `./backups`, CI `release-images` job (v* tag → GHCR),
  RUNBOOK server-deployment section. **Verified end-to-end** in an isolated compose project.
  Found + fixed: `NavBar.jsx`→`Navbar.jsx` case bug — **the prod image build had been silently
  broken on Linux**; nginx IPv6 listener + healthcheck 127.0.0.1.
- **argon2 migration + fixes** (`f1a0dc6`): argon2id with transparent upgrade-on-login
  (verified live: admin's bcrypt hash flipped to argon2 after login), login 503 (not 500) when
  DB down, SECURITY.md corrected (sensitive = full exclusion, not "aggregated totals").
  29 tests. ADR-018.
- **Protocol upgrades** (this file's format included): startup now syncs git BEFORE reading
  memory and surfaces machine-local state; shutdown requires machine + push verification +
  the "Machine-local state" section below. Root CLAUDE.md de-rotted (dev/dev bypass removed,
  NIR not Region VII, CI/tests text current); memory-bank/CLAUDE.md now defers to root.
- **Permissions allowlist** (`.claude/settings.json`, git-tracked): read-only ops +
  compose up/down + npm build:css approved by Joseph — far fewer permission prompts.
- **Machine-label correction**: the 2026-07-03 "office" session actually ran on the HOME
  machine — both stashes live HERE, not at the office.

## Next Session — first moves
1. `startup protocols` (git sync FIRST, then memory; check machine-local state).
2. Ask Joseph: domain bought? server credentials from IT? → if yes, Step 3 go-live per RUNBOOK.
3. `ls backend/data/*/` — any `.xlsx` dropped? → if yes, start that program's analysis. Consider
   the agentic build-loop pilot here if Joseph wants to try it (see Done This Session above).
4. Parked decisions when Joseph's ready: stash@{0} fate (HOME machine), small-cell cutoff
   (<5 or <10), data-dictionary greenlight.

## Machine-local state (things GitHub does NOT sync — required section per shutdown protocol)
As of shutdown 2026-07-04, session 2 (HOME machine) — **unchanged from session 1**, verified
again at this shutdown:
- **HOME machine (this one): `stash@{0}`** = untested Overview Card feature (parked by Joseph
  2026-07-04, decision pending); **`stash@{1}`** = older "indicator-reports-area-filter",
  provenance unknown. **Earlier notes said these were on the office machine — WRONG, corrected
  2026-07-04.** They do not exist on the office desktop.
- **Office machine**: should be clean at `19d6871`; will fast-forward on next pull. No known
  local state.
- `backend/data/` program subfolders: **empty on this machine** (only the 3 already-built SBI
  files at the data root). Files Joseph drops exist only on the machine he drops them on.
- HOME machine has **no `gh` CLI** — check CI via the browser Actions tab here.
- `.env` (per-machine): updated here with `CORS_ORIGINS=http://localhost:5173,http://localhost`
  — the office copy still says `CORS_ORIGINS=*`, which still works but should be updated to
  match `.env.example` when next at the office.

## Notes / Gotchas
- **Uncommitted code: none.** Everything shipped is pushed through `f1a0dc6`.
- Rate limiter: 10 bad logins/min/IP → 429; in-memory per gunicorn worker (documented).
- Prod parity test: `docker compose -p healthstat-prod -f docker-compose.prod.yml up -d --build`
  (isolated project name — do NOT run the prod file without `-p`, it would collide with dev).
- Known template errors to flag, not silently ingest: morta_mmr, envi_sanitation, nata_lb_abr,
  pre_gd_screening, Vitamin A, schisto (see `progress.md`).
- Changelog discipline: bump `frontend/package.json` on release; **1.0.0 = first deploy**.
- PowerShell here-strings break for git messages — use `git commit -F <file>` or Bash heredoc.

## First Command Next Session
```
startup protocols
```
