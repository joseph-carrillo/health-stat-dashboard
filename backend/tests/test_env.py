"""Unit tests for fail-fast secret loading (app/core/env.py).

Locks in the deploy-blocker behavior: a missing or blank secret must raise
immediately with an actionable message, never fall back to a default the
repo's git history makes public.
"""
import pytest

from app.core.env import require_env


class TestRequireEnv:
    def test_returns_value_when_set(self, monkeypatch):
        monkeypatch.setenv("SOME_SECRET", "s3cret-value")
        assert require_env("SOME_SECRET") == "s3cret-value"

    def test_strips_whitespace(self, monkeypatch):
        monkeypatch.setenv("SOME_SECRET", "  padded  ")
        assert require_env("SOME_SECRET") == "padded"

    def test_missing_raises_with_var_name(self, monkeypatch):
        monkeypatch.delenv("SOME_SECRET", raising=False)
        with pytest.raises(RuntimeError, match="SOME_SECRET"):
            require_env("SOME_SECRET")

    def test_blank_is_treated_as_missing(self, monkeypatch):
        monkeypatch.setenv("SOME_SECRET", "   ")
        with pytest.raises(RuntimeError, match="SOME_SECRET"):
            require_env("SOME_SECRET")

    def test_message_mentions_env_example(self, monkeypatch):
        monkeypatch.delenv("SOME_SECRET", raising=False)
        with pytest.raises(RuntimeError, match=r"\.env\.example"):
            require_env("SOME_SECRET")

    def test_hint_is_appended(self, monkeypatch):
        monkeypatch.delenv("SOME_SECRET", raising=False)
        with pytest.raises(RuntimeError, match="extra guidance here"):
            require_env("SOME_SECRET", hint="extra guidance here")
