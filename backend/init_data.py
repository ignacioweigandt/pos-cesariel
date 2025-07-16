from database import SessionLocal, engine, Base
from models import Branch, User, Category, Product, EcommerceConfig, UserRole
from auth import get_password_hash
from decimal import Decimal

def create_initial_data():
    # Crear tablas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar si ya existen datos
        if db.query(User).first():
            print("Data already exists, skipping initialization")
            return
        
        # Crear sucursales
        main_branch = Branch(
            name="Sucursal Principal",
            address="Av. Principal 123, Ciudad",
            phone="555-0123",
            email="principal@poscesariel.com"
        )
        
        secondary_branch = Branch(
            name="Sucursal Norte",
            address="Av. Norte 456, Ciudad",
            phone="555-0456",
            email="norte@poscesariel.com"
        )
        
        db.add(main_branch)
        db.add(secondary_branch)
        db.commit()
        db.refresh(main_branch)
        db.refresh(secondary_branch)
        
        # Crear usuarios
        admin_user = User(
            email="admin@poscesariel.com",
            username="admin",
            full_name="Administrador Principal",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        
        manager_user = User(
            email="manager@poscesariel.com",
            username="manager",
            full_name="Gerente Principal",
            hashed_password=get_password_hash("manager123"),
            role=UserRole.MANAGER,
            branch_id=main_branch.id
        )
        
        seller_user = User(
            email="seller@poscesariel.com",
            username="seller",
            full_name="Vendedor Principal",
            hashed_password=get_password_hash("seller123"),
            role=UserRole.SELLER,
            branch_id=main_branch.id
        )
        
        db.add(admin_user)
        db.add(manager_user)
        db.add(seller_user)
        db.commit()
        
        # Crear categorías
        electronics = Category(name="Electrónicos", description="Productos electrónicos")
        clothing = Category(name="Ropa", description="Vestimenta y accesorios")
        food = Category(name="Alimentos", description="Productos alimenticios")
        books = Category(name="Libros", description="Libros y material educativo")
        indumentaria = Category(name="Indumentaria", description="Ropa con talles (remeras, buzos, camperas, pantalones)")
        calzado = Category(name="Calzado", description="Zapatos, zapatillas y calzado en general")
        
        db.add(electronics)
        db.add(clothing)
        db.add(food)
        db.add(books)
        db.add(indumentaria)
        db.add(calzado)
        db.commit()
        db.refresh(electronics)
        db.refresh(clothing)
        db.refresh(food)
        db.refresh(books)
        db.refresh(indumentaria)
        db.refresh(calzado)
        
        # Crear productos
        products = [
            Product(
                name="Smartphone Samsung Galaxy",
                description="Teléfono inteligente con pantalla de 6.1 pulgadas",
                sku="PHONE-001",
                barcode="1234567890123",
                category_id=electronics.id,
                price=Decimal("299.99"),
                cost=Decimal("200.00"),
                stock_quantity=50,
                min_stock=10,
                ecommerce_price=Decimal("289.99")
            ),
            Product(
                name="Laptop Dell Inspiron",
                description="Laptop para uso profesional con procesador Intel i5",
                sku="LAPTOP-001",
                barcode="1234567890124",
                category_id=electronics.id,
                price=Decimal("699.99"),
                cost=Decimal("500.00"),
                stock_quantity=25,
                min_stock=5,
                ecommerce_price=Decimal("679.99")
            ),
            Product(
                name="Camiseta Polo",
                description="Camiseta polo de algodón 100%",
                sku="SHIRT-001",
                barcode="1234567890125",
                category_id=clothing.id,
                price=Decimal("29.99"),
                cost=Decimal("15.00"),
                stock_quantity=100,
                min_stock=20,
                ecommerce_price=Decimal("27.99")
            ),
            Product(
                name="Jeans Clásicos",
                description="Jeans de mezclilla para uso diario",
                sku="JEANS-001",
                barcode="1234567890126",
                category_id=clothing.id,
                price=Decimal("49.99"),
                cost=Decimal("25.00"),
                stock_quantity=75,
                min_stock=15,
                ecommerce_price=Decimal("44.99")
            ),
            Product(
                name="Café Premium",
                description="Café de origen colombiano, tostado medio",
                sku="COFFEE-001",
                barcode="1234567890127",
                category_id=food.id,
                price=Decimal("12.99"),
                cost=Decimal("6.00"),
                stock_quantity=200,
                min_stock=50,
                ecommerce_price=Decimal("11.99")
            ),
            Product(
                name="Libro: Programación en Python",
                description="Guía completa para aprender Python",
                sku="BOOK-001",
                barcode="1234567890128",
                category_id=books.id,
                price=Decimal("39.99"),
                cost=Decimal("20.00"),
                stock_quantity=30,
                min_stock=5,
                ecommerce_price=Decimal("35.99")
            ),
            Product(
                name="Remera Básica",
                description="Remera de algodón, disponible en varios talles",
                sku="REMERA-001",
                barcode="1234567890129",
                category_id=indumentaria.id,
                price=Decimal("25.99"),
                cost=Decimal("12.00"),
                stock_quantity=0,  # Stock se maneja por talles
                min_stock=10,
                ecommerce_price=Decimal("23.99"),
                has_sizes=True
            ),
            Product(
                name="Buzo con Capucha",
                description="Buzo cómodo con capucha para el frío",
                sku="BUZO-001",
                barcode="1234567890130",
                category_id=indumentaria.id,
                price=Decimal("45.99"),
                cost=Decimal("25.00"),
                stock_quantity=0,  # Stock se maneja por talles
                min_stock=5,
                ecommerce_price=Decimal("42.99"),
                has_sizes=True
            ),
            Product(
                name="Zapatillas Deportivas",
                description="Zapatillas para running y deportes",
                sku="ZAPATILLAS-001",
                barcode="1234567890131",
                category_id=calzado.id,
                price=Decimal("89.99"),
                cost=Decimal("45.00"),
                stock_quantity=0,  # Stock se maneja por talles
                min_stock=3,
                ecommerce_price=Decimal("84.99"),
                has_sizes=True
            ),
            Product(
                name="Zapatos Formales",
                description="Zapatos de cuero para ocasiones formales",
                sku="ZAPATOS-001",
                barcode="1234567890132",
                category_id=calzado.id,
                price=Decimal("120.99"),
                cost=Decimal("60.00"),
                stock_quantity=0,  # Stock se maneja por talles
                min_stock=2,
                ecommerce_price=Decimal("115.99"),
                has_sizes=True
            )
        ]
        
        for product in products:
            db.add(product)
        
        db.commit()
        
        # Crear configuración de e-commerce
        ecommerce_config = EcommerceConfig(
            store_name="POS Cesariel Online",
            store_description="Tienda en línea con productos de calidad",
            contact_email="tienda@poscesariel.com",
            contact_phone="555-0789",
            address="Av. Principal 123, Ciudad",
            tax_percentage=Decimal("12.0"),
            currency="USD"
        )
        
        db.add(ecommerce_config)
        db.commit()
        
        print("✅ Initial data created successfully!")
        print("\n🔑 Default users created:")
        print("- Admin: admin / admin123")
        print("- Manager: manager / manager123")
        print("- Seller: seller / seller123")
        print("\n📊 Sample data created:")
        print("- 2 branches")
        print("- 6 categories (including Indumentaria and Calzado)")
        print("- 10 products (4 with sizes for testing)")
        print("- E-commerce configuration")
        print("\n👕 Products with sizes for testing:")
        print("- Remera Básica (Indumentaria)")
        print("- Buzo con Capucha (Indumentaria)")
        print("- Zapatillas Deportivas (Calzado)")
        print("- Zapatos Formales (Calzado)")
        
    except Exception as e:
        print(f"❌ Error creating initial data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_data()