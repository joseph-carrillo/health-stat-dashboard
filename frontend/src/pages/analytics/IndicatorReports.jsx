// frontend/src/pages/analytics/IndicatorReports.jsx
// Raw, row-level view of committed uploads rendered in the EXACT column
// order and grouped-header layout of the source FHSIS Excel file.
// Used to visually verify that uploaded data landed correctly.

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { getTemplates, getTemplateReport } from "../../services/api";
import { MONTHS, YEARS } from "../../services/constants";

const NIR_AREA_FILTERS = [
  { id: "all", label: "All NIR" },
  { id: "negros_occidental", label: "Negros Occidental", psgcPrefix: "18045" },
  { id: "negros_oriental", label: "Negros Oriental", psgcPrefix: "18046" },
  { id: "siquijor", label: "Siquijor", psgcPrefix: "18061" },
  { id: "bacolod_huc", label: "City of Bacolod (HUC)", psgcPrefix: "18302" },
];

const PROVINCE_HUC_PSGCS = new Set([
  "1804500000",
  "1804600000",
  "1806100000",
  "1830200000",
]);

function isProvinceHucRow(psgc) {
  return PROVINCE_HUC_PSGCS.has(String(psgc));
}

function filterRowsByArea(rows, areaId) {
  if (areaId === "all") return rows;
  const area = NIR_AREA_FILTERS.find((a) => a.id === areaId);
  if (!area?.psgcPrefix) return rows;
  return rows.filter((r) => String(r.psgc).startsWith(area.psgcPrefix));
}

// Group consecutive columns that share the same header group so we can render
// the two-row "merged header" face of the original Excel sheet.
function buildSegments(columns) {
  const segments = [];
  let i = 0;
  while (i < columns.length) {
    const col = columns[i];
    if (!col.group) {
      segments.push({ type: "single", col });
      i += 1;
    } else {
      const group = col.group;
      const cols = [];
      while (i < columns.length && columns[i].group === group) {
        cols.push(columns[i]);
        i += 1;
      }
      segments.push({ type: "group", label: group, cols });
    }
  }
  return segments;
}

function fmtValue(value, isPct) {
  if (value === null || value === undefined) return "—";
  if (isPct) return `${Number(value).toFixed(1)}%`;
  return Number(value).toLocaleString();
}

