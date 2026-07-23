# activeContext.md

## Current Session Goal (next session)
**Two decision queues are waiting on Joseph — build capacity is not the constraint.**

**NEW after Session 13 — the 4 security decisions in ADR-025.** A hardening pass fixed everything
that didn't need his judgement (audit-log logging, register credentials out of the URL, DB
connection release at 39 sites, `eval()` → AST evaluator). What's left needs him:
**(a)** `approve_batch(force=True)` — unreviewed conflicts currently overwrite production on
approve, so the ADR-004 review gate is optional in practice (data-integrity policy);
**(b)** JWT localStorage → httpOnly cookie before public go-live; **(c)** connection pooling
(deploy sizing); **(d)** program-scoping the staging read endpoints. Plus a free one-liner:
`main.py`'s API version says `0.1.0`, should be `0.9.0`. And two housekeeping questions — the
untracked 2026-07-18 audit transcript in the repo root, and three unexplained SBI-looking `.xlsx`
files loose in `backend/data/`.

**Still true from Session 12 — all config-only programs are DONE.** 8 of 11 program areas have every
currently-buildable template built + validated + dry-run-verified. **Everything remaining is a
one-way-door schema/parser decision or a DOH/encoder action — do NOT start these without Joseph's
direction.** Standing rules still hold: Opus 4.8 orchestrator / Sonnet 5 sub-agents; conserve
tokens; commit+push per green unit; ping after each finished program.

**First moves next session:**
1. **Get two one-liners from Joseph:** ratify/reverse **ADR-023** (rates stored already-multiplied)
   and **ADR-024** (D4 reconciliation DQC). Everything built rides on them.
2. **Recommended next target: D6 (row-stacked parsing)** — one `row_filter` mechanism unblocks
   THREE programs (NCD Eye Health = age-as-rows, Oral Health = quarters+age, Family Planning =
   quarters). **Design the mechanism and run it past Joseph BEFORE wiring configs.**
3. Then, each with a decision/answer: **D5 → NCD Meds**; **Morbidity** (D7/D10, last); **STH
   cascade** (encoder denominator answer); **Schisto / WASH Sanitation** (DOH fixes).
Full per-item plan: `session-handoff.md` "Next Session"; open-work priority: `project_state.md`.

**Also open (not build-order):** UI golden-path check of Sessions 9–12 then real uploads; go-live
Step 3 (ports 80/443 pending with IT); ESR Google Sheets setup (parked).

## 2026-07-23 session 13 (HOME `_hansell_`) — security hardening; orphaned-audit close-out
Joseph: "work on unfinished/open items that don't require my attention or approval," then left
(model was Fable 5; he returned mid-session, switched back to Opus 4.8, and asked whether I'd been
cut off — I had, mid-unit-4, so it was finished before shutdown). Startup found an **orphaned
2026-07-18 session** that had run a full adversarial audit, applied one uncommitted `audit.py` fix,
and died before verifying or logging anything. Closed it out: 4 verified commits — audit-log
failures now logged not swallowed (`da35b4a`); register credentials moved out of the query string
into a validated body + 5/min rate limit, since plaintext passwords were landing in access logs
(`0780a8c`); DB connections released via try/finally at all **39** acquisition sites, which
previously leaked on any query error with no pool behind them (`d6491d0`); and `eval()` replaced
with a whitelisted AST evaluator in `compute_value()`, proved equivalent across **3,390
evaluations over all 565 config formulas** (`3fb9b24`). 56 → 77 tests, ruff + eslint clean, all
dry-run, nothing written to the DB. Four decisions deliberately left for Joseph (ADR-025) — see
"Current Session Goal" above. Also a docs-truth pass: CLAUDE.md's indicator count and Known Gaps
were badly stale, ROADMAP got item J plus the open decisions.

