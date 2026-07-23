"""Tests for POST /api/register.

Registration must take credentials in the JSON body (never query
parameters, which land in access logs) and reject malformed input.
DB access is mocked the same way test_esr_reports.py does — CI has no
live Postgres.
"""
import pytest
from fastapi.testclient import TestClient

import main
from main import app


VALID_BODY = {
    "username": "newuser",
    "password": "Str0ng!Pass",
    "full_name": "New User",
    "email": "new.user@example.com",
}


class FakeCursor:
    """Returns queued fetchone results in order: duplicate-check, then INSERT."""

    def __init__(self, fetchone_results):
        self._results = list(fetchone_results)

    def execute(self, query, params=None):
        pass

    def fetchone(self):
        return self._results.pop(0) if self._results else None

    def close(self):
        pass


class FakeConnection:
    def __init__(self, fetchone_results):
        self._cursor = FakeCursor(fetchone_results)
        self.closed = False

    def cursor(self):
        return self._cursor

    def commit(self):
        pass

    def close(self):
        self.closed = True


@pytest.fixture
def client():
    return TestClient(app)


class TestRegister:
    def test_credentials_in_body_success(self, client, monkeypatch):
        conn = FakeConnection([None, (7,)])
        monkeypatch.setattr(main, "get_db_connection", lambda: conn)
        monkeypatch.setattr(main, "hash_password", lambda p: "hashed")
        audit_calls = []
        monkeypatch.setattr(
            main, "write_audit", lambda **kw: audit_calls.append(kw)
        )

        resp = client.post("/api/register", json=VALID_BODY)

        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["user_id"] == 7
        assert conn.closed
        assert any(c["action"] == "register" for c in audit_calls)

    def test_duplicate_username_or_email_rejected(self, client, monkeypatch):
        conn = FakeConnection([(1,)])
        monkeypatch.setattr(main, "get_db_connection", lambda: conn)

        resp = client.post("/api/register", json=VALID_BODY)

        assert resp.status_code == 400
        assert conn.closed

    def test_short_password_rejected(self, client):
        resp = client.post(
            "/api/register", json={**VALID_BODY, "password": "short"}
        )
        assert resp.status_code == 422

    def test_query_string_credentials_rejected(self, client):
        # The old calling convention — credentials as query parameters —
        # must no longer be accepted (a body is now required).
        resp = client.post(
            "/api/register"
            "?username=x&password=Str0ng!Pass&full_name=X&email=x@y.z"
        )
        assert resp.status_code == 422
