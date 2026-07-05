# FHSIS Template Analysis — Infectious Disease > HIV-Syphilis-HepaB
## Program: Infectious Disease > Antenatal Screening (Pregnant Women)

**Purpose:** Document structure of the 3 HIV/Syphilis/Hepatitis B Excel templates before schema + parser config design.
**Analyst:** Claude (file-search subagent)

---

## Files in This Group (3 total)

| # | Filename | Indicator | Status |
|---|---|---|---|
| 1 | `infec_hepatitisb_nir.xlsx` | Pregnant women screened / reactive for Hepatitis B | Analyzed |
| 2 | `infec_hiv_nir.xlsx` | Pregnant women screened / reactive for HIV | Analyzed |
| 3 | `infec_syphilis_nir.xlsx` | Pregnant women screened / reactive / treated for Syphilis | Analyzed |

All three share one template skeleton (antenatal screening during pregnancy, not general population screening) but Syphilis has one extra indicator group (treatment) that HepB/HIV explicitly do **not** have (confirmed via `change_log`, see below).

---

## File 1: `infec_hepatitisb_nir.xlsx`
**Tracks:** Pregnant women screened for Hepatitis B, and screened REACTIVE (HBsAg positive) for Hepatitis B, by age group.

### Sheet Structure
| Sheet | Type | Notes |
|---|---|---|
| Qtr1–Qtr4 | Quarterly | **Data entry** grain — this is the finest grain, there are no monthly tabs |
| Annual | Summary | Rollup — `=SUM('Qtr1'!x,'Qtr2'!x,'Qtr3'!x,'Qtr4'!x)` per province/HUC row; region row = `=SUM(...)` of province rows |
| change_log | Admin | Version history — NOT imported |

**No dedicated Population sheet** (unlike Immunization files) — population is embedded as a raw column in every data sheet.
**Frequency:** Quarterly + Annual only (Annual is a pure Excel rollup of the 4 quarters — should be treated like the "computed, not ingested" pattern already used for Annual/Quarterly views elsewhere).
**Rows per sheet:** 11 total rows in the sheet, but only **5 are data rows** (rows 2–6, 1-indexed): Region total (NIR) + Negros Occidental + Negros Oriental + Siquijor (province) + City of Bacolod (HUC). Rows 7+ are blank/legend/source-note text (`Source: DOH-FHSIS`, `Legend:`, asterisk/zero notes) which the parser's existing blank-PSGC-skip logic already tolerates.
**Columns per sheet:** 14 (0-based indices 0–13)

**Important structural quirk — region row is itself a formula, not raw data:** Row 2 (Excel row, "NIRA") is `=SUM(D3:D6)` etc. — an aggregate of the 4 rows beneath it (2 provinces + Siquijor + Bacolod HUC). This mirrors how Immunization region rows behave, just with far fewer rows underneath (5 total vs 129). **There is no city/municipality/barangay breakdown in this file group** — reporting stops at province/HUC level only.

### Age/Sex Disaggregation
- **Age only** (10–14, 15–19, 20–49 years old) — **no Male/Female split** (makes sense: indicator population is exclusively pregnant women).
- No child age-groups (0-11m etc.) — this is a maternal/antenatal indicator, denominator is "Projected Population Under 1" used as a birth-cohort proxy for expected pregnancies (standard FHSIS MCH convention, not a bug).

