---
name: add-template
description: Build out one FHSIS Excel template end-to-end — seed indicators, write the JSON config, validate, dry-run, register in the UI — using a machine-checkable definition of done so the loop can run with a single approval instead of a review at every step. Use after analyze-template has already produced a write-up for the file(s) in question.
---

# Add a New FHSIS Template

This is the build loop. It assumes `analyze-template` has already run and produced a write-up in
`memory-bank/template_analysis/` — **do not start this skill on a file that hasn't been analyzed
first**, and do not start it on a group whose blockers/decisions in
`memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` are still unresolved (check the
scorecard there before picking up any group).

## Before you start: confirm the precondition

1. Read the file-group's write-up in `memory-bank/template_analysis/`.
2. Read the relevant row of the consolidated-summary scorecard (§7). If it says "blocked" —
   stop, that needs a DOH fix or a Joseph decision first, not a build attempt.
3. If it needs a schema/parser decision (D1–D10 in the consolidated summary) that hasn't been
   made yet, ask before writing any code — these are one-way doors (new `formula_type` values,
   new DQC rule types) that should be decided once, not improvised per-config.
4. Check `backend/app/services/configs/` for a sibling config to use as a worked example —
   `cpab_bcg_hepa.json` is the canonical simple case; `nut_mam_sam_annual.json` is the canonical
   `extra_sheets` case.

## Definition of done (the machine-checkable gate)

Before surfacing anything to Joseph for a UI check, all of these must be true. Treat this as a
loop: build, run the checks, fix what fails, run again — don't hand back partial results.

- [ ] Every indicator the config references exists in `seed_indicators.py` and has been seeded
      (re-running the seed script is idempotent — safe to run again).
- [ ] `POST /api/validate-config?template_id=<id>` returns `valid: true`, zero `problems`.
- [ ] Dry-run parse (`dry_run=true`) against the real file returns `errors: 0`.
- [ ] Row count in the dry-run response matches the file-group's write-up (e.g. "5 data rows",
      "68 rows") — a mismatch means `data_start_row`/`psgc_column` is wrong, not that the file
      changed.
