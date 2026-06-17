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


def resolve_slices_for_view(
    data_frequency: str,
    view_period_type: str,
    view_period_value: int,
) -> list[tuple[str, int]]:
    """Map a report view period to stored (period_type, period_value) slices.

    Examples:
      quarterly view + monthly data + Q1 -> Jan, Feb, Mar
      annual view + monthly data -> all 12 months
      annual view + quarterly data -> Q1–Q4
      monthly view + quarterly data -> containing quarter
    """
    data_frequency = data_frequency or "monthly"
    view_period_type = view_period_type or data_frequency
    view_period_value = int(view_period_value or 1)

    if view_period_type == data_frequency:
        return [(data_frequency, view_period_value)]

    if view_period_type == "annual":
        if data_frequency == "monthly":
            return [("monthly", m) for m in range(1, 13)]
        if data_frequency == "quarterly":
            return [("quarterly", q) for q in range(1, 5)]
        return [("annual", 1)]

    if view_period_type == "quarterly" and data_frequency == "monthly":
        months = QUARTER_MONTHS.get(view_period_value, [])
        return [("monthly", m) for m in months]

    if view_period_type == "monthly" and data_frequency == "quarterly":
        quarter = (view_period_value - 1) // 3 + 1
        return [("quarterly", quarter)]

    if view_period_type == "monthly" and data_frequency == "annual":
        return [("annual", 1)]

    if view_period_type == "quarterly" and data_frequency == "annual":
        return [("annual", 1)]

    return [(data_frequency, view_period_value)]


def _is_pop_indicator(code: str) -> bool:
    """Population denominators should not be summed across time slices."""
    return "_POP" in code


def _combine_slice_values(
    code: str,
    values: list,
    col_def: dict | None,
) -> float | None:
    """Aggregate one indicator across multiple stored periods."""
    non_null = [float(v) for v in values if v is not None]
    if not non_null:
        return None
    if col_def and col_def.get("is_computed"):
        return None
    if code.endswith("_PCT"):
        return None
    if _is_pop_indicator(code):
        return max(non_null)
    if len(non_null) == 1:
        return non_null[0]
    return sum(non_null)


def _recompute_row_values(row_values: dict, col_defs: list) -> None:
    """Apply template formulas after raw values are aggregated."""
    from app.services.parser import compute_value

    for col in col_defs:
        if not col.get("is_computed"):
            continue
        formula = col.get("formula")
        code = col.get("indicator_code")
        if not formula or not code:
            continue
        row_values[code] = compute_value(formula, row_values)


def _pct_as_ratio(value: float) -> float:
    """Normalize a percentage to ratio scale for DQC (0.5 = 50%, 106.76 = 1.0676)."""
    v = float(value)
    if v > 1.5:
        return v / 100.0
    return v


def _values_for_dqc(row_values: dict) -> dict:
    """Build a value map on ratio scale so DQC thresholds (e.g. 1.0) work."""
    out = {}
    for code, val in row_values.items():
        if val is None:
            out[code] = None
        elif code.endswith("_PCT"):
            out[code] = _pct_as_ratio(float(val))
        else:
            out[code] = val
    return out


def _normalize_pct_display_values(rows: list) -> None:
    """Convert stored percentage ratios to a 0–100 display scale.

    Parser formulas and DQC rules use ratios (0.9551 = 95.51%, 1.05 = 105%).
    The report API returns values ready to show with a trailing % sign.
    """
    for row in rows:
        values = row.get("values") or {}
        for code, val in values.items():
            if code.endswith("_PCT") and val is not None:
                values[code] = float(val) * 100


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
    from app.services.parser import CONFIGS_DIR, template_sort_order
    items = []
    for path in CONFIGS_DIR.glob("*.json"):
        try:
            with open(path, "r", encoding="utf-8") as fh:
                cfg = json.load(fh)
        except Exception:
            continue
        display = cfg.get("display", {})
        upload_meta = cfg.get("upload", {})
        from app.services.upload_catalog import PROGRAMS
        prog_names = {p["code"]: p["name"] for p in PROGRAMS}
        prog_code = cfg.get("program_code")
        from app.services.parser import report_sheets_from_config
        items.append({
            "id": path.stem,
            "label": display.get("label", cfg.get("label", path.stem)),
            "program_code": prog_code,
            "program_name": prog_names.get(prog_code, prog_code),
            "sub_program": upload_meta.get("sub_program"),
            "frequency": cfg.get("frequency", "monthly"),
            "sort_order": template_sort_order(cfg),
            "report_sheets": report_sheets_from_config(cfg),
        })
    items.sort(key=lambda t: (t["sort_order"], t["label"]))
    return items


