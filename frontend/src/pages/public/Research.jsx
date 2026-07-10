// Public Research page from the design handoff ("Research.dc.html"),
// public state only.

import ClusterPage from "../../components/public/ClusterPage";

const config = {
  header: {
    title: "Research",
    navLinks: ["Publications", "Policy Briefs", "Forum"],
  },
  hero: {
    title: (
      <>
        NIR <span style={{ color: "#4ADE80" }}>Health</span>
        <br />
        Research Portal
      </>
    ),
    description:
      "Browse published research titles, abstracts, and policy briefs. Sign in with your DOH account to download full research papers and unpublished manuscripts.",
    stats: [
      { value: "247", color: "#4ADE80", label: "Research Publications (All Years)" },
      { value: "18", color: "#F5C200", label: "Policy Briefs Published" },
      { value: "12", color: "#60A5FA", label: "Studies Published (2024)" },
    ],
  },
  reports: {
    kicker: "Research Library",
    heading: "Publications & Studies",
    items: [
      {
        accent: "#005C3B",
        tag: "Operational Research",
        tagColor: "#005C3B",
        tagBg: "#EEF7F2",
        date: "May 2025",
        isNew: true,
        title: "Factors Associated with Stunting Among Under-5 Children in NIR, 2024",
        description:
          "Cross-sectional study examining nutritional status, feeding practices, and socioeconomic determinants of child stunting across NIR provinces.",
      },
      {
        accent: "#1B3A6B",
        tag: "Policy Brief",
        tagColor: "#1B3A6B",
        tagBg: "#EEF2FF",
        date: "Mar 2025",
        title: "Strengthening Maternal Health Services in Rural NIR: Evidence from 2024 ANC Data",
        description:
          "Policy brief summarizing key findings and recommendations from the 2024 antenatal care utilization assessment in rural NIR municipalities.",
      },
      {
        accent: "#007A4D",
        tag: "Epidemiological Study",
        tagColor: "#007A4D",
        tagBg: "#EEF7F2",
        date: "Dec 2024",
        title: "Tuberculosis Incidence Trends in NIR: A 10-Year Analysis (2014–2024)",
        description:
          "Longitudinal analysis of TB case notification rates, treatment outcomes, and programmatic gaps across NIR provinces from 2014 to 2024.",
      },
      {
        accent: "#6D28D9",
        tag: "Research Forum",
        tagColor: "#6D28D9",
        tagBg: "#F5F3FF",
        date: "Jun 2025",
        title: "NIR Health Research Forum 2025 — Call for Abstracts",
        description:
          "Abstract submission guidelines and requirements for the 2025 NIR Health Research Forum. Deadline: July 31, 2025.",
        publicCta: "Download Guidelines →",
      },
    ],
  },
  table: {
    kicker: "Research Index",
    heading: "Publications by Year & Category",
    lockTitle: "Research Repository Restricted",
    lockText: (
      <>
        Sign in with your DOH account
        <br />
        to access the full research index and downloads.
      </>
    ),
    columns: [
      { label: "Year" },
      { label: "Op. Research", align: "right" },
      { label: "Policy Briefs", align: "right" },
      { label: "Epi Studies", align: "right" },
      { label: "Total", align: "right" },
    ],
    rows: [
      ["2024", "8", "4", "3", { text: "15", bold: true }],
      ["2023", "7", "5", "4", { text: "16", bold: true }],
      ["2022", "6", "3", "5", { text: "14", bold: true }],
    ],
  },
  footerTitle: "PHRIC Research",
};

export default function Research() {
  return <ClusterPage config={config} />;
}
