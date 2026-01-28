"""
Unit tests for ReportsService.

Tests business logic in isolation using mocked repositories.
"""

import pytest
from datetime import date, datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, MagicMock, patch

from app.services.reports_service import ReportsService
from app.models import User, UserRole


class TestReportsServicePermissions:
    """Test permission validation in ReportsService."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock()
    
    @pytest.fixture
    def service(self, mock_db):
        """Create service with mocked database."""
        return ReportsService(mock_db)
    
    @pytest.fixture
    def admin_user(self):
        """Create mock admin user."""
        user = Mock(spec=User)
        user.id = 1
        user.role = UserRole.ADMIN
        user.branch_id = None
        user.full_name = "Admin User"
        return user
    
    @pytest.fixture
    def manager_user(self):
        """Create mock manager user."""
        user = Mock(spec=User)
        user.id = 2
        user.role = UserRole.MANAGER
        user.branch_id = 1
        user.full_name = "Manager User"
        return user
    
    @pytest.fixture
    def seller_user(self):
        """Create mock seller user."""
        user = Mock(spec=User)
        user.id = 3
        user.role = UserRole.SELLER
        user.branch_id = 1
        user.full_name = "Seller User"
        return user
    
    def test_admin_can_access_all_branches(self, service, admin_user):
        """Admin without branch filter should see all branches."""
        result = service._validate_branch_access(admin_user, None)
        assert result is None
    
    def test_admin_can_filter_specific_branch(self, service, admin_user):
        """Admin with branch filter should see specified branch."""
        result = service._validate_branch_access(admin_user, 2)
        assert result == 2
    
    def test_manager_sees_only_own_branch(self, service, manager_user):
        """Manager should only see their assigned branch."""
        result = service._validate_branch_access(manager_user, None)
        assert result == 1
    
    def test_manager_cannot_access_other_branch(self, service, manager_user):
        """Manager trying to access another branch should raise PermissionError."""
        with pytest.raises(PermissionError) as exc_info:
            service._validate_branch_access(manager_user, 2)
        assert "does not have permission" in str(exc_info.value)
    
    def test_seller_sees_only_own_branch(self, service, seller_user):
        """Seller should only see their assigned branch."""
        result = service._validate_branch_access(seller_user, None)
        assert result == 1
    
    def test_seller_cannot_override_branch(self, service, seller_user):
        """Seller trying to request another branch should raise PermissionError."""
        with pytest.raises(PermissionError) as exc_info:
            service._validate_branch_access(seller_user, 2)
        assert "does not have permission" in str(exc_info.value)


class TestReportsServiceValidation:
    """Test data validation in ReportsService."""
    
    @pytest.fixture
    def service(self):
        """Create service with mocked database."""
        return ReportsService(Mock())
    
    def test_valid_date_range_accepted(self, service):
        """Valid date range should not raise error."""
        start = datetime(2025, 1, 1)
        end = datetime(2025, 1, 31)
        service._validate_date_range(start, end)  # Should not raise
    
    def test_same_date_accepted(self, service):
        """Same start and end date should be accepted."""
        same_date = datetime(2025, 1, 15)
        service._validate_date_range(same_date, same_date)  # Should not raise
    
    def test_end_before_start_rejected(self, service):
        """End date before start date should raise ValueError."""
        start = datetime(2025, 1, 31)
        end = datetime(2025, 1, 1)
        
        with pytest.raises(ValueError) as exc_info:
            service._validate_date_range(start, end)
        assert "must be after or equal to" in str(exc_info.value)
    
    def test_range_over_2_years_rejected(self, service):
        """Date range over 2 years should raise ValueError."""
        start = datetime(2023, 1, 1)
        end = datetime(2025, 12, 31)
        
        with pytest.raises(ValueError) as exc_info:
            service._validate_date_range(start, end)
        assert "cannot exceed 2 years" in str(exc_info.value)
    
    def test_date_to_datetime_start_of_day(self, service):
        """Date conversion should default to start of day."""
        d = date(2025, 1, 15)
        result = service._date_to_datetime(d)
        
        assert result.year == 2025
        assert result.month == 1
        assert result.day == 15
        assert result.hour == 0
        assert result.minute == 0
        assert result.second == 0
    
    def test_date_to_datetime_end_of_day(self, service):
        """Date conversion with end_of_day=True should give 23:59:59."""
        d = date(2025, 1, 15)
        result = service._date_to_datetime(d, end_of_day=True)
        
        assert result.year == 2025
        assert result.month == 1
        assert result.day == 15
        assert result.hour == 23
        assert result.minute == 59
        assert result.second == 59


class TestReportsServiceDashboard:
    """Test dashboard stats generation."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        db = Mock()
        # Mock query().filter().count() chain
        db.query.return_value.filter.return_value.count.return_value = 5
        return db
    
    @pytest.fixture
    def service(self, mock_db):
        """Create service with mocked dependencies."""
        service = ReportsService(mock_db)
        
        # Mock repository methods
        service.reports_repo = Mock()
        service.reports_repo.get_sales_total_for_period = Mock(return_value=Decimal("1000.00"))
        
        # Mock product repository
        service.product_repo = Mock()
        service.product_repo.count = Mock(return_value=50)
        service.product_repo.get_all = Mock(return_value=[])
        
        return service
    
    @pytest.fixture
    def admin_user(self):
        """Create mock admin user."""
        user = Mock(spec=User)
        user.role = UserRole.ADMIN
        user.branch_id = None
        return user
    
    def test_dashboard_stats_structure(self, service, admin_user):
        """Dashboard stats should return correct structure."""
        stats = service.get_dashboard_stats(admin_user)
        
        assert hasattr(stats, 'total_sales_today')
        assert hasattr(stats, 'total_sales_month')
        assert hasattr(stats, 'total_products')
        assert hasattr(stats, 'low_stock_products')
        assert hasattr(stats, 'active_branches')
        assert hasattr(stats, 'total_users')
    
    def test_dashboard_stats_calls_repository(self, service, admin_user):
        """Dashboard stats should call repository methods correctly."""
        service.get_dashboard_stats(admin_user)
        
        # Should call get_sales_total_for_period twice (today and month)
        assert service.reports_repo.get_sales_total_for_period.call_count == 2
    
    def test_dashboard_stats_respects_permissions(self, service):
        """Dashboard stats should respect user permissions."""
        seller = Mock(spec=User)
        seller.role = UserRole.SELLER
        seller.branch_id = 1
        
        service.get_dashboard_stats(seller, branch_id=None)
        
        # Should call repository with seller's branch_id
        calls = service.reports_repo.get_sales_total_for_period.call_args_list
        for call in calls:
            assert call[1].get('branch_id') == 1


