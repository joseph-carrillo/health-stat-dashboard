-- =====================================================
-- SEED DATA: Indicators — Child Care > Immunization
-- File 1: CPAB, BCG, HepaB (Birth Dose)
-- =====================================================

INSERT INTO indicators (
    program_id, code, name, unit, frequency_type,
    formula_type, rate_multiplier, denominator_source,
    is_computed, is_sensitive, target_value, target_year,
    year_introduced
)
SELECT p.id,
    ind.code, ind.name, ind.unit, ind.frequency_type,
    ind.formula_type, ind.rate_multiplier, ind.denominator_source,
    ind.is_computed, ind.is_sensitive, ind.target_value,
    ind.target_year, ind.year_introduced
FROM programs p
CROSS JOIN (VALUES

  -- Population denominator
  ('IMMUN_POP_0_11M', 'Projected Population 0-11 Months',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),

  -- CPAB
  ('CPAB_MALE', 'CPAB Male',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('CPAB_FEMALE', 'CPAB Female',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('CPAB_TOTAL', 'CPAB Total',
   'count', 'monthly', 'sum', 100, NULL,
   TRUE, FALSE, NULL, NULL, 2026),
  ('CPAB_PCT', 'CPAB Percentage',
   'percentage', 'monthly', 'percentage', 100, 'IMMUN_POP_0_11M',
   TRUE, FALSE, 0.95, 2026, 2026),

  -- BCG within 24 hours
  ('BCG_24H_MALE', 'BCG Within 24h Male',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('BCG_24H_FEMALE', 'BCG Within 24h Female',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('BCG_24H_TOTAL', 'BCG Within 24h Total',
   'count', 'monthly', 'sum', 100, NULL,
   TRUE, FALSE, NULL, NULL, 2026),
  ('BCG_24H_PCT', 'BCG Within 24h Percentage',
   'percentage', 'monthly', 'percentage', 100, 'IMMUN_POP_0_11M',
   TRUE, FALSE, NULL, NULL, 2026),

  -- BCG >24h to 11m29d
  ('BCG_GT24H_MALE', 'BCG >24h to 11m29d Male',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('BCG_GT24H_FEMALE', 'BCG >24h to 11m29d Female',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('BCG_GT24H_TOTAL', 'BCG >24h to 11m29d Total',
   'count', 'monthly', 'sum', 100, NULL,
   TRUE, FALSE, NULL, NULL, 2026),
  ('BCG_GT24H_PCT', 'BCG >24h to 11m29d Percentage',
   'percentage', 'monthly', 'percentage', 100, 'IMMUN_POP_0_11M',
   TRUE, FALSE, NULL, NULL, 2026),

  -- HepaB within 24 hours
  ('HEPAB_24H_MALE', 'HepaB Within 24h Male',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('HEPAB_24H_FEMALE', 'HepaB Within 24h Female',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('HEPAB_24H_TOTAL', 'HepaB Within 24h Total',
   'count', 'monthly', 'sum', 100, NULL,
   TRUE, FALSE, NULL, NULL, 2026),
  ('HEPAB_24H_PCT', 'HepaB Within 24h Percentage',
   'percentage', 'monthly', 'percentage', 100, 'IMMUN_POP_0_11M',
   TRUE, FALSE, NULL, NULL, 2026),

  -- HepaB >24h to 14 days
  ('HEPAB_GT24H_MALE', 'HepaB >24h to 14 Days Male',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('HEPAB_GT24H_FEMALE', 'HepaB >24h to 14 Days Female',
   'count', 'monthly', 'count', 100, NULL,
   FALSE, FALSE, NULL, NULL, 2026),
  ('HEPAB_GT24H_TOTAL', 'HepaB >24h to 14 Days Total',
   'count', 'monthly', 'sum', 100, NULL,
   TRUE, FALSE, NULL, NULL, 2026),
  ('HEPAB_GT24H_PCT', 'HepaB >24h to 14 Days Percentage',
   'percentage', 'monthly', 'percentage', 100, 'IMMUN_POP_0_11M',
   TRUE, FALSE, NULL, NULL, 2026)

) AS ind(code, name, unit, frequency_type, formula_type,
         rate_multiplier, denominator_source, is_computed,
         is_sensitive, target_value, target_year, year_introduced)
WHERE p.code = 'CHILD_CARE';

-- Verify
SELECT id, code, name, is_computed, target_value
FROM indicators
ORDER BY id;