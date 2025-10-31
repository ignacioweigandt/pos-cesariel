import pytest
import asyncio
from typing import Generator, AsyncGenerator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

# Import our FastAPI app and dependencies
from main import app
from database import get_db, Base
from app.models import User, Branch, Category, Product, Sale, SaleItem
from auth import get_current_active_user

# Test database URL - use SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with overridden database dependency."""
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear overrides
    app.dependency_overrides.clear()


@pytest.fixture
def test_branch(db_session):
    """Create a test branch."""
    branch = Branch(
        name="Test Branch",
        address="123 Test Street",
        phone="555-0123",
        email="test@branch.com"
    )
    db_session.add(branch)
    db_session.commit()
    db_session.refresh(branch)
    return branch


@pytest.fixture
def test_admin_user(db_session, test_branch):
    """Create a test admin user."""
    from auth import get_password_hash
    
    user = User(
        email="admin@test.com",
        username="testadmin",
        full_name="Test Admin",
        hashed_password=get_password_hash("testpass123"),
        role="ADMIN",
        branch_id=test_branch.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_manager_user(db_session, test_branch):
    """Create a test manager user."""
    from auth import get_password_hash
    
    user = User(
        email="manager@test.com",
        username="testmanager",
        full_name="Test Manager",
        hashed_password=get_password_hash("testpass123"),
        role="MANAGER",
        branch_id=test_branch.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_seller_user(db_session, test_branch):
    """Create a test seller user."""
    from auth import get_password_hash
    
    user = User(
        email="seller@test.com",
        username="testseller",
        full_name="Test Seller",
        hashed_password=get_password_hash("testpass123"),
        role="SELLER",
        branch_id=test_branch.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_category(db_session):
    """Create a test category."""
    category = Category(
        name="Test Category",
        description="A test category"
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


@pytest.fixture
def test_product(db_session, test_category):
    """Create a test product."""
    product = Product(
        name="Test Product",
        description="A test product",
        sku="TEST001",
        barcode="1234567890",
        category_id=test_category.id,
        price=10.99,
        cost=5.50,
        stock_quantity=100,
        min_stock=10,
        is_active=True,
        show_in_ecommerce=True
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def auth_headers_admin(client, test_admin_user):
    """Get authentication headers for admin user."""
    response = client.post(
        "/auth/login-json",
        json={
            "username": test_admin_user.username,
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_manager(client, test_manager_user):
    """Get authentication headers for manager user."""
    response = client.post(
        "/auth/login-json",
        json={
            "username": test_manager_user.username,
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_seller(client, test_seller_user):
    """Get authentication headers for seller user."""
    response = client.post(
        "/auth/login-json",
        json={
            "username": test_seller_user.username,
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_websocket_manager(mocker):
    """Mock WebSocket manager to avoid WebSocket calls during tests."""
    mock = mocker.patch("websocket_manager.manager")
    # Make all methods async-compatible
    mock.connect = mocker.AsyncMock()
    mock.disconnect = mocker.MagicMock()
    mock.send_personal_message = mocker.AsyncMock()
    mock.broadcast_to_branch = mocker.AsyncMock()
    mock.broadcast_to_all = mocker.AsyncMock()
    mock.broadcast_to_other_branches = mocker.AsyncMock()
    mock.get_connection_count = mocker.MagicMock(return_value=0)
    mock.get_branch_connection_count = mocker.MagicMock(return_value=0)
    mock.get_connected_branches = mocker.MagicMock(return_value=[])
    
    # Also mock the global notification functions
    mocker.patch("websocket_manager.notify_inventory_change", new_callable=mocker.AsyncMock)
    mocker.patch("websocket_manager.notify_new_sale", new_callable=mocker.AsyncMock)
    mocker.patch("websocket_manager.notify_low_stock", new_callable=mocker.AsyncMock)
    mocker.patch("websocket_manager.notify_system_message", new_callable=mocker.AsyncMock)
    mocker.patch("websocket_manager.notify_product_update", new_callable=mocker.AsyncMock)
    mocker.patch("websocket_manager.notify_sale_status_change", new_callable=mocker.AsyncMock)
    mocker.patch("websocket_manager.notify_dashboard_update", new_callable=mocker.AsyncMock)
    
    return mock


@pytest.fixture
def test_clothing_category(db_session):
    """Create a test clothing category."""
    category = Category(
        name="Indumentaria",
        description="Ropa con talles (remeras, buzos, camperas, pantalones)"
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


@pytest.fixture
def test_footwear_category(db_session):
    """Create a test footwear category."""
    category = Category(
        name="Calzado", 
        description="Zapatos, zapatillas y calzado en general"
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


@pytest.fixture
def test_product_with_sizes(db_session, test_clothing_category):
    """Create a test product with sizes enabled."""
    product = Product(
        name="Remera Test con Talles",
        description="Remera de prueba con gestión de talles",
        sku="REMERA-SIZES-001",
        barcode="1234567890555",
        category_id=test_clothing_category.id,
        price=25.99,
        cost=12.00,
        stock_quantity=0,  # Stock se maneja por talles
        min_stock=10,
        is_active=True,
        show_in_ecommerce=True,
        has_sizes=True
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def test_branch_secondary(db_session):
    """Create a secondary test branch."""
    branch = Branch(
        name="Sucursal Norte",
        address="Av. Norte 456, Ciudad",
        phone="555-0456",
        email="norte@test.com"
    )
    db_session.add(branch)
    db_session.commit()
    db_session.refresh(branch)
    return branch


@pytest.fixture
def test_import_log(db_session, test_admin_user):
    """Create a test import log."""
    from models import ImportLog
    
    import_log = ImportLog(
        filename="test_import.csv",
        total_rows=10,
        successful_imports=8,
        failed_imports=2,
        imported_by=test_admin_user.id,
        error_summary="2 products with invalid data"
    )
    db_session.add(import_log)
    db_session.commit()
    db_session.refresh(import_log)
    return import_log