### Column Inventory
| Col (0-based) | Label | Type | Formula | Unit | SENSITIVE? |
|---|---|---|---|---|---|
| 0 | PSGC 10 | META (psgc_column) | — | — | no |
| 1 | (blank header, value "NIRA") | META — region abbreviation, added later per change_log "for easy filtering of region"; redundant with col 2, not referenced in `columns` | — | — | no |
| 2 | Region, Province/City, Municipality | META (location_column) | — | — | no |
| 3 | Projected Population Under 1 | RAW (denominator) | — | count | no |
| 4 | Screened for Hepatitis B (10–14 yrs) | RAW | — | count | **no — testing volume** |
| 5 | Screened for Hepatitis B (15–19 yrs) | RAW | — | count | **no — testing volume** |
| 6 | Screened for Hepatitis B (20–49 yrs) | RAW | — | count | **no — testing volume** |
| 7 | A. Total | COMPUTED | col[4]+col[5]+col[6] | count | no |
| 8 | % of pregnant women screened for Hepatitis B | COMPUTED | col[7]/col[3] | % (×100) | no |
| 9 | Screened REACTIVE for Hepatitis B (10–14 yrs) | RAW | — | count | **YES — reactive case count** |
| 10 | Screened REACTIVE for Hepatitis B (15–19 yrs) | RAW | — | count | **YES — reactive case count** |
| 11 | Screened REACTIVE for Hepatitis B (20–49 yrs) | RAW | — | count | **YES — reactive case count** |
| 12 | B. Total | COMPUTED | col[9]+col[10]+col[11] | count | **YES — total reactive cases** |
| 13 | % of pregnant women screened REACTIVE for Hepatitis B | COMPUTED | col[12]/col[7] | % (×100) | **YES — rate derived from reactive counts** |

No DQC/Remarks columns exist in the sheet at all (unlike Immunization files, which always ship an explicit "Over 200%" DQC column). DQC thresholds for this file group must be defined purely in the parser config, not copied from the template.

### DQC Notes
- No DQC formulas visible in the workbook itself.
- Suggest defining an `over_threshold` rule on col 8 (% screened) and possibly col 13 (% reactive) analogous to existing configs, since none is provided by DOH here.

### Flags / Open Questions
- **FLAG H1 — No sex disaggregation.** Every other analyzed file group (Immunization, Mgt of Sick, Nutrition) disaggregates Male/Female; this group disaggregates by age band only. Confirm the `columns` config and seed indicators use an age suffix, not a sex suffix.
- **FLAG H2 — HepaB has no "treated" columns**, confirmed intentional via `change_log` (see below) — do not expect a Group C parallel to Syphilis.
- **FLAG H3 — Sensitivity of Hepatitis B reactive is not explicitly named in CLAUDE.md.** CLAUDE.md's "Sensitive Indicators" section names only "HIV reactive cases" and "Syphilis reactive cases." Recommend applying the same `is_sensitive = TRUE` treatment to HepB reactive columns (9–13) by extension (same PHI class — bloodborne infection status), but this should be confirmed with the project owner since it's not literally in the current policy text.
- **FLAG H4 — Blank-header column 1** ("NIRA" abbreviation) is redundant with column 2 and not needed in the `columns` array; just don't map it (parser only touches indices you declare).
- **FLAG H5 — No city/municipality/barangay rows.** Location granularity here is Region → Province → HUC only (5 rows), a much coarser level than Immunization's 129-row templates. Confirm this is intentional/expected for this reporting program before building the schema around it.

---

## File 2: `infec_hiv_nir.xlsx`
**Tracks:** Pregnant women screened for HIV, and screened REACTIVE for HIV, by age group.

### Sheet Structure
Identical to File 1: Qtr1–Qtr4 (data) + Annual (rollup formula) + change_log (admin, not imported). No Population sheet, no monthly tabs.
**Rows per sheet:** 11 total, 5 data rows (same Region/2 provinces/Siquijor/Bacolod HUC pattern).
**Columns per sheet:** 14 (0–13) — **structurally identical column layout to File 1**, only the disease name changes in the header text.

### Age/Sex Disaggregation
Same as File 1: age bands only (10–14, 15–19, 20–49), no sex split.

