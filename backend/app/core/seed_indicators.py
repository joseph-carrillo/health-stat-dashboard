# seed_indicators.py
# Auto-generates and inserts all FHSIS indicators into the database
# Run this script once to populate the indicators table
# Safe to run multiple times -- skips existing indicators

import psycopg2

# =====================================================
# DATABASE CONNECTION
# =====================================================
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "doh_nir_dashboard",
    "user": "doh_admin",
    "password": "doh_password_2026"
}

# =====================================================
# INDICATOR DEFINITIONS
# Format per indicator:
# (code, name, unit, frequency_type, formula_type,
#  rate_multiplier, denominator_source, is_computed,
#  is_sensitive, target_value, target_year)
# =====================================================

INDICATORS = {

    # =================================================
    # CHILD CARE -- IMMUNIZATION
    # =================================================
    "CHILD_CARE": [

        # --- File 1: CPAB, BCG, HepaB ---
        # Population
        ("IMMUN_POP_0_11M", "Projected Population 0-11 Months",
         "count", "monthly", "count",
         100, None, False, False, None, None),

        # CPAB
        ("CPAB_MALE", "CPAB Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("CPAB_FEMALE", "CPAB Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("CPAB_TOTAL", "CPAB Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("CPAB_PCT", "CPAB Percentage",
         "percentage", "monthly", "percentage",
         100, "IMMUN_POP_0_11M", True, False, 0.95, 2026),

        # BCG within 24h
        ("BCG_24H_MALE", "BCG Within 24h Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("BCG_24H_FEMALE", "BCG Within 24h Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("BCG_24H_TOTAL", "BCG Within 24h Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("BCG_24H_PCT", "BCG Within 24h Percentage",
         "percentage", "monthly", "percentage",
         100, "IMMUN_POP_0_11M", True, False, None, None),

        # BCG >24h to 11m29d
        ("BCG_GT24H_MALE", "BCG >24h to 11m29d Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("BCG_GT24H_FEMALE", "BCG >24h to 11m29d Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("BCG_GT24H_TOTAL", "BCG >24h to 11m29d Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("BCG_GT24H_PCT", "BCG >24h to 11m29d Percentage",
         "percentage", "monthly", "percentage",
         100, "IMMUN_POP_0_11M", True, False, None, None),

        # HepaB within 24h
        ("HEPAB_24H_MALE", "HepaB Within 24h Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("HEPAB_24H_FEMALE", "HepaB Within 24h Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("HEPAB_24H_TOTAL", "HepaB Within 24h Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("HEPAB_24H_PCT", "HepaB Within 24h Percentage",
         "percentage", "monthly", "percentage",
         100, "IMMUN_POP_0_11M", True, False, None, None),

        # HepaB >24h to 14 days
        ("HEPAB_GT24H_MALE", "HepaB >24h to 14 Days Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("HEPAB_GT24H_FEMALE", "HepaB >24h to 14 Days Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("HEPAB_GT24H_TOTAL", "HepaB >24h to 14 Days Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("HEPAB_GT24H_PCT", "HepaB >24h to 14 Days Percentage",
         "percentage", "monthly", "percentage",
         100, "IMMUN_POP_0_11M", True, False, None, None),

        # --- File 4: DPT-HiB-HepB doses 1,2,3 ---
        # Current year population
        ("DPT_POP_2026", "DPT Projected Population 2026 (0-11 Months)",
         "count", "monthly", "count",
         100, None, False, False, None, None),

        # DPT dose 1 current year
        ("DPT1_MALE", "DPT-HiB-HepB Dose 1 Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("DPT1_FEMALE", "DPT-HiB-HepB Dose 1 Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("DPT1_TOTAL", "DPT-HiB-HepB Dose 1 Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("DPT1_PCT", "DPT-HiB-HepB Dose 1 Percentage",
         "percentage", "monthly", "percentage",
         100, "DPT_POP_2026", True, False, None, None),

        # DPT dose 2 current year
        ("DPT2_MALE", "DPT-HiB-HepB Dose 2 Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("DPT2_FEMALE", "DPT-HiB-HepB Dose 2 Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("DPT2_TOTAL", "DPT-HiB-HepB Dose 2 Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("DPT2_PCT", "DPT-HiB-HepB Dose 2 Percentage",
         "percentage", "monthly", "percentage",
         100, "DPT_POP_2026", True, False, None, None),

        # DPT dose 3 current year
        ("DPT3_MALE", "DPT-HiB-HepB Dose 3 Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("DPT3_FEMALE", "DPT-HiB-HepB Dose 3 Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("DPT3_TOTAL", "DPT-HiB-HepB Dose 3 Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("DPT3_PCT", "DPT-HiB-HepB Dose 3 Percentage",
         "percentage", "monthly", "percentage",
         100, "DPT_POP_2026", True, False, None, None),

        # FIC and CIC
        ("FIC_MALE", "Fully Immunized Child Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("FIC_FEMALE", "Fully Immunized Child Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("FIC_TOTAL", "Fully Immunized Child Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("FIC_PCT", "Fully Immunized Child Percentage",
         "percentage", "monthly", "percentage",
         100, "IMMUN_POP_0_11M_PREV", True, False, 0.95, 2026),

        ("CIC_MALE", "Completely Immunized Child Male",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("CIC_FEMALE", "Completely Immunized Child Female",
         "count", "monthly", "count",
         100, None, False, False, None, None),
        ("CIC_TOTAL", "Completely Immunized Child Total",
         "count", "monthly", "sum",
         100, None, True, False, None, None),
        ("CIC_PCT", "Completely Immunized Child Percentage",
         "percentage", "monthly", "percentage",
         100, "PREV_POP_MINUS_FIC", True, False, 0.95, 2026),

        # Previous year population (for MMR2, FIC, CIC)
        ("IMMUN_POP_0_11M_PREV",
         "Projected Population 0-11 Months Previous Year",
         "count", "monthly", "count",
         100, None, False, False, None, None),
    ],
}

# =====================================================
# SEED FUNCTION
# =====================================================

def seed_indicators():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    total_inserted = 0
    total_skipped = 0

    for program_code, indicators in INDICATORS.items():

        # Get program id
        cur.execute(
            "SELECT id FROM programs WHERE code = %s",
            (program_code,)
        )
        result = cur.fetchone()
        if not result:
            print(f"WARNING: Program '{program_code}' not found. Skipping.")
            continue
        program_id = result[0]

        for ind in indicators:
            (code, name, unit, frequency_type, formula_type,
             rate_multiplier, denominator_source, is_computed,
             is_sensitive, target_value, target_year) = ind

            # Check if already exists
            cur.execute(
                "SELECT id FROM indicators WHERE code = %s",
                (code,)
            )
            if cur.fetchone():
                print(f"  SKIP (exists): {code}")
                total_skipped += 1
                continue

            # Insert
            cur.execute("""
                INSERT INTO indicators (
                    program_id, code, name, unit, frequency_type,
                    formula_type, rate_multiplier, denominator_source,
                    is_computed, is_sensitive, target_value, target_year,
                    year_introduced
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s, %s,
                    2026
                )
            """, (
                program_id, code, name, unit, frequency_type,
                formula_type, rate_multiplier, denominator_source,
                is_computed, is_sensitive, target_value, target_year
            ))
            print(f"  INSERTED: {code}")
            total_inserted += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nDone. Inserted: {total_inserted} | Skipped: {total_skipped}")


if __name__ == "__main__":
    seed_indicators()