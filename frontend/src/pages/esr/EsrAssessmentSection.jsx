// EsrAssessmentSection.jsx — III. ASSESSMENT

import EsrYesNo from "./EsrYesNo";
import { esrStyles } from "./esrStyles";

// Verbatim criteria text from the DOH ESR form (design handoff, section III.b).
const LEVELS_OF_CONCERN = [
  {
    key: "PHELC",
    title: "Public Health Event of Local Concern (PHELC)",
    criteria: [
      "The health event is confined in a specific geographical location (barangay/cities/municipalities)",
      "The number and severity of cases, deaths, and affected population are higher than expected but within the healthcare system capacity",
      "The health event may involve diseases with existing guidelines for the implementation of preventive and/or control measures to manage the event",
    ],
  },
  {
    key: "PHERC",
    title: "Public Health Event of Regional Concern (PHERC)",
    criteria: [
      "The health event has potential to spread to other provinces/Highly urbanized Cities/Independent Component Cities",
      "The number and severity of cases, deaths, and affected population are higher than expected and/or cases are continuously increasing despite response activities conducted",
      "The health event requires technical assistance from the regional level in the conduct of epidemiological investigation and/or conduct of control measures",
    ],
  },
  {
    key: "PHENC",
    title: "Public Health Event of National Concern (PHENC)",
    criteria: [
      "The health event has potential characteristics to cross boundaries or borders (regions or other countries)",
      "Novel health event",
      "The health event involved vulnerable population (e.g. children, pregnant, elders, healthcare workers) from two or more regions",
      "The health event may require national level attention, resources and immediate implementation of control measures due to either of the following:",
    ],
    nested: [
      "Has attracted public, media or political interest",
      "The epidemic transmission route is new or unusual",
      "Epidemics associated with health service failure or linked to breakdown in standards of health care delivery such as the following but not limited to infection control failure or systemic immunization failure",
    ],
  },
  {
    key: "PHEIC",
    title: "Public Health Event of International Concern (PHEIC)",
    criteria: ["Health event formally declared by the World Health Organization (WHO)"],
  },
];

const ASSISTANCE_CATEGORIES = [
  "Technical support for surveillance",
  "Human resource",
  "Medicines/Medical supplies",
  "Laboratory supplies/logistics",
  "Health promotion materials",
  "Field/Epidemiologic investigation",
  "Others",
];

function CriterionCheckbox({ text, checked, onChange }) {
  return (
    <label style={{ ...esrStyles.chk, alignItems: "flex-start" }}>
      <input
        type="checkbox"
        style={{ ...esrStyles.checkboxInput, marginTop: "2px" }}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{text}</span>
    </label>
  );
}

export default function EsrAssessmentSection({ value, onChange }) {
  const update = (patch) => onChange({ ...value, ...patch });
  const updateStatus = (patch) => update({ status: { ...value.status, ...patch } });
  const updateCriterion = (levelKey, text, checked) =>
    update({
      levelOfConcern: {
        ...value.levelOfConcern,
        [levelKey]: { ...value.levelOfConcern[levelKey], [text]: checked },
      },
    });
  const updateAssistanceRow = (idx, patch) => {
    const rows = [...value.assistanceNeeded];
    rows[idx] = { ...rows[idx], ...patch };
    update({ assistanceNeeded: rows });
  };

  return (
    <section style={esrStyles.card}>
      <h2 style={esrStyles.sectionHeading}>III. ASSESSMENT</h2>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "40px", flexWrap: "wrap", marginBottom: "8px" }}>
        <div>
          <div style={{ ...esrStyles.subHeadingSmall, marginBottom: "12px" }}>a. Status of Health Event</div>
          <div style={{ display: "flex", gap: "26px" }}>
            <label style={esrStyles.chk}>
              <input type="checkbox" style={esrStyles.checkboxInput} checked={value.status.status === "open"} onChange={() => updateStatus({ status: "open" })} />
              Open
            </label>
            <label style={esrStyles.chk}>
              <input type="checkbox" style={esrStyles.checkboxInput} checked={value.status.status === "closed"} onChange={() => updateStatus({ status: "closed" })} />
              Closed
            </label>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: "220px", maxWidth: "280px" }}>
          <div style={esrStyles.fieldLabelSmall}>Date closed</div>
          <input style={esrStyles.ulInput} placeholder="mm/dd/yyyy" value={value.status.dateClosed} onChange={(e) => updateStatus({ dateClosed: e.target.value })} />
        </div>
      </div>

      <div style={{ marginTop: "26px" }}>
        <div style={esrStyles.subHeadingSmall}>b. Level of concern</div>
        <div style={esrStyles.helperText}>Please select criteria based on the assessment</div>

        {LEVELS_OF_CONCERN.map((level) => (
          <div key={level.key} style={{ border: "1px solid #e4e8ef", borderRadius: "8px", padding: "18px 20px", marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#15764a", marginBottom: "12px" }}>{level.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {level.criteria.map((text) => (
                <CriterionCheckbox
                  key={text}
                  text={text}
                  checked={Boolean(value.levelOfConcern[level.key]?.[text])}
                  onChange={(checked) => updateCriterion(level.key, text, checked)}
                />
              ))}
              {level.nested && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingLeft: "28px" }}>
                  {level.nested.map((text) => (
                    <CriterionCheckbox
                      key={text}
                      text={text}
                      checked={Boolean(value.levelOfConcern[level.key]?.[text])}
                      onChange={(checked) => updateCriterion(level.key, text, checked)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "30px" }}>
        <div style={{ ...esrStyles.subHeadingSmall, marginBottom: "14px" }}>
          d. Assistance needed <span style={esrStyles.threeUpBoxSub}>(please specify request)</span>
        </div>
        <table style={esrStyles.table}>
          <thead>
            <tr>
              <th style={esrStyles.th}>Category</th>
              <th style={esrStyles.th}>Yes/No</th>
              <th style={esrStyles.th}>Details/Description</th>
              <th style={esrStyles.th}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {ASSISTANCE_CATEGORIES.map((category, idx) => (
              <tr key={category}>
                <td style={esrStyles.tdText}>{idx + 1}. {category}</td>
                <td style={esrStyles.td}>
                  <EsrYesNo
                    name={`assistance-${idx}`}
                    value={value.assistanceNeeded[idx]?.yesNo || ""}
                    onChange={(v) => updateAssistanceRow(idx, { category, yesNo: v })}
                  />
                </td>
                <td style={esrStyles.td}>
                  <input
                    style={esrStyles.cellInput}
                    value={value.assistanceNeeded[idx]?.details || ""}
                    onChange={(e) => updateAssistanceRow(idx, { category, details: e.target.value })}
                  />
                </td>
                <td style={esrStyles.td}>
                  <input
                    style={esrStyles.cellInput}
                    value={value.assistanceNeeded[idx]?.remarks || ""}
                    onChange={(e) => updateAssistanceRow(idx, { category, remarks: e.target.value })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
