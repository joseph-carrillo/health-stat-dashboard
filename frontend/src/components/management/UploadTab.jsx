// Upload form — uses the same upload catalog API as /upload.

import { useEffect, useState } from "react";
import FileDropzone from "../FileDropzone";
import { getUploadCatalog } from "../../services/api";
import { MONTHS, QUARTERS } from "../../services/constants";
import {
  findCatalogProgram,
  findCatalogSubProgram,
  findCatalogTemplate,
  getDefaultUploadSelection,
  filenameMismatchMessage,
  sortTemplatesByFhsisFile,
} from "../../config/uploadPrograms";

const YEARS = [2025, 2026, 2027];

export default function UploadTab() {
  const [catalog, setCatalog] = useState(null);
  const [programCode, setProgramCode] = useState("");
  const [subProgramName, setSubProgramName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [year, setYear] = useState(2026);
  const [periodValue, setPeriodValue] = useState(1);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

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
      .catch(() => {});
  }, []);

  const selectedProgram = findCatalogProgram(catalog, programCode);
  const selectedSubProgram = findCatalogSubProgram(selectedProgram, subProgramName);
  const availableTemplates = sortTemplatesByFhsisFile(
    selectedSubProgram?.templates || []
  );
  const selectedTemplate = findCatalogTemplate(selectedSubProgram, templateId);
  const uploadConfigured = availableTemplates.length > 0;
  const frequency = selectedTemplate?.frequency || "monthly";

  function handleProgramChange(e) {
    const nextProgram = findCatalogProgram(catalog, e.target.value);
    setProgramCode(nextProgram?.code || "");
    const firstSub = nextProgram?.sub_programs?.[0];
    setSubProgramName(firstSub?.name || "");
    setTemplateId(firstSub?.templates?.[0]?.id || "");
    setPeriodValue(1);
    setFile(null);
    setFileError("");
    setErrorMsg("");
  }

  function handleSubProgramChange(e) {
    const nextSub = findCatalogSubProgram(selectedProgram, e.target.value);
    setSubProgramName(nextSub?.name || "");
    setTemplateId(nextSub?.templates?.[0]?.id || "");
    setPeriodValue(1);
    setFile(null);
    setFileError("");
    setErrorMsg("");
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
  }

  async function handleUpload() {
    if (!selectedProgram) { setErrorMsg("Please select a program."); return; }
    if (!subProgramName) { setErrorMsg("Please select a sub-program."); return; }
    if (!uploadConfigured) {
      setErrorMsg("This sub-program is not available for upload yet.");
      return;
    }
    if (!templateId) { setErrorMsg("Please select an FHSIS file template."); return; }
    if (!file) { setErrorMsg("Please add an Excel file."); return; }
    const mismatch = filenameMismatchMessage(file.name, selectedTemplate);
    if (mismatch) { setErrorMsg(mismatch); return; }
    if (fileError) { setErrorMsg(fileError); return; }

    setErrorMsg("");
    setStatus("loading");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/upload?template_id=${templateId}&year=${year}&month=${periodValue}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      let data = {};
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setStatus("error");
        setErrorMsg(
          response.ok
            ? "Upload returned an invalid response."
            : `Server error (${response.status}). Check backend logs.`
        );
        return;
      }

      if (!response.ok) {
        setStatus("error");
        const detail = data.detail;
        setErrorMsg(
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => d.msg || JSON.stringify(d)).join("; ")
              : `Upload failed (${response.status}).`
        );
        return;
      }

      setStatus("success");
      setResult(data);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "Cannot connect to server. Is the API running?");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.batch_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy to clipboard failed:", err);
    }
  }

  function handleReset() {
    const defaults = getDefaultUploadSelection(catalog);
    if (defaults) {
      setProgramCode(defaults.programCode);
      setSubProgramName(defaults.subProgramName);
      setTemplateId(defaults.templateId);
    }
    setPeriodValue(1);
    setYear(2026);
    setFile(null);
    setFileError("");
    setStatus(null);
    setResult(null);
    setErrorMsg("");
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Upload FHSIS File</h2>
      <p style={styles.sub}>
        Program, sub-program, and template lists are filtered automatically.
      </p>

      <div style={styles.form}>
        {selectedProgram && selectedSubProgram && (
          <p style={styles.breadcrumb}>
            {selectedProgram.name} › {selectedSubProgram.name}
            {selectedTemplate ? ` › ${selectedTemplate.label}` : ""}
          </p>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Program</label>
          <select
            style={styles.select}
            value={programCode}
            onChange={handleProgramChange}
            disabled={status === "loading" || !catalog}
          >
            <option value="">Select program...</option>
            {catalog?.programs.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedProgram && (
          <div style={styles.field}>
            <label style={styles.label}>Sub-Program</label>
            <select
              style={styles.select}
              value={subProgramName}
              onChange={handleSubProgramChange}
              disabled={status === "loading"}
            >
              <option value="">Select sub-program...</option>
              {selectedProgram.sub_programs.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                  {s.status === "coming_soon" && !s.templates?.length
                    ? " — coming soon"
                    : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {!uploadConfigured && selectedSubProgram && (
          <div style={styles.comingSoonBox}>
            <p style={styles.comingSoonTitle}>Not available yet</p>
            <p style={styles.comingSoonText}>
              Only <strong>Immunization</strong> is configured for testing.
            </p>
          </div>
        )}

        {uploadConfigured && (
          <div style={styles.field}>
            <label style={styles.label}>FHSIS File Template</label>
            <select
              style={styles.select}
              value={templateId}
              onChange={(e) => {
                const next = findCatalogTemplate(selectedSubProgram, e.target.value);
                setTemplateId(next?.id || "");
                setPeriodValue(1);
                setFile(null);
                setFileError("");
                setErrorMsg("");
              }}
              disabled={status === "loading"}
            >
              <option value="">Select template...</option>
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        {uploadConfigured && selectedTemplate && (
          <div style={styles.row}>
            {frequency === "monthly" && (
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Month</label>
                <select
                  style={styles.select}
                  value={periodValue}
                  onChange={(e) => setPeriodValue(Number(e.target.value))}
                  disabled={status === "loading"}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            )}
            {frequency === "quarterly" && (
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Quarter</label>
                <select
                  style={styles.select}
                  value={periodValue}
                  onChange={(e) => setPeriodValue(Number(e.target.value))}
                  disabled={status === "loading"}
                >
                  {QUARTERS.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>
                {frequency === "annual" ? "Report Year" : "Year"}
              </label>
              <select
                style={styles.select}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                disabled={status === "loading"}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {uploadConfigured && selectedTemplate && (
          <div style={styles.field}>
            <label style={styles.label}>Excel File</label>
            <FileDropzone
              file={file}
              onFileChange={handleFileChange}
              disabled={status === "loading"}
              error={fileError}
              expectedPattern={selectedTemplate.source_file_pattern || ""}
            />
          </div>
        )}

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        {status !== "success" && uploadConfigured && selectedTemplate && (
          <button
            style={status === "loading" ? styles.btnDisabled : styles.btn}
            onClick={handleUpload}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Uploading and parsing..." : "Upload File"}
          </button>
        )}
      </div>

      {status === "success" && result && (
        <div style={styles.successBox}>
          <h3 style={styles.successTitle}>Upload Successful</h3>
          <p style={styles.successText}>The file was parsed and staged for review.</p>
          <div style={styles.resultGrid}>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Batch ID</span>
              <div style={styles.batchIdRow}>
                <span style={{ ...styles.resultValue, fontSize: "12px", wordBreak: "break-all" }}>
                  {result.batch_id}
                </span>
                <button style={copied ? styles.copyBtnDone : styles.copyBtn} onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Rows Parsed</span>
              <span style={styles.resultValue}>{result.rows_processed || 0}</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Rows Staged</span>
              <span style={styles.resultValue}>{result.rows_staged || 0}</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Conflicts</span>
              <span style={styles.resultValue}>{result.conflicts || 0}</span>
            </div>
          </div>
          <button style={styles.btn} onClick={handleReset}>Upload Another File</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: "640px" },
  title: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "#1F2A45",
    margin: "0 0 6px 0",
  },
  sub: { fontSize: "13px", color: "#5A6A85", margin: "0 0 28px 0", lineHeight: "1.5" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  breadcrumb: {
    fontSize: "12px",
    color: "#64748B",
    margin: 0,
    padding: "8px 12px",
    backgroundColor: "#F8FAFC",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  row: { display: "flex", gap: "16px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#1F2A45" },
  select: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    color: "#1F2A45",
    backgroundColor: "#ffffff",
    outline: "none",
  },
  comingSoonBox: {
    padding: "16px 18px",
    backgroundColor: "#FFFBEB",
    border: "1px solid #FDE68A",
    borderRadius: "8px",
  },
  comingSoonTitle: { margin: "0 0 6px 0", fontSize: "13px", fontWeight: "700", color: "#92400E" },
  comingSoonText: { margin: 0, fontSize: "13px", color: "#92400E", lineHeight: 1.5 },
  errorBox: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "13px",
  },
  btn: {
    padding: "12px 24px",
    backgroundColor: "#0B4BAA",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
    alignSelf: "flex-start",
  },
  btnDisabled: {
    padding: "12px 24px",
    backgroundColor: "#93B4DC",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
    fontFamily: "'Montserrat', sans-serif",
    alignSelf: "flex-start",
  },
  successBox: {
    marginTop: "24px",
    backgroundColor: "#F0FDF4",
    border: "1px solid #16A34A",
    borderRadius: "10px",
    padding: "24px",
  },
  successTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "16px",
    fontWeight: "700",
    color: "#15803D",
    margin: "0 0 8px 0",
  },
  successText: { fontSize: "13px", color: "#15803D", margin: "0 0 20px 0" },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "20px",
  },
  resultItem: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  resultLabel: {
    fontSize: "11px",
    color: "#5A6A85",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  resultValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1F2A45",
    fontFamily: "'Montserrat', sans-serif",
  },
  batchIdRow: { display: "flex", alignItems: "flex-start", gap: "8px" },
  copyBtn: {
    flexShrink: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#5A6A85",
    fontFamily: "inherit",
    fontSize: "12px",
  },
  copyBtnDone: {
    flexShrink: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#16A34A",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "600",
  },
};
