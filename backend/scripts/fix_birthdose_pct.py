#!/usr/bin/env python3
"""Fix the File 1 (CPAB/BCG/HepaB birth dose) percentages stored 100x too large.

An early parser stored these five percentages as percentage-numbers (e.g. 7.71)
instead of ratios (0.0771). This recomputes each from its sound source inputs:

    <X>_PCT = <X>_TOTAL / IMMUN_POP_0_11M

Idempotent and safe to re-run. Dry-run by default — prints proposed changes and
writes nothing. Pass --apply to commit (in a single transaction, with an audit
log entry per indicator).

    docker compose exec backend python backend/scripts/fix_birthdose_pct.py          # dry run
    docker compose exec backend python backend/scripts/fix_birthdose_pct.py --apply  # apply
"""

import argparse
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BACKEND_DIR))

from app.core.db import get_db_connection  # noqa: E402
from app.core.audit import write_audit     # noqa: E402

DENOMINATOR_CODE = "IMMUN_POP_0_11M"

# Affected percentage indicator -> its numerator total. Denominator is shared.
AFFECTED = {
    "CPAB_PCT": "CPAB_TOTAL",
    "BCG_24H_PCT": "BCG_24H_TOTAL",
    "BCG_GT24H_PCT": "BCG_GT24H_TOTAL",
    "HEPAB_24H_PCT": "HEPAB_24H_TOTAL",
    "HEPAB_GT24H_PCT": "HEPAB_GT24H_TOTAL",
}


def _indicator_ids(cur) -> dict:
    """Map indicator code -> id for every code we touch."""
    codes = set(AFFECTED) | set(AFFECTED.values()) | {DENOMINATOR_CODE}
    cur.execute(
        "SELECT code, id FROM indicators WHERE code = ANY(%s)", (list(codes),)
    )
    found = {code: cid for code, cid in cur.fetchall()}
    missing = codes - set(found)
    if missing:
        raise SystemExit(f"ERROR: indicators not found in DB: {sorted(missing)}")
    return found


def _planned_changes(cur, pct_id, total_id, pop_id):
    """Return list of (location_id, period_id, old, new) where value differs."""
    cur.execute(
        """
        SELECT pct.location_id, pct.period_id, pct.value, t.value, p.value
        FROM health_data pct
        JOIN health_data t ON t.location_id = pct.location_id
                          AND t.period_id   = pct.period_id
                          AND t.indicator_id = %s
        JOIN health_data p ON p.location_id = pct.location_id
                          AND p.period_id   = pct.period_id
                          AND p.indicator_id = %s
        WHERE pct.indicator_id = %s
        """,
        (total_id, pop_id, pct_id),
    )
    changes = []
    for loc_id, per_id, old, numer, pop in cur.fetchall():
        new = round(float(numer) / float(pop), 4) if pop and float(pop) != 0 else 0.0
        if round(float(old), 4) != new:
            changes.append((loc_id, per_id, float(old), new))
    return changes


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--apply", action="store_true",
                    help="commit the fix (default is a dry run)")
    args = ap.parse_args()
    dry_run = not args.apply

    conn = get_db_connection()
    cur = conn.cursor()
    ids = _indicator_ids(cur)
    pop_id = ids[DENOMINATOR_CODE]

    mode = "DRY RUN (no writes)" if dry_run else "APPLY"
    print("=" * 64)
    print(f"Fix birth-dose percentages  —  {mode}")
    print("=" * 64)

    total_changes = 0
    for pct_code, total_code in AFFECTED.items():
        pct_id, total_id = ids[pct_code], ids[total_code]
        changes = _planned_changes(cur, pct_id, total_id, pop_id)
        print(f"\n{pct_code}: {len(changes)} row(s) to fix")
        for loc_id, per_id, old, new in changes[:5]:
            print(f"    loc {loc_id:<5} period {per_id:<3} {old:>10.4f} -> {new:.4f}")
        if len(changes) > 5:
            print(f"    ... and {len(changes) - 5} more")

        if not dry_run and changes:
            for loc_id, per_id, _old, new in changes:
                cur.execute(
                    """UPDATE health_data SET value = %s
                       WHERE indicator_id = %s AND location_id = %s
                         AND period_id = %s""",
                    (new, pct_id, loc_id, per_id),
                )
            olds = [c[2] for c in changes]
            news = [c[3] for c in changes]
            write_audit(
                action="data_fix.recompute_pct",
                actor={"username": "fix_birthdose_pct.py"},
                entity_type="indicator",
                entity_id=pct_code,
                details={
                    "rows_changed": len(changes),
                    "old_min": min(olds), "old_max": max(olds),
                    "new_min": min(news), "new_max": max(news),
                    "sample": changes[0],
                },
            )
        total_changes += len(changes)

    if dry_run:
        conn.rollback()
        print(f"\nDRY RUN complete — {total_changes} row(s) would change. "
              f"Re-run with --apply to commit.")
    else:
        conn.commit()
        print(f"\nAPPLIED — {total_changes} row(s) updated, audit entries written.")

    cur.close()
    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
