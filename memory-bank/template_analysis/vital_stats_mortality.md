# FHSIS Template Analysis - VITAL STATS / Mortality
## DOH-NIR CHD Health Statistics Dashboard
## Program: Vital Statistics > Mortality

**Purpose:** Document the structure of `morta_mmr_imr_nir.xlsx` before writing its parser config, following the format established in `memory-bank/fhsis_template_analysis.md`.
**Status:** Analyzed (1 of 1 file in `backend/data/VITAL_STATS/Mortality/`)
**Analyst:** Claude (file search agent)
**Known issue investigated:** `memory-bank/progress.md` -> "Pending Team Actions (Template Errors)" lists `morta_mmr_imr_nir.xlsx -- Fix col 33 label (d4 -> g4)`. Confirmed and fully explained below.

---

## File 1: `morta_mmr_imr_nir.xlsx`
**Tracks:** Two distinct headline indicators bundled in one workbook:
- **MMR** -- Maternal Mortality Ratio (direct + indirect maternal deaths per 100,000 live births), broken down by residency (Resident / Non-Resident / Res+NonRes) and maternal age band (10-14, 15-19, 20-49)
- **IMR** -- Infant Mortality Rate (infant deaths per 1,000 live births)

"NIR" in the filename is not a third indicator -- it is the region code (Negros Island Region). The file is region-scoped: `morta_mmr_imr_nir` = "Mortality, MMR & IMR, for NIR."

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| `Q1a` | Quarterly - data | MMR, Jan-Mar |
| `Q2a` | Quarterly - data | MMR, Apr-Jun |
| `Q3a` | Quarterly - data | MMR, Jul-Sep |
| `Q4a` | Quarterly - data | MMR, Oct-Dec |
| `Annual1` | Annual - data (rollup) | MMR annual; every raw cell is `=SUM(Q1a!..,Q2a!..,Q3a!..,Q4a!..)` |
| `Q1b` | Quarterly - data | IMR, Jan-Mar |
| `Q2b` | Quarterly - data | IMR, Apr-Jun |
| `Q3b` | Quarterly - data | IMR, Jul-Sep |
| `Q4b` | Quarterly - data | IMR, Oct-Dec |
| `Annual2` | Annual - data (rollup) | IMR annual; livebirths pulled from `Annual1`, deaths rolled up from `Q1b:Q4b` |
| `change_log` | Admin | NOT imported -- version history (see below) |

**Frequency:** Quarterly + Annual. No monthly tabs (unlike the Immunization files).
**Two parallel sheet families, not one:** the `a` suffix sheets (39 columns, MMR) and the `b` suffix sheets (6 columns, IMR) are structurally unrelated tables that happen to share the same workbook and the same row set. This is a materially different pattern from the single "Population"/"SAM" extra-sheet pairing seen in Nutrition (`nut_mam_sam_annual.json`) -- here the quarter/annual cycle itself is duplicated per family (5 "a" sheets + 5 "b" sheets), not just one extra static sheet.

**Rows per sheet:** 6 total = 1 header row + 5 data rows.
**This is a major structural difference from every other analyzed file.** Immunization/Nutrition files have 129 rows (region -> provinces -> cities/municipalities -> barangays under HUC). This Mortality file has only:
- Row 2: `NIR` region-level row -- this is a computed rollup row (`=SUM(D3:D6)` etc.), not a raw location entry
- Row 3: Negros Occidental (province)
- Row 4: Negros Oriental (province)
- Row 5: Siquijor (province)
- Row 6: City of Bacolod (HUC)

No city/municipality or barangay-level breakdown exists in this file -- MMR/IMR are reported at province + HUC granularity only.

