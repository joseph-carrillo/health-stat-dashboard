// frontend/src/components/management/HistoryTab.jsx

import { useState, useEffect } from "react";

function formatDate(iso) {
  if (!iso || iso === "None") return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function shortBatchId(id) {
  if (!id) return "—";
  return id.slice(0, 8) + "…";
}

export default function HistoryTab() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/batches/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.batches) setBatches(data.batches);
        else setError("Unexpected response from server.");
      })
      .catch(() => setError("Cannot connect to server. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Upload History</h2>
      <p style={styles.sub}>All data uploads — pending and approved.</p>

      {loading && <div style={styles.loading}>Loading history…</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {!loading && !error && batches.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No uploads yet.</p>
          <p style={styles.emptySub}>Upload data via the Upload tab to see history here.</p>
        </div>
      )}

      {!loading && batches.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Batch ID</th>
                <th style={styles.th}>Source File</th>
                <th style={styles.th}>Rows</th>
                <th style={styles.th}>Conflicts</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Uploaded</th>
                <th style={styles.th}>Approved</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b, i) => (
                <tr key={b.batch_id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={{ ...styles.td, fontFamily: "monospace", fontSize: "12px" }}>
                    <span title={b.batch_id}>{shortBatchId(b.batch_id)}</span>
                  </td>
                  <td style={styles.td}>{b.source_file}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{b.total_rows.toLocaleString()}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {b.conflicts_resolved > 0
                      ? <span style={styles.conflictBadge}>{b.conflicts_resolved} resolved</span>
                      : <span style={styles.noConflict}>None</span>
                    }
                    {b.conflicts_pending > 0 &&
                      <span style={styles.pendingBadge}>{b.conflicts_pending} pending</span>
                    }
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <span style={b.status === "approved" ? styles.statusApproved : styles.statusPending}>
                      {b.status === "approved" ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontSize: "12px", color: "#5A6A85" }}>
                    {formatDate(b.uploaded_at)}
                  </td>
                  <td style={{ ...styles.td, fontSize: "12px", color: "#5A6A85" }}>
                    {formatDate(b.approved_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: "960px" },
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
  loading: {
    padding: "32px",
    textAlign: "center",
    color: "#5A6A85",
    fontSize: "14px",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "13px",
  },
  empty: {
    backgroundColor: "#F8FAFC",
    border: "1px dashed #CBD5E1",
    borderRadius: "10px",
    padding: "40px",
    textAlign: "center",
  },
  emptyText: {
    fontSize: "15px",
    color: "#1F2A45",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
  emptySub: {
    fontSize: "13px",
    color: "#94A3B8",
    margin: 0,
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
    fontSize: "13px",
  },
  th: {
    padding: "10px 14px",
    backgroundColor: "#1F2A45",
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "left",
    whiteSpace: "nowrap",
    fontSize: "11px",
    letterSpacing: "0.3px",
  },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #E2E8F0",
    color: "#1F2A45",
    whiteSpace: "nowrap",
  },
  trEven: { backgroundColor: "#ffffff" },
  trOdd: { backgroundColor: "#F8FAFC" },
  statusApproved: {
    display: "inline-block",
    padding: "3px 10px",
    backgroundColor: "#DCFCE7",
    color: "#15803D",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    border: "1px solid #16A34A",
  },
  statusPending: {
    display: "inline-block",
    padding: "3px 10px",
    backgroundColor: "#FEF9C3",
    color: "#854D0E",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    border: "1px solid #EAB308",
  },
  conflictBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  pendingBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    marginLeft: "4px",
  },
  noConflict: {
    fontSize: "12px",
    color: "#94A3B8",
  },
};
