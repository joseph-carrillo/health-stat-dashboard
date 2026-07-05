# FHSIS Template Analysis — Program: Maternal Care > Post Partum (3 files)

**Location analyzed:** `backend/data/MATERNAL_CARE/Post Partum/` — on-disk filenames carry a numeric prefix (`1. post_4pnc_nir.xlsx`, `2. post_supplementation_nir.xlsx`, `3. post_bp_measure_hpn_mngt_nir.xlsx`).

**Method:** Read every sheet with `openpyxl` in both `data_only=False` (formula strings) and `data_only=True` (cached values) modes, cross-checked every percentage/DQC column's stored formula against hand arithmetic on the actual cached numbers (not the header text), scanned conditional-formatting `sqref` ranges against real data-row extents, and read each file's own `change_log` tab. This follows the same method used for `maternal_care_prenatal.md`, since headers cannot be trusted per `adding_templates.md`.

**Program code:** `MATERNAL_CARE` already exists in `backend/app/core/seed_programs.slq`; no Post Partum indicators exist yet in `seed_indicators.py`.

**Naming convention:** Following the established `PRE_` prefix used for the Prenatal sibling group (`maternal_care_prenatal.md`), this sub-group uses a `POST_` prefix (mirroring the on-disk `post_` filename prefix), e.g. `POST_4PNC_*`, `POST_IFA_*`, `POST_BP_*`, `POST_HPN_*`.

**RBAC / Sensitive Indicators check:** None of these 3 files contain HIV or Syphilis reactive-case data (per `memory-bank/CLAUDE.md` → "Sensitive Indicators"). No `is_sensitive = TRUE` flags are needed for this file group.

---

## Cross-File Structural Notes (read this first)

1. **No monthly sheets anywhere in this group.** All 3 files are **Quarterly + Annual only**. `frequency` should be `"quarterly"` in every config.
2. **Test data is populated in Q1 only, across all 3 files.** Q2–Q4 are entirely blank (verified cell-by-cell for representative rows in every file); `Annual` per-cell formulas are `=SUM('Q1'!x,'Q2'!x,'Q3'!x,'Q4'!x)`, so `Annual` mirrors `Q1` exactly in the shipped data. This is the identical pattern documented for the Prenatal group.
3. **`Annual` is a derived rollup, never independently entered data** — confirmed via formula (`=SUM('Q1'!D3,'Q2'!D3,'Q3'!D3,'Q4'!D3)` pattern in every file). Region/province subtotal rows within any sheet are same-sheet `=SUM(range)`. `Annual` does not need to be ingested as new raw data.
4. **Two row-granularity patterns coexist, exactly mirroring the Prenatal group's split:**
   - **Province-rollup-only (5 data rows):** File 1 (4PNC) and File 2 (Supplementation) — Region (NIR) + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod (HUC). No individual municipality rows.
   - **Municipality-level (68 rows):** File 3 (BP measure/HPN mgmt) — Region → 3 provinces → their municipalities/cities → City of Bacolod (HUC) as a single row, no barangay breakdown. This is the *same 68-location list* used in Prenatal Files 1 and 8 (verified identical PSGC codes: `1804502000` City of Bago … `1830200000` City of Bacolod (HUC)).
   - `data_start_row` / expected row counts must be configured per-file; a parser assuming one row count for all 3 files will silently truncate or over-read.
