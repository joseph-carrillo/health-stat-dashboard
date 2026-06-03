# Track 1 — API & Page Map (Tuesday audit)

**Demo period:** January 2026 (`year=2026`, `month=1`)

## Database (verified)

| Period | `health_data` rows |
|--------|-------------------|
| 2026-01 | 2,667 |
| 2026-02 | 2,667 |

Run: `.\scripts\track1-verify.ps1`

## API endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/login` | JWT token |
| `POST /api/upload` | Parse Excel → staging |
| `GET /api/staging/{batch_id}` | Batch summary |
| `POST /api/staging/{batch_id}/approve` | Commit to `health_data` |
| `GET /api/health-data` | Flat rows for **Indicator Report** |
| `GET /api/coverage-summary` | Per-LGU one indicator (maps, Home) |
| `GET /api/coverage-breakdown` | Numerator, denominator, pct per LGU |
| `GET /api/batches/history` | Management history tab |

### Example calls (Jan 2026 Immunization)

```
GET /api/health-data?year=2026&month=1
GET /api/coverage-summary?year=2026&month=1&indicator_code=CPAB_PCT
GET /api/coverage-breakdown?year=2026&month=1&total_code=CPAB_TOTAL&pct_code=CPAB_PCT&denom_code=IMMUN_POP_0_11M
```

## Frontend pages → API

| Page | API | Indicator / notes |
|------|-----|-------------------|
| **Home** | `coverage-summary` | `CPAB_PCT`, Jan 2026 default |
| **Overview** | `coverage-summary` | `CPAB_PCT`, user-selected month |
| **Indicator Report** | `health-data` | All CPAB/BCG/HepaB codes |
| **Coverage** | `coverage-breakdown` | Per program selector |
| **Rankings** | `coverage-breakdown` | Per program selector |
| **Management Upload** | `upload` | `template_id=cpab_bcg_hepa` |

## Not in App router (legacy mock)

| File | Status |
|------|--------|
| `Dashboard.jsx` | Mock data — **not linked** in `App.jsx` |

## Wednesday fixes applied

- Home / Overview default period → Jan 2026
- Overview map name matching (`frontend/src/utils/locationNames.js`) — 63/63 LGUs
- Home labels show January 2026 (not calendar month)
- Coverage / Rankings reload when period or program changes
