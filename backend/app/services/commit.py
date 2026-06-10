# commit.py
# Handles approval and commitment of staged health data
# Moves approved data from staging_health_data to health_data
# DOH-NIR CHD Health Statistics Dashboard

from datetime import datetime

from app.core.db import get_db_connection


def _savepoint_execute(cur, sql, params):
    """Run SQL inside a savepoint so one failure does not abort the whole batch."""
    cur.execute("SAVEPOINT commit_row")
    try:
        cur.execute(sql, params)
        cur.execute("RELEASE SAVEPOINT commit_row")
        return True
    except Exception:
        cur.execute("ROLLBACK TO SAVEPOINT commit_row")
        cur.execute("RELEASE SAVEPOINT commit_row")
        return False


# =====================================================
# GET BATCH SUMMARY
# Returns a summary of what is in staging for a batch
# =====================================================

def get_batch_summary(batch_id: str) -> dict:
    """
    Returns a summary of staged data for a given batch.
    Call this before approving so the user can review.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    # Total rows in batch
    cur.execute(
        "SELECT COUNT(*) FROM staging_health_data WHERE batch_id = %s",
        (batch_id,)
    )
    total = cur.fetchone()[0]

    if total == 0:
        conn.close()
        return {"error": f"Batch {batch_id} not found or already processed"}

    # Passed vs failed validation
    cur.execute(
        """SELECT validation_status, COUNT(*)
           FROM staging_health_data
           WHERE batch_id = %s
           GROUP BY validation_status""",
        (batch_id,)
    )
    status_counts = dict(cur.fetchall())

    # Conflicts
    cur.execute(
        """SELECT COUNT(*)
           FROM staging_health_data
           WHERE batch_id = %s
           AND conflict_status = 'pending_review'""",
        (batch_id,)
    )
    conflicts = cur.fetchone()[0]

    # Sample of what is in this batch
    cur.execute(
        """SELECT
               l.name as location,
               i.code as indicator,
               s.value,
               s.validation_status,
               s.conflict_status,
               s.existing_value
           FROM staging_health_data s
           JOIN locations l ON l.id = s.location_id
           JOIN indicators i ON i.id = s.indicator_id
           WHERE s.batch_id = %s
           ORDER BY l.name, i.code
           LIMIT 20""",
        (batch_id,)
    )
    sample = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "batch_id": batch_id,
        "total_rows": total,
        "passed": status_counts.get("passed", 0),
        "failed": status_counts.get("failed", 0),
        "conflicts": conflicts,
        "can_approve": status_counts.get("failed", 0) == 0,
        "sample": [
            {
                "location": row[0],
                "indicator": row[1],
                "value": row[2],
                "validation_status": row[3],
                "conflict_status": row[4],
                "existing_value": row[5]
            }
            for row in sample
        ]
    }


# =====================================================
# GET CONFLICTS
# Returns all rows with conflicts for human review
# =====================================================

def get_conflicts(batch_id: str) -> list:
    """
    Returns all conflicting rows in a batch.
    Shows existing value vs incoming value side by side.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """SELECT
               s.id,
               l.name as location,
               i.code as indicator,
               i.name as indicator_name,
               s.existing_value,
               s.value as incoming_value,
               s.conflict_status
           FROM staging_health_data s
           JOIN locations l ON l.id = s.location_id
           JOIN indicators i ON i.id = s.indicator_id
           WHERE s.batch_id = %s
           AND s.conflict_status = 'pending_review'
           ORDER BY l.name, i.code""",
        (batch_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "staging_id": row[0],
            "location": row[1],
            "indicator_code": row[2],
            "indicator_name": row[3],
            "existing_value": float(row[4]) if row[4] is not None else None,
            "incoming_value": float(row[5]) if row[5] is not None else None,
            "is_percentage": str(row[2] or "").endswith("_PCT"),
            "conflict_status": row[6],
        }
        for row in rows
    ]


def get_staged_rows(batch_id: str, limit: int = 500) -> list:
    """All values in a batch (new/changed only — unchanged are not staged)."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT
               s.id,
               l.name as location,
               i.code as indicator,
               s.value,
               s.validation_status,
               s.conflict_status,
               s.existing_value
           FROM staging_health_data s
           JOIN locations l ON l.id = s.location_id
           JOIN indicators i ON i.id = s.indicator_id
           WHERE s.batch_id = %s
           ORDER BY l.name, i.code
           LIMIT %s""",
        (batch_id, limit),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "staging_id": row[0],
            "location": row[1],
            "indicator_code": row[2],
            "value": float(row[3]) if row[3] is not None else None,
            "validation_status": row[4],
            "conflict_status": row[5],
            "existing_value": float(row[6]) if row[6] is not None else None,
            "is_percentage": str(row[2] or "").endswith("_PCT"),
        }
        for row in rows
    ]


