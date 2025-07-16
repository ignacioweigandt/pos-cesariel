import pytest
from datetime import timedelta
from jose import jwt, JWTError
from auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)
from models import UserRole


@pytest.mark.unit
class TestPasswordHashing:
    """Test password hashing and verification."""
    
    def test_password_hashing(self):
        """Test that passwords are hashed correctly."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Hash should be different from original password
        assert hashed != password
        # Hash should be a string
        assert isinstance(hashed, str)
        # Hash should not be empty
        assert len(hashed) > 0
    
    def test_password_verification_success(self):
        """Test that correct passwords are verified."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_password_verification_failure(self):
        """Test that incorrect passwords fail verification."""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False


@pytest.mark.unit
class TestJWTTokens:
    """Test JWT token creation and verification."""
    
    def test_create_access_token(self):
        """Test access token creation."""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Token should be a string
        assert isinstance(token, str)
        # Token should not be empty
        assert len(token) > 0
        # Token should contain dots (JWT format)
        assert "." in token
    
    def test_create_access_token_with_expiry(self):
        """Test access token creation with custom expiry."""
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_verify_token_success(self):
        """Test successful token verification."""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        try:
            decoded_data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            assert decoded_data is not None
            assert decoded_data["sub"] == "testuser"
        except JWTError:
            assert False, "Valid token should decode successfully"
    
    def test_verify_token_invalid(self):
        """Test verification of invalid token."""
        invalid_token = "invalid.token.here"
        
        try:
            jwt.decode(invalid_token, SECRET_KEY, algorithms=[ALGORITHM])
            assert False, "Invalid token should raise exception"
        except JWTError:
            assert True  # Expected behavior
    
    def test_verify_token_empty(self):
        """Test verification of empty token."""
        try:
            jwt.decode("", SECRET_KEY, algorithms=[ALGORITHM])
            assert False, "Empty token should raise exception"
        except JWTError:
            assert True  # Expected behavior
    
    def test_token_contains_expiry(self):
        """Test that token contains expiry information."""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        decoded_data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in decoded_data


@pytest.mark.unit 
class TestUserRoles:
    """Test user role functionality."""
    
    def test_user_roles_exist(self):
        """Test that all required user roles exist."""
        assert hasattr(UserRole, 'ADMIN')
        assert hasattr(UserRole, 'MANAGER') 
        assert hasattr(UserRole, 'SELLER')
        assert hasattr(UserRole, 'ECOMMERCE')
    
    def test_user_role_values(self):
        """Test user role values."""
        assert UserRole.ADMIN.value == "ADMIN"
        assert UserRole.MANAGER.value == "MANAGER"
        assert UserRole.SELLER.value == "SELLER"
        assert UserRole.ECOMMERCE.value == "ECOMMERCE"