5. **Meta-column layout is uniform across all 3 files (unlike Prenatal, which had a split):** all three use the 3-meta-column layout — `col0` PSGC, `col1` a constant "NIR"/"Region" placeholder (labeled "Areas (Regions)" in Files 1–2, "Region" in File 3) carrying no real per-row information, `col2` the actual location name. `psgc_column = 0`, `location_column = 2` for all three files in this group.
6. **A shared "Projected Population (Under 1)" denominator column appears in File 2**, with **the exact same literal values as the Prenatal group's Flag P** (NIR = 93,988; Negros Occidental = 52,678; Negros Oriental = 29,294; Siquijor = 1,671; City of Bacolod (HUC) = 10,345 — all verified identical to the Prenatal Files 2–7 figures). This means Flag P is **not scoped to Prenatal alone** — it is a single population dataset reused verbatim across at least two different Maternal Care sub-programs. See consolidated Flag P-2 below.
7. **File 1 contains a serious, previously undocumented formula bug** — a cross-age-bracket column shift in the "Total completed 4PNC" calculation that inflates the reported completion totals and defeats the file's own "over 100%" check on the one row where the true rate is genuinely over 100%. This is new — it is *not* present in the structurally-analogous Prenatal File 1 (8ANC), whose equivalent formulas were verified correct in `maternal_care_prenatal.md`. See deep dive in File 1 below.
8. **A cross-file, cross-program DQC scale-mismatch is confirmed here with hard evidence:** every "Over 100%" DQC formula in Files 1 and 2 compares a *raw, un-multiplied* ratio (typically 0–2) against the literal threshold `100`, while the cell's own `number_format` is `"0.00%"` (Excel auto-multiplies by 100 only for *display*, not for the stored value the `IF()` formula actually evaluates). Net effect: these DQC columns can only ever fire if the raw ratio itself exceeds 100 (i.e., a true 10,000%+ anomaly) — they are functionally dead for any realistic data-entry error, including a **verified real case in File 1** where the true rate is 100.43% and the DQC cell still reports "No issue" (see File 1 deep dive). This was not called out in `maternal_care_prenatal.md` but the identical formula pattern is present there too (unaudited) — worth a retroactive check.
9. **Conditional-formatting anchor ranges were checked in every file for the known NCD-style "anchored one row past the last real row" bug — none found here.** All `sqref` ranges (`C2:C6`, `D2:AB6`, `AJ2:AM6` in Files 1–2; `C2:C68`, `D2:O68` in File 3) correctly bound the actual data extent (5 rows / 68 rows respectively). This bug class does **not** recur in this file group.

---

## File 1: `1. post_4pnc_nir.xlsx`
**Tracks:** Postpartum women due for and completing 4 Postnatal Care (PNC) visits, by resident/trans-in/trans-out status, broken out by 3 maternal age brackets (10-14, 15-19, 20-49). Structurally near-identical to Prenatal File 1 (`8ANC`), with "4PNC" substituted for "8ANC" throughout.

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Q1–Q4 | Quarterly data | Q2–Q4 fully blank (verified cell-by-cell) |
| Annual | Computed rollup | `=SUM('Q1'!x,'Q2'!x,'Q3'!x,'Q4'!x)` per cell |
| change_log | Admin — not imported | 1 entry (label-only fix, see below) |

**Frequency:** Quarterly + Annual. **Rows:** 5 data rows (NIR + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod HUC) — province-rollup granularity, no municipalities. **Columns:** 39 (`max_col` reported by openpyxl is 39; `max_row` is inflated to 863 by leftover formatting bloat — real data occupies only rows 1–6; rows 7–863 are entirely empty, confirmed by exhaustive scan).

### Age/Sex Disaggregation
No Male/Female column (subjects are postpartum women only — sex is implicit/omitted, consistent with a maternal-care program). Age brackets: **10-14, 15-19, 20-49** — same 3 brackets used throughout the Prenatal sibling group.

### Geographic Levels Present
Region (NIR) → 3 provinces (Negros Occidental, Negros Oriental, Siquijor) → City of Bacolod (HUC) as one aggregate row. No municipality/city or barangay rows.

