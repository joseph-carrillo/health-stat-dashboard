// frontend/src/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = new URLSearchParams();
      body.append("username", formData.username);
      body.append("password", formData.password);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Login failed. Check your credentials.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("token_type", data.token_type);
      navigate("/dashboard");

    } catch (err) {
      setError("Cannot connect to server. Is the API running?");
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* 3 Logos in a row */}
        <div style={styles.logoRow}>
          <img src="/images/DOH SEAL - FULL COLOR.png" alt="DOH Seal" style={styles.logo} />
          <img src="/images/bagong-pilipinas-logo.png" alt="Bagong Pilipinas" style={styles.logo} />
          <img src="/images/fhsis_V2_transparent.png" alt="FHSIS NIR" style={styles.logo} />
        </div>

        {/* Agency name lines — no big gap between them */}
        <p style={styles.agency1}>Department of Health</p>
        <p style={styles.agency2}>Negros Island Region Center for Health Development</p>

        {/* System title */}
        <h1 style={styles.title}>
          Field Health Services Information System <br /> Dashboard V2.0
        </h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          For access requests, please contact your system administrator.
          <br />
          Official use only.
        </p>

      </div>
    </div>
  );
}

// --- All Styles ---
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#EEFAF6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Barlow', sans-serif",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "40px 40px",
    width: "100%",
    maxWidth: "460px",       // wide enough so text fits on one line
    boxShadow: "0 4px 24px rgba(31, 42, 69, 0.12)",
    borderTop: "5px solid #0B4BAA",
  },
  logoRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginBottom: "12px",
  },
  logo: {
    height: "100px",
    objectFit: "contain",
  },
  // "Department of Health" — first line
  agency1: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    color: "#5A6A85",
    textAlign: "center",
    margin: "0 0 2px 0",     // tiny gap below — connects visually to agency2
  },
  // "Negros Island Region..." — second line, no gap from agency1
  agency2: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    color: "#5A6A85",
    textAlign: "center",
    margin: "0 0 16px 0",    // normal gap below before the title
    whiteSpace: "nowrap",    // keep on one line
  },
  // "Field Health Services Information System Dashboard V2.0"
  title: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "17px",
    fontWeight: "700",
    color: "#1F2A45",
    textAlign: "center",
    margin: "0 0 28px 0",
    whiteSpace: "nowrap",    // keep on one line
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1F2A45",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    color: "#1F2A45",
    outline: "none",
  },
  button: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#0B4BAA",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "0.5px",
  },
  buttonDisabled: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#93B4DC",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "not-allowed",
    fontFamily: "'Montserrat', sans-serif",
  },
  error: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: "10px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    margin: "0",
  },
  footer: {
    marginTop: "24px",
    fontSize: "11px",
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: "1.5",
  },
};