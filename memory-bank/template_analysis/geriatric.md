# Geriatric Health Program — Template Analysis

## Program: Geriatric Health > Screening / Senior Citizen Immunization (2 files)

**Location analyzed:** `backend/data/GERIATRIC/` — `ncd_geriatric_nir.xlsx` and `ncd_scimmunization_nir.xlsx`. Both filenames carry a legacy `ncd_` prefix even though they live in the `GERIATRIC` data folder — **this is confirmed to be a cosmetic/on-disk naming artifact only.** `backend/app/core/seed_programs.slq` already contains a dedicated `('GERIATRIC', 'Geriatric Health')` row (distinct from `NCD`), and no `GERIATRIC` indicators or configs exist yet in `seed_indicators.py` / `backend/app/services/configs/`. **Recommendation: seed both files under the existing `GERIATRIC` program code, not folded into `NCD`** — the two programs are already modeled as separate rows in the programs table, and neither file's content overlaps with any of the 5 files already documented in `ncd.md`.

**Method:** Read every sheet in both files with `openpyxl` in `data_only=False` (formula strings) and `data_only=True` (cached values) mode; hand-verified every percentage formula against its own header label and against the actual cached numbers row-by-row; enumerated every `conditional_formatting` `sqref` range and compared its row bounds against the true data extent; grepped the full formula text of both workbooks for any other formula referencing specific columns to check for orphaned/dead columns; read both `changelog` tabs in full.

**RBAC / Sensitive Indicators check:** Searched every header cell in both files for "HIV", "Syphilis", "reactive", "AIDS", "STD" — **zero matches**. Neither file contains any indicator matching `CLAUDE.md`'s HIV/Syphilis-reactive sensitive-indicator criteria. No `is_sensitive = TRUE` flags needed for this program.

---

## Cross-File Structural Notes (read this first)

1. **Frequency differs sharply between the two files.** File 1 (`ncd_geriatric_nir.xlsx`) is **Quarterly + Annual** (`Qtr1`-`Qtr4`, `Annual`). File 2 (`ncd_scimmunization_nir.xlsx`) has **only a single `Annual` sheet** — no quarterly tabs of any kind, the only file in this pair (and one of the few across the whole 18-sub-group project) reporting Annual-only granularity with no possibility of sub-annual periodicity.
2. **Both files use the 5-row province/HUC-rollup granularity** (Region "NIR" + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod (HUC), PSGC `1800000000`/`1804500000`/`1804600000`/`1806100000`/`1830200000` — identical codes/order to the province-rollup files seen throughout NCD, Maternal Care, and Family Planning). **No municipality-level (68-row) breakdown in either file.** Both sheets report `max_row=220` via openpyxl, but rows 7-220 are confirmed (cell-by-cell scan) pure formatting bloat — real data occupies only rows 1-6.
3. **`Population` is a completely empty stub (`A1:A1`, zero non-blank cells) in both files** — same recurring pattern documented across nearly every NCD sibling file. Population/target figures are instead entered inline (col 2 of the main sheet) in both files.
4. **Test/sample data is materially thinner here than in most sibling programs.** File 1 has real, non-zero data in `Qtr1`/`Annual` only (Qtr2-4 all zero, matching the "Q1-only test data" pattern from Maternal Care/Family Planning). File 2 has **zero non-blank cells anywhere in its data rows** — every raw and computed value in the shipped file is `0` or blank, so no bug in File 2 can be demonstrated with nonzero cached-value arithmetic; the bug found there (IMM-1, below) is instead confirmed by direct formula-vs-label and formula-vs-cross-reference inspection.
5. **Both known recurring bug classes were explicitly checked:**
   - **(a) Conditional-formatting anchor off-by-one:** **Recurs, severely, in File 1.** All 18 of File 1's logical-consistency DQC rules are anchored `row 7:1000`, one row past the last real data row (6) — identical mechanism to the NCD Eye Health/Cancer/Risk-Factor files' Flag X-1. **Does not recur in File 2**, but only because File 2 never had any threshold/logical DQC rule to begin with (nothing to mis-anchor).
   - **(b) "Over 100%" DQC scale mismatch (raw 0-2 ratio vs. literal `100`):** **Not present in either file.** Both files' percentage-threshold conditional formatting uses `cellIs greaterThan 1` against percentage cells stored in `0.00%` (0-1 ratio) number format — correctly scaled.
