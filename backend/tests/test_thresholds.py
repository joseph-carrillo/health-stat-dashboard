"""Unit tests for the coverage status band classifier.

Pure function, no DB needed. Locks in the ratio-scale convention (0.771 ==
77.1%) so the Home-scorecard bug — thresholds compared on the wrong scale,
so real coverage never crossed 80/95 and always showed "below" — can't
silently come back.
"""
from app.core.thresholds import NEAR_TARGET_RATIO, ON_TARGET_RATIO
from app.services.analytics import status_for


class TestStatusFor:
    def test_none_is_no_data(self):
        assert status_for(None) == "no_data"

    def test_realistic_value_is_near_not_below(self):
        # This is the shape of bug the old percent-scale thresholds had:
        # a real ratio like 0.85 (85%) should land "near", not "below" —
        # comparing it against percent-scale cut-offs (80/95) would always
        # say "below" since ratios never reach 80.
        assert status_for(0.85) == "near"

    def test_below_target(self):
        assert status_for(0.5) == "below"
        assert status_for(0.0) == "below"

    def test_near_target_lower_boundary(self):
        assert status_for(NEAR_TARGET_RATIO) == "near"

    def test_just_under_near_target_is_below(self):
        assert status_for(NEAR_TARGET_RATIO - 0.0001) == "below"

    def test_on_target_boundary(self):
        assert status_for(ON_TARGET_RATIO) == "on"

    def test_just_under_on_target_is_near(self):
        assert status_for(ON_TARGET_RATIO - 0.0001) == "near"

    def test_above_on_target(self):
        assert status_for(1.0) == "on"

    def test_over_reported_value_still_on(self):
        # Values above 100% are a data-quality flag elsewhere (Needs
        # Attention), not a different status band here.
        assert status_for(1.07) == "on"
