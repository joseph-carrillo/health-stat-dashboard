# When You're Busy — 5-Minute Checklist

The agent already ran Mon–Wed **technical** work. You only need this when you have a few minutes.

## What the agent already did

- Started backend + verified Docker DB
- Confirmed **2,667 rows** in `health_data` for **Jan & Feb 2026**
- Confirmed APIs work (`coverage-summary`, `health-data`)
- Fixed **Home** and **Overview** default month → **January 2026** (June had no data, so screens looked empty)
- Overview + Home + Indicator Report already use **live APIs** (not mock)

## Your 5 minutes (optional)

1. Open http://localhost:5173 — log in `admin` / `Admin@2026!`
2. **Home** — Immunization should show a % (not "No data")
3. **Overview** — map should have colors; try month **January** / **2026**
4. **Indicator Report** — January 2026; spot-check **one** LGU vs your Excel if you care about raw counts

## Only you can do (when you have the file)

- Upload a **new** test Excel → Staging → Approve (agent cannot click your file picker)

## Re-run automated checks anytime

```powershell
.\scripts\track1-verify.ps1
```
