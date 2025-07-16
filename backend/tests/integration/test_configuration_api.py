import pytest
from fastapi import status


@pytest.mark.integration
class TestConfigurationAPI:
    """Test system configuration API endpoints."""
    
    def test_get_system_config_admin(self, client, auth_headers_admin):
        """Test getting system configuration as admin."""
        response = client.get("/config/system", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check expected fields
        expected_fields = [
            "company_name", "tax_id", "address", "phone", "email",
            "website", "logo_url", "timezone", "currency", "language",
            "date_format", "time_format", "decimal_places"
        ]
        
        for field in expected_fields:
            assert field in data
    
    def test_update_system_config_admin(self, client, auth_headers_admin):
        """Test updating system configuration as admin."""
        update_data = {
            "company_name": "Updated Company",
            "tax_id": "12345678901",
            "phone": "+1234567890",
            "currency": "USD",
            "timezone": "America/New_York"
        }
        
        response = client.put(
            "/config/system",
            json=update_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["company_name"] == update_data["company_name"]
        assert data["tax_id"] == update_data["tax_id"]
        assert data["currency"] == update_data["currency"]
    
    def test_get_tax_rates_admin(self, client, auth_headers_admin):
        """Test getting tax rates configuration."""
        response = client.get("/config/tax-rates", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert isinstance(data, list)
        
        # Should have at least default tax rate
        if data:
            tax_rate = data[0]
            assert "id" in tax_rate
            assert "name" in tax_rate
            assert "rate" in tax_rate
            assert "is_default" in tax_rate
            assert "is_active" in tax_rate
    
    def test_create_tax_rate_admin(self, client, auth_headers_admin):
        """Test creating new tax rate."""
        tax_data = {
            "name": "Special Tax",
            "rate": 15.0,
            "description": "Special tax rate for specific products",
            "is_active": True,
            "is_default": False
        }
        
        response = client.post(
            "/config/tax-rates",
            json=tax_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["name"] == tax_data["name"]
        assert data["rate"] == tax_data["rate"]
        assert data["is_active"] == tax_data["is_active"]
        assert data["is_default"] == tax_data["is_default"]
    
    def test_update_default_tax_rate(self, client, auth_headers_admin, db_session):
        """Test updating default tax rate."""
        from models import TaxRate
        
        # Create initial tax rates
        tax1 = TaxRate(name="Tax 1", rate=21.0, is_default=True, is_active=True)
        tax2 = TaxRate(name="Tax 2", rate=10.5, is_default=False, is_active=True)
        
        db_session.add_all([tax1, tax2])
        db_session.commit()
        
        # Set tax2 as default
        response = client.put(
            f"/config/tax-rates/{tax2.id}",
            json={"is_default": True},
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify only one default exists
        response = client.get("/config/tax-rates", headers=auth_headers_admin)
        data = response.json()
        
        default_taxes = [tax for tax in data if tax["is_default"]]
        assert len(default_taxes) == 1
        assert default_taxes[0]["id"] == tax2.id
    
    def test_get_ecommerce_config_admin(self, client, auth_headers_admin, ecommerce_config):
        """Test getting e-commerce configuration."""
        response = client.get("/config/ecommerce", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["store_name"] == ecommerce_config.store_name
        assert data["currency"] == ecommerce_config.currency
        assert data["tax_rate"] == ecommerce_config.tax_rate
    
    def test_update_ecommerce_config_admin(self, client, auth_headers_admin, ecommerce_config):
        """Test updating e-commerce configuration."""
        update_data = {
            "store_name": "Updated E-commerce Store",
            "store_description": "Updated description",
            "currency": "USD",
            "tax_rate": 18.0,
            "whatsapp_enabled": False
        }
        
        response = client.put(
            "/config/ecommerce",
            json=update_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["store_name"] == update_data["store_name"]
        assert data["currency"] == update_data["currency"]
        assert data["tax_rate"] == update_data["tax_rate"]
        assert data["whatsapp_enabled"] == update_data["whatsapp_enabled"]
    
    def test_get_notification_config(self, client, auth_headers_admin):
        """Test getting notification configuration."""
        response = client.get("/config/notifications", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        expected_fields = [
            "email_notifications", "sms_notifications", "push_notifications",
            "low_stock_alerts", "new_sale_alerts", "daily_reports",
            "weekly_reports", "monthly_reports"
        ]
        
        for field in expected_fields:
            assert field in data
    
    def test_update_notification_config(self, client, auth_headers_admin):
        """Test updating notification configuration."""
        update_data = {
            "email_notifications": True,
            "low_stock_alerts": True,
            "new_sale_alerts": False,
            "daily_reports": True
        }
        
        response = client.put(
            "/config/notifications",
            json=update_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["email_notifications"] == update_data["email_notifications"]
        assert data["low_stock_alerts"] == update_data["low_stock_alerts"]
        assert data["new_sale_alerts"] == update_data["new_sale_alerts"]
    
    def test_get_printer_config(self, client, auth_headers_admin):
        """Test getting printer configuration."""
        response = client.get("/config/printers", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        expected_fields = [
            "default_printer", "receipt_printer", "label_printer",
            "print_receipts", "print_labels", "paper_size",
            "receipt_template", "logo_on_receipt"
        ]
        
        for field in expected_fields:
            assert field in data
    
    def test_update_printer_config(self, client, auth_headers_admin):
        """Test updating printer configuration."""
        update_data = {
            "default_printer": "Receipt Printer",
            "print_receipts": True,
            "paper_size": "80mm",
            "logo_on_receipt": True
        }
        
        response = client.put(
            "/config/printers",
            json=update_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["default_printer"] == update_data["default_printer"]
        assert data["print_receipts"] == update_data["print_receipts"]
        assert data["paper_size"] == update_data["paper_size"]
    
    def test_get_backup_config(self, client, auth_headers_admin):
        """Test getting backup configuration."""
        response = client.get("/config/backup", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        expected_fields = [
            "auto_backup", "backup_frequency", "backup_time",
            "backup_location", "keep_backups", "compress_backups"
        ]
        
        for field in expected_fields:
            assert field in data
    
    def test_update_backup_config(self, client, auth_headers_admin):
        """Test updating backup configuration."""
        update_data = {
            "auto_backup": True,
            "backup_frequency": "daily",
            "backup_time": "02:00",
            "keep_backups": 30,
            "compress_backups": True
        }
        
        response = client.put(
            "/config/backup",
            json=update_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["auto_backup"] == update_data["auto_backup"]
        assert data["backup_frequency"] == update_data["backup_frequency"]
        assert data["keep_backups"] == update_data["keep_backups"]
    
    def test_configuration_access_permissions(self, client, auth_headers_seller, auth_headers_manager):
        """Test access permissions for configuration endpoints."""
        config_endpoints = [
            "/config/system",
            "/config/tax-rates",
            "/config/ecommerce",
            "/config/notifications",
            "/config/printers",
            "/config/backup"
        ]
        
        # Sellers should not have access
        for endpoint in config_endpoints:
            response = client.get(endpoint, headers=auth_headers_seller)
            assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # Managers should have read access to most configs
        read_access_endpoints = [
            "/config/system",
            "/config/tax-rates",
            "/config/ecommerce"
        ]
        
        for endpoint in read_access_endpoints:
            response = client.get(endpoint, headers=auth_headers_manager)
            assert response.status_code == status.HTTP_200_OK
    
    def test_configuration_validation(self, client, auth_headers_admin):
        """Test configuration validation."""
        # Test invalid currency
        response = client.put(
            "/config/system",
            json={"currency": "INVALID"},
            headers=auth_headers_admin
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Test invalid tax rate
        response = client.post(
            "/config/tax-rates",
            json={
                "name": "Invalid Tax",
                "rate": -5.0  # Negative rate
            },
            headers=auth_headers_admin
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Test invalid email format in system config
        response = client.put(
            "/config/system",
            json={"email": "invalid-email"},
            headers=auth_headers_admin
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_get_all_configurations_summary(self, client, auth_headers_admin):
        """Test getting summary of all configurations."""
        response = client.get("/config", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Should include all configuration sections
        expected_sections = [
            "system", "tax_rates", "ecommerce", "notifications",
            "printers", "backup", "payment_methods"
        ]
        
        for section in expected_sections:
            assert section in data
    
    def test_configuration_export(self, client, auth_headers_admin):
        """Test exporting configuration."""
        response = client.get("/config/export", headers=auth_headers_admin)
        
        assert response.status_code == status.HTTP_200_OK
        
        # Should return JSON with all configurations
        data = response.json()
        assert "system" in data
        assert "export_date" in data
        assert "version" in data
    
    def test_configuration_import_validation(self, client, auth_headers_admin):
        """Test configuration import validation."""
        # Test with invalid configuration data
        invalid_config = {
            "system": {
                "currency": "INVALID_CURRENCY"
            }
        }
        
        response = client.post(
            "/config/import",
            json=invalid_config,
            headers=auth_headers_admin
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY