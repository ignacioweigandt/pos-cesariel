"""
Integration tests for Reports API endpoints.

Tests the full HTTP flow including authentication, permissions, and data flow.
"""

import pytest
from datetime import date, datetime, timedelta
from decimal import Decimal

from app.models import Sale, SaleItem, SaleType, OrderStatus, BranchStock


class TestDashboardEndpoint:
    """Test /reports/dashboard endpoint."""
    
    def test_dashboard_requires_authentication(self, client):
        """Dashboard endpoint should require authentication."""
        response = client.get("/reports/dashboard")
        assert response.status_code == 401
    
    def test_dashboard_returns_stats(self, client, auth_headers_admin):
        """Dashboard should return all required statistics."""
        response = client.get("/reports/dashboard", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields present
        assert "total_sales_today" in data
        assert "total_sales_month" in data
        assert "total_products" in data
        assert "low_stock_products" in data
        assert "active_branches" in data
        assert "total_users" in data
    
    def test_dashboard_admin_can_filter_by_branch(
        self, 
        client, 
        auth_headers_admin,
        test_branch
    ):
        """Admin should be able to filter dashboard by branch."""
        response = client.get(
            f"/reports/dashboard?branch_id={test_branch.id}",
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
    
    def test_dashboard_seller_cannot_access_other_branch(
        self,
        client,
        auth_headers_seller,
        test_branch_secondary
    ):
        """Seller trying to access another branch should see their own data."""
        response = client.get(
            f"/reports/dashboard?branch_id={test_branch_secondary.id}",
            headers=auth_headers_seller
        )
        
        # Should succeed but return seller's branch data (not fail)
        assert response.status_code == 200


class TestSalesReportEndpoint:
    """Test /reports/sales endpoint."""
    
    @pytest.fixture
    def test_sale(self, db_session, test_branch, test_admin_user, test_product):
        """Create a test sale with items."""
        sale = Sale(
            sale_number="TEST-001",
            sale_type=SaleType.POS,
            branch_id=test_branch.id,
            user_id=test_admin_user.id,
            customer_name="Test Customer",
            subtotal=Decimal("100.00"),
            tax_amount=Decimal("12.00"),
            discount_amount=Decimal("0.00"),
            total_amount=Decimal("112.00"),
            payment_method="CASH",
            order_status=OrderStatus.COMPLETED
        )
        db_session.add(sale)
        db_session.commit()
        db_session.refresh(sale)
        
        # Add sale item
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=test_product.id,
            quantity=2,
            unit_price=Decimal("50.00"),
            total_price=Decimal("100.00")
        )
        db_session.add(sale_item)
        db_session.commit()
        
        return sale
    
    def test_sales_report_requires_authentication(self, client):
        """Sales report should require authentication."""
        response = client.get(
            "/reports/sales",
            params={"start_date": "2025-01-01", "end_date": "2025-01-31"}
        )
        assert response.status_code == 401
    
    def test_sales_report_requires_date_params(self, client, auth_headers_admin):
        """Sales report should require start_date and end_date."""
        response = client.get("/reports/sales", headers=auth_headers_admin)
        assert response.status_code == 422  # Validation error
    
    def test_sales_report_returns_correct_structure(
        self,
        client,
        auth_headers_admin,
        test_sale
    ):
        """Sales report should return correct data structure."""
        response = client.get(
            "/reports/sales",
            params={
                "start_date": "2025-01-01",
                "end_date": "2025-12-31"
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "period" in data
        assert "total_sales" in data
        assert "total_transactions" in data
        assert "average_sale" in data
        assert "top_products" in data
        assert "sales_by_branch" in data
        
        # Verify types
        assert isinstance(data["top_products"], list)
        assert isinstance(data["sales_by_branch"], list)
    
    def test_sales_report_includes_sale_data(
        self,
        client,
        auth_headers_admin,
        test_sale
    ):
        """Sales report should include created sale data."""
        today = date.today()
        response = client.get(
            "/reports/sales",
            params={
                "start_date": str(today - timedelta(days=1)),
                "end_date": str(today + timedelta(days=1))
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have at least 1 transaction
        assert data["total_transactions"] >= 1
        # Should have sales amount
        assert float(data["total_sales"]) > 0
    
    def test_sales_report_calculates_average_correctly(
        self,
        client,
        auth_headers_admin,
        test_sale
    ):
        """Sales report should calculate average sale correctly."""
        today = date.today()
        response = client.get(
            "/reports/sales",
            params={
                "start_date": str(today - timedelta(days=1)),
                "end_date": str(today + timedelta(days=1))
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data["total_transactions"] > 0:
            expected_avg = float(data["total_sales"]) / data["total_transactions"]
            actual_avg = float(data["average_sale"])
            # Allow small floating point differences
            assert abs(expected_avg - actual_avg) < 0.01
    
    def test_sales_report_validates_date_range(self, client, auth_headers_admin):
        """Sales report should reject invalid date ranges."""
        response = client.get(
            "/reports/sales",
            params={
                "start_date": "2025-12-31",
                "end_date": "2025-01-01"
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 400
        assert "must be after or equal to" in response.json()["detail"]
    
    def test_sales_report_rejects_too_large_range(self, client, auth_headers_admin):
        """Sales report should reject ranges over 2 years."""
        response = client.get(
            "/reports/sales",
            params={
                "start_date": "2020-01-01",
                "end_date": "2025-12-31"
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 400
        assert "cannot exceed 2 years" in response.json()["detail"]
    
    def test_sales_report_admin_sees_branch_breakdown(
        self,
        client,
        auth_headers_admin,
        test_sale
    ):
        """Admin should see sales by branch in report."""
        today = date.today()
        response = client.get(
            "/reports/sales",
            params={
                "start_date": str(today - timedelta(days=1)),
                "end_date": str(today + timedelta(days=1))
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Admin should have branch breakdown
        assert isinstance(data["sales_by_branch"], list)
        # Should have at least one branch with data
        if data["total_transactions"] > 0:
            assert len(data["sales_by_branch"]) >= 1
    
    def test_sales_report_seller_no_branch_breakdown(
        self,
        client,
        auth_headers_seller,
        test_sale
    ):
        """Seller should not see branch breakdown in report."""
        today = date.today()
        response = client.get(
            "/reports/sales",
            params={
                "start_date": str(today - timedelta(days=1)),
                "end_date": str(today + timedelta(days=1))
            },
            headers=auth_headers_seller
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Seller should have empty branch breakdown
        assert data["sales_by_branch"] == []


class TestDailySalesEndpoint:
    """Test /reports/daily-sales endpoint."""
    
    @pytest.fixture
    def test_sale_today(self, db_session, test_branch, test_admin_user, test_product):
        """Create a sale for today."""
        sale = Sale(
            sale_number="DAILY-001",
            sale_type=SaleType.POS,
            branch_id=test_branch.id,
            user_id=test_admin_user.id,
            subtotal=Decimal("50.00"),
            tax_amount=Decimal("6.00"),
            discount_amount=Decimal("0.00"),
            total_amount=Decimal("56.00"),
            payment_method="CASH",
            order_status=OrderStatus.COMPLETED
        )
        db_session.add(sale)
        db_session.commit()
        return sale
    
    def test_daily_sales_returns_array(
        self,
        client,
        auth_headers_admin,
        test_sale_today
    ):
        """Daily sales should return array of daily data points."""
        today = date.today()
        response = client.get(
            "/reports/daily-sales",
            params={
                "start_date": str(today - timedelta(days=7)),
                "end_date": str(today)
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # Should have at least today's data
        assert len(data) >= 1
    
    def test_daily_sales_data_structure(
        self,
        client,
        auth_headers_admin,
        test_sale_today
    ):
        """Daily sales data points should have correct structure."""
        today = date.today()
        response = client.get(
            "/reports/daily-sales",
            params={
                "start_date": str(today),
                "end_date": str(today)
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            day_data = data[0]
            assert "date" in day_data
            assert "sales" in day_data
            assert "transactions" in day_data


class TestProductsChartEndpoint:
    """Test /reports/products-chart endpoint."""
    
    @pytest.fixture
    def test_sales_with_products(
        self,
        db_session,
        test_branch,
        test_admin_user,
        test_product,
        test_category
    ):
        """Create multiple sales with different products."""
        from app.models import Product
        
        # Create additional products
        product2 = Product(
            name="Product 2",
            sku="PROD002",
            category_id=test_category.id,
            price=Decimal("20.00"),
            cost=Decimal("10.00"),
            stock_quantity=50,
            min_stock=5,
            is_active=True
        )
        db_session.add(product2)
        db_session.commit()
        
        # Create sales
        for i in range(3):
            sale = Sale(
                sale_number=f"CHART-{i:03d}",
                sale_type=SaleType.POS,
                branch_id=test_branch.id,
                user_id=test_admin_user.id,
                subtotal=Decimal("30.00"),
                tax_amount=Decimal("3.60"),
                total_amount=Decimal("33.60"),
                payment_method="CASH",
                order_status=OrderStatus.COMPLETED
            )
            db_session.add(sale)
            db_session.commit()
            
            # Add items
            item = SaleItem(
                sale_id=sale.id,
                product_id=test_product.id if i % 2 == 0 else product2.id,
                quantity=1,
                unit_price=Decimal("30.00"),
                total_price=Decimal("30.00")
            )
            db_session.add(item)
        
        db_session.commit()
        return test_product, product2
    
    def test_products_chart_returns_array(
        self,
        client,
        auth_headers_admin,
        test_sales_with_products
    ):
        """Products chart should return array of chart data."""
        today = date.today()
        response = client.get(
            "/reports/products-chart",
            params={
                "start_date": str(today - timedelta(days=1)),
                "end_date": str(today + timedelta(days=1)),
                "limit": 10
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) <= 10  # Respects limit
    
    def test_products_chart_data_structure(
        self,
        client,
        auth_headers_admin,
        test_sales_with_products
    ):
        """Products chart data should have name and value."""
        today = date.today()
        response = client.get(
            "/reports/products-chart",
            params={
                "start_date": str(today - timedelta(days=1)),
                "end_date": str(today + timedelta(days=1))
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "name" in item
            assert "value" in item


class TestBranchesChartEndpoint:
    """Test /reports/branches-chart endpoint."""
    
    def test_branches_chart_requires_admin(self, client, auth_headers_seller):
        """Branches chart should require admin access."""
        response = client.get(
            "/reports/branches-chart",
            params={
                "start_date": "2025-01-01",
                "end_date": "2025-01-31"
            },
            headers=auth_headers_seller
        )
        
        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]
    
    def test_branches_chart_allows_admin(self, client, auth_headers_admin):
        """Branches chart should work for admin."""
        response = client.get(
            "/reports/branches-chart",
            params={
                "start_date": "2025-01-01",
                "end_date": "2025-01-31"
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)


class TestDetailedSalesReportEndpoint:
    """Test /reports/sales/detailed endpoint."""
    
    def test_detailed_report_returns_extended_data(
        self,
        client,
        auth_headers_admin
    ):
        """Detailed report should include payment method and sale type breakdowns."""
        response = client.get(
            "/reports/sales/detailed",
            params={
                "start_date": "2025-01-01",
                "end_date": "2025-01-31"
            },
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have base report fields
        assert "period" in data
        assert "total_sales" in data
        assert "total_transactions" in data
        
        # Should have extended fields
        assert "sales_by_payment_method" in data
        assert "sales_by_type" in data
        
        assert isinstance(data["sales_by_payment_method"], list)
        assert isinstance(data["sales_by_type"], list)