## 2026-07-12 session 12 (HOME `_hansell_`) — 5 config-only programs + D4, then paused
Joseph: "continue building the programs, do this alone, ping me after each program is done." Built
Natality (`37c517c`), Leprosy (`8418cc4`, 100 ind all-sensitive, 3 source bugs fixed), Filariasis
(`3f47e1c`, MDA excluded), Rabies (`4ac8193`, 5 split configs, real data), STH deworming
(`1200aa5`); implemented the **D4 reconciliation DQC rule type** (`98ecc04`, ADR-024, 8 tests, fires
on real Rabies data matching the template's own "Check Data" cells); closed Mortality's last
render-check + Demographics' dry-run. All dry-run, spot-checked vs Excel, 56 tests green. Then paused
because everything left needs a Joseph schema/parser decision (D5/D6/D7) or a DOH/encoder action —
gave him a full done/not-done program inventory. Ran on Opus 4.8, no sub-agents.

## 2026-07-11 session 11 (HOME `_hansell_`, third session this day) — CI fix only, no build work
Joseph reported CI failing and asked why the image release was skipped. Fixed a pytest
collection crash (`test_annotation_rows.py` used `from backend.app...` instead of the repo's
`from app...` style, aborting collection for all 48 tests) plus a masked second bug it had been
hiding: `requirements-dev.txt` pinned `httpx2==2.5.0` (typo; a real but unrelated PyPI package)
instead of `httpx==0.28.1`, which `starlette.testclient`/FastAPI's `TestClient` actually needs.
48/48 tests pass and ruff is clean locally. Committed + pushed as `10b6a7a`. Also corrected this
file's and `session-handoff.md`'s prior (wrong) claim that `httpx2` was expected. Explained the
tag-only `release-images` CI gate (not a bug). Spun up the local stack and gave Joseph the
already-documented test admin login. Build-out resumes exactly at the Session-10 cut-off point.

## 2026-07-11 session 10 (HOME `_hansell_`, same day as session 9) — D1/D2 + Mortality; cut off
Joseph said "continue working on the programs… I want all programs ready for inspection once I
get back", left, then stopped the build ~30 min later over token burn. Shipped before the stop
(committed together with this shutdown, his explicit choice via the pending-code question):
the D1/D2 rate/ratio display uplift (ADR-023, PROPOSED — rates stored already-multiplied,
`display_unit()`, trend-API display-scale fix for a real pre-existing "0.04%" bug, status bands
percentage-only, `_RATE` never summed across slices, `test_rate_display.py`) and the full
**Vital Stats Mortality** program (38 `MORTA_*` indicators seeded on this machine, `morta_mmr` +
`morta_imr` split configs, both validated, Q1 dry-runs 0 errors, 12 spot-checked cells match
Excel exactly, 48 tests green, both catalogs registered). NOT done: the template-report render
check (exact resume point), live browser check, and every program after Mortality. Full detail:
`project_state.md` Session 10.

**Blocked on DOH (not Joseph):** WASH sanitation (Q3/Q4 stray col), Natality Q2 col, NCD Meds Dec
block, Schistosomiasis/STH clarifications; and DATA ENTRY for Demographics facility/workforce +
Geriatric SC Immunization (both files shipped nearly/entirely empty).

## 2026-07-11 session 9 (HOME machine `_hansell_`) — program build-out blitz
Joseph: "continue with the rest of the programs and have it checked once I get back," then at the
end: "run shutdown protocols, update foundation docs + handoff so I can inspect and decide next
session." Built every unblocked program/file in one pass (8 feature commits + this docs sync),
each validated + dry-run parsed against its real `.xlsx` + spot-checked against the sheets' own
computed cells — **dry-run only, nothing in the live DB**. Shipped: HIV/HepB/Syphilis sign-off
(+ a real parser bug fix, `is_annotation_row`, for sheet footer text mis-read as location errors),
WASH water, Geriatric screening, **all of Maternal Care (13 files → 17 configs, incl. same-bracket
recomputes for the 8ANC/4PNC shift bugs)**, NCD Mental Health (sensitive) + Cancer + Risk Factors.
~24 configs, ~520 indicators, ~800 cell values hand-verified, zero mismatches. Everything left is
blocked on a Joseph D-decision or a DOH action (see "Current Session Goal" above). Full commit
list + blocker breakdown in `project_state.md` Session 9. Did NOT do: live browser UI check
(Chrome extension not connected), real uploads (held for Joseph's review).

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
1. **Walk Joseph through the DECISIONS list** (`ROADMAP.md` → "DECISIONS FOR JOSEPH TO INSPECT
   & DECIDE"). Lead with **D1/D2** — it unblocks the most (Vital Stats, Leprosy, Filariasis,
   Demographics display). Get a decision, then build the newly-unblocked programs the same way
   Session 9 did (seed → config → validate → dry-run → verify vs sheet cells).
2. **Offer the UI golden-path check of Session 9's work** — it's all dry-run, nothing in the
   live DB. If he's happy after reviewing Upload → Coverage/Rankings/Indicator Reports, run the
   REAL uploads (dry_run off) for the new programs. Connect the Chrome extension for a live
   click-through if he wants screenshots.
3. Ask: has IT confirmed ports 80/443? If domain name + server IP aren't in chat yet, ask —
   server prep can start without waiting on ports.
4. Ask: ready for the ESR Google Sheets one-time setup (RUNBOOK.md)? Not urgent.
5. Parked, needing Joseph when ready: `stash@{0}` fate (HOME machine), small-cell suppression
   cutoff, data-dictionary greenlight, one-`is_sensitive`-bit vs tiered RBAC (ADR-021), Google
   OAuth + granular permissions, the auth-gated PHRIC cluster-page variant.

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
- **`requirements-dev.txt` was pinned to `httpx2==2.5.0` (typo) instead of `httpx==0.28.1`.**
  `httpx2` is a real, separate PyPI package (own top-level `httpx2` module) so `pip install`
  succeeded while leaving `starlette.testclient`'s `import httpx` broken — CI never surfaced it
  because `test_annotation_rows.py`'s bad `from backend.app...` import crashed collection first.
  Both fixed 2026-07-11. See `session-handoff.md` for detail.
