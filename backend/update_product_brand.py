"""
Script para actualizar la marca de un producto específico.

Este script te permite actualizar la marca de productos existentes
que fueron creados antes de agregar el campo 'brand'.

Uso:
    python update_product_brand.py
"""

from database import SessionLocal
from app.models import Product

def update_product_brand():
    db = SessionLocal()
    try:
        # Listar todos los productos activos
        products = db.query(Product).filter(Product.is_active == True).all()

        print("\n=== PRODUCTOS ACTIVOS ===")
        print(f"{'ID':<5} {'SKU':<15} {'Nombre':<40} {'Marca':<20}")
        print("-" * 85)

        for product in products:
            brand_display = product.brand if product.brand else "(Sin marca)"
            print(f"{product.id:<5} {product.sku:<15} {product.name:<40} {brand_display:<20}")

        print("\n")

        # Solicitar ID del producto a actualizar
        product_id = input("Ingresa el ID del producto que deseas actualizar (o 'q' para salir): ")

        if product_id.lower() == 'q':
            print("Operación cancelada.")
            return

        try:
            product_id = int(product_id)
        except ValueError:
            print("❌ Error: Debes ingresar un número válido.")
            return

        # Buscar el producto
        product = db.query(Product).filter(Product.id == product_id).first()

        if not product:
            print(f"❌ Error: No se encontró ningún producto con ID {product_id}")
            return

        # Mostrar información actual
        print(f"\n📦 Producto seleccionado:")
        print(f"   - ID: {product.id}")
        print(f"   - Nombre: {product.name}")
        print(f"   - SKU: {product.sku}")
        print(f"   - Marca actual: {product.brand if product.brand else '(Sin marca)'}")

        # Solicitar nueva marca
        new_brand = input("\nIngresa la nueva marca (o presiona Enter para quitar la marca): ").strip()

        # Actualizar la marca
        product.brand = new_brand if new_brand else None
        db.commit()
        db.refresh(product)

        print(f"\n✅ Producto actualizado exitosamente!")
        print(f"   - Nueva marca: {product.brand if product.brand else '(Sin marca)'}")

    except Exception as e:
        print(f"\n❌ Error al actualizar el producto: {str(e)}")
        db.rollback()
    finally:
        db.close()

def batch_update_brands():
    """Actualizar marcas de múltiples productos en lote"""
    db = SessionLocal()
    try:
        print("\n=== ACTUALIZACIÓN EN LOTE ===")
        print("Formato: ID,Marca (ejemplo: 1,Nike)")
        print("Ingresa 'done' cuando termines")

        updates = []
        while True:
            entry = input("\nProducto ID,Marca: ").strip()

            if entry.lower() == 'done':
                break

            try:
                product_id, brand = entry.split(',', 1)
                product_id = int(product_id.strip())
                brand = brand.strip()
                updates.append((product_id, brand))
            except ValueError:
                print("❌ Formato inválido. Usa: ID,Marca")
                continue

        if not updates:
            print("No hay actualizaciones para procesar.")
            return

        # Procesar actualizaciones
        success_count = 0
        for product_id, brand in updates:
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                product.brand = brand if brand else None
                success_count += 1
                print(f"✅ Producto ID {product_id}: {product.name} -> Marca: {brand}")
            else:
                print(f"❌ Producto ID {product_id} no encontrado")

        db.commit()
        print(f"\n✅ Se actualizaron {success_count} productos exitosamente!")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 85)
    print(" ACTUALIZAR MARCAS DE PRODUCTOS ".center(85, "="))
    print("=" * 85)

    while True:
        print("\nOpciones:")
        print("1. Actualizar un producto")
        print("2. Actualización en lote")
        print("3. Salir")

        choice = input("\nSelecciona una opción: ").strip()

        if choice == "1":
            update_product_brand()
        elif choice == "2":
            batch_update_brands()
        elif choice == "3":
            print("\n👋 ¡Hasta luego!")
            break
        else:
            print("❌ Opción inválida. Por favor selecciona 1, 2 o 3.")