### Column Inventory
| Col (0-based) | Label (raw text, abbreviated) | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META (`psgc_column`) | — |
| 1 | Areas (Regions) — constant "NIR" | — | META (unused) | — |
| 2 | Region/PHIC | — | META (`location_column`) | — |
| 3 | (a) Resident, 10-14 | `POST_4PNC_RESIDENT_10_14` | RAW | — |
| 4 | (b) …15-19 | `POST_4PNC_RESIDENT_15_19` | RAW | — |
| 5 | (c) …20-49 | `POST_4PNC_RESIDENT_20_49` | RAW | — |
| 6 | A. Total (a)+(b)+(c) | `POST_4PNC_RESIDENT_TOTAL` | COMPUTED | col3+col4+col5 |
| 7 | (d) Trans-in, 10-14 | `POST_4PNC_TRANSIN_10_14` | RAW | — |
| 8 | (e) …15-19 | `POST_4PNC_TRANSIN_15_19` | RAW | — |
| 9 | (f) …20-49 | `POST_4PNC_TRANSIN_20_49` | RAW | — |
| 10 | B. Total | `POST_4PNC_TRANSIN_TOTAL` | COMPUTED | col7+col8+col9 |
| 11 | (g) Trans-out (w/ MOV), 10-14 | `POST_4PNC_TRANSOUT_10_14` | RAW | — |
| 12 | (h) …15-19 | `POST_4PNC_TRANSOUT_15_19` | RAW | — |
| 13 | (i) …20-49 | `POST_4PNC_TRANSOUT_20_49` | RAW | — |
| 14 | C. Total | `POST_4PNC_TRANSOUT_TOTAL` | COMPUTED | col11+col12+col13 |
| 15 | (j) Total due for PNC, 10-14 "(A+B)" | `POST_4PNC_TRACKED_10_14` | COMPUTED | col3+col7 (verified correctly same-bracket) |
| 16 | (k) …15-19 | `POST_4PNC_TRACKED_15_19` | COMPUTED | col4+col8 |
| 17 | (l) …20-49 | `POST_4PNC_TRACKED_20_49` | COMPUTED | col5+col9 |
| 18 | I. Total | `POST_4PNC_TRACKED_TOTAL` | COMPUTED | col15+col16+col17 |
| 19 | (m) Given 1st–4th PNC on schedule, 10-14 | `POST_4PNC_ONSCHED_10_14` | RAW | — |
| 20 | (n) …15-19 | `POST_4PNC_ONSCHED_15_19` | RAW | — |
| 21 | (o) …20-49 | `POST_4PNC_ONSCHED_20_49` | RAW | — |
| 22 | D. Total | `POST_4PNC_ONSCHED_TOTAL` | COMPUTED | col19+col20+col21 |
| 23 | (p) Completed ≥4PNC, trans-in, 10-14 | `POST_4PNC_TRANSIN_DONE_10_14` | RAW | — |
| 24 | (q) …15-19 | `POST_4PNC_TRANSIN_DONE_15_19` | RAW | — |
| 25 | (r) …20-49 | `POST_4PNC_TRANSIN_DONE_20_49` | RAW | — |
| 26 | E. Total | `POST_4PNC_TRANSIN_DONE_TOTAL` | COMPUTED | col23+col24+col25 |
| 27 | (s) Total completed 4PNC, 10-14 "(D+E)" | `POST_4PNC_COMPLETED_10_14` | COMPUTED **BUGGED** | Header/shorthand implies col19+col23 (same-bracket m+p); **actual stored formula is `=SUM(T,Y)` = col19+col24** (10-14 on-schedule + **15-19** trans-in-done) — see FLAG PP1-1 |
| 28 | % (s/j)*100 | `POST_4PNC_COMPLETED_10_14_PCT` | COMPUTED | col27/col15 (no literal ×100 despite label — see FLAG PP1-2) |
| 29 | (t) …15-19 | `POST_4PNC_COMPLETED_15_19` | COMPUTED **BUGGED** | Implied col20+col24 (n+q); **actual = `=SUM(U,Z)` = col20+col25** (15-19 on-schedule + **20-49** trans-in-done) |
| 30 | % (t/k)*100 | `POST_4PNC_COMPLETED_15_19_PCT` | COMPUTED | col29/col16 |
| 31 | (u) …20-49 | `POST_4PNC_COMPLETED_20_49` | COMPUTED **BUGGED** | Implied col21+col25 (o+r); **actual = `=SUM(V,AA)` = col21+col26** (20-49 on-schedule + **the entire E-group Total**, not just r) |
| 32 | % (u/l)*100 | `POST_4PNC_COMPLETED_20_49_PCT` | COMPUTED | col31/col17 |
| 33 | II. Total = s+t+u | `POST_4PNC_COMPLETED_TOTAL` | COMPUTED | col27+col29+col31 (inherits the bug — see below) |
| 34 | % "(I/II)*100" | `POST_4PNC_COMPLETED_TOTAL_PCT` | COMPUTED | col33/col18 (label is inverted — actual is II/I, identical bug to Prenatal File 1) |
| 35–38 | DQC Over 100% (10-14/15-19/20-49/Total) | — | DQC | `IF(pct_cell<=100,"No issue","Over 100%")` |

### DQC Rules
- **Completeness check:** conditional formatting flags blank cells across `D2:AB6`/`AD/AF/AH` (`LEN(TRIM(D2))=0`).
- **"Over 100%" check** on each age-bracket completion percentage and the overall total — intended as a "cannot complete more than were tracked" sanity check. **This check is functionally broken — see FLAG PP1-2.**
- **PSGC "0"-search rule** on `C2:C6` — cosmetic/leftover, not a meaningful DQC.
- **Conditional-formatting anchors correctly bound to the real 5 data rows** (`2:6`) in every sheet, including `Annual` — no off-by-one anchor bug found here.

