# FHSIS Template Analysis — `infec_leprosy_nir.xlsx`

**Location:** `backend/data/INFECTIOUS_DISEASE/Leprosy/infec_leprosy_nir.xlsx`
**Program (proposed):** Infectious Disease > Leprosy
**Tracks:** Leprosy surveillance and program indicators — registered cases, newly detected cases, confirmed cases, treatment coverage (MDT), and Grade 2 Disability (G2D) at diagnosis — disaggregated by 3 age brackets (0-14, 15-18, 19+) and sex.

This is structurally the most different file analyzed so far compared to the Immunization/Nutrition/Management-of-Sick groups. Key differences up front:
- Only 5 data rows per sheet (region total + 4 sub-locations) — no city/municipality/barangay breakdown.
- 5 separate "Annual" tabs, each holding a different indicator group for the same annual period (not month/quarter tabs). This matches the `extra_sheets` config pattern already used in `nut_mam_sam_annual.json` (MAM/SAM tabs) — same mechanism should be reused here.
- Contains two confirmed formula/template bugs (one causing a literal #ERROR!/#REF! in the workbook, one silently wrong), plus a mislabeled "%" that is actually a per-million rate.
- No dedicated Population reference sheet — population is entered inline, redundantly, in 3 of the 5 tabs.

---

## Sheet Structure

| Sheet | Type | Rows (incl. header) | Columns | Notes |
|---|---|---|---|---|
| `Annual` | Data | 6 (5 data rows) | 42 (idx 0-41) | Registered Leprosy Cases (by age) + Newly Detected Cases (by age) |
| `Annual1` | Data | 6 (5 data rows) | 20 (idx 0-19) | Confirmed Leprosy Cases (by age) — no rate columns |
| `Annual2` | Data | 8 (5 data rows + 1 blank + 1 footnote row) | 19 (idx 0-18) | % of Confirmed Cases Treated (denominator = Annual1) — contains a broken #REF! formula |
| `Annual3` | Data | 8 (5 data rows + 1 blank + 1 footnote row) | 19 (idx 0-18) | % of Confirmed Cases that Completed fixed-duration MDT (denominator = Annual1) — correct version of the Annual2 formula |
| `Annual4` | Data | 6 (5 data rows) | 24 (idx 0-23) | Grade 2 Disability (G2D) at diagnosis, by age — "%" columns are actually rate-per-1,000,000 |
| `change_log` | Admin | 9 rows | 7 | Not imported. Documents template history (see below) |

**Frequency: Annual only** (all 5 data tabs represent one annual period; there is no monthly/quarterly breakdown for Leprosy).

**Rows per data sheet: 5** (1 region total + 4 sub-locations):
`1800000000 NIRA` (region total, Excel-formula rollup of the rows below) → `1804500000 Negros Occidental` → `1804600000 Negros Oriental` → `1806100000 Siquijor` → `1830200000 City of Bacolod (HUC)`.
Row order and PSGC codes are identical and consistently ordered across all 5 data sheets.

**No municipality/barangay rows at all** — unlike every other program analyzed so far (129 rows), Leprosy reporting appears to stop at province/HUC level.

**Config implication:** Use one config with `sheet_map: {"annual": "Annual"}` and `extra_sheets: [Annual1, Annual2, Annual3, Annual4]` — exactly the pattern already implemented for `nut_mam_sam_annual.json`.

---

## Age / Sex Disaggregation

- Age brackets: 0–14 y.o., 15–18 y.o., 19 y.o. and above, plus an "All ages" rollup — present in every sheet.
- Sex: Male/Female for every raw count, consistent with all other programs.
- Denominator types used in this file (extends the "Denominator Registry" from `fhsis_template_analysis.md`):
  - **D1 (Projected Population, age-specific)** — `Annual`, `Annual1`, `Annual4` (0-14, 15-18, 19+, Total).
  - **New D5 — Cross-sheet indicator reference**: `Annual2` and `Annual3` do NOT carry their own population; their percentage denominators are the Confirmed Cases totals from `Annual1`. This is a new denominator pattern — the config's `denominator_code` must point to an indicator seeded from a different sheet/config block.

---

## Column Inventory

Indexes are 0-based (pandas/Excel column position) — the parser trusts index, not header text.

### Sheet `Annual` — Registered Cases + Newly Detected Cases

| Idx | Label (as written in file) | Type | Formula / Note |
|---|---|---|---|
| 0 | PSGC 10 | META (`psgc_column`) | — |
| 1 | Region | META | New column, always "NIRA" for every row (added per change_log for filtering) |
| 2 | Region, Province/City, Municipality | META (`location_column`) | — |
| 3 | Projected Population (0-14 yrs old) | RAW | — |
| 4 | Projected Population (15-18 yrs old) | RAW | Blank/NaN for every province row in this file |
| 5 | Projected Population (19 yrs and above) | RAW | Blank/NaN for every province row |
| 6 | Total Projected Population (All ages) | RAW | — |
| 7 | (blank spacer column) | SKIP | No header, no data |
| 8 | Registered Leprosy Cases 0-14 Male (a) | RAW | — |
| 9 | Registered Leprosy Cases 0-14 Female (b) | RAW | — |
| 10 | A. Total (a+b) | COMPUTED | col8 + col9 |
| 11 | Prevalence Rate (0-14) | COMPUTED | Excel formula = col10 / col3 — missing the *10,000 multiplier that the header promises and that siblings (idx 15, 19) use. See Flag 1. |
| 12 | Registered Leprosy Cases 15-18 Male (c) | RAW | — |
| 13 | Registered Leprosy Cases 15-18 Female (d) | RAW | — |
| 14 | B. Total (c+d) | COMPUTED | col12 + col13 |
| 15 | Prevalence Rate (15-18) | COMPUTED | col14 / col4 * 10,000 (correct) |
| 16 | Registered Leprosy Cases 19+ Male (e) | RAW | — |
| 17 | Registered Leprosy Cases 19+ Female (f) | RAW | — |
| 18 | C. Total (e+f) | COMPUTED | col16 + col17 |
| 19 | Prevalence Rate (19+) | COMPUTED | col18 / col5 * 10,000 (correct) |
| 20 | Registered Leprosy Cases, All ages, Male (g) | RAW | Entered independently — NOT computed as col8+col12+col16 in the source file. Could diverge from the per-age-group sum (see Flag 4). |
| 21 | Registered Leprosy Cases, All ages, Female (h) | RAW | Same caveat as idx 20 |
| 22 | D. Total (g+h) | COMPUTED | col20 + col21 (label "D" reused — see naming note) |
| 23 | Prevalence Rate (All Ages) | COMPUTED | col22 / col6 * 10,000 |
| 24 | (blank spacer column) | SKIP | — |
| 25 | Newly Detected Cases 0-14 Male | RAW | — |
| 26 | Newly Detected Cases 0-14 Female | RAW | — |
| 27 | D. Total (newly detected, 0-14) | COMPUTED | col25 + col26 |
| 28 | Case Detection Rate (0-14) | COMPUTED | col27 / col3 * 100,000 (correct) |
| 29 | Newly Detected Cases 15-18 Male | RAW | — |
| 30 | Newly Detected Cases 15-18 Female | RAW | — |
| 31 | E. Total (newly detected, 15-18) | BROKEN — see Flag 2 | Excel formula is col30 / col4 * 10,000 (a rate!) instead of col29 + col30 (a sum). Config MUST override with E_TOTAL = col29 + col30. |
| 32 | Case Detection Rate (15-18) | BROKEN — see Flag 2 | Excel formula is col31 / col4 * 100,000 — i.e. it divides the already-wrong "E.Total" by population again, compounding the error. Config MUST override with CDR_15_18 = E_TOTAL / col4 * 100,000. |
| 33 | Newly Detected Cases 19+ Male | RAW | — |
| 34 | Newly Detected Cases 19+ Female | RAW | — |
| 35 | F. Total (newly detected, 19+) | COMPUTED | col33 + col34 (correct, unlike idx31) |
| 36 | Case Detection Rate (19+) | COMPUTED | col35 / col5 * 100,000 (correct) |
| 37 | (blank spacer column) | SKIP | — |
| 38 | Total Newly Detected, All ages, Male | COMPUTED | col25 + col29 + col33 |
| 39 | Total Newly Detected, All ages, Female | COMPUTED | col26 + col30 + col34 |
| 40 | Total Newly Detected, All ages, Both Sexes | COMPUTED | col38 + col39 |
| 41 | Case Detection Rate (All Ages) | COMPUTED | col40 / col6 * 100,000 |

### Sheet `Annual1` — Confirmed Leprosy Cases

| Idx | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Region | META | Always "NIRA" |
| 2 | Region/Province/City/Municipality | META | — |
| 3-6 | Projected Population (0-14 / 15-18 / 19+ / Total) | RAW | Same 4 population columns repeated a 2nd time in this workbook |
| 7 | (blank spacer) | SKIP | — |
| 8 | Confirmed Cases 0-14 Male | RAW | — |
| 9 | Confirmed Cases 0-14 Female | RAW | — |
| 10 | A. Total | COMPUTED | col8+col9 — this is the denominator Annual2/Annual3 reference for the 0-14 % columns |
| 11 | Confirmed Cases 15-18 Male | RAW | — |
| 12 | Confirmed Cases 15-18 Female | RAW | — |
| 13 | A. Total (mislabeled — should read "B. Total") | COMPUTED | col11+col12 — denominator reference for 15-18 % |
| 14 | Confirmed Cases 19+ Male | RAW | — |
| 15 | Confirmed Cases 19+ Female | RAW | — |
| 16 | C. Total | COMPUTED | col14+col15 — denominator reference for 19+ % |
| 17 | Total Confirmed, All ages, Male | COMPUTED | col8+col11+col14 |
| 18 | Total Confirmed, All ages, Female | COMPUTED | col9+col12+col15 |
| 19 | Total Confirmed, All ages, Both Sexes | COMPUTED | Excel sums A.Total + "B".Total + C.Total (i.e. col10+col13+col16), mathematically identical to col17+col18 — denominator reference for the All-Ages % in Annual3 |

No rate/percentage columns in this sheet — it is purely raw+total confirmed counts, which the two "%" sheets below reference as denominators.

### Sheet `Annual2` — % of Confirmed Cases Treated

| Idx | Label | Type | Formula |
|---|---|---|---|
| 0-2 | PSGC / Region / Location | META | — |
| 3 | Confirmed Cases Treated 0-14 Male | RAW | — |
| 4 | ...Female | RAW | — |
| 5 | A. Total | COMPUTED | col3+col4 |
| 6 | % treated (0-14) | COMPUTED | col5 / Annual1.col10 (cross-sheet denominator) |
| 7 | Treated 15-18 Male | RAW | — |
| 8 | ...Female | RAW | — |
| 9 | A. Total (mislabeled, should be "B") | COMPUTED | col7+col8 |
| 10 | % treated (15-18) | COMPUTED | col9 / Annual1.col13 |
| 11 | Treated 19+ Male | RAW | — |
| 12 | ...Female | RAW | — |
| 13 | C. Total | COMPUTED | col11+col12 |
| 14 | % treated (19+) | COMPUTED | col13 / Annual1.col16 |
| 15 | Total Treated All ages Male | COMPUTED | col3+col7+col11 |
| 16 | Total Treated All ages Female | COMPUTED | col4+col8+col12 |
| 17 | Total Treated All ages Both Sexes | COMPUTED | col15+col16 |
| 18 | % of Confirmed Cases Treated (All Ages) | BROKEN — see Flag 3 | Excel formula: =IFERROR((R2/SUM(R2+Annual!#REF!)),0) — literally contains a dangling #REF! reference to a deleted range on the Annual sheet. Every row in this column evaluates to the Excel error string #ERROR!. Config MUST override with col17 / Annual1.col19 (this is exactly what the sibling sheet Annual3 already does correctly for the same metric shape). |

Footnote (row idx 7 of the sheet, non-blank in column 0): "Confirmed Leprosy Cases = Old + New Cases + Completed Treatment (fixed MDT + beyond)" — this text sits in the PSGC column and will be misidentified by the parser as a failed location lookup (see Flag 5).

### Sheet `Annual3` — % of Confirmed Cases that Completed Fixed-Duration MDT

Identical structure/index layout to `Annual2` (idx 0-18), same labels except "treated" → "completed fixed duration of MDT". The idx-18 percentage formula here is correct: col17 / Annual1.col19 (=IFERROR(R3/Annual1!T3,0)), confirming that Annual2's formula is a genuine unfixed regression (see change_log entry below), not an intentional different denominator. Same trailing footnote row as Annual2.

### Sheet `Annual4` — Grade 2 Disability (G2D) at Diagnosis

| Idx | Label | Type | Formula |
|---|---|---|---|
| 0-2 | PSGC / Region / Location | META | — |
| 3-6 | Projected Population (0-14/15-18/19+/Total) | RAW | 3rd occurrence of population data in this workbook |
| 7 | (blank spacer) | SKIP | — |
| 8 | New G2D 0-14 Male | RAW | — |
| 9 | ...Female | RAW | — |
| 10 | A. Total | COMPUTED | col8+col9 |
| 11 | "% of patients newly diagnosed with G2D (0-14)" | COMPUTED | col10 / col3 * 1,000,000 — mislabeled "%"; it is actually a rate per 1,000,000 population (WHO's standard G2D-rate presentation). See Flag 6. |
| 12 | New G2D 15-18 Male | RAW | — |
| 13 | ...Female | RAW | — |
| 14 | A. Total (mislabeled, should be "B") | COMPUTED | col12+col13 |
| 15 | "% G2D" (15-18) | COMPUTED | col14 / col4 * 1,000,000 (same mislabel) |
| 16 | New G2D 19+ Male | RAW | — |
| 17 | ...Female | RAW | — |
| 18 | C. Total | COMPUTED | col16+col17 |
| 19 | "% G2D" (19+) | COMPUTED | col18 / col5 * 1,000,000 |
| 20 | Total G2D All ages Male | COMPUTED | col8+col12+col16 |
| 21 | Total G2D All ages Female | COMPUTED | col9+col13+col17 |
| 22 | Total G2D All ages Both Sexes | COMPUTED | col20+col21 |
| 23 | "% G2D" (All ages) | COMPUTED | col22 / col6 * 1,000,000 |

---

## DQC Notes / Formulas Visible in the Sheet

- All prevalence/rate columns use IFERROR(..., 0) — Excel silently returns 0 on any division error (including divide-by-zero from blank population). The system should not replicate IFERROR→0; a missing denominator should yield None, not a false zero, so DQC over-threshold rules don't misfire and dashboards don't show fabricated "0%" for provinces with no population data.
- No explicit "Over X%" DQC flag columns exist anywhere in this file (unlike every other program documented, which has visible DQC Over 100%/200% columns). Suggested DQC rules to define in the config (based on epidemiological logic, not sourced from the sheet since none exist):
  - Newly Detected Cases ≤ Registered Cases per age group; also Registered (Annual) should be ≥ Confirmed (Annual1), and Confirmed (Annual1) should be ≥ Treated (Annual2) ≥ Completed MDT (Annual3) — mirrors the "dose sequence" DQC pattern used for OPV/DPT/PCV: Registered ≥ Confirmed ≥ Treated ≥ Completed MDT.
  - Treated % / Completed % over 100% (cannot treat/complete more people than are confirmed) — same 100% threshold logic already used for Vitamin A / Diarrhea / SBI files.
  - Prevalence/CDR/G2D-rate columns have no natural upper bound the way percentages do (rates per 10,000/100,000/1,000,000 can exceed the multiplier without being wrong), so an "over 200%" style threshold doesn't apply here — recommend a much higher sanity ceiling instead (e.g. flag if rate > population, which would indicate mis-scaled data) or skip automated DQC thresholds for rate columns and rely on the sequence checks above.

## `change_log` Sheet — Key History (context for the flags below)

The change log (not imported, but essential context) confirms several of the anomalies found above are known, partially-fixed issues, not just misreadings on our part:
- 2025-10-15: "Registered Leprosy Cases" replaced "Cases undergoing treatment" as the definition for the Annual sheet — i.e. it now includes all registered cases, not just those currently in treatment.
- 2025-10-15: Column B ("Region") added to all sheets for filtering purposes — explains the redundant NIRA column.
- 2025-10-15: Columns AJ–AY were deleted and replaced with the current L/P/T (Prevalence Rate) and U–X (Total + Prevalence, all ages) columns.
- 2026-01-12: "Annual sheet, Column L, P, T | Incorrect formula → Updated the formula" — this fix was incomplete: P and T got the *10,000 multiplier, but L (Prevalence Rate 0-14) still lacks it (Flag 1). The team believed this was fixed; it was not, fully.
- 2026-01-20: Annual1 columns R–T renamed to "Confirmed Leprosy Cases" (matches our finding).
- 2026-01-20: "Prevalence Column... added multiplier of 10,000 and remove the % symbol" and "CDR Column... Updated Multiplier to 100,000" — confirms 10,000 (prevalence) and 100,000 (CDR) are the intended, deliberate multipliers, supporting the recommendation to model these as formula_type: "rate" with rate_multiplier rather than "percentage".
- Row about "Transfer Sulu Province... to Region IX" — this references BARMM/Sulu, which has no connection to NIR (Negros Island Region). This looks like a change log entry copy-pasted from a different region's version of this same national template and never edited for the NIR context — worth flagging to the data owner as it's confusing/irrelevant noise in this specific file's history.

---

## Flags / Open Questions

**Flag 1 — Incomplete formula fix, Prevalence Rate (0-14), Annual col 11.** Formula is col10/col3 with no *10,000, while the sibling columns for 15-18 (col15) and 19+ (col19) correctly multiply by 10,000. The change_log shows the team attempted to fix exactly this in Jan 2026 but the fix didn't take for column L. Our config must define PREVALENCE_0_14 = REG_TOTAL_0_14 / POP_0_14 * 10000, ignoring the Excel formula.

**Flag 2 — Broken "E. Total" / Case Detection Rate (15-18), Annual cols 31–32.** These do not sum Male+Female newly-detected 15-18 cases at all; instead col31 computes a rate (Female/Pop*10,000) and col32 divides that rate by population again. This is the most serious bug found — the 15-18 Newly Detected group's Total and CDR are mathematically meaningless in the source file. Config must define E_TOTAL = NEWDET_15_18_MALE + NEWDET_15_18_FEMALE and CDR_15_18 = E_TOTAL / POP_15_18 * 100000 from scratch, matching the pattern correctly used for the 0-14 and 19+ groups.

**Flag 3 — #REF! error, Annual2 col 18 (% of Confirmed Cases Treated, All Ages).** Formula references a deleted range on the Annual sheet (Annual!#REF!), producing a literal #ERROR! in every row. The correctly-fixed sibling formula exists one tab over in Annual3 (col17/Annual1.col19). Config should use the Annual3-style formula for Annual2 as well.

**Flag 4 — "All ages" registered case counts (Annual cols 20-21) are independently entered, not derived.** Unlike the "Newly Detected, All ages" columns (idx 38-39, which ARE computed as the sum of the three age-group columns), the "Registered Cases, All ages" Male/Female counts are raw, separately-typed values in the source file. If an encoder updates one age group's count but forgets the "All ages" cell, the numbers will silently disagree. Recommend adding a DQC rule: flag if ALL_AGES_MALE != REG_0_14_MALE + REG_15_18_MALE + REG_19PLUS_MALE (same for Female).

**Flag 5 — Footnote row will generate a spurious parser error on Annual2/Annual3.** Both sheets have a trailing row (Excel row 8) with explanatory text ("Confirmed Leprosy Cases = Old + New Cases...") sitting in the PSGC column, which is not blank. Per parser.py's resolve_location_row/is_blank logic, a non-blank, non-numeric PSGC value that fails location lookup produces a "Location not found" error entry (not fatal, but will show up in every dry-run/upload of these two sheets and needs to be understood as expected noise, not a real data problem). No data_end_row/max_row config key currently exists in the parser to explicitly truncate before this row — worth considering as a small parser enhancement, or simply document it as an expected, ignorable error in the upload UI for this template.

**Flag 6 — "%" columns in Annual4 (and the Prevalence/CDR columns in Annual) are not percentages.** They use multipliers of 10,000 / 100,000 / 1,000,000 respectively (confirmed deliberate per change_log), so a naive formula_type: "percentage" + _PCT suffix (per adding_templates.md convention) would be wrong and would display nonsensical "1,200,000%" values. Recommend formula_type: "rate" with the appropriate rate_multiplier (10000 / 100000 / 1,000,000) and indicator codes ending in _RATE instead of _PCT. Note: no indicator in seed_indicators.py currently uses a non-default rate_multiplier — this file would be the first real use of that column, so it's worth double-checking the seeding/display code path actually honors it end-to-end before relying on it.

**Flag 7 — Population data is incomplete for age-specific denominators.** In every province/HUC row, the 15-18 and 19+ population columns are blank/NaN (only 0-14 population and Total population are filled in); only the region-total row (NIRA) shows literal 0s for those brackets. This means Prevalence Rate (15-18), Prevalence Rate (19+), CDR (15-18), CDR (19+), and G2D-rate (15-18)/(19+) cannot currently be computed for any individual province — they'll resolve to None (missing denominator) at the province level even though the parser is otherwise working correctly. This looks like a genuine DOH-POPCOM data gap (age-specific projections below the regional level may simply not exist yet), not a parser problem — but it should be confirmed with the encoder/DOH before assuming it will be filled in later.

**Flag 8 — Population entered redundantly in 3 of 5 tabs, with no reference Population sheet.** Unlike the Immunization files (which had a dedicated Population tab), this workbook repeats the same 4 population columns in Annual, Annual1, and Annual4, with no single source of truth and no reference sheet to reconcile against. Recommend treating one of them (probably Annual, since it's listed first and is the "primary" tab) as authoritative, and flagging (not necessarily blocking) if the other two tabs disagree for the same location/period.

**Flag 9 — Only province/HUC-level granularity; no city/municipality/barangay rows.** Every other program documented has 129 rows (region → province → city/municipality → barangay-under-Bacolod-HUC). This file has only 5 (region + 4 provinces/HUC). Need to confirm with the program manager whether this is:
(a) intentional — Leprosy case counts are simply too low/rare to report below province level, or
(b) a template limitation that should eventually be expanded to municipality level like other diseases.
This affects how "Data Availability" and drill-down views should behave for this template (they may need to gracefully disable municipality-level drill-down for Leprosy specifically).

**Flag 10 — "Region" filter column values are "NIRA", not "NIR".** Every existing config's location_aliases map uses "NIR", "Negros Island Region", "Negros Island Region (NIR)", "BARMM" → 1800000000. This file instead literally writes "NIRA" in its new Region column. Since PSGC (column 0) is always populated and used for lookup in this file, this doesn't currently break parsing — but it's worth asking the encoder whether "NIRA" is a deliberate regional abbreviation/code or a typo, for consistency across future infectious-disease templates.

**Flag 11 — Duplicate/reused letter labels ("A. Total" appears twice per sheet, "D. Total" used for two different metrics in Annual).** Cosmetic only (parser trusts index, not label), consistent with the label-inconsistency pattern already seen and resolved for prior programs, but worth a one-line note in the config's notes field so future maintainers aren't confused when comparing the config to the raw header text.

**Flag 12 (RBAC / sensitivity) — Is Leprosy a "sensitive" indicator?** memory-bank/CLAUDE.md's "Sensitive Indicators" section currently lists only HIV reactive cases and Syphilis reactive cases as requiring extra RBAC/aggregation-only restrictions. Leprosy is not currently listed, so per existing rules it would not be flagged is_sensitive = TRUE. However, Leprosy carries significant social stigma in Philippine communities, similar in spirit to HIV/Syphilis. Recommend explicitly confirming with the project owner whether Leprosy case-level data (especially Grade 2 Disability, which can be visibly identifying at small barangay/province scale) should also get is_sensitive = TRUE treatment before this template goes live, rather than assuming silence means "not sensitive."
