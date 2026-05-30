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
