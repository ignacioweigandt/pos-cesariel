"""
Migration: Add branch-specific configuration tables

This migration creates tables to allow branch-level configuration overrides
for tax rates and payment methods. This enables:
- Different tax rates per branch (for different jurisdictions)
- Different payment methods available per branch
- Custom surcharges or fees per branch
- Flexible multi-branch configuration management

Tables created:
1. branch_tax_rates - Tax rate configuration per branch
2. branch_payment_methods - Payment method configuration per branch

Both tables have foreign keys to maintain referential integrity.
"""

from sqlalchemy import text
from database import SessionLocal, engine


def migrate():
    """Run the migration"""
    db = SessionLocal()

    try:
        print("=" * 60)
        print("🔄 MIGRATION: Adding branch-specific configuration tables")
        print("=" * 60)

        # Create branch_tax_rates table
        print("\n📊 Step 1: Creating branch_tax_rates table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS branch_tax_rates (
                id SERIAL PRIMARY KEY,
                branch_id INTEGER NOT NULL,
                tax_rate_id INTEGER NOT NULL,
                is_default BOOLEAN DEFAULT TRUE,
                effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                -- Foreign keys with proper constraints
                CONSTRAINT fk_branch_tax_rates_branch
                    FOREIGN KEY (branch_id)
                    REFERENCES branches(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_branch_tax_rates_tax_rate
                    FOREIGN KEY (tax_rate_id)
                    REFERENCES tax_rates(id)
                    ON DELETE RESTRICT,

                -- Unique constraint to prevent duplicates
                CONSTRAINT uq_branch_tax_rate
                    UNIQUE (branch_id, tax_rate_id, effective_from)
            )
        """))
        db.commit()
        print("✅ Table branch_tax_rates created successfully!")

        # Create indexes for better query performance
        print("\n🔍 Step 2: Creating indexes for branch_tax_rates...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_branch_tax_rates_branch_id
            ON branch_tax_rates(branch_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_branch_tax_rates_tax_rate_id
            ON branch_tax_rates(tax_rate_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_branch_tax_rates_is_default
            ON branch_tax_rates(branch_id, is_default)
            WHERE is_default = TRUE
        """))
        db.commit()
        print("✅ Indexes created for branch_tax_rates!")

        # Create branch_payment_methods table
        print("\n💳 Step 3: Creating branch_payment_methods table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS branch_payment_methods (
                id SERIAL PRIMARY KEY,
                branch_id INTEGER NOT NULL,
                payment_method_id INTEGER NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                surcharge_override NUMERIC(5, 2),
                installment_override INTEGER,
                notes VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                -- Foreign keys with proper constraints
                CONSTRAINT fk_branch_payment_methods_branch
                    FOREIGN KEY (branch_id)
                    REFERENCES branches(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_branch_payment_methods_payment_method
                    FOREIGN KEY (payment_method_id)
                    REFERENCES payment_methods(id)
                    ON DELETE RESTRICT,

                -- Unique constraint to prevent duplicates
                CONSTRAINT uq_branch_payment_method
                    UNIQUE (branch_id, payment_method_id)
            )
        """))
        db.commit()
        print("✅ Table branch_payment_methods created successfully!")

        # Create indexes for better query performance
        print("\n🔍 Step 4: Creating indexes for branch_payment_methods...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_branch_payment_methods_branch_id
            ON branch_payment_methods(branch_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_branch_payment_methods_payment_method_id
            ON branch_payment_methods(payment_method_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_branch_payment_methods_is_active
            ON branch_payment_methods(branch_id, is_active)
            WHERE is_active = TRUE
        """))
        db.commit()
        print("✅ Indexes created for branch_payment_methods!")

        # Populate default configurations for existing branches
        print("\n🔄 Step 5: Populating default configurations for existing branches...")

        # Get default tax rate
        result = db.execute(text("""
            SELECT id, name
            FROM tax_rates
            WHERE is_default = true
            LIMIT 1
        """))
        default_tax = result.fetchone()

        # Get all active branches
        result = db.execute(text("""
            SELECT id, name
            FROM branches
            WHERE is_active = true
        """))
        branches = result.fetchall()

        if default_tax and branches:
            tax_id, tax_name = default_tax

            for branch_id, branch_name in branches:
                # Check if already exists
                existing = db.execute(text("""
                    SELECT id FROM branch_tax_rates
                    WHERE branch_id = :branch_id AND tax_rate_id = :tax_id
                """), {"branch_id": branch_id, "tax_id": tax_id}).fetchone()

                if not existing:
                    # Add default tax rate for each branch
                    db.execute(text("""
                        INSERT INTO branch_tax_rates
                            (branch_id, tax_rate_id, is_default, notes)
                        VALUES
                            (:branch_id, :tax_id, TRUE, 'Default tax rate configuration')
                    """), {"branch_id": branch_id, "tax_id": tax_id})

                print(f"  ➜ Branch '{branch_name}': Added default tax rate '{tax_name}'")

            db.commit()
            print(f"✅ Configured {len(branches)} branches with default tax rate!")
        else:
            print("⚠️  No default tax rate or no active branches found. Skipping default configuration.")

        # Populate all payment methods for all branches
        print("\n💳 Step 6: Populating payment methods for existing branches...")

        # Get all active payment methods
        result = db.execute(text("""
            SELECT id, name, code
            FROM payment_methods
            WHERE is_active = true
        """))
        payment_methods = result.fetchall()

        if payment_methods and branches:
            for branch_id, branch_name in branches:
                for pm_id, pm_name, pm_code in payment_methods:
                    # Check if already exists
                    existing = db.execute(text("""
                        SELECT id FROM branch_payment_methods
                        WHERE branch_id = :branch_id AND payment_method_id = :pm_id
                    """), {"branch_id": branch_id, "pm_id": pm_id}).fetchone()

                    if not existing:
                        # Add all payment methods to each branch
                        db.execute(text("""
                            INSERT INTO branch_payment_methods
                                (branch_id, payment_method_id, is_active, notes)
                            VALUES
                                (:branch_id, :pm_id, TRUE, 'Default payment method configuration')
                        """), {"branch_id": branch_id, "pm_id": pm_id})

                print(f"  ➜ Branch '{branch_name}': Added {len(payment_methods)} payment methods")

            db.commit()
            print(f"✅ Configured {len(branches)} branches with payment methods!")
        else:
            print("⚠️  No active payment methods or no active branches found. Skipping default configuration.")

        # Show summary
        print("\n" + "=" * 60)
        print("✨ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\n📋 Summary of changes:")
        print("  ✓ Created branch_tax_rates table")
        print("  ✓ Created branch_payment_methods table")
        print("  ✓ Created indexes for performance")
        print("  ✓ Configured default settings for existing branches")

        print("\n📊 Next steps:")
        print("  1. Use ConfigService to manage branch-specific configurations")
        print("  2. Update SaleService to check branch configurations first")
        print("  3. Create UI for branch administrators to customize settings")
        print("  4. Run Phase 3 migration for configuration audit trail")
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
        print("⏮️  ROLLBACK: Removing branch configuration tables")
        print("=" * 60)

        # Drop tables (cascades will handle foreign keys)
        print("\n🔄 Removing branch configuration tables...")
        db.execute(text("DROP TABLE IF EXISTS branch_payment_methods CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS branch_tax_rates CASCADE"))
        db.commit()
        print("✅ Tables removed successfully!")

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
