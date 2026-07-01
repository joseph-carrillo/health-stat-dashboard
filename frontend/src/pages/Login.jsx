// frontend/src/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/home");

    } catch {
      setError("Cannot connect to server. Is the API running?");
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>

      {/* This is the watermark — it sits behind everything */}
      <img
        src="/images/DOH SEAL - FULL COLOR.png"
        alt=""
        style={styles.watermark}
      />

      {/* This is the white login card on top */}
      <div style={styles.card}>

        <div style={styles.logoRow}>
          <img src="/images/DOH SEAL - FULL COLOR.png" alt="DOH Seal" style={styles.logo} />
          <img src="/images/bagong-pilipinas-logo.png" alt="Bagong Pilipinas" style={styles.logo} />
          <img src="/images/fhsis_V2_transparent.png" alt="FHSIS NIR" style={styles.logo} />
        </div>

        <p style={styles.agency1}>Department of Health</p>
        <p style={styles.agency2}>Negros Island Region Center for Health Development</p>

        <h1 style={styles.title}>
          Field Health Services Information System <br /> Dashboard V2.0
        </h1>

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

          <div style={styles.passwordWrapper}>
            <input
              style={styles.passwordInput}
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
              </button>
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
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#EEFAF6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Barlow', sans-serif",
  },
  watermark: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "420px",
    opacity: 0.07,
    pointerEvents: "none",
    zIndex: 0,
  },
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "40px 40px",
    width: "100%",
    maxWidth: "460px",
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
    height: "80px",
    objectFit: "contain",
  },
  agency1: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    color: "#5A6A85",
    textAlign: "center",
    margin: "0 0 2px 0",
  },
  agency2: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    color: "#5A6A85",
    textAlign: "center",
    margin: "0 0 16px 0",
    whiteSpace: "nowrap",
  },
  title: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "17px",
    fontWeight: "700",
    color: "#1F2A45",
    textAlign: "center",
    margin: "0 0 28px 0",
    lineHeight: "1.4",
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
  passwordWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #CBD5E1",
    borderRadius: "6px",
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    padding: "10px 14px",
    border: "none",
    fontSize: "14px",
    color: "#1F2A45",
    outline: "none",
  },
  eyeBtn: {
    backgroundColor: "transparent",
    border: "none",
    padding: "0 12px",
    cursor: "pointer",
    fontSize: "16px",
  },
};