// frontend/src/pages/Targets.jsx
// View official program targets per indicator. Admins can edit targets.

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { can } from "../services/auth";
import { getIndicators, getPrograms, setIndicatorTarget } from "../services/api";

export default function Targets() {
  const isAdmin = can("can_manage_users");
  const [programs, setPrograms] = useState([]);
  const [programCode, setProgramCode] = useState("");
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState({});
  const [info, setInfo] = useState("");

  useEffect(() => {
    getPrograms().then((res) => setPrograms(res.programs || [])).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    getIndicators(programCode || undefined)
      .then((res) => setIndicators(res.indicators || []))
      .catch(() => setIndicators([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programCode]);

  async function saveTarget(ind) {
    const raw = edit[ind.id];
    if (raw === undefined || raw === "") return;
    try {
      await setIndicatorTarget(ind.id, Number(raw), ind.target_year || 2026);
      setInfo(`Saved target for ${ind.code}.`);
      setEdit((e) => ({ ...e, [ind.id]: undefined }));
      load();
    } catch {
      setInfo(`Could not save target for ${ind.code}.`);
    }
  }

  const targeted = indicators.filter((i) => i.target_value !== null);

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <h1 style={styles.title}>Program Targets</h1>
        <p style={styles.subtitle}>
          Official targets per indicator. {isAdmin ? "Edit and save below." : "Read-only."}
        </p>

        <div style={styles.filterBar}>
          <select style={styles.select} value={programCode} onChange={(e) => setProgramCode(e.target.value)}>
            <option value="">All programs</option>
            {programs.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          {loading && <span style={styles.loadingTag}>Loading...</span>}
        </div>

        {info && <p style={styles.info}>{info}</p>}

        <div style={styles.section}>
          <p style={styles.note}>{targeted.length} indicator(s) currently have a target set.</p>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Indicator</th>
                <th style={styles.th}>Program</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Target</th>
                <th style={styles.th}>Year</th>
                {isAdmin && <th style={styles.th}>Edit</th>}
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind) => (
                <tr key={ind.id} style={styles.tr}>
                  <td style={styles.td}>{ind.name}</td>
                  <td style={styles.td}>{ind.program_name}</td>
                  <td style={styles.td}>{ind.formula_type}</td>
                  <td style={styles.td}>
                    {ind.target_value !== null ? ind.target_value : "—"}
                  </td>
                  <td style={styles.td}>{ind.target_year || "—"}</td>
                  {isAdmin && (
                    <td style={styles.td}>
                      <div style={styles.editRow}>
                        <input
                          style={styles.editInput}
                          type="number"
                          step="0.01"
                          placeholder={ind.target_value ?? "set"}
                          value={edit[ind.id] ?? ""}
                          onChange={(e) => setEdit((s) => ({ ...s, [ind.id]: e.target.value }))}
                        />
                        <button style={styles.saveBtn} onClick={() => saveTarget(ind)}>
                          Save
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {indicators.length === 0 && !loading && (
                <tr>
                  <td style={styles.td} colSpan={isAdmin ? 6 : 5}>No indicators found.</td>
                </tr>
              )}
            </tbody>
          </table>
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
  filterBar: { display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" },
  select: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#1F2A45", backgroundColor: "#fff", outline: "none", minWidth: "200px" },
  loadingTag: { fontSize: "12px", color: "#5A6A85" },
  info: { backgroundColor: "#DBEAFE", color: "#1E40AF", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" },
  section: { backgroundColor: "#fff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  note: { fontSize: "12px", color: "#5A6A85", margin: "0 0 12px 0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #F0F4F8" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  td: { padding: "9px 12px", fontSize: "13px", color: "#1F2A45" },
  editRow: { display: "flex", gap: "6px", alignItems: "center" },
  editInput: { width: "80px", padding: "5px 8px", borderRadius: "5px", border: "1px solid #CBD5E1", fontSize: "12px" },
  saveBtn: { padding: "5px 12px", backgroundColor: "#0B4BAA", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
};
