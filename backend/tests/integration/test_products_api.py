import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestProductsAPI:
    """Test Products API endpoints."""
    
    def test_get_products_success(self, client: TestClient, auth_headers_admin, test_product):
        """Test getting products list."""
        response = client.get("/products/", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Check first product structure
        product = data[0]
        assert "id" in product
        assert "name" in product
        assert "sku" in product
        assert "price" in product
        assert "stock_quantity" in product
    
    def test_get_products_unauthorized(self, client: TestClient, test_product):
        """Test getting products without authentication."""
        response = client.get("/products/")
        assert response.status_code == 403
    
    def test_get_products_with_search(self, client: TestClient, auth_headers_admin, test_product):
        """Test getting products with search parameter."""
        response = client.get(
            "/products/", 
            headers=auth_headers_admin,
            params={"search": "Test"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should find the test product
        assert len(data) >= 1
        assert any(p["name"] == "Test Product" for p in data)
    
    def test_get_products_with_category_filter(self, client: TestClient, auth_headers_admin, test_product):
        """Test getting products filtered by category."""
        response = client.get(
            "/products/",
            headers=auth_headers_admin,
            params={"category_id": test_product.category_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert all(p["category_id"] == test_product.category_id for p in data)
    
    def test_get_products_low_stock(self, client: TestClient, auth_headers_admin, db_session, test_category):
        """Test getting products with low stock."""
        from models import Product
        
        # Create a low stock product
        low_stock_product = Product(
            name="Low Stock Product",
            sku="LOW001", 
            category_id=test_category.id,
            price=15.99,
            stock_quantity=2,
            min_stock=10
        )
        db_session.add(low_stock_product)
        db_session.commit()
        
        response = client.get(
            "/products/",
            headers=auth_headers_admin,
            params={"low_stock": True}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Should find the low stock product
        assert any(p["name"] == "Low Stock Product" for p in data)
    
    def test_get_product_by_id_success(self, client: TestClient, auth_headers_admin, test_product):
        """Test getting a specific product by ID."""
        response = client.get(f"/products/{test_product.id}", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_product.id
        assert data["name"] == test_product.name
        assert data["sku"] == test_product.sku
        assert float(data["price"]) == float(test_product.price)
    
    def test_get_product_by_id_not_found(self, client: TestClient, auth_headers_admin):
        """Test getting a non-existent product."""
        response = client.get("/products/99999", headers=auth_headers_admin)
        assert response.status_code == 404
    
    def test_get_product_by_barcode_success(self, client: TestClient, auth_headers_admin, test_product):
        """Test getting product by barcode."""
        response = client.get(
            f"/products/barcode/{test_product.barcode}",
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_product.id
        assert data["barcode"] == test_product.barcode
    
    def test_get_product_by_barcode_not_found(self, client: TestClient, auth_headers_admin):
        """Test getting product by non-existent barcode."""
        response = client.get("/products/barcode/999999999", headers=auth_headers_admin)
        assert response.status_code == 404
    
    def test_search_products_success(self, client: TestClient, auth_headers_admin, test_product):
        """Test product search endpoint."""
        response = client.get(
            "/products/search",
            headers=auth_headers_admin,
            params={"q": "Test"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(p["name"] == "Test Product" for p in data)
    
    def test_search_products_by_sku(self, client: TestClient, auth_headers_admin, test_product):
        """Test product search by SKU."""
        response = client.get(
            "/products/search",
            headers=auth_headers_admin,
            params={"q": "TEST001"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(p["sku"] == "TEST001" for p in data)
    
    def test_search_products_empty_query(self, client: TestClient, auth_headers_admin):
        """Test product search with empty query."""
        response = client.get(
            "/products/search",
            headers=auth_headers_admin,
            params={"q": ""}
        )
        
        assert response.status_code == 422
    
    def test_create_product_success(self, client: TestClient, auth_headers_admin, test_category, mock_websocket_manager):
        """Test creating a new product."""
        product_data = {
            "name": "New Test Product",
            "description": "A new test product",
            "sku": "NEW001",
            "barcode": "9876543210",
            "category_id": test_category.id,
            "price": 25.99,
            "cost": 12.50,
            "stock_quantity": 50,
            "min_stock": 5,
            "is_active": True,
            "show_in_ecommerce": True
        }
        
        response = client.post("/products/", headers=auth_headers_admin, json=product_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == product_data["name"]
        assert data["sku"] == product_data["sku"]
        assert float(data["price"]) == product_data["price"]
        assert data["stock_quantity"] == product_data["stock_quantity"]
    
    def test_create_product_duplicate_sku(self, client: TestClient, auth_headers_admin, test_product, test_category):
        """Test creating product with duplicate SKU."""
        product_data = {
            "name": "Another Product",
            "sku": test_product.sku,  # Duplicate SKU
            "category_id": test_category.id,
            "price": 15.99,
            "stock_quantity": 25
        }
        
        response = client.post("/products/", headers=auth_headers_admin, json=product_data)
        assert response.status_code == 400
        assert "SKU already exists" in response.json()["detail"]
    
    def test_create_product_unauthorized(self, client: TestClient, auth_headers_seller, test_category):
        """Test creating product without proper permissions."""
        product_data = {
            "name": "Unauthorized Product",
            "sku": "UNAUTH001",
            "category_id": test_category.id,
            "price": 15.99,
            "stock_quantity": 25
        }
        
        response = client.post("/products/", headers=auth_headers_seller, json=product_data)
        assert response.status_code == 403
    
    def test_update_product_success(self, client: TestClient, auth_headers_admin, test_product, mock_websocket_manager):
        """Test updating a product."""
        update_data = {
            "name": "Updated Test Product",
            "price": 15.99,
            "stock_quantity": 75
        }
        
        response = client.put(
            f"/products/{test_product.id}",
            headers=auth_headers_admin,
            json=update_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert float(data["price"]) == update_data["price"]
        assert data["stock_quantity"] == update_data["stock_quantity"]
    
    def test_update_product_not_found(self, client: TestClient, auth_headers_admin):
        """Test updating a non-existent product."""
        update_data = {"name": "Updated Product"}
        
        response = client.put("/products/99999", headers=auth_headers_admin, json=update_data)
        assert response.status_code == 404
    
    def test_delete_product_success(self, client: TestClient, auth_headers_admin, test_product):
        """Test deleting (deactivating) a product."""
        response = client.delete(f"/products/{test_product.id}", headers=auth_headers_admin)
        
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]
    
    def test_delete_product_not_found(self, client: TestClient, auth_headers_admin):
        """Test deleting a non-existent product."""
        response = client.delete("/products/99999", headers=auth_headers_admin)
        assert response.status_code == 404
    
    def test_adjust_stock_success(self, client: TestClient, auth_headers_admin, test_product, mock_websocket_manager):
        """Test adjusting product stock."""
        adjustment_data = {
            "new_stock": 150,
            "notes": "Stock adjustment test"
        }
        
        response = client.post(
            f"/products/{test_product.id}/adjust-stock",
            headers=auth_headers_admin,
            json=adjustment_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["new_stock"] == adjustment_data["new_stock"]
        assert "Stock adjusted successfully" in data["message"]
    
    def test_adjust_stock_negative(self, client: TestClient, auth_headers_admin, test_product):
        """Test adjusting stock to negative value."""
        adjustment_data = {
            "new_stock": -10,
            "notes": "Invalid adjustment"
        }
        
        response = client.post(
            f"/products/{test_product.id}/adjust-stock",
            headers=auth_headers_admin,
            json=adjustment_data
        )
        
        assert response.status_code == 400
        assert "cannot be negative" in response.json()["detail"]
    
    def test_get_inventory_movements(self, client: TestClient, auth_headers_admin, test_product, mock_websocket_manager):
        """Test getting inventory movements for a product."""
        # First create an inventory movement by adjusting stock
        adjustment_data = {
            "new_stock": 120,
            "notes": "Test inventory movement"
        }
        
        adjust_response = client.post(
            f"/products/{test_product.id}/adjust-stock",
            headers=auth_headers_admin,
            json=adjustment_data
        )
        assert adjust_response.status_code == 200
        
        # Now get the inventory movements
        response = client.get(
            f"/products/{test_product.id}/inventory-movements",
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least the adjustment we just made
        assert len(data) >= 1