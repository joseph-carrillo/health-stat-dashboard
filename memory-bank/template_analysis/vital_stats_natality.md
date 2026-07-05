# FHSIS Template Analysis — Vital Stats / Natality

## File: `nata_lb_abr_rabr_nir.xlsx`
**Location:** `backend/data/VITAL_STATS/Natality/nata_lb_abr_rabr_nir.xlsx`
**Tracks:** Live Births (Male/Female/Total), Adolescent Birth Rate (ABR, ages <10, 10-14, 15-19), and Repeat Adolescent Birth Rate (RABR, ages 10-14, 15-19) — current year only, region NIR (Negros Island Region)

Filename decode confirmed from content: `nata` = Natality, `lb` = Live Births, `abr` = Adolescent Birth Rate, `rabr` = Repeat Adolescent Birth Rate, `nir` = Negros Island Region.

---

### Sheet Structure

| Sheet | Type | Notes |
|---|---|---|
| Q1 | Quarterly | Jan–Mar. 17 columns. Contains real (non-blank) data. |
| Q2 | Quarterly | Apr–Jun. 16 columns — one fewer than Q1/Q3/Q4/Annual. Entirely blank except reference population values (see Flag 1). |
| Q3 | Quarterly | Jul–Sep. 17 columns. Blank except reference population. |
| Q4 | Quarterly | Oct–Dec. 17 columns. Blank except reference population. |
| Annual | Summary | 17 columns. Rolls up Q1–Q4 via cross-sheet formulas. Contains a broken formula (#REF!) — see Flag 1. |
| change_log | Admin | Not imported. 4 populated entries (see below). |

**Frequency:** Quarterly + Annual only. No monthly tabs, and no separate Population reference sheet (unlike the Immunization files) — the projected/estimated population columns live inline in every data sheet instead.

**Sheet dimensions:** All data sheets report max_row = 863, but only rows 2–6 contain any data (5 rows: 1 region rollup + 4 real locations). Rows 7–863 are entirely empty — leftover padding, not a data-entry problem. The parser's existing MAX_CONSECUTIVE_BLANKS = 15 blank-row breakout in parser.py already handles this correctly, so no code change is needed.

**Geographic granularity — much coarser than Immunization files:** This file reports at province + HUC level only (4 real geographic rows), not down to city/municipality/barangay like the Immunization templates (129 rows). Rows:

| Excel row | PSGC (col A) | Region (col B) | Region/PHIC (col C) — actual location name | Type |
|---|---|---|---|---|
| 2 | 1800000000 | NIR | NIR | Computed rollup — formula sums rows 3–6 (e.g. =SUM(D3:D6)) |
| 3 | 1804500000 | NIR | Negros Occidental | RAW |
| 4 | 1804600000 | NIR | Negros Oriental | RAW |
| 5 | 1806100000 | NIR | Siquijor | RAW |
| 6 | 1830200000 | NIR | City of Bacolod (HUC) | RAW |

Row 2 (NIR) is a formula rollup, not raw input — consistent with the existing convention used elsewhere. Recommend `data_start_row = 1` (0-based, i.e. Excel row 3), so only the 4 real rows are ingested per period.

**No merged cells** in the header — it's a genuine single header row (row 1) with embedded \n for visual wrapping only, so header_row = 0 is safe.

**Location-name column is NOT column 1 (unlike other templates).** Column B ("Region", index 1) is a constant literal "NIR" for every single row — it carries no per-row distinguishing information. The actual varying location name ("Negros Occidental", "Siquijor", "City of Bacolod (HUC)", etc.) is in column C, index 2 ("Region/PHIC"). Most previously-documented templates use location_column: 1; this one needs location_column: 2. This is exactly the kind of index mismatch adding_templates.md warns about ("parser trusts index not header label") — easy to get wrong by pattern-matching the other configs.

---

### Column Inventory — Q1 / Q3 / Q4 / Annual (17 columns, index 0–16)

| Idx | Header text | Proposed indicator_code | RAW/COMPUTED | Formula | Unit |
|---|---|---|---|---|---|
| 0 | PSGC 10 | — (psgc_column) | META | — | — |
| 1 | Region | — (constant "NIR", not useful; likely not stored) | META | — | — |
| 2 | Region/PHIC | — (location_column) | META | — | — |
| 3 | 1. Livebirths (Male) (a) | `LB_MALE` | RAW | — | count |
| 4 | 1. Livebirths (Female) (b) | `LB_FEMALE` | RAW | — | count |
| 5 | 1. Total Livebirths (c)=(a+b) | `LB_TOTAL` | COMPUTED | LB_MALE + LB_FEMALE | count |
| 6 | 2. Adolescent Birth Rate <10 years old (counts only) | `ABR_LT10_COUNT` | RAW | — | count (header says "rate" but is actually a raw count — see label note below) |
| 7 | Estimated Population (10-14 years old) | `POP_10_14` | RAW (reference) | — | count |
| 8 | Estimated Population (15-19 years old) | `POP_15_19` | RAW (reference) | — | count |
| 9 | 3. Adolescent Birth Rate 10-14 years old | `ABR_10_14_COUNT` | RAW | — | count (mislabeled — see below) |
| 10 | % | `ABR_10_14_RATE` | COMPUTED | (ABR_10_14_COUNT / POP_10_14) * 1000 | rate per 1,000, header wrongly says "%" |
| 11 | 3. Adolescent Birth Rate 15-19 years old | `ABR_15_19_COUNT` | RAW | — | count (mislabeled — see below) |
| 12 | % | `ABR_15_19_RATE` | COMPUTED | (ABR_15_19_COUNT / POP_15_19) * 1000 | rate per 1,000, header wrongly says "%" |
| 13 | 4. Repeat Adolescent Birth Rate 10-14 years old (counts only) | `RABR_10_14_COUNT` | RAW | — | count — no rate/denominator column exists for this group (see Flag 3) |
| 14 | Deliveries (15-19 years old) | `DELIVERIES_15_19` | RAW | — | count — denominator, but only for the 15-19 repeat rate |
| 15 | 4. Repeat Adolescent Birth Rate 15-19 years old | `RABR_15_19_COUNT` | RAW | — | count (mislabeled — see below) |
| 16 | % | `RABR_15_19_PCT` | COMPUTED | RABR_15_19_COUNT / DELIVERIES_15_19 | true percentage (no ×1000), unlike columns 10/12 |

**Label vs. reality mismatch (columns 6, 9, 11, 15):** every column whose header literally reads "Adolescent Birth Rate ___" or "Repeat Adolescent Birth Rate ___" is actually a raw count, not a rate. The real computed rate always lives in the adjacent "%" column. Config must map by index/formula logic, never by header label — worth calling out explicitly since the label collision here is unusually confusing (the header of the raw-count column and its rate column look almost identical).

**No Remarks or DQC columns anywhere in this file.** Checked all 5 sheet headers programmatically — none contain "Remarks" or "DQC" text. Unlike every Immunization/Nutrition file previously documented, this Natality file has zero built-in QC columns. Any DQC thresholds will have to be defined entirely in the parser config's dqc_rules, with no Excel-side reference to cross-check against.

---

### Column Inventory — Q2 (16 columns, index 0–15) — DIFFERENT LAYOUT, SAME QUARTER TYPE

Q2's header row is missing column 6 entirely ("2. Adolescent Birth Rate <10 years old (counts only)"). Every column after it shifts left by one relative to Q1/Q3/Q4/Annual:

| Idx (Q2) | Header text | Corresponds to idx in Q1/Q3/Q4/Annual |
|---|---|---|
| 0–5 | PSGC10 … Total Livebirths | same (0–5) |
| 6 | Estimated Population (10-14 years old) | 7 |
| 7 | Estimated Population (15-19 years old) | 8 |
| 8 | Adolescent Birth Rate 10-14 years old | 9 |
| 9 | % | 10 |
| 10 | Adolescent Birth Rate 15-19 years old | 11 |
| 11 | % | 12 |
| 12 | Repeat Adolescent Birth Rate 10-14 years old (counts only) | 13 |
| 13 | Deliveries (15-19 years old) | 14 |
| 14 | Repeat Adolescent Birth Rate 15-19 years old | 15 |
| 15 | % | 16 |

---

### FLAG 1 — Confirmed "known template error" (matches progress.md line 98: "Add missing ABR <10 column to Q2"), and its downstream impact is worse than the progress note implies

This is not just a cosmetic gap — it breaks the Annual rollup formula and silently zeroes out a real indicator:

- Q2's sheet is genuinely missing the "ABR <10 years old (counts only)" column (no column G at all — not blank, structurally absent). All columns from that point on are shifted left by one index vs. every other sheet in the file.
- The Annual sheet's rollup formula for this column literally contains an Excel error:
  ```
  G3 (Annual) = IFERROR(SUM('Q1'!G3, #REF!, 'Q3'!G3, 'Q4'!G3), 0)
  ```
  The #REF! is a dead reference where 'Q2'!G3 used to point before that column was deleted from Q2. Whoever built the Annual sheet correctly re-pointed every other shifted Q2 reference (e.g. ABR_10_14 correctly points to 'Q2'!I3 instead of 'Q2'!J3), but for the ABR<10 column there is nothing to re-point to, since Q2 has no equivalent cell at all.
- Because the whole SUM(...) is wrapped in IFERROR(...,0), Excel silently swallows the #REF! error and reports 0 instead. Confirmed with the cached (data_only) values: the Annual "ABR<10" count is 0 for every single location, even though Q1 alone already has a real value of 60 for Negros Occidental. This is a real, currently-live data-integrity defect in the source template, not a hypothetical.
- **Parser architecture implication (important, not just an Excel cosmetic issue):** parser.py's resolve_sheet_and_period() + single config["columns"] list assumes every quarterly sheet shares the same column layout — it just swaps which sheet name to read via sheet_map, using one shared columns array for all four quarters. If a config is written using the Q1/Q3/Q4/Annual column layout (indices 0–16) and pointed at Q2, every column from index 6 onward will silently read the wrong value (e.g. it would read Q2's "Estimated Population 10-14" as if it were "ABR<10 counts", shifting every subsequent field one column left) — with no error thrown, since all columns still resolve to some value. There is currently no config mechanism for "same frequency, but this one sheet has a different column layout". **Recommendation: do not attempt a parser workaround — wait for the pending template fix (add the missing ABR<10 column back into Q2) before writing this config**, exactly as progress.md already lists it under "Pending Team Actions." If the fix is delayed and this template must ship anyway, Q2 uploads should be blocked/refused by the config layer (e.g. via a per-sheet column count sanity check) rather than silently mis-mapped.