def _append_period_clause(
    clauses: list,
    params: list,
    period_type: str,
    period_value: int | None,
) -> None:
    """Match report_periods rows; annual rows use NULL period_value in the DB."""
    if period_type == "annual":
        clauses.append(
            "(rp.period_type = %s AND (rp.period_value IS NULL OR rp.period_value = %s))"
        )
        params.extend([period_type, period_value if period_value is not None else 1])
    elif period_value is None:
        clauses.append("(rp.period_type = %s AND rp.period_value IS NULL)")
        params.append(period_type)
    else:
        clauses.append("(rp.period_type = %s AND rp.period_value = %s)")
        params.extend([period_type, period_value])


def get_template_layout(template_id: str,
                        include_sensitive: bool = True,
                        sheet_name: str | None = None) -> dict:
    """Column layout of a template in source-Excel order, with the grouped
    header / sub-column structure needed to recreate the original face."""
    from app.services.parser import (
        column_defs_for_sheet,
        load_config,
        report_sheets_from_config,
    )
    config = load_config(template_id)
    program_code = config.get("program_code")
    report_sheets = report_sheets_from_config(config)
    active_sheet = sheet_name or (report_sheets[0]["id"] if report_sheets else None)

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
    for col in column_defs_for_sheet(config, active_sheet):
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
            "formula": col.get("formula"),
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
        "report_sheets": report_sheets,
        "active_sheet": active_sheet,
    }


