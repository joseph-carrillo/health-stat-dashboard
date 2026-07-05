# NCD (Non‑Communicable Disease Prevention & Control) — Template Analysis

**Location analyzed:** `backend/data/NCD/` (5 files: `ncd_cancer_nir.xlsx`, `ncd_eyehealth_nir.xlsx`, `ncd_meds_nir.xlsx`, `ncd_mh_nir.xlsx`, `ncd_ra_nir.xlsx`)

**Method:** Every sheet was read with `openpyxl` in both `data_only=False` (to see the stored formula strings) and `data_only=True` (to see the cached computed values), per the project rule that header text cannot be trusted and computed values must be re-derived from raw inputs, never trusted as-is (`adding_templates.md`). Conditional-formatting rules were enumerated with their exact `sqref` ranges and formulas (not just their presence) to verify whether each DQC rule's row range actually overlaps real data. Cross-file numeric cross-checks were run wherever a sheet's own header text asserted a relationship to a sibling file.

**Program code:** No `NCD` program code exists yet in `backend/app/core/seed_programs.sql`, and no `NCD_*` indicators exist yet in `seed_indicators.py` — this is a brand-new program, same situation `MATERNAL_CARE` was in before its own analysis.

**RBAC / Sensitive Indicators check:** None of these 5 files contain HIV or Syphilis reactive-case data (the only two categories `memory-bank/CLAUDE.md` currently names under "Sensitive Indicators"). However, `ncd_mh_nir.xlsx` contains person-level mental-health assessment counts (mhGAP screening) broken down to province/HUC granularity. Mental illness carries significant stigma in Philippine communities, arguably comparable to — or greater than — the concern already raised for Leprosy in `infectious_disease_leprosy.md` (Flag 12 there). **This should be treated as an open question for the project owner, not assumed either way**: should `NCD_MH_*` indicators get `is_sensitive = TRUE` treatment (aggregated-only display for unauthorized roles) even though CLAUDE.md doesn't currently list mental-health data under that section? See Flag MH‑3 below.

**Headline finding, up front:** this batch contains the most severe verified bugs found in the template-analysis series so far — a genuine leftover **wrong-region data block with 106 rows of `#ERROR!` cells** sitting above the real NIR data in `ncd_meds_nir.xlsx`'s December sheet (Flag MD‑1), and a **systemic off-by-one row-anchoring bug** that silently disables nearly every meaningful DQC rule (not just the cosmetic ones) in 3 of the 5 files (Flag X‑1). A third finding shows `ncd_meds_nir.xlsx`'s "monthly" sheets are actually **year-to-date cumulative**, not monthly-flow, for a subset of their columns — verified by hand-tracing the underlying formulas month over month (Flag MD‑2).

---

## File 1: `ncd_cancer_nir.xlsx`
**Tracks:** Two independent screening programs in one workbook — (a) Cervical Cancer screening (VIA/Pap Smear/HPV DNA, precancerous-lesion and suspicious-case follow-up) and (b) Breast Cancer Early Detection Services (BCEDS: CBE/Mammogram-Ultrasound, by 30-69 general screening and 50-69 targeted screening).

### Sheet Structure
| Sheet | Type | Rows (data) | Columns | Notes |
|---|---|---|---|---|
| `Qtr1a`–`Qtr4a`, `Annuala` | Quarterly + Annual | 5 | 22 (A:V) | Cervical Cancer ("a" group) |
| `Qtr1b`–`Qtr4b`, `Annualb` | Quarterly + Annual | 5 | 30 (A:AD) | Breast Cancer ("b" group) |
| `Population` | Reference | — | — | **Empty stub** — dims `A1:A1`, no header, no data |
| `changelog` | Admin | — | 7 | Not imported. 1 entry (see Flag CA‑3) |

**Frequency:** Quarterly + Annual only (`Annuala`/`Annualb` are formula rollups: `=SUM('Qtr1a'!D3,'Qtr2a'!D3,'Qtr3a'!D3,'Qtr4a'!D3)` per cell — a derived view, not independently entered data).
**Rows:** 5 data rows only — Region (NIR) + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod (HUC). **No municipality-level breakdown at all** (province/HUC-rollup granularity only, matching the "Files 2-7" pattern from `maternal_care_prenatal.md`, not the 68-row municipality pattern).

### Age/Sex Disaggregation
Both groups disaggregate by Male/Female for every raw count and computed total. **No age-bracket breakdown** — Cervical Cancer targets "women" generally (denominator is a single "Target Population" column, not age-split), Breast Cancer has two population/target columns (30-69 general vs 50-69 targeted) but no finer age brackets.

### Geographic Levels Present
Region (NIR) → 3 Provinces (Negros Occidental, Negros Oriental, Siquijor) → City of Bacolod (HUC) as a single row. No municipality/city breakdown, no barangay breakdown.