### Age/Sex/Other Disaggregation
- No sex disaggregation (maternal death/infant death counts are not split Male/Female -- expected, since MMR is female-only and IMR counts are not sex-split in this template).
- MMR ("a") sheets: disaggregated by maternal age band: 10-14, 15-19, 20-49, plus a Total per group. Also disaggregated by residency: Resident, Non-Resident, Res+NonRes combined. Also split by death type: Direct vs Indirect vs Direct+Indirect combined.
- IMR ("b") sheets: no disaggregation at all -- single raw "Infant Deaths" count and a computed rate.

### Column Inventory -- "a" sheets (Q1a/Q2a/Q3a/Q4a/Annual1), 39 columns, 0-based index

**Admin / identifier columns**
| Col | Excel | Label | Type |
|---|---|---|---|
| 0 | A | PSGC 10 | META |
| 1 | B | Region | META |
| 2 | C | Region/PHIC (location name) | META |

**Denominator**
| Col | Excel | Label (as printed) | Type | Formula |
|---|---|---|---|---|
| 3 | D | `1a. Total Livebirths (a1+a2) (a3)` | RAW | -- (per-quarter entered value; Annual1 = `SUM(Q1a!D..Q4a!D)`) |

Note: `(a1+a2)` in the label is a leftover from a template revision -- see change_log below; the a1/Resident and a2/Non-Resident split was added then removed, but the header text retains the old formula-reference notation even though only the merged `a3` (Total) column exists now.

**Group b -- Direct Maternal Deaths, Resident**
| Col | Excel | Label code | Type | Formula |
|---|---|---|---|---|
| 4 | E | b1 (age 10-14) | RAW | -- |
| 5 | F | b2 (age 15-19) | RAW | -- |
| 6 | G | b3 (age 20-49) | RAW | -- |
| 7 | H | b4 (Total) | COMPUTED | `SUM(E,F,G)` |
| 8 | I | b5 (Ratio) | COMPUTED | `IFERROR((H/$D)*100000,0)` -- label text says "b4/a1*100,000" but formula denominator is D (a3/Total Livebirths), not a Resident-only livebirths column (a1 no longer exists) |

**Group c -- Direct Maternal Deaths, Non-Resident**
| Col | Excel | Label code | Type | Formula |
|---|---|---|---|---|
| 9 | J | c1 (10-14) | RAW | -- |
| 10 | K | c2 (15-19) | RAW | -- |
| 11 | L | c3 (20-49) | RAW | -- |
| 12 | M | c4 (Total) | COMPUTED | `SUM(J,K,L)` |
| 13 | N | c5 (Ratio) | COMPUTED | `IFERROR((M/$D)*100000,0)` -- label says "c4/a2*100,000" (a2 no longer exists), same stale-label pattern as col 8 |

**Group d -- Direct Maternal Deaths, Res+NonRes combined**
| Col | Excel | Label code | Type | Formula |
|---|---|---|---|---|
| 14 | O | d1 (10-14) | COMPUTED | `E+J` |
| 15 | P | d2 (15-19) | COMPUTED | `F+K` |
| 16 | Q | d3 (20-49) | COMPUTED | `G+L` |
| 17 | R | d4 (Total) | COMPUTED | `H+M` |
| 18 | S | d5 (Ratio) | COMPUTED | `IFERROR((R/$D)*100000,0)` -- label "d4/a3*100,000" -- this one is correct: numerator R=d4, denominator D=a3 |

**Group e -- Indirect Maternal Deaths, Resident**
| Col | Excel | Label code | Type | Formula |
|---|---|---|---|---|
| 19 | T | e1 (10-14) | RAW | -- |
| 20 | U | e2 (15-19) | RAW | -- |
| 21 | V | e3 (20-49) | RAW | -- |
| 22 | W | e4 (Total) | COMPUTED | `SUM(T,U,V)` |
| 23 | X | e5 (Ratio) | COMPUTED | `IFERROR((W/$D)*100000,0)` -- label says "e4/a1*100,000" (stale a1 reference, same pattern as col 8) |

