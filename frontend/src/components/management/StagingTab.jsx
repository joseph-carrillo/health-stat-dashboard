// frontend/src/components/management/StagingTab.jsx

import { useState } from "react";

export default function StagingTab() {
  const [batchId, setBatchId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);

  const token = localStorage.getItem("token");

  async function handleLoad() {
    if (!batchId.trim()) {
      setError("Please enter a Batch ID.");
      return;
    }
    setError("");
    setLoading(true);
    setSummary(null);
    setApproved(false);

    try {
      const response = await fetch(`/api/staging/${batchId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Batch not found.");
        setLoading(false);
        return;
      }

      setSummary(data);
    } catch {
      setError("Cannot connect to server.");
    }

    setLoading(false);
  }

  function handleApprove() {
    setConfirmPending(true);
  }

  async function handleConfirmApprove() {
    setConfirmPending(false);
    setApproving(true);

    try {
      const response = await fetch(`/api/staging/${batchId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Approval failed.");
        setApproving(false);
        return;
      }

      setApproved(true);
    } catch {
      setError("Cannot connect to server.");
    }

    setApproving(false);
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Staging Review</h2>
      <p style={styles.sub}>
        Enter the Batch ID from your upload to review parsed data before committing to the database.
      </p>

      {/* Batch ID input */}
      <div style={styles.searchRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter Batch ID..."
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />
        <button style={styles.btn} onClick={handleLoad} disabled={loading}>
          {loading ? "Loading..." : "Load Batch"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Summary */}
      {summary && !approved && (
        <div style={styles.summaryBox}>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Batch ID</span>
              <span style={styles.summaryValue}>{summary.batch_id}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Rows</span>
              <span style={styles.summaryValue}>{summary.total_rows || 0}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Passed DQC</span>
              <span style={{ ...styles.summaryValue, color: "#16A34A" }}>
                {summary.passed ?? 0}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Failed DQC</span>
              <span style={{ ...styles.summaryValue, color: (summary.failed || 0) > 0 ? "#DC2626" : "#16A34A" }}>
                {summary.failed ?? 0}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Conflicts</span>
              <span style={{ ...styles.summaryValue, color: summary.conflicts > 0 ? "#DC2626" : "#16A34A" }}>
                {summary.conflicts || 0}
              </span>
            </div>
          </div>

          {(summary.failed || 0) > 0 && (
            <p style={styles.dqcWarn}>
              Some rows failed automatic checks (often DPT dose order). You can still approve —
              data will be committed for review. Re-upload later if you fix the Excel file.
            </p>
          )}

          {/* Approve / confirm */}
          {confirmPending ? (
            <div style={styles.confirmBox}>
              <p style={styles.confirmMsg}>
                You are about to commit{" "}
                <strong>{(summary.total_rows || 0).toLocaleString()}</strong> rows
                to the database
                {(summary.failed || 0) > 0
                  ? ` (including ${summary.failed} rows that failed DQC checks)`
                  : ""}.
                This action cannot be undone. Are you sure?
              </p>
              <div style={styles.confirmButtons}>
                <button style={styles.commitBtn} onClick={handleConfirmApprove}>
                  Yes, Commit Data
                </button>
                <button style={styles.cancelBtn} onClick={() => setConfirmPending(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              style={approving ? styles.btnDisabled : styles.approveBtn}
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? "Approving..." : "✅ Approve and Commit to Database"}
            </button>
          )}
        </div>
      )}

      {/* Approved message */}
      {approved && (
        <div style={styles.successBox}>
          <h3 style={styles.successTitle}>✅ Batch Approved</h3>
          <p style={styles.successText}>
            Data has been committed to the database successfully.
          </p>
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
    margin: "0 0 24px 0",
    lineHeight: "1.5",
  },
  searchRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    color: "#1F2A45",
    outline: "none",
  },
  btn: {
    padding: "10px 20px",
    backgroundColor: "#0B4BAA",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  summaryBox: {
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "24px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "24px",
  },
  summaryItem: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#5A6A85",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  summaryValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1F2A45",
    fontFamily: "'Montserrat', sans-serif",
  },
  approveBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#16A34A",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
  btnDisabled: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#94A3B8",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
    fontFamily: "'Montserrat', sans-serif",
  },
  confirmBox: {
    backgroundColor: "#FFFBEB",
    border: "1px solid #FCD34D",
    borderRadius: "8px",
    padding: "16px 20px",
  },
  dqcWarn: {
    fontSize: "13px",
    color: "#854D0E",
    background: "#FEF9C3",
    border: "1px solid #EAB308",
    borderRadius: "8px",
    padding: "12px 14px",
    margin: "0 0 16px 0",
    lineHeight: "1.5",
  },
  confirmMsg: {
    fontSize: "13px",
    color: "#92400E",
    margin: "0 0 16px 0",
    lineHeight: "1.6",
  },
  confirmButtons: {
    display: "flex",
    gap: "12px",
  },
  commitBtn: {
    padding: "10px 20px",
    backgroundColor: "#16A34A",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#94A3B8",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
  successBox: {
    backgroundColor: "#F0FDF4",
    border: "1px solid #16A34A",
    borderRadius: "10px",
    padding: "24px",
    marginTop: "20px",
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
    margin: 0,
  },
};