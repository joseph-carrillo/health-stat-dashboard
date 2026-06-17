// frontend/src/pages/analytics/IndicatorReports.jsx
// Raw, row-level view of committed uploads rendered in the EXACT column
// order and grouped-header layout of the source FHSIS Excel file.
// Used to visually verify that uploaded data landed correctly.

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { getUploadCatalog, getTemplateReport } from "../../services/api";
import { MONTHS, YEARS, QUARTERS } from "../../services/constants";
import {
  REPORT_TEMPLATES,
  computeSubtotal,
} from "../../config/indicatorReportTemplates";
import {
  findCatalogProgram,
  findCatalogSubProgram,
  sortTemplatesByFhsisFile,
} from "../../config/uploadPrograms";

const VIEW_PERIOD_TYPES = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "annual", label: "Annual" },
];

/** Monthly templates can be viewed as M/Q/Y; others lock to their upload frequency. */
function viewPeriodOptionsForTemplate(template) {
  const freq = template?.frequency || "monthly";
  if (freq === "monthly") return VIEW_PERIOD_TYPES;
  if (freq === "quarterly") {
    return VIEW_PERIOD_TYPES.filter((p) => p.id !== "monthly");
  }
  if (freq === "annual") {
    return VIEW_PERIOD_TYPES.filter((p) => p.id === "annual");
  }
  return VIEW_PERIOD_TYPES;
}

// Indicator Reports red-cell DQC — only templates with display.dqc_highlight.
// Fallback rules until API returns dqc_rules (e.g. before backend restart).
const TEMPLATE_DQC_RULES_FALLBACK = {
  sick_diarrhea_pneumonia: [
    {
      rule_type: "over_threshold",
      indicator_code: "DIAR_ORS_PCT",
      threshold: 1.0,
      numerator_code: "DIAR_ORS_TOTAL",
      denominator_code: "DIAR_SEEN_TOTAL",
      message: "ORS given exceeds diarrhea cases seen (over 100%)",
      hint: "More ORS recipients than children seen for diarrhea. Verify the source file — likely a transcription error or a denominator (cases seen) that is too low.",
    },
    {
      rule_type: "over_threshold",
      indicator_code: "DIAR_ORSZ_PCT",
      threshold: 1.0,
      numerator_code: "DIAR_ORSZ_TOTAL",
      denominator_code: "DIAR_SEEN_TOTAL",
      message: "ORS+Zinc given exceeds diarrhea cases seen (over 100%)",
      hint: "More ORS+Zinc recipients than children seen for diarrhea. Verify the source file — likely a transcription error or a denominator (cases seen) that is too low.",
    },
    {
      rule_type: "over_threshold",
      indicator_code: "DIAR_COMBINED_PCT",
      threshold: 1.0,
      numerator_code: "DIAR_COMBINED_TOTAL",
      denominator_code: "DIAR_SEEN_TOTAL",
      message: "Combined treatment exceeds diarrhea cases seen (over 100%)",
      hint: "Each child seen is recorded under ORS or ORS+Zinc — not both — so combined treated should never exceed cases seen. Over 100% means a value is wrong: check the source file (cases seen entered too low, or an ORS / ORS+Zinc count too high) and re-upload.",
    },
    {
      rule_type: "over_threshold",
      indicator_code: "PNEU_ABX_PCT",
      threshold: 1.0,
      numerator_code: "PNEU_ABX_TOTAL",
      denominator_code: "PNEU_SEEN_TOTAL",
      message: "Antibiotics given exceed pneumonia cases seen (over 100%)",
      hint: "More antibiotic courses than children seen for pneumonia. Verify the source file — likely a transcription error or a denominator (cases seen) that is too low.",
    },
  ],
};

function viewPeriodLabel(viewType, periodValue) {
  if (viewType === "annual") return "Annual";
  if (viewType === "quarterly") {
    return QUARTERS.find((q) => q.value === periodValue)?.label ?? `Q${periodValue}`;
  }
  return MONTHS.find((m) => m.value === periodValue)?.label ?? `Month ${periodValue}`;
}

