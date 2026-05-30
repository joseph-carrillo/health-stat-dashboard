# analytics.py
# Reference lookups and aggregate queries for the dashboard.
# All health figures are stored monthly in health_data. Quarterly and
# annual views are computed on the fly here:
#   - count / sum indicators  -> SUM across the months
#   - percentage / rate / ratio -> AVG of the monthly values
# (Averaging monthly percentages is the standard dashboard approximation;
#  it avoids re-deriving denominators across periods.)

from app.core.db import get_db_connection

QUARTER_MONTHS = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
}

RATE_FORMULAS = ("percentage", "rate", "ratio")

# Coverage status thresholds (percent)
ON_TARGET = 95
NEAR_TARGET = 80


# =====================================================
# PERIOD RESOLUTION
# =====================================================

def resolve_months(period_type: str, period_value):
    """Return the list of month numbers a period covers."""
    if period_type == "monthly":
        return [int(period_value)] if period_value else []
    if period_type == "quarterly":
        return QUARTER_MONTHS.get(int(period_value), [])
    if period_type == "annual":
        return list(range(1, 13))
    return []


def get_monthly_period_ids(cur, year: int, months: list) -> list:
    """Map a year + month numbers to monthly report_period ids."""
    if not months:
        return []
    cur.execute(
        """SELECT id FROM report_periods
           WHERE year = %s AND period_type = 'monthly'
           AND period_value = ANY(%s)""",
        (year, months),
    )
    return [r[0] for r in cur.fetchall()]


def status_for(coverage):
    """Classify a coverage percentage into a status band."""
    if coverage is None:
        return "no_data"
    if coverage >= ON_TARGET:
        return "on"
    if coverage >= NEAR_TARGET:
        return "near"
    return "below"


# =====================================================
# REFERENCE LISTS
# =====================================================

def list_programs() -> list:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT code, name FROM programs WHERE is_active = TRUE ORDER BY name"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"code": r[0], "name": r[1]} for r in rows]


def list_indicators(program_code: str = None,
                    include_sensitive: bool = True) -> list:
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
        SELECT i.id, i.code, i.name, i.unit, i.frequency_type,
               i.formula_type, i.is_computed, i.is_sensitive,
               i.target_value, i.target_year, p.code AS program_code,
               p.name AS program_name
        FROM indicators i
        JOIN programs p ON p.id = i.program_id
        WHERE i.is_active = TRUE
    """
    params = []
    if program_code:
        query += " AND p.code = %s"
        params.append(program_code)
    if not include_sensitive:
        query += " AND i.is_sensitive = FALSE"
    query += " ORDER BY p.name, i.code"
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0],
            "code": r[1],
            "name": r[2],
            "unit": r[3],
            "frequency_type": r[4],
            "formula_type": r[5],
            "is_computed": r[6],
            "is_sensitive": r[7],
            "target_value": float(r[8]) if r[8] is not None else None,
            "target_year": r[9],
            "program_code": r[10],
            "program_name": r[11],
        }
        for r in rows
    ]


def list_locations(level: str = None, parent_psgc: str = None) -> list:
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
        SELECT psgc, name, level, parent_psgc, is_huc
        FROM locations
        WHERE is_active = TRUE
    """
    params = []
    if level:
        query += " AND level = %s"
        params.append(level)
    if parent_psgc:
        query += " AND parent_psgc = %s"
        params.append(parent_psgc)
    query += " ORDER BY name"
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "psgc": r[0],
            "name": r[1],
            "level": r[2],
            "parent_psgc": r[3],
            "is_huc": r[4],
        }
        for r in rows
    ]