### FLAG 2 — New "rate per 1,000" formula pattern, not yet represented in the indicator schema

Columns 10 and 12 (ABR_10_14_RATE, ABR_15_19_RATE) compute (count / population) * 1000, i.e. a demographic rate per 1,000, not a percentage — yet the header literally labels them "%". Checked backend/app/core/seed_indicators.py: every indicator seeded so far uses formula_type = "percentage" (no "rate" variant is in use yet), even though the schema has a rate_multiplier column that's clearly meant for exactly this case. This file is the first to actually need a non-1/non-100 rate multiplier (×1000). Recommend:
- formula_type = "rate" (or similar, distinct from "percentage") with rate_multiplier = 1000 for ABR_10_14_RATE / ABR_15_19_RATE.
- Keep formula_type = "percentage" (multiplier 1 or 100 per existing convention) for RABR_15_19_PCT (column 16), since that one is a genuine percentage (count / deliveries, no ×1000).
- Naming convention question: adding_templates.md says percentage indicators must end in _PCT with a matching _TOTAL numerator. The ABR rate columns don't have a "_TOTAL" sibling in the same sense — worth confirming whether _RATE suffix + direct numerator_code pointer is acceptable, or whether the convention needs a new suffix pattern for this indicator family.

### FLAG 3 — Repeat ABR 10-14 has no rate/percentage counterpart (design gap, not an Excel formula bug)

