# activeContext.md

## Current Session Goal (next session)
Four tracks, in whichever order inputs arrive:
1. **Go-live Step 3** — domain purchased + IT has handed over server IP/SSH as of 2026-07-06;
   only ports 80/443 confirmation is still pending. **Joseph is targeting live within ~2 weeks.**
   Start server prep (`RUNBOOK.md → Production — server deployment → One-time server prep`)
   as soon as the domain name + server IP are shared in chat — this doesn't need to wait on
   ports. Then: DNS A record, deploy, smoke test, rotate admin password, tag `v1.0.0`.
2. **Finish HIV-Syphilis-HepaB (Infectious Disease), started Session 7.** 38 indicators + 3
   configs (`infec_hiv`/`infec_hepatitisb`/`infec_syphilis`) are built, committed (`87950a4`),
   and seeded live in the office machine's DB — but `/api/validate-config` and dry-run parse
   against the real `infec_*_nir.xlsx` files are still pending. **First step: locate the real
   files** — not confirmed on either machine yet (office `backend/data/INFECTIOUS_DISEASE/` only
   has the placeholder `.txt`; unlike Demographics this was never confirmed HOME-only, just
   unconfirmed — check there first).
3. **Finish Demographics.** Indicators + config are built, committed (`b07ac1f`), and
   config-validated (Session 5), but dry-run testing against the real `Demographics_nir.xlsx` is
   blocked on this being the HOME machine — this machine.
4. **ESR Verification Form (Session 6, done) — Google Sheets setup is the only thing left.**
   Joseph explicitly parked it: create the Google Cloud service account + Sheet, share the
   Sheet with the service account's email, drop the key at
   `./secrets/google-service-account.json`, set `ESR_SHEET_ID` in `.env` — steps in
   `RUNBOOK.md`. Not a blocker, just needs Joseph to do it whenever. The auth-gated variant of
   the PHRIC cluster pages and the Google OAuth + granular-permissions overhaul are both future,
   not yet scoped.

Once both HIV-Syphilis-HepaB and Demographics are signed off, move to the remaining
`INFECTIOUS_DISEASE` sub-groups (Schistosomiasis, Filariasis, Rabies, STH, Leprosy — all
analyzed, none built) or the next program per
`memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md`'s build order.

