import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from models import (
    User, Branch, Category, Product, Sale, SaleItem, 
    InventoryMovement, PaymentConfig, EcommerceConfig,
    ProductImage, StoreBanner, WhatsAppSale
)
from auth import get_password_hash


@pytest.mark.unit
class TestUserModel:
    """Test User model functionality."""
    
    def test_create_user(self, db_session, test_branch):
        """Test user creation with valid data."""
        user = User(
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            hashed_password=get_password_hash("password123"),
            role="SELLER",
            branch_id=test_branch.id,
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.role == "SELLER"
        assert user.is_active is True
        assert user.branch_id == test_branch.id
    
    def test_user_unique_constraints(self, db_session, test_branch):
        """Test that email and username must be unique."""
        user1 = User(
            email="test@example.com",
            username="testuser",
            full_name="Test User 1",
            hashed_password=get_password_hash("password123"),
            role="SELLER",
            branch_id=test_branch.id
        )
        db_session.add(user1)
        db_session.commit()
        
        # Try to create another user with same email
        user2 = User(
            email="test@example.com",  # Same email
            username="different",
            full_name="Test User 2",
            hashed_password=get_password_hash("password123"),
            role="SELLER",
            branch_id=test_branch.id
        )
        db_session.add(user2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_role_validation(self, db_session, test_branch):
        """Test user role validation."""
        valid_roles = ["ADMIN", "MANAGER", "SELLER", "ECOMMERCE"]
        
        for role in valid_roles:
            user = User(
                email=f"test_{role.lower()}@example.com",
                username=f"test_{role.lower()}",
                full_name=f"Test {role}",
                hashed_password=get_password_hash("password123"),
                role=role,
                branch_id=test_branch.id
            )
            db_session.add(user)
            db_session.commit()
            assert user.role == role
            
            # Clean up for next iteration
            db_session.delete(user)
            db_session.commit()


@pytest.mark.unit
class TestBranchModel:
    """Test Branch model functionality."""
    
    def test_create_branch(self, db_session):
        """Test branch creation with valid data."""
        branch = Branch(
            name="Test Branch",
            address="123 Test Street",
            phone="555-0123",
            email="test@branch.com"
        )
        db_session.add(branch)
        db_session.commit()
        
        assert branch.id is not None
        assert branch.name == "Test Branch"
        assert branch.address == "123 Test Street"
        assert branch.phone == "555-0123"
        assert branch.email == "test@branch.com"
        assert branch.is_active is True  # Default value
    
    def test_branch_name_required(self, db_session):
        """Test that branch name is required."""
        branch = Branch(
            address="123 Test Street",
            phone="555-0123"
        )
        db_session.add(branch)
        
        with pytest.raises(IntegrityError):
            db_session.commit()


@pytest.mark.unit
class TestCategoryModel:
    """Test Category model functionality."""
    
    def test_create_category(self, db_session):
        """Test category creation with valid data."""
        category = Category(
            name="Test Category",
            description="A test category"
        )
        db_session.add(category)
        db_session.commit()
        
        assert category.id is not None
        assert category.name == "Test Category"
        assert category.description == "A test category"
        assert category.is_active is True  # Default value
    
    def test_category_name_unique(self, db_session):
        """Test that category names must be unique."""
        category1 = Category(name="Unique Category", description="First")
        db_session.add(category1)
        db_session.commit()
        
        category2 = Category(name="Unique Category", description="Second")
        db_session.add(category2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()


@pytest.mark.unit
class TestProductModel:
    """Test Product model functionality."""
    
    def test_create_product(self, db_session, test_category):
        """Test product creation with valid data."""
        product = Product(
            name="Test Product",
            description="A test product",
            sku="TEST001",
            barcode="1234567890",
            category_id=test_category.id,
            price=10.99,
            cost=5.50,
            stock_quantity=100,
            min_stock=10
        )
        db_session.add(product)
        db_session.commit()
        
        assert product.id is not None
        assert product.name == "Test Product"
        assert product.sku == "TEST001"
        assert product.price == 10.99
        assert product.stock_quantity == 100
        assert product.is_active is True  # Default value
        assert product.show_in_ecommerce is False  # Default value
        assert product.has_sizes is False  # Default value
    
    def test_product_sku_unique(self, db_session, test_category):
        """Test that product SKUs must be unique."""
        product1 = Product(
            name="Product 1",
            sku="UNIQUE001",
            category_id=test_category.id,
            price=10.99
        )
        db_session.add(product1)
        db_session.commit()
        
        product2 = Product(
            name="Product 2",
            sku="UNIQUE001",  # Same SKU
            category_id=test_category.id,
            price=15.99
        )
        db_session.add(product2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_product_with_sizes(self, db_session, test_category):
        """Test product with sizes enabled."""
        product = Product(
            name="T-Shirt",
            sku="TSHIRT001",
            category_id=test_category.id,
            price=25.99,
            has_sizes=True,
            stock_quantity=0  # Stock managed per size
        )
        db_session.add(product)
        db_session.commit()
        
        assert product.has_sizes is True
        assert product.stock_quantity == 0


@pytest.mark.unit
class TestSaleModel:
    """Test Sale model functionality."""
    
    def test_create_sale(self, db_session, test_admin_user):
        """Test sale creation with valid data."""
        sale = Sale(
            sale_number="SALE-001",
            sale_type="POS",
            customer_name="John Doe",
            customer_phone="+1234567890",
            payment_method="CASH",
            subtotal=100.00,
            tax_amount=21.00,
            total_amount=121.00,
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        db_session.add(sale)
        db_session.commit()
        
        assert sale.id is not None
        assert sale.sale_number == "SALE-001"
        assert sale.sale_type == "POS"
        assert sale.total_amount == 121.00
        assert sale.status == "COMPLETED"  # Default value
    
    def test_sale_number_unique(self, db_session, test_admin_user):
        """Test that sale numbers must be unique."""
        sale1 = Sale(
            sale_number="UNIQUE-001",
            sale_type="POS",
            payment_method="CASH",
            total_amount=100.00,
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        db_session.add(sale1)
        db_session.commit()
        
        sale2 = Sale(
            sale_number="UNIQUE-001",  # Same number
            sale_type="ECOMMERCE",
            payment_method="CARD",
            total_amount=200.00,
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        db_session.add(sale2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()


@pytest.mark.unit
class TestSaleItemModel:
    """Test SaleItem model functionality."""
    
    def test_create_sale_item(self, db_session, test_admin_user, test_product):
        """Test sale item creation with valid data."""
        # Create a sale first
        sale = Sale(
            sale_number="SALE-002",
            sale_type="POS",
            payment_method="CASH",
            total_amount=10.99,
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        db_session.add(sale)
        db_session.commit()
        
        # Create sale item
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=test_product.id,
            quantity=2,
            unit_price=10.99,
            total_price=21.98
        )
        db_session.add(sale_item)
        db_session.commit()
        
        assert sale_item.id is not None
        assert sale_item.sale_id == sale.id
        assert sale_item.product_id == test_product.id
        assert sale_item.quantity == 2
        assert sale_item.unit_price == 10.99
        assert sale_item.total_price == 21.98
    
    def test_sale_item_with_size(self, db_session, test_admin_user, test_product):
        """Test sale item with size specification."""
        # Create a sale first
        sale = Sale(
            sale_number="SALE-003",
            sale_type="POS",
            payment_method="CASH",
            total_amount=25.99,
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        db_session.add(sale)
        db_session.commit()
        
        # Create sale item with size
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=test_product.id,
            quantity=1,
            unit_price=25.99,
            total_price=25.99,
            size="M"
        )
        db_session.add(sale_item)
        db_session.commit()
        
        assert sale_item.size == "M"


@pytest.mark.unit
class TestInventoryMovementModel:
    """Test InventoryMovement model functionality."""
    
    def test_create_inventory_movement(self, db_session, test_product, test_admin_user):
        """Test inventory movement creation."""
        movement = InventoryMovement(
            product_id=test_product.id,
            movement_type="SALE",
            quantity=-2,
            description="Sale of 2 units",
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        db_session.add(movement)
        db_session.commit()
        
        assert movement.id is not None
        assert movement.product_id == test_product.id
        assert movement.movement_type == "SALE"
        assert movement.quantity == -2
        assert movement.description == "Sale of 2 units"


@pytest.mark.unit
class TestPaymentConfigModel:
    """Test PaymentConfig model functionality."""
    
    def test_create_payment_config(self, db_session):
        """Test payment config creation."""
        config = PaymentConfig(
            payment_type="CARD",
            card_type="BANCARIZADA",
            installments=3,
            surcharge_percentage=5.0
        )
        db_session.add(config)
        db_session.commit()
        
        assert config.id is not None
        assert config.payment_type == "CARD"
        assert config.card_type == "BANCARIZADA"
        assert config.installments == 3
        assert config.surcharge_percentage == 5.0
        assert config.is_active is True  # Default value


@pytest.mark.unit
class TestEcommerceConfigModel:
    """Test EcommerceConfig model functionality."""
    
    def test_create_ecommerce_config(self, db_session):
        """Test e-commerce config creation."""
        config = EcommerceConfig(
            store_name="Test Store",
            store_description="A test e-commerce store",
            contact_email="contact@teststore.com",
            contact_phone="+1234567890",
            currency="ARS",
            tax_rate=21.0
        )
        db_session.add(config)
        db_session.commit()
        
        assert config.id is not None
        assert config.store_name == "Test Store"
        assert config.currency == "ARS"
        assert config.tax_rate == 21.0
        assert config.is_active is True  # Default value


@pytest.mark.unit
class TestProductImageModel:
    """Test ProductImage model functionality."""
    
    def test_create_product_image(self, db_session, test_product):
        """Test product image creation."""
        image = ProductImage(
            product_id=test_product.id,
            image_url="https://example.com/image.jpg",
            alt_text="Test product image",
            is_main=True,
            image_order=1
        )
        db_session.add(image)
        db_session.commit()
        
        assert image.id is not None
        assert image.product_id == test_product.id
        assert image.image_url == "https://example.com/image.jpg"
        assert image.is_main is True
        assert image.image_order == 1


@pytest.mark.unit
class TestStoreBannerModel:
    """Test StoreBanner model functionality."""
    
    def test_create_store_banner(self, db_session):
        """Test store banner creation."""
        banner = StoreBanner(
            title="Test Banner",
            subtitle="Test Subtitle",
            image_url="https://example.com/banner.jpg",
            link_url="https://example.com/sale",
            button_text="Shop Now",
            is_active=True,
            order=1
        )
        db_session.add(banner)
        db_session.commit()
        
        assert banner.id is not None
        assert banner.title == "Test Banner"
        assert banner.subtitle == "Test Subtitle"
        assert banner.is_active is True
        assert banner.order == 1


@pytest.mark.unit
class TestWhatsAppSaleModel:
    """Test WhatsAppSale model functionality."""
    
    def test_create_whatsapp_sale(self, db_session):
        """Test WhatsApp sale creation."""
        whatsapp_sale = WhatsAppSale(
            customer_name="John WhatsApp",
            customer_whatsapp="+1234567890",
            customer_address="123 Test Street",
            shipping_method="delivery",
            total_amount=150.00,
            status="pending",
            notes="Customer prefers morning delivery"
        )
        db_session.add(whatsapp_sale)
        db_session.commit()
        
        assert whatsapp_sale.id is not None
        assert whatsapp_sale.customer_name == "John WhatsApp"
        assert whatsapp_sale.customer_whatsapp == "+1234567890"
        assert whatsapp_sale.status == "pending"
        assert whatsapp_sale.total_amount == 150.00


@pytest.mark.unit
class TestModelRelationships:
    """Test model relationships and foreign keys."""
    
    def test_user_branch_relationship(self, db_session, test_branch):
        """Test user-branch relationship."""
        user = User(
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            hashed_password=get_password_hash("password123"),
            role="SELLER",
            branch_id=test_branch.id
        )
        db_session.add(user)
        db_session.commit()
        
        # Test relationship
        assert user.branch.id == test_branch.id
        assert user.branch.name == test_branch.name
    
    def test_product_category_relationship(self, db_session, test_category):
        """Test product-category relationship."""
        product = Product(
            name="Test Product",
            sku="TEST001",
            category_id=test_category.id,
            price=10.99
        )
        db_session.add(product)
        db_session.commit()
        
        # Test relationship
        assert product.category.id == test_category.id
        assert product.category.name == test_category.name
    
    def test_sale_items_relationship(self, db_session, test_admin_user, test_product):
        """Test sale-items relationship."""
        sale = Sale(
            sale_number="SALE-004",
            sale_type="POS",
            payment_method="CASH",
            total_amount=32.97,
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        db_session.add(sale)
        db_session.commit()
        
        # Add sale items
        for i in range(3):
            item = SaleItem(
                sale_id=sale.id,
                product_id=test_product.id,
                quantity=1,
                unit_price=10.99,
                total_price=10.99
            )
            db_session.add(item)
        
        db_session.commit()
        
        # Test relationship
        assert len(sale.items) == 3
        for item in sale.items:
            assert item.sale_id == sale.id
            assert item.product.id == test_product.id