- [ ] DQC issues in the dry-run response are either zero, or match *expected* issues already
      documented in the write-up (e.g. Intra Partum's known City-of-Bacolod mismatch) — an
      *unexpected* DQC hit means investigate before proceeding, don't wave it through.
- [ ] At least 3 spot-checked cell values (pick real, non-placeholder rows) match hand
      arithmetic against the source `.xlsx`, computed the way the config computes them —
      not the way the sheet's own (possibly buggy) formula computes them.
- [ ] `pytest backend/tests/ -q` still green, `ruff` clean.
- [ ] Template registered in `frontend/src/services/constants.js` `TEMPLATES` **and** (if new
      program/sub-program) `backend/app/services/upload_catalog.py` `PROGRAMS` — confirmed by
      actually loading the Upload page and selecting it, not just by editing both files.

Only once every box is checked: stop and hand the result to Joseph for the UI check (golden
path in Coverage/Trends/Indicator Reports). This is the goal→build→validate→loop pattern from
the 2026-07-04 session — one approval up front, then work autonomously through the checklist,
surfacing only the finished, green result.

## Steps

### Step 1 — Seed the indicators
Add rows to `backend/app/core/seed_indicators.py` under the correct program key. Each tuple:
`(code, name, unit, frequency_type, formula_type, rate_multiplier, denominator_source,
is_computed, is_sensitive, target_value, target_year)`.

Conventions:
- Percentage indicators end `_PCT`, `formula_type = 'percentage'`; the matching numerator ends
  `_TOTAL` (Coverage page derives `_PCT` → `_TOTAL`).
- **Non-percentage rates** (per 1,000 / 10,000 / 100,000 / 1,000,000 — Leprosy, Rabies, Vital
  Stats) and **unbounded ratios** (Demographics' population-per-resource) are NOT yet supported
  end-to-end — this is decision D1/D2 in the consolidated summary. If the group you're building
  needs one of these, confirm the schema/display uplift has landed before seeding; don't
  half-implement it as a bare `'percentage'` with a misleading multiplier.
- `denominator_source` points at the population/denominator indicator code. **Use the value the
  analysis write-up recommends, not what the Excel header claims** — several groups have a
  formula that silently divides by the wrong column relative to its own label (Prenatal GD
  screening, NCD Risk Factors, Geriatric SC Immunization are confirmed examples; treat every
  denominator as suspect until the write-up says otherwise).
- Mark `is_sensitive = TRUE` per the ladder in the consolidated summary §3 — Tier 1 is settled
  policy (HIV/Syphilis reactive), Tier 2/3 need Joseph's explicit yes before seeding, don't
  default silently either way.

Run: `python backend/app/core/seed_indicators.py` (idempotent).

### Step 2 — Write the template config
Create `backend/app/services/configs/<template_id>.json`. Required keys: `template_id`,
`program_code`, `psgc_column`, `header_row`/`data_start_row`, `sheet_map`, `columns`,
`dqc_rules` (optional).

- `index` is always the 0-based Excel column position. **Never key off the header label** —
  every analyzed program had at least one stale or misleading header.
- For `is_computed` columns, write the `formula` using indicator codes based on what the
  write-up says the column *should* compute — if the write-up flags a bug (wrong bracket, wrong
  quarter, circular reference, skipped quarter), the config implements the correct math, not a
  copy of the broken Excel formula. This is the single most important rule from the whole
  analysis phase: recompute from raw inputs, never trust the Excel-computed value.
- **Multi-sheet-group workbooks** (Rabies' 4 sub-templates, Schisto's 3-6 cross-referencing
  sheet families, Mortality's MMR/IMR families): split into multiple `template_id`s pointing at
  the same physical file, one config per logical sub-template. Don't try to force one config to
  read across sheet-group boundaries — this matches the existing `extra_sheets` pattern's spirit
  without needing a parser change.
- **Row-stacked periods/age-groups** (Family Planning's quarters-in-one-tab, Oral Health's
  quarters+age-bands stacked, NCD Eye Health's age-as-rows): this needs the `row_filter`
  mechanism from decision D6, which doesn't exist yet. Don't attempt a workaround in
  `sheet_map` — raise it as a blocker instead.
- `dqc_rules`: **re-derive the intended check, never port the source file's conditional-format
  range verbatim.** Most shipped DQC in these programs is dead (anchored past real data, or
  comparing the wrong scale) — the write-up already states what the *intended* rule was; anchor
  it to this config's real data extent instead.

### Step 3 — Validate the config (no DB writes)
`POST /api/validate-config?template_id=<id>` → `{ valid, problems }`.

### Step 4 — Dry-run parse a real file (no DB writes)
Upload with `dry_run=true`. Check `rows_processed`, `dqc_issues`, `errors`, and the `preview`
(first 25 parsed values) against the write-up's expectations. Iterate steps 2-4 until the
definition-of-done checklist passes.

### Step 5 — Register the template in the UI
**Two places, not one** (confirmed the hard way building Demographics, 2026-07-06):
1. One entry in `frontend/src/services/constants.js` `TEMPLATES`: `{ id, label, program_code }`
   — feeds Indicator Reports/the "Excel face" view.
2. If this is a **new program** (or a program with no sub-program entry yet), add it to the
   hardcoded `PROGRAMS` list in `backend/app/services/upload_catalog.py` — this is what the
   **Upload page's** Program/Sub-Program dropdown actually reads (it then globs
   `backend/app/services/configs/*.json` itself for templates, hot-reloads, no restart needed).
   Skipping this means the config validates fine and Indicator Reports shows the data, but the
   Upload page has no way to select the template at all.
Verify by actually loading the Upload page in a browser and walking Program → Sub-Program →
Template, not just by confirming the files were edited.

### Step 6 — Real upload + approve
Once Joseph has checked the UI: upload for real (`dry_run` off), review the staged batch,
resolve conflicts, approve. Every step writes to `audit_log`.

## Notes
- Quarterly/annual views are computed from stored monthly data by default (counts summed,
  percentages/rates averaged) — **except** where the write-up flags a column as cumulative
  year-to-date rather than flow (NCD meds) or as needing the period-start value rather than a
  sum (Family Planning's Beginning stock). Those need the D5 per-column rollup override; don't
  seed them as ordinary summed indicators in the meantime.
- If a file is a known DOH-side blocker (see consolidated summary §4-A), don't build around it —
  flag the fix request and move to the next program in the priority order instead of losing time
  on a workaround that will need to be undone once DOH ships the real fix.
