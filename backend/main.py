# main.py
# Entry point for the Health Statistics Dashboard API
# DOH-NIR CHD Philippines

import os
import shutil
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import our services
import sys
sys.path.append(str(Path(__file__).parent))
from app.services.parser import parse_file
from app.services.commit import (
    get_batch_summary,
    get_conflicts,
    resolve_conflict,
    approve_batch
)

# =====================================================
# APP SETUP
# =====================================================
app = FastAPI(
    title="DOH-NIR Health Statistics Dashboard",
    description="API for the NIR CHD Health Statistics Dashboard",
    version="0.1.0"
)

# Allow frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# =====================================================
# ENDPOINT 1 — Health Check
# =====================================================
@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "DOH-NIR Dashboard API is running",
        "version": "0.1.0"
    }


# =====================================================
# ENDPOINT 2 — Upload and Parse Excel File
# =====================================================
@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    template_id: str = "cpab_bcg_hepa",
    year: int = 2026,
    month: int = 1
):
    """
    Upload an FHSIS Excel file for parsing.
    Returns a batch_id for tracking the upload.
    """

    # Validate file type
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="Only Excel files (.xlsx, .xls) are accepted."
        )

    # Save file temporarily
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run parser
    result = parse_file(
        file_path=str(file_path),
        template_id=template_id,
        year=year,
        month=month,
        uploaded_by=None
    )

    # Clean up temp file
    os.remove(file_path)

    if not result.get("success"):
        raise HTTPException(
            status_code=422,
            detail=result.get("error", "Parser failed")
        )

    return result


# =====================================================
# ENDPOINT 3 — Get Batch Summary
# =====================================================
@app.get("/api/staging/{batch_id}")
def get_staging_summary(batch_id: str):
    """
    Get a summary of staged data for a batch.
    Call this after upload to review before approving.
    """
    summary = get_batch_summary(batch_id)
    if "error" in summary:
        raise HTTPException(status_code=404, detail=summary["error"])
    return summary


# =====================================================
# ENDPOINT 4 — Get Conflicts
# =====================================================
@app.get("/api/staging/{batch_id}/conflicts")
def get_batch_conflicts(batch_id: str):
    """
    Get all conflicting rows in a batch.
    Shows existing value vs incoming value side by side.
    """
    conflicts = get_conflicts(batch_id)
    return {
        "batch_id": batch_id,
        "total_conflicts": len(conflicts),
        "conflicts": conflicts
    }


# =====================================================
# ENDPOINT 5 — Resolve a Conflict
# =====================================================
@app.post("/api/staging/conflict/{staging_id}/resolve")
def resolve_staging_conflict(
    staging_id: int,
    decision: str
):
    """
    Resolve a single conflict.
    decision must be 'accept' (use incoming) or
    'reject' (keep original)
    """
    if decision not in ["accept", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Decision must be 'accept' or 'reject'"
        )
    result = resolve_conflict(
        staging_id=staging_id,
        decision=decision,
        resolved_by=None
    )
    return result


# =====================================================
# ENDPOINT 6 — Approve Batch
# =====================================================
@app.post("/api/staging/{batch_id}/approve")
def approve_staging_batch(batch_id: str):
    """
    Approve a batch and commit data to health_data.
    All conflicts must be resolved before approving.
    """
    result = approve_batch(
        batch_id=batch_id,
        approved_by=None
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return result


# =====================================================
# ENDPOINT 7 — Get Health Data
# =====================================================
@app.get("/api/health-data")
def get_health_data(
    indicator_code: str = None,
    location_psgc: str = None,
    year: int = 2026,
    month: int = None
):
    """
    Get committed health data with optional filters.
    """
    import psycopg2

    DB_CONFIG = {
        "host": "localhost",
        "port": 5432,
        "database": "doh_nir_dashboard",
        "user": "doh_admin",
        "password": "doh_password_2026"
    }

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    query = """
        SELECT
            l.psgc,
            l.name as location,
            i.code as indicator_code,
            i.name as indicator_name,
            rp.year,
            rp.period_type,
            rp.period_value,
            rp.label as period_label,
            h.value,
            h.uploaded_at
        FROM health_data h
        JOIN locations l ON l.id = h.location_id
        JOIN indicators i ON i.id = h.indicator_id
        JOIN report_periods rp ON rp.id = h.period_id
        WHERE rp.year = %s
    """
    params = [year]

    if indicator_code:
        query += " AND i.code = %s"
        params.append(indicator_code)

    if location_psgc:
        query += " AND l.psgc = %s"
        params.append(location_psgc)

    if month:
        query += " AND rp.period_value = %s AND rp.period_type = 'monthly'"
        params.append(month)

    query += " ORDER BY l.name, i.code LIMIT 500"

    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {
        "total": len(rows),
        "data": [
            {
                "psgc": row[0],
                "location": row[1],
                "indicator_code": row[2],
                "indicator_name": row[3],
                "year": row[4],
                "period_type": row[5],
                "period_value": row[6],
                "period_label": row[7],
                "value": float(row[8]) if row[8] else None,
                "uploaded_at": str(row[9])
            }
            for row in rows
        ]
    }