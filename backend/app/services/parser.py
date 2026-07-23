# parser.py
# Config-driven Excel parser for FHSIS templates
# DOH-NIR CHD Health Statistics Dashboard

import json
import re
import uuid
import math
from pathlib import Path
import pandas as pd

from app.core.db import get_db_connection

# =====================================================
# CONFIG LOCATION
# =====================================================
CONFIGS_DIR = Path(__file__).parent / "configs"


# =====================================================
# HELPER FUNCTIONS
# =====================================================

def load_config(template_id: str) -> dict:
    """Load the JSON config for a given template."""
    config_file = CONFIGS_DIR / f"{template_id.lower()}.json"
    if not config_file.exists():
        raise FileNotFoundError(f"Config not found: {config_file}")
    with open(config_file, "r", encoding="utf-8") as f:
        return json.load(f)


def report_sheets_from_config(config: dict) -> list[dict]:
    """Excel sheet tabs that map to distinct report views (e.g. MAM / SAM)."""
    sheets: list[dict] = []
    sheet_map = config.get("sheet_map") or {}
    if config.get("frequency") == "annual":
        primary = sheet_map.get("annual")
        if primary:
            sheets.append({"id": primary, "label": primary})
    for extra in config.get("extra_sheets") or []:
        name = extra.get("sheet_name")
        if name and not any(s["id"] == name for s in sheets):
            sheets.append({"id": name, "label": name})
    return sheets


def column_defs_for_sheet(config: dict, sheet_name: str | None = None) -> list:
    """Column mapping for the primary or extra Excel sheet."""
    if not sheet_name:
        return config.get("columns") or []
    sheets = report_sheets_from_config(config)
    if sheets and sheet_name == sheets[0]["id"]:
        return config.get("columns") or []
    for extra in config.get("extra_sheets") or []:
        if extra.get("sheet_name") == sheet_name:
            return extra.get("columns") or []
    return config.get("columns") or []


def template_sort_order(config: dict) -> int:
    """FHSIS file number for ordering dropdowns (File 1, 4, 5, …)."""
    upload = config.get("upload") or {}
    file_number = upload.get("file_number")
    if file_number is not None:
        return int(file_number)

    pattern = str(config.get("source_file_pattern", ""))
    digits = ""
    for ch in pattern:
        if ch.isdigit():
            digits += ch
        elif digits:
            break
    if digits:
        return int(digits)

    label = (config.get("display") or {}).get("label", "")
    match = re.search(r"File\s+(\d+)", label, re.IGNORECASE)
    if match:
        return int(match.group(1))

    return 9999


def _normalize_match_text(value: str) -> str:
    return "".join(ch for ch in value.lower() if ch.isalnum())


def validate_upload_filename(filename: str, config: dict) -> str | None:
    """Return an error message when the filename does not match the template."""
    pattern = config.get("source_file_pattern")
    if not pattern or not filename:
        return None

    if _normalize_match_text(pattern) not in _normalize_match_text(filename):
        display = config.get("display", {}).get(
            "label", config.get("template_id", "selected template")
        )
        return (
            f"The uploaded file '{filename}' does not match {display}. "
            f"Expected the filename to contain '{pattern}'."
        )
    return None


def resolve_sheet_and_period(config: dict, year: int, period_value: int) -> dict:
    """Map UI period selection to Excel sheet and report_period row."""
    frequency = config.get("frequency", "monthly")
    sheet_map = config["sheet_map"]

    if frequency == "quarterly":
        sheet_name = sheet_map.get(str(period_value)) or sheet_map.get(f"Q{period_value}")
        if not sheet_name:
            return {
                "ok": False,
                "error": f"No sheet mapping found for quarter {period_value}",
            }
        return {
            "ok": True,
            "sheet_name": sheet_name,
            "period_type": "quarterly",
            "period_value": period_value,
            "period_label": f"Q{period_value} {year}",
        }

    if frequency == "annual":
        sheet_name = (
            sheet_map.get("annual")
            or sheet_map.get("1")
            or next(iter(sheet_map.values()), None)
        )
        if not sheet_name:
            return {"ok": False, "error": "No sheet mapping found for annual report"}
        return {
            "ok": True,
            "sheet_name": sheet_name,
            "period_type": "annual",
            "period_value": None,
            "period_label": str(year),
        }

    sheet_name = sheet_map.get(str(period_value))
    if not sheet_name:
        return {
            "ok": False,
            "error": f"No sheet mapping found for month {period_value}",
        }
    return {
        "ok": True,
        "sheet_name": sheet_name,
        "period_type": "monthly",
        "period_value": period_value,
        "period_label": f"{period_value}/{year}",
    }


