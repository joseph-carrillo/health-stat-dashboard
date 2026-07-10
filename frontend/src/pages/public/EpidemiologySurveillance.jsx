// Public Epidemiology Surveillance page from the design handoff
// ("Epidemiology Surveillance.dc.html"), public state only. The
// "+ Submit ESR Report" header button links to the existing working ESR
// form (permission-gated, so it passes through login first).

import ClusterPage from "../../components/public/ClusterPage";

const config = {
  header: {
    title: "Epidemiology Surveillance",
    navLinks: ["Bulletins", "Outbreak Reports", "PIDSR"],
    cta: { label: "+ Submit ESR Report", to: "/esr/new" },
  },
  hero: {
    title: (
      <>
        NIR <span style={{ color: "#4ADE80" }}>Epidemiology</span>
        <br />
        Surveillance Portal
      </>
    ),
    description:
      "Browse published surveillance bulletins and outbreak summaries. Sign in with your DOH account to access full epidemiological datasets and PIDSR reports.",
    stats: [
      { value: "52", color: "#4ADE80", label: "Weekly Surveillance Bulletins (2024)" },
      { value: "14", color: "#F5C200", label: "Outbreak Investigations (2024)" },
      { value: "2", color: "#F87171", label: "Active Disease Alerts" },
    ],
  },
  reports: {
    kicker: "Surveillance Library",
    heading: "Epidemiology Reports",
    items: [
      {
        accent: "#005C3B",
        tag: "Weekly Bulletin",
        tagColor: "#005C3B",
        tagBg: "#EEF7F2",
        date: "Wk 24, 2025",
        isNew: true,
        title: "NIR Epidemiology Bulletin Week 24, 2025",
        description:
          "Weekly surveillance summary including notifiable disease reports, syndromic data, and disease trend analysis for NIR.",
      },
      {
        accent: "#EF4444",
        tag: "Outbreak Investigation",
        tagColor: "#EF4444",
        tagBg: "#FEF2F2",
        date: "Jun 2025",
        title: "Dengue Cluster Investigation — Bacolod City",
        description:
          "Epidemiological investigation of dengue cluster in Barangay 21, Bacolod City. 23 confirmed cases as of June 15, 2025.",
      },
      {
        accent: "#1B3A6B",
        tag: "PIDSR Annual",
        tagColor: "#1B3A6B",
        tagBg: "#EEF2FF",
        date: "Dec 2024",
        title: "PIDSR Annual Report NIR 2024",
        description:
          "Philippine Integrated Disease Surveillance and Response annual report covering all notifiable diseases in NIR for 2024.",
      },
      {
        accent: "#F59E0B",
        tag: "Zoonotic Diseases",
        tagColor: "#F59E0B",
        tagBg: "#FEF9EC",
        date: "Q1 2025",
        title: "NIR Zoonotic Disease Surveillance Q1 2025",
        description:
          "Quarterly surveillance report on animal-borne disease incidents including leptospirosis, rabies, and avian influenza in NIR.",
      },
    ],
  },
  table: {
    kicker: "PIDSR Data",
    heading: "Disease Incidence by Province",
    lockTitle: "Data Access Restricted",
    lockText: (
      <>
        Sign in with your DOH account
        <br />
        to access full disease incidence data.
      </>
    ),
    columns: [
      { label: "Disease" },
      { label: "Neg. Occ.", align: "right" },
      { label: "Neg. Or.", align: "right" },
      { label: "Siquijor", align: "right" },
      { label: "NIR Total", align: "right" },
      { label: "Trend", align: "center" },
    ],
    rows: [
      [
        "Dengue", "1,842", "621", "48",
        { text: "2,511", bold: true },
        { text: "▲", color: "#EF4444" },
      ],
      [
        "URTI", "8,241", "3,102", "284",
        { text: "11,627", bold: true },
        { text: "▼", color: "#22C55E" },
      ],
      [
        "Diarrhea", "4,118", "1,847", "132",
        { text: "6,097", bold: true },
        { text: "—", color: "#94A3B8" },
      ],
    ],
  },
  footerTitle: "PHRIC Epidemiology Surveillance",
};

export default function EpidemiologySurveillance() {
  return <ClusterPage config={config} />;
}
