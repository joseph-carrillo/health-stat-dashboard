// EsrVerificationSection.jsx — II. FILTER AND VERIFICATION (sub-sections a-g)

import EsrCheckbox from "./EsrCheckbox";
import EsrYesNo from "./EsrYesNo";
import { esrStyles } from "./esrStyles";

const HEALTH_EVENT_TYPES = ["Suspect", "Confirmed", "Clustering", "Increasing", "Outbreak"];
const LOCATION_FIELDS = [
  { key: "region", label: "Region" },
  { key: "province", label: "Province/PHI" },
  { key: "municipality", label: "Municipality" },
  { key: "barangay", label: "Barangay" },
  { key: "facility", label: "Name of Facility/Others" },
];
const EMPTY_LAB_ROW = { source: "", specimenType: "", examinationType: "", etiologicAgent: "", tested: "", positive: "", negative: "" };

function CountBlock({ title, value, onChange }) {
  return (
    <div style={{ borderLeft: "1px solid #e4e8ef", paddingLeft: "28px" }}>
      <div style={{ fontSize: "13.5px", color: "#a3835f", fontWeight: 600, marginBottom: "6px" }}>
        Initial/previously reported no. of {title}:
      </div>
      <input
        style={{ ...esrStyles.ulInput, marginBottom: "16px" }}
        value={value.initialPrevious}
        onChange={(e) => onChange({ ...value, initialPrevious: e.target.value })}
      />
      <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
        <EsrCheckbox label="Added" checked={value.added} onChange={(c) => onChange({ ...value, added: c })} />
        <EsrCheckbox label="Subtracted" checked={value.subtracted} onChange={(c) => onChange({ ...value, subtracted: c })} />
      </div>
      <div style={{ fontSize: "13.5px", color: "#a3835f", fontWeight: 600, marginBottom: "6px" }}>
        Total no. of {title}:
      </div>
      <input style={esrStyles.ulInput} value={value.total} onChange={(e) => onChange({ ...value, total: e.target.value })} />
    </div>
  );
}

