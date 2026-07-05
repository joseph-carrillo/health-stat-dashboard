# FHSIS Template Analysis — Program: Maternal Care > Intra Partum (2 files)

**Location analyzed:** `backend/data/MATERNAL_CARE/Intra Partum/` — on-disk filenames carry a numeric prefix (`1. intra_shp_fbd__dt_do_nir.xlsx`, `2. intra_bw_nir.xlsx`).

**Method:** Read every sheet with `openpyxl` in both `data_only=False` (formula strings) and `data_only=True` (cached values) modes, cross-checked every percentage/DQC formula's stored cell reference against hand arithmetic on the actual cached numbers row-by-row (not the header text), scanned conditional-formatting `sqref` ranges against real data-row extents, and read each file's own `change_log` tab. This follows the same method used for `maternal_care_prenatal.md` and `maternal_care_post_partum.md`, since headers cannot be trusted per `adding_templates.md`.

**Program code:** `MATERNAL_CARE` already exists in `backend/app/core/seed_programs.slq`; no Intra Partum indicators exist yet in `seed_indicators.py`.

**Filename decode (verified against actual content, not guessed):** File 1's `shp_fbd__dt_do` = **S**killed **H**ealth **P**ersonnel (attendant type) + **F**acility-**B**ased **D**elivery (public/private) combined in one group, plus **D**elivery **T**ype (vaginal/cesarean/combined) and **D**elivery **O**utcome (full-term/pre-term/fetal death/abortion) as two further groups — all four topics live in **one workbook as three sheet-groups** (`a`, `b`, `c`). File 2's `bw` = **B**irth **W**eight (normal/low/unknown, by newborn sex), confirmed via headers and formulas.

**Naming convention:** Following `PRE_` (Prenatal) and `POST_` (Post Partum), this sub-group uses an `INTRA_` prefix, with sub-topic tags mirroring the on-disk group letters: `INTRA_SHP_*` / `INTRA_FBD_*` (File 1, group a), `INTRA_DT_*` (File 1, group b), `INTRA_DO_*` (File 1, group c), `INTRA_BW_*` (File 2). A shared `INTRA_DELIVERIES_*` baseline (age-bracketed) denominator is reused across all three groups of File 1.

**RBAC / Sensitive Indicators check:** Neither file contains HIV or Syphilis reactive-case data (per `memory-bank/CLAUDE.md` → "Sensitive Indicators"). No `is_sensitive = TRUE` flags are needed.

---

## Cross-File Structural Notes (read this first)

1. **No monthly sheets in either file.** Both are **Quarterly + Annual only**. `frequency` should be `"quarterly"` in every config.
2. **Test data is populated in Q1 only, in both files.** Q2–Q4 are entirely blank (raw cells verified `None`; same-sheet region-rollup formulas evaluate to `0` because they sum blank province rows). `Annual` mirrors `Q1` for every raw column, matching the pattern already documented for Prenatal/Post Partum.
3. **Both files use only the 5-row province-rollup granularity** (Region "NIR" + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod (HUC), PSGC `1800000000`/`1804500000`/`1804600000`/`1806100000`/`1830200000` — identical codes and literal location strings to the province-rollup files in both Prenatal and Post Partum). **There is no municipality-level (68-row) file anywhere in this 2-file sub-group** — unlike Prenatal/Post Partum, which each had one 68-row file alongside their 5-row files. `psgc_column = 0`, `location_column = 2` (col1 is a constant "NIR"/"Region" placeholder, unused) for both files.
4. **No "Projected Population (Under 1)" denominator column in either file** (Flag P from Prenatal/Post Partum does **not** recur here). File 1 uses a self-contained, age-bracketed "Deliveries" count as its baseline denominator; File 2 uses "Live Births" as its baseline denominator. Both are cohort counts drawn from the same reporting period, not an external population estimate — a cleaner denominator model than the Prenatal/Post-Partum "Population Under 1" proxy.
5. **Disaggregation differs sharply between the two files, confirming the task's hypothesis:** File 1 disaggregates by **maternal age bracket** (10-14 / 15-19 / 20-49) — same 3 brackets as every other Maternal Care file — and has **no newborn-sex column**. File 2 (Birth Weight) disaggregates by **newborn sex (Male/Female)** and has **no maternal age bracket at all**. These are mutually exclusive disaggregation axes across the two files in this sub-group.
6. **Both known recurring bug classes were explicitly checked and neither recurs in this sub-group:**
   - **(a) Conditional-formatting anchor off-by-one (NCD-style bug):** checked every `sqref` range in both files (16 sheets in File 1, 6 in File 2) — every range is correctly bound to rows `2:6`, the true 5-row data extent. **Not present.**
   - **(b) DQC "Over 100%" scale mismatch (Post Partum-style bug, raw ratio vs. literal `100`):** checked every DQC formula in both files. All percentage-highlight conditional-formatting rules use `cellIs greaterThan 1` (correctly scaled to the raw 0–1 ratio, not `100`), and all DQC-column `IF()` formulas compare **raw counts to raw counts** (e.g. `H2<=D2`), never a computed percentage to a literal `100`. **Not present** — this file group's DQC design is structurally different from (and safer than) the Prenatal/Post-Partum percentage-vs-100 pattern.
