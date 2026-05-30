// frontend/src/pages/analytics/Rankings.jsx
// LGU ranking by coverage rate, top or bottom performers.

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getCoverage, getIndicators } from "../../services/api";
import {
  MONTHS,
  YEARS,
  STATUS_COLORS,
  statusLabel,
  coverageColor,
} from "../../services/constants";

const DEFAULT_INDICATOR = "CPAB_PCT";

export default function Rankings() {
  const [indicators, setIndicators] = useState([]);
  const [indicatorCode, setIndicatorCode] = useState(DEFAULT_INDICATOR);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [order, setOrder] = useState("desc");
  const [rows, setRows] = useState([]);
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
    getCoverage({ indicator_code: indicatorCode, year, period_type: "monthly", period_value: month })
      .then((res) => active && setRows((res.data || []).filter((d) => d.value !== null)))
      .catch(() => active && setRows([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [indicatorCode, year, month]);

  const sorted = [...rows].sort((a, b) =>
    order === "desc" ? b.value - a.value : a.value - b.value
  );
  const maxValue = Math.max(100, ...rows.map((r) => r.value));

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <h1 style={styles.title}>Rankings</h1>
        <p style={styles.subtitle}>LGUs ranked by coverage rate.</p>

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
          <select style={styles.select} value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="desc">Top performers first</option>
            <option value="asc">Bottom performers first</option>
          </select>
          {loading && <span style={styles.loadingTag}>Loading...</span>}
        </div>

        <div style={styles.section}>
          {sorted.length === 0 ? (
            <p style={styles.empty}>No data for this selection.</p>
          ) : (
            <div style={styles.list}>
              {sorted.map((row, index) => (
                <div key={row.psgc} style={styles.row}>
                  <span style={styles.rankNum}>{index + 1}</span>
                  <span style={styles.rankName}>{row.location}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${(row.value / maxValue) * 100}%`, backgroundColor: coverageColor(row.value) }} />
                  </div>
                  <span style={{ ...styles.rankValue, color: coverageColor(row.value) }}>{row.value}%</span>
                  <span style={{ ...styles.badge, backgroundColor: STATUS_COLORS[row.status] + "20", color: STATUS_COLORS[row.status], border: `1px solid ${STATUS_COLORS[row.status]}` }}>
                    {statusLabel(row.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
  section: { backgroundColor: "#fff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  empty: { fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "40px 0" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  row: { display: "grid", gridTemplateColumns: "32px 200px 1fr 56px 110px", alignItems: "center", gap: "12px" },
  rankNum: { fontSize: "13px", color: "#94A3B8", fontWeight: "700", textAlign: "right" },
  rankName: { fontSize: "13px", color: "#1F2A45", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  barTrack: { backgroundColor: "#F0F4F8", borderRadius: "4px", height: "16px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
  rankValue: { fontSize: "13px", fontWeight: "700", textAlign: "right" },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textAlign: "center" },
};