class TestReportsServiceSalesReport:
    """Test sales report generation."""
    
    @pytest.fixture
    def service(self):
        """Create service with mocked dependencies."""
        service = ReportsService(Mock())
        
        # Mock repository methods
        service.reports_repo = Mock()
        service.reports_repo.get_sales_total_for_period = Mock(return_value=Decimal("5000.00"))
        service.reports_repo.get_sales_count_for_period = Mock(return_value=20)
        service.reports_repo.get_top_products = Mock(return_value=[])
        service.reports_repo.get_branch_sales = Mock(return_value=[])
        
        return service
    
    @pytest.fixture
    def admin_user(self):
        """Create mock admin user."""
        user = Mock(spec=User)
        user.role = UserRole.ADMIN
        user.branch_id = None
        return user
    
    def test_sales_report_calculates_average(self, service, admin_user):
        """Sales report should calculate average sale correctly."""
        report = service.get_sales_report(
            admin_user,
            date(2025, 1, 1),
            date(2025, 1, 31)
        )
        
        # 5000 / 20 = 250
        assert report.average_sale == Decimal("250.00")
    
    def test_sales_report_handles_zero_transactions(self, service, admin_user):
        """Sales report with 0 transactions should have 0 average."""
        service.reports_repo.get_sales_count_for_period = Mock(return_value=0)
        service.reports_repo.get_sales_total_for_period = Mock(return_value=Decimal("0.00"))
        
        report = service.get_sales_report(
            admin_user,
            date(2025, 1, 1),
            date(2025, 1, 31)
        )
        
        assert report.average_sale == Decimal("0")
    
    def test_sales_report_includes_branch_data_for_admin(self, service, admin_user):
        """Sales report for admin should include branch comparison."""
        # Mock branch sales data - create Mocks with name attribute
        branch_a = Mock()
        branch_a.name = "Branch A"
        branch_a.total_sales = Decimal("2000")
        branch_a.total_transactions = 10
        
        branch_b = Mock()
        branch_b.name = "Branch B"
        branch_b.total_sales = Decimal("3000")
        branch_b.total_transactions = 10
        
        mock_branch_data = [branch_a, branch_b]
        service.reports_repo.get_branch_sales = Mock(return_value=mock_branch_data)
        
        report = service.get_sales_report(
            admin_user,
            date(2025, 1, 1),
            date(2025, 1, 31)
        )
        
        assert len(report.sales_by_branch) == 2
        assert report.sales_by_branch[0].branch_name == "Branch A"
        assert report.sales_by_branch[1].branch_name == "Branch B"
    
    def test_sales_report_excludes_branch_data_for_non_admin(self, service):
        """Sales report for non-admin should not include branch comparison."""
        seller = Mock(spec=User)
        seller.role = UserRole.SELLER
        seller.branch_id = 1
        
        report = service.get_sales_report(
            seller,
            date(2025, 1, 1),
            date(2025, 1, 31)
        )
        
        assert len(report.sales_by_branch) == 0
    
    def test_sales_report_validates_date_range(self, service, admin_user):
        """Sales report should validate date range."""
        # End date before start date
        with pytest.raises(ValueError):
            service.get_sales_report(
                admin_user,
                date(2025, 12, 31),
                date(2025, 1, 1)
            )