def get_template_report(
    template_id: str,
    year: int,
    month: int = 1,
    include_sensitive: bool = True,
    program_scope: str = None,
    view_period_type: str | None = None,
    period_value: int | None = None,
    sheet_name: str | None = None,
) -> dict:
    """Layout + one row per LGU of committed values, in the exact column
    order of the source Excel. program_scope (a program code) limits rows
    for roles that cannot view all programs.

    ``month`` is kept for backward compatibility (alias for period_value).
    ``view_period_type`` is how the user wants to view the report: monthly,
    quarterly, or annual. When it differs from the template's stored
    frequency, values are aggregated across the covering slices.
    """
    from app.services.parser import column_defs_for_sheet, load_config, run_dqc_rules

    layout = get_template_layout(
        template_id,
        include_sensitive=include_sensitive,
        sheet_name=sheet_name,
    )
    program_code = layout["program_code"]
    config = load_config(template_id)
    data_frequency = config.get("frequency", "monthly")
    view_type = view_period_type or data_frequency
    view_value = int(period_value if period_value is not None else month)
    col_defs = column_defs_for_sheet(config, layout.get("active_sheet"))
    col_def_by_code = {c["indicator_code"]: c for c in col_defs}

    empty = {
        **layout,
        "year": year,
        "month": view_value,
        "period_type": data_frequency,
        "view_period_type": view_type,
        "view_period_value": view_value,
        "aggregated": False,
        "rows": [],
    }

    if program_scope and program_scope != program_code:
        return empty

    codes = [c["indicator_code"] for c in layout["columns"]]
    if not codes:
        return empty

    slices = resolve_slices_for_view(data_frequency, view_type, view_value)
    aggregated = len(slices) > 1

    conn = get_db_connection()
    cur = conn.cursor()
    period_clauses = []
    params: list = [year]
    for pt, pv in slices:
        _append_period_clause(period_clauses, params, pt, pv)
    params.append(codes)

    cur.execute(
        f"""SELECT l.psgc, l.name, i.code, h.value
           FROM health_data h
           JOIN locations l ON l.id = h.location_id
           JOIN indicators i ON i.id = h.indicator_id
           JOIN report_periods rp ON rp.id = h.period_id
           WHERE rp.year = %s
             AND ({' OR '.join(period_clauses)})
             AND i.code = ANY(%s)
           ORDER BY l.psgc""",
        params,
    )

    raw_by_loc: dict = {}
    order: list = []
    for psgc, name, code, value in cur.fetchall():
        if psgc not in raw_by_loc:
            raw_by_loc[psgc] = {
                "psgc": psgc,
                "location": name,
                "slices": {},
            }
            order.append(psgc)
        bucket = raw_by_loc[psgc]["slices"].setdefault(code, [])
        bucket.append(float(value) if value is not None else None)

    cur.close()
    conn.close()

    rows = []
    for psgc in order:
        loc = raw_by_loc[psgc]
        values: dict = {}
        for code in codes:
            col_def = col_def_by_code.get(code)
            if col_def and col_def.get("is_computed"):
                continue
            slice_vals = loc["slices"].get(code, [])
            if not slice_vals:
                values[code] = None
                continue
            values[code] = _combine_slice_values(
                code, slice_vals, col_def
            )
        _recompute_row_values(values, col_defs)
        rows.append({
            "psgc": loc["psgc"],
            "location": loc["location"],
            "values": values,
        })

    # No committed data for this period: still return the canonical NIR
    # reporting locations (provinces + cities/municipalities) with empty values,
    # so the report renders the template's design (the Excel-face layout) with
    # "—" cells instead of hiding the table behind a "no data" message.
    if not rows:
        conn2 = get_db_connection()
        cur2 = conn2.cursor()
        cur2.execute(
            """SELECT psgc, name FROM locations
               WHERE is_active = TRUE
                 AND level IN ('province', 'city_municipality')
               ORDER BY psgc"""
        )
        canonical = cur2.fetchall()
        cur2.close()
        conn2.close()
        for psgc, name in canonical:
            values = {}
            for code in codes:
                col_def = col_def_by_code.get(code)
                if col_def and col_def.get("is_computed"):
                    continue
                values[code] = None
            _recompute_row_values(values, col_defs)
            rows.append({"psgc": psgc, "location": name, "values": values})

    display = config.get("display", {})
    dqc_highlight = bool(display.get("dqc_highlight"))
    dqc_rules = config.get("dqc_rules", []) if dqc_highlight else []
    if dqc_rules:
        for row in rows:
            dqc_values = _values_for_dqc(row["values"])
            staged = [
                {"indicator_code": code, "value": val}
                for code, val in dqc_values.items()
            ]
            issues = run_dqc_rules(staged, dqc_rules)
            flags = {}
            for issue in issues:
                code = issue.get("indicator_code")
                if code and code not in flags:
                    flags[code] = issue.get("message", "DQC warning")
            row["dqc"] = flags

    _normalize_pct_display_values(rows)

    return {
        **layout,
        "year": year,
        "month": view_value,
        "period_type": data_frequency,
        "view_period_type": view_type,
        "view_period_value": view_value,
        "aggregated": aggregated,
        "dqc_highlight": dqc_highlight,
        "dqc_rules": dqc_rules,
        "rows": rows,
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


# =====================================================
# OVERVIEW SUMMARY — tiered executive glance (Tier 1)
# Per program area: reporting completeness + flagship regional %.
# Flagships are first-pass picks; confirm/adjust with the program team.
# =====================================================
OVERVIEW_TOTAL_LOCATIONS = 66  # provinces (3) + cities/municipalities (63)

OVERVIEW_AREAS = [
    {"area": "Immunization", "flagship": "FIC_PCT", "flagship_label": "FIC",
     "codes_like": ["CPAB%", "BCG%", "HEPAB%", "DPT%", "OPV%", "IPV%", "PCV%", "MMR%", "FIC%", "CIC%"]},
    {"area": "Nutrition", "flagship": "NUT_MAM_CURED_PCT", "flagship_label": "MAM cure rate",
     "codes_like": ["NUT_%"]},
    {"area": "Mgt of Sick", "flagship": "PNEU_ABX_PCT", "flagship_label": "Pneumonia w/ antibiotics",
     "codes_like": ["DIAR%", "PNEU%", "SICK%"]},
    {"area": "SBI", "flagship": "HPV1_SBI_PCT", "flagship_label": "HPV1 coverage",
     "codes_like": ["SBI%", "HPV%"]},
]

# Coverage bands (ratios): on-target >= 0.95, below-target < 0.80.
_ON_TARGET = 0.95
_BELOW_TARGET = 0.80


def _status_for_ratio(ratio):
    """Status band for a 0-1 ratio. None -> 'no_data'."""
    if ratio is None:
        return "no_data"
    if ratio >= _ON_TARGET:
        return "on"
    if ratio >= _BELOW_TARGET:
        return "near"
    return "below"


# Headline KPI per program for the Overview at-a-glance grid.
# Add (indicator_code, label) as each program's template and headline metric
# are defined. Programs not listed fall back to averaging their % indicators.
PROGRAM_FLAGSHIPS = {
    "CHILD_CARE": ("FIC_PCT", "Fully immunized children (FIC)"),
}


def overview_summary(year: int = 2026) -> dict:
    """Per-program-area snapshot for the Overview executive glance."""
    conn = get_db_connection()
    cur = conn.cursor()
    areas = []
    for a in OVERVIEW_AREAS:
        like = a["codes_like"]
        like_clause = " OR ".join(["i.code LIKE %s"] * len(like))

        # Reporting completeness: distinct province/city locations with any
        # committed data for this program area this year.
        cur.execute(
            f"""SELECT COUNT(DISTINCT h.location_id)
                FROM health_data h
                JOIN indicators i ON i.id = h.indicator_id
                JOIN report_periods rp ON rp.id = h.period_id
                JOIN locations l ON l.id = h.location_id
                WHERE rp.year = %s
                  AND l.level IN ('province', 'city_municipality')
                  AND ({like_clause})""",
            [year, *like],
        )
        reporting = cur.fetchone()[0] or 0

        # Flagship values across LGUs for its latest period this year.
        cur.execute(
            """SELECT h.value
               FROM health_data h
               JOIN indicators i ON i.id = h.indicator_id
               JOIN locations l ON l.id = h.location_id
               WHERE i.code = %s
                 AND l.level IN ('province', 'city_municipality')
                 AND h.period_id = (
                     SELECT MAX(h2.period_id)
                     FROM health_data h2
                     JOIN indicators i2 ON i2.id = h2.indicator_id
                     JOIN report_periods rp2 ON rp2.id = h2.period_id
                     WHERE i2.code = %s AND rp2.year = %s
                 )""",
            [a["flagship"], a["flagship"], year],
        )
        vals = [float(v[0]) for v in cur.fetchall() if v[0] is not None]
        avg = round(sum(vals) / len(vals), 4) if vals else None

        areas.append({
            "area": a["area"],
            "flagship_code": a["flagship"],
            "flagship_label": a["flagship_label"],
            "regional_pct": avg,
            "on_target": sum(1 for v in vals if v >= _ON_TARGET),
            "below_target": sum(1 for v in vals if v < _BELOW_TARGET),
            "locations_reporting": reporting,
            "total_locations": OVERVIEW_TOTAL_LOCATIONS,
        })

    cur.close()
    conn.close()
    return {"year": year, "total_locations": OVERVIEW_TOTAL_LOCATIONS, "areas": areas}


def overview_programs(year: int = 2026) -> dict:
    """Per-program performance snapshot for the Overview at-a-glance grid.

    For every active program, find its latest reported period this year and
    summarize the headline coverage across province/city LGUs. Programs with a
    configured flagship use that indicator; the rest average their active
    percentage indicators. Programs with no committed data come back as
    status 'no_data'.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, code, name FROM programs WHERE is_active = TRUE ORDER BY id"
    )
    program_rows = cur.fetchall()

    programs = []
    for program_id, code, name in program_rows:
        flagship = PROGRAM_FLAGSHIPS.get(code)
        flagship_code = flagship[0] if flagship else None
        flagship_label = flagship[1] if flagship else None

        # Latest period this year for the headline metric. Tie it to the
        # flagship indicator when configured (programs report on different
        # frequencies, so the program-wide latest period may belong to a
        # different indicator than the flagship).
        if flagship_code:
            cur.execute(
                """SELECT h.period_id, rp.period_type, rp.label
                   FROM health_data h
                   JOIN indicators i ON i.id = h.indicator_id
                   JOIN report_periods rp ON rp.id = h.period_id
                   WHERE i.code = %s
                     AND rp.year = %s
                   ORDER BY h.period_id DESC
                   LIMIT 1""",
                [flagship_code, year],
            )
        else:
            cur.execute(
                """SELECT h.period_id, rp.period_type, rp.label
                   FROM health_data h
                   JOIN indicators i ON i.id = h.indicator_id
                   JOIN report_periods rp ON rp.id = h.period_id
                   WHERE i.program_id = %s
                     AND i.formula_type = 'percentage'
                     AND i.is_active = TRUE
                     AND rp.year = %s
                   ORDER BY h.period_id DESC
                   LIMIT 1""",
                [program_id, year],
            )
        period = cur.fetchone()

        if not period:
            programs.append({
                "program_code": code,
                "program_name": name,
                "flagship_code": flagship_code,
                "flagship_label": flagship_label,
                "period_id": None,
                "period_label": None,
                "period_type": None,
                "regional_pct": None,
                "status": "no_data",
                "on_target": 0,
                "below_target": 0,
                "locations_reporting": 0,
                "total_locations": OVERVIEW_TOTAL_LOCATIONS,
            })
            continue

        period_id, period_type, period_label = period

        # Per-LGU headline values at that period.
        if flagship_code:
            cur.execute(
                """SELECT h.value
                   FROM health_data h
                   JOIN indicators i ON i.id = h.indicator_id
                   JOIN locations l ON l.id = h.location_id
                   WHERE i.code = %s
                     AND h.period_id = %s
                     AND l.level IN ('province', 'city_municipality')""",
                [flagship_code, period_id],
            )
        else:
            # Fallback: average each LGU's % indicators for the program.
            cur.execute(
                """SELECT AVG(h.value)
                   FROM health_data h
                   JOIN indicators i ON i.id = h.indicator_id
                   JOIN locations l ON l.id = h.location_id
                   WHERE i.program_id = %s
                     AND i.formula_type = 'percentage'
                     AND i.is_active = TRUE
                     AND h.period_id = %s
                     AND l.level IN ('province', 'city_municipality')
                   GROUP BY l.id""",
                [program_id, period_id],
            )
        vals = [float(v[0]) for v in cur.fetchall() if v[0] is not None]
        avg = round(sum(vals) / len(vals), 4) if vals else None

        # Reporting completeness: distinct LGUs with any data this period.
        cur.execute(
            """SELECT COUNT(DISTINCT h.location_id)
               FROM health_data h
               JOIN indicators i ON i.id = h.indicator_id
               JOIN locations l ON l.id = h.location_id
               WHERE i.program_id = %s
                 AND h.period_id = %s
                 AND l.level IN ('province', 'city_municipality')""",
            [program_id, period_id],
        )
        reporting = cur.fetchone()[0] or 0

        programs.append({
            "program_code": code,
            "program_name": name,
            "flagship_code": flagship_code,
            "flagship_label": flagship_label or "Avg of % indicators",
            "period_id": period_id,
            "period_label": period_label,
            "period_type": period_type,
            "regional_pct": avg,
            "status": _status_for_ratio(avg),
            "on_target": sum(1 for v in vals if v >= _ON_TARGET),
            "below_target": sum(1 for v in vals if v < _BELOW_TARGET),
            "locations_reporting": reporting,
            "total_locations": OVERVIEW_TOTAL_LOCATIONS,
        })

    cur.close()
    conn.close()
    return {
        "year": year,
        "total_locations": OVERVIEW_TOTAL_LOCATIONS,
        "programs": programs,
    }
