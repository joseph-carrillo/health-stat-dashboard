# main.py
# Entry point for the Health Statistics Dashboard API
# DOH-NIR CHD Philippines

import os
import shutil
import psycopg2
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta

# Import our services
import sys
sys.path.append(str(Path(__file__).parent))
from app.services.parser import parse_file
from app.services.commit import approve_batch, get_batch_summary, get_conflicts, resolve_conflict
from app.core.auth import (
    authenticate_user,
    create_access_token,
    decode_token,
    get_role_permissions,
    ACCESS_TOKEN_EXPIRE_MINUTES
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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "doh_nir_dashboard",
    "user": "doh_admin",
    "password": "doh_password_2026"
}

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
# ENDPOINT — Login
# =====================================================
@app.post("/api/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with username and password.
    Returns a JWT token valid for 8 hours.
    """
    user = authenticate_user(
        form_data.username,
        form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(
        data={
            "sub": user["username"],
            "role": user["role"],
            "program_code": user["program_code"],
            "user_id": user["id"]
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "full_name": user.get("full_name"),
            "role": user["role"],
            "permissions": get_role_permissions(user["role"])
        }
    }


# =====================================================
# HELPER — Get Current User from Token
# =====================================================
def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Extract and verify the current user from JWT token.
    Use this as a dependency in protected endpoints.
    """
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
    return {
        "username": payload.get("sub"),
        "role": payload.get("role"),
        "program_code": payload.get("program_code"),
        "user_id": payload.get("user_id"),
        "permissions": get_role_permissions(payload.get("role"))
    }


# =====================================================
# HELPER — Check Role Permission
# =====================================================
def require_permission(permission: str):
    """
    Factory function that returns a dependency
    checking for a specific permission.
    """
    def check_permission(
        current_user: dict = Depends(get_current_user)
    ):
        permissions = current_user.get("permissions", {})
        if not permissions.get(permission):
            raise HTTPException(
                status_code=403,
                detail=f"You do not have permission to do this. "
                       f"Required: {permission}"
            )
        return current_user
    return check_permission

# =====================================================
# ENDPOINT 2 — Upload and Parse Excel File
# =====================================================
@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    template_id: str = "cpab_bcg_hepa",
    year: int = 2026,
    month: int = 1,
    current_user: dict = Depends(require_permission("can_upload"))
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
def get_staging_summary(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
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
def get_batch_conflicts(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
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
    decision: str,
    current_user: dict = Depends(require_permission("can_approve"))
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
def approve_staging_batch(
    batch_id: str,
    current_user: dict = Depends(require_permission("can_approve"))
):
    """
    Approve a batch and commit data to health_data.
    All conflicts must be resolved before approving.
    """
    result = approve_batch(
        batch_id=batch_id,
        approved_by=current_user["user_id"],
        force=True
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
    month: int = None,
    current_user: dict = Depends(get_current_user)
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

    query += " ORDER BY l.name, i.code LIMIT 5000"

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


# =====================================================
# ENDPOINT — Register New User
# =====================================================
@app.post("/api/register")
def register_user(
    username: str,
    password: str,
    full_name: str,
    email: str
):
    """
    Register a new user account.
    Account starts as pending — admin must assign role.
    """
    from app.core.auth import hash_password

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM users WHERE username = %s OR email = %s",
        (username, email)
    )
    if cur.fetchone():
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists."
        )

    hashed = hash_password(password)
    cur.execute(
        """INSERT INTO users (
            username, hashed_password, full_name,
            email, role, status, is_active
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id""",
        (username, hashed, full_name, email,
         None, 'pending', False)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "success": True,
        "message": "Account created. Waiting for admin activation.",
        "user_id": new_id,
        "username": username
    }


# =====================================================
# ENDPOINT — Get All Users (Admin only)
# =====================================================
@app.get("/api/admin/users")
def get_all_users(
    current_user: dict = Depends(
        require_permission("can_manage_users")
    )
):
    """Get all users. Admin only."""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute(
        """SELECT id, username, full_name, email,
                  role, program_code, status,
                  is_active, created_at, last_login
           FROM users ORDER BY created_at DESC"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {
        "total": len(rows),
        "users": [
            {
                "id": row[0],
                "username": row[1],
                "full_name": row[2],
                "email": row[3],
                "role": row[4],
                "program_code": row[5],
                "status": row[6],
                "is_active": row[7],
                "created_at": str(row[8]),
                "last_login": str(row[9]) if row[9] else None
            }
            for row in rows
        ]
    }


# =====================================================
# ENDPOINT — Get Pending Users (Admin only)
# =====================================================
@app.get("/api/admin/users/pending")
def get_pending_users(
    current_user: dict = Depends(
        require_permission("can_manage_users")
    )
):
    """Get pending users waiting for role assignment. Admin only."""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute(
        """SELECT id, username, full_name, email,
                  status, created_at
           FROM users
           WHERE status = 'pending'
           ORDER BY created_at DESC"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {
        "total": len(rows),
        "users": [
            {
                "id": row[0],
                "username": row[1],
                "full_name": row[2],
                "email": row[3],
                "status": row[4],
                "created_at": str(row[5])
            }
            for row in rows
        ]
    }


# =====================================================
# ENDPOINT — Assign Role (Admin only)
# =====================================================
@app.post("/api/admin/users/{user_id}/assign-role")
def assign_role(
    user_id: int,
    role: str,
    program_code: str = None,
    current_user: dict = Depends(
        require_permission("can_manage_users")
    )
):
    """Assign role to pending user and activate account. Admin only."""
    valid_roles = [
        'admin', 'data_encoder',
        'program_manager', 'mancom', 'execom'
    ]
    if role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {valid_roles}"
        )

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute(
        """UPDATE users
           SET role = %s,
               program_code = %s,
               status = 'active',
               is_active = TRUE
           WHERE id = %s
           RETURNING username, full_name""",
        (role, program_code, user_id)
    )
    result = cur.fetchone()
    if not result:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found.")

    conn.commit()
    cur.close()
    conn.close()

    return {
        "success": True,
        "message": "Role assigned successfully.",
        "username": result[0],
        "full_name": result[1],
        "role": role,
        "program_code": program_code
    }


# =====================================================
# ENDPOINT — Deactivate User (Admin only)
# =====================================================
@app.post("/api/admin/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: dict = Depends(
        require_permission("can_manage_users")
    )
):
    """Deactivate a user account. Admin only."""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute(
        """UPDATE users
           SET is_active = FALSE,
               status = 'inactive'
           WHERE id = %s
           AND username != 'admin'
           RETURNING username""",
        (user_id,)
    )
    result = cur.fetchone()
    if not result:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="User not found or cannot deactivate admin."
        )

    conn.commit()
    cur.close()
    conn.close()

    return {
        "success": True,
        "message": f"User {result[0]} deactivated successfully."
    }