### Flags / Open Questions — File 1

- **FLAG PP1-1 (critical, confirmed bug — cross-age-bracket column shift in the "Completed 4PNC" formulas):** The three per-bracket "completed" cells (cols 27, 29, 31) are supposed to sum each bracket's own on-schedule count (m/n/o) with that *same bracket's* trans-in-done count (p/q/r), exactly as the Prenatal sibling file does correctly (`col26 = col18+col22` in `pre_8anc_nir.xlsx`). Here, the actual stored formulas are shifted one bracket to the right:
  - col27 (s, 10-14) = `SUM(T,Y)` = **m(10-14) + q(15-19)**, should be m(10-14)+p(10-14)
  - col29 (t, 15-19) = `SUM(U,Z)` = **n(15-19) + r(20-49)**, should be n(15-19)+q(15-19)
  - col31 (u, 20-49) = `SUM(V,AA)` = **o(20-49) + E-group Total** (i.e. p+q+r combined), should be o(20-49)+r(20-49)

  Verified with hand arithmetic against cached values on **all 5 rows** (NIR, Negros Occidental, Negros Oriental, Siquijor, Bacolod HUC) — e.g. NIR row: actual col27=85 vs. correct value 11 (T=11, X=0); actual col29=1391 vs. correct 997; actual col31=6888 vs. correct 6814. The pattern is 100% consistent across every row, not a one-off typo. **Net effect:** the overall "II. Total" (col33) is silently inflated (NIR: 8364 actual vs. 7822 correctly-summed), which cascades into every downstream percentage (cols 28, 30, 32, 34) and into the DQC checks. No change_log entry documents this — it is undocumented and unlike this file's sibling (Prenatal File 1), which has this exact calculation correct. **Any config author who trusts the header shorthand "(D+E)" per bracket, or blindly re-implements the shifted Excel formula, will get wrong numbers; the correct formula per the project's own recompute-don't-trust-Excel rule should be `col19+col23`, `col20+col24`, `col21+col25` (same-bracket), matching the Prenatal precedent — not the shifted formula actually stored in this file.**
- **FLAG PP1-2 (DQC threshold/scale mismatch, first proven with real data in this file):** Cell `number_format` for every "%" column (verified on cols 28/34, format `"0.00%"`) confirms these cells store a raw ratio (e.g. 1.0043) that Excel *displays* as "100.43%" — the underlying `IF(cell<=100, ...)` DQC formulas, however, compare that raw ratio directly against the literal number `100`, not `1`. Since realistic ratios are almost always well under 2, this means the "Over 100%" DQC check can essentially never fire except for a >100x (10,000%) anomaly. **Concrete proof of failure:** NIR row's final percentage (col34, `POST_4PNC_COMPLETED_TOTAL_PCT`) is `1.0043` — i.e., a genuinely-over-100% completion rate (100.43%) — yet its DQC cell (col38) evaluates `1.0043<=100` and reports **"No issue"**. The check is silently non-functional for the one row in the shipped sample data where it should have fired. This same scale mismatch is structurally present in File 2 of this group and is very likely present, unaudited, in the Prenatal sibling files as well (same formula family), though it wasn't flagged there.
- **Label/formula inversion on col34, "(I/II)*100":** identical to the confirmed bug in Prenatal File 1 — the header claims `I/II` but the stored formula computes `II/I`. The parser must implement `COMPLETED_TOTAL / TRACKED_TOTAL`, ignoring the header text (further complicated here because `COMPLETED_TOTAL` itself is corrupted by FLAG PP1-1).
- **Trans-out women are not subtracted from the "tracked" denominator** — same open question as Prenatal File 1 (cols 15-17 = Resident+Trans-in only; Trans-out is captured but never subtracted anywhere).
- **change_log confirms only a label-only fix** (v1.1, "wrong column title" for cols G-J and W-Z) — no record of, or fix for, the FLAG PP1-1 formula bug.

---

## File 2: `2. post_supplementation_nir.xlsx`
**Tracks:** Postpartum micronutrient supplementation — Iron with Folic Acid (IFA) and Vitamin A — by maternal age bracket.

### Sheet Structure
| Sheet | Type |
|---|---|
| Q1–Q4 | Quarterly data (Q2–Q4 blank, verified) |
| Annual | Computed rollup |
| change_log | Admin — **completely empty** (header row only, no entries) |

