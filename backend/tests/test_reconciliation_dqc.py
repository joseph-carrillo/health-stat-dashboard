"""Unit tests for the `reconciliation` DQC rule type (D4).

Pure function, no DB needed. Locks in "sum of parts == whole" (equals) and
"sum of parts <= whole" (at_most) checks — used by Rabies (dog+cat+other ==
all-category exposure; ARV+RIG + ARV-only <= Category III total) and available
to any config that needs a sum-of-parts reconciliation the older over_threshold
/ sequence rule types can't express. None-handling matches the other rules:
a missing part or whole skips the check rather than firing a false positive.
"""
from app.services.parser import run_dqc_rules


def _rows(**values):
    return [{"indicator_code": k, "value": v} for k, v in values.items()]


class TestReconciliationEquals:
    rule = {
        "rule_type": "reconciliation",
        "parts": ["DOG", "CAT", "OTHER"],
        "whole": "ALL",
        "message": "parts do not sum to whole",
    }

    def test_exact_sum_passes(self):
        rows = _rows(DOG=10, CAT=5, OTHER=3, ALL=18)
        assert run_dqc_rules(rows, [self.rule]) == []

    def test_mismatch_flags(self):
        rows = _rows(DOG=10, CAT=5, OTHER=3, ALL=20)
        issues = run_dqc_rules(rows, [self.rule])
        assert len(issues) == 1
        assert issues[0]["indicator_code"] == "ALL"
        assert issues[0]["rule"] == "reconciliation"

    def test_float_noise_within_precision_passes(self):
        # DECIMAL(15,4): differences below 0.0001 are Excel round-trip noise.
        rows = _rows(DOG=10.00001, CAT=5, OTHER=3, ALL=18.0)
        assert run_dqc_rules(rows, [self.rule]) == []

    def test_missing_part_skips(self):
        rows = _rows(DOG=10, CAT=None, OTHER=3, ALL=18)
        assert run_dqc_rules(rows, [self.rule]) == []

    def test_missing_whole_skips(self):
        rows = _rows(DOG=10, CAT=5, OTHER=3, ALL=None)
        assert run_dqc_rules(rows, [self.rule]) == []


class TestReconciliationAtMost:
    rule = {
        "rule_type": "reconciliation",
        "parts": ["ARV_RIG", "ARV_ONLY"],
        "whole": "CAT3_TOTAL",
        "mode": "at_most",
        "message": "completed exceeds total exposed",
    }

    def test_under_whole_passes(self):
        rows = _rows(ARV_RIG=4, ARV_ONLY=3, CAT3_TOTAL=10)
        assert run_dqc_rules(rows, [self.rule]) == []

    def test_equal_to_whole_passes(self):
        rows = _rows(ARV_RIG=4, ARV_ONLY=6, CAT3_TOTAL=10)
        assert run_dqc_rules(rows, [self.rule]) == []

    def test_over_whole_flags(self):
        rows = _rows(ARV_RIG=8, ARV_ONLY=5, CAT3_TOTAL=10)
        issues = run_dqc_rules(rows, [self.rule])
        assert len(issues) == 1
        assert issues[0]["indicator_code"] == "CAT3_TOTAL"
