# Track 1 automated checks (Mon/Tue) — no Excel file needed
$ErrorActionPreference = "Continue"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Write-Host "Track 1 Verification"
Write-Host "===================="

# Ports
& (Join-Path $PSScriptRoot "health-check.ps1")

# DB row counts
Write-Host ""
Write-Host "Database (health_data by month):"
python -c @"
import psycopg2
c = psycopg2.connect(host='localhost', port=5432, database='doh_nir_dashboard',
                     user='doh_admin', password='doh_password_2026')
cur = c.cursor()
cur.execute('''
  SELECT rp.year, rp.period_value, COUNT(*)
  FROM health_data h JOIN report_periods rp ON rp.id = h.period_id
  WHERE rp.period_type = 'monthly'
  GROUP BY rp.year, rp.period_value ORDER BY 1, 2''')
for r in cur.fetchall():
    print(f'  {r[0]} month {r[1]}: {r[2]} rows')
cur.close(); c.close()
"@

# API
Write-Host ""
Write-Host "API (admin login):"
try {
  $login = Invoke-RestMethod -Uri "http://localhost:8000/api/login" -Method Post `
    -Body @{ username = "admin"; password = "Admin@2026!" } `
    -ContentType "application/x-www-form-urlencoded"
  $h = @{ Authorization = "Bearer $($login.access_token)" }

  foreach ($mo in 1, 2) {
    $d = Invoke-RestMethod -Uri "http://localhost:8000/api/coverage-summary?year=2026&month=$mo&indicator_code=CPAB_PCT" -Headers $h
    $with = @($d.data | Where-Object { $null -ne $_.value }).Count
    Write-Host "  coverage-summary 2026-$mo : $($d.count) LGUs, $with with CPAB_PCT"
  }

  $hd = Invoke-RestMethod -Uri "http://localhost:8000/api/health-data?year=2026&month=1" -Headers $h
  Write-Host "  health-data 2026-01 : $($hd.total) rows (Indicator Report source)"

  $bd = Invoke-RestMethod -Uri "http://localhost:8000/api/coverage-breakdown?year=2026&month=1&total_code=CPAB_TOTAL&pct_code=CPAB_PCT&denom_code=IMMUN_POP_0_11M" -Headers $h
  $bdWith = @($bd.data | Where-Object { $null -ne $_.pct }).Count
  Write-Host "  coverage-breakdown 2026-01 : $($bd.count) LGUs, $bdWith with CPAB_PCT (Coverage/Rankings)"
} catch {
  Write-Host "  API check failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Wed UI check (you, ~2 min when free):"
Write-Host "  http://localhost:5173/home"
Write-Host "  http://localhost:5173/analytics/overview  (year=2026, month=January)"
Write-Host "  http://localhost:5173/analytics/indicator-report"