### Column Inventory — Sheet `Qtr1a` (Cervical Cancer, canonical)
| Col | Label (as written) | Proposed `indicator_code` | Type | Formula | Unit |
|---|---|---|---|---|---|
| 0 | PSGC 10 | — | META | — | PSGC |
| 1 | Region, Province/City, Municipality | — | META | — | text |
| 2 | Target Population (a) | `NCD_CACX_TARGET_POP` | RAW | — | count |
| 3 | Women screened using VIA (b) | `NCD_CACX_VIA` | RAW | — | count |
| 4 | Women screened using Pap Smear (c) | `NCD_CACX_PAP` | RAW | — | count |
| 5 | Women screened using HPV DNA (d) | `NCD_CACX_HPVDNA` | RAW | — | count |
| 6 | Women Assessed Only (e) | `NCD_CACX_ASSESSED_ONLY` | RAW | — | count |
| 7 | Screened [Total] — "Precancerous Lesions Denominator" (f=b+c+d) | `NCD_CACX_SCREENED_TOTAL` | COMPUTED | col3+col4+col5 | count |
| 8 | Screened/Assessed [Total] — "Suspicious Denominator" (g=b+c+d+e) | `NCD_CACX_SCREENED_ASSESSED_TOTAL` | COMPUTED | col3+col4+col5+col6 | count |
| 9 | Screened/Assessed [%] (h=g/a) | `NCD_CACX_SCREENED_ASSESSED_PCT` | COMPUTED | col8/col2 | % |
| 10 | Found Suspicious for CaCx (i) | `NCD_CACX_SUSPICIOUS` | RAW | — | count |
| 11 | Found Suspicious [%] (j=i/g) | `NCD_CACX_SUSPICIOUS_PCT` | COMPUTED | col10/col8 | % |
| 12 | Suspicious, Linked to Care [Referred] (k) | `NCD_CACX_SUSPICIOUS_REFERRED` | RAW | — | count |
| 13 | Suspicious, Referred [%] (l=k/i) | `NCD_CACX_SUSPICIOUS_REFERRED_PCT` | COMPUTED | col12/col10 | % |
| 14 | Suspicious, Linked to Care [Treated] (m) | `NCD_CACX_SUSPICIOUS_TREATED` | RAW | — | count |
| 15 | Suspicious, Treated [%] (n=m/i) | `NCD_CACX_SUSPICIOUS_TREATED_PCT` | COMPUTED | col14/col10 | % |
| 16 | Positive for Precancerous Lesions (o) | `NCD_CACX_PRECANCER_POSITIVE` | RAW | — | count |
| 17 | Positive Precancer [%] (p=o/f) | `NCD_CACX_PRECANCER_POSITIVE_PCT` | COMPUTED | col16/col7 | % |
| 18 | Positive Precancer, Linked [Referred] (q) | `NCD_CACX_PRECANCER_REFERRED` | RAW | — | count |
| 19 | Positive Precancer, Referred [%] (r=q/o) | `NCD_CACX_PRECANCER_REFERRED_PCT` | COMPUTED | col18/col16 | % |
| 20 | Positive Precancer, Linked [Treated] (s) | `NCD_CACX_PRECANCER_TREATED` | RAW | — | count |
| 21 | Positive Precancer, Treated [%] (t=s/o) | `NCD_CACX_PRECANCER_TREATED_PCT` | COMPUTED | col20/col16 | % |

Note the denominator chain: `col17` (Positive Precancer %) divides by `col7` (VIA+Pap+HPV only, **excludes** "Assessed Only"), while `col9` (Screened/Assessed %) divides by `col2` and `col11` (Suspicious %) divides by `col8` (**includes** Assessed Only) — two different, deliberately distinct denominators coexist in the same sheet. Confirmed via formula, not assumed from labels.

### Column Inventory — Sheet `Qtr1b` (Breast Cancer/BCEDS)
| Col | Group | Proposed `indicator_code` (pattern) | Type |
|---|---|---|---|
| 0-1 | META | psgc, location | — |
| 2 | Women Seen 30-69 (a) | `NCD_BRCA_WOMENSEEN` | RAW |
| 3-4 | High-risk/Symptomatic (b), % (c=b/a) | `NCD_BRCA_HIGHRISK[_PCT]` | RAW/COMPUTED |
| 5-8 | BCEDS [CBE](d), [Mammo/US](e), [Total](f=d+e), [%](g=f/b) | `NCD_BRCA_BCEDS_*` | RAW/COMPUTED |
| 9-12 | BCEDS w/ significant results [CBE/Mammo/Total/%=j/f] | `NCD_BRCA_BCEDS_SIG_*` | RAW/COMPUTED |
| 13-16 | Sig. results, Linked to Care [CBE/Mammo/Total/%=n/j] | `NCD_BRCA_SIG_LINKED_*` | RAW/COMPUTED |
| 17 | Target Population 50-69 (p) | `NCD_BRCA_TARGET_POP` | RAW |
| 18-21 | Screened for BrCa 50-69 [CBE/Mammo/Total/%=s/p] | `NCD_BRCA_SCREENED_*` | RAW/COMPUTED |
| 22-25 | Screened w/ significant results [CBE/Mammo/Total/%=w/s] | `NCD_BRCA_SCREENED_SIG_*` | RAW/COMPUTED |
| 26-29 | Sig. results, Linked to Care (BCEDS) [CBE/Mammo/Total/%=aa/w] | `NCD_BRCA_SIG_LINKED2_*` | RAW/COMPUTED |

All 8 percentage formulas in the "b" group were verified against their labels and are internally correct (e.g., col8 `=IFERROR(H2/D2,0)` = f/b as labeled; col29 `=IFERROR(AC2/Y2,0)` = ab/aa... i.e. aa/w as labeled) — **no formula/label bugs found in the breast-cancer group**, only a DQC gap (see below).

### DQC Rules Visible in the Sheet
- **"a" (Cervical Cancer) sheet:** 9 conditional-formatting rules exist — a >200% threshold on the Screened/Assessed % (col9, unusually generous vs. the ">100%" convention used everywhere else in this whole template family), >100% thresholds on cols 11/13/15/17/19/21, and 2 logical-consistency checks (`Suspicious count (col10) > Screened/Assessed total (col8)`; `Positive-for-precancer count (col16) > Screened total (col7)`). **All 9 of these rules are anchored to Excel rows `7:1000`, but the real data ends at row 6** (5 data rows, rows 2-6) — see cross-cutting Flag X‑1. Only the generic blank-completeness check (`C2:V6`) is correctly anchored and actually fires.
- **"b" (Breast Cancer) sheet:** **Zero** threshold or logical-consistency DQC rules exist at all — only the blank-completeness check. This is a real asymmetry within the same workbook: the cervical-cancer half was clearly designed with DQC in mind (even if broken), the breast-cancer half never got any.

### Flags / Open Questions — File 1 (Cancer)
- **Flag CA‑1:** All 9 meaningful DQC rules in the "a" sheet are dead due to the row‑7 vs row‑6 off-by-one anchor (see Flag X‑1 for the cross-file pattern and root-cause discussion).
- **Flag CA‑2:** The "b" sheet has no DQC coverage whatsoever — worth raising with DOH region whether this was an intentional scope decision or simply never got built out (Prenatal File 8 had the identical "zero DQC" gap, so this may be a known, accepted omission for certain template types — worth confirming once, not per-file).
- **Flag CA‑3:** `changelog` has exactly one entry (v1.2, 2026‑03‑18): "Removed the Risk Assessed column... It is not included in the metadata." This confirms a column was deleted from this workbook at some point but gives no column letter/position, so it cannot be reconciled with the current 22/30-column layout — treat as informational only.
- **Flag CA‑4:** `Population` sheet is a completely empty stub (`A1:A1`), same pattern as WASH's `Household` sheet — unclear if ever intended to hold reference population data, since population is instead entered inline in column 2 of every "a"/"b" quarter sheet.
- No HIV/Syphilis-type sensitive indicators in this file.