def validate_config(config: dict) -> list:
    """Structurally validate a template config before it is used.

    Returns a list of human-readable problems. An empty list means the
    config is well-formed. This does not touch the database — it only
    checks shape, so new templates can be vetted quickly.
    """
    problems = []

    required_top = [
        "template_id", "program_code", "psgc_column",
        "header_row", "data_start_row", "sheet_map", "columns",
    ]
    for key in required_top:
        if key not in config:
            problems.append(f"Missing required key: '{key}'")

    columns = config.get("columns", [])
    if not isinstance(columns, list) or not columns:
        problems.append("'columns' must be a non-empty list")
        return problems

    seen_index = set()
    seen_code = set()
    declared_codes = {c.get("indicator_code") for c in columns}

    for i, col in enumerate(columns):
        label = col.get("indicator_code", f"column #{i}")
        if "index" not in col:
            problems.append(f"{label}: missing 'index'")
        elif col["index"] in seen_index:
            problems.append(f"{label}: duplicate column index {col['index']}")
        else:
            seen_index.add(col["index"])

        if "indicator_code" not in col:
            problems.append(f"column #{i}: missing 'indicator_code'")
        elif col["indicator_code"] in seen_code:
            problems.append(
                f"{label}: duplicate indicator_code '{col['indicator_code']}'"
            )
        else:
            seen_code.add(col["indicator_code"])

        if col.get("is_computed") and not col.get("formula"):
            problems.append(f"{label}: computed column needs a 'formula'")

    # Sanity check DQC rules reference declared indicators.
    for rule in config.get("dqc_rules", []):
        code = rule.get("indicator_code")
        if code and code not in declared_codes:
            problems.append(
                f"DQC rule references unknown indicator '{code}'"
            )
        for code in rule.get("sequence", []):
            if code not in declared_codes:
                problems.append(
                    f"DQC sequence references unknown indicator '{code}'"
                )

    return problems


def _normalize_location_name(name) -> str:
    """Lowercase location label for alias / DB name matching."""
    return " ".join(str(name).strip().lower().split())


def _resolve_by_label(cur, config: dict, label) -> tuple | None:
    """Map a location label (NIR, province name, etc.) to (location_id, psgc)."""
    if is_blank(label):
        return None

    name_key = _normalize_location_name(label)
    aliases = config.get("location_aliases", {})
    for alias_name, alias_psgc in aliases.items():
        if _normalize_location_name(alias_name) == name_key:
            location_id = get_location_id(cur, alias_psgc)
            if location_id:
                return location_id, str(alias_psgc)

    # Common NIR spellings in FHSIS row 2
    if name_key in ("nir", "negros island region", "negros island region (nir)"):
        location_id = get_location_id(cur, "1800000000")
        if location_id:
            return location_id, "1800000000"

    cur.execute(
        "SELECT id, psgc FROM locations WHERE LOWER(TRIM(name)) = %s",
        (name_key,),
    )
    match = cur.fetchone()
    if match:
        return match[0], match[1]

    cur.execute(
        """SELECT id, psgc FROM locations
           WHERE level = 'region'
             AND LOWER(TRIM(name)) LIKE %s
           LIMIT 1""",
        (f"%{name_key}%",),
    )
    match = cur.fetchone()
    if match:
        return match[0], match[1]

    return None


