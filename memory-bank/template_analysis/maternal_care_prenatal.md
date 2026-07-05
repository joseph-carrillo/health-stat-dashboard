# FHSIS Template Analysis — Program: Maternal Care > Prenatal (8 files)

**Location analyzed:** `backend/data/MATERNAL_CARE/Prenatal/` — actual on-disk filenames have a numeric prefix (`1. pre_8anc_nir.xlsx`, `2. pre_nutritional_status_bmi_nir.xlsx`, etc. — note the `N. ` prefix with a space, unlike the task's plain names).

**Method:** Read every sheet with pandas (header rows + first few data rows), cross-checked every "confusing" percentage/DQC column against the actual stored Excel formula via `openpyxl` (not just the header text or computed value), and read each file's own `change_log` tab, per the project rule that header labels cannot be trusted (`adding_templates.md`) and that computed values must be re-derived by the parser, never trusted as-is.

**Program code:** `MATERNAL_CARE` already exists in `backend/app/core/seed_programs.slq`. No indicators for it exist yet in `seed_indicators.py`.

**RBAC / Sensitive Indicators check:** None of these 8 files contain HIV or Syphilis reactive-case data (per `memory-bank/CLAUDE.md` → "Sensitive Indicators"). No `is_sensitive = TRUE` flags are needed for this file group.

---

## Cross-File Structural Notes (read this first)

1. **No monthly sheets anywhere in this group.** All 8 files are **Quarterly + Annual only** (`Q1–Q4` + `Annual`, or `Q1a…Annual_1a` + `Q1b…Annual_1b` for File 8). `frequency` in every config should be `"quarterly"`.
2. **No dedicated Population reference sheet in any of the 8 files.** Where a population denominator exists, it is a plain column inside the data sheet itself, not a separate tab. Confirmed via `openpyxl` `sheet_state` — no hidden sheets either.
3. **`Annual` is a derived rollup, not independently entered data.** Verified via actual formulas: per‑location cells in `Annual` are `=SUM('Q1'!X,'Q2'!X,'Q3'!X,'Q4'!X)`; the region/province subtotal rows within any sheet (including `Annual`) are same-sheet `=SUM(row_range)`. `Annual` does not need to be ingested as new raw data.
4. **Test data is only populated in Q1 across all 8 files.** Q2–Q4 are all zeros; `Annual` mirrors `Q1` exactly as a result. No DQC flag ever fires in the shipped data.
5. **Two different row-granularity patterns coexist in this group** — a real structural inconsistency:
   - **Municipality-level (68 rows):** File 1 (`8ANC`) and File 8 (`BP/HPN`) — Region → 3 Provinces → their municipalities/cities → City of Bacolod (HUC), no barangay breakdown. Same 68-location list in both files (verified identical).
   - **Province-rollup-only (5 data rows):** Files 2–7 (BMI, Td, Supplementation, Anemia, GD Screening, Deworming) — only Region (NIR) + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod (HUC). No individual municipality rows at all.
   - `data_start_row`/expected row counts and `stop_at_blank_psgc` behavior must be configured per-file; a parser assuming 68 (or 129, as in Immunization) rows for every Prenatal file will silently truncate or over-read Files 2–7.
6. **Meta-column layout differs by file:**
   - File 1: 2 meta columns — `col0` PSGC, `col1` location name (no redundant column).
   - Files 2–8: 3 meta columns — `col0` PSGC, `col1` a constant "NIR" placeholder (labeled "Areas (Regions)" in 2–7, "Region" in File 8) that carries no real information for every single row, `col2` the actual location name (labeled "Region/PHIC" in 2–7, "Region, Province/City, Municipality" in File 8).
   - `psgc_column` = 0 for all 8. `location_column` = 1 for File 1, but = 2 for Files 2–8.
7. **A shared "Projected Population (Under 1)" denominator column appears identically across Files 2, 3, 4, 5, 6, 7** — same literal value (93,988 for NIR; 52,678 for Negros Occidental; etc. — verified identical across all six files). This is the single biggest open question for this group — see Flag P below.
8. **Template-fix track record is inconsistent across this group** — 3 of 8 `change_log` tabs record an actual formula/label bug that was found and fixed by the region; 1 of those fixes (File 6, the file this task specifically flags) was evidently applied to the underlying formula without updating the header text or logging the change.

---

## File 1: `1. pre_8anc_nir.xlsx`
**Tracks:** Women who delivered and were tracked for the full prenatal course, and completion of at least 8 ANC (Antenatal Care) visits, by resident/trans-in/trans-out status, broken out by 3 maternal age brackets (10-14, 15-19, 20-49).

### Sheet Structure
| Sheet | Type |
|---|---|
| Q1–Q4 | Quarterly data |
| Annual | Computed rollup (`=SUM('Q1'!x,'Q2'!x,'Q3'!x,'Q4'!x)` per cell) |
| change_log | Admin — not imported |

**Frequency:** Quarterly + Annual. **Rows:** 68 (Region + 3 provinces + their municipalities + Bacolod HUC — no barangays). **Columns:** 38.

### Age Groups
10-14, 15-19, 20-49 years — same 3 brackets used in every file in this group.

### Column Inventory
| Col (0-based) | Label (raw text) | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META (`psgc_column`) | — |
| 1 | Region, Province/City, Municipality | — | META (`location_column`) | — |
| 2 | (a) Delivered & tracked, Resident, 10-14 | `PRE_8ANC_RESIDENT_10_14` | RAW | — |
| 3 | (b) …15-19 | `PRE_8ANC_RESIDENT_15_19` | RAW | — |
| 4 | (c) …20-49 | `PRE_8ANC_RESIDENT_20_49` | RAW | — |
| 5 | A. Total = (a)+(b)+(c) | `PRE_8ANC_RESIDENT_TOTAL` | COMPUTED | col2+col3+col4 |
| 6 | (d) Trans-in, 10-14 | `PRE_8ANC_TRANSIN_10_14` | RAW | — |
| 7 | (e) …15-19 | `PRE_8ANC_TRANSIN_15_19` | RAW | — |
| 8 | (f) …20-49 | `PRE_8ANC_TRANSIN_20_49` | RAW | — |
| 9 | B. Total | `PRE_8ANC_TRANSIN_TOTAL` | COMPUTED | col6+col7+col8 |
| 10 | (g) Trans-out (with MOV) before completing 8ANC, 10-14 | `PRE_8ANC_TRANSOUT_10_14` | RAW | — |
| 11 | (h) …15-19 | `PRE_8ANC_TRANSOUT_15_19` | RAW | — |
| 12 | (i) …20-49 | `PRE_8ANC_TRANSOUT_20_49` | RAW | — |
| 13 | C. Total | `PRE_8ANC_TRANSOUT_TOTAL` | COMPUTED | col10+col11+col12 |
| 14 | (j) Total tracked, 10-14 "(A+B)" | `PRE_8ANC_TRACKED_10_14` | COMPUTED | col2+col6 (per-bracket, NOT col5+col9 — see flag) |
| 15 | (k) …15-19 | `PRE_8ANC_TRACKED_15_19` | COMPUTED | col3+col7 |
| 16 | (l) …20-49 | `PRE_8ANC_TRACKED_20_49` | COMPUTED | col4+col8 |
| 17 | I. Total | `PRE_8ANC_TRACKED_TOTAL` | COMPUTED | col14+col15+col16 |
| 18 | (m) Given 1st-8th ANC on schedule, resident, 10-14 | `PRE_8ANC_ONSCHED_10_14` | RAW | — |
| 19 | (n) …15-19 | `PRE_8ANC_ONSCHED_15_19` | RAW | — |
| 20 | (o) …20-49 | `PRE_8ANC_ONSCHED_20_49` | RAW | — |
| 21 | D. Total | `PRE_8ANC_ONSCHED_TOTAL` | COMPUTED | col18+col19+col20 |
| 22 | (p) Completed ≥8ANC, trans-in, 10-14 | `PRE_8ANC_TRANSIN_DONE_10_14` | RAW | — |
| 23 | (q) …15-19 | `PRE_8ANC_TRANSIN_DONE_15_19` | RAW | — |
| 24 | (r) …20-49 | `PRE_8ANC_TRANSIN_DONE_20_49` | RAW | — |
| 25 | E. Total | `PRE_8ANC_TRANSIN_DONE_TOTAL` | COMPUTED | col22+col23+col24 |
| 26 | (s) Total completed ≥8ANC, 10-14 "(D+E)" | `PRE_8ANC_COMPLETED_10_14` | COMPUTED | col18+col22 (per-bracket sum, NOT col21+col25) |
| 27 | % s/j*100 | `PRE_8ANC_COMPLETED_10_14_PCT` | COMPUTED | col26 / col14 |
| 28 | (t) …15-19 | `PRE_8ANC_COMPLETED_15_19` | COMPUTED | col19+col23 |
| 29 | % t/k*100 | `PRE_8ANC_COMPLETED_15_19_PCT` | COMPUTED | col28 / col15 |
| 30 | (u) …20-49 | `PRE_8ANC_COMPLETED_20_49` | COMPUTED | col20+col24 |
| 31 | % u/l*100 | `PRE_8ANC_COMPLETED_20_49_PCT` | COMPUTED | col30 / col16 |
| 32 | II. Total = s+t+u | `PRE_8ANC_COMPLETED_TOTAL` | COMPUTED | col26+col28+col30 |
| 33 | % labeled "(I/II)*100" | `PRE_8ANC_COMPLETED_TOTAL_PCT` | COMPUTED | col32 / col17 (see flag — label is inverted) |
| 34-37 | DQC Over 100% (10-14 / 15-19 / 20-49 / Total) | — | DQC | flags each bracket's %, threshold 100% |

### DQC Rules
Over-100% check on each age-bracket completion percentage and the overall total (a "cannot complete more than were tracked" check).

### Flags / Open Questions — File 1
- **Label/formula direction bug (confirmed via arithmetic):** col 33's header text reads `(I/II)*100` but the stored value is actually `II/I*100` (Total Completed ÷ Total Tracked = 6485/10466 = 0.6196…, matching; `I/II` = 10466/6485 = 1.61… does not match). The parser must implement `COMPLETED_TOTAL / TRACKED_TOTAL`, ignoring the literal header text.
- **"(A+B)" / "(D+E)" shorthand is misleading at the per-bracket level.** The per-bracket "tracked" (col14/15/16) and "completed" (col26/28/30) columns are each bracket's own raw values added together (e.g. col14 = col2+col6), not Group-A-Total + Group-B-Total. Only the row Total columns (col17, col32) happen to equal TotalA + TotalB / TotalD + TotalE because summing across brackets is associative. A config author who literally reads "(A+B)" and wires col14 = col5 + col9 would double-count.
- **Trans-out women are not subtracted from the "tracked" denominator.** j/k/l (tracked) = Resident + Trans-in only; Trans-out counts (g/h/i) are captured as raw inputs but never subtracted anywhere in the file. Need to confirm with the DOH region whether this is intentional or a gap.
- **Change log confirms a label-only fix already occurred** (v1.1, "wrong column title" fixed for cols G–J and W–Z) — this file has already had at least one round of header-text correction; the values were apparently already right.

---

## File 2: `2. pre_nutritional_status_bmi_nir.xlsx`
**Tracks:** BMI (Body Mass Index) classification of pregnant women — Normal / Low / High — by maternal age bracket.

### Sheet Structure
Q1–Q4 + Annual + change_log. **Frequency:** Quarterly + Annual. **Rows:** 5 data rows (province-rollup granularity only). **Columns:** 22.

### Column Inventory
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | "Areas (Regions)" — always literal "NIR" | — | META (unused/redundant) | — |
| 2 | Region/PHIC (actual location name) | — | META (`location_column`) | — |
| 3 | Projected Population (Under 1) (a) | `PRE_BMI_POP` | RAW | — (see Flag P) |
| 4 | (b) Normal BMI 10-14 | `PRE_BMI_NORMAL_10_14` | RAW | — |
| 5 | (c) …15-19 | `PRE_BMI_NORMAL_15_19` | RAW | — |
| 6 | (d) …20-49 | `PRE_BMI_NORMAL_20_49` | RAW | — |
| 7 | Normal BMI Total (e) | `PRE_BMI_NORMAL_TOTAL` | COMPUTED | col4+col5+col6 |
| 8 | % e/a*100 | `PRE_BMI_NORMAL_PCT` | COMPUTED | col7/col3 |
| 9 | (g) Low BMI 10-14 | `PRE_BMI_LOW_10_14` | RAW | — |
| 10 | (h) …15-19 | `PRE_BMI_LOW_15_19` | RAW | — |
| 11 | (i) …20-49 | `PRE_BMI_LOW_20_49` | RAW | — |
| 12 | Low BMI Total (j) | `PRE_BMI_LOW_TOTAL` | COMPUTED | col9+col10+col11 |
| 13 | % j/a*100 | `PRE_BMI_LOW_PCT` | COMPUTED | col12/col3 |
| 14 | (l) High BMI 10-14 | `PRE_BMI_HIGH_10_14` | RAW | — |
| 15 | (m) …15-19 | `PRE_BMI_HIGH_15_19` | RAW | — |
| 16 | (n) …20-49 | `PRE_BMI_HIGH_20_49` | RAW | — |
| 17 | High BMI Total (o) | `PRE_BMI_HIGH_TOTAL` | COMPUTED | col14+col15+col16 |
| 18 | % o/a*100 | `PRE_BMI_HIGH_PCT` | COMPUTED | col17/col3 |
| 19 | DQC Normal BMI Over 100% | — | DQC | checks col8 |
| 20 | DQC "Low BMI" Over 100% | — | DQC | checks col13 |
| 21 | DQC "Low BMI" Over 100% (duplicate label) | — | DQC | checks col18 (verified via formula: `=IF(S2<=100,...)`, S2 = col18) |

### Flags — File 2
- **Confirmed template label error (verified via openpyxl formula inspection, functionally harmless):** column 21's header literally repeats "Low BMI" (should read "High BMI"). The underlying formula is wired correctly to the High BMI % cell, so this is a label-only bug, not a computation bug.
- All three % formulas here correctly use the population column (col3) as denominator, and their DQC formulas correctly reference the matching % cell — no denominator ambiguity in this file, unlike Files 5 and 6.
- Same shared-population Flag P applies (see below).

---

## File 3: `3. pre_td_vaccine_nir.xlsx`
**Tracks:** Tetanus-diphtheria (Td) vaccination status of pregnant women — Td (first pregnancy, ≥2 doses) and Td2+ (2nd+ pregnancy, ≥3 doses) — by maternal age bracket.

### Sheet Structure
Q1–Q4 + Annual + change_log. **Frequency:** Quarterly + Annual. **Rows:** 5 (province rollup). **Columns:** 28.

### Column Inventory
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | "Areas (Regions)" (always "NIR") | — | META (unused) | — |
| 2 | Region/PHIC | — | META (`location_column`) | — |
| 3 | Projected Population (Under 1) (a) | `PRE_TD_POP` | RAW | — |
| 4 | (b) Td (1st pregnancy, ≥2 doses) 10-14 | `PRE_TD1_10_14` | RAW | — |
| 5 | % b/a | `PRE_TD1_10_14_PCT` | COMPUTED | col4/col3 |
| 6 | (c) …15-19 | `PRE_TD1_15_19` | RAW | — |
| 7 | % c/a | `PRE_TD1_15_19_PCT` | COMPUTED | col6/col3 |
| 8 | (d) …20-49 | `PRE_TD1_20_49` | RAW | — |
| 9 | % d/a | `PRE_TD1_20_49_PCT` | COMPUTED | col8/col3 |
| 10 | (e) Total | `PRE_TD1_TOTAL` | COMPUTED | col4+col6+col8 |
| 11 | % e/a | `PRE_TD1_TOTAL_PCT` | COMPUTED | col10/col3 |
| 12 | (f) Td2+ (2nd+ pregnancy, ≥3 doses) 10-14 | `PRE_TD2PLUS_10_14` | RAW | — |
| 13 | % f/a | `PRE_TD2PLUS_10_14_PCT` | COMPUTED | col12/col3 |
| 14 | (g) …15-19 | `PRE_TD2PLUS_15_19` | RAW | — |
| 15 | % g/a | `PRE_TD2PLUS_15_19_PCT` | COMPUTED | col14/col3 |
| 16 | (h) …20-49 | `PRE_TD2PLUS_20_49` | RAW | — |
| 17 | % h/a | `PRE_TD2PLUS_20_49_PCT` | COMPUTED | col16/col3 |
| 18 | (i) Total | `PRE_TD2PLUS_TOTAL` | COMPUTED | col12+col14+col16 |
| 19 | % i/a | `PRE_TD2PLUS_TOTAL_PCT` | COMPUTED | col18/col3 |
| 20-27 | DQC Over 100% (b,c,d,e,f,g,h,i / a) | — | DQC | 8 columns, one per raw indicator's % |

### Flags — File 3
- Cleanest file in the group — all 8 percentage columns and all 8 DQC columns consistently use the population column (col3) as denominator, and change_log is empty (no fix history). No ambiguity found.
- Same shared-population Flag P applies.

---

## File 4: `4. pre_supplementation_nir.xlsx`
**Tracks:** Micronutrient supplementation of pregnant women — Iron with Folic Acid (IFA), Multiple Micronutrients (MM), Calcium Carbonate (CC) — by maternal age bracket.

### Sheet Structure
Q1–Q4 + Annual + change_log. **Frequency:** Quarterly + Annual. **Rows:** 5 (province rollup). **Columns:** 40 (largest in this group).

### Column Inventory
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | "Areas (Regions)" | — | META (unused) | — |
| 2 | Region/PHIC | — | META (`location_column`) | — |
| 3 | Projected Population (Under 1) (a) | `PRE_SUPP_POP` | RAW | — |
| 4,6,8,10 | IFA 10-14 / 15-19 / 20-49 / Total (b,c,d,e) | `PRE_IFA_10_14` … `PRE_IFA_TOTAL` | RAW/COMPUTED | Total = sum of 3 brackets |
| 5,7,9,11 | % each /a | `PRE_IFA_*_PCT` | COMPUTED | /col3 |
| 12,14,16,18 | MM 10-14 / 15-19 / 20-49 / Total (f,g,h,i) | `PRE_MM_10_14` … `PRE_MM_TOTAL` | RAW/COMPUTED | — |
| 13,15,17,19 | % each /a | `PRE_MM_*_PCT` | COMPUTED | /col3 |
| 20,22,24,26 | CC 10-14 / 15-19 / 20-49 / Total (j,k,l,m) | `PRE_CC_10_14` … `PRE_CC_TOTAL` | RAW/COMPUTED | — |
| 21,23,25,27 | % each /a | `PRE_CC_*_PCT` | COMPUTED | /col3 |
| 28-39 | DQC Over 100% × 12 (one per raw indicator's %) | — | DQC | — |

### Flags — File 4
- Structurally the "widest" but simplest file — 3 parallel indicator groups, identical 4-column-pair pattern each, all using col3 population as denominator consistently. change_log empty, no known fixes.
- Same shared-population Flag P applies.

---

## File 5: `5. pre_anemia_screening_nir.xlsx`
**Tracks:** Anemia screening (CBC/Hgb & Hct testing) and anemia diagnosis rate among pregnant women, by maternal age bracket.

### Sheet Structure
Q1–Q4 + Annual + change_log. **Frequency:** Quarterly + Annual. **Rows:** 5 (province rollup). **Columns:** 28.

### Column Inventory
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | "Areas (Regions)" | — | META (unused) | — |
| 2 | Region/PHIC | — | META (`location_column`) | — |
| 3 | Projected Population (Under 1) (a) | `PRE_ANEMIA_POP` | RAW | — |
| 4 | (b) Tested (CBC/Hgb-Hct), 10-14 | `PRE_ANEMIA_TESTED_10_14` | RAW | — |
| 5 | % b/a | `PRE_ANEMIA_TESTED_10_14_PCT` | COMPUTED | col4/col3 |
| 6 | (c) …15-19 | `PRE_ANEMIA_TESTED_15_19` | RAW | — |
| 7 | % c/a | `PRE_ANEMIA_TESTED_15_19_PCT` | COMPUTED | col6/col3 |
| 8 | (d) …20-49 | `PRE_ANEMIA_TESTED_20_49` | RAW | — |
| 9 | % d/a | `PRE_ANEMIA_TESTED_20_49_PCT` | COMPUTED | col8/col3 |
| 10 | (e) Total | `PRE_ANEMIA_TESTED_TOTAL` | COMPUTED | col4+col6+col8 |
| 11 | % e/a | `PRE_ANEMIA_TESTED_TOTAL_PCT` | COMPUTED | col10/col3 |
| 12 | (f) Diagnosed with anemia, 10-14 | `PRE_ANEMIA_POSITIVE_10_14` | RAW | — |
| 13 | % f/b*100 | `PRE_ANEMIA_POSITIVE_10_14_PCT` | COMPUTED | col12 / col4 (positive ÷ tested, same bracket — NOT ÷ population) |
| 14 | (g) …15-19 | `PRE_ANEMIA_POSITIVE_15_19` | RAW | — |
| 15 | % g/c*100 | `PRE_ANEMIA_POSITIVE_15_19_PCT` | COMPUTED | col14/col6 |
| 16 | (h) …20-49 | `PRE_ANEMIA_POSITIVE_20_49` | RAW | — |
| 17 | % h/d*100 | `PRE_ANEMIA_POSITIVE_20_49_PCT` | COMPUTED | col16/col8 |
| 18 | (i) Total | `PRE_ANEMIA_POSITIVE_TOTAL` | COMPUTED | col12+col14+col16 |
| 19 | % i/e*100 | `PRE_ANEMIA_POSITIVE_TOTAL_PCT` | COMPUTED | col18/col10 |
| 20-23 | DQC Over 100% for b/a, c/a, d/a, e/a (Tested group) | — | DQC | correctly matches cols 5,7,9,11 |
| 24-27 | DQC labeled "f/a", "g/a", "h/a", "i/a" Over 100% (Positive group) | — | DQC | label is stale — actual formula checks the col13/15/17/19 cells directly (i.e. checks the tested-based % again), so functionally fine despite the wrong-looking label |

### DQC Rules
Tested-group: over 100% vs population (a). Diagnosed-group: over 100% vs the already-corrected tested-rate cell (functionally correct, label text just never got updated to match).

### Flags — File 5 (important precedent for File 6!)
- **This file already had the exact same bug the task flags for File 6, and it was fixed.** change_log explicitly records: Version 2 (released template), Jan 12, 2026 — "Formula: No of pregnant women diagnosed with Anemia / Projected Population (Under 1)" → "Formula: No of pregnant women diagnosed with Anemia / No of pregnant women tested for CBC or Hgb & Hct count" — "adjusted formula and title columns based on the issues addressed by region/s due to wrong formula." Both the formula and the header text were corrected here, and the fix was logged.
- **Residual cosmetic gap:** the DQC column labels (24-27) were not updated to say "/b, /c, /d, /e" even though the % formulas above them were fixed — but since the DQC formula references the % cell directly (not a raw division), this doesn't cause a wrong result, only a misleading label.
- Confirms the correct clinical/statistical model for this whole file family: "positive/diagnosed" rate = positive count ÷ screened/tested count in the same age bracket, not ÷ total population — this is the same pattern that should apply to File 6.

---

## File 6: `6. pre_gd_screening_nir.xlsx` — KNOWN DENOMINATOR ISSUE (deep dive)
**Tracks:** Gestational Diabetes (GD) screening and positivity rate among pregnant women, by maternal age bracket.

### Sheet Structure
Q1–Q4 + Annual + change_log. **Frequency:** Quarterly + Annual. **Rows:** 5 (province rollup). **Columns:** 28. Structurally identical column count/layout to File 5 (Anemia) — same skeleton, different indicator names.

### Column Inventory
| Col | Label (raw text) | `indicator_code` | Type | What the header text claims | What the cell actually computes (verified via openpyxl formula) |
|---|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — | — |
| 1 | "Areas (Regions)" (always "NIR") | — | META (unused) | — | — |
| 2 | Region/PHIC | — | META (`location_column`) | — | — |
| 3 | Projected Population (Under 1) (a) | `PRE_GD_POP` | RAW | — | — |
| 4 | (b) Screened for GD, 10-14 | `PRE_GD_SCREENED_10_14` | RAW | — | — |
| 5 | % b/a*100 | `PRE_GD_SCREENED_10_14_PCT` | COMPUTED | b/a | `=IFERROR(E2/D2,0)` → matches label (b/a) |
| 6 | (c) …15-19 | `PRE_GD_SCREENED_15_19` | RAW | — | — |
| 7 | % c/a*100 | `PRE_GD_SCREENED_15_19_PCT` | COMPUTED | c/a | matches label |
| 8 | (d) …20-49 | `PRE_GD_SCREENED_20_49` | RAW | — | — |
| 9 | % d/a*100 | `PRE_GD_SCREENED_20_49_PCT` | COMPUTED | d/a | matches label |
| 10 | (e) Total | `PRE_GD_SCREENED_TOTAL` | COMPUTED | — | col4+col6+col8 |
| 11 | % e/a*100 | `PRE_GD_SCREENED_TOTAL_PCT` | COMPUTED | e/a | matches label |
| 12 | (f) Tested positive for GD, 10-14 | `PRE_GD_POSITIVE_10_14` | RAW | — | — |
| 13 | % "f/a*100" | `PRE_GD_POSITIVE_10_14_PCT` | COMPUTED | f ÷ population | `=IFERROR(M2/E2,0)` → f ÷ col4 (screened, same bracket), not ÷ population |
| 14 | (g) …15-19 | `PRE_GD_POSITIVE_15_19` | RAW | — | — |
| 15 | % "g/a*100" | `PRE_GD_POSITIVE_15_19_PCT` | COMPUTED | g ÷ population | `=IFERROR(O2/G2,0)` → g ÷ col6 (screened 15-19) — confirmed both arithmetically and via the raw formula string |
| 16 | (h) …20-49 | `PRE_GD_POSITIVE_20_49` | RAW | — | — |
| 17 | % "h/a*100" | `PRE_GD_POSITIVE_20_49_PCT` | COMPUTED | h ÷ population | `=IFERROR(Q2/I2,0)` → h ÷ col8 (screened 20-49) |
| 18 | (i) Total | `PRE_GD_POSITIVE_TOTAL` | COMPUTED | — | col12+col14+col16 |
| 19 | % "i/a*100" | `PRE_GD_POSITIVE_TOTAL_PCT` | COMPUTED | i ÷ population | `=IFERROR(S2/K2,0)` → i ÷ col10 (screened total) |
| 20-23 | DQC Over 100% for b/a, c/a, d/a, e/a (Screened group) | — | DQC | — | correctly checks cols 5,7,9,11 — fine |
| 24 | DQC "f/a*100" Over 100% | — | DQC | f ÷ population | `=IF(N2<=100,...)` → checks col13 (already the screened-based %) — functionally fine, label stale |
| 25 | DQC "g/h*100" Over 100% | — | DQC | g ÷ h (nonsensical: divides 15-19 positive by 20-49 positive) | `=IF(P2<=100,...)` → checks col15 (screened-based %) — functionally fine, but label is not just stale, it's internally garbled/wrong on its face |
| 26 | DQC "h/a*100" Over 100% | — | DQC | h ÷ population | `=IF(R2<=100,...)` → checks col17 — fine, label stale |
| 27 | DQC "i/a*100" Over 100% | — | DQC | i ÷ population | `=IF(T2<=100,...)` → checks col19 — fine, label stale |

### Root cause and why this is "the known issue"
1. **The Screened-group percentages (cols 5,7,9,11) are correct and match their labels** — positivity is not the problem here, only the second group is.
2. **The "% tested positive for GD" columns (13,15,17,19) have header text claiming the denominator is the projected population ("a")**, but the actual stored Excel formula divides by the screened count in the same age bracket (b, c, d, e respectively) — i.e., the true, clinically-meaningful figure "% of those screened who tested positive," not "% of the total population that tested positive." Confirmed two independent ways: hand arithmetic on two different location rows, and direct inspection of the underlying Excel formula strings via openpyxl (data_only=False), which show positive_cell / screened_cell, never positive_cell / population_cell.
3. **This is the identical bug that File 5 (Anemia Screening) had**, and File 5's own change_log documents the fix explicitly (Version 2, Jan 12 2026) — including updating the header text to read f/b, g/c, etc. File 6's change_log tab is completely empty — no version history, no note. This strongly suggests the same underlying formula correction was applied to this sibling file (perhaps copy-pasted from the Anemia fix) but the header text and the change-log entry were never updated to match.
4. **DQC column 25's label is the single worst artifact in the group**: "g/h*100<=100" — dividing the 15-19 positive count by the unrelated 20-49 positive count makes no clinical sense and doesn't match any of the other three DQC labels' pattern (which at least consistently say /a). The underlying DQC formula is fine (it checks the already-correct % cell), but this label is a clear copy/paste corruption distinct from, and worse than, the generic "stale /a" labels on the other 3 DQC columns.
5. **Practical risk for schema/parser design:** per the existing project rule (the system always recalculates percentages from raw inputs using the config-defined formula, never trusts the Excel computed value), whoever writes this file's JSON config must not trust the header text. If PRE_GD_POSITIVE_*_PCT is configured as positive / population (matching what the label says), the computed percentage will be a meaningless, tiny number and will silently diverge from what the source template — and the sibling Anemia file — actually intends. The denominator must be configured as positive / screened (same age bracket), mirroring File 5's corrected, documented formula.

### Recommendation for config authors
- `PRE_GD_POSITIVE_10_14_PCT.denominator = PRE_GD_SCREENED_10_14` (not `PRE_GD_POP`), and equivalently for 15-19 / 20-49 / Total.
- DQC rule for cols 24-27 should be `over_threshold` on the positive-rate indicators with threshold 1.0 (100%), referencing the correct numerator/denominator pair (PRE_GD_POSITIVE_x / PRE_GD_SCREENED_x) — not on the raw population.
- Flag this file's header row for a documentation/template fix request to the DOH region (mirroring the same textual fix Anemia already got), and ask them to add a change_log entry retroactively so future maintainers aren't misled the way this analysis initially was until the formulas were inspected directly.

---

## File 7: `7. pre_deworming_nir.xlsx`
**Tracks:** Deworming tablet administration (single dose) to pregnant women, by maternal age bracket.

### Sheet Structure
Q1–Q4 + Annual + change_log. **Frequency:** Quarterly + Annual. **Rows:** 5 (province rollup). **Columns:** 16 (smallest in this group — only one indicator group, no "2nd tier" like Anemia/GD).

### Column Inventory
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | "Areas (Regions)" | — | META (unused) | — |
| 2 | Region/PHIC | — | META (`location_column`) | — |
| 3 | Projected Population (Under 1) (a) | `PRE_DEWORM_POP` | RAW | — |
| 4 | (b) Given deworming, 10-14 | `PRE_DEWORM_10_14` | RAW | — |
| 5 | % b/a | `PRE_DEWORM_10_14_PCT` | COMPUTED | col4/col3 |
| 6 | (c) …15-19 | `PRE_DEWORM_15_19` | RAW | — |
| 7 | % c/a | `PRE_DEWORM_15_19_PCT` | COMPUTED | col6/col3 |
| 8 | (d) …20-49 | `PRE_DEWORM_20_49` | RAW | — |
| 9 | % d/a | `PRE_DEWORM_20_49_PCT` | COMPUTED | col8/col3 |
| 10 | (e) Total | `PRE_DEWORM_TOTAL` | COMPUTED | col4+col6+col8 |
| 11 | % e/a | `PRE_DEWORM_TOTAL_PCT` | COMPUTED | col10/col3 |
| 12-15 | DQC Over 100% (b,c,d,e / a) | — | DQC | matches labels, no issue found |

### Flags — File 7
- Simplest file in the group. change_log empty, no known issues, single-tier indicator (no chained denominator), all formulas consistent with their labels. Same shared-population Flag P applies.

---

## File 8: `8. pre_bp_measure_hpn_mngt_nir.xlsx`
**Tracks:** Two related indicator groups in one file — (a) BP measurement during ANC visits, and (b) referral of pregnant women with high BP/danger signs to a higher-level facility (hypertension management).

### Sheet Structure
| Sheet | Type |
|---|---|
| Q1a–Q4a, Annual_1a | Group A: ANC visits + BP measured |
| Q1b–Q4b, Annual_1b | Group B: identified high BP/danger signs + referred |
| change_log | Admin |

**Frequency:** Quarterly + Annual. **Rows:** 68 (municipality level — same location list as File 1). **Columns:** 15 per sub-group. **No DQC columns at all in this file** — first file in this batch with zero DQC.

### Column Inventory — Group "a" (BP measurement)
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | Region (always "NIR") | — | META (unused) | — |
| 2 | Region, Province/City, Municipality | — | META (`location_column`) | — |
| 3 | (a) ANC visits, 10-14 | `PRE_BP_ANCVISIT_10_14` | RAW | — |
| 4 | (b) …15-19 | `PRE_BP_ANCVISIT_15_19` | RAW | — |
| 5 | (c) …20-49 | `PRE_BP_ANCVISIT_20_49` | RAW | — |
| 6 | (d) Total | `PRE_BP_ANCVISIT_TOTAL` | COMPUTED | col3+col4+col5 |
| 7 | (e) BP measured each ANC visit, 10-14 | `PRE_BP_MEASURED_10_14` | RAW | — |
| 8 | % e/a | `PRE_BP_MEASURED_10_14_PCT` | COMPUTED | col7/col3 |
| 9 | (f) …15-19 | `PRE_BP_MEASURED_15_19` | RAW | — |
| 10 | % f/b | `PRE_BP_MEASURED_15_19_PCT` | COMPUTED | col9/col4 |
| 11 | (g) …20-49 | `PRE_BP_MEASURED_20_49` | RAW | — |
| 12 | % g/c | `PRE_BP_MEASURED_20_49_PCT` | COMPUTED | col11/col5 |
| 13 | (h) Total | `PRE_BP_MEASURED_TOTAL` | COMPUTED | col7+col9+col11 |
| 14 | % h/d | `PRE_BP_MEASURED_TOTAL_PCT` | COMPUTED | col13/col6 |

### Column Inventory — Group "b" (High BP identification/referral)
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 3 | (a) Identified w/ high BP/danger signs, 10-14 | `PRE_HPN_IDENTIFIED_10_14` | RAW | — |
| 4 | (b) …15-19 | `PRE_HPN_IDENTIFIED_15_19` | RAW | — |
| 5 | (c) …20-49 | `PRE_HPN_IDENTIFIED_20_49` | RAW | — |
| 6 | (d) Total | `PRE_HPN_IDENTIFIED_TOTAL` | COMPUTED | col3+col4+col5 |
| 7 | (e) Referred to higher-level facility, 10-14 | `PRE_HPN_REFERRED_10_14` | RAW | — |
| 8 | % e/a | `PRE_HPN_REFERRED_10_14_PCT` | COMPUTED | col7/col3 |
| 9,10 | (f), % f/b | `PRE_HPN_REFERRED_15_19[_PCT]` | RAW/COMPUTED | col9/col4 |
| 11,12 | (g), % g/c | `PRE_HPN_REFERRED_20_49[_PCT]` | RAW/COMPUTED | col11/col5 |
| 13,14 | (h) Total, % h/d | `PRE_HPN_REFERRED_TOTAL[_PCT]` | COMPUTED | col13/col6 |

### Denominator note (no ambiguity here)
Both groups use a chained, same-bracket denominator (measured ÷ ANC visits; referred ÷ identified) — no population column at all in this file, verified via arithmetic. This is analogous to the "Facility Seen" (D2) denominator pattern documented for Child Care > Management of the Sick, not the population-based (D1) pattern used in Files 2-7 of this group.

### Flags — File 8
- **change_log explicitly documents a fix already applied and logged** (Version 2, Jan 12 2026) for both sub-templates: the formula was originally ANC-visits / BP-measured (i.e., inverted) and was corrected to BP-measured / ANC-visits (and, separately, identified / referred → referred / identified). Verified: the current file's stored formulas already reflect the corrected direction. This file is the "good" precedent, alongside File 5 — showing the fix-and-log discipline the team should also apply retroactively to File 6.
- **No DQC columns whatsoever** in File 8 — worth flagging since every other file in this group has at least an "Over 100%"/"Over 200%" check. May be an intentional omission or a gap to raise with the DOH region team.
- Same 68-row municipality-level granularity as File 1 — no "region-only" NIR placeholder rows like Files 2-7.

---

## Denominator Registry — Update for Prenatal
| ID | Type | Files using it |
|---|---|---|
| D1 (existing) | Projected Population (age-specific) | Files 2, 3, 4, 5 (screened tier only), 6 (screened tier only), 7 — all via the shared "Under 1" population column |
| D2 (existing) | Facility Seen / chained same-bracket count | File 8 (both groups), File 1 (tracked women), Files 5 & 6 "positive/diagnosed" tiers (chained to same-bracket screened/tested count, not population, despite misleading labels in File 6) |
| D8 (new) | Live-cohort proxy — "Projected Population (Under 1)" | Files 2, 3, 4, 5, 6, 7 — same literal value repeated verbatim across all six files (e.g., 93,988 for NIR in every one). See Flag P. |

## Flag P — Shared "Projected Population (Under 1)" denominator (open question, applies to Files 2, 3, 4, 5, 6, 7)
All six of these files use a column literally labeled "Projected Population (Under 1)" as the denominator for maternal/prenatal indicators (BMI, Td vaccination, supplementation, screening coverage). The identical number appears in every one of the six files for every location (e.g., NIR = 93,988 in all six). Two possibilities, both plausible, need confirmation from the DOH region team before the schema is finalized:
1. **Intentional DOH convention:** "population under 1 year" is sometimes used by DOH as a standard proxy for "expected pregnancies / expected live births" in FHSIS manuals (since annual live births ≈ population aged 0-11 months), making it a legitimate — if confusingly labeled — denominator for prenatal-care coverage indicators.
2. **Copy-paste artifact:** the column (and its value) may have been carried over unedited from an Immunization-style template (where "population under 1" is the correct denominator for infant vaccination) without adjusting the label or substituting the correct "estimated number of pregnant women" figure for a maternal-care template.

**Decision needed before Step 1 (seeding indicators):** should `denominator_source` for these six files' percentage indicators point to a shared/reused population indicator code (e.g., a single PRE_POP_PROXY, reused across configs), or should each file keep its own duplicate raw population column (as the Immunization precedent chose to do)? Either is workable technically; this is a naming/reuse decision, not a blocker.

---

## Summary Table — All 8 Files
| # | File | Freq | Rows | Cols | Denominator type | DQC threshold | Known formula/label bugs |
|---|---|---|---|---|---|---|---|
| 1 | 8ANC | Q+A | 68 (municipality) | 38 | Chained (tracked women) | 100% | Inverted total % label (I/II vs II/I); "(A+B)" shorthand is per-bracket, not group-total |
| 2 | BMI | Q+A | 5 (province) | 22 | Population (Under 1) | 100% | Duplicate "Low BMI" DQC label (should say "High BMI") — label only |
| 3 | Td vaccine | Q+A | 5 (province) | 28 | Population (Under 1) | 100% | None found |
| 4 | Supplementation | Q+A | 5 (province) | 40 | Population (Under 1) | 100% | None found |
| 5 | Anemia screening | Q+A | 5 (province) | 28 | Population (screened tier) / Screened count (positive tier) | 100% | Already fixed & logged (Version 2) — precedent for File 6 |
| 6 | GD screening | Q+A | 5 (province) | 28 | Population (screened tier) / Screened count (positive tier, mislabeled as population) | 100% | KNOWN ISSUE — header claims population denominator for positivity %, actual formula uses screened count; fix undocumented, no change_log entry; DQC col 25 label ("g/h") is additionally garbled |
| 7 | Deworming | Q+A | 5 (province) | 16 | Population (Under 1) | 100% | None found |
| 8 | BP measure / HPN mgmt | Q+A | 68 (municipality) | 15 ×2 groups | Chained (ANC visits / identified) | No DQC columns at all | Already fixed & logged (Version 2, both sub-groups) |

## Consolidated Open Questions
| ID | File(s) | Question |
|---|---|---|
| Q-Pre-1 | 2,3,4,5,6,7 | Is "Projected Population (Under 1)" the correct/intended denominator for prenatal/maternal indicators, or a copy-paste artifact from Immunization templates? Should it be a shared reference indicator across files, or duplicated per-file like the Immunization precedent? |
| Q-Pre-2 | 6 (GD screening) | Confirm with DOH region: should the "% tested positive for GD" columns be computed against the screened count (matching the already-corrected Anemia file), not population? Request a template fix + retroactive change_log entry. |
| Q-Pre-3 | 6 | DQC column 25's label "g/h*100<=100" — clarify if this was a manual typo, and whether the underlying IF(P2<=100,...) formula (which is actually correct) should be preserved as the DQC intent going forward. |
| Q-Pre-4 | 1 | Trans-out women (with MOV) are captured but never subtracted from the "tracked" denominator — confirm this is intentional. |
| Q-Pre-5 | 2, 3, 4, 5, 6, 7 vs 1, 8 | Confirm whether Files 2-7 are genuinely only reported at province/HUC rollup level (5 rows) while Files 1 and 8 are reported at municipality level (68 rows) — this is a major granularity mismatch within one "Prenatal" program and affects how psgc_column/expected row counts are configured per template. |
| Q-Pre-6 | 8 | Confirm whether the complete absence of DQC columns in this file is intentional. |