const NIR_AREA_FILTERS = [
  { id: "all", label: "All NIR" },
  { id: "negros_occidental", label: "Negros Occidental", psgcPrefix: "18045" },
  { id: "negros_oriental", label: "Negros Oriental", psgcPrefix: "18046" },
  { id: "siquijor", label: "Siquijor", psgcPrefix: "18061" },
  { id: "bacolod_huc", label: "City of Bacolod (HUC)", psgcPrefix: "18302" },
];

const NIR_REGION_PSGC = "1800000000";

const PROVINCE_HUC_PSGCS = new Set([
  "1804500000",
  "1804600000",
  "1806100000",
  "1830200000",
]);

function isNirRegionRow(psgc) {
  return String(psgc) === NIR_REGION_PSGC;
}

function isProvinceHucRow(psgc) {
  return PROVINCE_HUC_PSGCS.has(String(psgc));
}

function filterRowsByArea(rows, areaId) {
  if (areaId === "all") return rows;
  const area = NIR_AREA_FILTERS.find((a) => a.id === areaId);
  if (!area?.psgcPrefix) return rows;
  return rows.filter((r) => String(r.psgc).startsWith(area.psgcPrefix));
}

function zeroDivisionResult(formula, rowValues) {
  if (!formula.includes("/")) return null;
  const [numCode, denCode] = formula.split("/").map((s) => s.trim());
  const num = rowValues[numCode];
  const den = rowValues[denCode];
  if (num != null && den != null && Number(den) === 0 && Number(num) === 0) {
    return 0;
  }
  return null;
}

