---
name: analyze-template
description: Analyze an FHSIS Excel template's real structure (formulas, not labels) before writing a parser config or re-verifying a file DOH claims to have fixed. Use when a new .xlsx template lands in backend/data/, or when a previously-flagged file comes back from DOH and needs re-checking against the old write-up.
---

# Analyze an FHSIS Template

This is the read-only inspection pass that must happen before `add-template` touches any
code. It produces one markdown write-up per file-group in `memory-bank/template_analysis/`.
**Never skip this and go straight to writing a config** — every one of the 18 programs
analyzed so far had at least one column whose header lied about what it actually computes.

## Ground rule

**Trust the formula, never the label.** Read every sheet with `openpyxl` in *both* modes:
`data_only=False` (the literal formula string) and `data_only=True` (the cached value). The
header text is what a human typed; the formula is what the file actually does. When they
disagree — and across 18 prior analyses they disagreed constantly — the formula wins, and the
config must be built to compute the *correct* result, not to replicate the file's own (possibly
buggy) formula.

## Where output goes

Write the finished report directly to `memory-bank/template_analysis/<program_or_group>.md` —
**not** the session scratchpad. If you delegate any part of this to a sub-agent (Explore agents
have no Write tool), the orchestrating turn must persist the returned text to that path itself,
in the same turn, before moving on. A file written only to scratchpad does not survive to the
next session.

## Steps

### 1. Inventory the files
List every `.xlsx` in the program's `backend/data/<PROGRAM>/` folder — recurse fully, don't
`ls -maxdepth 1`. Several programs' files are nested one folder deeper in sub-category folders
and looked empty at a shallow listing before.

### 2. Per file: read structure first
- Sheet names and types (monthly / quarterly / annual / reference / admin `change_log`).
- Real row count vs. reported `max_row` — Excel formatting bloat routinely inflates dimensions
  (e.g. a sheet reporting 863 or 220 rows with only 5-6 real data rows). Confirm by scanning for
  the actual last non-blank row, don't trust `ws.dimensions`.
- Real column count vs. reported `max_column` — same bloat pattern on the column axis.
- Geographic granularity: 5-row province/HUC rollup, 68/129-row municipality/barangay, or
  something structurally different (age-as-rows, disease-as-rows). Don't assume it matches a
  sibling program's granularity.
- `psgc_column` and `location_column` — **check whether column 1 is a constant filler** (often
  literally "NIR" or "NIRA" on every row) before assuming it's the location name. The real
  varying location text is frequently column 2.

### 3. Per column: build the inventory table
For every column: 0-based index, label as printed, proposed `indicator_code`, type
(RAW / COMPUTED / META / DQC), and — critically — **the actual formula**, verified against
cached values with hand arithmetic on at least one real (non-placeholder) row. Flag explicitly
when the formula's numerator/denominator does not match what the header claims.

### 4. Check the two known recurring bug classes explicitly
Every new file should be checked for both, even if neither has shown up yet in that program:

- **(a) Conditional-formatting anchor off-by-one.** Compare the DQC `sqref` range's row bounds
  against the real data extent. A rule anchored to start one row past the last real row is
  permanently dead — it will never fire even on genuinely bad data. Confirmed in NCD, Geriatric
  (18 dead rules in one file).
- **(b) "Over 100%" scale mismatch.** Check the percentage cell's `number_format` (usually
  `0.00%`, meaning the stored value is a raw 0–1 ratio) against what the `IF()` DQC formula
  compares it to. If the formula compares the raw ratio to the literal number `100` instead of
  `1`, the check can only fire on a >10,000% anomaly — functionally dead. Confirmed in Post
  Partum, suspected but unverified in Prenatal.

### 5. Check `change_log`/`changelog` sheet
Read it, but verify every entry against the *current* file — entries referencing a column
letter/formula that no longer exists in the live layout are common (found in 4+ files) and mean
the log is directional history only, not an authoritative map of current structure.

### 6. Check for sensitive indicators
Cross-reference every column against `CLAUDE.md`'s "Sensitive Indicators" section (HIV reactive,
Syphilis reactive). Also flag — without assuming an answer — anything in the same PHI class by
analogy (Hepatitis B reactive, syphilis "treated" columns, which disclose reactive status
indirectly) or with a comparable stigma profile (Leprosy, mental health screening data). These
go in the write-up as open questions for the project owner, not silent inclusions/exclusions.

### 7. Note test-data caveats
Most shipped files only have Q1 (or nothing) populated — Q2–Q4 blank is expected, not a defect.
Some files are entirely zero-valued; say so explicitly, since it means no bug in that file can be
demonstrated with cached-value arithmetic, only with formula/reference inspection.

### 8. Write the report
Match the structure already established across the 18 existing write-ups in
`memory-bank/template_analysis/`: Sheet Structure → Age/Sex Disaggregation → Geographic Levels →
Column Inventory (per file) → DQC Rules → Flags/Open Questions (numbered, one ID per flag) →
Cross-File Comparison table (if multi-file) → Summary. Read 2-3 existing files in that folder
first to match tone and format before writing a new one.

### 9. Update the index
Add a one-line pointer in `memory-bank/MEMORY.md` if this is a new file (not a re-check).

## Re-checking a file DOH claims to have fixed

Same method, but diff against the *existing* write-up instead of starting cold:
1. Re-run steps 2-4 against the new file.
2. For each flag in the old write-up, state explicitly: fixed / still present / changed in a new
   way.
3. Append a "Re-verified <date>" section to the existing file rather than replacing it — the
   history of what was wrong is worth keeping.
4. If this changes a decision recorded in
   `memory-bank/template_analysis/00_CONSOLIDATED_SUMMARY.md` (e.g. removes a blocker from §4-A),
   update that file too.

## What this skill does NOT do

No `.py`/`.json` files are written, no indicators are seeded, no DB is touched. This is strictly
read-only inspection. Handing off to `add-template` is a separate, explicit step — don't chain
into it automatically, since the project's locked cadence is propose → review → approve → build.