def resolve_location_row(cur, config: dict, row, psgc_raw):
    """Resolve a sheet row to (location_id, psgc).

    FHSIS row 2 (NIR total) is messy across templates: PSGC may be blank,
    hold a label like 'NIR'/'BARMM', or sit in the location column instead.
    """
    if not is_blank(psgc_raw):
        location_id = get_location_id(cur, psgc_raw)
        if location_id:
            raw = str(psgc_raw).strip().replace(",", "").replace(" ", "")
            if "." in raw:
                raw = raw.split(".", 1)[0]
            psgc_clean = "".join(ch for ch in raw if ch.isdigit())
            return location_id, psgc_clean

        # PSGC column sometimes contains the region label, not a code
        by_psgc_label = _resolve_by_label(cur, config, psgc_raw)
        if by_psgc_label:
            return by_psgc_label

    loc_col = config.get("location_column")
    if loc_col is None:
        return None, None

    location_name = row.iloc[loc_col]
    if is_blank(location_name):
        return None, None

    # Location column may hold the numeric PSGC while the label is in col A
    location_id = get_location_id(cur, location_name)
    if location_id:
        raw = str(location_name).strip().replace(",", "").replace(" ", "")
        if "." in raw:
            raw = raw.split(".", 1)[0]
        psgc_clean = "".join(ch for ch in raw if ch.isdigit())
        return location_id, psgc_clean

    by_name = _resolve_by_label(cur, config, location_name)
    if by_name:
        return by_name

    return None, None


def get_location_id(cur, psgc) -> int | None:
    """
    Look up location id by PSGC code.

    PSGCs in the DB are 10-digit strings.  Excel can yield the same value
    in many shapes: float ('1830200000.0'), int (1830200000), string with
    commas ('1,830,200,000'), or with stray whitespace.  Normalize to a
    plain digits-only string before lookup.
    """
    raw = str(psgc).strip().replace(",", "").replace(" ", "")
    if not raw:
        return None

    # Excel scientific notation (e.g. 1.8E+10) when read without dtype=str
    if "e" in raw.lower():
        try:
            raw = str(int(float(raw)))
        except (ValueError, OverflowError):
            return None

    if "." in raw:
        whole, frac = raw.split(".", 1)
        if not frac or set(frac) <= {"0"}:
            raw = whole
    psgc_clean = "".join(ch for ch in raw if ch.isdigit())
    if not psgc_clean:
        return None
    cur.execute(
        "SELECT id FROM locations WHERE psgc = %s",
        (psgc_clean,)
    )
    result = cur.fetchone()
    return result[0] if result else None


def get_indicator_id(cur, code: str) -> int | None:
    """Look up indicator id by code."""
    cur.execute(
        "SELECT id FROM indicators WHERE code = %s",
        (code,)
    )
    result = cur.fetchone()
    return result[0] if result else None


def get_period_id(cur, year: int, period_type: str,
                  period_value: int | None) -> int | None:
    """Look up report period id."""
    if period_type == "annual":
        cur.execute(
            """SELECT id FROM report_periods
               WHERE year = %s
                 AND period_type = 'annual'
                 AND (period_value IS NULL OR period_value = 1)
               LIMIT 1""",
            (year,),
        )
    else:
        cur.execute(
            """SELECT id FROM report_periods
               WHERE year = %s
               AND period_type = %s
               AND (period_value = %s OR
                   (period_value IS NULL AND %s IS NULL))""",
            (year, period_type, period_value, period_value),
        )
    result = cur.fetchone()
    return result[0] if result else None


_MONTH_NAMES = (
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)


def _period_row_label(year: int, period_type: str,
                      period_value: int | None) -> str:
    if period_type == "annual":
        return f"Annual {year}"
    if period_type == "quarterly":
        return f"Q{period_value} {year}"
    if period_value and 1 <= period_value <= 12:
        return f"{_MONTH_NAMES[period_value - 1]} {year}"
    return f"{period_value}/{year}"


def ensure_period_id(cur, conn, year: int, period_type: str,
                     period_value: int | None) -> int:
    """Return report_period id, creating the row when missing (e.g. new year)."""
    pid = get_period_id(cur, year, period_type, period_value)
    if pid:
        return pid

    stored_value = None if period_type == "annual" else period_value
    label = _period_row_label(year, period_type, period_value)
    cur.execute(
        """INSERT INTO report_periods (year, period_type, period_value, label)
           VALUES (%s, %s, %s, %s)
           RETURNING id""",
        (year, period_type, stored_value, label),
    )
    row = cur.fetchone()
    if row:
        conn.commit()
        return row[0]

    conn.rollback()
    pid = get_period_id(cur, year, period_type, period_value)
    if pid:
        return pid
    raise RuntimeError(
        f"Could not resolve report period: {label} ({period_type})"
    )


