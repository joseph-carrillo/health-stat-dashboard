# main.py
# Entry point for the Health Statistics Dashboard API
# DOH-NIR CHD Philippines

import os
import shutil
import sys
from pathlib import Path
from datetime import timedelta

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Make the app package importable when run via `uvicorn backend.main:app`
sys.path.append(str(Path(__file__).parent))

from app.core.db import get_db_connection
from app.core.auth import (
    authenticate_user,
    create_access_token,
    decode_token,
    get_role_permissions,
    update_last_login,
    hash_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.core.audit import ensure_audit_table, write_audit, get_audit_log
from app.services.parser import parse_file, load_config, validate_config
from app.services.commit import (
    get_batch_summary,
    get_conflicts,
    resolve_conflict,
    approve_batch,
)
from app.services import analytics

# =====================================================
# APP SETUP
# =====================================================
app = FastAPI(
    title="DOH-NIR Health Statistics Dashboard",
    description="API for the NIR CHD Health Statistics Dashboard",
    version="0.1.0",
)

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


@app.on_event("startup")
def on_startup():
    """Ensure auxiliary tables exist (audit log)."""
    try:
        ensure_audit_table()
    except Exception as e:
        print(f"WARNING: could not ensure audit table: {e}")


# =====================================================
# AUTH HELPERS
# =====================================================
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Extract and verify the current user from the JWT token."""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    role = payload.get("role")
    return {
        "username": payload.get("sub"),
        "role": role,
        "program_code": payload.get("program_code"),
        "user_id": payload.get("user_id"),
        "permissions": get_role_permissions(role),
    }


def require_permission(permission: str):
    """Dependency factory that enforces a specific permission."""
    def check_permission(current_user: dict = Depends(get_current_user)):
        if not current_user.get("permissions", {}).get(permission):
            raise HTTPException(
                status_code=403,
                detail=f"You do not have permission to do this. "
                       f"Required: {permission}",
            )
        return current_user
    return check_permission


def resolve_program_scope(current_user: dict, requested: str = None) -> str:
    """Return the program code a user is allowed to see.

    Admin / mancom / execom (can_view_all) may request any program or all.
    Everyone else is locked to their own assigned program.
    """
    perms = current_user.get("permissions", {})
    if perms.get("can_view_all"):
        return requested
    own = current_user.get("program_code")
    if requested and requested != own:
        raise HTTPException(
            status_code=403,
            detail="You can only view your assigned program.",
        )
    return own


# =====================================================
# HEALTH CHECK
# =====================================================
@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "DOH-NIR Dashboard API is running",
        "version": "0.1.0",
    }


# =====================================================
# AUTH
# =====================================================
@app.post("/api/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with username and password. Returns a JWT valid for 8 hours."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401, detail="Incorrect username or password"
        )

    access_token = create_access_token(
        data={
            "sub": user["username"],
            "role": user["role"],
            "program_code": user["program_code"],
            "user_id": user["id"],
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    update_last_login(user["id"])
    write_audit(
        action="login",
        actor={"user_id": user["id"], "username": user["username"]},
        entity_type="user",
        entity_id=user["id"],
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "full_name": user.get("full_name"),
            "role": user["role"],
            "program_code": user["program_code"],
            "permissions": get_role_permissions(user["role"]),
        },
    }


@app.get("/api/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


# =====================================================
# UPLOAD AND PARSE
# =====================================================
@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    template_id: str = "cpab_bcg_hepa",
    year: int = 2026,
    month: int = 1,
    dry_run: bool = False,
    current_user: dict = Depends(require_permission("can_upload")),
):
    """Upload an FHSIS Excel file for parsing.

    When dry_run is true the file is parsed and validated but nothing is
    written to the database — useful for testing a new template config.
    """
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="Only Excel files (.xlsx, .xls) are accepted.",
        )

    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = parse_file(
            file_path=str(file_path),
            template_id=template_id,
            year=year,
            month=month,
            uploaded_by=current_user.get("user_id"),
            dry_run=dry_run,
        )
    finally:
        if file_path.exists():
            os.remove(file_path)

    if not result.get("success"):
        raise HTTPException(
            status_code=422, detail=result.get("error", "Parser failed")
        )

    if not dry_run:
        write_audit(
            action="upload",
            actor=current_user,
            entity_type="batch",
            entity_id=result.get("batch_id"),
            details={
                "template_id": template_id,
                "period": result.get("period"),
                "rows_staged": result.get("rows_staged"),
                "dqc_issues": result.get("dqc_issues"),
                "source_file": file.filename,
            },
        )

    return result


@app.post("/api/validate-config")
def validate_template_config(
    template_id: str,
    current_user: dict = Depends(require_permission("can_upload")),
):
    """Structurally validate a template config without parsing a file."""
    try:
        config = load_config(template_id)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, detail=f"Config '{template_id}' not found"
        )
    problems = validate_config(config)
    return {
        "template_id": template_id,
        "valid": len(problems) == 0,
        "problems": problems,
    }


# =====================================================
# STAGING / REVIEW / APPROVAL
# =====================================================
@app.get("/api/staging/{batch_id}")
def get_staging_summary(
    batch_id: str, current_user: dict = Depends(get_current_user)
):
    """Summary of staged data for a batch — review before approving."""
    summary = get_batch_summary(batch_id)
    if "error" in summary:
        raise HTTPException(status_code=404, detail=summary["error"])
    return summary


@app.get("/api/staging/{batch_id}/conflicts")
def get_batch_conflicts(
    batch_id: str, current_user: dict = Depends(get_current_user)
):
    """All conflicting rows in a batch (existing vs incoming)."""
    conflicts = get_conflicts(batch_id)
    return {
        "batch_id": batch_id,
        "total_conflicts": len(conflicts),
        "conflicts": conflicts,
    }


@app.post("/api/staging/conflict/{staging_id}/resolve")
def resolve_staging_conflict(
    staging_id: int,
    decision: str,
    current_user: dict = Depends(require_permission("can_approve")),
):
    """Resolve a single conflict: 'accept' (incoming) or 'reject' (keep)."""
    if decision not in ["accept", "reject"]:
        raise HTTPException(
            status_code=400, detail="Decision must be 'accept' or 'reject'"
        )
    result = resolve_conflict(
        staging_id=staging_id,
        decision=decision,
        resolved_by=current_user.get("user_id"),
    )
    write_audit(
        action="resolve_conflict",
        actor=current_user,
        entity_type="staging_row",
        entity_id=staging_id,
        details={"decision": decision},
    )
    return result


@app.post("/api/staging/{batch_id}/approve")
def approve_staging_batch(
    batch_id: str,
    current_user: dict = Depends(require_permission("can_approve")),
):
    """Approve a batch and commit data to health_data."""
    result = approve_batch(
        batch_id=batch_id, approved_by=current_user.get("user_id")
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    write_audit(
        action="approve_batch",
        actor=current_user,
        entity_type="batch",
        entity_id=batch_id,
        details={
            "inserted": result.get("inserted"),
            "updated": result.get("updated"),
        },
    )
    return result


# =====================================================
# REFERENCE DATA
# =====================================================
@app.get("/api/programs")
def get_programs(current_user: dict = Depends(get_current_user)):
    return {"programs": analytics.list_programs()}


@app.get("/api/indicators")
def get_indicators(
    program_code: str = None,
    current_user: dict = Depends(get_current_user),
):
    scoped = resolve_program_scope(current_user, program_code)
    can_sensitive = current_user.get("permissions", {}).get(
        "can_view_sensitive", False
    )
    return {
        "indicators": analytics.list_indicators(
            program_code=scoped, include_sensitive=can_sensitive
        )
    }


@app.get("/api/locations")
def get_locations(
    level: str = None,
    parent_psgc: str = None,
    current_user: dict = Depends(get_current_user),
):
    return {
        "locations": analytics.list_locations(
            level=level, parent_psgc=parent_psgc
        )
    }


@app.get("/api/periods")
def get_periods(
    year: int = None, current_user: dict = Depends(get_current_user)
):
    return {"periods": analytics.list_periods(year=year)}


# =====================================================
# AGGREGATE / DASHBOARD DATA
# =====================================================
@app.get("/api/scorecard")
def get_scorecard(
    year: int = 2026,
    period_type: str = "monthly",
    period_value: int = None,
    program_code: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Per-program coverage scorecard for a period (powers Home/Overview)."""
    scoped = resolve_program_scope(current_user, program_code)
    return {
        "year": year,
        "period_type": period_type,
        "period_value": period_value,
        "scorecard": analytics.get_scorecard(
            year=year,
            period_type=period_type,
            period_value=period_value,
            program_code=scoped,
        ),
    }


@app.get("/api/coverage")
def get_coverage(
    indicator_code: str,
    year: int = 2026,
    period_type: str = "monthly",
    period_value: int = None,
    current_user: dict = Depends(get_current_user),
):
    """Per-LGU coverage for one indicator over a period."""
    meta = analytics.get_indicator_meta(indicator_code)
    if not meta:
        raise HTTPException(
            status_code=404,
            detail=f"Indicator '{indicator_code}' not found",
        )
    perms = current_user.get("permissions", {})
    if meta["is_sensitive"] and not perms.get("can_view_sensitive"):
        raise HTTPException(
            status_code=403,
            detail="This indicator is restricted. Aggregated totals only.",
        )
    # Program scoping for non-admins.
    resolve_program_scope(current_user, meta["program_code"])

    return analytics.get_coverage(
        indicator_code=indicator_code,
        year=year,
        period_type=period_type,
        period_value=period_value,
    )


@app.get("/api/coverage-detail")
def get_coverage_detail(
    indicator_code: str,
    year: int = 2026,
    period_type: str = "monthly",
    period_value: int = None,
    current_user: dict = Depends(get_current_user),
):
    """Per-LGU numerator / denominator / coverage for an indicator."""
    meta = analytics.get_indicator_meta(indicator_code)
    if not meta:
        raise HTTPException(
            status_code=404, detail=f"Indicator '{indicator_code}' not found"
        )
    perms = current_user.get("permissions", {})
    if meta["is_sensitive"] and not perms.get("can_view_sensitive"):
        raise HTTPException(
            status_code=403,
            detail="This indicator is restricted. Aggregated totals only.",
        )
    resolve_program_scope(current_user, meta["program_code"])
    return analytics.get_coverage_detail(
        indicator_code=indicator_code,
        year=year,
        period_type=period_type,
        period_value=period_value,
    )


@app.get("/api/trend")
def get_trend(
    indicator_code: str,
    year: int = 2026,
    location_psgc: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Monthly trend for an indicator (region-wide or one LGU)."""
    meta = analytics.get_indicator_meta(indicator_code)
    if not meta:
        raise HTTPException(
            status_code=404, detail=f"Indicator '{indicator_code}' not found"
        )
    perms = current_user.get("permissions", {})
    if meta["is_sensitive"] and not perms.get("can_view_sensitive"):
        raise HTTPException(
            status_code=403,
            detail="This indicator is restricted. Aggregated totals only.",
        )
    resolve_program_scope(current_user, meta["program_code"])
    return analytics.get_trend(
        indicator_code=indicator_code, year=year, location_psgc=location_psgc
    )


@app.get("/api/data-availability")
def get_data_availability(
    program_code: str = None,
    year: int = 2026,
    current_user: dict = Depends(get_current_user),
):
    """Which LGUs submitted data per month for a program."""
    scoped = resolve_program_scope(current_user, program_code)
    if not scoped:
        # Admin with no specific program -> default to the seeded program.
        scoped = "CHILD_CARE"
    return analytics.get_data_availability(program_code=scoped, year=year)


@app.get("/api/health-data")
def get_health_data(
    indicator_code: str = None,
    location_psgc: str = None,
    year: int = 2026,
    month: int = None,
    current_user: dict = Depends(get_current_user),
):
    """Committed health data with optional filters (row-level detail)."""
    perms = current_user.get("permissions", {})
    can_sensitive = perms.get("can_view_sensitive", False)

    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT
            l.psgc, l.name AS location,
            i.code AS indicator_code, i.name AS indicator_name,
            rp.year, rp.period_type, rp.period_value, rp.label AS period_label,
            h.value, h.uploaded_at, i.is_sensitive, p.code AS program_code
        FROM health_data h
        JOIN locations l ON l.id = h.location_id
        JOIN indicators i ON i.id = h.indicator_id
        JOIN programs p ON p.id = i.program_id
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

    # Sensitive indicators are hidden from row-level detail for
    # unauthorized roles (aggregated totals are still available elsewhere).
    if not can_sensitive:
        query += " AND i.is_sensitive = FALSE"

    # Program scoping for roles that cannot view all programs.
    if not perms.get("can_view_all"):
        query += " AND p.code = %s"
        params.append(current_user.get("program_code"))

    query += " ORDER BY l.name, i.code LIMIT 500"

    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {
        "total": len(rows),
        "data": [
            {
                "psgc": r[0],
                "location": r[1],
                "indicator_code": r[2],
                "indicator_name": r[3],
                "year": r[4],
                "period_type": r[5],
                "period_value": r[6],
                "period_label": r[7],
                "value": float(r[8]) if r[8] is not None else None,
                "uploaded_at": str(r[9]),
                "is_sensitive": r[10],
                "program_code": r[11],
            }
            for r in rows
        ],
    }


# =====================================================
# TEMPLATE REPORTS ("Excel face" raw view)
# =====================================================
@app.get("/api/templates")
def get_templates(current_user: dict = Depends(get_current_user)):
    """List the Excel templates that can be rendered as raw reports."""
    return {"templates": analytics.list_templates()}


@app.get("/api/templates/{template_id}/report")
def get_template_report(
    template_id: str,
    year: int = 2026,
    month: int = 1,
    current_user: dict = Depends(get_current_user),
):
    """Committed data for one month, laid out exactly like the source Excel."""
    perms = current_user.get("permissions", {})
    can_sensitive = perms.get("can_view_sensitive", False)
    program_scope = (
        None if perms.get("can_view_all") else current_user.get("program_code")
    )
    try:
        return analytics.get_template_report(
            template_id=template_id,
            year=year,
            month=month,
            include_sensitive=can_sensitive,
            program_scope=program_scope,
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, detail=f"Template '{template_id}' not found"
        )


# =====================================================
# TARGETS
# =====================================================
@app.patch("/api/indicators/{indicator_id}/target")
def set_indicator_target(
    indicator_id: int,
    target_value: float,
    target_year: int = 2026,
    current_user: dict = Depends(require_permission("can_manage_users")),
):
    """Set the official target for an indicator (admin only)."""
    result = analytics.update_indicator_target(
        indicator_id=indicator_id,
        target_value=target_value,
        target_year=target_year,
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    write_audit(
        action="set_target",
        actor=current_user,
        entity_type="indicator",
        entity_id=indicator_id,
        details={"target_value": target_value, "target_year": target_year},
    )
    return result


# =====================================================
# USER MANAGEMENT
# =====================================================
@app.post("/api/register")
def register_user(
    username: str, password: str, full_name: str, email: str
):
    """Register a new user. Account starts pending until an admin acts."""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM users WHERE username = %s OR email = %s",
        (username, email),
    )
    if cur.fetchone():
        conn.close()
        raise HTTPException(
            status_code=400, detail="Username or email already exists."
        )

    hashed = hash_password(password)
    cur.execute(
        """INSERT INTO users (
            username, hashed_password, full_name,
            email, role, status, is_active
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id""",
        (username, hashed, full_name, email, None, "pending", False),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    write_audit(
        action="register",
        actor={"user_id": new_id, "username": username},
        entity_type="user",
        entity_id=new_id,
    )

    return {
        "success": True,
        "message": "Account created. Waiting for admin activation.",
        "user_id": new_id,
        "username": username,
    }


@app.get("/api/admin/users")
def get_all_users(
    current_user: dict = Depends(require_permission("can_manage_users"))
):
    """Get all users. Admin only."""
    conn = get_db_connection()
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
                "id": r[0],
                "username": r[1],
                "full_name": r[2],
                "email": r[3],
                "role": r[4],
                "program_code": r[5],
                "status": r[6],
                "is_active": r[7],
                "created_at": str(r[8]),
                "last_login": str(r[9]) if r[9] else None,
            }
            for r in rows
        ],
    }


@app.get("/api/admin/users/pending")
def get_pending_users(
    current_user: dict = Depends(require_permission("can_manage_users"))
):
    """Get pending users waiting for role assignment. Admin only."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, username, full_name, email, status, created_at
           FROM users WHERE status = 'pending'
           ORDER BY created_at DESC"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {
        "total": len(rows),
        "users": [
            {
                "id": r[0],
                "username": r[1],
                "full_name": r[2],
                "email": r[3],
                "status": r[4],
                "created_at": str(r[5]),
            }
            for r in rows
        ],
    }


@app.post("/api/admin/users/{user_id}/assign-role")
def assign_role(
    user_id: int,
    role: str,
    program_code: str = None,
    current_user: dict = Depends(require_permission("can_manage_users")),
):
    """Assign a role to a pending user and activate it. Admin only."""
    valid_roles = [
        "admin", "data_encoder", "program_manager", "mancom", "execom",
    ]
    if role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {valid_roles}",
        )

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """UPDATE users
           SET role = %s, program_code = %s,
               status = 'active', is_active = TRUE
           WHERE id = %s
           RETURNING username, full_name""",
        (role, program_code, user_id),
    )
    result = cur.fetchone()
    if not result:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found.")

    conn.commit()
    cur.close()
    conn.close()

    write_audit(
        action="assign_role",
        actor=current_user,
        entity_type="user",
        entity_id=user_id,
        details={"role": role, "program_code": program_code},
    )

    return {
        "success": True,
        "message": "Role assigned successfully.",
        "username": result[0],
        "full_name": result[1],
        "role": role,
        "program_code": program_code,
    }


@app.post("/api/admin/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: dict = Depends(require_permission("can_manage_users")),
):
    """Deactivate a user account. Admin only."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """UPDATE users
           SET is_active = FALSE, status = 'inactive'
           WHERE id = %s AND username != 'admin'
           RETURNING username""",
        (user_id,),
    )
    result = cur.fetchone()
    if not result:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="User not found or cannot deactivate admin.",
        )

    conn.commit()
    cur.close()
    conn.close()

    write_audit(
        action="deactivate_user",
        actor=current_user,
        entity_type="user",
        entity_id=user_id,
    )

    return {
        "success": True,
        "message": f"User {result[0]} deactivated successfully.",
    }


# =====================================================
# AUDIT LOG
# =====================================================
@app.get("/api/admin/audit")
def get_audit(
    limit: int = 100,
    current_user: dict = Depends(require_permission("can_manage_users")),
):
    """Recent audit-log entries. Admin only."""
    return {"entries": get_audit_log(limit=limit)}