### Column Inventory
| Col | Label | Type | Formula | Unit | SENSITIVE? |
|---|---|---|---|---|---|
| 0 | PSGC 10 | META | — | — | no |
| 1 | (blank header) region abbrev | META, ignorable | — | — | no |
| 2 | Region, Province/City, Municipality | META | — | — | no |
| 3 | Projected Population Under 1 | RAW (denominator) | — | count | no |
| 4 | Screened for HIV (10–14) | RAW | — | count | **no — testing volume** |
| 5 | Screened for HIV (15–19) | RAW | — | count | **no — testing volume** |
| 6 | Screened for HIV (20–49) | RAW | — | count | **no — testing volume** |
| 7 | A. Total | COMPUTED | col[4]+col[5]+col[6] | count | no |
| 8 | % of pregnant women screened for HIV | COMPUTED | col[7]/col[3] | % | no |
| 9 | Screened REACTIVE for HIV (10–14) | RAW | — | count | **YES — explicitly named in CLAUDE.md "Sensitive Indicators"** |
| 10 | Screened REACTIVE for HIV (15–19) | RAW | — | count | **YES** |
| 11 | Screened REACTIVE for HIV (20–49) | RAW | — | count | **YES** |
| 12 | B. Total | COMPUTED | col[9]+col[10]+col[11] | count | **YES — total reactive cases; must remain hidden/aggregated per RBAC rule** |
| 13 | % of pregnant women screened REACTIVE for HIV | COMPUTED | col[12]/col[7] | % | **YES** |

### Sample Data Observation
In the sample Qtr1 data, all reactive counts (cols 9–12) are **0 for every location** — plausible in a low-prevalence region, but means the dry-run test file won't visibly exercise the RBAC-masking behavior for non-zero reactive values. Recommend testing RBAC restriction with synthetic non-zero data before sign-off.

### DQC Notes
No DQC columns present in the sheet, same as File 1.

### Flags / Open Questions
- **FLAG V1 — This is the single most policy-critical file in the group.** Columns 9–13 map directly to the explicit CLAUDE.md sensitivity rule ("HIV reactive cases … require extra RBAC restrictions at API level; dashboard shows aggregated totals only for unauthorized roles"). Per `adding_templates.md` Step 1, `HIV_REACTIVE_10_14`, `HIV_REACTIVE_15_19`, `HIV_REACTIVE_20_49`, `HIV_REACTIVE_TOTAL`, and `HIV_REACTIVE_PCT` (whatever codes are chosen) must all be seeded with `is_sensitive = TRUE`.
- **FLAG V2 — "Aggregated totals only for unauthorized roles"** implies the age-band breakdown (cols 9–11) may need to be *more* restricted than the region/province total (col 12) — i.e., two tiers of restriction, not one flat flag. Current `is_sensitive` boolean in `seed_indicators.py` is a single flag; confirm with the team whether one bit is sufficient or whether the API needs an additional "detail level" restriction to satisfy "aggregated totals only."
- **FLAG V3** — same change_log note as File 1: HIV's treatment columns (previously columns O–S) were explicitly removed ("Remove the treated part not part metadata" / "no treated indicator" pattern) — confirms HIV file will never have a Group C like Syphilis.

---

## File 3: `infec_syphilis_nir.xlsx`
**Tracks:** Pregnant women screened for Syphilis, screened REACTIVE for Syphilis, **and** (unique to this file) reactive women who received treatment for Syphilis — all by age group.

### Sheet Structure
Same as Files 1 & 2: Qtr1–Qtr4 (data) + Annual (rollup) + change_log (admin, not imported). No Population sheet, no monthly tabs.
**Rows per sheet:** 11 total, 5 data rows (Region/2 provinces/Siquijor/Bacolod HUC — identical location set to the other two files).
**Columns per sheet:** 19 (0–18) — **5 more columns than HepB/HIV**, all belonging to a third indicator group (treatment).

