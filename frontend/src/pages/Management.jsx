// frontend/src/pages/Management.jsx
// Admin only — Upload, Staging Review, History

import { useState } from "react";
import Navbar from "../components/Navbar";
import UploadTab from "../components/management/UploadTab";
import StagingTab from "../components/management/StagingTab";
import HistoryTab from "../components/management/HistoryTab";

export default function Management() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Page Title */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Management</h1>
          <p style={styles.pageSub}>Data upload, staging review, and upload history</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          <button
            style={activeTab === "upload" ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab("upload")}
          >
            📤 Upload
          </button>
          <button
            style={activeTab === "staging" ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab("staging")}
          >
            🔍 Staging Review
          </button>
          <button
            style={activeTab === "history" ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab("history")}
          >
            📋 Upload History
          </button>
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {activeTab === "upload" && <UploadTab />}
          {activeTab === "staging" && <StagingTab />}
          {activeTab === "history" && <HistoryTab />}
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
    marginLeft: "240px",
    padding: "28px 32px",
  },
  pageHeader: {
    marginBottom: "24px",
  },
  pageTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#1F2A45",
    margin: "0 0 4px 0",
  },
  pageSub: {
    fontSize: "13px",
    color: "#5A6A85",
    margin: 0,
  },
  tabRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    borderBottom: "2px solid #E2E8F0",
    paddingBottom: "0",
  },
  tab: {
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#5A6A85",
    cursor: "pointer",
    fontFamily: "'Barlow', sans-serif",
    marginBottom: "-2px",
  },
  tabActive: {
    color: "#0B4BAA",
    borderBottom: "3px solid #0B4BAA",
  },
  tabContent: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "28px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
};