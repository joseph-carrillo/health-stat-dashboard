# Morbidity Program — Template Analysis

## Program: Morbidity (Reported Disease Case Counts, All Diseases)

---

## File 1: `NIR_Morbidity.xlsx`
**Tracks:** All reported disease/condition case counts across the full FHSIS morbidity list (306 individual diseases/conditions grouped into 19 ICD-10 chapters), disaggregated by 16 age brackets and sex, per geographic area, per month.

### Verification note on file shape
This file was checked carefully per the task brief because morbidity data can plausibly be either (a) a fixed-indicator coverage template (one column = one indicator, like every other program analyzed so far) or (b) a ranked "top 10 causes" list. **It is neither.** It is a third, structurally distinct shape: a **disease-as-row matrix** — every row is one disease/condition (not a location), and the fixed columns are age-group × sex breakdowns, not indicators. This confirms and re-verifies the finding already on record in `memory-bank/fhsis_template_analysis.md` ("File mor-1"); this document restates it in the house style used by `wash.md`/`family_planning.md` and adds several findings (the age-bracket-Total literal/formula split, the confirmed-broken Rate column with cached-value proof, and the change-log/"top 10" cross-reference) not present in the earlier pass.

### Sheet Structure
| Sheet | Type | Rows × Cols | Notes |
|---|---|---|---|
| Jan | Monthly | 1831 × 57 (1631 populated, 200 blank padding rows) | Raw monthly encoding |
| Feb | Monthly | 1831 × 57 | Raw monthly encoding |
| Mar | Monthly | 1831 × 57 | Raw monthly encoding |
| Q1 | Quarterly | 1831 × 57 | Rollup: province rows = `SUM(Jan!, Feb!, Mar!)` |
| Apr | Monthly | 1831 × 57 | Raw monthly encoding |
| May | Monthly | 1831 × 57 | Raw monthly encoding |
| Jun | Monthly | 1831 × 57 | Raw monthly encoding — **all-zero, unfilled** (see Flags) |
| Q2 | Quarterly | 1831 × 57 | Rollup: `SUM(Apr!, May!, Jun!)` |
| Jul | Monthly | 1831 × 57 | **All-zero, unfilled** |
| Aug | Monthly | 1831 × 57 | **All-zero, unfilled** |
| Sep | Monthly | 1831 × 57 | **All-zero, unfilled** |
| Q3 | Quarterly | 1831 × 57 | **All-zero** (no constituent months filled) |
| Oct | Monthly | 1831 × 57 | **All-zero, unfilled** |
| Nov | Monthly | 1831 × 57 | **All-zero, unfilled** |
| Dec | Monthly | 1831 × 57 | **All-zero, unfilled** |
| Q4 | Quarterly | 1831 × 57 | **All-zero** |
| Annual | Annual | 1831 × 57 | Rollup: province rows = `SUM('Q1'!, 'Q2'!, 'Q3'!, 'Q4'!)` |
| Population | Reference | 19 × 2 | Denominator table for the Rate column — **effectively empty** (see Flags) |
| change_log | Admin | 2 × 7 (1 header + 1 entry) | Not imported; single entry dated 2025-10-20 |

**Frequency:** Monthly + Quarterly + Annual, all in one workbook (17 data sheets total — matches the volume of the largest Immunization files).
**All 17 data sheets are structurally identical** — header row, meta columns (A–E), and the full 325-row disease list per location block are byte-for-byte identical across all of Jan–Dec/Q1–Q4/Annual (verified by diffing Jan vs Dec cell-by-cell on columns A–E for rows 1–327: zero differences).
**Real rows per sheet: 1,631** (rows 1632–1831 are blank padding with no data/formulas — likely leftover row-dimension bloat, not meaningful).
**Data currently entered:** Jan, Feb, Mar, Apr, May have real (non-zero) cached values; Jun onward is entirely zero/blank in every monthly sheet, so Q3, Q4 are all-zero and Annual reflects only 5 months of real activity (Jan–May) rolled up through Q1+Q2. This is a mid-year partial submission state, not necessarily a defect, but any parser/dashboard testing against "Annual" must account for it being a partial-year total right now.