def _pct_as_ratio(value: float) -> float:
    """Normalize stored/display percentages to ratio (0.0185 = 1.85%)."""
    v = float(value)
    if v > 1.5:
        return v / 100.0
    return v


def _staging_values_match(
    existing, incoming, indicator_code: str | None = None
) -> bool:
    """True when incoming matches committed data — skip conflict review."""
    if existing is None and incoming is None:
        return True
    if existing is None or incoming is None:
        return False
    try:
        a, b = float(existing), float(incoming)
    except (TypeError, ValueError):
        return existing == incoming
    if indicator_code and indicator_code.endswith("_PCT"):
        a, b = _pct_as_ratio(a), _pct_as_ratio(b)
    if a == b:
        return True
    # Match DB DECIMAL(15,4) precision and Excel round-trip noise
    return round(a, 4) == round(b, 4)


def is_blank(value) -> bool:
    """Check if a cell value is blank or NaN."""
    if value is None:
        return True
    if isinstance(value, float) and math.isnan(value):
        return True
    if str(value).strip() == "":
        return True
    return False


def is_annotation_row(row, col_defs) -> bool:
    """True when every mapped raw (non-computed) data cell in the row is blank.

    Some templates (Infectious Disease antenatal screening) end with footer
    text in the PSGC column ('Source: DOH-FHSIS', 'Legend:', asterisk/zero
    notes). Those rows carry no value in any mapped data column, so an
    unresolvable location + all-blank data cells means sheet annotation, not
    a data row — skip it instead of reporting a location error. A genuinely
    mislocated data row still errors because its data cells hold values.
    """
    return all(
        is_blank(row.iloc[col_def["index"]])
        for col_def in col_defs
        if not col_def["is_computed"]
    )


def safe_float(value) -> float | None:
    """Convert a cell value to float safely."""
    if is_blank(value):
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


# =====================================================
# DQC VALIDATION
# =====================================================

def run_dqc_rules(staged_rows: list, dqc_rules: list) -> list:
    """
    Run DQC rules against staged data.
    Returns a list of validation issues found.
    """
    issues = []

    # Build a lookup of indicator_code → value for this batch
    values = {}
    for row in staged_rows:
        values[row["indicator_code"]] = row["value"]

    for rule in dqc_rules:
        rule_type = rule["rule_type"]
        message = rule.get("message", "")

        if rule_type == "over_threshold":
            code = rule["indicator_code"]
            if code not in values or values[code] is None:
                continue
            threshold = rule["threshold"]
            if values[code] > threshold:
                issues.append({
                    "indicator_code": code,
                    "value": values[code],
                    "rule": rule_type,
                    "message": message
                })

        elif rule_type == "sequence":
            # A >= B >= C (e.g. DPT dose totals)
            sequence = rule.get("sequence", [])
            for i in range(len(sequence) - 1):
                a = values.get(sequence[i])
                b = values.get(sequence[i + 1])
                if a is not None and b is not None and a < b:
                    issues.append({
                        "indicator_code": sequence[i],
                        "value": a,
                        "rule": rule_type,
                        "message": message
                    })

        elif rule_type == "reconciliation":
            # Sum of parts must equal ("equals") or not exceed ("at_most")
            # a whole. e.g. dog+cat+other == all-category exposure, or
            # ARV+RIG + ARV-only <= Category III total. Skips silently when
            # any part or the whole is missing (avoids false positives on
            # partially-entered rows, matching the over_threshold/sequence
            # None-handling above).
            parts = rule.get("parts", [])
            whole_code = rule.get("whole")
            mode = rule.get("mode", "equals")
            part_values = [values.get(code) for code in parts]
            whole = values.get(whole_code)
            if whole is None or any(v is None for v in part_values):
                continue
            parts_sum = sum(part_values)
            # Round to the DB's DECIMAL(15,4) precision to ignore
            # floating-point/Excel round-trip noise.
            parts_sum_r = round(float(parts_sum), 4)
            whole_r = round(float(whole), 4)
            flagged = (
                parts_sum_r > whole_r if mode == "at_most"
                else parts_sum_r != whole_r
            )
            if flagged:
                issues.append({
                    "indicator_code": whole_code,
                    "value": whole,
                    "rule": rule_type,
                    "message": message,
                })

    return issues


# =====================================================
# COMPUTED VALUE CALCULATOR
# =====================================================