function computeValueFromFormula(formula, rowValues) {
  if (!formula) return null;
  try {
    let expression = formula;
    const codes = Object.keys(rowValues).sort((a, b) => b.length - a.length);
    for (const code of codes) {
      if (!expression.includes(code)) continue;
      const value = rowValues[code];
      if (value == null) return null;
      expression = expression.split(code).join(String(value));
    }
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expression})`)();
    if (!Number.isFinite(result)) {
      return zeroDivisionResult(formula, rowValues);
    }
    return result;
  } catch {
    return zeroDivisionResult(formula, rowValues);
  }
}

function recomputeRowValues(values, columns) {
  for (const col of columns) {
    if (!col.is_computed || !col.formula) continue;
    values[col.indicator_code] = computeValueFromFormula(
      col.formula,
      values
    );
  }
}

/** Sum province/HUC rows (or all LGUs) and apply template formulas — works for any upload config. */
function computeSubtotalFromColumns(lgus, columns) {
  const totals = {};
  for (const col of columns) {
    if (col.is_computed) continue;
    totals[col.indicator_code] = lgus.reduce((acc, lgu) => {
      const v = lgu[col.indicator_code];
      return acc + (v != null ? Number(v) : 0);
    }, 0);
  }
  recomputeRowValues(totals, columns);
  return totals;
}

// Pin NIR regional total on top. Uses uploaded row when present; otherwise
// sums the 3 provinces + Bacolod HUC (matches Excel regional rollup).
function synthesizeNirRow(allRows, columns, templateId) {
  const template = REPORT_TEMPLATES[templateId];

  let parts = allRows.filter((r) => isProvinceHucRow(r.psgc));
  if (parts.length === 0) {
    parts = allRows.filter(
      (r) => !isNirRegionRow(r.psgc) && !isProvinceHucRow(r.psgc)
    );
  }
  if (parts.length === 0) return null;

  const lgus = parts.map((r) => ({ ...(r.values || {}) }));
  const totals = template
    ? computeSubtotal(lgus, template)
    : computeSubtotalFromColumns(lgus, columns);

  const values = {};
  for (const col of columns) {
    let v = totals[col.indicator_code];
    if (v == null) {
      values[col.indicator_code] = null;
      continue;
    }
    values[col.indicator_code] = v;
  }

  return {
    psgc: NIR_REGION_PSGC,
    location: "NIR",
    values,
    isCalculated: true,
  };
}

function prepareDisplayRows(allRows, areaId, columns, templateId) {
  let nirSource = allRows.find((r) => isNirRegionRow(r.psgc));
  if (!nirSource) {
    nirSource = synthesizeNirRow(allRows, columns, templateId);
  }
  const bodyRows = filterRowsByArea(
    allRows.filter((r) => !isNirRegionRow(r.psgc)),
    areaId
  );
  if (!nirSource) return bodyRows;
  const nirRow = {
    ...nirSource,
    psgc: NIR_REGION_PSGC,
    location: nirSource.isCalculated ? "NIR (calculated)" : "NIR",
  };
  return [nirRow, ...bodyRows];
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

function isPctColumn(col) {
  return col.is_percentage || String(col.indicator_code || "").endsWith("_PCT");
}

// DB/parser store coverage as ratios (0.5 = 50%). API may also return 0–100.
function toDisplayPercent(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  if (n >= 0 && n <= 1.5) return n * 100;
  return n;
}

function fmtValue(value, isPct) {
  if (value === null || value === undefined) return "—";
  if (isPct) {
    const pct = toDisplayPercent(value);
    return pct === null ? "—" : `${pct.toFixed(2)}%`;
  }
  return Number(value).toLocaleString();
}

// Returns null when a cell is clean, or a structured DQC issue when flagged.
// The `title` is a rich, multi-line tooltip that shows the actual numbers and a
// plain-language likely cause; the other fields feed the issues summary panel.
function dqcForCell(row, col, value, dqcRules = [], dqcHighlight = false) {
  if (!dqcHighlight) return null;

  const code = col.indicator_code;
  const rule = dqcRules.find(
    (r) => r.rule_type === "over_threshold" && r.indicator_code === code
  );

  // A cell is flagged if the backend tagged it, or the over_threshold rule fires.
  const apiMessage = row.dqc?.[code];
  const pct = toDisplayPercent(value);
  let flagged = Boolean(apiMessage);
  if (!flagged && rule && pct != null) {
    const threshold = rule.threshold ?? 1;
    const thresholdPct = threshold <= 1.5 ? threshold * 100 : threshold;
    flagged = pct > thresholdPct;
  }
  if (!flagged) return null;

  const baseMessage = rule?.message || apiMessage || "Value exceeds the allowed threshold";
  const hint = rule?.hint;

  // Pull the underlying count and denominator from the same row so we can show
  // the actual math (e.g. "79 treated > 74 seen").
  const numVal = rule?.numerator_code ? row.values?.[rule.numerator_code] : null;
  const denVal = rule?.denominator_code ? row.values?.[rule.denominator_code] : null;
  const hasMath = numVal != null && denVal != null;

  const pctText = pct != null ? `${pct.toFixed(1)}%` : "";
  const mathText = hasMath
    ? `${Number(numVal).toLocaleString()} vs ${Number(denVal).toLocaleString()} → ${pctText}`
    : pctText;

  const title = [baseMessage, mathText, hint].filter(Boolean).join("\n");

  return {
    code,
    label: col.name || col.sub || code,
    location: row.location || row.psgc || "",
    pctText,
    numCode: rule?.numerator_code,
    denCode: rule?.denominator_code,
    numVal,
    denVal,
    message: baseMessage,
    hint,
    title,
  };
}

export default function IndicatorReports() {
  const [catalog, setCatalog] = useState(null);
  const [programCode, setProgramCode] = useState("");
  const [subProgramName, setSubProgramName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [viewPeriodType, setViewPeriodType] = useState("monthly");
  const [periodValue, setPeriodValue] = useState(1);
  const [year, setYear] = useState(2026);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [areaFilter, setAreaFilter] = useState("all");
  const [reportSheet, setReportSheet] = useState("");

  const activeProgram = useMemo(
    () => findCatalogProgram(catalog, programCode),
    [catalog, programCode]
  );

  const subPrograms = useMemo(() => {
    return (activeProgram?.sub_programs || []).filter(
      (sp) => (sp.templates || []).length > 0
    );
  }, [activeProgram]);

  const activeSubProgram = useMemo(
    () => findCatalogSubProgram(activeProgram, subProgramName),
    [activeProgram, subProgramName]
  );

  const visibleTemplates = useMemo(() => {
    return sortTemplatesByFhsisFile(activeSubProgram?.templates || []);
  }, [activeSubProgram]);

  const activeTemplate = useMemo(
    () => visibleTemplates.find((t) => t.id === templateId),
    [visibleTemplates, templateId]
  );

  const viewPeriodOptions = useMemo(
    () => viewPeriodOptionsForTemplate(activeTemplate),
    [activeTemplate]
  );

  const reportSheets = useMemo(() => {
    return activeTemplate?.report_sheets?.length
      ? activeTemplate.report_sheets
      : report?.report_sheets || [];
  }, [activeTemplate, report?.report_sheets]);

  useEffect(() => {
    const next = reportSheets[0]?.id || "";
    setReportSheet(next);
  }, [templateId, reportSheets]);

  useEffect(() => {
    if (!viewPeriodOptions.length) return;
    if (!viewPeriodOptions.some((p) => p.id === viewPeriodType)) {
      setViewPeriodType(viewPeriodOptions[0].id);
      setPeriodValue(1);
    }
  }, [viewPeriodOptions, viewPeriodType]);

  useEffect(() => {
    getUploadCatalog()
      .then((data) => {
        setCatalog(data);
        const program = data.programs?.find((p) =>
          p.sub_programs?.some((sp) => (sp.templates || []).length > 0)
        );
        if (!program) return;
        const subProgram = program.sub_programs.find(
          (sp) => (sp.templates || []).length > 0
        );
        const template = subProgram?.templates?.[0];
        if (!template) return;
        setProgramCode(program.code);
        setSubProgramName(subProgram.name);
        setTemplateId(template.id);
        setViewPeriodType(template.frequency || "monthly");
        setPeriodValue(1);
      })
      .catch(() => {});
  }, []);

  function applyTemplateDefaults(template) {
    if (!template) return;
    setTemplateId(template.id);
    const opts = viewPeriodOptionsForTemplate(template);
    const freq = template.frequency || "monthly";
    const nextView = opts.some((o) => o.id === freq) ? freq : opts[0]?.id || "monthly";
    setViewPeriodType(nextView);
    setPeriodValue(1);
  }

  function handleProgramChange(nextCode) {
    const program = findCatalogProgram(catalog, nextCode);
    const subProgram = program?.sub_programs?.find(
      (sp) => (sp.templates || []).length > 0
    );
    const template = subProgram?.templates?.[0];
    setProgramCode(nextCode);
    setSubProgramName(subProgram?.name || "");
    if (template) applyTemplateDefaults(template);
  }

  function handleSubProgramChange(nextName) {
    const subProgram = findCatalogSubProgram(activeProgram, nextName);
    const sorted = sortTemplatesByFhsisFile(subProgram?.templates || []);
    setSubProgramName(nextName);
    if (sorted[0]) applyTemplateDefaults(sorted[0]);
  }

  function handleTemplateChange(nextId) {
    const next = visibleTemplates.find((t) => t.id === nextId);
    if (next) applyTemplateDefaults(next);
  }

  function handleViewPeriodTypeChange(nextType) {
    setViewPeriodType(nextType);
    setPeriodValue(1);
  }

  useEffect(() => {
    if (!templateId) return;
    let active = true;
    setLoading(true);
    getTemplateReport(templateId, {
      year,
      view_period_type: viewPeriodType,
      period_value: periodValue,
      ...(reportSheet ? { sheet_name: reportSheet } : {}),
    })
      .then((res) => active && setReport(res))
      .catch(() => active && setReport(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [templateId, year, viewPeriodType, periodValue, reportSheet]);

  const columns = report?.columns || [];
  const idColumns = report?.id_columns || [];
  const rows = report?.rows || [];
  const filteredRows = useMemo(
    () => prepareDisplayRows(rows, areaFilter, columns, templateId),
    [rows, areaFilter, columns, templateId]
  );
  const segments = useMemo(() => buildSegments(columns), [columns]);
  const areaLabel = NIR_AREA_FILTERS.find((a) => a.id === areaFilter)?.label;
  // Only templates with display.dqc_highlight in config (diarrhea/pneumonia for now).
  const dqcHighlight =
    report?.dqc_highlight === true ||
    (report?.dqc_highlight === undefined &&
      templateId === "sick_diarrhea_pneumonia");
  const dqcRules =
    report?.dqc_rules?.length > 0
      ? report.dqc_rules
      : TEMPLATE_DQC_RULES_FALLBACK[templateId] || [];
  const dqcIssues = useMemo(() => {
    if (!dqcHighlight) return [];
    const issues = [];
    for (const r of filteredRows) {
      for (const c of columns) {
        const v = r.values?.[c.indicator_code];
        const issue = dqcForCell(r, c, v, dqcRules, dqcHighlight);
        if (issue) issues.push(issue);
      }
    }
    return issues;
  }, [filteredRows, columns, dqcRules, dqcHighlight]);
  const dqcCellCount = dqcIssues.length;
  const dataFrequency = activeTemplate?.frequency || report?.period_type || "monthly";
  const periodLabel = viewPeriodLabel(viewPeriodType, periodValue);
  const periodDisplay =
    dataFrequency === "annual" ? String(year) : `${periodLabel} ${year}`;
  const activeSheetLabel =
    reportSheets.find((s) => s.id === reportSheet)?.label || reportSheet;
  const totalCols = idColumns.length + columns.length;
  const programsWithTemplates = useMemo(
    () =>
      (catalog?.programs || []).filter((p) =>
        p.sub_programs?.some((sp) => (sp.templates || []).length > 0)
      ),
    [catalog]
  );

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

        <div style={styles.filterPanel}>
          <div style={styles.filterRow}>
            <select
              style={styles.filterProgram}
              value={programCode}
              title={activeProgram?.name || ""}
              onChange={(e) => handleProgramChange(e.target.value)}
            >
              {programsWithTemplates.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              style={styles.filterSubProgram}
              value={subProgramName}
              title={subProgramName}
              onChange={(e) => handleSubProgramChange(e.target.value)}
            >
              {subPrograms.map((sp) => (
                <option key={sp.name} value={sp.name}>
                  {sp.name}
                </option>
              ))}
            </select>
            <select
              style={styles.filterFile}
              value={templateId}
              title={activeTemplate?.label || ""}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {visibleTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterRow}>
            <select
              style={styles.filterYear}
              value={year}
              title={String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {viewPeriodOptions.length > 1 ? (
              <select
                style={styles.filterPeriodType}
                value={viewPeriodType}
                title={
                  viewPeriodOptions.find((p) => p.id === viewPeriodType)?.label ||
                  ""
                }
                onChange={(e) => handleViewPeriodTypeChange(e.target.value)}
              >
                {viewPeriodOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            ) : viewPeriodOptions.length === 1 ? (
              <span style={styles.filterPeriodTypeStatic} title={viewPeriodOptions[0].label}>
                {viewPeriodOptions[0].label}
              </span>
            ) : null}
            {viewPeriodType === "quarterly" && (
              <select
                style={styles.filterPeriodDetail}
                value={periodValue}
                title={periodLabel}
                onChange={(e) => setPeriodValue(Number(e.target.value))}
              >
                {QUARTERS.map((q) => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            )}
            {viewPeriodType === "monthly" && (
              <select
                style={styles.filterPeriodDetail}
                value={periodValue}
                title={periodLabel}
                onChange={(e) => setPeriodValue(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            )}
            {reportSheets.length > 1 && (
              <select
                style={styles.filterSheet}
                value={reportSheet}
                title={activeSheetLabel || "Sheet"}
                onChange={(e) => setReportSheet(e.target.value)}
              >
                {reportSheets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={styles.filterRow}>
            <select
              style={styles.filterArea}
              value={areaFilter}
              title={areaLabel || "All NIR"}
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
            Period: <strong>{periodDisplay}</strong>
          </span>
          {reportSheets.length > 1 && activeSheetLabel && (
            <span style={styles.metaItem}>
              Sheet: <strong>{activeSheetLabel}</strong>
            </span>
          )}
          {report?.aggregated && (
            <span style={styles.metaItem}>
              View: <strong>{viewPeriodType}</strong> (aggregated from{" "}
              <strong>{dataFrequency}</strong> uploads)
            </span>
          )}
          {activeProgram?.name && (
            <span style={styles.metaItem}>
              Program: <strong>{activeProgram.name}</strong>
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
              No data uploaded for {periodDisplay} in this template
              {activeSheetLabel ? ` (${activeSheetLabel} sheet)` : ""}.
            </p>
          ) : filteredRows.length === 0 ? (
            <p style={styles.empty}>
              No rows for {areaLabel} in {periodDisplay}
              {activeSheetLabel ? ` (${activeSheetLabel})` : ""}.
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
                    const isNir = isNirRegionRow(r.psgc);
                    const isProvince = isProvinceHucRow(r.psgc);
                    const rowStyle = isNir
                      ? styles.trNirRegion
                      : isProvince
                        ? styles.trProvinceHuc
                        : ri % 2
                          ? styles.trAlt
                          : styles.tr;
                    const idCellStyle = isNir
                      ? styles.tdIdNirRegion
                      : isProvince
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
                        const dqc = dqcForCell(r, c, v, dqcRules, dqcHighlight);
                        const firstOfGroup =
                          ci === 0 || columns[ci - 1].group !== c.group || !c.group;
                        return (
                          <td
                            key={c.indicator_code}
                            title={dqc?.title || undefined}
                            style={{
                              ...styles.tdNum,
                              ...(isNir ? styles.tdNumNirRegion : {}),
                              ...(c.is_computed && !isNir ? styles.tdComputed : {}),
                              ...(c.is_computed && isNir ? styles.tdComputedNir : {}),
                              ...(firstOfGroup ? styles.groupStart : {}),
                              ...(dqc ? styles.tdDqcFail : {}),
                            }}
                          >
                            {v === undefined || v === null ? (
                              <span style={styles.missing}>—</span>
                            ) : (
                              <>
                                {dqc && <span style={styles.dqcMark}>⚠</span>}
                                {fmtValue(v, isPctColumn(c))}
                              </>
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
          (—) means no value was uploaded for that location.
          {dqcHighlight && dqcCellCount > 0
            ? ` ${dqcCellCount} cell${dqcCellCount === 1 ? "" : "s"} failed DQC (red) — hover for the reason.`
            : ""}{" "}
          When the view period is broader than the file frequency, counts are
          summed (e.g. Q1 on monthly files = Jan–Mar; annual on monthly = 12
          months; annual on quarterly = four quarters) and percentages are
          recalculated from those totals. The NIR regional total is pinned on
          top; if not in the upload it is calculated by summing Negros
          Occidental, Negros Oriental, Siquijor, and Bacolod HUC.
        </p>

        {dqcHighlight && dqcIssues.length > 0 && (
          <div style={styles.dqcPanel}>
            <div style={styles.dqcPanelHead}>
              ⚠ Data-quality issues ({dqcIssues.length}) — values over 100%
            </div>
            <p style={styles.dqcPanelIntro}>
              These cells are flagged because a treatment count exceeds the cases
              seen. The numbers may be exactly as reported — verify against the
              source Excel file before correcting.
            </p>
            <table style={styles.dqcTable}>
              <thead>
                <tr>
                  <th style={styles.dqcTh}>Location</th>
                  <th style={styles.dqcTh}>Indicator</th>
                  <th style={styles.dqcThNum}>Counted</th>
                  <th style={styles.dqcThNum}>Cases seen</th>
                  <th style={styles.dqcThNum}>%</th>
                  <th style={styles.dqcTh}>Likely cause / action</th>
                </tr>
              </thead>
              <tbody>
                {dqcIssues.map((it, i) => (
                  <tr key={`${it.location}-${it.code}-${i}`}>
                    <td style={styles.dqcTd}>{it.location}</td>
                    <td style={styles.dqcTd}>{it.label}</td>
                    <td style={styles.dqcTdNum}>
                      {it.numVal != null ? Number(it.numVal).toLocaleString() : "—"}
                    </td>
                    <td style={styles.dqcTdNum}>
                      {it.denVal != null ? Number(it.denVal).toLocaleString() : "—"}
                    </td>
                    <td style={styles.dqcTdNum}>{it.pctText}</td>
                    <td style={styles.dqcTdHint}>{it.hint || it.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const COMPUTED_TINT = "#F2F6FF";

const FILTER_SELECT_BASE = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  fontSize: "13px",
  color: "#1F2A45",
  backgroundColor: "#fff",
  outline: "none",
  flexShrink: 0,
  boxSizing: "border-box",
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "24px 32px", marginLeft: "240px" },
  title: { fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#5A6A85", margin: "0 0 20px 0", maxWidth: "720px" },
  filterPanel: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" },
  filterRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "nowrap" },
  filterProgram: { ...FILTER_SELECT_BASE, width: "180px" },
  filterSubProgram: { ...FILTER_SELECT_BASE, width: "220px" },
  filterFile: { ...FILTER_SELECT_BASE, width: "420px" },
  filterYear: { ...FILTER_SELECT_BASE, width: "96px" },
  filterPeriodType: { ...FILTER_SELECT_BASE, width: "132px" },
  filterPeriodTypeStatic: {
    ...FILTER_SELECT_BASE,
    width: "132px",
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    color: "#5A6A85",
  },
  filterPeriodDetail: { ...FILTER_SELECT_BASE, width: "168px" },
  filterSheet: { ...FILTER_SELECT_BASE, width: "120px" },
  filterArea: { ...FILTER_SELECT_BASE, width: "240px" },
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
  trNirRegion: { backgroundColor: "#C5DBFC" },
  trProvinceHuc: { backgroundColor: "#E8F0FE" },
  tdId: { position: "sticky", left: 0, backgroundColor: "inherit", padding: "7px 12px", fontSize: "12px", color: "#1F2A45", fontWeight: "600", borderRight: "1px solid #E2E8F0", borderBottom: "1px solid #F0F4F8" },
  tdIdNirRegion: { position: "sticky", left: 0, backgroundColor: "#C5DBFC", padding: "7px 12px", fontSize: "12px", color: "#1E3A8A", fontWeight: "700", borderRight: "1px solid #93B4DC", borderBottom: "1px solid #93B4DC", borderLeft: "3px solid #0B4BAA" },
  tdIdProvinceHuc: { position: "sticky", left: 0, backgroundColor: "#E8F0FE", padding: "7px 12px", fontSize: "12px", color: "#0B4BAA", fontWeight: "700", borderRight: "1px solid #CBD5E1", borderBottom: "1px solid #D6E4FF", borderLeft: "3px solid #60A5FA" },
  tdNum: { padding: "7px 10px", fontSize: "12px", color: "#1F2A45", textAlign: "right", borderBottom: "1px solid #F0F4F8" },
  tdNumNirRegion: { backgroundColor: "#C5DBFC", color: "#1E3A8A", fontWeight: "600", borderBottom: "1px solid #93B4DC" },
  tdComputed: { backgroundColor: COMPUTED_TINT },
  tdComputedNir: { backgroundColor: "#B0CFF5" },
  tdDqcFail: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    fontWeight: "700",
    cursor: "help",
    boxShadow: "inset 0 0 0 2px #EF4444",
  },
  groupStart: { borderLeft: "2px solid #CBD5E1" },
  missing: { color: "#CBD5E1" },
  legend: { fontSize: "11px", color: "#94A3B8", marginTop: "12px" },
  dqcMark: { color: "#B91C1C", marginRight: "3px", fontSize: "10px" },
  dqcPanel: {
    marginTop: "16px",
    border: "1px solid #FCA5A5",
    borderRadius: "8px",
    background: "#FEF2F2",
    padding: "12px 14px",
  },
  dqcPanelHead: { fontSize: "13px", fontWeight: "700", color: "#991B1B" },
  dqcPanelIntro: { fontSize: "11px", color: "#7F1D1D", margin: "4px 0 10px" },
  dqcTable: { width: "100%", borderCollapse: "collapse", fontSize: "12px" },
  dqcTh: {
    textAlign: "left", padding: "6px 8px", color: "#7F1D1D",
    borderBottom: "1px solid #FCA5A5", fontWeight: "600", whiteSpace: "nowrap",
  },
  dqcThNum: {
    textAlign: "right", padding: "6px 8px", color: "#7F1D1D",
    borderBottom: "1px solid #FCA5A5", fontWeight: "600", whiteSpace: "nowrap",
  },
  dqcTd: { padding: "6px 8px", color: "#450A0A", borderBottom: "1px solid #FEE2E2", verticalAlign: "top" },
  dqcTdNum: {
    padding: "6px 8px", color: "#450A0A", borderBottom: "1px solid #FEE2E2",
    textAlign: "right", fontWeight: "600", whiteSpace: "nowrap", verticalAlign: "top",
  },
  dqcTdHint: { padding: "6px 8px", color: "#7F1D1D", borderBottom: "1px solid #FEE2E2", lineHeight: 1.4 },
};
