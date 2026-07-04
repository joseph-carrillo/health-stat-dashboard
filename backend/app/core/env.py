# env.py
# Fail-fast environment variable access for secrets.
#
# Secrets (DB password, JWT signing key) must come from the environment —
# there is deliberately no fallback value. A missing secret crashes the app
# at import time with a clear message instead of silently running with a
# publicly-known default (the repo's git history contains the old defaults,
# so anyone can forge tokens / log into the DB if a fallback is ever used).

import os


def require_env(name: str, hint: str = "") -> str:
    """Return the environment variable's value or raise with a clear message.

    Non-secret settings (hosts, ports, names) may keep os.getenv defaults;
    anything secret must go through this so a misconfigured deployment
    refuses to start rather than starting insecurely.
    """
    value = os.getenv(name, "").strip()
    if not value:
        message = (
            f"Required environment variable {name} is not set. "
            "Copy .env.example to .env and fill in real values "
            "(docker compose loads it automatically)."
        )
        if hint:
            message += f" {hint}"
        raise RuntimeError(message)
    return value
