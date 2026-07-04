# activeContext.md

## Current Session Goal (next session)
Two parallel tracks, in whichever order inputs arrive:
1. **Go-live Step 3** — deployment Steps 1+2 are DONE and verified (see
   `deployment-checklist.md`). Step 3 needs: the purchased `.com` domain + server IP/SSH from
   IT + ports 80/443 confirmed. Then: `RUNBOOK.md → Production — server deployment`, tag
   `v1.0.0`, bump package.json, cut the changelog.
2. **Build out the other 10 programs** — Joseph drops FHSIS Excel files into
   `backend/data/<PROGRAM_CODE>/`; then one program at a time, end-to-end: analyze
   (column-by-column into `fhsis_template_analysis.md`) → seed indicators → JSON configs →
   validate → dry-run → Joseph uploads/tests. Recipe: `adding_templates.md`. Still blocked —
   folders empty as of 2026-07-04. **Program content is what the health-professional
   higher-ups will judge; deployment is just the delivery vehicle.**

## 2026-07-04 session (HOME machine) — deployment infrastructure built
Steps 1+2 of the go-live checklist shipped and verified in one session (commits `da851f9`,
`0edef57`, `f1a0dc6`, all pushed): fail-fast secrets, login rate limiting, CORS lockdown,
security headers, healthchecks, Caddy auto-TLS, nightly DB backup sidecar, GHCR release
pipeline (v* tag), RUNBOOK deploy guide, argon2 migration (upgrade-on-login), login 503 on DB
outage, SECURITY.md corrected. Bonus find: the prod frontend image build had been silently
broken for weeks (`NavBar.jsx` vs `Navbar` imports — Windows masked it, Linux didn't).
Full detail: `session-handoff.md` + `deployment-checklist.md`.

Also this session: session protocols hardened for the two-machine workflow (git sync BEFORE
memory reads; machine-local state must be surfaced at startup and logged at shutdown) — and
the machine labels corrected: **both stashes live on the HOME machine**, not the office.

## How the owner wants to work (read this)
Joseph is a **data analyst, not a coder**. Write code he can read; explain every non-obvious
command/pattern in plain language ("smart 10-year-old"). Be a **cold auditor, not a yes-man** —
if a request is wrong/risky, say so and propose an alternative. Strict cadence:
**propose → he reviews → he approves → you build.** One reversible change at a time, verified
before the next. Never dump many files at once. Flag any new dependency and ask first.
See `working-agreement.md` (burnout → "manage, don't grind").

## First moves next session (after `startup protocols`)
1. Check GitHub Actions: CI green for `da851f9`/`0edef57`/`f1a0dc6`? (Home machine has no
   `gh` CLI — use the browser.)
2. Ask Joseph: domain + server credentials in hand? → go-live Step 3.
3. `ls backend/data/*/` — files dropped? → start that program, one at a time.
4. Parked, needing Joseph when ready: stash@{0} fate (HOME machine), small-cell suppression
   cutoff, data-dictionary draft greenlight.

## Watch out for
- **Known template errors** flagged by the team (in `progress.md`): `morta_mmr_imr_nir.xlsx`
  (col 33 label), `envi_sanitation_zod_nir.xlsx` (Q3/Q4 structure), `nata_lb_abr_rabr_nir.xlsx`,
  `pre_gd_screening` denominator, Vitamin A, schisto — flag on analysis, don't silently ingest.
- Do NOT run `docker compose -f docker-compose.prod.yml` in this repo without `-p <other-name>`
  — same project name as dev would collide.
- The rate limiter counts per-worker in memory; dev uvicorn = exact 10/min, prod 3 workers =
  up to 3× worst case (documented, acceptable).