### Column Inventory
| Col | Label | Type | Formula | Unit | SENSITIVE? |
|---|---|---|---|---|---|
| 0 | PSGC 10 | META | — | — | no |
| 1 | (blank header) region abbrev | META, ignorable | — | — | no |
| 2 | Region, Province/City, Municipality | META | — | — | no |
| 3 | Projected Population Under 1 | RAW (denominator) | — | count | no — **but blank/NaN in all sample rows, see flag below** |
| 4 | Screened for Syphilis (10–14) | RAW | — | count | **no — testing volume** |
| 5 | Screened for Syphilis (15–19) | RAW | — | count | **no — testing volume** |
| 6 | Screened for Syphilis (20–49) | RAW | — | count | **no — testing volume** |
| 7 | A. Total | COMPUTED | col[4]+col[5]+col[6] | count | no |
| 8 | % of pregnant women screened for syphilis | COMPUTED | col[7]/col[3] | % | no |
| 9 | Screened REACTIVE for Syphilis (10–14) | RAW | — | count | **YES — explicit CLAUDE.md indicator** |
| 10 | Screened REACTIVE for Syphilis (15–19) | RAW | — | count | **YES** |
| 11 | Screened REACTIVE for Syphilis (20–49) | RAW | — | count | **YES** |
| 12 | B. Total | COMPUTED | col[9]+col[10]+col[11] | count | **YES — total reactive cases** |
| 13 | % of pregnant women screened REACTIVE for syphilis | COMPUTED | col[12]/col[7] | % | **YES** |
| 14 | No. of syphilis-reactive women treated (10–14) | RAW | — | count | **YES — reveals reactive status even though framed as "treated"** |
| 15 | No. of syphilis-reactive women treated (15–19) | RAW | — | count | **YES** |
| 16 | No. of syphilis-reactive women treated (20–49) | RAW | — | count | **YES** |
| 17 | C. Total | COMPUTED | col[14]+col[15]+col[16] | count | **YES — total treated-for-syphilis (implies reactive)** |
| 18 | % of pregnant women treated for syphilis | COMPUTED | col[17]/col[12] | % | **YES — denominator is itself the reactive total (col 12)** |

### DQC Notes
No DQC columns present in the sheet; formulas only cover Total/Percent rollups, same as Files 1–2.

### Sample Data Observation — Denominator Data Quality Issue
**The "Projected Population Under 1" column (col 3) is entirely blank/NaN for every province/HUC row in this file**, across all sheets checked (Qtr1, Qtr2, Qtr4, Annual) — confirmed the HepB and HIV files *do* have this column populated (e.g., 52,678 for Negros Occidental) for the same period/locations, so this isn't a sitewide "not yet available" situation, it's specific to the Syphilis file. As a result, `% of pregnant women screened for syphilis` (col 8) evaluates to 0 for every row via `IFERROR(...,0)` even though the screened total (col 7) is non-zero (e.g., 5,926 for the region). This will surface as a data-quality problem the moment this file is parsed — recommend flagging to the DOH data owner before treating col 8 as reliable, and consider a DQC rule that flags "numerator > 0 but denominator = 0/blank."

### Flags / Open Questions
- **FLAG S1 — Sensitive column footprint is larger here than in HIV/HepB.** Beyond the standard reactive columns (9–13), the Group C "treated" columns (14–18) also disclose reactive status (only reactive women are treated), so they should carry the same `is_sensitive = TRUE` flag even though CLAUDE.md's literal wording only says "Syphilis reactive cases" — recommend explicitly extending the policy language to cover "and any indicator that discloses reactive status indirectly (e.g., treatment counts)."
- **FLAG S2 — Missing population denominator** (see above) makes col 8's percentage meaningless in the current sample data; needs resolution with the data owner (Is this an omission in this specific export, or is population genuinely not tracked for Syphilis reporting?).
- **FLAG S3 — Asymmetric structure across the 3 files** (19 cols here vs 14 in HepB/HIV) is intentional, not a template error — confirmed via `change_log` (below), but worth stating explicitly in the config docs so a future maintainer doesn't try to force all three files into one shared config.

---

## Cross-File `change_log` Findings (Applies to All 3 Files)

All three change_logs record the same two historical edits, plus one file-specific edit each:
1. **"Add Column for Region"** (2025-10-20, all 3 files) — added the blank-header abbreviation column (col 1) "for easy filtering of region." Confirms col 1 is a convenience column, not a data column.
2. **"Sulu Province"** reassigned from BARMM to Region IX (2025-10-20, all 3 files) — a PSGC/location mapping change, not a column-structure change; relevant to `location_aliases` handling but not to this analysis's column inventory.
3. **File-specific:**
   - HepaB: "Column O to S … deleted column … No treated indicator for HepaB" (2025-01-15) — **explicitly confirms** HepaB never had, and should never gain, a Group C treatment section.
   - HIV: "Column O-S … Remove the treated part not part metadata" (2026-03-04) — **explicitly confirms** the same for HIV.
   - Syphilis: no removal entry — Group C (treatment) is retained deliberately, which is the reason the syphilis file is 5 columns wider than the other two.

