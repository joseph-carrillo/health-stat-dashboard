// constants.js
// Shared, front-end-only reference data.

// Excel template configs the backend can parse today.
// To add a new template: build its JSON config in the backend, seed its
// indicators, then add one entry here. Nothing else in the UI changes.
export const TEMPLATES = [
  {
    id: "cpab_bcg_hepa",
    label: "File 1 — CPAB / BCG / HepaB (Birth Dose)",
    program_code: "CHILD_CARE",
  },
  {
    id: "dpt_hib_hepb123",
    label: "File 4 — DPT-HiB-HepB 1/2/3",
    program_code: "CHILD_CARE",
  },
  {
    id: "opv123",
    label: "File 5 — OPV 1/2/3",
    program_code: "CHILD_CARE",
  },
  {
    id: "ipv12",
    label: "File 6 — IPV 1/2",
    program_code: "CHILD_CARE",
  },
  {
    id: "pcv123",
    label: "File 7 — PCV 1/2/3",
    program_code: "CHILD_CARE",
  },
  {
    id: "mmr12_fic_cic",
    label: "File 8 — MMR 1/2, FIC, CIC",
    program_code: "CHILD_CARE",
  },
  {
    id: "sick_vitamin_a",
    label: "File 1 — Sick Children Given Vitamin A",
    program_code: "CHILD_CARE",
  },
  {
    id: "sick_diarrhea_pneumonia",
    label: "File 2-3 — Diarrhea & Pneumonia Treatment",
    program_code: "CHILD_CARE",
  },
  {
    id: "demographics_annual",
    label: "Demographics — Facility & Workforce Density (Annual)",
    program_code: "DEMOGRAPHICS",
  },
  {
    id: "infec_hiv",
    label: "HIV — Antenatal Screening",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_hepatitisb",
    label: "Hepatitis B — Antenatal Screening",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_syphilis",
    label: "Syphilis — Antenatal Screening, Reactive & Treated",
    program_code: "INFECTIOUS_DISEASE",
  },
];

export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const YEARS = [2025, 2026];

export const QUARTERS = [
  { value: 1, label: "Q1 (Jan–Mar)" },
  { value: 2, label: "Q2 (Apr–Jun)" },
  { value: 3, label: "Q3 (Jul–Sep)" },
  { value: 4, label: "Q4 (Oct–Dec)" },
];

// Coverage status colors used across dashboards.
export const STATUS_COLORS = {
  on: "#16A34A",
  near: "#EAB308",
  below: "#DC2626",
  no_data: "#CBD5E1",
};

export function statusLabel(status) {
  if (status === "on") return "On Target";
  if (status === "near") return "Near Target";
  if (status === "below") return "Below Target";
  return "No Data";
}

export function coverageColor(percent) {
  if (percent === null || percent === undefined) return STATUS_COLORS.no_data;
  if (percent >= 95) return STATUS_COLORS.on;
  if (percent >= 80) return STATUS_COLORS.near;
  return STATUS_COLORS.below;
}