def list_periods(year: int = None) -> list:
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
        SELECT year, period_type, period_value, label
        FROM report_periods
    """
    params = []
    if year:
        query += " WHERE year = %s"
        params.append(year)
    query += " ORDER BY year DESC, period_type, period_value"
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "year": r[0],
            "period_type": r[1],
            "period_value": r[2],
            "label": r[3],
        }
        for r in rows
    ]


def get_indicator_meta(code: str) -> dict:
    """Return key metadata for one indicator, or None."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT i.id, i.code, i.name, i.formula_type, i.is_sensitive,
                  p.code AS program_code, i.denominator_source
           FROM indicators i
           JOIN programs p ON p.id = i.program_id
           WHERE i.code = %s""",
        (code,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0],
        "code": row[1],
        "name": row[2],
        "formula_type": row[3],
        "is_sensitive": row[4],
        "program_code": row[5],
        "denominator_source": row[6],
    }


# =====================================================
# AGGREGATES
# =====================================================

def get_scorecard(year: int, period_type: str, period_value,
                  program_code: str = None) -> list:
    """Average coverage per program for the given period.

    Returns every active program; programs with no data come back with
    coverage = None and status = 'no_data'.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    months = resolve_months(period_type, period_value)
    period_ids = get_monthly_period_ids(cur, year, months) or [-1]

    query = """
        SELECT p.code, p.name,
               AVG(h.value) AS coverage,
               COUNT(h.id) AS data_points
        FROM programs p
        LEFT JOIN indicators i
               ON i.program_id = p.id
              AND i.formula_type = 'percentage'
              AND i.is_active = TRUE
        LEFT JOIN health_data h
               ON h.indicator_id = i.id
              AND h.period_id = ANY(%s)
        WHERE p.is_active = TRUE
    """
    params = [period_ids]
    if program_code:
        query += " AND p.code = %s"
        params.append(program_code)
    query += " GROUP BY p.code, p.name ORDER BY p.name"

    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for r in rows:
        coverage = round(float(r[2]), 1) if r[2] is not None else None
        result.append({
            "program_code": r[0],
            "program": r[1],
            "coverage": coverage,
            "status": status_for(coverage),
            "data_points": r[3],
        })
    return result