6. **File 1 contains a serious, confirmed logical-consistency violation *in its own shipped sample data*** that its (dead) DQC rule was specifically designed to catch — see GER-1 below. **File 2 contains a confirmed denominator-formula bug** where a percentage column's stored formula does not match its own header's documented denominator, and the correct denominator column is never referenced anywhere else in the workbook — see IMM-1 below.

---

## File 1: `ncd_geriatric_nir.xlsx`
**Tracks:** Geriatric (Senior Citizen, 60+) health screening using the DOH Geriatric Screening Tool — 9 screening domains (Memory, Depression, Polypharmacy, Urinary Incontinence, Functional Capacity, Malnutrition, Hearing, Vision, Fall Risk), a consolidated "at least one positive finding" count, and follow-up care-plan/referral tracking.

### Sheet Structure
| Sheet | Type | Rows (real) | Cols (real) | Notes |
|---|---|---|---|---|
| `Qtr1` | Quarterly | 5 data + header = 6 (`max_row=220` reported, rows 7-220 confirmed pure bloat) | 51 (A:AY) | Real Q1 test data present |
| `Qtr2` | Quarterly | 6 | 51 | Population column populated (constant); all screening/outcome columns = 0 |
| `Qtr3` | Quarterly | 6 | 51 | Same as Qtr2 |
| `Qtr4` | Quarterly | 6 | 51 | Same as Qtr2 |
| `Annual` | Annual rollup | 6 | 51 | Leaf rows (province/HUC, rows 3-6) = cross-sheet `SUM('Qtr1'!x,'Qtr2'!x,'Qtr3'!x,'Qtr4'!x)`; Region row (row 2) = same-sheet `SUM(row3:row6)` — correct, standard rollup pattern, verified for both raw and computed columns |
| `Population` | Reference | — | — | **Empty stub** — `A1:A1`, no header, no data |
| `changelog` | Admin | 2 entries | 7 | Not imported — see below |

**Frequency:** Quarterly + Annual. **Rows:** 5 data rows per sheet (Region "NIR" + Negros Occidental + Negros Oriental + Siquijor + City of Bacolod (HUC)) — province/HUC-rollup granularity only, no municipality breakdown.

### Age/Sex Disaggregation
**Male/Female split for every raw and computed count.** No age-bracket breakdown at all — the entire population base is "Senior Citizens (60+)" as a single undifferentiated group (unlike some sibling NCD files that split 60+ further, e.g. no 60-69/70-79/80+ brackets exist anywhere in this file).

### Geographic Levels Present
Region (NIR) → 3 Provinces (Negros Occidental, Negros Oriental, Siquijor) → City of Bacolod (HUC) as one single aggregate row. **5 rows per sheet.** No municipality/city or barangay rows. Region row (row 2) is a same-sheet `SUM` of rows 3-6 in every quarterly sheet — verified consistent, no cross-bracket shift.

