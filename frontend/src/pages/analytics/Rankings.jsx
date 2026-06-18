import { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import {
  OVERVIEW_INDICATOR_GROUPS,
  DEFAULT_OVERVIEW_INDICATOR,
  findOverviewIndicator,
} from "../../config/overviewIndicators";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const MEDAL = ["🥇", "🥈", "🥉"];

function pctColor(pct) {
  if (pct === null || pct === undefined) return "#9ca3af";
  if (pct >= 0.90) return "#16a34a";
  if (pct >= 0.75) return "#d97706";
  return "#dc2626";
}

function fmtPct(pct) {
  if (pct === null || pct === undefined) return "—";
  return (pct * 100).toFixed(1) + "%";
}

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString();
}

function RankBadge({ rank, total }) {
  if (rank <= 3) return (
    <span style={styles.medal}>{MEDAL[rank - 1]}</span>
  );
  if (rank > total - 3) return (
    <span style={{ ...styles.rankNum, color: "#dc2626", background: "#fef2f2" }}>
      #{rank}
    </span>
  );
  return <span style={styles.rankNum}>#{rank}</span>;
}

function CoverageBar({ pct }) {
  const w = pct != null ? Math.min(Math.max(pct * 100, 0), 100) : 0;
  const color = pctColor(pct);
  return (
    <div style={styles.barTrack}>
      <div style={{ ...styles.barFill, width: `${w}%`, background: color }} />
    </div>
  );
}

