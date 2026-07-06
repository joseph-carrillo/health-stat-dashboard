# activeContext.md

## Current Session Goal (next session)
Two parallel tracks, in whichever order inputs arrive:
1. **Go-live Step 3** — domain purchased + IT has handed over server IP/SSH as of 2026-07-06;
   only ports 80/443 confirmation is still pending. **Joseph is targeting live within ~2 weeks.**
   Start server prep (`RUNBOOK.md → Production — server deployment → One-time server prep`)
   as soon as the domain name + server IP are shared in chat — this doesn't need to wait on
   ports. Then: DNS A record, deploy, smoke test, rotate admin password, tag `v1.0.0`.
2. **Finish Demographics, then move to the next program.** Indicators + config are built and
   config-validated (Session 5), but dry-run testing against the real `Demographics_nir.xlsx`
   is blocked on this being the HOME machine — do that first. Then decide whether to commit the
   Session 5 changes (Joseph said "park this" but didn't confirm commit vs. hold — check
   session-handoff.md for how that was left). After Demographics is fully signed off, next up
   per `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md`'s build order: **HIV-Syphilis-
   HepaB** (recommended first — smallest clean group, exercises sensitive-data RBAC end-to-end).
   Recipe: `.claude/skills/add-template` (new, formalizes what `adding_templates.md` used to be
   the only source for).

## 2026-07-06 session 5 (OFFICE machine) — Consolidated summary, 2 skills, Demographics pilot, go-live update
Four things happened, in order: (1) built the consolidated summary
(`memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md`) merging all 18 analysis write-ups
into decisions D1–D10, a sensitive-indicator ladder, a DOH-fix list, and an 11-step build order;
(2) created two Claude Code skills (`analyze-template`, `add-template`) to formalize the
analysis and build loops, the latter with a machine-checkable definition-of-done (the
goal→build→validate→loop pattern discussed 2026-07-04); (3) built Demographics end-to-end as
the pilot program — 50 indicators, one combined config (`sheet_map` + `extra_sheets`, see
ADR-019), config-validated, confirmed live in the browser Upload page — introducing the
dashboard's first `formula_type="ratio"` indicators; found along the way that
`upload_catalog.py`'s own hardcoded `PROGRAMS` list (separate from `constants.js`) also needed
an entry, which the original plan had missed; dry-run testing against the real file is blocked
since it only exists on the HOME machine; (4) Joseph confirmed domain + server SSH access are in
hand, leaving port confirmation as the sole go-live blocker, with a ~2-week live target — updated
`deployment-checklist.md`/`ROADMAP.md` accordingly. All Session 5 code/config changes are
uncommitted at shutdown. Also corrected two stale auto-memory files (wrong region name, an
outdated "full autonomy" preference note that now contradicts the locked working agreement).

## 2026-07-05 session 4 (HOME machine) — Remaining 6 file-groups analyzed; 18/18 done
Finished what Session 3 started. Analyzed NCD (5 files), Post Partum (3), Intra Partum (2),
Family Planning (1), Morbidity (1), Geriatric (2) — 14 files, biggest-first per Joseph's
instruction, checking his usage % before each launch (stayed low/moderate all session, no
rate-limit failures this time — contrast with Session 3's parallel-launch failure). All Maternal
Care sub-groups (Prenatal, Post Partum, Intra Partum) are now complete. Confirmed several serious
new bugs (full detail in each `template_analysis/*.md` file, cross-referenced in
`project_state.md`'s Session 4 log): a wrong-region `#ERROR!` block and a cumulative-vs-flow
mismatch in NCD's `ncd_meds_nir.xlsx`; a cross-age-bracket formula shift in Post Partum's
`post_4pnc_nir.xlsx`; a self-referential/circular denominator in Intra Partum's `intra_bw_nir.xlsx`;
a quarters-stacked-in-one-tab layout plus a wrong-quarter Annual reference and a structurally-dead
KPI in Family Planning's `fp_nir.xlsx`; a disease-as-row matrix (not location-as-row) plus a
hardcoded-wrong-region column and a non-functional Rate column in `NIR_Morbidity.xlsx`; and a
live, real-data demonstration of the recurring off-by-one DQC-anchor bug in Geriatric's
`ncd_geriatric_nir.xlsx`. Also identified two new open sensitive-indicator questions (NCD Mental
Health, Morbidity's HIV/syphilis case rows) beyond the already-open Leprosy one. **Not done this
session, by Joseph's explicit choice:** the consolidated summary merge — saved for next session.
No DB/code changes — analysis + docs sync only.

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
1. If on the HOME machine: finish Demographics — dry-run parse `demographics_annual` against
   the real `Demographics_nir.xlsx` and spot-check at least 3 cell values, per
   `.claude/skills/add-template`'s definition of done. Then decide with Joseph whether to
   commit the Session 5 changes.
2. Ask Joseph: has IT confirmed ports 80/443 yet? If domain name + server IP haven't been
   shared in chat yet, ask for them — server prep can start without waiting on ports.
3. Once Demographics is fully signed off: start HIV-Syphilis-HepaB (next in the build-priority
   order, `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` §5) using the
   `add-template` skill.
4. Parked, needing Joseph when ready: stash@{0} fate (HOME machine), small-cell suppression
   cutoff, data-dictionary draft greenlight, and the sensitive-indicator ladder in the
   consolidated summary §3 (Tier 2: Syphilis-treated, Hepatitis B reactive; Tier 3: Leprosy,
   NCD Mental Health — plus whether one `is_sensitive` bit is enough or two tiers are needed).

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
- **Registering a new template needs TWO places, not one** (learned building Demographics,
  2026-07-06): `frontend/src/services/constants.js` `TEMPLATES` feeds Indicator Reports, but the
  **Upload page's** Program/Sub-Program dropdown reads from a separate hardcoded `PROGRAMS` list
  in `backend/app/services/upload_catalog.py` (which then globs `configs/*.json` itself — no
  restart needed, hot-reloads). `adding_templates.md`'s old "one frontend entry, nothing else
  changes" claim is stale for the Upload page specifically — check both when adding a program
  that doesn't already have a CHILD_CARE-style sub-program entry.