### Column Inventory (canonical sheet: `Qtr1`, 51 real columns)
| Col (0-based) | Label (abbreviated) | Proposed `indicator_code` | Type | Formula | Unit |
|---|---|---|---|---|---|
| 0 | PSGC 10 | — | META (`psgc_column`) | — | 10-digit PSGC (text) |
| 1 | Region, Province/City, Municipality | — | META (`location_column`) | — | text |
| 2 | Projected Population of Senior Citizens (a) | `GER_POP` | RAW (province/HUC rows); region = `SUM(rows 3-6)` | — | count |
| 3,4 | Screened using Geriatric Screening Tool Male(b)/Female(c) | `GER_SCREENED_MALE`/`_FEMALE` | RAW | — | count |
| 5 | Screened Total (d=b+c) | `GER_SCREENED_TOTAL` | COMPUTED | col3+col4 | count |
| 6 | Screened % (e=d/a) | `GER_SCREENED_PCT` | COMPUTED | col5/col2 | % |
| 7,8,9,10 | Positive [Memory] M(f)/F(g)/Total(h=f+g)/%(i=h/d) | `GER_MEMORY_MALE`/`_FEMALE`/`_TOTAL`/`_PCT` | RAW/COMPUTED | col10=col9/col5 | count/% |
| 11,12,13,14 | Positive [Depression] M/F/Total(l=j+k)/%(m=l/d) | `GER_DEPRESSION_*` | RAW/COMPUTED | col14=col13/col5 | count/% |
| 15,16,17,18 | Positive [Polypharmacy] M/F/Total(p=n+o)/%(q=p/d) | `GER_POLYPHARMACY_*` | RAW/COMPUTED | col18=col17/col5 | count/% |
| 19,20,21,22 | Positive [Urinary Incontinence] M/F/Total(t=r+s)/%(u=t/d) | `GER_URININCONT_*` | RAW/COMPUTED | col22=col21/col5 | count/% |
| 23,24,25,26 | Positive [Functional Capacity] M/F/Total(x=v+w)/%(y=x/d) | `GER_FUNCCAP_*` | RAW/COMPUTED | col26=col25/col5 | count/% |
| 27,28,29,30 | Positive [Malnutrition] M/F/Total(ab=z+aa)/%(ac=ab/d) | `GER_MALNUTRITION_*` | RAW/COMPUTED | col30=col29/col5 | count/% |
| 31,32,33,34 | Positive [Hearing] M/F/Total(af=ad+ae)/%(ag=af/d) | `GER_HEARING_*` | RAW/COMPUTED | col34=col33/col5 | count/% |
| 35,36,37,38 | Positive [Vision] M/F/Total(aj=ah+ai)/%(ak=aj/d) | `GER_VISION_*` | RAW/COMPUTED | col38=col37/col5 | count/% |
| 39,40,41,42 | Positive [Fall Risk] M/F/Total(an=al+am)/%(ao=an/d) | `GER_FALLRISK_*` | RAW/COMPUTED | col42=col41/col5 | count/% |
| 43,44,45,46 | With at least one Positive Screening M(ap)/F(aq)/Total(ar=ap+aq)/%(as=ar/d) | `GER_ATLEASTONE_MALE`/`_FEMALE`/`_TOTAL`/`_PCT` | RAW (independently entered, deduplicated union — see GER-1)/COMPUTED | col46=col45/col5 | count/% |
| 47,48,49,50 | Provided with care plan/referred M(at)/F(au)/Total(av=at+au)/"[Total]"(aw=av/ar) | `GER_CAREPLAN_MALE`/`_FEMALE`/`_TOTAL`/`_PCT` | RAW/COMPUTED | col50=col49/col45 (chained off `GER_ATLEASTONE_TOTAL`, not off `GER_SCREENED_TOTAL`) | count/% |

9 screening domains × 4 cols (36) + 3 meta (0-2) + 4 baseline (3-6) + 4 at-least-one (43-46) + 4 care-plan (47-50) = 51, matching the sheet's real column count.

### DQC Rules Visible in the Sheet
- **Completeness check:** `containsBlanks`/`LEN(TRIM(...))=0` on `C2:AY6` — correctly anchored to the real 5-row data range in every sheet (`Qtr1`-`Qtr4`, `Annual`).
- **Percentage threshold, correctly scaled:** `cellIs greaterThan 1` on all 12 percentage columns (`G,K,O,S,W,AA,AE,AI,AM,AQ,AU,AY`, all `2:6`) — correctly anchored, correctly scaled to the 0-1 ratio (not literal `100`). **These 12 rules genuinely function.**
- **18 logical-consistency rules, all dead-on-arrival:** one paired check per screening domain (e.g. `J7>F7` — Memory Total > Screened Total; `O7>K7` — Depression% > Memory%) covering columns `J/K, N, O, R, S, V, W, Z, AA, AD, AE, AH, AI, AL, AM, AP, AQ`, plus a 10-rule stack on `AT` (`AT7<AP7`, `AT7<AL7`, `AT7<AH7`, `AT7<AD7`, `AT7<Z7`, `AT7<J7`, `AT7<N7`, `AT7<R7`, `AT7<V7`, `AT7>F7`) that checks "at least one positive" against every individual domain's Total and against the overall Screened Total. **Every one of these 18 rules is anchored `row 7:1000`, one row past the last real data row (6)** — identical off-by-one mechanism to the NCD Eye Health/Cancer/Risk-Factor files' Flag X-1. Confirmed dead by inspecting the identical, correctly-anchored `2:6` range used by the completeness check and the 12 percentage-threshold rules in the very same sheets.

### Flags / Open Questions — File 1

