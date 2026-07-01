# auth.py
# Authentication and RBAC for DOH-NIR Dashboard
# Uses JWT tokens for secure authentication

import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.db import get_db_connection

# =====================================================
# SECURITY SETTINGS
# =====================================================
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "doh-nir-dashboard-secret-key-2026-change-in-production",
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours (one work day)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =====================================================
# ROLES
# =====================================================
ROLES = {
    "admin": {
        "can_upload": True,
        "can_approve": True,
        "can_view_all": True,
        "can_view_sensitive": True,
        "can_manage_users": True,
        "level": "region"
    },
    "data_encoder": {
        "can_upload": True,
        "can_approve": False,
        "can_view_all": False,
        "can_view_sensitive": False,
        "can_manage_users": False,
        "level": "program"
    },
    "program_manager": {
        "can_upload": False,
        "can_approve": False,
        "can_view_all": False,
        "can_view_sensitive": False,
        "can_manage_users": False,
        "level": "program"
    },
    "mancom": {
        "can_upload": False,
        "can_approve": False,
        "can_view_all": True,
        "can_view_sensitive": False,
        "can_manage_users": False,
        "level": "province"
    },
    "execom": {
        "can_upload": False,
        "can_approve": False,
        "can_view_all": True,
        "can_view_sensitive": False,
        "can_manage_users": False,
        "level": "region"
    }
}


# =====================================================
# PASSWORD FUNCTIONS
# =====================================================

def hash_password(password: str) -> str:
    """Hash a plain password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str,
                    hashed_password: str) -> bool:
    """Check if a plain password matches the hash."""
    return pwd_context.verify(plain_password, hashed_password)


# =====================================================
# TOKEN FUNCTIONS
# =====================================================

def create_access_token(data: dict,
                        expires_delta: Optional[timedelta] = None):
    """Create a JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        return None


# =====================================================
# USER FUNCTIONS
# =====================================================

def get_user(username: str) -> dict:
    """Get user from database by username."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, username, hashed_password,
                  role, program_code, is_active
           FROM users
           WHERE username = %s""",
        (username,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return None

    return {
        "id": row[0],
        "username": row[1],
        "hashed_password": row[2],
        "role": row[3],
        "program_code": row[4],
        "is_active": row[5]
    }


def authenticate_user(username: str,
                      password: str) -> dict:
    """Verify username and password. Returns user if valid."""
    user = get_user(username)
    if not user:
        return None
    if not user["is_active"]:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


def get_role_permissions(role: str) -> dict:
    """Get permissions for a role."""
    return ROLES.get(role, {})


def update_last_login(user_id: int) -> None:
    """Stamp the user's last_login with the current time."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE users SET last_login = %s WHERE id = %s",
        (datetime.now(), user_id),
    )
    conn.commit()
    cur.close()
    conn.close()