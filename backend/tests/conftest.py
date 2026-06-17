"""Pytest setup: make the `app` package importable from backend/tests.

The backend uses `from app.core...` style imports with `backend/` on sys.path
(see backend/main.py). Tests need the same path entry.
"""
import os
import sys

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
