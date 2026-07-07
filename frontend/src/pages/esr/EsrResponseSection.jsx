// EsrResponseSection.jsx — IV. RESPONSE

import EsrCheckbox from "./EsrCheckbox";
import { esrStyles } from "./esrStyles";

const RESPONSE_CATEGORIES = [
  "Case management",
  "Laboratory confirmation",
  "Field/Epidemiologic investigation*",
  "Program management/counter measures",
  "Health education and promotion",
  "Response coordination mechanism",
  "Others",
];

const STATUS_OPTIONS = ["pending", "ongoing", "done"];

const ESU_LEVELS = [
  { key: "mesu", label: "MESU" },
  { key: "cesu", label: "CESU" },
  { key: "pesu", label: "PESU" },
  { key: "resu", label: "RESU" },
  { key: "eb", label: "EB" },
];

export default function EsrResponseSection({ value, onChange, esuLevel, onEsuLevelChange }) {
  const updateRow = (idx, patch) => {
    const rows = [...value];
    rows[idx] = { ...rows[idx], ...patch };
    onChange(rows);
  };

  return (
    <section style={esrStyles.card}>
      <h2 style={esrStyles.sectionHeading}>IV. RESPONSE</h2>
      <table style={esrStyles.table}>
        <thead>
          <tr>
            <th style={esrStyles.th}>Response</th>
            <th style={esrStyles.th}>Office/Agency</th>
            <th style={esrStyles.th}>Specific Actions taken/Planned activities</th>
            <th style={esrStyles.th}>Date started</th>
            <th style={esrStyles.th}>Status (pending/ongoing/done)</th>
          </tr>
        </thead>
        <tbody>
          {RESPONSE_CATEGORIES.map((category, idx) => (
            <tr key={category}>
              <td style={esrStyles.tdText}>{idx + 1}. {category}</td>
              <td style={esrStyles.td}>
                <input style={esrStyles.cellInput} value={value[idx]?.officeAgency || ""} onChange={(e) => updateRow(idx, { category, officeAgency: e.target.value })} />
              </td>
              <td style={esrStyles.td}>
                <input style={esrStyles.cellInput} value={value[idx]?.actions || ""} onChange={(e) => updateRow(idx, { category, actions: e.target.value })} />
              </td>
              <td style={esrStyles.td}>
                <input type="date" style={esrStyles.cellInput} value={value[idx]?.dateStarted || ""} onChange={(e) => updateRow(idx, { category, dateStarted: e.target.value })} />
              </td>
              <td style={{ ...esrStyles.td, padding: "8px 10px" }}>
                <select
                  style={esrStyles.select}
                  value={value[idx]?.status || ""}
                  onChange={(e) => updateRow(idx, { category, status: e.target.value })}
                >
                  <option value="">Select…</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={esrStyles.addRowHint}>..add rows as needed</div>
      <div style={{ marginTop: "20px" }}>
        <div style={{ fontSize: "13px", color: "#4a5568", marginBottom: "12px" }}>
          *Level of ESU who conducted epidemiologic investigation <span style={{ color: "#8a94a3" }}>(select all that applies)</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "26px" }}>
          {ESU_LEVELS.map(({ key, label }) => (
            <EsrCheckbox key={key} label={label} checked={esuLevel[key]} onChange={(c) => onEsuLevelChange({ ...esuLevel, [key]: c })} />
          ))}
        </div>
      </div>
    </section>
  );
}
