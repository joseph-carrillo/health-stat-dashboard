# Safe git sync for two-machine workflow.
# Fast-fails with a clear message — no hanging merge or silent abort.
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

if (-not (Test-Path ".git")) {
  Write-Host "ERROR: Not a git repository."
  exit 1
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Syncing branch: $branch"

# Uncommitted changes block a clean pull.
$dirty = git status --porcelain
if ($dirty) {
  Write-Host ""
  Write-Host "BLOCKED: You have uncommitted changes. Commit or stash first."
  git status --short
  exit 2
}

# In-progress merge/rebase must be resolved manually.
if (Test-Path ".git/MERGE_HEAD") {
  Write-Host ""
  Write-Host "BLOCKED: Merge in progress. Resolve conflicts and commit, or run: git merge --abort"
  exit 3
}
if (Test-Path ".git/rebase-merge") {
  Write-Host ""
  Write-Host "BLOCKED: Rebase in progress. Finish or abort the rebase first."
  exit 4
}

git fetch origin $branch 2>&1 | Write-Host
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: git fetch failed."
  exit 5
}

$local = (git rev-parse HEAD).Trim()
$remote = (git rev-parse "origin/$branch" 2>$null).Trim()
if (-not $remote) {
  Write-Host "ERROR: No remote branch origin/$branch"
  exit 6
}

if ($local -eq $remote) {
  Write-Host "OK: Already up to date with origin/$branch"
  exit 0
}

$behind = [int](git rev-list --count HEAD.."origin/$branch")
$ahead = [int](git rev-list --count "origin/$branch"..HEAD)

if ($ahead -gt 0 -and $behind -gt 0) {
  Write-Host ""
  Write-Host "BLOCKED: Branches diverged (local +$ahead / remote +$behind)."
  Write-Host "Resolve with merge or rebase before continuing. Do NOT auto-abort."
  Write-Host "  git pull origin $branch   (merge)"
  Write-Host "  git rebase origin/$branch (linear history)"
  exit 7
}

if ($behind -gt 0) {
  Write-Host "Pulling $behind commit(s) from origin/$branch ..."
  git pull --ff-only origin $branch 2>&1 | Write-Host
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fast-forward pull failed."
    exit 8
  }
  Write-Host "OK: Synced with origin/$branch"
  exit 0
}

Write-Host "OK: Local is $ahead commit(s) ahead of origin/$branch (push when ready)"
