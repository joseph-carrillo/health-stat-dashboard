# WASH Program — Template Analysis
## Program: Environmental Health > WASH (Water, Sanitation, Hygiene)

---

## File 1: `envi_sanitation_zod_nir.xlsx`
**Tracks:** Household-level basic sanitation facility (BSF) coverage and progress toward Zero Open Defecation (ZOD) status per city/municipality

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Qtr1 | Quarterly | Jan–Mar |
| Qtr2 | Quarterly | Apr–Jun |
| Qtr3 | Quarterly | Jul–Sep — **structurally different from Qtr1/Qtr2** (see flag below) |
| Qtr4 | Quarterly | Oct–Dec — **structurally different from Qtr1/Qtr2**, matches Qtr3 |
| Household | Reference | **Empty stub** — A1 is `None`, no headers, no data at all |

**Frequency:** Quarterly only. **No Annual sheet, no monthly sheets, no `change_log`/`changelog` sheet** (unlike the Immunization files documented in `fhsis_template_analysis.md`).
**Rows per sheet:** 68 (1 header + region total + 3 province subtotals + 63 LGU rows: 31 Negros Occidental + 25 Negros Oriental + 6 Siquijor + 1 Bacolod HUC as a single aggregate row — **no barangay-level breakdown**, unlike the 129-row Immunization files).
**Columns per sheet:** 16 (Qtr1/Qtr2) vs **17 (Qtr3/Qtr4)** — see structural flag.

### Age/Sex Disaggregation
**None.** This is a household-infrastructure indicator, not a person-level health indicator — there is no Male/Female split and no age group. This differs from every Child Care file previously documented (all of which disaggregate by sex).

### Geographic Levels Present
- Region (NIR, row 2, formula rollup)
- Province (Negros Occidental, Negros Oriental, Siquijor — rows 3, 35, 61, formula rollups)
- City/Municipality (63 rows)
- City of Bacolod (HUC) — single row (68), not broken into barangays

### CRITICAL STRUCTURAL ISSUE — Qtr3/Qtr4 Column Shift (the known "Q3/Q4 structure" problem)

**Qtr1 and Qtr2 layout (16 columns, A:P):**
| Col (0-based) | Label | Type |
|---|---|---|
| 0 | psgc | META |
| 1 | Region/PHIC | META |
| 2 | Projected Number of Households (a) | RAW |
| 3 | With BSF [Septic Tank] (b) | RAW |
| 4 | With BSF [Septic Tank] % (c=b/a) | COMPUTED |
| 5 | With BSF [Community Sewer] (d) | RAW |
| 6 | With BSF [Community Sewer] % (e=d/a) | COMPUTED |
| 7 | With BSF [VIP] (f) | RAW |
| 8 | With BSF [VIP] % (g=f/a) | COMPUTED |
| 9 | With BSF [Total] (h) | COMPUTED = b+d+f |
| 10 | With BSF [Total] % (i=h/a) | COMPUTED |
| 11 | Safely Managed Sanitation Services (j) | RAW |
| 12 | Safely Managed Sanitation Services % (k=j/a) | COMPUTED |
| 13 | Total # Municipalities/Cities per Province (l) | RAW (=1 per LGU row; SUM at province/region level) |
| 14 | # Municipalities with ≥95% BSF (m) | COMPUTED = IF(K≥0.95,1,0) |
| 15 | # ZOD Municipalities % (n = m/l) | COMPUTED |

**Qtr3 and Qtr4 layout (17 columns, A:Q) — everything shifted +1 column:**
| Col (0-based) | Label | Type |
|---|---|---|
| **0** | **`region` — header literally reads "region (Delete this column after you remove the other region)"** | extraneous column |
| 1 | psgc | META |
| 2 | Region/PHIC | META |
| 3 | Projected Number of Households (a) | RAW |
| 4–16 | *(same 13 indicator columns as Qtr1/2, cols 3–15, just shifted to 4–16)* | RAW/COMPUTED |

