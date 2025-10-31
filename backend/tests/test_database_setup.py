import pytest
import tempfile
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base
from app.models import User, Branch, Category, Product, Sale, SaleItem, InventoryMovement


@pytest.mark.integration
class TestDatabaseSetup:
    """Test database setup and configuration for testing."""
    
    def test_in_memory_database_creation(self):
        """Test that we can create an in-memory SQLite database."""
        # Create in-memory database
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        inspector = engine.inspect(engine)
        table_names = inspector.get_table_names()
        
        expected_tables = [
            'branches', 'users', 'categories', 'products', 'sales', 
            'sale_items', 'inventory_movements', 'payment_configs',
            'ecommerce_configs', 'product_images', 'store_banners'
        ]
        
        for table in expected_tables:
            assert table in table_names
    
    def test_temporary_file_database(self):
        """Test creating a temporary file-based SQLite database."""
        # Create temporary database file
        with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
            db_path = tmp.name
        
        try:
            # Create engine with temporary file
            engine = create_engine(
                f"sqlite:///{db_path}",
                connect_args={"check_same_thread": False}
            )
            
            # Create tables
            Base.metadata.create_all(bind=engine)
            
            # Test basic operations
            SessionLocal = sessionmaker(bind=engine)
            session = SessionLocal()
            
            try:
                # Create test data
                branch = Branch(name="Test Branch", address="Test Address")
                session.add(branch)
                session.commit()
                
                # Verify data exists
                result = session.query(Branch).filter_by(name="Test Branch").first()
                assert result is not None
                assert result.name == "Test Branch"
                
            finally:
                session.close()
                
        finally:
            # Clean up temporary file
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    def test_database_isolation_between_tests(self):
        """Test that database state is isolated between tests."""
        # This test demonstrates the isolation pattern
        engine1 = create_engine("sqlite:///:memory:", poolclass=StaticPool)
        engine2 = create_engine("sqlite:///:memory:", poolclass=StaticPool)
        
        Base.metadata.create_all(bind=engine1)
        Base.metadata.create_all(bind=engine2)
        
        SessionLocal1 = sessionmaker(bind=engine1)
        SessionLocal2 = sessionmaker(bind=engine2)
        
        session1 = SessionLocal1()
        session2 = SessionLocal2()
        
        try:
            # Add data to first database
            branch1 = Branch(name="Database 1 Branch", address="Address 1")
            session1.add(branch1)
            session1.commit()
            
            # Add different data to second database
            branch2 = Branch(name="Database 2 Branch", address="Address 2")
            session2.add(branch2)
            session2.commit()
            
            # Verify isolation
            db1_branches = session1.query(Branch).all()
            db2_branches = session2.query(Branch).all()
            
            assert len(db1_branches) == 1
            assert len(db2_branches) == 1
            assert db1_branches[0].name == "Database 1 Branch"
            assert db2_branches[0].name == "Database 2 Branch"
            
        finally:
            session1.close()
            session2.close()


@pytest.mark.integration
class TestDatabaseConstraints:
    """Test database constraints and integrity."""
    
    def test_foreign_key_constraints(self, db_session, test_branch):
        """Test that foreign key constraints work properly."""
        from auth import get_password_hash
        
        # Create user with valid branch
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
        
        # Verify user was created
        assert user.id is not None
        assert user.branch_id == test_branch.id
        
        # Verify relationship works
        assert user.branch.name == test_branch.name
    
    def test_unique_constraints(self, db_session, test_branch):
        """Test unique constraints on critical fields."""
        from auth import get_password_hash
        
        # Create first user
        user1 = User(
            email="unique@example.com",
            username="uniqueuser",
            full_name="First User",
            hashed_password=get_password_hash("password123"),
            role="SELLER",
            branch_id=test_branch.id
        )
        db_session.add(user1)
        db_session.commit()
        
        # Try to create user with same email
        user2 = User(
            email="unique@example.com",  # Same email
            username="differentuser",
            full_name="Second User",
            hashed_password=get_password_hash("password123"),
            role="SELLER",
            branch_id=test_branch.id
        )
        db_session.add(user2)
        
        with pytest.raises(Exception):  # Should raise integrity error
            db_session.commit()
    
    def test_not_null_constraints(self, db_session, test_category):
        """Test NOT NULL constraints on required fields."""
        # Try to create product without required name
        product = Product(
            # name is missing (required)
            sku="TEST001",
            category_id=test_category.id,
            price=10.99
        )
        db_session.add(product)
        
        with pytest.raises(Exception):  # Should raise integrity error
            db_session.commit()