Column 13, RABR_10_14_COUNT ("Repeat Adolescent Birth Rate 10-14 years old (counts only)"), has no matching denominator or computed rate anywhere in the sheet — unlike the 15-19 group, which has a full triad (count → DELIVERIES_15_19 denominator → RABR_15_19_PCT). Sample data shows this count is not always zero (Negros Oriental = 15 in Q1), so it's a real, non-negligible indicator that DOH apparently tracks as a bare count with no computed rate in this template. Open question for the team: is this intentional (DOH doesn't publish a 10-14 repeat-birth rate, perhaps because the base population is too small to be statistically meaningful), or is a "Deliveries (10-14 years old)" denominator column simply missing from the template the same way the ABR<10 column is missing from Q2? Needs verification before deciding whether to compute RABR_10_14_PCT at all.

### FLAG 4 — Cross-file dependency confirmed via change_log

The file's own change_log sheet documents that Total Live Births from this file is used as the denominator for MMR (Maternal Mortality Ratio) in a separate file:
> 03/23/2026 — "Total Live Birth" changed back to "N/A" from a disaggregated (Resident/Non-resident) breakdown — "Reconciled with DPCB to use Total Live births as denominator for MMR"

This is directly relevant to morta_mmr_imr_nir.xlsx, which is also on the pending-fix list in progress.md. Schema design should treat LB_TOTAL from this file as a shared/reusable denominator source (denominator_source in the indicators table) that the MMR template's config can reference, rather than re-deriving live births independently. Also worth flagging: an earlier change_log entry mentions a Resident/Non-resident disaggregation of Total Live Births was tried and then reverted — confirms this file does not currently disaggregate by residency, only by sex (Male/Female).