---

## File 2: `ncd_eyehealth_nir.xlsx`
**Tracks:** Eye-ailment screening (Vision changes, Appearance changes, Eye/Orbital injury, Routine eye exam findings), consolidated into an "at least one ailment" case count, referral to an eye-health professional — by 4 age brackets and sex.

### Sheet Structure
| Sheet | Type | Rows (data) | Columns | Notes |
|---|---|---|---|---|
| `Qtr1`–`Qtr4`, `Annual` | Quarterly + Annual | 20 | 28 (A:AB) | identical structure across all 5 sheets |
| `Population` | Reference | — | — | Empty stub, same as File 1 |
| `changelog` | Admin | — | 7 | 1 entry, stale column reference (Flag EY‑3) |

**Frequency:** Quarterly + Annual (`Annual` = `SUM` of the 4 quarters per cell, standard rollup pattern).
**Rows:** **20 data rows = 4 age brackets × 5 locations** (0-9, 10-19, 20-59, 60+ each repeated with Region + 3 Provinces + Bacolod HUC) — age is a **row dimension** here, not a set of parallel columns as in every other file in this batch. No municipality-level breakdown.

### Age/Sex Disaggregation
4 age brackets (0-9, 10-19, 20-59, 60+) as rows; Male/Female/Total as columns for every raw metric.

### Geographic Levels Present
Region → 3 Provinces → City of Bacolod (HUC), repeated once per age bracket (5 locations × 4 age groups = 20 rows). No municipality/barangay rows.

### Column Inventory — Sheet `Qtr1` (canonical)
| Col | Label | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0-1 | META | psgc, location | — | — |
| 2 | Agegroup | — (row filter, not a stored indicator) | META | — |
| 3 | Projected Population (a) | `NCD_EYE_POP` | RAW | — |
| 4-6 | Screened Male(b)/Female(c)/Total(d=b+c) | `NCD_EYE_SCREENED_*` | RAW/COMPUTED | col4+col5 |
| 7 | Screened [%] (e=d/a) | `NCD_EYE_SCREENED_PCT` | COMPUTED | col6/col3 |
| 8-10 | Vision-change M/F/Total (f,g,h=f+g) | `NCD_EYE_VISION_*` | RAW/COMPUTED | col8+col9 |
| 11-13 | Appearance-change M/F/Total (i,j,k=i+j) | `NCD_EYE_APPEARANCE_*` | RAW/COMPUTED | col11+col12 |
| 14-16 | Eye/Orbital Injury M/F/Total (l,m,n=l+m) | `NCD_EYE_INJURY_*` | RAW/COMPUTED | col14+col15 |
| 17-19 | Routine Exam finding M/F/Total (o,p,q=o+p) | `NCD_EYE_ROUTINE_*` | RAW/COMPUTED | col17+col18 |
| 20-22 | At-least-one ailment M/F/Total (r,s,t=r+s) | `NCD_EYE_ATLEASTONE_*` | RAW/COMPUTED | col20+col21 |
| 23 | At-least-one [%] (u=t/d) | `NCD_EYE_ATLEASTONE_PCT` | COMPUTED | col22/col6 |
| 24-26 | Referred M/F/Total (v,w,x=v+w) | `NCD_EYE_REFERRED_*` | RAW/COMPUTED | col24+col25 |
| 27 | Referred "[Total]" — actually a % (y=x/t) | `NCD_EYE_REFERRED_PCT` | COMPUTED | col26/col22 | label says "(Total)" but the formula and the parenthetical "(y)=x/t" both confirm it's a percentage — cosmetic label bug only |

### DQC Rules Visible in the Sheet
- **>100% threshold** on cols 7, 23, 27 (Screened%, At-least-one%, Referred%) — anchored `H2:H21`, `X2:X21`, `AB2:AB21`, i.e. **correctly matching the real 20-row data range (rows 2-21) — these 3 rules genuinely work.**
- **5 logical-consistency rules**: each single-condition Total (Vision, Appearance, Injury, Routine — cols 10/13/16/19) must be `≤` the overall Screened Total (col6); the At-least-one Total (col22) must be `≥` each of those 4 category totals and `≤` the Screened Total. This is a well-designed, real epidemiological rule set (a person can't be "identified via vision-changes" more often than they were screened; "at least one" must dominate each individual category but can't exceed the screened base). **However, every one of these 5 rules is anchored to rows `22:1000`, one row past the last real data row (21)** — see Flag X‑1. They are completely inert on real data, the one file in this batch where the *correct* rules and the *broken* rules coexist side-by-side, making the contrast unambiguous.

### Flags / Open Questions — File 2 (Eye Health)
- **Flag EY‑1:** The 5 logical-consistency DQC rules are dead due to the off-by-one row anchor (Flag X‑1) — this is the cleanest evidence in the whole batch that these rules were authored for the sheet's data range and then the anchor was pasted one row too low, since the *other 3* rules in the very same sheet (>100% checks) are correctly anchored.
- **Flag EY‑2:** Age is encoded as a **row value** (column 2, "Agegroup"), not as parallel age-bracket columns like every other file in this batch (Cancer, RA) or like the Prenatal/Leprosy precedents. A parser config for this file needs `data_start_row`/expected-row-count logic keyed to 20 rows (4×5), and cannot reuse the "5 rows = province rollup" assumption from Files 1 and 5 even though the location list is identical.
- **Flag EY‑3 (stale changelog):** The one `changelog` entry (v1.1, 2025‑01‑20) says the Screened % formula was fixed from `IFERROR(H/$D,0)` to `IFERROR(H/$E,0)`. The **current** formula is `IFERROR(G2/$D2,0)` (col7 = col6/col3) — neither the "old" nor the "new" value the changelog documents matches any column referenced in the current formula. This strongly suggests columns were inserted/removed again after this changelog entry was written, and the log was never updated to match — the same "stale changelog reference after undocumented column drift" pattern flagged for WASH's "Column O" and repeated in 3 of the 5 files in this batch (see Flag X‑2).
- No HIV/Syphilis-type sensitive indicators in this file.

---

## File 3: `ncd_meds_nir.xlsx`
**Tracks:** Hypertension (HTN) and Type II Diabetes (DM) risk-assessment, identification, and medication-completion tracking (Philippine PBF/OOP funding channels), for two population groups — "Adults" (20-59) and "Senior Citizens"/SC (60+) — reported monthly.