def _zero_division_result(formula: str, row_values: dict) -> float | None:
    """FHSIS shows 0% when both numerator and denominator are zero."""
    if "/" not in formula:
        return None
    num_code, _, den_code = formula.partition("/")
    num_code = num_code.strip()
    den_code = den_code.strip()
    num = row_values.get(num_code)
    den = row_values.get(den_code)
    if num is not None and den is not None and float(den) == 0 and float(num) == 0:
        return 0.0
    return None


def compute_value(formula: str, row_values: dict) -> float | None:
    """
    Calculate a computed value from a formula string.
    Formula uses indicator codes as variable names.
    e.g. "CPAB_MALE + CPAB_FEMALE"
    e.g. "CPAB_TOTAL / IMMUN_POP_0_11M"

    Only returns None when a value that actually appears in THIS formula is
    missing.  Unrelated indicators being None (blank cells in the Excel for
    other columns) no longer cause the whole computation to bail out.

    Codes are substituted longest-first so that a shorter code like CPAB_MALE
    does not accidentally overwrite part of CPAB_MALE_SOME_LONGER_CODE.
    """
    try:
        expression = formula
        for code in sorted(row_values.keys(), key=len, reverse=True):
            if code not in expression:
                continue
            value = row_values[code]
            if value is None:
                return None
            expression = expression.replace(code, str(value))
        return float(eval(expression))
    except ZeroDivisionError:
        return _zero_division_result(formula, row_values)
    except Exception:
        return None


# =====================================================
# MAIN PARSER FUNCTION
# =====================================================

