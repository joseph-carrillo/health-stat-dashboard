// EsrReportGenerationSection.jsx — V. REPORT GENERATION

import { esrStyles } from "./esrStyles";

const SIGNATURE_BLOCKS = [
  { key: "preparedBy", label: "Prepared by:" },
  { key: "reviewedBy", label: "Reviewed/Noted by:" },
  { key: "approvedBy", label: "Approved by:" },
];

function SignatureBlock({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: "14px", color: "#1f2733", marginBottom: "44px" }}>{label}</div>
      <div style={{ borderBottom: "1px solid #cbd2dd", marginBottom: "6px" }}>
        <input
          style={{ ...esrStyles.ulInput, borderBottom: "none" }}
          value={value.signature}
          onChange={(e) => onChange({ ...value, signature: e.target.value })}
        />
      </div>
      <div style={{ fontSize: "12px", color: "#8a94a3", marginBottom: "30px" }}>Signature</div>
      <div style={{ borderBottom: "1px solid #cbd2dd", marginBottom: "6px" }}>
        <input
          style={{ ...esrStyles.ulInput, borderBottom: "none" }}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </div>
      <div style={{ fontSize: "12px", color: "#8a94a3", marginBottom: "30px" }}>Name</div>
      <div style={{ borderBottom: "1px solid #cbd2dd", marginBottom: "6px" }}>
        <input
          style={{ ...esrStyles.ulInput, borderBottom: "none" }}
          value={value.designation}
          onChange={(e) => onChange({ ...value, designation: e.target.value })}
        />
      </div>
      <div style={{ fontSize: "12px", color: "#8a94a3" }}>Designation/Position</div>
    </div>
  );
}

export default function EsrReportGenerationSection({ value, onChange }) {
  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <section style={esrStyles.card}>
      <h2 style={esrStyles.sectionHeading}>V. REPORT GENERATION</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 40px" }}>
        <div>
          <div style={esrStyles.fieldLabelSmall}>Name(s) of source(s) of information</div>
          <input style={esrStyles.ulInput} value={value.sourcesOfInformation} onChange={(e) => update({ sourcesOfInformation: e.target.value })} />
        </div>
        <div>
          <div style={esrStyles.fieldLabelSmall}>Who has been informed?</div>
          <input style={esrStyles.ulInput} value={value.whoInformed} onChange={(e) => update({ whoInformed: e.target.value })} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "36px", marginTop: "38px" }}>
        {SIGNATURE_BLOCKS.map(({ key, label }) => (
          <SignatureBlock key={key} label={label} value={value[key]} onChange={(v) => update({ [key]: v })} />
        ))}
      </div>
    </section>
  );
}
