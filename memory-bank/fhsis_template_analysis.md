# FHSIS Template Analysis
## DOH-NIR CHD Health Statistics Dashboard
## Program: Child Care > a. Immunization

**Purpose:** Document the structure of all Excel templates before database schema design.
**Status:** In Progress
**Last Updated:** April 24, 2026
**Analyst:** Claude (Senior Developer)

---

## How to Read This Document

Each file section covers:
- File name and what it tracks
- Sheet structure (what tabs exist)
- Column inventory (raw inputs vs computed)
- Age groups and sex disaggregation
- DQC (Data Quality Check) rules found in the file
- Flags and open questions

**Column Types:**
- `RAW` = actual data entered by user, to be stored in database
- `COMPUTED` = derived by formula, system recalculates and validates
- `META` = administrative (PSGC, location name, remarks) — stored separately
- `DQC` = data quality flag column — system rule, not stored

---

## Files in This Group (8 total)

| # | Filename | Vaccine/Indicator | Status |
|---|---|---|---|
| 1 | `1_CPAB_BCG_HepaB1_nir.xlsx` | CPAB, BCG, HepaB (Birth Dose) | ✅ Analyzed |
| 2 | *(not yet uploaded)* | *(File 2 unknown)* | ⏳ Pending |
| 3 | *(not yet uploaded)* | *(File 3 unknown)* | ⏳ Pending |
| 4 | `4_DPT-HiB-HepB123_nir.xlsx` | DPT-HiB-HepB doses 1, 2, 3 | ✅ Analyzed |
| 5 | `5_OPV123_nir.xlsx` | OPV doses 1, 2, 3 | ✅ Analyzed |
| 6 | `6_IPV12_nir.xlsx` | IPV doses 1, 2 | ✅ Analyzed |
| 7 | `7_PCV123_nir.xlsx` | PCV doses 1, 2, 3 | ✅ Analyzed |
| 8 | `8_MMR12_and_FIC_CIC_nir.xlsx` | MMR doses 1, 2 + FIC + CIC | ✅ Analyzed |

**Note:** Files 2 and 3 are missing from the first upload batch. Numbers jump from 1 to 4 in the filenames. Need to confirm what Files 2 and 3 are.

---

## File 1: `1_CPAB_BCG_HepaB1_nir.xlsx`
**Tracks:** CPAB (Child Protected at Birth), BCG vaccination, HepaB birth dose

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Annual | Summary | Full year totals |
| Q1 | Quarterly | Jan–Mar |
| Q2 | Quarterly | Apr–Jun |
| Q3 | Quarterly | Jul–Sep |
| Q4 | Quarterly | Oct–Dec |
| Jan–Dec | Monthly | One sheet per month (12 sheets) |
| Population | Reference | 2026 projected population (0-11 months) |
| change_log | Admin | Version history — NOT imported |

**Frequency:** Monthly + Quarterly + Annual
**Total data sheets:** 17 (12 monthly + 4 quarterly + 1 annual)
**Rows per sheet:** 129 (includes region, provinces, municipalities, barangays under HUC)
**Columns per sheet:** 29

### Age Group
- All indicators: **0–11 months**
- No multi-age-group disaggregation in this file

### Geographic Levels Present
- Region (NIR)
- Province (Negros Occidental, Negros Oriental, Siquijor)
- City/Municipality
- Barangay (under City of Bacolod HUC only)

### Column Inventory

**Indicator Group A — CPAB (Child Protected at Birth)**
| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC | META | — |
| 1 | PHIC / Location Name | META | — |
| 2 | Projected Population (0-11 months) | RAW | — |
| 3 | CPAB Male | RAW | — |
| 4 | CPAB Female | RAW | — |
| 5 | A. Total | COMPUTED | col[3] + col[4] |
| 6 | A. Percentage | COMPUTED | col[5] / col[2] |

**Indicator Group B — BCG within 24 hours**
| Col | Label | Type | Formula |
|---|---|---|---|
| 7 | BCG within 24h Male | RAW | — |
| 8 | BCG within 24h Female | RAW | — |
| 9 | B. Total | COMPUTED | col[7] + col[8] |
| 10 | B. Percentage | COMPUTED | col[9] / col[2] |

**Indicator Group C — BCG >24 hours to 11 months 29 days**
| Col | Label | Type | Formula |
|---|---|---|---|
| 11 | BCG >24h Male | RAW | — |
| 12 | BCG >24h Female | RAW | — |
| 13 | C. Total | COMPUTED | col[11] + col[12] |
| 14 | C. Percentage | COMPUTED | col[13] / col[2] |

**Indicator Group D — HepaB within 24 hours after birth**
| Col | Label | Type | Formula |
|---|---|---|---|
| 15 | HepaB within 24h Male | RAW | — |
| 16 | HepaB within 24h Female | RAW | — |
| 17 | D. Total | COMPUTED | col[15] + col[16] |
| 18 | D. Percentage | COMPUTED | col[17] / col[2] |

**Indicator Group E — HepaB >24 hours up to 14 days**
| Col | Label | Type | Formula |
|---|---|---|---|
| 19 | HepaB >24h to 14 days Male | RAW | — |
| 20 | HepaB >24h to 14 days Female | RAW | — |
| 21 | E. Total | COMPUTED | col[19] + col[20] |
| 22 | E. Percentage | COMPUTED | col[21] / col[2] |

**Admin Columns**
| Col | Label | Type |
|---|---|---|
| 23 | Remarks | META |
| 24 | DQC Over 200% (A) | DQC |
| 25 | DQC Over 200% (B) | DQC |
| 26 | DQC Over 200% (C) | DQC |
| 27 | DQC Over 200% (D) | DQC |
| 28 | DQC Over 200% (E) | DQC |

### DQC Rules
- All 5 groups: flag if percentage exceeds 200% of projected population

### Raw Inputs to Store (per location per period)
1. Projected Population (0-11 months)
2. CPAB Male
3. CPAB Female
4. BCG within 24h Male
5. BCG within 24h Female
6. BCG >24h to 11m29d Male
7. BCG >24h to 11m29d Female
8. HepaB within 24h Male
9. HepaB within 24h Female
10. HepaB >24h to 14d Male
11. HepaB >24h to 14d Female

**Total raw inputs: 11 per location per period**

### Open Questions — File 1
- *(none at this time)*

---

## File 4: `4_DPT-HiB-HepB123_nir.xlsx`
**Tracks:** DPT-HiB-HepB doses 1, 2, and 3 — current year AND previous year

### Sheet Structure
Same as File 1: Annual + Q1–Q4 + Jan–Dec + Population + change_log
**Frequency:** Monthly + Quarterly + Annual
**Rows per sheet:** 129
**Columns per sheet:** 37

### Age Group
- All indicators: **0–11 months**

### KEY DIFFERENCE FROM FILE 1
This file contains **previous year data alongside current year data** in every sheet.
- Columns 2–14: Current year (2026)
- Columns 15–27: Previous year (2025)

This is a new structural pattern not seen in File 1.

### Population Sheet Finding
The Population sheet shows that 2026 and 2025 projected population values are **currently identical** because 2026 projections are not yet finalized. A note in the file states: *"2026 Projected Pop - Not yet available, currently using 2025 data."*

This means the population column is a reference value that may be updated mid-year.

### Column Inventory

**Current Year Indicators**
| Col | Label | Type | Formula |
|---|---|---|---|
| 2 | Projected Population 2026 (0-11 months) | RAW | — |
| 3 | DPT-HiB-HepB 1 Male | RAW | — |
| 4 | DPT-HiB-HepB 1 Female | RAW | — |
| 5 | A. Total | COMPUTED | col[3] + col[4] |
| 6 | A. Percentage | COMPUTED | col[5] / col[2] |
| 7 | DPT-HiB-HepB 2 Male | RAW | — |
| 8 | DPT-HiB-HepB 2 Female | RAW | — |
| 9 | B. Total | COMPUTED | col[7] + col[8] |
| 10 | B. Percentage | COMPUTED | col[9] / col[2] |
| 11 | DPT-HiB-HepB 3 Male | RAW | — |
| 12 | DPT-HiB-HepB 3 Female | RAW | — |
| 13 | C. Total | COMPUTED | col[11] + col[12] |
| 14 | C. Percentage | COMPUTED | col[13] / col[2] |

**Previous Year Indicators**
| Col | Label | Type | Formula |
|---|---|---|---|
| 15 | Projected Population 2025 (0-11 months) | RAW | — |
| 16 | DPT-HiB-HepB 1 Male (prev year) | RAW | — |
| 17 | DPT-HiB-HepB 1 Female (prev year) | RAW | — |
| 18 | D. Total (prev year) | COMPUTED | col[16] + col[17] |
| 19 | D. Percentage (prev year) | COMPUTED | col[18] / col[15] |
| 20 | DPT-HiB-HepB 2 Male (prev year) | RAW | — |
| 21 | DPT-HiB-HepB 2 Female (prev year) | RAW | — |
| 22 | E. Total (prev year) | COMPUTED | col[20] + col[21] |
| 23 | E. Percentage (prev year) | COMPUTED | col[22] / col[15] |
| 24 | DPT-HiB-HepB 3 Male (prev year) | RAW | — |
| 25 | DPT-HiB-HepB 3 Female (prev year) | RAW | — |
| 26 | F. Total (prev year) | COMPUTED | col[24] + col[25] |
| 27 | F. Percentage (prev year) | COMPUTED | col[26] / col[15] |

**Admin Columns**
| Col | Label | Type |
|---|---|---|
| 28 | Remarks | META |
| 29–34 | DQC Over 200% (A through F) | DQC |
| 35 | DQC: A>B or B>C or A>C | DQC |
| 36 | DQC: D>E or E>F or D>F | DQC |

### DQC Rules
- Groups A–F: flag if percentage exceeds 200%
- Sequence logic: dose 1 count should be ≥ dose 2 count ≥ dose 3 count
  - Current year: A ≥ B ≥ C
  - Previous year: D ≥ E ≥ F

### Raw Inputs to Store
**Current year:** Population + 6 raw values (3 doses × male/female) = 7
**Previous year:** Population + 6 raw values = 7
**Total raw inputs: 14 per location per period**

### Open Questions — File 4
**Q4-1:** Should previous year data be stored in the same `health_data` table with a different period_id, or is it a read-only reference used only for comparison in the dashboard? Needs clarification — do program managers ever *update* previous year data through this system, or is it locked?

---

## File 5: `5_OPV123_nir.xlsx`
**Tracks:** OPV (Oral Polio Vaccine) doses 1, 2, 3 — current year AND previous year

### Sheet Structure
Identical to File 4: Annual + Q1–Q4 + Jan–Dec + Population + change_log
**Frequency:** Monthly + Quarterly + Annual
**Rows per sheet:** 129
**Columns per sheet:** 37

### Structure Assessment
**Structurally identical to File 4.** Same column count (37), same layout pattern (current year + previous year), same DQC rules (dose sequence + over 200%). Only difference is the vaccine name (OPV vs DPT-HiB-HepB).

### Column Inventory
Same pattern as File 4 with OPV replacing DPT-HiB-HepB:
- Col 3–4: OPV 1 Male/Female (current year)
- Col 7–8: OPV 2 Male/Female (current year)
- Col 11–12: OPV 3 Male/Female (current year)
- Col 16–17: OPV 1 Male/Female (previous year)
- Col 20–21: OPV 2 Male/Female (previous year)
- Col 24–25: OPV 3 Male/Female (previous year)

### DQC Rules
Same as File 4: Over 200% per group + dose sequence logic (1 ≥ 2 ≥ 3)

### Raw Inputs to Store
Same as File 4: **14 per location per period**

---

## File 6: `6_IPV12_nir.xlsx`
**Tracks:** IPV (Inactivated Polio Vaccine) doses 1 and 2 — current year AND previous year

### Sheet Structure
Annual + Q1–Q4 + Jan–Dec + Population + **changelog** (note: slightly different spelling from other files — "changelog" not "change_log")
**Frequency:** Monthly + Quarterly + Annual
**Rows per sheet:** 129
**Columns per sheet:** 27

### KEY DIFFERENCE
Only **2 doses** (IPV 1 and IPV 2) vs 3 doses in Files 4 and 5.
Fewer columns (27 vs 37) as a result.

### Column Inventory

**Current Year**
| Col | Label | Type |
|---|---|---|
| 2 | Projected Population 2026 (0-11 months) | RAW |
| 3 | IPV 1 Male | RAW |
| 4 | IPV 1 Female | RAW |
| 5 | A. Total | COMPUTED |
| 6 | A. Percentage | COMPUTED |
| 7 | IPV 2 Male | RAW |
| 8 | IPV 2 Female | RAW |
| 9 | B. Total | COMPUTED |
| 10 | B. Percentage | COMPUTED |

**Previous Year**
| Col | Label | Type |
|---|---|---|
| 11 | Projected Population 2025 (0-11 months) | RAW |
| 12 | IPV 1 Male (prev year) | RAW |
| 13 | IPV 1 Female (prev year) | RAW |
| 14 | C. Total (prev year) | COMPUTED |
| 15 | C. Percentage (prev year) | COMPUTED |
| 16 | IPV 2 Male (prev year) | RAW |
| 17 | IPV 2 Female (prev year) | RAW |
| 18 | D. Total (prev year) | COMPUTED |
| 19 | D. Percentage (prev year) | COMPUTED |

**Admin**
| Col | Label | Type |
|---|---|---|
| 20 | Remarks | META |
| 21–24 | DQC Over 200% (A through D) | DQC |
| 25 | DQC: A >= B | DQC |
| 26 | DQC: (label unclear — references D>E>F but only 2 doses exist) | ⚠️ FLAG |

### DQC Rules
- Groups A–D: over 200% check
- Sequence: IPV1 ≥ IPV2 (current year)
- **Col 26 DQC label appears to be a copy-paste error** — it says "D>E or E>F or D>F" but this file only has 2 doses (A and B current, C and D previous). There is no E or F. This needs verification.

### Raw Inputs to Store
**Current year:** Population + 4 raw values (2 doses × male/female) = 5
**Previous year:** Population + 4 raw values = 5
**Total raw inputs: 10 per location per period**

### Open Questions — File 6
**Q6-1:** Column 26 DQC label references E and F which do not exist in this file. Is this a template error or is there a version of this file with more columns? Please verify with the encoder.

---

## File 7: `7_PCV123_nir.xlsx`
**Tracks:** PCV (Pneumococcal Conjugate Vaccine) doses 1, 2, 3 — current year AND previous year

### Sheet Structure
Identical to File 4: Annual + Q1–Q4 + Jan–Dec + Population + change_log
**Frequency:** Monthly + Quarterly + Annual
**Rows per sheet:** 129
**Columns per sheet:** 37

### Structure Assessment
**Structurally identical to Files 4 and 5.** Same column count (37), same layout, same DQC rules. Only vaccine name differs (PCV vs DPT-HiB-HepB vs OPV).

### Raw Inputs to Store
Same as Files 4 and 5: **14 per location per period**

---

## File 8: `8_MMR12_and_FIC_CIC_nir.xlsx`
**Tracks:** MMR doses 1 and 2 + FIC (Fully Immunized Child) + CIC (Completely Immunized Child)

### Sheet Structure
Annual + Q1–Q4 + Jan–Dec + Population + change_log
**Frequency:** Monthly + Quarterly + Annual
**Rows per sheet:** 129
**Columns per sheet:** 33

### KEY DIFFERENCES — Most Complex File So Far

**1. Mixed indicator types in one file.** This file tracks vaccination counts (MMR 1, MMR 2) AND composite coverage indicators (FIC, CIC). FIC and CIC are not individual vaccines — they are summary metrics that depend on multiple other vaccines being complete.

**2. No previous year for MMR 1 current year.** The layout is:
- Col 2: Current year population
- Col 3–6: MMR 1 current year
- Col 7: **Previous year population** ← appears here mid-file
- Col 8–11: MMR 1 previous year
- Col 12–15: MMR 2 (no year label in header — ambiguous)
- Col 16–19: FIC (no year label)
- Col 20: Previous year population minus FIC previous year (denominator for CIC)
- Col 21–24: CIC

**3. MMR 2, FIC, CIC have no age group or year label in their column headers.** The raw data shows the column names simply as "MMR 2 (male)", "FIC (male)", "CIC (male)" without specifying 0-11 months or current/previous year. This is a gap in the template documentation.

**4. CIC denominator is unique.** CIC percentage uses a special denominator: previous year projected population MINUS previous year FIC count. This is more complex than any formula seen so far.

### Column Inventory

**MMR 1 — Current Year**
| Col | Label | Type |
|---|---|---|
| 2 | Projected Population 2026 (0-11 months) | RAW |
| 3 | MMR 1 Male | RAW |
| 4 | MMR 1 Female | RAW |
| 5 | A. Total | COMPUTED |
| 6 | A. Percentage | COMPUTED |

**MMR 1 — Previous Year**
| Col | Label | Type |
|---|---|---|
| 7 | Projected Population 2025 (0-11 months) (prev year) | RAW |
| 8 | MMR 1 Male (prev year) | RAW |
| 9 | MMR 1 Female (prev year) | RAW |
| 10 | B. Total (prev year) | COMPUTED |
| 11 | B. Percentage (prev year) | COMPUTED |

**MMR 2 — Year Unknown**
| Col | Label | Type | Note |
|---|---|---|---|
| 12 | MMR 2 Male | RAW | ⚠️ Year not labeled |
| 13 | MMR 2 Female | RAW | ⚠️ Year not labeled |
| 14 | C. Total | COMPUTED | |
| 15 | C. Percentage | COMPUTED | Denominator = col[7] (prev year pop) |

**FIC — Year Unknown**
| Col | Label | Type | Note |
|---|---|---|---|
| 16 | FIC Male | RAW | ⚠️ Year not labeled |
| 17 | FIC Female | RAW | ⚠️ Year not labeled |
| 18 | D. Total | COMPUTED | |
| 19 | D. Percentage | COMPUTED | Denominator = col[7] (prev year pop) |

**CIC — Previous Year**
| Col | Label | Type | Note |
|---|---|---|---|
| 20 | Prev Year Pop minus FIC prev year | COMPUTED | Special denominator |
| 21 | CIC Male | RAW | |
| 22 | CIC Female | RAW | |
| 23 | E. Total | COMPUTED | |
| 24 | E. Percentage | COMPUTED | Denominator = col[20] |

**Admin**
| Col | Label | Type |
|---|---|---|
| 25 | Remarks | META |
| 26–30 | DQC Over 200% (A through E) | DQC |
| 31 | DQC: MMR2 >= FIC | DQC |
| 32 | DQC: MMR1 >= MMR2 | DQC |

