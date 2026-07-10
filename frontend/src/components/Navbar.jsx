// frontend/src/components/Navbar.jsx
// Sidebar navigation — left side of the screen

import { useNavigate, useLocation } from "react-router-dom";
import { getUser, can, logout } from "../services/auth";
import { APP_VERSION, BUILD_TIME, APP_SEMVER } from "../version";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <div style={styles.sidebar}>

      <div style={styles.header}>
        <img src="/images/DOH SEAL - FULL COLOR.png" alt="DOH" style={styles.logo} />
        <div>
          <p style={styles.system}>FHSIS Dashboard</p>
          <p style={styles.agency}>NIR CHD</p>
        </div>
      </div>

      <div style={styles.nav}>

        <button
          style={isActive("/home") ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
          onClick={() => navigate("/home")}
        >
          🏠 Home
        </button>

        <div style={styles.navGroupLabel}>📊 ANALYTICS</div>
        <button
          style={isActive("/analytics/overview") ? { ...styles.navSub, ...styles.navSubActive } : styles.navSub}
          onClick={() => navigate("/analytics/overview")}
        >
          Overview
        </button>
        <button
          style={isActive("/analytics/coverage") ? { ...styles.navSub, ...styles.navSubActive } : styles.navSub}
          onClick={() => navigate("/analytics/coverage")}
        >
          Coverage
        </button>
        <button
          style={isActive("/analytics/trends") ? { ...styles.navSub, ...styles.navSubActive } : styles.navSub}
          onClick={() => navigate("/analytics/trends")}
        >
          Trends
        </button>
        <button
          style={isActive("/analytics/rankings") ? { ...styles.navSub, ...styles.navSubActive } : styles.navSub}
          onClick={() => navigate("/analytics/rankings")}
        >
          Rankings
        </button>
        <button
          style={isActive("/analytics/reports") ? { ...styles.navSub, ...styles.navSubActive } : styles.navSub}
          onClick={() => navigate("/analytics/reports")}
        >
          Indicator Reports
        </button>

        <div style={styles.navGroupLabel}>⚙️ OTHER</div>
        {can("can_upload") && (
          <button
            style={isActive("/upload") ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => navigate("/upload")}
          >
            ⬆️ Upload Data
          </button>
        )}
        {can("can_submit_esr") && (
          <button
            style={isActive("/esr/new") ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => navigate("/esr/new")}
          >
            📝 ESR Report
          </button>
        )}
        <button
          style={isActive("/targets") ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
          onClick={() => navigate("/targets")}
        >
          🎯 Program Targets
        </button>
        <button
          style={isActive("/data-availability") ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
          onClick={() => navigate("/data-availability")}
        >
          📋 Data Availability
        </button>

        {can("can_manage_users") && (
          <button
            style={isActive("/management") ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => navigate("/management")}
          >
            🔐 Management
          </button>
        )}

      </div>

      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <p style={styles.userName}>{user.sub || "User"}</p>
          <p style={styles.userRole}>
            {user.role?.replace(/_/g, " ").toUpperCase() || "STAFF"}
          </p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
        <p
          style={styles.version}
          title={
            BUILD_TIME
              ? `Version ${APP_SEMVER} · commit ${APP_VERSION} · started ${BUILD_TIME.slice(0, 16).replace("T", " ")} UTC`
              : `Version ${APP_SEMVER} · commit ${APP_VERSION}`
          }
        >
          v{APP_SEMVER} · {APP_VERSION}
        </p>
      </div>

    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    backgroundColor: "#1F2A45",
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    fontFamily: "'Barlow', sans-serif",
    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 20px 20px 20px",
    borderBottom: "1px solid #2D3B5C",
  },
  logo: { height: "40px", objectFit: "contain" },
  system: {
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "700",
    margin: 0,
    fontFamily: "'Montserrat', sans-serif",
  },
  agency: {
    color: "#94A3B8",
    fontSize: "10px",
    margin: "2px 0 0 0",
    letterSpacing: "0.5px",
  },
  nav: {
    flex: 1,
    padding: "16px 12px",
    overflowY: "auto",
  },
  navGroupLabel: {
    color: "#64748B",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    padding: "12px 12px 6px 12px",
    marginTop: "8px",
  },
  navItem: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    color: "#94A3B8",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "'Barlow', sans-serif",
    marginBottom: "2px",
  },
  navItemActive: {
    backgroundColor: "#0B4BAA",
    color: "#FFFFFF",
  },
  navSub: {
    display: "block",
    width: "100%",
    padding: "8px 12px 8px 28px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    color: "#94A3B8",
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "'Barlow', sans-serif",
    marginBottom: "2px",
  },
  navSubActive: {
    backgroundColor: "#0B4BAA",
    color: "#FFFFFF",
    fontWeight: "600",
  },
  footer: {
    padding: "16px 20px",
    borderTop: "1px solid #2D3B5C",
  },
  userInfo: {
    marginBottom: "10px",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "600",
    margin: 0,
  },
  userRole: {
    color: "#94A3B8",
    fontSize: "10px",
    letterSpacing: "0.5px",
    margin: "2px 0 0 0",
  },
  logoutBtn: {
    width: "100%",
    backgroundColor: "transparent",
    border: "1px solid #475569",
    color: "#EEFAF6",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  version: {
    color: "#64748B",
    fontSize: "10px",
    fontFamily: "'Barlow', monospace",
    letterSpacing: "0.5px",
    margin: "10px 0 0 0",
    textAlign: "center",
    cursor: "default",
  },
};