### Sheet Structure
| Sheet | Type | Rows | Columns | Notes |
|---|---|---|---|---|
| `readme` | Instructions | — | — | Not imported. Explains the RA/Monthly split (see below) |
| `RA` | Raw source data | 67 data rows (offset: header row 2, data rows 3-69) | 220 (A:HL) | 12 months × 2 groups (Adults/SC) × 3 metrics (risk-assessed, hypertensive, T2D) × Male/Female/Total — the *source of truth* for population + case-identification counts |
| `Jan`…`Nov` | Monthly | 67 (rows 2-68) | 80 (A:CB) | Medication-tracking data entry + pulled-through RA references |
| `Mar(Q1)`, `Jun(Q2)`, `Sep(Q3)` | Monthly (named for the quarter-end month) | 67 | 80 | Same shape as other months, but see Flag MD‑2 |
| `Dec(Q4)` | Monthly/Annual | **174** (anomalous) | 80 | **Contains 106 rows of leftover, broken, wrong-region data** — see Flag MD‑1 |
| `Population` | Reference | — | — | Empty stub, same as Files 1/2 |
| `changelog` | Admin | — | 7 | 1 entry, stale column reference |

**Frequency:** Monthly only — **there is no `Qtr`/`Annual` tab in this workbook at all**, unlike every other file in this batch. Per the `readme` tab: *"The quarterly/annual data can be found on the March(Q1), Jun(Q2), Sep(Q3) and Dec(Q4) Sheets"* — i.e., quarter/annual figures are not separate tabs but are baked into specific monthly tabs via cumulative formulas (see Flag MD‑2).
**Rows (normal months):** 68 total incl. header — Region + 3 Provinces + 63 municipalities + Bacolod HUC (same 68-row municipality-level pattern used by WASH/Immunization, i.e. full municipal granularity, unlike Files 1/2/5 in this batch).

### Age/Sex Disaggregation
No age brackets; two parallel population groups instead — **Adults (20-59)** and **Senior Citizens (60+)**, each broken out by Male/Female/Total for every metric.