- **FLAG GER-1 (critical — the shipped sample data itself contains exactly the violation the dead DQC rule was built to catch, confirmed with cached-value evidence):** The "with at least one Positive Geriatric Screening" total (`AT`, col45) must, by definition, be **≥** every individual domain's Total column (a person counted as "at least one positive" must include everyone positive in *any single* domain). Cached values at NIR (row 2): `GER_ATLEASTONE_TOTAL` = **3**, while `GER_HEARING_TOTAL` = **37**, `GER_VISION_TOTAL` = **37**, `GER_FUNCCAP_TOTAL` = **24** — all far exceeding 3. Breaking this down by row: **Negros Occidental** (row 3) reports Hearing Total = 35 and Vision Total = 35, yet `AR3`/`AS3` ("at least one," Male/Female) are literal, explicitly-entered `0.0`/`0.0` (not blank — confirmed via formula string, not a rollup artifact). **City of Bacolod HUC** (row 6) reports Memory=8, Depression=4, Polypharmacy=4, Urinary Incontinence=6, Functional Capacity=24 (all nonzero), yet its "at least one" Male/Female are also literal `0.0`/`0.0`. Only **Negros Oriental** (row 4) is internally consistent (Hearing=2, Vision=2, at-least-one=3 — satisfies ≥). **This is a genuine, present data-quality violation in the shipped file, not a hypothetical one** — and the one DQC rule in the entire workbook designed to catch it (`AT7<AH7`, etc.) never fires on it, because the rule's range starts at row 7 while the violating rows are 2, 3, and 6. This is the cleanest, most consequential example of the off-by-one bug class found in this analysis to date, since it is demonstrated on live, non-placeholder-zero data rather than inferred from a correctly-anchored control rule elsewhere.
- **FLAG GER-2 (cosmetic label mismatch):** Col 50 ("Provided with a care plan or referred") header text ends in `"(Total)\n\n\n(aw) = av / ar"` — the parenthetical formula and the actual stored formula (`=IFERROR(AX2/$AT2,0)`, i.e. col49/col45) both confirm this is a **percentage**, not a total, but the visible label text literally says "(Total)". Formula wiring is correct (chained off `GER_ATLEASTONE_TOTAL` as its denominator, not the overall `GER_SCREENED_TOTAL` — clinically sensible, since care-plan provision only applies to those with a positive finding). Same cosmetic label-vs-formula pattern already documented for NCD Eye Health's col27 (Flag EY of `ncd.md`) — harmless for an index-based parser, but worth noting for anyone hand-verifying against the header.
- **FLAG GER-3:** `Population` sheet is a completely empty stub (`A1:A1`), consistent with the pattern in nearly every NCD/GERIATRIC sibling file — population figures are entered inline (col 2) instead. No parser impact, just an unused/vestigial tab.
- **`changelog` is consistent with the current file layout (positive finding, contrast with most NCD siblings):** Two entries — (1) `2026-01-08`, "Column K, O, S, W (All sheets)… Added appropriate formula, Formula was not present" — these are exactly the 4 of the 9 domain-percentage columns (Memory%, Depression%, Polypharmacy%, Urinary Incontinence%) in the file's current layout, and all four currently do carry correct, working `IFERROR(Total/Screened,0)` formulas; (2) `2026-01-12`, "Column Y onwards… Fixed Sum Formulas for all columns" — consistent with every domain-Total column from `Z` (Functional Capacity Total) onward being a `SUM` formula. Unlike most changelogs documented in `ncd.md` (which reference columns that no longer exist), this one is reconcilable with the live file — no drift detected.
- Only ~0.03% of the projected Senior Citizen population was screened in the Q1 sample data (130 of 485,488 at NIR level) — consistent with the "Q1-only, partial test data" caveat already documented across every sibling program; not itself a bug.
- No HIV/Syphilis-type sensitive indicators in this file.

---

## File 2: `ncd_scimmunization_nir.xlsx`
**Tracks:** Senior Citizen Immunization — Pneumococcal Polysaccharide Vaccine (PPV, one-time) and seasonal Influenza vaccine (annual) uptake among Senior Citizens.

### Sheet Structure
| Sheet | Type | Rows (real) | Cols (real) | Notes |
|---|---|---|---|---|
| `Annual` | **Only sheet with data — no Qtr1-4 tabs exist at all** | 5 data + header = 6 (`max_row=220` reported; rows 7-220 confirmed pure bloat) | 12 (A:L) | Every raw and computed cell is `0` or blank — no non-zero test data anywhere in the file |
| `Population` | Reference | — | — | Empty stub — `A1:A1`, no header, no data |
| `changelog` | Admin | 0 entries | 7 (header row only) | Not imported |

