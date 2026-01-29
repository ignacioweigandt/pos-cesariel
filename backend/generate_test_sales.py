"""
Generate Test Sales Data

Creates realistic sales data for testing the Reports module.
Run inside Docker container: docker compose exec backend python generate_test_sales.py
"""

import random
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

from database import SessionLocal
from app.models import Sale, SaleItem, Product, Branch, User, SaleType, OrderStatus


def generate_sale_number(sale_type: SaleType, timestamp: datetime) -> str:
    """Generate unique sale number based on type and timestamp."""
    prefix_map = {
        SaleType.POS: "POS",
        SaleType.ECOMMERCE: "ECM"
    }
    prefix = prefix_map.get(sale_type, "POS")
    date_str = timestamp.strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=8))
    return f"{prefix}-{date_str}-{random_suffix}"


def generate_test_sales(db: Session, num_sales: int = 80):
    """
    Generate test sales data.
    
    Args:
        db: Database session
        num_sales: Number of sales to generate (default: 80)
    """
    print(f"🚀 Generando {num_sales} ventas de prueba...")
    
    # Get available data
    products = db.query(Product).filter(Product.is_active == True).all()
    branches = db.query(Branch).filter(Branch.is_active == True).all()
    users = db.query(User).all()
    
    if not products:
        print("❌ Error: No hay productos activos en la base de datos")
        return
    
    if not branches:
        print("❌ Error: No hay sucursales activas en la base de datos")
        return
    
    if not users:
        print("❌ Error: No hay usuarios en la base de datos")
        return
    
    print(f"✅ Encontrados: {len(products)} productos, {len(branches)} sucursales, {len(users)} usuarios")
    
    # Payment methods (realistic distribution)
    payment_methods = [
        ("Efectivo", 0.35),      # 35%
        ("Tarjeta de Crédito", 0.30),  # 30%
        ("Tarjeta de Débito", 0.20),   # 20%
        ("Transferencia", 0.10),       # 10%
        ("MercadoPago", 0.05)          # 5%
    ]
    
    # Sale types (realistic distribution)
    sale_types = [
        (SaleType.POS, 0.70),         # 70% POS
        (SaleType.ECOMMERCE, 0.30)    # 30% E-commerce
    ]
    
    # Generate sales over the last 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    sales_created = 0
    
    for i in range(num_sales):
        try:
            # Random timestamp within last 30 days
            days_ago = random.randint(0, 30)
            hours = random.randint(8, 20)  # Business hours 8am-8pm
            minutes = random.randint(0, 59)
            
            sale_datetime = end_date - timedelta(days=days_ago, hours=24-hours, minutes=minutes)
            
            # Select sale type based on distribution
            sale_type = random.choices(
                [st[0] for st in sale_types],
                weights=[st[1] for st in sale_types]
            )[0]
            
            # Select payment method based on distribution
            payment_method = random.choices(
                [pm[0] for pm in payment_methods],
                weights=[pm[1] for pm in payment_methods]
            )[0]
            
            # Random branch and user
            branch = random.choice(branches)
            user = random.choice(users)
            
            # Generate sale number
            sale_number = generate_sale_number(sale_type, sale_datetime)
            
            # Random number of items (1-4)
            num_items = random.randint(1, min(4, len(products)))
            selected_products = random.sample(products, num_items)
            
            # Calculate totals
            subtotal = Decimal(0)
            items = []
            
            for product in selected_products:
                quantity = random.randint(1, 3)
                unit_price = product.price
                total_price = unit_price * quantity
                
                items.append({
                    'product': product,
                    'quantity': quantity,
                    'unit_price': unit_price,
                    'total_price': total_price
                })
                
                subtotal += total_price
            
            # Tax (21% IVA for Argentina)
            tax_rate = Decimal("0.21")
            tax_amount = subtotal * tax_rate
            
            # Random discount (0-20%)
            discount_percent = random.choice([0, 0, 0, 5, 10, 15, 20])  # Most sales have no discount
            discount_amount = subtotal * Decimal(discount_percent) / Decimal(100)
            
            total_amount = subtotal + tax_amount - discount_amount
            
            # Customer data (for E-commerce)
            customer_name = None
            customer_email = None
            customer_phone = None
            
            if sale_type == SaleType.ECOMMERCE:
                first_names = ["Juan", "María", "Carlos", "Ana", "Luis", "Laura", "Pedro", "Sofía"]
                last_names = ["García", "Rodríguez", "Martínez", "López", "González", "Pérez"]
                customer_name = f"{random.choice(first_names)} {random.choice(last_names)}"
                customer_email = f"{customer_name.lower().replace(' ', '.')}@email.com"
                customer_phone = f"+54911{random.randint(10000000, 99999999)}"
            
            # Order status (most delivered, some pending)
            if sale_type == SaleType.ECOMMERCE:
                order_status = random.choices(
                    [OrderStatus.DELIVERED, OrderStatus.PENDING, OrderStatus.PROCESSING],
                    weights=[0.7, 0.2, 0.1]
                )[0]
            else:
                order_status = OrderStatus.DELIVERED
            
            # Create sale
            sale = Sale(
                sale_number=sale_number,
                sale_type=sale_type,
                branch_id=branch.id,
                user_id=user.id,
                customer_name=customer_name,
                customer_email=customer_email,
                customer_phone=customer_phone,
                subtotal=subtotal,
                tax_amount=tax_amount,
                discount_amount=discount_amount,
                total_amount=total_amount,
                payment_method=payment_method,
                order_status=order_status,
                created_at=sale_datetime
            )
            
            db.add(sale)
            db.flush()  # Get sale.id
            
            # Create sale items
            for item_data in items:
                sale_item = SaleItem(
                    sale_id=sale.id,
                    product_id=item_data['product'].id,
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price'],
                    total_price=item_data['total_price']
                )
                db.add(sale_item)
            
            sales_created += 1
            
            if (i + 1) % 10 == 0:
                print(f"✅ Generadas {i + 1}/{num_sales} ventas...")
        
        except Exception as e:
            print(f"❌ Error creando venta {i + 1}: {str(e)}")
            db.rollback()
            continue
    
    # Commit all sales
    try:
        db.commit()
        print(f"\n🎉 ¡Éxito! Se crearon {sales_created} ventas de prueba")
        
        # Show summary
        total_sales = db.query(Sale).count()
        total_revenue = db.query(Sale).filter(
            Sale.order_status != OrderStatus.CANCELLED
        ).with_entities(
            Sale.total_amount
        ).all()
        
        revenue_sum = sum(sale[0] for sale in total_revenue if sale[0])
        
        print(f"\n📊 RESUMEN:")
        print(f"   Total ventas en BD: {total_sales}")
        print(f"   Revenue total: ${revenue_sum:,.2f}")
        print(f"   Promedio por venta: ${revenue_sum / total_sales if total_sales > 0 else 0:,.2f}")
        
        # Distribution by sale type
        print(f"\n📈 Distribución por canal:")
        for sale_type in [SaleType.POS, SaleType.ECOMMERCE]:
            count = db.query(Sale).filter(Sale.sale_type == sale_type).count()
            percentage = (count / total_sales * 100) if total_sales > 0 else 0
            print(f"   {sale_type.value}: {count} ventas ({percentage:.1f}%)")
        
    except Exception as e:
        print(f"❌ Error al commitear: {str(e)}")
        db.rollback()


def main():
    """Main function."""
    print("=" * 60)
    print("🏪 GENERADOR DE VENTAS DE PRUEBA - POS Cesariel")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Check current sales count
        current_sales = db.query(Sale).count()
        print(f"\n📊 Ventas actuales en BD: {current_sales}")
        
        if current_sales > 50:
            response = input(f"\n⚠️  Ya hay {current_sales} ventas. ¿Deseas agregar más? (s/n): ")
            if response.lower() != 's':
                print("❌ Operación cancelada")
                return
        
        # Generate sales
        num_sales = 80
        generate_test_sales(db, num_sales)
        
    except KeyboardInterrupt:
        print("\n\n❌ Operación cancelada por el usuario")
        db.rollback()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()
        print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