class TestReportsServiceChartData:
    """Test chart data generation."""
    
    @pytest.fixture
    def service(self):
        """Create service with mocked dependencies."""
        service = ReportsService(Mock())
        service.reports_repo = Mock()
        return service
    
    @pytest.fixture
    def admin_user(self):
        """Create mock admin user."""
        user = Mock(spec=User)
        user.role = UserRole.ADMIN
        user.branch_id = None
        return user
    
    def test_daily_sales_transforms_data_correctly(self, service, admin_user):
        """Daily sales should transform repository data to schema."""
        mock_daily_data = [
            Mock(sale_date=date(2025, 1, 1), daily_sales=Decimal("100"), daily_transactions=5),
            Mock(sale_date=date(2025, 1, 2), daily_sales=Decimal("200"), daily_transactions=10),
        ]
        service.reports_repo.get_daily_sales = Mock(return_value=mock_daily_data)
        
        result = service.get_daily_sales(
            admin_user,
            date(2025, 1, 1),
            date(2025, 1, 2)
        )
        
        assert len(result) == 2
        assert result[0].date == "2025-01-01"
        assert result[0].sales == Decimal("100")
        assert result[0].transactions == 5
    
    def test_products_chart_data_limits_results(self, service, admin_user):
        """Products chart data should respect limit parameter."""
        service.reports_repo.get_products_chart_data = Mock(return_value=[])
        
        service.get_products_chart_data(
            admin_user,
            date(2025, 1, 1),
            date(2025, 1, 31),
            limit=5
        )
        
        # Verify limit was passed to repository
        call_args = service.reports_repo.get_products_chart_data.call_args
        assert call_args[1]['limit'] == 5
    
    def test_branches_chart_requires_admin(self, service):
        """Branches chart data should only be accessible by admin."""
        seller = Mock(spec=User)
        seller.role = UserRole.SELLER
        seller.branch_id = 1
        
        with pytest.raises(PermissionError) as exc_info:
            service.get_branches_chart_data(
                seller,
                date(2025, 1, 1),
                date(2025, 1, 31)
            )
        assert "Admin access required" in str(exc_info.value)
    
    def test_branches_chart_allows_admin(self, service, admin_user):
        """Branches chart data should work for admin."""
        # Create Mocks with name attribute
        branch_a = Mock()
        branch_a.name = "Branch A"
        branch_a.total_sales = Decimal("1000")
        
        branch_b = Mock()
        branch_b.name = "Branch B"
        branch_b.total_sales = Decimal("2000")
        
        mock_branch_data = [branch_a, branch_b]
        service.reports_repo.get_branch_sales_chart_data = Mock(return_value=mock_branch_data)
        
        result = service.get_branches_chart_data(
            admin_user,
            date(2025, 1, 1),
            date(2025, 1, 31)
        )
        
        assert len(result) == 2
        assert result[0].name == "Branch A"
        assert result[0].value == Decimal("1000")
