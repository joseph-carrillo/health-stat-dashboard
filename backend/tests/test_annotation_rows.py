"""Footer/annotation rows (e.g. 'Source: DOH-FHSIS', 'Legend:') must be
skipped, not reported as location errors.

The Infectious Disease antenatal-screening templates are the first whose
sheets carry footer text in the PSGC column (CHILD_CARE files end with blank
rows instead). A row whose location cannot be resolved AND whose mapped data
cells are all blank is an annotation, not data — `is_annotation_row` is the
pure classification helper the parser row loop uses for that call.
"""

import pandas as pd

from app.services.parser import is_annotation_row

# Mirrors infec_hiv.json's shape: meta cols 0-2, raw data cols 3-6,
# computed cols excluded from the blank check.
COL_DEFS = [
    {"index": 3, "indicator_code": "HIV_POP_U1", "is_computed": False},
    {"index": 4, "indicator_code": "HIV_SCREEN_10_14", "is_computed": False},
    {"index": 5, "indicator_code": "HIV_SCREEN_15_19", "is_computed": False},
    {"index": 6, "indicator_code": "HIV_SCREEN_20_49", "is_computed": False},
    {
        "index": 7,
        "indicator_code": "HIV_SCREEN_TOTAL",
        "is_computed": True,
        "formula": "HIV_SCREEN_10_14 + HIV_SCREEN_15_19 + HIV_SCREEN_20_49",
    },
]


def test_footer_text_with_no_data_is_annotation():
    row = pd.Series(
        ["Source: DOH-Field Health Services Information System (FHSIS)",
         None, None, None, None, None, None, None]
    )
    assert is_annotation_row(row, COL_DEFS) is True


def test_legend_row_is_annotation():
    row = pd.Series(["Legend:", None, None, None, None, None, None, None])
    assert is_annotation_row(row, COL_DEFS) is True


def test_unresolvable_location_with_data_is_not_annotation():
    # A typo'd PSGC on a real data row must still surface as an error.
    row = pd.Series(
        ["9999999999", "NIRA", "Mystery Town", "52678", "6", "498", "3665",
         None]
    )
    assert is_annotation_row(row, COL_DEFS) is False


def test_single_populated_data_cell_is_not_annotation():
    row = pd.Series(["Legend:", None, None, None, "1", None, None, None])
    assert is_annotation_row(row, COL_DEFS) is False


def test_computed_columns_are_ignored():
    # Value present only in a computed column's position (col 7) — computed
    # cells are re-derived by the parser, so this is still an annotation row.
    row = pd.Series(["Note:", None, None, None, None, None, None, "4169"])
    assert is_annotation_row(row, COL_DEFS) is True
