# FHSIS Template Analysis — Addendum
## Program: Infectious Disease > Filariasis
**Analyst:** Claude (Search Agent) — read-only inspection, no code/config/DB changes made.
**Files analyzed:** 3, in `backend/data/INFECTIOUS_DISEASE/Filariasis/`
**Note:** No existing JSON config exists yet for any Filariasis file in `backend/app/services/configs/` — this is genuinely new template territory.

---

## File 1: `infec_cdr_filariasis_nir.xlsx`
**Tracks:** Case Detection Rate (CDR) for Lymphatic Filariasis — individuals examined vs. found positive, via two test modalities (NBE = Nocturnal Blood Exam, RDT = Rapid Diagnostic Test) and their combined total.

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Annual | Data | Only sheet with data |
| change_log | Admin | Not imported |

**Frequency: Annual only.** No monthly/quarterly tabs, no Population sheet.
**Rows:** sheet dims show 863 rows but only **6 rows have data**: NIRA (region rollup) + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod (HUC). **No municipality/barangay-level rows** — a structural break from the 129-row (region→province→muni→barangay) pattern seen in every Immunization/Nutrition/Sick file.
**Columns:** 26 (index 0–25)

### Age/Sex Disaggregation
Male/Female only, no age-group breakdown. All ages combined ("individuals").

### Column Inventory
| Col | Label (as written) | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Region | META | constant "NIRA" for every row |
| 2 | Region, Province/City, Municipality | META | location name |
| 3 | NBE examined Male (a) | RAW | — |
| 4 | NBE examined Female (b) | RAW | — |
| 5 | A. Total (a+b) | COMPUTED | col[3]+col[4] |
| 6 | RDT examined Male (c) | RAW | — |
| 7 | RDT examined Female (d) | RAW | — |
| 8 | B. Total (c+d) | COMPUTED | col[6]+col[7] |
| 9 | NBE&RDT examined Male (e) | COMPUTED | col[3]+col[6] |
| 10 | NBE&RDT examined Female (f) | COMPUTED | col[4]+col[7] |
| 11 | C. Total (e+f) | COMPUTED | col[9]+col[10] |
| 12 | *(blank spacer column)* | — | not stored |
| 13 | NBE positive Male (g) | RAW | — |
| 14 | NBE positive Female (h) | RAW | — |
| 15 | D. Total (g+h) | COMPUTED | col[13]+col[14] |
| 16 | RDT positive Male (i) | RAW | — |
| 17 | RDT positive Female (j) | RAW | — |
| 18 | E. Total (i+j) | COMPUTED | col[16]+col[17] |
| 19 | NBE&RDT positive Male (k) | COMPUTED | col[13]+col[16] |
| 20 | NBE&RDT positive Female (l) | COMPUTED | col[14]+col[17] |
| 21 | F. Total (k+l) | COMPUTED | col[19]+col[20] |
| 22 | *(blank spacer column)* | — | not stored |
| 23 | Case Detection Rate (NBE) — labeled "(A/E)" | COMPUTED | actual formula = col[15]/col[5] (D.Total/A.Total, i.e. positive-NBE ÷ examined-NBE) |
| 24 | Case Detection Rate (RDT) — labeled "(B/R)" | COMPUTED | actual formula = col[18]/col[8] (E.Total/B.Total) |
| 25 | Case Detection Rate (BOTH) — labeled "(C/U)" | COMPUTED | actual formula = col[21]/col[11] (F.Total/C.Total) |

Region row (row 2, "NIRA") uses **vertical** SUM formulas rolling up the 4 province/HUC rows beneath it for the raw columns (e.g. col[3] region = `SUM(D3:D6)`), while province/HUC rows use **horizontal** per-row formulas for the computed columns. Same rollup pattern documented for Immunization files — not a new issue, just confirming it recurs here.

### DQC Rules
**None present in the template.** No "Over X%" flag columns exist (unlike every Child Care file reviewed previously). Only a blank-cell conditional-formatting highlight (`containsBlanks`) across the raw/computed ranges — that's a data-entry reminder, not a validation rule. A sensible DQC to add ourselves: flag if CDR > 100% (positive count can't exceed examined count).

### Raw Inputs to Store
1. NBE examined Male, 2. NBE examined Female, 3. RDT examined Male, 4. RDT examined Female, 5. NBE positive Male, 6. NBE positive Female, 7. RDT positive Male, 8. RDT positive Female
**Total raw inputs: 8 per location per period** (everything else — combined NBE+RDT groups, all totals, all 3 CDR percentages — is computed).