### Row Structure — Disease-as-Row Matrix
Unlike every other program file analyzed (rows = locations, columns = indicators), this file's **rows are diseases** and its geographic dimension is handled by **stacking five location blocks vertically in the same sheet**, each block repeating the identical 325-row disease list:

```
Row 1:            Header
Rows 2–327   (326 rows): NIR (region rollup)             — formulas SUM the 4 blocks below, same-sheet
Rows 328–653 (326 rows): Negros Occidental (province)
Rows 654–979 (326 rows): Negros Oriental (province)
Rows 980–1305(326 rows): Siquijor (province)
Rows 1306–1631(326 rows):City of Bacolod (HUC)
```

Each 326-row block = 1 blank location-label row + 19 ICD-chapter subtotal (header) rows + 306 individual disease rows = 325 disease-list rows + the blank label row.

**Within a block, row hierarchy:**
```
Location (blank label row, e.g. B328="Negros Occidental")
  └── ICD Chapter header row (Category == Disease, ICD-Code = a range, e.g. "A00-B99") — all data cells blank
        └── Individual disease rows (e.g. "Cholera" / A00) — real SUM formulas or raw entries
```

19 ICD-10 chapters and their disease-row counts (verified from the Jan sheet, rows 3–327):

| Start row | Chapter | ICD range | # disease rows |
|---|---|---|---|
| 3 | Certain Infectious and Parasitic Diseases | A00–B99 | 64 |
| 68 | Neoplasms | C00–D48 | 39 |
| 108 | Diseases of the blood/blood-forming organs & immune mechanism | D50–D89 | 4 |
| 113 | Endocrine, nutritional and metabolic diseases | E00–E90 | 11 |
| 125 | Mental and Behavioral Disorders | F01–F99 | 8 |
| 134 | Diseases of the nervous system | G00–G98 | 10 |
| 145 | Diseases of the eye and adnexa | H00–H59 | 10 |
| 156 | Diseases of the ear and mastoid process | H60–H95 | 3 |
| 160 | Diseases of the circulatory system | I00–I99 | 21 |
| 182 | Diseases of the respiratory system | J00–J99 | 18 |
| 201 | Diseases of the digestive system | K00–K93 | 19 |
| 221 | Diseases of the Skin and subcutaneous tissue | L00–L99 | 2 |
| 224 | Diseases of the musculoskeletal system and connective tissue | M00–M99 | 11 |
| 236 | Diseases of the genitourinary system | N00–N99 | 24 |
| 261 | Pregnancy, childbirth and the puerperium | O00–O99 | 10 |
| 272 | Certain conditions originating in the perinatal period | P00–P96 | 9 |
| 282 | Congenital Malformations, Deformations and Chromosomal Abnormalities | Q00–Q99 | 17 |
| 300 | Injury, poisoning and certain other consequences of external causes | S00–T98 | 20 |
| 321 | Codes for Special Purposes | U00–U49 | 6 (SARS, Vaping Disorder, COVID-19 identified/not identified, MIS-C, COVID immunization need) |

**Total: 19 chapter-header rows + 306 individual disease rows = 325 disease-list rows per location block**, confirming the count already on record in `fhsis_template_analysis.md`.

Chapter-header rows (e.g. row 3, row 68, row 108…) have `Category == Disease/s` and `ICD-Code/s` set to a range — **every data cell (age/sex columns F:BC and Grand Total BB:BD) on these rows is blank (`None`)**, not zero. Only the Rate column (BE) has a formula on these rows, which harmlessly resolves to 0 via `IFERROR` (dividing a blank BD by a lookup). These rows are cosmetic chapter dividers, not real indicators, and must be explicitly skipped by the parser (they cannot simply be treated as "diseases with all-zero counts" — they are structurally different rows, identifiable by `Category == Disease/s`).

