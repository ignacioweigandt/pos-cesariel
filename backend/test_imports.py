"""
Test script to verify that all model imports work correctly.

This script tests the new modular model structure to ensure
backward compatibility with the old monolithic models.py.
"""

import sys
import traceback

def test_enum_imports():
    """Test that all enums can be imported."""
    print("Testing enum imports...")
    try:
        from app.models.enums import UserRole, SaleType, OrderStatus
        print("  [OK] Enum imports successful")
        return True
    except Exception as e:
        print(f"  [FAIL] Enum imports failed: {e}")
        traceback.print_exc()
        return False

def test_model_imports_via_package():
    """Test that models can be imported from app.models package."""
    print("\nTesting model imports via package...")
    try:
        from app.models import (
            # Enums
            UserRole, SaleType, OrderStatus,
            # User and Branch
            User, Branch,
            # Product
            Category, Product, ProductSize, ProductImage,
            # Inventory
            BranchStock, InventoryMovement, ImportLog,
            # Sales
            Sale, SaleItem,
            # Ecommerce
            EcommerceConfig, StoreBanner,
            # Payment
            PaymentConfig,
            # WhatsApp
            WhatsAppConfig, WhatsAppSale, SocialMediaConfig
        )
        print("  [OK] All model imports via package successful")
        return True
    except Exception as e:
        print(f"  [FAIL] Model imports via package failed: {e}")
        traceback.print_exc()
        return False

def test_model_imports_direct():
    """Test that models can be imported directly from their modules."""
    print("\nTesting direct model imports...")
    try:
        from app.models.user import User, Branch
        from app.models.product import Category, Product, ProductSize, ProductImage
        from app.models.inventory import BranchStock, InventoryMovement, ImportLog
        from app.models.sales import Sale, SaleItem
        from app.models.ecommerce import EcommerceConfig, StoreBanner
        from app.models.payment import PaymentConfig
        from app.models.whatsapp import WhatsAppConfig, WhatsAppSale, SocialMediaConfig
        print("  [OK] All direct model imports successful")
        return True
    except Exception as e:
        print(f"  [FAIL] Direct model imports failed: {e}")
        traceback.print_exc()
        return False

def test_model_attributes():
    """Test that imported models have expected attributes."""
    print("\nTesting model attributes...")
    try:
        from app.models import Product, User, Sale

        # Test Product model has expected methods
        assert hasattr(Product, 'get_stock_for_branch'), "Product missing get_stock_for_branch method"
        assert hasattr(Product, 'calculate_total_stock'), "Product missing calculate_total_stock method"

        # Test User model has expected columns
        assert hasattr(User, 'username'), "User missing username column"
        assert hasattr(User, 'role'), "User missing role column"

        # Test Sale model has expected columns
        assert hasattr(Sale, 'sale_number'), "Sale missing sale_number column"
        assert hasattr(Sale, 'sale_type'), "Sale missing sale_type column"

        print("  [OK] All model attributes present")
        return True
    except AssertionError as e:
        print(f"  [FAIL] Model attribute test failed: {e}")
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"  [FAIL] Unexpected error in attribute test: {e}")
        traceback.print_exc()
        return False

def test_enum_values():
    """Test that enums have expected values."""
    print("\nTesting enum values...")
    try:
        from app.models import UserRole, SaleType, OrderStatus

        # Test UserRole
        assert hasattr(UserRole, 'ADMIN'), "UserRole missing ADMIN"
        assert hasattr(UserRole, 'MANAGER'), "UserRole missing MANAGER"
        assert hasattr(UserRole, 'SELLER'), "UserRole missing SELLER"
        assert hasattr(UserRole, 'ECOMMERCE'), "UserRole missing ECOMMERCE"

        # Test SaleType
        assert hasattr(SaleType, 'POS'), "SaleType missing POS"
        assert hasattr(SaleType, 'ECOMMERCE'), "SaleType missing ECOMMERCE"

        # Test OrderStatus
        assert hasattr(OrderStatus, 'PENDING'), "OrderStatus missing PENDING"
        assert hasattr(OrderStatus, 'PROCESSING'), "OrderStatus missing PROCESSING"
        assert hasattr(OrderStatus, 'SHIPPED'), "OrderStatus missing SHIPPED"
        assert hasattr(OrderStatus, 'DELIVERED'), "OrderStatus missing DELIVERED"
        assert hasattr(OrderStatus, 'CANCELLED'), "OrderStatus missing CANCELLED"

        print("  [OK] All enum values present")
        return True
    except AssertionError as e:
        print(f"  [FAIL] Enum value test failed: {e}")
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"  [FAIL] Unexpected error in enum test: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all import tests."""
    print("=" * 60)
    print("POS Cesariel - Model Import Verification Tests")
    print("=" * 60)

    results = []

    # Run all tests
    results.append(("Enum Imports", test_enum_imports()))
    results.append(("Package Imports", test_model_imports_via_package()))
    results.append(("Direct Imports", test_model_imports_direct()))
    results.append(("Model Attributes", test_model_attributes()))
    results.append(("Enum Values", test_enum_values()))

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "PASSED" if result else "FAILED"
        print(f"{test_name:.<40} {status}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n[SUCCESS] All import tests passed!")
        return 0
    else:
        print(f"\n[FAILURE] {total - passed} test(s) failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
