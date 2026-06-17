# Glossary

Domain and project terms used across the codebase and docs.

## Organization
- **DOH** — Department of Health (Philippines).
- **CHD** — Center for Health Development (DOH regional office).
- **Region VII / Central Visayas / NIR** — the region this dashboard serves. NIR =
  Negros Island Region context in some seeds; locations are PSGC-coded.
- **LGU** — Local Government Unit (province, city, or municipality).
- **HUC** — Highly Urbanized City; reported separately from its parent province.
- **ICTU** — Information and Communications Technology Unit (handles deployment).
- **MANCOM / EXECOM** — Management Committee / Executive Committee (view-only oversight roles).
- **BHW** — Barangay Health Worker.

## Data & reporting
- **FHSIS** — Field Health Services Information System; the national reporting standard. Source
  Excel templates come from FHSIS.
- **PSGC** — Philippine Standard Geographic Code; the unique key for every location.
- **DQC** — Data Quality Check; the 20+ validation rules the parser applies during upload.
- **Indicator** — a single measurable data point (e.g. "BCG coverage %").
- **Period** — the time span a submission covers (monthly / quarterly / annual).
- **Location** — a geographic unit (region / province / city_municipality / barangay).
- **Narrow/tall** — schema where each row is one `(indicator, location, period, value)`.
- **Staging** — the holding area (`staging_health_data`) where uploaded rows wait for review
  before being committed to `health_data`.
- **Conflict** — a staged value that differs from an existing committed value for the same
  `(indicator, location, period)`.
- **Computed indicator** — a value derived by the parser (totals, percentages) rather than
  read directly from a cell (`is_computed = true`).

## Health programs / indicators
- **CPAB** — Children Protected At Birth (against tetanus).
- **BCG** — Bacillus Calmette–Guérin (tuberculosis vaccine).
- **HepaB / HepB** — Hepatitis B vaccine (incl. birth-dose timing, ≤24h vs >24h).
- **DPT-HiB-HepB** — combined diphtheria / pertussis / tetanus / Haemophilus influenzae b /
  Hepatitis B (pentavalent) vaccine; doses 1–3.
- **MAM / SAM** — Moderate / Severe Acute Malnutrition (nutritional status reporting).
- **SBI** — (annual) Sick/Birth indicator set referenced in the template backlog.
- **ANC / 8ANC** — Antenatal Care (8-contact schedule).
- **ABR / RABR** — Animal Bite Rate / Rabies-related metrics.

## Stack terms
- **SPA** — Single Page Application (the React frontend).
- **RBAC** — Role-Based Access Control.
- **JWT** — JSON Web Token (auth).
- **Ratio vs percent** — percentages are stored as ratios in the DB (`0.0144`) and shown as
  percent in the UI (`1.44%`).