### Age/Sex Disaggregation
**Full disaggregation, richer than any sibling program file:** 16 age brackets × (Male, Female, Total) = 48 columns, plus a Grand Total (Male/Female/Both) and a Rate column. Age brackets:

0-6 days, 7-28 days, 29 days–11 months, 1-4y, 5-9y, 10-14y, 15-19y, 20-24y, 25-29y, 30-34y, 35-39y, 40-44y, 45-49y, 50-54y, 55-59y, 60y and above.

This is the same age-bucketing style used in mortality/natality vital-stats files (per `memory-bank/template_analysis/vital_stats_*.md`), not the coarser buckets used in Child Care/Immunization files.

### Geographic Levels Present
- **Region** (NIR — Negros Island Region rollup), 1 block, formula-summed from the 4 blocks below.
- **Province** — Negros Occidental, Negros Oriental, Siquijor (3 blocks).
- **HUC** — City of Bacolod, 1 block, **not broken into barangays**.
- **No City/Municipality-level rows at all** — unlike WASH (63 city/municipality rows) or Immunization (129 rows including barangay detail), this file stops at province/HUC granularity: each province is a **single aggregate row per disease**, not one row per LGU. This is coarser than every other program analyzed to date and matches the already-known gap noted in `fhsis_template_analysis.md` line 2548 ("Multiple files (ncd_meds, Morbidity, and others) are missing barangay-level rows under HUC… Parked until template owners add barangay rows").
- No PSGC column exists anywhere in this file (see Flag MOR-4) — location is identified purely by the text value in column B (`Region/Province/HUC/ICC`).

### Column Inventory (structural columns; the "indicator" dimension is on rows — see note above)

Because this file's indicators are diseases (on rows), not columns, there is no single `columns[]` list of "one column = one indicator" the way `adding_templates.md` expects. Instead, the **fixed cross-cutting columns** (identical across all 1,631 rows and all 17 sheets) are:

| Col (0-based) | Header | RAW/COMPUTED | Formula (province-block rows) | Formula (NIR/region-block rows) | Unit |
|---|---|---|---|---|---|
| 0 | Region | META (defective — see Flag MOR-1) | — | — | text |
| 1 | Region/Province/HUC/ICC | META (location key) | — | — | text |
| 2 | Category | META (ICD chapter) | — | — | text |
| 3 | Disease/s | META (disease name; equals Category on chapter-header rows) | — | — | text |
| 4 | ICD-Code/s | META | — | — | ICD-10 code or range |
| 5 | 0-6 days Male | RAW | typed count | `=SUM(F<occ_row>,F<orient_row>,F<siq_row>,F<bac_row>)` | count |
| 6 | 0-6 days Female | RAW | typed count | same pattern | count |
| 7 | 0-6 days Total | **RAW in Negros Occidental & City of Bacolod blocks; `=SUM(Male,Female)` formula in NIR, Negros Oriental & Siquijor blocks** — see Flag MOR-2 | mixed | mixed | count |
| 8–52 | (repeats Male/Female/Total for the remaining 15 age brackets, same pattern as cols 5–7) | RAW/mixed (same Flag MOR-2 pattern) | — | — | count |
| 53 | Grand Total Male | COMPUTED | `=SUM(F,I,L,O,R,U,X,AA,AD,AG,AJ,AM,AP,AS,AV,AY)` (sums the 16 age-bracket **Male** raw columns directly — does NOT depend on the col-7-style Total sub-columns, so Flag MOR-2 does not corrupt this) | same pattern, referencing NIR-block cells | count |
| 54 | Grand Total Female | COMPUTED | `=SUM(G,J,M,P,S,V,Y,AB,AE,AH,AK,AN,AQ,AT,AW,AZ)` | same pattern | count |
| 55 | Grand Total Both Sexes | COMPUTED | `=SUM(BB,BC)` (col[53]+col[54]) | same | count |
| 56 | Rate per 100,000 Population | COMPUTED | `=IFERROR(BD/VLOOKUP($B,Population!A$2:B$19,2,FALSE)*100000,0)` | same, keyed on column B's text location name | **currently always evaluates to 0 — see Flag MOR-3** | rate per 100,000 pop |

