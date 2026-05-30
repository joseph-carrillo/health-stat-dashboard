// frontend/src/pages/DataAvailability.jsx
// Matrix of which LGUs submitted data per month for a program.

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { can } from "../services/auth";
import { getDataAvailability, getPrograms } from "../services/api";
import { YEARS } from "../services/constants";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DataAvailability() {
  const canViewAll = can("can_view_all");
  const [programs, setPrograms] = useState([]);
  const [programCode, setProgramCode] = useState("CHILD_CARE");
  const [year, setYear] = useState(2026);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (canViewAll) {
      getPrograms().then((res) => setPrograms(res.programs || [])).catch(() => {});
    }
  }, [canViewAll]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDataAvailability({ program_code: programCode, year })
      .then((res) => active && setData(res))
      .catch(() => active && setData(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [programCode, year]);

  const rows = data?.rows || [];
  const totalLgus = rows.length;
  const fullyReported = rows.filter((r) => r.submitted_count === 12).length;
  const noData = rows.filter((r) => r.submitted_count === 0).length;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <h1 style={styles.title}>Data Availability</h1>
        <p style={styles.subtitle}>
          Which LGUs submitted data each month. Spot the gaps quickly.
        </p>

        <div style={styles.filterBar}>
          {canViewAll && (
            <select style={styles.select} value={programCode} onChange={(e) => setProgramCode(e.target.value)}>
              {programs.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          )}
          <select style={styles.select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {loading && <span style={styles.loadingTag}>Loading...</span>}
        </div>

        <div style={styles.statRow}>
          <Stat label="Total LGUs" value={totalLgus} />
          <Stat label="Fully Reported (12/12)" value={fullyReported} color="#16A34A" />
          <Stat label="No Data" value={noData} color="#DC2626" />
        </div>

        <div style={styles.section}>
          {rows.length === 0 ? (
            <p style={styles.empty}>No LGUs found.</p>
          ) : (
            <div style={styles.scrollX}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thLeft}>LGU</th>
                    {MONTH_LABELS.map((m) => (
                      <th key={m} style={styles.thMonth}>{m}</th>
                    ))}
                    <th style={styles.thMonth}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.psgc} style={styles.tr}>
                      <td style={styles.tdLeft}>{r.location}</td>
                      {MONTH_LABELS.map((_, i) => {
                        const has = r.months[String(i + 1)];
                        return (
                          <td key={i} style={styles.tdCell}>
                            <span style={{ ...styles.dot, backgroundColor: has ? "#16A34A" : "#E2E8F0" }} />
                          </td>
                        );
                      })}
                      <td style={styles.tdTotal}>{r.submitted_count}/12</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  select: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#1F2A45", backgroundColor: "#fff", outline: "none", minWidth: "200px" },
  loadingTag: { fontSize: "12px", color: "#5A6A85" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" },
  stat: { backgroundColor: "#fff", borderRadius: "10px", padding: "18px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  statLabel: { fontSize: "11px", color: "#5A6A85", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  statValue: { fontSize: "26px", fontWeight: "700", margin: 0, fontFamily: "'Montserrat', sans-serif" },
  section: { backgroundColor: "#fff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  empty: { fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "40px 0" },
  scrollX: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thLeft: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #F0F4F8", position: "sticky", left: 0, backgroundColor: "#fff" },
  thMonth: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", padding: "8px 6px", textAlign: "center", borderBottom: "2px solid #F0F4F8" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  tdLeft: { padding: "8px 12px", fontSize: "13px", color: "#1F2A45", whiteSpace: "nowrap", position: "sticky", left: 0, backgroundColor: "#fff" },
  tdCell: { padding: "8px 6px", textAlign: "center" },
  tdTotal: { padding: "8px 10px", fontSize: "12px", fontWeight: "700", color: "#1F2A45", textAlign: "center" },
  dot: { display: "inline-block", width: "12px", height: "12px", borderRadius: "50%" },
};
