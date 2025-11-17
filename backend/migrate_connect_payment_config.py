"""
Migration: Connect payment_config table

This migration connects the legacy payment_config table to the rest of the system:
1. Add audit columns (created_by_user_id, updated_by_user_id)
2. Add FK to payment_methods table based on payment_type mapping

Note: payment_config is a legacy table that stores installment configurations.
The new system uses payment_methods + custom_installments instead.
"""

from sqlalchemy import text
from database import SessionLocal


def add_column_if_not_exists(db, table, column, definition):
    """Helper to add column if it doesn't exist"""
    db.execute(text(f"""
        DO $$ BEGIN
            ALTER TABLE {table}
            ADD COLUMN {column} {definition};
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END $$;
    """))


def add_fk_if_not_exists(db, table, constraint_name, fk_definition):
    """Helper to add FK constraint if it doesn't exist"""
    db.execute(text(f"""
        DO $$ BEGIN
            ALTER TABLE {table}
            ADD CONSTRAINT {constraint_name} {fk_definition};
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
    """))


def migrate():
    """Run the migration"""
    db = SessionLocal()

    try:
        print("=" * 60)
        print("🔄 MIGRATION: Connecting payment_config table")
        print("=" * 60)

        # Step 1: Add audit columns
        print("\n📋 Step 1: Adding audit columns to payment_config...")

        add_column_if_not_exists(
            db, "payment_config", "created_by_user_id",
            "INTEGER REFERENCES users(id) ON DELETE SET NULL"
        )
        add_column_if_not_exists(
            db, "payment_config", "updated_by_user_id",
            "INTEGER REFERENCES users(id) ON DELETE SET NULL"
        )

        db.commit()
        print("✅ Audit columns added!")

        # Step 2: Add payment_method_id column
        print("\n💳 Step 2: Adding payment_method_id to payment_config...")

        add_column_if_not_exists(
            db, "payment_config", "payment_method_id",
            "INTEGER"
        )

        db.commit()
        print("✅ payment_method_id column added!")

        # Step 3: Populate payment_method_id based on payment_type mapping
        print("\n🔄 Step 3: Mapping payment_config to payment_methods...")

        # Mapping logic:
        # payment_config.payment_type -> payment_methods.code
        # 'efectivo' -> 'CASH'
        # 'transferencia' -> 'TRANSFER'
        # 'tarjeta' -> 'CARD'

        # Update efectivo
        result = db.execute(text("""
            SELECT id FROM payment_methods WHERE code = 'CASH' LIMIT 1
        """))
        cash_method = result.fetchone()

        if cash_method:
            db.execute(text("""
                UPDATE payment_config
                SET payment_method_id = :method_id
                WHERE payment_type = 'efectivo' AND payment_method_id IS NULL
            """), {"method_id": cash_method[0]})
            print(f"  ➜ Mapped 'efectivo' to payment_method_id {cash_method[0]} (CASH)")

        # Update transferencia
        result = db.execute(text("""
            SELECT id FROM payment_methods WHERE code = 'TRANSFER' LIMIT 1
        """))
        transfer_method = result.fetchone()

        if transfer_method:
            db.execute(text("""
                UPDATE payment_config
                SET payment_method_id = :method_id
                WHERE payment_type = 'transferencia' AND payment_method_id IS NULL
            """), {"method_id": transfer_method[0]})
            print(f"  ➜ Mapped 'transferencia' to payment_method_id {transfer_method[0]} (TRANSFER)")

        # Update tarjeta (all card types)
        result = db.execute(text("""
            SELECT id FROM payment_methods WHERE code = 'CARD' LIMIT 1
        """))
        card_method = result.fetchone()

        if card_method:
            db.execute(text("""
                UPDATE payment_config
                SET payment_method_id = :method_id
                WHERE payment_type = 'tarjeta' AND payment_method_id IS NULL
            """), {"method_id": card_method[0]})
            print(f"  ➜ Mapped 'tarjeta' to payment_method_id {card_method[0]} (CARD)")

        db.commit()

        # Check how many records were mapped
        result = db.execute(text("""
            SELECT COUNT(*) FROM payment_config WHERE payment_method_id IS NOT NULL
        """))
        mapped_count = result.fetchone()[0]

        result = db.execute(text("""
            SELECT COUNT(*) FROM payment_config WHERE payment_method_id IS NULL
        """))
        unmapped_count = result.fetchone()[0]

        print(f"✅ Mapping complete: {mapped_count} mapped, {unmapped_count} unmapped")

        # Step 4: Add FK constraint (nullable to allow historical records)
        print("\n🔗 Step 4: Adding foreign key constraint...")

        add_fk_if_not_exists(
            db, "payment_config", "fk_payment_config_payment_method",
            "FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL"
        )

        db.commit()
        print("✅ Foreign key constraint added!")

        # Step 5: Create index for performance
        print("\n🔍 Step 5: Creating performance indexes...")

        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_payment_config_payment_method_id
            ON payment_config(payment_method_id)
        """))

        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_payment_config_created_by
            ON payment_config(created_by_user_id)
        """))

        db.commit()
        print("✅ Indexes created!")

        # Summary
        print("\n" + "=" * 60)
        print("✨ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\n📋 Summary of changes:")
        print("  ✓ Added created_by_user_id column (audit)")
        print("  ✓ Added updated_by_user_id column (audit)")
        print("  ✓ Added payment_method_id column")
        print(f"  ✓ Mapped {mapped_count} payment configs to payment methods")
        print("  ✓ Created FK constraint to payment_methods")
        print("  ✓ Created performance indexes")

        print("\n📊 Connection details:")
        print("  • payment_config.payment_method_id → payment_methods.id")
        print("  • payment_config.created_by_user_id → users.id")
        print("  • payment_config.updated_by_user_id → users.id")

        print("\n💡 Usage notes:")
        print("  • payment_config is a LEGACY table")
        print("  • New system uses: payment_methods + custom_installments")
        print("  • Recommend migrating data to new structure eventually")
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
        print("⏮️  ROLLBACK: Removing payment_config connections")
        print("=" * 60)

        # Drop FK constraint
        print("\n🔄 Removing foreign key constraint...")
        db.execute(text("""
            ALTER TABLE payment_config
            DROP CONSTRAINT IF EXISTS fk_payment_config_payment_method CASCADE
        """))
        db.commit()
        print("✅ FK constraint removed!")

        # Drop columns
        print("\n🔄 Removing columns...")
        db.execute(text("""
            ALTER TABLE payment_config
            DROP COLUMN IF EXISTS payment_method_id CASCADE,
            DROP COLUMN IF EXISTS created_by_user_id CASCADE,
            DROP COLUMN IF EXISTS updated_by_user_id CASCADE
        """))
        db.commit()
        print("✅ Columns removed!")

        # Drop indexes
        print("\n🔄 Removing indexes...")
        db.execute(text("DROP INDEX IF EXISTS idx_payment_config_payment_method_id"))
        db.execute(text("DROP INDEX IF EXISTS idx_payment_config_created_by"))
        db.commit()
        print("✅ Indexes removed!")

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