**Proposed indicator-code scheme** (following the `MORB_` prefix convention): since the disease dimension can't collapse into a fixed set of `columns[].index` entries, the scheme used for every other program (one static code per column) doesn't fit. The two options already on record in `fhsis_template_analysis.md` still stand:
- **Option A (recommended there):** auto-generate one indicator code per disease × age-bracket × sex, e.g. `MORB_A00_0_6D_MALE`, `MORB_A00_0_6D_FEMALE`, `MORB_A00_GRANDTOTAL_MALE`, `MORB_A00_GRANDTOTAL_FEMALE`, `MORB_A00_GRANDTOTAL_TOTAL`, `MORB_A00_RATE` (keyed off ICD-10 code, which is a stable identifier, rather than off disease name text which could be edited) — 306 diseases × 16 age brackets × 2 sexes = **9,792** raw indicator codes, plus 306 × (2 grand-total sexes + 1 total + 1 rate) computed codes ≈ **10,400 total**, matching the prior estimate.
- **Option B:** a `diseases` reference table (ICD code, name, category) + a `disease_id` FK on `health_data`, with age-bracket and sex as columns rather than indicator rows. Cleaner for this file but breaks the uniform "indicator code" design used everywhere else.

Either way, **this is the one clear structural confirmation the task asked to check for**: this file is *not* itself a "top 10 causes" ranked list (no `RANK()`/`LARGE()` formulas, no ranking columns exist anywhere in the workbook — confirmed by full-file formula scan), but the change-log (see below) shows it directly *feeds* a downstream "top 10 causes of morbidity" report, which the parser/analytics layer would need to compute after ingestion (e.g., rank by Grand Total or Rate per location per period), not read directly off this template.

### DQC Rules Visible in the Sheet
**None.** A full scan of every sheet's `conditional_formatting` collection (and a raw-XML `zipfile` scan for the literal string `conditionalFormatting`) returned **zero conditional-formatting rules anywhere in this workbook** — no completeness highlighting, no threshold flags, no PSGC-format checks. This is a meaningful negative finding by comparison: every sibling program analyzed so far (`wash.md`, `family_planning.md`, the Immunization files) has at least a ">100%" flag and a blanks-completeness check; this file has none.

There is also **no formula-based DQC** beyond the `IFERROR` wrapper on the Rate column — a full scan for `IF(` logic anywhere in the workbook (excluding the `IFERROR`/`VLOOKUP` rate formula) found zero matches. No cross-column consistency checks (e.g., "disease total should not exceed chapter subtotal," which would actually make sense here since chapter-header rows are blank rather than true subtotals) exist in the sheet.

**Checking the two known recurring bug classes explicitly requested:**
- **(a) Conditional-formatting sqref anchored one row short of real data:** **Not applicable / cannot recur** — there is no conditional formatting in this file at all, so there is nothing to be mis-anchored.
- **(b) "Over 100%" DQC comparing an un-multiplied 0–2 ratio against literal 100:** **Not applicable** — this file has no percentage columns and no such comparison formula anywhere; the only computed ratio-like value is the Rate-per-100,000 column, which already multiplies by 100,000 correctly in its formula (`.../pop*100000`) — the scale is correct, it's just non-functional due to the empty denominator table (Flag MOR-3), a different failure mode than the sibling-program scale-mismatch bug.

### Flags / Open Questions

