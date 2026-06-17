# start.ps1 — bring up the Health Statistics Dashboard.
#
# Default: the full containerized stack (db + backend + frontend) via Docker Compose.
#   .\scripts\start.ps1
#
# -Native: run backend (uvicorn) and frontend (vite) as host processes instead,
#          using only the Docker DB. Kept for the pre-container workflow.
#   .\scripts\start.ps1 -Native

param(
  [switch]$Native
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

$frontendPort = 5173
$backendPort = 8000

if (-not (Test-Path (Join-Path $repoRoot ".env"))) {
  Write-Host "No .env found — copying from .env.example. Review it before production use."
  Copy-Item (Join-Path $repoRoot ".env.example") (Join-Path $repoRoot ".env")
}

if (-not $Native) {
  Write-Host "Starting full containerized stack (docker compose up -d --build) ..."
  & docker compose up -d --build
  Write-Host ""
  Write-Host "Done. Check:"
  Write-Host "  Frontend:     http://localhost:$frontendPort"
  Write-Host "  Backend docs: http://localhost:$backendPort/docs"
  Write-Host ""
  Write-Host "First run? Seed the DB:  docker compose exec backend python backend/bootstrap_db.py"
  Write-Host "Logs:                    docker compose logs -f backend"
  return
}

# ---- Native (host-process) fallback: Docker DB only, uvicorn + vite locally ----
$logsDir = Join-Path $repoRoot "logs"
$frontendDir = Join-Path $repoRoot "frontend"
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

Write-Host "Native mode: starting DB container only ..."
& docker compose up -d db

Write-Host "Starting backend (uvicorn) ..."
$backendCmd = @"
Set-Location '$repoRoot'
python -m uvicorn backend.main:app --host 0.0.0.0 --port $backendPort 2>&1 | Tee-Object -FilePath '$(Join-Path $logsDir "backend.out.log")'
"@
Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile", "-Command", $backendCmd) -WindowStyle Minimized | Out-Null

Write-Host "Starting frontend (Vite) ..."
$frontendCmd = @"
Set-Location '$frontendDir'
npm run dev -- --host 0.0.0.0 --port $frontendPort 2>&1 | Tee-Object -FilePath '$(Join-Path $logsDir "frontend.out.log")'
"@
Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile", "-Command", $frontendCmd) -WindowStyle Minimized | Out-Null

Write-Host ""
Write-Host "Done (native). Frontend: http://localhost:$frontendPort  Backend: http://localhost:$backendPort/docs  Logs: $logsDir"