def parse_file(
    file_path: str,
    template_id: str,
    year: int,
    month: int,
    uploaded_by: int = None,
    dry_run: bool = False,
    source_filename: str | None = None,
) -> dict:
    """
    Parse an FHSIS Excel file and store data in staging.

    Args:
        file_path: Path to the uploaded Excel file
        template_id: Config template ID (e.g. 'cpab_bcg_hepa')
        year: Reporting year (e.g. 2026)
        month: Period value — month (1-12), quarter (1-4), or 1 for annual
        uploaded_by: User ID of uploader
        dry_run: If True, parse and validate only — no database writes.
                 Used to test new template configs safely.
        source_filename: Original uploaded filename for template matching

    Returns:
        dict with keys: batch_id, rows_processed,
                        rows_staged, issues, errors
    """

    # --- Load config ---
    config = load_config(template_id)

    filename = source_filename or Path(file_path).name
    name_error = validate_upload_filename(filename, config)
    if name_error:
        return {"success": False, "error": name_error}

    period_info = resolve_sheet_and_period(config, year, month)
    if not period_info.get("ok"):
        return {"success": False, "error": period_info["error"]}

    sheet_name = period_info["sheet_name"]
    period_type = period_info["period_type"]
    period_value = period_info["period_value"]

    sheet_specs = [{
        "sheet_name": sheet_name,
        "columns": config["columns"],
        "dqc_rules": config.get("dqc_rules", []),
    }]
    for extra in config.get("extra_sheets", []):
        sheet_specs.append({
            "sheet_name": extra["sheet_name"],
            "columns": extra["columns"],
            "dqc_rules": extra.get("dqc_rules", config.get("dqc_rules", [])),
        })

    # --- Connect to database ---
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # --- Generate a unique batch ID for this upload ---
        batch_id = str(uuid.uuid4())

        # --- Get period ID (create annual / missing periods on demand) ---
        try:
            period_id = ensure_period_id(cur, conn, year, period_type, period_value)
        except RuntimeError as exc:
            cur.close()
            conn.close()
            return {"success": False, "error": str(exc)}

        psgc_col = config["psgc_column"]
        data_start = config["data_start_row"]
        loc_col = config.get("location_column")

        rows_processed = 0
        rows_staged = 0
        rows_skipped_unchanged = 0
        all_issues = []
        errors = []
        preview = []

        for sheet_spec in sheet_specs:
            try:
                df = pd.read_excel(
                    file_path,
                    sheet_name=sheet_spec["sheet_name"],
                    header=config["header_row"],
                    dtype=str,
                )
            except Exception as e:
                conn.close()
                return {
                    "success": False,
                    "error": (
                        f"Could not read sheet '{sheet_spec['sheet_name']}': {str(e)}"
                    ),
                }

            col_defs = sheet_spec["columns"]
            dqc_rules = sheet_spec["dqc_rules"]

            # --- Process each row ---
            # Blank-PSGC rows can appear MID-SHEET (province summary/total rows,
            # visual separators between regions, etc.). We skip them individually
            # rather than break — otherwise an LGU placed after a separator (e.g.
            # City of Bacolod HUC, which sits below the Siquijor block in the
            # FHSIS template) is silently dropped.
            MAX_CONSECUTIVE_BLANKS = 15
            consecutive_blanks = 0

            for row_idx in range(data_start, len(df)):
                row = df.iloc[row_idx]
                psgc_raw = row.iloc[psgc_col]
                location_id, resolved_psgc = resolve_location_row(cur, config, row, psgc_raw)

                if not location_id:
                    if is_blank(psgc_raw) and (
                        loc_col is None or is_blank(row.iloc[loc_col])
                    ):
                        consecutive_blanks += 1
                        if consecutive_blanks >= MAX_CONSECUTIVE_BLANKS:
                            break
                        continue
                    if is_annotation_row(row, col_defs):
                        continue
                    location_label = (
                        str(row.iloc[loc_col]).strip()
                        if loc_col is not None and not is_blank(row.iloc[loc_col])
                        else str(psgc_raw)
                    )
                    errors.append({
                        "row": row_idx,
                        "sheet": sheet_spec["sheet_name"],
                        "psgc": str(psgc_raw),
                        "location": location_label,
                        "error": "Location not found (check PSGC or location name)",
                    })
                    rows_processed += 1
                    continue

                consecutive_blanks = 0
                psgc_raw = resolved_psgc

                rows_processed += 1

                row_values = {}

                for col_def in col_defs:
                    if col_def["is_computed"]:
                        continue
                    col_idx = col_def["index"]
                    indicator_code = col_def["indicator_code"]
                    raw_value = safe_float(row.iloc[col_idx])
                    row_values[indicator_code] = raw_value

                for col_def in col_defs:
                    if not col_def["is_computed"]:
                        continue
                    indicator_code = col_def["indicator_code"]
                    formula = col_def.get("formula", "")
                    computed_value = compute_value(formula, row_values)
                    row_values[indicator_code] = computed_value

                row_issues = run_dqc_rules(
                    [{"indicator_code": k, "value": v}
                     for k, v in row_values.items()],
                    dqc_rules
                )
                if row_issues:
                    for issue in row_issues:
                        issue["row"] = row_idx
                        issue["sheet"] = sheet_spec["sheet_name"]
                        issue["psgc"] = psgc_raw
                    all_issues.extend(row_issues)

                validation_status = "failed" if row_issues else "passed"

                for indicator_code, value in row_values.items():
                    indicator_id = get_indicator_id(cur, indicator_code)
                    if not indicator_id:
                        errors.append({
                            "row": row_idx,
                            "sheet": sheet_spec["sheet_name"],
                            "indicator_code": indicator_code,
                            "error": "Indicator not found in database"
                        })
                        continue

                    cur.execute(
                        """SELECT value FROM health_data
                           WHERE indicator_id = %s
                           AND location_id = %s
                           AND period_id = %s""",
                        (indicator_id, location_id, period_id)
                    )
                    existing = cur.fetchone()
                    existing_value = existing[0] if existing else None

                    if (
                        existing_value is not None
                        and _staging_values_match(
                            existing_value, value, indicator_code
                        )
                    ):
                        rows_skipped_unchanged += 1
                        continue

                    if existing_value is not None:
                        conflict_status = "pending_review"
                    else:
                        conflict_status = "none"

                    is_computed = next(
                        (c["is_computed"] for c in col_defs
                         if c["indicator_code"] == indicator_code),
                        False
                    )

                    if not dry_run:
                        cur.execute(
                            """INSERT INTO staging_health_data (
                                batch_id, indicator_id, location_id, period_id,
                                value, validation_status, conflict_status,
                                existing_value, is_computed, uploaded_by, source_file
                            ) VALUES (
                                %s, %s, %s, %s,
                                %s, %s, %s,
                                %s, %s, %s, %s
                            )""",
                            (
                                batch_id, indicator_id, location_id, period_id,
                                value, validation_status, conflict_status,
                                existing_value, is_computed, uploaded_by,
                                Path(file_path).name
                            )
                        )
                    rows_staged += 1

                    if len(preview) < 25:
                        preview.append({
                            "psgc": str(psgc_raw),
                            "indicator_code": indicator_code,
                            "value": value,
                            "validation_status": validation_status,
                            "conflict_status": conflict_status,
                            "existing_value": (
                                float(existing_value)
                                if existing_value is not None else None
                            ),
                        })

        if not dry_run:
            conn.commit()
        cur.close()
        conn.close()

        can_stage = len(errors) == 0 and rows_staged > 0

        if not dry_run and rows_staged == 0:
            if rows_skipped_unchanged > 0 and len(errors) == 0:
                return {
                    "success": False,
                    "error": (
                        f"No changes to stage — {rows_skipped_unchanged} value(s) "
                        "already match live data for this period. "
                        "Run Validate Only to confirm; nothing was saved."
                    ),
                    "batch_id": None,
                    "dry_run": dry_run,
                    "template_id": template_id,
                    "period": period_info["period_label"],
                    "rows_processed": rows_processed,
                    "rows_staged": rows_staged,
                    "rows_skipped_unchanged": rows_skipped_unchanged,
                    "can_stage": False,
                    "dqc_issues": len(all_issues),
                    "errors": len(errors),
                    "issues_detail": all_issues,
                    "errors_detail": errors,
                    "preview": preview,
                }
            hint = "Indicators may not be seeded for this template."
            if errors:
                first = errors[0]
                hint = first.get("error") or first.get("indicator_code") or hint
            return {
                "success": False,
                "error": (
                    f"No data was staged ({rows_processed} rows parsed, 0 saved). "
                    f"{hint}"
                ),
                "batch_id": None,
                "dry_run": dry_run,
                "template_id": template_id,
                "period": period_info["period_label"],
                "rows_processed": rows_processed,
                "rows_staged": rows_staged,
                "rows_skipped_unchanged": rows_skipped_unchanged,
                "can_stage": False,
                "dqc_issues": len(all_issues),
                "errors": len(errors),
                "issues_detail": all_issues,
                "errors_detail": errors,
                "preview": preview,
            }

        return {
            "success": True,
            "batch_id": None if dry_run else batch_id,
            "dry_run": dry_run,
            "template_id": template_id,
            "period": period_info["period_label"],
            "rows_processed": rows_processed,
            "rows_staged": rows_staged,
            "rows_skipped_unchanged": rows_skipped_unchanged,
            "can_stage": can_stage,
            "dqc_issues": len(all_issues),
            "errors": len(errors),
            "issues_detail": all_issues,
            "errors_detail": errors,
            "preview": preview,
        }
    finally:
        conn.close()


