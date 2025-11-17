"""
Migration: Connect isolated configuration tables to the main system

This migration establishes relationships between previously isolated configuration
tables and the core system entities (users, branches, sales). This provides:
- Audit trail for configuration changes (who created/modified)
- Branch-specific configurations for e-commerce and WhatsApp
- Connection between custom installments and payment methods
- Marketing attribution (banners → sales)
- Full referential integrity across all configuration tables

Changes:
1. Add user references to configuration tables for audit
2. Add FK from system_config to tax_rates
3. Create branch-specific config tables for e-commerce and WhatsApp
4. Connect custom_installments to payment_methods
5. Add banner tracking to sales for marketing attribution
"""

from sqlalchemy import text
from database import SessionLocal, engine


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
        print("=" * 70)
        print("🔄 MIGRATION: Connecting isolated configuration tables")
        print("=" * 70)

        # ==================== PHASE 1: Add User Audit Columns ====================
        print("\n👤 PHASE 1: Adding user audit columns to config tables...")

        # ecommerce_config
        print("\n📊 Step 1.1: Adding audit columns to ecommerce_config...")
        db.execute(text("""
            ALTER TABLE ecommerce_config
            ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER,
            ADD COLUMN IF NOT EXISTS updated_by_user_id INTEGER;
        """))
        add_fk_if_not_exists(db, "ecommerce_config", "fk_ecommerce_config_created_by",
                            "FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL")
        add_fk_if_not_exists(db, "ecommerce_config", "fk_ecommerce_config_updated_by",
                            "FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL")
        db.commit()
        print("✅ ecommerce_config audit columns added")

        # store_banners
        print("\n🎨 Step 1.2: Adding audit columns to store_banners...")
        db.execute(text("""
            ALTER TABLE store_banners
            ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER,
            ADD COLUMN IF NOT EXISTS updated_by_user_id INTEGER;
        """))
        add_fk_if_not_exists(db, "store_banners", "fk_store_banners_created_by",
                            "FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL")
        add_fk_if_not_exists(db, "store_banners", "fk_store_banners_updated_by",
                            "FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL")
        db.commit()
        print("✅ store_banners audit columns added")

        # social_media_config
        print("\n📱 Step 1.3: Adding audit columns to social_media_config...")
        db.execute(text("""
            ALTER TABLE social_media_config
            ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER,
            ADD COLUMN IF NOT EXISTS updated_by_user_id INTEGER;
        """))
        add_fk_if_not_exists(db, "social_media_config", "fk_social_media_config_created_by",
                            "FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL")
        add_fk_if_not_exists(db, "social_media_config", "fk_social_media_config_updated_by",
                            "FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL")
        db.commit()
        print("✅ social_media_config audit columns added")

        # whatsapp_config
        print("\n💬 Step 1.4: Adding audit columns to whatsapp_config...")
        db.execute(text("""
            ALTER TABLE whatsapp_config
            ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER,
            ADD COLUMN IF NOT EXISTS updated_by_user_id INTEGER;
        """))
        add_fk_if_not_exists(db, "whatsapp_config", "fk_whatsapp_config_created_by",
                            "FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL")
        add_fk_if_not_exists(db, "whatsapp_config", "fk_whatsapp_config_updated_by",
                            "FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL")
        db.commit()
        print("✅ whatsapp_config audit columns added")

        # ==================== PHASE 2: Connect system_config to tax_rates ====================
        print("\n\n⚙️ PHASE 2: Connecting system_config to tax_rates...")

        # First, fix invalid default_tax_rate values
        print("\n🔄 Step 2.1: Fixing invalid default_tax_rate values...")
        result = db.execute(text("""
            SELECT id FROM tax_rates WHERE is_default = true LIMIT 1
        """))
        default_tax = result.fetchone()

        if default_tax:
            tax_id = default_tax[0]
            db.execute(text("""
                UPDATE system_config
                SET default_tax_rate = :tax_id
                WHERE default_tax_rate NOT IN (SELECT id FROM tax_rates)
            """), {"tax_id": tax_id})
            db.commit()
            print(f"✅ Updated system_config.default_tax_rate to {tax_id}")
        else:
            print("⚠️  No default tax rate found. Skipping FK creation.")
            print("   Please create a tax_rate first with is_default=true")
            # Skip FK creation if no valid tax rate exists
            return

        print("\n📊 Step 2.2: Adding FK from system_config to tax_rates...")
        add_fk_if_not_exists(db, "system_config", "fk_system_config_tax_rate",
                            "FOREIGN KEY (default_tax_rate) REFERENCES tax_rates(id) ON DELETE RESTRICT")
        db.commit()
        print("✅ system_config → tax_rates FK added")

        # ==================== PHASE 3: Branch-Specific Configurations ====================
        print("\n\n🏢 PHASE 3: Creating branch-specific configuration tables...")

        # branch_ecommerce_config
        print("\n🛒 Step 3.1: Creating branch_ecommerce_config table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS branch_ecommerce_config (
                id SERIAL PRIMARY KEY,
                branch_id INTEGER NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                custom_store_name VARCHAR(100),
                custom_contact_email VARCHAR(100),
                custom_contact_phone VARCHAR(20),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_branch_ecommerce_config_branch
                    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,

                CONSTRAINT uq_branch_ecommerce_config
                    UNIQUE (branch_id)
            );
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_branch_ecommerce_config_branch_id
            ON branch_ecommerce_config(branch_id);
        """))
        db.commit()
        print("✅ branch_ecommerce_config table created")

        # branch_whatsapp_config
        print("\n💬 Step 3.2: Creating branch_whatsapp_config table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS branch_whatsapp_config (
                id SERIAL PRIMARY KEY,
                branch_id INTEGER NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                custom_phone VARCHAR(20),
                custom_business_name VARCHAR(100),
                custom_welcome_message TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_branch_whatsapp_config_branch
                    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,

                CONSTRAINT uq_branch_whatsapp_config
                    UNIQUE (branch_id)
            );
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_branch_whatsapp_config_branch_id
            ON branch_whatsapp_config(branch_id);
        """))
        db.commit()
        print("✅ branch_whatsapp_config table created")

        # ==================== PHASE 4: Connect custom_installments ====================
        print("\n\n💳 PHASE 4: Connecting custom_installments to payment_methods...")

        print("\n📊 Step 4.1: Adding payment_method_id to custom_installments...")
        db.execute(text("""
            ALTER TABLE custom_installments
            ADD COLUMN IF NOT EXISTS payment_method_id INTEGER;
        """))
        add_fk_if_not_exists(db, "custom_installments", "fk_custom_installments_payment_method",
                            "FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_custom_installments_payment_method_id
            ON custom_installments(payment_method_id);
        """))
        db.commit()
        print("✅ custom_installments → payment_methods FK added")

        # Populate payment_method_id based on card_type
        print("\n🔄 Step 4.2: Populating payment_method_id for existing installments...")
        result = db.execute(text("""
            SELECT id, card_type FROM custom_installments WHERE payment_method_id IS NULL
        """))
        installments = result.fetchall()

        updated_count = 0
        for inst_id, card_type in installments:
            # Try to match card_type with payment method code or name
            pm_result = db.execute(text("""
                SELECT id FROM payment_methods
                WHERE UPPER(code) = UPPER(:card_type)
                   OR UPPER(name) LIKE '%' || UPPER(:card_type) || '%'
                LIMIT 1
            """), {"card_type": card_type})

            pm = pm_result.fetchone()
            if pm:
                db.execute(text("""
                    UPDATE custom_installments
                    SET payment_method_id = :pm_id
                    WHERE id = :inst_id
                """), {"pm_id": pm[0], "inst_id": inst_id})
                updated_count += 1

        db.commit()
        if updated_count > 0:
            print(f"✅ Updated {updated_count} custom installments with payment_method_id")
        else:
            print("ℹ️  No custom installments to update")

        # ==================== PHASE 5: Marketing Attribution ====================
        print("\n\n📈 PHASE 5: Adding marketing attribution to sales...")

        print("\n🎯 Step 5.1: Adding referral_banner_id to sales...")
        db.execute(text("""
            ALTER TABLE sales
            ADD COLUMN IF NOT EXISTS referral_banner_id INTEGER;
        """))
        add_fk_if_not_exists(db, "sales", "fk_sales_referral_banner",
                            "FOREIGN KEY (referral_banner_id) REFERENCES store_banners(id) ON DELETE SET NULL")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_sales_referral_banner_id
            ON sales(referral_banner_id);
        """))
        db.commit()
        print("✅ sales → store_banners FK added (marketing attribution)")

        # ==================== PHASE 6: Populate Branch Configurations ====================
        print("\n\n🔄 PHASE 6: Populating branch-specific configurations...")

        # Get all active branches
        result = db.execute(text("""
            SELECT id, name FROM branches WHERE is_active = true
        """))
        branches = result.fetchall()

        if branches:
            print(f"\n📊 Configuring {len(branches)} branches...")

            for branch_id, branch_name in branches:
                # Add ecommerce config for each branch
                existing = db.execute(text("""
                    SELECT id FROM branch_ecommerce_config WHERE branch_id = :branch_id
                """), {"branch_id": branch_id}).fetchone()

                if not existing:
                    db.execute(text("""
                        INSERT INTO branch_ecommerce_config (branch_id, is_active, notes)
                        VALUES (:branch_id, TRUE, 'Default e-commerce configuration')
                    """), {"branch_id": branch_id})

                # Add whatsapp config for each branch
                existing = db.execute(text("""
                    SELECT id FROM branch_whatsapp_config WHERE branch_id = :branch_id
                """), {"branch_id": branch_id}).fetchone()

                if not existing:
                    db.execute(text("""
                        INSERT INTO branch_whatsapp_config (branch_id, is_active, notes)
                        VALUES (:branch_id, TRUE, 'Default WhatsApp configuration')
                    """), {"branch_id": branch_id})

                print(f"  ➜ Branch '{branch_name}': Configured e-commerce and WhatsApp")

            db.commit()
            print(f"✅ Configured {len(branches)} branches with default settings")
        else:
            print("⚠️  No active branches found")

        # ==================== Summary ====================
        print("\n" + "=" * 70)
        print("✨ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)

        print("\n📋 Summary of changes:")
        print("\n  PHASE 1: User Audit Columns")
        print("    ✓ ecommerce_config: created_by_user_id, updated_by_user_id")
        print("    ✓ store_banners: created_by_user_id, updated_by_user_id")
        print("    ✓ social_media_config: created_by_user_id, updated_by_user_id")
        print("    ✓ whatsapp_config: created_by_user_id, updated_by_user_id")

        print("\n  PHASE 2: System Config Connection")
        print("    ✓ system_config → tax_rates (FK)")

        print("\n  PHASE 3: Branch-Specific Configurations")
        print("    ✓ Created branch_ecommerce_config table")
        print("    ✓ Created branch_whatsapp_config table")
        print(f"    ✓ Configured {len(branches) if branches else 0} branches")

        print("\n  PHASE 4: Payment Configuration")
        print("    ✓ custom_installments → payment_methods (FK)")
        if updated_count > 0:
            print(f"    ✓ Updated {updated_count} existing installments")

        print("\n  PHASE 5: Marketing Attribution")
        print("    ✓ sales → store_banners (referral tracking)")

        print("\n📊 Connected tables:")
        print("  • ecommerce_config ↔ users")
        print("  • store_banners ↔ users, sales")
        print("  • social_media_config ↔ users")
        print("  • whatsapp_config ↔ users")
        print("  • system_config ↔ tax_rates")
        print("  • custom_installments ↔ payment_methods")
        print("  • branch_ecommerce_config ↔ branches")
        print("  • branch_whatsapp_config ↔ branches")
        print("  • sales ↔ store_banners (marketing)")

        print("\n🎯 Next steps:")
        print("  1. Update models with new relationships")
        print("  2. Use ConfigService for branch-specific e-commerce/WhatsApp")
        print("  3. Track marketing attribution in sales")
        print("  4. Create reports leveraging new connections")
        print()

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


def rollback():
    """Rollback the migration"""
    db = SessionLocal()

    try:
        print("=" * 70)
        print("⏮️  ROLLBACK: Removing configuration table connections")
        print("=" * 70)

        # Remove sales → store_banners
        print("\n🔄 Removing sales → store_banners relationship...")
        db.execute(text("ALTER TABLE sales DROP CONSTRAINT IF EXISTS fk_sales_referral_banner"))
        db.execute(text("DROP INDEX IF EXISTS idx_sales_referral_banner_id"))
        db.execute(text("ALTER TABLE sales DROP COLUMN IF EXISTS referral_banner_id"))
        db.commit()
        print("✅ Removed")

        # Remove custom_installments → payment_methods
        print("\n🔄 Removing custom_installments → payment_methods relationship...")
        db.execute(text("ALTER TABLE custom_installments DROP CONSTRAINT IF EXISTS fk_custom_installments_payment_method"))
        db.execute(text("DROP INDEX IF EXISTS idx_custom_installments_payment_method_id"))
        db.execute(text("ALTER TABLE custom_installments DROP COLUMN IF EXISTS payment_method_id"))
        db.commit()
        print("✅ Removed")

        # Drop branch config tables
        print("\n🔄 Removing branch configuration tables...")
        db.execute(text("DROP TABLE IF EXISTS branch_whatsapp_config CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS branch_ecommerce_config CASCADE"))
        db.commit()
        print("✅ Removed")

        # Remove system_config → tax_rates
        print("\n🔄 Removing system_config → tax_rates relationship...")
        db.execute(text("ALTER TABLE system_config DROP CONSTRAINT IF EXISTS fk_system_config_tax_rate"))
        db.commit()
        print("✅ Removed")

        # Remove user audit columns
        print("\n🔄 Removing user audit columns...")

        tables = ['ecommerce_config', 'store_banners', 'social_media_config', 'whatsapp_config']
        for table in tables:
            db.execute(text(f"""
                ALTER TABLE {table}
                DROP CONSTRAINT IF EXISTS fk_{table}_created_by,
                DROP CONSTRAINT IF EXISTS fk_{table}_updated_by,
                DROP COLUMN IF EXISTS created_by_user_id,
                DROP COLUMN IF EXISTS updated_by_user_id
            """))

        db.commit()
        print("✅ Removed")

        print("\n✨ Rollback completed successfully!")

    except Exception as e:
        print(f"\n❌ Rollback failed: {e}")
        import traceback
        traceback.print_exc()
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
