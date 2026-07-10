// Shared scaffold for the four public cluster pages (Health Statistics,
// Epidemiology Surveillance, Research, Laboratory). The design handoff uses
// one structural pattern for all four: gov bar → header → hero → report
// cards → blur-locked data table → footer. Each page passes a config object;
// only the public (logged-out) state is rendered — sign-in CTAs route to the
// real /login page.

import { Link } from "react-router-dom";
import { T, PHRIC_LOGO, GOV_BAR_TEXT } from "./publicTheme";
import {
  GovBar,
  SignInPill,
  ClusterHeader,
  ClusterFooter,
  LockIcon,
} from "./PublicChrome";

export default function ClusterPage({ config }) {
  const { header, hero, reports, table, footerTitle } = config;
  return (
    <div style={{ minHeight: "100vh", fontFamily: T.jakarta }}>
      <GovBar text={GOV_BAR_TEXT} />
      <ClusterHeader title={header.title} navLinks={header.navLinks} cta={header.cta} />
      <Hero hero={hero} />
      <ReportsSection reports={reports} />
      <TableSection table={table} />
      <ClusterFooter title={footerTitle} />
    </div>
  );
}

function Hero({ hero }) {
  return (
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
        style={{ position: "relative", display: "flex", gap: 52, alignItems: "center" }}
        className="r-col"
      >
        <div style={{ flex: 1 }}>
          <div style={styles.badge}>
            <div style={styles.badgeDot} />
            <span style={styles.badgeText}>Public Access</span>
          </div>
          <h1 style={styles.h1} className="r-h1">{hero.title}</h1>
          <p style={styles.heroDesc}>{hero.description}</p>
          <div style={{ marginBottom: 14 }}>
            <SignInPill large />
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.3)" }}>
            Authorized DOH NIR-CHD accounts only
          </div>
        </div>
        <div style={styles.statColumn} className="r-full">
          {hero.stats.map((stat) => (
            <div key={stat.label} style={{ ...styles.statCard, borderTop: `3px solid ${stat.color}` }}>
              <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsSection({ reports }) {
  return (
    <div style={styles.section} className="r-p">
      <div style={styles.sectionHead}>
        <div>
          <div style={styles.kicker}>{reports.kicker}</div>
          <h2 style={styles.h2} className="r-h2">{reports.heading}</h2>
        </div>
        <div style={styles.loginNotice} className="r-hide">
          <LockIcon size={13} color="#92400E" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400E" }}>
            Login required to download
          </span>
        </div>
      </div>
      <div style={styles.cardsGrid} className="r-g2">
        {reports.items.map((report) => (
          <ReportCard key={report.title} report={report} />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ report }) {
  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${report.accent}` }}>
      <div style={styles.cardMeta}>
        <span style={{ ...styles.cardTag, color: report.tagColor, background: report.tagBg }}>
          {report.tag}
        </span>
        <span style={{ fontSize: 11, color: T.muted }}>{report.date}</span>
        {report.isNew && <span style={styles.newBadge}>NEW</span>}
      </div>
      <h3 style={styles.cardTitle}>{report.title}</h3>
      <p style={styles.cardDesc}>{report.description}</p>
      {report.publicCta ? (
        <span style={styles.greenPill}>{report.publicCta}</span>
      ) : (
        <Link to="/login" style={styles.lockPill}>
          <LockIcon size={12} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Login to Download</span>
        </Link>
      )}
    </div>
  );
}

function TableSection({ table }) {
  return (
    <div style={{ ...styles.section, background: T.surface }} className="r-p">
      <div style={{ marginBottom: 22 }}>
        <div style={styles.kicker}>{table.kicker}</div>
        <h2 style={{ ...styles.h2, fontSize: 24 }} className="r-h2">{table.heading}</h2>
      </div>
      <div style={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
        <div style={styles.blurWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: T.surface }}>
                {table.columns.map((col) => (
                  <th key={col.label} style={{ ...styles.th, textAlign: col.align || "left" }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={
                    rowIndex < table.rows.length - 1
                      ? { borderBottom: "1px solid #F0F7F3" }
                      : undefined
                  }
                >
                  {row.map((cell, colIndex) => {
                    const value = typeof cell === "object" ? cell : { text: cell };
                    return (
                      <td
                        key={colIndex}
                        style={{
                          padding: "13px 20px",
                          textAlign: table.columns[colIndex].align || "left",
                          fontWeight: colIndex === 0 ? 600 : value.bold ? 700 : 400,
                          color: value.color || (colIndex === 0 ? T.heading : undefined),
                        }}
                      >
                        {value.text}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={styles.lockOverlay}>
          <div style={styles.lockCard}>
            <LockIcon size={34} color={T.muted} style={{ display: "block", margin: "0 auto 12px" }} />
            <div style={styles.lockTitle}>{table.lockTitle}</div>
            <div style={styles.lockText}>{table.lockText}</div>
            <SignInPill outline />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    background: T.heroGradient,
    padding: "56px 48px",
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
    right: -60,
    top: -60,
    width: 380,
    height: 380,
    opacity: 0.04,
    pointerEvents: "none",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(74,222,128,.1)",
    border: "1px solid rgba(74,222,128,.22)",
    padding: "5px 13px",
    borderRadius: 2,
    marginBottom: 20,
  },
  badgeDot: { width: 6, height: 6, background: T.accent, borderRadius: "50%" },
  badgeText: {
    fontFamily: T.sora,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: ".09em",
    textTransform: "uppercase",
    color: T.accent,
  },
  h1: {
    fontFamily: T.sora,
    fontSize: 44,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.07,
    letterSpacing: "-.025em",
    margin: "0 0 16px",
  },
  heroDesc: {
    color: "rgba(255,255,255,.52)",
    fontSize: 15,
    lineHeight: 1.74,
    margin: "0 0 28px",
    maxWidth: 440,
  },
  statColumn: {
    flex: "none",
    width: 310,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  statCard: {
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.09)",
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  statValue: { fontFamily: T.sora, fontSize: 38, fontWeight: 800, lineHeight: 1, flex: "none" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,.48)", lineHeight: 1.5 },
  section: { padding: "52px 48px", background: "#fff" },
  sectionHead: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  kicker: {
    fontFamily: T.sora,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".13em",
    textTransform: "uppercase",
    color: T.brand,
    marginBottom: 7,
  },
  h2: {
    fontFamily: T.sora,
    fontSize: 26,
    fontWeight: 700,
    color: T.heading,
    margin: 0,
    letterSpacing: "-.02em",
  },
  loginNotice: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "#FEF9EC",
    border: "1px solid #FDE68A",
    padding: "8px 14px",
    borderRadius: 4,
  },
  cardsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  card: {
    border: `1px solid ${T.border}`,
    padding: 22,
    borderRadius: "0 2px 2px 0",
  },
  cardMeta: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  cardTag: {
    fontFamily: T.sora,
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: ".07em",
    textTransform: "uppercase",
    padding: "2px 8px",
    borderRadius: 2,
  },
  newBadge: {
    fontFamily: T.sora,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    color: "#059669",
    background: "#ECFDF5",
    padding: "2px 7px",
    borderRadius: 2,
  },
  cardTitle: {
    fontFamily: T.sora,
    fontSize: 14,
    fontWeight: 700,
    color: T.heading,
    margin: "0 0 7px",
    lineHeight: 1.35,
  },
  cardDesc: { fontSize: 12, color: T.secondary, lineHeight: 1.6, margin: "0 0 14px" },
  lockPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#F1F5F9",
    color: T.muted,
    padding: "8px 14px",
    borderRadius: 2,
    cursor: "pointer",
    width: "fit-content",
    textDecoration: "none",
  },
  greenPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: T.surfaceGreen,
    color: T.brand,
    padding: "8px 14px",
    borderRadius: 2,
    cursor: "pointer",
    width: "fit-content",
    border: "1px solid #C6DDD0",
    fontSize: 12,
    fontWeight: 600,
  },
  blurWrap: {
    filter: "blur(5px)",
    pointerEvents: "none",
    background: "#fff",
    border: `1px solid ${T.border}`,
    borderRadius: 2,
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 500 },
  th: {
    padding: "12px 20px",
    fontSize: 11,
    color: T.secondary,
    borderBottom: `2px solid ${T.border}`,
  },
  lockOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(247,250,248,.68)",
  },
  lockCard: {
    textAlign: "center",
    background: "#fff",
    border: `1px solid ${T.border}`,
    padding: "30px 40px",
    borderRadius: 4,
    boxShadow: "0 4px 20px rgba(0,0,0,.1)",
    maxWidth: "90vw",
  },
  lockTitle: {
    fontFamily: T.sora,
    fontSize: 16,
    fontWeight: 700,
    color: T.heading,
    marginBottom: 7,
  },
  lockText: {
    fontSize: 12.5,
    color: T.secondary,
    marginBottom: 20,
    lineHeight: 1.6,
  },
};
