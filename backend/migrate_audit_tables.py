"""
Migration: Add audit and logging tables

This migration creates comprehensive audit tables for tracking:
1. Configuration changes (who changed what, when)
2. Security events (logins, permission changes)

These tables are essential for:
- Compliance with regulations (GDPR, SOX, PCI-DSS)
- Security monitoring and incident response
- Troubleshooting configuration issues
- Change management and accountability

Tables created:
1. config_change_log - All configuration table changes
2. security_audit_log - Authentication and authorization events
"""

from sqlalchemy import text
from database import SessionLocal, engine


def migrate():
    """Run the migration"""
    db = SessionLocal()

    try:
        print("=" * 60)
        print("🔄 MIGRATION: Adding audit and logging tables")
        print("=" * 60)

        # Create ChangeAction enum type
        print("\n📋 Step 1: Creating ChangeAction enum type...")
        db.execute(text("""
            DO $$ BEGIN
                CREATE TYPE change_action AS ENUM (
                    'CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE'
                );
            EXCEPTION
                WHEN duplicate_object THEN NULL;
            END $$;
        """))
        db.commit()
        print("✅ ChangeAction enum type created!")

        # Create config_change_log table
        print("\n📊 Step 2: Creating config_change_log table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS config_change_log (
                id SERIAL PRIMARY KEY,
                table_name VARCHAR(100) NOT NULL,
                record_id INTEGER NOT NULL,
                action change_action NOT NULL,
                field_name VARCHAR(100),
                old_value TEXT,
                new_value TEXT,
                changed_by_user_id INTEGER,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                ip_address VARCHAR(50),
                user_agent VARCHAR(500),
                notes TEXT,

                -- Foreign key to users (soft reference)
                CONSTRAINT fk_config_change_log_user
                    FOREIGN KEY (changed_by_user_id)
                    REFERENCES users(id)
                    ON DELETE SET NULL
            )
        """))
        db.commit()
        print("✅ Table config_change_log created successfully!")

        # Create indexes for config_change_log
        print("\n🔍 Step 3: Creating indexes for config_change_log...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_config_change_log_table_name
            ON config_change_log(table_name)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_config_change_log_record_id
            ON config_change_log(record_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_config_change_log_table_record
            ON config_change_log(table_name, record_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_config_change_log_user_id
            ON config_change_log(changed_by_user_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_config_change_log_changed_at
            ON config_change_log(changed_at DESC)
        """))
        db.commit()
        print("✅ Indexes created for config_change_log!")

        # Create security_audit_log table
        print("\n🔒 Step 4: Creating security_audit_log table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS security_audit_log (
                id SERIAL PRIMARY KEY,
                event_type VARCHAR(50) NOT NULL,
                user_id INTEGER,
                username VARCHAR(100),
                success VARCHAR(10) DEFAULT 'SUCCESS' NOT NULL,
                ip_address VARCHAR(50),
                user_agent VARCHAR(500),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

                -- Foreign key to users (soft reference)
                CONSTRAINT fk_security_audit_log_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE SET NULL
            )
        """))
        db.commit()
        print("✅ Table security_audit_log created successfully!")

        # Create indexes for security_audit_log
        print("\n🔍 Step 5: Creating indexes for security_audit_log...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type
            ON security_audit_log(event_type)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id
            ON security_audit_log(user_id)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_security_audit_log_username
            ON security_audit_log(username)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_security_audit_log_ip_address
            ON security_audit_log(ip_address)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at
            ON security_audit_log(created_at DESC)
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_security_audit_log_failed_logins
            ON security_audit_log(event_type, success, created_at)
            WHERE event_type = 'LOGIN' AND success = 'FAILED'
        """))
        db.commit()
        print("✅ Indexes created for security_audit_log!")

        # Insert initial audit log entry for this migration
        print("\n📝 Step 6: Creating initial audit log entry...")

        # Try to get admin user
        result = db.execute(text("""
            SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1
        """))
        admin_user = result.fetchone()
        admin_id = admin_user[0] if admin_user else None

        if admin_id:
            db.execute(text("""
                INSERT INTO config_change_log
                    (table_name, record_id, action, field_name, new_value,
                     changed_by_user_id, changed_at, notes)
                VALUES
                    ('system', 0, 'CREATE', 'audit_tables', 'enabled',
                     :admin_id, CURRENT_TIMESTAMP, 'Audit tables created via migration script')
            """), {"admin_id": admin_id})
            db.commit()
            print(f"✅ Initial audit entry created (by user {admin_id})")
        else:
            print("⚠️  No admin user found. Skipping initial audit entry.")

        # Show summary
        print("\n" + "=" * 60)
        print("✨ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\n📋 Summary of changes:")
        print("  ✓ Created change_action enum type")
        print("  ✓ Created config_change_log table")
        print("  ✓ Created security_audit_log table")
        print("  ✓ Created performance indexes")
        print("  ✓ Inserted initial audit log entry")

        print("\n📊 Audit capabilities enabled:")
        print("  • Track all configuration changes")
        print("  • Monitor login attempts and security events")
        print("  • Maintain compliance audit trail")
        print("  • Troubleshoot configuration issues")

        print("\n📊 Next steps:")
        print("  1. Create audit repositories and services")
        print("  2. Add audit logging to all configuration endpoints")
        print("  3. Implement security event monitoring")
        print("  4. Set up log retention policies")
        print("  5. Create audit reports for compliance")
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
        print("⏮️  ROLLBACK: Removing audit tables")
        print("=" * 60)

        # Drop tables
        print("\n🔄 Removing audit tables...")
        db.execute(text("DROP TABLE IF EXISTS security_audit_log CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS config_change_log CASCADE"))
        db.commit()
        print("✅ Tables removed successfully!")

        # Drop enum type
        print("\n🔄 Removing change_action enum type...")
        db.execute(text("DROP TYPE IF EXISTS change_action CASCADE"))
        db.commit()
        print("✅ Enum type removed!")

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