**Frequency:** Quarterly + Annual. **Rows:** 5 (province rollup, same 5 locations as File 1). **Columns:** 28.

### Age/Sex Disaggregation
No sex column. Same 3 age brackets (10-14, 15-19, 20-49).

### Geographic Levels Present
Same as File 1: Region (NIR) + 3 provinces + City of Bacolod (HUC) as a single row. No municipality-level rows.

### Column Inventory
| Col (0-based) | Label | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | Areas (Regions), constant "NIR" | — | META (unused) | — |
| 2 | Region/PHIC | — | META (`location_column`) | — |
| 3 | Projected Population (Under 1) (a) | `POST_SUPP_POP` | RAW | — (identical values to Prenatal Flag P — see FLAG PP2-1) |
| 4 | (b) IFA, 10-14 | `POST_IFA_10_14` | RAW | — |
| 5 | % b/a*100 | `POST_IFA_10_14_PCT` | COMPUTED | col4/col3 |
| 6 | (c) …15-19 | `POST_IFA_15_19` | RAW | — |
| 7 | % c/a*100 | `POST_IFA_15_19_PCT` | COMPUTED | col6/col3 |
| 8 | (d) …20-49 | `POST_IFA_20_49` | RAW | — |
| 9 | % d/a*100 | `POST_IFA_20_49_PCT` | COMPUTED | col8/col3 |
| 10 | (e) IFA Total | `POST_IFA_TOTAL` | COMPUTED | col4+col6+col8 |
| 11 | % e/a*100 | `POST_IFA_TOTAL_PCT` | COMPUTED | col10/col3 |
| 12 | (f) Vitamin A, 10-14 | `POST_VITA_10_14` | RAW | — |
| 13 | % f/a*100 | `POST_VITA_10_14_PCT` | COMPUTED | col12/col3 |
| 14 | (g) …15-19 | `POST_VITA_15_19` | RAW | — |
| 15 | % g/a*100 | `POST_VITA_15_19_PCT` | COMPUTED | col14/col3 |
| 16 | (h) …20-49 | `POST_VITA_20_49` | RAW | — |
| 17 | % h/a*100 | `POST_VITA_20_49_PCT` | COMPUTED | col16/col3 |
| 18 | (i) Vitamin A Total | `POST_VITA_TOTAL` | COMPUTED | col12+col14+col16 |
| 19 | % i/a*100 | `POST_VITA_TOTAL_PCT` | COMPUTED | col18/col3 |
| 20–27 | DQC Over 100% (b/a, c/a, d/a, e/a, f/a, g/a, h/a, i/a) | — | DQC | `IF(pct_cell<=100,"No issue","Over 100% for validation")` |

All 8 percentage formulas verified consistent with their labels (no denominator ambiguity, no bracket-shift bug of the kind found in File 1) — checked against cached values for all 5 rows.

### DQC Rules
- **Completeness check** (`LEN(TRIM(D2))=0`) across all data columns.
- **"Over 100%" check** on all 8 percentage columns, correctly wired to the matching percentage cell in every case.
- **Same scale-mismatch flaw as File 1 (FLAG PP1-2 applies here too):** cell format is `"0.00%"` but the DQC `IF()` compares the raw (un-multiplied) ratio to literal `100`. In this file the raw ratios are tiny (population is in the tens of thousands, supplementation counts are single/double/triple digits, e.g. 7/93988 ≈ 0.00015), so the check is even further from ever firing in practice than in File 1 — but the underlying design defect is identical.
- **Conditional-formatting anchors correctly bound to the 5 real data rows** (`2:6`) — no off-by-one anchor bug.

### Flags / Open Questions — File 2

- **FLAG PP2-1 (Flag P extends across programs):** The "Projected Population (Under 1)" column values in this file are **byte-for-byte identical** to the ones documented for the Prenatal group's Flag P: NIR = 93,988; Negros Occidental = 52,678; Negros Oriental = 29,294; Siquijor = 1,671; City of Bacolod (HUC) = 10,345. This means the single population dataset already flagged as ambiguous in Prenatal (population-under-1 as a proxy denominator for prenatal-care coverage) is being **reused verbatim for a Postpartum-care coverage indicator** as well. This strengthens the case that a single shared reference population indicator (rather than duplicating the raw column per template) may be the right schema decision — but it also means the original open question (is "population under 1" actually the correct denominator concept for maternal/postpartum coverage indicators, or a copy-paste artifact from Immunization templates?) is now open across **two** sibling programs, not one.
- **change_log is completely empty** (header row only, no entries) — no fix history to audit, unlike File 1 and File 3.
- No formula bugs found in this file — all raw/computed/DQC wiring is internally consistent.

