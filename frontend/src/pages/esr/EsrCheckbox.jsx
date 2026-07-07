// EsrCheckbox.jsx
// A single checkbox + label, matching the handoff's ".chk" visual (native
// checkbox, accent-colored green). Optionally renders an inline text input
// next to the label (e.g. "Others" + "specify") when onTextChange is given.

import { esrStyles } from "./esrStyles";

export default function EsrCheckbox({
  label,
  checked,
  onChange,
  textValue,
  onTextChange,
  textPlaceholder = "specify",
  wrapperStyle,
}) {
  return (
    <label style={{ ...esrStyles.chk, ...wrapperStyle }}>
      <input
        type="checkbox"
        style={esrStyles.checkboxInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
      {onTextChange && (
        <input
          style={{ ...esrStyles.ulInput, flex: 1, marginLeft: "10px" }}
          placeholder={textPlaceholder}
          value={textValue || ""}
          onChange={(e) => onTextChange(e.target.value)}
        />
      )}
    </label>
  );
}
