// frontend/src/pages/Home.jsx

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

function statusColor(status) {
  if (status === "on") return "#16A34A";
  if (status === "near") return "#EAB308";
  return "#DC2626";
}

function statusLabel(status) {
  if (status === "on") return "On Target";
  if (status === "near") return "Near Target";
  return "Below Target";
}

function alertColor(type) {
  if (type === "danger") return { bg: "#FEE2E2", border: "#DC2626", text: "#991B1B" };
  if (type === "warning") return { bg: "#FEF9C3", border: "#EAB308", text: "#854D0E" };
  return { bg: "#DBEAFE", border: "#0B4BAA", text: "#1E40AF" };
}

function coverageToStatus(ratio) {
  if (ratio === null) return "pending";
  if (ratio >= 0.95) return "on";
  if (ratio >= 0.80) return "near";
  return "below";
}

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR  = new Date().getFullYear();

// Programs not yet in the DB — shown as data pending
const PLACEHOLDER_PROGRAMS = [
  "Safe Motherhood",
  "Nutrition",
  "IMCI",
  "Family Planning",
  "Non-Communicable Diseases",
  "Infectious Diseases",
];

export default function Home() {
  const user = getUser();
  const isAdmin = ["admin", "mancom", "execom"].includes(user.role);

  const [immunizationData, setImmunizationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/coverage-summary?year=${CURRENT_YEAR}&month=${CURRENT_MONTH}&indicator_code=CPAB_PCT`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const values = (d.data || []).map((x) => x.value).filter((v) => v !== null);
        if (values.length === 0) {
          setImmunizationData(null);
        } else {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          setImmunizationData({ avg, count: values.length });
        }
      })
      .catch(() => setImmunizationData(null))
      .finally(() => setLoading(false));
  }, []);

  // Build program list — Immunization uses real data, rest are placeholders
  const immunizationStatus = immunizationData
    ? coverageToStatus(immunizationData.avg)
    : "pending";

  const immunizationCoverage = immunizationData
    ? `${(immunizationData.avg * 100).toFixed(1)}%`
    : "No data";

  const programs = [
    {
      program: "Immunization (CPAB)",
      coverage: immunizationCoverage,
      status: immunizationStatus,
      lguCount: immunizationData?.count ?? null,
    },
    ...PLACEHOLDER_PROGRAMS.map((p) => ({
      program: p,
      coverage: "—",
      status: "pending",
      lguCount: null,
    })),
  ];

  // Filter for non-admin: only show Immunization (only program available so far)
  const visiblePrograms = isAdmin
    ? programs
    : programs.filter((p) => p.program === "Immunization (CPAB)");

  const onTarget    = visiblePrograms.filter((p) => p.status === "on").length;
  const nearTarget  = visiblePrograms.filter((p) => p.status === "near").length;
  const belowTarget = visiblePrograms.filter((p) => p.status === "below").length;

  // Static system alerts — replace with a real alert API when available
  const allAlerts = [
    { id: 1, type: "info", program: "System", message: "Upload data via Management → Upload to populate the dashboard." },
    { id: 2, type: "info", program: "Immunization", message: `Showing CPAB coverage average across ${immunizationData?.count ?? 0} LGUs for ${new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" })}.` },
  ];

  const alerts = isAdmin
    ? allAlerts
    : allAlerts.filter((a) => a.program === "Immunization" || a.program === "System");

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Welcome */}
        <div style={styles.welcome}>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {user.sub || "User"}
          </h1>
          <p style={styles.welcomeSub}>
            {new Date().toLocaleDateString("en-PH", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
            &nbsp;·&nbsp;
            {isAdmin ? "Viewing all programs" : `Viewing: ${user.program_code?.replace(/_/g, " ") || "—"}`}
          </p>
        </div>

        {/* Summary Cards */}
        <div style={styles.cardRow}>
          <div style={{ ...styles.card, borderTop: "4px solid #0B4BAA" }}>
            <p style={styles.cardLabel}>Programs</p>
            <p style={styles.cardNumber}>{visiblePrograms.length}</p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #16A34A" }}>
            <p style={styles.cardLabel}>On Target</p>
            <p style={{ ...styles.cardNumber, color: "#16A34A" }}>
              {loading ? "—" : onTarget}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #EAB308" }}>
            <p style={styles.cardLabel}>Near Target</p>
            <p style={{ ...styles.cardNumber, color: "#EAB308" }}>
              {loading ? "—" : nearTarget}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #DC2626" }}>
            <p style={styles.cardLabel}>Below Target</p>
            <p style={{ ...styles.cardNumber, color: "#DC2626" }}>
              {loading ? "—" : belowTarget}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={styles.twoCol}>

          {/* Program Scorecard */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Program Scorecard</h2>
            <p style={styles.sectionSub}>
              Current month coverage · {new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
            </p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Program</th>
                  <th style={styles.th}>Coverage</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {visiblePrograms.map((p) => (
                  <tr key={p.program} style={styles.tr}>
                    <td style={styles.td}>
                      {p.program}
                      {p.lguCount !== null && (
                        <span style={styles.lguCount}> ({p.lguCount} LGUs)</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {loading && p.program === "Immunization (CPAB)" ? "Loading…" : p.coverage}
                    </td>
                    <td style={styles.td}>
                      {p.status === "pending" ? (
                        <span style={styles.badgePending}>Data Pending</span>
                      ) : (
                        <span style={{
                          ...styles.badge,
                          backgroundColor: statusColor(p.status) + "20",
                          color: statusColor(p.status),
                          border: `1px solid ${statusColor(p.status)}`,
                        }}>
                          {statusLabel(p.status)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alerts */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Alerts & Announcements</h2>
            <p style={styles.sectionSub}>Items that need your attention</p>
            {alerts.map((a) => {
              const colors = alertColor(a.type);
              return (
                <div key={a.id} style={{
                  ...styles.alert,
                  backgroundColor: colors.bg,
                  borderLeft: `4px solid ${colors.border}`,
                }}>
                  <p style={{ ...styles.alertText, color: colors.text }}>
                    <strong>{a.program}</strong> — {a.message}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "28px 32px", marginLeft: "240px" },
  welcome: { marginBottom: "24px" },
  welcomeTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  welcomeSub: { fontSize: "13px", color: "#5A6A85", margin: 0 },
  cardRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  card: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  cardLabel: { fontSize: "11px", color: "#5A6A85", margin: "0 0 8px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  cardNumber: { fontSize: "32px", fontWeight: "700", color: "#1F2A45", margin: 0, fontFamily: "'Montserrat', sans-serif" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  section: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  sectionTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "15px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  sectionSub: { fontSize: "12px", color: "#5A6A85", margin: "0 0 16px 0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #F0F4F8" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  td: { padding: "10px 12px", fontSize: "13px", color: "#1F2A45" },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
  badgePending: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "#F1F5F9", color: "#94A3B8", border: "1px solid #CBD5E1" },
  lguCount: { fontSize: "11px", color: "#94A3B8", fontWeight: "400" },
  alert: { padding: "12px 16px", borderRadius: "6px", marginBottom: "10px" },
  alertText: { fontSize: "13px", margin: 0, lineHeight: "1.5" },
};