export default function IndicatorReports() {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [areaFilter, setAreaFilter] = useState("all");

  useEffect(() => {
    getTemplates()
      .then((res) => {
        const list = res.templates || [];
        setTemplates(list);
        if (list[0]) setTemplateId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!templateId) return;
    let active = true;
    setLoading(true);
    getTemplateReport(templateId, { year, month })
      .then((res) => active && setReport(res))
      .catch(() => active && setReport(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [templateId, year, month]);

  const columns = report?.columns || [];
  const idColumns = report?.id_columns || [];
  const rows = report?.rows || [];
  const filteredRows = useMemo(
    () => filterRowsByArea(rows, areaFilter),
    [rows, areaFilter]
  );
  const segments = useMemo(() => buildSegments(columns), [columns]);
  const areaLabel = NIR_AREA_FILTERS.find((a) => a.id === areaFilter)?.label;
  const periodLabel = MONTHS.find((m) => m.value === month)?.label;
  const totalCols = idColumns.length + columns.length;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <h1 style={styles.title}>Indicator Reports</h1>
        <p style={styles.subtitle}>
          Raw uploaded values in the same layout as the source Excel file. Use
          this to visually verify that data was ingested correctly. Tinted
          columns are computed (totals and percentages) — not raw entries.
        </p>

        <div style={styles.filterBar}>
          <select
            style={{ ...styles.select, minWidth: "320px" }}
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <select style={styles.select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select style={styles.select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            style={{ ...styles.select, minWidth: "220px" }}
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            {NIR_AREA_FILTERS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          {loading && <span style={styles.loadingTag}>Loading...</span>}
        </div>

        <div style={styles.metaRow}>
          <span style={styles.metaItem}>
            <strong>{filteredRows.length}</strong> row{filteredRows.length === 1 ? "" : "s"}
            {areaFilter !== "all" && rows.length !== filteredRows.length && (
              <> (of <strong>{rows.length}</strong> total)</>
            )}
          </span>
          {areaFilter !== "all" && (
            <span style={styles.metaItem}>
              Area: <strong>{areaLabel}</strong>
            </span>
          )}
          <span style={styles.metaItem}>
            <strong>{columns.length}</strong> data column{columns.length === 1 ? "" : "s"}
          </span>
          <span style={styles.metaItem}>
            Period: <strong>{periodLabel} {year}</strong>
          </span>
          {report?.program_code && (
            <span style={styles.metaItem}>
              Program: <strong>{report.program_code}</strong>
            </span>
          )}
        </div>

        <div style={styles.section}>
          {loading ? (
            <p style={styles.loadingTag}>Loading...</p>
          ) : columns.length === 0 ? (
            <p style={styles.empty}>No column layout found for this template.</p>
          ) : rows.length === 0 ? (
            <p style={styles.empty}>
              No data uploaded for {periodLabel} {year} in this template.
            </p>
          ) : filteredRows.length === 0 ? (
            <p style={styles.empty}>
              No rows for {areaLabel} in {periodLabel} {year}.
            </p>
          ) : (
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {idColumns.map((c) => (
                      <th key={c.key} rowSpan={2} style={styles.thId}>
                        {c.label}
                      </th>
                    ))}
                    {segments.map((seg, idx) =>
                      seg.type === "single" ? (
                        <th
                          key={`s-${idx}`}
                          rowSpan={2}
                          style={{ ...styles.thCol, ...(seg.col.is_computed ? styles.thComputed : {}), ...styles.groupStart }}
                        >
                          {seg.col.name}
                        </th>
                      ) : (
                        <th
                          key={`g-${idx}`}
                          colSpan={seg.cols.length}
                          style={{ ...styles.thGroup, ...styles.groupStart }}
                        >
                          {seg.label}
                        </th>
                      )
                    )}
                  </tr>
                  <tr>
                    {segments.map((seg, idx) =>
                      seg.type === "group"
                        ? seg.cols.map((c, j) => (
                            <th
                              key={`gs-${idx}-${c.indicator_code}`}
                              title={c.name}
                              style={{
                                ...styles.thSub,
                                ...(c.is_computed ? styles.thComputed : {}),
                                ...(j === 0 ? styles.groupStart : {}),
                              }}
                            >
                              {c.sub}
                            </th>
                          ))
                        : null
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, ri) => {
                    const highlighted = isProvinceHucRow(r.psgc);
                    const rowStyle = highlighted
                      ? styles.trProvinceHuc
                      : ri % 2
                        ? styles.trAlt
                        : styles.tr;
                    const idCellStyle = highlighted
                      ? styles.tdIdProvinceHuc
                      : styles.tdId;
                    return (
                    <tr key={r.psgc} style={rowStyle}>
                      {idColumns.map((c) => (
                        <td key={c.key} style={idCellStyle}>
                          {r[c.key]}
                        </td>
                      ))}
                      {columns.map((c, ci) => {
                        const v = r.values?.[c.indicator_code];
                        const firstOfGroup =
                          ci === 0 || columns[ci - 1].group !== c.group || !c.group;
                        return (
                          <td
                            key={c.indicator_code}
                            style={{
                              ...styles.tdNum,
                              ...(c.is_computed ? styles.tdComputed : {}),
                              ...(firstOfGroup ? styles.groupStart : {}),
                            }}
                          >
                            {v === undefined || v === null ? (
                              <span style={styles.missing}>—</span>
                            ) : (
                              fmtValue(v, c.is_percentage)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={styles.legend}>
          Layout mirrors the source Excel file: {totalCols} columns total. A dash
          (—) means no value was uploaded for that location. Province and HUC
          summary rows are highlighted in blue. Use the area filter to show one
          province (or Bacolod HUC) and its LGUs only.
        </p>
      </div>
    </div>
  );
}

const COMPUTED_TINT = "#F2F6FF";

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "24px 32px", marginLeft: "240px" },
  title: { fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#5A6A85", margin: "0 0 20px 0", maxWidth: "720px" },
  filterBar: { display: "flex", gap: "10px", marginBottom: "14px", alignItems: "center", flexWrap: "wrap" },
  select: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#1F2A45", backgroundColor: "#fff", outline: "none", minWidth: "120px" },
  loadingTag: { fontSize: "12px", color: "#5A6A85" },
  metaRow: { display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px" },
  metaItem: { fontSize: "12px", color: "#5A6A85" },
  section: { backgroundColor: "#fff", borderRadius: "10px", padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  empty: { fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "20px 0" },
  tableScroll: { overflowX: "auto" },
  table: { borderCollapse: "collapse", fontSize: "12px", whiteSpace: "nowrap" },
  thId: { position: "sticky", left: 0, backgroundColor: "#1F2A45", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "8px 12px", textAlign: "left", verticalAlign: "bottom", borderRight: "1px solid #2D3B5C" },
  thGroup: { backgroundColor: "#0B4BAA", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "6px 10px", textAlign: "center", borderBottom: "1px solid #fff" },
  thCol: { backgroundColor: "#1F2A45", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "8px 10px", textAlign: "right", verticalAlign: "bottom", maxWidth: "120px", whiteSpace: "normal" },
  thSub: { backgroundColor: "#34406A", color: "#fff", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.3px", padding: "6px 10px", textAlign: "right" },
  thComputed: { backgroundColor: "#3A5B9E" },
  tr: { backgroundColor: "#fff" },
  trAlt: { backgroundColor: "#F8FAFC" },
  trProvinceHuc: { backgroundColor: "#E8F0FE" },
  tdId: { position: "sticky", left: 0, backgroundColor: "inherit", padding: "7px 12px", fontSize: "12px", color: "#1F2A45", fontWeight: "600", borderRight: "1px solid #E2E8F0", borderBottom: "1px solid #F0F4F8" },
  tdIdProvinceHuc: { position: "sticky", left: 0, backgroundColor: "#E8F0FE", padding: "7px 12px", fontSize: "12px", color: "#0B4BAA", fontWeight: "700", borderRight: "1px solid #CBD5E1", borderBottom: "1px solid #D6E4FF", borderLeft: "3px solid #0B4BAA" },
  tdNum: { padding: "7px 10px", fontSize: "12px", color: "#1F2A45", textAlign: "right", borderBottom: "1px solid #F0F4F8" },
  tdComputed: { backgroundColor: COMPUTED_TINT },
  groupStart: { borderLeft: "2px solid #CBD5E1" },
  missing: { color: "#CBD5E1" },
  legend: { fontSize: "11px", color: "#94A3B8", marginTop: "12px" },
};
