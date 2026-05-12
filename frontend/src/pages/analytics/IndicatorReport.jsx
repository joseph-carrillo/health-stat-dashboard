// frontend/src/pages/analytics/IndicatorReport.jsx
// Shows health data in a human-readable table format
// Same column layout as the Excel file

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

// Decode JWT token to get user info
function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

// Fixed location order matching the Excel file
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
  { name: "City of Bacolod (HUC)", isHeader: true },
];
const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// CPAB/BCG/HepaB indicators in the correct column order
// This matches the Excel file column layout
const CPAB_INDICATORS = [
  { code: "IMMUN_POP",        label: "Target Pop." },
  { code: "CPAB_MALE",        label: "CPAB Male" },
  { code: "CPAB_FEMALE",      label: "CPAB Female" },
  { code: "CPAB_TOTAL",       label: "CPAB Total" },
  { code: "CPAB_PCT",         label: "CPAB %" },
  { code: "BCG_24H_MALE",     label: "BCG 24H Male" },
  { code: "BCG_24H_FEMALE",   label: "BCG 24H Female" },
  { code: "BCG_24H_TOTAL",    label: "BCG 24H Total" },
  { code: "BCG_24H_PCT",      label: "BCG 24H %" },
  { code: "BCG_GT24H_MALE",   label: "BCG >24H Male" },
  { code: "BCG_GT24H_FEMALE", label: "BCG >24H Female" },
  { code: "BCG_GT24H_TOTAL",  label: "BCG >24H Total" },
  { code: "BCG_GT24H_PCT",    label: "BCG >24H %" },
  { code: "HEPAB_24H_MALE",   label: "HepaB 24H Male" },
  { code: "HEPAB_24H_FEMALE", label: "HepaB 24H Female" },
  { code: "HEPAB_24H_TOTAL",  label: "HepaB 24H Total" },
  { code: "HEPAB_24H_PCT",    label: "HepaB 24H %" },
  { code: "HEPAB_GT24H_MALE",   label: "HepaB >24H Male" },
  { code: "HEPAB_GT24H_FEMALE", label: "HepaB >24H Female" },
  { code: "HEPAB_GT24H_TOTAL",  label: "HepaB >24H Total" },
  { code: "HEPAB_GT24H_PCT",    label: "HepaB >24H %" },
];