export default function Rankings() {
  const [indicatorCode, setIndicatorCode] = useState(DEFAULT_OVERVIEW_INDICATOR);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [sort, setSort] = useState("desc");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const prog = findOverviewIndicator(indicatorCode);
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/coverage-breakdown", {
        params: {
          year, month,
          total_code: prog.total,
          pct_code: prog.code,
          denom_code: prog.denom,
        }
      });
      setData(res.data.data || []);
      setLoaded(true);
    } catch (e) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [indicatorCode, year, month]);

  const prog = findOverviewIndicator(indicatorCode);
  const withData = data.filter(r => r.pct !== null && r.pct !== undefined);
  const sorted = [...withData].sort((a, b) =>
    sort === "desc" ? b.pct - a.pct : a.pct - b.pct
  );

  const total = sorted.length;
  const highest = total > 0 ? sorted[0] : null;
  const lowest  = total > 0 ? sorted[total - 1] : null;
  const avgPct  = total > 0 ? withData.reduce((s, r) => s + r.pct, 0) / total : null;
  const above90 = withData.filter(r => r.pct >= 0.90).length;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Rankings</h1>
          <p style={styles.subtitle}>LGU ranking by coverage rate — top and bottom performers</p>
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Indicator</label>
            <select
              style={styles.select}
              value={indicatorCode}
              onChange={e => setIndicatorCode(e.target.value)}
            >
              {OVERVIEW_INDICATOR_GROUPS.map(g => (
                <optgroup key={g.group} label={g.group}>
                  {g.options.map(o => (
                    <option key={o.code} value={o.code}>{o.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Year</label>
            <select
              style={styles.select}
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            >
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Month</label>
            <select
              style={styles.select}
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Order</label>
            <select
              style={styles.select}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>
          </div>

          <button style={styles.loadBtn} onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Load"}
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loaded && data.length === 0 && (
          <div style={styles.emptyBox}>
            No data found for {MONTHS[month - 1]} {year} — {prog.group ? `${prog.group} · ` : ""}{prog.label}.
            Upload the report first via Management → Upload.
          </div>
        )}

        {loaded && total > 0 && (
          <>
            {/* Summary strip */}
            <div style={styles.summaryStrip}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>LGUs Ranked</span>
                <span style={styles.summaryValue}>{total}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Average Coverage</span>
                <span style={{ ...styles.summaryValue, color: pctColor(avgPct) }}>
                  {fmtPct(avgPct)}
                </span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>≥90% Target</span>
                <span style={{ ...styles.summaryValue, color: above90 === total ? "#16a34a" : "#d97706" }}>
                  {above90} / {total} LGUs
                </span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Top Performer</span>
                <span style={{ ...styles.summaryValue, fontSize: 15 }}>
                  {highest ? `${highest.location} (${fmtPct(highest.pct)})` : "—"}
                </span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Needs Attention</span>
                <span style={{ ...styles.summaryValue, fontSize: 15, color: "#dc2626" }}>
                  {lowest ? `${lowest.location} (${fmtPct(lowest.pct)})` : "—"}
                </span>
              </div>
            </div>

            {/* Rankings table */}
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thRank}>Rank</th>
                    <th style={styles.thLgu}>LGU</th>
                    <th style={styles.thProv}>Province</th>
                    <th style={styles.thNum}>Numerator</th>
                    <th style={styles.thNum}>Denominator</th>
                    <th style={styles.thPct}>Coverage %</th>
                    <th style={styles.thBar}>Visual</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row, idx) => {
                    const rank = idx + 1;
                    const isTop = rank <= 3;
                    const isBottom = rank > total - 3;
                    const rowBg = isTop ? "#f0fdf4" : isBottom ? "#fef2f2" : idx % 2 === 0 ? "#fff" : "#fafafa";
                    return (
                      <tr key={row.psgc || row.location} style={{ ...styles.tableRow, background: rowBg }}>
                        <td style={styles.tdRank}>
                          <RankBadge rank={rank} total={total} />
                        </td>
                        <td style={styles.tdLgu}>
                          {row.location}
                          {row.is_huc && <span style={styles.hucBadge}>HUC</span>}
                        </td>
                        <td style={styles.tdProv}>{row.province}</td>
                        <td style={styles.tdNum}>{fmtNum(row.numerator)}</td>
                        <td style={styles.tdNum}>{fmtNum(row.denominator)}</td>
                        <td style={{ ...styles.tdPct, color: pctColor(row.pct), fontWeight: 700 }}>
                          {fmtPct(row.pct)}
                        </td>
                        <td style={styles.tdBar}>
                          <CoverageBar pct={row.pct} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.legend}>
              <span style={{ ...styles.legendDot, background: "#16a34a" }} /> ≥90%
              <span style={{ ...styles.legendDot, background: "#d97706", marginLeft: 16 }} /> 75–89%
              <span style={{ ...styles.legendDot, background: "#dc2626", marginLeft: 16 }} /> &lt;75%
              <span style={{ marginLeft: 24, color: "#64748b" }}>
                🥇🥈🥉 Top 3 performers highlighted green · Bottom 3 highlighted red
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:           { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" },
  content:        { flex: 1, padding: "32px 40px", maxWidth: 1200, margin: "0 auto", width: "100%" },
  header:         { marginBottom: 28 },
  title:          { fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle:       { fontSize: 14, color: "#64748b", marginTop: 4 },

  filterRow:      { display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 28, flexWrap: "wrap" },
  filterGroup:    { display: "flex", flexDirection: "column", gap: 4 },
  filterLabel:    { fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
  select:         { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, background: "#fff", color: "#1e293b", cursor: "pointer" },
  loadBtn:        { padding: "9px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", alignSelf: "flex-end" },

  errorBox:       { padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#dc2626", marginBottom: 24, fontSize: 14 },
  emptyBox:       { padding: "40px 24px", textAlign: "center", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 14, lineHeight: 1.6 },

  summaryStrip:   { display: "flex", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px 24px", marginBottom: 24, gap: 0, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  summaryItem:    { display: "flex", flexDirection: "column", gap: 4, padding: "0 24px", flex: 1, minWidth: 140 },
  summaryLabel:   { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" },
  summaryValue:   { fontSize: 17, fontWeight: 700, color: "#0f172a" },
  summaryDivider: { width: 1, background: "#e2e8f0", margin: "0 0" },

  tableWrap:      { background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  table:          { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  tableRow:       { borderBottom: "1px solid #f1f5f9" },

  thRank:         { padding: "10px 12px", textAlign: "center", background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase", width: 60 },
  thLgu:          { padding: "10px 16px", textAlign: "left",   background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase" },
  thProv:         { padding: "10px 16px", textAlign: "left",   background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase" },
  thNum:          { padding: "10px 16px", textAlign: "right",  background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase", whiteSpace: "nowrap" },
  thPct:          { padding: "10px 16px", textAlign: "right",  background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase" },
  thBar:          { padding: "10px 16px", textAlign: "left",   background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase", width: 160 },

  tdRank:         { padding: "9px 12px", textAlign: "center" },
  tdLgu:          { padding: "9px 16px", color: "#1e293b", fontWeight: 500 },
  tdProv:         { padding: "9px 16px", color: "#64748b", fontSize: 12 },
  tdNum:          { padding: "9px 16px", textAlign: "right", color: "#475569", fontVariantNumeric: "tabular-nums" },
  tdPct:          { padding: "9px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" },
  tdBar:          { padding: "9px 16px" },

  rankNum:        { display: "inline-block", fontSize: 12, fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 },
  medal:          { fontSize: 18 },
  hucBadge:       { marginLeft: 6, background: "#ede9fe", color: "#7c3aed", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 },

  barTrack:       { background: "#e2e8f0", borderRadius: 4, height: 10, width: "100%", minWidth: 80, overflow: "hidden" },
  barFill:        { height: "100%", borderRadius: 4, transition: "width 0.4s ease" },

  legend:         { display: "flex", alignItems: "center", gap: 6, marginTop: 16, fontSize: 12, color: "#64748b", flexWrap: "wrap" },
  legendDot:      { display: "inline-block", width: 10, height: 10, borderRadius: "50%" },
};
