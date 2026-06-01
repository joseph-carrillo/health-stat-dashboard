param(
  [switch]$SkipDocker
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$frontendDir = Join-Path $repoRoot "frontend"

$backendPort = 8000
$frontendPort = 5173

function Test-PortInUse {
  param(
    [Parameter(Mandatory=$true)][int]$Port
  )
  $res = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel "Quiet" -WarningAction SilentlyContinue
  return [bool]$res
}

function Start-Backend {
  if (Test-PortInUse -Port $backendPort) {
    Write-Host "Backend already running on port $backendPort"
    return
  }

  $logsDir = Join-Path $repoRoot "logs"
  New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

  $outFile = Join-Path $logsDir "backend.out.log"
  $errFile = Join-Path $logsDir "backend.err.log"

  Write-Host "Starting backend (uvicorn) ..."

  # Run from repo root so `backend.main:app` resolves correctly.
  Set-Location $repoRoot

  $args = @(
    "-NoProfile",
    "-Command",
    "python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port $backendPort 2>&1 | Tee-Object -FilePath `"$outFile`""
  )

  # Note: `Tee-Object` also mirrors output to the log. Stop uses ports, not PIDs.
  Start-Process -FilePath "powershell.exe" -ArgumentList $args -WindowStyle Hidden | Out-Null
}

function Start-Frontend {
  if (Test-PortInUse -Port $frontendPort) {
    Write-Host "Frontend already running on port $frontendPort"
    return
  }

  $logsDir = Join-Path $repoRoot "logs"
  New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

  $outFile = Join-Path $logsDir "frontend.out.log"

  Write-Host "Starting frontend (Vite) ..."

  Set-Location $frontendDir

  $args = @(
    "-NoProfile",
    "-Command",
    "npm run dev -- --host 0.0.0.0 --port $frontendPort 2>&1 | Tee-Object -FilePath `"$outFile`""
  )

  Start-Process -FilePath "powershell.exe" -ArgumentList $args -WindowStyle Hidden | Out-Null
}

function Start-Docker {
  if ($SkipDocker) {
    return
  }

  Write-Host "Starting PostgreSQL via Docker ..."

  # Prefer legacy `docker-compose` but fall back to `docker compose`.
  $hasDockerCompose = (Get-Command docker-compose -ErrorAction SilentlyContinue) -ne $null
  if ($hasDockerCompose) {
    Set-Location $repoRoot
    & docker-compose up -d
  } else {
    Set-Location $repoRoot
    & docker compose up -d
  }
}

Start-Docker
Start-Backend
Start-Frontend

Write-Host ""
Write-Host "Done. Check:"
Write-Host "  Frontend: http://localhost:$frontendPort"
Write-Host "  Backend docs: http://localhost:$backendPort/docs"