**Frequency: Annual only — no quarterly, no monthly tabs of any kind.** This is a materially different frequency model from File 1 (and from most sibling programs' Qtr+Annual pattern); a `sheet_map` for this template has exactly one period to map. **Rows:** 5 (Region NIR + 3 provinces + City of Bacolod HUC), same PSGC codes/order as File 1.

### Age/Sex Disaggregation
Male/Female split for both PPV and Influenza dose counts. No age-bracket breakdown (single "Senior Citizen" population, same as File 1).

### Geographic Levels Present
Region (NIR) → 3 Provinces → City of Bacolod (HUC) as one row. 5 rows total, no municipality/barangay breakdown. Region row (row 2) = same-sheet `SUM(rows 3-6)` for every column — verified consistent.

### Column Inventory (only sheet: `Annual`, 12 real columns)
| Col (0-based) | Label (as written) | Proposed `indicator_code` | Type | Formula | Unit |
|---|---|---|---|---|---|
| 0 | **`"  "` (two spaces — blank/mislabeled header text)** | — | META (`psgc_column`) | — | 10-digit PSGC (text) |
| 1 | Region, Province/City, Municipality | — | META (`location_column`) | — | text |
| 2 | SCs seen at primary health facilities who have **not** received PPV previously (a) | `GER_IMM_PPV_ELIGIBLE` | RAW (province/HUC rows); region = `SUM(rows 3-6)` | — | count |
| 3,4 | Received one dose PPV Male(b)/Female(c) | `GER_IMM_PPV_MALE`/`_FEMALE` | RAW | — | count |
| 5 | PPV Total (d=b+c) | `GER_IMM_PPV_TOTAL` | COMPUTED | col3+col4 | count |
| 6 | PPV % (e=d/a) | `GER_IMM_PPV_PCT` | COMPUTED | col5/col2 | % — **verified correct, matches label** |
| 7 | SCs seen at primary health facilities **within the current year** (f) | `GER_IMM_FLU_ELIGIBLE` | RAW — **orphaned, see IMM-1/IMM-2** | — | count |
| 8,9 | Received one dose Influenza Vaccine Male(g)/Female(h) | `GER_IMM_FLU_MALE`/`_FEMALE` | RAW | — | count |
| 10 | Influenza Total (i=g+h) | `GER_IMM_FLU_TOTAL` | COMPUTED | col8+col9 | count |
| 11 | Influenza % — header states **(j) = i / f** | `GER_IMM_FLU_PCT` | COMPUTED, **denominator bug** | Header claims col10/col7; **actual stored formula = `col10/col2`** (divides by the PPV-naive population, col 2, not the "seen this year" population, col 7) — see FLAG IMM-1 | % |

### DQC Rules Visible in the Sheet
- **Only one conditional-formatting rule exists in the entire file:** `containsBlanks` completeness check on `C2:L6` — correctly anchored to the real 5-row data range.
- **Zero percentage-threshold rules, zero logical-consistency rules.** This file has the least DQC coverage found in either half of this program, and among the lowest of any sibling program's individual files (on par with NCD Mental Health's "none beyond the blank check").
- Since no threshold/logical DQC rule exists at all beyond the completeness check, **bug class (a) (off-by-one anchor) cannot recur here** — there is simply nothing present to be mis-anchored.

### Flags / Open Questions — File 2