def get_coverage(indicator_code: str, year: int,
                 period_type: str, period_value) -> dict:
    """Per-LGU coverage for one indicator over a period."""
    meta = get_indicator_meta(indicator_code)
    if not meta:
        return {"error": f"Indicator '{indicator_code}' not found"}

    conn = get_db_connection()
    cur = conn.cursor()
    months = resolve_months(period_type, period_value)
    period_ids = get_monthly_period_ids(cur, year, months) or [-1]

    agg = "AVG" if meta["formula_type"] in RATE_FORMULAS else "SUM"
    cur.execute(
        f"""SELECT l.psgc, l.name, l.level, l.is_huc,
                   {agg}(h.value) AS value, COUNT(h.id) AS data_points
            FROM locations l
            JOIN health_data h ON h.location_id = l.id
            JOIN indicators i ON i.id = h.indicator_id
            WHERE i.code = %s AND h.period_id = ANY(%s)
            GROUP BY l.psgc, l.name, l.level, l.is_huc
            ORDER BY l.name""",
        (indicator_code, period_ids),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    is_rate = meta["formula_type"] in RATE_FORMULAS
    data = []
    for r in rows:
        value = round(float(r[4]), 2) if r[4] is not None else None
        data.append({
            "psgc": r[0],
            "location": r[1],
            "level": r[2],
            "is_huc": r[3],
            "value": value,
            "status": status_for(value) if is_rate else None,
            "data_points": r[5],
        })
    return {
        "indicator_code": meta["code"],
        "indicator_name": meta["name"],
        "formula_type": meta["formula_type"],
        "is_rate": is_rate,
        "data": data,
    }


def _sum_by_location(cur, indicator_code, period_ids) -> dict:
    """SUM of a count indicator per location over the given periods."""
    if not indicator_code:
        return {}
    cur.execute(
        """SELECT l.psgc, SUM(h.value)
           FROM health_data h
           JOIN locations l ON l.id = h.location_id
           JOIN indicators i ON i.id = h.indicator_id
           WHERE i.code = %s AND h.period_id = ANY(%s)
           GROUP BY l.psgc""",
        (indicator_code, period_ids),
    )
    return {r[0]: float(r[1]) if r[1] is not None else None
            for r in cur.fetchall()}


def get_coverage_detail(indicator_code: str, year: int,
                        period_type: str, period_value) -> dict:
    """Per-LGU numerator / denominator / coverage for a percentage indicator.

    The denominator comes from the indicator's denominator_source. The
    numerator follows the FHSIS naming convention (_PCT -> _TOTAL) and
    falls back to null when it cannot be resolved.
    """
    meta = get_indicator_meta(indicator_code)
    if not meta:
        return {"error": f"Indicator '{indicator_code}' not found"}

    denom_code = meta.get("denominator_source")
    num_code = None
    if indicator_code.endswith("_PCT"):
        num_code = indicator_code[: -len("_PCT")] + "_TOTAL"

    conn = get_db_connection()
    cur = conn.cursor()
    months = resolve_months(period_type, period_value)
    period_ids = get_monthly_period_ids(cur, year, months) or [-1]

    # Coverage percentage per location (AVG of monthly values).
    cur.execute(
        """SELECT l.psgc, l.name, AVG(h.value)
           FROM locations l
           JOIN health_data h ON h.location_id = l.id
           JOIN indicators i ON i.id = h.indicator_id
           WHERE i.code = %s AND h.period_id = ANY(%s)
           GROUP BY l.psgc, l.name
           ORDER BY l.name""",
        (indicator_code, period_ids),
    )
    pct_rows = cur.fetchall()

    numerators = _sum_by_location(cur, num_code, period_ids)
    denominators = _sum_by_location(cur, denom_code, period_ids)

    cur.close()
    conn.close()

    data = []
    for psgc, name, pct in pct_rows:
        coverage = round(float(pct), 2) if pct is not None else None
        data.append({
            "psgc": psgc,
            "location": name,
            "numerator": numerators.get(psgc),
            "denominator": denominators.get(psgc),
            "coverage": coverage,
            "status": status_for(coverage),
        })
    return {
        "indicator_code": meta["code"],
        "indicator_name": meta["name"],
        "numerator_code": num_code,
        "denominator_code": denom_code,
        "data": data,
    }


def get_trend(indicator_code: str, year: int, location_psgc: str = None) -> dict:
    """Monthly trend for an indicator, region-wide or for one LGU."""
    meta = get_indicator_meta(indicator_code)
    if not meta:
        return {"error": f"Indicator '{indicator_code}' not found"}

    agg = "AVG" if meta["formula_type"] in RATE_FORMULAS else "SUM"
    conn = get_db_connection()
    cur = conn.cursor()

    query = f"""
        SELECT rp.period_value, {agg}(h.value)
        FROM health_data h
        JOIN indicators i ON i.id = h.indicator_id
        JOIN report_periods rp ON rp.id = h.period_id
        JOIN locations l ON l.id = h.location_id
        WHERE i.code = %s AND rp.year = %s AND rp.period_type = 'monthly'
    """
    params = [indicator_code, year]
    if location_psgc:
        query += " AND l.psgc = %s"
        params.append(location_psgc)
    query += " GROUP BY rp.period_value ORDER BY rp.period_value"

    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    by_month = {int(r[0]): round(float(r[1]), 2) if r[1] is not None else None
                for r in rows}
    series = [{"month": m, "value": by_month.get(m)} for m in range(1, 13)]
    return {
        "indicator_code": meta["code"],
        "indicator_name": meta["name"],
        "is_rate": meta["formula_type"] in RATE_FORMULAS,
        "year": year,
        "series": series,
    }


def get_data_availability(program_code: str, year: int) -> dict:
    """Matrix of which LGUs have submitted data per month for a program."""
    conn = get_db_connection()
    cur = conn.cursor()

    # All city/municipality-level LGUs we expect submissions from.
    cur.execute(
        """SELECT psgc, name FROM locations
           WHERE is_active = TRUE AND level = 'city_municipality'
           ORDER BY name"""
    )
    locations = [{"psgc": r[0], "name": r[1]} for r in cur.fetchall()]

    # (location, month) pairs that actually have data for this program.
    cur.execute(
        """SELECT DISTINCT l.psgc, rp.period_value
           FROM health_data h
           JOIN locations l ON l.id = h.location_id
           JOIN indicators i ON i.id = h.indicator_id
           JOIN programs p ON p.id = i.program_id
           JOIN report_periods rp ON rp.id = h.period_id
           WHERE p.code = %s AND rp.year = %s
           AND rp.period_type = 'monthly'""",
        (program_code, year),
    )
    present = {}
    for psgc, month in cur.fetchall():
        present.setdefault(psgc, set()).add(int(month))

    cur.close()
    conn.close()

    months = list(range(1, 13))
    matrix = []
    for loc in locations:
        submitted = present.get(loc["psgc"], set())
        matrix.append({
            "psgc": loc["psgc"],
            "location": loc["name"],
            "months": {str(m): (m in submitted) for m in months},
            "submitted_count": len(submitted),
        })
    return {
        "program_code": program_code,
        "year": year,
        "months": months,
        "rows": matrix,
    }


# =====================================================
# TEMPLATE-FAITHFUL REPORTS ("Excel face")
# Render a committed month back in the exact column order / grouping
# of the source FHSIS Excel file, so data can be visually verified.
# =====================================================

_SUB_SUFFIXES = (
    (" Male", "Male"),
    (" Female", "Female"),
    (" Total", "Total"),
    (" Percentage", "%"),
)


def _derive_group_sub(name: str):
    """Split an indicator name into (group, sub-column) for grouped headers.

    e.g. 'BCG Within 24h Female' -> ('BCG Within 24h', 'Female').
    Names without a recognised suffix are standalone columns (group None).
    """
    for suffix, sub in _SUB_SUFFIXES:
        if name.endswith(suffix):
            return name[: -len(suffix)].strip(), sub
    return None, None


def list_templates() -> list:
    """Available Excel templates, read from the parser config directory."""
    import json
    from app.services.parser import CONFIGS_DIR
    items = []
    for path in sorted(CONFIGS_DIR.glob("*.json")):
        try:
            with open(path, "r", encoding="utf-8") as fh:
                cfg = json.load(fh)
        except Exception:
            continue
        display = cfg.get("display", {})
        items.append({
            "id": path.stem,
            "label": display.get("label", cfg.get("label", path.stem)),
            "program_code": cfg.get("program_code"),
        })
    return items


def get_template_layout(template_id: str,
                        include_sensitive: bool = True) -> dict:
    """Column layout of a template in source-Excel order, with the grouped
    header / sub-column structure needed to recreate the original face."""
    from app.services.parser import load_config
    config = load_config(template_id)
    program_code = config.get("program_code")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT code, name, is_computed, is_sensitive
           FROM indicators
           WHERE program_id = (SELECT id FROM programs WHERE code = %s)""",
        (program_code,),
    )
    meta = {
        r[0]: {"name": r[1], "is_computed": r[2], "is_sensitive": r[3]}
        for r in cur.fetchall()
    }
    cur.close()
    conn.close()

    columns = []
    for col in config.get("columns", []):
        code = col.get("indicator_code")
        m = meta.get(code, {})
        if m.get("is_sensitive") and not include_sensitive:
            continue
        name = m.get("name", code)
        group, sub = _derive_group_sub(name)
        columns.append({
            "indicator_code": code,
            "name": name,
            "group": group,
            "sub": sub,
            "is_percentage": code.endswith("_PCT") or sub == "%",
            "is_computed": bool(
                col.get("is_computed", m.get("is_computed", False))
            ),
        })

    display = config.get("display", {})
    id_columns = display.get("id_columns") or [
        {"key": "psgc", "label": "PSGC"},
        {"key": "location", "label": "Name of City / Municipality"},
    ]
    return {
        "template_id": template_id,
        "label": display.get("label", config.get("label", template_id)),
        "program_code": program_code,
        "id_columns": id_columns,
        "columns": columns,
    }


def get_template_report(template_id: str, year: int, month: int,
                        include_sensitive: bool = True,
                        program_scope: str = None) -> dict:
    """Layout + one row per LGU of committed monthly values, in the exact
    column order of the source Excel. program_scope (a program code) limits
    rows for roles that cannot view all programs."""
    layout = get_template_layout(
        template_id, include_sensitive=include_sensitive
    )
    program_code = layout["program_code"]

    # A role scoped to one program can only see that program's file.
    if program_scope and program_scope != program_code:
        return {**layout, "year": year, "month": month, "rows": []}

    codes = [c["indicator_code"] for c in layout["columns"]]
    if not codes:
        return {**layout, "year": year, "month": month, "rows": []}

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT l.psgc, l.name, i.code, h.value
           FROM health_data h
           JOIN locations l ON l.id = h.location_id
           JOIN indicators i ON i.id = h.indicator_id
           JOIN report_periods rp ON rp.id = h.period_id
           WHERE rp.year = %s
             AND rp.period_type = 'monthly'
             AND rp.period_value = %s
             AND i.code = ANY(%s)
           ORDER BY l.psgc""",
        (year, month, codes),
    )
    by_loc = {}
    order = []
    for psgc, name, code, value in cur.fetchall():
        if psgc not in by_loc:
            by_loc[psgc] = {"psgc": psgc, "location": name, "values": {}}
            order.append(psgc)
        by_loc[psgc]["values"][code] = (
            float(value) if value is not None else None
        )
    cur.close()
    conn.close()

    return {
        **layout,
        "year": year,
        "month": month,
        "rows": [by_loc[p] for p in order],
    }


def update_indicator_target(indicator_id: int, target_value,
                            target_year: int) -> dict:
    """Set the official target for an indicator."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """UPDATE indicators
           SET target_value = %s, target_year = %s
           WHERE id = %s
           RETURNING code, name, target_value, target_year""",
        (target_value, target_year, indicator_id),
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"error": "Indicator not found"}
    conn.commit()
    cur.close()
    conn.close()
    return {
        "success": True,
        "code": row[0],
        "name": row[1],
        "target_value": float(row[2]) if row[2] is not None else None,
        "target_year": row[3],
    }
