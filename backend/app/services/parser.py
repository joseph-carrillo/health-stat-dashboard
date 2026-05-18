# parser.py
# Config-driven Excel parser for FHSIS templates
# DOH-NIR CHD Health Statistics Dashboard

import json
import uuid
import math
from pathlib import Path
import pandas as pd
import psycopg2

# =====================================================
# DATABASE CONNECTION
# =====================================================
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "doh_nir_dashboard",
    "user": "doh_admin",
    "password": "doh_password_2026"
}

CONFIGS_DIR = Path(__file__).parent / "configs"


# =====================================================
# HELPER FUNCTIONS
# =====================================================

def load_config(template_id: str) -> dict:
    """Load the JSON config for a given template."""
    config_file = CONFIGS_DIR / f"{template_id.lower()}.json"
    if not config_file.exists():
        raise FileNotFoundError(f"Config not found: {config_file}")
    with open(config_file, "r") as f:
        return json.load(f)


def get_db_connection():
    """Get a database connection."""
    return psycopg2.connect(**DB_CONFIG)


def get_location_id(cur, psgc) -> int | None:
    """
    Look up location id by PSGC code.

    PSGCs in the DB are 10-digit strings.  Excel can yield the same value
    in many shapes: float ('1830200000.0'), int (1830200000), string with
    commas ('1,830,200,000'), or with stray whitespace.  Normalize to a
    plain digits-only string before lookup.
    """
    raw = str(psgc).strip().replace(",", "").replace(" ", "")
    if "." in raw:
        raw = raw.split(".", 1)[0]      # drop any decimal part
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
    cur.execute(
        """SELECT id FROM report_periods
           WHERE year = %s
           AND period_type = %s
           AND (period_value = %s OR
               (period_value IS NULL AND %s IS NULL))""",
        (year, period_type, period_value, period_value)
    )
    result = cur.fetchone()
    return result[0] if result else None


def is_blank(value) -> bool:
    """Check if a cell value is blank or NaN."""
    if value is None:
        return True
    if isinstance(value, float) and math.isnan(value):
        return True
    if str(value).strip() == "":
        return True
    return False


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
        code = rule["indicator_code"]
        message = rule["message"]

        if code not in values or values[code] is None:
            continue

        if rule_type == "over_threshold":
            threshold = rule["threshold"]
            if values[code] is not None and values[code] > threshold:
                issues.append({
                    "indicator_code": code,
                    "value": values[code],
                    "rule": rule_type,
                    "message": message
                })

        elif rule_type == "sequence":
            # A >= B >= C
            sequence = rule["sequence"]
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

    return issues


