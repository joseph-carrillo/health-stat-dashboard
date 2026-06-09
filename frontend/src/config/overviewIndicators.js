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
];

export const DEFAULT_OVERVIEW_INDICATOR = "CPAB_PCT";

export function findOverviewIndicator(code) {
  for (const g of OVERVIEW_INDICATOR_GROUPS) {
    const opt = g.options.find((o) => o.code === code);
    if (opt) return { ...opt, group: g.group };
  }
  return { label: code, code, group: "" };
}