# =====================================================
# TEST RUN (run this file directly to test)
# =====================================================

if __name__ == "__main__":
    import sys

    print("FHSIS Excel Parser — Test Run")
    print("=" * 40)

    # Check if file path was provided
    if len(sys.argv) < 2:
        print("Usage: python parser.py <path_to_excel_file> "
              "<month_number>")
        print("Example: python parser.py data/1_CPAB_BCG_HepaB1_nir.xlsx 7")
        sys.exit(1)

    file_path = sys.argv[1]
    month = int(sys.argv[2]) if len(sys.argv) > 2 else 7

    result = parse_file(
        file_path=file_path,
        template_id="cpab_bcg_hepa",
        year=2026,
        month=month,
        uploaded_by=None
    )

    print(f"Success: {result['success']}")
    if result.get('success'):
        print(f"Batch ID: {result['batch_id']}")
        print(f"Period: {result['period']}")
        print(f"Rows processed: {result['rows_processed']}")
        print(f"Rows staged: {result['rows_staged']}")
        print(f"DQC issues: {result['dqc_issues']}")
        print(f"Errors: {result['errors']}")

        if result['issues_detail']:
            print("\nDQC Issues:")
            for issue in result['issues_detail']:
                print(f"  Row {issue['row']} | "
                      f"{issue['indicator_code']} = {issue['value']} | "
                      f"{issue['message']}")

        if result['errors_detail']:
            print("\nErrors:")
            for err in result['errors_detail']:
                print(f"  Row {err['row']} | {err}")
    else:
        print(f"Error: {result.get('error')}")