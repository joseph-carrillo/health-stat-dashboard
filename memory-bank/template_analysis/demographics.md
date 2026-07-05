# FHSIS Template Analysis — Addendum
## Program: Demographics (top-level program folder `DEMOGRAPHICS`, not nested under Child Care)

---

## File 1: `Demographics_nir.xlsx`
**Tracks:** Health facility density (barangays, health centers, BHS) and health workforce staffing, both expressed as population-to-resource ratios — NOT vaccination/service coverage.

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| `BGY & BHS` | Data | Barangay count + health center/BHS facility counts |
| `Health Workers` | Data | Doctors/Nurses/Midwives/etc. headcounts + BHW |
| `change_log` | Admin | Version history — NOT imported. Contains one boilerplate sample row referencing `Annual - Sheet, E1643`, which does not correspond to any real row in this file (max data row is 6) — this is clearly a template placeholder, not a real change record. |

**Frequency: Neither monthly, quarterly, nor annual tabs exist.** This is a **single-snapshot/reference file** — one live value per location per column, presumably re-uploaded/replaced whenever the source counts change (most likely annually, given the "2026 Projected Population" and "2025 Projected No. of Households" labels). There is **no Population reference sheet** either — population is embedded directly as a column in both data sheets.

**Rows per sheet:** Excel dimensions report `max_row = 206`, but only **rows 2–6 (5 data rows) are populated**; rows 7–206 are entirely empty (no values, no formulas) despite being inside the declared sheet dimension and outside the conditional-formatting ranges (which stop at row 6). This confirms the blank rows are leftover formatting bleed, not missing municipality/barangay data — **the template is intentionally scoped to Region + Province + HUC only.**

**Columns per sheet:** 15 (`BGY & BHS`), 41 (`Health Workers`). Both report `max_column` slightly higher (22 / 48) but the extra trailing columns are entirely `None` (formatting artifacts, not real columns).

### Geographic Levels Present
- Region (NIR) — row 2, **fully computed** (`=SUM(row3:row6)` for every single column — population, counts, everything). There is no independently-entered regional value anywhere in this file.
- Province (Negros Occidental, Negros Oriental, Siquijor) — rows 3–5, raw entry
- City of Bacolod (HUC) — row 6, raw entry
- **No City/Municipality rows. No Barangay rows.** This is a structural departure from every Immunization/Nutrition/SBI file previously documented (all of which had 129 rows down to municipality/barangay level). Facility and workforce headcounts here are apparently reported at Provincial/HUC Health Office level only.

### Age/Sex/Other Disaggregation
- **No age-group disaggregation** (not applicable — these are facility and staffing counts, not service-delivery-by-age indicators).
- **No Male/Female disaggregation** — the only disaggregation present in `Health Workers` is **employment source**: "LGU Hired" vs "DOH Hired" per profession, rolled up into a Total. This is a new disaggregation type not seen in any previously documented file.
- `BGY & BHS` has no disaggregation at all beyond the Number/Ratio pair per facility type.

### Column Inventory

#### Sheet: `BGY & BHS` (15 columns)
| Col | Label (cleaned) | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region, Province/City | META | — |
| 2 | Projected Population 2026 | RAW (province/HUC rows); COMPUTED rollup for region row (`SUM(C3:C6)`) | — |
| 3 | A. Barangay (Number) | RAW | — |
| 4 | A. Barangay (Ratio) | COMPUTED | `col[2] / col[3]` (Population per Barangay) |
| 5 | B. Municipal Health Centers (Number) | RAW | — |
| 6 | B. Municipal Health Centers (Ratio) | COMPUTED | `col[2] / col[5]` |
| 7 | B. City Health Centers (Number) | RAW | — |
| 8 | B. City Health Centers (Ratio) | COMPUTED | `col[2] / col[7]` |
| 9 | B. Rural Health Units (Number) | RAW | — |
| 10 | B. Rural Health Units (Ratio) | COMPUTED | `col[2] / col[9]` |
| 11 | B. TOTAL Health Centers (Number) | COMPUTED | `SUM(col[5], col[7], col[9])` |
| 12 | B. TOTAL Health Centers (Ratio) | COMPUTED | `col[2] / col[11]` |
| 13 | C. Barangay Health Stations (BHS) (Number) | RAW | — |
| 14 | C. Barangay Health Stations (BHS) (Ratio) | COMPUTED | `col[2] / col[13]` |

