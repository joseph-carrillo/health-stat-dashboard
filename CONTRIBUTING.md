# Contributing

Internal project. Conventions for keeping the codebase consistent across Joseph's two machines.

## Workflow

**Always: Plan → Review → Build.** Agree the approach before writing code.

1. Branch off `main` (`git switch -c feat/...` or `chore/...`). Don't commit straight to `main`.
2. Make the change; keep it focused.
3. Verify locally (see below).
4. Commit with a conventional message; push; open a PR if collaborating.

## Commit messages

```
<type>: <short description>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.
Example: `feat: add SBI annual template config`.

Shutdown commits (docs + memory sync only) use:
`docs(shutdown): sync docs and memory — <date>`.

## Code conventions

- **Many small files**: 200–400 lines typical, **800 max**. Split anything larger.
- **Backend**: organize by domain under `backend/app/` (`core/`, `services/`). Validate input
  at boundaries; handle errors explicitly; never log secrets or PHI/PII.
- **Frontend**: one file per page; inline JS style objects per file (project convention).
  Naming: `camelCase` (vars/functions), `PascalCase` (components/types),
  `UPPER_SNAKE_CASE` (constants), `use*` (hooks).
- **Secrets**: env vars only (`.env`); never hardcode. Update `.env.example` when adding one.
- **Database**: percentages stored as ratios, shown as percent. Respect the narrow/tall grain
  and the `(indicator, location, period)` uniqueness.

## Adding a new Excel template

No parser code changes — it's config-driven:

1. Add a JSON config in `backend/app/services/configs/` mapping Excel columns → indicator codes
   (model it on `cpab_bcg_hepa.json`).
2. Seed any new indicators (`backend/app/core/seed_indicators*.py` / `.sql`).
3. Register it in the upload catalog / `frontend/src/config/uploadPrograms.js` as needed.
4. Test with **Validate Only** before staging.

Full recipe: `memory-bank/adding_templates.md`.

## Verifying a change

```bash
docker compose up -d --build
docker compose ps                                   # db healthy, backend + frontend up
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/docs   # expect 200
# log in at http://localhost:5173 with admin / Admin@2026! and exercise the changed flow
```

## Session discipline

- Start a session with `startup protocols`; end with `run shutdown protocols`
  (see [CLAUDE.md](CLAUDE.md)).
- Record any locked decision change as a new ADR in [DECISIONS_LOG.md](DECISIONS_LOG.md)
  (append-only). Keep [ROADMAP.md](ROADMAP.md) and `memory-bank/project_state.md` current.

## Not yet in place (don't be surprised)

No automated test suite, linter config, or CI yet — these are on the [ROADMAP.md](ROADMAP.md).
Until then, verify manually as above.
