# stop.ps1 — stop the Health Statistics Dashboard.
#
# Default: stop the whole containerized stack (docker compose down).
#   .\scripts\stop.ps1
#
# -Native: also kill host-process backend/frontend dev servers (ports 8000/5173)
#          left over from `start.ps1 -Native`, then bring the DB container down.
#   .\scripts\stop.ps1 -Native

param(
  [switch]$Native
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

function Stop-ByPort {
  param([Parameter(Mandatory=$true)][int]$Port)
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) { Write-Host "No process listening on port $Port"; return }
    $procIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $procIds) {
      if ($procId -ne $null -and $procId -ne 0) {
        Write-Host "Stopping process PID $procId on port $Port ..."
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {
    Write-Host "Warning: could not stop by port $Port. $($_.Exception.Message)"
  }
}

if ($Native) {
  Stop-ByPort -Port 5173
  Stop-ByPort -Port 8000
}

Write-Host "Stopping containers (docker compose down) ..."
& docker compose down

Write-Host ""
Write-Host "Done. Stack stopped. (DB volume preserved — use 'docker compose down -v' to wipe data.)"
