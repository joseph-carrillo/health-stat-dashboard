// frontend/src/pages/analytics/Trends.jsx
// Monthly trend line chart for an indicator, region-wide or per LGU.

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import LineChart from "../../components/LineChart";
import { getTrend, getIndicators, getLocations } from "../../services/api";
import { YEARS } from "../../services/constants";

const DEFAULT_INDICATOR = "CPAB_PCT";

export default function Trends() {
  const [indicators, setIndicators] = useState([]);
  const [locations, setLocations] = useState([]);
  const [indicatorCode, setIndicatorCode] = useState(DEFAULT_INDICATOR);
  const [year, setYear] = useState(2026);
  const [psgc, setPsgc] = useState("");
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getIndicators()
      .then((res) => {
        const list = res.indicators || [];
        setIndicators(list);
        if (!list.find((i) => i.code === DEFAULT_INDICATOR) && list[0]) {
          setIndicatorCode(list[0].code);
        }
      })
      .catch(() => {});
    getLocations({ level: "city_municipality" })
      .then((res) => setLocations(res.locations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!indicatorCode) return;
    let active = true;
    setLoading(true);
    getTrend({ indicator_code: indicatorCode, year, location_psgc: psgc || undefined })
      .then((res) => active && setTrend(res))
      .catch(() => active && setTrend(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [indicatorCode, year, psgc]);

  const series = trend?.series || [];
  const unit = trend?.is_rate ? "%" : "";
  const withData = series.filter((p) => p.value !== null && p.value !== undefined);
  const avg = withData.length
    ? (withData.reduce((s, p) => s + p.value, 0) / withData.length).toFixed(1)
    : null;
  const peak = withData.length ? Math.max(...withData.map((p) => p.value)) : null;
  const latest = withData.length ? withData[withData.length - 1].value : null;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <h1 style={styles.title}>Trends</h1>
        <p style={styles.subtitle}>Performance over the months of a year.</p>

        <div style={styles.filterBar}>
          <select style={styles.select} value={indicatorCode} onChange={(e) => setIndicatorCode(e.target.value)}>
            {indicators.map((i) => (
              <option key={i.code} value={i.code}>{i.name}</option>
            ))}
          </select>
          <select style={styles.select} value={psgc} onChange={(e) => setPsgc(e.target.value)}>
            <option value="">All LGUs (region-wide)</option>
            {locations.map((l) => (
              <option key={l.psgc} value={l.psgc}>{l.name}</option>
            ))}
          </select>
          <select style={styles.select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {loading && <span style={styles.loadingTag}>Loading...</span>}
        </div>

        <div style={styles.statRow}>
          <Stat label="Latest" value={latest !== null ? `${latest}${unit}` : "—"} />
          <Stat label="Average" value={avg !== null ? `${avg}${unit}` : "—"} />
          <Stat label="Peak" value={peak !== null ? `${peak}${unit}` : "—"} />
          <Stat label="Months Reported" value={withData.length} />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {trend?.indicator_name || "Trend"} — {year}
          </h2>
          {withData.length === 0 ? (
            <p style={styles.empty}>No data for this selection.</p>
          ) : (
            <LineChart series={series} unit={unit} maxOverride={trend?.is_rate ? null : null} />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
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
  statValue: { fontSize: "26px", fontWeight: "700", margin: 0, fontFamily: "'Montserrat', sans-serif", color: "#1F2A45" },
  section: { backgroundColor: "#fff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  sectionTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "15px", fontWeight: "700", color: "#1F2A45", margin: "0 0 16px 0" },
  empty: { fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "40px 0" },
};
