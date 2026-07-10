// Public Health Statistics portal — gated preview page from the design
// handoff ("Health Statistics.dc.html"), public state only. Sign-in CTAs
// route to /login, which opens the existing internal dashboard.

import ClusterPage from "../../components/public/ClusterPage";

const config = {
  header: {
    title: "Health Statistics",
    navLinks: ["Reports", "Indicators"],
  },
  hero: {
    title: (
      <>
        NIR <span style={{ color: "#4ADE80" }}>Health</span>
        <br />
        Statistics Portal
      </>
    ),
    description:
      "Browse report titles and summaries. Sign in with your DOH account to access full datasets and download reports.",
    stats: [
      { value: "6", color: "#4ADE80", label: "Reports Published (2025)" },
      { value: "38", color: "#F5C200", label: "Years of Continuous Health Data" },
      { value: "3", color: "#60A5FA", label: "Provinces with Full Data Coverage" },
    ],
  },
  reports: {
    kicker: "Available Reports",
    heading: "Health Statistics Reports",
    items: [
      {
        accent: "#005C3B",
        tag: "Vital Statistics",
        tagColor: "#005C3B",
        tagBg: "#EEF7F2",
        date: "Dec 2024",
        title: "NIR Annual Health Statistics Report 2024",
        description:
          "Comprehensive vital statistics covering births, deaths, mortality rates, and disease incidence across NIR provinces.",
      },
      {
        accent: "#007A4D",
        tag: "Morbidity",
        tagColor: "#007A4D",
        tagBg: "#EEF7F2",
        date: "Mar 2025",
        isNew: true,
        title: "Q1 2025 Morbidity Summary Report",
        description:
          "Disease incidence and morbidity data for Q1 2025, including communicable disease trends and outbreak events.",
      },
      {
        accent: "#1B3A6B",
        tag: "Maternal & Child",
        tagColor: "#1B3A6B",
        tagBg: "#EEF2FF",
        date: "Nov 2024",
        title: "Maternal & Child Health Indicators 2024",
        description:
          "MMR, IMR, antenatal care coverage, skilled birth attendance, and child nutrition indicators for NIR.",
      },
      {
        accent: "#6D28D9",
        tag: "Immunization",
        tagColor: "#6D28D9",
        tagBg: "#F5F3FF",
        date: "Aug 2024",
        title: "NIR Immunization Coverage Report 2024",
        description:
          "Vaccination coverage rates by province, municipality, and antigen for the 2024 immunization year.",
      },
    ],
  },
  table: {
    kicker: "Health Indicators",
    heading: "Provincial Health Data",
    lockTitle: "Data Access Restricted",
    lockText: (
      <>
        Sign in with your DOH account
        <br />
        to access full provincial health datasets.
      </>
    ),
    columns: [
      { label: "Province" },
      { label: "Population", align: "right" },
      { label: "CBR", align: "right" },
      { label: "CDR", align: "right" },
      { label: "IMR", align: "right" },
      { label: "MMR", align: "right" },
    ],
    rows: [
      ["Negros Occidental", "3,241,862", "18.2", "4.8", "8.4", "64.2"],
      ["Negros Oriental", "1,561,720", "19.1", "5.1", "9.1", "71.8"],
      ["Siquijor", "103,395", "16.8", "4.2", "7.2", "52.1"],
    ],
  },
  footerTitle: "PHRIC Health Statistics",
};

export default function HealthStatistics() {
  return <ClusterPage config={config} />;
}
