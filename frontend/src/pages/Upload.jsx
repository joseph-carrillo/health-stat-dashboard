// frontend/src/pages/Upload.jsx
// Upload an FHSIS Excel file, review the staged batch, resolve any
// conflicts, then approve to commit the data.

import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import FileDropzone from "../components/FileDropzone";
import { can } from "../services/auth";
import {
  uploadFile,
  getUploadCatalog,
  getBatchSummary,
  getConflicts,
  resolveConflict,
  resolveConflictsBulk,
  approveBatch,
} from "../services/api";
import { MONTHS, YEARS, QUARTERS } from "../services/constants";
import {
  findCatalogProgram,
  findCatalogSubProgram,
  findCatalogTemplate,
  getDefaultUploadSelection,
  filenameMismatchMessage,
  periodLabel,
  sortTemplatesByFhsisFile,
} from "../config/uploadPrograms";

export default function Upload() {
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [subProgramName, setSubProgramName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [year, setYear] = useState(2026);
  const [periodValue, setPeriodValue] = useState(1);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [batchId, setBatchId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dryResult, setDryResult] = useState(null);

  const canApprove = can("can_approve");

  useEffect(() => {
    getUploadCatalog()
      .then((data) => {
        setCatalog(data);
        const defaults = getDefaultUploadSelection(data);
        if (defaults) {
          setProgramCode(defaults.programCode);
          setSubProgramName(defaults.subProgramName);
          setTemplateId(defaults.templateId);
        }
      })
      .catch(() => {
        setCatalogError("Could not load upload options. Is the API running?");
      });
  }, []);

  useEffect(() => {
    setSelectedIds(conflicts.map((c) => c.staging_id));
  }, [conflicts]);

  const selectedProgram = findCatalogProgram(catalog, programCode);
  const selectedSubProgram = findCatalogSubProgram(selectedProgram, subProgramName);
  const availableTemplates = useMemo(
    () => sortTemplatesByFhsisFile(selectedSubProgram?.templates || []),
    [selectedSubProgram]
  );
  const selectedTemplate = findCatalogTemplate(selectedSubProgram, templateId);
  const uploadConfigured = availableTemplates.length > 0;
  const frequency = selectedTemplate?.frequency || "monthly";
  const uploadPeriodLabel = periodLabel(frequency, periodValue, year, MONTHS);

  const allSelected =
    conflicts.length > 0 && selectedIds.length === conflicts.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  function reset() {
    setBatchId(null);
    setSummary(null);
    setConflicts([]);
    setDryResult(null);
    setError("");
    setInfo("");
  }

  async function refreshSummary(id) {
    const s = await getBatchSummary(id);
    setSummary(s);
    if (s.conflicts > 0) {
      const c = await getConflicts(id);
      setConflicts(c.conflicts || []);
    } else {
      setConflicts([]);
    }
  }

  function validateSelection() {
    if (!selectedProgram) return "Select a program.";
    if (!subProgramName) return "Select a sub-program.";
    if (!uploadConfigured) {
      return "Upload is not configured for this sub-program yet. Only Immunization is available during testing.";
    }
    if (!templateId) return "Select an FHSIS file template.";
    if (!file) return "Add an Excel file to upload.";
    const mismatch = filenameMismatchMessage(file.name, selectedTemplate);
    if (mismatch) return mismatch;
    if (fileError) return fileError;
    return "";
  }

  function handleProgramChange(e) {
    const nextProgram = findCatalogProgram(catalog, e.target.value);
    setProgramCode(nextProgram?.code || "");
    const firstSub = nextProgram?.sub_programs?.[0];
    setSubProgramName(firstSub?.name || "");
    setTemplateId(firstSub?.templates?.[0]?.id || "");
    setPeriodValue(1);
    setFile(null);
    setFileError("");
    reset();
  }

  function handleSubProgramChange(e) {
    const nextSub = findCatalogSubProgram(selectedProgram, e.target.value);
    setSubProgramName(nextSub?.name || "");
    setTemplateId(nextSub?.templates?.[0]?.id || "");
    setPeriodValue(1);
    setFile(null);
    setFileError("");
    reset();
  }

  function handleTemplateChange(e) {
    const nextTemplate = findCatalogTemplate(selectedSubProgram, e.target.value);
    setTemplateId(nextTemplate?.id || "");
    setPeriodValue(1);
    if (file && nextTemplate) {
      setFileError(filenameMismatchMessage(file.name, nextTemplate));
    } else {
      setFileError("");
    }
    reset();
  }

  function handleFileChange(nextFile, nextError = "") {
    if (nextFile && selectedTemplate) {
      const mismatch = filenameMismatchMessage(nextFile.name, selectedTemplate);
      if (mismatch) {
        setFile(nextFile);
        setFileError(mismatch);
        return;
      }
    }
    setFile(nextFile);
    setFileError(nextError);
    if (nextFile) reset();
  }

  async function handleValidate() {
    const msg = validateSelection();
    if (msg) return setError(msg);
    reset();
    setBusy(true);
    try {
      const result = await uploadFile(file, templateId, year, periodValue, true);
      setDryResult(result);
      setInfo(
        `Validation parsed ${result.rows_processed} rows. ` +
          `${result.dqc_issues} DQC issue(s), ${result.errors} error(s). ` +
          `Nothing was saved.`
      );
    } catch (err) {
      setError(errMsg(err, "Validation failed."));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload() {
    const msg = validateSelection();
    if (msg) return setError(msg);
    reset();
    setBusy(true);
    try {
      const result = await uploadFile(file, templateId, year, periodValue, false);
      if (!result.rows_staged) {
        const firstErr = result.errors_detail?.[0];
        const detail = firstErr
          ? typeof firstErr === "string"
            ? firstErr
            : firstErr.error || firstErr.indicator_code || JSON.stringify(firstErr)
          : "No values were saved to staging.";
        setError(
          `Upload parsed ${result.rows_processed || 0} rows but staged 0. ${detail}`
        );
        return;
      }
      setBatchId(result.batch_id);
      await refreshSummary(result.batch_id);
      setInfo(
        `Uploaded ${result.rows_staged} values to staging. ` +
          `Review below before approving.`
      );
    } catch (err) {
      setError(errMsg(err, "Upload failed."));
    } finally {
      setBusy(false);
    }
  }

  async function handleResolve(stagingId, decision) {
    setBusy(true);
    try {
      await resolveConflict(stagingId, decision);
      await refreshSummary(batchId);
    } catch (err) {
      setError(errMsg(err, "Could not resolve conflict."));
    } finally {
      setBusy(false);
    }
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : conflicts.map((c) => c.staging_id));
  }

  function toggleSelected(stagingId) {
    setSelectedIds((prev) =>
      prev.includes(stagingId)
        ? prev.filter((id) => id !== stagingId)
        : [...prev, stagingId]
    );
  }

  async function handleBulkResolve(decision) {
    if (!selectedIds.length) {
      setError("Select at least one conflict row first.");
      return;
    }
    const label = decision === "accept" ? "use incoming" : "keep existing";
    const count = selectedIds.length;
    if (
      !window.confirm(
        `Apply "${label}" to ${count} selected conflict${count === 1 ? "" : "s"}?`
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const resolveAll = selectedIds.length === conflicts.length;
      await resolveConflictsBulk(
        batchId,
        decision,
        resolveAll ? null : selectedIds
      );
      await refreshSummary(batchId);
      setInfo(
        `Resolved ${count} conflict${count === 1 ? "" : "s"} — ` +
          `${decision === "accept" ? "using incoming values" : "keeping existing values"}.`
      );
    } catch (err) {
      setError(errMsg(err, "Could not resolve selected conflicts."));
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    if (summary?.failed > 0) {
      const n = summary.failed;
      if (
        !window.confirm(
          `${n} value${n === 1 ? "" : "s"} failed DQC validation. ` +
            `Publish anyway? Failed cells will appear in red on Indicator Reports ` +
            `(hover for the reason).`
        )
      ) {
        return;
      }
    }
    setBusy(true);
    setError("");
    try {
      const result = await approveBatch(batchId);
      setInfo(
        `Approved. Inserted ${result.inserted}, updated ${result.updated}. ` +
          `Data is now live on the dashboard.`
      );
      setSummary(null);
      setConflicts([]);
      setBatchId(null);
      setFile(null);
    } catch (err) {
      setError(errMsg(err, "Approval failed."));
    } finally {
      setBusy(false);
    }
  }

  const hasPendingConflicts = conflicts.length > 0;
  const hasFailures = summary && summary.failed > 0;
  const approveDisabled =
    busy || !batchId || hasPendingConflicts || !canApprove;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <h1 style={styles.title}>Upload Data</h1>
        <p style={styles.subtitle}>
          Choose program, sub-program, and reporting period, then upload the
          matching FHSIS Excel file. Review and approve before data goes live.
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Report Selection</h2>

          {selectedProgram && selectedSubProgram && (
            <p style={styles.breadcrumb}>
              {selectedProgram.name} › {selectedSubProgram.name}
              {selectedTemplate ? ` › ${selectedTemplate.label}` : ""}
            </p>
          )}

          {catalogError && <p style={styles.error}>{catalogError}</p>}

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Program</label>
              <select
                style={styles.input}
                value={programCode}
                onChange={handleProgramChange}
                disabled={busy || !catalog}
              >
                <option value="">Select program...</option>
                {catalog?.programs.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Sub-Program</label>
              <select
                style={styles.input}
                value={subProgramName}
                onChange={handleSubProgramChange}
                disabled={busy || !selectedProgram}
              >
                <option value="">Select sub-program...</option>
                {selectedProgram?.sub_programs.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                    {s.status === "coming_soon" && !s.templates?.length
                      ? " — coming soon"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {uploadConfigured && (
              <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <label style={styles.label}>FHSIS File Template</label>
                <select
                  style={styles.input}
                  value={templateId}
                  onChange={handleTemplateChange}
                  disabled={busy}
                >
                  <option value="">Select template...</option>
                  {availableTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {uploadConfigured && selectedTemplate && (
              <>
                {frequency === "monthly" && (
                  <div style={styles.field}>
                    <label style={styles.label}>Month</label>
                    <select
                      style={styles.input}
                      value={periodValue}
                      onChange={(e) => setPeriodValue(Number(e.target.value))}
                      disabled={busy}
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {frequency === "quarterly" && (
                  <div style={styles.field}>
                    <label style={styles.label}>Quarter</label>
                    <select
                      style={styles.input}
                      value={periodValue}
                      onChange={(e) => setPeriodValue(Number(e.target.value))}
                      disabled={busy}
                    >
                      {QUARTERS.map((q) => (
                        <option key={q.value} value={q.value}>
                          {q.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={styles.field}>
                  <label style={styles.label}>
                    {frequency === "annual" ? "Report Year" : "Year"}
                  </label>
                  <select
                    style={styles.input}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    disabled={busy}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {!uploadConfigured && selectedSubProgram && (
            <div style={styles.comingSoonBox}>
              <p style={styles.comingSoonTitle}>Not available yet</p>
              <p style={styles.comingSoonText}>
                <strong>{selectedSubProgram.name}</strong> uploads are not
                configured yet. During Phase 1 testing, use{" "}
                <strong>Immunization</strong> under Child Care.
              </p>
            </div>
          )}

          {uploadConfigured && templateId && (
            <>
              <div style={styles.uploadDivider} />
              <h2 style={styles.sectionTitle}>Excel File</h2>
              <p style={styles.uploadHint}>
                Upload the workbook for{" "}
                <strong>{selectedTemplate?.label}</strong>
                {" — "}{uploadPeriodLabel}.
                {frequency === "annual" &&
                  selectedTemplate?.report_sheets?.length > 1 && (
                    <>
                      {" "}
                      Both{" "}
                      {selectedTemplate.report_sheets
                        .map((s) => s.label)
                        .join(" and ")}{" "}
                      tabs are read; data is stored for report year {year}.
                    </>
                  )}
              </p>
              <FileDropzone
                file={file}
                onFileChange={handleFileChange}
                disabled={busy}
                error={fileError}
                expectedPattern={selectedTemplate?.source_file_pattern || ""}
              />
            </>
          )}

          <div style={styles.btnRow}>
            <button
              style={styles.secondaryBtn}
              onClick={handleValidate}
              disabled={busy || !uploadConfigured || !templateId}
            >
              Validate Only (dry run)
            </button>
            <button
              style={styles.primaryBtn}
              onClick={handleUpload}
              disabled={busy || !uploadConfigured || !templateId}
            >
              {busy ? "Working..." : "Upload to Staging"}
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {info && <p style={styles.info}>{info}</p>}
        </div>

        {/* Dry-run preview */}
        {dryResult && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Validation Preview</h2>
            <PreviewTable rows={dryResult.preview} />
            <IssuesList issues={dryResult.issues_detail} />
          </div>
        )}

        {/* Batch summary */}
        {summary && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Batch Review</h2>
            <div style={styles.statRow}>
              <Stat label="Total Rows" value={summary.total_rows} />
              <Stat label="Passed" value={summary.passed} color="#16A34A" />
              <Stat label="Failed" value={summary.failed} color="#DC2626" />
              <Stat
                label="Conflicts"
                value={summary.conflicts}
                color="#EAB308"
              />
            </div>

            {/* Conflicts */}
            {hasPendingConflicts && (
              <>
                <h3 style={styles.subSectionTitle}>
                  Conflicts — choose a value for each ({conflicts.length} pending)
                </h3>
                <div style={styles.bulkBar}>
                  <label style={styles.selectAllLabel}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={toggleSelectAll}
                      disabled={busy || !canApprove}
                    />
                    Select all ({selectedIds.length}/{conflicts.length})
                  </label>
                  <button
                    style={{ ...styles.miniBtn, ...styles.miniBtnPrimary }}
                    disabled={busy || !canApprove || !selectedIds.length}
                    onClick={() => handleBulkResolve("accept")}
                  >
                    Use incoming for selected
                  </button>
                  <button
                    style={styles.miniBtn}
                    disabled={busy || !canApprove || !selectedIds.length}
                    onClick={() => handleBulkResolve("reject")}
                  >
                    Keep existing for selected
                  </button>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thCheck} aria-label="Select" />
                      <th style={styles.th}>Location</th>
                      <th style={styles.th}>Indicator</th>
                      <th style={styles.th}>Existing</th>
                      <th style={styles.th}>Incoming</th>
                      <th style={styles.th}>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conflicts.map((c) => (
                      <tr key={c.staging_id} style={styles.tr}>
                        <td style={styles.tdCheck}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.staging_id)}
                            onChange={() => toggleSelected(c.staging_id)}
                            disabled={busy || !canApprove}
                          />
                        </td>
                        <td style={styles.td}>{c.location}</td>
                        <td style={styles.td}>{c.indicator_code}</td>
                        <td style={styles.td}>{c.existing_value}</td>
                        <td style={styles.td}>{c.incoming_value}</td>
                        <td style={styles.td}>
                          <button
                            style={styles.miniBtn}
                            disabled={busy || !canApprove}
                            onClick={() => handleResolve(c.staging_id, "reject")}
                          >
                            Keep existing
                          </button>
                          <button
                            style={{ ...styles.miniBtn, ...styles.miniBtnPrimary }}
                            disabled={busy || !canApprove}
                            onClick={() => handleResolve(c.staging_id, "accept")}
                          >
                            Use incoming
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!canApprove && (
                  <p style={styles.note}>
                    You can upload, but only an approver can resolve conflicts
                    and approve this batch.
                  </p>
                )}
              </>
            )}

            {/* Sample */}
            {summary.sample && summary.sample.length > 0 && (
              <>
                <h3 style={styles.subSectionTitle}>Sample of staged data</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Location</th>
                      <th style={styles.th}>Indicator</th>
                      <th style={styles.th}>Value</th>
                      <th style={styles.th}>Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.sample.map((s, i) => (
                      <tr key={i} style={styles.tr}>
                        <td style={styles.td}>{s.location}</td>
                        <td style={styles.td}>{s.indicator}</td>
                        <td style={styles.td}>{s.value}</td>
                        <td style={styles.td}>
                          <StatusPill status={s.validation_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div style={styles.btnRow}>
              <button
                style={approveDisabled ? styles.disabledBtn : styles.primaryBtn}
                onClick={handleApprove}
                disabled={approveDisabled}
              >
                {hasPendingConflicts
                  ? "Resolve conflicts to approve"
                  : hasFailures
                  ? "Approve with DQC warnings"
                  : "Approve & Publish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function errMsg(err, fallback) {
  return err?.response?.data?.detail || fallback;
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color: color || "#1F2A45" }}>{value}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const ok = status === "passed";
  return (
    <span
      style={{
        ...styles.pill,
        backgroundColor: ok ? "#DCFCE7" : "#FEE2E2",
        color: ok ? "#166534" : "#991B1B",
      }}
    >
      {status}
    </span>
  );
}

function PreviewTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p style={styles.note}>No rows parsed.</p>;
  }
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>PSGC</th>
          <th style={styles.th}>Indicator</th>
          <th style={styles.th}>Value</th>
          <th style={styles.th}>Validation</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={styles.tr}>
            <td style={styles.td}>{r.psgc}</td>
            <td style={styles.td}>{r.indicator_code}</td>
            <td style={styles.td}>{r.value}</td>
            <td style={styles.td}>
              <StatusPill status={r.validation_status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IssuesList({ issues }) {
  if (!issues || issues.length === 0) return null;
  return (
    <div style={styles.issues}>
      <h3 style={styles.subSectionTitle}>DQC Issues</h3>
      {issues.slice(0, 50).map((issue, i) => (
        <p key={i} style={styles.issueItem}>
          Row {issue.row} — {issue.indicator_code} = {issue.value}: {issue.message}
        </p>
      ))}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "28px 32px", marginLeft: "240px" },
  title: { fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#5A6A85", margin: "0 0 24px 0" },
  section: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "20px" },
  sectionTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "16px", fontWeight: "700", color: "#1F2A45", margin: "0 0 16px 0" },
  subSectionTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "13px", fontWeight: "700", color: "#1F2A45", margin: "20px 0 10px 0" },
  breadcrumb: {
    fontSize: "12px",
    color: "#64748B",
    margin: "0 0 16px 0",
    padding: "8px 12px",
    backgroundColor: "#F8FAFC",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  uploadDivider: { height: "1px", backgroundColor: "#E2E8F0", margin: "24px 0 20px 0" },
  uploadHint: { fontSize: "13px", color: "#5A6A85", margin: "0 0 14px 0" },
  comingSoonBox: {
    marginTop: "16px",
    padding: "16px 18px",
    backgroundColor: "#FFFBEB",
    border: "1px solid #FDE68A",
    borderRadius: "8px",
  },
  comingSoonTitle: {
    margin: "0 0 6px 0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#92400E",
  },
  comingSoonText: {
    margin: 0,
    fontSize: "13px",
    color: "#92400E",
    lineHeight: 1.5,
  },
  label: { fontSize: "12px", fontWeight: "600", color: "#1F2A45" },
  input: { padding: "10px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "14px", color: "#1F2A45", outline: "none", backgroundColor: "#fff" },
  btnRow: { display: "flex", gap: "12px", marginTop: "18px", flexWrap: "wrap" },
  primaryBtn: { padding: "11px 20px", backgroundColor: "#0B4BAA", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'Montserrat', sans-serif" },
  secondaryBtn: { padding: "11px 20px", backgroundColor: "#fff", color: "#0B4BAA", border: "1px solid #0B4BAA", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'Montserrat', sans-serif" },
  disabledBtn: { padding: "11px 20px", backgroundColor: "#CBD5E1", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "not-allowed", fontFamily: "'Montserrat', sans-serif" },
  miniBtn: { padding: "5px 10px", marginRight: "6px", backgroundColor: "#fff", color: "#1F2A45", border: "1px solid #CBD5E1", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  miniBtnPrimary: { backgroundColor: "#0B4BAA", color: "#fff", border: "1px solid #0B4BAA" },
  error: { backgroundColor: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginTop: "14px" },
  info: { backgroundColor: "#DBEAFE", color: "#1E40AF", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginTop: "14px" },
  note: { fontSize: "12px", color: "#5A6A85", fontStyle: "italic", marginTop: "8px" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "8px" },
  stat: { backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "14px 18px" },
  statLabel: { fontSize: "11px", color: "#5A6A85", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  statValue: { fontSize: "26px", fontWeight: "700", margin: 0, fontFamily: "'Montserrat', sans-serif" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "8px" },
  bulkBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "10px",
    padding: "10px 12px",
    backgroundColor: "#F8FAFC",
    borderRadius: "8px",
  },
  selectAllLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1F2A45",
    marginRight: "8px",
  },
  thCheck: { width: "36px", padding: "8px 12px", borderBottom: "2px solid #F0F4F8" },
  tdCheck: { width: "36px", padding: "9px 12px", textAlign: "center" },
  th: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #F0F4F8" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  td: { padding: "9px 12px", fontSize: "13px", color: "#1F2A45" },
  pill: { padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
  issues: { marginTop: "12px" },
  issueItem: { fontSize: "12px", color: "#991B1B", backgroundColor: "#FEF2F2", padding: "6px 10px", borderRadius: "5px", margin: "0 0 6px 0" },
};
