# Models Package - Developer Guide

## Overview
This directory contains all SQLAlchemy ORM models for the POS Cesariel system, organized by domain.

## Structure

```
app/models/
├── __init__.py          # Central import hub - use this for imports
├── base.py              # Base classes and mixins
├── enums.py             # Enum definitions (UserRole, SaleType, OrderStatus)
├── user.py              # User authentication and branch management
├── product.py           # Product catalog and variants
├── inventory.py         # Stock management and movements
├── sales.py             # Sales transactions
├── ecommerce.py         # E-commerce configuration
├── payment.py           # Payment method configuration
└── whatsapp.py          # WhatsApp and social media integration
```

## How to Import Models

### Recommended: Import from Package
```python
from app.models import User, Product, Sale, Branch
from app.models import UserRole, SaleType, OrderStatus
```

### Alternative: Direct Imports
```python
from app.models.user import User, Branch
from app.models.product import Product, Category
from app.models.sales import Sale, SaleItem
```

### Import All Models
```python
from app.models import *
```

## Model Organization by Domain

### User Management (`user.py`)
- **User** - System users with role-based access
- **Branch** - Physical store locations

**Use Cases:**
- User authentication and authorization
- Branch-specific operations
- Multi-branch management

### Product Catalog (`product.py`)
- **Category** - Product categories
- **Product** - Main product entity with business methods
- **ProductSize** - Size variants (per branch)
- **ProductImage** - Additional product images

**Use Cases:**
- Product catalog management
- Size/variant management
- Image gallery handling

**Key Methods:**
```python
product.get_stock_for_branch(branch_id)
product.calculate_total_stock()
product.has_stock_in_branch(branch_id, quantity)
product.get_allowed_sizes()
```

### Inventory Management (`inventory.py`)
- **BranchStock** - Stock per branch
- **InventoryMovement** - Stock movement audit trail
- **ImportLog** - Bulk import tracking

**Use Cases:**
- Per-branch inventory control
- Stock auditing and history
- Bulk data imports

### Sales (`sales.py`)
- **Sale** - Sales transactions
- **SaleItem** - Individual line items

**Use Cases:**
- POS transactions
- E-commerce orders
- Sales reporting

### E-commerce (`ecommerce.py`)
- **EcommerceConfig** - Store configuration
- **StoreBanner** - Promotional banners

**Use Cases:**
- E-commerce settings management
- Banner/promotion management

### Payment (`payment.py`)
- **PaymentConfig** - Payment methods and surcharges

**Use Cases:**
- Payment method configuration
- Installment plans
- Surcharge management

### WhatsApp & Social (`whatsapp.py`)
- **WhatsAppConfig** - WhatsApp Business settings
- **WhatsAppSale** - WhatsApp-specific sale data
- **SocialMediaConfig** - Social media links

**Use Cases:**
- WhatsApp Business integration
- Social media link management
- WhatsApp sales tracking

## Enums (`enums.py`)

### UserRole
```python
UserRole.ADMIN       # Full system access
UserRole.MANAGER     # Branch management
UserRole.SELLER      # POS operations only
UserRole.ECOMMERCE   # E-commerce management
```

### SaleType
```python
SaleType.POS         # Physical store sale
SaleType.ECOMMERCE   # Online sale
```

### OrderStatus
```python
OrderStatus.PENDING      # Order created
OrderStatus.PROCESSING   # Being prepared
OrderStatus.SHIPPED      # Sent to customer
OrderStatus.DELIVERED    # Successfully delivered
OrderStatus.CANCELLED    # Cancelled
```

## Common Patterns

### Creating a New Product
```python
from app.models import Product, Category

product = Product(
    name="T-Shirt",
    sku="TSH-001",
    category_id=category.id,
    price=29.99,
    has_sizes=True
)
db.add(product)
db.commit()
```