### FLAG 5 — Confirm the "% of RABR" formula-change note

change_log entry 1 (01/27/2026): "Q1, Q2, Q3, Q4, Annual % of RABR — Formula changed — Align with meta data." This is presumably why column 16's formula is a plain ratio (P/O, no ×1000) while the ABR rate columns use ×1000 — i.e. this may be an intentional, already-reconciled metadata alignment rather than an inconsistency to "fix." Recorded here for completeness; no action needed beyond noting it explains the differing multiplier between columns 10/12 and column 16.

---

### Age/Sex/Other Disaggregation

- **Sex:** Male/Female for Live Births only. ABR/RABR counts and rates are not sex-disaggregated (adolescent mothers are implicitly female; no male column for these).
- **Age groups:** <10, 10-14, 15-19 for ABR; 10-14 and 15-19 for RABR. No 20-24 or older maternal age bands in this file.
- **Residency:** Not disaggregated (Resident/Non-resident split was tried and reverted per change_log).
- **Geography:** Province + HUC only (4 rows) — no city/municipality/barangay breakout, unlike Immunization files.

### DQC Notes

- No DQC columns exist in the Excel template at all (confirmed via header scan of all 5 sheets) — this file relies entirely on config-defined dqc_rules, with no source-of-truth cross-check in the sheet itself.
- Sensible DQC candidates to define in config (none present in the file, these are recommendations):
  - ABR_10_14_COUNT + ABR_15_19_COUNT shouldn't exceed LB_TOTAL.
  - RABR_15_19_COUNT shouldn't exceed DELIVERIES_15_19.
  - Flag implausible rate spikes (e.g. Siquijor's Q1 ABR_10_14_RATE = 0.224 per 1000 vs. Negros Occidental's 0.095 — small-denominator provinces like Siquijor will naturally show noisier rates; a fixed absolute threshold may not be appropriate here the way "over 200%" was for coverage percentages).

### RBAC / Sensitive Indicators

Per CLAUDE.md's "Sensitive Indicators" section (HIV reactive, Syphilis reactive require extra RBAC restrictions) — none of this file's indicators are on that sensitive list. Live births, adolescent birth rate, and repeat adolescent birth rate are not flagged as sensitive in the current rules. No is_sensitive = TRUE needed for any column in this file's seed entries, though adolescent birth data is arguably privacy-sensitive in a general sense — worth a policy confirmation with the team since it's a different sensitivity category (minors) than the two currently listed, but per the literal current rule text, no RBAC flag is required.

---

### Summary of Raw Inputs to Store (per location per period, using Q1/Q3/Q4/Annual layout)

1. Livebirths Male
2. Livebirths Female
3. ABR <10 count (absent in Q2 — blocked pending template fix)
4. Estimated Population 10-14
5. Estimated Population 15-19
6. ABR 10-14 count
7. ABR 15-19 count
8. Repeat ABR 10-14 count
9. Deliveries 15-19
10. Repeat ABR 15-19 count

**Total raw inputs: 10 per location per period** (9 in Q2 until the template is fixed), across only 4 real geographic locations (Negros Occidental, Negros Oriental, Siquijor, City of Bacolod HUC) — the smallest location count of any file documented so far.

### Open Questions — This File

| ID | Question |
|---|---|
| Q-NATA-1 | Confirm with the encoder: has the missing ABR<10 column actually been added back to Q2 yet, or is this still pending (per progress.md)? Do not build the config until confirmed, per Flag 1. |
| Q-NATA-2 | Is RABR_10_14_COUNT (col 13) intentionally rate-less, or is a "Deliveries (10-14 years old)" denominator column missing from the template the same way Q2's ABR<10 column was missing? |
| Q-NATA-3 | Confirm formula_type/rate_multiplier convention for the new "rate per 1,000" indicator family (ABR_10_14_RATE, ABR_15_19_RATE) vs. existing _PCT/percentage convention — first file to need this. |
| Q-NATA-4 | Confirm LB_TOTAL should be registered as a shared denominator_source for the MMR file (morta_mmr_imr_nir.xlsx), per the change_log's explicit cross-file note. |
| Q-NATA-5 | Confirm location_column = 2 (not 1) for this template — column 1 ("Region") is a constant "NIR" literal, not a real location name, unlike the pattern seen in other templates. |