**No Remarks column, and no explicit "DQC" columns at all** — a first among all files documented so far. See DQC notes below for what actually exists instead.

#### Sheet: `Health Workers` (41 columns)
| Col | Label (cleaned) | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region, Province/City | META | — |
| 2 | Projected Population 2026 | RAW/COMPUTED rollup (same pattern as above) | — |
| 3 | A. Doctors (LGU Hired) | RAW | — |
| 4 | A. Doctors (DOH Hired) | RAW | — |
| 5 | A. Doctors (Total) | COMPUTED | `col[3]+col[4]` |
| 6 | A. Doctors (Ratio) | COMPUTED | `col[2]/col[5]` (Population per doctor) |
| 7 | B. Nurses (LGU Hired) | RAW | — |
| 8 | B. Nurses (DOH Hired) | RAW | — |
| 9 | B. Nurses (Total) | COMPUTED | `col[7]+col[8]` |
| 10 | B. Nurses (Ratio) | COMPUTED | `col[2]/col[9]` |
| 11 | C. Midwives (LGU Hired) | RAW | — |
| 12 | C. Midwives (DOH Hired) | RAW | — |
| 13 | C. Midwives (Total) | COMPUTED | `col[11]+col[12]` |
| 14 | C. Midwives (Ratio) | COMPUTED | `col[2]/col[13]` |
| 15 | D. Dentists (LGU Hired) | RAW | — |
| 16 | D. Dentists (DOH Hired) | RAW | — |
| 17 | D. Dentists (Total) | COMPUTED | `col[15]+col[16]` |
| 18 | D. Dentists (Ratio) | COMPUTED | `col[2]/col[17]` |
| 19 | E. Medical Technologists (LGU Hired) | RAW | — |
| 20 | E. Medical Technologists (DOH Hired) | RAW | — |
| 21 | E. Medical Technologists (Total) | COMPUTED | `col[19]+col[20]` |
| 22 | E. Medical Technologists (Ratio) | COMPUTED | `col[2]/col[21]` |
| 23 | F. Nutritionists (LGU Hired) | RAW | — |
| 24 | F. Nutritionists (DOH Hired) | RAW | — |
| 25 | F. Nutritionists (Total) | COMPUTED | `col[23]+col[24]` |
| 26 | F. Nutritionists (Ratio) | COMPUTED | `col[2]/col[25]` |
| 27 | G. Sanitary Engineers (LGU Hired) | RAW | — |
| 28 | G. Sanitary Engineers (DOH Hired) | RAW | — |
| 29 | G. Sanitary Engineers (Total) | COMPUTED | `col[27]+col[28]` |
| 30 | G. Sanitary Engineers (Ratio) | COMPUTED | `col[2]/col[29]` |
| 31 | H. Sanitary Inspectors (LGU Hired) | RAW | — |
| 32 | H. Sanitary Inspectors (DOH Hired) | RAW | — |
| 33 | H. Sanitary Inspectors (Total) | COMPUTED | `col[31]+col[32]` |
| 34 | H. Sanitary Inspectors (Ratio) | COMPUTED | `col[2]/col[33]` |
| 35 | 2025 Projected No. of Households | RAW | Year mismatch — see flags |
| 36 | I. Active BHW (LGU Hired) | RAW | — |
| 37 | I. Active BHW (DOH Hired) | RAW | — |
| 38 | I. Active BHW (Total) | COMPUTED | `col[36]+col[37]` |
| 39 | I. Active BHW (Ratio) | COMPUTED | `col[35]/col[38]` — **denominator is Households (col 35), not Population (col 2)** |
| 40 | Remarks | META | — |

### Age/Sex/Other Disaggregation (recap)
LGU-Hired vs DOH-Hired vs Total, for 9 professions (Doctors, Nurses, Midwives, Dentists, Med Techs, Nutritionists, Sanitary Engineers, Sanitary Inspectors, BHWs). No age or sex split anywhere in this file.

### DQC Notes (no explicit DQC columns — implemented purely via conditional formatting)
Unlike every other file documented (which had labeled `DQC Over 100%/200%` columns), this file has **zero DQC label columns**. The only quality signals are Excel conditional-formatting rules (both use the same red fill `FFC7CE`):

