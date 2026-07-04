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

- JWT, HS256, 8-hour expiry. Secret from `JWT_SECRET_KEY` env (`auth.py`) — **no fallback**;
  the app refuses to start without it (`app/core/env.py`), same for `DB_PASSWORD`.
- Passwords hashed with **argon2** (passlib). Legacy bcrypt hashes still verify and are
  transparently re-hashed to argon2 on the user's next successful login. bcrypt stays pinned
  `4.0.x` (verify-only) — passlib 1.7.4 breaks on newer bcrypt.
- `/api/login` is rate-limited (10/minute per client IP) against brute-force.
- Token stored in `localStorage`; `services/api.js` logs out on any 401.

## Audit logging

Every data-changing action writes to `audit_log` (`actor`, `action`, `entity`, `details`
JSONB, timestamp) via `backend/app/core/audit.py`. Required for **Philippines Data Privacy
Act** compliance.

## Sensitive indicators

Indicators flagged `is_sensitive = true` (e.g. **HIV reactive cases**, **Syphilis reactive
cases**) require the `can_view_sensitive` permission (admin only). Unauthorized roles get
**full exclusion**: sensitive indicators are filtered out of every query
(`AND i.is_sensitive = FALSE`) and sensitive endpoints return 403 — they see nothing, not
aggregates. No PHI/PII is stored in plain text (all values are LGU-level aggregated counts).

Planned addition (pending an owner decision on the cut-off): small-cell suppression, so that
very small counts on sensitive indicators can't identify individuals.

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
| JWT in `localStorage` | XSS token theft | Consider httpOnly cookie before external exposure |
| No small-cell suppression on sensitive counts | Very small counts could identify individuals | Add once the cut-off (<5 or <10) is decided |
| Test coverage is thin (env/thresholds/hashing only) | Regressions in untested paths ship silently | Grow suite alongside new features |

Closed in July 2026 (see CHANGELOG): secret fallbacks (now fail-fast), CORS `*` default,
missing login rate limit, bcrypt→argon2, no CI, no security headers, no DB backups.

## Reporting

This is an internal DOH tool. Report security concerns directly to the maintainer (Joseph);
do not file them in any public tracker.
