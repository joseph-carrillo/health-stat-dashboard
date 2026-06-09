"""Inspect an FHSIS workbook for upload debugging.

Usage:
  python backend/scripts/inspect_excel.py "C:\\path\\to\\file.xlsx" nut_mam_sam_annual
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pandas as pd

from app.services.parser import load_config, parse_file, validate_upload_filename


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    file_path = Path(sys.argv[1])
    template_id = sys.argv[2]
    year = int(sys.argv[3]) if len(sys.argv) > 3 else 2026

    if not file_path.exists():
        print(f"File not found: {file_path}")
        sys.exit(1)

    config = load_config(template_id)
    xl = pd.ExcelFile(file_path)
    print(f"File: {file_path.name}")
    print(f"Template: {template_id} ({config.get('frequency')})")
    print(f"Sheets in workbook: {xl.sheet_names}")

    name_err = validate_upload_filename(file_path.name, config)
    if name_err:
        print(f"Filename check: FAIL — {name_err}")
    else:
        print("Filename check: OK")

    expected = [config["sheet_map"].get("annual")] if config.get("frequency") == "annual" else []
    for extra in config.get("extra_sheets") or []:
        expected.append(extra.get("sheet_name"))
    expected = [s for s in expected if s]
    if expected:
        print(f"Expected tabs: {expected}")
        for name in expected:
            print(f"  {name!r}: {'found' if name in xl.sheet_names else 'MISSING'}")

    print(f"\nDry-run upload (year={year})...")
    result = parse_file(
        file_path=str(file_path),
        template_id=template_id,
        year=year,
        month=1,
        dry_run=True,
        source_filename=file_path.name,
    )
    if result.get("success"):
        print(
            f"OK — rows_processed={result.get('rows_processed')}, "
            f"rows_staged={result.get('rows_staged')}, "
            f"errors={len(result.get('errors') or [])}"
        )
    else:
        print(f"FAILED — {result.get('error')}")
        if result.get("errors"):
            for err in result["errors"][:5]:
                print(" ", err)


if __name__ == "__main__":
    main()
