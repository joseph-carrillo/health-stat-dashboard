# Data Model

PostgreSQL 15. Schema source of truth: `backend/app/core/schema.slq`. Seed data:
`backend/app/core/seed_*.sql` / `seed_*.slq` / `seed_indicators.py`.

## Design: narrow / tall

Health values are stored **one row per `(indicator, location, period, value)`** rather than
wide columns-per-indicator. This keeps adding new indicators a data change (not a schema
change) and matches the config-driven parser.

## Reference tables

### `locations` (~128 rows)
Geographic units keyed by PSGC code. Self-referential hierarchy via `parent_psgc`.
- `level ∈ {region, province, city_municipality, barangay}`
- `is_huc` flags Highly Urbanized Cities (reported separately from their province).

### `programs` (~11 rows)
Health program categories (Child Care, Maternal Care, …). `code` is the stable key.

### `indicators` (247 rows — CHILD_CARE only so far; the other 10 programs are pending)
Every measurable data point across all templates. Key columns:
- `code` (unique), `program_id`, `name`, `unit`
- `frequency_type ∈ {monthly, quarterly, annual}`
- `formula_type ∈ {percentage, ratio, rate, sum, count}`, `rate_multiplier`, `denominator_source`
- `is_computed` (derived vs. raw), `is_sensitive` (extra RBAC — see [SECURITY.md](SECURITY.md))
- `target_value` / `target_year`, `year_introduced` / `year_retired` (lifecycle)

### `report_periods` (~34 rows)
What time span a submission covers. `UNIQUE (year, period_type, period_value)`.
- `period_type ∈ {monthly, quarterly, annual}`; `label` is the display string.

### `reference_populations`
Master denominators for cross-validation. `UNIQUE (location_id, year, age_group)`.

## Fact tables

### `health_data` — production values
One row per data point. **`UNIQUE (indicator_id, location_id, period_id)`** — the
conflict key. `value DECIMAL(15,4)`. Percentages are stored as **ratios** (e.g. `1.44%`
→ `0.0144`) and rendered as percent in the UI. Indexed on indicator, location, period.

### `staging_health_data` — pre-approval holding area
Same grain as `health_data`, plus workflow columns:
- `batch_id` (UUID per upload) — indexed
- `validation_status ∈ {pending, passed, failed}`, `validation_notes`
- `conflict_status ∈ {none, pending_review, accepted, rejected}`, `existing_value`
- `uploaded_by/at`, `approved_by/at`, `source_file`

Only **new or changed** rows are staged; rows matching live data are skipped.

## Auth / audit tables

### `users`
`username`, `hashed_password` (argon2; legacy bcrypt upgraded on login), `full_name`, `email`,
`role ∈ {admin, data_encoder, program_manager, mancom, execom}` (nullable),
`program_code`, `is_active`, `status ∈ {pending, active, inactive}`, `last_login`.

### `audit_log`
Append-only record of every data-changing action (Data Privacy Act compliance):
`actor_id/username`, `action`, `entity_type`, `entity_id`, `details JSONB`, `created_at`.

## Bootstrap / reset

```bash
docker compose exec backend python backend/bootstrap_db.py   # schema + seed + admin
```

Or run the SQL directly (see [RUNBOOK.md](RUNBOOK.md)). Note the schema file is
`schema.slq` (existing typo kept intentionally to avoid breaking `bootstrap_db.py`).
