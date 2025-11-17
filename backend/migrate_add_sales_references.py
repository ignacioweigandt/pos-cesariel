"""
Migration: Add configuration references to sales table

This migration adds reference columns to track which exact configurations
(tax rates, payment methods) were used in each sale. This provides:
- Full traceability of what configuration was active at sale time
- Historical accuracy even if configurations change later
- Better reporting and analytics capabilities

Changes:
- Add tax_rate_id (reference to tax_rates.id, not FK)
- Add tax_rate_name (snapshot of tax rate name)
- Add tax_rate_percentage (snapshot of rate applied)
- Add payment_method_id (reference to payment_methods.id, not FK)
- Add payment_method_name (snapshot of payment method name)

Note: These are soft references (no FK constraints) to maintain flexibility
and preserve historical data even if configurations are deleted.
"""

from sqlalchemy import text
from database import SessionLocal, engine


def migrate():
    """Run the migration"""
    db = SessionLocal()

    try:
        print("=" * 60)
        print("🔄 MIGRATION: Adding sales configuration references")
        print("=" * 60)

        # Add tax rate reference columns
        print("\n📊 Step 1: Adding tax rate reference columns...")
        db.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS tax_rate_id INTEGER,
            ADD COLUMN IF NOT EXISTS tax_rate_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS tax_rate_percentage NUMERIC(5, 2)
        """))
        db.commit()
        print("✅ Tax rate columns added successfully!")

        # Add payment method reference columns
        print("\n💳 Step 2: Adding payment method reference columns...")
        db.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS payment_method_id INTEGER,
            ADD COLUMN IF NOT EXISTS payment_method_name VARCHAR(100)
        """))
        db.commit()
        print("✅ Payment method columns added successfully!")

        # Populate tax rate data for existing sales
        print("\n🔄 Step 3: Populating tax rate data for existing sales...")

        # Get default tax rate
        result = db.execute(text("""
            SELECT id, name, rate
            FROM tax_rates
            WHERE is_default = true
            LIMIT 1
        """))
        default_tax = result.fetchone()

        if default_tax:
            tax_id, tax_name, tax_rate = default_tax

            # Update existing sales with tax information
            result = db.execute(text("""
                UPDATE sales
                SET
                    tax_rate_id = :tax_id,
                    tax_rate_name = :tax_name,
                    tax_rate_percentage = :tax_rate
                WHERE tax_rate_id IS NULL
                  AND tax_amount > 0
            """), {"tax_id": tax_id, "tax_name": tax_name, "tax_rate": tax_rate})

            updated_count = result.rowcount
            db.commit()
            print(f"✅ Updated {updated_count} sales with tax rate '{tax_name}' ({tax_rate}%)")
        else:
            print("⚠️  No default tax rate found. Skipping tax data population.")

        # Populate payment method data for existing sales
        print("\n💳 Step 4: Populating payment method data for existing sales...")

        # Get all payment methods
        result = db.execute(text("""
            SELECT DISTINCT payment_method
            FROM sales
            WHERE payment_method IS NOT NULL
        """))
        payment_methods = [row[0] for row in result.fetchall()]

        updated_count = 0
        for pm_code in payment_methods:
            # Try to find matching payment method in catalog
            result = db.execute(text("""
                SELECT id, name
                FROM payment_methods
                WHERE code = :code
                LIMIT 1
            """), {"code": pm_code})

            pm_data = result.fetchone()

            if pm_data:
                pm_id, pm_name = pm_data

                # Update sales with this payment method
                result = db.execute(text("""
                    UPDATE sales
                    SET
                        payment_method_id = :pm_id,
                        payment_method_name = :pm_name
                    WHERE payment_method = :pm_code
                      AND payment_method_id IS NULL
                """), {"pm_id": pm_id, "pm_name": pm_name, "pm_code": pm_code})

                count = result.rowcount
                updated_count += count
                print(f"  ➜ Updated {count} sales: '{pm_code}' → '{pm_name}' (ID: {pm_id})")
            else:
                # Payment method not in catalog, just populate name
                result = db.execute(text("""
                    UPDATE sales
                    SET payment_method_name = :pm_code
                    WHERE payment_method = :pm_code
                      AND payment_method_name IS NULL
                """), {"pm_code": pm_code})

                count = result.rowcount
                updated_count += count
                print(f"  ➜ Updated {count} sales: '{pm_code}' (not in catalog)")

        db.commit()
        print(f"✅ Updated {updated_count} sales with payment method information")

        # Add indexes for better query performance
        print("\n🔍 Step 5: Adding indexes for better performance...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_sales_tax_rate_id
            ON sales(tax_rate_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_sales_payment_method_id
            ON sales(payment_method_id)
        """))
        db.commit()
        print("✅ Indexes created successfully!")

        # Show summary
        print("\n" + "=" * 60)
        print("✨ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\n📋 Summary of changes:")
        print("  ✓ Added tax_rate_id column")
        print("  ✓ Added tax_rate_name column")
        print("  ✓ Added tax_rate_percentage column")
        print("  ✓ Added payment_method_id column")
        print("  ✓ Added payment_method_name column")
        print("  ✓ Populated data for existing sales")
        print("  ✓ Created performance indexes")

        print("\n📊 Next steps:")
        print("  1. Update SaleService to populate these fields on new sales")
        print("  2. Use these fields for reporting and analytics")
        print("  3. Run Phase 2 migration for branch-specific configurations")
        print()

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def rollback():
    """Rollback the migration"""
    db = SessionLocal()

    try:
        print("=" * 60)
        print("⏮️  ROLLBACK: Removing sales configuration references")
        print("=" * 60)

        # Remove indexes
        print("\n🔍 Removing indexes...")
        db.execute(text("DROP INDEX IF EXISTS idx_sales_tax_rate_id"))
        db.execute(text("DROP INDEX IF EXISTS idx_sales_payment_method_id"))
        db.commit()
        print("✅ Indexes removed")

        # Remove columns
        print("\n🔄 Removing columns...")
        db.execute(text("""
            ALTER TABLE sales
            DROP COLUMN IF EXISTS tax_rate_id,
            DROP COLUMN IF EXISTS tax_rate_name,
            DROP COLUMN IF EXISTS tax_rate_percentage,
            DROP COLUMN IF EXISTS payment_method_id,
            DROP COLUMN IF EXISTS payment_method_name
        """))
        db.commit()
        print("✅ Columns removed successfully!")

        print("\n✨ Rollback completed successfully!")

    except Exception as e:
        print(f"\n❌ Rollback failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback()
    else:
        migrate()
