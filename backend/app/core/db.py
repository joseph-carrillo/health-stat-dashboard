# db.py
# Centralized database configuration and connection helper.
# Reads from environment variables so the same code runs on a
# local machine and inside Docker without edits. Falls back to the
# development defaults used across both team machines.

import os
import psycopg2


DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "doh_nir_dashboard"),
    "user": os.getenv("DB_USER", "doh_admin"),
    "password": os.getenv("DB_PASSWORD", "doh_password_2026"),
}


def get_db_connection():
    """Return a new PostgreSQL connection using the shared config."""
    return psycopg2.connect(**DB_CONFIG)
