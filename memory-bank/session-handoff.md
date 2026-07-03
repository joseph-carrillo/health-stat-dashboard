# session-handoff.md

## Last Updated
2026-07-03 (office — git sync only, no product work; see below)

## Current Objective
**Build out the 10 non-Child-Care programs.** Joseph has the FHSIS Excel files for all programs
and will drop them into `backend/data/<PROGRAM_CODE>/` (folders already created, still empty as
of 2026-07-03). Then, **one program at a time, end-to-end**, Claude analyzes each file
(column-by-column, into `fhsis_template_analysis.md`) → seeds indicators → writes JSON parser
config(s) → validates → dry-runs → hands to Joseph to upload/test. Recipe: `adding_templates.md`.
Cadence: **propose → Joseph reviews → approves → build.** One program fully before the next.

## Done This Session (2026-07-03, office) — git sync only
- Startup found office 7 commits behind `origin/main` **plus** uncommitted local WIP (an
  "Overview Card" admin-management feature — DB migration, new analytics/API endpoints, a
  Management admin tab, a new Overview data-quality panel — never logged in memory-bank, from
  before the last shutdown). Stashed it, fast-forwarded to `origin/main` (`19d6871`), popped the
  stash, resolved one merge conflict in `Overview.jsx` (kept both the upstream ESLint fix and the
  WIP's new `dqIssues` state).
- Walked Joseph through a full diff of the WIP vs. the repo. Per his call ("sync both and follow
  the repo, start working from there"), **re-stashed** the WIP (`stash@{0}`) so the working tree
  now matches `origin/main` exactly. **No code committed or pushed this session** — tip is still
  `19d6871`.
- Full stack verified healthy throughout (db/backend/frontend all up, `:8000/docs` and `:5173`
  both responding).

## Next Session — first moves
1. `run startup protocols` (loads memory, checks git, brings up stack).
2. **Decide the stashed Overview Card feature's fate first** (office machine only — see Gotchas
   below): `git stash list` / `git stash show -p stash@{0}` to review, then finish+test+commit or
   drop it. Don't let it go stale a second time.
3. `ls backend/data/*/` — which program folders have `.xlsx` files?
4. Start the first ready program: list files, read its `_PUT_FILES_HERE.txt`, confirm with
   Joseph, then begin analysis. **One program at a time — do not batch all 10.**
5. If no files dropped yet, Joseph adds them first.

## Notes / Gotchas
- **⚠️ `stash@{0}` on the office machine holds the uncommitted Overview Card feature.** Git
  stashes are local-only — this will **not** show up on the laptop. If the next session is on the
  laptop, this item is invisible there; check `project_state.md` → Git for full contents before
  assuming it's gone. There's also a second, older `stash@{1}` ("indicator-reports-area-filter")
  of unknown origin — ask Joseph before touching it.
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
