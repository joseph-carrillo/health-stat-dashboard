# Consolidated Template Analysis — All 10 Remaining Programs

> **What this is:** The merge of all 18 sub-group analyses (46 Excel files, 10 programs) into one
> decision document. Written 2026-07-06 from the write-ups in this folder. Each claim traces back
> to a per-group file — this document tells you *what to decide and in what order to build*;
> the per-group files tell you *why*.
>
> **Read order:** §1 TL;DR → §2 Decisions you need to make → §3 Sensitive indicators →
> §4 Files DOH must fix → §5 Build-priority order → §6 Cross-cutting patterns → §7 Scorecard.

---

## 1. TL;DR

- **Nothing is buildable "as-is" without at least one decision from you**, but most of it is
  close. Roughly half the 18 groups can be built with the existing parser and schema (config
  files only). The other half needs either a small schema addition, a parser change, or a
  fixed source file from DOH.
- **The templates cannot be trusted.** Every group has at least one label that lies about its
  own formula, and 9 groups have confirmed *formula* bugs (wrong denominator, wrong quarter,
  circular reference, skipped quarter, wrong region's data). Our standing rule — recompute
  everything from raw inputs, never trust Excel's numbers — is now proven necessary, not
  paranoia.
- **The templates' own quality checks are mostly dead.** Across the new programs, the built-in
  "DQC" checks are either absent entirely (most Infectious Disease, Vital Stats, Morbidity,
  Oral Health), anchored to empty rows so they never fire (NCD, Geriatric), or compare against
  the wrong scale so they can't fire (Post Partum, likely Prenatal). In at least two files, the
  shipped sample data violates the exact rule the dead check was built to catch. **Our
  dashboard's DQC layer will be the only working data-quality net these programs have.**
- **Four files need DOH to fix them before we can ingest them at all** (§4-A). Everything else
  we can work around in config.
- **The sensitive-indicator list needs your expansion decision** — 5 candidate additions beyond
  HIV/Syphilis reactive (§3).
- **Recommended first build: HIV-Syphilis-HepaB** — smallest group, high-profile, and it
  exercises the sensitive-data RBAC end-to-end, which nothing in CHILD_CARE does (§5).

---

## 2. Decisions needed before seeding starts

These gate the build. D1–D3 unlock the most groups for the least work; D7–D8 can wait.

| # | Decision | What it unlocks | Recommendation |
|---|---|---|---|
| **D1** | Add `formula_type = "rate"` with a working `rate_multiplier` (×100 / ×1,000 / ×10,000 / ×100,000 / ×1,000,000). The DB column exists but nothing uses it — display + seeding paths must honor it end-to-end. | Leprosy, Rabies, both Vital Stats files (MMR ×100k, IMR ×1k, ABR ×1k, prevalence ×10k, G2D ×1M) | **Do it.** Small schema/display uplift, unlocks 4 groups. Suffix `_RATE` instead of `_PCT`. |
| **D2** | Add `formula_type = "ratio"` for unbounded population-per-resource ratios (no 100% ceiling, "1 doctor : 12,450 people" display, no over-100% DQC). | Demographics | **Do it alongside D1** — same code paths. |
| **D3** | Multi-table workbooks: extend the parser so `extra_sheets` can vary by period, **or** split each workbook into multiple configs (several template_ids pointing at one physical file). | Rabies (4 sub-templates), Schisto age-band files (3–6 sheet-groups each), MMR/IMR (2 families), NCD Cancer/RA (a/b groups), maternal BP/HPN files (a/b groups) | **Split into multiple configs.** Zero parser changes, matches the existing recipe, already how MAM/SAM works in spirit. Costs: more template_ids per file. |
| **D4** | New DQC rule type `"reconciliation"` — "sum of parts = whole" / "parts ≤ whole". `run_dqc_rules()` only knows `over_threshold` and `sequence` today. | Rabies groups b/d ship these checks; recommended for FP flow-balance, Leprosy all-ages vs sum, Filariasis pop columns, STH Treated ≤ Confirmed | **Do it** — one parser function, big DQC payoff across many groups. |
| **D5** | Per-column rollup override (`rollup: "last"` vs default `"sum"`): NCD meds' risk-assessment columns are year-to-date cumulative — summing months would badly overstate annual totals. Also needed conceptually for FP stock figures (Beginning = Q1's value, Ending = Q4's). | NCD meds, Family Planning annual stocks | Needed before those two groups only — can defer. |
| **D6** | Row-dimension parsing: several files stack quarters and/or age groups as *row blocks inside one sheet* instead of one tab per period. Needs either a `row_filter: {column, equals}` config key or a `row_group_column` concept. | Family Planning (quarters stacked), Oral Health (quarters + 8 age bands stacked), NCD Eye Health (4 age brackets × 5 locations as rows) | Needed for 3 groups — decide when you get there; `row_filter` is the smaller change. |
| **D7** | Morbidity schema: ~10,400 auto-generated indicator codes (Option A) vs. a dedicated `diseases` reference table + disease_id on health_data (Option B). | Morbidity only | **Lean Option B** — 10,400 codes would swamp the indicators table and every dropdown in the UI. But it breaks the uniform design, so it's genuinely your call. Build Morbidity last either way. |
| **D8** | Shared reference denominators: the same "Projected Population (Under 1)" figures are pasted verbatim into 8+ files (Prenatal 2–7, Post Partum 2, HIV/HepB); Natality's LB_TOTAL is documented as MMR's denominator. One shared reference indicator per concept, or keep duplicating per file (the Immunization precedent)? | Cleaner cross-file DQC ("all copies must agree"), MMR wiring | Slight lean to **shared reference** now that reuse is confirmed across programs — but duplication also works; low stakes. |
| **D9** | Sensitive-indicator list expansion + whether one `is_sensitive` bit is enough (see §3). | HIV/Syphilis group, Morbidity, Leprosy, NCD MH | Your call — policy, not tech. |
| **D10** | Morbidity has **no PSGC column** — location is free text ("Negros Occidental"). Needs a name→PSGC lookup mechanism in config. | Morbidity | Bundle with D7. |

---

## 3. Sensitive indicators (RBAC) — the full list

Current policy (`CLAUDE.md`): only **HIV reactive** and **Syphilis reactive** cases. The analyses
surfaced this ladder:

**Tier 1 — already policy, must seed `is_sensitive = TRUE`:**
- `infec_hiv_nir.xlsx` — all REACTIVE columns (3 age bands + total + %).
- `infec_syphilis_nir.xlsx` — all REACTIVE columns (same shape).

**Tier 2 — recommended extensions (same PHI class, not literally in the policy text — say yes/no):**
- **Syphilis "treated" columns** (5 cols) — being treated *discloses* reactive status. Should be
  flagged even though the policy only says "reactive."
- **Hepatitis B reactive columns** — structurally identical to HIV's, same bloodborne-infection
  class; just never named in the policy.
- **Morbidity disease rows**: HIV disease (ICD B20–B24) and the three syphilis rows (A50–A53) —
  same conditions arriving via a different template (diagnosed-case counts rather than lab
  results).

**Tier 3 — open questions (stigma-based, genuinely your call):**
- **Leprosy** — significant stigma in PH communities; Grade-2-Disability counts are small enough
  to be identifying at province scale.
- **NCD Mental Health (mhGAP screening)** — same stigma argument; Siquijor's counts are so small
  a single new case would be visible.

**Policy-shape question:** "aggregated totals only for unauthorized roles" may imply *two* tiers
(hide age-band detail but show the total) — the current `is_sensitive` boolean is one flat flag.
Decide whether one bit is enough before seeding the HIV group.

---

## 4. Template bugs — what goes back to DOH vs. what we absorb

### 4-A. Blockers — cannot ingest until the source file is fixed

| File | Problem | Fix needed |
|---|---|---|
| `ncd_meds_nir.xlsx` | **Dec(Q4) sheet has 106 leftover rows of Region VI (Iloilo/Guimaras/Aklan) data, all `#ERROR!`, pushing real NIR data down 106 rows.** A parser would ingest garbage and miss December entirely. | Delete rows 2–107 from Dec(Q4). |
| `envi_sanitation_zod_nir.xlsx` (WASH) | Q3/Q4 have a stray extra column A (header literally says *"Delete this column…"*), shifting every index +1 vs Q1/Q2. One config can't parse all four quarters. | Delete column A from Q3/Q4 (already on the team's pending list). |
| `nata_lb_abr_rabr_nir.xlsx` (Natality) | Q2 is structurally missing the ABR<10 column; the Annual rollup has a live `#REF!` silently zeroed — Annual ABR<10 reports 0 despite Q1 having real data (60 for Negros Occidental). | Add the missing column back to Q2, repair the Annual formula (also already on the pending list). |
| `infec_filariasis_mda_nir.xlsx` | Two independent blockers: (1) the 4 data rows are **not NIR at all** (Regions 4B/9/11/12) — is this file even in scope? (2) No real "15+" raw column exists — the 15+/2+ figures double-count 5-14 and never touch genuine 15+ data. | DOH must clarify scope and supply a corrected template. |

