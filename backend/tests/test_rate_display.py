"""Unit tests for the D1/D2 rate/ratio display uplift (ADR-023).

Pure functions — no DB needed. These lock in three rules:
  1. Rates are stored ALREADY MULTIPLIED (62.5 == "62.5 per 100,000"), so
     display_unit only labels them — it never rescales.
  2. _RATE codes, like _PCT codes, are never summed across period slices;
     they get recomputed from raw inputs via the config formula.
  3. Coverage status bands (on/near/below) apply to percentages only.
"""

from app.services.analytics import (
    _combine_slice_values,
    display_unit,
    status_for,
)


class TestDisplayUnit:
    def test_percentage(self):
        assert display_unit("percentage", 100) == "%"

    def test_rate_per_1000(self):
        assert display_unit("rate", 1000) == "per 1,000"

    def test_rate_per_100000(self):
        assert display_unit("rate", 100000) == "per 100,000"

    def test_rate_defaults_to_100000_when_multiplier_missing(self):
        assert display_unit("rate", None) == "per 100,000"

    def test_ratio_and_counts_have_no_suffix(self):
        assert display_unit("ratio", 100) == ""
        assert display_unit("count", 100) == ""
        assert display_unit("sum", 100) == ""


class TestRateSliceAggregation:
    def test_rate_codes_are_not_summed_across_slices(self):
        # Annual view of a quarterly rate must be recomputed from raw
        # counts, never SUM(Q1..Q4) of the rate values themselves.
        assert _combine_slice_values("MORTA_MMR_RATE", [98.2, 45.1], None) is None

    def test_pct_codes_still_not_summed(self):
        assert _combine_slice_values("CPAB_PCT", [0.5, 0.6], None) is None

    def test_plain_counts_still_sum(self):
        assert _combine_slice_values("MORTA_INF_DEATHS", [18, 27], None) == 45


class TestStatusBandsAreRatioScale:
    def test_percentage_ratio_gets_status(self):
        assert status_for(0.96) == "on"
        assert status_for(0.85) == "near"
        assert status_for(0.5) == "below"

    def test_none_is_no_data(self):
        assert status_for(None) == "no_data"
