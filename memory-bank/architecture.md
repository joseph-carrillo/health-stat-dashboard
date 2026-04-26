# architecture.md

## Tech Stack
| Layer | Tool |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Excel Parser | pandas + openpyxl |
| Auth | JWT + bcrypt |
| Containers | Docker + docker-compose |
| DB Viewer | DBeaver |
| Version Control | Git + GitHub (private) |
| Hosting (start) | Railway or Render (free tier) |

## Data Flow
Excel Upload → FastAPI Parser → Validation Layer → PostgreSQL → FastAPI API → React Dashboard

## Future Data Flow (Phase 2)
Web Form (mirrors Excel) → FastAPI → Validation Layer → PostgreSQL → FastAPI API → React Dashboard

## Database Schema (5 core tables + 2 supporting)

### locations
Stores every PSGC code and location name.
- id, psgc, name, level (region/province/city_municipality/barangay), parent_psgc

### programs
Health program categories.
- id, code (e.g. CHILD_CARE), name

### indicators
Every measurable column from every Excel file.
- id, program_id, code, name, unit, frequency_type (monthly/quarterly/annual)
- formula_type (percentage/ratio/sum/rate)
- rate_multiplier (100/1000/10000/100000)
- denominator_source (column code or computed indicator code)
- is_computed (true = derived, false = raw input)
- is_sensitive (true = HIV/Syphilis restricted)
- is_active, year_introduced, year_retired

### report_periods
- id, year, period_type (monthly/quarterly/annual), period_value, label

### health_data
Every single number — the narrow table.
- id, indicator_id, location_id, period_id, value
- is_computed, uploaded_by, uploaded_at, source_file

### staging_health_data
Safe holding area before data commits to health_data.
- id, batch_id, indicator_id, location_id, period_id, value
- validation_status (pending/passed/failed), validation_notes
- conflict_status (none/pending_review/accepted/rejected)
- uploaded_by, uploaded_at, source_file, approved_by, approved_at

### reference_populations
Master population table for cross-validation.
- id, location_id, period_id, age_group, value, source

## Parser Design
- Config-driven: one JSON config per Excel template
- Config defines: sheet names, column positions, indicator codes, DQC rules
- Parser never trusts column header labels — uses column position only
- Parser stops at blank PSGC — row count is not fixed
- Per-sheet column mapping supported (handles inconsistent sheets)
- Computation order enforced for chained denominators

## DQC Rule Types (5 types)
1. Over threshold — value > X% → flag
2. Sequence logic — A ≥ B ≥ C (e.g. vaccine doses)
3. Cross-indicator — indicator A must relate to indicator B
4. Equality — sum of parts must equal total
5. Cross-file — totals must match across separate files

## Denominator Types (8 types)
D1 - Projected Population (age-specific)
D2 - Facility Seen (condition-specific)
D3 - Live Births
D4 - Condition Count (e.g. LBW count)
D5 - Enrolled Learner Count (DepEd)
D6 - Projected Households
D7 - Administrative Unit Count (municipalities)
D8 - Estimated Population (user-entered)

## Rate Multipliers
- ×100 = percentage (most indicators)
- ×1,000 = IMR
- ×10,000 = Leprosy prevalence rate
- ×100,000 = MMR, CDR, Morbidity rate

## Conflict Handling
When duplicate data is detected during upload:
- System holds incoming data in staging
- Shows side-by-side comparison to authorized user
- User decides: keep original or overwrite
- Decision recorded in audit log

## RBAC Design
| Role | Upload | View | Edit | Delete | Scope |
|---|---|---|---|---|---|
| Admin | Yes | All | All | All | Entire system |
| Data Encoder | Yes | Own program | Own submissions | No | Assigned program |
| Program Manager | No | Own program | No | No | Assigned program |
| ManCom | No | All (no barangay) | No | No | Province/City |
| ExeCom | No | All (summary only) | No | No | Region |

## Folder Structure
```
health-stat-dashboard/
├── memory-bank/
├── backend/
│   ├── app/
│   │   ├── api/          # route handlers
│   │   ├── core/         # config, security
│   │   ├── models/       # database models
│   │   ├── schemas/      # data validation
│   │   ├── services/     # business logic
│   │   └── utils/        # helpers
│   ├── tests/
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/     # API calls
│   │   └── utils/
│   └── index.html
├── docker-compose.yml
└── .gitignore
```

## Key Decisions
- Excel is input only (Phase 1), replaced by web form (Phase 2)
- Validation happens in FastAPI before data touches PostgreSQL
- RBAC enforced at API level, not just frontend
- Docker ensures same environment on both machines and production
- Parser config is source of truth for column mapping
- Column header labels in Excel are for human reference only
- TB is out of scope now but addable later without schema changes