**Partially blocked:** `fp_nir.xlsx`'s "Demand Satisfied" KPI is structurally dead (denominator
factor never populated, and the WRA population is circularly defined as the numerator itself — even
if filled in, the % would be a constant). **Exclude that indicator from Phase 1**; the rest of the
FP workbook is usable once D6 is decided. Similarly `infec_schisto_mda_nir.xlsx` has 3 of 4
sub-regions with zero data rows — ingestable but mostly empty; needs DOH follow-up.

### 4-B. Formula bugs we absorb in config (recompute from raw inputs, ignore Excel)

These are the reason "never trust the Excel value" is a hard rule. In each case the raw entry
columns are fine; the *computed* columns lie:

- **Post Partum 4PNC** — "completed" totals shifted one age bracket right (10-14 borrows 15-19's
  trans-ins, etc.); inflates every completion % on every row. Configs use same-bracket sums.
- **Intra Partum Birth Weight** — "Live Births" denominator is *self-referential* (defined as the
  sum of the categories it's supposed to validate) for 3 of 5 rows; inflates the NIR total by
  exactly 153. Config treats Live Births as an independent raw indicator.
- **Prenatal GD screening** — positivity % header claims population denominator, formula actually
  (correctly) divides by screened count. Config follows the formula (matches the fixed-and-logged
  sibling Anemia file).
- **Leprosy** — three separate ones: 0-14 prevalence missing its ×10,000; "E. Total" for 15-18
  newly-detected computes a rate instead of a sum (and its CDR divides that by population *again*);
  Annual2's all-ages % is a literal `#REF!` error. All recomputed correctly in config.
- **Schisto files 2–5** — Annual rollups skip Q3 and double-count Q4 in 3 of 6 annual tabs;
  "combined treated %" uses the wrong numerator. Our own quarterly→annual rollup sidesteps both.
- **Schisto MDA** — headline "% dewormed 5+" divides by a *count column* instead of population.
- **STH cascade** — Confirmed sheet's total % divides a count by a *percentage cell* (column-shift
  error). Also an unresolved changelog note about which stage's denominator is intended — needs
  encoder confirmation (that one is a genuine open question, not just a bug).
