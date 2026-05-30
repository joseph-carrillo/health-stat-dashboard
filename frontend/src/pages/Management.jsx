// frontend/src/pages/Management.jsx
// Admin console: pending approvals, user list, and audit trail.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getAllUsers,
  getPendingUsers,
  assignRole,
  deactivateUser,
  getPrograms,
  getAuditLog,
} from "../services/api";

const ROLES = ["admin", "data_encoder", "program_manager", "mancom", "execom"];

export default function Management() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [audit, setAudit] = useState([]);
  const [assignSel, setAssignSel] = useState({});
  const [info, setInfo] = useState("");

  function loadAll() {
    getPendingUsers().then((r) => setPending(r.users || [])).catch(() => {});
    getAllUsers().then((r) => setUsers(r.users || [])).catch(() => {});
    getAuditLog(50).then((r) => setAudit(r.entries || [])).catch(() => {});
  }

  useEffect(() => {
    loadAll();
    getPrograms().then((r) => setPrograms(r.programs || [])).catch(() => {});
  }, []);

  async function handleAssign(userId) {
    const sel = assignSel[userId] || {};
    if (!sel.role) {
      setInfo("Pick a role first.");
      return;
    }
    try {
      await assignRole(userId, sel.role, sel.program_code || "");
      setInfo("Role assigned and account activated.");
      loadAll();
    } catch {
      setInfo("Could not assign role.");
    }
  }

  async function handleDeactivate(userId, username) {
    if (!window.confirm(`Deactivate ${username}?`)) return;
    try {
      await deactivateUser(userId);
      setInfo(`${username} deactivated.`);
      loadAll();
    } catch {
      setInfo("Could not deactivate user.");
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Management</h1>
            <p style={styles.subtitle}>User accounts, roles, and audit trail.</p>
          </div>
          <button style={styles.uploadBtn} onClick={() => navigate("/upload")}>
            ⬆️ Go to Upload
          </button>
        </div>

        <div style={styles.tabs}>
          <Tab id="pending" tab={tab} setTab={setTab} label={`Pending (${pending.length})`} />
          <Tab id="users" tab={tab} setTab={setTab} label={`All Users (${users.length})`} />
          <Tab id="audit" tab={tab} setTab={setTab} label="Audit Log" />
        </div>

        {info && <p style={styles.info}>{info}</p>}

        {tab === "pending" && (
          <div style={styles.section}>
            {pending.length === 0 ? (
              <p style={styles.empty}>No pending accounts.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Full Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Program</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((u) => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>{u.username}</td>
                      <td style={styles.td}>{u.full_name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <select
                          style={styles.miniSelect}
                          value={(assignSel[u.id] || {}).role || ""}
                          onChange={(e) => setAssignSel((s) => ({ ...s, [u.id]: { ...s[u.id], role: e.target.value } }))}
                        >
                          <option value="">Select role</option>
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td style={styles.td}>
                        <select
                          style={styles.miniSelect}
                          value={(assignSel[u.id] || {}).program_code || ""}
                          onChange={(e) => setAssignSel((s) => ({ ...s, [u.id]: { ...s[u.id], program_code: e.target.value } }))}
                        >
                          <option value="">None</option>
                          {programs.map((p) => <option key={p.code} value={p.code}>{p.code}</option>)}
                        </select>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.saveBtn} onClick={() => handleAssign(u.id)}>Activate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "users" && (
          <div style={styles.section}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Full Name</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Program</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Last Login</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.username}</td>
                    <td style={styles.td}>{u.full_name}</td>
                    <td style={styles.td}>{u.role || "—"}</td>
                    <td style={styles.td}>{u.program_code || "—"}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: u.is_active ? "#DCFCE7" : "#FEE2E2", color: u.is_active ? "#166534" : "#991B1B" }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={styles.td}>{u.last_login ? new Date(u.last_login).toLocaleString() : "—"}</td>
                    <td style={styles.td}>
                      {u.username !== "admin" && u.is_active && (
                        <button style={styles.dangerBtn} onClick={() => handleDeactivate(u.id, u.username)}>
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "audit" && (
          <div style={styles.section}>
            {audit.length === 0 ? (
              <p style={styles.empty}>No audit entries.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>When</th>
                    <th style={styles.th}>Actor</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Entity</th>
                    <th style={styles.th}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((a) => (
                    <tr key={a.id} style={styles.tr}>
                      <td style={styles.td}>{new Date(a.created_at).toLocaleString()}</td>
                      <td style={styles.td}>{a.actor || "—"}</td>
                      <td style={styles.td}>{a.action}</td>
                      <td style={styles.td}>{a.entity_type ? `${a.entity_type} ${a.entity_id || ""}` : "—"}</td>
                      <td style={styles.tdMono}>{a.details ? JSON.stringify(a.details) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ id, tab, setTab, label }) {
  const active = tab === id;
  return (
    <button
      style={{ ...styles.tab, ...(active ? styles.tabActive : {}) }}
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "24px 32px", marginLeft: "240px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  title: { fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#5A6A85", margin: 0 },
  uploadBtn: { padding: "10px 18px", backgroundColor: "#0B4BAA", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Montserrat', sans-serif" },
  tabs: { display: "flex", gap: "8px", marginBottom: "16px" },
  tab: { padding: "8px 16px", backgroundColor: "#fff", color: "#5A6A85", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  tabActive: { backgroundColor: "#0B4BAA", color: "#fff", borderColor: "#0B4BAA" },
  info: { backgroundColor: "#DBEAFE", color: "#1E40AF", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" },
  section: { backgroundColor: "#fff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  empty: { fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "30px 0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: "11px", fontWeight: "700", color: "#5A6A85", textTransform: "uppercase", letterSpacing: "0.5px", padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #F0F4F8" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  td: { padding: "9px 12px", fontSize: "13px", color: "#1F2A45" },
  tdMono: { padding: "9px 12px", fontSize: "11px", color: "#5A6A85", fontFamily: "monospace", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  miniSelect: { padding: "5px 8px", borderRadius: "5px", border: "1px solid #CBD5E1", fontSize: "12px" },
  saveBtn: { padding: "5px 12px", backgroundColor: "#16A34A", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  dangerBtn: { padding: "5px 12px", backgroundColor: "#fff", color: "#DC2626", border: "1px solid #DC2626", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
};