**Group f -- Indirect Maternal Deaths, Non-Resident**
| Col | Excel | Label code | Type | Formula |
|---|---|---|---|---|
| 24 | Y | f1 (10-14) | RAW | -- |
| 25 | Z | f2 (15-19) | RAW | -- |
| 26 | AA | f3 (20-49) | RAW | -- |
| 27 | AB | f4 (Total) | COMPUTED | `SUM(Y,Z,AA)` |
| 28 | AC | f5 (Ratio) | COMPUTED | `IFERROR((AB/$D)*100000,0)` -- label says "f4/a2*100,000" (stale a2 reference) |

**Group g -- Indirect Maternal Deaths, Res+NonRes combined**
| Col | Excel | Label code | Type | Formula |
|---|---|---|---|---|
| 29 | AD | g1 (10-14) | COMPUTED | `T+Y` |
| 30 | AE | g2 (15-19) | COMPUTED | `U+Z` |
| 31 | AF | g3 (20-49) | COMPUTED | `V+AA` |
| 32 | AG | g4 (Total) | COMPUTED | `W+AB` |
| **33** | **AH** | **g5 (Ratio)** | **COMPUTED** | **`IFERROR((AG/$D)*100000,0)`** <-- SEE FLAG BELOW |

**Group h -- Maternal Deaths, Direct + Indirect, Res+NonRes combined (= headline MMR)**
| Col | Excel | Label code | Type | Formula |
|---|---|---|---|---|
| 34 | AI | h1 (10-14) | COMPUTED | `O+AD` |
| 35 | AJ | h2 (15-19) | COMPUTED | `P+AE` |
| 36 | AK | h3 (20-49) | COMPUTED | `Q+AF` |
| 37 | AL | h4 (Total) | COMPUTED | `SUM(AI,AJ,AK)` |
| 38 | AM | h5 (Ratio = MMR) | COMPUTED | `IFERROR((AL/$D)*100000,0)` -- label "h4/a3*100,000" -- correct |

### COLUMN 33 -- THE FLAGGED ISSUE, FULLY DIAGNOSED

**Cell:** `AH1` in sheets `Q1a`, `Q2a`, `Q3a`, `Q4a`, `Annual1` (identical text in all five).
**0-based column index:** 33
**Header text as printed in the file:**
```
Ratio

(d4/a3*100,000)

(g5)
```
**What it SHOULD say** (to be internally consistent with every other Ratio column in the file, and with what the underlying formula actually computes):
```
Ratio

(g4/a3*100,000)

(g5)
```

**Why this is wrong -- the pattern every other Ratio column follows:**
Each of the 7 "Ratio" columns in the file (I, N, S, X, AC, AH, AM) divides the Total column that immediately precedes it by the livebirths denominator (D, "a3"), and its label documents that pairing:

| Ratio col | Numerator (preceding Total) | Label says | Formula uses | Label correct? |
|---|---|---|---|---|
| I (8) | H = b4 | b4/a1 | H/D | label stale (a1 gone) but numerator right |
| N (13) | M = c4 | c4/a2 | M/D | label stale (a2 gone) but numerator right |
| S (18) | R = d4 | d4/a3 | R/D | correct |
| X (23) | W = e4 | e4/a1 | W/D | label stale but numerator right |
| AC (28) | AB = f4 | f4/a2 | AB/D | label stale but numerator right |
| AH (33) | AG = g4 | d4/a3 (WRONG) | AG/D | numerator in label is wrong, not just stale |
| AM (38) | AL = h4 | h4/a3 | AL/D | correct |

Column AH (index 33) is the ratio for Group g (Indirect Maternal Deaths, Res+NonRes) -- its own preceding Total column is AG (g4). Instead of reading "g4/a3", the label text was copy-pasted from column S (the Group d / Direct-deaths-Res+NonRes ratio, "d4/a3") and only the trailing formula-reference tag was updated to "(g5)" -- the numerator variable name "d4" was never changed to "g4". This is a label-text-only bug: the underlying Excel formula (`=IFERROR((AG2/$D2)*100000,0)`) is computed correctly (it does use AG/g4, not R/d4) -- a spot check on `Q1a` row 4 (Negros Oriental) confirms `AG4 = SUM(W4,AB4)` and `AH4 = IFERROR((AG4/$D4)*100000,0)`, i.e., the formula genuinely references AG (g4), matching every other group's own-total-over-livebirths pattern.