- **Oral Health** — cascading % bug: 3 of 4 percentage columns divide by the *previous percentage*
  instead of population, producing cached values like 23,000,000%. Strongest single proof of the
  recompute rule.
- **Geriatric SC Immunization** — Influenza % divides by the PPV-naive population instead of
  "seen this year" (which no formula in the workbook references at all). Config wires the correct
  denominator per the header's own documented intent.
- **NCD Risk Factors** — Negros Occidental's "risk assessed" denominator is a digit-for-digit copy
  of its *population* figure (deflates every % ~5.8×). The file's own header demands it equal the
  meds template's figure — build that as an automated cross-template DQC rule.
- **Family Planning CUB_A** — Annual "Current User Beginning" pulls Q4's block instead of Q1's;
  breaks the flow-balance identity. Config sources Q1.
- **Mortality MMR** — col 33 label bug confirmed label-only (formula correct); config keys off
  index and names it correctly (Indirect MD Ratio).

### 4-C. Real data-quality problems in the shipped sample data (report to DOH, don't "fix")

- Intra Partum: delivery-type totals don't sum to total deliveries on 4 of 5 rows; City of
  Bacolod (HUC) has recurring mismatches across both files (the 153-unit gap).
- Geriatric screening: "at least one positive" = 0 next to per-domain counts of 24–37 on 3 of 5
  rows — a logical impossibility its own (dead) check was built to catch.
