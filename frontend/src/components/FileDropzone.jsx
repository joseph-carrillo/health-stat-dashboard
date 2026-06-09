import { useRef, useState } from "react";

const ACCEPT = [".xlsx", ".xls"];
const ACCEPT_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isExcelFile(file) {
  const name = file.name.toLowerCase();
  return ACCEPT.some((ext) => name.endsWith(ext));
}

export default function FileDropzone({
  file,
  onFileChange,
  disabled = false,
  error = "",
  expectedPattern = "",
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function pickFile(next) {
    if (disabled) return;
    if (!next) {
      onFileChange(null);
      return;
    }
    if (!isExcelFile(next)) {
      onFileChange(null, "Only Excel files (.xlsx or .xls) are accepted.");
      return;
    }
    onFileChange(next, "");
  }

  function handleInput(e) {
    pickFile(e.target.files?.[0] || null);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    pickFile(e.dataTransfer.files?.[0] || null);
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  return (
    <div style={styles.wrap}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload Excel file"
        style={{
          ...styles.zone,
          ...(dragOver ? styles.zoneActive : {}),
          ...(disabled ? styles.zoneDisabled : {}),
          ...(error ? styles.zoneError : {}),
          ...(file ? styles.zoneHasFile : {}),
        }}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MIME}
          onChange={handleInput}
          disabled={disabled}
          style={styles.hiddenInput}
        />

        {file ? (
          <div style={styles.fileRow} onClick={(e) => e.stopPropagation()}>
            <div style={styles.fileIcon}>📊</div>
            <div style={styles.fileMeta}>
              <p style={styles.fileName}>{file.name}</p>
              <p style={styles.fileSize}>{formatBytes(file.size)}</p>
            </div>
            {!disabled && (
              <button
                type="button"
                style={styles.removeBtn}
                onClick={() => pickFile(null)}
                aria-label="Remove file"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={styles.uploadIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p style={styles.primaryText}>
              <span style={styles.linkText}>Click to upload</span>
              {" "}or drag and drop
            </p>
            <p style={styles.hintText}>Excel workbook (.xlsx or .xls)</p>
            {expectedPattern && (
              <p style={styles.patternText}>
                Filename must contain: <strong>{expectedPattern}</strong>
              </p>
            )}
          </>
        )}
      </div>

      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: "6px" },
  zone: {
    border: "2px dashed #CBD5E1",
    borderRadius: "10px",
    padding: "28px 24px",
    backgroundColor: "#F8FAFC",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.15s, background-color 0.15s",
  },
  zoneActive: {
    borderColor: "#0B4BAA",
    backgroundColor: "#EFF6FF",
  },
  zoneDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  zoneError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  zoneHasFile: {
    padding: "16px 20px",
    textAlign: "left",
  },
  hiddenInput: { display: "none" },
  uploadIcon: {
    color: "#64748B",
    display: "flex",
    justifyContent: "center",
    marginBottom: "12px",
  },
  primaryText: {
    margin: "0 0 6px 0",
    fontSize: "14px",
    color: "#1F2A45",
    fontWeight: "500",
  },
  linkText: {
    color: "#0B4BAA",
    fontWeight: "600",
  },
  hintText: {
    margin: 0,
    fontSize: "12px",
    color: "#94A3B8",
  },
  patternText: {
    margin: "10px 0 0 0",
    fontSize: "12px",
    color: "#64748B",
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  fileIcon: { fontSize: "28px", lineHeight: 1 },
  fileMeta: { flex: 1, minWidth: 0 },
  fileName: {
    margin: "0 0 2px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1F2A45",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    margin: 0,
    fontSize: "12px",
    color: "#64748B",
  },
  removeBtn: {
    flexShrink: 0,
    padding: "6px 12px",
    backgroundColor: "#fff",
    color: "#64748B",
    border: "1px solid #CBD5E1",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  errorText: {
    margin: 0,
    fontSize: "12px",
    color: "#DC2626",
  },
};
