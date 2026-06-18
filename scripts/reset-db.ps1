# reset-db.ps1 - wipe uploaded health data for a clean testing slate.
#
# Truncates ONLY the transactional tables:
#   - health_data          (committed production values)
#   - staging_health_data  (pre-approval staging + conflicts)
#
# Reference data (locations, indicators, report_periods), users, roles, and the
# audit_log are all PRESERVED - the app stays fully usable, just with zero
# health figures so you can re-upload and verify values/bugs from a known-empty state.
#
#   .\scripts\reset-db.ps1          # shows row counts, asks to confirm
#   .\scripts\reset-db.ps1 -Force   # skip the confirmation prompt

param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

$countSql = "SELECT 'health_data' AS table, count(*) FROM health_data UNION ALL SELECT 'staging_health_data', count(*) FROM staging_health_data;"

function Invoke-Psql {
  param([Parameter(Mandatory = $true)][string]$Sql)
  & docker compose exec -T db psql -U doh_admin -d doh_nir_dashboard -c $Sql
}

Write-Host "Current row counts:" -ForegroundColor Cyan
Invoke-Psql $countSql

if (-not $Force) {
  Write-Host ""
  $reply = Read-Host "This permanently deletes ALL uploaded + staging health data. Type 'yes' to proceed"
  if ($reply -ne "yes") {
    Write-Host "Aborted - nothing was deleted." -ForegroundColor Yellow
    exit 0
  }
}

Write-Host ""
Write-Host "Truncating health_data + staging_health_data ..." -ForegroundColor Cyan
Invoke-Psql "TRUNCATE TABLE health_data, staging_health_data RESTART IDENTITY;"

Write-Host ""
Write-Host "Done. New row counts:" -ForegroundColor Green
Invoke-Psql $countSql
Write-Host ""
Write-Host "DB is clean. Reference data, users, and audit_log preserved." -ForegroundColor Green