- STH: 1 treated case recorded against 0 confirmed cases (region + Negros Occidental).
- Syphilis file: population denominator blank in every row (HIV/HepB files have it), so
  "% screened" reads 0 despite 5,926 women screened.
- Morbidity: Population sheet empty → the Rate-per-100,000 column is 0 for every disease
  (a disease with 5,560 real cases shows Rate = 0, masked by IFERROR).

---

## 5. Recommended build-priority order

Optimizing for: demo value to the health-professional higher-ups, fastest path to visible wins,
and not blocking on DOH. One program end-to-end at a time, per the locked loop
(seed → config → validate → dry-run → you test).

| Priority | Group | Why here | Pre-requisites |
|---|---|---|---|
| **1** | **HIV-Syphilis-HepaB** (3 files) | Smallest clean group (5 rows, quarterly, 14–19 cols), high-profile topic, and it's the first real test of the sensitive-data RBAC end-to-end — worth proving early, with synthetic non-zero reactive data. | D9 (sensitive list + one-bit question). No parser changes. |
| **2** | **WASH — water file** (1 of 2) | Structurally the cleanest file in the whole batch; municipality-level (68 rows) so the maps/rankings pages light up. Sanitation file follows whenever DOH deletes the stray column. | None. |
| **3** | **Maternal Care** (11 files: Prenatal 8, Post Partum 3, Intra Partum 2 → ~13 configs) | The biggest program by file count and a flagship topic. All config-only — but the most denominator-override work (§4-B). Do Prenatal first (most files, best-understood). | D8 helps (shared Under-1 population); D3 for the a/b BP-HPN files (split-config works today). |
| **4** | **Geriatric + NCD Mental Health** (3 files) | Trivial structures (5 rows; MH is 15 columns of plain counts). Quick wins while decisions on D1 land. MH waits on its D9 sensitivity answer; SC Immunization needs a populated sample from DOH to verify against. | D9 for MH. |
| **5** | **Vital Stats + Leprosy + Filariasis (CDR + Lymph/Eleph/Hydro) + Demographics** | One schema uplift (D1 + D2) unlocks all four groups at once — rates per 1k/10k/100k/1M and unbounded ratios. Mortality = 2 configs (MMR + IMR families). Natality blocked on the Q2 fix (§4-A). Filariasis MDA excluded (§4-A). | **D1, D2**, D3-style split for MMR/IMR. |
| **6** | **NCD Cancer + Risk Factors** (2 files → 4 configs) | Config-only via split-configs; DQC re-derived from scratch (the files' own rules are dead). Include the cross-template "risk-assessed must match meds" rule (needs D4). | D3, D4. |
| **7** | **Rabies + STH** (4 files) | Rabies = 4 split configs + the reconciliation DQC (D4). STH = cascade with cross-sheet denominators + one denominator question for the encoder; exclude the 4 leftover nationwide sheets. | D3, D4; encoder answer on STH denominators. |
| **8** | **NCD Eye Health + Oral Health + Family Planning** | All three need the row-dimension mechanism (D6): age-as-rows (Eye), quarters+age stacked (Oral), quarters stacked (FP). Build D6 once, apply three times. FP excludes Demand Satisfied. | **D6**; D5 for FP stocks. |
| **9** | **NCD Meds** | Highest-value NCD file (municipality-level, monthly) but double-blocked: source-file fix (§4-A) + cumulative-column rollup override (D5). Start the DOH fix request *now*, build when it lands. | Source fix, **D5**. |
| **10** | **Schistosomiasis** (7 files) | Messiest group: 3–6 cross-referencing sheets per quarter (→ many split configs), age-band files that aren't structurally identical, plus open scope questions for DOH (is 1-4 really missing treated/cured? is 20-59's "1st Treatment" intentional?). Don't start until DOH answers. | D3, D4, DOH clarifications. |
| **11** | **Morbidity** | Its own schema project (D7 + D10): disease-as-row matrix, ~306 diseases × 16 age brackets × sex, no PSGC column, province-level only. Feeds a future "Top 10 causes" feature. Do it last, as its own mini-phase. | **D7, D10**, D9 (HIV/syphilis rows), population data from CHD. |