### Checking Stock
```python
from app.models import Product

product = db.query(Product).filter_by(id=1).first()

# Check stock for a specific branch
if product.has_stock_in_branch(branch_id=1, quantity=5):
    print("Stock available")

# Get total stock across all branches
total = product.calculate_total_stock()
```

### Creating a Sale
```python
from app.models import Sale, SaleItem, SaleType, OrderStatus

sale = Sale(
    sale_number="SALE-2025-001",
    sale_type=SaleType.POS,
    branch_id=1,
    user_id=1,
    subtotal=100.00,
    total_amount=100.00,
    order_status=OrderStatus.PENDING
)

sale_item = SaleItem(
    sale=sale,
    product_id=1,
    quantity=2,
    unit_price=50.00,
    total_price=100.00
)

db.add(sale)
db.commit()
```

## Relationships

### Understanding Model Relationships

```python
# User → Branch (Many-to-One)
user.branch  # Get user's assigned branch

# Branch → Users (One-to-Many)
branch.users  # Get all users in branch

# Product → Category (Many-to-One)
product.category  # Get product's category

# Category → Products (One-to-Many)
category.products  # Get all products in category

# Sale → SaleItems (One-to-Many)
sale.sale_items  # Get all items in sale

# Product → ProductSizes (One-to-Many)
product.product_sizes  # Get all size variants
```

## Best Practices

### 1. Always Use the Package Import
```python
# Good
from app.models import User, Product

# Avoid (unless you have a specific reason)
from app.models.user import User
from app.models.product import Product
```

### 2. Use Enums for Type Safety
```python
# Good
sale.sale_type = SaleType.ECOMMERCE

# Bad
sale.sale_type = "ECOMMERCE"
```

### 3. Leverage Business Methods
```python
# Good - uses business logic
if product.has_stock_in_branch(branch_id, quantity):
    # proceed with sale

# Bad - manual calculation prone to errors
branch_stock = db.query(BranchStock).filter_by(
    product_id=product.id,
    branch_id=branch_id
).first()
if branch_stock and branch_stock.stock_quantity >= quantity:
    # proceed with sale
```

### 4. Use Proper Relationships
```python
# Good - SQLAlchemy handles the join
user = db.query(User).filter_by(id=1).first()
branch_name = user.branch.name

# Bad - manual join
user = db.query(User).filter_by(id=1).first()
branch = db.query(Branch).filter_by(id=user.branch_id).first()
branch_name = branch.name
```

## Adding New Models

When adding a new model:

1. Create it in the appropriate domain file (or create a new one)
2. Add the import to `__init__.py`
3. Add it to the `__all__` list in `__init__.py`
4. Document it properly with docstrings
5. Add unit tests

Example:
```python
# 1. Add to app/models/product.py
class ProductReview(Base):
    __tablename__ = "product_reviews"
    # ... model definition

# 2. Update app/models/__init__.py
from app.models.product import (
    Category,
    Product,
    ProductSize,
    ProductImage,
    ProductReview  # Add here
)

# 3. Update __all__ list
__all__ = [
    # ... other models
    "ProductReview",  # Add here
]
```

## Migration from Old Structure

The old `models.py` file is still present for backward compatibility. To migrate:

### Before (Old Import)
```python
from models import User, Product, Sale
```

### After (New Import)
```python
from app.models import User, Product, Sale
```

That's it! Everything else works the same way.

## Troubleshooting

### Import Errors
If you get import errors, ensure you're importing from `app.models`, not `models`:

```python
# Wrong
from models import User

# Correct
from app.models import User
```

### Circular Import Issues
The models are organized to avoid circular imports. Always import from `app.models` package, not directly from files.

### Relationship Loading
For better performance, use `joinedload` or `selectinload`:

```python
from sqlalchemy.orm import joinedload

users = db.query(User).options(joinedload(User.branch)).all()
```

## Need Help?

- Check the docstrings in each model file
- Review the original `models.py` for reference
- Consult the PHASE_1_COMPLETION.md document
- Ask the team if you're unsure about domain placement
