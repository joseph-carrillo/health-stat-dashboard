// PCT indicators shown on Analytics → Overview (maps) and Rankings (table).
// Each option carries the full triplet so the Rankings table can show
// numerator (total) and denominator alongside the coverage %:
//   code  → the *_PCT indicator (decimal ratio) used for maps + coverage color
//   total → numerator indicator code (e.g. CPAB_TOTAL)
//   denom → denominator indicator code (e.g. IMMUN_POP_0_11M)
// Triplets are taken from each template's config formula (NUM / DENOM).

export const OVERVIEW_INDICATOR_GROUPS = [
  {
    group: "File 1 — CPAB / BCG / HepaB",
    options: [
      { label: "CPAB", code: "CPAB_PCT", total: "CPAB_TOTAL", denom: "IMMUN_POP_0_11M" },
      { label: "BCG ≤24H", code: "BCG_24H_PCT", total: "BCG_24H_TOTAL", denom: "IMMUN_POP_0_11M" },
      { label: "BCG >24H", code: "BCG_GT24H_PCT", total: "BCG_GT24H_TOTAL", denom: "IMMUN_POP_0_11M" },
      { label: "HepaB ≤24H", code: "HEPAB_24H_PCT", total: "HEPAB_24H_TOTAL", denom: "IMMUN_POP_0_11M" },
      { label: "HepaB >24H", code: "HEPAB_GT24H_PCT", total: "HEPAB_GT24H_TOTAL", denom: "IMMUN_POP_0_11M" },
    ],
  },
  {
    group: "File 4 — DPT-HiB-HepB 1/2/3",
    options: [
      { label: "Dose 1", code: "DPT1_PCT", total: "DPT1_TOTAL", denom: "DPT_POP_2026" },
      { label: "Dose 2", code: "DPT2_PCT", total: "DPT2_TOTAL", denom: "DPT_POP_2026" },
      { label: "Dose 3", code: "DPT3_PCT", total: "DPT3_TOTAL", denom: "DPT_POP_2026" },
    ],
  },
  {
    group: "File 5 — OPV 1/2/3",
    options: [
      { label: "Dose 1", code: "OPV1_PCT", total: "OPV1_TOTAL", denom: "OPV_POP_2026" },
      { label: "Dose 2", code: "OPV2_PCT", total: "OPV2_TOTAL", denom: "OPV_POP_2026" },
      { label: "Dose 3", code: "OPV3_PCT", total: "OPV3_TOTAL", denom: "OPV_POP_2026" },
    ],
  },
  {
    group: "File 6 — IPV 1/2",
    options: [
      { label: "Dose 1", code: "IPV1_PCT", total: "IPV1_TOTAL", denom: "IPV_POP_2026" },
      { label: "Dose 2", code: "IPV2_PCT", total: "IPV2_TOTAL", denom: "IPV_POP_2026" },
    ],
  },
  {
    group: "File 7 — PCV 1/2/3",
    options: [
      { label: "Dose 1", code: "PCV1_PCT", total: "PCV1_TOTAL", denom: "PCV_POP_2026" },
      { label: "Dose 2", code: "PCV2_PCT", total: "PCV2_TOTAL", denom: "PCV_POP_2026" },
      { label: "Dose 3", code: "PCV3_PCT", total: "PCV3_TOTAL", denom: "PCV_POP_2026" },
    ],
  },
  {
    group: "Mgt of Sick — Vitamin A",
    options: [
      { label: "Vit A 6-11m", code: "SICK_VITA_GIVEN_611_PCT", total: "SICK_VITA_GIVEN_611_TOTAL", denom: "SICK_VITA_SEEN_611_TOTAL" },
      { label: "Vit A 12-59m", code: "SICK_VITA_GIVEN_1259_PCT", total: "SICK_VITA_GIVEN_1259_TOTAL", denom: "SICK_VITA_SEEN_1259_TOTAL" },
    ],
  },
  {
    group: "Mgt of Sick — Diarrhea & Pneumonia",
    options: [
      { label: "Diarrhea ORS", code: "DIAR_ORS_PCT", total: "DIAR_ORS_TOTAL", denom: "DIAR_SEEN_TOTAL" },
      { label: "Diarrhea ORS+Zinc", code: "DIAR_ORSZ_PCT", total: "DIAR_ORSZ_TOTAL", denom: "DIAR_SEEN_TOTAL" },
      { label: "Pneumonia Antibiotic", code: "PNEU_ABX_PCT", total: "PNEU_ABX_TOTAL", denom: "PNEU_SEEN_TOTAL" },
    ],
  },
  {
    group: "File 8 — MMR / FIC / CIC",
    options: [
      { label: "MMR 1", code: "MMR1_PCT", total: "MMR1_TOTAL", denom: "MMR_POP_2026" },
      { label: "MMR 2", code: "MMR2_PCT", total: "MMR2_TOTAL", denom: "IMMUN_POP_0_11M_PREV" },
      { label: "FIC", code: "FIC_PCT", total: "FIC_TOTAL", denom: "IMMUN_POP_0_11M_PREV" },
      { label: "CIC", code: "CIC_PCT", total: "CIC_TOTAL", denom: "PREV_POP_MINUS_FIC" },
    ],
  },
];