- **FLAG MOR-1 (already on record, re-verified):** Column A ("Region") is hardcoded to the literal string `'BARMM'` on **every single one of the 1,630 data rows, in all 17 data sheets** (verified by set-collecting column A's distinct values per sheet — each sheet returns exactly `{'BARMM'}`). BARMM (Bangsamoro Autonomous Region in Muslim Mindanao) is a geographically unrelated region — this file covers the Negros Island Region (NIR: Negros Occidental, Negros Oriental, Siquijor, City of Bacolod). This is unambiguous copy-paste/template-reuse residue from a BARMM-region source template that was never corrected. `fhsis_template_analysis.md`'s prior answer (Q-mor-1) already establishes the intended handling: **the parser ignores column A entirely; location is determined by column B only.** No parser config should reference column 0 for geography.
- **FLAG MOR-2 (new finding, not in the prior pass):** Within the **monthly** sheets (Jan–Dec) only, the per-age-bracket "Total" sub-columns (H, K, N, Q, T, W, Z, AC, AF, AI, AL, AO, AR, AU, AX, BA — 16 columns) are **static typed literals in the Negros Occidental and City of Bacolod blocks**, but **live `=SUM(Male,Female)` formulas in the NIR, Negros Oriental, and Siquijor blocks** — verified by scanning all 4,896 cells (16 total-cols × 306 disease rows) per block: Negros Occidental and Bacolod show `formula=0 / literal=4896`; NIR, Negros Oriental, Siquijor show `formula=4896 / literal=0`. In the **Quarterly (Q1–Q4) and Annual** sheets, by contrast, *all five* blocks use live formulas (`formula=4896/literal=0` for every block) — so the inconsistency is confined to the monthly source sheets. Practical impact: if a Male or Female raw cell in Negros Occidental/Bacolod is later edited, the corresponding age-bracket "Total" cell will **not** recompute (it's a frozen number, not a formula) and will silently go stale — whereas the same edit in Negros Oriental/Siquijor/NIR updates automatically. This does **not** corrupt the Grand Total (BB/BC/BD) or Rate columns, since those formulas sum the raw Male/Female columns directly rather than the age-bracket Total columns — but any downstream indicator built directly from the per-age-bracket "Total" columns (as opposed to Grand Total) would be unreliable specifically for Negros Occidental and Bacolod data.
- **FLAG MOR-3 (already flagged at a high level in the prior pass; here confirmed with hard cached-value evidence):** The `Population` reference sheet has population figures **entirely blank** for all 4 sub-locations (Negros Occidental, Negros Oriental, Siquijor, City of Bacolod — rows 3–6, column B all `None`), so `Population!B2` (NIR total, `=SUM(B3:B19)`) also evaluates to `0`. Consequently, **every VLOOKUP in the Rate-per-100,000 formula fails to find a usable denominator, and `IFERROR` silently forces every single Rate cell to `0` regardless of actual case volume.** Concrete proof: in the Jan sheet, row 312 ("Open wound of unspecified body region... animal bites...", NIR block) has a cached Grand Total (`BD312`) of **5,560** cases, yet its cached Rate (`BE312`) is **0**. The same holds in the Annual sheet (`BD312` = 23,150 cumulative cases, `BE312` = 0). This is a **completely non-functional column across the entire file, silently masked by `IFERROR`** — nothing visibly errors, it just always reports zero, which could be indistinguishable from "an intentionally zero rate" to anyone reading the sheet or a resulting dashboard tile. `fhsis_template_analysis.md`'s ANSWERS section (Q-mor-3) already establishes that the CHD team is responsible for filling in Population, and explicitly calls for "smart error checking… flag if population is missing when rate calculation is attempted" — this confirms that requirement is not optional polish, it is covering a currently-100%-broken column.
- **FLAG MOR-4 (new finding):** **No PSGC column exists anywhere in this file** — column B is a free-text location name (`'NIR'`, `'Negros Occidental'`, `'Negros Oriental'`, `'Siquijor'`, `'City of Bacolod'`), not a PSGC code. Every config so far (per `adding_templates.md`) requires a `psgc_column` index; this template has none. A config for this file will need to map the 5 fixed text values in column B to PSGC codes via a lookup/dictionary rather than reading a PSGC column directly — a different mechanism than every prior template.
- **FLAG MOR-5:** Geographic granularity stops at Region/Province/HUC — there is **no city/municipality-level breakdown within Negros Occidental, Negros Oriental, or Siquijor**, and **no barangay-level breakdown within City of Bacolod**. This is coarser than every sibling program file (WASH: 63 city/municipality rows; Immunization: 129 rows including barangay detail). Matches the already-tracked gap in `fhsis_template_analysis.md` ("Morbidity per-LGU/barangay" listed as a parked/pending item in `progress.md` line 125) and the ANSWERS section (Q-mor-2: "Currently one regional file. Target is per LGU and barangay level… template not yet updated due to volume"). Any config built against the current file structure will need to be redesigned once (if) the per-LGU version of this template arrives — this is a known, tracked limitation, not a new discovery, but worth restating here since it directly affects whether a durable parser config can be written today.
- **FLAG MOR-6 (new finding):** The `change_log` sheet's single entry (v. blank, 2025-10-20, "Jane Galo", Field/Column Affected = "O80 Disease", Old Value = "O80", New Value = blank, Reason = *"Remove/Delete since spontaneouls singe deliveries are not considered as morbidity, and may cause error if included in the top 10"*) is confirmed **accurate and already executed** — no row with ICD code "O80" exists anywhere in the current Pregnancy/childbirth chapter (rows 261–271), consistent with its deletion. This is a positive finding (the changelog is trustworthy here, unlike the stale "Column O" reference found in the WASH water file), but its wording is the only evidence in this workbook that a **"top 10 causes of morbidity" report is a real downstream consumer of this data** — confirming that any future Rankings/Top-Causes feature built on this data must be computed by the application (e.g., rank diseases by Grand Total or Rate per location/period), since no ranking logic exists in the source file itself. Also note the changelog's own `Version` field is blank for this entry — a minor internal-consistency gap in the log format itself.
- **FLAG MOR-7 (sensitive-indicator check per CLAUDE.md):** The disease list **does include stigmatized/notifiable conditions matching CLAUDE.md's "Sensitive Indicators" criteria** — specifically, within the "Certain Infectious and Parasitic Diseases" chapter: row 25 "Congenital syphilis" (A50), row 26 "Early syphilis" (A51), row 27 "Other syphilis" (A52-A53), and row 49 "Human immunodeficiency virus [HIV] disease" (B20-B24). These are morbidity **case counts** (facility-reported diagnosed cases by age/sex/location/month), not laboratory "reactive test result" counts in the narrower sense used by the dedicated `infectious_disease_hiv_syphilis_hepab.md` file, but they still represent the same underlying sensitive condition categories CLAUDE.md flags ("HIV reactive cases," "Syphilis reactive cases," "extra RBAC restrictions… aggregated totals only for unauthorized roles"). **Recommendation: mark the `MORB_B20_B24_*` (HIV) and `MORB_A50_*`/`MORB_A51_*`/`MORB_A52_A53_*` (syphilis) indicator codes `is_sensitive = TRUE`** when seeding, consistent with the RBAC treatment already applied to the dedicated HIV/Syphilis/HepB program file, even though this is a different source template.
- **FLAG MOR-8 (schema-design, restating the parked decision):** Because indicators live on rows rather than columns, this file cannot use the standard `columns[].index → indicator_code` config shape at all as currently designed in `adding_templates.md` — it needs either (a) ~10,400 auto-generated indicator codes (disease × age-bracket × sex, Option A, the currently recommended path per `fhsis_template_analysis.md`) with a parser extension that walks disease *rows* instead of only mapping fixed *columns*, or (b) a dedicated `diseases` reference table (Option B). This decision is explicitly "PARKED… until all files are analyzed" per the existing notes — this analysis does not change that recommendation, it only reconfirms the structural facts it depends on.
- **FLAG MOR-9:** Chapter-header rows (Category == Disease/s, e.g. row 3 "Certain Infectious and Parasitic Diseases" / A00-B99) have **all data cells blank** rather than 0 or a real chapter subtotal — meaning the sheet does **not** actually provide chapter-level rollups despite superficially looking like it might (a naive parser summing "all rows under a chapter" would double-count if it mistakenly treated the header row as a 20th disease with value 0, but more importantly, anyone wanting a chapter-level total must compute `SUM` over the chapter's individual disease rows themselves — it is not pre-aggregated in the source file).
- No conditional-formatting-based DQC exists at all in this file (see DQC section above) — flagged here again as an open question: should the Morbidity config define `dqc_rules` in the JSON config to compensate (e.g., "Rate computed but Population missing" per Q-mor-3's own recommendation, or "chapter total ≠ sum of chapter's disease rows" as a sanity check), since the source spreadsheet provides none?

---

## Summary

`NIR_Morbidity.xlsx` is structurally unlike every program analyzed so far: it is a **disease-as-row matrix**, not a location-as-row/indicator-as-column template. Each of its 17 identically-shaped sheets (Jan–Dec, Q1–Q4, Annual) stacks five geographic blocks (NIR region rollup, Negros Occidental, Negros Oriental, Siquijor, City of Bacolod) vertically, each repeating the same 325-row ICD-10 disease list (19 chapter-header rows + 306 individual disease rows), with 16 age-bracket × Male/Female/Total columns (48 cols) plus Grand Total Male/Female/Both and a Rate-per-100,000 column (57 columns total). It is confirmed, via a full-workbook formula scan, that this is *not* itself a "top 10 causes" ranked list (no RANK/LARGE formulas exist anywhere) — but a `change_log` entry proves a "top 10 causes of morbidity" report is a real downstream consumer, meaning any ranking must be computed post-ingestion, not read from the template. Geographic granularity stops at province/HUC (no city/municipality or barangay rows), and there is no PSGC column at all — location is identified only by free text in column B, requiring a name→PSGC lookup rather than a direct `psgc_column` index. Three verified defects stand out: (1) column A ("Region") is hardcoded `'BARMM'` on every row in every sheet — clear leftover residue from an unrelated template, already known to require the parser to ignore column A entirely; (2) the age-bracket "Total" sub-columns are live `SUM` formulas in three of five geographic blocks but frozen static numbers in the other two (Negros Occidental, City of Bacolod) within the monthly sheets specifically — a latent staleness risk that (fortunately) does not corrupt the Grand Total or Rate columns since those pull from raw Male/Female columns directly; and (3) the Rate-per-100,000 column is **completely non-functional across the entire workbook** because the `Population` reference sheet has no population figures for any of the four sub-locations, so every `VLOOKUP` fails and `IFERROR` silently forces every rate to 0 regardless of real case counts (confirmed with cached-value evidence: 5,560 January cases and 23,150 annual cases for one disease both report a Rate of 0). The file also contains zero conditional formatting and zero formula-based DQC anywhere — unlike every sibling program, which had at least a completeness check and an over-100% flag — so neither of the two recurring sibling-program bug classes (mis-anchored CF sqref, un-multiplied ratio-vs-100 threshold) can recur here, simply because there is no DQC logic present to contain such a bug. Finally, the disease list includes HIV disease (B20-B24) and three syphilis categories (congenital, early, other — A50-A53), which should be seeded as `is_sensitive = TRUE` per CLAUDE.md's RBAC rules even though this is a general morbidity case-count file rather than the dedicated reactive-test-result HIV/Syphilis/HepB template. The schema question of how to represent ~10,400 disease×age×sex indicator combinations (Option A: auto-generated indicator codes, vs. Option B: a dedicated `diseases` reference table) remains explicitly parked pending completion of all other template analyses, and nothing found in this pass changes that recommendation.
