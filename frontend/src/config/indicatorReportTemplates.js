// Column layouts per FHSIS immunization file — used by IndicatorReport.jsx

export const CPAB_COL_GROUPS = [
  {
    label: "Target Pop. (0-11M)",
    colspan: 1,
    codes: ["IMMUN_POP_0_11M"],
    subLabels: [""],
  },
  {
    label: "CPAB",
    colspan: 4,
    codes: ["CPAB_MALE", "CPAB_FEMALE", "CPAB_TOTAL", "CPAB_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "BCG ≤24H",
    colspan: 4,
    codes: ["BCG_24H_MALE", "BCG_24H_FEMALE", "BCG_24H_TOTAL", "BCG_24H_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "BCG >24H",
    colspan: 4,
    codes: ["BCG_GT24H_MALE", "BCG_GT24H_FEMALE", "BCG_GT24H_TOTAL", "BCG_GT24H_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "HepaB ≤24H",
    colspan: 4,
    codes: ["HEPAB_24H_MALE", "HEPAB_24H_FEMALE", "HEPAB_24H_TOTAL", "HEPAB_24H_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "HepaB >24H",
    colspan: 4,
    codes: ["HEPAB_GT24H_MALE", "HEPAB_GT24H_FEMALE", "HEPAB_GT24H_TOTAL", "HEPAB_GT24H_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

export const OPV_COL_GROUPS = [
  {
    label: "Target Pop. (0-11M)",
    colspan: 1,
    codes: ["OPV_POP_2026"],
    subLabels: [""],
  },
  {
    label: "OPV 1",
    colspan: 4,
    codes: ["OPV1_MALE", "OPV1_FEMALE", "OPV1_TOTAL", "OPV1_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "OPV 2",
    colspan: 4,
    codes: ["OPV2_MALE", "OPV2_FEMALE", "OPV2_TOTAL", "OPV2_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "OPV 3",
    colspan: 4,
    codes: ["OPV3_MALE", "OPV3_FEMALE", "OPV3_TOTAL", "OPV3_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

export const IPV_COL_GROUPS = [
  {
    label: "Target Pop. (0-11M)",
    colspan: 1,
    codes: ["IPV_POP_2026"],
    subLabels: [""],
  },
  {
    label: "IPV 1",
    colspan: 4,
    codes: ["IPV1_MALE", "IPV1_FEMALE", "IPV1_TOTAL", "IPV1_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "IPV 2",
    colspan: 4,
    codes: ["IPV2_MALE", "IPV2_FEMALE", "IPV2_TOTAL", "IPV2_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

export const PCV_COL_GROUPS = [
  {
    label: "Target Pop. (0-11M)",
    colspan: 1,
    codes: ["PCV_POP_2026"],
    subLabels: [""],
  },
  {
    label: "PCV 1",
    colspan: 4,
    codes: ["PCV1_MALE", "PCV1_FEMALE", "PCV1_TOTAL", "PCV1_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "PCV 2",
    colspan: 4,
    codes: ["PCV2_MALE", "PCV2_FEMALE", "PCV2_TOTAL", "PCV2_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "PCV 3",
    colspan: 4,
    codes: ["PCV3_MALE", "PCV3_FEMALE", "PCV3_TOTAL", "PCV3_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

export const MMR_FIC_CIC_COL_GROUPS = [
  {
    label: "Target Pop. 2026",
    colspan: 1,
    codes: ["MMR_POP_2026"],
    subLabels: [""],
  },
  {
    label: "MMR 1",
    colspan: 4,
    codes: ["MMR1_MALE", "MMR1_FEMALE", "MMR1_TOTAL", "MMR1_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "Target Pop. 2025",
    colspan: 1,
    codes: ["IMMUN_POP_0_11M_PREV"],
    subLabels: [""],
  },
  {
    label: "MMR 1 (prev cohort)",
    colspan: 4,
    codes: ["MMR1_PREV_MALE", "MMR1_PREV_FEMALE", "MMR1_PREV_TOTAL", "MMR1_PREV_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "MMR 2",
    colspan: 4,
    codes: ["MMR2_MALE", "MMR2_FEMALE", "MMR2_TOTAL", "MMR2_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "FIC",
    colspan: 4,
    codes: ["FIC_MALE", "FIC_FEMALE", "FIC_TOTAL", "FIC_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "Pop − FIC (denom.)",
    colspan: 1,
    codes: ["PREV_POP_MINUS_FIC"],
    subLabels: [""],
  },
  {
    label: "CIC",
    colspan: 4,
    codes: ["CIC_MALE", "CIC_FEMALE", "CIC_TOTAL", "CIC_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

export const SICK_VITA_COL_GROUPS = [
  {
    label: "Seen (6-11m)",
    colspan: 3,
    codes: ["SICK_VITA_SEEN_611_MALE", "SICK_VITA_SEEN_611_FEMALE", "SICK_VITA_SEEN_611_TOTAL"],
    subLabels: ["Male", "Female", "Total"],
  },
  {
    label: "Vit A 6-11m (100k IU)",
    colspan: 4,
    codes: ["SICK_VITA_GIVEN_611_MALE", "SICK_VITA_GIVEN_611_FEMALE", "SICK_VITA_GIVEN_611_TOTAL", "SICK_VITA_GIVEN_611_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "Seen (12-59m)",
    colspan: 3,
    codes: ["SICK_VITA_SEEN_1259_MALE", "SICK_VITA_SEEN_1259_FEMALE", "SICK_VITA_SEEN_1259_TOTAL"],
    subLabels: ["Male", "Female", "Total"],
  },
  {
    label: "Vit A 12-59m (200k IU)",
    colspan: 4,
    codes: ["SICK_VITA_GIVEN_1259_MALE", "SICK_VITA_GIVEN_1259_FEMALE", "SICK_VITA_GIVEN_1259_TOTAL", "SICK_VITA_GIVEN_1259_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

export const SICK_DIAR_PNEU_COL_GROUPS = [
  {
    label: "Diarrhea — Seen",
    colspan: 3,
    codes: ["DIAR_SEEN_MALE", "DIAR_SEEN_FEMALE", "DIAR_SEEN_TOTAL"],
    subLabels: ["Male", "Female", "Total"],
  },
  {
    label: "Diarrhea — ORS",
    colspan: 4,
    codes: ["DIAR_ORS_MALE", "DIAR_ORS_FEMALE", "DIAR_ORS_TOTAL", "DIAR_ORS_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "Diarrhea — ORS+Zinc",
    colspan: 4,
    codes: ["DIAR_ORSZ_MALE", "DIAR_ORSZ_FEMALE", "DIAR_ORSZ_TOTAL", "DIAR_ORSZ_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "Diarrhea — Combined",
    colspan: 2,
    codes: ["DIAR_COMBINED_TOTAL", "DIAR_COMBINED_PCT"],
    subLabels: ["Total", "%"],
  },
  {
    label: "Pneumonia — Seen",
    colspan: 3,
    codes: ["PNEU_SEEN_MALE", "PNEU_SEEN_FEMALE", "PNEU_SEEN_TOTAL"],
    subLabels: ["Male", "Female", "Total"],
  },
  {
    label: "Pneumonia — Antibiotic",
    colspan: 4,
    codes: ["PNEU_ABX_MALE", "PNEU_ABX_FEMALE", "PNEU_ABX_TOTAL", "PNEU_ABX_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

export const DPT_COL_GROUPS = [
  {
    label: "Target Pop. (0-11M)",
    colspan: 1,
    codes: ["DPT_POP_2026"],
    subLabels: [""],
  },
  {
    label: "DPT-HiB-HepB 1",
    colspan: 4,
    codes: ["DPT1_MALE", "DPT1_FEMALE", "DPT1_TOTAL", "DPT1_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "DPT-HiB-HepB 2",
    colspan: 4,
    codes: ["DPT2_MALE", "DPT2_FEMALE", "DPT2_TOTAL", "DPT2_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "DPT-HiB-HepB 3",
    colspan: 4,
    codes: ["DPT3_MALE", "DPT3_FEMALE", "DPT3_TOTAL", "DPT3_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

export const REPORT_TEMPLATES = {
  cpab_bcg_hepa: {
    label: "File 1 — CPAB / BCG / HepaB",
    subtitle: "CPAB / BCG / HepaB — Child Care: Immunization",
    colGroups: CPAB_COL_GROUPS,
    popCode: "IMMUN_POP_0_11M",
    deriveGroups: [
      ["CPAB_TOTAL", "CPAB_MALE", "CPAB_FEMALE", "CPAB_PCT"],
      ["BCG_24H_TOTAL", "BCG_24H_MALE", "BCG_24H_FEMALE", "BCG_24H_PCT"],
      ["BCG_GT24H_TOTAL", "BCG_GT24H_MALE", "BCG_GT24H_FEMALE", "BCG_GT24H_PCT"],
      ["HEPAB_24H_TOTAL", "HEPAB_24H_MALE", "HEPAB_24H_FEMALE", "HEPAB_24H_PCT"],
      ["HEPAB_GT24H_TOTAL", "HEPAB_GT24H_MALE", "HEPAB_GT24H_FEMALE", "HEPAB_GT24H_PCT"],
    ],
    pctCodes: [
      "CPAB_PCT", "BCG_24H_PCT", "BCG_GT24H_PCT", "HEPAB_24H_PCT", "HEPAB_GT24H_PCT",
    ],
  },
  dpt_hib_hepb123: {
    label: "File 4 — DPT-HiB-HepB 1/2/3",
    subtitle: "DPT-HiB-HepB doses 1, 2, 3 — Child Care: Immunization",
    colGroups: DPT_COL_GROUPS,
    popCode: "DPT_POP_2026",
    deriveGroups: [
      ["DPT1_TOTAL", "DPT1_MALE", "DPT1_FEMALE", "DPT1_PCT"],
      ["DPT2_TOTAL", "DPT2_MALE", "DPT2_FEMALE", "DPT2_PCT"],
      ["DPT3_TOTAL", "DPT3_MALE", "DPT3_FEMALE", "DPT3_PCT"],
    ],
    pctCodes: ["DPT1_PCT", "DPT2_PCT", "DPT3_PCT"],
  },
  opv123: {
    label: "File 5 — OPV 1/2/3",
    subtitle: "OPV doses 1, 2, 3 — Child Care: Immunization",
    colGroups: OPV_COL_GROUPS,
    popCode: "OPV_POP_2026",
    deriveGroups: [
      ["OPV1_TOTAL", "OPV1_MALE", "OPV1_FEMALE", "OPV1_PCT"],
      ["OPV2_TOTAL", "OPV2_MALE", "OPV2_FEMALE", "OPV2_PCT"],
      ["OPV3_TOTAL", "OPV3_MALE", "OPV3_FEMALE", "OPV3_PCT"],
    ],
    pctCodes: ["OPV1_PCT", "OPV2_PCT", "OPV3_PCT"],
  },
  ipv12: {
    label: "File 6 — IPV 1/2",
    subtitle: "IPV doses 1, 2 — Child Care: Immunization",
    colGroups: IPV_COL_GROUPS,
    popCode: "IPV_POP_2026",
    deriveGroups: [
      ["IPV1_TOTAL", "IPV1_MALE", "IPV1_FEMALE", "IPV1_PCT"],
      ["IPV2_TOTAL", "IPV2_MALE", "IPV2_FEMALE", "IPV2_PCT"],
    ],
    pctCodes: ["IPV1_PCT", "IPV2_PCT"],
  },
  pcv123: {
    label: "File 7 — PCV 1/2/3",
    subtitle: "PCV doses 1, 2, 3 — Child Care: Immunization",
    colGroups: PCV_COL_GROUPS,
    popCode: "PCV_POP_2026",
    deriveGroups: [
      ["PCV1_TOTAL", "PCV1_MALE", "PCV1_FEMALE", "PCV1_PCT"],
      ["PCV2_TOTAL", "PCV2_MALE", "PCV2_FEMALE", "PCV2_PCT"],
      ["PCV3_TOTAL", "PCV3_MALE", "PCV3_FEMALE", "PCV3_PCT"],
    ],
    pctCodes: ["PCV1_PCT", "PCV2_PCT", "PCV3_PCT"],
  },
  mmr12_fic_cic: {
    label: "File 8 — MMR 1/2, FIC, CIC",
    subtitle: "MMR, FIC, CIC — Child Care: Immunization",
    colGroups: MMR_FIC_CIC_COL_GROUPS,
    popCode: "MMR_POP_2026",
    deriveGroups: [
      ["MMR1_TOTAL", "MMR1_MALE", "MMR1_FEMALE", "MMR1_PCT"],
      ["MMR1_PREV_TOTAL", "MMR1_PREV_MALE", "MMR1_PREV_FEMALE", "MMR1_PREV_PCT"],
      ["MMR2_TOTAL", "MMR2_MALE", "MMR2_FEMALE", "MMR2_PCT"],
      ["FIC_TOTAL", "FIC_MALE", "FIC_FEMALE", "FIC_PCT"],
      ["CIC_TOTAL", "CIC_MALE", "CIC_FEMALE", "CIC_PCT"],
    ],
    pctCodes: ["MMR1_PCT", "MMR1_PREV_PCT", "MMR2_PCT", "FIC_PCT", "CIC_PCT"],
    pctDenominators: {
      MMR1_PCT: "MMR_POP_2026",
      MMR1_PREV_PCT: "IMMUN_POP_0_11M_PREV",
      MMR2_PCT: "IMMUN_POP_0_11M_PREV",
      FIC_PCT: "IMMUN_POP_0_11M_PREV",
      CIC_PCT: "PREV_POP_MINUS_FIC",
    },
    derivedFields: ["PREV_POP_MINUS_FIC"],
  },
  sick_vitamin_a: {
    label: "File 1 — Sick Children Given Vitamin A",
    subtitle: "Vitamin A for sick children — Management of the Sick",
    colGroups: SICK_VITA_COL_GROUPS,
    popCode: "SICK_VITA_SEEN_611_TOTAL",
    deriveGroups: [
      ["SICK_VITA_GIVEN_611_TOTAL", "SICK_VITA_GIVEN_611_MALE", "SICK_VITA_GIVEN_611_FEMALE", "SICK_VITA_GIVEN_611_PCT"],
      ["SICK_VITA_GIVEN_1259_TOTAL", "SICK_VITA_GIVEN_1259_MALE", "SICK_VITA_GIVEN_1259_FEMALE", "SICK_VITA_GIVEN_1259_PCT"],
    ],
    pctCodes: ["SICK_VITA_GIVEN_611_PCT", "SICK_VITA_GIVEN_1259_PCT"],
    pctDenominators: {
      SICK_VITA_GIVEN_611_PCT: "SICK_VITA_SEEN_611_TOTAL",
      SICK_VITA_GIVEN_1259_PCT: "SICK_VITA_SEEN_1259_TOTAL",
    },
  },
  sick_diarrhea_pneumonia: {
    label: "File 2-3 — Diarrhea & Pneumonia Treatment",
    subtitle: "ORS/Zinc and antibiotics — Management of the Sick",
    colGroups: SICK_DIAR_PNEU_COL_GROUPS,
    popCode: "DIAR_SEEN_TOTAL",
    deriveGroups: [
      ["DIAR_ORS_TOTAL", "DIAR_ORS_MALE", "DIAR_ORS_FEMALE", "DIAR_ORS_PCT"],
      ["DIAR_ORSZ_TOTAL", "DIAR_ORSZ_MALE", "DIAR_ORSZ_FEMALE", "DIAR_ORSZ_PCT"],
      ["PNEU_ABX_TOTAL", "PNEU_ABX_MALE", "PNEU_ABX_FEMALE", "PNEU_ABX_PCT"],
    ],
    pctCodes: ["DIAR_ORS_PCT", "DIAR_ORSZ_PCT", "DIAR_COMBINED_PCT", "PNEU_ABX_PCT"],
    pctDenominators: {
      DIAR_ORS_PCT: "DIAR_SEEN_TOTAL",
      DIAR_ORSZ_PCT: "DIAR_SEEN_TOTAL",
      DIAR_COMBINED_PCT: "DIAR_SEEN_TOTAL",
      PNEU_ABX_PCT: "PNEU_SEEN_TOTAL",
    },
    derivedFields: ["DIAR_COMBINED_TOTAL"],
  },
};

export function deriveComputedFields(lguMap, template) {
  const pop = template.popCode;
  for (const lgu of Object.values(lguMap)) {
    const popVal = lgu[pop] || 0;
    for (const [total, male, female, pct] of template.deriveGroups) {
      if (lgu[total] == null && lgu[male] != null && lgu[female] != null) {
        lgu[total] = (lgu[male] || 0) + (lgu[female] || 0);
      }
      if (lgu[pct] == null && lgu[total] != null && popVal > 0) {
        lgu[pct] = lgu[total] / popVal;
      }
    }
  }
}

export function computeSubtotal(lgus, template) {
  const allCodes = template.colGroups.flatMap((g) => g.codes);
  const nonPct = allCodes.filter((c) => !c.endsWith("_PCT"));
  const totals = {};
  for (const code of nonPct) {
    totals[code] = lgus.reduce((acc, lgu) => {
      const v = lgu[code];
      return acc + (v != null ? Number(v) : 0);
    }, 0);
  }
  if (template.derivedFields?.includes("PREV_POP_MINUS_FIC")) {
    if (totals.IMMUN_POP_0_11M_PREV != null && totals.FIC_TOTAL != null) {
      totals.PREV_POP_MINUS_FIC =
        totals.IMMUN_POP_0_11M_PREV - totals.FIC_TOTAL;
    }
  }
  if (template.derivedFields?.includes("DIAR_COMBINED_TOTAL")) {
    totals.DIAR_COMBINED_TOTAL =
      (totals.DIAR_ORS_TOTAL || 0) + (totals.DIAR_ORSZ_TOTAL || 0);
  }

  for (const pctCode of template.pctCodes || []) {
    const totalCode = pctCode.replace("_PCT", "_TOTAL");
    const denomCode =
      template.pctDenominators?.[pctCode] || template.popCode;
    const denom = totals[denomCode] || 0;
    if (denom > 0 && totals[totalCode] != null) {
      totals[pctCode] = totals[totalCode] / denom;
    }
  }
  return totals;
}