@pytest.mark.integration
class TestDatabasePerformance:
    """Test database performance and optimization."""
    
    def test_bulk_insert_performance(self, db_session, test_category):
        """Test bulk insert operations."""
        import time
        
        # Create many products at once
        products = []
        for i in range(100):
            product = Product(
                name=f"Bulk Product {i}",
                sku=f"BULK{i:03d}",
                category_id=test_category.id,
                price=10.99 + i,
                stock_quantity=100
            )
            products.append(product)
        
        start_time = time.time()
        db_session.add_all(products)
        db_session.commit()
        end_time = time.time()
        
        # Should complete reasonably quickly (under 1 second for 100 records)
        assert end_time - start_time < 1.0
        
        # Verify all products were created
        count = db_session.query(Product).filter(Product.name.like("Bulk Product%")).count()
        assert count == 100
    
    def test_query_performance_with_joins(self, db_session, test_admin_user, test_product):
        """Test query performance with joins."""
        import time
        
        # Create sale with items
        sale = Sale(
            sale_number="PERF-001",
            sale_type="POS",
            payment_method="CASH",
            total_amount=50.00,
            user_id=test_admin_user.id,
            branch_id=test_admin_user.branch_id
        )
        db_session.add(sale)
        db_session.commit()
        
        # Add multiple sale items
        for i in range(10):
            item = SaleItem(
                sale_id=sale.id,
                product_id=test_product.id,
                quantity=1,
                unit_price=5.00,
                total_price=5.00
            )
            db_session.add(item)
        db_session.commit()
        
        # Test complex query with joins
        start_time = time.time()
        
        result = db_session.query(Sale)\
            .join(SaleItem)\
            .join(Product)\
            .join(User)\
            .filter(Sale.sale_number == "PERF-001")\
            .first()
        
        end_time = time.time()
        
        # Should complete quickly
        assert end_time - start_time < 0.1
        assert result is not None
        assert result.sale_number == "PERF-001"


@pytest.mark.integration
class TestDatabaseMigrations:
    """Test database migration scenarios."""
    
    def test_table_creation_order(self):
        """Test that tables are created in correct order for foreign keys."""
        engine = create_engine("sqlite:///:memory:", poolclass=StaticPool)
        
        # This should not raise any errors
        Base.metadata.create_all(bind=engine)
        
        # Verify all tables exist
        inspector = engine.inspect(engine)
        table_names = inspector.get_table_names()
        
        # Tables with foreign keys should be created after their dependencies
        assert 'branches' in table_names
        assert 'users' in table_names
        assert 'categories' in table_names
        assert 'products' in table_names
        assert 'sales' in table_names
        assert 'sale_items' in table_names
    
    def test_table_drop_order(self):
        """Test that tables can be dropped in correct order."""
        engine = create_engine("sqlite:///:memory:", poolclass=StaticPool)
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # This should not raise any errors
        Base.metadata.drop_all(bind=engine)
        
        # Verify tables are gone
        inspector = engine.inspect(engine)
        table_names = inspector.get_table_names()
        
        assert len(table_names) == 0


@pytest.mark.integration
class TestDatabaseTransactionHandling:
    """Test database transaction handling in test environment."""
    
    def test_transaction_rollback(self, db_session, test_category):
        """Test that transactions can be rolled back properly."""
        # Start transaction
        product = Product(
            name="Rollback Test Product",
            sku="ROLLBACK001",
            category_id=test_category.id,
            price=10.99
        )
        db_session.add(product)
        db_session.flush()  # Flush but don't commit
        
        # Verify product exists in session but not committed
        assert product.id is not None
        
        # Rollback transaction
        db_session.rollback()
        
        # Verify product no longer exists
        result = db_session.query(Product).filter_by(sku="ROLLBACK001").first()
        assert result is None
    
    def test_nested_transaction_handling(self, db_session, test_category):
        """Test nested transaction scenarios."""
        # Create and commit first product
        product1 = Product(
            name="Nested Test Product 1",
            sku="NESTED001",
            category_id=test_category.id,
            price=10.99
        )
        db_session.add(product1)
        db_session.commit()
        
        # Start new transaction
        product2 = Product(
            name="Nested Test Product 2",
            sku="NESTED002",
            category_id=test_category.id,
            price=15.99
        )
        db_session.add(product2)
        
        # Simulate error and rollback
        db_session.rollback()
        
        # First product should still exist, second should not
        result1 = db_session.query(Product).filter_by(sku="NESTED001").first()
        result2 = db_session.query(Product).filter_by(sku="NESTED002").first()
        
        assert result1 is not None
        assert result2 is None
    
    def test_savepoint_handling(self, db_session, test_category):
        """Test savepoint functionality."""
        # Create first product
        product1 = Product(
            name="Savepoint Test Product 1",
            sku="SAVE001",
            category_id=test_category.id,
            price=10.99
        )
        db_session.add(product1)
        
        # Create savepoint
        savepoint = db_session.begin_nested()
        
        try:
            # Create second product
            product2 = Product(
                name="Savepoint Test Product 2",
                sku="SAVE002",
                category_id=test_category.id,
                price=15.99
            )
            db_session.add(product2)
            db_session.flush()
            
            # Rollback to savepoint
            savepoint.rollback()
            
        except Exception:
            savepoint.rollback()
            raise
        
        # Commit main transaction
        db_session.commit()
        
        # First product should exist, second should not
        result1 = db_session.query(Product).filter_by(sku="SAVE001").first()
        result2 = db_session.query(Product).filter_by(sku="SAVE002").first()
        
        assert result1 is not None
        assert result2 is None