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
  {
    id: "infec_leprosy",
    label: "Leprosy — Registered / Newly Detected / Confirmed / Treatment / G2D (annual)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_cdr_filariasis",
    label: "Filariasis — Case Detection Rate (NBE / RDT, annual)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_lymph_eleph_hydro",
    label: "Filariasis — Morbidity (Lymphedema / Elephantiasis / Hydrocele, annual)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "animal_bites",
    label: "Rabies — Animal Bites & Deaths (quarterly)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_rabies_base",
    label: "Rabies — Exposure by WHO Category (quarterly)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_rabies_cat2arv",
    label: "Rabies — Category II ARV Completion (quarterly)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_rabies_cat3",
    label: "Rabies — Category III ARV+RIG / ARV-only (quarterly)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_rabies_source",
    label: "Rabies — Exposure by Animal Source (quarterly)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "infec_sth_deworm",
    label: "STH — Deworming (MDA, School / Community-based)",
    program_code: "INFECTIOUS_DISEASE",
  },
  {
    id: "envi_water",
    label: "Water Supply — Household Coverage (BSWS & Safely Managed)",
    program_code: "WASH",
  },
  {
    id: "ger_screening",
    label: "Geriatric Screening — Senior Citizen (60+) 9-Domain",
    program_code: "GERIATRIC",
  },
  {
    id: "pre_bmi",
    label: "Prenatal — Nutritional Status (BMI)",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "pre_td",
    label: "Prenatal — Td / Td2+ Vaccination",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "pre_supplementation",
    label: "Prenatal — Supplementation (IFA / MM / CC)",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "pre_deworming",
    label: "Prenatal — Deworming",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "pre_anemia",
    label: "Prenatal — Anemia Screening & Diagnosis",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "pre_gd",
    label: "Prenatal — Gestational Diabetes Screening",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "pre_8anc",
    label: "Prenatal — 8+ ANC Visit Completion",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "pre_bp_measure",
    label: "Prenatal — BP Measured During ANC Visits",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "pre_hpn_mgmt",
    label: "Prenatal — High BP Identified & Referred",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "post_4pnc",
    label: "Post Partum — 4 PNC Visit Completion",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "post_supplementation",
    label: "Post Partum — Supplementation (IFA / Vitamin A)",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "post_bp_measure",
    label: "Post Partum — BP Measured During PNC Visits",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "post_hpn_mgmt",
    label: "Post Partum — High BP Identified & Referred",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "intra_bw",
    label: "Intra Partum — Birth Weight (Normal / Low / Unknown)",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "intra_shp",
    label: "Intra Partum — Skilled Attendant & Facility-Based Delivery",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "intra_dt",
    label: "Intra Partum — Delivery Type (Vaginal / Cesarean / Combined)",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "intra_do",
    label: "Intra Partum — Delivery Outcome (Full Term / Pre-Term / Fetal Death / Abortion)",
    program_code: "MATERNAL_CARE",
  },
  {
    id: "ncd_mh",
    label: "NCD — Mental Health (mhGAP Assessment)",
    program_code: "NCD",
  },
  {
    id: "ncd_cacx",
    label: "NCD — Cervical Cancer Screening",
    program_code: "NCD",
  },
  {
    id: "ncd_brca",
    label: "NCD — Breast Cancer Early Detection (BCEDS)",
    program_code: "NCD",
  },
  {
    id: "ncd_ra_adults",
    label: "NCD — Behavioral Risk Factors (Adults 20-59)",
    program_code: "NCD",
  },
  {
    id: "ncd_ra_sc",
    label: "NCD — Behavioral Risk Factors (Senior Citizens 60+)",
    program_code: "NCD",
  },
  {
    id: "morta_mmr",
    label: "Vital Stats — Maternal Mortality (MMR)",
    program_code: "VITAL_STATS",
  },
  {
    id: "morta_imr",
    label: "Vital Stats — Infant Mortality (IMR)",
    program_code: "VITAL_STATS",
  },
  {
    id: "nata_lb_abr_rabr",
    label: "Vital Stats — Natality (Live Births / ABR / RABR)",
    program_code: "VITAL_STATS",
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