**What's wrong, precisely:**
1. **An entire extra column was inserted at position 0 in Qtr3 and Qtr4 only**, shifting `psgc` from index 0→1, location name from 1→2, and every data/formula column +1 (e.g. "With BSF [Septic Tank]" is index 3 in Qtr1/2 but index 4 in Qtr3/4).
2. **The new column's own header text is a leftover editing note**, not a real label: `"region\n(Delete this column after you remove the other region)"` — i.e., whoever inserted it was in the middle of consolidating two "region" columns and never finished/cleaned up Qtr3/Qtr4 (and never touched Qtr1/Qtr2 at all, so the two quarter-pairs diverged).
3. **The new column's values are wrong/meaningless at every row.** Every single row (region, province, municipality — rows 2 through 68) has the literal value `'NIR'` in this column, even rows for Negros Oriental, Siquijor, and individual municipalities. It is not a real per-row region field — it looks like a fill-down/copy-paste of the top row's value across the entire column.
4. **Formulas and conditional-formatting ranges shifted with the data** (verified: Qtr1/2 use `C2:P68`/`E2:E68,P2:P68`/etc. for the "flag if >100%" rules; Qtr3/4 use `D2:Q68`/`F2:F68,Q2:Q68`/etc.) — internally self-consistent within each quarter, but **inconsistent between quarter-pairs**, so a single `psgc_column` / `columns[].index` mapping (as required by `adding_templates.md`) cannot correctly parse all 4 quarters from one config.
5. Underlying totals/formulas (SUM/IFERROR ranges, the ≥95% ZOD flag logic) are otherwise **identical in logic** between Qtr1/2 and Qtr3/4 — only the column position differs. This is not a data-entry error in the numbers, it is purely a structural/layout drift caused by an incomplete column edit.

