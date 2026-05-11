// frontend/src/components/management/UploadTab.jsx
// Upload page — Child Care > Immunization (Monthly)
// Add more programs here as we expand

import { useState } from "react";

// ── Program structure ─────────────────────────────────────────
// Add new programs here when ready
const PROGRAM_STRUCTURE = [
  {
    program: "Child Care",
    subPrograms: [
      {
        name: "Immunization",
        reportType: "monthly",
        templateId: "cpab_bcg_hepa",
        files: [
          { label: "CPAB / BCG / HepaB (File 1)", value: "cpab_bcg_hepa" }
        ]
      }
    ]
  }
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

const YEARS = [2025, 2026, 2027];

export default function UploadTab() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedSubProgram, setSelectedSubProgram] = useState(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(2026);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // When program changes reset sub-program
  function handleProgramChange(e) {
    const found = PROGRAM_STRUCTURE.find(p => p.program === e.target.value);
    setSelectedProgram(found || null);
    setSelectedSubProgram(null);
    setFile(null);
    setErrorMsg("");
  }

  // When sub-program changes reset file
  function handleSubProgramChange(e) {
    const found = selectedProgram?.subPrograms.find(s => s.name === e.target.value);
    setSelectedSubProgram(found || null);
    setFile(null);
    setErrorMsg("");
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!selected.name.endsWith(".xlsx") && !selected.name.endsWith(".xls")) {
      setErrorMsg("Only Excel files (.xlsx or .xls) are accepted.");
      setFile(null);
      return;
    }
    setErrorMsg("");
    setFile(selected);
  }

  async function handleUpload() {
    if (!selectedProgram) { setErrorMsg("Please select a program."); return; }
    if (!selectedSubProgram) { setErrorMsg("Please select a sub-program."); return; }
    if (!month) { setErrorMsg("Please select a month."); return; }
    if (!file) { setErrorMsg("Please select an Excel file."); return; }

    setErrorMsg("");
    setStatus("loading");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/upload?template_id=${selectedSubProgram.templateId}&year=${year}&month=${month}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMsg(data.detail || "Upload failed.");
        return;
      }

      setStatus("success");
      setResult(data);

    } catch (err) {
      setStatus("error");
      setErrorMsg("Cannot connect to server. Is the API running?");
    }
  }

  function handleReset() {
    setSelectedProgram(null);
    setSelectedSubProgram(null);
    setMonth("");
    setYear(2026);
    setFile(null);
    setStatus(null);
    setResult(null);
    setErrorMsg("");
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Upload FHSIS File</h2>
      <p style={styles.sub}>
        Select the program, sub-program, reporting period, and Excel file to upload.
      </p>

      <div style={styles.form}>

        {/* Program */}
        <div style={styles.field}>
          <label style={styles.label}>Program</label>
          <select
            style={styles.select}
            value={selectedProgram?.program || ""}
            onChange={handleProgramChange}
            disabled={status === "loading"}
          >
            <option value="">Select program...</option>
            {PROGRAM_STRUCTURE.map((p) => (
              <option key={p.program} value={p.program}>{p.program}</option>
            ))}
          </select>
        </div>

        {/* Sub-Program — only shows when program is selected */}
        {selectedProgram && (
          <div style={styles.field}>
            <label style={styles.label}>Sub-Program</label>
            <select
              style={styles.select}
              value={selectedSubProgram?.name || ""}
              onChange={handleSubProgramChange}
              disabled={status === "loading"}
            >
              <option value="">Select sub-program...</option>
              {selectedProgram.subPrograms.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Period — only shows when sub-program is selected */}
        {selectedSubProgram && (
          <div style={styles.row}>

            {/* Monthly selector */}
            {selectedSubProgram.reportType === "monthly" && (
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Month</label>
                <select
                  style={styles.select}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={status === "loading"}
                >
                  <option value="">Select month...</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Year */}
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Year</label>
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

        {/* File picker — only shows when period is selected */}
        {selectedSubProgram && month && (
          <div style={styles.field}>
            <label style={styles.label}>Excel File</label>
            <div style={styles.filePicker}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={status === "loading"}
                style={styles.fileInput}
              />
              {file && (
                <p style={styles.fileName}>✅ {file.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Summary of selection */}
        {selectedSubProgram && month && file && (
          <div style={styles.summaryPreview}>
            <p style={styles.summaryLine}>
              <strong>Program:</strong> {selectedProgram.program}
            </p>
            <p style={styles.summaryLine}>
              <strong>Sub-Program:</strong> {selectedSubProgram.name}
            </p>
            <p style={styles.summaryLine}>
              <strong>Period:</strong> {MONTHS.find(m => m.value === Number(month))?.label} {year}
            </p>
            <p style={styles.summaryLine}>
              <strong>File:</strong> {file.name}
            </p>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div style={styles.errorBox}>{errorMsg}</div>
        )}

        {/* Upload button */}
        {status !== "success" && selectedSubProgram && (
          <button
            style={status === "loading" ? styles.btnDisabled : styles.btn}
            onClick={handleUpload}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Uploading and parsing..." : "📤 Upload File"}
          </button>
        )}

      </div>

      {/* Success result */}
      {status === "success" && result && (
        <div style={styles.successBox}>
          <h3 style={styles.successTitle}>✅ Upload Successful</h3>
          <p style={styles.successText}>
            The file was parsed and staged for review.
          </p>
          <div style={styles.resultGrid}>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Batch ID</span>
              <span style={styles.resultValue}>{result.batch_id}</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Rows Parsed</span>
              <span style={styles.resultValue}>{result.rows_parsed || 0}</span>
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
          <p style={styles.successNote}>
            Go to <strong>Staging Review</strong> tab to approve this batch.
            <br />
            Your Batch ID is: <strong>{result.batch_id}</strong>
          </p>
          <button style={styles.btn} onClick={handleReset}>
            Upload Another File
          </button>
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
  sub: {
    fontSize: "13px",
    color: "#5A6A85",
    margin: "0 0 28px 0",
    lineHeight: "1.5",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  row: { display: "flex", gap: "16px" },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1F2A45",
  },
  select: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    color: "#1F2A45",
    backgroundColor: "#ffffff",
    outline: "none",
  },
  filePicker: {
    border: "2px dashed #CBD5E1",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#F8FAFC",
  },
  fileInput: { fontSize: "13px" },
  fileName: {
    fontSize: "13px",
    color: "#16A34A",
    margin: "8px 0 0 0",
    fontWeight: "600",
  },
  summaryPreview: {
    backgroundColor: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "8px",
    padding: "16px 20px",
  },
  summaryLine: {
    fontSize: "13px",
    color: "#1E40AF",
    margin: "0 0 4px 0",
  },
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
  successText: {
    fontSize: "13px",
    color: "#15803D",
    margin: "0 0 20px 0",
  },
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
  successNote: {
    fontSize: "13px",
    color: "#5A6A85",
    margin: "0 0 20px 0",
    lineHeight: "1.6",
  },
};