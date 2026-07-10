// Shared chrome for the public PHRIC pages: gov bar, cluster header, footer,
// sign-in pill, and small inline icons. Recreated from the design handoff
// prototypes (design_handoff_phric_site). The prototypes' "Sign in with
// Google" is design-only — the real app uses JWT auth, so every sign-in
// trigger routes to /login instead.

import { useState } from "react";
import { Link } from "react-router-dom";
import { T, PHRIC_LOGO } from "./publicTheme";
import "./public.css";

export function LockIcon({ size = 12, color = "currentColor", style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={size >= 30 ? 1.5 : 2}
      style={style}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function SignInPill({ large = false, outline = false }) {
  const pillStyle = {
    ...styles.signInPill,
    ...(large ? { padding: "11px 22px", borderRadius: 4 } : {}),
    ...(outline ? { border: "1.5px solid #DADCE0", borderRadius: 4, padding: "10px 20px" } : {}),
  };
  const iconSize = large ? 18 : 16;
  return (
    <Link to="/login" style={pillStyle}>
      <img src={PHRIC_LOGO} alt="" style={{ width: iconSize, height: iconSize, flex: "none" }} />
      <span
        style={{
          fontFamily: T.sora,
          fontSize: large ? 13.5 : 12.5,
          fontWeight: 600,
          color: "#3C4043",
        }}
      >
        Staff Sign In
      </span>
    </Link>
  );
}

export function GovBar({ text }) {
  return (
    <div style={styles.govBar} className="r-ph">
      <span style={styles.govText}>{text}</span>
      <div style={{ display: "flex", gap: 20 }} className="r-hide">
        <span style={styles.govLink}>Transparency Seal</span>
        <span style={styles.govLink}>FOI</span>
      </div>
    </div>
  );
}

export function ClusterHeader({ title, navLinks = [], cta }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <>
      <div style={styles.header} className="r-ph">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={PHRIC_LOGO} alt="DOH" style={{ width: 50, height: 50 }} />
          <div>
            <div style={styles.headerKicker}>PHRIC · NIR-CHD</div>
            <div style={styles.headerTitle}>{title}</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 22, alignItems: "center" }} className="r-hide">
          <Link to="/" style={styles.homeLink}>← PHRIC Home</Link>
          {navLinks.map((label) => (
            <span key={label} style={styles.navLink}>{label}</span>
          ))}
          {cta && <Link to={cta.to} style={styles.ctaButton}>{cta.label}</Link>}
          <SignInPill />
        </nav>
        <div
          style={{ cursor: "pointer", padding: 6 }}
          className="r-show"
          onClick={() => setNavOpen((open) => !open)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </div>
      </div>
      {navOpen && (
        <div style={styles.mobileNav}>
          <Link to="/" style={styles.mobileLink}>← PHRIC Home</Link>
          {navLinks.map((label) => (
            <span key={label} style={styles.mobileLink}>{label}</span>
          ))}
          {cta && <Link to={cta.to} style={styles.mobileCta}>{cta.label}</Link>}
          <div style={{ marginTop: 14 }}>
            <SignInPill />
          </div>
        </div>
      )}
    </>
  );
}

export function ClusterFooter({ title }) {
  return (
    <div style={styles.footer} className="r-p">
      <div style={styles.footerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={PHRIC_LOGO} alt="" style={{ width: 36, height: 36 }} />
          <div>
            <div style={styles.footerTitle}>{title}</div>
            <div style={styles.footerSub}>DOH · NIR-CHD · Bacolod City</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <span style={styles.footerContact}>phric.nir@doh.gov.ph</span>
          <span style={styles.footerContact}>(034) 709-0000</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  govBar: {
    background: T.brand,
    padding: "7px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  govText: { color: "rgba(255,255,255,.6)", fontSize: 11, letterSpacing: ".04em" },
  govLink: { color: "rgba(255,255,255,.5)", fontSize: 11, cursor: "pointer" },
  signInPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    borderRadius: 3,
    padding: "9px 16px",
    cursor: "pointer",
    textDecoration: "none",
  },
  header: {
    background: T.navy,
    padding: "15px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerKicker: {
    fontSize: 9.5,
    color: "rgba(255,255,255,.38)",
    letterSpacing: ".07em",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: T.sora,
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-.01em",
  },
  homeLink: { color: "rgba(255,255,255,.45)", fontSize: 12.5, textDecoration: "none" },
  navLink: { color: "rgba(255,255,255,.62)", fontSize: 12.5, cursor: "pointer" },
  ctaButton: {
    background: T.brand,
    color: "#fff",
    fontSize: 12.5,
    fontWeight: 600,
    padding: "9px 18px",
    textDecoration: "none",
    borderRadius: 2,
  },
  mobileNav: {
    background: T.navy,
    borderTop: "1px solid rgba(255,255,255,.1)",
    padding: "8px 20px 16px",
  },
  mobileLink: {
    display: "block",
    color: "rgba(255,255,255,.8)",
    fontSize: 15,
    textDecoration: "none",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,.07)",
    cursor: "pointer",
  },
  mobileCta: {
    display: "block",
    color: T.accent,
    fontSize: 15,
    fontWeight: 600,
    textDecoration: "none",
    padding: "13px 0",
  },
  footer: { background: T.navy, padding: "30px 48px" },
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  footerTitle: { fontFamily: T.sora, fontSize: 13, fontWeight: 700, color: "#fff" },
  footerSub: { fontSize: 10.5, color: "rgba(255,255,255,.35)" },
  footerContact: { fontSize: 12, color: "rgba(255,255,255,.45)" },
};