### DQC Rules
- All groups: over 200% check
- Sequence: MMR1 ≥ MMR2 ≥ FIC (logical — can't have more FIC than MMR2 recipients)

### Raw Inputs to Store
1. Population 2026 (current)
2. Population 2025 (previous)
3. MMR 1 Male (current)
4. MMR 1 Female (current)
5. MMR 1 Male (previous)
6. MMR 1 Female (previous)
7. MMR 2 Male *(year needs clarification)*
8. MMR 2 Female *(year needs clarification)*
9. FIC Male *(year needs clarification)*
10. FIC Female *(year needs clarification)*
11. CIC Male
12. CIC Female

**Total raw inputs: 12 per location per period (pending clarification)**

### Open Questions — File 8
**Q8-1:** MMR 2 columns (12–13) have no year label in the header. Is MMR 2 current year or previous year data?

**Q8-2:** FIC columns (16–17) have no year label. Is FIC current year or previous year data?

**Q8-3:** The percentage for MMR 2 and FIC uses col[7] as denominator, which is the **previous year** projected population. Is this intentional? If so, why are these indicators measured against the previous year population?

**Q8-4:** FIC and CIC are composite indicators — they depend on a child having received ALL required vaccines. Does this system need to calculate FIC/CIC from the other vaccine files, or does the program manager enter FIC/CIC directly into this file?

---

## Cross-File Patterns Observed

### What Is Consistent Across All 6 Files
1. Same sheet structure: Annual + Q1–Q4 + Jan–Dec + Population + change_log
2. Same geographic rows: 129 rows (region → province → city/municipality → barangay for HUC)
3. Same PSGC column (col 0) and location name column (col 1)
4. Always 1 header row (row index 0), data starts at row index 1
5. Sex disaggregation: always Male + Female for every raw indicator
6. DQC over-200% flags present in all files
7. All indicators use age group 0–11 months

### What Varies Across Files
| Pattern | Files 4, 5, 7 | File 1 | File 6 | File 8 |
|---|---|---|---|---|
| Number of doses | 3 | Multiple groups | 2 | 2 + FIC + CIC |
| Prev year columns | Yes (same sheet) | No | Yes (same sheet) | Yes (same sheet) |
| Total columns | 37 | 29 | 27 | 33 |
| Special denominators | No | No | No | Yes (CIC) |
| Mixed indicator types | No | No | No | Yes |

### The Previous Year Pattern
Files 4, 5, 6, 7, 8 all contain previous year data in the same sheet as current year data. File 1 does not. This is a critical schema design question — see flags below.

---

## Schema Design Flags Raised by This Analysis

### FLAG 1 — Previous Year Data Storage
Files 4, 5, 6, 7, 8 embed previous year data directly in the current year sheet. This means when a user uploads "July 2026 data," the file also contains "July 2025 data."

**Decision needed:** Do we store this previous year data as a separate period entry in `health_data` (e.g., period_id pointing to July 2025), or do we treat it as a display reference only and not store it separately?

**Risk if we store it:** The same previous year data will be uploaded multiple times (once per monthly upload in 2026), causing duplicates.

**Risk if we ignore it:** We lose the historical baseline the program managers use for comparison.

### FLAG 2 — Population as a RAW Input
Projected population appears as a column in every data sheet. It is also in a separate Population sheet. These values appear to be the same.

**Decision needed:** Do we store population per period per file, or maintain one central population reference table separate from `health_data`?

### FLAG 3 — FIC and CIC are Composite Indicators
FIC (Fully Immunized Child) and CIC (Completely Immunized Child) are not vaccine counts — they are derived coverage indicators. It is currently unclear whether they are entered manually by program managers or computed from other files.

**Decision needed:** Are FIC and CIC raw inputs or system-computed values?

### FLAG 4 — Files 2 and 3 Are Missing
The filename numbering jumps from File 1 to File 4. Files 2 and 3 are part of the Immunization group but have not been uploaded yet.

---

## Clarifying Questions (All Files)

| ID | Question | Affects |
|---|---|---|
| Q-MISS-1 | What are Files 2 and 3 in the Immunization group? | File inventory |
| Q-PY-1 | Should previous year data embedded in current year files be stored separately or used as display reference only? | Schema design |
| Q-POP-1 | Is the Population sheet the authoritative source for projected population, or is it the column inside each data sheet? | Schema design |
| Q-POP-2 | When 2026 population becomes available mid-year, will uploaded data be recalculated or left as-is? | Validation rules |
| Q4-1 | Is previous year data in Files 4–8 ever updated by program managers through this system? | RBAC + ingestion |
| Q6-1 | Col 26 in IPV file references E and F which don't exist — is this a template error? | DQC rules |
| Q8-1 | Is MMR 2 data current year or previous year? | Indicator mapping |
| Q8-2 | Is FIC data current year or previous year? | Indicator mapping |
| Q8-3 | Why do MMR 2 and FIC percentages use previous year population as denominator? | Validation rules |
| Q8-4 | Are FIC and CIC entered manually or computed from other vaccine files? | Schema design |

---

*Document continues as more files are analyzed.*
*Next: Child Care > a. Immunization — Files 2 and 3 (pending upload)*

---

## ANSWERS TO PREVIOUS OPEN QUESTIONS

| ID | Question | Answer | Action |
|---|---|---|---|
| Q-MISS-1 | What are Files 2 and 3 in Immunization? | Files 2 and 3 do not exist — it was a typo in the filename. File 1 is directly followed by File 4. | Update file inventory |
| Q-PY-1 | Should previous year data be stored? | Yes, store it. It comes from DOH as-is. | Schema: store as separate period entries, prevent duplicates on re-upload |
| Q-POP-2 | What happens when 2026 population is available mid-year? | System stores whatever is in the file at time of upload. Recalculation not required. | Validation: allow population update, log the change |
| Q6-1 | Col 26 in IPV file — DQC label references E and F which don't exist | This is a template artifact (extra column AH). Confirmed to ignore. | Do not ingest col 26 of IPV file |
| Q8-4 | Are FIC and CIC entered manually or computed? | Manually entered in monthly tabs. Annual and quarterly tabs have Excel formulas that roll up from monthly. | FIC and CIC are RAW inputs. Only monthly tabs ingested for files with monthly sheets. |

---

## Program: Child Care > b. Management of the Sick

**Files in this group:**
| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `1_Sick_Received_Vitamin_A_nir.xlsx` | Sick children given Vitamin A (6-11m and 12-59m) | ✅ Analyzed |
| 2 | `2_3_Diarrhea_and_Penumonia_received_treatment_nir.xlsx` | Diarrhea (ORS/Zinc) + Pneumonia (antibiotic) | ✅ Analyzed |

---

## File b-1: `1_Sick_Received_Vitamin_A_nir.xlsx`
**Tracks:** Sick children seen and given Vitamin A supplementation — two age groups

### Sheet Structure
| Sheet | Type |
|---|---|
| Q1–Q4 | Quarterly |
| Annual | Annual |
| change_log | Admin — not imported |

**Frequency: Quarterly + Annual only. No monthly tabs.**
**Rows per sheet:** 129
**Columns per sheet:** 19

### Age Groups — Two Age Groups in One File
This is the first file with multiple age group segments in the same sheet:
- Segment A–B: **6–11 months**
- Segment C–D: **12–59 months**

### No Previous Year Data
This file contains only current year data. No previous year columns.

### No Projected Population Column
This file uses "Seen" (children who visited the health facility) as the denominator, not projected population. This is a fundamentally different denominator type from the Immunization files.

### Column Inventory

**Age Group: 6–11 months**
| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region, Province/City | META | — |
| 2 | A. Seen (6-11m) Male | RAW | — |
| 3 | A. Seen (6-11m) Female | RAW | — |
| 4 | A. Seen Total | COMPUTED | col[2] + col[3] |
| 5 | B. Sick 6-11m given VitA 100,000 IU Male | RAW | — |
| 6 | B. Sick 6-11m given VitA 100,000 IU Female | RAW | — |
| 7 | B. Total | COMPUTED | col[5] + col[6] |
| 8 | B. Percentage | COMPUTED | col[7] / col[4] |

**Age Group: 12–59 months**
| Col | Label | Type | Formula |
|---|---|---|---|
| 9 | C. Seen (12-59m) Male | RAW | — |
| 10 | C. Seen (12-59m) Female | RAW | — |
| 11 | C. Seen Total | COMPUTED | col[9] + col[10] |
| 12 | D. Sick 12-59m given VitA 200,000 IU Male | RAW | — |
| 13 | D. Sick 12-59m given VitA 200,000 IU Female | RAW | — |
| 14 | D. Total | COMPUTED | col[12] + col[13] |
| 15 | D. Percentage | COMPUTED | col[14] / col[11] |

**Admin**
| Col | Label | Type |
|---|---|---|
| 16 | Remarks | META |
| 17 | DQC Over 100% (B) | DQC |
| 18 | DQC Over 100% (D) | DQC |

### DQC Rules
- Group B: flag if percentage exceeds 100% (cannot give VitA to more sick children than were seen)
- Group D: same rule for 12-59m age group
- Note: threshold is 100% not 200% — different from Immunization files

### Raw Inputs to Store
1. Seen (6-11m) Male
2. Seen (6-11m) Female
3. Sick 6-11m given VitA Male
4. Sick 6-11m given VitA Female
5. Seen (12-59m) Male
6. Seen (12-59m) Female
7. Sick 12-59m given VitA Male
8. Sick 12-59m given VitA Female

**Total raw inputs: 8 per location per period**

### Schema Flags — File b-1
**FLAG b1-1 — New denominator type:** Previous files used projected population as denominator. This file uses "Seen" (facility attendance count) as denominator. Both are RAW inputs but serve different purposes. The schema must accommodate both types without confusion.

---

## File b-2: `2_3_Diarrhea_and_Penumonia_received_treatment_nir.xlsx`
**Tracks:** Two diseases in one file — Diarrhea treatment (ORS + Zinc) AND Pneumonia treatment (antibiotics)

### Sheet Structure
Same as File b-1: Q1–Q4 + Annual + change_log
**Frequency: Quarterly + Annual only. No monthly tabs.**
**Rows per sheet:** 129
**Columns per sheet:** 27

### Two Diseases in One File
First time we see two completely separate disease indicators combined in one template. The split is clean — columns 2–14 are Diarrhea, columns 15–21 are Pneumonia.

### No Previous Year Data
Current year only.

### Column Inventory

**Disease 1: Diarrhea (cols 2–14)**
| Col | Label | Type | Formula |
|---|---|---|---|
| 2 | A. Seen w/ Diarrhea Male | RAW | — |
| 3 | A. Seen w/ Diarrhea Female | RAW | — |
| 4 | A. Seen Total | COMPUTED | col[2] + col[3] |
| 5 | B. 0-59m w/ Diarrhea given ORS Male | RAW | — |
| 6 | B. 0-59m w/ Diarrhea given ORS Female | RAW | — |
| 7 | B. Total | COMPUTED | col[5] + col[6] |
| 8 | B. Percentage | COMPUTED | col[7] / col[4] |
| 9 | C. 0-59m w/ Diarrhea given ORS+Zinc Male | RAW | — |
| 10 | C. 0-59m w/ Diarrhea given ORS+Zinc **Male** ⚠️ | RAW | — |
| 11 | C. Total | COMPUTED | col[9] + col[10] |
| 12 | C. Percentage | COMPUTED | col[11] / col[4] |
| 13 | D. Total (ORS + ORS+Zinc combined) | COMPUTED | col[7] + col[11] |
| 14 | D. Percentage | COMPUTED | col[13] / col[4] |

**Disease 2: Pneumonia (cols 15–21)**
| Col | Label | Type | Formula |
|---|---|---|---|
| 15 | E. Seen w/ Pneumonia Male | RAW | — |
| 16 | E. Seen w/ Pneumonia Female | RAW | — |
| 17 | E. Seen Total | COMPUTED | col[15] + col[16] |
| 18 | F. 0-59m w/ Pneumonia received antibiotic Male | RAW | — |
| 19 | F. 0-59m w/ Pneumonia received antibiotic Female | RAW | — |
| 20 | F. Total | COMPUTED | col[18] + col[19] |
| 21 | F. Percentage | COMPUTED | col[20] / col[17] |

**Admin**
| Col | Label | Type | Note |
|---|---|---|---|
| 22 | Remarks | META | |
| 23 | DQC Over 100% (D) | DQC | |
| 24 | DQC Over 100% (F) | DQC | |
| 25 | DQC Over 100% (D) | DQC | ⚠️ Duplicate label — same as col 23 |
| 26 | DQC Over 100% (F) | DQC | ⚠️ Duplicate label — same as col 24 |

### ⚠️ Template Errors Found in File b-2

**Error 1 — Col 10 is labeled Male but should be Female.**
Col 9 is "C. ORS+Zinc Male" and col 10 is also labeled "C. ORS+Zinc Male." This is a copy-paste error in the template. Col 10 should be Female. The formula col[11] = col[9] + col[10] confirms these are two different raw inputs being summed.

**Error 2 — Cols 23 and 25 have identical labels. Cols 24 and 26 have identical labels.**
Four DQC columns are present but only two unique labels exist (D and F). Either this is a duplicate of cols 23–24, or cols 25–26 are meant to track a different DQC rule but were mislabeled.

### DQC Rules
- Group D: flag if percentage exceeds 100% (Diarrhea — combined ORS+Zinc cannot exceed total seen)
- Group F: flag if percentage exceeds 100% (Pneumonia — antibiotic recipients cannot exceed total seen)
- Cols 25–26 DQC purpose unclear — needs clarification

### Age Group
- Diarrhea indicators: **0–59 months** (broader than Immunization files)
- Pneumonia indicators: **0–59 months**
- No sex-specific age disaggregation mentioned in headers

### Raw Inputs to Store
1. Seen w/ Diarrhea Male
2. Seen w/ Diarrhea Female
3. Given ORS Male
4. Given ORS Female
5. Given ORS+Zinc Male
6. Given ORS+Zinc Female *(currently mislabeled as Male in template)*
7. Seen w/ Pneumonia Male
8. Seen w/ Pneumonia Female
9. Given antibiotic Male
10. Given antibiotic Female

**Total raw inputs: 10 per location per period**

---

## Updated Cross-Program Pattern Summary

| Pattern | Immunization (a) | Mgt of Sick (b) |
|---|---|---|
| Has monthly tabs | Yes (files 1, 4–8) | No — quarterly only |
| Has previous year columns | Yes (files 4–8) | No |
| Denominator type | Projected population | Seen (facility visits) |
| DQC threshold | 200% | 100% |
| Age groups | 0–11m only | 6–11m, 12–59m, 0–59m |
| Multiple diseases per file | No | Yes (file b-2) |
| Template errors found | 1 (IPV col 26) | 2 (col 10 label, duplicate DQC) |

---

## All Open Questions — Updated

| ID | File | Question | Status |
|---|---|---|---|
| Q8-1 | File 8 | Is MMR 2 data current year or previous year? | ⏳ Pending |
| Q8-2 | File 8 | Is FIC data current year or previous year? | ⏳ Pending |
| Q8-3 | File 8 | Why do MMR2 and FIC percentages use previous year population as denominator? | ⏳ Pending |
| Q-POP-1 | All | Is Population sheet the authoritative source or the column in each data sheet? | ⏳ Pending |
| Q-b2-1 | File b-2 | Col 10 is labeled Male — should it be Female? Please confirm. | ⏳ Pending |
| Q-b2-2 | File b-2 | Cols 25–26 are duplicate DQC labels — what are these tracking? | ⏳ Pending |
| Q-PREV-1 | All | When the same previous year data appears in 12 monthly uploads, how do we handle duplicates? Accept first and reject subsequent, or always overwrite? | ⏳ Pending |

---

*Document continues as more files are analyzed.*
*Next: Child Care > b. Management of the Sick — remaining files (if any)*
*Then: Child Care > c. (folder 3) and d. (folder 4)*

---

## CLARIFICATIONS — Management of the Sick

### File b-2 DQC Columns — Resolved

The 4 DQC columns in the Diarrhea/Pneumonia file check the following:

| DQC Col Index | Excel Col | Actual Indicator Checked | Correct Rule |
|---|---|---|---|
| 23 | I (index 8) | B. Percentage (ORS / Diarrhea seen) | Flag if > 100% |
| 24 | M (index 12) | C. Percentage (ORS+Zinc / Diarrhea seen) | Flag if > 100% |
| 25 | O (index 14) | D. Percentage (Combined ORS+Zinc / Diarrhea seen) | Flag if > 100% |
| 26 | V (index 21) | F. Percentage (Antibiotic / Pneumonia seen) | Flag if > 100% |

**Template label errors confirmed:**
- Cols 23 and 24 are labeled "D" and "F" but actually check Groups B and C
- Cols 25 and 26 correctly check Groups D and F

**Decision:** DQC rules will be defined in the parser config based on actual formula logic, not column header labels. This protects us from future template labeling errors.

### File b-2 Col 10 — Resolved
Column 10 confirmed as typo — should be "ORS+Zinc Female" not Male. Template has been corrected by the data owner. Our system will store it as Female regardless of what the column header says, because the config defines the mapping.


---

## Program: Child Care > c. Nutrition

**Files in this group:**
| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `1_Breastfeeding_and_LBW_nir.xlsx` | Breastfeeding initiation + LBW given Iron | ✅ Analyzed |
| 2 | `2_3_Vitamin_A_supplementation_nir.xlsx` | Vitamin A supplementation (6-11m and 12-59m) | ✅ Analyzed |
| 3 | *(combined with File 2)* | — | N/A |
| 4 | `4_MNP_nir.xlsx` | Micronutrient Powder supplementation | ✅ Analyzed |
| 5 | `5_LNS-SQ_nir.xlsx` | Lipid-based Nutrient Supplement - Small Quantity | ✅ Analyzed |

**Note:** File numbering jumps from 1 to 2_3 to 4 to 5. Same pattern as Immunization — combined files use merged numbers.

---

## File c-1: `1_Breastfeeding_and_LBW_nir.xlsx`
**Tracks:** Breastfeeding initiation within 1 hour of birth + LBW infants given Iron

### Sheet Structure
Q1–Q4 + Annual + change_log
**Frequency: Quarterly + Annual only. No monthly tabs.**
**Rows per sheet:** 129
**Columns per sheet:** 15

### New Denominator Type — Live Births
This file introduces a third denominator type. Previous types seen:
- Projected population (Immunization files)
- Seen/facility visits (Management of Sick)
- **Live Births** ← new in this file

Live Births is neither a population projection nor a facility visit count. It is an actual count of births recorded in the period.

### Two Indicator Groups in One File
- Group A: Breastfeeding (denominator = Live Births)
- Group B: LBW given Iron (denominator = LBW count, which is itself a RAW input)

### Column Inventory

**Group A — Breastfeeding**
| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region, Province/City | META | — |
| 2 | Live Births | RAW | — |
| 3 | Newborns initiated on breastfeeding within 1h Male | RAW | — |
| 4 | Newborns initiated on breastfeeding within 1h Female | RAW | — |
| 5 | A. Total | COMPUTED | col[3] + col[4] |
| 6 | A. Percentage | COMPUTED | col[5] / col[2] |

**Group B — LBW given Iron**
| Col | Label | Type | Formula | Note |
|---|---|---|---|---|
| 7 | Low Birth Weight (LBW) count | RAW | — | This is BOTH a raw input AND the denominator for col[11] |
| 8 | LBW given Iron Male | RAW | — | |
| 9 | LBW given Iron Female | RAW | — | |
| 10 | B. Total | COMPUTED | col[8] + col[9] | |
| 11 | B. Percentage | COMPUTED | col[10] / col[7] | Denominator is col[7] LBW count |

**Admin**
| Col | Label | Type |
|---|---|---|
| 12 | Remarks | META |
| 13 | DQC Over 100% (A) | DQC — flag if breastfeeding > live births |
| 14 | DQC Over 100% (B) | DQC — flag if iron given > LBW count |

### DQC Rules
- Group A: Breastfeeding total cannot exceed Live Births — flag if > 100%
- Group B: Iron given cannot exceed LBW count — flag if > 100%

### Raw Inputs to Store
1. Live Births
2. Breastfeeding Male
3. Breastfeeding Female
4. LBW count
5. LBW given Iron Male
6. LBW given Iron Female

**Total raw inputs: 6 per location per period**

### Schema Flag — File c-1
**FLAG c1-1 — LBW is both a raw input and a denominator.**
The LBW count in col[7] is entered by the user AND used as the denominator for the iron supplementation percentage. This is the same pattern as "Seen" in Management of the Sick, but it is a count of a specific condition (low birth weight), not total facility visits. The schema must handle this — the indicator definition for LBW Iron % must reference LBW count as its denominator.

---

## File c-2/3: `2_3_Vitamin_A_supplementation_nir.xlsx`
**Tracks:** Vitamin A supplementation coverage for two age groups — 6-11 months and 12-59 months

### Sheet Structure
Q1–Q4 + Annual + **Population** + change_log
**Frequency: Quarterly + Annual only. No monthly tabs.**
**Rows per sheet:** 129
**Columns per sheet:** 15

### Population Sheet
Has a dedicated Population sheet with projected population for both age groups (6-11m and 12-59m). Population values are currently blank/NaN for all locations — data not yet populated.

### Two Age Groups — Two Projected Populations
This file uses **two separate projected population denominators** in the same sheet — one per age group. This is new compared to Immunization files which only had one population column per sheet.

### ⚠️ Template Formula Error Found — Col 11
The B. Percentage formula in col 11 is labeled **(j) = (g) / (h)**.

- (g) = col[8] = Infants 12-59m given VitA Male
- (h) = col[9] = Infants 12-59m given VitA Female

**This formula is wrong.** It divides Male count by Female count. The correct formula should be **(j) = (i) / (f)** where:
- (i) = col[10] = B. Total (sum of male + female)
- (f) = col[7] = Projected Population 12-59 months

This matches the exact same pattern as Group A's percentage formula (col[6] = col[5] / col[2]).

### Column Inventory

**Group A — Age 6-11 months**
| Col | Label | Type | Formula |
|---|---|---|---|
| 2 | Projected Population (6-11 months) | RAW | — |
| 3 | 6-11m given VitA Male | RAW | — |
| 4 | 6-11m given VitA Female | RAW | — |
| 5 | A. Total | COMPUTED | col[3] + col[4] |
| 6 | A. Percentage | COMPUTED | col[5] / col[2] |

**Group B — Age 12-59 months**
| Col | Label | Type | Formula | Note |
|---|---|---|---|---|
| 7 | Projected Population (12-59 months) | RAW | — | |
| 8 | 12-59m given VitA Male | RAW | — | |
| 9 | 12-59m given VitA Female | RAW | — | |
| 10 | B. Total | COMPUTED | col[8] + col[9] | |
| 11 | B. Percentage | COMPUTED | col[10] / col[7] | ⚠️ Template formula wrong — system uses correct formula |

**Admin**
| Col | Label | Type |
|---|---|---|
| 12 | Remarks | META |
| 13 | DQC Over 200% (A) | DQC |
| 14 | DQC Over 200% (B) | DQC |

### DQC Rules
- Groups A and B: flag if percentage exceeds 200% of projected population
- Note: threshold is 200% not 100% — same as Immunization files
- This makes sense: VitA supplementation can be given to children outside the projected count

### Raw Inputs to Store
1. Projected Population 6-11 months
2. 6-11m given VitA Male
3. 6-11m given VitA Female
4. Projected Population 12-59 months
5. 12-59m given VitA Male
6. 12-59m given VitA Female

**Total raw inputs: 6 per location per period**

---

## File c-4: `4_MNP_nir.xlsx`
**Tracks:** Micronutrient Powder (MNP) supplementation completion for two age groups

### Sheet Structure
Q1–Q4 + Annual + Population + change_log
**Frequency: Quarterly + Annual only. No monthly tabs.**
**Rows per sheet:** 129
**Columns per sheet:** 15

### Structure Assessment
**Structurally identical to File c-2/3** — same column count (15), same layout pattern, same two projected population columns. Only differences are vaccine name (MNP) and age groups.

### Age Groups
- Group A: **6-11 months**
- Group B: **12-23 months** ← different from VitA file which uses 12-59 months

### DQC Rules
Same as VitA supplementation: Over 200% for both groups

### Raw Inputs to Store
1. Projected Population 6-11 months
2. 6-11m completed MNP Male
3. 6-11m completed MNP Female
4. Projected Population 12-23 months
5. 12-23m completed MNP Male
6. 12-23m completed MNP Female

**Total raw inputs: 6 per location per period**

---

## File c-5: `5_LNS-SQ_nir.xlsx`
**Tracks:** Lipid-based Nutrient Supplement Small Quantity (LNS-SQ) supplementation completion

### Sheet Structure
Q1–Q4 + Annual + Population + change_log
**Frequency: Quarterly + Annual only. No monthly tabs.**
**Rows per sheet:** 129
**Columns per sheet:** 15

### Structure Assessment
**Structurally identical to File c-4 (MNP).** Same column count, same age groups (6-11m and 12-23m), same DQC rules. Only the supplement name differs (LNS-SQ vs MNP).

### Raw Inputs to Store
Same as File c-4: **6 per location per period**

---

## Updated Cross-Program Pattern Summary

| Pattern | Immunization (a) | Mgt of Sick (b) | Nutrition (c) |
|---|---|---|---|
| Has monthly tabs | Yes (5 of 6 files) | No | No |
| Has previous year columns | Yes (5 of 6 files) | No | No |
| Denominator types | Projected population | Seen (facility visits) | Projected pop + Live Births + LBW count |
| DQC threshold | 200% | 100% | 100% (Breastfeeding/LBW), 200% (VitA/MNP/LNS) |
| Age groups used | 0-11m | 6-11m, 12-59m, 0-59m | 6-11m, 12-23m, 12-59m |
| Multiple indicators per file | No | Yes (b-2) | Yes (c-1, c-2/3) |
| Template formula errors found | 1 (IPV col 26 label) | 2 (col 10 label, DQC labels) | 1 (VitA col 11 formula) |
| Population sheet present | Yes (some files) | No | Yes (VitA, MNP, LNS) |

---

## Denominator Registry — All Types Seen So Far

This is critical for schema design. We now have 4 distinct denominator types:

| ID | Type | Example | Source |
|---|---|---|---|
| D1 | Projected Population (age-specific) | Immunization, VitA supp, MNP, LNS | Population sheet or column in data sheet |
| D2 | Facility Seen (condition-specific) | Management of Sick | RAW input in same sheet |
| D3 | Live Births | Breastfeeding | RAW input in same sheet |
| D4 | Condition Count | LBW count for Iron % | RAW input in same sheet, also the indicator |

The schema must store all 4 types as raw inputs. The indicator config defines which denominator to use for percentage calculation.

---

## New Schema Flags From Nutrition Files

**FLAG c2-1 — Template formula errors cannot be trusted.**
The VitA supplementation file has a wrong percentage formula in the Excel template (divides male by female instead of total by population). This confirms the design rule established earlier: **the system always recalculates percentages from raw inputs using the config-defined formula, never trusting the Excel computed value.**

**FLAG c2-2 — Two population denominators in one sheet.**
Files c-2/3, c-4, and c-5 have two projected population columns in the same sheet (one per age group). The schema must link each indicator to its correct denominator. The config handles this — each indicator definition specifies which column is its denominator.

---

## All Open Questions — Updated

| ID | File | Question | Status |
|---|---|---|---|
| Q8-1 | Immunization File 8 | Is MMR 2 data current year or previous year? | ⏳ Pending |
| Q8-2 | Immunization File 8 | Is FIC data current year or previous year? | ⏳ Pending |
| Q8-3 | Immunization File 8 | Why do MMR2 and FIC use previous year population as denominator? | ⏳ Pending |
| Q-POP-1 | All | Is Population sheet the authoritative source or the column in each data sheet? | ⏳ Pending |
| Q-PREV-1 | All | When same previous year data appears in 12 monthly uploads, accept first and reject subsequent, or always overwrite? | ⏳ Pending |
| Q-c2-1 | Nutrition File c-2/3 | Col 11 formula is wrong in template (g/h instead of i/f) — confirm system uses correct formula | ✅ Confirmed — system recalculates, never trusts Excel formula |

---

*Document continues as more files are analyzed.*
*Next: Child Care > d. (folder 4 — name to be confirmed)*

---

## Program: Child Care > d. SBI (School-Based Immunization)

**Confirmed frequency: Annual only across all 3 files.**

**Important note from HPV change_log:** A change entry dated 2026-08-01 reads: *"Annual, Quarterly & Monthly sheets → Annual sheets (Deleted quarterly and monthly sheets) — Monthly to Annual templates."* This confirms the entire SBI folder was recently converted from monthly/quarterly reporting to annual-only reporting. This is a real example of the template evolution we planned for.

**Files in this group:**
| # | Filename | Indicator | Status |
|---|---|---|---|
| 9 | `9_G1_G7_Given_Td_nir.xlsx` | Grade 1 and Grade 7 given Td vaccine | ✅ Analyzed |
| 10 | `10_G1_G7_Given_MR_nir.xlsx` | Grade 1 and Grade 7 given MR vaccine | ✅ Analyzed |
| 11 | `11_HPV-_SBI_and_CBI_nir.xlsx` | HPV vaccination — SBI and CBI combined | ✅ Analyzed |

**Note:** File numbering continues from Immunization folder (9, 10, 11). This confirms all Child Care subfolders share one sequential numbering system across the whole program.

---

## File d-9: `9_G1_G7_Given_Td_nir.xlsx`
**Tracks:** Tetanus-diphtheria (Td) vaccination for Grade 1 and Grade 7 learners

### Sheet Structure
| Sheet | Type |
|---|---|
| Annual | Annual data |
| # of Enrolled | Reference — enrolled learner counts |
| change_log | Admin — not imported |

**Frequency: Annual only.**
**Rows per sheet:** 129
**Columns per sheet:** 15

### New Population Type — Enrolled Learners
This file introduces a fifth denominator type. All previous types used health population data. SBI uses **school enrollment counts** as the denominator. This is sourced from DepEd (Department of Education), not DOH population projections.

The `# of Enrolled` sheet is a reference sheet containing Grade 1 and Grade 7 enrolled counts per location — same structure as the Population sheet in Immunization files.

### Two Grade Groups in One File
- Group A: **Grade 1** learners
- Group B: **Grade 7** learners

### Column Inventory

**Group A — Grade 1**
| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC | META | — |
| 1 | PHIC / Location | META | — |
| 2 | Number of enrolled Grade 1 learners | RAW | — |
| 3 | Grade 1 given Td Male | RAW | — |
| 4 | Grade 1 given Td Female | RAW | — |
| 5 | A. Total | COMPUTED | col[3] + col[4] |
| 6 | A. Percentage | COMPUTED | col[5] / col[2] |

**Group B — Grade 7**
| Col | Label | Type | Formula |
|---|---|---|---|
| 7 | Number of enrolled Grade 7 learners | RAW | — |
| 8 | Grade 7 given Td Male | RAW | — |
| 9 | Grade 7 given Td Female | RAW | — |
| 10 | B. Total | COMPUTED | col[8] + col[9] |
| 11 | B. Percentage | COMPUTED | col[10] / col[7] |

**Admin**
| Col | Label | Type |
|---|---|---|
| 12 | Remarks | META |
| 13 | DQC Over 100% (A) | DQC — vaccinated cannot exceed enrolled |
| 14 | DQC Over 100% (B) | DQC — vaccinated cannot exceed enrolled |

### DQC Rules
- Both groups: flag if percentage exceeds 100%
- Logic: cannot vaccinate more learners than are enrolled

### Raw Inputs to Store
1. Enrolled Grade 1 count
2. Grade 1 given Td Male
3. Grade 1 given Td Female
4. Enrolled Grade 7 count
5. Grade 7 given Td Male
6. Grade 7 given Td Female

**Total raw inputs: 6 per location per period**

---

## File d-10: `10_G1_G7_Given_MR_nir.xlsx`
**Tracks:** Measles-Rubella (MR) vaccination for Grade 1 and Grade 7 learners

### Sheet Structure
Identical to File d-9: Annual + # of Enrolled + change_log
**Frequency: Annual only.**
**Rows per sheet:** 129
**Columns per sheet:** 15

### Structure Assessment
**Structurally identical to File d-9.** Same column count, same grade groups, same DQC rules. Only vaccine name differs (MR vs Td).

### Raw Inputs to Store
Same as File d-9: **6 per location per period**

---

## File d-11: `11_HPV-_SBI_and_CBI_nir.xlsx`
**Tracks:** HPV vaccination combining two delivery strategies — SBI (School-Based Immunization) and CBI (Community-Based Immunization)

### Sheet Structure
Annual + # of Enrolled + change_log
**Frequency: Annual only.**
**Rows per sheet:** 129
**Columns per sheet:** 12

### Most Complex File in SBI Folder
This file combines two delivery channels (SBI and CBI) into one template. It is also female-only — no male disaggregation because HPV targets Grade 4 females.

### No Sex Disaggregation
**First file with no male/female split.** All indicators are female-only. This is by design — HPV in the FHSIS program targets Grade 4 females (at least 9 years old).

### Three Indicator Groups
- Group A: HPV 1 via SBI (school-based)
- Group B: HPV 1 via CBI (community-based, counts only — no percentage)
- Group C: Combined HPV 1 (SBI + CBI) total and HPV 2 via CBI

### Column Inventory

**Group A — HPV 1 SBI**
| Col | Label | Type | Formula |
|---|---|---|---|
| 2 | Grade 4 female enrolled (public + private) | RAW | — |
| 3 | Grade 4 female (≥9 yrs) vaccinated HPV1 via SBI | RAW | — |
| 4 | A. Percentage | COMPUTED | col[3] / col[2] |

**Group B — HPV 1 CBI**
| Col | Label | Type | Note |
|---|---|---|---|
| 5 | 9-year-old females vaccinated HPV1 via CBI | RAW | Count only, no percentage |

**Group C — HPV 1 Combined + HPV 2 CBI**
| Col | Label | Type | Formula | Note |
|---|---|---|---|---|
| 6 | Total HPV1 (SBI + CBI) | COMPUTED | col[3] + col[5] | Combined total |
| 7 | Females vaccinated HPV2 via CBI | RAW | — | |
| 8 | C. Percentage | COMPUTED | col[7] / col[6] | HPV2 / total HPV1 |

**Admin**
| Col | Label | Type |
|---|---|---|
| 9 | Remarks | META |
| 10 | DQC Over 100% (A) | DQC — HPV1 SBI cannot exceed enrolled |
| 11 | DQC Over 100% (B) | DQC — HPV2 CBI cannot exceed total HPV1 recipients |

### DQC Rules
- Group A: HPV1 SBI vaccinated cannot exceed Grade 4 enrolled — flag if > 100%
- Group B (col 11): HPV2 CBI cannot exceed total HPV1 (SBI + CBI) — flag if > 100%
- Logic: cannot give HPV 2nd dose to someone who did not receive HPV 1st dose

### Raw Inputs to Store
1. Grade 4 female enrolled
2. HPV1 via SBI (Grade 4 female)
3. HPV1 via CBI (9-year-old female)
4. HPV2 via CBI

**Total raw inputs: 4 per location per period**

---

## Updated Cross-Program Pattern Summary — Child Care Complete

| Pattern | Immunization (a) | Mgt of Sick (b) | Nutrition (c) | SBI (d) |
|---|---|---|---|---|
| Frequency | Monthly+Qtrly+Annual | Quarterly+Annual | Quarterly+Annual | Annual only |
| Has monthly tabs | Yes (5 of 6 files) | No | No | No |
| Has previous year columns | Yes (5 of 6 files) | No | No | No |
| Sex disaggregation | Always Male+Female | Always Male+Female | Always Male+Female | Male+Female except HPV (Female only) |
| DQC threshold | 200% | 100% | 100% or 200% | 100% |
| Template recently changed | No | No | No | Yes — was monthly, now annual |

## Denominator Registry — Final for Child Care

| ID | Type | Files Using It |
|---|---|---|
| D1 | Projected Population (age-specific) | Immunization, VitA supp, MNP, LNS |
| D2 | Facility Seen (condition-specific) | Management of Sick |
| D3 | Live Births | Breastfeeding (Nutrition c-1) |
| D4 | Condition Count (e.g. LBW count) | LBW Iron (Nutrition c-1) |
| D5 | Enrolled Learner Count (DepEd) | SBI — Td, MR, HPV |

---

## Child Care Program — Complete File Inventory

| Folder | # | Filename | Frequency | Rows | Cols |
|---|---|---|---|---|---|
| a. Immunization | 1 | CPAB_BCG_HepaB1 | M+Q+A | 129 | 29 |
| a. Immunization | 4 | DPT-HiB-HepB123 | M+Q+A | 129 | 37 |
| a. Immunization | 5 | OPV123 | M+Q+A | 129 | 37 |
| a. Immunization | 6 | IPV12 | M+Q+A | 129 | 27 |
| a. Immunization | 7 | PCV123 | M+Q+A | 129 | 37 |
| a. Immunization | 8 | MMR12_FIC_CIC | M+Q+A | 129 | 33 |
| b. Mgt of Sick | 1 | Sick_VitaminA | Q+A | 129 | 19 |
| b. Mgt of Sick | 2_3 | Diarrhea_Pneumonia | Q+A | 129 | 27 |
| c. Nutrition | 1 | Breastfeeding_LBW | Q+A | 129 | 15 |
| c. Nutrition | 2_3 | VitA_supplementation | Q+A | 129 | 15 |
| c. Nutrition | 4 | MNP | Q+A | 129 | 15 |
| c. Nutrition | 5 | LNS-SQ | Q+A | 129 | 15 |
| d. SBI | 9 | G1_G7_Td | Annual | 129 | 15 |
| d. SBI | 10 | G1_G7_MR | Annual | 129 | 15 |
| d. SBI | 11 | HPV_SBI_CBI | Annual | 129 | 12 |

**Total files in Child Care: 15**
**Missing files confirmed: Files 2 and 3 in Immunization do not exist (typo in naming)**

---

## All Open Questions — Updated

| ID | File | Question | Status |
|---|---|---|---|
| Q8-1 | Immunization File 8 | Is MMR 2 data current year or previous year? | ⏳ Pending |
| Q8-2 | Immunization File 8 | Is FIC data current year or previous year? | ⏳ Pending |
| Q8-3 | Immunization File 8 | Why do MMR2 and FIC use previous year population as denominator? | ⏳ Pending |
| Q-POP-1 | All | Is Population sheet the authoritative source or the column in each data sheet? | ⏳ Pending |
| Q-PREV-1 | Immunization | When same previous year data appears in 12 monthly uploads, accept first or always overwrite? | ⏳ Pending |
| Q-c2-VitA | Nutrition c-2/3 | Population sheet is blank — who fills it in before upload? DOH central or your team? | ⏳ Pending |
| Q-SBI-1 | SBI all files | Enrolled learner counts come from DepEd. Who enters them into the # of Enrolled sheet — your team or DepEd? | ⏳ Pending |

---

*Child Care program analysis complete.*
*Next: Upload the next program when ready.*

---

## ANSWERS AND CLARIFICATIONS — Round 3

### Q-POP-1 Answered
**Decision:** The database will maintain a master population reference table. When a file is uploaded, the population values in the file are cross-checked against the master table. Mismatches are flagged as a validation warning — not a hard rejection, since population data may be legitimately updated mid-year. This applies to all projected population and enrolled learner counts.

**Schema impact:** Add a `reference_populations` table to the schema. Separate from `health_data`. Used for validation only.

### Q-SBI-1 Answered
Enrolled learner counts are entered by your team but data is not yet available. The system must accept uploads where enrolled counts are NULL — this is valid for now. Percentages cannot be calculated until enrollment data exists.

### Q-c2-VitA Answered
Your team fills in the Population sheet before uploading. The system cross-checks against the master population table in the database. Matches proceed. Mismatches are flagged.

---

### MMR Questions — Rephrased and Answered From File Inspection

After reading the column formulas directly, I no longer need your answers for Q8-1, Q8-2, Q8-3. The formulas in the file are definitive. Here is what they say:

**MMR 2 (cols 12-15):**
- The percentage formula is `(n) = (m) / (f)` where (f) = col[7] = **2025 previous year population**
- MMR 2 uses the **previous year population as denominator**
- No year label on the MMR 2 count columns — but the denominator reference (f) points to previous year
- **Conclusion:** MMR 2 is treated as a previous year indicator in this template

**FIC (cols 16-19):**
- The percentage formula is `(r) = (q) / (f)` where (f) = col[7] = **2025 previous year population**
- FIC also uses **previous year population as denominator**
- **Conclusion:** FIC is also treated as a previous year indicator

**CIC (cols 21-24):**
- The denominator is col[20] = **2025 previous year population MINUS previous year FIC count**
- This is the remaining children not yet fully immunized — the pool eligible to become completely immunized
- **Conclusion:** CIC is a previous year indicator with a complex denominator

**Why previous year population for MMR2, FIC, CIC?**
The formula tells us: these indicators measure children who should have completed their full vaccination schedule. A child born in 2025 completes their schedule in 2026. So the 2025 birth cohort (previous year population) is the correct denominator for measuring 2026 completion rates. This is standard immunization coverage methodology.

**Q8 Questions are now closed — no input needed from user.**

**Updated MMR Column Inventory (corrected):**

| Col | Label | Type | Year | Denominator |
|---|---|---|---|---|
| 2 | 2026 Projected Population | RAW | Current | — |
| 3 | MMR 1 Male | RAW | Current | — |
| 4 | MMR 1 Female | RAW | Current | — |
| 5 | A. Total | COMPUTED | Current | — |
| 6 | A. Percentage | COMPUTED | Current | 2026 pop (col 2) |
| 7 | 2025 Projected Population | RAW | Previous | — |
| 8 | MMR 1 Male | RAW | Previous | — |
| 9 | MMR 1 Female | RAW | Previous | — |
| 10 | B. Total | COMPUTED | Previous | — |
| 11 | B. Percentage | COMPUTED | Previous | 2025 pop (col 7) |
| 12 | MMR 2 Male | RAW | Previous | — |
| 13 | MMR 2 Female | RAW | Previous | — |
| 14 | C. Total | COMPUTED | Previous | — |
| 15 | C. Percentage | COMPUTED | Previous | 2025 pop (col 7) |
| 16 | FIC Male | RAW | Previous | — |
| 17 | FIC Female | RAW | Previous | — |
| 18 | D. Total | COMPUTED | Previous | — |
| 19 | D. Percentage | COMPUTED | Previous | 2025 pop (col 7) |
| 20 | 2025 pop minus FIC (prev year) | COMPUTED | Previous | Special denominator for CIC |
| 21 | CIC Male | RAW | Previous | — |
| 22 | CIC Female | RAW | Previous | — |
| 23 | E. Total | COMPUTED | Previous | — |
| 24 | E. Percentage | COMPUTED | Previous | col[20] |

**Raw inputs to store — MMR file (corrected):**
1. 2026 Population (current year)
2. MMR 1 Male — current year
3. MMR 1 Female — current year
4. 2025 Population (previous year)
5. MMR 1 Male — previous year
6. MMR 1 Female — previous year
7. MMR 2 Male — previous year
8. MMR 2 Female — previous year
9. FIC Male — previous year
10. FIC Female — previous year
11. CIC Male — previous year
12. CIC Female — previous year

**Total raw inputs: 12 per location per period**
All Q8 questions closed.

---

## All Open Questions — Current Status

| ID | Question | Status |
|---|---|---|
| Q8-1/2/3 | MMR year and denominator questions | ✅ Resolved from file formulas |
| Q-POP-1 | Population sheet vs column — which is authoritative? | ✅ Master table in DB, file values cross-checked |
| Q-SBI-1 | Who fills enrolled learner counts? | ✅ Your team — data pending |
| Q-c2-VitA | Who fills population sheet? | ✅ Your team — cross-checked against DB |
| Q-PREV-1 | Duplicate previous year data across 12 monthly uploads | ⏳ Still pending |

**Only one open question remains. Q-PREV-1:**
When a user uploads July 2026 data, the file also contains July 2025 previous year data. Then when they upload August 2026 data, it contains August 2025 previous year data — which was already submitted last year. Do we **accept first upload and reject duplicates**, or **always overwrite** with the latest upload?


---

## Q-PREV-1 Answered
**Decision: Option C — Flag for review.**

When incoming data matches an existing record (same indicator + location + period), the system:
1. Holds the incoming value in the staging table
2. Shows a side-by-side comparison — existing value vs incoming value
3. An authorized user (Admin or Data Encoder with edit rights) decides: keep original or overwrite
4. Decision is recorded in the audit log — who decided, when, what changed

**Schema impact:** Staging table needs a `conflict_status` column:
- `none` — no conflict, proceed normally
- `pending_review` — duplicate detected, waiting for decision
- `accepted` — user chose to overwrite
- `rejected` — user chose to keep original

All open questions are now resolved. Schema design can proceed.

---

## Program: Demographics
**No subfolders. Single file.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `Demographics_nir.xlsx` | Barangay/Health Facility counts + Health Worker counts | ✅ Analyzed |

---

## File: `Demographics_nir.xlsx`

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| BGY & BHS | Annual data | Barangay and health facility counts |
| Health Workers | Annual data | Health worker counts by profession and hiring type |
| change_log | Admin | Not imported |

**Frequency: Annual only.**
**Rows per sheet:** 129 (same geographic structure as all other files)
**No quarterly or monthly tabs.**
**No previous year columns.**
**No DQC flags in either sheet.**

---

## Sheet 1: BGY & BHS
**Tracks:** Count and population ratio of barangays and health facilities per location

### New Indicator Type — Ratio (not percentage)
All previous files used percentages (value / denominator × 100). This sheet uses **population ratios** — population per facility or per barangay. This is a different computation type.

Example: Ratio of Barangays = Projected Population / Number of Barangays

### Column Inventory

| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region, Province/City | META | — |
| 2 | Projected Population 2026 | RAW | — |
| 3 | A. Barangay (Number) | RAW | — |
| 4 | A. Barangay (Ratio) | COMPUTED | col[2] / col[3] |
| 5 | B. Municipal Health Centers (Number) | RAW | — |
| 6 | B. Municipal Health Centers (Ratio) | COMPUTED | col[2] / col[5] |
| 7 | B. City Health Centers (Number) | RAW | — |
| 8 | B. City Health Centers (Ratio) | COMPUTED | col[2] / col[7] |
| 9 | B. Rural Health Units (Number) | RAW | — |
| 10 | B. Rural Health Units (Ratio) | COMPUTED | col[2] / col[9] |
| 11 | B. TOTAL Health Centers (Number) | COMPUTED | col[5]+col[7]+col[9] |
| 12 | B. TOTAL Health Centers (Ratio) | COMPUTED | col[2] / col[11] |
| 13 | C. Barangay Health Stations (Number) | RAW | — |
| 14 | C. Barangay Health Stations (Ratio) | COMPUTED | col[2] / col[13] |

### DQC Rules
None. No DQC columns in this sheet.

### Raw Inputs to Store
1. Projected Population 2026
2. Number of Barangays
3. Number of Municipal Health Centers
4. Number of City Health Centers
5. Number of Rural Health Units
6. Number of Barangay Health Stations

**Total raw inputs: 6 per location per period**

---

## Sheet 2: Health Workers
**Tracks:** Health worker counts by profession, broken down by hiring type (LGU vs DOH) with population ratio

### New Disaggregation Type — Hiring Source
Previous files disaggregated by sex (Male/Female) or age group. This sheet disaggregates by **hiring source**: LGU Hired vs DOH Hired. No sex disaggregation.

### New Denominator — Households (not population)
BHW (Barangay Health Worker) ratio uses **2025 Projected Number of Households** as denominator — not projected population. This is a sixth denominator type.

### Two Denominator Types in One Sheet
- Cols 3–34: Use Projected Population (col 2) as denominator for ratios
- Cols 36–39: Use 2025 Projected Households (col 35) as denominator for BHW ratio

### Column Inventory

**Health Professions (same 4-column pattern per profession: LGU Hired / DOH Hired / Total / Ratio)**

| Profession | LGU Col | DOH Col | Total Col | Ratio Col |
|---|---|---|---|---|
| A. Doctors | 3 | 4 | 5 | 6 |
| B. Nurses | 7 | 8 | 9 | 10 |
| C. Midwives | 11 | 12 | 13 | 14 |
| D. Dentists | 15 | 16 | 17 | 18 |
| E. Medical Technologists | 19 | 20 | 21 | 22 |
| F. Nutritionists | 23 | 24 | 25 | 26 |
| G. Sanitary Engineers | 27 | 28 | 29 | 30 |
| H. Sanitary Inspectors | 31 | 32 | 33 | 34 |

**For each profession:**
- LGU Hired = RAW
- DOH Hired = RAW
- Total = COMPUTED (LGU + DOH)
- Ratio = COMPUTED (Population / Total)

**Barangay Health Workers (different denominator)**

| Col | Label | Type | Formula |
|---|---|---|---|
| 35 | 2025 Projected Households | RAW | — |
| 36 | BHW (LGU Hired) | RAW | — |
| 37 | BHW (DOH Hired) | RAW | — |
| 38 | BHW Total | COMPUTED | col[36] + col[37] |
| 39 | BHW Ratio | COMPUTED | col[35] / col[38] |
| 40 | Remarks | META | — |

### DQC Rules
None. No DQC columns in this sheet.

### Raw Inputs to Store (Health Workers sheet)
Per profession (8 professions × 2 hiring types = 16 values):
1–16. LGU Hired and DOH Hired counts for each of the 8 professions

Plus BHW:
17. 2025 Projected Households
18. BHW LGU Hired
19. BHW DOH Hired

**Total raw inputs: 19 per location per period**

---

## Key Findings — Demographics File

### What Is New
1. **Ratio computation** — population divided by facility/worker count. Different from percentage (count / population). The config must distinguish between ratio and percentage formula types.
2. **Hiring source disaggregation** — LGU vs DOH instead of Male vs Female. The schema handles this the same way — two raw inputs per indicator — but the config labels them differently.
3. **Household denominator** — sixth denominator type seen so far. Only used for BHW ratio.
4. **Two sheets = two independent data groups in one file.** BGY & BHS and Health Workers are entirely separate indicators sharing one file. Parser must handle both sheets independently.
5. **No DQC rules in either sheet.** First file group with no validation flags at all.

### Updated Denominator Registry

| ID | Type | Files Using It |
|---|---|---|
| D1 | Projected Population (age-specific) | Immunization, VitA, MNP, LNS, Demographics |
| D2 | Facility Seen (condition-specific) | Management of Sick |
| D3 | Live Births | Breastfeeding |
| D4 | Condition Count (e.g. LBW) | LBW Iron supplementation |
| D5 | Enrolled Learner Count (DepEd) | SBI — Td, MR, HPV |
| D6 | Projected Households | BHW ratio in Demographics |

### Schema Flag — Demographics
**FLAG dem-1 — Ratio vs Percentage formula type.**
The indicator config must include a `formula_type` field:
- `percentage` = (count / denominator) × 100
- `ratio` = denominator / count (inverted — population per unit)
- `sum` = simple addition of two raw inputs

This flag does not require a schema table change. It is an addition to the `indicators` table config — one new column called `formula_type`.

---

*Document continues.*
*Next program to be confirmed by user.*

---

## Program: Environmental Health and Sanitation
**No subfolders. 2 files.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `envi_water_nir.xlsx` | Basic Safe Water Supply + Safely Managed Drinking Water | ✅ Analyzed |
| 2 | `envi_sanitation_zod_nir.xlsx` | Basic Sanitation Facility + ZOD municipalities | ✅ Analyzed |

---

## File env-1: `envi_water_nir.xlsx`
**Tracks:** Household access to safe water supply by level + safely managed drinking water

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Qtr1–Qtr4 | Quarterly | 4 data sheets |
| Household | Reference | Empty — no data yet |
| changelog | Admin | Not imported |

**Frequency: Quarterly only. No monthly, no annual sheet.**
**Rows per sheet:** 129
**Columns per sheet:** 13
**No previous year data.**
**No DQC columns.**

### New Denominator Type — Projected Households (Quarterly)
This file uses **Projected Number of Households** as its denominator — same type as BHW ratio in Demographics (D6), but here it is used for percentage not ratio. Confirms D6 applies to both programs.

### Column Inventory

| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC | META | — |
| 1 | Region/PHIC | META | — |
| 2 | Projected Number of Households | RAW | — |
| 3 | BSWS Level I (Number) | RAW | — |
| 4 | BSWS Level I (%) | COMPUTED | col[3] / col[2] |
| 5 | BSWS Level II (Number) | RAW | — |
| 6 | BSWS Level II (%) | COMPUTED | col[5] / col[2] |
| 7 | BSWS Level III (Number) | RAW | — |
| 8 | BSWS Level III (%) | COMPUTED | col[7] / col[2] |
| 9 | BSWS Total (Number) | COMPUTED | col[3]+col[5]+col[7] |
| 10 | BSWS Total (%) | COMPUTED | col[9] / col[2] |
| 11 | Safely Managed Drinking Water (Number) | RAW | — |
| 12 | Safely Managed Drinking Water (%) | COMPUTED | col[11] / col[2] |

### DQC Rules
None. No DQC columns.

### Empty Household Sheet
The `Household` sheet exists but has zero rows and zero columns. It is a placeholder — either for future use or leftover from a template revision. We ignore it for now.

### Raw Inputs to Store
1. Projected Number of Households
2. BSWS Level I count
3. BSWS Level II count
4. BSWS Level III count
5. Safely Managed Drinking Water count

**Total raw inputs: 5 per location per period**

---

## File env-2: `envi_sanitation_zod_nir.xlsx`
**Tracks:** Basic Sanitation Facility by type + Safely Managed Sanitation + ZOD (Zero Open Defecation) municipality status

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Qtr1 | Quarterly | 129 rows, 16 columns |
| Qtr2 | Quarterly | 129 rows, 16 columns |
| Qtr3 | Quarterly | 68 rows, **17 columns** ⚠️ |
| Qtr4 | Quarterly | 68 rows, **17 columns** ⚠️ |
| Household | Reference | Empty — no data |

**Frequency: Quarterly only. No monthly, no annual.**
**No previous year data.**
**No DQC columns.**

### ⚠️ Critical Template Inconsistency Found
**Qtr1 and Qtr2 have a different structure from Qtr3 and Qtr4.**

| | Qtr1 & Qtr2 | Qtr3 & Qtr4 |
|---|---|---|
| Rows | 129 | 68 |
| Columns | 16 | 17 |
| Col 0 | PSGC | Extra region column labeled "Delete this column after you remove the other region" |
| Col 1 | Location name | PSGC |
| Col 2+ | Data starts | Location name |
| Data starts | Col 2 | Col 3 |

Qtr3 and Qtr4 have an **extra column at position 0** with a note saying it should be deleted. The column header literally says: *"region (Delete this column after you remove the other region)"*. This means someone edited Qtr3 and Qtr4 but forgot to clean up a leftover column. The row count also dropped from 129 to 68 — barangay rows are missing in Qtr3 and Qtr4.

**This is the most significant template error found so far.** The same file has structurally different sheets.

### New Indicator Type — ZOD (Zero Open Defecation)
Columns 13–15 track municipality-level ZOD status. This is a **count of administrative units** not a count of households or people. It is also the first indicator where the denominator is another administrative count — total municipalities — not population or households.

**ZOD formula:** ZOD municipalities / total municipalities per province = ZOD percentage

This is a new denominator type: **Administrative Unit Count (municipalities).**

### Column Inventory (Qtr1 and Qtr2 — 16 columns)

| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC | META | — |
| 1 | Region/PHIC | META | — |
| 2 | Projected Number of Households | RAW | — |
| 3 | BSF Septic Tank (Number) | RAW | — |
| 4 | BSF Septic Tank (%) | COMPUTED | col[3] / col[2] |
| 5 | BSF Community Sewer (Number) | RAW | — |
| 6 | BSF Community Sewer (%) | COMPUTED | col[5] / col[2] |
| 7 | BSF VIP (Number) | RAW | — |
| 8 | BSF VIP (%) | COMPUTED | col[7] / col[2] |
| 9 | BSF Total (Number) | COMPUTED | col[3]+col[5]+col[7] |
| 10 | BSF Total (%) | COMPUTED | col[9] / col[2] |
| 11 | Safely Managed Sanitation (Number) | RAW | — |
| 12 | Safely Managed Sanitation (%) | COMPUTED | col[11] / col[2] |
| 13 | Total Municipalities/Cities per Province | RAW | — |
| 14 | Municipalities with ≥95% BSF | RAW | — |
| 15 | ZOD Municipalities | RAW | — |

**Note:** Col 15 label says "(%) (n) m/l" but the column stores a COUNT not a percentage. The percentage is computed as col[15] / col[14]. This is another label error in the template.

**Column Inventory (Qtr3 and Qtr4 — 17 columns):**
Same as above but all column indices shift right by 1 due to the extra region column at position 0. Parser must detect the sheet version and adjust column mapping accordingly.

### DQC Rules
None. No DQC columns.

### Raw Inputs to Store
1. Projected Number of Households
2. BSF Septic Tank count
3. BSF Community Sewer count
4. BSF VIP count
5. Safely Managed Sanitation count
6. Total Municipalities/Cities per Province
7. Municipalities with ≥95% BSF
8. ZOD Municipalities count

**Total raw inputs: 8 per location per period**

---

## Key Findings — Environmental Health

### What Is New

**1. Quarterly-only with no Annual sheet.**
First program where quarterly data exists but no annual rollup sheet. The system must handle this — annual totals for Environmental Health will need to be computed by the dashboard, not ingested from a file.

**2. Structurally inconsistent sheets within one file.**
Qtr3 and Qtr4 in the Sanitation file have a different column structure from Qtr1 and Qtr2 — an extra leftover column and fewer rows. This is the most dangerous template error we have found because it is not just a label mistake — it changes the column index mapping. The parser config must handle per-sheet column mapping, not assume all sheets in a file are identical.

**3. ZOD — new indicator type tracking administrative units.**
Not households, not people, not learners — municipalities. Seventh denominator type confirmed.

**4. Empty Household reference sheets in both files.**
Both files have a Household sheet with no data. These are placeholders. We skip them.

### Updated Denominator Registry

| ID | Type | Files Using It |
|---|---|---|
| D1 | Projected Population (age-specific) | Immunization, VitA, MNP, LNS, Demographics BGY sheet |
| D2 | Facility Seen (condition-specific) | Management of Sick |
| D3 | Live Births | Breastfeeding |
| D4 | Condition Count (e.g. LBW) | LBW Iron |
| D5 | Enrolled Learner Count (DepEd) | SBI |
| D6 | Projected Households | Demographics BHW, Environmental Health Water and Sanitation |
| D7 | Administrative Unit Count (municipalities) | ZOD in Environmental Sanitation |

### Schema Flag — Environmental Health
**FLAG env-1 — Per-sheet column mapping required.**
The parser config must support defining column positions **per sheet**, not just per file. Qtr1/Qtr2 and Qtr3/Qtr4 in the Sanitation file have different column layouts. The config must map each sheet independently.

**FLAG env-2 — No annual sheet means dashboard must aggregate.**
Quarterly data in Environmental Health has no annual rollup file. The dashboard must compute annual summaries from the 4 quarterly entries. This is a new dashboard computation requirement.

**FLAG env-3 — ZOD percentage label error.**
Col 15 in Sanitation is labeled as a percentage but stores a count. Confirmed label error. Parser uses column position and config definition — not the label.

---

## All Open Questions — Current Status
All previous questions resolved. No new open questions from Environmental Health.
The structural inconsistency in Sanitation Qtr3/Qtr4 is a known template error — handled by per-sheet config mapping.

---

*Document continues.*
*Next program to be confirmed by user.*

---

## ACTION ITEMS FOR YOUR TEAM

| # | File | Action Required | Priority |
|---|---|---|---|
| 1 | `envi_sanitation_zod_nir.xlsx` | Fix Qtr3 and Qtr4 — delete extra region column at position 0, restore 129 rows to match Qtr1 and Qtr2 structure | High — before data entry |
| 2 | `2_3_Diarrhea_and_Penumonia_received_treatment_nir.xlsx` | Col 10 label corrected to Female — confirm correction saved | Done |
| 3 | `2_3_Vitamin_A_supplementation_nir.xlsx` | Col 11 formula wrong in template (g/h instead of i/f) — system will use correct formula but template should be fixed for manual users | Medium |


---

## Program: Geriatric Health
**No subfolders. 2 files.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `ncd_scimmunization_nir.xlsx` | Senior Citizen PPV and Influenza vaccination | ✅ Analyzed |
| 2 | `ncd_geriatric_nir.xlsx` | Geriatric screening tool results + care plan | ✅ Analyzed |

---

## File ger-1: `ncd_scimmunization_nir.xlsx`
**Tracks:** Senior Citizens vaccinated with PPV and Influenza vaccine

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Annual | Annual data | Only data sheet |
| Population | Reference | Empty — no data |
| changelog | Admin | Not imported |

**Frequency: Annual only.**
**Rows: 129 | Columns: 12**
**No previous year data. No DQC columns.**

### New Denominator Type — Seen at Facility (current year, specific population)
This file has two different denominators in the same sheet:
- Col 2: SCs seen who have NOT received PPV previously → denominator for PPV percentage
- Col 7: SCs seen at facility within current year → denominator for Influenza percentage

Both are facility visit counts but they track different sub-populations of senior citizens. This is a variation of D2 (Facility Seen) but scoped to a specific eligibility condition.

### Column Inventory

**Group 1 — PPV Vaccination**
| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region, Province/City | META | — |
| 2 | SC seen NOT previously vaccinated with PPV | RAW | Denominator for PPV % |
| 3 | SC given PPV Male | RAW | — |
| 4 | SC given PPV Female | RAW | — |
| 5 | PPV Total | COMPUTED | col[3] + col[4] |
| 6 | PPV Percentage | COMPUTED | col[5] / col[2] |

**Group 2 — Influenza Vaccination**
| Col | Label | Type | Formula |
|---|---|---|---|
| 7 | SC seen at facility current year | RAW | Denominator for Influenza % |
| 8 | SC given Influenza Male | RAW | — |
| 9 | SC given Influenza Female | RAW | — |
| 10 | Influenza Total | COMPUTED | col[8] + col[9] |
| 11 | Influenza Percentage | COMPUTED | col[10] / col[7] |

### DQC Rules
None. No DQC columns.

### Raw Inputs to Store
1. SC seen not previously vaccinated with PPV
2. SC given PPV Male
3. SC given PPV Female
4. SC seen at facility current year
5. SC given Influenza Male
6. SC given Influenza Female

**Total raw inputs: 6 per location per period**

---

## File ger-2: `ncd_geriatric_nir.xlsx`
**Tracks:** Geriatric screening results across 8 health domains + care plan provision

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Qtr1–Qtr4 | Quarterly | 4 data sheets, identical structure |
| Annual | Annual | Same structure as quarterly |
| Population | Reference | Empty |
| changelog | Admin | Not imported |

**Frequency: Quarterly + Annual.**
**Rows: 129 | Columns: 51 — largest file seen so far.**
**All 4 quarterly sheets and Annual sheet are structurally identical. ✅**
**No previous year data. No DQC columns.**

### New Denominator Chaining — Most Complex Formula Pattern Yet
This file introduces **chained denominators** — where the output of one indicator group becomes the denominator for the next group.

The chain works like this:
- SC Population (col 2) → denominator for Group 1 (Screened %)
- Group 1 Total — SCs Screened (col 5) → denominator for Group 2 (Positive Screening %)
- Group 2 Total — At least 1 Positive (col 45) → denominator for Group 3 (Care Plan %)

This means the percentage of Group 2 and Group 3 depends on raw inputs from earlier groups — not a static population column.

### 8 Screening Domains in Group 2
All 8 domains follow the same 3-column pattern: Male / Female / Total / Percentage.
All use the same denominator: SCs Screened Total (col 5).

| Domain | Male Col | Female Col | Total Col | % Col |
|---|---|---|---|---|
| Memory | 7 | 8 | 9 | 10 |
| Depression | 11 | 12 | 13 | 14 |
| Polypharmacy | 15 | 16 | 17 | 18 |
| Urinary Incontinence | 19 | 20 | 21 | 22 |
| Functional Capacity | 23 | 24 | 25 | 26 |
| Malnutrition | 27 | 28 | 29 | 30 |
| Hearing | 31 | 32 | 33 | 34 |
| Vision | 35 | 36 | 37 | 38 |
| Fall Risk | 39 | 40 | 41 | 42 |

### Full Column Inventory

**Group 1 — Screened**
| Col | Label | Type | Formula |
|---|---|---|---|
| 2 | Projected SC Population | RAW | Denominator for Group 1 |
| 3 | Screened Male | RAW | — |
| 4 | Screened Female | RAW | — |
| 5 | Screened Total | COMPUTED | col[3] + col[4] |
| 6 | Screened % | COMPUTED | col[5] / col[2] |

**Group 2 — Positive Screening (8 domains × 4 cols = cols 7–42)**
All percentages use col[5] (Screened Total) as denominator.

**Group 2 Summary — At Least 1 Positive**
| Col | Label | Type | Formula |
|---|---|---|---|
| 43 | At least 1 Positive Male | RAW | — |
| 44 | At least 1 Positive Female | RAW | — |
| 45 | At least 1 Positive Total | COMPUTED | col[43] + col[44] |
| 46 | At least 1 Positive % | COMPUTED | col[45] / col[5] |

**Group 3 — Care Plan or Referred**
| Col | Label | Type | Formula |
|---|---|---|---|
| 47 | Care Plan Male | RAW | — |
| 48 | Care Plan Female | RAW | — |
| 49 | Care Plan Total | COMPUTED | col[47] + col[48] |
| 50 | Care Plan % | COMPUTED | col[49] / col[45] ← denominator is Group 2 Total |

### DQC Rules
None. No DQC columns.

### Raw Inputs to Store
**Group 1:** SC Population + Screened Male + Screened Female = 3
**Group 2 (8 domains × 2 sex):** 16
**Group 2 Summary:** At least 1 Positive Male + Female = 2
**Group 3:** Care Plan Male + Female = 2

**Total raw inputs: 23 per location per period** ← highest so far

---

## Key Findings — Geriatric Health

### What Is New

**1. Chained denominators.**
Group 3 percentage uses Group 2 total as its denominator. Group 2 percentage uses Group 1 total as its denominator. The system must compute these in the correct sequence — Group 1 first, then Group 2, then Group 3. If computed out of order, percentages will be wrong.

**Schema impact:** The indicator config must support a `denominator_source` field that can reference either a static column or a computed indicator code. Example:
- Group 1 %: `denominator_source = "SC_POPULATION"` (static column)
- Group 2 %: `denominator_source = "GER_SCREENED_TOTAL"` (computed from Group 1)
- Group 3 %: `denominator_source = "GER_POSITIVE_TOTAL"` (computed from Group 2)

**2. Largest file so far — 51 columns.**
Still within our schema design. The narrow table handles 51 columns the same as 12. But this confirms the config-driven approach is essential — hardcoding 51 columns would be unmaintainable.

**3. Two different seen-at-facility denominators in one file (SC Immunization).**
Both track senior citizen facility visits but for different eligibility conditions. The config handles this by assigning each indicator its own denominator column reference.

**4. All quarterly sheets and Annual are structurally identical.**
Cleanest file structure seen so far. No per-sheet inconsistencies.

---

## Updated Program Summary

| Program | Files | Frequency | Columns (max) | New Patterns |
|---|---|---|---|---|
| Child Care — Immunization | 6 | M+Q+A | 37 | Previous year, 200% DQC |
| Child Care — Mgt of Sick | 2 | Q+A | 27 | Facility seen denominator |
| Child Care — Nutrition | 4 | Q+A | 15 | Live births, LBW denominators |
| Child Care — SBI | 3 | Annual | 15 | Enrolled learner, female-only |
| Demographics | 1 | Annual | 41 | Ratio formula, hiring source |
| Environmental Health | 2 | Q only | 16 | No annual, ZOD admin unit |
| Geriatric Health | 2 | Q+A / Annual | 51 | Chained denominators |

---

*Document continues.*
*Next program to be confirmed by user.*

---

## Program: Morbidity
**No subfolders. 1 file.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `NIR_Morbidity.xlsx` | Disease case counts by age group, sex, and ICD code | ✅ Analyzed |

---

## File mor-1: `NIR_Morbidity.xlsx`
**Tracks:** All reported disease cases across 325 diseases in 19 ICD categories

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Jan–Dec | Monthly | 12 monthly sheets |
| Q1–Q4 | Quarterly | 4 quarterly sheets |
| Annual | Annual | 1 annual sheet |
| Population | Reference | Only 6 rows — region and provinces only, mostly empty |
| change_log | Admin | Not imported |

**Frequency: Monthly + Quarterly + Annual**
**Total data sheets: 17 (same as Immunization files)**
**All 17 sheets are structurally identical ✅**

---

### ⚠️ This File Is Fundamentally Different From All Previous Files

Every file analyzed so far has this structure:
- Rows = locations (PSGC codes, municipalities)
- Columns = indicators (vaccine counts, screening results, etc.)

**Morbidity is the opposite:**
- Rows = diseases (325 unique diseases across 19 ICD categories)
- Columns = age groups + sex disaggregation + totals + rate

This is called a **disease-disease matrix** or **vertical disease list**. The geographic dimension is handled differently — each location submits its own version of this same file. The NIR file shown is the regional rollup.

---

### Row Structure

**1,631 total rows per sheet.** This breaks down as:

- 1 header row
- For each of the 5 locations (NIR, Negros Occidental, Negros Oriental, Siquijor, City of Bacolod):
  - 1 blank separator row
  - 19 ICD category subtotal rows
  - ~325 individual disease rows

**The row hierarchy:**
```
Location (NIR / Province / HUC)
  └── ICD Category (e.g. "Certain Infectious and Parasitic Diseases")
        └── Individual Disease (e.g. "Cholera", "Typhoid", etc.)
```

**Col 0 (Region):** Always "BARMM" — appears to be a leftover label from a national template. Likely should be "NIR" or the actual region code.

**Col 1 (Region/Province/HUC/ICC):** The actual location name — NIR, Negros Occidental, etc.

**Col 2 (Category):** ICD chapter name. Blank for individual disease rows under a category.

**Col 3 (Disease):** Disease name. Can be the same as Category for category subtotal rows.

**Col 4 (ICD-Code):** ICD-10 code or range (e.g. A00, A00-B99, A09.0).

---

### Column Inventory (same across all 17 sheets)

**Meta columns:**
| Col | Label | Type |
|---|---|---|
| 0 | Region | META — always "BARMM", likely template artifact |
| 1 | Region/Province/HUC/ICC | META — actual location |
| 2 | Category | META — ICD chapter |
| 3 | Disease/s | META — disease name |
| 4 | ICD-Code/s | META — ICD-10 code |

**Age group columns (16 age groups × 3 sex columns = 48 columns):**

| Age Group | Male Col | Female Col | Total Col |
|---|---|---|---|
| 0-6 days | 5 | 6 | 7 |
| 7-28 days | 8 | 9 | 10 |
| 29 days to 11 months | 11 | 12 | 13 |
| 1-4 years | 14 | 15 | 16 |
| 5-9 years | 17 | 18 | 19 |
| 10-14 years | 20 | 21 | 22 |
| 15-19 years | 23 | 24 | 25 |
| 20-24 years | 26 | 27 | 28 |
| 25-29 years | 29 | 30 | 31 |
| 30-34 years | 32 | 33 | 34 |
| 35-39 years | 35 | 36 | 37 |
| 40-44 years | 38 | 39 | 40 |
| 45-49 years | 41 | 42 | 43 |
| 50-54 years | 44 | 45 | 46 |
| 55-59 years | 47 | 48 | 49 |
| 60 years and above | 50 | 51 | 52 |

**Summary columns:**
| Col | Label | Type | Formula |
|---|---|---|---|
| 53 | Grand Total Male | COMPUTED | Sum of all male age groups |
| 54 | Grand Total Female | COMPUTED | Sum of all female age groups |
| 55 | Grand Total Both Sexes | COMPUTED | col[53] + col[54] |
| 56 | Rate per 100,000 Population | COMPUTED | (col[55] / population) × 100,000 |

**Total columns: 57**

---

### Raw Inputs to Store

For each disease × location × period combination:
- 16 age groups × 2 sexes (Male + Female) = **32 raw inputs**

Totals and rates are computed by the system. Grand totals = sum of age-group columns. Rate = grand total / population × 100,000.

**Total raw inputs per disease per location per period: 32**

---

### Scale Calculation

This is by far the largest data volume in the system:

```
325 diseases
× 5 locations (NIR + 3 provinces + 1 HUC)
× 17 periods (12 monthly + 4 quarterly + 1 annual)
× 32 raw inputs per row
= 886,000 data points per year
```

For context, all immunization files combined produce roughly 50,000 data points per year.

---

### Population Sheet Finding

The Population sheet has only 6 rows — NIR and 4 sub-regions. Most values are blank or zero. This is the denominator for the Rate per 100,000 column. The rate cannot be computed until population is filled in.

**Col 0 finding:** The "Region" column always shows "BARMM" which is the Bangsamoro Autonomous Region — not NIR (Negros Island Region). This is a national template artifact. The column is ignored for our purposes — location is determined by col 1.

---

### DQC Rules
None visible in the file structure. No DQC flag columns.

However, logical validation rules apply:
- Individual disease row totals should not exceed ICD category subtotal
- Grand total should equal sum of all age group totals
- Rate should be consistent with population

---

### Schema Impact — Morbidity Requires Special Handling

The narrow table design handles this file BUT with one important difference from all other files.

In all previous files, the indicator (what is being measured) is fixed — e.g. "BCG vaccination Male." In Morbidity, the indicator is **the disease itself** — e.g. "Cholera, Male, Age 5-9."

This means the `indicators` table needs entries for every disease × age group × sex combination. That is 325 × 16 × 2 = **10,400 indicator records** just for Morbidity.

**Two options:**

**Option A — Store disease as an indicator code.**
Each disease-age-sex combination gets its own indicator code in the `indicators` table. Follows the same pattern as all other files. Simple but creates 10,400 rows in the indicators table.

**Option B — Add a `diseases` reference table.**
Create a separate `diseases` table with ICD codes and names. The `health_data` table gets a `disease_id` foreign key. Age group and sex become columns in `health_data` instead of separate indicators.

Option B is cleaner for Morbidity but breaks the uniform design we have used everywhere else. Option A keeps everything consistent but the `indicators` table becomes very large.

**My recommendation: Option A.** 10,400 rows in a reference table is not a problem for PostgreSQL. Consistency across all programs is more valuable than a special case for Morbidity. The config-driven parser handles this by auto-generating indicator codes from disease name + age group + sex.

---

## Open Questions — Morbidity

| ID | Question |
|---|---|
| Q-mor-1 | Col 0 always shows "BARMM" — is this a known template artifact or does it have meaning for your reporting? |
| Q-mor-2 | Does each province/municipality submit their own version of this file, or is the NIR file the only submission? If each location submits separately, we need to understand how they identify themselves in the file. |
| Q-mor-3 | The Population sheet is mostly empty. Who fills in the population values used for Rate calculation — your team or is it pre-filled by DOH? |

---

*Document continues.*
*Next program to be confirmed by user.*

---

## ANSWERS — Morbidity Questions

| ID | Question | Answer |
|---|---|---|
| Q-mor-1 | Col 0 "BARMM" label | Template error — hidden column, should be NIR. Parser skips col 0 entirely. Location determined by col 1 only. |
| Q-mor-2 | Per LGU or one regional file? | Currently one regional file. Target is per LGU and barangay level for HUC — template not yet updated due to volume. Design must support this future expansion. |
| Q-mor-3 | Who fills population? | Your team fills it. Smart error checking required — flag if population is missing when rate calculation is attempted. |

## PARKED — Morbidity Ingestion Redesign
**Topic:** How to handle the transition from one regional rollup file to per-LGU submission for 325 diseases × 16 age groups × 2 sexes.

**Status:** Parked until all files are analyzed. Do not design or build yet.

**What we know so far:**
- Current file = 1,631 rows covering all locations in one sheet
- Target = individual files per LGU/barangay
- Scale = 886,000 data points per year at regional level, will multiply with per-LGU submissions
- The schema can handle this — the question is how the parser identifies which location is submitting


---

## Program: Non-Communicable Diseases (NCD)
**No subfolders. 5 files.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `ncd_ra_nir.xlsx` | Risk Assessment — Adults and Senior Citizens | ✅ Analyzed |
| 2 | `ncd_cancer_nir.xlsx` | Cervical Cancer + Breast Cancer screening | ✅ Analyzed |
| 3 | `ncd_eyehealth_nir.xlsx` | Eye health screening by age group | ✅ Analyzed |
| 4 | `ncd_meds_nir.xlsx` | NCD medications — hypertension and diabetes | ✅ Analyzed |
| 5 | `ncd_mh_nir.xlsx` | Mental Health assessment using mhGAP | ✅ Analyzed |

---

## File ncd-1: `ncd_ra_nir.xlsx`
**Tracks:** Risk assessment results for Adults (20-59 yrs) and Senior Citizens (60+)

### Sheet Structure
| Sheet Group | Sheets | Population |
|---|---|---|
| Group A | Qtr1a, Qtr2a, Qtr3a, Qtr4a, Annuala | Adults (20-59 years) |
| Group B | Qtr1b, Qtr2b, Qtr3b, Qtr4b, Annualb | Senior Citizens (60+) |
| Other | Population (EMPTY), changelog | — |

**Frequency: Quarterly + Annual. No monthly sheets.**
**Total data sheets: 10 (5 per population group)**
**Rows: 129 | Columns: 43**
**All sheets in each group are structurally identical ✅**

### New Sheet Naming Pattern — Dual Population Groups
This is the first file where the same indicators are tracked for two different population groups in separate sheet sets. The `a` suffix = Adults, `b` suffix = Senior Citizens. Both groups have the exact same 43-column structure.

### Note on ncd_meds Link
Column 2 in both group sheets explicitly states: *"Must be equal to Risk Assessed in the ncd_meds template."* This is the first confirmed **cross-file validation rule** we have seen. The risk assessed total in this file must match the risk assessed total in `ncd_meds_nir.xlsx`. The system must enforce this cross-file check.

### 7 Risk Factors Tracked
1. Insufficient physical activity
2. Unhealthy diet
3. Overweight
4. Obese
5. Binge drinker
6. Current smoker — Tobacco Product
6. Current smoker — Vaporized Nicotine Product
6. Current smoker — Both
6. Current smoker — All (computed sum of above 3)
7. Current smokers provided with Brief Tobacco Intervention (BTI)

### BTI — New Chained Denominator
The BTI percentage formula: `BTI Total / Smokers All Total`
The denominator is the "All Smokers" total from the same sheet — another chained denominator pattern (same as Geriatric file).

### Column Inventory Summary
| Col | Content | Type |
|---|---|---|
| 2 | Risk Assessed Total | RAW — denominator for most indicators |
| 3-6 | Physical Activity (M/F/Total/%) | RAW/COMPUTED |
| 7-10 | Unhealthy Diet (M/F/Total/%) | RAW/COMPUTED |
| 11-14 | Overweight (M/F/Total/%) | RAW/COMPUTED |
| 15-18 | Obese (M/F/Total/%) | RAW/COMPUTED |
| 19-22 | Binge Drinker (M/F/Total/%) | RAW/COMPUTED |
| 23-26 | Smoker Tobacco (M/F/Total/%) | RAW/COMPUTED |
| 27-30 | Smoker VNP (M/F/Total/%) | RAW/COMPUTED |
| 31-34 | Smoker Both (M/F/Total/%) | RAW/COMPUTED |
| 35-38 | Smoker All (M/F/Total/%) | COMPUTED/COMPUTED |
| 39-42 | BTI (M/F/Total/%) | RAW/COMPUTED — denominator = Smoker All Total |

### DQC Rules
None visible in the template.

### Raw Inputs to Store (per group per location per period)
Risk Assessed Total + 7 risk factors × 2 sex = 15 raw inputs
**Total: 15 per group × 2 groups = 30 per location per period**

---

## File ncd-2: `ncd_cancer_nir.xlsx`
**Tracks:** Cervical Cancer (Group A) and Breast Cancer (Group B) screening and linkage to care

### Sheet Structure
Same dual-group pattern as ncd_ra:
- Group A (Qtr1a–Qtr4a, Annuala): Cervical Cancer — 22 columns
- Group B (Qtr1b–Qtr4b, Annualb): Breast Cancer — 30 columns

**Frequency: Quarterly + Annual. No monthly.**
**All sheets per group are structurally identical ✅**

### Group A — Cervical Cancer (22 columns)
**Target population:** Women of reproductive age (target defined separately)
**Female-only — no sex disaggregation**

**Screening methods tracked separately:**
- VIA (Visual Inspection with Acetic Acid)
- Pap Smear
- HPV DNA Test
- Assessment Only (no lab test)

**Two clinical pathways with chained denominators:**
1. Suspicious for Cervical Cancer → Denominator = Women Screened or Assessed Total (col 8)
2. Precancerous Lesions → Denominator = Women Screened Total (col 7)

Both pathways track: Found positive → Referred → Treated

### Raw Inputs — Group A
1. Target Population
2. VIA count
3. Pap Smear count
4. HPV DNA count
5. Assessed Only count
6. Found Suspicious for Cancer
7. Suspicious → Referred
8. Suspicious → Treated
9. Positive for Precancerous Lesions
10. Precancerous → Referred
11. Precancerous → Treated

**Total: 11 raw inputs per location per period**

### Group B — Breast Cancer (30 columns)
**Two target populations in one sheet:**
- col 2: Women Seen 30-69 years old (denominator for high-risk identification)
- col 17: Target Population 50-69 years old (denominator for screening coverage)

**Two screening methods:**
- CBE (Clinical Breast Exam)
- Mammogram/Ultrasound

**Clinical pathway:**
Women Seen → High-Risk identified → BCEDS provided → Significant results → Linked to care

### Raw Inputs — Group B
1. Women Seen 30-69 yrs
2. High-Risk/Symptomatic Women
3. BCEDS CBE count
4. BCEDS Mammogram/Ultrasound count
5. BCEDS with significant results CBE
6. BCEDS with significant results Mammo/US
7. With significant results linked to care CBE
8. With significant results linked to care Mammo/US
9. Target Population 50-69 yrs
10. 50-69 screened CBE
11. 50-69 screened Mammo/US
12. 50-69 screened with significant results CBE
13. 50-69 screened with significant results Mammo/US
14. 50-69 significant results linked to care CBE
15. 50-69 significant results linked to care Mammo/US

**Total: 15 raw inputs per location per period**

---

## File ncd-3: `ncd_eyehealth_nir.xlsx`
**Tracks:** Eye health screening by 4 age groups

### Sheet Structure
Qtr1–Qtr4 + Annual + Population (EMPTY) + changelog
**Frequency: Quarterly + Annual. All sheets identical ✅**
**Rows: 513 | Columns: 28**

### Why 513 Rows?
129 locations × 4 age groups = 516 rows minus a few blank separators ≈ 513

This is the **row-expansion pattern** — each location has 4 rows, one per age group:
- 0-9 years old
- 10-19 years old
- 20-59 years old
- 60 and above

Col 2 (Agegroup) identifies which age group the row belongs to.

**Schema impact:** The parser must detect the age group from col 2 and include it in the indicator code. This is different from all previous files where age groups were separate columns in the same row.

### 4 Eye Ailment Types Tracked Per Age Group
1. Changes in Vision
2. Changes in Appearance
3. Eye and Orbital Injury
4. Routine Eye Exams

Plus summary: "Identified with at least one eye ailment"
And outcome: "Referred to eye health professional"

### Column Inventory
| Col | Content | Type |
|---|---|---|
| 2 | Age Group | META — row identifier |
| 3 | Projected Population | RAW |
| 4-6 | Screened (M/F/Total) | RAW/COMPUTED |
| 7 | Screened % | COMPUTED |
| 8-10 | Changes in Vision (M/F/Total) | RAW/COMPUTED |
| 11-13 | Changes in Appearance (M/F/Total) | RAW/COMPUTED |
| 14-16 | Eye and Orbital Injury (M/F/Total) | RAW/COMPUTED |
| 17-19 | Routine Eye Exams (M/F/Total) | RAW/COMPUTED |
| 20-22 | At least 1 ailment (M/F/Total) | RAW/COMPUTED |
| 23 | At least 1 ailment % | COMPUTED — denominator = Screened Total |
| 24-26 | Referred (M/F/Total) | RAW/COMPUTED |
| 27 | Referred % | COMPUTED — denominator = At least 1 ailment Total |

### Raw Inputs Per Age Group Row
Population + Screened M/F + 4 ailment types × M/F + At least 1 M/F + Referred M/F = 13
**Total: 13 × 4 age groups = 52 per location per period**

---

## File ncd-4: `ncd_meds_nir.xlsx`
**Tracks:** NCD medications for hypertension and Type II diabetes — Adults and Senior Citizens

### Sheet Structure — Most Complex Seen Yet
| Sheet | Type | Rows | Cols |
|---|---|---|---|
| readme | Guide | 13 | 1 |
| RA | Summary pivot | 69 | 220 |
| Jan–Dec | Monthly | 68 | 80 |
| Mar(Q1), Jun(Q2), Sep(Q3), Dec(Q4) | Monthly AND Quarterly | varies | 80 |
| Population | Reference | EMPTY | — |
| changelog | Admin | — | — |

**Frequency: Monthly. Quarterly sheets are the same month sheets renamed (e.g., Mar is also Q1).**

### ⚠️ Critical Finding 1 — Dec(Q4) Has 174 Rows
All monthly sheets have 68 rows except Dec(Q4) which has 174 rows. This is a structural anomaly — same as the Sanitation file Qtr3/Qtr4 issue. Needs confirmation whether this is a template error or intentional (e.g., Dec includes cumulative data or extra rows were added).

### ⚠️ Critical Finding 2 — The RA Sheet (220 Columns)
The `RA` sheet is a pivot summary — all 12 months of data combined horizontally into one giant sheet. It has:
- Rows = locations (69 rows)
- Columns = every indicator × every month = 220 columns
- Two column groups: ADULTS (cols 1-110) and SENIOR CITIZENS (cols 111-220)

This sheet is NOT for ingestion. It is a summary view for human review. We skip it for data import.

### ⚠️ Critical Finding 3 — Cross-File Validation With ncd_ra
The note in ncd_ra explicitly says the Risk Assessed total must match ncd_meds. This means:
- ncd_meds stores the risk assessed count
- ncd_ra uses that same count as its denominator
- They must be equal or the system flags an error

This is the first confirmed **cross-file business rule** in the system.

### Monthly Sheet Structure (80 columns)
Two population groups in one sheet — Adults (cols 2-40) and Senior Citizens (cols 41-79).

**Adults section (20-59 years):**
- Projected Population 20-59 yrs
- Risk assessed (M/F/Total/%)
- Identified hypertensive (M/F/Total/%)
- Complete antihypertensive meds [PBF] (M/F/Total)
- Complete antihypertensive meds [OOP] (M/F/Total)
- Complete antihypertensive meds [Both] (M/F/Total)
- Complete antihypertensive meds [All] (M/F/Total/%)
- Identified Type II Diabetes (M/F/Total/%)
- Complete antidiabetic meds [PBF/OOP/Both/All] — same pattern

**Senior Citizens section (60+ years):** identical structure, cols 41-79

**New disaggregation type — Payment method:**
PBF = PhilHealth Benefit Fund (insurance-covered)
OOP = Out-of-pocket (self-paid)
Both = used both PBF and OOP

This is a new dimension we have not seen before — not sex, not age, not hiring source — but **payment source**.

### Raw Inputs Per Monthly Sheet
Adults: Population + Risk Assessed M/F + Hypertensive M/F + Meds [PBF/OOP/Both] M/F × 2 conditions + Diabetic M/F = 26
SCs: Same = 26
**Total: 52 per location per month**

---

## File ncd-5: `ncd_mh_nir.xlsx`
**Tracks:** Mental health assessment using mhGAP tool by age group

### Sheet Structure
Qtr1–Qtr4 + Annual + changelog (no Population sheet)
**Frequency: Quarterly + Annual. All sheets identical ✅**
**Rows: 129 | Columns: 15**

### Simplest NCD File
4 age groups tracked in columns (not rows like Eye Health):
- 0-9 years old
- 10-19 years old
- 20-59 years old
- 60 years and above

Each age group: Male / Female / Total columns.
Grand total column at the end.

### No Denominator
This file has **no denominator and no percentage.** It only counts how many people were assessed. There is no rate, no target population reference, no DQC.

### Column Inventory
| Col | Content | Type |
|---|---|---|
| 2 | 0-9 Male | RAW |
| 3 | 0-9 Female | RAW |
| 4 | 0-9 Total | COMPUTED |
| 5 | 10-19 Male | RAW |
| 6 | 10-19 Female | RAW |
| 7 | 10-19 Total | COMPUTED |
| 8 | 20-59 Male | RAW |
| 9 | 20-59 Female | RAW |
| 10 | 20-59 Total | COMPUTED |
| 11 | 60+ Male | RAW |
| 12 | 60+ Female | RAW |
| 13 | 60+ Total | COMPUTED |
| 14 | Grand Total | COMPUTED |

### Raw Inputs to Store
4 age groups × 2 sex = **8 raw inputs per location per period**

---

## Key Findings — NCD Program

### New Patterns Discovered

**1. Dual population groups in one file (a/b sheet suffix)**
ncd_ra and ncd_cancer split their sheets into Group A and Group B for different populations. The parser config must handle sheet name suffixes as population group identifiers.

**2. Cross-file validation rule**
ncd_ra Risk Assessed total must equal ncd_meds Risk Assessed total. First confirmed business rule that spans two separate files. The system must check this after both files are uploaded for the same period.

**3. Row-expansion for age groups (Eye Health)**
513 rows = 129 locations × 4 age groups. The parser must read the age group column to identify which indicator group each row belongs to.

**4. Payment source disaggregation (ncd_meds)**
PBF vs OOP vs Both — a new dimension alongside sex and age. Not stored as separate indicators — stored as sub-groups within the same indicator.

**5. No denominator file (Mental Health)**
ncd_mh has no population reference and no percentage columns. Pure count data only.

**6. RA summary sheet (220 columns)**
The RA sheet in ncd_meds is a human-facing pivot table combining all months. We skip it entirely for ingestion.

### Schema Flags

**FLAG ncd-1 — Cross-file validation.**
The schema needs a `validation_rules` table or config that defines cross-file checks. When ncd_ra and ncd_meds are both uploaded for the same location and period, the system compares the Risk Assessed totals and flags mismatches before committing either to the database.

**FLAG ncd-2 — Row-expansion parser.**
The eye health file requires a different parsing strategy: instead of reading each row as one location, the parser reads groups of 4 rows as one location with 4 age group sub-rows. The config must declare `row_mode: expanded` vs `row_mode: single` for each template.

**FLAG ncd-3 — Dec(Q4) row anomaly in ncd_meds.**
Dec(Q4) has 174 rows vs 68 for all other months. This needs clarification before we write the parser config for this file.

---

## Open Questions — NCD

| ID | File | Question |
|---|---|---|
| Q-ncd-1 | ncd_meds | Dec(Q4) has 174 rows, all other months have 68. Is this a template error or intentional? |
| Q-ncd-2 | ncd_ra | The "must equal ncd_meds" note — is this checked manually today or not checked at all? |
| Q-ncd-3 | ncd_meds | The RA sheet (220 cols) — is this used for anything official or just for internal reference? |


---

## ANSWERS — NCD Questions

| ID | Question | Answer | Action |
|---|---|---|---|
| Q-ncd-1 | Dec(Q4) row count | Fixed to 68 rows. HUC barangay rows still missing — same issue as Morbidity. Parked. | Parser config uses 68 rows as standard for ncd_meds |
| Q-ncd-2 | Cross-file validation ncd_ra vs ncd_meds | Currently checked manually. Apply smart error checking. | Add cross-file validation rule to system: flag if Risk Assessed totals do not match after both files are uploaded for same location and period |
| Q-ncd-3 | RA sheet in ncd_meds_nir.xlsx | Pending clarification from user | — |

## PARKED — HUC Barangay Rows
Multiple files (ncd_meds, Morbidity, and others) are missing barangay-level rows under HUC (City of Bacolod). This is a known gap in the current templates. Parked until template owners add barangay rows. System design already supports barangay level via the locations table hierarchy.


## Q-ncd-3 ANSWERED — RA Sheet in ncd_meds_nir.xlsx

The RA tab is where risk assessed counts are entered per month, for Adults and Senior Citizens separately. 220 columns = 12 months × 2 population groups × ~9 columns per month group.

The monthly tabs (Jan-Dec) are where medication data is entered — of the risk-assessed population, how many have complete medications.

**Data flow confirmed:**
```
ncd_meds RA tab       → enters: risk assessed count per month per group
ncd_meds monthly tabs → enters: medication coverage of risk-assessed population
ncd_ra file           → enters: risk factor details of risk-assessed population
```

All three are linked by the same risk assessed total as anchor.

**Parser decision:**
- RA tab in ncd_meds = ingest as monthly risk assessed counts per location
- Monthly tabs = ingest as medication coverage data
- Cross-validation: RA tab total must equal ncd_ra risk assessed total for same location and period


## CORRECTION — RA Sheet Column Structure in ncd_meds_nir.xlsx

Corrected breakdown of the 220 columns:

**Layout:**
- Col 0: PSGC
- Col 1: Location name
- Col 2: Projected Population 20-59 years old (Adults) — 1 column
- Cols 3-11: Adults January (9 columns per month)
- Cols 12-20: Adults February (9 columns)
- ... repeating for 12 months = 12 × 9 = 108 columns
- Col 111: Projected Population 60+ years old (SC) — 1 column
- Cols 112-120: SC January (9 columns)
- ... repeating for 12 months = 12 × 9 = 108 columns

**Total: 2 (PSGC + location) + 1 (Adults pop) + 108 (Adults 12 months) + 1 (SC pop) + 108 (SC 12 months) = 220 columns ✅**

**9 columns per month per group:**
1. Risk Assessed Male
2. Risk Assessed Female
3. Risk Assessed Total
4. Hypertensive Male
5. Hypertensive Female
6. Hypertensive Total
7. Type II Diabetes Male
8. Type II Diabetes Female
9. Type II Diabetes Total

**Parser decision — RA tab:**
Read as a wide pivot table. For each location, extract 9 values per month × 12 months × 2 groups = 216 data points per location. Map each to its correct period using column position.


---

## Program: Oral Health Care
**No subfolders. 1 file.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `ohc_1st_visit_completed_2_visits_nir.xlsx` | Oral health visits — infants + multi-age groups | ✅ Analyzed |

---

## File ohc-1: `ohc_1st_visit_completed_2_visits_nir.xlsx`

### Sheet Structure
| Sheet | Rows | Cols | Content |
|---|---|---|---|
| Quarterly | 513 | 9 | Infants (0-11 months) — 1st oral visit, quarterly |
| Annual | 129 | 8 | Infants (0-11 months) — 1st oral visit, annual |
| Quarterly_1 | 4097 | 22 | Multi-age groups — 1st visit + completed 2 visits, quarterly |
| Annual_1 | 1025 | 21 | Multi-age groups — 1st visit + completed 2 visits, annual |
| change_log | — | — | Not imported |

**Frequency: Quarterly + Annual. No monthly sheets.**
**Two separate indicator groups in the same file — handled by separate sheets.**

---

## New Structural Patterns — Oral Health

### Pattern 1 — Quarter as a Row Value (not a sheet)
Previous files had one sheet per quarter (Qtr1, Qtr2, etc.). This file puts all quarters in one sheet with a `Quarter` column (col 4 in Quarterly_1) containing values: "1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter".

This means: 129 locations × 4 quarters = 516 rows (approximately 513 after blank separators).

**Schema impact:** The parser must read the Quarter column value to determine the period, not the sheet name. This is a new period detection method.

### Pattern 2 — Areas Column (col 1)
All rows show "NIR" in the Areas column. This appears to be a region-level label. Currently all rows are NIR only — same HUC barangay gap as other files.

### Pattern 3 — Pregnant Women as Age Sub-groups
Quarterly_1 has 9 age groups including 3 pregnancy-specific groups:
- 10-14 years old (pregnant)
- 15-19 years old (pregnant)
- 20-49 years old (pregnant)

This is the first time pregnancy status appears as an age sub-group modifier. These are distinct rows from the regular age groups.

### Pattern 4 — Service Setting Disaggregation
Two service settings tracked separately for each indicator:
- Facility (in-clinic visits)
- Non-facility (outreach, community)

This is a new disaggregation type — similar to payment source in NCD but tracks where the service was delivered.

---

## Sheet 1 — Quarterly (Infants 0-11 months)

**Tracks:** Infants who had their first oral health visit
**Rows:** 513 = 129 locations × 4 quarters (with blank separators)
**Columns:** 9

| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Areas (Regions) | META — always "NIR" | — |
| 2 | Region/PHIC | META — location name | — |
| 3 | Quarter | META — period identifier | "1st Quarter" to "4th Quarter" |
| 4 | Projected Population 0-11 months | RAW | — |
| 5 | 1st Oral Visit Male | RAW | — |
| 6 | 1st Oral Visit Female | RAW | — |
| 7 | A. Total | COMPUTED | col[5] + col[6] |
| 8 | % | COMPUTED | col[7] / col[4] |

**Raw inputs: Population + Male + Female = 3 per location per quarter**

---

## Sheet 2 — Annual (Infants 0-11 months)

Same indicators as Quarterly but annual rollup. 129 rows. 8 columns (no Quarter column needed).

**Raw inputs: 3 per location per year**

---

## Sheet 3 — Quarterly_1 (Multi-age groups)

**Tracks:** First visit and completed 2 visits — by age group, by service setting
**Rows:** 4097 = 129 locations × 4 quarters × 8 age groups (approx, with blank rows)
**Columns:** 22

**9 Age Groups:**
1. 1-4 years old
2. 5-9 years old
3. 10-19 years old
4. 20-59 years old
5. 60 years old and above
6. 10-14 years old (pregnant)
7. 15-19 years old (pregnant)
8. 20-49 years old (pregnant)

**Note:** Age group 3 (10-19 years) overlaps with groups 6 and 7 (10-14 pregnant, 15-19 pregnant). Pregnant sub-groups are counted separately, not as subsets of the regular age group rows.

### Column Inventory

| Col | Label | Type |
|---|---|---|
| 0 | PSGC10 | META |
| 1 | Areas (Regions) | META |
| 2 | Region/PHIC | META |
| 3 | Age Group | META — row identifier |
| 4 | Quarter | META — period identifier |
| 5 | Projected Population | RAW |
| 6 | 1st Visit Facility Male | RAW |
| 7 | 1st Visit Facility Female | RAW |
| 8 | 1st Visit Facility Total | COMPUTED |
| 9 | 1st Visit Facility % | COMPUTED |
| 10 | 1st Visit Non-facility Male | RAW |
| 11 | 1st Visit Non-facility Female | RAW |
| 12 | 1st Visit Non-facility Total | COMPUTED |
| 13 | 1st Visit Non-facility % | COMPUTED |
| 14 | Completed 2 Visits Facility Male | RAW |
| 15 | Completed 2 Visits Facility Female | RAW |
| 16 | Completed 2 Visits Facility Total | COMPUTED |
| 17 | Completed 2 Visits Facility % | COMPUTED |
| 18 | Completed 2 Visits Non-facility Male | RAW |
| 19 | Completed 2 Visits Non-facility Female | RAW |
| 20 | Completed 2 Visits Non-facility Total | COMPUTED |
| 21 | Completed 2 Visits Non-facility % | COMPUTED |

**Raw inputs per age group per location per quarter:**
Population + (1st Visit Facility M/F) + (1st Visit Non-facility M/F) + (2 Visits Facility M/F) + (2 Visits Non-facility M/F) = 9

**Total: 9 × 8 age groups × 4 quarters = 288 per location per year**

---

## Sheet 4 — Annual_1 (Multi-age groups)

Same as Quarterly_1 but annual rollup. 1025 rows. 21 columns (no Quarter column).

**Raw inputs: 9 × 8 age groups = 72 per location per year**

---

## Key Findings — Oral Health

### What Is New

**1. Quarter as a row value instead of a sheet name.**
All previous quarterly files used separate sheets (Qtr1, Qtr2, etc.). This file puts all quarters in one sheet with a column identifying the quarter. The parser must detect `row_mode: quarter_in_column` and read the Quarter column for period assignment.

**2. Pregnant women as age sub-group rows.**
Three age groups are qualified by pregnancy status. These are separate rows — not embedded in the regular age group rows. The parser must include pregnancy status as part of the indicator code.

**3. Service setting disaggregation (Facility vs Non-facility).**
First time we see where a service was delivered as a disaggregation dimension. Stored as separate indicator codes: `OHC_1ST_VISIT_FACILITY` vs `OHC_1ST_VISIT_NONFACILITY`.

**4. Two separate sheet pairs for two age groups.**
Infants (0-11 months) have their own Quarterly/Annual sheets. All other age groups use Quarterly_1/Annual_1. The parser treats these as two independent template configs within one file.

---

## Open Questions — Oral Health

| ID | Question |
|---|---|
| Q-ohc-1 | The Areas column (col 1) always shows "NIR." Is this supposed to show the province or municipality name, or is it always NIR for all rows? |
| Q-ohc-2 | Age group "10-19 years old" overlaps with "10-14 pregnant" and "15-19 pregnant." Are pregnant teenagers counted in BOTH the regular 10-19 row AND the pregnant sub-group rows, or only in the pregnant rows? |


---

## ANSWERS — Oral Health Questions

| ID | Question | Answer | Action |
|---|---|---|---|
| Q-ohc-1 | Areas column (col 1) always shows NIR | Ignore this column. It was intended to be deleted but kept to avoid confusing LGUs. Parser skips col 1 entirely. Location determined by col 2 (Region/PHIC) only. | Parser config: skip col 1 |
| Q-ohc-2 | Are pregnant teens also counted in regular age groups? | No. Pregnant-specific rows only. No double counting. | Pregnant age groups are stored as distinct indicator codes. Regular age group rows exclude pregnant women. |


---

## Program: Vital Statistics
**2 subfolders. 1 file each.**

| Subfolder | Filename | Indicator | Status |
|---|---|---|---|
| Mortality | `morta_mmr_imr_nir.xlsx` | Maternal Mortality Ratio + Infant Mortality Rate | ✅ Analyzed |
| Natality | `nata_lb_abr_rabr_nir.xlsx` | Live Births + Adolescent Birth Rate + Repeat ABR | ✅ Analyzed |

---

## File vs-1: `morta_mmr_imr_nir.xlsx`
**Tracks:** Maternal deaths (direct + indirect, resident + non-resident) and infant deaths

### Sheet Structure
| Sheet Group | Sheets | Content |
|---|---|---|
| Group A | Q1a, Q2a, Q3a, Q4a, Annual1 | Maternal Mortality — 39 columns |
| Group B | Q1b, Q2b, Q3b, Q4b, Annual2 | Infant Mortality — 6 columns |
| Other | change_log | Not imported |

**Frequency: Quarterly + Annual. No monthly.**
**Same dual-group sheet naming as ncd_ra and ncd_cancer (a/b suffix).**

---

### Group A — Maternal Mortality (39 columns)

**New Disaggregation — Residency Status**
Maternal deaths are tracked separately for:
- Resident (died in their home municipality)
- Non-Resident (died outside their home municipality)
- Combined (Res + NonRes)

This is the first file with **residency status** as a disaggregation dimension.

**Three Age Groups for Deaths:** 10-14, 15-19, 20-49

**Two Cause Types:** Direct + Indirect maternal deaths

**New Rate Formula:** Deaths per 100,000 live births — not per population, not per 100%

```
MMR = (Maternal Deaths / Live Births) × 100,000
```

This is a new computation type. All previous rates used population or facility visits as denominator. This uses live births.

### ⚠️ Template Inconsistency — Q4a col 3 Label
Q1a, Q2a, Q3a col 3 label: `"1a. Total Livebirths (a1+a2)(a3)"` — implies a1 (resident) + a2 (non-resident) = a3 total
Q4a and Annual1 col 3 label: `"1a. Livebirths (Total)(a3)"` — simplified label, same column

The data is the same — total livebirths. The label changed between Q3a and Q4a. This is a template label inconsistency, not a structural difference. Parser uses column position, not label.

### Column Inventory — Group A

**Col 3:** Total Livebirths — RAW — denominator for all MMR calculations

**Direct Maternal Deaths — Resident (cols 4-8)**
| Col | Label | Type |
|---|---|---|
| 4 | Direct Deaths Resident 10-14 | RAW |
| 5 | Direct Deaths Resident 15-19 | RAW |
| 6 | Direct Deaths Resident 20-49 | RAW |
| 7 | Direct Deaths Resident Total | COMPUTED |
| 8 | Ratio (per 100,000 livebirths) | COMPUTED |

**Direct Maternal Deaths — Non-Resident (cols 9-13):** Same pattern
**Direct Maternal Deaths — Res+NonRes (cols 14-18):** Same pattern
**Indirect Maternal Deaths — Resident (cols 19-23):** Same pattern
**Indirect Maternal Deaths — Non-Resident (cols 24-28):** Same pattern
**Indirect Maternal Deaths — Res+NonRes (cols 29-33):** Same pattern
**All Maternal Deaths — Res+NonRes, Direct+Indirect (cols 34-38):** Same pattern

### ⚠️ Formula Error Found — Col 33 (Indirect Res+NonRes Ratio)
Col 33 label says `Ratio (d4/a3*100,000)` but d4 is the Direct deaths total, not Indirect. The correct formula should use g4 (Indirect Res+NonRes Total). This is the same type of copy-paste label error we have seen before. System uses correct formula.

### Raw Inputs — Group A
Total Livebirths + (3 age groups × 2 cause types × 2 residency groups) = 1 + 18 = **19 raw inputs per location per period**

All totals, combined groups, and ratios are computed by the system.

---

### Group B — Infant Mortality (6 columns)

Simplest sheet in the Vital Statistics program.

| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region | META | — |
| 2 | Region/PHIC | META | — |
| 3 | Total Livebirths | RAW | — |
| 4 | Infant Deaths | RAW | — |
| 5 | Rate | COMPUTED | (col[4] / col[3]) × 1,000 |

**New rate multiplier: × 1,000** — infant deaths per 1,000 live births, not per 100,000 like MMR.

**Raw inputs: 2 per location per period** (Livebirths + Infant Deaths)

---

## File vs-2: `nata_lb_abr_rabr_nir.xlsx`
**Tracks:** Live births, Adolescent Birth Rate (ABR), Repeat Adolescent Birth Rate (RABR)

### Sheet Structure
Q1–Q4 + Annual + change_log
**Frequency: Quarterly + Annual. All consistent except Q2 — see below.**

### ⚠️ Critical — Q2 Has 16 Columns, All Other Sheets Have 17

Q1, Q3, Q4, Annual all have 17 columns. Q2 has only 16 columns. The missing column is col 6 in Q2 — "Adolescent Birth Rate <10 years old (counts only)" which appears in all other sheets.

This is a template error — Q2 is missing the under-10 ABR count column. The parser config must handle Q2 separately with a shifted column mapping.

### New Indicator Type — Estimated Population as Denominator
The ABR uses **Estimated Population** as denominator — not projected population from a population sheet, not facility visits. Two separate estimated population columns exist in the same sheet:
- Estimated Population 10-14 years old (col 7)
- Estimated Population 15-19 years old (col 8)

These are RAW inputs entered by the encoder, not pulled from a reference table.

### Column Inventory (Q1, Q3, Q4, Annual — 17 columns)

| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region | META | — |
| 2 | Region/PHIC | META | — |
| 3 | Livebirths Male | RAW | — |
| 4 | Livebirths Female | RAW | — |
| 5 | Total Livebirths | COMPUTED | col[3] + col[4] |
| 6 | ABR <10 years old (counts only) | RAW | No % — count only |
| 7 | Estimated Population 10-14 yrs | RAW | Denominator for col[9] |
| 8 | Estimated Population 15-19 yrs | RAW | Denominator for col[11] |
| 9 | ABR 10-14 years old (count) | RAW | — |
| 10 | ABR 10-14 % | COMPUTED | col[9] / col[7] |
| 11 | ABR 15-19 years old (count) | RAW | — |
| 12 | ABR 15-19 % | COMPUTED | col[11] / col[8] |
| 13 | RABR 10-14 (counts only) | RAW | No % |
| 14 | Deliveries 15-19 years old | RAW | Denominator for col[15] |
| 15 | RABR 15-19 years old (count) | RAW | — |
| 16 | RABR 15-19 % | COMPUTED | col[15] / col[14] |

**Q2 Column Inventory (16 columns):** Same as above but col 6 (ABR <10 count) is missing. Cols 7-16 shift left by 1 to become cols 6-15.

### New Indicator — Count Only, No Percentage
Three indicators have no percentage:
- ABR <10 years old — count only (too rare for a meaningful rate)
- RABR 10-14 — count only
- These are stored as raw counts with no computed percentage

### Raw Inputs (Q1, Q3, Q4, Annual)
Livebirths M/F + ABR <10 + Pop 10-14 + Pop 15-19 + ABR 10-14 count + ABR 15-19 count + RABR 10-14 count + Deliveries 15-19 + RABR 15-19 count = **10 per location per period**

**Q2 raw inputs: 9** (missing ABR <10 count)

---

## Key Findings — Vital Statistics

### New Patterns

**1. Residency status disaggregation (Mortality)**
Resident vs Non-Resident vs Combined — a dimension tracking where a person lives vs where they died. Important for accurate local burden-of-disease calculation.

**2. Two different rate multipliers in one program**
MMR = per 100,000 livebirths. IMR = per 1,000 livebirths. The config must specify the multiplier per indicator — not assume all rates use the same base.

**3. Estimated population as a user-entered denominator (Natality)**
The ABR denominator is entered directly by the encoder as an estimated figure — not from a master population table. The system cannot cross-check this against a reference. We apply a range-based DQC: flag if estimated population deviates significantly from projected population for the same age group.

**4. Count-only indicators with no rate (Natality)**
ABR <10 and RABR 10-14 are stored as raw counts only. The system must not attempt to compute a percentage for these.

**5. Q2 missing one column in Natality file**
Confirmed template error. Parser config handles Q2 with a separate column map (one fewer column, shifted indices).

### Updated Denominator Registry

| ID | Type | Files Using It |
|---|---|---|
| D1 | Projected Population (age-specific) | Immunization, VitA, MNP, LNS, Demographics, etc. |
| D2 | Facility Seen | Management of Sick |
| D3 | Live Births | Breastfeeding, Mortality (MMR and IMR) |
| D4 | Condition Count | LBW Iron |
| D5 | Enrolled Learner Count | SBI |
| D6 | Projected Households | Demographics, Environmental Health |
| D7 | Administrative Unit Count | ZOD |
| D8 | Estimated Population (user-entered) | Natality ABR |

### Action Items for Team

| # | File | Action |
|---|---|---|
| 1 | `morta_mmr_imr_nir.xlsx` | Col 33 label says d4 but should say g4 for Indirect Res+NonRes ratio — template label error |
| 2 | `nata_lb_abr_rabr_nir.xlsx` | Q2 sheet missing col 6 (ABR <10 count) — add the missing column to match Q1/Q3/Q4/Annual |

---

*Document continues.*
*Next program to be confirmed by user.*

---

## ANSWERS — Vital Statistics

| ID | Item | Answer | Action |
|---|---|---|---|
| morta-1 | Q4a col 3 label inconsistency | Fixed by user — now matches Q1a-Q3a | Parser config uses single column map for all Group A sheets |
| morta-2 | Col 33 formula label error (d4 vs g4) | Logged — team will correct | System recalculates from raw inputs, not from Excel label |
| nata-1 | Q2 missing ABR <10 column | Logged — team will add missing column | Until fixed, parser config handles Q2 with separate 16-column map |


---

## Program: Maternal Care > Intra Partum
**3 subfolders total in Maternal Care. This is subfolder: Intra Partum. 2 files.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `1__intra_shp_fbd__dt_do_nir.xlsx` | SHP + FBD + Delivery Type + Delivery Outcome | ✅ Analyzed |
| 2 | `2__intra_bw_nir.xlsx` | Birth Weight classification | ✅ Analyzed |

---

## File intra-1: `1__intra_shp_fbd__dt_do_nir.xlsx`
**Tracks:** Skilled Health Professional attendance + Facility-Based Delivery + Delivery Type + Delivery Outcome

### Sheet Structure — Triple Group (a/b/c suffix)
**First file with 3 sheet groups.** Previous files had 1 or 2 groups.

| Group | Sheets | Content | Cols |
|---|---|---|---|
| a | Q1a–Q4a, Annual1 | SHP + FBD (Skilled attendance and facility delivery) | 24 |
| b | Q1b–Q4b, Annual2 | Delivery Type (Vaginal / CS / Combined) | 47 |
| c | Q1c–Q4c, Annual | Delivery Outcome (Full Term / Pre-Term / Fetal Death / Abortion) | 51 |

**Frequency: Quarterly + Annual. No monthly.**
**All sheets within each group are structurally identical ✅**
**Areas column (col 1) present — skip per earlier decision.**

---

### Group A — SHP and FBD (24 columns)

**Denominator — Deliveries Total (col 6)**
All percentages in Group A use Total Deliveries as denominator.

**Important DQC — Cross-indicator logical rules:**
- `SHP ≥ FBD` — Skilled attendance must be ≥ facility births (you can have SHP at home but not FBD without SHP)
- `SHP ≤ Deliveries` — SHP cannot exceed total deliveries
- `FBD ≤ Deliveries` — Facility births cannot exceed total deliveries

**Column Inventory**

| Col | Label | Type |
|---|---|---|
| 3 | Deliveries 10-14 | RAW |
| 4 | Deliveries 15-19 | RAW |
| 5 | Deliveries 20-49 | RAW |
| 6 | Deliveries Total | COMPUTED — col[3]+col[4]+col[5], also denominator |
| 7 | Attended by Physician | RAW |
| 8 | Physician % | COMPUTED — col[7]/col[6] |
| 9 | Attended by Nurse | RAW |
| 10 | Nurse % | COMPUTED — col[9]/col[6] |
| 11 | Attended by Midwife | RAW |
| 12 | Midwife % | COMPUTED — col[11]/col[6] |
| 13 | SHP Total | COMPUTED — col[7]+col[9]+col[11] |
| 14 | SHP % | COMPUTED — col[13]/col[6] |
| 15 | FBD Public Facility | RAW |
| 16 | FBD Public % | COMPUTED — col[15]/col[13] ← denominator is SHP not Deliveries |
| 17 | FBD Private Facility | RAW |
| 18 | FBD Private % | COMPUTED — col[17]/col[13] |
| 19 | FBD Total | COMPUTED — col[15]+col[17] |
| 20 | FBD Total % | COMPUTED — col[19]/col[13] |
| 21 | DQC: SHP ≥ FBD | DQC |
| 22 | DQC: SHP ≤ Deliveries | DQC |
| 23 | DQC: FBD ≤ Deliveries | DQC |

**Note:** FBD percentages use SHP total (col 13) as denominator, not total deliveries. This is intentional — FBD is measured as a proportion of SHP-attended births.

**Raw inputs: Deliveries 3 age groups + Physician + Nurse + Midwife + FBD Public + FBD Private = 8 per location per period**

---

### Group B — Delivery Type (47 columns)

**3 delivery types × 3 age groups + Total = 12 raw inputs**
**16 DQC columns** — most DQC columns in any single sheet so far.

**DQC Rules — Group B (most complex DQC seen so far):**
- Vaginal ≤ Deliveries per age group (4 checks)
- CS ≤ Deliveries per age group (4 checks)
- CVC ≤ Deliveries per age group (4 checks)
- Delivery Type sum = Deliveries per age group (equality check, 4 checks) ← **new DQC type**

The equality check is new — Vaginal + CS + CVC must exactly equal Total Deliveries. Not just ≤ but = This ensures no delivery is uncategorized.

**Raw inputs: Deliveries 3 age groups (repeated from Group A) + Vaginal 3 age groups + CS 3 age groups + CVC 3 age groups = 12 per location per period**

---

### Group C — Delivery Outcome (51 columns)

**4 outcomes × 3 age groups + Total = 16 raw inputs**
**16 DQC columns** — same count as Group B.

**New indicator — Abortion (counts only, no %)**
Abortion is tracked as count only with no percentage calculation. Same pattern as ABR <10 in Natality.

**DQC Rules — Group C:**
- Full Term ≤ Deliveries per age group (4 checks)
- Pre-Term ≤ Deliveries per age group (4 checks)
- Fetal Deaths ≤ Deliveries per age group (4 checks)
- Delivery Outcome sum = Deliveries per age group (equality check, 4 checks)

**Note — Abortion excluded from equality DQC:**
The equality check (Delivery Outcome = Deliveries) uses Full Term + Pre-Term + Fetal Death only. Abortion is NOT included in this sum. This is clinically correct — abortion outcomes are tracked separately from live delivery outcomes.

**Raw inputs: Deliveries 3 age groups + Full Term 3 age groups + Pre-Term 3 age groups + Fetal Death 3 age groups + Abortion 3 age groups = 15 per location per period**

---

## File intra-2: `2__intra_bw_nir.xlsx`
**Tracks:** Birth weight classification of live births

### Sheet Structure
Q1–Q4 + Annual + change_log
**Frequency: Quarterly + Annual. No monthly.**
**All sheets structurally identical ✅**
**Rows: 129 | Columns: 23**

### Denominator — Live Births (col 3)
All percentages use Live Births as denominator. Same D3 type.

### New DQC — Equality Check (Sum Must Equal Total)
`DQC: BW = Total Live births`
Normal BW + Low BW + Unknown BW must exactly equal Total Live Births. Same equality DQC type as Group B and C above. This enforces completeness — every birth must be classified by weight.

### Column Inventory

| Col | Label | Type | Formula |
|---|---|---|---|
| 3 | Live Births | RAW | Denominator |
| 4 | Normal BW Male | RAW | — |
| 5 | Normal BW Male % | COMPUTED | col[4]/col[3] |
| 6 | Normal BW Female | RAW | — |
| 7 | Normal BW Female % | COMPUTED | col[6]/col[3] |
| 8 | Normal BW Total | COMPUTED | col[4]+col[6] |
| 9 | Normal BW Total % | COMPUTED | col[8]/col[3] |
| 10 | Low BW Male | RAW | — |
| 11 | Low BW Male % | COMPUTED | col[10]/col[3] |
| 12 | Low BW Female | RAW | — |
| 13 | Low BW Female % | COMPUTED | col[12]/col[3] |
| 14 | Low BW Total | COMPUTED | col[10]+col[12] |
| 15 | Low BW Total % | COMPUTED | col[14]/col[3] |
| 16 | Unknown BW Male | RAW | — |
| 17 | Unknown BW Male % | COMPUTED | col[16]/col[3] |
| 18 | Unknown BW Female | RAW | — |
| 19 | Unknown BW Female % | COMPUTED | col[18]/col[3] |
| 20 | Unknown BW Total | COMPUTED | col[16]+col[18] |
| 21 | Unknown BW Total % | COMPUTED | col[20]/col[3] |
| 22 | DQC: BW = Live Births | DQC — equality check |

**Raw inputs: Live Births + Normal M/F + Low M/F + Unknown M/F = 7 per location per period**

---

## Key Findings — Intra Partum

### What Is New

**1. Triple sheet groups (a/b/c suffix)**
First file with 3 independent sheet sets in one file. The parser handles this the same way as a/b — suffix identifies the group. Config defines 3 separate template configs within one file.

**2. Equality DQC — sum must exactly equal total**
Previous DQC rules checked ≤ (cannot exceed). These files introduce = (must equal exactly). This means the system must verify that all sub-categories sum to 100% of the total. Three places this appears: Delivery Type sum = Total Deliveries, Delivery Outcome sum = Total Deliveries, Birth Weight sum = Total Live Births.

**3. Abortion — count only, no percentage**
Same pattern as ABR <10 in Natality. Stored as raw count, no computed rate. Excluded from equality DQC.

**4. FBD percentage uses SHP as denominator, not total deliveries**
FBD% = FBD Total / SHP Total. The denominator is itself a computed value (sum of Physician + Nurse + Midwife). This is a chained denominator — FBD cannot be computed until SHP total is known.

**5. Most DQC columns seen so far — 16 per sheet in Groups B and C**
This is the most comprehensive data quality checking in the entire dataset. Validates both upper bounds (≤) and completeness (=) per age group.

### Updated DQC Registry

| Type | Rule | Files Using It |
|---|---|---|
| Over threshold | Value > X% → flag | Immunization (200%), Mgt of Sick (100%), Nutrition, etc. |
| Sequence logic | A ≥ B ≥ C | Immunization doses |
| Cross-indicator | SHP ≥ FBD | Intra Partum Group A |
| Equality | Sum = Total | Intra Partum Groups B/C, Birth Weight |
| Cross-file | File A total = File B total | NCD (ncd_ra vs ncd_meds) |

---

*Document continues.*
*Next: Maternal Care — remaining 2 subfolders*

---

## Program: Maternal Care > Post Partum
**2nd subfolder under Maternal Care. 3 files.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `1__post_4pnc_nir.xlsx` | 4 Post-Natal Care visits completion | ✅ Analyzed |
| 2 | `2__post_supplementation_nir.xlsx` | Post-partum IFA + Vitamin A supplementation | ✅ Analyzed |
| 3 | `3__post_bp_measure_hpn_mngt_nir.xlsx` | BP measurement + Hypertension management | ✅ Analyzed |

---

## File pp-1: `1__post_4pnc_nir.xlsx`
**Tracks:** Women completing 4 Post-Natal Care visits including transfer tracking

### Sheet Structure
Q1–Q4 + Annual + change_log
**Frequency: Quarterly + Annual. No monthly.**
**All sheets structurally identical ✅**
**Rows: 129 | Columns: 39**

### New Pattern — Transfer Tracking (Trans-in / Trans-out)
This is the most complex denominator construction seen so far. The effective denominator is not a single column — it is built from 3 inputs:

```
Effective denominator = Resident women + Trans-IN − Trans-OUT (with MOV)
```

- Residents = women due for PNC in this LGU
- Trans-IN = women who transferred in from another LGU
- Trans-OUT = women who left before completing 4PNC (with record/MOV)

**Trans-OUT is subtracted** because those women are being tracked by their destination LGU. Counting them here would double-count them across the system.

This is the first file where the denominator requires subtraction — all previous denominators were simple values or sums.

### ⚠️ Template Typo — Col 4
Col 4 label says `"Residentt (15-19)"` with a double `t`. This is a cosmetic label error. Data and formula are correct. Logged for team correction.

### ⚠️ Important — Trans-OUT is NOT in the Denominator
Col 18 formula confirms: `I. Total = (j)+(k)+(l)` where j/k/l = Resident + Trans-IN per age group. Trans-OUT (cols 11-14) is recorded but excluded from the denominator. It is tracked for information only — to explain why some women are missing from the completion count.

### Column Inventory

**Denominator Construction (cols 3-18)**
| Col | Label | Type | Notes |
|---|---|---|---|
| 3 | Resident 10-14 | RAW | — |
| 4 | Resident 15-19 | RAW | Typo in label |
| 5 | Resident 20-49 | RAW | — |
| 6 | A. Resident Total | COMPUTED | col[3]+col[4]+col[5] |
| 7 | Trans-IN 10-14 | RAW | — |
| 8 | Trans-IN 15-19 | RAW | — |
| 9 | Trans-IN 20-49 | RAW | — |
| 10 | B. Trans-IN Total | COMPUTED | col[7]+col[8]+col[9] |
| 11 | Trans-OUT 10-14 | RAW | Tracked but excluded from denominator |
| 12 | Trans-OUT 15-19 | RAW | Tracked but excluded from denominator |
| 13 | Trans-OUT 20-49 | RAW | Tracked but excluded from denominator |
| 14 | C. Trans-OUT Total | COMPUTED | col[11]+col[12]+col[13] |
| 15 | Due for PNC 10-14 (A+B) | COMPUTED | col[3]+col[7] |
| 16 | Due for PNC 15-19 (A+B) | COMPUTED | col[4]+col[8] |
| 17 | Due for PNC 20-49 (A+B) | COMPUTED | col[5]+col[9] |
| 18 | I. Total Due for PNC | COMPUTED | col[15]+col[16]+col[17] — main denominator |

**Completion Tracking (cols 19-34)**
| Col | Label | Type | Notes |
|---|---|---|---|
| 19 | Completed 4PNC on schedule 10-14 | RAW | — |
| 20 | Completed 4PNC on schedule 15-19 | RAW | — |
| 21 | Completed 4PNC on schedule 20-49 | RAW | — |
| 22 | D. On-schedule Total | COMPUTED | — |
| 23 | Trans-IN completed 4PNC 10-14 | RAW | — |
| 24 | Trans-IN completed 4PNC 15-19 | RAW | — |
| 25 | Trans-IN completed 4PNC 20-49 | RAW | — |
| 26 | E. Trans-IN completed Total | COMPUTED | — |
| 27 | Total completed 4PNC 10-14 (D+E) | COMPUTED | col[19]+col[23] |
| 28 | % 10-14 | COMPUTED | col[27]/col[15] |
| 29 | Total completed 4PNC 15-19 (D+E) | COMPUTED | col[20]+col[24] |
| 30 | % 15-19 | COMPUTED | col[29]/col[16] |
| 31 | Total completed 4PNC 20-49 (D+E) | COMPUTED | col[21]+col[25] |
| 32 | % 20-49 | COMPUTED | col[31]/col[17] |
| 33 | II. Total completed 4PNC | COMPUTED | col[27]+col[29]+col[31] |
| 34 | Overall % | COMPUTED | col[18]/col[33] ← denominator/numerator inverted in label |

**DQC (cols 35-38)**
Over 100% per age group — 4 checks

### Raw Inputs to Store
Resident 3 age groups + Trans-IN 3 age groups + Trans-OUT 3 age groups + On-schedule 3 age groups + Trans-IN completed 3 age groups = **15 per location per period**

---

## File pp-2: `2__post_supplementation_nir.xlsx`
**Tracks:** Post-partum Iron+Folic Acid and Vitamin A supplementation

### Sheet Structure
Q1–Q4 + Annual + change_log
**Frequency: Quarterly + Annual. No monthly.**
**All sheets structurally identical ✅**
**Rows: 129 | Columns: 28**

### ⚠️ Denominator Mismatch — Needs Clarification
Col 3 denominator is `"Projected Population (Under 1)"` — this is infant population.
But the indicators (cols 4-19) are disaggregated by maternal age groups: 10-14, 15-19, 20-49.

These are **post-partum women** receiving supplements after delivery — not infants. Using "Under 1" population as the denominator for maternal age groups is clinically unusual.

Possible explanations:
1. "Under 1" population is used as a proxy for the number of deliveries (one delivery per expected infant)
2. This is a template error — the denominator should be live births or projected deliveries

This needs confirmation before we code the validation rule.

### Column Inventory

| Col | Label | Type | Formula |
|---|---|---|---|
| 3 | Projected Population Under 1 | RAW | Denominator for all indicators |
| 4 | IFA 10-14 | RAW | — |
| 5 | IFA 10-14 % | COMPUTED | col[4]/col[3] |
| 6 | IFA 15-19 | RAW | — |
| 7 | IFA 15-19 % | COMPUTED | col[6]/col[3] |
| 8 | IFA 20-49 | RAW | — |
| 9 | IFA 20-49 % | COMPUTED | col[8]/col[3] |
| 10 | IFA Total | COMPUTED | col[4]+col[6]+col[8] |
| 11 | IFA Total % | COMPUTED | col[10]/col[3] |
| 12 | Vitamin A 10-14 | RAW | — |
| 13 | Vitamin A 10-14 % | COMPUTED | col[12]/col[3] |
| 14 | Vitamin A 15-19 | RAW | — |
| 15 | Vitamin A 15-19 % | COMPUTED | col[14]/col[3] |
| 16 | Vitamin A 20-49 | RAW | — |
| 17 | Vitamin A 20-49 % | COMPUTED | col[16]/col[3] |
| 18 | Vitamin A Total | COMPUTED | col[12]+col[14]+col[16] |
| 19 | Vitamin A Total % | COMPUTED | col[18]/col[3] |
| 20-27 | DQC Over 100% | DQC — 8 checks (per age group per supplement) |

### DQC Rules
8 DQC checks — each age group for both IFA and Vitamin A must be ≤ 100% of Under 1 population.

### Raw Inputs to Store
Under 1 Population + IFA 3 age groups + Vitamin A 3 age groups = **7 per location per period**

---

## File pp-3: `3__post_bp_measure_hpn_mngt_nir.xlsx`
**Tracks:** BP measurement during PNC visits + Hypertension referral management

### Sheet Structure — Dual Group (a/b suffix)
| Group | Sheets | Content | Cols |
|---|---|---|---|
| a | Q1a–Q4a, Annual_1a | BP measured during PNC visits | 15 |
| b | Q1b–Q4b, Annual_1b | High BP / danger signs → referred to higher facility | 15 |

**Frequency: Quarterly + Annual. No monthly.**
**All sheets within each group identical ✅**
**Rows: 129**

### Note — Annual Sheet Naming
Annual sheets are named `Annual_1a` and `Annual_1b` instead of `Annual1` and `Annual2` as seen in other files. Same concept, different naming convention. Parser config handles this by explicit sheet name mapping, not pattern matching.

### Group A — BP Measurement (15 columns)

**Denominator:** Post-partum women who had a PNC visit (col 6 = Total)
**Each age group is its own denominator** — col 3 for 10-14, col 4 for 15-19, col 5 for 20-49

| Col | Label | Type | Formula |
|---|---|---|---|
| 3 | PNC Visit 10-14 | RAW | Denominator for col[8] |
| 4 | PNC Visit 15-19 | RAW | Denominator for col[10] |
| 5 | PNC Visit 20-49 | RAW | Denominator for col[12] |
| 6 | PNC Visit Total | COMPUTED | col[3]+col[4]+col[5] |
| 7 | BP Measured 10-14 | RAW | — |
| 8 | BP Measured 10-14 % | COMPUTED | col[7]/col[3] |
| 9 | BP Measured 15-19 | RAW | — |
| 10 | BP Measured 15-19 % | COMPUTED | col[9]/col[4] |
| 11 | BP Measured 20-49 | RAW | — |
| 12 | BP Measured 20-49 % | COMPUTED | col[11]/col[5] |
| 13 | BP Measured Total | COMPUTED | col[7]+col[9]+col[11] |
| 14 | BP Measured Total % | COMPUTED | col[13]/col[6] |

**No DQC columns in Group A.**

**Raw inputs: PNC Visit 3 age groups + BP Measured 3 age groups = 6 per location per period**

### Group B — Hypertension Referral (15 columns)

Same structure as Group A but tracks: women with high BP identified → referred to higher facility.

**Denominator:** Women identified with high BP per age group (cols 3-6)

| Col | Label | Type |
|---|---|---|
| 3 | High BP 10-14 | RAW — denominator for col[8] |
| 4 | High BP 15-19 | RAW — denominator for col[10] |
| 5 | High BP 20-49 | RAW — denominator for col[12] |
| 6 | High BP Total | COMPUTED |
| 7 | Referred 10-14 | RAW |
| 8 | Referred 10-14 % | COMPUTED |
| 9 | Referred 15-19 | RAW |
| 10 | Referred 15-19 % | COMPUTED |
| 11 | Referred 20-49 | RAW |
| 12 | Referred 20-49 % | COMPUTED |
| 13 | Referred Total | COMPUTED |
| 14 | Referred Total % | COMPUTED |

**No DQC columns in Group B.**

**Raw inputs: High BP 3 age groups + Referred 3 age groups = 6 per location per period**

---

## Key Findings — Post Partum

### What Is New

**1. Denominator with subtraction (4PNC file)**
First denominator formula that subtracts a value: Resident + Trans-IN − Trans-OUT. The system must support `denominator_formula` in the config, not just a single `denominator_column`. This is a new config requirement.

**2. Transfer tracking (Trans-IN / Trans-OUT)**
Women moving between LGUs during their PNC period are tracked explicitly. Trans-OUT women are recorded but excluded from the completion denominator to avoid double-counting. This is important for data integrity at the regional level.

**3. Supplementation denominator mismatch needs clarification**
"Under 1" population used as denominator for maternal age group counts. Likely intentional (proxy for expected deliveries) but needs confirmation.

**4. Annual sheet naming variation**
`Annual_1a` and `Annual_1b` vs `Annual1` and `Annual2`. Parser config uses explicit sheet name lists, not pattern-based detection. No impact on data.

**5. No DQC in BP measurement file**
Both groups in pp-3 have no DQC columns. This is intentional — referred women ≤ identified women is logically enforced by the data entry process.

---

## Open Questions — Post Partum

| ID | File | Question |
|---|---|---|
| Q-pp-1 | `2__post_supplementation_nir.xlsx` | Col 3 denominator is "Projected Population Under 1" but indicators are maternal age groups. Is this intentional — using Under 1 population as a proxy for deliveries? Or should the denominator be live births? |
| Q-pp-2 | `1__post_4pnc_nir.xlsx` | Col 4 label has typo "Residentt" — team to correct |

---

*Document continues.*
*Next: Maternal Care — 3rd subfolder (Pre-natal)*

---

## ANSWERS — Post Partum Questions

| ID | Question | Answer | Action |
|---|---|---|---|
| Q-pp-1 | Supplementation denominator | Projected Population Under 1 is manually entered. It is used as proxy for expected deliveries/post-partum women. Smart error checking will cross-validate against master population table. DQC threshold stays at 100%. | Add to cross-validation rules: flag if Under 1 population deviates significantly from master population reference |
| Q-pp-2 | Col 4 typo "Residentt" | Fixed by team | Closed |


---

## Program: Maternal Care > Prenatal
**3rd subfolder under Maternal Care. 8 files.**

| # | Filename | Indicator | Cols | Status |
|---|---|---|---|---|
| 1 | `1__pre_8anc_nir.xlsx` | 8 ANC visits completion + transfer tracking | 38 | ✅ |
| 2 | `2__pre_nutritional_status_bmi_nir.xlsx` | BMI classification (Normal/Low/High) | 22 | ✅ |
| 3 | `3__pre_td_vaccine_nir.xlsx` | Td vaccine (1st pregnancy + 2nd+) | 28 | ✅ |
| 4 | `4__pre_supplementation_nir.xlsx` | IFA + MM + Calcium Carbonate supplementation | 40 | ✅ |
| 5 | `5__pre_anemia_screening_nir.xlsx` | CBC/Hgb tested + diagnosed with Anemia | 28 | ✅ |
| 6 | `6__pre_gd_screening_nir.xlsx` | Gestational diabetes screened + positive | 28 | ✅ |
| 7 | `7__pre_deworming_nir.xlsx` | Deworming tablet given | 16 | ✅ |
| 8 | `8__pre_bp_measure_hpn_mngt_nir.xlsx` | BP measurement + Hypertension referral | 15 | ✅ |

**All files: Quarterly + Annual. No monthly. All sheets within each file identical.**

---

## File pre-1: `1__pre_8anc_nir.xlsx`
**Tracks:** Women completing 8 Ante-Natal Care visits including transfer tracking

**Structurally identical to Post-Partum file `1__post_4pnc_nir.xlsx`** — same 38-column layout, same Trans-IN/Trans-OUT transfer tracking pattern, same denominator construction (Resident + Trans-IN, Trans-OUT excluded), same 4 DQC over 100% checks per age group.

Only difference: 8ANC instead of 4PNC.

**Raw inputs: 15 per location per period** (same as 4PNC file)

---

## File pre-2: `2__pre_nutritional_status_bmi_nir.xlsx`
**Tracks:** Pregnant women classified by BMI — Normal, Low, High

### Denominator
Projected Population Under 1 (same proxy as Post-Partum supplementation) — manually entered, cross-validated against master population table.

### No Sex Disaggregation
BMI counts are by age group only (10-14, 15-19, 20-49) with no Male/Female split. Makes sense — this tracks pregnant women only (all female).

### ⚠️ DQC Label Error — Col 21
Col 19: `DQC Normal BMI Over 100%` ✅
Col 20: `DQC Low BMI Over 100%` ✅
Col 21: `DQC Low BMI Over 100%` ❌ — duplicate label, should be `DQC High BMI Over 100%`

Confirmed template error. System applies the correct rule (High BMI over 100%) based on column position, not label.

### ⚠️ Equality DQC Missing
Normal + Low + High BMI should equal total pregnant women tracked. This equality check is NOT present in the template. The system should add this as a smart validation rule — flag if the three BMI categories do not sum to total population.

### Raw Inputs
Under 1 Population + Normal BMI 3 age groups + Low BMI 3 age groups + High BMI 3 age groups = **10 per location per period**

---

## File pre-3: `3__pre_td_vaccine_nir.xlsx`
**Tracks:** Td vaccination for pregnant women — first pregnancy (≥2 doses) and 2nd+ pregnancy (≥3 doses)

### Denominator
Projected Population Under 1 — same as other prenatal files.

### New Disaggregation — Pregnancy Order
Two groups tracked separately:
- Group 1: Women pregnant for the **first time** — need ≥2 Td doses
- Group 2: Women pregnant for the **2nd or more times** — need ≥3 Td doses

This is a new type of disaggregation — not age, not sex, not hiring source, but **pregnancy history**.

### No Sex Disaggregation
Age group only (10-14, 15-19, 20-49 + Total). All female.

### DQC Rules
8 DQC columns — over 100% per age group per pregnancy group. Standard pattern.

### Raw Inputs
Under 1 Population + Group 1 × 3 age groups + Group 2 × 3 age groups = **7 per location per period**

---

## File pre-4: `4__pre_supplementation_nir.xlsx`
**Tracks:** 3 prenatal supplements — IFA, Multiple Micronutrient (MM), Calcium Carbonate (CC)

### Denominator
Projected Population Under 1. Same as other prenatal files.

### No Sex Disaggregation
Age group only. All female.

### 3 Supplements × 3 Age Groups
Same structure as Post-Partum supplementation but with 3 supplements instead of 2 (adds Calcium Carbonate).

### DQC Rules
12 DQC columns — over 100% per age group per supplement. Standard.

### Raw Inputs
Under 1 Population + IFA 3 age groups + MM 3 age groups + CC 3 age groups = **10 per location per period**

---

## File pre-5: `5__pre_anemia_screening_nir.xlsx`
**Tracks:** Pregnant women tested for CBC/Hgb and diagnosed with Anemia

### Denominator — Two Denominators in One File
- Group 1 (Tested): Denominator = Under 1 Population (col 3)
- Group 2 (Diagnosed): Denominator = **Tested count per age group** (chained)

This is the same chained denominator pattern seen in Geriatric Health and Intra Partum.

```
Tested % = Tested / Under 1 Population
Diagnosed % = Diagnosed / Tested (same age group)
```

So the Anemia diagnosis rate is measured as a percentage of those who were actually tested — not of total population. This is clinically correct.

### DQC Rules
8 DQC columns — all check ≤ 100% against Under 1 population (col 3).

**Note:** DQC checks for Group 2 use Under 1 population as denominator (cols 24-27 show `f/a`, `g/a`, `h/a`, `i/a`), not the tested count. This means the DQC rule is less strict than the actual formula — the formula uses tested count but the DQC only checks against population. No error, just a design choice in the template.

### Raw Inputs
Under 1 Population + Tested 3 age groups + Diagnosed 3 age groups = **7 per location per period**

---

## File pre-6: `6__pre_gd_screening_nir.xlsx`
**Tracks:** Pregnant women screened for gestational diabetes and testing positive

### Structure
Identical to Anemia screening — same 28-column layout, same two-group pattern (screened + positive), same Under 1 population denominator.

### ⚠️ DQC Formula Error — Col 25
Col 25 DQC formula: `g/h*100 <=100`

This divides the 15-19 age group by the 20-49 age group count — which makes no sense. It should be `g/a*100` (dividing by Under 1 population) to match cols 21-24 and 26-27.

This is a template formula error. System uses correct rule (g/a ≤ 100%) based on the config definition.

### Raw Inputs
Under 1 Population + Screened 3 age groups + Positive 3 age groups = **7 per location per period**

---

## File pre-7: `7__pre_deworming_nir.xlsx`
**Tracks:** Pregnant women given one dose of deworming tablet

**Simplest prenatal file.** Single indicator, 3 age groups, no chained denominator, standard DQC. Structurally identical to Post-Partum Vitamin A section of the supplementation file.

### Raw Inputs
Under 1 Population + Deworming 3 age groups = **4 per location per period**

---

## File pre-8: `8__pre_bp_measure_hpn_mngt_nir.xlsx`
**Tracks:** BP measurement during ANC visits + Hypertension referral for pregnant women

**Structurally identical to Post-Partum file `3__post_bp_measure_hpn_mngt_nir.xlsx`** — same dual group (a/b suffix), same 15-column layout, same Annual_1a/Annual_1b sheet naming, same structure throughout.

Only difference: ANC Visit instead of PNC Visit, and pregnant women instead of post-partum women.

**Raw inputs: 6 per group × 2 groups = 12 per location per period**

---

## Key Findings — Prenatal

### What Is New

**1. Pregnancy order disaggregation (Td vaccine file)**
First pregnancy vs 2nd+ pregnancy tracked separately. New disaggregation type not seen before. Config stores this as separate indicator codes: `TD_1ST_PREG` vs `TD_2ND_PLUS_PREG`.

**2. Equality DQC missing from BMI file**
Normal + Low + High BMI should sum to total pregnant women. This check is absent from the template. System adds it as a smart validation rule not in the original template.

**3. Prenatal mirrors Post-Partum structurally**
Files pre-1 and pp-1 (8ANC vs 4PNC) are identical in structure.
Files pre-8 and pp-3 (BP measurement) are identical in structure.
This confirms the config-driven approach — one config template, two indicator sets.

### Template Errors Found in This Batch

| File | Col | Error | Action |
|---|---|---|---|
| `2__pre_nutritional_status_bmi_nir.xlsx` | 21 | DQC label says "Low BMI" should be "High BMI" | Team to correct label |
| `6__pre_gd_screening_nir.xlsx` | 25 | DQC formula says g/h should be g/a | Team to correct formula |

---

## Maternal Care — Complete File Inventory

| Subfolder | # | Filename | Frequency | Cols |
|---|---|---|---|---|
| Intra Partum | 1 | intra_shp_fbd_dt_do | Q+A (3 groups) | 24/47/51 |
| Intra Partum | 2 | intra_bw | Q+A | 23 |
| Post Partum | 1 | post_4pnc | Q+A | 39 |
| Post Partum | 2 | post_supplementation | Q+A | 28 |
| Post Partum | 3 | post_bp_measure | Q+A (2 groups) | 15 |
| Prenatal | 1 | pre_8anc | Q+A | 38 |
| Prenatal | 2 | pre_nutritional_bmi | Q+A | 22 |
| Prenatal | 3 | pre_td_vaccine | Q+A | 28 |
| Prenatal | 4 | pre_supplementation | Q+A | 40 |
| Prenatal | 5 | pre_anemia_screening | Q+A | 28 |
| Prenatal | 6 | pre_gd_screening | Q+A | 28 |
| Prenatal | 7 | pre_deworming | Q+A | 16 |
| Prenatal | 8 | pre_bp_measure | Q+A (2 groups) | 15 |

**Total Maternal Care files: 13**

---

*Document continues.*
*Next program to be confirmed by user.*

---

## ANSWERS — Prenatal Template Error Verification

| File | Excel Col | Index | Error | Status |
|---|---|---|---|---|
| `2__pre_nutritional_status_bmi_nir.xlsx` | Col V | 21 | Label said "Low BMI" — should be "High BMI" | ✅ Fixed by team |
| `6__pre_gd_screening_nir.xlsx` | Col Z | 25 | Formula said g/h — should be g/a | ⏳ Team to fix |


---

## Program: Infectious Disease > Filariasis
**Subfolder under Infectious Disease. 3 files.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `1777034760634_infec_cdr_filariasis_nir.xlsx` | Case Detection Rate — NBE and RDT examination | ✅ Analyzed |
| 2 | `1777034760634_infec_filariasis_mda_nir.xlsx` | Mass Drug Administration (MDA) coverage | ✅ Analyzed |
| 3 | `1777034760635_infec_lymph_eleph_hydro_nir.xlsx` | Lymphedema + Elephantiasis + Hydrocele | ✅ Analyzed |

**Note on filename prefix:** These files have a numeric prefix (1777034760634/35) unlike all previous files. This appears to be a system-generated ID from a file management system. Parser uses full filename for template matching.

**All files: Annual only. No quarterly, no monthly.**

---

## File fil-1: `1777034760634_infec_cdr_filariasis_nir.xlsx`
**Tracks:** Lymphatic Filariasis examination and positivity rates using two test methods

### Sheet Structure
Annual + change_log only.
**Rows: 129 | Columns: 26**
**Two blank columns found: col 12 and col 22** — these are spacer columns in the Excel layout. Parser skips them.

### Two Test Methods Tracked
- **NBE** (Night Blood Examination) — microscopy-based test
- **RDT** (Rapid Diagnostic Test) — antigen-based test
- **BOTH** — combined total of NBE and RDT

### New Rate Type — Case Detection Rate (CDR)
CDR formula in the template: `A/E`, `B/R`, `C/U`

However the label references are ambiguous — A is NBE examined total, E is NBE+RDT positive total. This formula cross-mixes test methods which is clinically unusual.

**This needs clarification.** CDR should logically be: Positive / Examined for the same test method. The correct formulas should be:
- CDR NBE = NBE Positive / NBE Examined
- CDR RDT = RDT Positive / RDT Examined
- CDR Both = Combined Positive / Combined Examined

### No DQC Columns
No DQC flags present. Standard for surveillance/case detection files.

### Column Inventory

**NBE Examination (cols 3-5)**
| Col | Label | Type |
|---|---|---|
| 3 | NBE Examined Male | RAW |
| 4 | NBE Examined Female | RAW |
| 5 | A. NBE Examined Total | COMPUTED |

**RDT Examination (cols 6-8)**
| Col | Label | Type |
|---|---|---|
| 6 | RDT Examined Male | RAW |
| 7 | RDT Examined Female | RAW |
| 8 | B. RDT Examined Total | COMPUTED |

**Combined Examination (cols 9-11)**
| Col | Label | Type |
|---|---|---|
| 9 | NBE+RDT Examined Male | RAW |
| 10 | NBE+RDT Examined Female | RAW |
| 11 | C. Combined Examined Total | COMPUTED |
| 12 | *(blank spacer)* | SKIP |

**NBE Positive (cols 13-15)**
| Col | Label | Type |
|---|---|---|
| 13 | NBE Positive Male | RAW |
| 14 | NBE Positive Female | RAW |
| 15 | D. NBE Positive Total | COMPUTED |

**RDT Positive (cols 16-18)**
| Col | Label | Type |
|---|---|---|
| 16 | RDT Positive Male | RAW |
| 17 | RDT Positive Female | RAW |
| 18 | E. RDT Positive Total | COMPUTED |

**Combined Positive (cols 19-21)**
| Col | Label | Type |
|---|---|---|
| 19 | NBE+RDT Positive Male | RAW |
| 20 | NBE+RDT Positive Female | RAW |
| 21 | F. Combined Positive Total | COMPUTED |
| 22 | *(blank spacer)* | SKIP |

**Case Detection Rates (cols 23-25)**
| Col | Label | Type | Formula |
|---|---|---|---|
| 23 | CDR NBE | COMPUTED | D/A (NBE Positive / NBE Examined) |
| 24 | CDR RDT | COMPUTED | E/B (RDT Positive / RDT Examined) |
| 25 | CDR Both | COMPUTED | F/C (Combined Positive / Combined Examined) |

**Raw inputs: 3 test methods × 2 indicators (examined + positive) × 2 sex = 12 per location per period**

---

## File fil-2: `1777034760634_infec_filariasis_mda_nir.xlsx`
**Tracks:** Mass Drug Administration (MDA) coverage by age group

### ⚠️ Critical Finding — Wrong Locations
This file contains only **4 data rows** — and they are all from other regions:
- Oriental Mindoro (Region 4B)
- Zamboanga del Norte (Region 9)
- Davao Occidental (Region 11)
- Sultan Kudarat (Region 12)

**None of these are NIR locations.** This is not a regional file — it appears to be a national template that was shared or used by mistake. The NIR data is not present.

**This file cannot be ingested as-is.** It needs to be either replaced with the correct NIR version or confirmed as the correct template to be filled in with NIR data.

### Structure (for future reference when correct file is available)
Annual only. 5 rows (1 header + 4 data). 23 columns.

**3 age groups with separate population denominators:**
- 2-4 years old (col 3 population)
- 5-14 years old (col 4 population)
- 15+ years old (col 5 population)
- 2+ years old combined (col 6 population) — sum of above 3

**Two label errors in this file:**
- Col 18 label says "% aged 5-14" but it is actually "% aged 15 and above"
- Cols 19-22 reuse variable names (e)(f) already used in cols 15-18 — copy-paste error

### ⚠️ Multiple Population Denominators — New Pattern
4 age-group-specific projected populations in one file, each as a separate raw input column. This is the most population columns seen in a single file.

---

## File fil-3: `1777034760635_infec_lymph_eleph_hydro_nir.xlsx`
**Tracks:** Three chronic filariasis conditions — Lymphedema, Elephantiasis, and Hydrocele

### Sheet Structure
Annual + change_log
**Rows: 129 | Columns: 33**
**Two blank spacer columns: col 15 and col 28**

### Three Conditions in One File
1. **Lymphedema** (cols 3-14) — affects all sexes
2. **Elephantiasis** (cols 16-27) — affects all sexes
3. **Hydrocele** (cols 29-32) — **male only**

### Each Condition Tracked by 4 Age Groups
- 2-4 years old
- 5-14 years old
- 15+ years old
- 2+ years old (combined total)

### Hydrocele — Male Only, No Age Group % 
Hydrocele is a male-specific condition. Only Male columns exist — no Female. Also no percentage column — count only.

### Duplicate Variable Names
Elephantiasis section reuses variable names (g)(h) that were already used in Lymphedema section — copy-paste error in template labels. Column positions are correct; labels are wrong. Parser uses column position.

### No DQC Columns
No validation flags. Surveillance data only.

### Column Inventory Summary

**Lymphedema (cols 3-14)**
3 age groups × Male/Female + combined age group × Male/Female = 8 raw inputs + 4 computed totals

**Elephantiasis (cols 16-27)**
Same structure as Lymphedema = 8 raw inputs + 4 computed totals

**Hydrocele (cols 29-32)**
3 age groups × Male only (no female) + total = 3 raw inputs + 1 computed total

**Raw inputs total: 8 + 8 + 3 = 19 per location per period**

---

## Key Findings — Filariasis

### What Is New

**1. MDA file has wrong locations — needs replacement**
The MDA file contains data from other regions. NIR data is absent. This file must be confirmed or replaced before ingestion design can proceed.

**2. Blank spacer columns**
CDR file has blank cols 12 and 22. Lymph file has blank cols 15 and 28. These are formatting spacers in the Excel layout. Parser config explicitly lists columns to read and skips blanks.

**3. Multiple age-group population denominators (MDA)**
4 separate projected population columns for 4 age groups. Most age-group-specific denominators in a single file. Handled by config — each age group indicator references its own population column.

**4. Hydrocele — Male only, no percentage**
First indicator with a medical reason for male-only tracking. Stored as male raw inputs only. No computed percentage.

**5. CDR formula label ambiguity**
Template labels use unclear variable references (A/E, B/R, C/U). Correct formulas confirmed as Positive/Examined per test method. Config defines correct formula explicitly.

---

## Open Questions — Filariasis

| ID | File | Question |
|---|---|---|
| Q-fil-1 | `infec_filariasis_mda_nir.xlsx` | This file contains data from other regions (Region 4B, 9, 11, 12) — not NIR. Is this the correct file? Do you have a NIR-specific MDA file? |
| Q-fil-2 | `infec_cdr_filariasis_nir.xlsx` | CDR formula labels say A/E, B/R, C/U which cross-mix test methods. We will use Positive/Examined per method. Is this correct? |


---

## PARKED — Filariasis MDA File
`1777034760634_infec_filariasis_mda_nir.xlsx` is excluded from ingestion design.
File contains data from other regions (4B, 9, 11, 12) — not NIR.
To be revisited when correct NIR version is available.

---

## Program: Infectious Disease > HIV-Syphilis-HepaB
**Subfolder under Infectious Disease. 3 files.**

| # | Filename | Indicator | Cols | Status |
|---|---|---|---|---|
| 1 | `1777036003394_infec_hepatitisb_nir.xlsx` | Hepatitis B screening in pregnant women | 14 | ✅ |
| 2 | `1777036003395_infec_hiv_nir.xlsx` | HIV screening in pregnant women | 14 | ✅ |
| 3 | `1777036003395_infec_syphilis_nir.xlsx` | Syphilis screening + treatment in pregnant women | 19 | ✅ |

**All files: Quarterly + Annual. No monthly.**
**Rows: 134 (not 129)**

### ⚠️ 134 Rows vs 129 — New Row Count
All previous files had 129 rows. These 3 files have 134. Investigation shows data ends at row 128 (Vista Alegre) and rows 129-133 are blank. This means 134 is the total allocated rows including 5 blank trailing rows — actual data is still 129 locations. Parser reads until blank PSGC, not a fixed row count.

### ⚠️ Col 1 is Blank Spacer
Col 0 = PSGC, Col 1 = blank, Col 2 = location name. Same spacer pattern as Filariasis CDR file. Parser skips col 1.

---

## Files hep-1 and hep-2 are Structurally Identical
`infec_hepatitisb_nir.xlsx` and `infec_hiv_nir.xlsx` have exactly the same 14-column structure. Only the disease name differs.

### Column Inventory (HepaB and HIV — 14 columns)

| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | *(blank spacer)* | SKIP | — |
| 2 | Location | META | — |
| 3 | Projected Population Under 1 | RAW | Denominator for Group A |
| 4 | Screened 10-14 | RAW | — |
| 5 | Screened 15-19 | RAW | — |
| 6 | Screened 20-49 | RAW | — |
| 7 | A. Screened Total | COMPUTED | col[4]+col[5]+col[6] |
| 8 | Screened % | COMPUTED | col[7]/col[3] |
| 9 | Reactive 10-14 | RAW | — |
| 10 | Reactive 15-19 | RAW | — |
| 11 | Reactive 20-49 | RAW | — |
| 12 | B. Reactive Total | COMPUTED | col[9]+col[10]+col[11] |
| 13 | Reactive % | COMPUTED | col[12]/col[7] ← chained: Reactive/Screened |

### DQC Rules
No DQC columns in either file. Smart validation rules to add:
- Screened ≤ 100% of Under 1 population
- Reactive ≤ 100% of Screened total

### Raw Inputs
Under 1 Population + Screened 3 age groups + Reactive 3 age groups = **7 per file per location per period**

---

## File hep-3: `1777036003395_infec_syphilis_nir.xlsx`
**Tracks:** Syphilis screening + reactive + treated — adds treatment group vs HepaB and HIV

### Same structure as HepaB/HIV for first two groups, plus a third group

| Col | Label | Type | Formula |
|---|---|---|---|
| 0-13 | Same as HepaB/HIV | — | — |
| 14 | Treated 10-14 | RAW | — |
| 15 | Treated 15-19 | RAW | — |
| 16 | Treated 20-49 | RAW | — |
| 17 | C. Treated Total | COMPUTED | col[14]+col[15]+col[16] |
| 18 | Treated % | COMPUTED | col[17]/col[12] ← chained: Treated/Reactive |

### Chained Denominator Chain — 3 Levels
```
Screened % = Screened / Under 1 Population
Reactive % = Reactive / Screened Total
Treated %  = Treated  / Reactive Total
```

This is the deepest denominator chain seen so far — 3 levels. Each group's percentage uses the previous group's total as denominator. Computation must be in sequence.

### Raw Inputs
Under 1 Population + Screened 3 age groups + Reactive 3 age groups + Treated 3 age groups = **10 per location per period**

---

## Key Findings — HIV-Syphilis-HepaB

### What Is New

**1. HepaB and HIV are structurally identical**
One parser config handles both. Only disease name and indicator codes differ.

**2. Syphilis has 3-level chained denominator**
Deepest chained denominator chain in the entire dataset. Computation order: Screened → Reactive → Treated. Each level's total feeds the next level's denominator.

**3. 134 rows instead of 129**
5 trailing blank rows after the last location. Parser must stop reading at blank PSGC, not at fixed row index. This is a new parser requirement — `stop_at_blank_psgc: true` in config.

**4. Blank col 1 spacer**
Same as Filariasis CDR file. Parser skips explicitly.

**5. Sensitive data confirmed**
HIV and Syphilis reactive cases are PHI. These indicators must be flagged in the `indicators` table as sensitive. RBAC must restrict who can view disaggregated reactive counts at barangay or municipality level.

### Schema Flag
**FLAG hiv-1 — Sensitive indicator flag**
The `indicators` table needs an `is_sensitive` boolean column. Indicators flagged as sensitive get additional RBAC checks at the API level — only authorized roles can retrieve disaggregated data. Dashboard displays aggregated totals only for unauthorized roles.

---

*Document continues.*
*Next subfolder under Infectious Disease.*

---

## Program: Infectious Disease > Leprosy
**Subfolder under Infectious Disease. 1 file.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `infec_leprosy_nir.xlsx` | Leprosy prevalence + detection + treatment + disability | ✅ Analyzed |

---

## File lep-1: `infec_leprosy_nir.xlsx`

### Sheet Structure — 5 Annual Sheets
| Sheet | Rows | Cols | Content |
|---|---|---|---|
| Annual | 129 | 42 | Registered cases (prevalence) + Newly detected (CDR) |
| Annual1 | 129 | 20 | Confirmed cases by age group |
| Annual2 | 131 | 19 | Confirmed cases treated |
| Annual3 | 131 | 19 | Confirmed cases completed MDT |
| Annual4 | 131 | 24 | Grade 2 disability (newly diagnosed) |
| change_log | — | — | Not imported |

**Frequency: Annual only.**
**Annual2, Annual3, Annual4 have 131 rows — 2 trailing blank rows. Parser stops at blank PSGC.**

### Most Complex Single File Seen
5 independent data sheets in one file. Each sheet tracks a different stage of the leprosy care cascade:
1. **Annual** — Registered (prevalence) + Newly Detected (incidence)
2. **Annual1** — Confirmed cases (subset of registered)
3. **Annual2** — Confirmed cases receiving treatment
4. **Annual3** — Confirmed cases completing full MDT course
5. **Annual4** — Grade 2 disability among newly detected

This is a longitudinal care pathway — each sheet's data is clinically related to the previous.

### New Rate Multiplier — Per 10,000 Population
Prevalence Rate formula: `(Total / Projected Population) × 10,000`

This is the 4th rate multiplier type:
- ×100 = percentage
- ×1,000 = IMR
- ×100,000 = MMR, CDR
- ×10,000 = Leprosy prevalence rate ← new

### Blank Spacer Columns
Annual sheet: cols 7, 24, 37 are blank spacers
Annual1 sheet: col 7 is blank spacer
Annual4 sheet: col 7 is blank spacer
Parser skips all explicitly.

### Cross-Sheet Denominator Dependency
Annual2 and Annual3 track treatment percentages but have **no population columns**. Their denominators must come from Annual1 (confirmed cases total per age group).

```
Annual2 % treated = Annual2 treated / Annual1 confirmed (same age group)
Annual3 % MDT completed = Annual3 MDT / Annual1 confirmed (same age group)
```

This is the first **cross-sheet denominator dependency within one file**. The parser must process Annual1 before Annual2 and Annual3, and store the confirmed case totals as intermediate values to compute the percentages.

Annual4 % Grade 2 disability uses the projected population from its own population columns (cols 3-6) — independent of other sheets.

### Age Groups — New Age Split
Leprosy uses a different age split from all other programs:
- 0-14 years old
- 15-18 years old ← new — this specific bracket not seen before
- 19 years old and above

### Column Inventory Summary

**Annual Sheet (42 cols — 3 spacers = 39 data cols)**

*Registered Cases — Prevalence (cols 3-23):*
4 projected populations + 3 age groups × (Male/Female/Total/Rate) + All Ages (Male/Female/Total/Rate)

*Newly Detected Cases — CDR (cols 25-41 — 1 spacer):*
3 age groups × (Male/Female/Total/CDR) + All Ages (Male/Female/Total/CDR)

**Annual1 Sheet (20 cols — 1 spacer = 19 data cols)**
4 projected populations + 3 age groups × (Male/Female/Total) + All Ages (Male/Female/Total)

**Annual2 Sheet (19 cols)**
3 age groups × (Male/Female/Total/%) + All Ages (Male/Female/Total/%)
No population columns — denominator from Annual1.

**Annual3 Sheet (19 cols)**
Same structure as Annual2. MDT completion instead of treatment started.

**Annual4 Sheet (24 cols — 1 spacer = 23 data cols)**
4 projected populations + 3 age groups × (Male/Female/Total/%) + All Ages (Male/Female/Total/%)

### DQC Rules
No DQC columns in any sheet. Surveillance data — no threshold validation.
Smart rules to add:
- Confirmed (Annual1) ≤ Registered (Annual)
- Treated (Annual2) ≤ Confirmed (Annual1)
- MDT Completed (Annual3) ≤ Treated (Annual2)
- Grade 2 disability (Annual4) ≤ Newly Detected (Annual)

These form a logical cascade — each stage cannot exceed the previous.

### Raw Inputs Per Sheet
- Annual: 4 populations + 3 age groups × 2 sex × 2 groups (registered + newly detected) = 16
- Annual1: 4 populations + 3 age groups × 2 sex = 10
- Annual2: 3 age groups × 2 sex = 6
- Annual3: 3 age groups × 2 sex = 6
- Annual4: 4 populations + 3 age groups × 2 sex = 10

**Total raw inputs: 48 per location per year**

---

## Key Findings — Leprosy

### What Is New

**1. 5 sheets = 5 stages of the care cascade in one file**
Each sheet represents one step: Registered → Confirmed → Treated → MDT Completed → Disability. The parser must treat each sheet as an independent template config but maintain the clinical relationship for smart validation.

**2. Cross-sheet denominator dependency**
Annual2 and Annual3 percentages use Annual1 confirmed totals as denominator. The system must resolve this dependency at ingestion time — store intermediate totals from Annual1 before computing Annual2/Annual3 percentages.

**3. Rate per 10,000 population**
4th rate multiplier confirmed. Config stores `rate_multiplier: 10000` for prevalence rate indicators.

**4. Care cascade DQC chain**
The 4-stage cascade (Registered → Confirmed → Treated → MDT) creates a new class of smart validation: each stage total must be ≤ the previous stage. This is a cascade validation rule, not just a per-indicator check.

**5. Age group 15-18**
New age bracket not seen in any other program. This is specific to the leprosy surveillance protocol.

### Schema Flag
**FLAG lep-1 — Cascade validation rules**
The `validation_rules` config must support cascade rules: Stage N total ≤ Stage N-1 total, across sheets within the same file upload for the same location and period.

---

*Document continues.*
*Next subfolder under Infectious Disease.*

---

## Program: Infectious Disease > Rabies
**Subfolder under Infectious Disease. 2 files.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `infec_rabies_nir.xlsx` | Rabies exposure categories + treatment | ✅ Analyzed |
| 2 | `animal_bites_nir.xlsx` | Animal bite counts + rabies deaths | ✅ Analyzed |

---

## File rab-1: `infec_rabies_nir.xlsx`
**Tracks:** Rabies exposure by category + treatment coverage

### Sheet Structure — 4 Groups, Mixed Naming
| Group | Sheets | Content | Cols |
|---|---|---|---|
| (none) | Qtr1–Qtr4, Annual | Category I, II, III exposure counts | 17 |
| a | Qtr1a–Qtr4a, Annual1 | Category II — vaccine treatment | 17 |
| b | Qtr1b–Qtr4b, Annual2 | Category III — ARV+RIG treatment | 24 |
| d | Qtr1d–Qtr4d, Annual3 | Exposure by animal source (dog/cat/other) | 22 |

**Frequency: Quarterly + Annual.**
**Note — Group 'c' is missing.** Sheet names jump from group b to group d. No Qtr1c exists. This may be intentional (group c was removed in a template revision) or an error. Needs clarification.

### ⚠️ Qtr1 Label Inconsistency
Qtr1 col 12 label: `"D. Rabies Exposure (all category)"` with number prefix "D."
Qtr2-Qtr4 and Annual col 12 label: `"4. Rabies Exposure (all category)"` with number prefix "4."
Data structure is identical. Label inconsistency only — parser uses column position.

### ⚠️ Cols 15-16 in Base Sheets are Blank
Cols 15 and 16 in Qtr1-Qtr4 and Annual are blank. These are trailing spacers. Parser stops at col 14.

### Group (none) — Exposure Counts (17 cols, 2 blank at end)

**3 exposure categories × Male/Female/Total:**
| Category | Male Col | Female Col | Total Col |
|---|---|---|---|
| Category I | 3 | 4 | 5 |
| Category II | 6 | 7 | 8 |
| Category III | 9 | 10 | 11 |
| All Categories (D) | 12 | 13 | 14 |

No DQC, no percentage. Count data only.

**Raw inputs: 3 categories × 2 sex = 6 per location per period**

---

### Group a — Category II Vaccine Treatment (17 cols)

**New DQC type — cross-column inequality checks:**
- `a ≤ c` — Cat II Eligible (male) ≤ Cat II Exposure (male)
- `b ≤ d` — Cat II Eligible (female) ≤ Cat II Exposure (female)
- `e ≤ a` — Cat II vaccinated (male) ≤ Cat II Eligible (male)
- `f ≤ b` — Cat II vaccinated (female) ≤ Cat II Eligible (female)

These are sex-specific cross-column checks — more granular than any DQC seen before.

**Denominator:** Eligible for vaccine (not total exposure) — chained denominator.

| Col | Label | Type |
|---|---|---|
| 3-4 | Cat II Exposure Male/Female | RAW |
| 5 | A. Cat II Exposure Total | COMPUTED |
| 6-7 | Eligible for ARV Male/Female | RAW |
| 8 | B. Eligible Total | COMPUTED — denominator for % |
| 9-10 | Completed ARV Male/Female | RAW |
| 11 | C. Completed ARV Total | COMPUTED |
| 12 | % Completed (C/B) | COMPUTED |
| 13-16 | DQC columns (4) | DQC |

**Raw inputs: 3 pairs × 2 sex = 6 per location per period**

---

### Group b — Category III ARV+RIG Treatment (24 cols)

**More complex than Group a.** Category III requires ARV + RIG (Rabies Immunoglobulin). Tracks two treatment pathways:
- No prior vaccine history → ARV+RIG
- With prior vaccine history → ARV only

**DQC Rules — Group b:**
- `B + D = E Total` — (without history) + (with history) = all Cat III exposures. **Equality DQC.**
- `A ≤ B` — ARV+RIG received ≤ without history
- `C ≤ D` — ARV completed ≤ with history
- `A + C ≤ E Total` — total treated ≤ total Cat III exposures

**Raw inputs: 5 pairs × 2 sex = 10 per location per period**

---

### Group d — Exposure by Animal Source (22 cols)

**New disaggregation — Animal type:**
Dogs, Cats, Other animals. First time animal species is a disaggregation dimension.

**Denominator:** Total exposure all categories (col 5) — from base group.

**DQC Rules:**
- Dogs % ≤ 100%
- Cats % ≤ 100%
- Others % ≤ 100%
- `SUM(A+B+C) = D` — equality DQC: dogs + cats + others = total exposures

**Raw inputs: 3 animal types × 2 sex = 6 per location per period**

---

## File rab-2: `animal_bites_nir.xlsx`
**Tracks:** Total animal bite counts and rabies deaths

### ⚠️ Unique Structure — Multi-Row Title Header
This file has a 5-row title block before the actual header row:
- Row 0: "Rabies"
- Row 1: "Number of Animal Bites and Deaths Due to Rabies"
- Row 2: "Philippines, 2026"
- Row 3: blank
- Row 4: "1st Quarter" (quarter label)
- Row 5: actual column headers ← data header starts here
- Row 6: blank
- Row 7+: data rows

**Parser must skip rows 0-6 and use row 5 as the header.**

Also note: **Row 2 says "Philippines, 2026"** — this is a national template. Similar to the MDA Filariasis file. However this file does contain NIR data (NIRA appears in row 7). The national title is a template artifact.

### Sheet Structure
Qtr1–Qtr4 + Annual. **No change_log sheet.**
**Rows: 140 | Columns: 10**

### Minimal Structure — 6 Data Columns
| Col | Label | Type | Formula |
|---|---|---|---|
| 0 | PSGC10 | META | — |
| 1 | Region | META — always "NIRA" |
| 2 | Province/HUC/ICC | META — location name |
| 3 | Animal Bites Male | RAW | — |
| 4 | Animal Bites Female | RAW | — |
| 5 | Animal Bites Total | COMPUTED | col[3]+col[4] |
| 6 | Rabies Deaths Male | RAW | — |
| 7 | Rabies Deaths Female | RAW | — |
| 8 | Rabies Deaths Total | COMPUTED | col[6]+col[7] |
| 9 | Rate | COMPUTED | (Deaths/Bites) × multiplier |

**Rate multiplier unknown — no label specifies per 100, 1,000, or 100,000.** Needs clarification.

### No DQC Columns
Rabies Deaths ≤ Animal Bites is an implicit logical rule the system will add as a smart validation.

### Raw Inputs
Animal Bites Male/Female + Rabies Deaths Male/Female = **4 per location per period**

---

## Key Findings — Rabies

### What Is New

**1. Group 'c' missing from sheet naming**
Sheet groups jump from b to d. Either intentional or template revision artifact. Needs confirmation.

**2. Sex-specific cross-column DQC (Group a)**
`a ≤ c` and `b ≤ d` — DQC checks comparing the same sex across different indicators. More granular than any previous DQC rule.

**3. Animal type as disaggregation dimension (Group d)**
Dogs, cats, other animals. First non-human, non-administrative disaggregation type.

**4. Multi-row title header (animal_bites file)**
Parser must skip 6 rows before reaching the actual column headers. Config needs `header_row: 5` and `data_start_row: 7`.

**5. National template with regional data**
Animal bites file title says "Philippines" but contains NIR data. Parser uses PSGC codes to identify locations — title is ignored.

**6. Rate multiplier unknown in animal bites file**
Col 9 Rate formula not labeled with its multiplier. Needs clarification.

---

## Open Questions — Rabies

| ID | File | Question |
|---|---|---|
| Q-rab-1 | `infec_rabies_nir.xlsx` | Group 'c' sheets are missing — the file jumps from group b to group d. Is this intentional or were group c sheets removed by mistake? |
| Q-rab-2 | `animal_bites_nir.xlsx` | Col 9 Rate — what is the multiplier? Per 100, per 1,000, or per 100,000 bites? |


---

## UPDATES — Rabies

| ID | Item | Status |
|---|---|---|
| Q-rab-1 | Missing group c sheets | ⏳ Pending — question rephrased and sent to user |
| Q-rab-2 | Animal bites Rate multiplier | ⏳ Parked — animal_bites_nir.xlsx parked for now |
| animal_bites | File status | Parked — to be revisited later |


## Q-rab-1 ANSWERED
Group c sheets were intentionally removed from the template. Sheet naming jumping from b to d is correct as-is. Parser config maps sheets explicitly — no gap detection needed.


---

## Program: Infectious Disease > Schistosomiasis
**Subfolder under Infectious Disease. 7 files.**

| # | Filename | Age Group | Sheet Groups | Status |
|---|---|---|---|---|
| 1 | `infec_schisto_mda_nir.xlsx` | 5-14, 15-19, 20-59, 60+ | Q+A only | ✅ |
| 2 | `infec_schisto_1-4_nir.xlsx` | 1-4 years | base + a + b | ✅ |
| 3 | `infec_schisto_5-14_nir.xlsx` | 5-14 years | base + a + b + c + d + e | ✅ |
| 4 | `infec_schisto_15-19_nir.xlsx` | 15-19 years | base + a + b + c + d + e | ✅ |
| 5 | `infec_schisto_20-59_nir.xlsx` | 20-59 years | base + a + b + c + d + e | ✅ |
| 6 | `infec_schisto_60above_nir.xlsx` | 60+ years | base + a + b + c + d + e | ✅ |
| 7 | `infec_schisto_by_treatment_nir.xlsx` | All ages | base + a | ✅ |

**All files: Quarterly + Annual.**

---

## Key Design Observation — One File Per Age Group

Schistosomiasis uses a different architecture from all previous programs. Instead of one file with multiple age groups as columns, **each age group gets its own file**. This means:

- 5 separate age group files (1-4, 5-14, 15-19, 20-59, 60+)
- Each file tracks the same care cascade for that age group
- 1-4 year olds have fewer sheet groups (less clinical complexity)
- 5-14 through 60+ have identical 5-group sheet structure

This is clinically sensible — treatment protocols differ by age. It is structurally simple for us — all age group files follow the same config pattern, just with different age labels.

---

## File sch-1: `infec_schisto_mda_nir.xlsx`
**Tracks:** Mass Drug Administration (Praziquantel) coverage by age group

### ⚠️ Only 38 Rows — Schistosomiasis Endemic Areas Only
Unlike all other files with 129 rows (all NIR locations), this file has only 38 rows. Investigation shows locations are NIR, Negros Occidental, Negros Oriental, Siquijor — only province and region-level aggregates, plus specific endemic municipalities.

Schistosomiasis MDA is only done in endemic areas — not all municipalities. This is correct and expected.

**Parser must not validate row count against the standard 129. Stop at blank PSGC.**

### 4 Age Groups in One File — 5 Projected Populations
Cols 2-6: Population for 5-14, 15-19, 20-59, 60+, and 5+ combined
Each age group: Male / Female / Total / %

### Blank Spacer Columns
Cols 11, 16, 21, 26 are blank spacers between age group sections.

### No DQC Columns
No validation flags. Coverage data only.

### Raw Inputs
5 population columns + 4 age groups × 2 sex = **13 per location per period**

---

## Files sch-2 to sch-6: Age Group Files (1-4, 5-14, 15-19, 20-59, 60+)

All 5 age group files share the same base structure. Files sch-3 to sch-6 (5-14 through 60+) are identical in sheet group structure. File sch-2 (1-4) has fewer groups because younger children have simpler clinical pathways.

### Blank Col 6 in Base Sheets
Col 6 is a blank spacer in all base (no-suffix) sheets. Parser skips it.

### Sheet Groups — Care Cascade

| Group | Content | Cols | Denominator |
|---|---|---|---|
| base (no suffix) | Patients seen + Clinical/suspected cases | 11 | Patients seen |
| a | Clinical cases treated + Cured | 12 | Clinical cases |
| b | Confirmed Complicated + Non-Complicated cases | 15 | Clinical cases |
| c | Confirmed cases treated (Complicated + Non-Complicated) | 17 | Confirmed cases |
| d | Confirmed cases cured (Complicated + Non-Complicated) | 17 | Confirmed cases |
| e | Confirmed Complicated cases referred to hospital | 7 | Confirmed complicated cases |

**Groups c and e are absent in the 1-4 file** — simpler care pathway for young children.

### Care Cascade Chain
```
Patients Seen (base)
  → Clinical/Suspected Cases (base) — chained denominator from Patients Seen
    → Treated (group a) — chained from Clinical cases
    → Cured (group a) — chained from Clinical cases
    → Confirmed Complicated (group b) — chained from Clinical cases
    → Confirmed Non-Complicated (group b) — chained from Clinical cases
      → Confirmed Treated (group c) — chained from Confirmed cases
      → Confirmed Cured (group d) — chained from Confirmed cases
      → Referred to Hospital (group e) — chained from Confirmed Complicated only
```

This is the deepest care cascade chain in the entire dataset — 5 levels deep.

### ⚠️ Template Errors Found in Age Group Files

**Qtr1d (Cured) — col 9 label says "Male (d)" twice:**
Col 9 in group d says "Male (d)" when it should say "Female (d)". Copy-paste label error. Parser uses column position.

**Qtr1b — col 4 label says "Female (a)" should be "Female (b)":**
Copy-paste error in the confirmed cases sheet. Same pattern we have seen before.

### Raw Inputs Per Age Group File (groups base + a + b + c + d + e)
- Base: Patients Seen M/F + Clinical Cases M/F = 4
- Group a: Treated M/F + Cured M/F = 4
- Group b: Complicated M/F + Non-Complicated M/F = 4
- Group c: Complicated Treated M/F + Non-Complicated Treated M/F = 4
- Group d: Complicated Cured M/F + Non-Complicated Cured M/F = 4
- Group e: Complicated Referred M/F = 2

**Total: 22 raw inputs per age group per location per period**
**× 5 age group files = 110 raw inputs per location per period across all age groups**

---

## File sch-7: `infec_schisto_by_treatment_nir.xlsx`
**Tracks:** Treatment type — 1st treatment vs retreatment, all ages combined

### Sheet Structure
Base (Qtr1–Qtr4, Annual) + Group a (Qtr1a–Qtr4a, Annual1)
**Rows: 129 | No change_log sheet**

### Base Sheet — Treatment Count by Type (12 cols)
| Col | Label | Type |
|---|---|---|
| 3-4 | 1st Treatment Male/Female | RAW |
| 5 | A. 1st Treatment Total | COMPUTED |
| 6-7 | Retreatment Male/Female | RAW |
| 8 | B. Retreatment Total | COMPUTED |
| 9-10 | Combined (1st + Retreatment) Male/Female | RAW |
| 11 | C. Combined Total | COMPUTED |

**New disaggregation — Treatment sequence (1st treatment vs retreatment)**

### Group a Sheet
Additional breakdown of retreatment outcomes. Same 12-column structure.

### Raw Inputs
1st Treatment M/F + Retreatment M/F + Combined M/F = **6 per location per period**

---

## Key Findings — Schistosomiasis

### What Is New

**1. One file per age group**
5 separate files for 5 age groups. Each file has the same config template — just different age labels. The database stores all in the same `health_data` table with the age group encoded in the indicator code.

**2. Endemic areas only (MDA file)**
Only 38 rows instead of 129. Not all municipalities have schistosomiasis. Parser stops at blank PSGC — row count is not fixed.

**3. Deepest care cascade — 5 levels**
Patients Seen → Clinical Cases → Confirmed → Treated/Cured → Referred. Each level's total feeds the next as denominator. Computation order is strictly enforced.

**4. Treatment sequence disaggregation**
1st treatment vs retreatment. New disaggregation type. Important for tracking disease recurrence.

**5. 1-4 year old file has fewer groups**
Groups c and e absent for youngest age group. Config handles this by defining fewer sheet groups for that file.

### Action Items for Team

| File | Issue |
|---|---|
| `infec_schisto_5-14_nir.xlsx` (and likely all age files) | Qtr1d col 9 label says "Male (d)" should be "Female (d)" |
| `infec_schisto_5-14_nir.xlsx` (and likely all age files) | Qtr1b col 4 label says "Female (a)" should be "Female (b)" |

---

## Infectious Disease — Complete Subfolder Inventory

| Subfolder | Files | Status |
|---|---|---|
| Filariasis | 3 (1 parked) | ✅ |
| HIV-Syphilis-HepaB | 3 | ✅ |
| Leprosy | 1 | ✅ |
| Rabies | 2 (1 parked) | ✅ |
| Schistosomiasis | 7 | ✅ |

---

*Document continues.*
*Next subfolder under Infectious Disease or next program.*

---

## Schistosomiasis Template Errors — Logged
Errors confirmed as typographical only. Parser uses column position not labels. Team to correct when available.

| File | Sheet | Excel Col | Error | Fix |
|---|---|---|---|---|
| `infec_schisto_5-14_nir.xlsx` | Qtr1b | Col D | Female (a) → Female (b) | ⏳ Team to fix |
| `infec_schisto_15-19_nir.xlsx` | Qtr1b | Col D | Female (a) → Female (b) | ⏳ Team to fix |
| `infec_schisto_20-59_nir.xlsx` | Qtr1b | Col D | Female (a) → Female (b) | ⏳ Team to fix |
| `infec_schisto_60above_nir.xlsx` | Qtr1b | Col D | Female (a) → Female (b) | ⏳ Team to fix |
| `infec_schisto_5-14_nir.xlsx` | Qtr1d | Col J | Male (d) → Female (d) | ⏳ Team to fix |
| `infec_schisto_15-19_nir.xlsx` | Qtr1d | Col J | Male (d) → Female (d) | ⏳ Team to fix |
| `infec_schisto_20-59_nir.xlsx` | Qtr1d | Col J | Male (d) → Female (d) | ⏳ Team to fix |
| `infec_schisto_60above_nir.xlsx` | Qtr1d | Col J | Male (d) → Female (d) | ⏳ Team to fix |

---

## Program: Infectious Disease > STH (Soil-Transmitted Helminthiasis)
**Last subfolder under Infectious Disease. 2 files.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `infec_sth_screen_susp_confirm_treated_nir.xlsx` | STH screening + suspected + confirmed + treated | ✅ Analyzed |
| 2 | `infec_sth_deworm_services_nir.xlsx` | Deworming MDA by service delivery (School-based + Community-based) | ✅ Analyzed |

---

## File sth-1: `infec_sth_screen_susp_confirm_treated_nir.xlsx`
**Tracks:** Full STH care cascade — Screened → Suspected → Confirmed → Treated

### Sheet Structure
| Group | Sheets | Content | Cols |
|---|---|---|---|
| base | Qtr1–Qtr4, Annual | Screened by age group | 34 |
| a | Qtr1a–Qtr4a, Annual1 | Suspected + Resident/Non-Resident split | 36 |
| b | Qtr1b–Qtr4b, Annual2 | Confirmed + Resident/Non-Resident split | 36 |
| c | Qtr1c–Qtr4c, Annual3 | Confirmed Treated + Resident/Non-Resident split | 34 |

**Frequency: Quarterly + Annual.**
**Rows: 129 | All sheets consistent ✅**

### New Pattern — Residency Split Within Same Sheet
Groups a, b, and c each track both total counts AND a Resident/Non-Resident breakdown in the same sheet.

The Resident + Non-Resident subtotals must equal the overall total — enforced by an equality DQC:
- Groups a and b: `DQC (G+H) = F` — Resident + Non-Resident = Total
- Group c: No DQC column but same rule applies logically

### 5 Age Groups + All Ages in Every Group Sheet
Each sheet tracks: 1-4, 5-14, 15-19, 20-59, 60+ and All Ages combined.
All age groups in columns (not separate files like Schistosomiasis).

### ⚠️ Label Error — Base Sheet Col 17
Col 17 label says `"% SCREENED 5-19 y.o"` — should be `"% SCREENED 5-14 y.o"`. The 15-19 group is tracked separately in cols 18-21. Typographical error confirmed.

### Blank Spacer Columns
Base sheet: col 9 blank
Group a and b sheets: cols 27 and 34 blank
Group c sheet: col 27 blank

### Column Inventory Summary

**Base — Screened (34 cols, 1 spacer)**
6 populations + 5 age groups × (Male/Female/Total/%) + All Ages (Male/Female/Total/%)

**Groups a, b — Suspected/Confirmed (36 cols, 2 spacers)**
5 age groups × (Male/Female/Total/%) + All Ages (Male/Female/Total/%) + Resident (Male/Female/Total) + Non-Resident (Male/Female/Total) + DQC equality check

**Group c — Treated (34 cols, 1 spacer)**
Same as a/b but without DQC column

### Care Cascade Chain
```
Screened (base) → denominator: Projected Population per age group
Suspected (a)   → denominator: Screened per age group
Confirmed (b)   → denominator: Suspected per age group
Treated (c)     → denominator: Confirmed per age group
```

### Raw Inputs
- Base: 6 populations + 5 age groups × 2 sex = 16
- Group a: 5 age groups × 2 sex + Resident M/F + Non-Resident M/F = 14
- Group b: same = 14
- Group c: same = 14

**Total: 58 raw inputs per location per period**

---

## File sth-2: `infec_sth_deworm_services_nir.xlsx`
**Tracks:** STH deworming MDA by delivery channel (School-based vs Community-based) for January and July rounds

### Sheet Structure
| Group | Sheets | Content | Rows | Cols |
|---|---|---|---|---|
| base | Qtr1–Qtr4 | January MDA — SB + CB | 129 | 26 |
| a | Qtr1a–Qtr4a | July MDA — SB + CB | 266 | 29 |
| Annual | Annual | Annual SB summary | 129 | — |
| Annual1 | Annual1 | Annual CB summary | 129 | — |

**Frequency: Quarterly (base = January MDA, group a = July MDA) + Annual.**

### ⚠️ Two Critical Findings

**Finding 1 — Group a has 266 rows**
Base sheets have 129 rows. Group a (July MDA) has 266 rows — exactly 129 × 2 + 8 blank separators. This means July MDA sheets have **two data blocks** — one for each round or one for SB and one for CB stacked vertically. Needs clarification.

**Finding 2 — Deworm Col 1 = 0 (not a spacer)**
Unlike other files where col 1 is blank (NaN), this file has col 1 = 0 in the header row. This is unusual. Parser must handle this explicitly — it is not a real data column.

### Two Delivery Channels in One Sheet
- **School-based (SB):** Deworming done in schools
- **Community-based (CB):** Deworming done in communities

Both tracked for same age groups (1-4, 5-14, 15-19). CB includes a percentage column, SB does not.

### 3 Age Groups Only
Unlike STH screening file which covers all ages, deworming covers only 1-4, 5-14, and 15-19. Adults are not part of the school deworming program.

### January vs July MDA
STH deworming is done twice yearly — January and July. Base sheets = January, Group a = July. This is the first file where two separate MDA rounds are tracked in different sheet groups within the same file.

### Raw Inputs (Base — January MDA)
3 populations + SB 2 age groups × M/F + CB 3 age groups × M/F = **15 per location per period**

---

## Key Findings — STH

### What Is New

**1. Residency split within same sheet (sth-1)**
Resident and Non-Resident subtotals tracked alongside the overall total. Equality DQC enforces `Resident + Non-Resident = Total`. New pattern not seen before.

**2. January vs July MDA rounds (sth-2)**
Two deworming rounds per year tracked in separate sheet groups. Not monthly, not quarterly — event-based scheduling. Config defines these as round-1 and round-2 periods rather than calendar quarters.

**3. 266 rows in July MDA sheets**
Needs clarification — two data blocks stacked vertically or duplicate structure.

**4. Label error in base sheet col 17**
Says "5-19 y.o." should be "5-14 y.o." — typographical, parser uses column position.

---

## Open Questions — STH

| ID | File | Question |
|---|---|---|
| Q-sth-1 | `infec_sth_deworm_services_nir.xlsx` | Group a (July MDA) has 266 rows vs 129 in base. Are there two data blocks stacked in one sheet, or is this a different structure? |

---

## Infectious Disease — Complete Subfolder Inventory

| Subfolder | Files | Analyzed |
|---|---|---|
| Filariasis | 3 (1 excluded) | ✅ |
| HIV-Syphilis-HepaB | 3 | ✅ |
| Leprosy | 1 | ✅ |
| Rabies | 2 (1 parked) | ✅ |
| Schistosomiasis | 7 | ✅ |
| STH | 2 | ✅ |
| **Total Infectious Disease** | **18 (2 excluded/parked)** | ✅ |


---

## Q-sth-1 ANSWERED — STH Deworm 266 Row Sheets

The 266-row sheets are not two stacked blocks. They simply contain more location rows — additional municipalities beyond the standard 129. The July MDA round tracks more granular geographic data than January.

**Corrected sheet structure:**

| Sheets | Rows | Cols | Content |
|---|---|---|---|
| Qtr1, Qtr2 | 129 | 26 | January MDA — SB + CB |
| Qtr3, Qtr4 | 266 | 29 | July MDA — SB + CB (more locations) |
| Qtr1a, Qtr2a | 266 | 29 | July MDA — additional indicators |
| Qtr3a, Qtr4a | 129 | 26 | January MDA — additional indicators |
| Annual | 129 | 29 | Annual summary |
| Annual1 | 129 | 26 | Annual summary group |

**Parser rule:** Stop at blank PSGC. Row count is not fixed — 129 or 266 depending on sheet.


---

## Program: Family Planning
**No subfolders. 1 file.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `FP_nir.xlsx` | FP acceptors by method — CUB, NA, OA, DO, CUE + Demand Satisfied | ✅ Analyzed |

---

## File fp-1: `FP_nir.xlsx`

### Sheet Structure
| Sheet | Rows | Cols | Indicator |
|---|---|---|---|
| CUB_Qtr | 513 | 69 | Current User Beginning — Quarterly |
| CUB_A | 129 | 69 | Current User Beginning — Annual |
| NA_Qtr | 513 | 69 | New Acceptor — Quarterly |
| NA_A | 129 | 69 | New Acceptor — Annual |
| OA_Qtr | 513 | 71 | Other Acceptor — Quarterly |
| OA_A | 129 | 69 | Other Acceptor — Annual |
| DO_Qtr | 513 | 70 | Drop Out — Quarterly |
| DO_A | 129 | 69 | Drop Out — Annual |
| CUE_Qtr | 513 | 72 | Current User Ending — Quarterly |
| CUE_A | 129 | 71 | Current User Ending — Annual |
| Demand Satisfied | 513 | 8 | Demand Satisfied — Quarterly |
| Population | 68 | 6 | WRA + Total Demand Factor reference |
| change_log | — | — | Not imported |

**Frequency: Quarterly + Annual.**

---

### ⚠️ Most Structurally Different File in Entire Dataset

This file breaks from every pattern we have seen. Three fundamental differences:

**Difference 1 — Quarter as a row value (513 rows = 129 × 4)**
All quarterly sheets use the same pattern as Oral Health — all 4 quarters in one sheet with a `Quarter` column (col 4) containing Q1/Q2/Q3/Q4. Annual sheets have 129 rows.

**Difference 2 — Indicator as a row value**
Col 3 contains the FP indicator name: "Current User Beginning", "New Acceptor", etc. This means the sheet identity IS the indicator. The sheet name and col 3 are redundant. Parser uses sheet name for indicator identification.

**Difference 3 — Column names are coded abbreviations, not plain text**
All previous files used descriptive column headers. This file uses coded column names like `FSTR_BTL_1014`, `MSTR_NSV_1519`, `NM_CCM_TOTAL`. These are FP method codes with age group suffixes.

---

### FP Method Code Dictionary

All 5 indicator sheets use the same 64 data columns (cols 5-68). The column naming pattern is: `METHOD_SUBTYPE_AGEGROUP`

**Permanent Methods:**
| Code | Method |
|---|---|
| FSTR_BTL | Female Sterilization (Bilateral Tubal Ligation) |
| MSTR_NSV | Male Sterilization (No-Scalpel Vasectomy) |

**Short-Acting Methods:**
| Code | Method |
|---|---|
| Condom | Condom |
| IUD_Int | IUD (Interval) |
| IUD_PP | IUD (Post-Partum) |
| Pills_POP | Pills (Progestogen-Only) |
| Pills_COC | Pills (Combined Oral Contraceptive) |
| Injectables | Injectables |

**Long-Acting Methods:**
| Code | Method |
|---|---|
| Implants_Int | Implants (Interval) |
| Implants_PP | Implants (Post-Partum) |

**Natural Methods:**
| Code | Method |
|---|---|
| NM_CCM | Natural Method — Cervical Mucus Method |
| NM_BBT | Natural Method — Basal Body Temperature |
| NM_STM | Natural Method — Symptothermal Method |
| NM_SDM | Natural Method — Standard Days Method |
| NM_LAM | Natural Method — Lactational Amenorrhea Method |

**Total:**
| Code | Content |
|---|---|
| TOTAL_CUE | Total Current Users Ending (sum of all methods) |

**Age Group Suffixes:** `_1014` = 10-14 yrs, `_1519` = 15-19 yrs, `_2049` = 20-49 yrs, `_TOTAL` = all ages

---

### Extra Columns in Some Quarterly Sheets

**OA_Qtr and DO_Qtr — col 69: `psgc_qtr`**
An internal tracking column combining PSGC code and quarter. This is a system artifact used to link records. Parser skips it.

**CUE_Qtr — cols 70-71: `PSGC10` and `for_demand_satisfied`**
These are lookup columns used to link CUE data to the Demand Satisfied sheet. Parser skips both — they are internal references not data inputs.

---

### Demand Satisfied Sheet
**8 columns. 513 rows (129 × 4 quarters).**

| Col | Label | Type |
|---|---|---|
| 0 | PSGC10 | META |
| 1 | Areas (Regions) | META — skip |
| 2 | Location | META |
| 3 | Indicator | META — always "Demand Satisfied" |
| 4 | Quarter | META — period identifier |
| 5 | WRA × Total Demand | COMPUTED — from Population sheet |
| 6 | Current User Ending (15-49 yrs) | RAW — pulled from CUE sheet |
| 7 | % | COMPUTED — col[6]/col[5] |

**Cross-sheet dependency:** Demand Satisfied % requires WRA × Total Demand from Population sheet AND Current User Ending from CUE sheet. This is a cross-sheet computation within one file.

### Population Sheet
68 rows (province/municipality level only — no barangay). 6 columns.
- WRA (Women of Reproductive Age) 15-49 years old
- Total Demand Factor
- WRA × Total Demand Factor (computed)

This is the denominator source for Demand Satisfied. Values are mostly blank — team fills these in.

---

### Raw Inputs Per Indicator Sheet
15 FP methods × 3 age groups = **45 raw inputs per location per quarter per indicator**

**5 indicator sheets × 45 = 225 raw inputs per location per quarter**

Annual sheets: same structure, 129 rows.

---

## Key Findings — Family Planning

### What Is New

**1. Coded column headers**
First file where column names are method codes not descriptive text. The FP method dictionary above is the translation key. Parser config maps codes to human-readable indicator names.

**2. Five FP indicators as separate sheets**
CUB → NA → OA → DO → CUE represents the FP acceptor flow. Each is a separate sheet in one file. These 5 indicators are clinically linked:
```
CUB (start of period) + NA (new) + OA (other) - DO (dropouts) = CUE (end of period)
```
This is an accounting identity — the system can validate this as a cross-sheet equality DQC.

**3. Demand Satisfied uses cross-sheet computation**
Requires data from both Population sheet (WRA × Demand Factor) and CUE sheet (Current Users). Must compute in order.

**4. No DQC columns in any sheet**
No explicit DQC flags. Smart validation rules to add:
- CUB + NA + OA - DO = CUE (accounting identity)
- Each method count ≤ 100% of WRA population
- Demand Satisfied % ≤ 100%

**5. Areas column (col 1) — skip**
Same "Areas (Regions)" pattern as Oral Health. Parser skips it.

**6. OA_Qtr sheet name has trailing space**
Sheet name is `"OA_Qtr "` with a trailing space. Parser config must use exact sheet name including space, or strip whitespace on read.

### Cross-Sheet Accounting Identity
```
CUB + NA + OA - DO = CUE
```
This is the most important validation rule for Family Planning. The system checks this after all 5 sheets are uploaded for the same location and period. Any mismatch is flagged for review.

---

## FINAL PROGRAM ANALYSIS COMPLETE

All programs have now been analyzed. Family Planning is the last program.


---

## OFFICIAL INDICATOR REGISTRY — From DOH Memorandum
**Source:** FHSIS Program Indicators Extraction (NotebookLM extraction from official memorandum)
**Total official indicators: 107**

### Indicators by Program

| Program | Official Count |
|---|---|
| Child Care and Services | 26 |
| Maternal Care and Services | 22 |
| NCD Prevention and Control | 22 |
| Infectious Disease Prevention and Control | 17 |
| Family Planning Services | 5 |
| Vital Statistics | 4 |
| Demographics | 3 |
| Water, Sanitation, and Hygiene (WASH) | 3 |
| Oral Health Care and Services | 2 |
| Geriatric Health | 2 |
| Morbidity | 1 |

---

### Indicators with NO OFFICIAL DENOMINATOR (Count Only)

These 11 indicators have no denominator in the official memorandum. They are stored as raw counts only. No percentage is computed by the system.

| Indicator | Program |
|---|---|
| New Acceptors (NA) | Family Planning |
| Drop-outs (DO) | Family Planning |
| Current Users (CU) | Family Planning |
| Other Acceptors (OA) | Family Planning |
| Number of women who delivered (live birth or fetal death) | Maternal Care |
| Number of abortions | Maternal Care |
| HPV1 via Community-Based Immunization (CBI) | Child Care |
| Category I Rabies Exposure | Infectious Disease |
| Public health workers | Demographics |
| Public primary care facilities | Demographics |
| Number of live births | Vital Statistics |

---

### Key Denominator Confirmations from Official Memorandum

These resolve questions flagged during our file analysis:

| Indicator | Official Denominator | Confirms/Changes |
|---|---|---|
| BCG, HepaB, DPT, OPV, IPV, PCV | Projected population 0-11 months **current year** | ✅ Confirms |
| MMR2, FIC | Projected population 0-11 months **previous year** | ✅ Confirms our formula analysis |
| CIC | Projected population 0-11 months previous year **minus FIC** | ✅ Confirms |
| Vitamin A supp (6-11m, 12-59m) | Projected population 6-11m or 12-59m | ✅ Confirms |
| MNP, LNS-SQ (6-11m, 12-23m) | Projected population 6-11m or 12-23m | ✅ Confirms |
| Prenatal IFA, MMS, Calcium | Projected population under 1 | ✅ Confirms proxy denominator |
| Anemia diagnosis | Total tested for CBC/Hgb | ✅ Confirms chained denominator |
| GDM positive | Total screened for GDM | ✅ Confirms chained denominator |
| 8ANC completion | Women tracked during pregnancy (Resident + Trans-IN, Trans-OUT excluded) | ✅ Confirms |
| 4PNC completion | Women due for PNC (same formula) | ✅ Confirms |
| BP measured (ANC/PNC) | Total women with ANC/PNC visits | ✅ Confirms |
| Hypertension referral | Total women with high BP identified | ✅ Confirms |
| MMR (maternal deaths) | Total live births × 100,000 | ✅ Confirms rate multiplier |
| IMR (infant deaths) | Total live births × 1,000 | ✅ Confirms rate multiplier |
| ABR | Projected population 10-14 or 15-19 (female) × 100 | ✅ Confirms |
| ZOD | Total municipalities and chartered cities | ✅ Confirms |
| BHW ratio | Total active BHWs / Total projected households | ✅ Confirms (inverted ratio) |
| Morbidity rate | Total projected population × 100,000 | ✅ Confirms |

---

### New Indicators Found in Memorandum NOT in Our Files

These indicators appear in the official memorandum but we did not see corresponding Excel files:

| Indicator | Program | Notes |
|---|---|---|
| TB Case Notification Rate (CNR) | Infectious Disease — Tuberculosis | No TB file uploaded |
| TB Preventive Treatment (TPT) coverage | Infectious Disease — Tuberculosis | No TB file uploaded |
| Nutritional Status (MAM/SAM) | Child Care — Nutrition | Not in our uploaded files |
| MAM children enrolled in SFP | Child Care — Nutrition | Not in our uploaded files |
| MAM children outcomes (cured/defaulted/died) | Child Care — Nutrition | Not in our uploaded files |
| SAM children admitted to OTC | Child Care — Nutrition | Not in our uploaded files |
| SAM children outcomes | Child Care — Nutrition | Not in our uploaded files |

**Action needed:** Ask if there are additional files for TB and the malnutrition indicators that were not uploaded.

---

### Discrepancies Found Between Memorandum and Excel Files

| # | Indicator | Memorandum Says | Excel File Shows | Resolution |
|---|---|---|---|---|
| 1 | BSWS % formula | Not stated (memorandum) | % = households with BSWS / projected households | Use Excel formula — memorandum omission |
| 2 | Senior Citizen PPV vaccine | Not in memorandum | In `ncd_scimmunization_nir.xlsx` | File includes it, memorandum may be incomplete |
| 3 | Geriatric screening (positive results) | "At least 1 positive geriatric result / Total screened" | Matches | ✅ |
| 4 | FP accounting identity CUB + NA + OA - DO = CUE | Not stated in memorandum | In file structure | System validates this regardless |
| 5 | LBW given Iron — reported frequency | Memorandum says Annual | File has Q+A sheets | Use file structure — file is authoritative for frequency |


---

## Program: Child Care > Nutrition (Additional File)
**Previously missed file. Now analyzed.**

| # | Filename | Indicator | Status |
|---|---|---|---|
| 6 | `6_Nutritional_Status__MAM___SAM__Annual_nir.xlsx` | MAM and SAM nutritional status + outcomes | ✅ Analyzed |

**Note:** File currently has only 6 rows (province/HUC level only). LGU rows and barangay rows for HUC not yet added. Structure and formulas are confirmed. Row count will increase when team adds LGU/barangay rows. Parser stops at blank PSGC.

---

## File nut-6: `6_Nutritional_Status__MAM___SAM__Annual_nir.xlsx`

### Sheet Structure
| Sheet | Rows | Cols | Content |
|---|---|---|---|
| MAM | 6 | 36 | Moderate Acute Malnutrition care cascade |
| SAM | 6 | 36 | Severe Acute Malnutrition care cascade |
| changelog | — | — | Not imported |

**Frequency: Annual only.**
**No Population sheet. No separate quarterly sheets.**

### MAM and SAM Are Structurally Identical
Both sheets have exactly the same 36-column structure. Only the condition name differs (MAM vs SAM) and the treatment program (SFP vs OTC).

### No PSGC Column — Different Meta Structure
Col 0 = PSGC10. Col 1 = Region, Province/City. **No separate Region column.** Only 2 meta columns vs the usual 3. Parser maps PSGC from col 0, location from col 1.

### Care Cascade — 7 Stages

**Same denominator throughout: Children 0-59 months SEEN (col 4 = Group A Total)**

| Group | Stage | Denominator |
|---|---|---|
| A | Children 0-59 months Seen | N/A — this is the base denominator |
| B | Identified MAM/SAM | Group A (Seen Total) |
| C | Enrolled to SFP / Admitted to OTC | Group A (Seen Total) |
| D | Cured in SFP/OTC | Group A (Seen Total) |
| E | Non-cured in SFP/OTC | Group A (Seen Total) |
| F | Defaulted in SFP/OTC | Group A (Seen Total) |
| G | Died in SFP/OTC | Group A (Seen Total) |

**Important:** All percentages use Group A (Seen Total) as denominator — not the previous stage. This is different from Schistosomiasis and Leprosy where each stage uses the previous stage as denominator. Here it is always compared to total seen.

### Column Inventory (per sheet — 36 cols)

**Group A — Seen (cols 2-4)**
| Col | Label | Type |
|---|---|---|
| 2 | Seen Male | RAW |
| 3 | Seen Female | RAW |
| 4 | Seen Total | COMPUTED — also main denominator |

**Groups B through G — each follows same 4-column pattern:**
Male / Female / Total / Percentage (Total/Seen)

**Admin (cols 29-35)**
| Col | Label | Type |
|---|---|---|
| 29 | Remarks | META |
| 30 | DQC: Seen ≥ Identified (A ≥ B) | DQC |
| 31 | DQC: Identified ≥ Enrolled (B ≥ C) | DQC |
| 32 | DQC: Enrolled ≥ Cured (C ≥ D) | DQC |
| 33 | DQC: Enrolled ≥ Non-cured (C ≥ E) | DQC |
| 34 | DQC: Enrolled ≥ Defaulted (C ≥ F) | DQC |
| 35 | DQC: Enrolled ≥ Died (C ≥ G) | DQC |

### DQC Rules — Cascade Inequalities
6 DQC checks enforce the logical care flow:
- Each downstream stage cannot exceed the stage that feeds it
- Cured + Non-cured + Defaulted + Died should equal Enrolled (smart validation to add — not in template)

### Raw Inputs to Store
Seen M/F + 6 stages × M/F = **14 raw inputs per location per year** (per MAM and SAM sheet)
**Total: 28 per location per year**

---

## TB — Confirmed Out of Scope for Now
No TB files provided. TB can be added later without any schema changes:
1. Add rows to `programs` table
2. Add rows to `indicators` table
3. Add parser config JSON for TB template
4. Upload TB Excel files

No other changes needed. The modular design handles this.

---

## COMPLETE FILE INVENTORY — ALL PROGRAMS

| Program | Files | Freq | Analyzed |
|---|---|---|---|
| Child Care — Immunization | 6 | M+Q+A | ✅ |
| Child Care — Mgt of Sick | 2 | Q+A | ✅ |
| Child Care — Nutrition | 5 | Q+A / Annual | ✅ |
| Child Care — SBI | 3 | Annual | ✅ |
| Demographics | 1 | Annual | ✅ |
| Environmental Health | 2 | Q only | ✅ |
| Family Planning | 1 | Q+A | ✅ |
| Geriatric Health | 2 | Q+A / Annual | ✅ |
| Maternal Care — Intra Partum | 2 | Q+A | ✅ |
| Maternal Care — Post Partum | 3 | Q+A | ✅ |
| Maternal Care — Prenatal | 8 | Q+A | ✅ |
| Morbidity | 1 | M+Q+A | ✅ |
| NCD | 5 | M+Q+A | ✅ |
| Oral Health | 1 | Q+A | ✅ |
| Vital Statistics — Mortality | 1 | Q+A | ✅ |
| Vital Statistics — Natality | 1 | Q+A | ✅ |
| Infectious Disease — Filariasis | 2 (1 excluded) | Annual | ✅ |
| Infectious Disease — HIV/Syphilis/HepaB | 3 | Q+A | ✅ |
| Infectious Disease — Leprosy | 1 | Annual | ✅ |
| Infectious Disease — Rabies | 2 (1 parked) | Q+A | ✅ |
| Infectious Disease — Schistosomiasis | 7 | Q+A | ✅ |
| Infectious Disease — STH | 2 | Q+A | ✅ |
| TB | 0 | — | Out of scope |
| **TOTAL** | **63 analyzed** | | |


---

## TECHNICAL BREAKDOWN — Cross-Reference Analysis
**Source:** `technical_breakdown_of_the_numerator__denominator__formula__target_population__and_2026_targets_for_each_indicator_.xlsx`
**Total indicators in breakdown: 26**
**Note:** All +1, +2, +3, +4 annotations in the document are PDF footnote references — not data. Disregard.

---

### Confirmed Matches — No Issues

| Indicator | Status |
|---|---|
| FIC denominator (previous year population) | ✅ Confirmed |
| CIC denominator (prev year pop minus FIC) | ✅ Confirmed |
| Vitamin A supplementation denominator | ✅ Confirmed |
| Demand Satisfied formula (CUE/Total Demand × 100) | ✅ Confirmed |
| NA formula (sum of NA per method) | ✅ Confirmed |
| CU formula (Previous CU + NA + OA - DO) | ✅ Confirmed — matches FP accounting identity |
| MMR formula (deaths / live births × 100,000) | ✅ Confirmed |
| IMR formula (deaths / live births × 1,000) | ✅ Confirmed |
| BSWS formula (households with access / projected households) | ✅ Confirmed |
| Cervical cancer numerator (VIA + Pap + HPV DNA screened) | ✅ Confirmed |
| PhilPEN (NCD risk assessment) — Adults and SC | ✅ Confirmed |
| Hypertension complete medications formula | ✅ Confirmed |
| Rabies Category II — PEP given / eligible × 100 | ✅ Confirmed |

---

### 2026 Targets — Noted for Dashboard

| Indicator | 2026 Target |
|---|---|
| 8ANC completion | 95% |
| Td vaccine (pregnant) | 95% |
| BMI normal category | 95% |
| MMS supplementation | 95% |
| Calcium carbonate | 0.3 (30%) |
| BP measured (ANC/PNC) | 95% |
| FBD | 95% |
| CPAB | 95% |
| FIC | 95% |
| CIC | 95% |
| Breastfeeding within 1 hour | 95% |
| Vitamin A supplementation | 95% |
| MAM enrolled to SFP | 90% |
| First dental visit (0-11 months) | 20% |
| PhilPEN risk assessment | 40% |
| Hypertension with complete meds | 5% increase from baseline |
| Cervical cancer screening | 70% |
| Rabies Category II PEP | 90% |
| BSWS access | 96.25% |
| BHW ratio | 1:20 households |
| MMR | 70 deaths per 100,000 births |
| IMR | 13 deaths per 1,000 births |
| TB CNR | 10% increase from previous year |

**Schema impact:** Add `target_value` and `target_year` columns to the `indicators` table.

---

### Discrepancies — Pending Clarification with Higher Ops

| # | Indicator | Document Says | Excel File Shows | Status |
|---|---|---|---|---|
| D1 | BHW ratio | Numerator = Households, Denominator = BHWs | Same — but label convention is inverted vs all other indicators | ⏳ Clarify with higher ops |
| D2 | MAM enrolled to SFP | Denominator = children identified as MAM | Denominator = children SEEN (Group A) | ⏳ Clarify with higher ops |
| D3 | 8ANC denominator | Total women tracked via TCL (Target Client List) | Resident + Trans-IN (Trans-OUT excluded) from Excel | ⏳ Clarify — TCL may be the source for the Excel tracking formula |
| D4 | Cervical cancer | Denominator = projected women minus screened past 2 years | Excel shows static target population column | ⏳ Clarify — running denominator may be external calculation |

**These discrepancies do NOT block schema design.** The schema stores raw inputs. The formula config can be updated once clarifications arrive.

---

### Future-Proofing Confirmed
- TB CNR is in the memorandum but out of scope for Phase 1
- Backend is designed to receive new indicators without schema changes
- 2027 template changes expected — new indicators added via `indicators` table rows
- Dropped indicators handled by `is_active = false` and `year_retired` in `indicators` table

