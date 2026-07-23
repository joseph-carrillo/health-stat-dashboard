"""Tests for compute_value's whitelisted AST formula evaluator.

Replaced eval() (an injection risk one careless config edit away) with an
AST walk that allows arithmetic only. These tests lock in both the safety
properties and the FHSIS behaviors the old implementation had.
"""
from app.services.parser import compute_value


class TestArithmetic:
    def test_addition(self):
        assert compute_value(
            "CPAB_MALE + CPAB_FEMALE", {"CPAB_MALE": 3.0, "CPAB_FEMALE": 4.0}
        ) == 7.0

    def test_division_percentage(self):
        assert compute_value(
            "CPAB_TOTAL / IMMUN_POP", {"CPAB_TOTAL": 25.0, "IMMUN_POP": 100.0}
        ) == 0.25

    def test_rate_multiplier_constant(self):
        assert compute_value(
            "DEATHS / LIVEBIRTHS * 100000",
            {"DEATHS": 2.0, "LIVEBIRTHS": 4070.0},
        ) == 2.0 / 4070.0 * 100000

    def test_parentheses_and_subtraction(self):
        assert compute_value(
            "(A_TOTAL - A_EXCLUDED) / A_POP",
            {"A_TOTAL": 10.0, "A_EXCLUDED": 2.0, "A_POP": 4.0},
        ) == 2.0

    def test_unary_minus(self):
        assert compute_value("-A_NET + B_NET", {"A_NET": 3.0, "B_NET": 10.0}) == 7.0


class TestFhsisSemantics:
    def test_zero_over_zero_is_zero(self):
        # FHSIS convention: 0/0 displays as 0%, not blank.
        assert compute_value("NUM / DEN", {"NUM": 0.0, "DEN": 0.0}) == 0.0

    def test_nonzero_over_zero_is_none(self):
        assert compute_value("NUM / DEN", {"NUM": 5.0, "DEN": 0.0}) is None

    def test_referenced_code_none_returns_none(self):
        assert compute_value("A_X + B_Y", {"A_X": None, "B_Y": 2.0}) is None

    def test_referenced_code_missing_returns_none(self):
        assert compute_value("A_X + B_Y", {"B_Y": 2.0}) is None

    def test_unrelated_none_does_not_bail(self):
        # A blank cell for an indicator NOT in the formula must not matter.
        assert compute_value(
            "A_X + B_Y", {"A_X": 1.0, "B_Y": 2.0, "UNRELATED": None}
        ) == 3.0

    def test_shorter_code_is_not_a_substring_hazard(self):
        # CPAB_MALE (None) is a substring of CPAB_MALE_TOTAL; the formula
        # references only the longer code and must still compute.
        assert compute_value(
            "CPAB_MALE_TOTAL * 2",
            {"CPAB_MALE_TOTAL": 5.0, "CPAB_MALE": None},
        ) == 10.0


class TestSafety:
    def test_function_calls_rejected(self):
        assert compute_value("__import__('os').getcwd()", {}) is None

    def test_attribute_access_rejected(self):
        assert compute_value("A_X.__class__", {"A_X": 1.0}) is None

    def test_subscript_rejected(self):
        assert compute_value("A_X[0]", {"A_X": 1.0}) is None

    def test_power_operator_rejected(self):
        # ** is not in the whitelist (no config uses it; 10**10**10 hangs).
        assert compute_value("A_X ** 2", {"A_X": 3.0}) is None

    def test_string_constant_rejected(self):
        assert compute_value("'abc' + 'def'", {}) is None

    def test_garbage_formula_returns_none(self):
        assert compute_value("not a formula @@", {}) is None
