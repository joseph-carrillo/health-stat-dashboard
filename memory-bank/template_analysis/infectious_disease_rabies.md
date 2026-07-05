# FHSIS Template Analysis — INFECTIOUS_DISEASE > Rabies

Analyzed with pandas/openpyxl against `backend/data/INFECTIOUS_DISEASE/Rabies/`. Follows the same documentation format as `memory-bank/fhsis_template_analysis.md` (Immunization group) and is scoped against the recipe in `memory-bank/adding_templates.md` and the parser in `backend/app/services/parser.py`.

**Column Types:** RAW = entered by user, stored as-is. COMPUTED = derived by formula, system recalculates (never trusts Excel's cached value). META = administrative (PSGC, location name). DQC = data-quality flag column in the template — informational, not stored as data, may seed dqc_rules.

---

## File 1: `animal_bites_nir.xlsx`
**Tracks:** Number of animal bites and rabies deaths, by sex, with a case-fatality "Rate" — the coarsest/simplest of the two Rabies files.

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Qtr1 | Quarterly | Jan–Mar — the only sheet with actual data in this sample file |
| Qtr2 | Quarterly | Apr–Jun — present but blank (formulas only, no raw values yet) |
| Qtr3 | Quarterly | Jul–Sep — blank |
| Qtr4 | Quarterly | Oct–Dec — blank |
| Annual | Annual | `=SUM('Qtr1'!x,'Qtr2'!x,'Qtr3'!x,'Qtr4'!x)` per province row |

**Frequency:** Quarterly + Annual only. No monthly sheets.
**No change_log/changelog sheet at all** — unlike every Immunization/Nutrition file previously documented, and unlike the sibling file in this same folder (`infec_rabies_nir.xlsx`, which does have one).
**No Population sheet** — this template does not use a population denominator; "Rate" is bites-to-deaths, not deaths-per-population.

### Geographic Granularity — narrower than Immunization files
Only 5 rows of data (not 129 like Child Care files):
1. Region total (PSGC 1800000000)
2. Negros Occidental (province, PSGC 1804500000)
3. Negros Oriental (province, PSGC 1804600000)
4. Siquijor (province, PSGC 1806100000)
5. City of Bacolod (HUC) (PSGC 1830200000)

No municipality/city/barangay-level breakdown — reporting stops at province/HUC level.

### Header/Data Position (differs from Immunization convention)
- Title block occupies rows 1–3 (merged "Rabies" / "Number of Animal Bites and Deaths Due to Rabies" / "Philippines, 2026").
- header_row = 5 (0-based) — header text is on Excel row 6, not row 1 as in every previously-documented file.
- Row directly below the header (Excel row 7) is blank (visual spacer).
- data_start_row = 1 relative to the header (i.e., first real row is Excel row 8 = Region total).
- Rows 15–17 contain a Legend ("0 = No Case", "* = No Report") — must not be parsed as data (parser's blank-PSGC skip logic handles this safely).

### Column Inventory
psgc_column = 0, location_column = 2 (not column 1 — column 1 "Region" is a constant label, not a real per-row location name).

| Col (0-based) | Header Label | Proposed indicator_code | Type | Formula | Unit |
|---|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — | — |
| 1 | Region | — | META (constant "NIRA") | — | — |
| 2 | Province/HUC/ICC | — | META (location name) | — | — |
| 3 | animal_bites_male (a) | `RABIES_BITES_MALE` | RAW | — | count |
| 4 | animal_bites_female (b) | `RABIES_BITES_FEMALE` | RAW | — | count |
| 5 | Total = a+b / animal_bites_total (c) | `RABIES_BITES_TOTAL` | COMPUTED | RABIES_BITES_MALE + RABIES_BITES_FEMALE | count |
| 6 | rabies_deaths_male (d) | `RABIES_DEATHS_MALE` | RAW | — | count |
| 7 | rabies_deaths_female (e) | `RABIES_DEATHS_FEMALE` | RAW | — | count |
| 8 | Total = d+e / total_rabies_death (f) | `RABIES_DEATHS_TOTAL` | COMPUTED | RABIES_DEATHS_MALE + RABIES_DEATHS_FEMALE | count |
| 9 | Rate | `RABIES_CASE_FATALITY_RATE` | COMPUTED | RABIES_DEATHS_TOTAL / RABIES_BITES_TOTAL | rate (Excel bakes in *100; see Flag below) |

Region-total row (row 0 of data) is itself a SUM() of the province rows below it in the source Excel — same "already-aggregated" pattern seen in Immunization files; pandas reads the cached numeric value, so no special parser handling is needed, it's just stored as a normal RAW value for the NIR region location.

### DQC Notes
This file has no built-in DQC/flag columns at all — a first among all files documented so far. The only computed safety-net is the IFERROR(...,0) in the Rate formula (returns 0 instead of #DIV/0! when bites = 0). There is no template check for e.g. "deaths > bites" (which would be nonsensical). The system should define its own DQC rule for this (e.g., flag if RABIES_DEATHS_TOTAL > RABIES_BITES_TOTAL, i.e., Rate > 100%), since the source template provides none.

### Raw Inputs to Store
1. animal_bites_male
2. animal_bites_female
3. rabies_deaths_male
4. rabies_deaths_female

**Total raw inputs: 4 per location per period**

### Flags / Open Questions — File 1
- **FLAG 1a — "Region" column value is "NIRA", not "NIR".** Every row in every sheet, for both the region-total row and even province rows, shows Region = "NIRA" (note trailing "A"). Confirmed identical across Qtr1–Qtr4/Annual, so it is not a one-off typo but a copied template default. NIR ("Negros Island Region") is the acronym used everywhere else in this codebase. Needs verification with the data owner: is "NIRA" intentional shorthand, or a template typo that should be added to location_aliases regardless?
- **FLAG 1b — Column 1 ("Region") is not usable as location_column.** It is constant "NIRA" on every row, so it cannot resolve individual provinces/HUC. The real per-row location name lives in column 2 ("Province/HUC/ICC"). Config must set location_column: 2.
- **FLAG 1c — Missing formula for one specific row in most sheets.** Cell J9 (Rate for Negros Occidental) has the expected formula =IFERROR((I9/F9)*100,0) only in Qtr1. It is completely blank (no formula, no value) in Qtr2, Qtr3, Qtr4, and Annual — while the neighboring rows (J8, J10, J11, J12) keep their formulas in every sheet. This looks like an accidental cell deletion in the source template that repeats itself across 4 of 5 sheets. Since the system recalculates Rate from raw values rather than trusting the Excel formula, this doesn't block ingestion, but it should be flagged to the DOH-NIR encoder as a likely template defect.
- **FLAG 1d — No change_log sheet in this file**, unlike its sibling infec_rabies_nir.xlsx and every other FHSIS file documented previously. Confirm whether this is intentional or an omission.
- **FLAG 1e — "Rate" denominator/meaning is ambiguous from the header alone.** The header just says "Rate" with no formula shown to the user, and internally it's (deaths/bites)*100 — a case-fatality ratio, not a population-based mortality rate and not a "coverage" percentage like every _PCT indicator seen so far. Recommend formula_type = "rate" (new value, not yet used anywhere in seed_indicators.py — all rate-multiplier indicators there are currently formula_type = "percentage"), and store the plain ratio (DEATHS_TOTAL / BITES_TOTAL, no *100 baked into the stored value) with rate_multiplier = 100, mirroring how _PCT indicators are stored as 0–1 ratios and only scaled for display.
- **FLAG 1f — Only Qtr1 has data in this sample file.** Qtr2/Qtr3/Qtr4/Annual retain formulas but all raw input cells (male/female counts) are blank. Not necessarily an error (today is 2026-07-05, mid-Q2), but worth confirming this isn't a partially-submitted file before using it as the reference template.

---

## File 2: `infec_rabies_nir.xlsx`
**Tracks:** Rabies exposure management — category of exposure (I/II/III per WHO bite-risk classification), anti-rabies vaccine (ARV) / rabies immunoglobulin (RIG) prophylaxis completion, and animal-source breakdown (dog/cat/other). This is a single workbook that functionally contains 4 separate sub-templates, each reported quarterly + annually, all sharing the same 5 location rows as File 1.

### Sheet Structure — 21 sheets total
| Sheet group | Sheets | Type | What it tracks |
|---|---|---|---|
| Base ("no suffix") | Qtr1, Qtr2, Qtr3, Qtr4, Annual | Quarterly + Annual | Category I/II/III rabies-exposure counts + all-category total |
| Group "a" | Qtr1a, Qtr2a, Qtr3a, Qtr4a, Annual1 | Quarterly + Annual | Category II exposure → ARV eligibility → ARV completion |
| Group "b" | Qtr1b, Qtr2b, Qtr3b, Qtr4b, Annual2 | Quarterly + Annual | Category III exposure → ARV+RIG (no vaccine history) and ARV-only (with vaccine history) completion |
| Group "d" | Qtr1d, Qtr2d, Qtr3d, Qtr4d, Annual3 | Quarterly + Annual | All-category exposure broken down by animal source: dog / cat / other |
| Admin | change log | Admin | Version history — not imported |

No Population sheet (same as File 1 — no population denominator anywhere in this file).

Note the letter sequence skips "c": groups are named a, b, d — no "c" group exists anywhere in the workbook. This mirrors the exact "Files 2/3 missing" anomaly already flagged in the Immunization docs — worth confirming with the data owner whether a "c" group was dropped from this template, or the letter was simply never used.

### Header/Data Position
header_row = 0, data_start_row = 0 for every sheet in this file (header on Excel row 1, first data row immediately below — no title block, no blank spacer row, unlike File 1). psgc_column = 0, location_column = 2 (same constant-"NIRA"-in-column-1 issue as File 1).

Same 5 locations/PSGCs as File 1 (NIR region total, Negros Occidental, Negros Oriental, Siquijor, City of Bacolod HUC).

### Column Inventory

#### Base group (Qtr1–Qtr4, Annual) — Rabies Exposure by Category
| Col | Header Label | Proposed indicator_code | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | Region | — | META (constant "NIRA") | — |
| 2 | Region, Province/City, Municipality | — | META (location name) | — |
| 3 | 1. Category I Exposure (Male) (a) | `RABIES_CAT1_MALE` | RAW | — |
| 4 | 1. Category I Exposure (Female) (b) | `RABIES_CAT1_FEMALE` | RAW | — |
| 5 | A. Total (a+b) | `RABIES_CAT1_TOTAL` | COMPUTED | RABIES_CAT1_MALE + RABIES_CAT1_FEMALE |
| 6 | 2. Category II Exposure (Male) (c) | `RABIES_CAT2_MALE` | RAW | — |
| 7 | 2. Category II Exposure (Female) (d) | `RABIES_CAT2_FEMALE` | RAW | — |
| 8 | B. Total (c+d) | `RABIES_CAT2_TOTAL` | COMPUTED | RABIES_CAT2_MALE + RABIES_CAT2_FEMALE |
| 9 | 3. Category III Exposure (Male) (e) | `RABIES_CAT3_MALE` | RAW | — |
| 10 | 3. Category III Exposure (Female) (f) | `RABIES_CAT3_FEMALE` | RAW | — |
| 11 | C. Total (e+f) | `RABIES_CAT3_TOTAL` | COMPUTED | RABIES_CAT3_MALE + RABIES_CAT3_FEMALE |
| 12 | 4. All-Category Exposure (Male) | `RABIES_EXP_ALL_MALE` | COMPUTED | RABIES_CAT1_MALE + RABIES_CAT2_MALE + RABIES_CAT3_MALE (Excel: SUM(D,G,J) — sums the raw male columns, not the per-category totals) |
| 13 | 4. All-Category Exposure (Female) | `RABIES_EXP_ALL_FEMALE` | COMPUTED | RABIES_CAT1_FEMALE + RABIES_CAT2_FEMALE + RABIES_CAT3_FEMALE |
| 14 | D. Total (e+f) | `RABIES_EXP_ALL_TOTAL` | COMPUTED | RABIES_EXP_ALL_MALE + RABIES_EXP_ALL_FEMALE |
| 16 (col Q, row 2 only) | stray cell value "a" | — | ignore | Not a real column — a single leftover cell in row 2 only, no header, looks like an editor's note tagging which sub-group this sheet feeds; not part of the data grid |

#### Group "a" (Qtr1a–Qtr4a, Annual1) — Category II → ARV Completion
| Col | Header Label | Proposed indicator_code | Type | Formula |
|---|---|---|---|---|
| 0–2 | PSGC / Region / Location | — | META | — |
| 3 | 2. Category II Exposure (Male) (c) | (link — do not re-ingest) | — | ='Qtr1'!$G3 — duplicates base col 6 |
| 4 | 2. Category II Exposure (Female) (d) | (link — do not re-ingest) | — | ='Qtr1'!$H3 — duplicates base col 7 |
| 5 | A. Total (c+d) | (duplicate of base col 8) | — | — |
| 6 | 4. Category II Eligible for ARV (Male) (a) | `RABIES_CAT2_ELIGIBLE_MALE` | RAW | — |
| 7 | 4. Category II Eligible for ARV (Female) (b) | `RABIES_CAT2_ELIGIBLE_FEMALE` | RAW | — |
| 8 | B. Total (a+b) | `RABIES_CAT2_ELIGIBLE_TOTAL` | COMPUTED | male+female |
| 9 | 5. Category II completed doses of ARV (Male) (e) | `RABIES_CAT2_ARV_COMPLETED_MALE` | RAW | — |
| 10 | 5. Category II completed doses of ARV (Female) (f) | `RABIES_CAT2_ARV_COMPLETED_FEMALE` | RAW | — |
| 11 | C. Total (e+f) | `RABIES_CAT2_ARV_COMPLETED_TOTAL` | COMPUTED | male+female |
| 12 | % (C/B) | `RABIES_CAT2_ARV_COMPLETED_PCT` | COMPUTED | RABIES_CAT2_ARV_COMPLETED_TOTAL / RABIES_CAT2_ELIGIBLE_TOTAL |
| 13 | DQC Over 100% (a<=c) | DQC | — | Eligible_Male <= Category_II_Male |
| 14 | DQC Over 100% (b<=d) | DQC | — | Eligible_Female <= Category_II_Female |
| 15 | DQC Over 100% (e<=a) | DQC | — | ARV_Completed_Male <= Eligible_Male |
| 16 | DQC Over 100% (f<=b) | DQC | — | ARV_Completed_Female <= Eligible_Female |
| 19, 20 (cols T,U) | (no header text) | — | ignore | =IF(ISFORMULA(D2),"Match","Formula changed!") — internal integrity check that column D/E still contain the cross-sheet link formula rather than a manually typed-over number |

#### Group "b" (Qtr1b–Qtr4b, Annual2) — Category III → ARV+RIG / ARV-only Completion
| Col | Header Label | Proposed indicator_code | Type | Formula |
|---|---|---|---|---|
| 0–2 | PSGC / Region / Location | — | META | — |
| 3 | 3. Category III Exposure (Male) (e) | (link — do not re-ingest) | — | ='Qtr1'!$J3 — duplicates base col 9 |
| 4 | 3. Category III Exposure (Female) (f) | (link — do not re-ingest) | — | ='Qtr1'!$K3 — duplicates base col 10 |
| 5 | E. Total (e+f) | (duplicate of base col 11 — relabeled "E" here) | — | — |
| 6 | 6. Completed doses ARV+RIG (Male) (a) | `RABIES_CAT3_ARV_RIG_MALE` | RAW | — |
| 7 | 6. Completed doses ARV+RIG (Female) (b) | `RABIES_CAT3_ARV_RIG_FEMALE` | RAW | — |
| 8 | A. Total (a+b) | `RABIES_CAT3_ARV_RIG_TOTAL` | COMPUTED | male+female |
| 9 | 7. Without history of ARV (Male) (c) | `RABIES_CAT3_NO_VAX_HISTORY_MALE` | RAW | — |
| 10 | 7. Without history of ARV (Female) (d) | `RABIES_CAT3_NO_VAX_HISTORY_FEMALE` | RAW | — |
| 11 | B. Total (c+d) | `RABIES_CAT3_NO_VAX_HISTORY_TOTAL` | COMPUTED | male+female |
| 12 | % (A/B) | `RABIES_CAT3_ARV_RIG_PCT` | COMPUTED | RABIES_CAT3_ARV_RIG_TOTAL / RABIES_CAT3_NO_VAX_HISTORY_TOTAL |
| 13 | 8. Completed doses ARV, with vax history (Male) (e) | `RABIES_CAT3_ARV_ONLY_MALE` | RAW | — |
| 14 | 8. Completed doses ARV, with vax history (Female) (f) | `RABIES_CAT3_ARV_ONLY_FEMALE` | RAW | — |
| 15 | C. Total (e+f) | `RABIES_CAT3_ARV_ONLY_TOTAL` | COMPUTED | male+female |
| 16 | 9. With history of ARV (Male) (g) | `RABIES_CAT3_VAX_HISTORY_MALE` | RAW | — |
| 17 | 9. With history of ARV (Female) (h) | `RABIES_CAT3_VAX_HISTORY_FEMALE` | RAW | — |
| 18 | D. Total (g+h) | `RABIES_CAT3_VAX_HISTORY_TOTAL` | COMPUTED | male+female |
| 19 | % (C/D) | `RABIES_CAT3_ARV_ONLY_PCT` | COMPUTED | RABIES_CAT3_ARV_ONLY_TOTAL / RABIES_CAT3_VAX_HISTORY_TOTAL |
| 20 | DQC (B+D = E.Total) | DQC | reconciliation | NO_VAX_HISTORY_TOTAL + VAX_HISTORY_TOTAL == CAT3_TOTAL — not an over-threshold or sequence check; a new rule shape |
| 21 | DQC (A<=B) | DQC | sequence | ARV_RIG_TOTAL <= NO_VAX_HISTORY_TOTAL |
| 22 | DQC (C<=D) | DQC | sequence | ARV_ONLY_TOTAL <= VAX_HISTORY_TOTAL |
| 23 | DQC (A+C<=E.Total) | DQC | reconciliation | ARV_RIG_TOTAL + ARV_ONLY_TOTAL <= CAT3_TOTAL — new rule shape |

This group has meaningful denominators: "ARV+RIG completion" is measured against patients without prior vaccine history (who need full post-exposure prophylaxis + immunoglobulin), while "ARV-only completion" is measured against patients with prior history (who only need vaccine boosters, no RIG). The bare % header doesn't communicate this — it only becomes clear from the underlying formula.

#### Group "d" (Qtr1d–Qtr4d, Annual3) — All-Category Exposure by Animal Source
| Col | Header Label | Proposed indicator_code | Type | Formula |
|---|---|---|---|---|
| 0–2 | PSGC / Region / Location | — | META | — |
| 3 | D. All-Category Exposure (Male) (e) | (link — do not re-ingest) | — | ='Qtr1'!$M3 — duplicates base col 12 |
| 4 | D. All-Category Exposure (Female) (f) | (link — do not re-ingest) | — | ='Qtr1'!$N3 — duplicates base col 13 |
| 5 | D. Total (e+f) | (duplicate of base col 14) | — | — |
| 6 | Exposure from dogs (Male) (a) | `RABIES_SRC_DOG_MALE` | RAW | — |
| 7 | Exposure from dogs (Female) (b) | `RABIES_SRC_DOG_FEMALE` | RAW | — |
| 8 | A. Total (a+b) | `RABIES_SRC_DOG_TOTAL` | COMPUTED | male+female |
| 9 | % | `RABIES_SRC_DOG_PCT` | COMPUTED | RABIES_SRC_DOG_TOTAL / RABIES_EXP_ALL_TOTAL |
| 10 | Exposure from cats (Male) (c) | `RABIES_SRC_CAT_MALE` | RAW | — |
| 11 | Exposure from cats (Female) (d) | `RABIES_SRC_CAT_FEMALE` | RAW | — |
| 12 | B. Total (c+d) | `RABIES_SRC_CAT_TOTAL` | COMPUTED | male+female |
| 13 | % | `RABIES_SRC_CAT_PCT` | COMPUTED | RABIES_SRC_CAT_TOTAL / RABIES_EXP_ALL_TOTAL |
| 14 | Exposure from other animals (Male) (e) | `RABIES_SRC_OTHER_MALE` | RAW | — |
| 15 | Exposure from other animals (Female) (f) | `RABIES_SRC_OTHER_FEMALE` | RAW | — |
| 16 | C. Total (e+f) | `RABIES_SRC_OTHER_TOTAL` | COMPUTED | male+female |
| 17 | % | `RABIES_SRC_OTHER_PCT` | COMPUTED | RABIES_SRC_OTHER_TOTAL / RABIES_EXP_ALL_TOTAL |
| 18 | DQC Over 100% (Dogs) | DQC | sequence | DOG_TOTAL <= ALL_TOTAL |
| 19 | DQC Over 100% (Cats) | DQC | sequence | CAT_TOTAL <= ALL_TOTAL |
| 20 | DQC Over 100% (Others) | DQC | sequence | OTHER_TOTAL <= ALL_TOTAL |
| 21 | SUM(A,B,C) = D | DQC | reconciliation | DOG_TOTAL + CAT_TOTAL + OTHER_TOTAL == ALL_TOTAL — new rule shape |

### Age/Sex Disaggregation
Sex disaggregation (Male/Female) only — no age-group breakdown anywhere in either Rabies file, unlike every Child Care file (which always splits by age band). Rabies exposure/bite reporting applies to all ages.

### DQC Notes (both files)
- File 1 has zero DQC columns.
- File 2 uses three distinct DQC shapes across its sub-groups:
  1. Over-threshold / sequence (already supported by run_dqc_rules in parser.py): "eligible ≤ exposed", "completed ≤ eligible", "subgroup total ≤ grand total".
  2. Reconciliation checks — NOT currently supported by the parser: "part A + part B = whole" (group b's B+D = E.Total, group d's SUM(A,B,C) = D) and "part A + part B ≤ whole" (group b's A+C ≤ E.Total). run_dqc_rules() in backend/app/services/parser.py only implements rule_type: "over_threshold" and rule_type: "sequence" — neither expresses "sum of parts equals/is-bounded-by a total". A new dqc_rules rule_type (e.g. "sum_equals" or "reconciliation") needs to be added to the parser before these checks can be encoded in the template config.
  3. Formula-integrity check (ISFORMULA(...), group a/b/d's cross-sheet link columns): checks whether a province encoder overwrote an auto-linked cell with a hardcoded number. Since our config should not re-ingest those linked columns at all, this specific Excel-only check becomes moot for us — but it does mean the base sheet is the single source of truth for category exposure counts, and the a/b/d sheets' link columns must be excluded from columns/extra_sheets definitions to avoid accidentally double-importing the same raw counts under two different indicator codes.

### Raw Inputs to Store (File 2, per location per period)
Base: RABIES_CAT1_MALE/FEMALE, RABIES_CAT2_MALE/FEMALE, RABIES_CAT3_MALE/FEMALE (6)
Group a: RABIES_CAT2_ELIGIBLE_MALE/FEMALE, RABIES_CAT2_ARV_COMPLETED_MALE/FEMALE (4)
Group b: RABIES_CAT3_ARV_RIG_MALE/FEMALE, RABIES_CAT3_NO_VAX_HISTORY_MALE/FEMALE, RABIES_CAT3_ARV_ONLY_MALE/FEMALE, RABIES_CAT3_VAX_HISTORY_MALE/FEMALE (8)
Group d: RABIES_SRC_DOG_MALE/FEMALE, RABIES_SRC_CAT_MALE/FEMALE, RABIES_SRC_OTHER_MALE/FEMALE (6)

**Total raw inputs: 24 per location per period** (across the 4 logical sub-templates)

### Flags / Open Questions — File 2

- **FLAG 2a — This is really 4 templates in 1 workbook, and the current extra_sheets mechanism in parser.py cannot express it.** extra_sheets entries have a single fixed sheet_name (e.g. "SAM"), used regardless of the period being uploaded — that works for MAM/SAM because that file is annual-only with two static tabs. Here, group a/b/d sheets are period-varying (Qtr1a for Q1, Qtr2a for Q2, ... Annual1 for the year) exactly like the base sheet. There is no existing config key to say "for extra sheet group 'a', use this quarter's own sheet_map." Decision needed: either (1) extend the parser/config schema so extra_sheets entries can carry their own sheet_map (period-aware), or (2) split this single Excel file into 4 separate template configs (e.g. RABIES_EXPOSURE_BASE, RABIES_CAT2_ARV, RABIES_CAT3_ARV_RIG, RABIES_ANIMAL_SOURCE), each with its own sheet_map, uploaded independently from the same physical .xlsx file. Option 2 requires no parser changes and matches the existing recipe most cleanly, but means 4 separate template_ids point at one file.
- **FLAG 2b — Missing DQC rule type.** As noted above, run_dqc_rules() needs a new rule_type to express "sum of parts = / ≤ whole" reconciliation checks used in groups b and d. Needs a parser code change, not just a config change.
- **FLAG 2c — Letter "c" is missing from the group sequence (a, b, d).** No sheet, Annual-tab suffix, or in-cell label anywhere references a "c" group. Confirm with the data owner whether a group was dropped, or whether letters were never meant to be sequential across sub-groups.
- **FLAG 2d — Cross-sheet link columns duplicate raw data and must not be double-ingested.** Columns D/E in groups a, b, d are literal cross-references back to the base sheet rather than independently entered values. The change log sheet confirms these were previously XLOOKUP formulas, replaced on 2026-01-12 with plain "=" references because XLOOKUP "not working [in] other versions of excel" — i.e., this is a known, actively-maintained fragile spot in the template. Config must source Category II/III/all-category exposure counts only from the base sheet's columns, and exclude columns D/E (and their derivatives) from the a/b/d sheet column definitions.
- **FLAG 2e — Inconsistent group-letter relabeling across sheets.** The base sheet's own Category III total is "C. Total"; when the exact same total is cross-referenced from group b, it's relabeled "E. Total" (continuing group b's own A–D lettering scheme). Purely a labeling/readability issue in the source template, not a data problem.
- **FLAG 2f — Ambiguous bare "%" headers in groups a/b/d.** Every percentage column is just labeled "%" with no restated numerator/denominator meaning in the visible header for most of them (group d's three "%" columns are literally all labeled just "%"). Confirmed by formula inspection that each is subgroup_total / all_category_total for group d, and subgroup-specific denominators for group b — but this must be documented in the seeded indicator names/descriptions since the Excel header alone is not self-explanatory.
- **Shared with File 1 — FLAG "NIRA" region label** and **FLAG "Region" column unusable as location_column** (both apply identically here; column 1 is a constant "NIRA" on every row, column 2 holds the real location name).
- **Q-Rabies-1 (Sensitivity/RBAC):** memory-bank/CLAUDE.md's "Sensitive Indicators" section currently lists only HIV-reactive and Syphilis-reactive cases as requiring extra RBAC restriction (is_sensitive = TRUE). Rabies deaths/exposure data is not currently in scope of that rule, and nothing in either file suggests individually identifiable data (all rows are province/HUC aggregates, not patient-level) — so no is_sensitive flag looks warranted for these indicators. Flagging for confirmation only.
- **Q-Rabies-2:** Confirm whether the "Rate" indicator in File 1 and the sub-group % indicators in File 2 should be seeded as formula_type = "percentage" (existing convention, ratio stored as 0–1) or whether a new formula_type = "rate" is warranted for File 1's case-fatality ratio specifically, since it is conceptually different (bites→deaths ratio) from every other _PCT indicator seeded so far.
