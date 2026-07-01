# session-handoff.md

## Last Updated
2026-07-01 (engineering-practices uplift finished; pivoted to building the other 10 programs;
data-intake folders scaffolded and pushed)

## Current Objective
**Build out the 10 non-Child-Care programs.** Joseph has the FHSIS Excel files for all programs
and will drop them into `backend/data/<PROGRAM_CODE>/` (folders already created). Then, **one
program at a time, end-to-end**, Claude analyzes each file (column-by-column, into
`fhsis_template_analysis.md`) → seeds indicators → writes JSON parser config(s) → validates →
dry-runs → hands to Joseph to upload/test. Recipe: `adding_templates.md`. Cadence:
**propose → Joseph reviews → approves → build.** One program fully before the next.

## Done This Session (2026-07-01)
- **Engineering-practices uplift finished** (all owner-approved steps that don't need his
  decision): E+G thresholds→config + first tests, I CI gate (pytest+ruff+eslint), F pin Python
  deps, backend+frontend lint cleanup. ADR-012 → ADR-016.
- **Fixed a real bug:** Home scorecard compared ratio values vs percent-scale thresholds →
  always "Below Target", showed "0.77%" not "77%". Fixed + regression-tested.
- **Scaffolded 10 data-intake folders** under `backend/data/` (one per program code) with
  `_PUT_FILES_HERE.txt` notes. Raw `.xlsx` gitignored; folder markers tracked.
- **Pushed tip `8e09a4e`** (4 feature/docs commits + this shutdown commit). CI's first real run
  is on GitHub now — verify the Actions tab is green.

## Next Session — first moves
1. `run startup protocols` (loads memory, checks git, brings up stack).
2. `ls backend/data/*/` — which program folders have `.xlsx` files?
3. Start the first ready program: list files, read its `_PUT_FILES_HERE.txt`, confirm with
   Joseph, then begin analysis. **One program at a time — do not batch all 10.**
4. If no files dropped yet, Joseph adds them first.

## Notes / Gotchas
- **Only CHILD_CARE has indicators (247).** The other 10 programs = 0 indicators; that's the
  whole point of this next phase. Their Overview cards show "no data" until seeded.
- **pytest/ruff aren't in the dev image** — install per-container:
  `docker compose exec backend pip install -r requirements-dev.txt`, then
  `docker compose exec backend python -m pytest backend/tests/ -q`.
- **Known template errors** to flag, not silently ingest: morta_mmr, envi_sanitation,
  nata_lb_abr, pre_gd_screening, Vitamin A, schisto (see `activeContext.md` / `progress.md`).
- **Changelog discipline:** every change lands a line under `[Unreleased]` in `CHANGELOG.md`; on
  release bump `frontend/package.json` to match. 1.0.0 = first ICTU deploy.
- **PowerShell here-strings break for git messages** — use `git commit -F <file>` (write the
  message to the scratchpad) instead. (Bash-tool heredocs are fine.)
- DBs are NOT git-synced. New machine: copy `.env`, run `bootstrap_db.py`, then upload data.

## First Command Next Session
```
run startup protocols
```