**Practical impact for the parser config:** `adding_templates.md` requires a single `psgc_column`/`header_row`/`columns[].index` set per template. As currently structured, this file cannot use one config for all 4 quarters — either (a) the source file must be corrected (delete column A from Qtr3/Qtr4 to match Qtr1/Qtr2, which is exactly what the leftover header note instructs, and what `progress.md`'s "Pending Team Actions" already flags: *"envi_sanitation_zod_nir.xlsx — Fix Qtr3 and Qtr4 structure"*), or (b) the parser/config schema would need a per-sheet column-index override, which doesn't currently exist. Given the header cell's own instruction to delete the stray column, fixing the source file is almost certainly the intended and simplest resolution.

### Column Inventory (using Qtr1/Qtr2 indices as canonical)
| Col | Proposed `indicator_code` | RAW/COMPUTED | Formula | Unit |
|---|---|---|---|---|
| 0 | — (psgc) | META | — | PSGC code (10-digit, stored as text) |
| 1 | — (location name) | META | — | text |
| 2 | `WASH_SAN_PROJ_HH` | RAW | — | count of households |
| 3 | `WASH_SAN_BSF_SEPTIC` | RAW | — | count |
| 4 | `WASH_SAN_BSF_SEPTIC_PCT` | COMPUTED | col[3]/col[2] | % (0.00% format) |
| 5 | `WASH_SAN_BSF_SEWER` | RAW | — | count |
| 6 | `WASH_SAN_BSF_SEWER_PCT` | COMPUTED | col[5]/col[2] | % |
| 7 | `WASH_SAN_BSF_VIP` | RAW | — | count |
| 8 | `WASH_SAN_BSF_VIP_PCT` | COMPUTED | col[7]/col[2] | % |
| 9 | `WASH_SAN_BSF_TOTAL` | COMPUTED | col[3]+col[5]+col[7] | count |
| 10 | `WASH_SAN_BSF_TOTAL_PCT` | COMPUTED | col[9]/col[2] | % |
| 11 | `WASH_SAN_SMSS` (Safely Managed Sanitation Services) | RAW | — | count |
| 12 | `WASH_SAN_SMSS_PCT` | COMPUTED | col[11]/col[2] | % |
| 13 | `WASH_SAN_LGU_COUNT` | RAW | — | count (=1 per LGU row; used as denominator at province/region rollup) |
| 14 | `WASH_SAN_LGU_ZOD_FLAG` | COMPUTED | `IF(col[10]≥0.95,1,0)` | 0/1 flag |
| 15 | `WASH_SAN_ZOD_PCT` | COMPUTED | col[14]/col[13] | % |

*(In Qtr3/Qtr4, shift every index above by +1 due to the stray column A.)*

### DQC Notes/Formulas Visible in the Sheet
- **Conditional formatting "flag if >100%"** applied to all five percentage columns (Septic %, Sewer %, VIP %, BSF Total %, SMSS %) — rule fires on value `>1` (100%). No explicit "over 200%" DQC pattern like Immunization files; here it's a strict ">100%" cap, since a household infrastructure count should never exceed the projected household base.
- **Completeness check**: conditional formatting flags blank cells across the whole data block (`containsBlanks`, `LEN(TRIM(...))=0`).
- **PSGC-format highlight**: a `containsText` rule searches for the digit "0" in the PSGC/location column — appears to be leftover/cosmetic formatting rather than a meaningful DQC rule.
- **ZOD threshold rule**: `=IF(K(or L in Qtr3/4)≥0.95,1,0)` — the core "Zero Open Defecation" recognition logic: an LGU counts toward the region's ZOD percentage only if its BSF Total coverage is ≥95%.

### Flags / Open Questions
- **FLAG S-1 (primary, matches `progress.md` team action):** Qtr3/Qtr4 have an extra, mislabeled, incorrectly-populated column A that shifts all indices by +1 relative to Qtr1/Qtr2. Needs source-file correction (delete column A) before a single parser config can ingest all 4 quarters. This is a real DOH-encoder correction, not something the parser should special-case.
- **FLAG S-2:** The `Household` sheet is completely empty (no header, no data) in both this file and the water file. Unclear if it was meant to hold a "Projected Number of Households" reference table analogous to the "Population" sheet pattern from Immunization files, and simply was never filled in, or is a vestigial/unused tab.
- **FLAG S-3:** No `change_log`/`changelog` sheet exists in this file at all (present in the water file). Cannot audit when/why the Qtr3/Qtr4 column was inserted.
- **FLAG S-4:** No Annual sheet — matches the pattern of other quarterly-only files (Management of Sick, Nutrition) where annual figures are computed by the system, not sourced from the template; confirm this is the intended handling for WASH too.
- **FLAG S-5:** Column 13 (`# Municipalities/Cities per Province`) is simultaneously a raw input (=1 at LGU level) and the denominator for the ZOD percentage rollup — same "count is also its own denominator" pattern flagged for LBW in the Nutrition files (`FLAG c1-1`). Needs the same schema treatment (denominator_source pointing back to this same indicator, aggregated by SUM).
- No HIV/Syphilis-type sensitive indicators here — nothing in this file matches the `CLAUDE.md` "Sensitive Indicators" RBAC criteria; all columns can be `is_sensitive = false`.

---

## File 2: `envi_water_nir.xlsx`
**Tracks:** Household-level basic safe water supply (BSWS) coverage (Levels I/II/III) and safely managed drinking water services per city/municipality

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Qtr1 | Quarterly | Jan–Mar |
| Qtr2 | Quarterly | Apr–Jun |
| Qtr3 | Quarterly | Jul–Sep |
| Qtr4 | Quarterly | Oct–Dec |
| changelog | Admin | Not imported — one entry: v1.1, 2026-04-21, "Julius Castro", Field Affected = "Column O", Old/New Value blank, Reason blank |
| Household | Reference | Empty stub — same as sanitation file |

**Frequency:** Quarterly only. No Annual sheet, no monthly sheets.
**Rows per sheet:** 68 — identical structure to the sanitation file (region/province subtotal rows + 63 LGU rows + Bacolod HUC as one row).
**Columns per sheet:** **26 (A:Z) reported by openpyxl, but only 14 columns (A:N) actually contain data/formulas** — columns O:Z are blank in every sheet (likely leftover formatting/dimension bloat, not real data).

### Structure Assessment — Consistent Across All 4 Quarters
Unlike the sanitation file, **Qtr1, Qtr2, Qtr3, and Qtr4 in this file are structurally identical** — same header row, same column indices, same conditional-formatting ranges (`C2:M68`, `E/G/I/K/M` percentage columns, `N1:N68` DQC column) in all four sheets. This is a useful negative control confirming the sanitation file's Qtr3/Qtr4 shift is an isolated, file-specific error and not a systemic pattern across WASH templates.

### Age/Sex Disaggregation
None — same as sanitation file (household/infrastructure counts, no Male/Female or age-group split).

### Geographic Levels Present
Same as sanitation file: Region → Province → City/Municipality (63 rows) → City of Bacolod (HUC) as a single row.

### Column Inventory
| Col | Label | Proposed `indicator_code` | RAW/COMPUTED | Formula | Unit |
|---|---|---|---|---|---|
| 0 | psgc | — | META | — | PSGC code (text) |
| 1 | Region/PHIC | — | META | — | text |
| 2 | Projected Number of Households (a) | `WASH_WTR_PROJ_HH` | RAW | — | count |
| 3 | With BSWS [Level I] (b) | `WASH_WTR_BSWS_L1` | RAW | — | count |
| 4 | With BSWS [Level I] % (c=b/a) | `WASH_WTR_BSWS_L1_PCT` | COMPUTED | col[3]/col[2] | % |
| 5 | With BSWS [Level II] (d) | `WASH_WTR_BSWS_L2` | RAW | — | count |
| 6 | With BSWS [Level II] % (e=d/a) | `WASH_WTR_BSWS_L2_PCT` | COMPUTED | col[5]/col[2] | % |
| 7 | With BSWS [Level III] (f) | `WASH_WTR_BSWS_L3` | RAW | — | count |
| 8 | With BSWS [Level III] % (g=f/a) | `WASH_WTR_BSWS_L3_PCT` | COMPUTED | col[7]/col[2] | % |
| 9 | With BSWS [Total] (h) | `WASH_WTR_BSWS_TOTAL` | COMPUTED | col[3]+col[5]+col[7] | count |
| 10 | With BSWS [Total] % (i=h/a) | `WASH_WTR_BSWS_TOTAL_PCT` | COMPUTED | col[9]/col[2] | % |
| 11 | Safely Managed Drinking Water Services (j) | `WASH_WTR_SMDWS` | RAW | — | count |
| 12 | Safely Managed Drinking Water Services % (k) | `WASH_WTR_SMDWS_PCT` | COMPUTED | col[11]/col[2] | % |
| 13 | *(no header label — DQC text formula only)* | `WASH_WTR_DQC_L1L3_VS_SMDWS` | DQC (not a stored value) | `IF(SUM(D,H)<L,"Level I + Level III should be ≥ SMDWS","")` | text flag |

Note: unlike the sanitation file, there is **no** "# Municipalities per Province" / ZOD-style rollup group in this file — the water file stops at the SMDWS group plus one cross-check DQC column.

### DQC Rules
- **Conditional formatting "flag if >100%"** on all four percentage columns (L1 %, L2 %, L3 %, Total %, SMDWS %) — same ">1"/">100" dual-rule pattern as the sanitation file.
- **Logical consistency check (column N, `WASH_WTR_DQC_L1L3_VS_SMDWS`):** flags with the literal text `"Level I + Level III should be ≥ SMDWS"` whenever `Level I + Level III < Safely Managed Drinking Water Services`. This encodes a real programmatic rule: SMDWS is defined by DOH as a subset achievable through Level I and Level III systems (not Level II), so SMDWS should never exceed L1+L3 combined. Conditional formatting on `N1:N68` highlights any row where this text is non-blank.
- Completeness check (`containsBlanks`) and PSGC "0" highlight rule, same as sanitation file (likely cosmetic, not a real DQC).

### Flags / Open Questions
- **FLAG W-1:** The `changelog` sheet references a change to **"Column O"**, but no current sheet has meaningful data past column N (O:Z are blank in every quarter). This suggests a column was deleted or moved after that changelog entry was made, and the log is now stale/orphaned — worth asking the encoder what "Column O" referred to and whether the changelog is still trustworthy for this file.
- **FLAG W-2:** Same empty `Household` reference sheet as the sanitation file — same open question about intended purpose.
- **FLAG W-3:** No sensitive (HIV/Syphilis) indicators present — none of these columns require the RBAC restrictions described in `CLAUDE.md`'s "Sensitive Indicators" section.
- **Positive finding:** This file's Qtr1–Qtr4 sheets are internally consistent, so it can likely be config-driven with a single `columns` mapping today, unlike the sanitation file.

---

## Cross-File Comparison — Sanitation vs Water
| Pattern | Sanitation (`envi_sanitation_zod_nir.xlsx`) | Water (`envi_water_nir.xlsx`) |
|---|---|---|
| Sheets | Qtr1–4, Household | Qtr1–4, changelog, Household |
| Qtr1/Qtr2 vs Qtr3/Qtr4 column layout | **Diverge** — Qtr3/4 have 1 extra stray column, shifting all indices +1 | **Identical** across all 4 quarters |
| Columns (data) | 16 (Qtr1/2) / 17 (Qtr3/4) | 14 (A:N); O:Z blank |
| Second-tier grouping | "1. With BSF" (3 sub-types) + "2. SMSS" + ZOD rollup (LGU count/flag/%) | "1. With BSWS" (3 levels) + "2. SMDWS" + 1 cross-check DQC column, no rollup group |
| Sex/age disaggregation | None | None |
| Denominator | Projected Number of Households (per row) | Projected Number of Households (per row) — same denominator type as sanitation |
| DQC beyond >100% flag | ZOD ≥95% per-LGU flag/percentage | Level I+III ≥ SMDWS logical consistency flag |
| `change_log`/`changelog` sheet | **Absent** | Present (1 entry, references a now-nonexistent "Column O") |
| Rows | 68 (63 LGUs + 3 province + 1 region, Bacolod HUC as 1 row, no barangays) | Same as sanitation |
| Annual/monthly sheets | None (quarterly-only; annual likely system-computed) | None (quarterly-only) |
| Sensitive/RBAC indicators (per `CLAUDE.md`) | None | None |

---

## Summary

Both files track household-level (not person-level) infrastructure coverage — no sex/age disaggregation, unlike the Child Care files. The water file (`envi_water_nir.xlsx`) is structurally clean and consistent across all four quarters, so a single parser config should work directly. The sanitation file (`envi_sanitation_zod_nir.xlsx`) confirms the known issue: Qtr3 and Qtr4 have an extraneous column A (header literally says "delete this column after you remove the other region"), populated with the hardcoded, meaningless value `'NIR'` on every row, which shifts every subsequent column index +1 relative to Qtr1/Qtr2. This breaks the single-`psgc_column`/`columns[].index`-per-config model required by `adding_templates.md` — the fix should be at the source file (delete column A from Qtr3/Qtr4), not the parser. Other flags: both files have an entirely empty "Household" reference sheet of unclear purpose; the sanitation file has no `change_log`; the water file's `changelog` references a "Column O" that no longer exists in any current sheet. No HIV/Syphilis-type sensitive indicators apply to either file.
