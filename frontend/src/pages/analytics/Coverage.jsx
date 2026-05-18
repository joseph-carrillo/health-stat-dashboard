import { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const PROGRAMS = [
  { label: "CPAB",         totalCode: "CPAB_TOTAL",        pctCode: "CPAB_PCT",        denomCode: "IMMUN_POP_0_11M" },
  { label: "BCG ≤24H",    totalCode: "BCG_24H_TOTAL",     pctCode: "BCG_24H_PCT",     denomCode: "IMMUN_POP_0_11M" },
  { label: "BCG >24H",    totalCode: "BCG_GT24H_TOTAL",   pctCode: "BCG_GT24H_PCT",   denomCode: "IMMUN_POP_0_11M" },
  { label: "HepaB ≤24H",  totalCode: "HEPAB_24H_TOTAL",   pctCode: "HEPAB_24H_PCT",   denomCode: "IMMUN_POP_0_11M" },
  { label: "HepaB >24H",  totalCode: "HEPAB_GT24H_TOTAL", pctCode: "HEPAB_GT24H_PCT", denomCode: "IMMUN_POP_0_11M" },
  { label: "CIC",          totalCode: "CIC_TOTAL",          pctCode: "CIC_PCT",          denomCode: "IMMUN_POP_0_11M" },
  { label: "FIC",          totalCode: "FIC_TOTAL",          pctCode: "FIC_PCT",          denomCode: "IMMUN_POP_0_11M" },
  { label: "DPT1",         totalCode: "DPT1_TOTAL",         pctCode: "DPT1_PCT",         denomCode: "DPT_POP_2026" },
  { label: "DPT2",         totalCode: "DPT2_TOTAL",         pctCode: "DPT2_PCT",         denomCode: "DPT_POP_2026" },
  { label: "DPT3",         totalCode: "DPT3_TOTAL",         pctCode: "DPT3_PCT",         denomCode: "DPT_POP_2026" },
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const PROVINCE_ORDER = ["Negros Occidental", "Negros Oriental", "Siquijor", "HUC"];

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

function CoverageBar({ pct }) {
  const w = pct != null ? Math.min(Math.max(pct * 100, 0), 100) : 0;
  const color = pctColor(pct);
  return (
    <div style={styles.barTrack}>
      <div style={{ ...styles.barFill, width: `${w}%`, background: color }} />
    </div>
  );
}

function groupByProvince(rows) {
  const groups = {};
  for (const row of rows) {
    const prov = row.province || "Unknown";
    if (!groups[prov]) groups[prov] = [];
    groups[prov].push(row);
  }
  return groups;
}

function provinceSubtotal(rows) {
  const num = rows.reduce((s, r) => s + (r.numerator ?? 0), 0);
  const den = rows.reduce((s, r) => s + (r.denominator ?? 0), 0);
  return { numerator: num, denominator: den, pct: den > 0 ? num / den : null };
}

function SummaryCard({ label, value, sub }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={styles.cardValue}>{value}</div>
      {sub && <div style={styles.cardSub}>{sub}</div>}
    </div>
  );
}

export default function Coverage() {
  const [program, setProgram] = useState(0);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const prog = PROGRAMS[program];
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/coverage-breakdown", {
        params: {
          year, month,
          total_code: prog.totalCode,
          pct_code: prog.pctCode,
          denom_code: prog.denomCode,
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

  useEffect(() => { load(); }, []);

  const prog = PROGRAMS[program];

  const displayRows = provinceFilter === "all"
    ? data
    : data.filter(r => r.province === provinceFilter || (provinceFilter === "HUC" && r.is_huc));

  const groups = groupByProvince(displayRows);
  const orderedProvs = PROVINCE_ORDER.filter(p => groups[p]);
  const otherProvs = Object.keys(groups).filter(p => !PROVINCE_ORDER.includes(p));

  const nir = provinceSubtotal(data.filter(r => r.denominator != null && r.numerator != null));
  const lguCount = data.filter(r => r.pct != null).length;
  const avgPct = lguCount > 0
    ? data.filter(r => r.pct != null).reduce((s, r) => s + r.pct, 0) / lguCount
    : null;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Coverage</h1>
          <p style={styles.subtitle}>Numerator · Denominator · Coverage % per LGU</p>
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Program</label>
            <select
              style={styles.select}
              value={program}
              onChange={e => setProgram(Number(e.target.value))}
            >
              {PROGRAMS.map((p, i) => (
                <option key={p.label} value={i}>{p.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Province</label>
            <select
              style={styles.select}
              value={provinceFilter}
              onChange={e => setProvinceFilter(e.target.value)}
            >
              <option value="all">All</option>
              {PROVINCE_ORDER.map(p => <option key={p} value={p}>{p}</option>)}
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

          <button style={styles.loadBtn} onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Load"}
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loaded && data.length === 0 && (
          <div style={styles.emptyBox}>
            No data found for {MONTHS[month - 1]} {year} — {prog.label}.
            Upload the report first via Management → Upload.
          </div>
        )}

        {loaded && data.length > 0 && (
          <>
            {/* Summary cards */}
            <div style={styles.cardRow}>
              <SummaryCard
                label="NIR Numerator"
                value={fmtNum(nir.numerator)}
                sub={prog.totalCode}
              />
              <SummaryCard
                label="NIR Denominator"
                value={fmtNum(nir.denominator)}
                sub={prog.denomCode}
              />
              <SummaryCard
                label="NIR Coverage"
                value={fmtPct(nir.pct)}
                sub="sum(num) / sum(denom)"
              />
              <SummaryCard
                label="LGUs w/ Data"
                value={lguCount}
                sub={`Avg: ${fmtPct(avgPct)}`}
              />
            </div>

            {/* Table */}
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thLgu}>LGU</th>
                    <th style={styles.thNum}>Numerator</th>
                    <th style={styles.thNum}>Denominator</th>
                    <th style={styles.thPct}>Coverage %</th>
                    <th style={styles.thBar}>Visual</th>
                  </tr>
                </thead>
                <tbody>
                  {[...orderedProvs, ...otherProvs].map(prov => {
                    const rows = groups[prov] || [];
                    const sub = provinceSubtotal(
                      rows.filter(r => r.numerator != null && r.denominator != null)
                    );
                    const isHucProv = prov === "HUC";
                    return [
                      // Province header row
                      <tr key={`hdr-${prov}`} style={isHucProv ? styles.hucHeader : styles.provHeader}>
                        <td colSpan={2} style={isHucProv ? styles.hucHeaderCell : styles.provHeaderCell}>
                          {isHucProv ? "City of Bacolod (HUC)" : prov}
                          {isHucProv && (
                            <span style={styles.hucBadge}>HUC</span>
                          )}
                        </td>
                        <td style={styles.subTotCell}>{fmtNum(sub.denominator)}</td>
                        <td style={styles.subTotCell}>{fmtPct(sub.pct)}</td>
                        <td style={styles.subTotCell}>
                          <CoverageBar pct={sub.pct} />
                        </td>
                      </tr>,
                      // LGU rows (skip if HUC — it IS the header)
                      ...(isHucProv ? [] : rows.map(row => (
                        <tr key={row.psgc} style={styles.lguRow}>
                          <td style={styles.tdLgu}>{row.location}</td>
                          <td style={styles.tdNum}>{fmtNum(row.numerator)}</td>
                          <td style={styles.tdNum}>{fmtNum(row.denominator)}</td>
                          <td style={{ ...styles.tdPct, color: pctColor(row.pct), fontWeight: 600 }}>
                            {fmtPct(row.pct)}
                          </td>
                          <td style={styles.tdBar}>
                            <CoverageBar pct={row.pct} />
                          </td>
                        </tr>
                      ))),
                      // Province subtotal row (not shown for HUC since it only has one row)
                      ...(isHucProv ? [] : [
                        <tr key={`sub-${prov}`} style={styles.subtotalRow}>
                          <td style={styles.tdSubtotalLabel}>
                            {prov} Total
                          </td>
                          <td style={styles.tdSubtotalNum}>{fmtNum(sub.numerator)}</td>
                          <td style={styles.tdSubtotalNum}>{fmtNum(sub.denominator)}</td>
                          <td style={{ ...styles.tdSubtotalPct, color: pctColor(sub.pct) }}>
                            {fmtPct(sub.pct)}
                          </td>
                          <td style={styles.tdBar}>
                            <CoverageBar pct={sub.pct} />
                          </td>
                        </tr>
                      ])
                    ];
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.legend}>
              <span style={{ ...styles.legendDot, background: "#16a34a" }} /> ≥90%
              <span style={{ ...styles.legendDot, background: "#d97706", marginLeft: 16 }} /> 75–89%
              <span style={{ ...styles.legendDot, background: "#dc2626", marginLeft: 16 }} /> &lt;75%
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:            { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" },
  content:         { flex: 1, padding: "32px 40px", maxWidth: 1200, margin: "0 auto", width: "100%" },
  header:          { marginBottom: 28 },
  title:           { fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle:        { fontSize: 14, color: "#64748b", marginTop: 4 },

  filterRow:       { display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 28, flexWrap: "wrap" },
  filterGroup:     { display: "flex", flexDirection: "column", gap: 4 },
  filterLabel:     { fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
  select:          { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, background: "#fff", color: "#1e293b", cursor: "pointer" },
  loadBtn:         { padding: "9px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", alignSelf: "flex-end" },

  errorBox:        { padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#dc2626", marginBottom: 24, fontSize: 14 },
  emptyBox:        { padding: "40px 24px", textAlign: "center", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 14, lineHeight: 1.6 },

  cardRow:         { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 },
  card:            { background: "#fff", borderRadius: 8, padding: "16px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  cardLabel:       { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 },
  cardValue:       { fontSize: 24, fontWeight: 700, color: "#0f172a" },
  cardSub:         { fontSize: 11, color: "#94a3b8", marginTop: 4 },

  tableWrap:       { background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  table:           { width: "100%", borderCollapse: "collapse", fontSize: 13 },

  thLgu:           { padding: "10px 16px", textAlign: "left",  background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase" },
  thNum:           { padding: "10px 16px", textAlign: "right", background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase", whiteSpace: "nowrap" },
  thPct:           { padding: "10px 16px", textAlign: "right", background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase" },
  thBar:           { padding: "10px 16px", textAlign: "left",  background: "#f8fafc", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 12, textTransform: "uppercase", width: 180 },

  provHeader:      { background: "#1e40af" },
  provHeaderCell:  { padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 13 },
  hucHeader:       { background: "#6d28d9" },
  hucHeaderCell:   { padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 },
  hucBadge:        { background: "#a78bfa", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 },
  subTotCell:      { padding: "8px 16px", textAlign: "right", color: "#e0e7ff", fontWeight: 600, fontSize: 13 },

  lguRow:          { borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" },
  tdLgu:           { padding: "9px 16px", color: "#1e293b", fontSize: 13 },
  tdNum:           { padding: "9px 16px", textAlign: "right", color: "#475569", fontVariantNumeric: "tabular-nums" },
  tdPct:           { padding: "9px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" },
  tdBar:           { padding: "9px 16px" },

  subtotalRow:     { background: "#f0f9ff", borderTop: "2px solid #bae6fd", borderBottom: "2px solid #bae6fd" },
  tdSubtotalLabel: { padding: "8px 16px", fontWeight: 700, color: "#0369a1", fontSize: 13 },
  tdSubtotalNum:   { padding: "8px 16px", textAlign: "right", fontWeight: 700, color: "#0369a1", fontVariantNumeric: "tabular-nums" },
  tdSubtotalPct:   { padding: "8px 16px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" },

  barTrack:        { background: "#e2e8f0", borderRadius: 4, height: 10, width: "100%", minWidth: 80, overflow: "hidden" },
  barFill:         { height: "100%", borderRadius: 4, transition: "width 0.4s ease" },

  legend:          { display: "flex", alignItems: "center", gap: 6, marginTop: 16, fontSize: 12, color: "#64748b" },
  legendDot:       { display: "inline-block", width: 10, height: 10, borderRadius: "50%" },
};
