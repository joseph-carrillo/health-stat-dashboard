# thresholds.py
# Coverage and data-quality alert cut-offs — single source of truth.
#
# Every indicator that isn't a plain count (formula_type percentage/rate/ratio)
# is stored as a decimal ratio, e.g. 0.771 == 77.1%. These constants are on
# that same ratio scale (0.0-1.0), not 0-100 — analytics.py should always
# import them instead of hardcoding a cut-off.

ON_TARGET_RATIO = 0.95     # coverage >= this -> "on"
NEAR_TARGET_RATIO = 0.80   # coverage >= this (but below on-target) -> "near"; else "below"

# Needs Attention panel: a value above this is treated as a likely data-entry
# error (e.g. wrong denominator) rather than genuine over-100% coverage.
OVER_REPORT_RATIO = 1.0