- **FLAG IMM-1 (confirmed denominator/formula bug, present in every one of the 5 data rows):** The Influenza % column (col11, "L") is explicitly labeled in its own header as `(j) = i / f` — i.e., Influenza-Total (col10) divided by "SCs seen within the current year" (col7, "f"). The **actual stored formula in every row** (`Annual!L2` through `L6`) is `=IFERROR(K<row>/$C<row>,0)` — dividing by **col2 ("a", "SCs not previously received PPV")** instead of col7. This is not a one-off typo: verified identical across all 5 rows (NIR, Negros Occidental, Negros Oriental, Siquijor, City of Bacolod HUC). PPV-eligibility (col2) and "seen this year" (col7) are two clinically distinct populations by design (PPV is a one-time vaccine offered to those not previously vaccinated; Influenza is an annual vaccine offered to everyone seen that year, regardless of prior PPV status) — using col2 as Influenza%'s denominator would systematically distort the Influenza coverage rate around the (usually much smaller) PPV-naive subgroup instead of the correct, broader "seen this year" population. **The shipped sample data is entirely zero-valued, so this cannot be demonstrated with a nonzero cached-value discrepancy** (as was done for sibling-program bugs elsewhere), but the formula-vs-label mismatch itself is unambiguous and reproducible in every row.
- **FLAG IMM-2 (corroborating evidence for IMM-1 — the "correct" denominator column is completely orphaned):** Grepped every formula in the entire workbook for any reference to column `H` (col7, "SCs seen within the current year") — the **only** formula that references it anywhere is its own same-sheet rollup (`H2 = SUM(H3:H6)`). No percentage, no other computed column, nothing downstream ever consumes it. This means either (a) col7 was intended to be Influenza%'s denominator per its own header but the formula was never wired to it (most likely, matching IMM-1), or (b) col7 is itself a dead/vestigial column. Either way, **config authors should not assume `GER_IMM_FLU_PCT`'s denominator is `GER_IMM_PPV_ELIGIBLE` (col2) just because that's what the shipped formula currently does** — recommend implementing it against `GER_IMM_FLU_ELIGIBLE` (col7) per the template's own documented intent, and flagging this to DOH region for a source-file fix.
- **FLAG IMM-3 (cosmetic):** The PSGC column's header (row 1, col 0) is literally two blank spaces (`"  "`) rather than a real label like File 1's `"PSGC 10"` — harmless for an index-based parser, but confirms headers in this program can't be trusted even for basic identification, consistent with `adding_templates.md`'s core premise.
- **FLAG IMM-4:** Every single cell in the file's one data sheet is `0` or blank — there is no non-zero sample/test data at all in this file (a stronger version of the "Q1-only test data" pattern seen elsewhere; here even Q1-equivalent data is entirely absent). This means none of the file's arithmetic (including IMM-1) can be cross-validated against real numbers before go-live; recommend requesting a populated sample from DOH region before finalizing this config.
- **`changelog` has zero entries** (header row only) — no edit history exists to corroborate or contradict IMM-1; this bug's origin cannot be dated.
- No `Population` reference data (empty stub, same as File 1).
- No HIV/Syphilis-type sensitive indicators in this file.

---

## Cross-File Comparison

| Aspect | `ncd_geriatric_nir.xlsx` | `ncd_scimmunization_nir.xlsx` |
|---|---|---|
| Frequency | Quarterly + Annual | **Annual only** — no Qtr tabs at all |
| Sheets | Qtr1-4, Annual, Population, changelog (7 total) | Annual, Population, changelog (3 total) |
| Rows | 5 (province/HUC rollup) | 5 (same PSGC list/order) |
| Columns (canonical sheet) | 51 | 12 |
| Sex disaggregation | Yes (Male/Female, every domain) | Yes (Male/Female, both vaccines) |
| Age disaggregation | None (60+ as one group) | None (60+ as one group) |
| Denominator type | Screened Total (chained; care-plan% further chains off At-Least-One Total) | Two population bases: PPV-naive (col2) and "seen this year" (col7) — **conflated by a formula bug (IMM-1)** |
| Sample/test data | Real, nonzero Q1 data present | **Entirely zero/blank** — no real test data at all |
| `Population` sheet | Empty stub | Empty stub |
| `changelog` | 2 entries, **reconcilable with current layout** | 0 entries (header row only) |
| DQC: rules present | 1 completeness + 12 threshold (working) + 18 logical (dead) = 31 | 1 completeness only |
| DQC: functionally working | 13 (completeness + 12 threshold) | 1 (completeness only) |
| Bug class (a) — CF off-by-one | **Recurs** — 18 logical rules dead, anchored row 7+ vs. real data ending row 6 | Not applicable — no threshold/logical rule exists to mis-anchor |
| Bug class (b) — "over 100%" scale mismatch | Not present — threshold correctly compares to literal `1` | Not present — no threshold rule at all |
| Confirmed data/formula bug | **GER-1**: shipped sample data itself violates "at least one ≥ any single domain" (e.g., Bacolod HUC: Functional Capacity=24 but At-Least-One=0) — exactly what the dead DQC rule should have caught | **IMM-1**: Influenza % formula divides by the wrong population column (PPV-naive instead of "seen this year"), confirmed via formula string in all 5 rows and corroborated by the correct denominator column being completely unreferenced elsewhere (IMM-2) |
| Sensitive-indicator concern | No | No |

