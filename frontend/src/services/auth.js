// auth.js
// Small helpers for reading the logged-in user and permissions on the client.
// Identity comes from the JWT payload; permissions come from the stored
// user object returned by /api/login.

export function getToken() {
  return localStorage.getItem("token");
}

export function decodeToken() {
  const token = getToken();
  if (!token) return {};
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
}

// Merged view: identity from token, role/program/permissions from stored user.
export function getUser() {
  const payload = decodeToken();
  const stored = getStoredUser();
  return {
    username: payload.sub || stored.username,
    user_id: payload.user_id,
    role: payload.role || stored.role,
    program_code: payload.program_code ?? stored.program_code,
    full_name: stored.full_name,
    permissions: stored.permissions || {},
  };
}

export function can(permission) {
  const { permissions } = getUser();
  return Boolean(permissions && permissions[permission]);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("user");
}
