# activeContext.md

## Current Session Goal (next session)
**Build out the other 10 programs** (everything except CHILD_CARE, which is done). Joseph drops
real FHSIS Excel files into `backend/data/<PROGRAM_CODE>/`; Claude then, **one program at a time,
end-to-end**, analyzes → seeds indicators → writes parser configs → validates → dry-runs → hands
to Joseph to upload and test. Recipe: `memory-bank/adding_templates.md`.

## How the owner wants to work (read this)
Joseph is a **data analyst, not a coder**. Write code he can read; explain every non-obvious
command/pattern in plain language ("smart 10-year-old"). Be a **cold auditor, not a yes-man** —
if a request is wrong/risky, say so and propose an alternative. Strict cadence:
**propose → he reviews → he approves → you build.** One reversible change at a time, verified
before the next. Never dump many files at once. Flag any new dependency and ask first.
See `working-agreement.md` (burnout → "manage, don't grind").

## First moves next session (after `startup protocols`)
1. `ls backend/data/*/` — see which program folders now have `.xlsx` files.
2. For the first program with files: list what's there, read the `_PUT_FILES_HERE.txt` notes,
   confirm the read with Joseph, then start the column-by-column analysis (into
   `fhsis_template_analysis.md`, same depth as Child Care).
3. **Do NOT process all 10 programs at once.** One program fully (analyze → seed → config →
   dry-run → Joseph tests → sign-off) before the next. Order = whichever's ready first.
4. If no files are in the folders yet, tell Joseph he needs to drop them in first.

## Watch out for
- **Known template errors** flagged by the team (in `progress.md`): `morta_mmr_imr_nir.xlsx`
  (col 33 label), `envi_sanitation_zod_nir.xlsx` (Q3/Q4 structure), `nata_lb_abr_rabr_nir.xlsx`
  (missing ABR<10 col in Q2), `pre_gd_screening` (col Z formula), Vitamin A (col 11 formula),
  schisto files. When these come up, FLAG them — don't silently ingest bad data (same discipline
  as Child Care, where mislabeled columns and wrong formulas were real, repeated findings).
- **New denominator types.** Child Care alone had 5 (projected pop, facility-seen, live-births,
  condition-count, school-enrollment). Expect the new programs to introduce more — the parser
  config maps each indicator to its denominator; no parser code change needed.
- **Frequency varies** (monthly vs quarterly-only vs annual-only). The parser + analytics are
  already frequency-agnostic.

## What Was Completed (2026-07-01)
Engineering-practices uplift finished (steps E+G, I, F-pin-deps, lint cleanup) + fixed a real
Home-scorecard bug + scaffolded the 10 data-intake folders. Full detail in `project_state.md`
"Engineering-practices uplift — DONE this session". Pushed tip `8e09a4e`.

## Decisions waiting on Joseph (uplift leftovers, not blocking the program build)
- **Small-cell suppression cut-off** — what count is too small to display for sensitive
  indicators (common: <5 or <10). Domain call, only he can set it.
- **Data dictionary** — Claude can draft numerator/denominator/target from configs; Joseph
  reviews/locks the definitions.

## API and Frontend Ports
- API: http://localhost:8000/docs  ·  Frontend: http://localhost:5173

## Auth Credentials (Development)
- Admin: admin / Admin@2026!  ·  Test: jsmith / Test@2026! (program_manager, CHILD_CARE)

## Local Database
- localhost:5432 · doh_nir_dashboard · doh_admin / doh_password_2026
