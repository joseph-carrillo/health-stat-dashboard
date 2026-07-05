# FHSIS Template Analysis — INFECTIOUS_DISEASE > Schistosomiasis (7 files)

**Analyst note:** All 7 files share no `Population` tab (population is either absent or embedded inline, unlike Immunization). None of the 7 files have `DQC` or `Remarks` columns anywhere — validation exists only as embedded `IFERROR(...)` percentage formulas, several of which reference the **wrong denominator/numerator column**, sometimes across sheets. Geographic rows are minimal: only **5 real data rows** (NIRA region total, Negros Occidental, Negros Oriental, Siquijor, City of Bacolod HUC) despite sheets being pre-formatted to 206–220 rows (rest is blank template padding — no barangay-level rows, unlike Immunization's 129-row files).

## Sheet-group naming key (applies to files 1–5 below)
Each quarter has a **family of tabs**, not one tab: `Qtr1`→`Qtr1a`→`Qtr1b`→(`Qtr1c`→`Qtr1d`→`Qtr1e`), each holding a different indicator group for the *same* quarter, cross-referencing each other's totals for percentage denominators. `Annual`/`Annual1..5` mirror the `Qtr*` family, rolling up Qtr1–4. This is architecturally different from every other program documented so far (e.g. Immunization = one wide row per period) — **one quarter's data is scattered across 3–6 tabs**, and percentages in one tab reference raw totals in a sibling tab (e.g. `Qtr1c!F2 = IFERROR(F2/Qtr1b!F2,0)`).

**This is a major schema/parser design flag**: `adding_templates.md`'s recipe assumes one sheet per period per config (`sheet_map: month→sheet name`). Schisto age-band files need either (a) one config per sheet-group (3 configs for the 1-4 file, 6 configs for the other four age-band files) similar to how MAM/SAM got split into separate uploads, or (b) a new multi-sheet-per-period merge mechanism. Recommend (a) — treat each `Qtr*`/`Qtr*a`/`Qtr*b`... family as its own template_id.

---

## File 1: `infec_schisto_1-4_nir.xlsx` — age 1–4 years

### Sheet Structure
`Qtr1–4`, `Annual` (patients seen + clinical/suspected seen) · `Qtr1a–4a`, `Annual1` (confirmed complicated/non-complicated/combined) · `Qtr1b–4b`, `Annual2` (confirmed-complicated referred to hospital) · `change_log`. **16 sheets total, 3 indicator groups.**

### Column Inventory — `Qtr1` family (cols 0-based)
| Idx | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Region | META | — |
| 2 | Region/Province/City/Muni | META | — |
| 3 | Patients seen 1-4y Male | RAW | — |
| 4 | Patients seen 1-4y Female | RAW | — |
| 5 | A. Total | COMPUTED | col3+col4 |
| 6 | *(blank spacer)* | — | — |
| 7 | Clinical/suspected seen Male | RAW | — |
| 8 | Clinical/suspected seen Female | RAW | — |
| 9 | A. Total | COMPUTED | col7+col8 |
| 10 | % clinical/suspected among patients seen | COMPUTED | col9/col5 |

### `Qtr1a` family (confirmed complicated/non-complicated/combined)
| Idx | Label | Type | Formula |
|---|---|---|---|
| 3–4 | Confirmed COMPLICATED Male/Female | RAW | — |
| 5 | Total | COMPUTED | 3+4 |
| 6 | % complicated among clinical/suspected | COMPUTED | col5 / `Qtr1`!col9 |
| 8–9 | Confirmed NON-COMPLICATED Male/Female | RAW | — |
| 10 | Total | COMPUTED | 8+9 |
| 11 | % non-complicated among clinical/suspected | COMPUTED | col10 / `Qtr1`!col9 |
| 13–14 | Confirmed (complicated+non-complicated) Male/Female | COMPUTED | 3+8, 4+9 |
| 15 | Total | COMPUTED | 13+14 |
| 16 | % combined among clinical/suspected | COMPUTED | col15 / `Qtr1`!col9 |

### `Qtr1b` family (referred to hospital)
| Idx | Label | Type | Formula |
|---|---|---|---|
| 3–4 | Referred COMPLICATED Male/Female | RAW | — |
| 5 | Total | COMPUTED | 3+4 |
| 6 | % referred among confirmed complicated | COMPUTED | **BUG:** `col5 / Qtr1a!col3` (divides by *Male-only* complicated count, not `Qtr1a!col5` Total) |

### DQC / Validation
None — no DQC columns anywhere. Only embedded percentage formulas (which include the bug above).

### Flags — File 1
- **FLAG-1-1 (= progress.md "Fix Qtr1b col D"):** `Qtr1b` (and `Annual2`) percentage denominator references `Qtr1a`'s **Male-only complicated** column (Excel col D) instead of the **Total complicated** column (Excel col F). Inflates the referral-rate percentage roughly 2×.
- **FLAG-1-2:** Female columns are mislabeled `(a)` instead of `(b)` in the "Confirmed COMPLICATED" sub-header (both `Qtr1a` col E and `Qtr1b` col E) — cosmetic only, parser uses index not label, but confusing for manual QA.
- **FLAG-1-3 (major, structural):** This file has **only 3 indicator groups**; it completely lacks the "clinical/suspected TREATED + CURED" group and the "confirmed TREATED / confirmed CURED" groups that exist in all 4 other age-band files (see cross-file comparison below). Need to confirm with DOH/program owner whether 1-4-year-olds are genuinely not tracked for treatment/cure (plausible — praziquantel may be age-restricted) or whether this is a missing/incomplete template.
- Region-abbreviation column (col 1) uses `"NIRA"` in this file vs `"NIR"` in the other 4 age-band files — inconsistent but harmless (META column).

---

## File 2: `infec_schisto_5-14_nir.xlsx` — age 5–14 years

### Sheet Structure
`Qtr1-4`/`Annual` (seen) → `Qtr1a-4a`/`Annual1` (clinical/suspected **TREATED + CURED**) → `Qtr1b-4b`/`Annual2` (confirmed complicated/non-complicated/combined) → `Qtr1c-4c`/`Annual3` (confirmed **TREATED**, split complicated/non-complicated/combined) → `Qtr1d-4d`/`Annual4` (confirmed **CURED**, split complicated/non-complicated/combined) → `Qtr1e-4e`/`Annual5` (referred to hospital) → `change_log`. **31 sheets, 6 indicator groups** — twice the groups of File 1.

### Column Inventory — new groups vs File 1

**`Qtr1a` — clinical/suspected TREATED + CURED**
| Idx | Label | Type | Formula |
|---|---|---|---|
| 3–4 | Treated Male/Female | RAW | — |
| 5 | Total | COMPUTED | 3+4 |
| 6 | % treated among clinical/suspected seen | COMPUTED | col5 / `Qtr1`!col9 |
| 8–9 | Cured Male/Female | RAW | — |
| 10 | D. Total | COMPUTED | 8+9 |
| 11 | % cured | COMPUTED | col10 / col5 (same sheet "treated" total) |

**`Qtr1c` — confirmed TREATED (complicated/non-complicated/combined)**
| Idx | Label | Type | Formula |
|---|---|---|---|
| 3–5 | Complicated treated M/F/Total | RAW/COMPUTED | — |
| 6 | % treated among confirmed complicated | COMPUTED | col5 / `Qtr1b`!col5(Total complicated) |
| 8–10 | Non-complicated treated M/F/Total | RAW/COMPUTED | — |
| 11 | % treated among confirmed non-complicated | COMPUTED | col10 / `Qtr1b`!col9 (Total non-complicated) |
| 13–15 | Combined (complicated+non-complicated) treated M/F/Total | COMPUTED | 3+8, 4+9, sum |
| 16 | % combined treated among confirmed cases | COMPUTED | **BUG:** formula is `=IFERROR(K2/Qtr1b!$N2,0)` — numerator `K2` is the **non-complicated-only** treated total (col 10), not the combined Total (col 15). This under-counts the combined treated % by omitting complicated-treated cases entirely. |

**`Qtr1d` — confirmed CURED (complicated/non-complicated/combined)**
Structurally mirrors `Qtr1c` (17 cols), denominators reference `Qtr1c` totals correctly (no bug found here besides the label issue below).
- **BUG (= progress.md "Fix Qtr1d col J"):** col J (idx 9, "Non-complicated CURED **Female**") header text reads `"...Male\n\n(d)"` — duplicate of col I's "Male" label. Should read "Female". Formula-wise the sum (`col10 = col8+col9`) still correctly treats it as a second raw input, so data isn't lost — only the printed header is wrong.

**`Qtr1e` — referred to hospital**
Identical structure/columns to File 1's `Qtr1b` (8 cols); denominator correctly references `Qtr1b!$F` (Total complicated) here — **this file does NOT have the File 1 "Qtr1b col D" bug**; the bug is isolated to the simpler 1-4 file's referral sheet only... but see the **new Annual rollup bug** below, which File 2 does have.

### NEW BUG — Annual rollup skips Qtr3, double-counts Qtr4
Found in `Annual`, `Annual1`, and `Annual5` (NOT `Annual2/3/4`) of this file:
```
Annual!D3 = SUM('Qtr1'!D3,'Qtr2'!D3,'Qtr4'!D3,'Qtr4'!D3)
```
This omits `Qtr3` entirely and sums `Qtr4` twice — annual totals for "patients seen", "clinical/suspected treated+cured", and "referred to hospital" will be **understated** (missing a quarter) **and Q4-biased** (double-weighted). This bug is **not present in File 1** (its `Annual`/`Annual1`/`Annual2` formulas correctly reference all 4 quarters) — it is new to this file and repeats in Files 3 and 4 (15-19, 20-59) identically. Confirmed present in File 5 (60above) as well.

### Flags — File 2
- **FLAG-2-1 (NEW):** `Annual`/`Annual1`/`Annual5` rollup formulas skip Qtr3 and double-count Qtr4 (see above). Affects "seen", "treated/cured", and "referred" annual totals.
- **FLAG-2-2 (NEW):** `Qtr1c` "% combined treated" formula uses the wrong numerator (non-complicated-only instead of combined total) — repeats in Files 3, 4, 5.
- **FLAG-2-3:** Same "col J mislabeled Male" issue as progress.md notes, confirmed in `Qtr1d`.
- Row-level: data appears to be all zeros/blank placeholders (template not yet populated with real counts) except population-style reference numbers in the MDA file.

---

## File 3: `infec_schisto_15-19_nir.xlsx` — age 15–19 years
**Structurally identical to File 2** (same 31 sheets, same 6 groups, same column layout, same header text patterns swapped to "15-19 years old"). Same bugs confirmed present: Annual/Annual1/Annual5 skip-Qtr3-double-Qtr4 rollup bug, `Qtr1c` wrong-numerator bug, `Qtr1d` col J "Male" mislabel.

No new structural differences found versus File 2.

---

## File 4: `infec_schisto_20-59_nir.xlsx` — age 20–59 years
**Same 31-sheet skeleton, same sheet names, but `Qtr1a` is semantically different from Files 2/3:**

| Idx | Label | Type |
|---|---|---|
| 3–6 | Treated Male/Female/Total/% | same as Files 2/3 |
| 8–9 | **"1ST TREATMENT" Male/Female** (not "CURED") | RAW |
| 10 | Total | COMPUTED (8+9) |
| 11 | *(no % column — blank/None formula)* | — |

This is a **different indicator concept** occupying the same sheet position as Files 2/3's "CURED" group — 20-59 tracks whether treatment was a **1st Treatment vs Retreatment** episode instead of tracking cure outcome, and has **no percentage** for it at all (formula cell is literally `None`). Cols reduced to 12 (vs 13 in Files 2/3).

Same Annual-rollup skip-Qtr3 bug confirmed (`Annual`, `Annual1`, `Annual5`). Same `Qtr1c` wrong-numerator bug confirmed. `Qtr1d` still has the col J "Male" mislabel. One data-row anomaly: `Qtr1c` row 3 (Negros Occidental) has raw cells as `None` instead of `0.0` for the complicated-treated Male/Female columns — inconsistent null-vs-zero representation vs. all sibling rows/files (worth normalizing in the parser: treat blank as 0, but flag if this recurs at scale as a real data gap).

### Flags — File 4
- **FLAG-4-1 (structural, new):** `Qtr1a` 2nd sub-group is "1st Treatment" not "Cured" — different semantics from age bands 5-14/15-19, and has no % column at all. Needs clarification: is "cured" simply not tracked for adults, or was this an incomplete template edit?
- Same Annual-rollup and Qtr1c-numerator bugs as Files 2–3.
- Null-vs-zero inconsistency in one data row (`Qtr1c`).

---

## File 5: `infec_schisto_60above_nir.xlsx` — age 60+ years
Same 31-sheet skeleton. `Qtr1a` here is the **simplest of all four**: only the first "treated" sub-group exists (8 cols total) — no "Cured" and no "1st Treatment/Retreatment" second sub-group at all. Additionally:

- **FLAG-5-1 (label bug):** The `Qtr1a` percentage header text reads `"% of clinical suspected cases treated aged 20-59 yrs old"` — copy-pasted from the 20-59 file and never updated to say "60 yrs old and above."
- Same Annual-rollup skip-Qtr3/double-Qtr4 bug confirmed in `Annual`, `Annual1`, `Annual5`.
- Same `Qtr1c` wrong-numerator bug confirmed.
- Same `Qtr1d` col J "Male" mislabel confirmed.

### Cross-file comparison table — the central "known template error" the team flagged
| Age band | # indicator groups | 2nd sub-group in "Qtr1a" position | Has "confirmed TREATED/CURED" split (Qtr1c/d)? |
|---|---|---|---|
| 1–4 | 3 | *(doesn't exist — file has no Qtr1a-equivalent treated/cured group at all)* | No |
| 5–14 | 6 | CURED | Yes |
| 15–19 | 6 | CURED | Yes |
| 20–59 | 6 | 1ST TREATMENT (no %) | Yes |
| 60+ | 6 (but Qtr1a truncated) | *(none — 2nd sub-group entirely absent)* | Yes |

**This confirms the task's hint: the "same report split by age band" is NOT structurally identical.** Ages 5-14 and 15-19 are twins; 1-4 is missing two whole indicator groups; 20-59 substitutes a different concept (treatment-episode-type instead of cure-outcome) with no percentage; 60+ drops the second sub-group entirely and carries a copy-paste label error referencing the wrong age band. This needs to go back to the program owner as a single consolidated question: **what should each age band actually track, and are 1-4/20-59/60+ intentionally reduced, or did fields get lost in template edits?**

---

## File 6: `infec_schisto_by_treatment_nir.xlsx`
### Sheet Structure
`Qtr1-4`/`Annual` (clinical/suspected cases, split **1st Treatment / Retreatment / Combined**) → `Qtr1a-4a`/`Annual1` (same split, but for **CONFIRMED** cases). **10 sheets — no `change_log` tab** (only file of the 7 missing one).

### Column Inventory (`Qtr1`)
| Idx | Label | Type | Formula |
|---|---|---|---|
| 0–2 | PSGC/Region/Name | META | — |
| 3–4 | 1st Treatment Male/Female | RAW | — |
| 5 | A. Total | COMPUTED | 3+4 |
| 6–7 | Retreatment Male/Female | RAW | — |
| 8 | B. Total | COMPUTED | 6+7 |
| 9–10 | Combined (1st+Re) Male/Female | COMPUTED | 3+6, 4+7 |
| 11 | C. Total | COMPUTED | 9+10 |

**No percentage columns at all in this file** — unlike every other schisto file, there is no `%` computed indicator here. `Qtr1a` mirrors this exactly but for "CONFIRMED cases" instead of "clinical/suspected cases." Age is not disaggregated in this file (all ages combined) — this is a cross-age-band summary of treatment-type, complementing (not duplicating) Files 1–5.

### Flags — File 6
- **FLAG-6-1:** No `change_log` sheet (only file missing it) — inconsistent, minor.
- **FLAG-6-2:** No percentage/rate indicators anywhere in the file — need to confirm whether this is intentional (pure count reporting) since every sibling file has at least one `%` column.
- Region-abbreviation column reads `"NIR"` for every row including "NIRA" region-total row's name column — consistent with age-band files 2–5, not File 1.

---

## File 7: `infec_schisto_mda_nir.xlsx` — Mass Drug Administration (deworming)
### Sheet Structure
`Qtr1-4`, `Annual` only — **5 sheets total**, no quarterly "a/b/c" family, no `change_log`, no separate `Population` tab (population is embedded inline as raw columns instead).

### Column Inventory (`Qtr1`, 31 columns — 5 age-band groups in one sheet)
| Idx | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Region/Province/City/Muni | META | — |
| 2 | Projected Population 5-14y | RAW | — |
| 3 | Projected Population 15-19y | RAW | — |
| 4 | Projected Population 20-59y | RAW | — |
| 5 | Projected Population 60+y | RAW | — |
| 6 | Projected Population 5y+ (grand total denominator) | RAW | — |
| 7–8 | Dewormed 5-14y Male/Female (1 dose Praziquantel) | RAW | — |
| 9 | A. Total | COMPUTED | 7+8 |
| 10 | % dewormed / population 5-14y | COMPUTED | col9 / col2 (correct) |
| 11 | *(blank spacer — but see bug below)* | — | — |
| 12–13 | Dewormed 15-19y Male/Female | RAW | — |
| 14 | Total | COMPUTED | 12+13 |
| 15 | % (mislabeled header — see below) | COMPUTED | col14 / col3 (correct) |
| 16 | *(blank spacer — but see bug below)* | — | — |
| 17–18 | Dewormed 20-59y Male/Female | RAW | — |
| 19 | Total | COMPUTED | 17+18 |
| 20 | % | COMPUTED | col19 / col4 (correct) |
| 21 | *(blank spacer)* | — | — |
| 22–23 | Dewormed 60+y Male/Female | RAW | — |
| 24 | Total | COMPUTED | 22+23 |
| 25 | % | COMPUTED | col24 / col5 (correct) |
| 26 | *(blank spacer)* | — | — |
| 27–28 | Dewormed 5y+ Male/Female (grand total) | COMPUTED | SUM of all 4 age-band Male cols, SUM of all 4 Female cols |
| 29 | Grand Total | COMPUTED | 27+28 |
| 30 | % dewormed / population 5y+ | COMPUTED | **BUG: `=IFERROR(AD/H,0)`** — divides grand-total-dewormed by the **"Male dewormed 5-14y"** raw column (col 7) instead of the **"Projected Population 5+"** column (col 6). This is a real formula defect that will produce grossly wrong (often >100% or nonsensical) percentages for the headline "overall MDA coverage" indicator. |

### Additional bugs / flags — File 7
- **FLAG-7-1 (formula bug, new, high severity):** The grand-total "% dewormed among population 5+" (the file's single most important summary indicator) divides by the wrong column — confirmed identical in both the region-total row and the province data row, so it's not a one-off typo but baked into the template formula pattern.
- **FLAG-7-2 (header mislabel):** The `%` headers for the 15-19, 20-59, 60+, and 5+ groups are copy-pasted from the case-finding files and literally read *"% of clinical/suspected cases seen aged 15-19 years old among patients seen"* etc. — wrong description text, though (except for the 5+ group above) the underlying formula is actually correct (dewormed/population). Parser should use the config-defined semantic label, never the header text.
- **FLAG-7-3 (stray formulas in blank spacer columns):** In the `Annual` sheet, spacer columns 11 (Excel col L) and 16 (Excel col Q) which are blank/unlabeled in the header row contain leftover cross-quarter rollup formulas (e.g. `=SUM('Qtr1'!Q2,'Qtr2'!Q2,'Qtr3'!Q2,'Qtr4'!Q2)`) that aren't referenced by anything else — harmless dead formulas but indicate sloppy copy/paste during template construction.
- **FLAG-7-4 (missing data rows — high severity, data-completeness issue):** Unlike every other schisto file (which has 5 real data rows: NIRA + 3 provinces + 1 HUC), **this file only has 2 rows of actual data** — row 2 (NIRA region total) and row 3 (Negros Occidental). Rows for **Negros Oriental, Siquijor, and City of Bacolod (HUC) are completely blank** in every quarter/annual sheet. This is either a genuine reporting gap from those areas or a template/upload defect — needs escalation to the program owner, as it means 3 of 4 sub-regions have zero MDA coverage data on file.
- **FLAG-7-5 (data gap):** Within the one populated data row (Negros Occidental), "Projected Population 5-14y" (col 2) is blank (`None`) while the other three age-band populations and the 5+ grand total are filled in — inconsistent completeness even within the single populated row.

---

## Consolidated Flags for the Team (highest priority first)

1. **File 7 (MDA) — wrong denominator in headline "% dewormed 5+" formula** (divides by Male-5-14 count instead of Population-5+). High severity: this is the flagship MDA coverage indicator.
2. **File 7 (MDA) — 3 of 4 sub-regions (Negros Oriental, Siquijor, City of Bacolod HUC) have no data rows at all.** Needs confirmation this isn't a missing-upload problem.
3. **Files 2–5 (5-14, 15-19, 20-59, 60above) — Annual rollup formula skips Qtr3 and double-counts Qtr4** in the `Annual`, `Annual1`, and `Annual5` tabs specifically (not `Annual2-4`). Understates annual totals for "seen", "treated/cured", and "referred" indicators.
4. **Files 2–5 — `Qtr1c` "% combined treated" formula uses the non-complicated-only total as numerator instead of the true combined total** — undercounts the combined confirmed-treated rate.
5. **Age-band structural inconsistency is real, not cosmetic:** File 1 (1-4y) is missing two whole indicator groups (treated/cured for both clinical-suspected and confirmed cases) that exist in Files 2-5; File 4 (20-59y) substitutes "1st Treatment/Retreatment" for "Cured" with no percentage; File 5 (60+y) drops the second sub-group entirely and has a stray "20-59" label leftover from copy/paste. Needs one round of clarification with DOH/program owner on intended scope per age band before finalizing indicator seeding.
6. **File 1 — `Qtr1b` referral-rate % denominator uses Male-only complicated count instead of Total complicated** (matches progress.md's existing "Fix Qtr1b col D" note).
7. **Files 2-5 — `Qtr1d` "Non-complicated CURED Female" column header duplicated as "Male"** (matches progress.md's existing "Fix Qtr1d col J" note) — cosmetic (parser uses index, not label) but should be corrected in the source template to avoid future encoder confusion.
8. **File 6 (by_treatment) — no percentage indicators at all, and missing `change_log` tab** — confirm this is intentional (pure count file).
9. **No file in this group has DQC/Remarks columns** — unlike Immunization/Nutrition/Sick programs. All validation will need to be defined purely in the parser config (which is already the documented design rule: never trust Excel formulas, always recompute from raw inputs).
10. Config/schema implication: because each quarter's data spans 3–6 separate sheets with cross-sheet formula dependencies, each schisto file likely needs **multiple template configs** (one per sheet-group), not one config per file as in other programs.

---

**Summary:** Schistosomiasis is genuinely the messiest template group found so far. Beyond the two known errors already logged in progress.md (Qtr1b col D denominator, Qtr1d col J label), found: a new Annual-rollup bug that skips Q3 and double-counts Q4 in 3 of 6 annual tabs across four age-band files; a wrong-numerator bug in the "combined confirmed-treated %" formula in those same four files; a high-severity wrong-denominator bug in the MDA file's headline "% dewormed" indicator; and, most importantly, confirmation that the five age-band files are **not** structurally identical — the 1-4y file is missing entire treated/cured indicator groups, 20-59y substitutes a different (unpercented) concept, and 60+y drops a sub-group and carries a leftover "20-59" label. The MDA file also has 3 of 4 sub-regions with no data rows at all. Architecturally, each quarter's data is scattered across 3-6 cross-referencing sheets per file, which doesn't fit the "one sheet per period" config pattern used elsewhere — likely needs one config per sheet-group. All of this should go back to DOH/the program owner for clarification before schema/config work proceeds.
