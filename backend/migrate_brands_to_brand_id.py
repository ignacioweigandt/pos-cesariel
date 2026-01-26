"""
Migration script to consolidate brand fields.

This script:
1. For products with brand (string) but no brand_id:
   - Finds or creates the corresponding Brand in the brands table
   - Sets the brand_id on the product
2. Clears the legacy brand string field from all products

Run this script inside the backend container:
    docker compose exec backend python migrate_brands_to_brand_id.py
"""

from database import SessionLocal
from app.models import Product, Brand
from sqlalchemy import func


def migrate_brands():
    """Migrate all products from brand string to brand_id FK."""
    db = SessionLocal()

    try:
        # Get all products that have a brand string but no brand_id
        products_with_legacy_brand = db.query(Product).filter(
            Product.brand.isnot(None),
            Product.brand != '',
            Product.brand_id.is_(None)
        ).all()

        print(f"Found {len(products_with_legacy_brand)} products with legacy brand field to migrate")

        # Track statistics
        brands_created = 0
        products_updated = 0

        for product in products_with_legacy_brand:
            brand_name = product.brand.strip()

            # Find existing brand (case-insensitive)
            existing_brand = db.query(Brand).filter(
                func.lower(Brand.name) == func.lower(brand_name)
            ).first()

            if existing_brand:
                print(f"  Product '{product.name}' -> using existing brand '{existing_brand.name}' (id={existing_brand.id})")
                product.brand_id = existing_brand.id
            else:
                # Create new brand
                new_brand = Brand(name=brand_name, is_active=True)
                db.add(new_brand)
                db.flush()  # Get the ID
                print(f"  Product '{product.name}' -> created new brand '{new_brand.name}' (id={new_brand.id})")
                product.brand_id = new_brand.id
                brands_created += 1

            products_updated += 1

        # Now clear the legacy brand field from ALL products
        print("\nClearing legacy brand field from all products...")
        all_products_with_brand_string = db.query(Product).filter(
            Product.brand.isnot(None),
            Product.brand != ''
        ).all()

        for product in all_products_with_brand_string:
            product.brand = None

        db.commit()

        print(f"\n{'='*50}")
        print(f"Migration completed successfully!")
        print(f"  - Brands created: {brands_created}")
        print(f"  - Products migrated: {products_updated}")
        print(f"  - Legacy brand field cleared from {len(all_products_with_brand_string)} products")
        print(f"{'='*50}")

    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
        raise
    finally:
        db.close()


def show_current_state():
    """Show current state of brand fields."""
    db = SessionLocal()

    try:
        total_products = db.query(Product).count()
        with_brand_string = db.query(Product).filter(
            Product.brand.isnot(None),
            Product.brand != ''
        ).count()
        with_brand_id = db.query(Product).filter(
            Product.brand_id.isnot(None)
        ).count()
        with_both = db.query(Product).filter(
            Product.brand.isnot(None),
            Product.brand != '',
            Product.brand_id.isnot(None)
        ).count()
        with_neither = db.query(Product).filter(
            (Product.brand.is_(None) | (Product.brand == '')),
            Product.brand_id.is_(None)
        ).count()

        total_brands = db.query(Brand).count()

        print(f"\nCurrent state:")
        print(f"  Total products: {total_products}")
        print(f"  With brand string (legacy): {with_brand_string}")
        print(f"  With brand_id (new): {with_brand_id}")
        print(f"  With both: {with_both}")
        print(f"  With neither: {with_neither}")
        print(f"  Total brands in table: {total_brands}")

    finally:
        db.close()


if __name__ == "__main__":
    print("Brand Migration Script")
    print("=" * 50)

    show_current_state()

    print("\nStarting migration...")
    print("-" * 50)

    migrate_brands()

    print("\nAfter migration:")
    show_current_state()
