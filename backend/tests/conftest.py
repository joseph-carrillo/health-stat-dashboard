"""Pytest setup: make the `app` package importable from backend/tests.

The backend uses `from app.core...` style imports with `backend/` on sys.path
(see backend/main.py). Tests need the same path entry.
"""
import os
import sys

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Secrets are fail-fast (app/core/env.py) and CI has no .env. Unit tests never
# touch a real DB or issue real tokens, so provide obviously-fake values here
# to keep imports of app.core.auth / backend.main working under pytest.
# setdefault: a developer's real env still wins locally.
os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-not-for-runtime")
os.environ.setdefault("DB_PASSWORD", "test-only-password")