# =====================================================
# RESOLVE CONFLICT
# User decides to keep original or use incoming value
# =====================================================

def resolve_conflict(
    staging_id: int,
    decision: str,
    resolved_by: int = None
) -> dict:
    """
    Resolve a single conflict.

    Args:
        staging_id: ID of the staging row
        decision: 'accept' (use incoming) or 'reject' (keep original)
        resolved_by: User ID making the decision
    """
    if decision not in ["accept", "reject"]:
        return {"error": "Decision must be 'accept' or 'reject'"}

    conn = get_db_connection()
    cur = conn.cursor()

    new_status = "accepted" if decision == "accept" else "rejected"

    cur.execute(
        """UPDATE staging_health_data
           SET conflict_status = %s,
               approved_by = %s,
               approved_at = %s
           WHERE id = %s""",
        (new_status, resolved_by, datetime.now(), staging_id)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {
        "staging_id": staging_id,
        "decision": decision,
        "new_status": new_status
    }


def resolve_conflicts_bulk(
    batch_id: str,
    decision: str,
    resolved_by: int = None,
    staging_ids: list | None = None,
) -> dict:
    """Resolve many conflicts in one request (all pending or selected IDs)."""
    if decision not in ["accept", "reject"]:
        return {"error": "Decision must be 'accept' or 'reject'"}

    new_status = "accepted" if decision == "accept" else "rejected"
    conn = get_db_connection()
    cur = conn.cursor()
    now = datetime.now()

    if staging_ids:
        cur.execute(
            """UPDATE staging_health_data
               SET conflict_status = %s,
                   approved_by = %s,
                   approved_at = %s
               WHERE batch_id = %s
                 AND conflict_status = 'pending_review'
                 AND id = ANY(%s)""",
            (new_status, resolved_by, now, batch_id, staging_ids),
        )
    else:
        cur.execute(
            """UPDATE staging_health_data
               SET conflict_status = %s,
                   approved_by = %s,
                   approved_at = %s
               WHERE batch_id = %s
                 AND conflict_status = 'pending_review'""",
            (new_status, resolved_by, now, batch_id),
        )

    updated = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    return {
        "batch_id": batch_id,
        "decision": decision,
        "new_status": new_status,
        "updated": updated,
    }


# =====================================================
# APPROVE BATCH
# Moves approved data from staging to health_data
# =====================================================

def approve_batch(batch_id: str, approved_by=None, force=False):
    """
    Approve a batch and commit data to health_data.

    Rules:
    - All validation_status must be 'passed'
    - All conflict_status must be resolved
      (none, accepted, or rejected — not pending_review)
    - Rejected conflicts are skipped (keep original)
    - Accepted conflicts overwrite existing data
    - New data is inserted fresh
    """
    conn = get_db_connection()
    cur = conn.cursor()

    # Check for unresolved conflicts
    cur.execute(
        """SELECT COUNT(*) FROM staging_health_data
           WHERE batch_id = %s
           AND conflict_status = 'pending_review'""",
        (batch_id,)
    )
    unresolved = cur.fetchone()[0]
    if unresolved > 0 and not force:
        return {
            "success": False,
            "error": f"{unresolved} conflicts still pending review. Resolve all conflicts before approving."
        }

    # Check for failed validation
    cur.execute(
        """SELECT COUNT(*) FROM staging_health_data
           WHERE batch_id = %s
           AND validation_status = 'failed'""",
        (batch_id,)
    )
    failed = cur.fetchone()[0]
    if failed > 0 and not force:
        conn.close()
        return {
            "success": False,
            "error": f"{failed} rows failed DQC validation. "
                     f"Cannot approve a batch with validation errors."
        }

    # Get all rows to commit
    # NOTE: We do NOT filter out NULL values here in SQL.
    # NULL handling happens in Python below so we can:
    #   1. Count how many were blank (skipped_null)
    #   2. Protect previously-committed real values from being overwritten
    cur.execute(
        """SELECT
               indicator_id, location_id, period_id,
               value, is_computed, source_file,
               conflict_status
           FROM staging_health_data
           WHERE batch_id = %s
           AND conflict_status != 'rejected'""",
        (batch_id,)
    )
    rows = cur.fetchall()

    inserted = 0
    updated = 0
    skipped = 0
    skipped_null = 0    # blank cells from Excel — intentionally not written
    auto_resolved = 0   # pending_review conflicts auto-accepted under force=True

    for row in rows:
        (indicator_id, location_id, period_id,
         value, is_computed, source_file,
         conflict_status) = row

        # Skip blank values (NULL from Excel empty cells).
        # Protects existing committed data from being overwritten with blanks.
        if value is None:
            skipped_null += 1
            continue

        # When force=True (the UI's "Approve and Commit" path), unresolved
        # conflicts are treated as accepted — use the incoming value.
        # Without this, pending_review rows fall through every branch below
        # and silently never reach health_data — which leaves stale data
        # (including stale NULLs from previous buggy uploads) in place.
        effective_status = conflict_status
        if force and conflict_status == "pending_review":
            effective_status = "accepted"
            auto_resolved += 1

        if effective_status == "accepted":
            # Overwrite existing row (or insert if somehow absent)
            cur.execute(
                """UPDATE health_data
                   SET value = %s,
                       uploaded_by = %s,
                       uploaded_at = %s,
                       source_file = %s
                   WHERE indicator_id = %s
                   AND location_id = %s
                   AND period_id = %s""",
                (value, approved_by, datetime.now(), source_file,
                 indicator_id, location_id, period_id)
            )
            if cur.rowcount == 0:
                insert_sql = (
                    """INSERT INTO health_data (
                           indicator_id, location_id, period_id,
                           value, is_computed,
                           uploaded_by, uploaded_at, source_file
                       ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
                )
                insert_params = (
                    indicator_id, location_id, period_id,
                    value, is_computed,
                    approved_by, datetime.now(), source_file,
                )
                if _savepoint_execute(cur, insert_sql, insert_params):
                    inserted += 1
                else:
                    cur.execute(
                        """UPDATE health_data
                           SET value = %s,
                               uploaded_by = %s,
                               uploaded_at = %s,
                               source_file = %s
                           WHERE indicator_id = %s
                           AND location_id = %s
                           AND period_id = %s""",
                        (value, approved_by, datetime.now(), source_file,
                         indicator_id, location_id, period_id),
                    )
                    if cur.rowcount:
                        updated += 1
                    else:
                        skipped += 1
            else:
                updated += 1

        elif effective_status == "none":
            insert_sql = (
                """INSERT INTO health_data (
                       indicator_id, location_id, period_id,
                       value, is_computed,
                       uploaded_by, uploaded_at, source_file
                   ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
            )
            insert_params = (
                indicator_id, location_id, period_id,
                value, is_computed,
                approved_by, datetime.now(), source_file,
            )
            if _savepoint_execute(cur, insert_sql, insert_params):
                inserted += 1
            else:
                cur.execute(
                    """UPDATE health_data
                       SET value = %s,
                           uploaded_by = %s,
                           uploaded_at = %s,
                           source_file = %s
                       WHERE indicator_id = %s
                       AND location_id = %s
                       AND period_id = %s""",
                    (value, approved_by, datetime.now(), source_file,
                     indicator_id, location_id, period_id),
                )
                if cur.rowcount:
                    updated += 1
                else:
                    skipped += 1

    # Mark batch as approved in staging
    cur.execute(
        """UPDATE staging_health_data
           SET approved_by = %s,
               approved_at = %s
           WHERE batch_id = %s""",
        (approved_by, datetime.now(), batch_id)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {
        "success": True,
        "batch_id": batch_id,
        "inserted": inserted,
        "updated": updated,
        "auto_resolved": auto_resolved,  # pending_review conflicts auto-accepted under force=True
        "skipped": skipped,              # DB insert errors
        "skipped_null": skipped_null,    # Blank cells from Excel — intentionally not written
        "total_committed": inserted + updated
    }


# =====================================================
# TEST RUN
# =====================================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python commit.py <batch_id>")
        print("       python commit.py <batch_id> approve")
        sys.exit(1)

    batch_id = sys.argv[1]
    action = sys.argv[2] if len(sys.argv) > 2 else "summary"

    if action == "summary":
        print("BATCH SUMMARY")
        print("=" * 40)
        summary = get_batch_summary(batch_id)
        for key, value in summary.items():
            if key != "sample":
                print(f"{key}: {value}")
        print("\nSample rows:")
        for row in summary.get("sample", []):
            print(f"  {row['location']} | "
                  f"{row['indicator']} | "
                  f"{row['value']} | "
                  f"{row['validation_status']}")

    elif action == "conflicts":
        print("CONFLICTS")
        print("=" * 40)
        conflicts = get_conflicts(batch_id)
        if not conflicts:
            print("No conflicts found.")
        for c in conflicts:
            print(f"  ID:{c['staging_id']} | "
                  f"{c['location']} | "
                  f"{c['indicator_code']} | "
                  f"Existing: {c['existing_value']} | "
                  f"Incoming: {c['incoming_value']}")

    elif action == "approve":
        print("APPROVING BATCH")
        print("=" * 40)
        result = approve_batch(batch_id, approved_by=1)
        for key, value in result.items():
            print(f"{key}: {value}")