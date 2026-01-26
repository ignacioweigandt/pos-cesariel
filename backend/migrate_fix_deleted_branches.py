"""
Migration script to fix branch names with duplicate "(Eliminada)" suffix.

This script:
1. Finds branches with "(Eliminada)" appearing multiple times in the name
2. Removes the duplicate suffixes, keeping only one "(Eliminada)" for inactive branches

Run this script inside the backend container:
    docker compose exec backend python migrate_fix_deleted_branches.py
"""

from database import SessionLocal, engine
from app.models import Branch
import re


def fix_deleted_branch_names():
    """Fix branch names that have multiple '(Eliminada)' suffixes."""
    db = SessionLocal()

    try:
        # Find all branches
        branches = db.query(Branch).all()

        fixed_count = 0
        for branch in branches:
            original_name = branch.name

            # Remove all occurrences of " (Eliminada)" from the name
            clean_name = re.sub(r'\s*\(Eliminada\)', '', branch.name).strip()

            # If branch is inactive, add single "(Eliminada)" suffix
            if not branch.is_active:
                new_name = f"{clean_name} (Eliminada)"
            else:
                new_name = clean_name

            # Update if name changed
            if new_name != original_name:
                print(f"Fixing: '{original_name}' -> '{new_name}'")
                branch.name = new_name
                fixed_count += 1

        if fixed_count > 0:
            db.commit()
            print(f"\n{fixed_count} branch name(s) fixed successfully.")
        else:
            print("No branches needed fixing.")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Fixing deleted branch names...")
    print("-" * 50)
    fix_deleted_branch_names()