**Net effect / risk:** Because the parser is told to trust column index, not header label, this bug does NOT silently corrupt ingested data -- column 33 will correctly be mapped to "Indirect Maternal Deaths Ratio (Res+NonRes)" (i.e., the g5 value) as long as the config uses `index: 33` and never derives meaning from the header text. The risk is entirely on the documentation / indicator naming side: anyone skimming the raw header (e.g., a program manager, or a future dev writing the config from the header text instead of tracing formulas) would misidentify column 33 as a duplicate of the Direct-deaths ratio (column 18) rather than the Indirect-deaths ratio it actually is. This matches the `progress.md` note verbatim: "Fix col 33 label (d4 -> g4)" -- the fix is a one-word text edit in the Excel template header cell, changing "d4" to "g4"; no formula change needed.

### Column Inventory -- "b" sheets (Q1b/Q2b/Q3b/Q4b/Annual2), 6 columns

| Col | Excel | Label | Type | Formula |
|---|---|---|---|---|
| 0 | A | PSGC 10 | META | -- |
| 1 | B | Region | META | -- |
| 2 | C | Region/PHIC (location name) | META | -- |
| 3 | D | `1. Total Livebirths (a)` | REFERENCE | `=Q1a!D<row>` (quarterly sheets) or `=Annual1!D<row>` (Annual2) -- cross-sheet pull from the "a"/MMR family, not independently entered. Same livebirths value as MMR column D. |
| 4 | E | `2. Infant Deaths (e)` | RAW | -- (Annual2: `=SUM(Q1b!E,Q2b!E,Q3b!E,Q4b!E)`) |
| 5 | F | `Rate (e/a*1,000)` | COMPUTED (= IMR) | `IFERROR((E/$D)*1000,0)` -- label matches formula correctly, no error found here |

### Sheet Header Consistency Check
- `Q1a`, `Q2a`, `Q3a` headers are byte-identical.
- `Q4a` header differs at column 3 (D1) only: it reads "1a. Livebirths (Total) (a3)" instead of "1a. Total Livebirths (a1+a2) (a3)" -- cosmetic wording cleanup (dropped the stale "(a1+a2)" reference), not a structural difference. Data type/position unaffected.
- `Q1b`-`Q4b` headers are byte-identical to each other.
- No merged cells detected in any data sheet (headers are plain multi-line text in single cells, newline-separated).

