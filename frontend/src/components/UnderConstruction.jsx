// frontend/src/components/UnderConstruction.jsx
// Reusable placeholder for pages not yet built

import { useNavigate } from "react-router-dom";

export default function UnderConstruction({ title, description, target }) {
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.iconRow}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0B4BAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
            <path d="M9 9l2 2 4-4"/>
          </svg>
        </div>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.description}>{description}</p>
        <div style={styles.badge}>
          Expected Release: {target}
        </div>
        <button style={styles.backBtn} onClick={() => navigate("/home")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Barlow', sans-serif",
    marginLeft: "240px",
    backgroundColor: "#F0F4F8",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "48px 40px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 4px 24px rgba(31, 42, 69, 0.08)",
    borderTop: "5px solid #0B4BAA",
    textAlign: "center",
  },
  iconRow: {
    marginBottom: "20px",
  },
  title: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#1F2A45",
    margin: "0 0 12px 0",
  },
  description: {
    fontSize: "14px",
    color: "#5A6A85",
    lineHeight: "1.6",
    margin: "0 0 24px 0",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    fontSize: "12px",
    fontWeight: "600",
    padding: "6px 16px",
    borderRadius: "20px",
    marginBottom: "28px",
  },
  backBtn: {
    display: "block",
    width: "100%",
    padding: "12px",
    backgroundColor: "#0B4BAA",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
};