## 2026-07-10 session 8 (HOME machine, hostname `_hansell_`) — PHRIC public site built
Joseph pivoted the PHRIC site from "parked, future initiative" to "build the skeleton now" — he
wants public-facing pages live and linkable to internal clients before higher-up approval for
full public access, even though only the Health Statistics dashboard has real data today. He'd
independently found a design handoff bundle sitting untracked in the repo
(`design_handoff_phric_site/` on Desktop) which turned out to be the same 12 files as
`PHRIC site.zip` already in his Downloads folder (verified byte-identical) — moved the redundant
repo copy out rather than deleting it. Locked 4 architecture decisions via direct questions
before building (ADR-022): same React app, not a separate frontend; landing page becomes the
site root (`/`), existing `Login` moves to `/login`; the 4 cluster pages ship public-state only
(the design's logged-in variant is real future work); Epi Surveillance's "+ Submit ESR Report"
button links to the existing `/esr/new` form. Built the landing page + all 4 cluster pages
(Health Statistics, Epidemiology Surveillance, Research, Laboratory) pixel-close to the handoff,
using one shared scaffold component (`ClusterPage.jsx`/`PublicChrome.jsx`) driven by per-page
config objects rather than 4 duplicated layouts. Every simulated "Sign in with Google" trigger
became a "Staff Sign In" pill routing to `/login` — the real JWT login is unchanged, just moved
off the site root. `App.jsx`, `services/api.js`, and `Navbar.jsx` all updated so every redirect
that used to point at `/` now points at `/login`, and the catch-all points at `/` instead of
`/home`. ESLint clean, production build compiles, all new routes verified 200 on the dev server;
the Chrome extension wasn't connected so the actual visual click-through was done by Joseph in
his own browser, who confirmed it looks right. Per the halt-and-ask rule, asked Joseph how to
handle the pending code — **he chose to commit it together with this docs/memory sync**;
committed and pushed, see `session-handoff.md` for the verified hash.

## 2026-07-09 session 7 (OFFICE machine) — Infectious Disease (HIV/HepB/Syphilis) build started
Started the next program per the build-priority order: the HIV-Syphilis-HepaB antenatal-
screening sub-group of `INFECTIOUS_DISEASE` (recommended first — smallest clean group, exercises
sensitive-data RBAC end-to-end). Seeded 38 indicators (`HIV_*`/`HEPB_*`/`SYPH_*`, quarterly,
age-band disaggregated 10-14/15-19/20-49; Syphilis alone has an extra Treated group), wrote 3
template configs (`infec_hiv.json`, `infec_hepatitisb.json`, `infec_syphilis.json`), and
registered the program in both `upload_catalog.py` and `constants.js` — got the "two places"
gotcha right this time without re-discovering it. Expanded the sensitive-indicator policy
(ADR-021): CLAUDE.md's list now also covers Syphilis-treated, Hepatitis B reactive, Morbidity's
future HIV/syphilis rows, Leprosy, and NCD Mental Health — promoting the consolidated summary's
Tier 2/3 candidates to locked policy. Confirmed indicators seeded live in this machine's DB
(38 rows under `INFECTIOUS_DISEASE`). Joseph asked to commit + push the code immediately
(`87950a4`), then run full shutdown protocols. **Not done: `/api/validate-config` and dry-run
parse against the real `infec_*_nir.xlsx` files** — not confirmed to exist on either machine yet,
genuinely blocked (see "First moves next session" below).

## 2026-07-07 session 6 (OFFICE machine) — ESR Verification Form built, Google Sheets parked
Joseph shared two new design handoffs — a big future PHRIC public site bundle, and a dedicated,
more precise handoff for just the ESR Verification Form (Epidemiology Bureau's event-based
surveillance paper form). Scoped down to just the ESR form this session, prompted by an
immediate ask: Epi wants a form that auto-populates a Google Sheets line list they already work
from. Locked scoping decisions before building (full detail: `project_state.md` Session 6 log,
ADR-020): custom form → our backend → Sheets push (not a bare Google Form); full form, not a
subset; ship on the *existing* JWT/role system (new `can_submit_esr` permission) — Joseph's
mid-scoping ask for real Google OAuth login + granular per-user permissions was deliberately
**deferred to its own future initiative**, not bundled in; `gspread`/`google-auth` approved as
new deps; submit-only v1, no listing view. Built end-to-end and verified live in the browser,
not just unit-tested: `esr_reports` JSONB table, `POST /api/esr-reports` (codebase's first
Pydantic model), Sheets push that never blocks submission on failure, 8 new frontend files
recreating the handoff pixel-close. Found and fixed a real `bootstrap_db.py` bug along the way
(`split_statements()` breaks on semicolons inside SQL comments, not just outside them — see
"Watch out for" below). After Joseph reviewed it live, did 4 rounds of UI polish (Yes/No
centering, a status dropdown instead of radio buttons, a font-fallback bug, native date/time
pickers), each re-verified in the browser. Google Sheets credentials explicitly parked — "let's
park the google sheet for now" — documented as a self-serve RUNBOOK.md pickup. Committed and
pushed per Joseph's explicit "commit everything" instruction.

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
`deployment-checklist.md`/`ROADMAP.md` accordingly. Asked Joseph how to handle the pending
Demographics code at shutdown; he chose to commit it together with docs/memory rather than hold
it back — pushed as `b07ac1f`. Also corrected two stale auto-memory files (wrong region name, an
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
1. **Locate the real `infec_hiv_nir.xlsx`/`infec_hepatitisb_nir.xlsx`/`infec_syphilis_nir.xlsx`
   files** — check `backend/data/INFECTIOUS_DISEASE/` on whichever machine this is. Office
   machine only has the placeholder `.txt` as of Session 7. If found, run `/api/validate-config`
   then dry-run parse + spot-check ≥3 cell values per `.claude/skills/add-template`'s definition
   of done, to sign off the HIV-Syphilis-HepaB sub-group.
2. If on the HOME machine: also finish Demographics — dry-run parse `demographics_annual` against
   the real `Demographics_nir.xlsx` and spot-check at least 3 cell values.
3. Ask Joseph: has IT confirmed ports 80/443 yet? If domain name + server IP haven't been
   shared in chat yet, ask for them — server prep can start without waiting on ports.
4. Ask Joseph: ready to do the Google Sheets one-time setup for ESR reports yet (RUNBOOK.md)?
   Not urgent — submissions work fine without it, just don't sync to a Sheet yet.
5. Once HIV-Syphilis-HepaB and Demographics are both fully signed off: move to the remaining
   `INFECTIOUS_DISEASE` sub-groups (Schistosomiasis, Filariasis, Rabies, STH, Leprosy) or the
   next program per `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` §5.
6. Parked, needing Joseph when ready: stash@{0} fate (HOME machine), small-cell suppression
   cutoff, data-dictionary draft greenlight, whether one `is_sensitive` bit is granular enough
   or a tiered RBAC scheme is needed (open question left by ADR-021), the Google OAuth +
   granular-permissions overhaul, and the auth-gated variant of the PHRIC cluster pages.

## Watch out for
- **This machine's hostname is `RESUDesktop2` = the OFFICE desktop** (confirmed 2026-07-09,
  Session 7 — Joseph confirmed directly since neither `secrets/` nor a git stash was present to
  infer it from). `hostname` (or `PowerShell`'s `$env:COMPUTERNAME`) is a fast, reliable way to
  self-identify the machine at startup instead of asking Joseph every time — if it's not
  `RESUDesktop2`, it's the HOME/laptop machine.
- **The HOME/laptop machine's hostname is `_hansell_`** (confirmed 2026-07-10, Session 8 — both
  `stash@{0}` and `stash@{1}` were present, matching the already-documented "both stashes live on
  the HOME machine" fact). So: `RESUDesktop2` = office, `_hansell_` = HOME/laptop — `hostname`
  alone now fully self-identifies either machine, no more guessing needed.
- **A design handoff folder can land untracked in the repo root without being new work** —
  Session 8 found `design_handoff_phric_site/` sitting untracked on this machine's Desktop; it
  turned out to be identical to a zip Joseph already had in Downloads. Worth a byte-size/zip-
  listing check before assuming an untracked folder is either abandoned work or something to
  delete outright — moving it out of the repo (not deleting) was the safe middle ground here.
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
- **`bootstrap_db.py`'s `split_statements()` breaks on semicolons inside `--` comments, not
  just real SQL statement terminators** (found 2026-07-07 building `esr_reports.slq`): it splits
  the whole file on every literal `;` *before* filtering comment lines, so a semicolon in
  comment prose ("submitted report; the whole form...") silently truncates the next real
  statement and leaks stray comment text into it — and the script's blanket try/except reports
  this as "skipped (already present)", not a failure. No fix to the splitter itself; just avoid
  semicolons in `.slq`/`.sql` comment prose. If a new schema file's table seems to silently not
  get created despite `bootstrap_db.py` reporting no errors, check this first via manual `psql`
  apply before assuming the DB is fine.
- **The ESR form page (`/esr/new`) deliberately does NOT use the app's Navbar/sidebar chrome** —
  it recreates the dedicated design handoff's own header/layout (dark header, Poppins/Mulish,
  green `#15764a`), a different visual system by design. Don't "fix" this to match the rest of
  the dashboard without checking with Joseph first — the PHRIC site tracks are intentionally a
  separate look from today's internal dashboard.
- **This environment's Python fork uses `httpx2`, not `httpx`**, for `starlette.testclient`
  (FastAPI's `TestClient`) — pinned `httpx2==2.5.0` in `requirements-dev.txt`. If a future
  endpoint test import-errors on `TestClient` needing "httpx2", this is why — it's already a
  known dependency, just re-`pip install -r requirements-dev.txt` in the container.
