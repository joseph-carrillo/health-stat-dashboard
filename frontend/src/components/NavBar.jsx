// frontend/src/components/Navbar.jsx
// Top navigation bar — shows different tabs based on role

import { useNavigate, useLocation } from "react-router-dom";

// Read user info from the JWT token saved in localStorage
function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // These tabs show for everyone
  const baseTabs = [
    { label: "Home", path: "/home" },
    { label: "Analytics", path: "/analytics/overview" },
  ];

  // Management tab — admin only
  const adminTabs =
    user.role === "admin"
      ? [{ label: "Management", path: "/management" }]
      : [];

  const allTabs = [...baseTabs, ...adminTabs];

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    navigate("/");
  }

  // Check if a tab is currently active
  function isActive(path) {
    return location.pathname.startsWith(path.split("/")[1] === "analytics"
      ? "/analytics"
      : path);
  }

  return (
    <div style={styles.wrapper}>

      {/* Left side — logos and title */}
      <div style={styles.left}>
        <img
          src="/images/DOH SEAL - FULL COLOR.png"
          alt="DOH"
          style={styles.logo}
        />
        <div>
          <p style={styles.agency}>Department of Health — NIR CHD</p>
          <p style={styles.system}>FHSIS Dashboard V2.0</p>
        </div>
      </div>

      {/* Center — navigation tabs */}
      <div style={styles.tabs}>
        {allTabs.map((tab) => (
          <button
            key={tab.path}
            style={
              isActive(tab.path)
                ? { ...styles.tab, ...styles.tabActive }
                : styles.tab
            }
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right side — user info and logout */}
      <div style={styles.right}>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user.sub || "User"}</span>
          <span style={styles.userRole}>
            {user.role?.replace(/_/g, " ").toUpperCase() || "STAFF"}
          </span>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </div>

    </div>
  );
}

const styles = {
  wrapper: {
    backgroundColor: "#1F2A45",
    padding: "10px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    height: "40px",
    objectFit: "contain",
  },
  agency: {
    color: "#EEFAF6",
    fontSize: "10px",
    margin: 0,
    letterSpacing: "0.3px",
  },
  system: {
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "700",
    margin: "2px 0 0 0",
    fontFamily: "'Montserrat', sans-serif",
  },
  tabs: {
    display: "flex",
    gap: "4px",
  },
  tab: {
    backgroundColor: "transparent",
    border: "none",
    color: "#94A3B8",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Barlow', sans-serif",
    transition: "all 0.2s",
  },
  tabActive: {
    backgroundColor: "#0B4BAA",
    color: "#FFFFFF",
    borderBottom: "3px solid #EEFAF6",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "600",
  },
  userRole: {
    color: "#94A3B8",
    fontSize: "10px",
    letterSpacing: "0.5px",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid #475569",
    color: "#EEFAF6",
    padding: "7px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
};