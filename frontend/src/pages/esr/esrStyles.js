// esrStyles.js
// Shared style tokens for the ESR Verification Form page + its section
// components. Values are lifted directly from the dedicated design handoff
// (design_handoff_esr_verification_form/ESR Verification Form.dc.html) —
// treat that file as ground truth if these ever need to change.

export const colors = {
  pageBg: "#eef1f7",
  cardBg: "#ffffff",
  cardBorder: "#e4e8ef",
  headerBg: "#0c1424",
  sectionHeading: "#15764a",
  labelAccent: "#a3835f",
  textPrimary: "#1f2733",
  textSecondary: "#4a5568",
  textMuted: "#5b6472",
  textFaint: "#8a94a3",
  headerEyebrow: "#7f8ba0",
  headerLink: "#cdd6e4",
  disclaimer: "#c08c8c",
  inputUnderline: "#cbd2dd",
  inputFocus: "#15764a",
  tableBorder: "#d8dee7",
  tableHeaderBg: "#f4f7fb",
  darkTitle: "#111826",
};

export const fonts = {
  heading: "'Poppins', system-ui, sans-serif",
  body: "'Mulish', system-ui, sans-serif",
};

export const esrStyles = {
  page: { minHeight: "100vh", background: colors.pageBg, fontFamily: fonts.body, color: colors.textPrimary, paddingBottom: "64px" },
  header: { background: colors.headerBg, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: "64px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  logoSlot: { width: "44px", height: "44px", flex: "0 0 44px", borderRadius: "50%", background: "#f2f4f8", border: "2px solid #ffffff" },
  headerTextCol: { display: "flex", flexDirection: "column", gap: "1px", lineHeight: 1.1 },
  headerEyebrow: { fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px", color: colors.headerEyebrow, textTransform: "uppercase" },
  headerTitle: { fontFamily: fonts.heading, fontWeight: 700, fontSize: "19px", color: "#ffffff", letterSpacing: ".3px" },
  headerLink: { fontSize: "14px", color: colors.headerLink, textDecoration: "none", cursor: "pointer" },

  content: { maxWidth: "1240px", margin: "0 auto", padding: "28px 32px 0" },

  card: { background: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: "10px", padding: "28px 32px", marginBottom: "22px" },
  identityCard: { background: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: "10px", padding: "26px 32px", marginBottom: "22px" },

  sectionHeading: { fontFamily: fonts.heading, fontWeight: 700, fontSize: "17px", color: colors.sectionHeading, letterSpacing: ".5px", margin: "0 0 22px" },
  subHeading: { fontWeight: 700, fontSize: "15px", color: colors.textPrimary, margin: "32px 0 20px" },
  subHeadingSmall: { fontWeight: 700, fontSize: "14px", color: colors.textPrimary, marginBottom: "4px" },
  helperText: { fontSize: "12.5px", color: colors.textFaint, marginBottom: "10px", lineHeight: 1.5 },

  fieldLabel: { fontSize: "14px", color: colors.labelAccent, fontWeight: 600 },
  fieldLabelSmall: { fontSize: "12.5px", color: colors.labelAccent, fontWeight: 600, marginBottom: "2px" },
  bodyLabel: { fontSize: "14px", color: colors.textSecondary },

  ulInput: { width: "100%", border: "none", borderBottom: `1px solid ${colors.inputUnderline}`, background: "transparent", padding: "6px 2px", fontSize: "15px", color: colors.textPrimary, outline: "none", fontFamily: fonts.body },
  cellInput: { width: "100%", border: "none", background: "transparent", padding: "8px 10px", fontSize: "14px", color: colors.textPrimary, outline: "none", fontFamily: fonts.body, minHeight: "40px" },
  textarea: { width: "100%", border: `1px solid ${colors.inputUnderline}`, borderRadius: "8px", background: "transparent", padding: "12px 14px", fontSize: "14.5px", color: colors.textPrimary, outline: "none", resize: "vertical", fontFamily: fonts.body },

  chk: { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14.5px", color: "#2b3543", cursor: "pointer" },
  checkboxInput: { accentColor: colors.sectionHeading, width: "17px", height: "17px", cursor: "pointer", flex: "0 0 17px" },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { border: `1px solid ${colors.tableBorder}`, textAlign: "left", verticalAlign: "top", background: colors.tableHeaderBg, fontWeight: 700, fontSize: "12.5px", color: colors.textSecondary, padding: "9px 10px" },
  td: { border: `1px solid ${colors.tableBorder}`, textAlign: "left", verticalAlign: "top", padding: 0 },
  tdText: { padding: "10px 12px", fontSize: "14px", color: "#2b3543", border: `1px solid ${colors.tableBorder}` },
  addRowHint: { fontSize: "12.5px", color: colors.textFaint, fontStyle: "italic", marginTop: "8px" },
  removeRowBtn: { border: "none", background: "transparent", color: "#b91c1c", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "4px 8px" },
  addRowBtn: { border: `1px solid ${colors.sectionHeading}`, background: "#fff", color: colors.sectionHeading, borderRadius: "6px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginTop: "10px" },

  threeUpBox: { border: `1px solid ${colors.cardBorder}`, borderRadius: "8px", padding: "18px" },
  threeUpBoxTitle: { fontWeight: 700, fontSize: "13.5px", color: colors.textPrimary, marginBottom: "16px" },
  threeUpBoxSub: { fontWeight: 400, color: colors.textFaint },

  disclaimer: { fontSize: "13px", color: colors.disclaimer, lineHeight: 1.55, marginTop: "18px" },

  footer: { fontSize: "12px", color: colors.textFaint, lineHeight: 1.6, padding: "4px 4px 0" },
  footerDisclaimer: { marginTop: "10px", fontStyle: "italic" },

  actionsRow: { display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "30px", paddingBottom: "8px" },
  buttonBase: { fontFamily: fonts.body, fontSize: "15px", fontWeight: 600, borderRadius: "8px", padding: "13px 28px", cursor: "pointer" },
  buttonSecondary: { color: colors.sectionHeading, background: "#ffffff", border: `1px solid ${colors.sectionHeading}` },
  buttonPrimary: { color: "#ffffff", background: colors.sectionHeading, border: `1px solid ${colors.sectionHeading}` },

  banner: { padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" },
  errorBanner: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  infoBanner: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
};
