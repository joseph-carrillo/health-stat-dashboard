// PHRIC public landing page from the design handoff
// ("PHRIC Landing Page.dc.html"). Site root — links to the four cluster
// pages; "Statistics" leads to the public Health Statistics portal whose
// sign-in opens the existing internal dashboard.

import { useState } from "react";
import { Link } from "react-router-dom";
import { T, PHRIC_LOGO } from "../../components/public/publicTheme";
import "../../components/public/public.css";

const NAV_PAGES = [
  { label: "Health Statistics", to: "/health-statistics" },
  { label: "Epidemiology Surveillance", to: "/epidemiology-surveillance" },
  { label: "Research", to: "/research" },
  { label: "Laboratory", to: "/laboratory" },
];

const HERO_STATS = [
  { value: "247", color: "#4ADE80", label: "Research Publications" },
  { value: "38", color: "#F5C200", label: "Surveillance Reports" },
  { value: "5", color: "#60A5FA", label: "Provinces Monitored" },
  { value: "1.2M", color: "#F87171", label: "Population Served" },
];

const PROGRAMS = [
  {
    to: "/health-statistics",
    accent: "#005C3B",
    iconBg: "#F0F9F4",
    title: "Health Statistics",
    description: "Collection, analysis and dissemination of vital health statistics for NIR.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#005C3B" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    to: "/epidemiology-surveillance",
    accent: "#007A4D",
    iconBg: "#F0F9F4",
    title: "Epidemiology Surveillance",
    description: "Real-time disease monitoring and outbreak investigation across NIR.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007A4D" strokeWidth="2" strokeLinecap="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    to: "/research",
    accent: "#1B3A6B",
    iconBg: "#EEF2FF",
    title: "Research",
    description: "Operational and policy research guiding evidence-based health decisions.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="2" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    to: "/laboratory",
    accent: "#6D28D9",
    iconBg: "#F5F3FF",
    title: "Laboratory",
    description: "Diagnostic and confirmatory lab services supporting public health surveillance.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round">
        <path d="M9 3h6v11l3 6H6l3-6V3z" />
        <line x1="6" y1="8" x2="9" y2="8" />
      </svg>
    ),
  },
];

const MANDATE_ITEMS = [
  "Generate and maintain a comprehensive regional health database",
  "Conduct epidemiological surveillance and disease monitoring",
  "Provide research support for health policy formulation",
  "Support laboratory-based public health surveillance",
];

const STAFF = [
  { initials: "RR", bg: "#005C3B", name: "Dr. R. Reyes", role: "Cluster Head" },
  { initials: "ML", bg: "#007A4D", name: "M. Lacson", role: "Epidemiologist" },
  { initials: "AS", bg: "#1B3A6B", name: "A. Santos", role: "Statistician" },
  { initials: "JM", bg: "#6D28D9", name: "J. Montero", role: "Lab Analyst" },
];