function ProfileBox({ title, helper, value, onChange }) {
  const sex = value.sex;
  const ageRange = value.ageRange;
  return (
    <div style={esrStyles.threeUpBox}>
      <div style={esrStyles.threeUpBoxTitle}>{title} <span style={esrStyles.threeUpBoxSub}>{helper}</span></div>
      <div style={{ fontSize: "12.5px", color: "#a3835f", fontWeight: 600, marginBottom: "8px" }}>Sex</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
        {["male", "female", "unknown"].map((k) => (
          <label key={k} style={{ ...esrStyles.chk, justifyContent: "space-between" }}>
            {k.charAt(0).toUpperCase() + k.slice(1)}:
            <input
              type="checkbox"
              style={esrStyles.checkboxInput}
              checked={sex[k]}
              onChange={(e) => onChange({ ...value, sex: { ...sex, [k]: e.target.checked } })}
            />
          </label>
        ))}
      </div>
      <div style={{ fontSize: "12.5px", color: "#a3835f", fontWeight: 600, marginBottom: "8px" }}>Age/Age range</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[["min", "Min."], ["max", "Max."], ["median", "Median"]].map(([k, label]) => (
          <label key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", fontSize: "14px", color: "#4a5568" }}>
            {label}:
            <input
              style={{ ...esrStyles.ulInput, width: "90px" }}
              value={ageRange[k]}
              onChange={(e) => onChange({ ...value, ageRange: { ...ageRange, [k]: e.target.value } })}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default function EsrVerificationSection({ value, onChange }) {
  const update = (patch) => onChange({ ...value, ...patch });
  const updateDescription = (patch) => update({ description: { ...value.description, ...patch } });
  const updateLocation = (key, text) =>
    updateDescription({ location: { ...value.description.location, [key]: text } });
  const updateHealthStatus = (key, text) => update({ healthStatus: { ...value.healthStatus, [key]: text } });
  const updateOutcome = (key, text) => update({ outcome: { ...value.outcome, [key]: text } });
  const updateLabRow = (idx, row) => {
    const rows = [...value.laboratoryDetails.rows];
    rows[idx] = row;
    update({ laboratoryDetails: { ...value.laboratoryDetails, rows } });
  };
  const addLabRow = () =>
    update({ laboratoryDetails: { ...value.laboratoryDetails, rows: [...value.laboratoryDetails.rows, { ...EMPTY_LAB_ROW }] } });
  const removeLabRow = (idx) =>
    update({ laboratoryDetails: { ...value.laboratoryDetails, rows: value.laboratoryDetails.rows.filter((_, i) => i !== idx) } });

  return (
    <section style={esrStyles.card}>
      <h2 style={esrStyles.sectionHeading}>II. FILTER AND VERIFICATION</h2>

      <div style={{ display: "grid", gridTemplateColumns: "210px 1fr 1.3fr", gap: "0 28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ ...esrStyles.fieldLabel, marginBottom: "6px" }}>Date of verification:</div>
            <input type="date" style={esrStyles.ulInput} value={value.dateOfVerification} onChange={(e) => update({ dateOfVerification: e.target.value })} />
          </div>
          <div>
            <div style={{ ...esrStyles.fieldLabel, marginBottom: "6px" }}>Time of verification:</div>
            <input type="time" style={esrStyles.ulInput} value={value.timeOfVerification} onChange={(e) => update({ timeOfVerification: e.target.value })} />
          </div>
        </div>

        <div style={{ borderLeft: "1px solid #e4e8ef", paddingLeft: "28px" }}>
          <div style={{ ...esrStyles.fieldLabel, marginBottom: "12px" }}>Type of health event:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {HEALTH_EVENT_TYPES.map((label) => {
              const key = label.toLowerCase();
              return (
                <EsrCheckbox
                  key={key}
                  label={label}
                  checked={value.typeOfHealthEvent[key]}
                  onChange={(c) => update({ typeOfHealthEvent: { ...value.typeOfHealthEvent, [key]: c } })}
                />
              );
            })}
            <EsrCheckbox
              label="Others"
              checked={value.typeOfHealthEvent.others}
              onChange={(c) => update({ typeOfHealthEvent: { ...value.typeOfHealthEvent, others: c } })}
            />
            <input
              style={esrStyles.ulInput}
              placeholder="specify"
              value={value.typeOfHealthEventText.others}
              onChange={(e) => update({ typeOfHealthEventText: { ...value.typeOfHealthEventText, others: e.target.value } })}
            />
          </div>
        </div>

        <div style={{ borderLeft: "1px solid #e4e8ef", paddingLeft: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <span style={esrStyles.fieldLabel}>If outbreak, was there an official declaration?</span>
            <EsrYesNo name="outbreakDeclared" value={value.outbreakDeclared} onChange={(v) => update({ outbreakDeclared: v })} />
          </div>
          <div>
            <div style={{ ...esrStyles.fieldLabel, marginBottom: "10px" }}>If yes, who declared it?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", marginBottom: "10px" }}>
              {[["lgu", "LGU"], ["chdResu", "CHD-RESU"], ["dohEb", "DOH-EB"]].map(([key, label]) => (
                <EsrCheckbox key={key} label={label} checked={value.declaredBy[key]} onChange={(c) => update({ declaredBy: { ...value.declaredBy, [key]: c } })} />
              ))}
            </div>
            <EsrCheckbox label="Others" checked={value.declaredBy.others} onChange={(c) => update({ declaredBy: { ...value.declaredBy, others: c } })} />
            <input
              style={{ ...esrStyles.ulInput, marginTop: "8px" }}
              placeholder="specify"
              value={value.declaredByText.others}
              onChange={(e) => update({ declaredByText: { ...value.declaredByText, others: e.target.value } })}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <span style={esrStyles.fieldLabel}>For LGU declared outbreak, was it validated by RESU?</span>
            <EsrYesNo name="lguValidatedByResu" value={value.lguValidatedByResu} onChange={(v) => update({ lguValidatedByResu: v })} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={esrStyles.fieldLabel}>Date of declaration:</span>
            <input type="date" style={esrStyles.ulInput} value={value.dateOfDeclaration} onChange={(e) => update({ dateOfDeclaration: e.target.value })} />
          </div>
        </div>
      </div>

      <h3 style={esrStyles.subHeading}>a. Description of health event</h3>
      <div>
        <div style={{ ...esrStyles.fieldLabel, marginBottom: "6px" }}>Title of health event:</div>
        <input style={esrStyles.ulInput} value={value.description.titleOfHealthEvent} onChange={(e) => updateDescription({ titleOfHealthEvent: e.target.value })} />
      </div>

      <div style={{ marginTop: "24px" }}>
        <div style={{ ...esrStyles.fieldLabel, marginBottom: "14px" }}>Location of health event:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {LOCATION_FIELDS.map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "14px", color: "#4a5568", flex: "0 0 150px" }}>{label}</span>
              <input style={esrStyles.ulInput} value={value.description.location[key]} onChange={(e) => updateLocation(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 28px", marginTop: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ ...esrStyles.fieldLabel, marginBottom: "6px" }}>Start date:</div>
            <input type="date" style={esrStyles.ulInput} value={value.description.startDate} onChange={(e) => updateDescription({ startDate: e.target.value })} />
          </div>
          <div>
            <div style={{ ...esrStyles.fieldLabel, marginBottom: "6px" }}>Latest onset:</div>
            <input type="date" style={esrStyles.ulInput} value={value.description.latestOnset} onChange={(e) => updateDescription({ latestOnset: e.target.value })} />
          </div>
        </div>
        <CountBlock title="cases" value={value.description.cases} onChange={(v) => updateDescription({ cases: v })} />
        <CountBlock title="deaths" value={value.description.deaths} onChange={(v) => updateDescription({ deaths: v })} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "26px", marginTop: "32px" }}>
        <div style={esrStyles.threeUpBox}>
          <div style={esrStyles.threeUpBoxTitle}>b. Health status <span style={esrStyles.threeUpBoxSub}>(indicate counts of case/s)</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[["admitted", "Admitted"], ["rhuOpdConsulted", "RHU/OPD consulted"], ["noConsultation", "No consultation"], ["forVerification", "For verification"]].map(([key, label]) => (
              <label key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", fontSize: "14px", color: "#4a5568" }}>
                {label}:
                <input style={{ ...esrStyles.ulInput, width: "90px" }} value={value.healthStatus[key]} onChange={(e) => updateHealthStatus(key, e.target.value)} />
              </label>
            ))}
          </div>
        </div>
        <ProfileBox title="c. Profile of cases" helper="(indicate counts of case/s)" value={value.profileOfCases} onChange={(v) => update({ profileOfCases: v })} />
        <ProfileBox title="d. Profile of deaths" helper="(indicate counts of death/s)" value={value.profileOfDeaths} onChange={(v) => update({ profileOfDeaths: v })} />
      </div>

      <div style={{ marginTop: "28px" }}>
        <div style={esrStyles.subHeadingSmall}>e. Summary of the health event</div>
        <div style={esrStyles.helperText}>
          Describe what happened, common signs and symptoms, diagnosis, the timeline of events, and distribution of
          cases and deaths if multiple locations are affected. [Note: list summary in bullets]
        </div>
        <textarea rows={6} style={esrStyles.textarea} value={value.summary} onChange={(e) => update({ summary: e.target.value })} />
      </div>

      <div style={{ marginTop: "28px" }}>
        <div style={{ ...esrStyles.subHeadingSmall, marginBottom: "16px" }}>f. Outcome <span style={esrStyles.threeUpBoxSub}>(indicate counts of case/s)</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px 30px", maxWidth: "820px" }}>
          {[["active", "Active"], ["recovered", "Recovered"], ["died", "Died"], ["forVerification", "For Verification"]].map(([key, label]) => (
            <div key={key}>
              <div style={esrStyles.fieldLabelSmall}>{label}</div>
              <input style={esrStyles.ulInput} value={value.outcome[key]} onChange={(e) => updateOutcome(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "14px" }}>
          <div style={esrStyles.subHeadingSmall}>g. Laboratory details <span style={esrStyles.threeUpBoxSub}>(fill up table below if laboratory examination is done)</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <span style={{ fontSize: "13.5px", color: "#4a5568" }}>Was there a procedure done?</span>
            <EsrYesNo
              name="procedureDone"
              extraOption="for_verification"
              value={value.laboratoryDetails.procedureDone}
              onChange={(v) => update({ laboratoryDetails: { ...value.laboratoryDetails, procedureDone: v } })}
            />
          </div>
        </div>
        <table style={esrStyles.table}>
          <thead>
            <tr>
              <th style={esrStyles.th}>Source (human/animal/environment etc.)</th>
              <th style={esrStyles.th}>Type of Specimen</th>
              <th style={esrStyles.th}>Type of Examination done</th>
              <th style={esrStyles.th}>Etiologic agent/pathogen isolated/detected</th>
              <th style={esrStyles.th}>No. of cases/samples tested</th>
              <th style={esrStyles.th}>No. of positive cases/samples</th>
              <th style={esrStyles.th}>No. of negative cases/samples</th>
              <th style={esrStyles.th}></th>
            </tr>
          </thead>
          <tbody>
            {value.laboratoryDetails.rows.map((row, idx) => (
              <tr key={idx}>
                {["source", "specimenType", "examinationType", "etiologicAgent", "tested", "positive", "negative"].map((field) => (
                  <td key={field} style={esrStyles.td}>
                    <input style={esrStyles.cellInput} value={row[field]} onChange={(e) => updateLabRow(idx, { ...row, [field]: e.target.value })} />
                  </td>
                ))}
                <td style={esrStyles.td}>
                  <button type="button" style={esrStyles.removeRowBtn} onClick={() => removeLabRow(idx)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" style={esrStyles.addRowBtn} onClick={addLabRow}>+ Add row</button>
      </div>
    </section>
  );
}