A practical note on batching: groups 1–4 need **zero parser changes** — they can proceed
immediately after your D9 call. Groups 5–7 all hang on the same small D1/D2/D4 uplift. Groups
8–11 each carry a real design change; sequence them one at a time.

---

## 6. Cross-cutting patterns (things true nearly everywhere)

1. **Granularity tiers — the 129-row Child Care pattern does not exist here.** New programs come
   in four shapes: 5-row province/HUC rollup (most groups), 68-row municipality level (WASH, FP,
   NCD meds, 3 Maternal Care files), age-as-rows (Eye Health, Oral Health), and disease-as-rows
   (Morbidity). Expected-row-count and `location_column` must be set per config — and several
   dashboard pages (maps, drill-downs) should gracefully disable municipality drill-down for
   5-row programs.
2. **`location_column = 2`, not 1, in most new files.** Column 1 is a constant "NIR"/"NIRA"
   filler. ("NIRA" vs "NIR" is a template quirk, harmless — PSGC drives lookup.)
3. **Headers lie; changelogs drift.** Confirmed label-vs-formula mismatches in essentially every
   group, and changelog entries that reference columns that no longer exist (NCD ×3, WASH, MH).
   Changelogs are directional history only — always verify against the live formula.
4. **Two recurring dead-DQC bug classes** to check whenever a new file arrives: (a) conditional-
   formatting rules anchored one row past the real data (NCD Cancer/Eye/RA, Geriatric — 18 dead
   rules in one file); (b) over-100% checks comparing a 0–1 ratio against the literal number 100
   (Post Partum, likely Prenatal). **Never port a template's DQC ranges verbatim — re-derive the
   intended rule and anchor it to the config's real data extent.**
5. **Q1-only test data everywhere.** Q2–Q4 blank in nearly every file; two files have *zero*
   non-zero data (SC Immunization, most Schisto). Validation dry-runs must not treat "Annual =
   Q1" as a bug, and RBAC/DQC behaviors need synthetic data to actually exercise.
6. **`IFERROR(...,0)` masks everything.** Missing denominators silently become 0% throughout.
   Our parser should store *None* for missing-denominator computations, never a fabricated 0,
   and a "numerator > 0 but denominator blank" DQC rule would catch the recurring blank-population
   gaps (Syphilis, STH 5-14, Leprosy 15-18/19+, Morbidity).
7. **No usable DQC ships with most new programs** — our config-defined rules are the only net.
   Budget authoring time for them; the per-group files list sensible rules for each.

---

## 7. Scorecard — all 18 groups at a glance

