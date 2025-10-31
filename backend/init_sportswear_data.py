from database import SessionLocal, engine, Base
from app.models import (Branch, User, Category, Product, ProductSize, ProductImage,
                   EcommerceConfig, UserRole, Sale, SaleItem, InventoryMovement,
                   BranchStock, StoreBanner, WhatsAppSale)
from auth import get_password_hash
from decimal import Decimal
from sqlalchemy import func
import random

def clean_existing_products():
    """Limpia todos los productos existentes y datos relacionados"""
    db = SessionLocal()
    try:
        print("🧹 Limpiando productos existentes y datos relacionados...")
        
        # Eliminar en orden correcto por dependencias FK
        # Primero las tablas que referencian a products
        
        # 1. WhatsAppSale -> Sale -> SaleItem -> Product
        print("  - Eliminando WhatsApp sales...")
        db.query(WhatsAppSale).delete()
        
        # 2. SaleItem (referencia a Product y Sale)
        print("  - Eliminando items de ventas...")
        db.query(SaleItem).delete()
        
        # 3. Sales (ahora sin referencias desde SaleItem)
        print("  - Eliminando ventas...")
        db.query(Sale).delete()
        
        # 4. InventoryMovement (referencia a Product)
        print("  - Eliminando movimientos de inventario...")
        db.query(InventoryMovement).delete()
        
        # 5. BranchStock (referencia a Product)
        print("  - Eliminando stock por sucursal...")
        db.query(BranchStock).delete()
        
        # 6. ProductImage (referencia a Product)
        print("  - Eliminando imágenes de productos...")
        db.query(ProductImage).delete()
        
        # 7. ProductSize (referencia a Product)
        print("  - Eliminando talles de productos...")
        db.query(ProductSize).delete()
        
        # 8. Ahora podemos eliminar productos
        print("  - Eliminando productos...")
        db.query(Product).delete()
        
        # 9. Eliminar categorías (no tienen FK desde otras tablas importantes)
        print("  - Eliminando categorías...")
        db.query(Category).delete()
        
        # 10. Eliminar banners del store
        print("  - Eliminando banners del store...")
        db.query(StoreBanner).delete()
        
        db.commit()
        print("✅ Todos los productos y datos relacionados eliminados")
        
    except Exception as e:
        print(f"❌ Error limpiando productos: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def create_sportswear_categories():
    """Crear categorías específicas para tienda deportiva"""
    db = SessionLocal()
    try:
        print("📂 Creando categorías deportivas...")
        
        categories = [
            Category(
                name="Calzado Deportivo", 
                description="Zapatillas y calzado deportivo de todas las disciplinas"
            ),
            Category(
                name="Indumentaria Superior", 
                description="Remeras, buzos, camperas y tops deportivos"
            ),
            Category(
                name="Indumentaria Inferior", 
                description="Shorts, pantalones, calzas y joggers deportivos"
            ),
            Category(
                name="Accesorios Deportivos", 
                description="Gorras, medias, guantes, mochilas y accesorios"
            )
        ]
        
        for category in categories:
            db.add(category)
        
        db.commit()
        
        # Refrescar para obtener IDs
        for category in categories:
            db.refresh(category)
        
        print(f"✅ Creadas {len(categories)} categorías deportivas")
        return categories
        
    except Exception as e:
        print(f"❌ Error creando categorías: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def create_sportswear_products():
    """Crear catálogo completo de productos deportivos (~100 productos)"""
    db = SessionLocal()
    try:
        print("👕 Creando productos deportivos...")
        
        # Obtener categorías
        calzado_cat = db.query(Category).filter(Category.name == "Calzado Deportivo").first()
        superior_cat = db.query(Category).filter(Category.name == "Indumentaria Superior").first()
        inferior_cat = db.query(Category).filter(Category.name == "Indumentaria Inferior").first()
        accesorios_cat = db.query(Category).filter(Category.name == "Accesorios Deportivos").first()
        
        products = []
        
        # CALZADO DEPORTIVO (30 productos)
        calzado_products = [
            # Nike
            {"name": "Nike Air Max 90", "brand": "Nike", "type": "Lifestyle", "price": 120, "cost": 75},
            {"name": "Nike Air Force 1", "brand": "Nike", "type": "Lifestyle", "price": 110, "cost": 70},
            {"name": "Nike Revolution 6", "brand": "Nike", "type": "Running", "price": 80, "cost": 50},
            {"name": "Nike React Infinity Run", "brand": "Nike", "type": "Running", "price": 160, "cost": 100},
            {"name": "Nike Court Vision Low", "brand": "Nike", "type": "Basketball", "price": 85, "cost": 55},
            
            # Adidas
            {"name": "Adidas Stan Smith", "brand": "Adidas", "type": "Lifestyle", "price": 100, "cost": 65},
            {"name": "Adidas Superstar", "brand": "Adidas", "type": "Lifestyle", "price": 95, "cost": 60},
            {"name": "Adidas Ultraboost 22", "brand": "Adidas", "type": "Running", "price": 180, "cost": 120},
            {"name": "Adidas Gazelle", "brand": "Adidas", "type": "Lifestyle", "price": 90, "cost": 58},
            {"name": "Adidas NMD R1", "brand": "Adidas", "type": "Lifestyle", "price": 130, "cost": 85},
            
            # Puma
            {"name": "Puma Suede Classic", "brand": "Puma", "type": "Lifestyle", "price": 75, "cost": 48},
            {"name": "Puma RS-X", "brand": "Puma", "type": "Lifestyle", "price": 110, "cost": 70},
            {"name": "Puma Velocity Nitro", "brand": "Puma", "type": "Running", "price": 140, "cost": 90},
            {"name": "Puma Future Z", "brand": "Puma", "type": "Fútbol", "price": 200, "cost": 130},
            
            # New Balance
            {"name": "New Balance 574", "brand": "New Balance", "type": "Lifestyle", "price": 85, "cost": 55},
            {"name": "New Balance Fresh Foam X", "brand": "New Balance", "type": "Running", "price": 150, "cost": 95},
            {"name": "New Balance 327", "brand": "New Balance", "type": "Lifestyle", "price": 90, "cost": 58},
            
            # Under Armour
            {"name": "Under Armour HOVR Phantom", "brand": "Under Armour", "type": "Running", "price": 140, "cost": 90},
            {"name": "Under Armour Curry 10", "brand": "Under Armour", "type": "Basketball", "price": 160, "cost": 100},
            
            # Reebok
            {"name": "Reebok Classic Leather", "brand": "Reebok", "type": "Lifestyle", "price": 70, "cost": 45},
            {"name": "Reebok Nano X2", "brand": "Reebok", "type": "Training", "price": 130, "cost": 85},
            
            # Fila
            {"name": "Fila Disruptor II", "brand": "Fila", "type": "Lifestyle", "price": 65, "cost": 42},
            {"name": "Fila Ray Tracer", "brand": "Fila", "type": "Lifestyle", "price": 75, "cost": 48},
            
            # Topper
            {"name": "Topper Tie Break", "brand": "Topper", "type": "Lifestyle", "price": 45, "cost": 28},
            {"name": "Topper Modelo", "brand": "Topper", "type": "Lifestyle", "price": 40, "cost": 25},
            
            # Kappa
            {"name": "Kappa Authentic", "brand": "Kappa", "type": "Lifestyle", "price": 55, "cost": 35},
            {"name": "Kappa Logo Galium", "brand": "Kappa", "type": "Lifestyle", "price": 60, "cost": 38},
            
            # Vans
            {"name": "Vans Old Skool", "brand": "Vans", "type": "Lifestyle", "price": 70, "cost": 45},
            {"name": "Vans Authentic", "brand": "Vans", "type": "Lifestyle", "price": 60, "cost": 38},
            {"name": "Vans SK8-Hi", "brand": "Vans", "type": "Lifestyle", "price": 75, "cost": 48}
        ]
        
        for i, shoe in enumerate(calzado_products, 1):
            product = Product(
                name=shoe["name"],
                description=f"Zapatillas {shoe['brand']} {shoe['type']} de alta calidad",
                sku=f"SHOE-{i:03d}",
                barcode=f"77890000{1000 + i}",
                category_id=calzado_cat.id,
                price=Decimal(str(shoe["price"])),
                cost=Decimal(str(shoe["cost"])),
                stock_quantity=0,  # Se maneja por talles
                min_stock=15,
                ecommerce_price=Decimal(str(shoe["price"] * 0.95)),  # 5% descuento online
                has_sizes=True,
                show_in_ecommerce=True
            )
            products.append(product)
        
        # INDUMENTARIA SUPERIOR (25 productos)
        superior_products = [
            # Nike Superior
            {"name": "Nike Dri-FIT T-Shirt", "brand": "Nike", "type": "Remera", "price": 35, "cost": 20},
            {"name": "Nike Sportswear Hoodie", "brand": "Nike", "type": "Buzo", "price": 85, "cost": 50},
            {"name": "Nike Tech Fleece", "brand": "Nike", "type": "Campera", "price": 120, "cost": 75},
            {"name": "Nike Pro Top", "brand": "Nike", "type": "Top", "price": 45, "cost": 28},
            {"name": "Nike Windrunner", "brand": "Nike", "type": "Campera", "price": 95, "cost": 60},
            
            # Adidas Superior
            {"name": "Adidas Essentials T-Shirt", "brand": "Adidas", "type": "Remera", "price": 30, "cost": 18},
            {"name": "Adidas Trefoil Hoodie", "brand": "Adidas", "type": "Buzo", "price": 80, "cost": 48},
            {"name": "Adidas Track Jacket", "brand": "Adidas", "type": "Campera", "price": 90, "cost": 55},
            {"name": "Adidas 3-Stripes T-Shirt", "brand": "Adidas", "type": "Remera", "price": 35, "cost": 20},
            {"name": "Adidas Z.N.E. Hoodie", "brand": "Adidas", "type": "Buzo", "price": 100, "cost": 65},
            
            # Puma Superior
            {"name": "Puma Essential T-Shirt", "brand": "Puma", "type": "Remera", "price": 28, "cost": 16},
            {"name": "Puma Classics Hoodie", "brand": "Puma", "type": "Buzo", "price": 70, "cost": 42},
            {"name": "Puma Track Jacket", "brand": "Puma", "type": "Campera", "price": 85, "cost": 52},
            
            # Under Armour Superior
            {"name": "Under Armour Tech 2.0", "brand": "Under Armour", "type": "Remera", "price": 40, "cost": 24},
            {"name": "Under Armour Rival Fleece", "brand": "Under Armour", "type": "Buzo", "price": 75, "cost": 45},
            {"name": "Under Armour Storm Jacket", "brand": "Under Armour", "type": "Campera", "price": 110, "cost": 70},
            
            # New Balance Superior
            {"name": "New Balance Athletics T-Shirt", "brand": "New Balance", "type": "Remera", "price": 32, "cost": 19},
            {"name": "New Balance Essentials Hoodie", "brand": "New Balance", "type": "Buzo", "price": 68, "cost": 40},
            
            # Reebok Superior
            {"name": "Reebok Training T-Shirt", "brand": "Reebok", "type": "Remera", "price": 30, "cost": 18},
            {"name": "Reebok Classic Hoodie", "brand": "Reebok", "type": "Buzo", "price": 65, "cost": 38},
            
            # Fila Superior
            {"name": "Fila Logo T-Shirt", "brand": "Fila", "type": "Remera", "price": 25, "cost": 15},
            {"name": "Fila Urban Line Hoodie", "brand": "Fila", "type": "Buzo", "price": 55, "cost": 33},
            
            # Topper/Kappa
            {"name": "Topper Training T-Shirt", "brand": "Topper", "type": "Remera", "price": 22, "cost": 13},
            {"name": "Kappa Authentic Hoodie", "brand": "Kappa", "type": "Buzo", "price": 50, "cost": 30},
            {"name": "Kappa Track Jacket", "brand": "Kappa", "type": "Campera", "price": 70, "cost": 42}
        ]
        
        for i, item in enumerate(superior_products, 1):
            product = Product(
                name=item["name"],
                description=f"{item['type']} {item['brand']} deportiva de alta calidad",
                sku=f"SUP-{i:03d}",
                barcode=f"77890001{1000 + i}",
                category_id=superior_cat.id,
                price=Decimal(str(item["price"])),
                cost=Decimal(str(item["cost"])),
                stock_quantity=0,  # Se maneja por talles
                min_stock=20,
                ecommerce_price=Decimal(str(item["price"] * 0.93)),  # 7% descuento online
                has_sizes=True,
                show_in_ecommerce=True
            )
            products.append(product)
        
        # INDUMENTARIA INFERIOR (25 productos)
        inferior_products = [
            # Nike Inferior
            {"name": "Nike Dri-FIT Shorts", "brand": "Nike", "type": "Short", "price": 40, "cost": 24},
            {"name": "Nike Tech Fleece Joggers", "brand": "Nike", "type": "Jogger", "price": 90, "cost": 55},
            {"name": "Nike Pro Leggings", "brand": "Nike", "type": "Calza", "price": 55, "cost": 33},
            {"name": "Nike Sportswear Pants", "brand": "Nike", "type": "Pantalón", "price": 75, "cost": 45},
            {"name": "Nike Running Shorts", "brand": "Nike", "type": "Short", "price": 45, "cost": 27},
            
            # Adidas Inferior
            {"name": "Adidas Essentials Shorts", "brand": "Adidas", "type": "Short", "price": 35, "cost": 21},
            {"name": "Adidas 3-Stripes Joggers", "brand": "Adidas", "type": "Jogger", "price": 80, "cost": 48},
            {"name": "Adidas Tights", "brand": "Adidas", "type": "Calza", "price": 50, "cost": 30},
            {"name": "Adidas Track Pants", "brand": "Adidas", "type": "Pantalón", "price": 70, "cost": 42},
            {"name": "Adidas Training Shorts", "brand": "Adidas", "type": "Short", "price": 40, "cost": 24},
            
            # Puma Inferior
            {"name": "Puma Essential Shorts", "brand": "Puma", "type": "Short", "price": 32, "cost": 19},
            {"name": "Puma Classics Joggers", "brand": "Puma", "type": "Jogger", "price": 65, "cost": 39},
            {"name": "Puma Training Tights", "brand": "Puma", "type": "Calza", "price": 45, "cost": 27},
            {"name": "Puma Track Pants", "brand": "Puma", "type": "Pantalón", "price": 60, "cost": 36},
            
            # Under Armour Inferior
            {"name": "Under Armour HeatGear Shorts", "brand": "Under Armour", "type": "Short", "price": 45, "cost": 27},
            {"name": "Under Armour Rival Joggers", "brand": "Under Armour", "type": "Jogger", "price": 70, "cost": 42},
            {"name": "Under Armour HeatGear Leggings", "brand": "Under Armour", "type": "Calza", "price": 55, "cost": 33},
            
            # New Balance Inferior
            {"name": "New Balance Athletics Shorts", "brand": "New Balance", "type": "Short", "price": 38, "cost": 23},
            {"name": "New Balance Essentials Joggers", "brand": "New Balance", "type": "Jogger", "price": 62, "cost": 37},
            {"name": "New Balance Athletics Pants", "brand": "New Balance", "type": "Pantalón", "price": 65, "cost": 39},
            
            # Reebok Inferior
            {"name": "Reebok Training Shorts", "brand": "Reebok", "type": "Short", "price": 35, "cost": 21},
            {"name": "Reebok Classics Joggers", "brand": "Reebok", "type": "Jogger", "price": 58, "cost": 35},
            
            # Fila/Topper/Kappa
            {"name": "Fila Urban Shorts", "brand": "Fila", "type": "Short", "price": 28, "cost": 17},
            {"name": "Topper Training Shorts", "brand": "Topper", "type": "Short", "price": 25, "cost": 15},
            {"name": "Kappa Authentic Joggers", "brand": "Kappa", "type": "Jogger", "price": 48, "cost": 29}
        ]
        
        for i, item in enumerate(inferior_products, 1):
            product = Product(
                name=item["name"],
                description=f"{item['type']} {item['brand']} deportivo de alta calidad",
                sku=f"INF-{i:03d}",
                barcode=f"77890002{1000 + i}",
                category_id=inferior_cat.id,
                price=Decimal(str(item["price"])),
                cost=Decimal(str(item["cost"])),
                stock_quantity=0,  # Se maneja por talles
                min_stock=20,
                ecommerce_price=Decimal(str(item["price"] * 0.92)),  # 8% descuento online
                has_sizes=True,
                show_in_ecommerce=True
            )
            products.append(product)
        
        # ACCESORIOS DEPORTIVOS (20 productos) - SIN TALLES
        accesorios_products = [
            # Nike Accesorios
            {"name": "Nike Dri-FIT Cap", "brand": "Nike", "type": "Gorra", "price": 25, "cost": 15, "stock": 45},
            {"name": "Nike Everyday Socks (3-Pack)", "brand": "Nike", "type": "Medias", "price": 18, "cost": 10, "stock": 60},
            {"name": "Nike Brasilia Backpack", "brand": "Nike", "type": "Mochila", "price": 45, "cost": 28, "stock": 25},
            {"name": "Nike Training Gloves", "brand": "Nike", "type": "Guantes", "price": 35, "cost": 20, "stock": 30},
            
            # Adidas Accesorios
            {"name": "Adidas Trefoil Cap", "brand": "Adidas", "type": "Gorra", "price": 22, "cost": 13, "stock": 40},
            {"name": "Adidas Crew Socks (3-Pack)", "brand": "Adidas", "type": "Medias", "price": 16, "cost": 9, "stock": 55},
            {"name": "Adidas Classic Backpack", "brand": "Adidas", "type": "Mochila", "price": 40, "cost": 25, "stock": 30},
            {"name": "Adidas Training Gloves", "brand": "Adidas", "type": "Guantes", "price": 30, "cost": 18, "stock": 25},
            
            # Puma Accesorios
            {"name": "Puma Essential Cap", "brand": "Puma", "type": "Gorra", "price": 20, "cost": 12, "stock": 35},
            {"name": "Puma Crew Socks (3-Pack)", "brand": "Puma", "type": "Medias", "price": 15, "cost": 8, "stock": 50},
            {"name": "Puma Phase Backpack", "brand": "Puma", "type": "Mochila", "price": 35, "cost": 22, "stock": 28},
            
            # Under Armour Accesorios
            {"name": "Under Armour Blitzing Cap", "brand": "Under Armour", "type": "Gorra", "price": 28, "cost": 16, "stock": 30},
            {"name": "Under Armour Training Socks", "brand": "Under Armour", "type": "Medias", "price": 20, "cost": 12, "stock": 45},
            {"name": "Under Armour Storm Scrimmage Backpack", "brand": "Under Armour", "type": "Mochila", "price": 50, "cost": 32, "stock": 20},
            
            # New Balance Accesorios
            {"name": "New Balance Team Classic Cap", "brand": "New Balance", "type": "Gorra", "price": 25, "cost": 15, "stock": 25},
            {"name": "New Balance Performance Socks", "brand": "New Balance", "type": "Medias", "price": 18, "cost": 10, "stock": 40},
            
            # Otros Accesorios
            {"name": "Reebok Foundation Backpack", "brand": "Reebok", "type": "Mochila", "price": 32, "cost": 20, "stock": 22},
            {"name": "Fila Vintage Cap", "brand": "Fila", "type": "Gorra", "price": 18, "cost": 11, "stock": 35},
            {"name": "Topper Training Socks", "brand": "Topper", "type": "Medias", "price": 12, "cost": 7, "stock": 60},
            {"name": "Kappa Authentic Backpack", "brand": "Kappa", "type": "Mochila", "price": 30, "cost": 18, "stock": 25}
        ]
        
        for i, item in enumerate(accesorios_products, 1):
            product = Product(
                name=item["name"],
                description=f"{item['type']} {item['brand']} deportivo de alta calidad",
                sku=f"ACC-{i:03d}",
                barcode=f"77890003{1000 + i}",
                category_id=accesorios_cat.id,
                price=Decimal(str(item["price"])),
                cost=Decimal(str(item["cost"])),
                stock_quantity=item["stock"],  # Stock fijo para accesorios
                min_stock=10,
                ecommerce_price=Decimal(str(item["price"] * 0.90)),  # 10% descuento online
                has_sizes=False,
                show_in_ecommerce=True
            )
            products.append(product)
        
        # Insertar todos los productos
        for product in products:
            db.add(product)
        
        db.commit()
        
        print(f"✅ Creados {len(products)} productos deportivos")
        return products
        
    except Exception as e:
        print(f"❌ Error creando productos: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def create_product_sizes():
    """Crear talles y stock para productos que los requieren"""
    db = SessionLocal()
    try:
        print("📏 Creando talles y stock...")
        
        # Obtener sucursales
        branches = db.query(Branch).all()
        if len(branches) < 2:
            print("⚠️ Se necesitan al menos 2 sucursales para distribuir stock")
            return
        
        # Talles de calzado
        shoe_sizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
        # Talles de indumentaria
        clothing_sizes = ["XS", "S", "M", "L", "XL", "XXL"]
        
        # Obtener productos con talles
        products_with_sizes = db.query(Product).filter(Product.has_sizes == True).all()
        
        size_entries = []
        
        for product in products_with_sizes:
            # Determinar talles según categoría
            if "Calzado" in db.query(Category).filter(Category.id == product.category_id).first().name:
                sizes = shoe_sizes
            else:
                sizes = clothing_sizes
            
            # Crear talles para cada sucursal
            for branch in branches:
                for size in sizes:
                    # Stock aleatorio entre 3-15 unidades por talle
                    stock = random.randint(3, 15)
                    
                    size_entry = ProductSize(
                        product_id=product.id,
                        branch_id=branch.id,
                        size=size,
                        stock_quantity=stock
                    )
                    size_entries.append(size_entry)
        
        # Insertar todos los talles
        for size_entry in size_entries:
            db.add(size_entry)
        
        db.commit()
        
        print(f"✅ Creados {len(size_entries)} registros de talles y stock")
        
        # Actualizar stock_quantity de productos basado en suma de talles
        for product in products_with_sizes:
            total_stock = db.query(ProductSize).filter(
                ProductSize.product_id == product.id
            ).with_entities(
                func.sum(ProductSize.stock_quantity)
            ).scalar() or 0
            
            product.stock_quantity = total_stock
        
        db.commit()
        print("✅ Stock total actualizado en productos")
        
    except Exception as e:
        print(f"❌ Error creando talles: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def create_sportswear_data():
    """Función principal para crear todos los datos deportivos"""
    try:
        print("🏃 Iniciando carga de datos para tienda deportiva...")
        print("=" * 60)
        
        # Paso 1: Limpiar productos existentes
        clean_existing_products()
        
        # Paso 2: Crear categorías deportivas
        create_sportswear_categories()
        
        # Paso 3: Crear productos deportivos
        create_sportswear_products()
        
        # Paso 4: Crear talles y stock
        create_product_sizes()
        
        print("=" * 60)
        print("🎉 ¡Datos deportivos cargados exitosamente!")
        print("\n📊 Resumen de datos creados:")
        print("- 4 categorías deportivas")
        print("- ~100 productos deportivos multimarca")
        print("- Stock distribuido en talles por sucursal")
        print("- Productos habilitados para e-commerce")
        print("\n🛍️ Categorías creadas:")
        print("- Calzado Deportivo (30 productos con talles 35-45)")
        print("- Indumentaria Superior (25 productos con talles XS-XXL)")
        print("- Indumentaria Inferior (25 productos con talles XS-XXL)")
        print("- Accesorios Deportivos (20 productos sin talles)")
        print("\n🏷️ Marcas incluidas:")
        print("Nike, Adidas, Puma, Under Armour, New Balance,")
        print("Reebok, Fila, Topper, Kappa, Vans")
        
    except Exception as e:
        print(f"❌ Error en la carga de datos: {e}")
        raise

if __name__ == "__main__":
    create_sportswear_data()