"""Unit tests for the percentage/ratio handling at the heart of the File 1 bug.

Pure functions — no DB needed. These lock in the rule that percentages live as
ratios (0.0185 == 1.85%) so the ×100 birth-dose bug can't silently return.
"""
import pytest

from app.services.parser import _pct_as_ratio, _staging_values_match


class TestPctAsRatio:
    def test_percentage_number_is_divided_to_ratio(self):
        # 7.71 (a "771%" style stored number) normalizes to a 0.0771 ratio.
        assert _pct_as_ratio(7.7107) == pytest.approx(0.077107)

    def test_value_already_a_ratio_is_unchanged(self):
        assert _pct_as_ratio(0.0771) == pytest.approx(0.0771)

    def test_threshold_boundary(self):
        # Exactly 1.5 is treated as already-a-ratio (boundary is > 1.5).
        assert _pct_as_ratio(1.5) == pytest.approx(1.5)
        assert _pct_as_ratio(150.0) == pytest.approx(1.5)

    def test_zero(self):
        assert _pct_as_ratio(0.0) == 0.0


class TestStagingValuesMatch:
    def test_pct_ratio_vs_percentage_number_are_equal(self):
        # The correct ratio and the bad ×100 number should compare equal for a
        # _PCT indicator (so re-upload doesn't flag a spurious conflict).
        assert _staging_values_match(0.0771, 7.71, "CPAB_PCT") is True

    def test_non_pct_values_compared_directly(self):
        assert _staging_values_match(100, 95, "CPAB_TOTAL") is False
        assert _staging_values_match(100, 100, "CPAB_TOTAL") is True

    def test_both_none_match(self):
        assert _staging_values_match(None, None) is True

    def test_one_none_does_not_match(self):
        assert _staging_values_match(0.5, None, "CPAB_PCT") is False

    def test_rounding_tolerance(self):
        # DECIMAL(15,4) precision — differences below 4 decimals are equal.
        assert _staging_values_match(0.07710, 0.07711, "CPAB_PCT") is True
