// EsrYesNo.jsx
// A Yes/No pair implemented as radio buttons (mutually exclusive), per the
// handoff's recommendation — the prototype used independent checkboxes to
// match the paper form's visual style, but Yes/No is conceptually exclusive.
// Pass extraOption (e.g. "For Verification") for the g. Laboratory details
// three-way version.

import { esrStyles } from "./esrStyles";

export default function EsrYesNo({ name, value, onChange, extraOption }) {
  const options = extraOption ? ["yes", "no", extraOption] : ["yes", "no"];
  const optionLabel = {
    yes: "Yes",
    no: "No",
    [extraOption]: extraOption === "for_verification" ? "For Verification" : extraOption,
  };
  return (
    <div style={{ display: "flex", gap: "20px", flex: "0 0 auto" }}>
      {options.map((opt) => (
        <label key={opt} style={esrStyles.chk}>
          <input
            type="radio"
            name={name}
            style={esrStyles.checkboxInput}
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          {optionLabel[opt] || opt}
        </label>
      ))}
    </div>
  );
}
