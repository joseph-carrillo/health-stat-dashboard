"""Google Sheets push for ESR report submissions (Epidemiology line list).

The credential/sheet env vars are read lazily inside get_sheets_client(),
not at import time — this feature is opt-in per deployment, and other dev
machines / CI shouldn't be forced to have Google credentials just to boot
the app or run pytest.
"""

import gspread
from google.oauth2.service_account import Credentials

from app.core.env import require_env

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def get_sheets_client() -> gspread.Client:
    key_path = require_env(
        "GOOGLE_SERVICE_ACCOUNT_FILE",
        hint="Path to the Google service-account JSON key (see .env.example).",
    )
    credentials = Credentials.from_service_account_file(key_path, scopes=SCOPES)
    return gspread.authorize(credentials)


def _flatten_esr_row(payload: dict) -> list:
    """Map an ESR submission payload to one flat line-list row.

    Column order matches the ESR Verification Form's key identifying
    fields — full form detail stays in our DB (esr_reports.payload); the
    Sheet is a line list for quick triage, not a full form mirror.
    """
    detection = payload.get("detection", {})
    fv = payload.get("filter_verification", {})
    description = fv.get("description", {})
    location = description.get("location", {})
    cases = description.get("cases", {})
    deaths = description.get("deaths", {})

    return [
        description.get("title_of_health_event", ""),
        location.get("region", ""),
        location.get("province", ""),
        location.get("municipality", ""),
        location.get("barangay", ""),
        detection.get("date_detected", ""),
        fv.get("date_of_verification", ""),
        description.get("start_date", ""),
        description.get("latest_onset", ""),
        cases.get("total", ""),
        deaths.get("total", ""),
        fv.get("outbreak_declared", ""),
        payload.get("assessment", {}).get("status", {}).get("status", ""),
    ]


def append_esr_row(payload: dict) -> None:
    sheet_id = require_env(
        "ESR_SHEET_ID",
        hint="The target Google Sheet's ID, from its URL (see .env.example).",
    )
    client = get_sheets_client()
    worksheet = client.open_by_key(sheet_id).sheet1
    worksheet.append_row(_flatten_esr_row(payload), value_input_option="USER_ENTERED")