### Flags / Open Questions
- **FLAG F1-1 — Header/formula mismatch on CDR columns.** Headers read "(A/E)", "(B/R)", "(C/U)" but the actual live formulas compute positive÷examined per modality (D/A, E/B, F/C). The change_log (row 4) says a prior version had "numerator and denominator interchanged" and was fixed — so the **formula is believed correct**, but the **header notation was never updated** to match. Recommend building the config off the formula logic, not the header text (same principle already established for Immunization files).
- **FLAG F1-2 — No municipality/barangay rows.** Only region + 4 province/HUC-level rows exist, unlike the 129-row pattern in Child Care templates. Confirm with the encoder whether Filariasis CDR is genuinely only reported at province level (plausible — it's an endemic-surveillance program, likely coordinated by fewer reporting units) before assuming this is incomplete data.
- **FLAG F1-3 — change_log references "Sulu Province" transfer to Region 9**, but Sulu was never part of NIR data in this file (no such row exists here or in File 3). This note may be a copy-pasted/shared change-log entry that doesn't actually pertain to this specific file — worth confirming with the encoder (see also File 2, which oddly *does* contain non-NIR regions).
- **FLAG F1-4 — No change_log for the sub-national name-format inconsistency**: unlike other programs there's no Population sheet at all — confirm CDR truly has no population-based denominator (it uses "examined" as its own denominator, similar to the "Seen" pattern from Management of the Sick).

---

## File 2: `infec_filariasis_mda_nir.xlsx`
**Tracks:** Mass Drug Administration (MDA) coverage against Lymphatic Filariasis, for 3 age bands (2–4y, 5–14y, 15y+) plus a combined "2 years and above" total.

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Annual | Data | Only sheet in the workbook |

**No change_log tab at all** — the only file of the three (and one of very few across the whole project) with a single sheet total.
**Frequency: Annual only.**
**Rows:** dims show 1000 rows but only **4 rows have data**.
**Columns:** 23 (index 0–22)

### Biggest Flag — This Is Not NIR Data
The 4 populated rows are:
| PSGC | Region | Province |
|---|---|---|
| 1705200000 | Region 4B | Oriental Mindoro |
| 0907200000 | Region 9 | Zamboanga del Norte |
| 1108600000 | Region 11 | Davao Occidental |
| 1206500000 | Region 12 | Sultan Kudarat |

**None of these are in Negros Island Region.** These are known nationally-recognized filariasis-endemic provinces elsewhere in the Philippines. This is fundamentally different from every other FHSIS file analyzed so far (all of which report NIR's own region + 3 provinces + Bacolod HUC). Two plausible explanations: (a) NIR CHD administratively coordinates/monitors the *national* MDA elimination program across all endemic provinces (not just its own region), or (b) this is a misfiled/wrong dataset accidentally dropped into the NIR Filariasis folder. Needs confirmation before schema design — it directly affects `psgc_column`/`location_aliases` design (existing configs alias "NIR"/"Negros Island Region"/"BARMM" → PSGC `1800000000`; this file needs entirely different alias/region handling, or should be excluded from the "NIR-only" dashboard filtering logic).

### Column Inventory
| Col | Label (as written) | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | REGION | META | varies per row (Region 4B/9/11/12) |
| 2 | PHIC | META | province name |
| 3 | Projected Population 2-4 years old | RAW | — |
| 4 | Projected Population 5-14 years old | RAW | — |
| 5 | Projected Population 15 y.o. and above | RAW | — |
| 6 | Projected Population 2 y.o and above | RAW | — (independently entered; **no formula ties it to col[3]+col[4]+col[5]**) |
| 7 | 2-4 MDA Male (a) | RAW | — |
| 8 | 2-4 MDA Female (b) | RAW | — |
| 9 | A. Total (a+b) | COMPUTED | col[7]+col[8] |
| 10 | % 2-4 MDA | COMPUTED | col[9]/col[3] |
| 11 | 5-14 MDA Male (c) | RAW | — |
| 12 | 5-14 MDA Female (d) | RAW | — |
| 13 | B. Total (c+d) | COMPUTED | col[11]+col[12] |
| 14 | % 5-14 MDA | COMPUTED | col[13]/col[4] |
| 15 | 15+ MDA Male (e) — mislabeled RAW, actually COMPUTED | `=SUM(H,L)` = col[7]+col[11] (**2-4 Male + 5-14 Male — no 15+-specific cell referenced anywhere**) |
| 16 | 15+ MDA Female (f) — mislabeled RAW, actually COMPUTED | `=SUM(I,M)` = col[8]+col[12] (same bug) |
| 17 | C. Total (e+f) | COMPUTED | col[15]+col[16] |
| 18 | "% of individuals aged 5-14 ... MDA" mislabeled (should read 15+) | COMPUTED | col[17]/col[5] (C.Total ÷ Pop 15+) |
| 19 | "2 y.o and above MDA Male (e)" duplicate letter (e) | COMPUTED | `=SUM(L,P)` = col[11]+col[15] |
| 20 | "2 y.o and above MDA Female (f)" duplicate letter (f) | COMPUTED | `=SUM(M,Q)` = col[12]+col[16] |
| 21 | "C. Total (e+f)" duplicate label (same text as col 17, should read D. Total) | COMPUTED | col[19]+col[20] |
| 22 | % of individuals aged 2 years old who received MDA | COMPUTED | col[21]/col[6] |

### DQC Rules
None (only blank-highlight conditional formatting on H2:S5 and T2:W5, no threshold flags).

### Critical Structural Bug — No Real "15+" or "2+" Data Exists
Because col[15]/col[16] ("15+ Male/Female") are actually computed as **2-4 + 5-14** (never referencing any true 15+-specific raw cell), every downstream total that depends on them is wrong:
- Col 17 "C. Total" (nominally 15+ total) = (2-4+5-14 Male) + (2-4+5-14 Female) — this is NOT a 15+ total, it's a duplicate of the 2-4+5-14 combined total.
- Col 19/20 ("2 y.o and above") = 5-14 + [2-4+5-14] → **double-counts the 5-14 group and never includes any genuine 15+ figure.**
- There is **no column anywhere in this file where a user enters actual "15 years and above" MDA recipients.** The template appears to be missing that raw-entry column entirely (likely lost during a copy-paste edit), and every column referencing "15+" or "2+" downstream inherited the resulting formula chain.

**This means only 2-4y and 5-14y MDA coverage is usable raw data from this template as it stands.** The 15+/2+ figures cannot be trusted or stored as computed indicators until the source template is corrected by DOH — recommend NOT ingesting cols 15–22 until clarified, or ingesting them with an explicit `notes` flag that they are structurally broken.

### Raw Inputs to Store (usable subset)
1. Pop 2-4y, 2. Pop 5-14y, 3. Pop 15+ (raw entry exists but no matching MDA raw column — see below), 4. Pop 2+, 5. MDA 2-4 Male, 6. MDA 2-4 Female, 7. MDA 5-14 Male, 8. MDA 5-14 Female
**Total genuinely usable raw inputs: 8** (Pop 15+ and Pop 2+ are present as raw denominators but have no valid numerator column to pair with under current template logic).

### Flags / Open Questions
- **FLAG F2-1 (critical)** — Data covers 4 non-NIR provinces (Region 4B, 9, 11, 12) instead of NIR. Confirm with data owner whether this file belongs in the NIR dashboard at all, or requires special multi-region handling.
- **FLAG F2-2 (critical)** — No real "15 years old and above" or "2 years old and above" MDA raw-entry columns exist; the formulas that claim to represent them are copy-paste artifacts that double count the 5-14 group and never touch a genuine 15+ figure. Needs a corrected template from DOH before those indicators can be built.
- **FLAG F2-3** — Col[6] ("Pop 2 y.o. and above") is a separately/manually entered figure, not tied by formula to Pop(2-4)+Pop(5-14)+Pop(15+). Could silently diverge from the sum of its parts — worth a DQC consistency check (`Pop_2plus ≈ Pop_2_4 + Pop_5_14 + Pop_15plus`).
- **FLAG F2-4** — No `change_log` sheet at all in this workbook, unlike its two sibling files. Inconsistent with project convention.
- **FLAG F2-5** — Duplicate/reused group letters "(e)"/"(f)" and duplicate label text "C. Total" appearing twice (cols 17 and 21) — same class of labeling error documented in the Immunization files; config should key off column index/formula, never header label.

---

## File 3: `infec_lymph_eleph_hydro_nir.xlsx`
**Tracks:** Chronic filariasis morbidity — Lymphedema, Elephantiasis, and Hydrocele case counts, each broken out by 3 age bands (2–4y, 5–14y, 15y+) plus a combined "2 years and above" total.

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Annual | Data | Only sheet with data |
| change_log | Admin | Not imported |

**Frequency: Annual only.**
**Rows:** dims show 863 but only **6 rows have data** — same structure as File 1: NIRA (region rollup) + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod (HUC). Consistent with File 1, and confirms this "6-row, province/HUC-level-only" pattern is real for this program area, not an anomaly.
**Columns:** 33 (index 0–32)

### Age/Sex Disaggregation
Lymphedema and Elephantiasis: Male + Female × 3 age bands (2–4, 5–14, 15+) + a computed "2 y.o. and above" combined total.
Hydrocele: **Male only** (clinically a male-only condition), 3 age bands, no Female column at all — by design, not an omission.

### Column Inventory

**Lymphedema (cols 3–14)**
| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC 10 | META | — |
| 1 | Region | META | constant "NIRA" |
| 2 | Region, Province/City, Municipality | META | location name |
| 3 | Lymphedema 2-4 Male (a) | RAW | — |
| 4 | Lymphedema 2-4 Female (b) | RAW | — |
| 5 | A. Total (a+b) | COMPUTED | col[3]+col[4] |
| 6 | Lymphedema 5-14 Male (c) | RAW | — |
| 7 | Lymphedema 5-14 Female (d) | RAW | — |
| 8 | B. Total (c+d) | COMPUTED | col[6]+col[7] |
| 9 | Lymphedema 15+ Male (e) | RAW | — |
| 10 | Lymphedema 15+ Female (f) | RAW | — |
| 11 | C. Total (e+f) | COMPUTED | col[9]+col[10] |
| 12 | Lymphedema 2+ Male (g) | COMPUTED | col[3]+col[6]+col[9] — correctly sums all 3 age bands (unlike File 2's equivalent bug) |
| 13 | Lymphedema 2+ Female (h) | COMPUTED | col[4]+col[7]+col[10] |
| 14 | "C. Total (g+h)" duplicate label (reuses "C", should read "D. Total") | COMPUTED | col[12]+col[13] |
| 15 | *(blank spacer)* | — | not stored |

**Elephantiasis (cols 16–27)** — mirrors Lymphedema exactly
| Col | Label | Type | Formula |
|---|---|---|---|
| 16 | Elephantiasis 2-4 Male (g) reused letter | RAW | — |
| 17 | Elephantiasis 2-4 Female (h) | RAW | — |
| 18 | D. Total (g+h) | COMPUTED | col[16]+col[17] |
| 19 | Elephantiasis 5-14 Male (i) | RAW | — |
| 20 | Elephantiasis 5-14 Female (j) | RAW | — |
| 21 | E. Total (i+j) | COMPUTED | col[19]+col[20] |
| 22 | Elephantiasis 15+ Male (k) | RAW | — |
| 23 | Elephantiasis 15+ Female (l) | RAW | — |
| 24 | F. Total (k+l) | COMPUTED | col[22]+col[23] |
| 25 | Elephantiasis 2+ Male (g) reused letter again | COMPUTED | col[16]+col[19]+col[22] (correct sum) |
| 26 | Elephantiasis 2+ Female (h) | COMPUTED | col[17]+col[20]+col[23] |
| 27 | "C. Total (g+h)" duplicate label — identical text to col 14, should read "G. Total" | COMPUTED | col[25]+col[26] |
| 28 | *(blank spacer)* | — | not stored |

**Hydrocele (cols 29–32) — Male only**
| Col | Label | Type | Formula |
|---|---|---|---|
| 29 | Hydrocele 2-4 Male (m) | RAW | — |
| 30 | Hydrocele 5-14 Male (n) | RAW | — |
| 31 | Hydrocele 15+ Male (o) | RAW | — |
| 32 | I. Total (m+n+o) | COMPUTED | col[29]+col[30]+col[31] |

### DQC Rules
None present — no percentage/rate columns exist in this file at all (pure case counts, no denominator-based indicator), and no "Over X%" flag columns. Only blank-cell conditional formatting.

### change_log — Useful, Confirms Template History
- 2025-10-20: "Transfer Sulu Province to Region IX" (same odd note as File 1 — Sulu never appears in this file's actual data either; likely a shared/templated change-log note not specific to this workbook).
- 2025-10-29: Added the "Region" column for filtering.
- 2026-01-20: Column AA header corrected from "Hydrocele... Female" → "Hydrocele... Male" — explains why Hydrocele is Male-only today.
- 2026-01-22: "Insert Column for 2 yrs old and above for Elephentiasis" — this insertion shifted the Hydrocele section from starting at column AA (index 26) to its current position at column AD (index 29), which reconciles the 2026-01-20 log entry with the current layout. No contradiction — just a shifted-column artifact from sequential edits.

### Flags / Open Questions
- **FLAG F3-1** — Same duplicate-letter/duplicate-label pattern as Files 1 and 2: "C. Total" text reused verbatim at cols 14 and 27 for two structurally different totals (Lymphedema 2+ and Elephantiasis 2+); group letters (g)/(h) reused three times across the sheet. Config must key strictly on column index, never label text.
- **FLAG F3-2** — Unlike File 2's broken "2+" columns, this file's "2+" total columns (12, 13, 25, 26) are formulaically **correct** (true sum of all 3 age bands). Worth confirming with the data owner whether File 2's MDA "15+"/"2+" bug should be fixed to match this file's (correct) pattern.
- **FLAG F3-3** — Hydrocele has no Female column — correct by clinical definition (Male-only condition), not a gap; but worth explicitly documenting so a future encoder doesn't assume a missing column is a data-entry error.
- **FLAG F3-4** — Same "Sulu Province → Region 9" change-log entry appears in this file and File 1, but Sulu doesn't appear in either file's actual data rows. Possibly a change-log entry copy-pasted across all 3 Filariasis templates during a shared editing session — worth asking the encoder whether it's relevant here or should be removed/clarified.

---

## Cross-File Patterns — Filariasis Group

| Pattern | File 1 (CDR) | File 2 (MDA) | File 3 (Lymph/Eleph/Hydro) |
|---|---|---|---|
| Sheets | Annual + change_log | Annual only | Annual + change_log |
| Frequency | Annual only | Annual only | Annual only |
| Data rows | 6 (region+4) | 4 (non-NIR provinces) | 6 (region+4) |
| Municipality/barangay rows | No | No | No |
| Population as denominator | No (uses "examined" self-referential denominator) | Yes (raw pop columns per age band) | No (pure counts, no %) |
| Age bands | None (all ages combined) | 2-4y, 5-14y, 15+, 2+ | 2-4y, 5-14y, 15+, 2+ |
| DQC threshold columns | None | None | None |
| Duplicate/reused labels found | Header notation stale ("A/E" etc.) | Multiple (letters + "C.Total" reused twice) | Multiple ("C.Total" reused twice, letters reused 3x) |
| Formula correctness of "2+" combined total | N/A | Broken (double-counts, omits 15+) | Correct |
| Region scope | NIR only | **Non-NIR (Regions 4B/9/11/12)** | NIR only |

### Schema Design Implications
1. **New "no municipality/barangay" row pattern** — Filariasis files need a much shorter `location_aliases`/row-count expectation than Child Care files (6 rows, not 129). The parser's `stop_at_blank_psgc` behavior should work fine here since it's index-driven, but validation expectations (e.g., "expected row count") should not assume 129.
2. **New denominator type: "examined" (self-referential, per test modality)** for CDR — adds to the existing Denominator Registry (D1 Projected Population, D2 Facility Seen, D3 Live Births, D4 Condition Count) as effectively a D2-variant, but split across two parallel modalities (NBE vs RDT) rather than one "Seen" figure.
3. **File 2 cannot be fully modeled as-is** — its "15+"/"2+" MDA figures are not trustworthy raw data. Recommend seeding indicators/config only for the 2-4y and 5-14y MDA groups until DOH confirms/fixes the template, and flagging the rest as `notes`-documented known-broken columns (not silently computed and stored).
4. **Region-scope mismatch in File 2** is a bigger open question than a data-quality nuance — it may mean this file needs an entirely separate `location_aliases` set (or should be excluded/handled outside the NIR-only dashboard filtering entirely). This should be resolved before writing `psgc_column`/`location_aliases` for its config.
5. None of the 3 files reference HIV/Syphilis-style sensitive indicators, so per `CLAUDE.md`'s "Sensitive Indicators" section, no `is_sensitive` RBAC flags appear required for Filariasis — but worth a quick confirmation given these are also communicable-disease case counts (currently only HIV/Syphilis reactive cases are called out as sensitive).

---

**Summary:** All 3 Filariasis files are Annual-only, with unusually short data extents (6 rows: region+4 for CDR and Lymph/Eleph/Hydro; only 4 rows for MDA) rather than the 129-row municipality/barangay structure seen in Child Care templates. Biggest flags: (1) the MDA file's "15 years and above" and "2 years and above" MDA columns are structurally broken formulas that never reference genuine 15+ data — only 2-4y and 5-14y MDA coverage is trustworthy; (2) the MDA file's 4 populated rows are all non-NIR provinces (Region 4B, 9, 11, 12), not Negros Island Region, raising a real question about whether it belongs in this dashboard's NIR-only scope; (3) recurring template hygiene issues (reused group letters, duplicate "C. Total" labels, stale header notation not matching live formulas) consistent with patterns already documented for Immunization files — config should always key off column index/formula, never header text. CDR and Lymph/Eleph/Hydro files have no DQC threshold columns at all (only blank-highlight formatting), unlike every Child Care template reviewed so far.