const NEWS = [
  {
    headerBg: "#0A1628",
    tag: "Surveillance",
    tagColor: "#4ADE80",
    tagBg: "rgba(74,222,128,.1)",
    date: "June 10, 2025",
    title: "NIR Disease Surveillance Report Q2 2025 Released",
    description: "Quarterly report covering key communicable disease trends across NIR.",
    cta: "Read report →",
  },
  {
    headerBg: "#005C3B",
    tag: "Research",
    tagColor: "#4ADE80",
    tagBg: "rgba(74,222,128,.15)",
    date: "May 28, 2025",
    title: "Health Research Forum 2025 – Call for Abstracts Open",
    description: "PHRIC invites researchers to submit abstracts for the annual Forum.",
    cta: "Learn more →",
  },
  {
    headerBg: "#1B3A6B",
    tag: "Laboratory",
    tagColor: "#93C5FD",
    tagBg: "rgba(147,197,253,.1)",
    date: "May 15, 2025",
    title: "Lab Capacity Building Workshop Concludes",
    description: "NIR lab team completes regional training for disease confirmation protocols.",
    cta: "View details →",
  },
];

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div style={{ minHeight: "100vh", fontFamily: T.jakarta }}>
      {/* Gov bar */}
      <div style={styles.govBar} className="r-ph">
        <span style={styles.govText}>
          Department of Health · Negros Island Region-Center for Health Development
        </span>
        <div style={{ display: "flex", gap: 20 }} className="r-hide">
          <span style={styles.govLink}>Transparency Seal</span>
          <span style={styles.govLink}>FOI</span>
        </div>
      </div>

      {/* Header */}
      <div style={styles.header} className="r-ph">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={PHRIC_LOGO} alt="DOH Seal" style={{ width: 56, height: 56 }} />
          <div>
            <div style={styles.brandTitle}>PHRIC</div>
            <div style={styles.brandSub} className="r-hide">
              Public Health Research & Intelligence Cluster
            </div>
            <div style={styles.brandDivision}>LOCAL HEALTH SUPPORT DIVISION</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 26, alignItems: "center" }} className="r-hide">
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#programs" style={styles.navLink}>Programs</a>
          <Link to="/health-statistics" style={{ ...styles.navLink, color: "#fff", fontWeight: 600 }}>
            Statistics
          </Link>
          <Link to="/epidemiology-surveillance" style={styles.navLink}>Epi Surveillance</Link>
          <Link to="/research" style={styles.navLink}>Research</Link>
          <Link to="/laboratory" style={styles.navLink}>Laboratory</Link>
          <a href="#contact" style={styles.contactButton}>Contact</a>
        </nav>
        <div
          style={{ cursor: "pointer", padding: 6 }}
          className="r-show"
          onClick={() => setNavOpen((open) => !open)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </div>
      </div>

      {/* Mobile nav */}
      {navOpen && (
        <div style={styles.mobileNav}>
          <a href="#about" style={styles.mobileLink} onClick={() => setNavOpen(false)}>About</a>
          {NAV_PAGES.map((page) => (
            <Link key={page.to} to={page.to} style={styles.mobileLink}>{page.label}</Link>
          ))}
          <a
            href="#contact"
            style={{ ...styles.mobileLink, borderBottom: "none" }}
            onClick={() => setNavOpen(false)}
          >
            Contact
          </a>
        </div>
      )}

      {/* Hero */}
      <div style={styles.hero} className="r-p">
        <div style={styles.heroGridOverlay} />
        <div style={styles.heroWatermark}>
          <img
            src={PHRIC_LOGO}
            style={{ width: "100%", height: "100%", filter: "brightness(10)" }}
            alt=""
          />
        </div>
        <div
          style={{ position: "relative", display: "flex", gap: 48, alignItems: "flex-start" }}
          className="r-col"
        >
          <div style={{ flex: 1 }}>
            <div style={styles.badge}>
              <div style={styles.badgeDot} />
              <span style={styles.badgeText}>ACTIVE · 2026</span>
            </div>
            <h1 style={styles.h1} className="r-h1">
              Public Health
              <br />
              <span style={{ color: "#4ADE80" }}>Research &amp;&nbsp;</span>Intelligence
              <br />
              Cluster
            </h1>
            <p style={styles.heroDesc}>
              Evidence-driven surveillance, research, and health data intelligence for Negros
              Island Region.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/health-statistics" style={styles.primaryCta}>Explore Health Data</Link>
              <a href="#programs" style={styles.secondaryCta}>View Programs →</a>
            </div>
          </div>
          <div style={styles.heroStatGrid} className="r-full">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} style={{ ...styles.heroStatCard, borderTop: `3px solid ${stat.color}` }}>
                <div style={{ ...styles.heroStatValue, color: stat.color }}>{stat.value}</div>
                <div style={styles.heroStatLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Programs */}
      <div id="programs" style={styles.section} className="r-p">
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.kicker}>What We Do</div>
            <h2 style={styles.h2} className="r-h2">Programs & Projects</h2>
          </div>
          <span style={styles.sectionLink} className="r-hide">View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="r-g4">
          {PROGRAMS.map((program) => (
            <Link
              key={program.to}
              to={program.to}
              style={{ ...styles.programCard, borderTop: `4px solid ${program.accent}` }}
            >
              <div style={{ ...styles.programIcon, background: program.iconBg }}>{program.icon}</div>
              <h3 style={styles.programTitle}>{program.title}</h3>
              <p style={styles.programDesc}>{program.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* About */}
      <div id="about" style={styles.aboutSection} className="r-p r-col">
        <div style={{ flex: 1 }}>
          <div style={{ ...styles.kicker, marginBottom: 10 }}>About PHRIC</div>
          <h2 style={styles.aboutHeading} className="r-h2">
            Intelligence at the core of public health
          </h2>
          <p style={styles.aboutText}>
            The Public Health Research and Intelligence Cluster (PHRIC) is the research and data
            arm of the Department of Health–Negros Island Region Center for Health Development.
          </p>
          <p style={{ ...styles.aboutText, margin: "0 0 26px" }}>
            We generate, analyze, and translate health data into actionable intelligence to help
            guide policy, programs, and resource allocation across Negros Island Region.
          </p>
          <span style={styles.sectionLink}>Learn more about PHRIC →</span>
        </div>
        <div style={styles.mandateBox} className="r-full">
          <div style={styles.mandateKicker}>Core Mandate</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MANDATE_ITEMS.map((item) => (
              <div key={item} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                <div style={styles.mandateDot} />
                <div style={styles.mandateText}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={styles.section} className="r-p">
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.kicker}>Our People</div>
            <h2 style={styles.h2} className="r-h2">Staff Directory</h2>
          </div>
          <span style={styles.sectionLink} className="r-hide">Full directory →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="r-g4">
          {STAFF.map((person) => (
            <div key={person.initials} style={styles.staffCard}>
              <div style={{ ...styles.staffAvatar, background: person.bg }}>
                <span style={styles.staffInitials}>{person.initials}</span>
              </div>
              <div style={styles.staffName}>{person.name}</div>
              <div style={styles.staffRole}>{person.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* News */}
      <div style={{ ...styles.section, background: T.surface }} className="r-p">
        <div style={{ ...styles.sectionHead, marginBottom: 34 }}>
          <div>
            <div style={styles.kicker}>Latest</div>
            <h2 style={styles.h2} className="r-h2">News & Announcements</h2>
          </div>
          <span style={styles.sectionLink} className="r-hide">All news →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="r-g3">
          {NEWS.map((item) => (
            <div key={item.title} style={styles.newsCard}>
              <div style={{ ...styles.newsHeader, background: item.headerBg }}>
                <span style={{ ...styles.newsTag, color: item.tagColor, background: item.tagBg }}>
                  {item.tag}
                </span>
              </div>
              <div style={{ padding: 20 }}>
                <div style={styles.newsDate}>{item.date}</div>
                <h3 style={styles.newsTitle}>{item.title}</h3>
                <p style={styles.newsDesc}>{item.description}</p>
                <span style={{ ...styles.sectionLink, fontSize: 12 }}>{item.cta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div id="contact" style={styles.footer} className="r-p">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 36 }} className="r-g3">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
              <img src={PHRIC_LOGO} alt="DOH" style={{ width: 42, height: 42 }} />
              <div>
                <div style={styles.footerBrand}>PHRIC · NIR-CHD</div>
                <div style={styles.footerBrandSub}>Department of Health</div>
              </div>
            </div>
            <p style={styles.footerAddress}>
              Public Health Research and Intelligence Cluster
              <br />
              Local Health Support Division
              <br />
              Dumaguete City, Negros Oriental
            </p>
          </div>
          <div>
            <div style={styles.footerColTitle}>Quick Links</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {NAV_PAGES.map((page) => (
                <Link key={page.to} to={page.to} style={styles.footerLink}>{page.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={styles.footerColTitle}>ADDRESS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={styles.footerLink}>
                3rd Floor Integrated Provincial Health Office Bldg.
              </div>
              <div style={styles.footerLink}>
                Negros Oriental Provincial Hospital Compound
              </div>
              <div style={styles.footerLink}>Piapi, Dumaguete City, Negros Oriental 6200</div>
            </div>
          </div>
        </div>
        <div style={styles.footerCopyright}>
          © 2026 PHRIC · DOH NIR-CHD · All rights reserved
        </div>
      </div>
    </div>
  );
}

const styles = {
  govBar: {
    background: T.brand,
    padding: "7px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  govText: { color: "rgba(255,255,255,.6)", fontSize: 11, letterSpacing: ".04em" },
  govLink: { color: "rgba(255,255,255,.5)", fontSize: 11, cursor: "pointer" },
  header: {
    background: T.navy,
    padding: "16px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandTitle: {
    fontFamily: T.sora,
    fontSize: 20,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-.01em",
    lineHeight: 1.1,
  },
  brandSub: {
    fontSize: 10,
    color: "rgba(255,255,255,.48)",
    letterSpacing: ".07em",
    textTransform: "uppercase",
    marginTop: 3,
  },
  brandDivision: {
    fontSize: 10,
    color: T.gold,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    marginTop: 2,
  },
  navLink: {
    color: "rgba(255,255,255,.65)",
    fontSize: 13,
    textDecoration: "none",
    fontWeight: 500,
    cursor: "pointer",
  },
  contactButton: {
    background: T.brand,
    color: "#fff",
    fontSize: 12.5,
    fontWeight: 600,
    padding: "10px 22px",
    textDecoration: "none",
    borderRadius: 2,
    cursor: "pointer",
  },
  mobileNav: {
    background: T.navy,
    borderTop: "1px solid rgba(255,255,255,.1)",
    padding: "8px 20px 20px",
  },
  mobileLink: {
    display: "block",
    color: "rgba(255,255,255,.8)",
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,.07)",
    cursor: "pointer",
  },
  hero: {
    background: T.heroGradient,
    padding: "60px 48px 56px",
    position: "relative",
    overflow: "hidden",
  },
  heroGridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,92,59,.13) 1px,transparent 1px)," +
      "linear-gradient(90deg,rgba(0,92,59,.13) 1px,transparent 1px)",
    backgroundSize: "44px 44px",
    pointerEvents: "none",
  },
  heroWatermark: {
    position: "absolute",
    right: -80,
    top: -80,
    width: 480,
    height: 480,
    opacity: 0.04,
    pointerEvents: "none",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(74,222,128,.1)",
    border: "1px solid rgba(74,222,128,.22)",
    padding: "5px 13px 5px 9px",
    borderRadius: 2,
    marginBottom: 24,
  },
  badgeDot: { width: 6, height: 6, background: T.accent, borderRadius: "50%" },
  badgeText: {
    fontFamily: T.sora,
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: T.accent,
  },
  h1: {
    fontFamily: T.sora,
    fontSize: 48,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.07,
    letterSpacing: "-.025em",
    margin: "0 0 20px",
  },
  heroDesc: {
    color: "rgba(255,255,255,.55)",
    fontSize: 15.5,
    lineHeight: 1.72,
    margin: "0 0 34px",
    maxWidth: 440,
  },
  primaryCta: {
    background: T.brand,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    padding: "12px 24px",
    textDecoration: "none",
    borderRadius: 2,
  },
  secondaryCta: {
    background: "rgba(255,255,255,.08)",
    color: "rgba(255,255,255,.82)",
    fontSize: 13,
    fontWeight: 600,
    padding: "12px 24px",
    textDecoration: "none",
    borderRadius: 2,
    border: "1px solid rgba(255,255,255,.13)",
    cursor: "pointer",
  },
  heroStatGrid: {
    flex: "none",
    width: 390,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  heroStatCard: {
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.09)",
    padding: 20,
  },
  heroStatValue: { fontFamily: T.sora, fontSize: 36, fontWeight: 800, lineHeight: 1 },
  heroStatLabel: { fontSize: 11.5, color: "rgba(255,255,255,.48)", marginTop: 6, lineHeight: 1.4 },
  section: { padding: "60px 48px", background: "#fff" },
  sectionHead: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  kicker: {
    fontFamily: T.sora,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: ".13em",
    textTransform: "uppercase",
    color: T.brand,
    marginBottom: 8,
  },
  h2: {
    fontFamily: T.sora,
    fontSize: 29,
    fontWeight: 700,
    color: T.heading,
    letterSpacing: "-.02em",
    margin: 0,
  },
  sectionLink: { fontSize: 13, fontWeight: 600, color: T.brand, textDecoration: "none", cursor: "pointer" },
  programCard: {
    border: `1px solid ${T.border}`,
    padding: 26,
    display: "block",
    textDecoration: "none",
  },
  programIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  programTitle: {
    fontFamily: T.sora,
    fontSize: 14.5,
    fontWeight: 700,
    color: T.heading,
    margin: "0 0 8px",
  },
  programDesc: { fontSize: 12.5, color: T.secondary, lineHeight: 1.65, margin: 0 },
  aboutSection: {
    padding: "60px 48px",
    background: T.surface,
    display: "flex",
    gap: 52,
    alignItems: "stretch",
  },
  aboutHeading: {
    fontFamily: T.sora,
    fontSize: 27,
    fontWeight: 700,
    color: T.heading,
    letterSpacing: "-.02em",
    lineHeight: 1.25,
    margin: "0 0 16px",
  },
  aboutText: { fontSize: 13.5, color: T.body, lineHeight: 1.78, margin: "0 0 13px" },
  mandateBox: {
    flex: "none",
    width: 340,
    background: T.brand,
    padding: 34,
    borderRadius: 2,
  },
  mandateKicker: {
    fontFamily: T.sora,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,.48)",
    marginBottom: 20,
  },
  mandateDot: {
    width: 7,
    height: 7,
    background: T.accent,
    borderRadius: "50%",
    flex: "none",
    marginTop: 5,
  },
  mandateText: { fontSize: 13, lineHeight: 1.62, color: "rgba(255,255,255,.8)" },
  staffCard: {
    border: `1px solid ${T.border}`,
    padding: 24,
    textAlign: "center",
    borderRadius: 2,
  },
  staffAvatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  staffInitials: { fontFamily: T.sora, fontSize: 20, fontWeight: 700, color: "#fff" },
  staffName: {
    fontFamily: T.sora,
    fontSize: 14,
    fontWeight: 700,
    color: T.heading,
    marginBottom: 3,
  },
  staffRole: { fontSize: 12, color: T.secondary },
  newsCard: {
    background: "#fff",
    border: `1px solid ${T.border}`,
    overflow: "hidden",
    borderRadius: 2,
  },
  newsHeader: { height: 80, padding: "16px 22px", display: "flex", alignItems: "flex-end" },
  newsTag: {
    fontFamily: T.sora,
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    padding: "3px 9px",
    borderRadius: 2,
  },
  newsDate: { fontSize: 11, color: T.muted, marginBottom: 6 },
  newsTitle: {
    fontFamily: T.sora,
    fontSize: 13.5,
    fontWeight: 700,
    color: T.heading,
    margin: "0 0 7px",
    lineHeight: 1.4,
  },
  newsDesc: { fontSize: 12, color: T.secondary, lineHeight: 1.6, margin: "0 0 12px" },
  footer: { background: T.navy, padding: "40px 48px" },
  footerBrand: { fontFamily: T.sora, fontSize: 14, fontWeight: 700, color: "#fff" },
  footerBrandSub: { fontSize: 10, color: "rgba(255,255,255,.38)", letterSpacing: ".04em" },
  footerAddress: { fontSize: 12, color: "rgba(255,255,255,.42)", lineHeight: 1.75, margin: 0 },
  footerColTitle: {
    fontFamily: T.sora,
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,.32)",
    marginBottom: 12,
  },
  footerLink: { fontSize: 12.5, color: "rgba(255,255,255,.58)", textDecoration: "none" },
  footerCopyright: {
    marginTop: 24,
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,.07)",
    fontSize: 11,
    color: "rgba(255,255,255,.22)",
    textAlign: "center",
  },
};
