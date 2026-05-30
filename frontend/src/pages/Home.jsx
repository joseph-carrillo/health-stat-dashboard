// frontend/src/pages/Home.jsx
// Home page — first thing users see after login.
// Shows a live per-program scorecard for the selected period.

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getUser } from "../services/auth";
import { getScorecard } from "../services/api";
import {
  MONTHS,
  YEARS,
  STATUS_COLORS,
  statusLabel,
} from "../services/constants";

function buildAlerts(scorecard) {
  const alerts = [];
  scorecard.forEach((p) => {
    if (p.status === "below") {
      alerts.push({
        type: "danger",
        program: p.program,
        message: `Below target at ${p.coverage}% coverage.`,
      });
    } else if (p.status === "near") {
      alerts.push({
        type: "warning",
        program: p.program,
        message: `Near target at ${p.coverage}% — push to reach 95%.`,
      });
    } else if (p.status === "no_data") {
      alerts.push({
        type: "info",
        program: p.program,
        message: "No data submitted for this period yet.",
      });
    }
  });
  return alerts;
}

function alertColor(type) {
  if (type === "danger") return { bg: "#FEE2E2", border: "#DC2626", text: "#991B1B" };
  if (type === "warning") return { bg: "#FEF9C3", border: "#EAB308", text: "#854D0E" };
  return { bg: "#DBEAFE", border: "#0B4BAA", text: "#1E40AF" };
}

export default function Home() {
  const user = getUser();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [scorecard, setScorecard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getScorecard({ year, period_type: "monthly", period_value: month })
      .then((res) => {
        if (active) setScorecard(res.scorecard || []);
      })
      .catch(() => {
        if (active) setError("Could not load scorecard. Is the API running?");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [year, month]);

  const withData = scorecard.filter((p) => p.status !== "no_data");
  const onTarget = scorecard.filter((p) => p.status === "on").length;
  const nearTarget = scorecard.filter((p) => p.status === "near").length;
  const belowTarget = scorecard.filter((p) => p.status === "below").length;
  const alerts = buildAlerts(scorecard);

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Welcome back, {user.username || "User"}
            </h1>
            <p style={styles.welcomeSub}>
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              &nbsp;·&nbsp;
              {user.permissions?.can_view_all
                ? "Viewing all programs"
                : `Viewing: ${(user.program_code || "—").replace(/_/g, " ")}`}
            </p>
          </div>
          <div style={styles.filters}>
            <select
              style={styles.select}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              style={styles.select}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Summary Cards */}
        <div style={styles.cardRow}>
          <SummaryCard label="Programs With Data" value={withData.length} border="#0B4BAA" />
          <SummaryCard label="On Target" value={onTarget} border="#16A34A" color="#16A34A" />
          <SummaryCard label="Near Target" value={nearTarget} border="#EAB308" color="#EAB308" />
          <SummaryCard label="Below Target" value={belowTarget} border="#DC2626" color="#DC2626" />
        </div>

        <div style={styles.twoCol}>
          {/* Program Scorecard */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Program Scorecard</h2>
            <p style={styles.sectionSub}>Average coverage per program</p>
            {loading ? (
              <p style={styles.loading}>Loading...</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Program</th>
                    <th style={styles.th}>Coverage</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scorecard.map((p) => (
                    <tr key={p.program_code} style={styles.tr}>
                      <td style={styles.td}>{p.program}</td>
                      <td style={styles.td}>
                        {p.coverage !== null ? `${p.coverage}%` : "—"}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: STATUS_COLORS[p.status] + "20",
                            color: STATUS_COLORS[p.status],
                            border: `1px solid ${STATUS_COLORS[p.status]}`,
                          }}
                        >
                          {statusLabel(p.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {scorecard.length === 0 && !loading && (
                    <tr>
                      <td style={styles.td} colSpan={3}>
                        No programs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Alerts */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Alerts & Announcements</h2>
            <p style={styles.sectionSub}>Items that need your attention</p>
            {alerts.length === 0 ? (
              <p style={styles.noAlerts}>No alerts at this time.</p>
            ) : (
              alerts.map((a, i) => {
                const colors = alertColor(a.type);
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.alert,
                      backgroundColor: colors.bg,
                      borderLeft: `4px solid ${colors.border}`,
                    }}
                  >
                    <p style={{ ...styles.alertText, color: colors.text }}>
                      <strong>{a.program}</strong> — {a.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, border, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${border}` }}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardNumber, color: color || "#1F2A45" }}>{value}</p>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "28px 32px", marginLeft: "240px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "16px", flexWrap: "wrap" },
  welcomeTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  welcomeSub: { fontSize: "13px", color: "#5A6A85", margin: 0 },
  filters: { display: "flex", gap: "10px" },
  select: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#1F2A45", backgroundColor: "#fff", outline: "none" },
  error: { backgroundColor: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" },
  cardRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  card: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  cardLabel: { fontSize: "11px", color: "#5A6A85", margin: "0 0 8px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  cardNumber: { fontSize: "32px", fontWeight: "700", color: "#1F2A45", margin: 0, fontFamily: "'Montserrat', sans-serif" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  section: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  sectionTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "15px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  sectionSub: { fontSize: "12px", color: "#5A6A85", margin: "0 0 16px 0" },
  loading: { fontSize: "13px", color: "#5A6A85", textAlign: "center", padding: "20px 0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #F0F4F8" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  td: { padding: "10px 12px", fontSize: "13px", color: "#1F2A45" },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
  alert: { padding: "12px 16px", borderRadius: "6px", marginBottom: "10px" },
  alertText: { fontSize: "13px", margin: 0, lineHeight: "1.5" },
  noAlerts: { fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "20px 0" },
};
