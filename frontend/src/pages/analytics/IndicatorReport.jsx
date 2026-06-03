// frontend/src/pages/analytics/IndicatorReport.jsx

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

// ── Location order — matches Excel row order exactly ──────────────────────────
const LOCATION_ORDER = [
  { name: "Negros Occidental", isHeader: true },
  { name: "City of Bago", isHeader: false },
  { name: "Binalbagan", isHeader: false },
  { name: "City of Cadiz", isHeader: false },
  { name: "Calatrava", isHeader: false },
  { name: "Candoni", isHeader: false },
  { name: "Cauayan", isHeader: false },
  { name: "Don Salvador Benedicto", isHeader: false },
  { name: "Enrique B. Magalona (Saravia)", isHeader: false },
  { name: "City of Escalante", isHeader: false },
  { name: "City of Himamaylan", isHeader: false },
  { name: "Hinigaran", isHeader: false },
  { name: "Hinoba-an (Asia)", isHeader: false },
  { name: "Ilog", isHeader: false },
  { name: "Isabela", isHeader: false },
  { name: "City of Kabankalan", isHeader: false },
  { name: "City of La Carlota", isHeader: false },
  { name: "La Castellana", isHeader: false },
  { name: "Manapla", isHeader: false },
  { name: "Moises Padilla (Magallon)", isHeader: false },
  { name: "Murcia", isHeader: false },
  { name: "Pontevedra", isHeader: false },
  { name: "Pulupandan", isHeader: false },
  { name: "City of Sagay", isHeader: false },
  { name: "City of San Carlos", isHeader: false },
  { name: "San Enrique", isHeader: false },
  { name: "City of Silay", isHeader: false },
  { name: "City of Sipalay", isHeader: false },
  { name: "City of Talisay", isHeader: false },
  { name: "Toboso", isHeader: false },
  { name: "Valladolid", isHeader: false },
  { name: "City of Victorias", isHeader: false },
  { name: "Negros Oriental", isHeader: true },
  { name: "Amlan", isHeader: false },
  { name: "Ayungon", isHeader: false },
  { name: "Bacong", isHeader: false },
  { name: "City of Bais", isHeader: false },
  { name: "Basay", isHeader: false },
  { name: "City of Bayawan (Tulong)", isHeader: false },
  { name: "Bindoy (Payabon)", isHeader: false },
  { name: "City of Canlaon", isHeader: false },
  { name: "Dauin", isHeader: false },
  { name: "City of Dumaguete (Capital)", isHeader: false },
  { name: "City of Guihulngan", isHeader: false },
  { name: "Jimalalud", isHeader: false },
  { name: "La Libertad", isHeader: false },
  { name: "Mabinay", isHeader: false },
  { name: "Manjuyod", isHeader: false },
  { name: "Pamplona", isHeader: false },
  { name: "San Jose", isHeader: false },
  { name: "Santa Catalina", isHeader: false },
  { name: "Siaton", isHeader: false },
  { name: "Sibulan", isHeader: false },
  { name: "City of Tanjay", isHeader: false },
  { name: "Tayasan", isHeader: false },
  { name: "Valencia (Luzurriaga)", isHeader: false },
  { name: "Vallehermoso", isHeader: false },
  { name: "Zamboanguita", isHeader: false },
  { name: "Siquijor", isHeader: true },
  { name: "Enrique Villanueva", isHeader: false },
  { name: "Larena", isHeader: false },
  { name: "Lazi", isHeader: false },
  { name: "Maria", isHeader: false },
  { name: "San Juan", isHeader: false },
  { name: "Siquijor (Capital)", isHeader: false },
  // HUC — standalone row, no children
  { name: "City of Bacolod (HUC)", isHeader: true },
];

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" },   { value: 4, label: "April" },
  { value: 5, label: "May" },     { value: 6, label: "June" },
  { value: 7, label: "July" },    { value: 8, label: "August" },
  { value: 9, label: "September" },{ value: 10, label: "October" },
  { value: 11, label: "November" },{ value: 12, label: "December" },
];

