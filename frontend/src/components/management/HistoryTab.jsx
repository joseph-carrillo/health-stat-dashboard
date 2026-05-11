// frontend/src/components/management/HistoryTab.jsx

export default function HistoryTab() {
  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Upload History</h2>
      <p style={styles.sub}>
        Record of all committed data uploads.
      </p>
      <div style={styles.placeholder}>
        <p style={styles.placeholderText}>
          Upload history will appear here once data has been committed.
        </p>
        <p style={styles.placeholderSub}>
          Expected Release: June 2026
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: "800px" },
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
  },
  placeholder: {
    backgroundColor: "#F8FAFC",
    border: "2px dashed #CBD5E1",
    borderRadius: "10px",
    padding: "48px",
    textAlign: "center",
  },
  placeholderText: {
    fontSize: "14px",
    color: "#5A6A85",
    margin: "0 0 8px 0",
  },
  placeholderSub: {
    fontSize: "12px",
    color: "#94A3B8",
    margin: 0,
  },
};