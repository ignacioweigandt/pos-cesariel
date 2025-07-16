import pytest
from fastapi import status


@pytest.mark.integration
class TestEcommercePublicEndpoints:
    """Test public e-commerce endpoints that don't require authentication."""
    
    def test_get_products(self, client, test_product):
        """Test getting products for e-commerce."""
        response = client.get("/ecommerce/products")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "data" in data
        products = data["data"]
        assert isinstance(products, list)
        
        # Should include our test product if it's enabled for e-commerce
        if test_product.show_in_ecommerce:
            product_ids = [p["id"] for p in products]
            assert test_product.id in product_ids
    
    def test_get_products_filters_active_only(self, client, db_session, test_category):
        """Test that only active products are returned."""
        from models import Product
        
        # Create active and inactive products
        active_product = Product(
            name="Active Product",
            sku="ACTIVE001",
            category_id=test_category.id,
            price=10.99,
            is_active=True,
            show_in_ecommerce=True
        )
        
        inactive_product = Product(
            name="Inactive Product",
            sku="INACTIVE001",
            category_id=test_category.id,
            price=15.99,
            is_active=False,
            show_in_ecommerce=True
        )
        
        db_session.add_all([active_product, inactive_product])
        db_session.commit()
        
        response = client.get("/ecommerce/products")
        assert response.status_code == status.HTTP_200_OK
        
        products = response.json()["data"]
        product_ids = [p["id"] for p in products]
        
        assert active_product.id in product_ids
        assert inactive_product.id not in product_ids
    
    def test_get_products_filters_ecommerce_enabled(self, client, db_session, test_category):
        """Test that only e-commerce enabled products are returned."""
        from models import Product
        
        # Create products with different e-commerce settings
        ecommerce_product = Product(
            name="E-commerce Product",
            sku="ECOM001",
            category_id=test_category.id,
            price=10.99,
            is_active=True,
            show_in_ecommerce=True
        )
        
        pos_only_product = Product(
            name="POS Only Product",
            sku="POS001",
            category_id=test_category.id,
            price=15.99,
            is_active=True,
            show_in_ecommerce=False
        )
        
        db_session.add_all([ecommerce_product, pos_only_product])
        db_session.commit()
        
        response = client.get("/ecommerce/products")
        assert response.status_code == status.HTTP_200_OK
        
        products = response.json()["data"]
        product_ids = [p["id"] for p in products]
        
        assert ecommerce_product.id in product_ids
        assert pos_only_product.id not in product_ids
    
    def test_get_product_by_id(self, client, test_product):
        """Test getting a specific product by ID."""
        # Make sure product is enabled for e-commerce
        test_product.show_in_ecommerce = True
        
        response = client.get(f"/ecommerce/products/{test_product.id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "data" in data
        product = data["data"]
        assert product["id"] == test_product.id
        assert product["name"] == test_product.name
        assert product["price"] == test_product.price
    
    def test_get_product_by_id_not_found(self, client):
        """Test getting non-existent product."""
        response = client.get("/ecommerce/products/99999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_product_by_id_not_enabled_for_ecommerce(self, client, test_product):
        """Test getting product not enabled for e-commerce."""
        # Make sure product is NOT enabled for e-commerce
        test_product.show_in_ecommerce = False
        
        response = client.get(f"/ecommerce/products/{test_product.id}")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_categories(self, client, test_category):
        """Test getting categories for e-commerce."""
        response = client.get("/ecommerce/categories")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "data" in data
        categories = data["data"]
        assert isinstance(categories, list)
        
        # Should include our test category if it's active
        if test_category.is_active:
            category_ids = [c["id"] for c in categories]
            assert test_category.id in category_ids
    
    def test_get_categories_filters_active_only(self, client, db_session):
        """Test that only active categories are returned."""
        from models import Category
        
        # Create active and inactive categories
        active_category = Category(
            name="Active Category",
            description="Active",
            is_active=True
        )
        
        inactive_category = Category(
            name="Inactive Category",
            description="Inactive",
            is_active=False
        )
        
        db_session.add_all([active_category, inactive_category])
        db_session.commit()
        
        response = client.get("/ecommerce/categories")
        assert response.status_code == status.HTTP_200_OK
        
        categories = response.json()["data"]
        category_ids = [c["id"] for c in categories]
        
        assert active_category.id in category_ids
        assert inactive_category.id not in category_ids
    
    def test_get_store_config(self, client, db_session):
        """Test getting store configuration."""
        from models import EcommerceConfig
        
        # Create store config
        config = EcommerceConfig(
            store_name="Test Store",
            store_description="A test store",
            contact_email="test@store.com",
            contact_phone="+1234567890",
            currency="ARS",
            tax_rate=21.0
        )
        db_session.add(config)
        db_session.commit()
        
        response = client.get("/ecommerce/store-config")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["store_name"] == "Test Store"
        assert data["currency"] == "ARS"
        assert data["tax_rate"] == 21.0
    
    def test_get_store_config_not_found(self, client):
        """Test getting store config when none exists."""
        response = client.get("/ecommerce/store-config")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_whatsapp_config(self, client, db_session):
        """Test getting WhatsApp configuration."""
        from models import EcommerceConfig
        
        # Create config with WhatsApp settings
        config = EcommerceConfig(
            store_name="Test Store",
            business_phone="+1234567890",
            whatsapp_enabled=True
        )
        db_session.add(config)
        db_session.commit()
        
        response = client.get("/ecommerce/whatsapp-config")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["business_phone"] == "+1234567890"
        assert data["whatsapp_enabled"] is True
    
    def test_get_whatsapp_config_default(self, client):
        """Test getting WhatsApp config with defaults when none exists."""
        response = client.get("/ecommerce/whatsapp-config")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Should return default values
        assert "business_phone" in data
        assert "whatsapp_enabled" in data
    
    def test_health_check(self, client):
        """Test e-commerce health check endpoint."""
        response = client.get("/ecommerce/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["status"] == "ok"
        assert "endpoints" in data
        assert isinstance(data["endpoints"], list)


@pytest.mark.integration
class TestEcommerceSalesEndpoints:
    """Test e-commerce sales endpoints."""
    
    def test_create_ecommerce_sale(self, client, test_product, mock_websocket_manager):
        """Test creating an e-commerce sale."""
        # Ensure product has stock
        test_product.stock_quantity = 10
        test_product.show_in_ecommerce = True
        
        sale_data = {
            "sale_type": "ECOMMERCE",
            "customer_name": "John Doe",
            "customer_phone": "+1234567890",
            "payment_method": "WHATSAPP",
            "notes": "E-commerce order",
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 2,
                    "unit_price": test_product.price
                }
            ]
        }
        
        response = client.post("/ecommerce/sales", json=sale_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["sale_type"] == "ECOMMERCE"
        assert data["customer_name"] == "John Doe"
        assert data["payment_method"] == "WHATSAPP"
        assert len(data["items"]) == 1
        assert data["items"][0]["product_id"] == test_product.id
    
    def test_create_sale_insufficient_stock(self, client, test_product):
        """Test creating sale with insufficient stock."""
        # Set low stock
        test_product.stock_quantity = 1
        test_product.show_in_ecommerce = True
        
        sale_data = {
            "sale_type": "ECOMMERCE",
            "customer_name": "John Doe",
            "customer_phone": "+1234567890",
            "payment_method": "WHATSAPP",
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 5,  # More than available
                    "unit_price": test_product.price
                }
            ]
        }
        
        response = client.post("/ecommerce/sales", json=sale_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "stock insuficiente" in response.json()["detail"].lower()
    
    def test_create_sale_invalid_product(self, client):
        """Test creating sale with non-existent product."""
        sale_data = {
            "sale_type": "ECOMMERCE",
            "customer_name": "John Doe",
            "customer_phone": "+1234567890",
            "payment_method": "WHATSAPP",
            "items": [
                {
                    "product_id": 99999,  # Non-existent
                    "quantity": 1,
                    "unit_price": 10.99
                }
            ]
        }
        
        response = client.post("/ecommerce/sales", json=sale_data)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_create_sale_missing_required_fields(self, client, test_product):
        """Test creating sale with missing required fields."""
        sale_data = {
            "sale_type": "ECOMMERCE",
            # Missing customer_name and customer_phone
            "payment_method": "WHATSAPP",
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 1,
                    "unit_price": test_product.price
                }
            ]
        }
        
        response = client.post("/ecommerce/sales", json=sale_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_create_sale_with_size(self, client, db_session, test_product_with_sizes, test_branch):
        """Test creating sale with product size."""
        from models import ProductSize
        
        # Add size stock
        size_stock = ProductSize(
            product_id=test_product_with_sizes.id,
            branch_id=test_branch.id,
            size="M",
            stock_quantity=5
        )
        db_session.add(size_stock)
        db_session.commit()
        
        sale_data = {
            "sale_type": "ECOMMERCE",
            "customer_name": "John Doe",
            "customer_phone": "+1234567890",
            "payment_method": "WHATSAPP",
            "items": [
                {
                    "product_id": test_product_with_sizes.id,
                    "quantity": 1,
                    "unit_price": test_product_with_sizes.price,
                    "size": "M"
                }
            ]
        }
        
        response = client.post("/ecommerce/sales", json=sale_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["items"][0]["size"] == "M"
    
    def test_create_sale_calculates_totals(self, client, test_product, mock_websocket_manager):
        """Test that sale creation calculates totals correctly."""
        test_product.stock_quantity = 10
        test_product.show_in_ecommerce = True
        
        sale_data = {
            "sale_type": "ECOMMERCE",
            "customer_name": "John Doe",
            "customer_phone": "+1234567890",
            "payment_method": "WHATSAPP",
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 2,
                    "unit_price": 10.00
                }
            ]
        }
        
        response = client.post("/ecommerce/sales", json=sale_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check calculations
        expected_subtotal = 20.00  # 2 * 10.00
        expected_tax = expected_subtotal * 0.21  # 21% tax
        expected_total = expected_subtotal + expected_tax
        
        assert data["subtotal"] == expected_subtotal
        assert abs(data["tax_amount"] - expected_tax) < 0.01
        assert abs(data["total_amount"] - expected_total) < 0.01


@pytest.mark.integration
class TestEcommerceAdvancedEndpoints:
    """Test advanced e-commerce endpoints (require authentication)."""
    
    def test_get_banners_requires_auth(self, client):
        """Test that getting banners requires authentication."""
        response = client.get("/ecommerce-advanced/banners")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_banners_with_auth(self, client, auth_headers_admin, db_session):
        """Test getting banners with authentication."""
        from models import StoreBanner
        
        # Create test banner
        banner = StoreBanner(
            title="Test Banner",
            subtitle="Test Subtitle",
            image_url="https://example.com/banner.jpg",
            is_active=True,
            order=1
        )
        db_session.add(banner)
        db_session.commit()
        
        response = client.get("/ecommerce-advanced/banners", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "data" in data
        banners = data["data"]
        assert isinstance(banners, list)
        
        if banners:
            banner_ids = [b["id"] for b in banners]
            assert banner.id in banner_ids
    
    def test_get_product_images_requires_auth(self, client, test_product):
        """Test that getting product images requires authentication."""
        response = client.get(f"/ecommerce-advanced/products/{test_product.id}/images")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_product_images_with_auth(self, client, auth_headers_admin, test_product, db_session):
        """Test getting product images with authentication."""
        from models import ProductImage
        
        # Create test image
        image = ProductImage(
            product_id=test_product.id,
            image_url="https://example.com/image.jpg",
            alt_text="Test image",
            is_main=True,
            image_order=1
        )
        db_session.add(image)
        db_session.commit()
        
        response = client.get(
            f"/ecommerce-advanced/products/{test_product.id}/images",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "data" in data
        images = data["data"]
        assert isinstance(images, list)
        
        if images:
            image_ids = [i["id"] for i in images]
            assert image.id in image_ids