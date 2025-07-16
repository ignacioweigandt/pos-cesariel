import pytest
from fastapi import status


@pytest.mark.integration
class TestPaymentConfigAPI:
    """Test payment configuration API endpoints."""
    
    def test_get_payment_configs_admin(self, client, auth_headers_admin, payment_configs):
        """Test getting payment configs as admin."""
        response = client.get("/config/payment-config", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= len(payment_configs)
        
        # Check structure of first config
        if data:
            config = data[0]
            assert "id" in config
            assert "payment_type" in config
            assert "card_type" in config
            assert "installments" in config
            assert "surcharge_percentage" in config
            assert "is_active" in config
    
    def test_get_payment_configs_manager(self, client, auth_headers_manager, payment_configs):
        """Test getting payment configs as manager."""
        response = client.get("/config/payment-config", headers=auth_headers_manager)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_payment_configs_seller_forbidden(self, client, auth_headers_seller):
        """Test that sellers cannot access payment configs."""
        response = client.get("/config/payment-config", headers=auth_headers_seller)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_get_payment_configs_unauthenticated(self, client):
        """Test that unauthenticated users cannot access payment configs."""
        response = client.get("/config/payment-config")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_payment_config_admin(self, client, auth_headers_admin):
        """Test creating payment config as admin."""
        config_data = {
            "payment_type": "CARD",
            "card_type": "BANCARIZADA",
            "installments": 6,
            "surcharge_percentage": 7.5,
            "is_active": True
        }
        
        response = client.post(
            "/config/payment-config",
            json=config_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["payment_type"] == config_data["payment_type"]
        assert data["card_type"] == config_data["card_type"]
        assert data["installments"] == config_data["installments"]
        assert data["surcharge_percentage"] == config_data["surcharge_percentage"]
        assert data["is_active"] == config_data["is_active"]
        assert "id" in data
    
    def test_create_payment_config_manager(self, client, auth_headers_manager):
        """Test creating payment config as manager."""
        config_data = {
            "payment_type": "CARD",
            "card_type": "NO_BANCARIZADA",
            "installments": 1,
            "surcharge_percentage": 5.0,
            "is_active": True
        }
        
        response = client.post(
            "/config/payment-config",
            json=config_data,
            headers=auth_headers_manager
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_create_payment_config_seller_forbidden(self, client, auth_headers_seller):
        """Test that sellers cannot create payment configs."""
        config_data = {
            "payment_type": "CARD",
            "card_type": "BANCARIZADA",
            "installments": 1,
            "surcharge_percentage": 0.0
        }
        
        response = client.post(
            "/config/payment-config",
            json=config_data,
            headers=auth_headers_seller
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_create_payment_config_validation_errors(self, client, auth_headers_admin):
        """Test payment config creation with invalid data."""
        # Missing required fields
        response = client.post(
            "/config/payment-config",
            json={},
            headers=auth_headers_admin
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Invalid payment type
        response = client.post(
            "/config/payment-config",
            json={
                "payment_type": "INVALID",
                "installments": 1,
                "surcharge_percentage": 0.0
            },
            headers=auth_headers_admin
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Negative surcharge percentage
        response = client.post(
            "/config/payment-config",
            json={
                "payment_type": "CASH",
                "installments": 1,
                "surcharge_percentage": -5.0
            },
            headers=auth_headers_admin
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Invalid installments
        response = client.post(
            "/config/payment-config",
            json={
                "payment_type": "CARD",
                "card_type": "BANCARIZADA",
                "installments": 0,
                "surcharge_percentage": 5.0
            },
            headers=auth_headers_admin
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_update_payment_config_admin(self, client, auth_headers_admin, payment_configs):
        """Test updating payment config as admin."""
        config_id = payment_configs[0].id
        
        update_data = {
            "surcharge_percentage": 10.0,
            "is_active": False
        }
        
        response = client.put(
            f"/config/payment-config/{config_id}",
            json=update_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["surcharge_percentage"] == update_data["surcharge_percentage"]
        assert data["is_active"] == update_data["is_active"]
    
    def test_update_payment_config_not_found(self, client, auth_headers_admin):
        """Test updating non-existent payment config."""
        response = client.put(
            "/config/payment-config/99999",
            json={"surcharge_percentage": 5.0},
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_payment_config_admin(self, client, auth_headers_admin, payment_configs):
        """Test deleting payment config as admin."""
        config_id = payment_configs[-1].id  # Use last config to avoid FK conflicts
        
        response = client.delete(
            f"/config/payment-config/{config_id}",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify config is deleted
        response = client.get("/config/payment-config", headers=auth_headers_admin)
        data = response.json()
        config_ids = [config["id"] for config in data]
        assert config_id not in config_ids
    
    def test_delete_payment_config_not_found(self, client, auth_headers_admin):
        """Test deleting non-existent payment config."""
        response = client.delete(
            "/config/payment-config/99999",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_payment_methods(self, client):
        """Test getting available payment methods (public endpoint)."""
        response = client.get("/config/payment-methods")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check structure
        for method in data:
            assert "id" in method
            assert "name" in method
            assert "type" in method
            assert "icon" in method
    
    def test_get_active_payment_configs_only(self, client, auth_headers_admin, db_session):
        """Test filtering active payment configs."""
        from models import PaymentConfig
        
        # Create active and inactive configs
        active_config = PaymentConfig(
            payment_type="CASH",
            installments=1,
            surcharge_percentage=0.0,
            is_active=True
        )
        
        inactive_config = PaymentConfig(
            payment_type="TRANSFER",
            installments=1,
            surcharge_percentage=2.0,
            is_active=False
        )
        
        db_session.add_all([active_config, inactive_config])
        db_session.commit()
        
        # Get only active configs
        response = client.get(
            "/config/payment-config?active_only=true",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # All returned configs should be active
        for config in data:
            assert config["is_active"] is True
    
    def test_payment_config_by_type(self, client, auth_headers_admin, payment_configs):
        """Test filtering payment configs by type."""
        response = client.get(
            "/config/payment-config?payment_type=CARD",
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # All returned configs should be CARD type
        for config in data:
            assert config["payment_type"] == "CARD"
    
    def test_duplicate_payment_config_prevention(self, client, auth_headers_admin, payment_configs):
        """Test that duplicate payment configs are handled properly."""
        # Try to create duplicate config
        existing_config = payment_configs[0]
        
        duplicate_data = {
            "payment_type": existing_config.payment_type,
            "card_type": existing_config.card_type,
            "installments": existing_config.installments,
            "surcharge_percentage": 15.0  # Different surcharge
        }
        
        response = client.post(
            "/config/payment-config",
            json=duplicate_data,
            headers=auth_headers_admin
        )
        
        # Should either succeed (allowing different surcharges) or fail with conflict
        # Implementation dependent on business rules
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_409_CONFLICT]
    
    def test_payment_config_affects_sale_calculation(self, client, auth_headers_admin, test_product, mock_websocket_manager):
        """Test that payment config affects sale total calculation."""
        # Create payment config with surcharge
        config_data = {
            "payment_type": "CARD",
            "card_type": "BANCARIZADA",
            "installments": 3,
            "surcharge_percentage": 10.0,
            "is_active": True
        }
        
        response = client.post(
            "/config/payment-config",
            json=config_data,
            headers=auth_headers_admin
        )
        assert response.status_code == status.HTTP_200_OK
        
        # Create sale with surcharge
        test_product.stock_quantity = 10
        
        sale_data = {
            "sale_type": "POS",
            "customer_name": "Test Customer",
            "payment_method": "CARD",
            "card_type": "BANCARIZADA",
            "installments": 3,
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 1,
                    "unit_price": 100.00
                }
            ]
        }
        
        response = client.post("/sales", json=sale_data, headers=auth_headers_admin)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        
        # Should include surcharge in total
        expected_subtotal = 100.00
        expected_surcharge = expected_subtotal * 0.10  # 10% surcharge
        expected_tax = (expected_subtotal + expected_surcharge) * 0.21  # 21% tax
        expected_total = expected_subtotal + expected_surcharge + expected_tax
        
        assert abs(data["total_amount"] - expected_total) < 0.01