This is strong documentary evidence that the 3-file asymmetry (14 vs 14 vs 19 columns) is a deliberate DOH decision (syphilis has a curative antenatal treatment protocol; HIV/HepB antenatal management doesn't fit the same "treated" metric), not a template inconsistency to reconcile.

---

## Cross-File Pattern Summary

| Pattern | HepatitisB | HIV | Syphilis |
|---|---|---|---|
| Sheets | Qtr1–4, Annual, change_log | same | same |
| Monthly tabs | No | No | No |
| Population sheet | No (embedded column instead) | No | No (and the embedded column is blank!) |
| Data rows per sheet | 5 (Region+2 provinces+Siquijor+Bacolod HUC) | 5 | 5 |
| City/Muni/Barangay breakdown | No | No | No |
| Sex disaggregation | No (age bands only) | No | No |
| Age bands | 10-14, 15-19, 20-49 | same | same |
| Indicator groups | Screened, Reactive (2) | Screened, Reactive (2) | Screened, Reactive, Treated (3) |
| Columns per sheet | 14 | 14 | 19 |
| Region row formula | `=SUM(province rows)` | same | same |
| Annual sheet formula | Cross-sheet SUM of Qtr1-4 | same | same |
| DQC columns present in template | None | None | None |
| Explicit CLAUDE.md sensitive indicator | Not named (extend by analogy) | Yes ("HIV reactive cases") | Yes ("Syphilis reactive cases") |

### Sensitive Column Master List (for seed script `is_sensitive = TRUE`)
- **HIV file:** cols 9, 10, 11 (age-band reactive), 12 (B.Total reactive), 13 (% reactive)
- **Syphilis file:** cols 9, 10, 11, 12, 13 (same as HIV) **plus** 14, 15, 16, 17, 18 (treated-for-syphilis group, since it discloses reactive status)
- **Hepatitis B file:** cols 9, 10, 11, 12, 13 — same shape as HIV, but not explicitly named in current CLAUDE.md text; recommend treating as sensitive by policy analogy and flagging to project owner for an explicit CLAUDE.md update.
- **Not sensitive (public/testing volume):** population column, all "screened" (non-reactive) age-band columns and their totals/percentages in all 3 files.

---

## Summary

All three files (HepatitisB, HIV, Syphilis) share one antenatal-screening template: Region→Province→HUC only (5 rows, no city/municipality/barangay), age-band disaggregation (10-14/15-19/20-49, no sex split), Quarterly-only data entry (Annual is a pure Excel rollup, no monthly tabs, no Population sheet — population is an embedded raw column). HepB and HIV are structurally identical (14 columns); Syphilis has 5 extra columns for a "treated" group, confirmed intentional via `change_log` entries stating HepB/HIV explicitly had their treatment columns deleted ("no treated indicator").

**Sensitive columns requiring `is_sensitive=TRUE`:** in HIV and Syphilis, all "REACTIVE" age-band/total/percentage columns (indices 9–13 in both files) map directly to CLAUDE.md's named indicators. Syphilis additionally needs its "treated for syphilis" columns (14–18) flagged sensitive since treatment counts indirectly disclose reactive status — this isn't literally named in CLAUDE.md and should be confirmed with the project owner. Hepatitis B's reactive columns (9–13) are structurally identical to HIV's but aren't explicitly named in CLAUDE.md's sensitive-indicators list — recommend extending the policy by analogy rather than leaving them unprotected.

Biggest flags: (1) the Syphilis file's population denominator is entirely blank across all sample data, making its "% screened" always compute to 0 — a data-quality problem to raise with DOH before trusting that column; (2) none of the three templates ship built-in DQC threshold columns, unlike the Immunization files, so DQC rules must be authored from scratch in the parser config; (3) CLAUDE.md's RBAC wording ("aggregated totals only for unauthorized roles") may imply two tiers of restriction (age-band detail vs. total) rather than the single `is_sensitive` boolean currently supported by `seed_indicators.py` — worth clarifying before schema finalization.
