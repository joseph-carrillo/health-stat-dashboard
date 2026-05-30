# Adding a New FHSIS Template (Phase 1 Recipe)

This is the repeatable process for adding any of the remaining 62 Excel
templates. The parser is config-driven, so adding a template is mostly
writing a JSON config + seeding its indicators. No parser code changes.

Worked example: `backend/app/services/configs/cpab_bcg_hepa.json` (File 1).

## Step 1 — Seed the indicators

Every column you want to store must exist in the `indicators` table first.

- Add the indicators to `backend/app/core/seed_indicators.py` under the
  correct program key (e.g. `CHILD_CARE`). Each tuple is:
  `(code, name, unit, frequency_type, formula_type, rate_multiplier,
    denominator_source, is_computed, is_sensitive, target_value, target_year)`
- Run it: `python backend/app/core/seed_indicators.py`
  (safe to re-run — it skips codes that already exist).

Conventions that the dashboard relies on:
- Percentage indicators end in `_PCT` and set `formula_type = 'percentage'`.
- The matching numerator total ends in `_TOTAL` (the Coverage page derives
  numerator from `_PCT` -> `_TOTAL`).
- `denominator_source` points to the population/denominator indicator code.
- Mark HIV/Syphilis reactive indicators `is_sensitive = TRUE`.

## Step 2 — Write the template config

Create `backend/app/services/configs/<template_id>.json`. Required keys:

| Key | Meaning |
|---|---|
| `template_id` | Upper-case id, e.g. `CPAB_BCG_HEPA` |
| `program_code` | Must match a row in `programs` |
| `psgc_column` | 0-based column index of the PSGC code |
| `header_row` / `data_start_row` | Row indices |
| `sheet_map` | Month number -> sheet/tab name |
| `columns` | One entry per stored value (see below) |
| `dqc_rules` | Optional data-quality checks |

Each `columns` entry:
- `index`: 0-based Excel column position (NEVER trust header labels)
- `indicator_code`: must match a seeded indicator
- `is_computed`: `true` if derived; then add `formula` using indicator codes
  (e.g. `"CPAB_MALE + CPAB_FEMALE"`)

Computed columns are evaluated after raw columns, so chained formulas
(totals -> percentages) work in order.

Optional `display` block (drives the Indicator Reports "Excel face" view):

```json
"display": {
  "label": "File N - Short Title",
  "id_columns": [
    { "key": "psgc", "label": "PSGC" },
    { "key": "location", "label": "Name of City / Municipality" }
  ]
}
```

The Indicator Reports page renders columns in this config's exact order and
groups them into the two-row header (e.g. "CPAB" over Male/Female/Total/%).
Grouping is derived from indicator names ending in Male/Female/Total/Percentage,
so keep that naming convention. Files are read as UTF-8 — non-ASCII is fine.

## Step 3 — Validate the config (no DB writes)

`POST /api/validate-config?template_id=<id>` returns `{ valid, problems }`.
It checks structure: required keys, duplicate indices/codes, computed columns
missing formulas, and DQC rules referencing unknown indicators.

## Step 4 — Dry-run parse a real file (no DB writes)

Upload with `dry_run=true` (the Upload page has a "Validate Only" button, or
`POST /api/upload?...&dry_run=true`). The response includes:
- `rows_processed`, `dqc_issues`, `errors`
- `preview`: first 25 parsed values with validation status

Fix the config until the preview looks right and `errors = 0`.

## Step 5 — Register the template in the UI

Add one entry to `frontend/src/services/constants.js` `TEMPLATES`:

```js
{ id: "<template_id>", label: "File N — ...", program_code: "..." }
```

That is the only frontend change — the Upload page, dropdowns, and analytics
pages all read from the API and adapt automatically. The template also appears
automatically in Indicator Reports (it lists every config in `configs/`).

## Step 6 — Real upload + approve

Upload for real (`dry_run` off), review the staged batch, resolve any
conflicts, then approve. Approved data appears immediately on Home,
Overview, Coverage, Trends, Rankings, and Data Availability.

## Notes

- Quarterly/annual views are computed from stored monthly data:
  counts are summed, percentages/rates are averaged across months.
- Every upload, approval, conflict resolution, and role change is written to
  the `audit_log` table (Data Privacy Act compliance).
