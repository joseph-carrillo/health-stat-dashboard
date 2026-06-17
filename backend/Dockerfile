# Health Statistics Dashboard — Backend (FastAPI) image
#
# Multi-stage build:
#   - development: live-reload, source mounted via docker-compose
#   - production:  non-root, gunicorn + uvicorn workers
#
# Build:
#   docker build --target development -t healthstat-backend:dev backend
#   docker build --target production  -t healthstat-backend:prod backend
#
# Run context is the repo root (see docker-compose.yml `build.context: .`),
# so paths below are relative to the repo root, not backend/.

# ========================================================================
# Stage 1: base — shared Python env + dependencies
# ========================================================================
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# psycopg2-binary, pandas, openpyxl all ship manylinux wheels, so no
# build-essential / libpq-dev is needed — keeps the image small.
# curl is included for container healthchecks.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first for layer caching.
COPY requirements.txt ./
RUN pip install -r requirements.txt

# ========================================================================
# Stage 2: development — live reload
# ========================================================================
FROM base AS development

# Source is bind-mounted by docker-compose in dev; this COPY is a fallback
# so the image also runs standalone.
COPY backend ./backend

EXPOSE 8000

# backend/main.py does sys.path.append(__file__.parent) so `from app.core...`
# resolves when launched as backend.main:app from /app.
CMD ["uvicorn", "backend.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

# ========================================================================
# Stage 3: production — hardened, gunicorn
# ========================================================================
FROM base AS production

COPY backend ./backend

# Non-root user; own the upload dir so runtime writes succeed.
RUN groupadd --system app \
    && useradd --system --gid app --home /app app \
    && mkdir -p /app/backend/data/uploads \
    && chown -R app:app /app
USER app

EXPOSE 8000

# 3 sync-style uvicorn workers behind gunicorn (2*CPU+1 on a 1-CPU host).
CMD ["gunicorn", "backend.main:app", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "--workers", "3", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