---

## File 3: `3. post_bp_measure_hpn_mngt_nir.xlsx`
**Tracks:** Two related indicator groups in one file — (a) blood-pressure measurement during PNC visits, and (b) identification/referral of postpartum women with high BP or danger signs (hypertension management). Structurally and even by filename nearly identical to Prenatal File 8 (`pre_bp_measure_hpn_mngt_nir.xlsx`).

### Sheet Structure
| Sheet | Type |
|---|---|
| Q1a–Q4a, Annual_1a | Group A: PNC visits + BP measured |
| Q1b–Q4b, Annual_1b | Group B: identified high BP/danger signs + referred |
| change_log | Admin — 2 entries, both already-fixed and logged |

**Frequency:** Quarterly + Annual. **Rows:** 68 (municipality level — Region → 31 Negros Occidental municipalities (rows 4-34, with row 3 as province subtotal) → 25 Negros Oriental (rows 36-60, row 35 subtotal) → 6 Siquijor (rows 62-67, row 61 subtotal) → City of Bacolod (HUC), row 68, single row). Same 68-location PSGC list as Prenatal Files 1 and 8. **Columns:** 15 per sub-group (only cols 0-14 populated; `max_col=26` reported by openpyxl is bloat — cols 16-26 are entirely blank). **No DQC "Over 100%" columns at all in this file** — matches Prenatal File 8's "zero DQC" finding exactly.

### Age/Sex Disaggregation
No sex column. Same 3 age brackets (10-14, 15-19, 20-49).

### Geographic Levels Present
Region → 3 provinces → their municipalities/cities → City of Bacolod (HUC) as a single row. No barangay breakdown.

### Column Inventory — Group "a" (BP measurement)
| Col | Label | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — |
| 1 | Region, constant "NIR" | — | META (unused) | — |
| 2 | Region, Province/City, Municipality | — | META (`location_column`) | — |
| 3 | (a) PNC visits, 10-14 | `POST_BP_PNCVISIT_10_14` | RAW | — |
| 4 | (b) …15-19 | `POST_BP_PNCVISIT_15_19` | RAW | — |
| 5 | (c) …20-49 | `POST_BP_PNCVISIT_20_49` | RAW | — |
| 6 | (d) Total | `POST_BP_PNCVISIT_TOTAL` | COMPUTED | col3+col4+col5 |
| 7 | (e) BP measured each PNC visit, 10-14 | `POST_BP_MEASURED_10_14` | RAW | — |
| 8 | % e/a | `POST_BP_MEASURED_10_14_PCT` | COMPUTED | col7/col3 |
| 9 | (f) …15-19 | `POST_BP_MEASURED_15_19` | RAW | — |
| 10 | % f/b | `POST_BP_MEASURED_15_19_PCT` | COMPUTED | col9/col4 |
| 11 | (g) …20-49 | `POST_BP_MEASURED_20_49` | RAW | — |
| 12 | % g/c | `POST_BP_MEASURED_20_49_PCT` | COMPUTED | col11/col5 |
| 13 | (h) Total | `POST_BP_MEASURED_TOTAL` | COMPUTED | col7+col9+col11 |
| 14 | % h/d | `POST_BP_MEASURED_TOTAL_PCT` | COMPUTED | col13/col6 |

### Column Inventory — Group "b" (High BP identification/referral)
| Col | Label | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 3 | (a) Identified w/ high BP/danger signs, 10-14 | `POST_HPN_IDENTIFIED_10_14` | RAW | — |
| 4 | (b) …15-19 | `POST_HPN_IDENTIFIED_15_19` | RAW | — |
| 5 | (c) …20-49 | `POST_HPN_IDENTIFIED_20_49` | RAW | — |
| 6 | (d) Total | `POST_HPN_IDENTIFIED_TOTAL` | COMPUTED | col3+col4+col5 |
| 7 | (e) Referred to higher-level facility, 10-14 | `POST_HPN_REFERRED_10_14` | RAW | — |
| 8 | % e/a | `POST_HPN_REFERRED_10_14_PCT` | COMPUTED | col7/col3 |
| 9 | (f) …15-19 | `POST_HPN_REFERRED_15_19` | RAW | — |
| 10 | % f/b | `POST_HPN_REFERRED_15_19_PCT` | COMPUTED | col9/col4 |
| 11 | (g) …20-49 | `POST_HPN_REFERRED_20_49` | RAW | — |
| 12 | % g/c | `POST_HPN_REFERRED_20_49_PCT` | COMPUTED | col11/col5 |
| 13 | (h) Total | `POST_HPN_REFERRED_TOTAL` | COMPUTED | col7+col9+col11 |
| 14 | % h/d | `POST_HPN_REFERRED_TOTAL_PCT` | COMPUTED | col13/col6 |

