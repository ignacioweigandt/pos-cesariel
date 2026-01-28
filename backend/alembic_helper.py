#!/usr/bin/env python3
"""
Helper script for Alembic migrations in POS Cesariel.

This script provides utility functions for working with Alembic migrations,
including checking migration status, validating migrations, and generating reports.

Usage:
    python alembic_helper.py --check    # Check migration status
    python alembic_helper.py --validate # Validate pending migrations
    python alembic_helper.py --report   # Generate migration report
"""

import argparse
import sys
from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine
from database import DATABASE_URL


def get_alembic_config():
    """Get Alembic configuration object."""
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", DATABASE_URL)
    return config


def check_migration_status():
    """
    Check current migration status and show pending migrations.
    """
    print("🔍 Checking migration status...\n")
    
    config = get_alembic_config()
    script = ScriptDirectory.from_config(config)
    
    # Get current database revision
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        current_rev = context.get_current_revision()
    
    # Get head revision from scripts
    head_rev = script.get_current_head()
    
    print(f"📌 Current database revision: {current_rev or 'None (empty database)'}")
    print(f"📌 Latest available revision: {head_rev or 'None (no migrations)'}")
    
    if current_rev == head_rev:
        print("\n✅ Database is up to date!")
        return True
    else:
        print("\n⚠️  Database is NOT up to date!")
        print("\n📋 Pending migrations:")
        
        # Show pending migrations
        if current_rev:
            for rev in script.iterate_revisions(head_rev, current_rev):
                print(f"  - {rev.revision[:8]}: {rev.doc}")
        else:
            # No migrations applied yet, show all
            for rev in script.walk_revisions():
                print(f"  - {rev.revision[:8]}: {rev.doc}")
        
        print("\n💡 Run 'make migrate-upgrade' to apply pending migrations")
        return False


def validate_migrations():
    """
    Validate migration files for common issues.
    """
    print("🔍 Validating migration files...\n")
    
    config = get_alembic_config()
    script = ScriptDirectory.from_config(config)
    
    issues_found = False
    
    for revision in script.walk_revisions():
        migration_file = revision.module.__file__
        
        # Read migration file content
        with open(migration_file, 'r') as f:
            content = f.read()
        
        # Check for common issues
        checks = [
            ("Missing upgrade()", "def upgrade()" not in content),
            ("Missing downgrade()", "def downgrade()" not in content),
            ("Empty upgrade()", "def upgrade() -> None:\n    pass" in content),
            ("Empty downgrade()", "def downgrade() -> None:\n    pass" in content),
        ]
        
        revision_issues = [msg for msg, failed in checks if failed]
        
        if revision_issues:
            issues_found = True
            print(f"❌ {revision.revision[:8]}: {revision.doc}")
            for issue in revision_issues:
                print(f"   - {issue}")
        else:
            print(f"✅ {revision.revision[:8]}: {revision.doc}")
    
    if issues_found:
        print("\n⚠️  Some migrations have issues. Please review them.")
        return False
    else:
        print("\n✅ All migrations look good!")
        return True


def generate_report():
    """
    Generate a detailed migration report.
    """
    print("📊 Migration Report\n")
    print("=" * 60)
    
    config = get_alembic_config()
    script = ScriptDirectory.from_config(config)
    
    # Get current database revision
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        current_rev = context.get_current_revision()
    
    all_migrations = list(script.walk_revisions())
    total_migrations = len(all_migrations)
    
    print(f"\n📌 Total migrations: {total_migrations}")
    print(f"📌 Current revision: {current_rev or 'None'}")
    print(f"📌 Latest revision:  {script.get_current_head() or 'None'}")
    
    print("\n📋 Migration History (newest first):\n")
    
    for i, rev in enumerate(all_migrations, 1):
        is_current = rev.revision == current_rev
        status = "🟢 APPLIED" if is_current or (current_rev and rev.revision > current_rev) else "⚪ PENDING"
        
        print(f"{i}. {status}")
        print(f"   Revision: {rev.revision[:12]}")
        print(f"   Message:  {rev.doc}")
        if rev.down_revision:
            print(f"   Parent:   {rev.down_revision[:12]}")
        print()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Alembic Migration Helper for POS Cesariel"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check migration status"
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Validate migration files"
    )
    parser.add_argument(
        "--report",
        action="store_true",
        help="Generate detailed migration report"
    )
    
    args = parser.parse_args()
    
    if not any([args.check, args.validate, args.report]):
        parser.print_help()
        return
    
    try:
        if args.check:
            success = check_migration_status()
            sys.exit(0 if success else 1)
        
        if args.validate:
            success = validate_migrations()
            sys.exit(0 if success else 1)
        
        if args.report:
            generate_report()
            sys.exit(0)
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
