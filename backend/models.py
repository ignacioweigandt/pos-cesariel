from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SELLER = "SELLER"
    ECOMMERCE = "ECOMMERCE"

class SaleType(enum.Enum):
    POS = "POS"
    ECOMMERCE = "ECOMMERCE"

class OrderStatus(enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(200))
    phone = Column(String(20))
    email = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="branch")
    sales = relationship("Sale", back_populates="branch")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    branch = relationship("Branch", back_populates="users")
    sales = relationship("Sale", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    barcode = Column(String(50), unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    price = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(10, 2))
    stock_quantity = Column(Integer, default=0)
    min_stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    show_in_ecommerce = Column(Boolean, default=True)
    ecommerce_price = Column(Numeric(10, 2))
    image_url = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # New field for products with sizes
    has_sizes = Column(Boolean, default=False)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
    inventory_movements = relationship("InventoryMovement", back_populates="product")
    branch_stocks = relationship("BranchStock", back_populates="product")
    product_sizes = relationship("ProductSize", back_populates="product")
    product_images = relationship("ProductImage", back_populates="product")

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_number = Column(String(50), unique=True, index=True, nullable=False)
    sale_type = Column(Enum(SaleType), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    customer_name = Column(String(100))
    customer_email = Column(String(100))
    customer_phone = Column(String(20))
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50))
    order_status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    branch = relationship("Branch", back_populates="sales")
    user = relationship("User", back_populates="sales")
    sale_items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    size = Column(String(10))  # Para productos con talles
    
    # Relationships
    sale = relationship("Sale", back_populates="sale_items")
    product = relationship("Product", back_populates="sale_items")

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    movement_type = Column(String(20), nullable=False)  # IN, OUT, ADJUSTMENT
    quantity = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    reference_id = Column(Integer)  # ID de venta o compra relacionada
    reference_type = Column(String(20))  # SALE, PURCHASE, ADJUSTMENT
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="inventory_movements")

class EcommerceConfig(Base):
    __tablename__ = "ecommerce_config"
    
    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(100), nullable=False)
    store_description = Column(Text)
    store_logo = Column(String(255))
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    address = Column(String(200))
    is_active = Column(Boolean, default=True)
    tax_percentage = Column(Numeric(5, 2), default=0)
    currency = Column(String(10), default="USD")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class PaymentConfig(Base):
    __tablename__ = "payment_config"
    
    id = Column(Integer, primary_key=True, index=True)
    payment_type = Column(String(50), nullable=False)  # efectivo, tarjeta, transferencia
    card_type = Column(String(50))  # bancarizadas, no_bancarizadas, tarjeta_naranja
    installments = Column(Integer, default=1)
    surcharge_percentage = Column(Numeric(5, 2), default=0)
    is_active = Column(Boolean, default=True)
    description = Column(String(200))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class BranchStock(Base):
    __tablename__ = "branch_stock"
    
    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    min_stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    
    # Relationships
    branch = relationship("Branch")
    product = relationship("Product", back_populates="branch_stocks")
    
    # Unique constraint per branch-product combination
    __table_args__ = (
        {"extend_existing": True},
    )

class ProductSize(Base):
    __tablename__ = "product_sizes"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    size = Column(String(10), nullable=False)  # XS, S, M, L, XL, XXL, 35, 36, etc.
    stock_quantity = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="product_sizes")
    branch = relationship("Branch")
    
    # Unique constraint per product-branch-size combination
    __table_args__ = (
        {"extend_existing": True},
    )

class ImportLog(Base):
    __tablename__ = "import_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_rows = Column(Integer, default=0)
    successful_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    status = Column(String(20), default="PROCESSING")  # PROCESSING, COMPLETED, FAILED
    error_details = Column(Text)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User")

class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    image_order = Column(Integer, default=1)  # 1, 2, 3 for ordering
    alt_text = Column(String(255))
    is_main = Column(Boolean, default=False)  # Primary product image
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="product_images")
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )

class StoreBanner(Base):
    __tablename__ = "store_banners"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300))
    image_url = Column(String(500), nullable=False)
    link_url = Column(String(500))
    button_text = Column(String(100))
    banner_order = Column(Integer, default=1)  # 1, 2, 3 for ordering
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )

class WhatsAppSale(Base):
    __tablename__ = "whatsapp_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    customer_whatsapp = Column(String(20), nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_address = Column(Text)
    shipping_method = Column(String(50))  # pickup, delivery, shipping
    shipping_cost = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    whatsapp_chat_url = Column(String(500))  # Generated WhatsApp chat URL
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    sale = relationship("Sale")
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )

class SocialMediaConfig(Base):
    __tablename__ = "social_media_config"
    
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)  # facebook, instagram, twitter, whatsapp, etc.
    username = Column(String(100))
    url = Column(String(500))
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )

class WhatsAppConfig(Base):
    __tablename__ = "whatsapp_config"
    
    id = Column(Integer, primary_key=True, index=True)
    business_phone = Column(String(20), nullable=False)  # Número de WhatsApp empresarial
    business_name = Column(String(100), nullable=False)  # Nombre del negocio
    welcome_message = Column(Text)  # Mensaje de bienvenida personalizado
    business_hours = Column(String(200))  # Horarios de atención
    auto_response_enabled = Column(Boolean, default=False)  # Respuesta automática
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())