"""
Migration: Add 'brand' column to products table

This migration adds a brand field to the products table to support
filtering products by brand (Nike, Adidas, Puma, etc.)
"""

from sqlalchemy import text
from database import SessionLocal, engine
import re

def extract_brand_from_name(product_name: str) -> str:
    """
    Extract brand name from product name.
    Looks for known brands at the beginning of the product name.
    """
    known_brands = [
        'Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance',
        'Under Armour', 'Fila', 'Asics', 'Mizuno', 'Umbro',
        'Kappa', 'Converse', 'Vans', 'Jordan', 'Skechers'
    ]

    # Check if product name starts with any known brand
    for brand in known_brands:
        if product_name.startswith(brand):
            return brand

    # Try to extract first word as brand
    words = product_name.split()
    if words:
        return words[0]

    return None


def migrate():
    """Run the migration"""
    db = SessionLocal()

    try:
        print("🔄 Adding 'brand' column to products table...")

        # Add column if it doesn't exist
        db.execute(text("""
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS brand VARCHAR(100)
        """))
        db.commit()
        print("✅ Column 'brand' added successfully!")

        # Populate brand for existing products
        print("🔄 Populating brand field for existing products...")

        result = db.execute(text("SELECT id, name FROM products"))
        products = result.fetchall()

        updated_count = 0
        for product in products:
            product_id, product_name = product
            brand = extract_brand_from_name(product_name)

            if brand:
                db.execute(
                    text("UPDATE products SET brand = :brand WHERE id = :id"),
                    {"brand": brand, "id": product_id}
                )
                updated_count += 1
                print(f"  ➜ Product ID {product_id}: '{product_name}' → Brand: '{brand}'")

        db.commit()
        print(f"✅ Updated {updated_count} products with brand information!")
        print("\n✨ Migration completed successfully!")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