export const DEFAULT_OVERVIEW_INDICATOR = "CPAB_PCT";

export function findOverviewIndicator(code) {
  for (const g of OVERVIEW_INDICATOR_GROUPS) {
    const opt = g.options.find((o) => o.code === code);
    if (opt) return { ...opt, group: g.group };
  }
  return { label: code, code, group: "" };
}

// Child Care expandable card — its four sub-areas and the indicators the user
// can pick from for each. `default` is the first-pass flagship (changeable in
// the UI). Indicators span monthly/quarterly/annual; the sub-area mini-cards use
// /api/overview/indicator, which resolves each indicator's latest period.
export const CHILD_CARE_SUBAREAS = [
  {
    key: "Immunization",
    label: "Immunization",
    default: "FIC_PCT",
    options: [
      { code: "FIC_PCT", label: "FIC — Fully Immunized" },
      { code: "CIC_PCT", label: "CIC — Completely Immunized" },
      { code: "CPAB_PCT", label: "CPAB" },
      { code: "BCG_24H_PCT", label: "BCG ≤24h" },
      { code: "HEPAB_24H_PCT", label: "HepaB ≤24h" },
      { code: "DPT3_PCT", label: "DPT-HiB-HepB Dose 3" },
      { code: "OPV3_PCT", label: "OPV Dose 3" },
      { code: "IPV2_PCT", label: "IPV Dose 2" },
      { code: "PCV3_PCT", label: "PCV Dose 3" },
      { code: "MMR1_PCT", label: "MMR Dose 1" },
    ],
  },
  {
    key: "Nutrition",
    label: "Nutrition",
    default: "NUT_MAM_CURED_PCT",
    options: [
      { code: "NUT_BF_1H_PCT", label: "Early breastfeeding (≤1h)" },
      { code: "NUT_LBW_IRON_PCT", label: "LBW given iron" },
      { code: "NUT_VITA_611_PCT", label: "Vit A 6-11m" },
      { code: "NUT_VITA_1259_PCT", label: "Vit A 12-59m" },
      { code: "NUT_MNP_611_PCT", label: "MNP 6-11m" },
      { code: "NUT_MNP_1223_PCT", label: "MNP 12-23m" },
      { code: "NUT_LNS_611_PCT", label: "LNS-SQ 6-11m" },
      { code: "NUT_LNS_1223_PCT", label: "LNS-SQ 12-23m" },
      { code: "NUT_MAM_CURED_PCT", label: "MAM cure rate (annual)" },
      { code: "NUT_MAM_ID_PCT", label: "MAM identified (annual)" },
      { code: "NUT_MAM_SFP_PCT", label: "MAM enrolled SFP (annual)" },
    ],
  },
  {
    key: "Sick",
    label: "Mgt of the Sick",
    default: "PNEU_ABX_PCT",
    options: [
      { code: "PNEU_ABX_PCT", label: "Pneumonia w/ antibiotics" },
      { code: "DIAR_ORS_PCT", label: "Diarrhea given ORS" },
      { code: "DIAR_ORSZ_PCT", label: "Diarrhea given ORS+Zinc" },
      { code: "SICK_VITA_GIVEN_611_PCT", label: "Sick Vit A 6-11m" },
      { code: "SICK_VITA_GIVEN_1259_PCT", label: "Sick Vit A 12-59m" },
    ],
  },
  {
    key: "SBI",
    label: "School-Based Immunization",
    default: "HPV1_SBI_PCT",
    options: [
      { code: "HPV1_SBI_PCT", label: "HPV1 (SBI)" },
      { code: "HPV2_PCT", label: "HPV2" },
      { code: "SBI_TD_G1_PCT", label: "Td Grade 1" },
      { code: "SBI_TD_G7_PCT", label: "Td Grade 7" },
      { code: "SBI_MR_G1_PCT", label: "MR Grade 1" },
      { code: "SBI_MR_G7_PCT", label: "MR Grade 7" },
    ],
  },
];