# =====================================================
# COMPUTED VALUE CALCULATOR
# =====================================================

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
    uploaded_by: int = None
) -> dict:
    """
    Parse an FHSIS Excel file and store data in staging.

    Args:
        file_path: Path to the uploaded Excel file
        template_id: Config template ID (e.g. 'cpab_bcg_hepa')
        year: Reporting year (e.g. 2026)
        month: Reporting month number (1-12)
        uploaded_by: User ID of uploader

    Returns:
        dict with keys: batch_id, rows_processed,
                        rows_staged, issues, errors
    """

    # --- Load config ---
    config = load_config(template_id)

    # --- Get sheet name from month number ---
    sheet_map = config["sheet_map"]
    sheet_name = sheet_map.get(str(month))
    if not sheet_name:
        return {
            "success": False,
            "error": f"No sheet mapping found for month {month}"
        }

    # --- Read the Excel file ---
    try:
        df = pd.read_excel(
            file_path,
            sheet_name=sheet_name,
            header=config["header_row"],
            dtype=str  # read everything as string first
        )
    except Exception as e:
        return {
            "success": False,
            "error": f"Could not read Excel file: {str(e)}"
        }

    # --- Connect to database ---
    conn = get_db_connection()
    cur = conn.cursor()

    # --- Generate a unique batch ID for this upload ---
    batch_id = str(uuid.uuid4())

    # --- Get period ID ---
    period_id = get_period_id(cur, year, "monthly", month)
    if not period_id:
        conn.close()
        return {
            "success": False,
            "error": f"Period not found: {month}/{year} monthly"
        }

    # --- Get column definitions from config ---
    col_defs = config["columns"]
    dqc_rules = config.get("dqc_rules", [])

    psgc_col = config["psgc_column"]
    data_start = config["data_start_row"]

    rows_processed = 0
    rows_staged = 0
    all_issues = []
    errors = []

    # --- Process each row ---
    # Blank-PSGC rows can appear MID-SHEET (province summary/total rows,
    # visual separators between regions, etc.). We skip them individually
    # rather than break — otherwise an LGU placed after a separator (e.g.
    # City of Bacolod HUC, which sits below the Siquijor block in the
    # FHSIS template) is silently dropped.
    #
    # Safety: stop only when we hit many consecutive blanks in a row,
    # which signals the real end of the data.
    MAX_CONSECUTIVE_BLANKS = 15
    consecutive_blanks = 0

    for row_idx in range(data_start, len(df)):
        row = df.iloc[row_idx]
        psgc_raw = row.iloc[psgc_col]

        if is_blank(psgc_raw):
            consecutive_blanks += 1
            if consecutive_blanks >= MAX_CONSECUTIVE_BLANKS:
                break
            continue
        consecutive_blanks = 0

        # Look up location
        location_id = get_location_id(cur, psgc_raw)
        if not location_id:
            errors.append({
                "row": row_idx,
                "psgc": str(psgc_raw),
                "error": "PSGC not found in locations table"
            })
            rows_processed += 1
            continue

        rows_processed += 1

        # --- Extract raw values for this row ---
        row_values = {}
        staged_rows = []

        # First pass: extract raw (non-computed) values
        for col_def in col_defs:
            if col_def["is_computed"]:
                continue
            col_idx = col_def["index"]
            indicator_code = col_def["indicator_code"]
            raw_value = safe_float(row.iloc[col_idx])
            row_values[indicator_code] = raw_value

        # Second pass: compute derived values
        for col_def in col_defs:
            if not col_def["is_computed"]:
                continue
            indicator_code = col_def["indicator_code"]
            formula = col_def.get("formula", "")
            computed_value = compute_value(formula, row_values)
            row_values[indicator_code] = computed_value

        # --- Run DQC rules for this row ---
        row_issues = run_dqc_rules(
            [{"indicator_code": k, "value": v}
             for k, v in row_values.items()],
            dqc_rules
        )
        if row_issues:
            for issue in row_issues:
                issue["row"] = row_idx
                issue["psgc"] = psgc_raw
            all_issues.extend(row_issues)

        # --- Stage all values ---
        validation_status = "failed" if row_issues else "passed"

        for indicator_code, value in row_values.items():
            indicator_id = get_indicator_id(cur, indicator_code)
            if not indicator_id:
                errors.append({
                    "row": row_idx,
                    "indicator_code": indicator_code,
                    "error": "Indicator not found in database"
                })
                continue

            # Check for existing data (conflict detection)
            cur.execute(
                """SELECT value FROM health_data
                   WHERE indicator_id = %s
                   AND location_id = %s
                   AND period_id = %s""",
                (indicator_id, location_id, period_id)
            )
            existing = cur.fetchone()
            existing_value = existing[0] if existing else None
            conflict_status = "pending_review" if existing else "none"

            # Insert into staging
            is_computed = next(
                (c["is_computed"] for c in col_defs
                 if c["indicator_code"] == indicator_code),
                False
            )

            cur.execute(
                """INSERT INTO staging_health_data (
                    batch_id, indicator_id, location_id, period_id,
                    value, validation_status, conflict_status,
                    existing_value, uploaded_by, source_file
                ) VALUES (
                    %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s
                )""",
                (
                    batch_id, indicator_id, location_id, period_id,
                    value, validation_status, conflict_status,
                    existing_value, uploaded_by,
                    Path(file_path).name
                )
            )
            rows_staged += 1

    conn.commit()
    cur.close()
    conn.close()

    return {
        "success": True,
        "batch_id": batch_id,
        "template_id": template_id,
        "period": f"{month}/{year}",
        "rows_processed": rows_processed,
        "rows_staged": rows_staged,
        "dqc_issues": len(all_issues),
        "errors": len(errors),
        "issues_detail": all_issues,
        "errors_detail": errors
    }


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