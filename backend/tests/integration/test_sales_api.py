import pytest
from fastapi.testclient import TestClient
from decimal import Decimal


@pytest.mark.integration
class TestSalesAPI:
    """Test Sales API endpoints."""
    
    def test_get_sales_success(self, client: TestClient, auth_headers_admin):
        """Test getting sales list."""
        response = client.get("/sales/", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_sales_unauthorized(self, client: TestClient):
        """Test getting sales without authentication."""
        response = client.get("/sales/")
        assert response.status_code == 403
    
    def test_get_sales_with_filters(self, client: TestClient, auth_headers_admin):
        """Test getting sales with various filters."""
        # Test with sale type filter
        response = client.get(
            "/sales/",
            headers=auth_headers_admin,
            params={"sale_type": "POS"}
        )
        assert response.status_code == 200
        
        # Test with limit
        response = client.get(
            "/sales/",
            headers=auth_headers_admin,
            params={"limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 10
    
    def test_create_sale_success(self, client: TestClient, auth_headers_admin, test_product, test_branch, mock_websocket_manager):
        """Test creating a new sale."""
        sale_data = {
            "sale_type": "POS",
            "branch_id": test_branch.id,
            "customer_name": "Test Customer",
            "customer_email": "customer@test.com",
            "payment_method": "cash",
            "order_status": "PENDING",
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 2,
                    "unit_price": float(test_product.price)
                }
            ]
        }
        
        response = client.post("/sales/", headers=auth_headers_admin, json=sale_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "sale_number" in data
        assert data["sale_type"] == "POS"
        assert data["customer_name"] == "Test Customer"
        assert len(data["sale_items"]) == 1
        assert float(data["total_amount"]) > 0
    
    def test_create_sale_insufficient_stock(self, client: TestClient, auth_headers_admin, test_product, test_branch):
        """Test creating sale with insufficient stock."""
        sale_data = {
            "sale_type": "POS",
            "branch_id": test_branch.id,
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 999,  # More than available stock
                    "unit_price": float(test_product.price)
                }
            ]
        }
        
        response = client.post("/sales/", headers=auth_headers_admin, json=sale_data)
        
        assert response.status_code == 400
        assert "Insufficient stock" in response.json()["detail"]
    
    def test_create_sale_nonexistent_product(self, client: TestClient, auth_headers_admin, test_branch):
        """Test creating sale with non-existent product."""
        sale_data = {
            "sale_type": "POS",
            "branch_id": test_branch.id,
            "items": [
                {
                    "product_id": 99999,  # Non-existent product
                    "quantity": 1,
                    "unit_price": 10.00
                }
            ]
        }
        
        response = client.post("/sales/", headers=auth_headers_admin, json=sale_data)
        
        assert response.status_code == 400
        assert "not found" in response.json()["detail"]
    
    def test_create_sale_empty_items(self, client: TestClient, auth_headers_admin, test_branch):
        """Test creating sale with no items."""
        sale_data = {
            "sale_type": "POS",
            "branch_id": test_branch.id,
            "items": []
        }
        
        response = client.post("/sales/", headers=auth_headers_admin, json=sale_data)
        
        # Current implementation allows empty sales (total will be 0)
        # TODO: Consider adding validation to require at least one item
        assert response.status_code == 200
        data = response.json()
        assert float(data["total_amount"]) == 0
    
    def test_get_sale_by_id_success(self, client: TestClient, auth_headers_admin, test_product, test_branch, mock_websocket_manager):
        """Test getting a specific sale by ID."""
        # First create a sale
        sale_data = {
            "sale_type": "POS",
            "branch_id": test_branch.id,
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 1,
                    "unit_price": float(test_product.price)
                }
            ]
        }
        
        create_response = client.post("/sales/", headers=auth_headers_admin, json=sale_data)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        
        # Now get the sale
        response = client.get(f"/sales/{sale_id}", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sale_id
        assert data["sale_type"] == "POS"
        assert len(data["sale_items"]) == 1
    
    def test_get_sale_by_id_not_found(self, client: TestClient, auth_headers_admin):
        """Test getting a non-existent sale."""
        response = client.get("/sales/99999", headers=auth_headers_admin)
        assert response.status_code == 404
    
    def test_get_sale_different_branch_access(self, client: TestClient, auth_headers_seller, test_product, test_branch, mock_websocket_manager, db_session):
        """Test that users can only access sales from their branch."""
        # Create another branch and user
        from models import Branch, User
        from auth import get_password_hash
        
        other_branch = Branch(name="Other Branch")
        db_session.add(other_branch)
        db_session.commit()
        
        other_user = User(
            email="other@test.com",
            username="otheruser",
            full_name="Other User",
            hashed_password=get_password_hash("testpass123"),
            role="SELLER",
            branch_id=other_branch.id,
            is_active=True
        )
        db_session.add(other_user)
        db_session.commit()
        
        # Create sale in the test branch
        sale_data = {
            "sale_type": "POS",
            "branch_id": test_branch.id,
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 1,
                    "unit_price": float(test_product.price)
                }
            ]
        }
        
        create_response = client.post("/sales/", headers=auth_headers_seller, json=sale_data)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        
        # Login as other user and try to access the sale
        login_response = client.post(
            "/auth/login-json",
            json={"username": "otheruser", "password": "testpass123"}
        )
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        
        response = client.get(f"/sales/{sale_id}", headers=other_headers)
        assert response.status_code == 403
    
    def test_update_sale_status_success(self, client: TestClient, auth_headers_admin, test_product, test_branch, mock_websocket_manager):
        """Test updating sale status."""
        # Create a sale first
        sale_data = {
            "sale_type": "ECOMMERCE",
            "branch_id": test_branch.id,
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 1,
                    "unit_price": float(test_product.price)
                }
            ]
        }
        
        create_response = client.post("/sales/", headers=auth_headers_admin, json=sale_data)
        sale_id = create_response.json()["id"]
        
        # Update status
        response = client.put(
            f"/sales/{sale_id}/status",
            headers=auth_headers_admin,
            json={"new_status": "PROCESSING"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "updated successfully" in data["message"]
        assert data["new_status"] == "PROCESSING"
    
    def test_cancel_sale_success(self, client: TestClient, auth_headers_admin, test_product, test_branch, mock_websocket_manager):
        """Test canceling a sale."""
        # Create a sale first
        sale_data = {
            "sale_type": "POS",
            "branch_id": test_branch.id,
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 1,
                    "unit_price": float(test_product.price)
                }
            ]
        }
        
        create_response = client.post("/sales/", headers=auth_headers_admin, json=sale_data)
        sale_id = create_response.json()["id"]
        
        # Record initial stock
        initial_stock = test_product.stock_quantity
        
        # Cancel the sale
        response = client.delete(f"/sales/{sale_id}", headers=auth_headers_admin)
        
        assert response.status_code == 200
        assert "cancelled successfully" in response.json()["message"]
    
    def test_cancel_sale_unauthorized(self, client: TestClient, auth_headers_seller, test_product, test_branch, mock_websocket_manager):
        """Test canceling sale without proper permissions."""
        # Create a sale first
        sale_data = {
            "sale_type": "POS",
            "branch_id": test_branch.id,
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 1,
                    "unit_price": float(test_product.price)
                }
            ]
        }
        
        create_response = client.post("/sales/", headers=auth_headers_seller, json=sale_data)
        sale_id = create_response.json()["id"]
        
        # Try to cancel (seller doesn't have permission)
        response = client.delete(f"/sales/{sale_id}", headers=auth_headers_seller)
        assert response.status_code == 403
    
    def test_get_dashboard_stats(self, client: TestClient, auth_headers_admin):
        """Test getting dashboard statistics."""
        response = client.get("/sales/reports/dashboard", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check that all required fields are present
        required_fields = [
            "total_sales_today", 
            "total_sales_month",
            "total_products",
            "low_stock_products", 
            "active_branches",
            "total_users"
        ]
        
        for field in required_fields:
            assert field in data
            # The API may return strings that represent numbers, so check if they can be converted
            value = data[field]
            if isinstance(value, str):
                # Should be convertible to float/int
                assert value.replace('.', '').replace('-', '').isdigit() or value == '0'
            else:
                assert isinstance(value, (int, float))
    
    def test_get_sales_report(self, client: TestClient, auth_headers_admin):
        """Test getting sales report."""
        response = client.get(
            "/sales/reports/sales-report",
            headers=auth_headers_admin,
            params={
                "start_date": "2025-01-01",
                "end_date": "2025-12-31"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["period", "total_sales", "total_transactions", "average_sale"]
        for field in required_fields:
            assert field in data