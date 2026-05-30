// frontend/src/pages/analytics/Coverage.jsx
// Per-LGU coverage breakdown: numerator, denominator, and coverage %.

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getCoverageDetail, getIndicators } from "../../services/api";
import {
  MONTHS,
  YEARS,
  STATUS_COLORS,
  statusLabel,
  coverageColor,
} from "../../services/constants";

const DEFAULT_INDICATOR = "CPAB_PCT";

export default function Coverage() {
  const [indicators, setIndicators] = useState([]);
  const [indicatorCode, setIndicatorCode] = useState(DEFAULT_INDICATOR);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getIndicators()
      .then((res) => {
        const pct = (res.indicators || []).filter((i) => i.formula_type === "percentage");
        setIndicators(pct);
        if (!pct.find((i) => i.code === DEFAULT_INDICATOR) && pct[0]) {
          setIndicatorCode(pct[0].code);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!indicatorCode) return;
    let active = true;
    setLoading(true);
    getCoverageDetail({ indicator_code: indicatorCode, year, period_type: "monthly", period_value: month })
      .then((res) => active && setResult(res))
      .catch(() => active && setResult(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [indicatorCode, year, month]);

  const rows = result?.data || [];
  const withData = rows.filter((r) => r.coverage !== null);
  const avg = withData.length
    ? (withData.reduce((s, r) => s + r.coverage, 0) / withData.length).toFixed(1)
    : null;
  const maxCoverage = Math.max(100, ...withData.map((r) => r.coverage));

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <h1 style={styles.title}>Coverage Analysis</h1>
        <p style={styles.subtitle}>
          Numerator, denominator, and coverage rate per LGU.
        </p>

        <div style={styles.filterBar}>
          <select style={styles.select} value={indicatorCode} onChange={(e) => setIndicatorCode(e.target.value)}>
            {indicators.map((i) => (
              <option key={i.code} value={i.code}>{i.name}</option>
            ))}
          </select>
          <select style={styles.select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select style={styles.select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {loading && <span style={styles.loadingTag}>Loading...</span>}
        </div>

        <div style={styles.statRow}>
          <Stat label="LGUs With Data" value={withData.length} />
          <Stat label="Average Coverage" value={avg !== null ? `${avg}%` : "—"} />
          <Stat label="On Target" value={withData.filter((r) => r.status === "on").length} color="#16A34A" />
          <Stat label="Below Target" value={withData.filter((r) => r.status === "below").length} color="#DC2626" />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {result?.indicator_name || "Coverage"} — by LGU
          </h2>
          {loading ? (
            <p style={styles.loadingTag}>Loading...</p>
          ) : rows.length === 0 ? (
            <p style={styles.empty}>No data for this selection.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>LGU</th>
                  <th style={styles.thNum}>Numerator</th>
                  <th style={styles.thNum}>Denominator</th>
                  <th style={styles.th}>Coverage</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.psgc} style={styles.tr}>
                    <td style={styles.td}>{r.location}</td>
                    <td style={styles.tdNum}>{fmt(r.numerator)}</td>
                    <td style={styles.tdNum}>{fmt(r.denominator)}</td>
                    <td style={styles.tdBar}>
                      <div style={styles.barWrap}>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.barFill, width: `${Math.min(100, (r.coverage / maxCoverage) * 100 || 0)}%`, backgroundColor: coverageColor(r.coverage) }} />
                        </div>
                        <span style={styles.barValue}>{r.coverage !== null ? `${r.coverage}%` : "—"}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: STATUS_COLORS[r.status] + "20", color: STATUS_COLORS[r.status], border: `1px solid ${STATUS_COLORS[r.status]}` }}>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function fmt(v) {
  if (v === null || v === undefined) return "—";
  return Number(v).toLocaleString();
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color: color || "#1F2A45" }}>{value}</p>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "24px 32px", marginLeft: "240px" },
  title: { fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#5A6A85", margin: "0 0 20px 0" },
  filterBar: { display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" },
  select: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#1F2A45", backgroundColor: "#fff", outline: "none", minWidth: "160px" },
  loadingTag: { fontSize: "12px", color: "#5A6A85" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  stat: { backgroundColor: "#fff", borderRadius: "10px", padding: "18px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  statLabel: { fontSize: "11px", color: "#5A6A85", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  statValue: { fontSize: "26px", fontWeight: "700", margin: 0, fontFamily: "'Montserrat', sans-serif" },
  section: { backgroundColor: "#fff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  sectionTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "15px", fontWeight: "700", color: "#1F2A45", margin: "0 0 16px 0" },
  empty: { fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "20px 0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #F0F4F8" },
  thNum: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "right", borderBottom: "2px solid #F0F4F8" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  td: { padding: "9px 12px", fontSize: "13px", color: "#1F2A45" },
  tdNum: { padding: "9px 12px", fontSize: "13px", color: "#1F2A45", textAlign: "right" },
  tdBar: { padding: "9px 12px", width: "240px" },
  barWrap: { display: "flex", alignItems: "center", gap: "10px" },
  barTrack: { flex: 1, backgroundColor: "#F0F4F8", borderRadius: "4px", height: "14px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
  barValue: { fontSize: "12px", fontWeight: "700", color: "#1F2A45", width: "46px", textAlign: "right" },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
};
