# FHSIS Template Analysis — Addendum
## Program: Oral Health Care (OHC)

**Status:** In Progress (1 file analyzed)
**Analyst:** Claude (file-search sub-agent)

---

## File 1: `ohc_1st_visit_completed_2_visits_nir.xlsx`
**Tracks:** Two related Oral Health Care indicators bundled in one workbook:
1. **Infants (0–11 months)** who had their **first oral (dental) visit** — simple sheets `Quarterly` / `Annual`.
2. **General population (1–4y through 60+, plus 3 pregnant-women age bands)** who had their **first oral visit** (facility + non-facility) **and** who **completed the required 2 oral health visits** (facility + non-facility) — complex sheets `Quarterly_1` / `Annual_1`.

No numeric file prefix in the filename (unlike Immunization's `1_`, `4_`, `9_`, etc.) — open question below on where this sits in the Oral Health file sequence.

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| `Quarterly` | Data (quarterly) | Infant (0–11m) first-visit only. All 4 quarters stacked in **one sheet** (Quarter is a row value, not a separate tab). |
| `Annual` | Data (annual) | Infant (0–11m) first-visit only, rolled up from `Quarterly` via cross-sheet SUM formulas. |
| `Quarterly_1` | Data (quarterly) | General population, 8 age bands × first-visit(fac/non-fac) + completed-2-visits(fac/non-fac). All 4 quarters stacked in **one sheet**. |
| `Annual_1` | Data (annual) | Same structure as `Quarterly_1`, rolled up from `Quarterly_1` via cross-sheet SUM formulas. |
| `change_log` | Admin | Version history — NOT imported. Only 2 entries, both by "Chester Febrio," both about reformatting/formula changes — no content on the ambiguities below. |

**Frequency:** Quarterly + Annual only. No monthly tabs.
**Data completeness at time of analysis:** Only **Q1 2026** has raw values entered. Q2–Q4 rows exist (formulas present) but the raw input cells are blank (`None`) in both `Quarterly` and `Quarterly_1` — this is a live template being filled in progressively.

### Sheet Dimensions
| Sheet | Rows (incl. header) | Cols | Data rows |
|---|---|---|---|
| `Quarterly` | 21 | 9 (A–I) | 20 (4 quarters × 5 locations) |
| `Annual` | 6 | 8 (A–H) | 5 (5 locations, no Quarter dimension) |
| `Quarterly_1` | 161 | 22 (A–V) | 160 (4 quarters × 8 age groups × 5 locations) |
| `Annual_1` | 41 | 21 (A–U) | 40 (8 age groups × 5 locations) |

### Geographic Levels Present — narrower than other analyzed programs
Only **5 rows per period/age-group block**: Region (NIR, computed rollup) + 3 provinces (Negros Occidental, Negros Oriental, Siquijor) + City of Bacolod (HUC). **No city/municipality or barangay-level breakdown at all.** This is far coarser than the 129-row (region→province→city/municipality→barangay) pattern established for Immunization/Nutrition/Management-of-Sick files. PSGC codes match the already-known set: `1800000000` (NIR), `1804500000`, `1804600000`, `1806100000`, `1830200000`.

### Age Groups (row dimension, not column dimension — see Flag 1)
`Quarterly_1` / `Annual_1` column D ("Age Group") takes 8 distinct values per location per quarter:
`1-4 years old`, `5-9 years old`, `10-19 years old`, `20-59 years old`, `60 years old and above`, `10-14 years old (pregnant)`, `15-19 years old (pregnant)`, `20-49 years old (pregnant)`.

The `Quarterly` / `Annual` sheets have a single implicit age group: **0–11 months** (column header says "Projected Population 0-11 months").

### Column Inventory

**Sheet: `Quarterly`** (0-based indices; col 3 "Quarter" only exists here, not in `Annual`)
| Idx | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Areas (Regions) | META | — |
| 2 | Region/PHIC (province/city name) | META | — |
| 3 | Quarter | META (row-dimension value: "1st Quarter"…"4th Quarter") | — |
| 4 | Projected Population 0-11 months (a) | RAW | — |
| 5 | Infants — 1st oral visit, Male (b) | RAW | — |
| 6 | Infants — 1st oral visit, Female (c) | RAW | — |
| 7 | A. Total (d) | COMPUTED | `col[5] + col[6]` |
| 8 | A. Percentage (e) | COMPUTED | `col[7] / col[4]` |

No Remarks/DQC columns present at all in this sheet.

**Sheet: `Annual`** (col 3 "Quarter" is absent — indices shift left by 1 vs `Quarterly`)
| Idx | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Areas (Regions) | META | — |
| 2 | Region/PHIC | META | — |
| 3 | Projected Population 0-11 months (a) | RAW (province rows) / COMPUTED region row | `=SUM` of province rows for NIR row |
| 4 | 1st oral visit Male (b) | COMPUTED | `=SUM(Quarterly!F{r},F{r+5},F{r+10},F{r+15})` — quarterly rollup |
| 5 | 1st oral visit Female (c) | COMPUTED | analogous SUM of `Quarterly!G` |
| 6 | A. Total (d) | COMPUTED | `col[4] + col[5]` |
| 7 | A. Percentage (e) | COMPUTED | `col[6] / col[3]` |

**Sheet: `Quarterly_1`** (indices 0-based, A=0 … V=21)
| Idx | Label | Type | Formula | Note |
|---|---|---|---|---|
| 0 | PSGC 10 | META | — | |
| 1 | Areas (Regions) | META | — | |
| 2 | Region/PHIC | META | — | |
| 3 | Age Group | META (row dimension) | — | 8 values, see above |
| 4 | Quarter | META (row dimension) | — | "1st Quarter"…"4th Quarter" |
| 5 | Projected Population (a) | RAW | — | |
| 6 | 1. First Visit (Facility) Male (b) | RAW | — | |
| 7 | 1. First Visit (Facility) Female (c) | RAW | — | |
| 8 | A. Total (d) | COMPUTED | `col[6]+col[7]` | |
| 9 | % (e) | COMPUTED (template) | `=IFERROR(col[8]/col[5],0)` | Correct formula |
| 10 | 1a. First Visit (Non-facility) Male (f) | RAW | — | |
| 11 | 1a. First Visit (Non-facility) Female (g) | RAW | — | |
| 12 | A. Total (h) | COMPUTED | `col[10]+col[11]` | |
| 13 | % (i) | COMPUTED (template) | `=IFERROR(col[12]/col[9],0)` | Formula bug — divides by the previous *percentage* column (idx 9), not by population (idx 5). See Flag 2. |
| 14 | 2. Completed 2 Visits (Facility) Male (j) | RAW | — | |
| 15 | 2. Completed 2 Visits (Facility) Female (k) | RAW | — | |
| 16 | A. Total (l) | COMPUTED | `col[14]+col[15]` | |
| 17 | % (m) | COMPUTED (template) | `=IFERROR(col[16]/col[13],0)` | Same bug — divides by prior % (idx 13). |
| 18 | 2a. Completed 2 Visits (Non-facility) Male (n) | RAW | — | |
| 19 | 2a. Completed 2 Visits (Non-facility) Female (o) | RAW | — | |
| 20 | A. Total (p) | COMPUTED | `col[18]+col[19]` | |
| 21 | % (q) | COMPUTED (template) | `=IFERROR(col[20]/col[17],0)` | Same bug — divides by prior % (idx 17). |

No Remarks/DQC columns present here either.

**Sheet: `Annual_1`** (A=0 … U=20; no Quarter column, so everything shifts left by 1 vs `Quarterly_1`)
| Idx | Label | Type | Formula | Note |
|---|---|---|---|---|
| 0–2 | PSGC / Areas / Region | META | — | |
| 3 | Age Group | META (row dim) | — | |
| 4 | Projected Population (a) | RAW (province) / COMPUTED (NIR) | — | |
| 5–6 | First Visit (Facility) M/F (b,c) | COMPUTED | `=SUM(Quarterly_1!G{r},G{r+40},G{r+80},G{r+120})` (and col H analog) | Rolled up from the 4 quarter blocks in `Quarterly_1` |
| 7 | A.Total (d) | COMPUTED | `col[5]+col[6]` | |
| 8 | % (e) | COMPUTED | `col[7]/col[4]` | Correct |
| 9–10 | First Visit (Non-facility) M/F (f,g) | COMPUTED | rollup of `Quarterly_1!K/L` | |
| 11 | A.Total (h) | COMPUTED | `col[9]+col[10]` | |
| 12 | % (i) | COMPUTED | `=IFERROR(col[11]/col[8],0)` | Same cascading bug — divides by % (idx 8), not population (idx 4). |
| 13–14 | Completed 2 Visits (Facility) M/F (j,k) | COMPUTED | rollup of `Quarterly_1!O/P` | |
| 15 | A.Total (l) | COMPUTED | `col[13]+col[14]` | |
| 16 | % (m) | COMPUTED | `=IFERROR(col[15]/col[12],0)` | Same bug. |
| 17–18 | Completed 2 Visits (Non-facility) M/F (n,o) | COMPUTED | rollup of `Quarterly_1!S/T` | |
| 19 | A.Total (p) | COMPUTED | `col[17]+col[18]` | |
| 20 | % (q) | COMPUTED | `=IFERROR(col[19]/col[16],0)` | Same bug. |

### Proposed Raw Inputs to Store
**Infant table (`Quarterly`/`Annual`):**
1. Projected Population 0-11 months
2. 1st oral visit Male
3. 1st oral visit Female
→ 3 raw inputs per location per period.

**General-population table (`Quarterly_1`/`Annual_1`), per age-group row:**
1. Projected Population (age-band specific)
2. First Visit Facility Male / Female
3. First Visit Non-facility Male / Female
4. Completed 2 Visits Facility Male / Female
5. Completed 2 Visits Non-facility Male / Female
→ 9 raw inputs per location per age group per period (× 8 age groups = 72 raw values per location per period).

### DQC Rules Found in the File
**None.** No Remarks column, no over-threshold flag column, no sequence-check column anywhere in this workbook (unlike every previously documented file, which all had at minimum a "DQC Over 100%/200%" column). This is a first for this file group.

Reasonable DQC rules the dashboard would need to define itself (none exist in the template to copy):
- Over-threshold check on all 4 percentage indicators (probably 200%, matching the population-denominator convention used elsewhere), applied per age group/quarter.
- Logical check: Completed-2-Visits total ≤ First-Visit total (can't complete a 2nd visit without a 1st) — facility and non-facility separately. Not present in the template at all.

### Flags / Open Questions

**FLAG 1 (Highest priority) — File structure is incompatible with the current parser's row/period model.**
The parser (per `adding_templates.md` and `parser.py`) assumes: one sheet = one period (via `sheet_map`), and one row = one location for that period (PSGC scanned top-to-bottom once). This file breaks both assumptions:
- `Quarterly` and `Quarterly_1` stack **all 4 quarters into a single sheet** (Quarter is a row value, not a sheet name) — the same PSGC repeats 4×.
- `Quarterly_1` and `Annual_1` additionally stack **8 age groups as repeating row blocks** for the same PSGC.
- `parser.py`'s `columns` config is a flat, static index→indicator_code map applied identically to every row of a sheet read; it has no concept of a "row group" column (Age Group / Quarter) that should change which indicator_code a given column index maps to. As written today, if this file were ingested with a naive config, every age-group row for a location/quarter would resolve to the *same* indicator codes and silently overwrite each other in storage (last age group parsed wins).
- There's an `extra_sheets` mechanism in `parser.py`, but it processes an additional sheet in parallel for the *same* selected period/row range — it does not filter rows by a column value, so it doesn't solve this either.

This needs an actual architecture decision before a config can be written: either (a) extend the parser to support a `row_group_column` (e.g. col 3 "Age Group" and/or col 4 "Quarter") whose value is appended to the indicator_code or used to select a row-filter per virtual "sub-template," or (b) add a generic `row_filter: {column, equals}` to `sheet_map`/config entries so each age-group (and for `Quarterly`, each quarter) is modeled as its own filtered read against the same physical sheet. Neither exists today.

**FLAG 2 — Cascading percentage-formula bug in `Quarterly_1` and `Annual_1` (all rows, not a one-off typo).**
Percentage columns 2, 3, and 4 in the "chain" (idx 13/17/21 in `Quarterly_1`; idx 12/16/20 in `Annual_1`) each divide by the *previous percentage cell* instead of by the population column. Verified against cached values: e.g. `Quarterly_1` row 2 cached "% i" = **236,957.3** (23.7 million percent) because it computed `Total(1820) / previous%(0.0077)` instead of `Total / Population(389,938)`. This is far more severe than earlier single-cell template bugs found in other programs (VitA supplementation, IPV) because it silently corrupts 3 of 4 percentage columns across every single row of two entire sheets. Confirms the standing design rule (from the Nutrition section of `fhsis_template_analysis.md`): the system must always recompute percentages from raw inputs via the config formula and never trust the Excel-computed value — this file is the strongest evidence yet for that rule. The `Quarterly`/`Annual` (infant) sheets do NOT have this bug — their single percentage column is correctly `Total/Population`.

**FLAG 3 — Geographic granularity is coarser than other programs.**
Only 5 rows (region + 3 provinces + Bacolod HUC) vs. the 129-row region→province→city/municipality→barangay pattern seen in Immunization/Nutrition/Management-of-Sick. No city/municipality or barangay-level oral health data exists in this file. Confirm with the encoder whether OHC data is genuinely only collected at province/HUC level, or whether municipality-level detail exists in a version not yet uploaded.

**FLAG 4 — "Population" denominator for the 3 pregnant-women age bands looks like it may actually be general female population, not an estimated-pregnancies figure.**
Example (Negros Occidental, Q1): `10-19 years old` general population = 548,754; the two pregnant sub-bands that partition that same age range are `10-14 (pregnant)` = 136,938 and `15-19 (pregnant)` = 128,966, summing to 265,904 — almost exactly half of 548,754 (i.e., roughly the female share of that age range). An actual **estimated-pregnancies** denominator for a region this size would normally be in the thousands, not ~137,000. This strongly suggests the "Projected Population" column for the pregnant-labeled age bands is really the general female population of that age bracket (reused/copied), not a pregnancy estimate — which would make any coverage percentage calculated against it artificially tiny and not meaningful as "% of pregnant women who got an oral visit." Needs confirmation from the data owner/encoder before deciding the denominator_source for these 3 age bands.

**FLAG 5 — No combined "any first visit" / "any completed 2 visits" total.**
The template only tracks Facility and Non-facility as separate parallel counts (with the divide-error percentages noted in Flag 2); there's no grand total column (facility + non-facility) for either indicator group. If the dashboard wants a single "% of population with completed first oral visit," it will need to be defined as a new computed indicator (`facility_total + non_facility_total`) not present in the template.

**FLAG 6 — Missing logical DQC: Completed 2 Visits should never exceed First Visit.**
No check exists (template or otherwise) ensuring `Completed 2 Visits total ≤ First Visit total`, per facility/non-facility, per age band, per quarter. Worth adding as a config-level DQC rule since it's a hard logical constraint (you can't complete a 2nd visit without a 1st).

**FLAG 7 — No file number in the filename.**
Every other analyzed program's files (Immunization, Nutrition, Management of Sick, SBI) carry a leading file number (`1_`, `4_`, `9_`, etc.) referenced consistently across `memory-bank/fhsis_template_analysis.md`. This Oral Health file has no numeric prefix. Confirm with the encoder what file number(s) this occupies in the Oral Health program's official file list, and whether other Oral Health files (e.g., an M1-style summary, or a file for a different sub-population) are still pending upload.

**FLAG 8 (minor) — RBAC/sensitivity check.**
Per `CLAUDE.md`, only HIV-reactive and Syphilis-reactive indicators require the extra sensitive-indicator RBAC flag. Nothing in this file (oral/dental visit counts) meets that criterion — no `is_sensitive` flag needed for any indicator in this file.

---

## Summary

I inspected `ohc_1st_visit_completed_2_visits_nir.xlsx` (`backend/data/ORAL_HEALTH/`). It has 5 tabs: `Quarterly`/`Annual` (simple — infants 0–11m, first oral visit only) and `Quarterly_1`/`Annual_1` (complex — 8 age bands from 1-4y through 3 pregnant-women brackets, tracking First Visit and Completed-2-Visits, each split facility/non-facility). Only 5 geographic rows exist per period (region + 3 provinces + Bacolod HUC) — no city/municipality/barangay breakdown, unlike prior programs. There is no Remarks/DQC column anywhere in the file.

Biggest flags: (1) the file stacks quarters and age groups as repeating rows within single sheets rather than as separate sheets/columns — this breaks the current parser's one-sheet-per-period, one-row-per-location assumptions and needs an architecture decision before a config can be written; (2) a cascading formula bug in `Quarterly_1`/`Annual_1` makes 3 of 4 percentage columns divide by the previous percentage instead of by population, producing cached values over 23-million-percent; (3) the "population" denominator for the 3 pregnant-women age bands looks like it's actually general female population, not an estimated-pregnancies count.