export default function IndicatorReport() {
  const user = getUser();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState([]);

  const token = localStorage.getItem("token");

  async function fetchData() {
    setLoading(true);
    setError("");
    setTableData([]);

    try {
      const response = await fetch(
        `/api/health-data?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to load data.");
        setLoading(false);
        return;
      }

      // Transform flat list into LGU-keyed object
      // Each LGU gets one row with all indicators as columns
      const lguMap = {};

      data.data.forEach((row) => {
        const name = row.location.trim();
        if (
          name.toLowerCase().includes("barangay") ||
          name.toLowerCase().includes("poblacion") ||
          name.toLowerCase().includes("zone") ||
          name.toLowerCase().includes("purok")
        ) return;

        const lgu = row.location.trim();
        if (!lguMap[lgu]) {
          lguMap[lgu] = { location: lgu, psgc: row.psgc };
        }
        lguMap[lgu][row.indicator_code] = row.value;
      });

      // Sort by fixed location order
      const rows = LOCATION_ORDER.map(item => {
        if (item.isHeader) {
          return { location: item.name, isHeader: true };
        }
        return lguMap[item.name.trim()] || { location: item.name, isHeader: false, isEmpty: true };
      });

      setTableData(rows);

    } catch {
      setError("Cannot connect to server. Is the API running?");
    }

    setLoading(false);
  }

  // Load data on first render
  useEffect(() => {
    fetchData();
  }, []);

  function formatValue(value, code) {
    if (value === null || value === undefined) return "-";
    if (code.endsWith("_PCT")) {
      return (value * 100).toFixed(1) + "%";
    }
    return Number(value).toLocaleString();
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Indicator Report</h1>
            <p style={styles.pageSub}>
              CPAB / BCG / HepaB — Child Care: Immunization
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Month</label>
            <select
              style={styles.select}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Year</label>
            <select
              style={styles.select}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button style={styles.btn} onClick={fetchData} disabled={loading}>
            {loading ? "Loading..." : "Load Data"}
          </button>

          {tableData.length > 0 && (
            <span style={styles.rowCount}>
              {tableData.length} LGUs
            </span>
          )}
        </div>

        {/* Error */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Loading */}
        {loading && (
          <div style={styles.loadingBox}>
            Loading data...
          </div>
        )}

        {/* Table */}
        {!loading && tableData.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, ...styles.stickyCol }}>
                    LGU / Municipality
                  </th>
                  {CPAB_INDICATORS.map((ind) => (
                    <th key={ind.code} style={styles.th}>
                      {ind.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => {
                  if (row.isHeader) {
                    return (
                      <tr key={row.location} style={styles.trHeader}>
                        <td
                          style={{ ...styles.td, ...styles.stickyCol, ...styles.headerCell }}
                          colSpan={CPAB_INDICATORS.length + 1}
                        >
                          {row.location}
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr
                      key={row.psgc || row.location}
                      style={index % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td style={{ ...styles.td, ...styles.stickyCol, fontWeight: "600" }}>
                        {row.location}
                      </td>
                      {CPAB_INDICATORS.map((ind) => (
                        <td
                          key={ind.code}
                          style={{
                            ...styles.td,
                            color: ind.code.endsWith("_PCT") ? "#0B4BAA" : "#1F2A45",
                            fontWeight: ind.code.endsWith("_PCT") ? "600" : "400",
                          }}
                        >
                          {formatValue(row[ind.code], ind.code)}
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
        {!loading && tableData.length === 0 && !error && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>No data found for this period.</p>
            <p style={styles.emptySub}>
              Upload data first using the Management → Upload tab.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

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
  pageHeader: {
    marginBottom: "20px",
  },
  pageTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#1F2A45",
    margin: "0 0 4px 0",
  },
  pageSub: {
    fontSize: "13px",
    color: "#5A6A85",
    margin: 0,
  },
  filterRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1F2A45",
  },
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
  },
  rowCount: {
    fontSize: "13px",
    color: "#5A6A85",
    fontWeight: "600",
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
    padding: "48px",
    color: "#5A6A85",
    fontSize: "14px",
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
    fontSize: "13px",
  },
  th: {
    padding: "10px 12px",
    backgroundColor: "#1F2A45",
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
    whiteSpace: "nowrap",
    fontSize: "11px",
    letterSpacing: "0.3px",
    borderRight: "1px solid #2D3B5C",
  },
  stickyCol: {
    position: "sticky",
    left: 0,
    zIndex: 10,
    minWidth: "160px",
    textAlign: "left",
    backgroundColor: "#ffffff",
    boxShadow: "2px 0 4px rgba(0,0,0,0.08)",
  },
  td: {
    padding: "8px 12px",
    textAlign: "center",
    borderRight: "1px solid #E2E8F0",
    borderBottom: "1px solid #E2E8F0",
    whiteSpace: "nowrap",
  },
  trEven: {
    backgroundColor: "#ffffff",
  },
  trOdd: {
    backgroundColor: "#F8FAFC",
  },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "48px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  emptyText: {
    fontSize: "15px",
    color: "#1F2A45",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
  emptySub: {
    fontSize: "13px",
    color: "#5A6A85",
    margin: 0,
  },
  emptySub: {
    fontSize: "13px",
    color: "#94A3B8",
    margin: 0,
  },
  trHeader: {
    backgroundColor: "#1F2A45",
  },
  headerCell: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: "13px",
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "0.5px",
    backgroundColor: "#1F2A45",
    padding: "10px 12px",
  },
};