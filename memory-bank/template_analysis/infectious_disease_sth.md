# FHSIS Template Analysis — Addendum
## Program: Infectious Disease > STH (Soil-Transmitted Helminthiasis)

**Note:** No prior entry for this program exists in `memory-bank/fhsis_template_analysis.md` — this is the first documentation pass for the STH sub-folder of `INFECTIOUS_DISEASE`.

**Files in this group (2 analyzed):**
| # | Filename | Tracks | Status |
|---|---|---|---|
| 1 | `infec_sth_deworm_services_nir.xlsx` | Children/adolescents dewormed via Mass Drug Administration (MDA), School-based vs Community-based | Analyzed |
| 2 | `infec_sth_screen_susp_confirm_treated_nir.xlsx` | STH care cascade: Screened → Suspected → Confirmed → Treated, all ages | Analyzed |

**RBAC/Sensitivity check (CLAUDE.md "Sensitive Indicators"):** Neither file contains HIV or Syphilis reactive-case data. **No `is_sensitive` flags apply to any indicator in this group.** (The HIV/Syphilis/HepaB sensitive files live in the sibling `HIV-Syphilis-HepaB` folder, not here.)

---

## File 1: `infec_sth_deworm_services_nir.xlsx`
**Tracks:** Number of children/adolescents dewormed during MDA rounds, split by School-based (SB) vs Community-based (CB) delivery, for 3 age groups (1-4, 5-14, 15-19).

### Sheet Structure
| Sheet | Type | Rows | Cols | Notes |
|---|---|---|---|---|
| `Qtr1` | Data (real) | 6 (5 data) | 26 | January MDA round, NIR-region format (no SBI 15-19 group) — **has actual non-zero data** |
| `Qtr2` | Data (blank) | 6 | 26 | January MDA round, NIR-region format — all zeros |
| `Qtr3` | Legacy/unused | 143 | 29 | January MDA round, **nationwide** DOH master template (Philippines, NCR, all regions) — all zero/blank, still has the SBI 15-19 (Group C) columns |
| `Qtr4` | Legacy/unused | 143 | 29 | Same as Qtr3 |
| `Qtr1a` | Legacy/unused | 143 | 29 | July MDA round, nationwide template — all zero/blank |
| `Qtr2a` | Legacy/unused | 143 | 29 | Same as Qtr1a |
| `Qtr3a` | Data (blank) | 6 | 26 | July MDA round, NIR-region format — all zeros (round not yet reported) |
| `Qtr4a` | Data (blank) | 6 | 26 | Same as Qtr3a |
| `Annual` | Data (real) | 6 | 29 | January MDA rollup — retains SBI 15-19 (Group C) columns but **C.Total formula is `#REF!` for every row** |
| `Annual1` | Data (blank) | 6 | 26 | July MDA rollup — all zeros |
| `change_log` | Admin | 4 | 7 | Not imported |

**Frequency:** Effectively semestral (2 MDA rounds/year: January, July), presented via Qtr1–Qtr4 + Annual tab names, not true calendar quarters.
**Geographic depth:** Region (NIRA) + 3 provinces (Negros Occidental, Negros Oriental, Siquijor) + City of Bacolod (HUC) = **5 rows only**. This is coarser than the Immunization files (129 rows down to barangay level) — deworm data is only reported at province/HUC level, not city/municipality/barangay.

### Age Groups
1–4 years, 5–14 years, 15–19 years (adolescent).

### Column Inventory (NIR "active" 26-col format — Qtr1/Qtr2/Qtr3a/Qtr4a/Annual1)

| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Region | META | In `Qtr1` only, this header cell literally contains `0.0` instead of "Region" — a template glitch, harmless for the parser since index is trusted, not label |
| 2 | Region, Province/City, Municipality | META | — |
| 3 | Projected Population (1–4 yrs) | RAW | Denominator for A/D% |
| 4 | Projected Population (5–14 yrs) | RAW | **Blank/NaN for every single location row in every sheet** — see flag below |
| 5 | Projected Population (15–19 yrs) | RAW | Denominator for F% |
| 6 | *(blank spacer)* | — | None |
| 7 | Dewormed 1-4 SB Male | RAW | — |
| 8 | Dewormed 1-4 SB Female | RAW | — |
| 9 | A. Total | COMPUTED | col[7]+col[8] |
| 10 | Dewormed 5-14 SB Male | RAW | — |
| 11 | Dewormed 5-14 SB Female | RAW | — |
| 12 | B. Total | COMPUTED | col[10]+col[11] |
| 13 | *(blank spacer)* | — | (Group "C" — SBI 15-19 School-based — was removed here per change_log; letters jump A,B,→D,E,F) |
| 14 | Dewormed 1-4 CB Male | RAW | — |
| 15 | Dewormed 1-4 CB Female | RAW | — |
| 16 | D. Total | COMPUTED | col[14]+col[15] |
| 17 | D. Percentage (1-4 via CB) | COMPUTED | `IFERROR(col16/col3,0)` |
| 18 | Dewormed 5-14 CB Male | RAW | — |
| 19 | Dewormed 5-14 CB Female | RAW | — |
| 20 | E. Total | COMPUTED | col[18]+col[19] |
| 21 | E. Percentage (5-14 via CB) | COMPUTED | `IFERROR(col20/col4,0)` — denominator col4 is always blank, so this **always evaluates to 0**, masking real coverage |
| 22 | Dewormed 15-19 CB Male | RAW | — |
| 23 | Dewormed 15-19 CB Female | RAW | — |
| 24 | F. Total | COMPUTED | col[22]+col[23] |
| 25 | F. Percentage (15-19 via CB) | COMPUTED | `IFERROR(col24/col5,0)` |

**No Remarks or DQC columns exist anywhere in this file** — a clear departure from every Immunization/Nutrition/Mgt-of-Sick file previously documented, all of which end with Remarks + DQC flag columns. Only conditional formatting (`containsBlanks` highlight rule) is present, not formula-based DQC.

The 29-col legacy variant (Qtr3/Qtr4/Qtr1a/Qtr2a/Annual) inserts a Group C (SBI 15-19 School-based: Male/Female/Total) between B.Total and the blank spacer, shifting everything after by +3 columns.

Row structure confirmed via formulas: row 1 (NIRA) = `=SUM(row2:row5)` of the 4 sub-rows (3 provinces + Bacolod HUC) — same top-down aggregation pattern as Immunization files.

### DQC Rules
None found as explicit columns. Only Excel conditional formatting (highlights blank cells).

### Raw Inputs to Store
1. Projected Population 1-4
2. Projected Population 5-14 (currently unpopulated in source data)
3. Projected Population 15-19
4–15. Dewormed Male/Female × {1-4, 5-14, 15-19} × {SB, CB} = 12 raw fields

**Total raw inputs: 15 per location per period**

### Open Questions / Flags — File 1
- **F1-1 (confirmed bug):** `Annual` sheet's C.Total (SBI 15-19 School-based) formula returns `#REF!` for every row. Root cause: change_log entry (2026-04-13) says "SBI 15-19 yrs old ... Remove, no SBI indicator for 15-19 years old" — this column was deleted from the source range in the NIR-format tabs, but the `Annual` tab's C.Total formula still points at the now-deleted range. `Annual1` (July round) does not have this problem because it was rebuilt as the clean 26-col format. **`Annual` needs its own formula/structure fix or should be excluded from ingestion until fixed.**
- **F1-2:** Projected Population (5-14 yrs) is blank across every location in every sheet. Any indicator using it as a denominator (E.Percentage) will silently compute 0% rather than surfacing a data gap. Needs a decision: treat as a genuine missing-data condition (store NULL, not 0) or chase down the correct population figures.
- **F1-3:** The workbook contains 6 of 11 sheets (Qtr3, Qtr4, Qtr1a, Qtr2a plus effectively duplicate structure in Qtr2/Qtr3a/Qtr4a/Annual1) that are either (a) a leftover **nationwide** 143-row DOH master template with zero data relevant to NIR, or (b) NIR-format tabs that are simply unfilled (round not yet reported). It's unclear whether the parser should even attempt to ingest the 143-row nationwide sheets — recommend excluding Qtr3/Qtr4/Qtr1a/Qtr2a from `sheet_map` entirely and confirming with the encoder whether they're vestigial.
- **F1-4:** The "quarterly" sheet names (Qtr1-Qtr4/Qtr1a-Qtr4a) do not correspond to calendar quarters — they all display the same January-MDA or July-MDA round header text regardless of tab number. This program appears to be semestral, not quarterly, and the `sheet_map` should reflect actual reporting periods (e.g., January round → one period, July round → another), not 4 distinct quarters.
- **F1-5:** Geographic depth here (5 rows: region + 3 provinces + 1 HUC) is much coarser than Immunization/Nutrition files (129 rows to barangay level). Confirm this is intentional for MDA reporting (province/HUC-level only) and not a truncated file.

---

