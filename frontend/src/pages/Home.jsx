// frontend/src/pages/Home.jsx
// Home page — first thing users see after login
// Shows different data depending on role

import Navbar from "../components/Navbar";

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

// Fake program scorecard data — we replace with real API later
const allProgramScores = [
  { program: "Immunization", coverage: 91, status: "near" },
  { program: "Safe Motherhood", coverage: 96, status: "on" },
  { program: "Nutrition", coverage: 74, status: "below" },
  { program: "Child Care", coverage: 88, status: "near" },
  { program: "IMCI", coverage: 95, status: "on" },
  { program: "Family Planning", coverage: 79, status: "below" },
  { program: "Non-Communicable Diseases", coverage: 83, status: "near" },
  { program: "Infectious Diseases", coverage: 90, status: "near" },
];

// Fake alerts — we replace with real API later
const allAlerts = [
  { id: 1, type: "warning", program: "Immunization", message: "3 LGUs have not submitted data for April 2026" },
  { id: 2, type: "danger", program: "Nutrition", message: "Himamaylan City is critically below target at 55%" },
  { id: 3, type: "info", program: "Safe Motherhood", message: "Data for Q1 2026 is now complete" },
  { id: 4, type: "warning", program: "Child Care", message: "2 LGUs missing March 2026 report" },
];

function statusColor(status) {
  if (status === "on") return "#16A34A";
  if (status === "near") return "#EAB308";
  return "#DC2626";
}

function statusLabel(status) {
  if (status === "on") return "On Target";
  if (status === "near") return "Near Target";
  return "Below Target";
}

function alertColor(type) {
  if (type === "danger") return { bg: "#FEE2E2", border: "#DC2626", text: "#991B1B" };
  if (type === "warning") return { bg: "#FEF9C3", border: "#EAB308", text: "#854D0E" };
  return { bg: "#DBEAFE", border: "#0B4BAA", text: "#1E40AF" };
}

export default function Home() {
  const user = getUser();
  const isAdmin = ["admin", "mancom", "execom"].includes(user.role);

  // Filter programs based on role
  const programs = isAdmin
    ? allProgramScores
    : allProgramScores.filter(
        (p) => p.program.toLowerCase().replace(/ /g, "_") ===
          user.program_code?.toLowerCase()
      );

  // Filter alerts based on role
  const alerts = isAdmin
    ? allAlerts
    : allAlerts.filter(
        (a) => a.program.toLowerCase().replace(/ /g, "_") ===
          user.program_code?.toLowerCase()
      );

  // Summary counts
  const onTarget = programs.filter((p) => p.status === "on").length;
  const nearTarget = programs.filter((p) => p.status === "near").length;
  const belowTarget = programs.filter((p) => p.status === "below").length;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.body}>

        {/* Welcome */}
        <div style={styles.welcome}>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {user.sub || "User"} 👋
          </h1>
          <p style={styles.welcomeSub}>
            {new Date().toLocaleDateString("en-PH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            &nbsp;·&nbsp;
            {isAdmin ? "Viewing all programs" : `Viewing: ${user.program_code?.replace(/_/g, " ")}`}
          </p>
        </div>

        {/* Summary Cards */}
        <div style={styles.cardRow}>
          <div style={{ ...styles.card, borderTop: "4px solid #0B4BAA" }}>
            <p style={styles.cardLabel}>Total Programs</p>
            <p style={styles.cardNumber}>{programs.length}</p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #16A34A" }}>
            <p style={styles.cardLabel}>On Target</p>
            <p style={{ ...styles.cardNumber, color: "#16A34A" }}>{onTarget}</p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #EAB308" }}>
            <p style={styles.cardLabel}>Near Target</p>
            <p style={{ ...styles.cardNumber, color: "#EAB308" }}>{nearTarget}</p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #DC2626" }}>
            <p style={styles.cardLabel}>Below Target</p>
            <p style={{ ...styles.cardNumber, color: "#DC2626" }}>{belowTarget}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={styles.twoCol}>

          {/* Program Scorecard */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Program Scorecard</h2>
            <p style={styles.sectionSub}>Overall coverage per program</p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Program</th>
                  <th style={styles.th}>Coverage</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.program} style={styles.tr}>
                    <td style={styles.td}>{p.program}</td>
                    <td style={styles.td}>{p.coverage}%</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: statusColor(p.status) + "20",
                        color: statusColor(p.status),
                        border: `1px solid ${statusColor(p.status)}`,
                      }}>
                        {statusLabel(p.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alerts */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Alerts & Announcements</h2>
            <p style={styles.sectionSub}>Items that need your attention</p>
            {alerts.length === 0 ? (
              <p style={styles.noAlerts}>No alerts at this time.</p>
            ) : (
              alerts.map((a) => {
                const colors = alertColor(a.type);
                return (
                  <div key={a.id} style={{
                    ...styles.alert,
                    backgroundColor: colors.bg,
                    borderLeft: `4px solid ${colors.border}`,
                  }}>
                    <p style={{ ...styles.alertText, color: colors.text }}>
                      <strong>{a.program}</strong> — {a.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F0F4F8",
    fontFamily: "'Barlow', sans-serif",
  },
  body: {
    padding: "28px 32px",
  },
  welcome: {
    marginBottom: "24px",
  },
  welcomeTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#1F2A45",
    margin: "0 0 4px 0",
  },
  welcomeSub: {
    fontSize: "13px",
    color: "#5A6A85",
    margin: 0,
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  cardLabel: {
    fontSize: "11px",
    color: "#5A6A85",
    margin: "0 0 8px 0",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1F2A45",
    margin: 0,
    fontFamily: "'Montserrat', sans-serif",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  sectionTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "15px",
    fontWeight: "700",
    color: "#1F2A45",
    margin: "0 0 4px 0",
  },
  sectionSub: {
    fontSize: "12px",
    color: "#5A6A85",
    margin: "0 0 16px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#5A6A85",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "2px solid #F0F4F8",
  },
  tr: {
    borderBottom: "1px solid #F0F4F8",
  },
  td: {
    padding: "10px 12px",
    fontSize: "13px",
    color: "#1F2A45",
  },
  badge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  alertText: {
    fontSize: "13px",
    margin: 0,
    lineHeight: "1.5",
  },
  noAlerts: {
    fontSize: "13px",
    color: "#94A3B8",
    textAlign: "center",
    padding: "20px 0",
  },
};