# Security

## Roles (RBAC)

| Role | Upload | Approve | View all | View sensitive | Manage users |
|---|---|---|---|---|---|
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `data_encoder` | ✅ | — | — | — | — |
| `program_manager` | scoped to `program_code` | — | scoped | — | — |
| `mancom` | — | — | ✅ | — | — |
| `execom` | — | — | ✅ | — | — |

Authoritative definition: `ROLES` in `backend/app/core/auth.py`. The server enforces access
via the `require_permission` dependency. Frontend role checks (decoding the JWT client-side)
are **UI convenience only** — never the security boundary.

## Authentication

- JWT, HS256, 8-hour expiry. Secret from `JWT_SECRET_KEY` env (`auth.py`).
- Passwords hashed with bcrypt (passlib). bcrypt pinned `>=4.0,<4.1` — passlib 1.7.4 breaks on
  newer bcrypt.
- Token stored in `localStorage`; `services/api.js` logs out on any 401.

## Audit logging

Every data-changing action writes to `audit_log` (`actor`, `action`, `entity`, `details`
JSONB, timestamp) via `backend/app/core/audit.py`. Required for **Philippines Data Privacy
Act** compliance.

## Sensitive indicators

Indicators flagged `is_sensitive = true` (e.g. **HIV reactive cases**, **Syphilis reactive
cases**) require elevated RBAC. Unauthorized roles see aggregated totals only — never
line-level sensitive data. No PHI/PII is stored in plain text.

## Non-negotiable rules

- Free / open-source tools only.
- RBAC enforced on all features.
- No PHI/PII in plain text.
- Audit logging on all data changes.
- Data Privacy Act compliance.

## Secrets

- All secrets are env-driven via `.env` (gitignored); `.env.example` is the committed template.
- Health data files (`*.xlsx`, `*.xls`, `*.csv`) are gitignored — never pushed.

## Known gaps (tracked, not yet closed)

| Gap | Risk | Plan |
|---|---|---|
| `db.py`/`auth.py` keep insecure dev fallbacks for secrets | A misconfigured prod could boot with a known secret | Fail-fast on missing env in prod |
| CORS defaults to `*` (configurable via `CORS_ORIGINS`) | Broad origin access if left default in prod | Set real origin in prod `.env` |
| JWT in `localStorage` | XSS token theft | Consider httpOnly cookie before external exposure |
| bcrypt (not argon2) | Weaker than Sentinel's argon2 | Migrate with hash-on-login |
| No automated tests / CI | Regressions ship silently | Add pytest + GitHub Actions |

## Reporting

This is an internal DOH tool. Report security concerns directly to the maintainer (Joseph);
do not file them in any public tracker.