| Group | Files | Freq | Rows | Confirmed formula bugs | Blockers | Parser/schema needs | Ready? |
|---|---|---|---|---|---|---|---|
| HIV-Syphilis-HepaB | 3 | Q+A | 5 | 0 (data gap: syphilis pop blank) | — | none | ✅ after D9 |
| WASH | 2 | Q only | 68 | 0 (structural: sanitation Q3/Q4 shift) | Sanitation file fix | none | ✅ water file now |
| MC Prenatal | 8 | Q+A | 5 & 68 | 1 (GD label/denominator) | — | none | ✅ |
| MC Post Partum | 3 | Q+A | 5 & 68 | 1 critical (bracket shift) | — | none | ✅ (recompute) |
| MC Intra Partum | 2 | Q+A | 5 | 1 critical (circular Live Births) | — | none | ✅ (recompute) |
| Geriatric | 2 | Q+A / A-only | 5 | 1 (influenza denominator) | need populated sample (file 2) | none | ✅ |
| NCD Mental Health | 1 | Q+A | 5 | 0 | — | none (D9 pending) | ✅ after D9 |
| Demographics | 1 | snapshot | 5 | 0 (dead CF rule) | — | **D2 ratio type** | after D2 |
| Vital Stats Mortality | 1 | Q+A ×2 families | 5 | 0 (label-only, col 33) | — | **D1 rate**, split configs | after D1 |
| Vital Stats Natality | 1 | Q+A | 5 | 1 live (#REF!→0 annual) | **Q2 column fix** | **D1 rate** | blocked |
| Leprosy | 1 | A only ×5 tabs | 5 | 3 (multiplier, E.Total, #REF!) | — | **D1 rate** | after D1 (recompute) |
| Filariasis | 3 | A only | 6/4 | 2 critical (MDA file) | **MDA scope + missing 15+** | D1 for CDR | CDR+Lymph ✅; MDA blocked |
| NCD Cancer / RA | 2 | Q+A ×a/b | 5 | 1 (RA denominator = population) | — | D3 split, D4 cross-check | after D3/D4 |
| Rabies | 2 | Q+A ×4 groups | 5 | 0 (design gaps) | — | D3 split, **D4 reconciliation** | after D3/D4 |
| STH | 2 | semestral / Q+A ×4 stages | 5 | 2 (Annual #REF!, Confirmed %) | encoder answer on denominators | D3, D4 | after answers |
| NCD Eye Health | 1 | Q+A | 20 (age rows) | 0 (5 dead DQC rules) | — | **D6 row-groups** | after D6 |
| Oral Health | 1 | Q+A stacked | 5×8 ages×4 qtrs | 1 critical (cascading %) | — | **D6 row-groups** | after D6 |
| Family Planning | 1 | Q stacked + A | 67 | 2 critical (CUB_A, Demand Satisfied) | Demand Satisfied excluded | **D6**, D5 stocks | after D6 |
| NCD Meds | 1 | Monthly | 68 (Dec: 174!) | 2 critical (wrong-region block, YTD columns) | **Dec sheet fix** | **D5 rollup override** | blocked |
| Morbidity | 1 | M+Q+A | 1,631 (diseases) | 3 (BARMM col, frozen totals, dead Rate) | population data | **D7 + D10** | own mini-phase |

*(Schisto's 7 files are summarized in the priority table — messiest group, build last-but-one.)*

---

## Provenance

Merged from: `maternal_care_prenatal.md`, `maternal_care_post_partum.md`,
`maternal_care_intra_partum.md`, `ncd.md`, `geriatric.md`, `family_planning.md`, `morbidity.md`,
`demographics.md`, `infectious_disease_schistosomiasis.md`, `infectious_disease_hiv_syphilis_hepab.md`,
`infectious_disease_rabies.md`, `infectious_disease_leprosy.md`, `infectious_disease_filariasis.md`,
`infectious_disease_sth.md`, `wash.md`, `oral_health.md`, `vital_stats_mortality.md`,
`vital_stats_natality.md`. Analyses performed 2026-07-05 (HOME machine) against the raw `.xlsx`
files in `backend/data/` — **those raw files exist only on the HOME machine**; this summary and
the 18 write-ups are the git-synced record.
