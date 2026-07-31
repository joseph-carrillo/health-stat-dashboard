"""Row-filtering for workbooks that stack periods/categories as row-blocks
within a single tab (Family Planning's quarters, Oral Health's age bands)
instead of one tab per period. See parser.py's resolve_period_row_filter /
apply_row_filter — both opt-in via new config keys, no-ops when absent.
"""

import pandas as pd

from app.services.parser import apply_row_filter, resolve_period_row_filter

PERIOD_LABELS = {"1": "Q1", "2": "Q2", "3": "Q3", "4": "Q4"}


def test_resolve_period_row_filter_quarterly():
    config = {"period_filter_column": 4, "period_labels": PERIOD_LABELS}
    result = resolve_period_row_filter(config, "quarterly", 2)
    assert result == {"column": 4, "equals": "Q2"}


def test_resolve_period_row_filter_none_when_column_not_configured():
    assert resolve_period_row_filter({}, "quarterly", 1) is None


def test_resolve_period_row_filter_none_for_annual():
    # Annual sheets in these workbooks are separate rolled-up tabs with no
    # period column at all — auto-filtering must not apply.
    config = {"period_filter_column": 4, "period_labels": PERIOD_LABELS}
    assert resolve_period_row_filter(config, "annual", None) is None


def test_resolve_period_row_filter_none_when_value_unmapped():
    config = {"period_filter_column": 4, "period_labels": {"1": "Q1"}}
    assert resolve_period_row_filter(config, "quarterly", 3) is None


def test_apply_row_filter_empty_returns_df_unchanged():
    df = pd.DataFrame({0: ["a", "b"], 1: ["x", "y"]})
    result = apply_row_filter(df, [])
    assert result is df


def test_apply_row_filter_single_condition():
    # Columns 0-4: PSGC, filler, filler, filler, Quarter — positional, like
    # the real sheet reads apply_row_filter runs against.
    df = pd.DataFrame(
        [
            ["1830200000", "", "", "", "Q1"],
            ["1830200000", "", "", "", "Q2"],
            ["1804500000", "", "", "", "Q1"],
            ["1804500000", "", "", "", "Q2"],
        ]
    )
    result = apply_row_filter(df, [{"column": 4, "equals": "Q2"}])
    assert list(result[0]) == ["1830200000", "1804500000"]
    # Index is reset so downstream .iloc[row_idx] loops start at 0.
    assert list(result.index) == [0, 1]


def test_apply_row_filter_multiple_conditions_and_together():
    # Oral Health's Quarterly_1: same tab, both Quarter and Age Group are
    # row values — an age-band extra_sheets entry needs both to match.
    df = pd.DataFrame(
        [
            ["", "", "", "1-4 years old", "Q1", "100"],
            ["", "", "", "1-4 years old", "Q2", "200"],
            ["", "", "", "5-9 years old", "Q1", "300"],
            ["", "", "", "5-9 years old", "Q2", "400"],
        ]
    )
    result = apply_row_filter(
        df,
        [{"column": 3, "equals": "5-9 years old"}, {"column": 4, "equals": "Q1"}],
    )
    assert list(result[5]) == ["300"]


def test_apply_row_filter_strips_whitespace():
    df = pd.DataFrame([["", "", "", "", " Q1 "], ["", "", "", "", "Q2"]])
    result = apply_row_filter(df, [{"column": 4, "equals": "Q1"}])
    assert len(result) == 1
