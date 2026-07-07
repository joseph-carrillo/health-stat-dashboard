"""Tests for POST /api/esr-reports.

CI runs pytest with no live Postgres and no Google credentials (see
.github/workflows/ci.yml) — get_db_connection and google_sheets.append_esr_row
are mocked with monkeypatch, and FastAPI's dependency_overrides swaps in a
fake current_user so tests don't need a real JWT.
"""
import pytest
from fastapi.testclient import TestClient

import main
from main import app, get_current_user


VALID_PAYLOAD = {
    "detection": {
        "date_detected": "2026-07-07",
        "source_of_information": {"lgu": True},
    },
    "filter_verification": {
        "date_of_verification": "2026-07-07",
        "type_of_health_event": {"suspect": True},
        "description": {
            "title_of_health_event": "Test event",
            "location": {
                "region": "NIR",
                "province": "Negros Occidental",
                "municipality": "Bacolod",
                "barangay": "Barangay 1",
            },
        },
    },
}


class FakeCursor:
    def __init__(self, fetchone_result=None):
        self._fetchone_result = fetchone_result

    def execute(self, query, params=None):
        pass

    def fetchone(self):
        return self._fetchone_result

    def close(self):
        pass


class FakeConnection:
    def __init__(self, fetchone_result=(1,)):
        self._cursor = FakeCursor(fetchone_result)

    def cursor(self):
        return self._cursor

    def commit(self):
        pass

    def close(self):
        pass


def _fake_user(permissions):
    def _get():
        return {
            "username": "tester",
            "role": "data_encoder",
            "program_code": None,
            "user_id": 42,
            "permissions": permissions,
        }
    return _get


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def _clear_overrides():
    yield
    app.dependency_overrides.clear()


class TestSubmitEsrReport:
    def test_requires_can_submit_esr_permission(self, client):
        app.dependency_overrides[get_current_user] = _fake_user(
            {"can_submit_esr": False}
        )
        resp = client.post("/api/esr-reports", json=VALID_PAYLOAD)
        assert resp.status_code == 403

    def test_successful_submit_inserts_row_and_audits(self, client, monkeypatch):
        app.dependency_overrides[get_current_user] = _fake_user(
            {"can_submit_esr": True}
        )
        monkeypatch.setattr(
            main, "get_db_connection", lambda: FakeConnection((7,))
        )
        audit_calls = []
        monkeypatch.setattr(
            main, "write_audit", lambda **kw: audit_calls.append(kw)
        )
        monkeypatch.setattr(
            main.google_sheets, "append_esr_row", lambda payload: None
        )

        resp = client.post("/api/esr-reports", json=VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body == {"id": 7, "sheet_synced": True}
        assert any(c["action"] == "esr_submit" for c in audit_calls)
        assert not any(c["action"] == "esr_sheet_sync_failed" for c in audit_calls)

    def test_sheets_failure_does_not_fail_the_request(self, client, monkeypatch):
        app.dependency_overrides[get_current_user] = _fake_user(
            {"can_submit_esr": True}
        )
        monkeypatch.setattr(
            main, "get_db_connection", lambda: FakeConnection((9,))
        )
        audit_calls = []
        monkeypatch.setattr(
            main, "write_audit", lambda **kw: audit_calls.append(kw)
        )

        def _raise(payload):
            raise RuntimeError("sheets api down")

        monkeypatch.setattr(main.google_sheets, "append_esr_row", _raise)

        resp = client.post("/api/esr-reports", json=VALID_PAYLOAD)

        assert resp.status_code == 200
        body = resp.json()
        assert body == {"id": 9, "sheet_synced": False}
        assert any(c["action"] == "esr_sheet_sync_failed" for c in audit_calls)

    def test_missing_required_field_is_rejected(self, client):
        app.dependency_overrides[get_current_user] = _fake_user(
            {"can_submit_esr": True}
        )
        bad_payload = {"detection": {}, "filter_verification": {}}
        resp = client.post("/api/esr-reports", json=bad_payload)
        assert resp.status_code == 422
