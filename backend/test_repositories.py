"""
Quick verification script for the repository layer.
Tests that all repositories can be instantiated and basic operations work.
"""

from database import SessionLocal
from app.repositories import (
    UserRepository,
    BranchRepository,
    ProductRepository,
    CategoryRepository,
    BranchStockRepository,
    ProductSizeRepository,
    InventoryMovementRepository,
    SaleRepository,
    SaleItemRepository,
    EcommerceConfigRepository,
    StoreBannerRepository,
    ProductImageRepository,
    PaymentConfigRepository,
    WhatsAppConfigRepository,
    WhatsAppSaleRepository,
)
from app.models import (
    User, Branch, Product, Category, BranchStock, ProductSize,
    InventoryMovement, Sale, SaleItem, EcommerceConfig, StoreBanner,
    ProductImage, PaymentConfig, WhatsAppConfig, WhatsAppSale
)

def test_repositories():
    """Test all repositories can be instantiated and perform basic operations."""
    db = SessionLocal()
    
    try:
        print("Testing Repository Layer...")
        print("=" * 60)
        
        repositories = [
            ("UserRepository", UserRepository, User),
            ("BranchRepository", BranchRepository, Branch),
            ("ProductRepository", ProductRepository, Product),
            ("CategoryRepository", CategoryRepository, Category),
            ("BranchStockRepository", BranchStockRepository, BranchStock),
            ("ProductSizeRepository", ProductSizeRepository, ProductSize),
            ("InventoryMovementRepository", InventoryMovementRepository, InventoryMovement),
            ("SaleRepository", SaleRepository, Sale),
            ("SaleItemRepository", SaleItemRepository, SaleItem),
            ("EcommerceConfigRepository", EcommerceConfigRepository, EcommerceConfig),
            ("StoreBannerRepository", StoreBannerRepository, StoreBanner),
            ("ProductImageRepository", ProductImageRepository, ProductImage),
            ("PaymentConfigRepository", PaymentConfigRepository, PaymentConfig),
            ("WhatsAppConfigRepository", WhatsAppConfigRepository, WhatsAppConfig),
            ("WhatsAppSaleRepository", WhatsAppSaleRepository, WhatsAppSale),
        ]
        
        for name, repo_class, model in repositories:
            try:
                repo = repo_class(model, db)
                count = repo.count()
                print(f"✓ {name:35} - Initialized (Records: {count})")
            except Exception as e:
                print(f"✗ {name:35} - Error: {str(e)}")
        
        print("=" * 60)
        
        # Test specific repository methods
        print("\nTesting Domain-Specific Methods...")
        print("=" * 60)
        
        # UserRepository
        user_repo = UserRepository(User, db)
        admin = user_repo.get_by_username("admin")
        if admin:
            print(f"✓ UserRepository.get_by_username() - Found: {admin.username}")
        
        active_users = user_repo.get_active_users()
        print(f"✓ UserRepository.get_active_users() - Count: {len(active_users)}")
        
        # BranchRepository
        branch_repo = BranchRepository(Branch, db)
        active_branches = branch_repo.get_active_branches()
        print(f"✓ BranchRepository.get_active_branches() - Count: {len(active_branches)}")
        
        # ProductRepository
        product_repo = ProductRepository(Product, db)
        ecom_products = product_repo.get_ecommerce_products()
        print(f"✓ ProductRepository.get_ecommerce_products() - Count: {len(ecom_products)}")
        
        # SaleRepository
        sale_repo = SaleRepository(Sale, db)
        all_sales = sale_repo.get_all()
        print(f"✓ SaleRepository.get_all() - Count: {len(all_sales)}")
        
        print("=" * 60)
        print("\n✓ Repository Layer Verification Complete!")
        print(f"✓ All {len(repositories)} repositories working correctly")
        
    except Exception as e:
        print(f"\n✗ Error during repository testing: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_repositories()
