"""
Migration: Create brands table and migrate data

This migration creates a new 'brands' table and migrates existing brand data
from the products.brand column to the new brands table. It also adds brand_id
foreign key to the products table.
"""

from sqlalchemy import text
from database import SessionLocal, engine


def migrate():
    """Run the migration"""
    db = SessionLocal()

    try:
        print("🔄 Creating 'brands' table...")

        # Create brands table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS brands (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                logo_url VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        db.commit()
        print("✅ Table 'brands' created successfully!")

        # Add brand_id column to products if it doesn't exist
        print("🔄 Adding 'brand_id' column to products table...")
        db.execute(text("""
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id)
        """))
        db.commit()
        print("✅ Column 'brand_id' added successfully!")

        # Migrate existing brand data
        print("🔄 Migrating existing brand data...")

        # Get all unique brands from products table (excluding NULL and empty strings)
        result = db.execute(text("""
            SELECT DISTINCT brand
            FROM products
            WHERE brand IS NOT NULL AND brand != ''
            ORDER BY brand
        """))
        unique_brands = [row[0] for row in result.fetchall()]

        print(f"📊 Found {len(unique_brands)} unique brands to migrate")

        # Insert brands into brands table
        brand_mapping = {}  # {brand_name: brand_id}
        for brand_name in unique_brands:
            # Check if brand already exists
            result = db.execute(
                text("SELECT id FROM brands WHERE name = :name"),
                {"name": brand_name}
            )
            existing_brand = result.fetchone()

            if existing_brand:
                brand_id = existing_brand[0]
                print(f"  ✓ Brand '{brand_name}' already exists (ID: {brand_id})")
            else:
                # Insert new brand
                result = db.execute(
                    text("""
                        INSERT INTO brands (name, is_active)
                        VALUES (:name, TRUE)
                        RETURNING id
                    """),
                    {"name": brand_name}
                )
                brand_id = result.fetchone()[0]
                print(f"  ✅ Created brand '{brand_name}' (ID: {brand_id})")

            brand_mapping[brand_name] = brand_id

        db.commit()

        # Update products with brand_id
        print("🔄 Updating products with brand_id...")
        updated_count = 0

        for brand_name, brand_id in brand_mapping.items():
            result = db.execute(
                text("""
                    UPDATE products
                    SET brand_id = :brand_id
                    WHERE brand = :brand_name
                """),
                {"brand_id": brand_id, "brand_name": brand_name}
            )
            count = result.rowcount
            updated_count += count
            print(f"  ➜ Updated {count} products with brand '{brand_name}'")

        db.commit()
        print(f"✅ Updated {updated_count} products with brand_id!")

        print("\n" + "="*60)
        print("✨ Migration completed successfully!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"  - Brands created: {len(brand_mapping)}")
        print(f"  - Products updated: {updated_count}")
        print(f"\n⚠️  Note: The 'brand' column in products is kept for backward compatibility")
        print(f"  - Future updates should use 'brand_id' instead")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