## File 2: `infec_sth_screen_susp_confirm_treated_nir.xlsx`
**Tracks:** The full STH care cascade — Screened → Suspected → Confirmed → Treated — across 5 age groups (1-4, 5-14, 15-19, 20-59, 60+), all ages, both sexes.

### Sheet Structure
20 data sheets (4 cascade stages × [Qtr1–Qtr4 + Annual]) + `change_log`.

| Group suffix | Stage | Sheets | Cols | Rows |
|---|---|---|---|---|
| *(none)* | **Screened** | Qtr1, Qtr2, Qtr3, Qtr4, Annual | 34 | 6 (5 data) |
| `a` | **Suspected** | Qtr1a–Qtr4a, Annual1 | 36 | 6 |
| `b` | **Confirmed** | Qtr1b–Qtr4b, Annual2 | 36 | 6 |
| `c` | **Treated** | Qtr1c–Qtr4c, Annual3 | 34 | 6 |

**Geographic depth:** Same coarse 5-row structure as File 1 (NIRA + 3 provinces + Bacolod HUC).
**Data status:** Every sheet is all-zero for the reporting period examined **except** `Qtr1c` (Treated), which shows `1` treated case (age 1-4, Male, Resident) for both the NIRA total row and the Negros Occidental row — see flag below.

### Age Groups
1-4, 5-14, 15-19, 20-59, 60+ (5 groups) plus an "All ages" aggregate population column (Screened sheets only) and a Total/Grand-total roll-up (F group) in every stage.