### DQC (Data Quality Check) Notes
No explicit DQC/flag columns exist in this file -- unlike every Immunization/Nutrition/Sick file, there is no "Remarks" or "DQC Over X%" column at the end of the sheet. The only quality signal present is the `IFERROR(...,0)` guard on every ratio formula (protects against divide-by-zero when livebirths = 0, silently returning 0 instead of #DIV/0!).

Suggested DQC rules to define in the parser config (none pre-exist in the template, must be authored fresh):
- Flag if Infant Deaths (E, "b" sheets) > 0 while Total Livebirths (D) = 0 (impossible ratio, currently silently zeroed by IFERROR)
- Flag if Maternal Deaths Total (col 37, h4) > 0 while Livebirths (col 3) = 0, same reasoning
- Sanity/sequence check: Direct (col 17, d4) + Indirect (col 32, g4) should equal combined Total (col 37, h4) -- already enforced by formula, but worth a config-level cross-check in case of future manual overrides
- Consider an "implausibly high MMR/IMR" outlier threshold (no such threshold exists in the raw template, unlike the 100%/200% caps seen elsewhere)

### change_log Sheet (Admin -- NOT imported)
| Version | Date | Changed By | Field Affected | Note |
|---|---|---|---|---|
| 1.1 (postrelease) | 01/20/2026 | Dexter Flores | Total Livebirths for MMR (Q1 to Annual) | Added Resident/Non-Resident disaggregation of Livebirths per released metadata |
| 1.1 (postrelease) | 03/30/2026 | Jane Galo | Total Livebirths for MMR (Q1 to Annual) | Reverted -- removed the Res/NonRes livebirths split |

This log directly explains the stale "(a1+a2)" fragment still sitting in the column-3 header text in Q1a-Q3a: the split was added, then removed, but the header wording was not fully cleaned up in every quarterly sheet (Q4a shows the cleaned-up version, so the fix was partially applied going forward but not backported to Q1a-Q3a/Annual1).

### Raw Inputs to Store (per location per period)
**"a"/MMR family:**
1. Total Livebirths (col 3)
2. Direct MD Resident 10-14, 15-19, 20-49 (cols 4,5,6)
3. Direct MD Non-Resident 10-14, 15-19, 20-49 (cols 9,10,11)
4. Indirect MD Resident 10-14, 15-19, 20-49 (cols 19,20,21)
5. Indirect MD Non-Resident 10-14, 15-19, 20-49 (cols 24,25,26)

**Total raw inputs (MMR): 13 per location per period** (1 livebirths + 12 age/residency/type death counts). All Total and Ratio columns (18 of them) are COMPUTED, not stored as raw.

**"b"/IMR family:**
1. Infant Deaths (col 4) -- the only true raw input; Livebirths (col 3) is a reference pull from the "a" family, not a separate raw entry.

**Total raw inputs (IMR): 1 per location per period** (plus the shared Livebirths value already captured via MMR).

### Proposed indicator_code / config Notes (for adding_templates.md Step 1-2)
- Percentage-style convention does not quite fit -- these are ratios/rates per 100,000 / per 1,000, not percentages. Recommend `formula_type: "ratio_per_100000"` and `"ratio_per_1000"` (or reuse existing rate machinery if the codebase already has one -- worth checking `seed_indicators.py` for a `rate_multiplier` field, which `adding_templates.md` mentions exists).
- The `_TOTAL`/`_PCT` naming convention from `adding_templates.md` does not map cleanly onto `_RATIO` outputs -- needs a decision on suffix convention (e.g., `MORTA_MMR_RATIO` vs `MORTA_MMR_PCT`) before seeding indicators, since the dashboard Coverage page logic explicitly special-cases `_PCT -> _TOTAL` derivation.
- This file needs two sheet families in one config (like `extra_sheets` in `nut_mam_sam_annual.json`), but unlike that example, both families repeat across Q1-Q4+Annual, not just once. The current `extra_sheets` schema (a single fixed `sheet_name`) does not obviously support a second periodic cycle. Likely needs either:
  (a) two independent template configs (e.g. `morta_mmr.json` targeting `Q1a..Annual1`, `morta_imr.json` targeting `Q1b..Annual2`), each with its own `sheet_map`, or
  (b) a parser enhancement letting `sheet_map` carry a per-family suffix ("a"/"b") so one config can address both.
  This is a design decision to raise before writing the config, not something to resolve unilaterally in this analysis.

### Flags / Open Questions

**FLAG M1 -- Column 33 label bug (the known issue), root-caused.** Header text at column index 33 (`AH1`, all `Q*a`/`Annual1` sheets) reads "Ratio (d4/a3*100,000) (g5)" but should read "Ratio (g4/a3*100,000) (g5)" -- it wrongly displays the Direct-deaths numerator ("d4") on what is actually the Indirect-deaths ratio column. Confirmed the underlying formula (`=IFERROR((AG2/$D2)*100000,0)`) is correct and genuinely uses AG (g4); only the printed label text is wrong. Not a data-corruption risk if the parser config uses column index 33 (not the label) -- but a real risk for whoever writes the config/indicator name for that column, and for anyone reading the raw file. Action already tracked in `progress.md` (team to fix template text "d4 -> g4"); config should be written using formula-derived meaning (Indirect MD Ratio, g5), not the on-screen label.

**FLAG M2 -- Stale "a1/a2" references throughout labels.** Columns 8, 13, 23, 28 (b5, c5, e5, f5 ratios) all still reference livebirths sub-splits "a1" (Resident) / "a2" (Non-Resident) in their label text, per the change_log these splits were removed on 2026-03-30 and merged back into single column "a3" (col 3). Only the formulas were updated to use $D (a3); the header text was not fully cleaned up (Q4a's column-3 header shows a later, cleaner wording, but the ratio column labels referencing a1/a2 were not corrected anywhere). Lower severity than FLAG M1 (these are stale-but-plausible variable names, not a wrong indicator reference), but worth a single template-wide sweep since it is the same root cause (change_log entry) as column 33.

**FLAG M3 -- No municipal/barangay granularity.** Unlike every other analyzed FHSIS file (129 rows down to barangay level), this file has only 5 data rows: one computed region rollup (row 2, "NIR") + 3 provinces + 1 HUC (rows 3-6). Need to confirm with program owner whether Mortality is genuinely never collected below province/HUC level (plausible -- MMR/IMR are rare-event ratios where sub-provincial counts would be statistically unstable and small-number-suppression may apply), or whether this specific file is a truncated/regional export and a fuller version exists elsewhere.

**FLAG M4 -- Row 2 is a computed rollup, not a raw location.** `data_start_row` per adding_templates.md convention would normally point straight at real raw data. Here, the first data row (Excel row 2) is a SUM() of the rows below it (the NIR regional total), not an independent location entry. Config must either (a) skip this row entirely on ingestion since it is fully derivable client-side, or (b) explicitly store it as a "NIR aggregate" location row (distinguishing it from the real provincial locations) -- needs a decision, since blindly ingesting it as a normal location row would double count if the dashboard also auto-sums the provinces.

**FLAG M5 -- Dual sheet-family structure needs a config-design decision before Step 2 of adding_templates.md.** See "Proposed indicator_code / config Notes" above -- this is the first Vital Stats file and the first file where two structurally distinct indicator tables (39-col MMR vs 6-col IMR) repeat across the same Q1-Q4+Annual cycle in one workbook. Existing `extra_sheets` mechanism (seen in Nutrition MAM/SAM) does not cover "repeats every quarter" -- needs either two template configs or a parser enhancement.

**FLAG M6 -- Sensitivity/RBAC check.** Cross-referenced against CLAUDE.md "Sensitive Indicators" section (HIV reactive cases, Syphilis reactive cases only). Maternal and infant mortality counts are not on that list, so no extra RBAC flag (`is_sensitive`) is required for this file's indicators under current project rules. Flagging only to note the check was explicitly done, since mortality data can be considered sensitive in other contexts -- confirm this reading with the program owner if in doubt, since counts this small (some provinces show 0 deaths per quarter) could arguably be re-identifiable at high resolution, though that risk is much lower here given the file stops at province/HUC level (FLAG M3).

**Open question (not a bug, needs confirmation from DOH/encoder):** Should Group h (columns 34-38, Direct+Indirect combined MMR) be the only "headline" MMR indicator surfaced on dashboards, with Groups b/c/d/e/f/g stored only as supporting detail? The Immunization precedent (adding_templates.md) suggests yes (store everything as raw/computed per config, let dashboard pages choose what to surface), but worth confirming which single ratio is "the" published MMR figure for NIR reporting purposes.

---

*Analysis based on direct inspection of `backend/data/VITAL_STATS/Mortality/morta_mmr_imr_nir.xlsx` via openpyxl (formulas, not cached values) on 2026-07-05.*
