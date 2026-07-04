# db.py
# Centralized database configuration and connection helper.
# Reads from environment variables so the same code runs on a
# local machine and inside Docker without edits. Non-secret settings
# keep development defaults; the password has no fallback and the app
# refuses to start without it (see app/core/env.py).

import os
import psycopg2

from app.core.env import require_env


def get_db_config() -> dict:
    """Build the connection config from the environment.

    Evaluated lazily (per call, not at import) so importing this module never
    requires env vars — unit tests and CI import app code without a .env.
    The missing-password crash then happens on the first connection attempt,
    which for the API is the FastAPI startup event: the app still refuses to
    serve without a real password, it just fails at boot instead of import.
    """
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5432")),
        "database": os.getenv("DB_NAME", "doh_nir_dashboard"),
        "user": os.getenv("DB_USER", "doh_admin"),
        "password": require_env("DB_PASSWORD"),
    }


def get_db_connection():
    """Return a new PostgreSQL connection using the shared config."""
    return psycopg2.connect(**get_db_config())