### Column Inventory — Stage 1: Screened (34 cols)
| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Region | META | — |
| 2 | Region, Province/City, Municipality | META | — |
| 3 | Projected Population (1-4) | RAW | Denominator A% |
| 4 | Projected Population (5-14) | RAW | Blank/NaN for every row (same recurring gap as File 1) |
| 5 | Projected Population (15-19) | RAW | Denominator C% |
| 6 | Projected Population (20-59) | RAW | Denominator D% |
| 7 | Projected Population (60+) | RAW | Denominator E% |
| 8 | All ages (total population) | RAW | Independent figure — **not** the sum of cols 3-7 (verified: sums don't reconcile) — denominator for F% |
| 9 | *(blank spacer)* | — | — |
| 10 | Screened 1-4 Male | RAW | — |
| 11 | Screened 1-4 Female | RAW | — |
| 12 | A. Total | COMPUTED | col10+col11 |
| 13 | A. Percentage | COMPUTED | col12/col3 |
| 14 | Screened 5-14 Male | RAW | — |
| 15 | Screened 5-14 Female | RAW | — |
| 16 | B. Total | COMPUTED | col14+col15 |
| 17 | B. Percentage | COMPUTED | col16/col4 — header literally says **"% SCREENED 5-19 y.o"** but the group is 5-14 and the formula correctly divides by col4 (Pop 5-14); label is wrong, formula is right |
| 18 | Screened 15-19 Male | RAW | — |
| 19 | Screened 15-19 Female | RAW | — |
| 20 | C. Total | COMPUTED | col18+col19 |
| 21 | C. Percentage | COMPUTED | col20/col5 |
| 22 | Screened 20-59 Male | RAW | — |
| 23 | Screened 20-59 Female | RAW | — |
| 24 | D. Total | COMPUTED | col22+col23 |
| 25 | D. Percentage | COMPUTED | col24/col6 |
| 26 | Screened 60+ Male | RAW | — |
| 27 | Screened 60+ Female | RAW | — |
| 28 | E. Total | COMPUTED | col26+col27 |
| 29 | E. Percentage | COMPUTED | col28/col7 |
| 30 | Total Screened Male | COMPUTED | sum of male cols across all 5 age groups (10,14,18,22,26) — **not a raw field** |
| 31 | Total Screened Female | COMPUTED | sum of female cols (11,15,19,23,27) |
| 32 | F. Total (grand total screened) | COMPUTED | sum of A–E Totals (12,16,20,24,28) |
| 33 | F. Percentage | COMPUTED | col32/col8 (All ages population) |

### Column Inventory — Stage 2: Suspected (36 cols, `a` sheets)
Same 5-age-group + F-total layout, shifted to start at col 3 (no population columns of its own — cross-references the Screened sheet):
- Age-specific % (cols 6,10,14,18,22): `IFERROR(Total/'Qtr1'!<pop col for that age>,0)` — i.e., **denominator = Population, not Screened count.** Per `change_log` (Oct 13, 2025): this was a deliberate fix — suspected cases (signs/symptoms only, no microscopy) shouldn't be measured against the screened cohort.
- F. Percentage (col 26): `IFERROR(col25/'Qtr1'!AG2,0)` — correctly divides Suspected grand total by Screened grand total.
- Cols 28-33: Resident vs Non-Resident Male/Female + G.Total/H.Total (all RAW except totals COMPUTED).
- Col 35: **DQC** `=IF(Z2=SUM(AE2,AH2),"TRUE","FALSE")` i.e. checks F.Total (col25) = G.Total(col30)+H.Total(col33).

### Column Inventory — Stage 3: Confirmed (36 cols, `b` sheets)
Structurally identical to Suspected, but:
- Age-specific % (cols 6,10,14,18,22): `IFERROR(Total/'Qtr1'!<Screened total col for that age>,0)` — denominator = **Screened Total**, not Suspected.
- **F. Percentage (col 26): `=IFERROR(Z2/'Qtr1'!Z2,0)`** — this divides Confirmed grand total by **`'Qtr1'!Z2`, which is the *Screened sheet's* "% Screened 20-59" percentage value (col25)**, not a raw total. The Suspected sheet's equivalent formula correctly references `'Qtr1'!AG2` (Screened F.Total, the actual grand-total count). This looks like a copy-paste/column-shift error: whoever built the Confirmed sheet's Total% formula off the Suspected sheet's pattern forgot that the Screened sheet's F.Total lives at column AG (index 32, because Screened has 7 extra leading population columns) rather than column Z (index 25, where F.Total sits in the Suspected/Confirmed/Treated sheets themselves). **This produces a nonsensical Confirmed-Total% (dividing a count by a fraction) and should be fixed in config, not trusted from the template.**
- Col 35: same DQC (G+H)=F check.

### Column Inventory — Stage 4: Treated (34 cols, `c` sheets — no DQC column)
Structurally identical to Confirmed/Suspected up through col 33 (H.Total), but:
- % formulas reference `Qtr1b!<col>` (the Confirmed sheet, same column position each time, e.g. col6 = `IFERROR(F2/Qtr1b!F2,0)`) — i.e. Treated % = Treated / Confirmed for that same age group. This one is internally consistent because Treated and Confirmed share the same column layout (no leading population columns to misalign), unlike the Confirmed→Screened cross-reference bug above.
- **No DQC "(G+H)=F" column exists in the Treated sheets** — present in Suspected and Confirmed, absent here. Inconsistency worth flagging (may be intentional since it's the last stage, or may be an oversight).

### DQC Rules
- Suspected & Confirmed sheets: `(Resident Total + Non-Resident Total) = Grand Total` check, evaluates TRUE/FALSE (all currently TRUE since all zero, so untested against real data)
- No over-100%/over-200% coverage threshold DQC anywhere in this file (unlike Immunization/Nutrition files)
- No DQC at all in Screened or Treated stages

### Change Log Findings (directly relevant to schema/config)
The `change_log` sheet documents:
1. (Oct 13, 2025) Suspected % formula deliberately changed from `suspected/screened` to `suspected/projected population` — **confirms** the cross-sheet reference pattern found above is intentional, not a bug.
2. (2026-02-13) An entry for "Qtr1c-Annual3 / Qtr1b-Annual2" says *"Update the formula, incorrect should be suspect for the denominator"* — this suggests Confirmed and/or Treated percentage denominators were **meant** to reference the **Suspected** total, but the actual formulas found in `Qtr1b` (Confirmed) still reference **Screened** totals (`'Qtr1'!M2/P2/U2/Y2/AC2`), not Suspected (`Qtr1a`). This is either (a) the fix was never fully applied, or (b) the note refers to something else entirely. **This is the single most important open question for indicator/denominator mapping in this file — needs direct confirmation from the encoder (Jane Galo) on which stage should divide by which.**
3. (2026-04-01) "Qtr2-Annual: No All ages in Population column → Add all ages column" — confirms col 8 ("All ages") was a recent addition, consistent with what's observed.

### Data Anomaly Found (real data, not template artifact)
In the period examined, `Qtr1b` (Confirmed) shows **0 confirmed STH cases** for every location, but `Qtr1c` (Treated) shows **1 treated case** (age 1-4, Male, Resident) for both the **NIRA regional total row and the Negros Occidental row**. This is logically inconsistent — a case cannot be recorded as treated if zero cases were confirmed in the same period/location. This is a genuine data-entry error in the source workbook, not a formula/label issue, and is a strong candidate for a DQC rule ("Treated ≤ Confirmed per age group") that doesn't currently exist anywhere in the template.

### Raw Inputs to Store
- **Screened:** 5 populations (1 blank/5-14) + 10 raw counts (5 ages × M/F) = 15
- **Suspected:** 10 raw counts + 4 raw Resident/Non-Resident counts = 14
- **Confirmed:** 14 (same shape as Suspected)
- **Treated:** 14 (same shape, no DQC col)

**Total raw inputs: 57 per location per period** (across all 4 cascade stages)

### Open Questions / Flags — File 2
- **F2-1 (needs encoder confirmation):** Which stage's percentage should divide by which denominator? Screened→Population (confirmed by formula + change log), Suspected→Population (confirmed by change log), Confirmed→**Screened** (per current formula) or **Suspected** (per change log note) — ambiguous, resolve before finalizing `denominator_source` in seed_indicators.
- **F2-2 (confirmed bug):** Confirmed sheet's aggregate F.Percentage divides by a percentage value instead of a count (`'Qtr1'!Z2` instead of `'Qtr1'!AG2`). System must recompute this from raw totals per the "never trust the Excel formula" rule already established for other files, and definitely not replicate this specific formula.
- **F2-3:** Same missing Projected Population (5-14) gap as File 1 — recurring across both STH files, likely a shared/systemic data source issue upstream, not a one-off file mistake.
- **F2-4:** DQC "(G+H)=F" (Resident+Non-Resident=Total) check exists for Suspected/Confirmed but not Screened or Treated — confirm whether that's intentional.
- **F2-5:** Real data anomaly — Treated (1) > Confirmed (0) for NIRA/Negros Occidental in the same period. Needs investigation with the data owner; also strongly suggests adding a "Treated ≤ Confirmed" DQC rule to the config regardless of what the source template does.
- **F2-6:** "All ages" population (col 8) is an independently-entered raw figure, not a sum of the 5 age-bracket populations (they don't reconcile) — confirm this is intentional (e.g., brackets have gaps/overlaps) before using it as a validation cross-check.

---

## Cross-File Patterns (STH group)

| Pattern | File 1 (Deworm) | File 2 (Cascade) |
|---|---|---|
| Frequency | Semestral (Jan/July MDA), presented as Qtr1-4+Annual | Same tab pattern, but genuinely quarterly-named for a continuous cascade |
| Geographic depth | 5 rows (region+3 provinces+1 HUC) | Same — 5 rows |
| Population 5-14 column | Blank for all rows | Blank for all rows (same gap) |
| DQC columns | None | Partial (Suspected/Confirmed only) |
| Formula/label errors found | 1 confirmed (`Annual` #REF!) | 2 (mislabeled "5-19" header; Confirmed-sheet Total% cross-reference bug) |
| Leftover/legacy sheets | Yes (4 nationwide 143-row sheets, unused) | No |
| Real data anomaly | None found (all real data internally consistent) | Yes — Treated > Confirmed logical violation |
| Cross-sheet formula dependencies | None (self-contained) | Extensive — every stage after Screened references the prior stage's sheet by name |

**Schema design implication:** File 2's cross-sheet percentage formulas mean the parser config's `denominator_source` must be able to point at indicators belonging to a *different template* (Screened/Suspected/Confirmed are effectively separate "files" living in one workbook). This is a new pattern not seen in the Immunization/Nutrition/Mgt-of-Sick groups documented previously, where denominators were always same-sheet.

---

**Summary:** Both STH files use a much coarser 5-row (region + 3 provinces + 1 HUC) geography than other FHSIS files. File 1 (deworming) has a confirmed broken formula (`#REF!` in its `Annual` tab from an incompletely-applied column removal) and 4 seemingly-vestigial nationwide-template sheets that probably shouldn't be ingested; it also has zero DQC columns. File 2 (screening cascade) chains four dependent stages (Screened→Suspected→Confirmed→Treated) across separate sheets with cross-sheet percentage formulas, one of which (Confirmed's aggregate %) is provably broken — it divides a count by a percentage instead of by the Screened total. The change_log itself contains an unresolved note suggesting Confirmed/Treated denominators should use "suspect" rather than what's actually implemented, so denominator mapping needs direct encoder confirmation before seeding indicators. Both files also share a systemic gap: Projected Population (5-14 yrs) is blank for every location, silently zeroing out several coverage percentages. Most concretely, File 2 contains a real data-entry contradiction — 1 treated case recorded against 0 confirmed cases for the same location/period — which argues for adding a "Treated ≤ Confirmed" DQC rule that doesn't exist in the source template.
