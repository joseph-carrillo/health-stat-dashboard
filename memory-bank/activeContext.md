# activeContext.md

## Current Session Goal (next session)
Two parallel tracks, in whichever order inputs arrive:
1. **Go-live Step 3** — deployment Steps 1+2 are DONE and verified (see
   `deployment-checklist.md`). Step 3 needs: the purchased `.com` domain + server IP/SSH from
   IT + ports 80/443 confirmed. Then: `RUNBOOK.md → Production — server deployment`, tag
   `v1.0.0`, bump package.json, cut the changelog.
2. **Finish analyzing the last 6 file-groups**, then merge all 18 into a Joseph-facing summary.
   Files landed 2026-07-05 for all 10 programs (46 files, 18 sub-groups); 12/18 analyzed so far,
   write-ups in `memory-bank/template_analysis/`. Remaining: Post Partum (3 files), Intra Partum
   (2), NCD (5), Geriatric (2), Family Planning (1), Morbidity (1). **Do one file-group at a
   time**, checking Joseph's usage % before each launch (running all 18 in parallel burned the
   session's rate limit last time — see session log below). After the merge, several schema
   questions need Joseph's decision before any seeding starts (see `project_state.md` → Open
   work #3).

## 2026-07-05 session 3 (HOME machine) — All 10 programs' files landed; 12/18 analyzed
Full detail in `project_state.md` Session 3 log and `memory-bank/template_analysis/*.md`. Short
version: the "10 programs still empty" read at startup was wrong — files exist, just nested one
folder deeper than the initial shallow `ls` checked (46 files, 18 natural sub-groups, not 7).
Ran all 18 analysis sub-agents in parallel first; 11 died mid-run when the session hit its rate
limit (Explore agents have no resume — a kill means redoing that sub-group from scratch).
Switched to one-at-a-time with Joseph reporting his usage % before each launch; no further
failures. 12/18 done by shutdown. Real template bugs found in several files (Schisto, Rabies,
Leprosy, Vital Stats Mortality/Natality, GD screening) — not just documentation, see each file
in `template_analysis/` for specifics. No DB/code changes this session — analysis only.

## 2026-07-04 session 2 (HOME machine) — CI check, Feb FIC, foundation docs audit
Three quick tasks, no code changes (docs-only commit `ca754a1`, pushed):
1. CI confirmed green for all three morning pushes via GitHub API (no `gh` CLI needed —
   reusable method: `git credential fill` for the token, then the REST API directly).
2. Missing Feb FIC investigated end-to-end (health_data, staging, full audit_log) — no bug,
   February was simply never uploaded for any file. Corrected a stale memory line that wrongly
   said this machine had "CPAB Jan+Feb" data.
3. Foundation docs audit — all 12 root docs checked against code. Found and fixed real
   inaccuracies (not just staleness): wrong region name (Region VII → NIR), wrong SBI glossary
   definition, CONTRIBUTING telling people to branch instead of the locked direct-to-main
   workflow, several docs still describing bcrypt/no-fail-fast/no-CI/dev-bypass that were
   closed this morning. Full list in `project_state.md` session log.

Also: Joseph asked about converting the workflow to a more agentic goal→build→validate→loop
pattern. Discussed but not built — proposed piloting it on the next program build-out with a
machine-checkable "definition of done." See `project_state.md` for the fuller note. Worth
revisiting `adding_templates.md` when he's ready to try it.

## 2026-07-04 session 1 (HOME machine) — deployment infrastructure built
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
1. Ask Joseph: domain + server credentials in hand? → go-live Step 3.
2. Ask Joseph his current usage %, then launch the next single file-group analysis (Post
   Partum, Intra Partum, NCD, Geriatric, Family Planning, or Morbidity — smallest first).
   Persist each Explore-agent result into `memory-bank/template_analysis/` yourself (they have
   no Write tool). Once all 18 are done, merge into one summary for Joseph before seeding
   anything.
3. Parked, needing Joseph when ready: stash@{0} fate (HOME machine), small-cell suppression
   cutoff, data-dictionary draft greenlight.

## Watch out for
- **`backend/data/<PROGRAM>/` folders can look empty at a shallow `ls` even when full of
  files** — three programs' files are nested one level deeper in sub-category folders
  (`MATERNAL_CARE/Prenatal|Post Partum|Intra Partum`, `INFECTIOUS_DISEASE/<6 sub-diseases>`,
  `VITAL_STATS/Mortality|Natality`). Always `find`/recurse fully before concluding a program
  folder is empty.
- **Known template errors** flagged by the team (in `progress.md`): `morta_mmr_imr_nir.xlsx`
  (col 33 label — confirmed root cause 2026-07-05, see `template_analysis/vital_stats_mortality.md`),
  `envi_sanitation_zod_nir.xlsx` (Q3/Q4 structure), `nata_lb_abr_rabr_nir.xlsx` (confirmed
  worse than expected — live `#REF!` bug, see `template_analysis/vital_stats_natality.md`),
  `pre_gd_screening` denominator (confirmed root cause, see `template_analysis/maternal_care_prenatal.md`),
  Vitamin A, schisto (messiest file group found — new bugs beyond the known ones, see
  `template_analysis/infectious_disease_schistosomiasis.md`) — flag on analysis, don't silently
  ingest.
- **Killed background agents don't resume** — a rate-limit kill mid-run means redoing that
  agent's whole task from scratch, not continuing where it left off. Prefer smaller batches
  (1-2 files) over large parallel fan-outs when quota is uncertain.
- Do NOT run `docker compose -f docker-compose.prod.yml` in this repo without `-p <other-name>`
  — same project name as dev would collide.
- The rate limiter counts per-worker in memory; dev uvicorn = exact 10/min, prod 3 workers =
  up to 3× worst case (documented, acceptable).