### Denominator note (no ambiguity here)
Both groups use a chained, same-bracket denominator (measured ÷ PNC visits; referred ÷ identified) — no population column at all in this file. Identical pattern to Prenatal File 8.

### DQC Rules
- **Completeness check only** (`LEN(TRIM(D2))=0` across `D2:O68`) and a cosmetic PSGC "0"-search rule (`C2:C68`).
- **No "Over 100%" or any other quantitative DQC rule exists anywhere in this file** — confirmed by inspecting `conditional_formatting._cf_rules` on all 10 data sheets; header cols 16-26 are blank (no hidden DQC columns past col 14 either).
- **Anchor ranges correctly bound to the real 68-row data extent** — no off-by-one bug.

### Flags / Open Questions — File 3

- **change_log explicitly documents an already-applied, already-logged fix** (Version 2, Jan 12 2026, "Dexter Flores") for **both** sub-groups: the formula was originally inverted (PNC-visits ÷ BP-measured; identified ÷ referred) and was corrected to BP-measured ÷ PNC-visits and referred ÷ identified. Verified: the currently-stored formulas already reflect the corrected direction (`H2/D2`, not `D2/H2`). This is the "good" precedent in this group, exactly mirroring Prenatal File 8's own Version-2 fix log (same author, same date, same wording) — strongly suggesting these two files were fixed together in the same maintenance pass.
- **No DQC columns whatsoever**, matching Prenatal File 8's identical gap. Worth flagging to the DOH region team as a real, recurring omission across both "BP measure / HPN management" files in Maternal Care (Prenatal and Post Partum), not a one-off.
- Same 68-row municipality-level granularity as Prenatal Files 1 and 8 (identical PSGC list) — no "region-only" NIR placeholder rows like Files 1-2 of this group.
- Minor grammar-only header typo in group "b" col 4 ("who identified with" instead of "who were identified with") — cosmetic, not a structural issue.

---

## Cross-File Comparison

| Aspect | File 1: 4PNC | File 2: Supplementation | File 3: BP measure/HPN mgmt |
|---|---|---|---|
| Sheets | Q1–Q4, Annual, change_log | Q1–Q4, Annual, change_log | Q1a–Q4a, Annual_1a, Q1b–Q4b, Annual_1b, change_log |
| Frequency | Quarterly + Annual | Quarterly + Annual | Quarterly + Annual |
| Rows | 5 (province rollup) | 5 (province rollup) | 68 (municipality level) |
| Columns | 39 | 28 | 15 × 2 groups |
| Age brackets | 10-14 / 15-19 / 20-49 | 10-14 / 15-19 / 20-49 | 10-14 / 15-19 / 20-49 |
| Sex disaggregation | None | None | None |
| Meta columns | 3 (PSGC, constant-NIR, location) | 3 (PSGC, constant-NIR, location) | 3 (PSGC, constant-NIR/Region, location) |
| Denominator type | Chained (tracked women, resident+trans-in) | Population (Under 1) — shared value w/ Prenatal | Chained (PNC visits / identified, same bracket) |
| Q2–Q4 data | Blank (Q1-only test data) | Blank (Q1-only test data) | Blank (Q1-only test data) |
| DQC | Over-100% × 4, but scale-mismatched (FLAG PP1-2) | Over-100% × 8, scale-mismatched, values too small to ever trip | **None at all** |
| change_log | 1 entry, label-only fix | Empty (no entries) | 2 entries, formula fix already applied & logged |
| Known formula bugs | **Confirmed: cross-bracket column-shift bug in "Completed" totals (FLAG PP1-1)**; inverted I/II label (matches Prenatal precedent) | None found | None found (already-fixed precedent) |
| CF anchor off-by-one (NCD-style bug) | Not present — checked and cleared | Not present — checked and cleared | Not present — checked and cleared |