---

## Consolidated Flags

| ID | File | Flag |
|---|---|---|
| **GER-1** | File 1 | Critical, confirmed on live (non-zero) data: "at least one positive screening" total is less than individual screening-domain totals at 3 of 5 rows (e.g., City of Bacolod HUC: Functional Capacity=24, Hearing/Vision data at Negros Occidental=35/35, vs. At-Least-One=0) — the file's own dead DQC rule (`AT7<AH7` etc., anchored row 7+, real data ends row 6) exists specifically to catch this and never fires on it. |
| **IMM-1** | File 2 | Critical, confirmed via formula inspection in all 5 rows: Influenza % (col11) is headered as Influenza-Total ÷ "SCs seen within current year" (col7) but the stored formula actually divides by "SCs not previously PPV-vaccinated" (col2) — two clinically distinct denominators. Cannot be demonstrated with nonzero arithmetic since the shipped file has no real test data. |
| **IMM-2** | File 2 | Corroborates IMM-1: column 7 ("SCs seen within current year," the denominator the header says Influenza% should use) is referenced by no formula anywhere in the workbook except its own rollup — an orphaned column, consistent with the wiring never having been connected. |
| **GER-2** | File 1 | Cosmetic: col 50 ("Provided with care plan/referred") header text says "(Total)" but is actually a percentage — formula wiring correct, label stale. |
| **IMM-3** | File 2 | Cosmetic: PSGC column header is two blank spaces, not a real label. |
| **IMM-4** | File 2 | The entire shipped file is zero/blank — no real sample data exists to validate any formula against before go-live. |
| **GER-3 / File2-Pop** | Both | `Population` sheet is a completely empty stub in both files — population figures are entered inline instead; likely vestigial, not a config blocker. |

---

## Summary

This Geriatric Health program consists of two structurally very different files sharing only their 5-row province/HUC-rollup geography and Male/Female (no age-bracket) disaggregation. `ncd_geriatric_nir.xlsx` is the richer file — 9 screening domains, Quarterly+Annual frequency, real Q1 test data — but its DQC design suffers the exact same off-by-one conditional-formatting anchor bug already catalogued across three NCD sibling files (Cancer, Eye Health, Risk Factors): all 18 logical-consistency rules are bound to row 7 onward while the real data ends at row 6, leaving only the blank-completeness check and the 12 percentage-threshold rules functional. Uniquely for this program, the dead rule's target violation is not hypothetical — the shipped sample data itself fails the very check that would have caught it (City of Bacolod HUC and Negros Occidental both report an "at least one positive screening" total far below several individual screening-domain totals, a logical impossibility for a deduplicated union count), making this the clearest real-world demonstration yet of why that anchor bug matters. `ncd_scimmunization_nir.xlsx` is much thinner (Annual-only frequency, just 12 columns, and — unusually — entirely zero-valued sample data with no non-blank cell anywhere), but it carries its own confirmed defect: the Influenza-vaccination percentage column's stored formula divides by the wrong population base (the PPV-naive subgroup instead of the broader "seen this year" population its own header names), a mismatch corroborated by the fact that the correct denominator column is never referenced by any other formula in the file. Both known recurring bug classes from prior programs were explicitly checked: the off-by-one conditional-formatting anchor recurs (severely) in File 1 but has nothing to attach to in File 2; the "over-100%" raw-ratio-vs-literal-100 scale mismatch does not recur in either file (both correctly compare percentage cells against a literal `1`). Before building parser configs for this program: (a) seed both files under the existing `GERIATRIC` program code (already present in `seed_programs.slq`, unaffected by the `ncd_` filename prefix); (b) do not port File 1's dead logical-consistency `sqref` ranges verbatim into `dqc_rules` — re-derive the intended "at-least-one ≥ each domain, ≤ screened total" checks and anchor them to the config's real 5-row data extent, since the underlying logic itself appears sound and would have caught a real problem; (c) implement `GER_IMM_FLU_PCT` against `GER_IMM_FLU_ELIGIBLE` (col7) rather than reproducing the shipped file's `col10/col2` formula, and request a populated (non-zero) sample of `ncd_scimmunization_nir.xlsx` from DOH region before finalizing that decision, since the current file offers no real numbers to confirm the fix against.
