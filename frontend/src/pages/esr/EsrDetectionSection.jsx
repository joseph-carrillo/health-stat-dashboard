// EsrDetectionSection.jsx — I. DETECTION

import EsrCheckbox from "./EsrCheckbox";
import { esrStyles } from "./esrStyles";

const SOURCES = [
  { key: "chdResu", label: "CHD-RESU" },
  { key: "lgu", label: "LGU" },
  { key: "dohEb", label: "DOH-EB" },
  { key: "rLesu", label: "R/LESU" },
];

export default function EsrDetectionSection({ value, onChange }) {
  const update = (patch) => onChange({ ...value, ...patch });
  const updateSource = (key, checked) =>
    update({ sourceOfInformation: { ...value.sourceOfInformation, [key]: checked } });
  const updateSourceText = (key, text) =>
    update({ sourceOfInformationText: { ...value.sourceOfInformationText, [key]: text } });

  return (
    <section style={esrStyles.card}>
      <h2 style={esrStyles.sectionHeading}>I. DETECTION</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ ...esrStyles.fieldLabel, flex: "0 0 120px" }}>Date detected:</span>
            <input
              type="date"
              style={esrStyles.ulInput}
              value={value.dateDetected}
              onChange={(e) => update({ dateDetected: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ ...esrStyles.fieldLabel, flex: "0 0 120px" }}>Time detected:</span>
            <input
              type="time"
              style={esrStyles.ulInput}
              value={value.timeDetected}
              onChange={(e) => update({ timeDetected: e.target.value })}
            />
          </div>
        </div>
        <div>
          <div style={{ ...esrStyles.fieldLabel, marginBottom: "14px" }}>Source of information:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {SOURCES.map((s) => (
              <EsrCheckbox
                key={s.key}
                label={s.label}
                checked={value.sourceOfInformation[s.key]}
                onChange={(checked) => updateSource(s.key, checked)}
              />
            ))}
            <EsrCheckbox
              label="Internet/Media"
              checked={value.sourceOfInformation.internetMedia}
              onChange={(checked) => updateSource("internetMedia", checked)}
              onTextChange={(text) => updateSourceText("internetMedia", text)}
              textValue={value.sourceOfInformationText.internetMedia}
              textPlaceholder="link"
            />
            <EsrCheckbox
              label="Others"
              checked={value.sourceOfInformation.others}
              onChange={(checked) => updateSource("others", checked)}
              onTextChange={(text) => updateSourceText("others", text)}
              textValue={value.sourceOfInformationText.others}
              textPlaceholder="specify"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
