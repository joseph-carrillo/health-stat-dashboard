// frontend/src/pages/Upload.jsx
// Upload an FHSIS Excel file, review the staged batch, resolve any
// conflicts, then approve to commit the data.

import { useState } from "react";
import Navbar from "../components/Navbar";
import { can } from "../services/auth";
import {
  uploadFile,
  getBatchSummary,
  getConflicts,
  resolveConflict,
  approveBatch,
} from "../services/api";
import { TEMPLATES, MONTHS, YEARS } from "../services/constants";

export default function Upload() {
  const [templateId, setTemplateId] = useState(TEMPLATES[0]?.id || "");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [file, setFile] = useState(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [batchId, setBatchId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [dryResult, setDryResult] = useState(null);

  const canApprove = can("can_approve");

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

  async function handleValidate() {
    if (!file) return setError("Please choose an Excel file first.");
    reset();
    setBusy(true);
    try {
      const result = await uploadFile(file, templateId, year, month, true);
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
    if (!file) return setError("Please choose an Excel file first.");
    reset();
    setBusy(true);
    try {
      const result = await uploadFile(file, templateId, year, month, false);
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

  async function handleApprove() {
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
    busy || !batchId || hasPendingConflicts || hasFailures || !canApprove;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <h1 style={styles.title}>Upload Data</h1>
        <p style={styles.subtitle}>
          Upload a monthly FHSIS Excel file, review the parsed values, then
          approve to publish.
        </p>

        {/* Upload form */}
        <div style={styles.section}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Template</label>
              <select
                style={styles.input}
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Year</label>
              <select
                style={styles.input}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Month</label>
              <select
                style={styles.input}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Excel File</label>
              <input
                style={styles.input}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>

          <div style={styles.btnRow}>
            <button
              style={styles.secondaryBtn}
              onClick={handleValidate}
              disabled={busy}
            >
              Validate Only (dry run)
            </button>
            <button
              style={styles.primaryBtn}
              onClick={handleUpload}
              disabled={busy}
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
                  Conflicts — choose a value for each
                </h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
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
                {hasFailures
                  ? "Cannot approve — fix DQC failures"
                  : hasPendingConflicts
                  ? "Resolve conflicts to approve"
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
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
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
  th: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #F0F4F8" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  td: { padding: "9px 12px", fontSize: "13px", color: "#1F2A45" },
  pill: { padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
  issues: { marginTop: "12px" },
  issueItem: { fontSize: "12px", color: "#991B1B", backgroundColor: "#FEF2F2", padding: "6px 10px", borderRadius: "5px", margin: "0 0 6px 0" },
};
