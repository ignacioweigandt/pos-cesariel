"""
Advanced test configuration and fixtures for comprehensive testing.
This file extends the basic conftest.py with additional fixtures for complex scenarios.
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock
from typing import List, Dict, Any
from datetime import datetime, timedelta

from models import (
    Product, Sale, SaleItem, InventoryMovement, 
    PaymentConfig, EcommerceConfig, ProductImage, 
    StoreBanner, ProductSize, WhatsAppSale
)


@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        "name": "Test Product Advanced",
        "description": "Advanced test product with full features",
        "sku": "ADV-TEST-001",
        "barcode": "1234567890123",
        "price": 25.99,
        "cost": 12.50,
        "stock_quantity": 50,
        "min_stock": 10,
        "is_active": True,
        "show_in_ecommerce": True,
        "has_sizes": False
    }


@pytest.fixture
def sample_sale_data():
    """Sample sale data for testing."""
    return {
        "sale_type": "POS",
        "customer_name": "Test Customer",
        "customer_phone": "+1234567890",
        "payment_method": "CASH",
        "notes": "Test sale notes"
    }


@pytest.fixture
def multiple_products(db_session, test_category):
    """Create multiple test products with different configurations."""
    products = []
    
    # Regular product
    product1 = Product(
        name="Regular Product",
        sku="REG-001",
        category_id=test_category.id,
        price=10.99,
        stock_quantity=100,
        is_active=True,
        show_in_ecommerce=True
    )
    
    # Expensive product
    product2 = Product(
        name="Premium Product",
        sku="PREM-001",
        category_id=test_category.id,
        price=99.99,
        stock_quantity=10,
        is_active=True,
        show_in_ecommerce=True
    )
    
    # Product with sizes
    product3 = Product(
        name="Sized Product",
        sku="SIZE-001",
        category_id=test_category.id,
        price=25.99,
        stock_quantity=0,  # Stock managed by sizes
        has_sizes=True,
        is_active=True,
        show_in_ecommerce=True
    )
    
    # Inactive product
    product4 = Product(
        name="Inactive Product",
        sku="INACT-001",
        category_id=test_category.id,
        price=15.99,
        stock_quantity=50,
        is_active=False,
        show_in_ecommerce=False
    )
    
    products = [product1, product2, product3, product4]
    
    for product in products:
        db_session.add(product)
    
    db_session.commit()
    
    # Refresh to get IDs
    for product in products:
        db_session.refresh(product)
    
    return products


@pytest.fixture
def product_with_full_data(db_session, test_category):
    """Create a product with complete data including images."""
    product = Product(
        name="Full Data Product",
        description="Product with complete test data",
        sku="FULL-001",
        barcode="1111111111111",
        category_id=test_category.id,
        price=35.99,
        cost=18.00,
        stock_quantity=25,
        min_stock=5,
        is_active=True,
        show_in_ecommerce=True,
        has_sizes=False
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    
    # Add images
    images = [
        ProductImage(
            product_id=product.id,
            image_url="https://example.com/image1.jpg",
            alt_text="Main product image",
            is_main=True,
            image_order=1
        ),
        ProductImage(
            product_id=product.id,
            image_url="https://example.com/image2.jpg",
            alt_text="Secondary product image",
            is_main=False,
            image_order=2
        )
    ]
    
    for image in images:
        db_session.add(image)
    
    db_session.commit()
    
    return product


@pytest.fixture
def product_sizes_data(db_session, test_product_with_sizes, test_branch, test_branch_secondary):
    """Create product size data for testing."""
    sizes_data = [
        # Branch 1 sizes
        ProductSize(
            product_id=test_product_with_sizes.id,
            branch_id=test_branch.id,
            size="S",
            stock_quantity=10
        ),
        ProductSize(
            product_id=test_product_with_sizes.id,
            branch_id=test_branch.id,
            size="M",
            stock_quantity=15
        ),
        ProductSize(
            product_id=test_product_with_sizes.id,
            branch_id=test_branch.id,
            size="L",
            stock_quantity=8
        ),
        # Branch 2 sizes
        ProductSize(
            product_id=test_product_with_sizes.id,
            branch_id=test_branch_secondary.id,
            size="S",
            stock_quantity=5
        ),
        ProductSize(
            product_id=test_product_with_sizes.id,
            branch_id=test_branch_secondary.id,
            size="M",
            stock_quantity=12
        ),
        ProductSize(
            product_id=test_product_with_sizes.id,
            branch_id=test_branch_secondary.id,
            size="L",
            stock_quantity=3
        )
    ]
    
    for size in sizes_data:
        db_session.add(size)
    
    db_session.commit()
    
    return sizes_data


@pytest.fixture
def complete_sale_with_items(db_session, test_admin_user, multiple_products):
    """Create a complete sale with multiple items."""
    sale = Sale(
        sale_number="COMP-SALE-001",
        sale_type="POS",
        customer_name="Complete Test Customer",
        customer_phone="+1234567890",
        payment_method="CARD",
        subtotal=136.97,
        tax_amount=28.76,
        total_amount=165.73,
        user_id=test_admin_user.id,
        branch_id=test_admin_user.branch_id,
        notes="Complete test sale with multiple items"
    )
    db_session.add(sale)
    db_session.commit()
    db_session.refresh(sale)
    
    # Add sale items
    items = [
        SaleItem(
            sale_id=sale.id,
            product_id=multiple_products[0].id,  # Regular product
            quantity=2,
            unit_price=10.99,
            total_price=21.98
        ),
        SaleItem(
            sale_id=sale.id,
            product_id=multiple_products[1].id,  # Premium product
            quantity=1,
            unit_price=99.99,
            total_price=99.99
        ),
        SaleItem(
            sale_id=sale.id,
            product_id=multiple_products[2].id,  # Sized product
            quantity=1,
            unit_price=25.99,
            total_price=25.99,
            size="M"
        )
    ]
    
    for item in items:
        db_session.add(item)
    
    db_session.commit()
    
    return sale


@pytest.fixture
def payment_configs(db_session):
    """Create sample payment configurations."""
    configs = [
        PaymentConfig(
            payment_type="CARD",
            card_type="BANCARIZADA",
            installments=1,
            surcharge_percentage=0.0,
            is_active=True
        ),
        PaymentConfig(
            payment_type="CARD",
            card_type="BANCARIZADA",
            installments=3,
            surcharge_percentage=5.0,
            is_active=True
        ),
        PaymentConfig(
            payment_type="CARD",
            card_type="NO_BANCARIZADA",
            installments=1,
            surcharge_percentage=3.0,
            is_active=True
        ),
        PaymentConfig(
            payment_type="CARD",
            card_type="TARJETA_NARANJA",
            installments=6,
            surcharge_percentage=8.0,
            is_active=True
        )
    ]
    
    for config in configs:
        db_session.add(config)
    
    db_session.commit()
    
    return configs


@pytest.fixture
def ecommerce_config(db_session):
    """Create complete e-commerce configuration."""
    config = EcommerceConfig(
        store_name="Test E-commerce Store",
        store_description="Complete test store configuration",
        store_logo_url="https://example.com/logo.png",
        contact_email="test@store.com",
        contact_phone="+1234567890",
        business_phone="+1234567890",
        whatsapp_enabled=True,
        currency="ARS",
        tax_rate=21.0,
        is_active=True
    )
    db_session.add(config)
    db_session.commit()
    db_session.refresh(config)
    
    return config


@pytest.fixture
def store_banners(db_session):
    """Create test store banners."""
    banners = [
        StoreBanner(
            title="Welcome Banner",
            subtitle="Welcome to our store",
            image_url="https://example.com/banner1.jpg",
            link_url="https://example.com/welcome",
            button_text="Shop Now",
            is_active=True,
            order=1
        ),
        StoreBanner(
            title="Sale Banner",
            subtitle="50% off selected items",
            image_url="https://example.com/banner2.jpg",
            link_url="https://example.com/sale",
            button_text="View Sale",
            is_active=True,
            order=2
        ),
        StoreBanner(
            title="Inactive Banner",
            subtitle="This banner is not active",
            image_url="https://example.com/banner3.jpg",
            link_url="https://example.com/inactive",
            button_text="Click Here",
            is_active=False,
            order=3
        )
    ]
    
    for banner in banners:
        db_session.add(banner)
    
    db_session.commit()
    
    return banners


@pytest.fixture
def whatsapp_sales(db_session):
    """Create test WhatsApp sales."""
    sales = [
        WhatsAppSale(
            customer_name="WhatsApp Customer 1",
            customer_whatsapp="+1111111111",
            customer_address="123 WhatsApp Street",
            shipping_method="delivery",
            total_amount=150.00,
            status="pending",
            notes="Delivery after 3 PM"
        ),
        WhatsAppSale(
            customer_name="WhatsApp Customer 2",
            customer_whatsapp="+2222222222",
            customer_address="456 Chat Avenue",
            shipping_method="pickup",
            total_amount=75.50,
            status="confirmed",
            notes="Customer will pick up tomorrow"
        )
    ]
    
    for sale in sales:
        db_session.add(sale)
    
    db_session.commit()
    
    return sales


@pytest.fixture
def inventory_movements(db_session, test_product, test_admin_user):
    """Create test inventory movements."""
    movements = [
        InventoryMovement(
            product_id=test_product.id,
            movement_type="ADJUSTMENT",
            quantity=10,
            description="Initial stock adjustment",
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        ),
        InventoryMovement(
            product_id=test_product.id,
            movement_type="SALE",
            quantity=-2,
            description="Sale of 2 units",
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        ),
        InventoryMovement(
            product_id=test_product.id,
            movement_type="RETURN",
            quantity=1,
            description="Customer return",
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
    ]
    
    for movement in movements:
        db_session.add(movement)
    
    db_session.commit()
    
    return movements


@pytest.fixture
def mock_cloudinary():
    """Mock Cloudinary operations for testing."""
    mock = Mock()
    mock.uploader = Mock()
    mock.uploader.upload = Mock(return_value={
        'public_id': 'test_image_id',
        'secure_url': 'https://res.cloudinary.com/test/image/upload/test_image_id.jpg',
        'width': 800,
        'height': 600,
        'format': 'jpg'
    })
    mock.uploader.destroy = Mock(return_value={'result': 'ok'})
    
    return mock


@pytest.fixture
def mock_file_upload():
    """Mock file upload for testing."""
    mock_file = Mock()
    mock_file.filename = "test_image.jpg"
    mock_file.content_type = "image/jpeg"
    mock_file.file = Mock()
    mock_file.file.read = Mock(return_value=b"fake image data")
    mock_file.size = 1024
    
    return mock_file


@pytest.fixture
async def async_client(client):
    """Async version of test client for WebSocket testing."""
    from httpx import AsyncClient
    from main import app
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def performance_test_data(db_session, test_category, test_admin_user):
    """Create large dataset for performance testing."""
    # Create many products
    products = []
    for i in range(100):
        product = Product(
            name=f"Performance Product {i}",
            sku=f"PERF-{i:03d}",
            category_id=test_category.id,
            price=10.00 + (i * 0.5),
            stock_quantity=100,
            is_active=True,
            show_in_ecommerce=True
        )
        products.append(product)
    
    db_session.add_all(products)
    db_session.commit()
    
    # Create many sales
    sales = []
    for i in range(50):
        sale = Sale(
            sale_number=f"PERF-SALE-{i:03d}",
            sale_type="POS" if i % 2 == 0 else "ECOMMERCE",
            customer_name=f"Performance Customer {i}",
            customer_phone=f"+155500{i:04d}",
            payment_method="CASH" if i % 3 == 0 else "CARD",
            total_amount=50.00 + (i * 2.5),
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        sales.append(sale)
    
    db_session.add_all(sales)
    db_session.commit()
    
    return {"products": products, "sales": sales}


@pytest.fixture
def error_scenarios():
    """Common error scenarios for testing."""
    return {
        "invalid_json": '{"invalid": json}',
        "missing_required_field": {"name": "Test"},  # Missing required fields
        "invalid_email": {"email": "not-an-email"},
        "negative_price": {"price": -10.50},
        "zero_quantity": {"quantity": 0},
        "invalid_enum": {"role": "INVALID_ROLE"},
        "too_long_string": {"name": "x" * 1000},
        "sql_injection": {"name": "'; DROP TABLE users; --"},
        "xss_attempt": {"description": "<script>alert('xss')</script>"}
    }


@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Automatically cleanup test files after each test."""
    import tempfile
    import shutil
    
    # Track temporary directories created during tests
    temp_dirs = []
    
    # Monkey patch tempfile.mkdtemp to track directories
    original_mkdtemp = tempfile.mkdtemp
    
    def tracking_mkdtemp(*args, **kwargs):
        temp_dir = original_mkdtemp(*args, **kwargs)
        temp_dirs.append(temp_dir)
        return temp_dir
    
    tempfile.mkdtemp = tracking_mkdtemp
    
    yield
    
    # Cleanup after test
    tempfile.mkdtemp = original_mkdtemp
    for temp_dir in temp_dirs:
        try:
            shutil.rmtree(temp_dir)
        except (OSError, FileNotFoundError):
            pass


@pytest.fixture
def time_sensitive_data():
    """Create time-sensitive test data."""
    now = datetime.utcnow()
    
    return {
        "now": now,
        "one_hour_ago": now - timedelta(hours=1),
        "one_day_ago": now - timedelta(days=1),
        "one_week_ago": now - timedelta(weeks=1),
        "one_month_ago": now - timedelta(days=30),
        "future_date": now + timedelta(days=1)
    }