---

## Consolidated Flags

| ID | File(s) | Flag |
|---|---|---|
| **PP1-1** | File 1 | **Critical, confirmed formula bug.** The per-bracket "Total completed 4PNC" cells (cols 27/29/31) sum each bracket's on-schedule count with the *next* bracket's trans-in-done count instead of its own (10-14 borrows from 15-19; 15-19 borrows from 20-49; 20-49 borrows the whole trans-in-done Total instead of just its own bracket). Verified on all 5 rows via cached-value arithmetic. Inflates "II. Total" and every downstream percentage. Not present in the structurally-identical Prenatal File 1. Config authors must implement same-bracket sums (`col19+col23`, `col20+col24`, `col21+col25`), not replicate the shifted Excel formula. |
| **PP1-2** | Files 1, 2 (likely also Prenatal, unaudited) | **DQC scale-mismatch.** Percentage cells store a raw ratio (`number_format="0.00%"` auto-multiplies only for display) but the "Over 100%" `IF()` formulas compare that raw ratio to literal `100`. Proven to silently fail on a real >100% case in File 1 (NIR row, true rate 100.43%, DQC reports "No issue"). Effectively dead DQC logic across both files; likely a systemic template-family defect worth checking in every other program's "Over 100%" DQC column, not just this group. |
| **PP2-1** | File 2 (extends Prenatal's Flag P) | The "Projected Population (Under 1)" denominator column is byte-for-byte identical to the Prenatal group's shared population dataset, now confirmed reused across **two** Maternal Care sub-programs. Open question about whether this is a legitimate DOH convention or a copy-paste artifact from Immunization templates now applies across both Prenatal and Post Partum, strengthening the case for a single shared reference indicator rather than per-file duplication. |
| **PP3-1** | File 3 (mirrors Prenatal File 8) | No DQC columns at all — a real, recurring gap across both "BP measure/HPN management" files in this program (Prenatal and Post Partum), not a one-off omission. |
| **PP-Q1** | File 1 | Trans-out women (with MOV) are captured as raw input but never subtracted from the "tracked" (due) denominator — same open question already raised for Prenatal File 1; confirm intentional. |
| **PP-Q2** | Files 1, 2 | Q2-Q4 sheets contain zero real data in the shipped file; only Q1 and its Annual mirror have values. Confirm this is expected sample/test data, not a delivery gap, before validating parser configs against these files. |

---

## Summary

This 3-file Post Partum batch is structurally a close mirror of its Prenatal sibling group — same 3 age brackets, no sex disaggregation, the same two row-granularity patterns (5-row province rollup vs. 68-row municipality level), the same 3-meta-column layout, quarterly+annual frequency with only Q1 populated, and even a shared "Projected Population (Under 1)" denominator dataset with byte-identical values to the Prenatal files. File 3 (`post_bp_measure_hpn_mngt_nir.xlsx`) is functionally the cleanest: it already has a documented, applied, and logged formula fix (mirroring Prenatal File 8's identical fix history and author/date), though it has zero DQC columns — also mirroring Prenatal File 8's gap. File 2 (`post_supplementation_nir.xlsx`) is internally consistent with no formula bugs, but its DQC "Over 100%" checks share a scale-mismatch defect with File 1 that makes them practically non-functional. File 1 (`post_4pnc_nir.xlsx`) is the most concerning file in this batch: it contains a previously-undocumented, systematically-reproducible cross-age-bracket column-shift bug in its "Total completed 4PNC" formulas (cols 27/29/31), inflating the reported completion rate for every row in the sample data, and this defect is compounded by the DQC scale-mismatch bug, which means the file's own built-in "Over 100%" safeguard silently passes a row that is genuinely over 100% (100.43%). No HIV/Syphilis-type sensitive indicators are present in any of the three files. Before building parser configs, the team should decide (a) whether to replicate File 1's buggy Excel formula or implement the mathematically-correct same-bracket sum (recommended, consistent with the project's recompute-don't-trust-Excel rule and the Prenatal precedent), (b) whether to fix the DQC threshold scale (compare to 1, not 100) across this and potentially other programs' configs, and (c) whether "Projected Population (Under 1)" should become a single shared reference indicator now that it's confirmed reused across two Maternal Care sub-programs.