const PROVINCES = [
  { value: "all",                   label: "All Provinces / LGUs" },
  { value: "Negros Occidental",     label: "Negros Occidental" },
  { value: "Negros Oriental",       label: "Negros Oriental" },
  { value: "Siquijor",              label: "Siquijor" },
  { value: "City of Bacolod (HUC)", label: "City of Bacolod (HUC)" },
];

// ── Column groups — defines the two-row header matching the Excel layout ──────
const COL_GROUPS = [
  {
    label: "Target Pop. (0-11M)",
    colspan: 1,
    codes: ["IMMUN_POP_0_11M"],
    subLabels: [""],
  },
  {
    label: "CPAB",
    colspan: 4,
    codes: ["CPAB_MALE", "CPAB_FEMALE", "CPAB_TOTAL", "CPAB_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "BCG ≤24H",
    colspan: 4,
    codes: ["BCG_24H_MALE", "BCG_24H_FEMALE", "BCG_24H_TOTAL", "BCG_24H_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "BCG >24H",
    colspan: 4,
    codes: ["BCG_GT24H_MALE", "BCG_GT24H_FEMALE", "BCG_GT24H_TOTAL", "BCG_GT24H_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "HepaB ≤24H",
    colspan: 4,
    codes: ["HEPAB_24H_MALE", "HEPAB_24H_FEMALE", "HEPAB_24H_TOTAL", "HEPAB_24H_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
  {
    label: "HepaB >24H",
    colspan: 4,
    codes: ["HEPAB_GT24H_MALE", "HEPAB_GT24H_FEMALE", "HEPAB_GT24H_TOTAL", "HEPAB_GT24H_PCT"],
    subLabels: ["Male", "Female", "Total", "%"],
  },
];

// Flat ordered list of all indicator codes (used for rendering data cells)
const ALL_CODES = COL_GROUPS.flatMap(g => g.codes);

// Codes that are NOT percentages — used for province subtotal summing
const NON_PCT_CODES = ALL_CODES.filter(c => !c.endsWith("_PCT"));

// ── Client-side derivation of computed fields ─────────────────────────────────
// Fixes rows where the backend stored NULL for computed indicators because of
// the old parser bug (early-return on any blank cell). Raw male/female counts
// are always read directly from Excel so they survive correctly. This lets us
// recompute totals and PCT from those raw values without requiring a re-upload.
function deriveComputedFields(lguMap) {
  for (const lgu of Object.values(lguMap)) {
    const pop = lgu["IMMUN_POP_0_11M"] || 0;

    const derive = (total, male, female, pct) => {
      if (lgu[total] == null && lgu[male] != null && lgu[female] != null) {
        lgu[total] = (lgu[male] || 0) + (lgu[female] || 0);
      }
      if (lgu[pct] == null && lgu[total] != null && pop > 0) {
        lgu[pct] = lgu[total] / pop;
      }
    };

    derive("CPAB_TOTAL",        "CPAB_MALE",        "CPAB_FEMALE",        "CPAB_PCT");
    derive("BCG_24H_TOTAL",     "BCG_24H_MALE",     "BCG_24H_FEMALE",     "BCG_24H_PCT");
    derive("BCG_GT24H_TOTAL",   "BCG_GT24H_MALE",   "BCG_GT24H_FEMALE",   "BCG_GT24H_PCT");
    derive("HEPAB_24H_TOTAL",   "HEPAB_24H_MALE",   "HEPAB_24H_FEMALE",   "HEPAB_24H_PCT");
    derive("HEPAB_GT24H_TOTAL", "HEPAB_GT24H_MALE", "HEPAB_GT24H_FEMALE", "HEPAB_GT24H_PCT");
  }
}

// ── Province subtotals ────────────────────────────────────────────────────────
function computeSubtotal(lgus) {
  const totals = {};
  for (const code of NON_PCT_CODES) {
    totals[code] = lgus.reduce((acc, lgu) => {
      const v = lgu[code];
      return acc + (v != null ? Number(v) : 0);
    }, 0);
  }
  const pop = totals["IMMUN_POP_0_11M"] || 0;
  if (pop > 0) {
    totals["CPAB_PCT"]        = totals["CPAB_TOTAL"]        / pop;
    totals["BCG_24H_PCT"]     = totals["BCG_24H_TOTAL"]     / pop;
    totals["BCG_GT24H_PCT"]   = totals["BCG_GT24H_TOTAL"]   / pop;
    totals["HEPAB_24H_PCT"]   = totals["HEPAB_24H_TOTAL"]   / pop;
    totals["HEPAB_GT24H_PCT"] = totals["HEPAB_GT24H_TOTAL"] / pop;
  }
  return totals;
}

// ── Format a single cell value ────────────────────────────────────────────────
function formatValue(value, code) {
  if (value === null || value === undefined) return "—";
  if (code.endsWith("_PCT")) {
    // PCT values are stored as decimal ratios (0.915 = 91.5%)
    return (Number(value) * 100).toFixed(1) + "%";
  }
  if (value === 0) return "0";
  return Number(value).toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────

export default function IndicatorReport() {
  const [year, setYear]       = useState(2026);
  const [month, setMonth]     = useState(new Date().getMonth() + 1);
  const [province, setProvince] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [tableData, setTableData] = useState([]);
  const [lastLoaded, setLastLoaded] = useState(null);

  // ── Fetch & build table ───────────────────────────────────────────────────
  async function fetchData(yr, mo) {
    setLoading(true);
    setError("");
    setTableData([]);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/api/health-data?year=${yr}&month=${mo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to load data.");
        setLoading(false);
        return;
      }

      // Build LGU-keyed map from flat API rows
      const lguMap = {};
      for (const row of data.data) {
        const name = row.location.trim();

        // Skip sub-municipal entries that may appear in some templates
        if (
          name.toLowerCase().includes("barangay") ||
          name.toLowerCase().includes("poblacion") ||
          name.toLowerCase().includes("zone") ||
          name.toLowerCase().includes("purok")
        ) continue;

        if (!lguMap[name]) {
          lguMap[name] = { location: name, psgc: row.psgc };
        }
        lguMap[name][row.indicator_code] = row.value;
      }

      // Derive any computed fields that the backend stored as NULL
      // (handles data uploaded before the parser fix)
      deriveComputedFields(lguMap);

      // Build ordered rows: province header (with subtotal) then its children
      const rows = [];
      let currentProvince = null;
      let provinceLGUs    = [];

      for (const item of LOCATION_ORDER) {
        if (item.isHeader) {
          // Flush previous province group
          if (currentProvince !== null) {
            const subtotals = provinceLGUs.length > 0
              ? computeSubtotal(provinceLGUs)
              : (lguMap[currentProvince] || {});
            rows.push({ location: currentProvince, isHeader: true, ...subtotals });
            rows.push(...provinceLGUs);
          }
          currentProvince = item.name;
          provinceLGUs = [];
        } else {
          const lgu = lguMap[item.name.trim()];
          provinceLGUs.push(lgu || { location: item.name, isEmpty: true });
        }
      }

      // Flush the last group (HUC has no children so provinceLGUs is empty —
      // it falls back to its own row from lguMap which is the correct behaviour)
      if (currentProvince !== null) {
        const subtotals = provinceLGUs.length > 0
          ? computeSubtotal(provinceLGUs)
          : (lguMap[currentProvince] || {});
        rows.push({ location: currentProvince, isHeader: true, ...subtotals });
        rows.push(...provinceLGUs);
      }

      setTableData(rows);
      setLastLoaded({ year: yr, month: mo });

    } catch {
      setError("Cannot connect to server. Is the API running?");
    }

    setLoading(false);
  }

  // Auto-fetch whenever year or month changes
  useEffect(() => {
    fetchData(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // ── Province filter (client-side) ─────────────────────────────────────────
  const visibleRows = province === "all"
    ? tableData
    : (() => {
        const result = [];
        let inside = false;
        for (const row of tableData) {
          if (row.isHeader) inside = row.location === province;
          if (inside) result.push(row);
        }
        return result;
      })();

  const lguCount = visibleRows.filter(r => !r.isHeader).length;

  const monthLabel = MONTHS.find(m => m.value === month)?.label || "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Page header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Indicator Report</h1>
            <p style={styles.pageSub}>CPAB / BCG / HepaB — Child Care: Immunization</p>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Month</label>
            <select style={styles.select} value={month}
              onChange={e => setMonth(Number(e.target.value))}>
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Year</label>
            <select style={styles.select} value={year}
              onChange={e => setYear(Number(e.target.value))}>
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Province / LGU</label>
            <select style={styles.select} value={province}
              onChange={e => setProvince(e.target.value)}>
              {PROVINCES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <button
            style={loading ? styles.btnDisabled : styles.btn}
            onClick={() => fetchData(year, month)}
            disabled={loading}
          >
            {loading ? "Loading…" : "↺ Refresh"}
          </button>

          {lastLoaded && (
            <span style={styles.loadedLabel}>
              {lguCount} LGUs · {MONTHS.find(m => m.value === lastLoaded.month)?.label} {lastLoaded.year}
            </span>
          )}
        </div>

        {/* Error */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Loading skeleton */}
        {loading && (
          <div style={styles.loadingBox}>
            Loading data for {monthLabel} {year}…
          </div>
        )}

        {/* Table */}
        {!loading && visibleRows.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                {/* Row 1 — group labels */}
                <tr>
                  <th rowSpan={2} style={{ ...styles.th, ...styles.stickyTh, minWidth: "180px", textAlign: "left", verticalAlign: "middle" }}>
                    LGU / Municipality
                  </th>
                  {COL_GROUPS.map(g => (
                    <th
                      key={g.label}
                      colSpan={g.colspan}
                      rowSpan={g.colspan === 1 ? 2 : 1}
                      style={{
                        ...styles.th,
                        ...(g.colspan === 1 ? { verticalAlign: "middle" } : {}),
                        borderLeft: "2px solid #3B4F72",
                        letterSpacing: "0.4px",
                      }}
                    >
                      {g.label}
                    </th>
                  ))}
                </tr>
                {/* Row 2 — sub-labels (Male / Female / Total / %) */}
                <tr>
                  {COL_GROUPS.filter(g => g.colspan > 1).map(g =>
                    g.subLabels.map((sub, i) => (
                      <th
                        key={`${g.label}-${i}`}
                        style={{
                          ...styles.th,
                          fontSize: "10px",
                          fontWeight: "500",
                          backgroundColor: "#263450",
                          borderLeft: i === 0 ? "2px solid #3B4F72" : undefined,
                        }}
                      >
                        {sub}
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((row, index) => {
                  if (row.isHeader) {
                    const isHUC = !LOCATION_ORDER.find(
                      l => l.name === row.location && !l.isHeader
                    ) && row.location.includes("HUC");

                    return (
                      <tr key={row.location} style={styles.trHeader}>
                        <td style={{ ...styles.td, ...styles.stickyTd, ...styles.headerCell, textAlign: "left" }}>
                          {row.location}
                          {isHUC && <span style={styles.hucBadge}>HUC</span>}
                        </td>
                        {ALL_CODES.map((code, ci) => (
                          <td
                            key={code}
                            style={{
                              ...styles.td,
                              ...styles.headerCell,
                              borderLeft: COL_GROUPS.some(g => g.codes[0] === code && g.colspan > 1)
                                ? "2px solid #3B4F72" : undefined,
                            }}
                          >
                            {formatValue(row[code], code)}
                          </td>
                        ))}
                      </tr>
                    );
                  }

                  const isEmpty = row.isEmpty ||
                    ALL_CODES.every(c => row[c] == null);

                  return (
                    <tr
                      key={`${row.location}-${index}`}
                      style={isEmpty ? styles.trEmpty : (index % 2 === 0 ? styles.trEven : styles.trOdd)}
                    >
                      <td style={{ ...styles.td, ...styles.stickyTd, textAlign: "left", fontWeight: "500", color: isEmpty ? "#94A3B8" : "#1F2A45" }}>
                        {row.location}
                      </td>
                      {ALL_CODES.map((code, ci) => (
                        <td
                          key={code}
                          style={{
                            ...styles.td,
                            color: isEmpty ? "#94A3B8" : (code.endsWith("_PCT") ? styles.pctColor : "#1F2A45"),
                            borderLeft: COL_GROUPS.some(g => g.codes[0] === code && g.colspan > 1)
                              ? "2px solid #E2E8F0" : undefined,
                          }}
                        >
                          {formatValue(row[code], code)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && visibleRows.length === 0 && !error && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No data for {monthLabel} {year}</p>
            <p style={styles.emptySub}>
              Upload an Excel file via Management → Upload, then approve it in Staging Review.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F0F4F8",
    fontFamily: "'Barlow', sans-serif",
  },
  body: {
    marginLeft: "240px",
    padding: "28px 32px",
  },
  pageHeader: { marginBottom: "20px" },
  pageTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#1F2A45",
    margin: "0 0 4px 0",
  },
  pageSub: { fontSize: "13px", color: "#5A6A85", margin: 0 },

  filterRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  filterLabel: { fontSize: "12px", fontWeight: "600", color: "#1F2A45" },
  select: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    color: "#1F2A45",
    backgroundColor: "#ffffff",
    outline: "none",
  },
  btn: {
    padding: "8px 20px",
    backgroundColor: "#0B4BAA",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
    alignSelf: "flex-end",
  },
  btnDisabled: {
    padding: "8px 20px",
    backgroundColor: "#93B4DC",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "not-allowed",
    fontFamily: "'Montserrat', sans-serif",
    alignSelf: "flex-end",
  },
  loadedLabel: {
    fontSize: "12px",
    color: "#94A3B8",
    alignSelf: "flex-end",
    paddingBottom: "8px",
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  loadingBox: {
    textAlign: "center",
    padding: "64px",
    color: "#5A6A85",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
    fontSize: "12px",
  },

  // ── thead styles ──
  th: {
    padding: "9px 10px",
    backgroundColor: "#1F2A45",
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
    whiteSpace: "nowrap",
    fontSize: "11px",
    letterSpacing: "0.3px",
    borderBottom: "1px solid #3B4F72",
  },
  stickyTh: {
    position: "sticky",
    left: 0,
    zIndex: 20,
    backgroundColor: "#1F2A45",
    boxShadow: "2px 0 4px rgba(0,0,0,0.15)",
  },

  // ── tbody styles ──
  td: {
    padding: "7px 10px",
    textAlign: "center",
    borderRight: "1px solid #E2E8F0",
    borderBottom: "1px solid #E2E8F0",
    whiteSpace: "nowrap",
    color: "#1F2A45",
  },
  stickyTd: {
    position: "sticky",
    left: 0,
    zIndex: 10,
    backgroundColor: "inherit",
    boxShadow: "2px 0 4px rgba(0,0,0,0.06)",
    minWidth: "180px",
  },

  trEven: { backgroundColor: "#ffffff" },
  trOdd:  { backgroundColor: "#F8FAFC" },
  trEmpty:{ backgroundColor: "#FAFAFA" },

  trHeader: {
    backgroundColor: "#1F2A45",
  },
  headerCell: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: "12px",
    fontFamily: "'Montserrat', sans-serif",
    backgroundColor: "#1F2A45",
    padding: "9px 10px",
    borderBottom: "1px solid #3B4F72",
  },

  pctColor: "#1E40AF",

  hucBadge: {
    marginLeft: "8px",
    fontSize: "9px",
    fontWeight: "700",
    backgroundColor: "#6D28D9",
    color: "#ffffff",
    padding: "2px 6px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
    verticalAlign: "middle",
  },

  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "64px 48px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  emptyTitle: {
    fontSize: "15px",
    color: "#1F2A45",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
  emptySub: {
    fontSize: "13px",
    color: "#94A3B8",
    margin: 0,
  },
};