1. **Blank-cell highlight** — `containsBlanks` rule over the entire raw-entry data block (`C2:O6` in `BGY & BHS`, `C2:AN6` in `Health Workers`). Flags incomplete data entry, not a math check.
2. **"Greater than 1" highlight** on Ratio columns:
   - `BGY & BHS`: applied to **only one** ratio column — `I2:I6` (col 8, "City Health Centers Ratio"). The other 5 ratio columns (Barangay, Municipal HC, Rural HU, Total HC, BHS) have **no such rule** — inconsistent coverage.
   - `Health Workers`: applied to **all 9** ratio columns (`G,K,O,S,W,AA,AE,AI,AN` → cols 6,10,14,18,22,26,30,34,39).
   - **This rule is almost certainly broken/meaningless as written.** Every ratio here is `Population ÷ small facility-or-staff count`, so the result will be in the thousands/tens-of-thousands for any real location — it will *always* be `> 1`, making the highlight fire unconditionally. This looks like an un-configured Excel default threshold (Excel's "Greater Than" conditional format defaults to comparing against `1`) that was never replaced with a real DOH staffing/facility standard (e.g., population-per-doctor target ratios per DOH Human Resource for Health standards). Needs confirmation with the data owner — as-is, it is not a usable DQC threshold and the parser config should almost certainly define its own more meaningful bounds (or omit this rule) rather than port it over.

### Raw Inputs to Store

**`BGY & BHS`:**
1. Projected Population 2026 (province/HUC rows only — region row is a rollup)
2. Barangay Count
3. Municipal Health Centers Count
4. City Health Centers Count
5. Rural Health Units Count
6. Barangay Health Stations (BHS) Count

**Total raw inputs: 6 per location**

**`Health Workers`:**
1. Projected Population 2026
2. 2025 Projected No. of Households
3–20. LGU-Hired and DOH-Hired counts for each of 9 professions (Doctors, Nurses, Midwives, Dentists, Med Techs, Nutritionists, Sanitary Engineers, Sanitary Inspectors, BHW) = 18 raw values

**Total raw inputs: 20 per location**

### Confirmation: No Percentage/Rate Indicators
Confirmed by inspecting cell `number_format` on every "Ratio" column — all are plain `#,##0` (integer/decimal number format), **never** `0%` or `0.0%`. There is no percentage-type indicator anywhere in this file. Every derived value is a **ratio expressed as "units of denominator per 1 unit of resource"** (e.g., population per doctor, population per barangay, households per BHW) — conceptually a **density/adequacy ratio**, not a coverage rate bounded by 0–100%.

**Display implications:**
- These indicators should **not** be rendered with a percentage gauge/progress-bar widget (the pattern used for `_PCT` indicators in Coverage/Trends pages), since values routinely run into the thousands and have no natural 100% ceiling.
- They read more naturally as a **"1 : N" ratio** (e.g., "1 doctor : 12,450 population") or as a plain rate stat tile, ideally benchmarked against a DOH staffing/facility standard (a target ratio) rather than against a 100%/200% threshold.
- The existing `formula_type = 'percentage'` / `_PCT` suffix convention (from `adding_templates.md`) doesn't fit this program. A new `formula_type` (e.g., `'ratio'` or `'per_capita'`) and a differently-suffixed indicator code convention (e.g., `_RATIO` instead of `_PCT`) will likely be needed, along with a `denominator_source` that in one case (BHW) is **Households**, not Population — a 6th distinct denominator type beyond the `D1–D4` registry already established in `fhsis_template_analysis.md` (Projected Population, Facility Seen, Live Births, Condition Count) and the 5th added for SBI (Enrolled Learners).
- `dqc_rules` for this template should almost certainly be **new thresholds against real DOH staffing/facility norms**, not a ported-over "over 100%/200%" rule (which doesn't apply to unbounded ratios) — see the "greater than 1" flag above.

### Flags / Open Questions — File `Demographics_nir.xlsx`

**FLAG D-1 — Two unrelated indicator domains in one workbook, no shared per-sheet time axis.** `BGY & BHS` (facility density) and `Health Workers` (staffing density) are two structurally independent indicator sets sharing only PSGC/location/population columns. Recommend two separate template configs (e.g., `demo_facilities.json`, `demo_health_workforce.json`) both pointing at the same source file, one per sheet — the existing recipe's `sheet_map` (built for month→sheet mapping) doesn't naturally fit a case with no month axis at all; each config would just point `sheet_map` at a single fixed sheet name.

**FLAG D-2 — No time-series structure at all.** No monthly/quarterly/annual tabs, no Population reference sheet. This appears to be a periodically-replaced snapshot (most likely annual, based on "2026"/"2025" year labels in the column headers) rather than a report filed on a recurring cadence like the vaccine/nutrition files. Needs confirmation: how often is this file re-uploaded, and does re-upload fully replace the prior snapshot, or do prior snapshots need to be retained as historical periods (e.g., "2026 staffing levels" vs "2025 staffing levels")?

**FLAG D-3 — Year mismatch between Population (2026) and Households (2025) in the same `Health Workers` sheet.** The BHW ratio's denominator (Households) is a full year older than every other denominator (Population) in the same row. This mirrors the "2026 population not yet available, using 2025" pattern seen in Immunization File 4 — but here there is no explanatory note anywhere in the file. Needs confirmation this is intentional/current-best-available data and not a stale reference.

**FLAG D-4 — Region (NIR) row is 100% computed, with zero raw entry.** Every single column at the region level is a `SUM()` rollup of the 3 province + 1 HUC rows beneath it. There is no independent regional data entry point in this file at all (contrast with province/HUC rows, which are raw-entry cells). Parser should treat the region row purely as a display-time recomputation, never a stored raw value.

**FLAG D-5 — Geographic granularity stops at Province/HUC — no Municipality or Barangay rows.** This is a real structural break from every other FHSIS file documented (all go to 129 rows, down to barangay level under HUCs). Confirm with the data owner whether this is by design (facility/workforce headcounts are only tracked at the provincial/city health office level) or whether a fuller municipality-level version of this template exists elsewhere that wasn't provided.

**FLAG D-6 — `BGY & BHS` sheet has no Remarks column and no DQC columns whatsoever.** Every other file documented has at least a Remarks + DQC column block near the end. This sheet ends abruptly at column 14 (BHS Ratio). Confirm this omission is intentional.

**FLAG D-7 — The conditional-format "greater than 1" rule is inconsistently applied** (only 1 of 7 ratio columns in `BGY & BHS`, vs all 9 of 9 in `Health Workers`) **and appears to always evaluate true** given realistic ratio magnitudes (thousands of population per single facility/worker). Very likely a template artifact from an un-configured Excel default rather than an intentional DQC threshold — do not port this literally into `dqc_rules`; ask the data owner what the real target ratios should be (DOH has published staffing standards, e.g., population-per-doctor targets) before defining a meaningful threshold.

**FLAG D-8 — Duplicate Population column across both sheets.** Both `BGY & BHS` and `Health Workers` carry their own "Projected Population 2026" column with (presumably) identical values per location, same redundancy pattern already flagged in `fhsis_template_analysis.md` for the Immunization files. Same schema decision applies here: one central population reference vs. per-sheet duplication.

---

## Summary

`Demographics_nir.xlsx` (program: Demographics, top-level folder) tracks health infrastructure and workforce *density*, not service coverage — two sheets: `BGY & BHS` (barangay/health-center/BHS counts, 15 cols) and `Health Workers` (9 professions × LGU/DOH-hired split + BHW, 41 cols). Confirmed: **no percentage indicators exist** — all derived values are population-per-resource (or households-per-BHW) ratios formatted as plain numbers, so they need a ratio/stat-tile display treatment, not percentage gauges, plus a new `formula_type`/denominator convention in the schema.

Biggest flags: (1) only 5 geographic rows (Region/3 Provinces/1 HUC) — no municipality/barangay data, a real structural break from every other file; (2) no time-series tabs at all (single snapshot, unclear refresh cadence); (3) the file's only "DQC" is Excel conditional formatting flagging ratio > 1, which is inconsistently applied and effectively always true — not a usable threshold as-is; (4) a year mismatch (2026 population vs. 2025 households) feeding the BHW ratio; (5) two unrelated indicator domains bundled in one workbook with no shared sheet_map axis, likely needing two separate parser configs.
