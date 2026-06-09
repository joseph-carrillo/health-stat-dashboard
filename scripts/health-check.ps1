$ErrorActionPreference = "SilentlyContinue"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendPort = 8000
$frontendPort = 5173

# Fast port check — avoids slow Test-NetConnection on Windows.
function Test-PortInUse {
  param(
    [Parameter(Mandatory = $true)][int]$Port
  )
  $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  return [bool]$conn
}

function Get-DockerState {
  $hasDocker = (Get-Command docker -ErrorAction SilentlyContinue) -ne $null
  if (-not $hasDocker) {
    return "docker-cli-missing"
  }

  & docker version *> $null
  if ($LASTEXITCODE -ne 0) {
    return "docker-not-running"
  }

  Set-Location $repoRoot
  $containerName = "doh_nir_db"
  $containerStatus = & docker ps --filter "name=$containerName" --format "{{.Names}}" 2>$null
  if ($containerStatus -match $containerName) {
    return "running"
  }

  return "not-running"
}

function Print-Status {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Status,
    [Parameter(Mandatory = $true)][string]$Hint
  )
  Write-Host ("[{0}] {1} - {2}" -f $Status.ToUpper(), $Name, $Hint)
}

Write-Host "Session Health Check"
Write-Host "===================="

$dockerState = Get-DockerState
switch ($dockerState) {
  "running"            { Print-Status -Name "Database (Docker)" -Status "ok" -Hint "Container doh_nir_db is running." }
  "not-running"        { Print-Status -Name "Database (Docker)" -Status "warn" -Hint "Container is down. Run .\scripts\start.ps1" }
  "docker-not-running" { Print-Status -Name "Database (Docker)" -Status "warn" -Hint "Docker Desktop appears off." }
  "docker-cli-missing" { Print-Status -Name "Database (Docker)" -Status "warn" -Hint "Docker CLI not found in PATH." }
  default              { Print-Status -Name "Database (Docker)" -Status "warn" -Hint "Unknown Docker state." }
}

if (Test-PortInUse -Port $backendPort) {
  Print-Status -Name "Backend API" -Status "ok" -Hint "Listening on port $backendPort (docs: http://localhost:$backendPort/docs)"
} else {
  Print-Status -Name "Backend API" -Status "warn" -Hint "Not listening on port $backendPort"
}

if (Test-PortInUse -Port $frontendPort) {
  Print-Status -Name "Frontend App" -Status "ok" -Hint "Listening on port $frontendPort (http://localhost:$frontendPort)"
} else {
  Print-Status -Name "Frontend App" -Status "warn" -Hint "Not listening on port $frontendPort"
}

Write-Host ""
Write-Host "Quick actions:"
Write-Host "  Sync git: .\scripts\sync.ps1"
Write-Host "  Start all: .\scripts\start.ps1"
Write-Host "  Stop all : .\scripts\stop.ps1"
