# File Structure

Directory layout and the rationale for each part.

```
health-stat-dashboard/
│
├── Foundation docs (repo root)
│   ├── README.md              ← start here
│   ├── CLAUDE.md              ← Claude Code guidance + session protocols
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── DECISIONS_LOG.md       ← ADRs (append-only)
│   ├── SECURITY.md
│   ├── RUNBOOK.md
│   ├── ROADMAP.md
│   ├── GLOSSARY.md
│   ├── FILE_STRUCTURE.md      ← this file
│   └── CONTRIBUTING.md
│
├── Container & config
│   ├── docker-compose.yml         ← dev stack: db + backend + frontend
│   ├── docker-compose.prod.yml    ← prod stack: gunicorn + nginx
│   ├── backend/Dockerfile         ← multi-stage (development / production)
│   ├── frontend/Dockerfile        ← multi-stage (development / build / production)
│   ├── frontend/nginx.conf        ← prod SPA serving + /api proxy
│   ├── .env.example               ← committed template (.env is gitignored)
│   ├── .dockerignore / frontend/.dockerignore
│   ├── requirements.txt           ← backend Python deps
│   └── .gitignore
│
├── memory/ → memory-bank/     ← session memory (load MEMORY.md first)
│   ├── MEMORY.md              ← index
│   ├── project_state.md       ← cold-start snapshot
│   ├── activeContext.md       ← current goal
│   ├── progress.md            ← session log
│   ├── session-handoff.md     ← shortest summary
│   ├── CLAUDE.md              ← builder profile + non-negotiables
│   ├── architecture.md
│   ├── adding_templates.md    ← recipe for a new Excel template
│   └── fhsis_template_analysis.md
│
├── docs/                      ← operational notes
│   ├── SESSION-PROTOCOLS.md
│   ├── BUSY-DAY-5MIN.md
│   ├── TRACK1-API-MAP.md
│   └── TRACK1-WEEK-PLAN.md
│
├── scripts/                   ← PowerShell convenience wrappers
│   ├── start.ps1 / stop.ps1 / health-check.ps1
│   └── sync.ps1
│
├── frontend/                  ← React 19 + Vite + Tailwind
│   └── src/
│       ├── App.jsx                  ← router (public / protected / admin)
│       ├── main.jsx
│       ├── services/                ← api.js (axios), auth.js, constants.js
│       ├── pages/                   ← one file per page
│       │   └── analytics/           ← Overview, Coverage, Rankings, Trends, IndicatorReport(s)
│       ├── components/              ← NavBar, charts, management/ tabs
│       ├── config/                  ← display templates
│       └── utils/
│
└── backend/                   ← FastAPI
    ├── main.py                ← all routes, app setup, CORS  (TODO: split, >800 lines)
    ├── bootstrap_db.py        ← one-command schema + seed + admin
    ├── app/
    │   ├── core/              ← auth.py, db.py, audit.py, schema.slq, seed_*
    │   └── services/          ← parser.py, commit.py, analytics.py, upload_catalog.py
    │       └── configs/       ← one JSON per Excel template
    ├── scripts/              ← inspect_excel.py (debug helper)
    └── tests/                ← empty (no suite yet)
```

## Conventions
- **Organize by domain, not by type** within `backend/app/` (`core`, `services`).
- **Many small files** — target 200–400 lines, 800 max. `backend/main.py` and a few frontend
  pages currently exceed this and are slated to be split (see [ROADMAP.md](ROADMAP.md)).
- **One JSON config per Excel template** — adding a template is a config change, not code.
- `memory/` and `memory-bank/` refer to the same session-memory directory (`memory-bank/`).
