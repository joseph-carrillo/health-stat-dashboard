# audit.py
# Lightweight audit logging for the DOH-NIR Dashboard.
# Every data-changing action (upload, approve, conflict resolution,
# user role changes) is recorded here. Required by the Philippines
# Data Privacy Act compliance rules in CLAUDE.md.

import json
import logging
from datetime import datetime

from app.core.db import get_db_connection

logger = logging.getLogger(__name__)


AUDIT_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS audit_log (
    id              SERIAL PRIMARY KEY,
    actor_id        INTEGER,
    actor_username  VARCHAR(100),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100),
    entity_id       VARCHAR(255),
    details         JSONB,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_actor  ON audit_log(actor_id);
"""


def ensure_audit_table():
    """Create the audit_log table if it does not exist.

    Safe to call on every startup. Lets existing databases pick up
    the new table without a full schema rebuild.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(AUDIT_TABLE_SQL)
        conn.commit()
        cur.close()
        conn.close()
    finally:
        conn.close()


def write_audit(
    action: str,
    actor: dict = None,
    entity_type: str = None,
    entity_id: str = None,
    details: dict = None,
):
    """Record an action in the audit log.

    Never raises — auditing must not break the underlying operation. A failed
    write is logged (not silently dropped): under the Data Privacy Act a
    missing audit entry is a compliance gap and must be detectable.
    """
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO audit_log (
                   actor_id, actor_username, action,
                   entity_type, entity_id, details, created_at
               ) VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (
                (actor or {}).get("user_id"),
                (actor or {}).get("username"),
                action,
                entity_type,
                str(entity_id) if entity_id is not None else None,
                json.dumps(details) if details is not None else None,
                datetime.now(),
            ),
        )
        conn.commit()
        cur.close()
    except Exception:
        # Auditing is best-effort — never propagate to the caller — but a
        # dropped audit event must leave a trace instead of vanishing.
        logger.exception(
            "Failed to write audit log entry (action=%s, entity=%s:%s)",
            action, entity_type, entity_id,
        )
    finally:
        if conn is not None:
            conn.close()


def get_audit_log(limit: int = 100) -> list:
    """Return the most recent audit entries."""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """SELECT id, actor_username, action, entity_type,
                      entity_id, details, created_at
               FROM audit_log
               ORDER BY created_at DESC
               LIMIT %s""",
            (limit,),
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [
            {
                "id": r[0],
                "actor": r[1],
                "action": r[2],
                "entity_type": r[3],
                "entity_id": r[4],
                "details": r[5],
                "created_at": str(r[6]),
            }
            for r in rows
        ]
    finally:
        conn.close()
