#!/usr/bin/env python3
"""Read-only data-quality audit for committed health_data.

Scans every indicator for the error classes we've actually hit, and prints a
summary. Read-only — never writes. Exit code is non-zero when anomalies are
found, so it can later gate CI.

Run:
    docker compose exec backend python backend/scripts/audit_data_quality.py
"""

import sys
from pathlib import Path

# Make the `app` package importable (mirrors backend/main.py and bootstrap_db.py).
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BACKEND_DIR))

from app.core.db import get_db_connection  # noqa: E402

# A correct percentage is stored as a ratio (1.0 == 100%). Anything above this
# is almost certainly a percentage-number stored where a ratio was expected
# (the File 1 birth-dose ×100 bug). A little headroom over 1.0 for legitimate
# >100% over-reporting.
RATIO_SANITY_MAX = 1.1


def _rows(cur, sql):
    cur.execute(sql)
    return cur.fetchall()


def audit() -> int:
    conn = get_db_connection()
    cur = conn.cursor()
    anomalies = 0

    print("=" * 64)
    print("DATA QUALITY AUDIT  —  health_data")
    print("=" * 64)

    # 1) Negative values (counts/percentages should never be negative).
    neg = _rows(cur, """
        SELECT i.code, COUNT(*)
        FROM health_data hd JOIN indicators i ON i.id = hd.indicator_id
        WHERE hd.value < 0
        GROUP BY i.code ORDER BY 2 DESC
    """)
    print("\n[1] Negative values")
    if neg:
        anomalies += len(neg)
        for code, n in neg:
            print(f"    ✗ {code:<24} {n} negative row(s)")
    else:
        print("    ✓ none")

    # 2) NULL values.
    null_rows = _rows(cur, """
        SELECT i.code, COUNT(*)
        FROM health_data hd JOIN indicators i ON i.id = hd.indicator_id
        WHERE hd.value IS NULL
        GROUP BY i.code ORDER BY 2 DESC
    """)
    print("\n[2] NULL values")
    if null_rows:
        anomalies += len(null_rows)
        for code, n in null_rows:
            print(f"    ✗ {code:<24} {n} null row(s)")
    else:
        print("    ✓ none")

    # 3) Percentage indicators stored out of ratio range (the ×100 bug).
    bad_pct = _rows(cur, f"""
        SELECT i.code,
               COUNT(*) FILTER (WHERE hd.value > {RATIO_SANITY_MAX}) AS over,
               ROUND(MAX(hd.value), 4) AS maxv
        FROM health_data hd JOIN indicators i ON i.id = hd.indicator_id
        WHERE i.formula_type = 'percentage'
        GROUP BY i.code
        HAVING COUNT(*) FILTER (WHERE hd.value > {RATIO_SANITY_MAX}) > 0
        ORDER BY over DESC
    """)
    print(f"\n[3] Percentages stored as non-ratios (value > {RATIO_SANITY_MAX})")
    if bad_pct:
        anomalies += len(bad_pct)
        for code, over, maxv in bad_pct:
            mv = float(maxv)
            print(f"    ✗ {code:<24} {over} row(s) over range, max stored={mv:.4f} "
                  f"(displays as {mv * 100:.0f}% — looks ~100x too large)")
    else:
        print("    ✓ none")

    cur.close()
    conn.close()

    print("\n" + "=" * 64)
    if anomalies:
        print(f"RESULT: {anomalies} indicator-level anomaly group(s) found.")
    else:
        print("RESULT: clean — no anomalies.")
    print("=" * 64)
    return 1 if anomalies else 0


if __name__ == "__main__":
    sys.exit(audit())