7. **File 1 has its own new, real DQC design and formula issues** (label/denominator mismatches, a duplicated header letter, and cross-sheet indicator duplication) — see File 1 below.
8. **File 2 has a serious, previously undocumented formula bug**: the "Live Births" denominator column is a **formula for 3 of 5 rows** (self-referentially defined as the sum of the very birth-weight categories it's supposed to validate) but a **raw hard-coded value for the other 2 rows** (Siquijor, City of Bacolod HUC) — and the resulting inconsistency produces a real, quantifiable, provable data mismatch. See deep dive in File 2 below.
9. **Both files' DQC actually fires on real inconsistencies in the shipped sample data, predominantly on the City of Bacolod (HUC) row** — a notable positive contrast with Prenatal/Post Partum, where the shipped DQC columns were frequently dead-on-arrival. This sub-group's DQC design is more useful in practice, but this also means the shipped sample data itself contains genuine unresolved data-quality issues, not just untested Q1 placeholder rows.

---

## File 1: `1. intra_shp_fbd__dt_do_nir.xlsx`
**Tracks:** Three related indicator groups covering intrapartum (labor & delivery) care, in one workbook, all disaggregated by maternal age bracket (10-14 / 15-19 / 20-49):
- **Group a** — Deliveries by birth attendant type (Physician / Nurse / Midwife / Skilled Health Personnel total) and by facility type (Public / Private / Facility-Based Delivery total).
- **Group b** — Delivery Type (Vaginal / Cesarean Section / Combined Vaginal-Cesarean).
- **Group c** — Delivery Outcome (Full Term / Pre-Term / Fetal Death / Abortion).

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Q1a–Q4a, Annual1 | Group a: SHP / FBD | Q2a–Q4a blank (verified cell-by-cell); 24 real data columns (`max_col=27` reported by openpyxl is bloat) |
| Q1b–Q4b, Annual2 | Group b: Delivery Type | Q2b–Q4b blank; 47 real columns (`max_col=47`, no bloat) |
| Q1c–Q4c, Annual | Group c: Delivery Outcome | Q2c–Q4c blank; 51 real columns (`max_col=51`, no bloat) |
| change_log | Admin — not imported | 1 entry (formula fix, see below) |

**Frequency:** Quarterly + Annual, 3 parallel sub-groups. **Rows:** 5 (province rollup — NIR, Negros Occidental, Negros Oriental, Siquijor, City of Bacolod HUC). `max_row=863` in every sheet is leftover formatting bloat; real data occupies only rows 1–6.

**Annual-sheet naming is inconsistent across the 3 groups** (`Annual1`, `Annual2`, `Annual` — not the `Annual_1a`/`Annual_1b` convention used by the structurally similar Prenatal/Post-Partum "BP measure/HPN management" files). Functionally fine, but a naming inconsistency worth flagging for config authors mapping `sheet_map`.

### Age/Sex Disaggregation
Maternal age brackets only (10-14, 15-19, 20-49) — no newborn-sex column anywhere in this file. **Important nuance in Group a:** only the baseline "Deliveries" count (cols 3-6) is broken out by age bracket; the actual indicators of interest — Physicians/Nurses/Midwives/SHP-total and Public/Private/FBD-total — are **single Total-only columns**, not disaggregated by age at all. Groups b and c, by contrast, fully disaggregate every category (Vaginal/CS/CVC; Full Term/Pre-Term/Fetal Death/Abortion) by all 3 age brackets plus Total.

### Geographic Levels Present
Region (NIR) → 3 provinces (Negros Occidental, Negros Oriental, Siquijor) → City of Bacolod (HUC) as one aggregate row. No municipality/city or barangay rows. Row 2 (NIR) in every sheet is a same-sheet `SUM` rollup of rows 3-6 (the true raw-entry rows).

### Column Inventory — Group "a" (SHP / FBD)
| Col (0-based) | Label (raw text, abbreviated) | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META (`psgc_column`) | — |
| 1 | Areas (Regions) — constant "NIR" | — | META (unused) | — |
| 2 | Region/PHIC | — | META (`location_column`) | — |
| 3 | Deliveries, 10-14 (a) | `INTRA_DELIVERIES_10_14` | RAW (province rows); region row = SUM(rows 3-6) | — |
| 4 | …15-19 (b) | `INTRA_DELIVERIES_15_19` | RAW | — |
| 5 | …20-49 (c) | `INTRA_DELIVERIES_20_49` | RAW | — |
| 6 | Deliveries Total (d) | `INTRA_DELIVERIES_TOTAL` | COMPUTED | col3+col4+col5 |
| 7 | Attended by Physicians (e) | `INTRA_SHP_PHYSICIAN` | RAW | — (no age breakdown) |
| 8 | % e/d*100 | `INTRA_SHP_PHYSICIAN_PCT` | COMPUTED | col7/col6 (matches label) |
| 9 | Attended by Nurses (f) | `INTRA_SHP_NURSE` | RAW | — |
| 10 | % f/d*100 | `INTRA_SHP_NURSE_PCT` | COMPUTED | col9/col6 (matches label) |
| 11 | Attended by Midwives (g) | `INTRA_SHP_MIDWIFE` | RAW | — |
| 12 | % g/d*100 | `INTRA_SHP_MIDWIFE_PCT` | COMPUTED | col11/col6 (matches label) |
| 13 | Skilled Health Professionals Total (h) | `INTRA_SHP_TOTAL` | COMPUTED | col7+col9+col11 |
| 14 | % h/d*100 | `INTRA_SHP_TOTAL_PCT` | COMPUTED | col13/col6 (matches label) |
| 15 | Delivered in Public Facility (j) | `INTRA_FBD_PUBLIC` | RAW | — |
| 16 | % "j/e*100" (label) | `INTRA_FBD_PUBLIC_PCT` | COMPUTED **label mismatch** | Header claims ÷ Physicians (e/col7); **actual = col15/col6** (÷ Deliveries Total, d) — see FLAG INTRA1-1 |
| 17 | Delivered in Private Facility (k) | `INTRA_FBD_PRIVATE` | RAW | — |
| 18 | % "k/e*100" (label) | `INTRA_FBD_PRIVATE_PCT` | COMPUTED **label mismatch** | Header claims ÷ Physicians; **actual = col17/col6** |
| 19 | Facility-Based Delivery Total (l) | `INTRA_FBD_TOTAL` | COMPUTED | col15+col17 |
| 20 | % "l/e*100" (label) | `INTRA_FBD_TOTAL_PCT` | COMPUTED **label mismatch** | Header claims ÷ Physicians; **actual = col19/col6** |
| 21 | DQC "SHP ≥ FBD" | — | DQC | `IF(col13>=col19,"No Issue","FDB is higher than SHP")` (note: "FDB" typo in message text) |
| 22 | DQC "SHP ≤ Deliveries" | — | DQC | `IF(col13<=col6,"No Issue","SHP is higher than Deliveries/No Deliveries")` |
| 23 | DQC "FBD ≤ Deliveries" | — | DQC | `IF(col19<=col6,"No Issue","FBD is higher than Deliveries/No deliveries")` |

### Column Inventory — Group "b" (Delivery Type)
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0-2 | Meta (PSGC / constant / location) | — | META | — |
| 3-5 | Deliveries 10-14/15-19/20-49 (a,b,c) | (shared with Group a — see FLAG INTRA1-5) | COMPUTED (cross-sheet) | `=Q1a!D2`, `=Q1a!E2`, `=Q1a!F2` |
| 6 | Deliveries Total (d) | (shared) | COMPUTED | col3+col4+col5 |
| 7,9,11,13 | Vaginal 10-14/15-19/20-49/Total (e,f,g,h) | `INTRA_DT_VAGINAL_10_14` … `_TOTAL` | RAW/COMPUTED | Total = sum of 3 brackets |
| 8,10,12,14 | % each ÷ same-bracket Deliveries | `INTRA_DT_VAGINAL_*_PCT` | COMPUTED | col7/col3, col9/col4, col11/col5, col13/col6 — all correctly same-bracket |
| 15,17,19,21 | Cesarean Section 10-14/15-19/20-49/Total (i,j,k,l) | `INTRA_DT_CS_10_14` … `_TOTAL` | RAW/COMPUTED | — |
| 16,18,20,22 | % each ÷ same-bracket Deliveries | `INTRA_DT_CS_*_PCT` | COMPUTED | correctly same-bracket |
| 23,25,27,29 | Combined Vaginal-Cesarean 10-14/15-19/20-49/Total (m,n,o,p) | `INTRA_DT_CVC_10_14` … `_TOTAL` | RAW/COMPUTED | — |
| 24,26,28,30 | % each ÷ same-bracket Deliveries | `INTRA_DT_CVC_*_PCT` | COMPUTED | correctly same-bracket |
| 31-34 | DQC Vaginal ≤ Deliveries ×4 (per bracket + Total) | — | DQC | all correctly same-bracket (verified col-by-col) |
| 35-38 | DQC CS ≤ Deliveries ×4 | — | DQC | correctly same-bracket |
| 39-42 | DQC CVC ≤ Deliveries ×4 | — | DQC | correctly same-bracket |
| 43-46 | DQC "Delivery Type = Deliveries" ×4 (equality) | — | DQC | `IF(col3=SUM(col7,col15,col23), "No issue", "Delivery type is higher than Total Deliveries")` per bracket — **fires "issue" on 4 of 5 rows in the shipped sample data**, see FLAG INTRA1-2 |

All percentage and per-bracket DQC formulas in Group b were verified correctly bracket-matched (no cross-age-bracket shift bug of the kind found in Post Partum File 1) — checked column-by-column against the raw formula strings for every row.

### Column Inventory — Group "c" (Delivery Outcome)
| Col | Label | `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0-2 | Meta | — | META | — |
| 3-6 | Deliveries 10-14/15-19/20-49/Total — **header letters mislabeled (b)(c)(d)(e) instead of (a)(b)(c)(d)** | (shared with Group a) | COMPUTED (cross-sheet) | `=Q1a!D2`, `=Q1a!E2`, `=Q1a!F2`, SUM |
| 7,9,11,13 | Full Term 10-14/15-19/20-49/Total (f,g,h,i) | `INTRA_DO_FULLTERM_10_14` … `_TOTAL` | RAW/COMPUTED | — |
| 8,10,12,14 | % each ÷ same-bracket Deliveries | `INTRA_DO_FULLTERM_*_PCT` | COMPUTED | correctly same-bracket |
| 15,17,19,21 | Pre-Term 10-14/15-19/20-49/Total (j,k,l,m) | `INTRA_DO_PRETERM_10_14` … `_TOTAL` | RAW/COMPUTED | — |
| 16,18,20,22 | % each ÷ same-bracket Deliveries | `INTRA_DO_PRETERM_*_PCT` | COMPUTED | correctly same-bracket |
| 23,25,27,29 | Fetal Death 10-14/15-19/20-49/Total — labeled (n)(o)(p)(q) | `INTRA_DO_FETALDEATH_10_14` … `_TOTAL` | RAW/COMPUTED | — |
| 24,26,28,30 | % each ÷ same-bracket Deliveries | `INTRA_DO_FETALDEATH_*_PCT` | COMPUTED | correctly same-bracket |
| 31,32,33,34 | Abortion 10-14/15-19/20-49/Total — **labeled (n)(o)(p)(q) again, duplicating Fetal Death's letters** | `INTRA_DO_ABORTION_10_14` … `_TOTAL` | RAW/COMPUTED | Total = col31+col32+col33; **no % columns at all for Abortion** (unlike every other category in this file) |
| 35-38 | DQC Full Term ≤ Deliveries ×4 | — | DQC | correctly same-bracket |
| 39-42 | DQC Pre-Term ≤ Deliveries ×4 | — | DQC | correctly same-bracket |
| 43-46 | DQC Fetal Death ≤ Deliveries ×4 | — | DQC | correctly same-bracket |
| 47-50 | DQC "Delivery Outcome = Deliveries" ×4 (equality) | — | DQC | `IF(col3=SUM(col7,col15,col23),"No issue","Delivery Outcome is higher than Total Deliveries")` — **excludes Abortion (col31) from the sum entirely** — see analysis below |

### DQC Rules
- **Completeness check:** `LEN(TRIM(D2))=0` conditional formatting across all raw-data columns in every sheet.
- **PSGC "0"-search rule** on `C2:C6` in every sheet — cosmetic/leftover, not a meaningful DQC.
- **Percentage-highlight rule correctly scaled:** `cellIs greaterThan 1` on every percentage column (raw 0–1 ratio, not the literal `100`) — confirms bug class (b) does not recur.
- **Group a's 3 DQC formulas compare raw counts directly** (`SHP total ≥ FBD total`, `SHP total ≤ Deliveries`, `FBD total ≤ Deliveries`) — all evaluate "No Issue" on all 5 rows in the shipped sample data.
- **Group b's 12 per-category DQC formulas + 4 equality checks** are all correctly bracket-matched. **The 4 equality checks fire real mismatches** on 4 of 5 rows (NIR, Negros Occidental, City of Bacolod HUC all fail; only Siquijor passes; Negros Oriental partially fails). See FLAG INTRA1-2.
- **Group c's 12 per-category DQC formulas + 4 equality checks** are correctly bracket-matched, and the equality check **deliberately excludes the Abortion category** from the "outcome should sum to total deliveries" check — verified this is by design, not a bug (see analysis below), since Negros Occidental passes the check (Full Term + Pre-Term + Fetal Death = 6850 = Deliveries Total) despite having 90 recorded abortions that are correctly treated as outside the delivery-outcome universe.
- **Conditional-formatting anchors correctly bound to the real 5 data rows** (`2:6`) in every sheet across all 3 groups, including the Annual sheets — no off-by-one anchor bug found anywhere in this file.

### Flags / Open Questions — File 1

- **FLAG INTRA1-1 (label/formula denominator mismatch, Group a, cols 16/18/20):** The header text for the three "% delivered in facility type" columns reads `j/e*100`, `k/e*100`, `l/e*100` — implying the denominator is (e), the Physicians count (col7). The actual stored formula, verified via `openpyxl` formula strings and confirmed with cached-value arithmetic on all 5 rows (e.g. NIR: col15=7109, col16 cached=0.6978; `7109/10188 (col6, Deliveries Total)=0.6978` ✓ matches; `7109/5374 (col7, Physicians)=1.32` ✗ does not match), divides by **col6 (Deliveries Total, "d")** instead. The actual formula is the clinically sensible one (facility-type share of total deliveries, not of physician-attended deliveries) — this is the same "header stale, formula already fixed/correct" pattern documented for Prenatal File 6 (GD screening), except here it is undocumented (change_log's one entry references only the SHP/FBD DQC formula, not this). **Config authors must use `INTRA_DELIVERIES_TOTAL` as the denominator for `INTRA_FBD_PUBLIC_PCT`/`_PRIVATE_PCT`/`_TOTAL_PCT`, not `INTRA_SHP_PHYSICIAN`.**
- **FLAG INTRA1-2 (real, functioning DQC failures in the shipped sample data, Group b):** The "Delivery Type = Deliveries" equality check genuinely fails for NIR, Negros Occidental, Negros Oriental (Total bracket only), and City of Bacolod (HUC) — only Siquijor passes cleanly. E.g., Negros Occidental: Vaginal Total (8576) + CS Total (1000) + CVC Total (5) = 9581, but Deliveries Total = 10188 (mismatch of 607). Unlike the Post Partum/Prenatal DQC bugs, **this check is correctly wired and does fire** — but it exposes that the shipped Q1 sample data itself is internally inconsistent (the three delivery-type categories don't sum to the reported total deliveries in most rows). This needs to be confirmed with the DOH region team as either (a) a genuine data-entry gap in the sample data (most likely, given the pattern also appears independently in Group c and in File 2), or (b) evidence that "Combined Vaginal-Cesarean" overlaps with, rather than being additive to, Vaginal/CS (which would make the equality check itself conceptually wrong) — the shipped numbers (sum consistently *lower* than total, never higher) argue against overlap/double-counting and instead suggest missing delivery-type records for some deliveries.
- **FLAG INTRA1-3 (header letter duplication, Group c):** The "Abortion" category (cols 31-34) reuses the exact same shorthand letters `(n)(o)(p)(q)` already used two categories earlier for "Fetal Death" (cols 23,25,27,29). This is a clear copy-paste labeling defect (should be `(r)(s)(t)(u)`) — cosmetic only, since column position/formula wiring is unambiguous by index, but a config author trusting the letter shorthand to cross-reference formulas could get confused.
- **FLAG INTRA1-4 (Group c "Deliveries" columns mislabeled starting at letter "b" instead of "a"):** Cols 3-6 in Group c are headed `(b)(c)(d)(e)` rather than `(a)(b)(c)(d)`, a stale leftover from the shared Group-a lettering scheme. Cosmetic — the underlying cross-sheet formula (`=Q1a!D2` etc.) correctly pulls the right data regardless.
- **FLAG INTRA1-5 (cross-sheet column duplication — Groups b and c do not independently collect "Deliveries"):** Both Group b (cols 3-6) and Group c (cols 3-6) pull the Deliveries columns via direct cell reference to Group a (`=Q1a!D2`, `=Q1a!E2`, `=Q1a!F2`, same-sheet SUM for Total) rather than being independently entered. **The parser must treat `INTRA_DELIVERIES_*` as a single shared indicator sourced from Group a only — ingesting the b/c sheet copies as separate raw rows would double-count identical data.**
- **FLAG INTRA1-6 (Group a's core indicators are not age-disaggregated, unlike Groups b/c):** Only the baseline "Deliveries" denominator carries the 10-14/15-19/20-49 breakdown in Group a; the actual attendant-type and facility-type counts (Physicians/Nurses/Midwives/SHP, Public/Private/FBD) are Total-only columns. This is a real structural asymmetry within the same file — worth confirming with DOH region whether attendant/facility type was never intended to be tracked by maternal age, or whether this is a template design gap relative to Groups b/c.
- **Minor typo:** DQC message text for col21 reads "**FDB** is higher than SHP" (should be "FBD"). Cosmetic only.
- **change_log confirms one formula fix already applied** (v1.1, "Adjusted formula" for "DQC Columns (Q1 to Annual) SHP, FDB" by Dexter Flores, Jan 20 2026) — vague description, but consistent with Group a's DQC columns (21-23) being the ones referenced; no fix is logged for the FLAG INTRA1-1 label mismatch or the Group c letter duplication.

---

## File 2: `2. intra_bw_nir.xlsx`
**Tracks:** Newborn birth weight classification (Normal / Low / Unknown) against total live births, disaggregated by **newborn sex** (Male/Female) — no maternal age bracket in this file.

### Sheet Structure
| Sheet | Type |
|---|---|
| Q1–Q4 | Quarterly data (Q2–Q4 blank, verified cell-by-cell) |
| Annual | Computed rollup (per-sex raw columns correctly cross-quarter-summed; "Live Births" column does **not** follow this pattern — see FLAG INTRA2-1) |
| change_log | Admin — completely empty (header row only, no entries) |

**Frequency:** Quarterly + Annual. **Rows:** 5 (same province-rollup locations as File 1). **Columns:** 23 real (`max_col=27` reported by openpyxl is bloat — cols 23-26 are blank).

### Age/Sex Disaggregation
**Newborn sex (Male/Female)** for every birth-weight category — no maternal age bracket anywhere in this file. This is the only file in the Intra Partum sub-group (and, per the Prenatal/Post-Partum analyses already on file, the only file across all of Maternal Care reviewed so far) that disaggregates by the child's sex rather than the mother's age.

### Geographic Levels Present
Same 5-row province rollup as File 1 (Region NIR + 3 provinces + City of Bacolod HUC), identical PSGC codes.

### Column Inventory
| Col (0-based) | Label | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0 | PSGC 10 | — | META (`psgc_column`) | — |
| 1 | Areas (Regions) — constant "NIR" | — | META (unused) | — |
| 2 | Region/PHIC | — | META (`location_column`) | — |
| 3 | Live births (a) | `INTRA_BW_LIVEBIRTHS` | **INCONSISTENT — RAW for 2 of 5 rows, COMPUTED (self-referential) for 3 of 5 rows** | See FLAG INTRA2-1 |
| 4 | Normal birth weight (Male) (b) | `INTRA_BW_NORMAL_MALE` | RAW | — |
| 5 | % b/a*100 | `INTRA_BW_NORMAL_MALE_PCT` | COMPUTED | col4/col3 |
| 6 | Normal birth weight (Female) (c) | `INTRA_BW_NORMAL_FEMALE` | RAW | — |
| 7 | % c/a*100 | `INTRA_BW_NORMAL_FEMALE_PCT` | COMPUTED | col6/col3 |
| 8 | Normal birth weight Total (d) | `INTRA_BW_NORMAL_TOTAL` | COMPUTED | col4+col6 |
| 9 | % d/a*100 | `INTRA_BW_NORMAL_TOTAL_PCT` | COMPUTED | col8/col3 |
| 10 | Low birth weight (Male) (e) | `INTRA_BW_LOW_MALE` | RAW | — |
| 11 | % e/a*100 | `INTRA_BW_LOW_MALE_PCT` | COMPUTED | col10/col3 |
| 12 | Low birth weight (Female) (f) | `INTRA_BW_LOW_FEMALE` | RAW | — |
| 13 | % f/a*100 | `INTRA_BW_LOW_FEMALE_PCT` | COMPUTED | col12/col3 |
| 14 | Low birth weight Total (g) | `INTRA_BW_LOW_TOTAL` | COMPUTED | col10+col12 |
| 15 | % g/a*100 | `INTRA_BW_LOW_TOTAL_PCT` | COMPUTED | col14/col3 |
| 16 | Unknown birth weight (Male) (h) | `INTRA_BW_UNKNOWN_MALE` | RAW | — |
| 17 | % h/a*100 | `INTRA_BW_UNKNOWN_MALE_PCT` | COMPUTED | col16/col3 |
| 18 | Unknown birth weight (Female) (i) | `INTRA_BW_UNKNOWN_FEMALE` | RAW | — |
| 19 | % i/a*100 | `INTRA_BW_UNKNOWN_FEMALE_PCT` | COMPUTED | col18/col3 |
| 20 | Unknown birth weight Total (j) | `INTRA_BW_UNKNOWN_TOTAL` | COMPUTED | col16+col18 |
| 21 | % j/a*100 | `INTRA_BW_UNKNOWN_TOTAL_PCT` | COMPUTED | col20/col3 |
| 22 | DQC "BW = Total Live births" | — | DQC (equality) | `IF(col3=SUM(col8,col14,col20),"Same as Total Live births","Higher than Live births")` — see FLAG INTRA2-2 |

All 9 percentage formulas (cols 5,7,9,11,13,15,17,19,21) were verified consistent with their labels — every one divides by col3 ("Live Births") as expected, with no denominator ambiguity of the kind found in Prenatal Files 5/6.

### DQC Rules
- **Completeness check** (`LEN(TRIM(D2))=0`) across all raw data columns.
- **Percentage-highlight rule correctly scaled:** `cellIs greaterThan 1` on all 9 percentage columns — confirms bug class (b) does not recur here either.
- **"BW = Total Live Births" equality check (col22):** intended as "the three birth-weight category totals should sum to total live births." **This check is critically undermined by FLAG INTRA2-1** — see below.
- **Conditional-formatting anchors correctly bound to the 5 real data rows** (`2:6`) in every sheet — no off-by-one anchor bug.

### Deep dive — FLAG INTRA2-1 (critical, confirmed bug): "Live Births" is a formula for 3 rows and raw data for 2 rows, and the two representations disagree

The "Live Births (a)" column (col3) is the file's central denominator. Inspecting the **stored formula per row** (not just the header) in `Q1` reveals:

| Row | Location | Live Births (col3) — stored formula/value | Normal+Low+Unknown BW Total (col8+col14+col20) | Match? |
|---|---|---|---|---|
| 2 | NIR (Region) | `=SUM(I2,O2,U2)` → **10,376** (self-referential: literally defined as the sum of the three BW totals) | 8943+826+607 = **10,376** | Tautologically always "yes" |
| 3 | Negros Occidental | `=SUM(I3,O3,U3)` → **6,875** (same self-referential pattern) | 5912+537+426 = **6,875** | Tautologically always "yes" |
| 4 | Negros Oriental | `=SUM(I4,O4,U4)` → **2,035** (same pattern) | 1689+166+180 = **2,035** | Tautologically always "yes" |
| 5 | Siquijor | **243** (literal hard-coded number, not a formula) | 215+28+0 = **243** | Coincidentally matches |
| 6 | City of Bacolod (HUC) | **1,070** (literal hard-coded number, not a formula) | 1127+95+1 = **1,223** | **Does not match — 153 short** |

**Mechanism:** For 3 of the 5 rows (NIR, Negros Occidental, Negros Oriental), "Live Births" is not an independently entered figure at all — it is *defined by* the same formula (`=SUM(I,O,U)`, i.e. Normal-Total + Low-Total + Unknown-Total) that the DQC check (col22) then compares it against. This makes the DQC check **structurally tautological and permanently unable to fail** for those 3 rows, regardless of what the true live-birth count should be. For the remaining 2 rows (Siquijor, City of Bacolod HUC), "Live Births" is a genuine raw/typed number, independent of the BW columns — and for City of Bacolod (HUC) this reveals a **real, provable data discrepancy**: 1,070 recorded live births vs. 1,223 births classified by weight category (a shortfall of 153, i.e., 153 birth-weight-classified newborns exist with no corresponding "live birth" entry, or the live-birth count for this row was under-reported). The DQC column correctly flags this row "**Higher than Live births**" (cached value confirmed) — but only because this particular row happens to still have a raw, non-circular value in col3.

**Consequence for the Region (NIR) rollup:** Since NIR's Live Births is *also* computed via the same self-referential formula rather than as `SUM(D3:D6)` (sum of the four province-level Live Births), NIR's reported Live Births (10,376) does **not** equal the sum of the four province rows' Live Births (6,875 + 2,035 + 243 + 1,070 = **10,223**) — a 153-unit discrepancy, exactly matching the Bacolod shortfall. **This proves the region-level total is silently inflated by exactly the same amount the Bacolod row's birth-weight breakdown over-counts its own live births.**

**Practical risk for schema/parser design:** Whoever configures `INTRA_BW_LIVEBIRTHS` must **not** implement it as `NORMAL_TOTAL + LOW_TOTAL + UNKNOWN_TOTAL` (which is what 3 of 5 rows' Excel formulas literally say) — doing so reproduces a self-referential, non-independent denominator that can never expose a real data-quality problem, exactly the opposite of the file's own intent. Nor can the parser simply trust "Live Births" as pure raw input across all rows, since 3 of the 5 rows in the shipped template have already had their raw entry silently overwritten by a formula. **This is functionally the File 2 analogue of Post Partum's FLAG PP1-1** (a genuine, quantifiable formula-shift bug hiding inside what looks like a normal computed column) and should be raised with the DOH region team before this file is used as a config template: the correct fix is for "Live Births" to be an independently-entered raw figure in every row (as Siquijor and City of Bacolod HUC already correctly demonstrate it should be), with the region/province rollups computed as `SUM` of the raw province entries, not as a re-derivation from the birth-weight breakdown.

### Flags / Open Questions — File 2

- **FLAG INTRA2-1 (critical, confirmed bug):** See deep dive above. "Live Births" (col3) is formula-derived (`=SUM(Normal_Total, Low_Total, Unknown_Total)`) for NIR/Negros Occidental/Negros Oriental, but raw/typed for Siquijor/City of Bacolod (HUC) — an internally inconsistent column that (a) makes the file's own DQC check tautological for 3 of 5 rows, and (b) causes the NIR regional total to be inflated by 153 relative to a true rollup of the province-level raw entries, traceable directly to the City of Bacolod (HUC) discrepancy. **Recommend:** configure `INTRA_BW_LIVEBIRTHS` as a genuinely independent raw indicator (matching the Siquijor/Bacolod pattern), not as a derived sum of the BW categories, and flag the Negros Occidental/Negros Oriental/NIR cells in the source template for correction by the DOH region team.
- **FLAG INTRA2-2 (DQC partially dead-on-arrival, but for a different reason than the Prenatal/Post-Partum scale bug):** The "BW = Total Live Births" check is tautologically true (can never fail) for 3 of 5 rows because of FLAG INTRA2-1, but is a real, functioning check for the other 2 rows — and it **does** correctly catch the City of Bacolod (HUC) discrepancy in the shipped sample data. This is a partial-functionality DQC bug, not a total failure like Post Partum's scale-mismatch bug.
- **FLAG INTRA2-3 (Annual-sheet inconsistency):** The Annual sheet's per-sex raw columns (Normal/Low/Unknown Male & Female) correctly use the standard cross-quarter rollup formula (`=SUM('Q1'!E5,'Q2'!E5,'Q3'!E5,'Q4'!E5)`), but the "Live Births" column in Annual uses the **same same-sheet self-referential formula** (`=SUM(I,O,U)`) as the quarterly sheets, rather than a cross-quarter rollup of the raw Q1-Q4 "Live Births" entries. This means the Annual sheet's Live Births figure inherits the exact same FLAG INTRA2-1 defect, and — because Q2-Q4 are blank — evaluates to the same (inconsistent) value as Q1.
- **change_log is completely empty** (header row only, no entries) — no fix history to audit for this file, unlike File 1.
- No "Projected Population (Under 1)" column present (Flag P from Prenatal/Post Partum does not recur in this file either).

---

## Cross-File Comparison

| Aspect | File 1: SHP/FBD/DT/DO | File 2: Birth Weight |
|---|---|---|
| Sheets | Q1a-Q4a+Annual1, Q1b-Q4b+Annual2, Q1c-Q4c+Annual, change_log (16 total) | Q1-Q4, Annual, change_log (6 total) |
| Frequency | Quarterly + Annual | Quarterly + Annual |
| Rows | 5 (province rollup) | 5 (province rollup, same PSGC list) |
| Columns | 24 (group a) / 47 (group b) / 51 (group c) | 23 |
| Disaggregation axis | Maternal age bracket (10-14/15-19/20-49) | Newborn sex (Male/Female) |
| Sex/Age other axis | None (no newborn sex tracked) | None (no maternal age bracket) |
| Meta columns | 3 (PSGC, constant-NIR, location) | 3 (PSGC, constant-NIR, location) |
| Denominator type | Chained (age-bracketed Deliveries count, shared across groups a/b/c) | Chained (Live Births) — but internally inconsistent (see FLAG INTRA2-1) |
| Population (Under 1) column | Absent | Absent |
| Q2-Q4 data | Blank (Q1-only test data) | Blank (Q1-only test data) |
| DQC | Functioning; real mismatches fire on 4/5 rows (group b) and 2/5 rows (group c), cluster on City of Bacolod (HUC) | Functioning for 2/5 rows; tautological/dead for 3/5 rows (FLAG INTRA2-1/2) |
| DQC scale-mismatch bug (Post-Partum-style) | Not present — checked and cleared | Not present — checked and cleared |
| CF anchor off-by-one (NCD-style bug) | Not present — checked and cleared | Not present — checked and cleared |
| change_log | 1 entry (Group a DQC formula fix, logged) | Empty (no entries) |
| Known formula/label bugs | Label/denominator mismatch (FLAG INTRA1-1); duplicated header letters (FLAG INTRA1-3); cross-sheet indicator duplication (FLAG INTRA1-5) | **Critical: self-referential vs. raw "Live Births" inconsistency, producing a quantifiable 153-unit data mismatch (FLAG INTRA2-1)** |
| Municipality-level file present? | No | No |

---

## Consolidated Flags

| ID | File | Flag |
|---|---|---|
| **INTRA1-1** | File 1, Group a | Header labels for cols 16/18/20 claim denominator = Physicians count (e), but the actual stored formula divides by Deliveries Total (d, col6) — verified via formula string and cached-value arithmetic on all 5 rows. The actual formula is the clinically correct one; config authors must use `INTRA_DELIVERIES_TOTAL`, not `INTRA_SHP_PHYSICIAN`, as the denominator. |
| **INTRA1-2** | File 1, Group b | The "Delivery Type = Deliveries" equality DQC check is correctly wired and genuinely fires on 4 of 5 rows in the shipped sample data (Vaginal+CS+CVC totals don't sum to reported Deliveries Total) — confirms this is a real, unresolved data-quality issue in the sample data, not a broken check. Needs confirmation with DOH region on whether this reflects incomplete sample data or a genuine category-definition issue. |
| **INTRA2-1** | File 2 | **Critical, confirmed formula bug.** "Live Births" (col3) is self-referentially formula-derived (`=SUM(BW category totals)`) for NIR/Negros Occidental/Negros Oriental but independently raw for Siquijor/City of Bacolod (HUC). This makes the file's own "BW = Live Births" DQC check tautological for 3 of 5 rows and causes the NIR regional total to be inflated by exactly 153 relative to a true rollup of raw province entries — traceable directly to a real Live-Births/BW-category mismatch at City of Bacolod (HUC). Config authors must not implement `INTRA_BW_LIVEBIRTHS` as a derived sum of the BW categories. |
| **INTRA2-2** | File 2 | DQC "BW = Total Live Births" check inherits INTRA2-1's defect: tautologically true for 3 of 5 rows, but does correctly fire for the 2 rows (Siquijor, Bacolod) where Live Births is genuinely raw — partial, not total, DQC failure. |
| **INTRA1-3** | File 1, Group c | Header letters for "Abortion" (cols 31-34) duplicate the letters already used for "Fetal Death" two categories earlier (`(n)(o)(p)(q)` reused verbatim) — cosmetic labeling defect, formula wiring unaffected. |
| **INTRA1-5** | File 1, Groups b & c | The "Deliveries" columns in Groups b and c (cols 3-6) are cross-sheet references to Group a (`=Q1a!D2` etc.), not independently entered — parser must treat `INTRA_DELIVERIES_*` as a single shared indicator sourced once from Group a, not re-ingested per group. |
| **INTRA1-6** | File 1, Group a | Group a's core indicators (attendant type, facility type) are not age-disaggregated, unlike every other category in this 2-file sub-group — confirm with DOH region whether this is an intentional design choice or a template gap. |
| **INTRA2-3** | File 2 | Annual sheet's "Live Births" column also uses the same-sheet self-referential formula rather than a cross-quarter rollup of raw Q1-Q4 entries, inheriting FLAG INTRA2-1 into the Annual rollup as well. |
| **INTRA-Q1** | Both | Q2-Q4 sheets contain zero real data in the shipped files; only Q1 and its Annual mirror have values — confirm this is expected sample/test data before validating parser configs. |
| **INTRA-Q2** | File 1, Group c | The "Delivery Outcome = Deliveries" equality check deliberately excludes the Abortion category from its sum (verified: Negros Occidental passes with 90 recorded abortions outside the check) — appears to be intentional design (abortion is not counted as a "delivery"), but should be confirmed explicitly with DOH region rather than assumed. |

---

## Summary

This 2-file Intra Partum sub-group is structurally simpler than its Prenatal/Post-Partum siblings (only 5-row province-rollup granularity in both files, no 68-row municipality-level file, no shared "Projected Population (Under 1)" denominator), but it introduces a genuinely different and more consequential class of problem: **File 2's "Live Births" denominator column is internally self-contradictory** — a formula-derived circular reference for 3 of 5 rows and an independent raw value for the other 2 — and this inconsistency is not cosmetic: it demonstrably inflates the regional total by exactly the same 153-unit gap visible at the City of Bacolod (HUC) row, and it renders the file's own "birth-weight categories should sum to live births" DQC check permanently unable to fail for 60% of the reported rows. File 1 is comparatively cleaner and, notably, has **no** examples of the two bug classes (conditional-formatting anchor off-by-one, DQC percentage-vs-100 scale mismatch) that recurred throughout every previously-analyzed Maternal Care file — its DQC design instead compares raw counts to raw counts, and as a result its checks **actually fire on real problems** in the shipped sample data (a 4-of-5-row delivery-type mismatch in Group b, and a Bacolod-specific delivery-outcome mismatch in Group c), which is a positive sign for the design but also means the sample data itself needs review before being used to validate parser configs. File 1's remaining issues are lower-severity: a stale/mislabeled denominator reference in Group a's facility-type percentages (the underlying formula is actually correct), a duplicated header letter in Group c's Abortion columns, and a structural quirk where Groups b and c do not independently collect their own "Deliveries" baseline but instead reference Group a's sheet directly — the parser must treat that baseline as a single shared indicator, not three duplicates. Before building parser configs for this sub-group, the team should (a) resolve with DOH region whether File 2's "Live Births" should be raw in every row (recommended, matching the Siquijor/Bacolod precedent) rather than formula-derived in three of them, (b) confirm whether File 1 Group c's exclusion of Abortion from the "Delivery Outcome = Deliveries" equality check is intentional, and (c) decide whether the City of Bacolod (HUC) row's recurring data mismatches across both files (Live Births vs. BW categories in File 2; Delivery Outcome vs. Deliveries in File 1) point to a shared, unresolved data-entry gap specific to that location that should be raised with the region before go-live.
