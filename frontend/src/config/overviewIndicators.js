// PCT indicators shown on Analytics → Overview (maps + ranking)

export const OVERVIEW_INDICATOR_GROUPS = [
  {
    group: "File 1 — CPAB / BCG / HepaB",
    options: [
      { label: "CPAB", code: "CPAB_PCT" },
      { label: "BCG ≤24H", code: "BCG_24H_PCT" },
      { label: "BCG >24H", code: "BCG_GT24H_PCT" },
      { label: "HepaB ≤24H", code: "HEPAB_24H_PCT" },
      { label: "HepaB >24H", code: "HEPAB_GT24H_PCT" },
    ],
  },
  {
    group: "File 4 — DPT-HiB-HepB 1/2/3",
    options: [
      { label: "Dose 1", code: "DPT1_PCT" },
      { label: "Dose 2", code: "DPT2_PCT" },
      { label: "Dose 3", code: "DPT3_PCT" },
    ],
  },
  {
    group: "File 5 — OPV 1/2/3",
    options: [
      { label: "Dose 1", code: "OPV1_PCT" },
      { label: "Dose 2", code: "OPV2_PCT" },
      { label: "Dose 3", code: "OPV3_PCT" },
    ],
  },
  {
    group: "File 6 — IPV 1/2",
    options: [
      { label: "Dose 1", code: "IPV1_PCT" },
      { label: "Dose 2", code: "IPV2_PCT" },
    ],
  },
  {
    group: "File 7 — PCV 1/2/3",
    options: [
      { label: "Dose 1", code: "PCV1_PCT" },
      { label: "Dose 2", code: "PCV2_PCT" },
      { label: "Dose 3", code: "PCV3_PCT" },
    ],
  },
  {
    group: "Mgt of Sick — Vitamin A",
    options: [
      { label: "Vit A 6-11m", code: "SICK_VITA_GIVEN_611_PCT" },
      { label: "Vit A 12-59m", code: "SICK_VITA_GIVEN_1259_PCT" },
    ],
  },
  {
    group: "Mgt of Sick — Diarrhea & Pneumonia",
    options: [
      { label: "Diarrhea ORS", code: "DIAR_ORS_PCT" },
      { label: "Diarrhea ORS+Zinc", code: "DIAR_ORSZ_PCT" },
      { label: "Pneumonia Antibiotic", code: "PNEU_ABX_PCT" },
    ],
  },
  {
    group: "File 8 — MMR / FIC / CIC",
    options: [
      { label: "MMR 1", code: "MMR1_PCT" },
      { label: "MMR 2", code: "MMR2_PCT" },
      { label: "FIC", code: "FIC_PCT" },
      { label: "CIC", code: "CIC_PCT" },
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
