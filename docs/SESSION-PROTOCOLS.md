# Session Startup & Shutdown Protocols (Windows / PowerShell)

This repo has three parts — **all three now run in Docker containers**:

1. **Database** (PostgreSQL on port `5432`)
2. **Backend** (FastAPI on port `8000`)
3. **Frontend** (Vite React on port `5173`)

The "press one button" setup wraps Docker Compose:

- `scripts\start.ps1` → `docker compose up -d --build` (the whole stack)
- `scripts\stop.ps1` → `docker compose down`
- `scripts\health-check.ps1` checks what is running

Prefer running pieces on the host instead? `scripts\start.ps1 -Native` runs the DB in Docker
but the backend (uvicorn) and frontend (vite) as host processes.

## The simple mental model (like a smart 10-year-old)

Think of it like 3 friends that you invite to play:

1. **DB friend**: starts the place where data lives.
2. **Backend friend**: talks to the DB and explains rules to the frontend.
3. **Frontend friend**: runs the website in your browser.

When you **start**: you call all 3 to come.
When you **shutdown**: you tell all 3 to go home, and also close the DB.

## Manual start

From the repo folder, run:

```powershell
.\scripts\start.ps1
```

Then open:

- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`

## Manual shutdown

Run:

```powershell
.\scripts\stop.ps1
```

This runs `docker compose down`, stopping all three containers (the DB volume is preserved).

> First run after a fresh DB volume? Seed it once:
> `docker compose exec backend python backend/bootstrap_db.py`

## Auto start/stop on Windows login/logout (Task Scheduler)

You can make Windows run the scripts automatically:

1. Open **Task Scheduler**
2. Choose **Create Task...** (not “Basic Task” if possible)
3. Create **two tasks**:

### Task A: Start on login

- Trigger: **At log on** (pick your user)
- Action: **Start a program**
  - Program/script: `powershell.exe`
  - Add arguments:
    ```text
    -NoProfile -ExecutionPolicy Bypass -File "C:\Users\User\Desktop\health-stat-dashboard\scripts\start.ps1"
    ```

### Task B: Stop on log off

- Trigger: **On session disconnect** (or **At log off**, depending on what you see)
- Action: **Start a program**
  - Program/script: `powershell.exe`
  - Add arguments:
    ```text
    -NoProfile -ExecutionPolicy Bypass -File "C:\Users\User\Desktop\health-stat-dashboard\scripts\stop.ps1"
    ```

## Notes / gotchas

- Docker Desktop must be running first — the whole stack is containerized.
- First run builds the images (a few minutes); later runs are fast. Rebuild after changing
  `requirements.txt` or a Dockerfile: `docker compose up -d --build`.
- Source is hot-mounted in dev — code edits reload without a rebuild.
- `-Native` mode assumes Python deps (`requirements.txt`) and `npm install` are already set up
  on the host.

## Chat Trigger Phrases (Agent Protocol)

Use these exact phrases in chat:

- `run startup protocols`
- `run shutdown protocols`
- `run session health check`

### What happens on `run startup protocols`

The agent will do this in order:

1. Sync from GitHub first (fast, no hanging):
   - `.\scripts\sync.ps1`
   - If exit code ≠ 0: **stop immediately**, report the blocker, and ask how to resolve (merge/rebase). **Never run `git merge --abort` during startup.**
   - Only use `git pull --ff-only` when `sync.ps1` reports the branch is simply behind.
2. Read foundation docs for context:
   - `CLAUDE.md`
   - `memory-bank/CLAUDE.md`
   - `memory-bank/session-handoff.md` (quickest summary)
   - `memory-bank/activeContext.md` (first priority)
   - `memory-bank/progress.md`
   - `memory-bank/architecture.md`
3. Start services (unless already running):
   - `scripts/start.ps1` → `docker compose up -d` (db + backend + frontend)
4. Brief you in plain language:
   - current goal
   - what was last completed
   - what is next
   - blockers or risks

### What happens on `run shutdown protocols`

The agent will do this in order:

1. Summarize what changed in this session.
2. Update memory docs for next-chat continuity:
   - `memory-bank/activeContext.md`
   - `memory-bank/progress.md`
   - `memory-bank/session-handoff.md`
   - optionally `memory-bank/architecture.md` if architecture changed
3. Save clear “next first task” notes.
4. Sync to GitHub:
   - `git add` relevant updated docs
   - `git commit` with session handoff message
   - `git push`
5. Stop services:
   - `scripts/stop.ps1`

If `scripts/sync.ps1` fails (diverged history, dirty tree, or merge in progress), resolve sync first before starting new work or coding.

### Two-machine sync rules (office + laptop)

- Before work: `.\scripts\sync.ps1` (or say `run startup protocols`)
- After work: shutdown protocols → commit memory docs → `git push`
- Never silently abort a merge during startup checks
- Port health checks use `Get-NetTCPConnection` (not `Test-NetConnection`) to avoid 20–30s hangs on Windows

### What happens on `run session health check`

The agent will do this in order:

1. Run:
   - `scripts/health-check.ps1`
2. Report status in plain language:
   - database/docker status
   - backend status
   - frontend status
3. Suggest one next action:
   - if healthy: continue current task
   - if unhealthy: run `scripts/start.ps1` or specific fix

## Better than original idea: one handoff file

Your idea is already strong. One improvement: maintain one tiny “single source of truth” handoff file so startup is faster and less error-prone.

Recommended new file:

- `memory-bank/session-handoff.md`

Keep it short (10-20 lines max):

- Last session date
- Current objective
- Done today
- Next 1-3 tasks (ordered)
- Known blocker
- Exact first command to run

Then startup reads this file first, and shutdown refreshes it.

## Cursor rules

Project rules live in `.cursor/rules/` (session protocols, Track 1 context, backend/frontend hints). They load automatically in Cursor Agent.

## Track 1 week plan

Day-by-day checklist: `docs/TRACK1-WEEK-PLAN.md`

