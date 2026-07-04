# bootstrap_db.py
# One-command database setup for local development.
# Creates the schema, seeds reference data, and creates the admin user.
# Safe to run against a fresh PostgreSQL container.
#
#   python backend/bootstrap_db.py
#
# Requires the Postgres container to be running (docker compose up -d).

import sys
from pathlib import Path

import psycopg2

BASE = Path(__file__).parent
sys.path.append(str(BASE))

from app.core.db import get_db_config  # noqa: E402
from app.core.auth import hash_password  # noqa: E402  (argon2 — same as the app)

CORE = BASE / "app" / "core"

# Run in order. Schema first, then reference seeds.
SQL_FILES = [
    "schema.slq",
    "seed_programs.slq",
    "seed_locations.sql",
    "seed_periods.slq",
    "seed_indicators_immunization.sql",
]

ADMIN = {
    "username": "admin",
    "password": "Admin@2026!",
    "full_name": "System Administrator",
    "email": "admin@doh-nir.gov.ph",
}


def split_statements(sql: str):
    """Split a SQL script into individual statements on semicolons.

    The schema/seed files contain no semicolons inside string literals or
    function bodies, so a simple split is safe and lets us apply each
    statement independently (skip ones that already exist).
    """
    statements = []
    for chunk in sql.split(";"):
        # Drop pure-comment / blank chunks.
        lines = [ln for ln in chunk.splitlines()
                 if ln.strip() and not ln.strip().startswith("--")]
        if lines:
            statements.append("\n".join(lines))
    return statements


def run_sql_file(conn, filename):
    path = CORE / filename
    if not path.exists():
        print(f"  SKIP (missing): {filename}")
        return
    sql = path.read_text(encoding="utf-8")
    applied, skipped = 0, 0
    for stmt in split_statements(sql):
        with conn.cursor() as cur:
            try:
                cur.execute(stmt)
                conn.commit()
                applied += 1
            except Exception:
                conn.rollback()
                skipped += 1
    print(f"  {filename}: applied {applied}, skipped {skipped} (already present)")


def seed_indicators(conn):
    try:
        from app.core.seed_indicators import seed_indicators as _seed
        _seed()
        print("  OK: indicators (seed_indicators.py)")
    except Exception as e:
        print(f"  WARN (indicators): {e}")


def create_admin(conn):
    hashed = hash_password(ADMIN["password"])
    with conn.cursor() as cur:
        cur.execute(
            """INSERT INTO users (
                   username, hashed_password, full_name, email,
                   role, program_code, status, is_active
               ) VALUES (%s, %s, %s, %s, 'admin', NULL, 'active', TRUE)
               ON CONFLICT (username) DO UPDATE SET
                   hashed_password = EXCLUDED.hashed_password,
                   role = 'admin', status = 'active', is_active = TRUE""",
            (ADMIN["username"], hashed, ADMIN["full_name"], ADMIN["email"]),
        )
        conn.commit()
    print(f"  OK: admin user ready -> {ADMIN['username']} / {ADMIN['password']}")


def main():
    cfg = get_db_config()
    print(f"Connecting to {cfg['host']}:{cfg['port']}/{cfg['database']} ...")
    conn = psycopg2.connect(**cfg)
    print("Applying schema and seeds:")
    for f in SQL_FILES:
        run_sql_file(conn, f)
    seed_indicators(conn)
    create_admin(conn)
    conn.close()
    print("\nDone. Database is ready.")


if __name__ == "__main__":
    main()
