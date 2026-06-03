$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

$backendPort = 8000
$frontendPort = 5173

function Stop-By-Port {
  param(
    [Parameter(Mandatory=$true)][int]$Port
  )

  # Kill anything listening on the port (backend/frontend dev servers).
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) {
      Write-Host "No process listening on port $Port"
      return
    }

    $procIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $procIds) {
      if ($procId -ne $null -and $procId -ne 0) {
        Write-Host "Stopping process PID $procId on port $Port ..."
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {
    Write-Host "Warning: could not stop by port $Port. Continuing. $($_.Exception.Message)"
  }
}

function Stop-Docker {
  Write-Host "Stopping PostgreSQL Docker container(s) ..."
  try {
    $hasDockerCompose = (Get-Command docker-compose -ErrorAction SilentlyContinue) -ne $null
    Set-Location $repoRoot
    if ($hasDockerCompose) {
      & docker-compose down
    } else {
      & docker compose down
    }
  } catch {
    Write-Host "Warning: Docker shutdown failed. $($_.Exception.Message)"
  }
}

function Main {
  Stop-By-Port -Port $frontendPort
  Stop-By-Port -Port $backendPort
  Stop-Docker

  Write-Host ""
  Write-Host "Done. Frontend/Backend stopped (and Docker was brought down)."
}

Main

