import pytest
from unittest.mock import Mock, patch
from sqlalchemy.exc import SQLAlchemyError

from database import get_db, init_db, check_db_connection


@pytest.mark.unit
class TestDatabaseConnection:
    """Test database connection functionality."""
    
    def test_get_db_generator(self, db_session):
        """Test that get_db returns a database session generator."""
        # Mock the SessionLocal to return our test session
        with patch('database.SessionLocal') as mock_session:
            mock_session.return_value = db_session
            
            # Get the generator
            db_gen = get_db()
            
            # Should yield the session
            session = next(db_gen)
            assert session == db_session
            
            # Should close when done
            try:
                next(db_gen)
            except StopIteration:
                pass  # Expected behavior
    
    def test_get_db_closes_session_on_exception(self):
        """Test that get_db properly closes session on exception."""
        mock_session = Mock()
        
        with patch('database.SessionLocal') as mock_session_local:
            mock_session_local.return_value = mock_session
            
            db_gen = get_db()
            session = next(db_gen)
            
            # Simulate an exception by trying to get next value
            try:
                next(db_gen)
            except StopIteration:
                pass
            
            # Session should be closed
            mock_session.close.assert_called_once()


@pytest.mark.unit
class TestDatabaseInitialization:
    """Test database initialization functionality."""
    
    @patch('database.Base.metadata.create_all')
    @patch('database.engine')
    def test_init_db_creates_tables(self, mock_engine, mock_create_all):
        """Test that init_db creates all database tables."""
        init_db()
        
        mock_create_all.assert_called_once_with(bind=mock_engine)
    
    @patch('database.Base.metadata.create_all')
    @patch('database.engine')
    def test_init_db_handles_exceptions(self, mock_engine, mock_create_all):
        """Test that init_db handles database exceptions gracefully."""
        mock_create_all.side_effect = SQLAlchemyError("Database error")
        
        # Should not raise exception
        try:
            init_db()
        except SQLAlchemyError:
            pytest.fail("init_db should handle SQLAlchemy exceptions gracefully")


@pytest.mark.unit
class TestDatabaseHealthCheck:
    """Test database health check functionality."""
    
    @patch('database.SessionLocal')
    def test_check_db_connection_success(self, mock_session_local):
        """Test successful database connection check."""
        mock_session = Mock()
        mock_session_local.return_value = mock_session
        mock_session.execute.return_value = None
        
        result = check_db_connection()
        
        assert result is True
        mock_session.execute.assert_called_once()
        mock_session.close.assert_called_once()
    
    @patch('database.SessionLocal')
    def test_check_db_connection_failure(self, mock_session_local):
        """Test database connection check failure."""
        mock_session = Mock()
        mock_session_local.return_value = mock_session
        mock_session.execute.side_effect = SQLAlchemyError("Connection failed")
        
        result = check_db_connection()
        
        assert result is False
        mock_session.close.assert_called_once()
    
    @patch('database.SessionLocal')
    def test_check_db_connection_session_creation_failure(self, mock_session_local):
        """Test database connection check when session creation fails."""
        mock_session_local.side_effect = SQLAlchemyError("Session creation failed")
        
        result = check_db_connection()
        
        assert result is False


@pytest.mark.unit
class TestDatabaseConfiguration:
    """Test database configuration and settings."""
    
    def test_database_url_configuration(self):
        """Test that database URL is properly configured."""
        from database import SQLALCHEMY_DATABASE_URL
        
        # Should have a valid database URL
        assert SQLALCHEMY_DATABASE_URL is not None
        assert isinstance(SQLALCHEMY_DATABASE_URL, str)
        assert len(SQLALCHEMY_DATABASE_URL) > 0
    
    def test_engine_configuration(self):
        """Test that database engine is properly configured."""
        from database import engine
        
        # Should have a valid engine
        assert engine is not None
        
        # Should have proper configuration
        assert hasattr(engine, 'url')
        assert hasattr(engine, 'connect')
    
    def test_session_local_configuration(self):
        """Test that SessionLocal is properly configured."""
        from database import SessionLocal
        
        # Should be a sessionmaker
        assert SessionLocal is not None
        assert hasattr(SessionLocal, '__call__')
    
    def test_base_model_configuration(self):
        """Test that Base model is properly configured."""
        from database import Base
        
        # Should have metadata
        assert hasattr(Base, 'metadata')
        assert hasattr(Base.metadata, 'tables')


@pytest.mark.unit
class TestDatabaseTransactions:
    """Test database transaction handling."""
    
    def test_session_commit_rollback(self, db_session):
        """Test session commit and rollback functionality."""
        from app.models import Category
        
        # Create a test category
        category = Category(name="Test Category", description="Test")
        db_session.add(category)
        
        # Should not be committed yet
        assert category.id is None
        
        # Commit
        db_session.commit()
        assert category.id is not None
        
        # Test rollback
        category.name = "Modified Name"
        db_session.rollback()
        
        # Changes should be rolled back
        db_session.refresh(category)
        assert category.name == "Test Category"
    
    def test_session_flush(self, db_session):
        """Test session flush functionality."""
        from app.models import Category
        
        category = Category(name="Flush Test", description="Test flush")
        db_session.add(category)
        
        # Flush should assign ID but not commit
        db_session.flush()
        assert category.id is not None
        
        # Rollback should still work
        db_session.rollback()
        
        # Category should not exist after rollback
        result = db_session.query(Category).filter_by(name="Flush Test").first()
        assert result is None


@pytest.mark.unit
class TestDatabaseQueries:
    """Test common database query patterns."""
    
    def test_query_filtering(self, db_session, test_category):
        """Test basic query filtering."""
        from app.models import Category
        
        # Query by name
        result = db_session.query(Category).filter_by(name=test_category.name).first()
        assert result is not None
        assert result.id == test_category.id
        
        # Query by non-existent name
        result = db_session.query(Category).filter_by(name="Non-existent").first()
        assert result is None
    
    def test_query_ordering(self, db_session):
        """Test query ordering."""
        from app.models import Category
        
        # Create multiple categories
        categories = [
            Category(name="Z Category", description="Last"),
            Category(name="A Category", description="First"),
            Category(name="M Category", description="Middle")
        ]
        
        for cat in categories:
            db_session.add(cat)
        db_session.commit()
        
        # Query with ordering
        results = db_session.query(Category).order_by(Category.name).all()
        
        assert len(results) >= 3
        # Find our test categories in results
        test_cats = [cat for cat in results if cat.name in ["A Category", "M Category", "Z Category"]]
        assert test_cats[0].name == "A Category"
        assert test_cats[1].name == "M Category"
        assert test_cats[2].name == "Z Category"
    
    def test_query_pagination(self, db_session):
        """Test query pagination."""
        from app.models import Category
        
        # Create multiple categories
        for i in range(10):
            category = Category(name=f"Category {i:02d}", description=f"Description {i}")
            db_session.add(category)
        db_session.commit()
        
        # Test pagination
        page_1 = db_session.query(Category).limit(5).all()
        page_2 = db_session.query(Category).offset(5).limit(5).all()
        
        assert len(page_1) == 5
        assert len(page_2) >= 5  # At least 5, might have our test category too
        
        # IDs should be different
        page_1_ids = {cat.id for cat in page_1}
        page_2_ids = {cat.id for cat in page_2}
        assert len(page_1_ids.intersection(page_2_ids)) == 0