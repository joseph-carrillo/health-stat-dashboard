// Public Laboratory page from the design handoff ("Laboratory.dc.html"),
// public state only.

import ClusterPage from "../../components/public/ClusterPage";

const config = {
  header: {
    title: "Laboratory",
    navLinks: ["Lab Reports", "QA/QC", "Confirmatory"],
  },
  hero: {
    title: (
      <>
        NIR <span style={{ color: "#4ADE80" }}>Laboratory</span>
        <br />
        Services Portal
      </>
    ),
    description:
      "Browse laboratory service summaries and capacity reports. Sign in with your DOH account to access full confirmatory test data and quality assurance documents.",
    stats: [
      { value: "12K", color: "#4ADE80", label: "Specimens Processed (2024)" },
      { value: "98%", color: "#F5C200", label: "QA Proficiency Rate" },
      { value: "8", color: "#60A5FA", label: "Test Categories Available" },
    ],
  },
  reports: {
    kicker: "Laboratory Library",
    heading: "Lab Reports & Documents",
    items: [
      {
        accent: "#6D28D9",
        tag: "Annual Lab Report",
        tagColor: "#6D28D9",
        tagBg: "#F5F3FF",
        date: "Dec 2024",
        title: "NIR Laboratory Annual Report 2024",
        description:
          "Comprehensive summary of laboratory services, specimen volume, test turnaround times, and capacity data for NIR CHD lab facilities in 2024.",
      },
      {
        accent: "#005C3B",
        tag: "Capacity Building",
        tagColor: "#005C3B",
        tagBg: "#EEF7F2",
        date: "May 2025",
        isNew: true,
        title: "Lab Capacity Building Workshop Report — May 2025",
        description:
          "Post-activity report from the regional laboratory capacity building workshop covering disease confirmation protocols and biosafety standards.",
      },
      {
        accent: "#1B3A6B",
        tag: "QA/QC",
        tagColor: "#1B3A6B",
        tagBg: "#EEF2FF",
        date: "Q4 2024",
        title: "External Quality Assessment (EQA) Results Q4 2024",
        description:
          "External quality assurance results covering proficiency testing panels for TB, Dengue, Malaria, and STI confirmatory tests.",
      },
      {
        accent: "#F59E0B",
        tag: "Confirmatory Testing",
        tagColor: "#F59E0B",
        tagBg: "#FEF9EC",
        date: "Q1 2025",
        title: "NIR Confirmatory Lab Test Summary Q1 2025",
        description:
          "Quarterly summary of confirmatory tests processed including dengue NS1/IgM, TB GeneXpert, malaria RDT/microscopy, and HIV confirmatory results.",
      },
    ],
  },
  table: {
    kicker: "Test Summary",
    heading: "Laboratory Test Volume 2024",
    lockTitle: "Data Access Restricted",
    lockText: (
      <>
        Sign in with your DOH account
        <br />
        to access full laboratory test data.
      </>
    ),
    columns: [
      { label: "Test Category" },
      { label: "Specimens", align: "right" },
      { label: "Positive", align: "right" },
      { label: "Positivity %", align: "right" },
      { label: "TAT (days)", align: "right" },
    ],
    // The prototype's public blurred table has a single row; two more rows
    // from its logged-in variant are included so the blurred preview does
    // not look empty. Values stay hidden behind the blur either way.
    rows: [
      ["Dengue (NS1/IgM)", "3,241", "842", "26.0%", "1.2"],
      ["TB (GeneXpert)", "2,108", "312", "14.8%", "0.5"],
      ["Malaria (RDT/Microscopy)", "1,842", "47", "2.6%", "1.0"],
    ],
  },
  footerTitle: "PHRIC Laboratory",
};

export default function Laboratory() {
  return <ClusterPage config={config} />;
}
