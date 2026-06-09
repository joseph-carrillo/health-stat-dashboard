param(
  [switch]$SkipDocker
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$frontendDir = Join-Path $repoRoot "frontend"
$logsDir = Join-Path $repoRoot "logs"

$backendPort = 8000
$frontendPort = 5173

function Test-PortInUse {
  param(
    [Parameter(Mandatory=$true)][int]$Port
  )
  $res = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel "Quiet" -WarningAction SilentlyContinue
  return [bool]$res
}

function Wait-ForPort {
  param(
    [Parameter(Mandatory=$true)][int]$Port,
    [Parameter(Mandatory=$true)][string]$Name,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortInUse -Port $Port) {
      Write-Host "$Name is listening on port $Port"
      return $true
    }
    Start-Sleep -Seconds 1
  }

  Write-Host "Warning: $Name did not start on port $Port within ${TimeoutSeconds}s. Check logs in $logsDir"
  return $false
}

function Stop-Backend {
  try {
    $conns = Get-NetTCPConnection -LocalPort $backendPort -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) { return }
    $procIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $procIds) {
      if ($procId -ne $null -and $procId -ne 0) {
        Write-Host "Stopping backend PID $procId on port $backendPort ..."
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      }
    }
    Start-Sleep -Seconds 2
  } catch {
    Write-Host "Warning: could not stop backend on port $backendPort. $($_.Exception.Message)"
  }
}

function Start-Backend {
  if (Test-PortInUse -Port $backendPort) {
    Write-Host "Backend already on port $backendPort - restarting to load latest code ..."
    Stop-Backend
  }

  New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
  $outFile = Join-Path $logsDir "backend.out.log"

  Write-Host "Starting backend (uvicorn) ..."

  # No --reload: auto-reload often leaves port 8000 dead after a parser crash.
  $cmd = @"
Set-Location '$repoRoot'
python -m uvicorn backend.main:app --host 0.0.0.0 --port $backendPort 2>&1 | Tee-Object -FilePath '$outFile'
"@

  Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile", "-Command", $cmd) -WindowStyle Minimized | Out-Null
  Wait-ForPort -Port $backendPort -Name "Backend API" | Out-Null
}

function Start-Frontend {
  if (Test-PortInUse -Port $frontendPort) {
    Write-Host "Frontend already running on port $frontendPort"
    return
  }

  New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
  $outFile = Join-Path $logsDir "frontend.out.log"

  Write-Host "Starting frontend (Vite) ..."

  $cmd = @"
Set-Location '$frontendDir'
npm run dev -- --host 0.0.0.0 --port $frontendPort 2>&1 | Tee-Object -FilePath '$outFile'
"@

  Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile", "-Command", $cmd) -WindowStyle Minimized | Out-Null
  Wait-ForPort -Port $frontendPort -Name "Frontend App" | Out-Null
}

function Start-Docker {
  if ($SkipDocker) {
    return
  }

  Write-Host "Starting PostgreSQL via Docker ..."

  Set-Location $repoRoot
  $hasDockerCompose = (Get-Command docker-compose -ErrorAction SilentlyContinue) -ne $null
  if ($hasDockerCompose) {
    & docker-compose up -d
  } else {
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
Write-Host "  Logs: $logsDir"
