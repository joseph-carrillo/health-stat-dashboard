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
  const pop = totals[template.popCode] || 0;
  if (pop > 0) {
    for (const pctCode of template.pctCodes) {
      const totalCode = pctCode.replace("_PCT", "_TOTAL");
      if (totals[totalCode] != null) {
        totals[pctCode] = totals[totalCode] / pop;
      }
    }
  }
  return totals;
}