### Geographic Levels Present
Region → 3 Provinces → 63 Cities/Municipalities → City of Bacolod (HUC), full municipal-level granularity (confirmed via province-subtotal formulas, e.g. `=SUM(D4:D34)` for Negros Occidental's 31 municipalities).

### The RA↔Monthly cross-reference design
Per the `readme` tab: *"RA Sheet: This is where Risk Assessment, Identified Hypertensives and Identified with Type II Diabetes shall be encoded... Monthly Sheet: This is where Medication data shall be encoded."* Concretely: the `RA` sheet holds 12 months of raw Population/Risk-Assessed/Identified-Hypertensive/Identified-Diabetic counts (per municipality, per sex, per group), and the `Jan`-`Dec` monthly sheets pull those same figures through via literal cell references (e.g. Jan `D4 = '=RA!D5'`), while typing the medication-completion counts (PBF/OOP/Both breakdown) directly into the monthly sheet as raw values.

### Column Inventory — Sheet `Jan` (canonical, 80 columns; grouped — full parallel structure repeats for Adults idx 2-40 and Seniors/SC idx 41-79)
| Col(s) | Group | Proposed `indicator_code` (pattern) | Type |
|---|---|---|---|
| 0-1 | META | psgc, location | — |
| 2 | Projected Population 20-59 (a) | `NCD_MEDS_ADULT_POP` | RAW (pulled cross-sheet at municipality rows, summed at province/region) |
| 3-6 | Risk assessed M(b)/F(c)/Total(d=b+c)/%(e=d/a) | `NCD_MEDS_ADULT_RISKASSESSED[_TOTAL/_PCT]` | RAW (cross-ref `RA!`)/COMPUTED |
| 7-10 | Identified Hypertensive M/F/Total(h=f+g)/%(i=h/d) | `NCD_MEDS_ADULT_HTN_IDENT[_PCT]` | RAW (cross-ref)/COMPUTED |
| 11-19 | Antihypertensive meds complete: [PBF](j,k,l=j+k), [OOP](m,n,o=m+n), [Both](p,q,r=p+q) | `NCD_MEDS_ADULT_HTN_{PBF,OOP,BOTH}` | RAW/COMPUTED |
| 20-23 | Antihypertensive [All] M(s=j+m+p)/F(t)/Total(u=s+t)/%(v=u/h) | `NCD_MEDS_ADULT_HTN_ALL[_PCT]` | COMPUTED |
| 24-27 | Identified T2D M/F/Total(y=w+x)/%(z=y/a) | `NCD_MEDS_ADULT_DM_IDENT[_PCT]` | RAW (cross-ref)/COMPUTED |
| 28-36 | Antidiabetic meds complete: [PBF]/[OOP]/[Both] | `NCD_MEDS_ADULT_DM_{PBF,OOP,BOTH}` | RAW/COMPUTED |
| 37-40 | Antidiabetic [All] M/F/Total(al=aj+ak)/%(am=al/y) | `NCD_MEDS_ADULT_DM_ALL[_PCT]` | COMPUTED |
| 41-79 | **Exact mirror of cols 2-40, prefixed "SC" instead of "Adults"** | `NCD_MEDS_SC_*` | same pattern |

Every percentage formula in this sheet was spot-checked against its label and found to correctly match (e.g. idx23 `(v)=u/h` → formula `W2/J2` = col22/col9 ✓; idx45 SC `(ar)=ar/an` self-referential label typo, but actual formula `AS2/AP2` = col44/col41 = aq/an, i.e. mathematically correct despite the cosmetic label bug).

### DQC Rules Visible in the Sheet
- **>100% threshold**, correctly anchored to the real 68-row data range (`G2:G68`, `K2:K68`, `X2:X68`, `AB2:AB68`, `AO2:AO68`, `AT2:AT68`, `AX2:AX68`, `BK2:BK68`, `BO2:BO68`, `CB2:CB68`) on all 10 percentage columns (5 Adult, 5 SC groups) — **this file's DQC is correctly anchored**, unlike Files 1/2/5.
- **A duplicate, effectively-dead second rule** on the exact same 10 ranges with threshold `>100` (not `>1`) using the identical red-fill format. Since percentages are stored as fractions (0-1), a value would need to be >10,000% to trip this second rule — it is very unlikely to ever fire and looks like a leftover/copy-paste duplicate from a version where percentages might have been stored ×100, left in place after the correct `>1` rule was added (or vice-versa).
- Cosmetic-only rules: a `containsText` PSGC "0" highlight and several `cellIs equal "*"` header-marker rules (likely for footnote/asterisk annotations, not real DQC).

### Flags / Open Questions — File 3 (Medicines)

**Flag MD‑1 (CRITICAL — leftover wrong-region data block in `Dec(Q4)`).** This sheet's dimensions are `A1:CB174`, versus 68 for every other month. Rows 2-107 contain municipalities from **Iloilo, Guimaras, and Aklan** (Region VI/Western Visayas — e.g. "Altavas", "Balete", "Banga", "Barotac Viejo", "City of Iloilo (HUC)"), which have **no relationship to NIR (Negros Island Region)** at all. Every formula cell in this leftover block evaluates to the literal string `#ERROR!` (verified: the underlying formulas are dangling references like `=RA!#REF! + RA!#REF! + ... ` — 12 broken terms per cell, one per month). **The real NIR data (NIR, Negros Occidental, Negros Oriental, Siquijor, Bacolod HUC, and all 63 municipalities) is present and structurally normal, but starts at row 108 instead of row 2** — i.e. every value is shifted down by exactly 106 rows relative to every other month. This is unambiguously a copy-paste artifact — someone appears to have pasted a chunk of a Region VI copy of this same national template on top of the NIR December sheet without deleting it, and the RA-sheet cell references inside that pasted block broke because NIR's own `RA` tab doesn't have matching columns for those provinces. **A parser config using a fixed `data_start_row=2` (as used for Jan-Nov) would silently ingest 106 rows of garbage `#ERROR!` values as if they were NIR municipalities, and would completely miss the real December data.** This must be fixed at the source file — delete rows 2-107 from `Dec(Q4)` — before this template can be config-driven at all; no per-sheet override in the current config schema would make this file's December safe to auto-ingest otherwise.

**Flag MD‑2 (CRITICAL — "monthly" sheets are year-to-date cumulative for RA-linked columns, verified by hand-tracing formulas).** Traced the same cell (Male risk-assessed count, "City of Bago" municipality) across all 12 months:
| Sheet | Formula | Value |
|---|---|---|
| Jan | `=RA!D5` | 4,972 |
| Feb | `=RA!D5 + RA!M5` | 5,465 (= 4,972 + 493) |
| Mar(Q1) | *(hardcoded literal, no formula)* | 5,790 (= 4,972 + 493 + 325, confirmed exact) |
| Apr | `=RA!D5+RA!M5+RA!V5+RA!AE5` | 6,329 |
| May | `=RA!D5+...+RA!AN5` | 8,643 |
| Jun(Q2)…Sep(Q3) | one more `+RA!<month>5` term each | 8,643 (flat — test data for Jun-Sep simply wasn't filled in beyond May, not a formula error) |

Each month's formula is the running sum of **that month plus every prior month** of the `RA` sheet — this is a genuine **year-to-date cumulative total**, not an independent monthly flow figure. This directly conflicts with `adding_templates.md`'s stated system convention that "quarterly/annual views are computed from stored monthly data: counts are summed... across months." If the system sums Jan+Feb+...+Dec for this file's risk-assessed/hypertension-identified/diabetes-identified columns, the result will be wildly inflated (each month's YTD figure re-adds all prior months). **The correct rollup rule for these specific columns is "take the value from the last month of the period" (e.g. annual = December's value), not "sum the 12 months."** By contrast, the medication-completion columns (PBF/OOP/Both, raw-entered) do **not** follow this pattern — the same municipality's antihypertensive-PBF-Male count went 79 (Jan) → 113 (Feb) → 291 (Mar) → **114 (Apr, a decrease)**, which rules out a cumulative model and confirms these columns are genuine independent monthly entries. **This is a mixed-semantics file: some columns cumulative (YTD), some columns flow (monthly reset), within the same row** — the parser config must flag the cumulative columns explicitly (likely via a `rollup: "last"` vs default `rollup: "sum"` per-column setting that doesn't currently exist in the schema) or quarterly/annual totals for risk-assessment/case-identification indicators will be systematically, badly wrong.

**Flag MD‑3.** Also note: `Mar(Q1)`'s risk-assessed figures are **hardcoded literal values** (not live formulas) even though they mathematically equal the correct Jan+Feb+Mar cumulative sum today — if the underlying `RA` sheet is later corrected/updated, `Mar(Q1)`'s value will **not** recalculate and will silently go stale, unlike Jan/Feb/Apr/May which are live formulas.

**Flag MD‑4 (stale changelog).** The one `changelog` entry (v1.1, 2026‑01‑12) says "Column AC and Column BP (Jan-Dec)... With Eligible Population as Denominator (wrong formula) → Updated to have Risk Assessed as Denominator." Current columns AC (idx28) and BP (idx67) are **raw count** columns ("Adults/SCs with complete antidiabetic medications [PBF] (Male)"), not percentage columns with any denominator at all — this changelog entry cannot be reconciled with the current 80-column layout, another instance of the cross-file "stale changelog after undocumented column drift" pattern (Flag X‑2).

**Flag MD‑5.** The dual `>1` / `>100` duplicate DQC rule (described above) is likely dead/redundant noise, not a functioning second-tier threshold — worth a one-line note in the config rather than reproducing both.

No HIV/Syphilis-type sensitive indicators in this file (hypertension/diabetes are not in CLAUDE.md's sensitive list).

---

## File 4: `ncd_mh_nir.xlsx` (Mental Health)
**Tracks:** mhGAP (mental health Global Action Programme) tool-based assessment counts only — by 4 age brackets and sex. This is the thinnest file in the batch: **no diagnosis, referral, treatment, or outcome columns of any kind exist.**

### Sheet Structure
| Sheet | Type | Rows (data) | Columns | Notes |
|---|---|---|---|---|
| `Qtr1`–`Qtr4`, `Annual` | Quarterly + Annual | 5 | 15 (real data; dims report 21/U but cols 15-20 are entirely blank) | Identical structure across all 5 sheets |
| `changelog` | Admin | — | 7 | 1 entry, stale column reference |

**No `Population` sheet exists at all** in this file — the only file in the batch missing even the empty placeholder tab, consistent with the fact that this file also has **no percentage/rate columns and no population denominator column** anywhere.

**Frequency:** Quarterly + Annual (`Annual` = SUM of 4 quarters, standard rollup, verified).
**Rows:** 5 — Region + 3 Provinces + Bacolod HUC, no municipality breakdown.

### Age/Sex Disaggregation
4 age brackets (0-9, 10-19, 20-59, 60+), Male/Female/Total for each — no additional dimension.

### Geographic Levels Present
Region → 3 Provinces → City of Bacolod (HUC). No municipality/barangay rows.

### Column Inventory — Sheet `Qtr1` (canonical)
| Col | Label | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0-1 | META | psgc, location | — | — |
| 2-4 | Assessed 0-9 M(a)/F(b)/Total(c=a+b) | `NCD_MH_MHGAP_0_9[_TOTAL]` | RAW/COMPUTED |
| 5-7 | Assessed 10-19 M(d)/F(e)/Total(f=d+e) | `NCD_MH_MHGAP_10_19[_TOTAL]` | RAW/COMPUTED |
| 8-10 | Assessed 20-59 M(g)/F(h)/Total(i=g+h) | `NCD_MH_MHGAP_20_59[_TOTAL]` | RAW/COMPUTED |
| 11-13 | Assessed 60+ M(j)/F(k)/Total(l=j+k) | `NCD_MH_MHGAP_60PLUS[_TOTAL]` | RAW/COMPUTED |
| 14 | Assessed [Total, all ages] (m=c+f+i+l) | `NCD_MH_MHGAP_ALLAGES_TOTAL` | COMPUTED | col4+col7+col10+col13 |

No percentage/rate column exists in this file at all (there is no population or "identified with a mental health condition" column to divide by — purely a raw screening-count file).

### DQC Rules Visible in the Sheet
**None beyond the generic blank-completeness check** (`C2:O6`). No threshold or logical-consistency rules of any kind — this file has the least DQC coverage of the batch, on par with the Cancer file's "b" (breast) group.

### Flags / Open Questions — File 4 (Mental Health)
- **Flag MH‑1:** No `Population` reference sheet exists at all in this workbook (unlike Files 1/2/3/5, which all have the empty stub) — likely because there's genuinely no denominator/percentage indicator in this file to need one, but worth a one-line confirmation that this isn't a sign of an unfinished template (e.g. a planned "% of population assessed" column that was never built).
- **Flag MH‑2 (stale changelog):** `changelog` (v1.1, 2026‑01‑08): "Column P... sum(D:N) → sum(F,I,L,O)... wrong formula." The **current** Total column is at index 14 (letter **O**, not P), with the correct formula `=SUM(E3,H3,K3,N3)` (i.e., summing the age-Total sub-columns E/H/K/N = idx4/7/10/13). Both the "old" letters (D:N) and "new" letters (F,I,L,O) in the changelog are shifted by exactly +1 from the current O/E/H/K/N layout — internally self-consistent evidence that **one column was later removed** from this sheet after the changelog entry was written, again matching the cross-file stale-changelog pattern (Flag X‑2). The current formula itself is correct, so no live bug remains, but the changelog is unreliable for future maintainers.
- **Flag MH‑3 (RBAC/sensitivity — needs an explicit decision, not an assumption):** mhGAP assessment counts are mental-health-related person-level data. `memory-bank/CLAUDE.md`'s "Sensitive Indicators" section currently lists only HIV and Syphilis reactive cases. Given how small some of these province/HUC row counts already are in the sample data (e.g. Siquijor shows literal `0` across every age bracket for the full year, meaning even a single new case would be fully identifiable at that granularity), recommend explicitly asking the project owner whether `NCD_MH_*` indicators should also get `is_sensitive = TRUE` treatment (aggregated-totals-only for unauthorized roles) before this template goes live — this mirrors the exact same open question already raised, unresolved, for Leprosy.
- No HIV/Syphilis reactive-case indicators literally present (the CLAUDE.md-defined sensitive categories), but see Flag MH‑3 above.

---

## File 5: `ncd_ra_nir.xlsx` (NCD Risk Factor / "Risk Assessment" screening)
**Tracks:** Behavioral/lifestyle NCD risk factors identified during the same risk-assessment encounter referenced in `ncd_meds_nir.xlsx` — insufficient physical activity, unhealthy diet, overweight, obesity, binge drinking, and current tobacco/vaping use (with Brief Tobacco Intervention, BTI, follow-up) — for Adults (20-59) and Senior Citizens (60+) separately. **Not to be confused** with the internal `RA` tab inside `ncd_meds_nir.xlsx` (which holds the source hypertension/diabetes identification counts) — both files describe outcomes from the *same* underlying risk-assessment screening event, just different outcome dimensions (metabolic vs. behavioral).

### Sheet Structure
| Sheet | Type | Rows (data) | Columns | Notes |
|---|---|---|---|---|
| `Qtr1a`–`Qtr4a`, `Annuala` | Quarterly + Annual | 5 | 43 (A:AQ) | Adults group |
| `Qtr1b`–`Qtr4b`, `Annualb` | Quarterly + Annual | 5 | 43 (A:AQ) | Senior Citizens group |
| `Population` | Reference | — | — | Empty stub, same as Files 1/2/3 |
| `changelog` | Admin | — | 7 | 2 entries (see below) |

**Frequency:** Quarterly + Annual (rollup formula pattern verified, same as Files 1/2/4).
**Rows:** 5 — Region + 3 Provinces + Bacolod HUC, no municipality breakdown.

### Age/Sex Disaggregation
No age brackets; "a" (Adults 20-59) vs "b" (Senior Citizens 60+) groups, each with Male/Female/Total for every metric — mirrors the Adult/SC split used in `ncd_meds_nir.xlsx`.

### Geographic Levels Present
Region → 3 Provinces → City of Bacolod (HUC). No municipality/barangay rows.

### Column Inventory — Sheet `Qtr1a` (Adults, canonical; "b"/SC sheets are an exact mirror)
| Col | Label | Proposed `indicator_code` | Type | Formula |
|---|---|---|---|---|
| 0-1 | META | psgc, location | — | — |
| 2 | Adults who were risk assessed (Total) — header explicitly states *"Must be equal to Risk Assessed in the ncd_meds template"* (a) | `NCD_RF_ADULT_RISKASSESSED` | RAW (denominator) | — |
| 3-6 | Insufficient physical activity M(b)/F(c)/Total(d=b+c)/%(e=d/a) | `NCD_RF_PHYSINACTIVE_*` | RAW/COMPUTED |
| 7-10 | Unhealthy diet M/F/Total(h=f+g)/%(i=h/a) | `NCD_RF_UNHEALTHYDIET_*` | RAW/COMPUTED |
| 11-14 | Overweight M/F/Total(l=j+k)/%(m=l/a) | `NCD_RF_OVERWEIGHT_*` | RAW/COMPUTED |
| 15-18 | Obese M/F/Total(p=n+o)/%(q=p/a) | `NCD_RF_OBESE_*` | RAW/COMPUTED |
| 19-22 | Binge drinker M/F/Total(t=r+s)/%(u=t/a) | `NCD_RF_BINGEDRINK_*` | RAW/COMPUTED |
| 23-26 | Current smoker [Tobacco Product] M/F/Total(x=v+w)/%(y=x/a) | `NCD_RF_SMOKER_TOBACCO_*` | RAW/COMPUTED |
| 27-30 | Current smoker [Vaporized Nicotine] M/F/Total(ab=z+aa)/%(ac=ab/a) | `NCD_RF_SMOKER_VAPE_*` | RAW/COMPUTED |
| 31-34 | Current smoker [Both] M/F/Total(af=ad+ae)/%(ag=af/a) | `NCD_RF_SMOKER_BOTH_*` | RAW/COMPUTED |
| 35-38 | Current smoker [All] M(ah=v+z+ad)/F(ai)/Total(aj=ah+ai)/%(ak=aj/a) | `NCD_RF_SMOKER_ALL_*` | COMPUTED (union of the 3 smoker-type columns above, not independently raw) |
| 39-42 | Smokers provided BTI M/F/Total(an=al+am)/%(ao=an/aj) | `NCD_RF_SMOKER_BTI_*` | RAW/COMPUTED — **note the denominator here is col37 (All-Smokers Total), not col2 (risk-assessed)** — the only percentage column in this sheet with a chained (non-population) denominator, which is clinically correct (BTI is offered to smokers, not to the whole risk-assessed cohort). |

### DQC Rules Visible in the Sheet
Only **one** conditional-formatting rule exists in the entire sheet beyond the blank-completeness check: a `>100%` threshold on col6 (`G7:G1000`, Insufficient-Physical-Activity %). **None of the other 9 percentage columns** (unhealthy diet, overweight, obese, binge-drinker, 3 smoker-type %, all-smoker %, BTI %) have any DQC threshold at all. And the one rule that does exist is anchored `row7:1000`, one row past the real data's last row (6) — **dead on arrival**, same off-by-one bug as Files 1 and 2 (Flag X‑1). Net effect: **this file has zero functioning DQC of any kind** beyond the generic blank check.

### Flags / Open Questions — File 5 (Risk Factors/RA)

**Flag RF‑1 (CONFIRMED cross-file denominator data-entry error).** The header explicitly documents a cross-file consistency requirement: "Adults who were risk assessed (Total)... Must be equal to Risk Assessed in the ncd_meds template." Cross-checked directly:
| Location | `ncd_ra_nir.xlsx` "a" (col2) | `ncd_meds_nir.xlsx` true annual total (`Dec(Q4)` col5) | Ratio |
|---|---|---|---|
| NIR | 1,343,194 | 281,194 | 4.8× |
| Negros Occidental | **1,308,434** | 225,360 | 5.8× |
| Negros Oriental | 27,110 | 36,846 | 0.74× |
| Siquijor | 3,084 | 5,722 | 0.54× |
| City of Bacolod (HUC) | 4,566 | 13,266 | 0.34× |

Negros Occidental's value (**1,308,434**) is an **exact, digit-for-digit match** to that province's "Projected Population 20-59 years old" figure used consistently across Files 2/3/5 elsewhere in this batch — this is conclusive evidence that the Negros Occidental risk-assessed denominator cell was populated with the **population count** instead of the actual risk-assessed count, almost certainly a copy/paste error. Since every percentage column in the Adults ("a") group divides by this same column (col2), **this single cell error silently deflates every Negros Occidental percentage indicator in this file by ~5.8×** relative to what the true risk-assessed base would produce. The other 3 non-region rows don't match population figures but also don't match `ncd_meds_nir.xlsx`'s totals (ratios 0.34-0.74×) — this may simply be unsynced test/dummy data rather than a systematic error, but the file's own documented cross-file rule is not currently satisfied for **any** of the 5 rows in the sample data. Recommend the parser/DQC layer implement this as an **automated cross-template validation rule** (compare `NCD_RF_ADULT_RISKASSESSED` against `NCD_MEDS_ADULT_RISKASSESSED_TOTAL` for the same period/location) rather than relying on the header's manual-review comment, since manual review has evidently already missed at least one clear error in the shipped sample.
- **Flag RF‑2:** Same off-by-one DQC dead-rule bug as Files 1 and 2 (Flag X‑1), compounded by the fact that only 1 of 10 percentage columns had a rule to begin with — net DQC coverage in this file is effectively zero.
- **Flag RF‑3 (changelog, informational only — already resolved):** `changelog` records (1) a Jan 2026 fix relabeling stray "SC/SCs" text to "Adult/Adults" in the "a" sheets (verified: current headers correctly say "Adults..."), and (2) the addition of the "Must be equal to Risk Assessed in the ncd_meds template" validation reminder itself. Unlike the stale changelogs in Files 2/3/4, these two entries are internally consistent with the current file state — no drift here.
- No HIV/Syphilis-type sensitive indicators in this file.

---

## Cross-Cutting Findings (apply across multiple files)

**Flag X‑1 (systemic, high-confidence) — Off-by-one row anchor silently disables DQC rules in 3 of 5 files.** In `ncd_cancer_nir.xlsx` ("a" sheet), `ncd_eyehealth_nir.xlsx`, and `ncd_ra_nir.xlsx`, the meaningful (non-blank-check) conditional-formatting DQC rules are anchored starting exactly **one Excel row past the last real data row** (e.g. real data ends row 6, rules start row 7; real data ends row 21, rules start row 22), while the generic blank-completeness check in every one of those same sheets is correctly anchored to the real data range. Since conditional formatting with relative formulas (`K7>G7`, etc.) only evaluates rows actually inside its `sqref` range, **every one of these rules is permanently inert on real data** — they would never highlight a bad value even if one existed, in Excel or in any system that tried to reproduce this logic. This is not a one-off mistake — it recurs in 3 independently-built files with different column layouts, strongly suggesting a systematic authoring habit (e.g., building the rule against a template row below the intended range, then copy-pasting the formatting down without adjusting the anchor). `ncd_meds_nir.xlsx`'s DQC, by contrast, is correctly anchored (rows 2-68 matching its real data) — proving the anchor bug isn't inherent to the file format, just to how these particular rules were authored. **Recommendation:** do not port any of these conditional-formatting ranges into `dqc_rules` config blocks verbatim; instead, re-derive the *intended* rule (which is usually clear from the formula logic itself, e.g. "sub-category total ≤ overall total") and anchor it to the config's actual `data_start_row`/`data_end_row` for each file.

**Flag X‑2 (systemic) — Changelogs are stale relative to the current column layout in most of these files.** Files 2 (`ncd_eyehealth_nir.xlsx`), 3 (`ncd_meds_nir.xlsx`), and 4 (`ncd_mh_nir.xlsx`) each have exactly one `changelog` entry whose documented "old"/"new" formula or column-letter reference does not match any column in the current file (in each case, off by a small, internally-consistent shift, suggesting a later, undocumented column insertion/deletion). File 1's changelog similarly references a deleted "Risk Assessed column" with no position given. Only File 5's changelog entries are currently reconcilable with its live layout. **This means `changelog` tabs in this program should be treated as directionally useful history, not as an authoritative map of current column positions** — always verify against the live formula, never against a changelog's stated column letter.

**Row-granularity split:** Files 1, 2, 4, and 5 all report at **province/HUC rollup only** (5 rows: Region + 3 Provinces + Bacolod HUC, no municipalities), while File 3 (`ncd_meds_nir.xlsx`) reports at **full municipal granularity** (68 rows). This mirrors the exact split documented for Prenatal (Files 1/8 municipality-level vs. Files 2-7 province-only) — worth confirming with DOH region whether this is a deliberate reporting-burden decision specific to which NCD sub-programs get municipal-level tracking, or an inconsistency that should eventually be standardized.

---

## Cross-File Comparison
| Aspect | `ncd_cancer_nir` | `ncd_eyehealth_nir` | `ncd_meds_nir` | `ncd_mh_nir` | `ncd_ra_nir` |
|---|---|---|---|---|---|
| Frequency | Qtr + Annual | Qtr + Annual | **Monthly only** (no Qtr/Annual tabs; baked into Mar/Jun/Sep/Dec sheets) | Qtr + Annual | Qtr + Annual |
| Rows | 5 (province/HUC) | 20 (4 age-brackets × 5 locations) | **68** (full municipal) / Dec(Q4) has 174 (106 broken leftover rows) | 5 (province/HUC) | 5 (province/HUC) |
| Columns (canonical sheet) | 22 (a) / 30 (b) | 28 | 80 | 15 | 43 (a) / 43 (b) |
| Sub-groups within file | Cervical (a) / Breast (b) | — | Adults / SC | — | Adults (a) / SC (b) |
| Age disaggregation | None | 4 brackets (as rows) | None (Adult vs SC groups instead) | 4 brackets (as columns) | None (Adult vs SC groups instead) |
| Sex disaggregation | Yes | Yes | Yes | Yes | Yes |
| Denominator type | Target Population (per-metric) | Projected Population (per age bracket) | Population (RA-linked) / chained (identified count) | None (no % columns) | **Risk-Assessed count** (cross-file linked to meds, not population) |
| DQC: rules present | 9 ("a") / 0 ("b") | 8 (3 working, 5 dead) | 20 (10 real + 10 dead-duplicate) | 0 | 1 (dead) |
| DQC: functionally working | 0 | 3 | 10 | 0 | 0 |
| `Population` sheet | Empty stub | Empty stub | Empty stub | **Absent entirely** | Empty stub |
| `changelog` staleness | Deleted column, no position given | Stale (H/D→H/E doesn't match current G/D) | Stale (AC/BP no longer % columns) | Stale (off by 1 column) | **Consistent**, no drift |
| Confirmed data bug | — | — | **Wrong-region `#ERROR!` block (Dec, 106 rows)**; YTD-cumulative vs monthly-flow mismatch | — | **Denominator = population, not risk-assessed count (Negros Occidental)** |
| Sensitive-indicator concern | No | No | No | **Yes — open question (mhGAP screening)** | No |

---

## Summary

This NCD batch is structurally the most heterogeneous group analyzed so far — five files spanning three different row-granularity patterns (province/HUC-only, age-bracket-as-rows, and full-municipal), one file with no Quarterly/Annual tabs at all, and a cross-file denominator relationship documented directly in a column header. It also contains the two most serious verified bugs of any template-analysis session to date: `ncd_meds_nir.xlsx`'s December sheet has 106 leftover rows of a different region's data with every cell evaluating to `#ERROR!`, pushing the real NIR data down by 106 rows (Flag MD‑1); and the same file's "monthly" sheets turn out to be year-to-date cumulative rather than flow data for their risk-assessment-linked columns, verified by hand-tracing the exact formula chain month-by-month (Flag MD‑2) — either bug alone would corrupt any parser config built on the usual assumptions. A third, independently significant finding is a recurring off-by-one row-anchoring defect that silently disables nearly every meaningful DQC rule in three of the five files (Cancer, Eye Health, Risk Factors), leaving only the Medicines file with fully functioning DQC coverage; combined with a fourth file (Mental Health) that has no DQC at all and a fifth (Cancer's breast-cancer half) with none either, **DQC coverage across this entire program is effectively broken or absent almost everywhere except the Medicines file**. A concrete cross-file denominator error was also confirmed (Negros Occidental's "risk assessed" total in `ncd_ra_nir.xlsx` is an exact copy of its population figure, deflating every percentage in that row by ~5.8×), demonstrating that the file's own documented "must equal the sibling template" validation note is not currently being honored and should be automated rather than left to manual review. Finally, `ncd_mh_nir.xlsx` (mhGAP mental-health screening) raises a sensitivity question not covered by CLAUDE.md's current HIV/Syphilis-only sensitive-indicator list, and should be explicitly discussed with the project owner before launch, mirroring the same unresolved question already on record for Leprosy. None of the five files contain HIV or Syphilis reactive-case data, so no indicator in this batch is currently required to be `is_sensitive = TRUE` under the letter of the existing rule — but Mental Health warrants a deliberate decision rather than a default no.
