"""Add composite indexes for performance optimization

Revision ID: prod_indexes_001
Revises: prod_constraints_001
Create Date: 2024-02-04

Este script agrega índices compuestos para queries frecuentes:
- BranchStock lookups (branch + product)
- ProductSize lookups (product + branch + size)
- Sale queries (branch + date range)
- Inventory movements tracking
"""
from alembic import op
import sqlalchemy as sa


revision = '20260204_143500'
down_revision = '20260204_143400'  # Depende de constraints
branch_labels = None
depends_on = None


def upgrade():
    """Crear índices compuestos para performance."""
    
    print("Creating composite indexes...")
    
    # ========================================
    # INVENTORY - Queries de stock
    # ========================================
    
    # BranchStock: Buscar stock de producto en sucursal
    # Query: WHERE branch_id = X AND product_id = Y
    op.create_index(
        'idx_branch_stock_branch_product',
        'branch_stock',
        ['branch_id', 'product_id'],
        unique=False
    )
    
    # BranchStock: Productos con stock bajo
    # Query: WHERE stock_quantity < min_stock AND branch_id = X
    op.create_index(
        'idx_branch_stock_low_stock',
        'branch_stock',
        ['branch_id', 'stock_quantity'],
        unique=False
    )
    
    # ProductSize: Buscar talle específico de producto en sucursal
    # Query: WHERE product_id = X AND branch_id = Y AND size = Z
    op.create_index(
        'idx_product_size_product_branch_size',
        'product_sizes',
        ['product_id', 'branch_id', 'size'],
        unique=False
    )
    
    # ProductSize: Todos los talles de un producto en sucursal
    # Query: WHERE product_id = X AND branch_id = Y
    op.create_index(
        'idx_product_size_product_branch',
        'product_sizes',
        ['product_id', 'branch_id'],
        unique=False
    )
    
    # InventoryMovement: Historial de producto en sucursal
    # Query: WHERE product_id = X AND branch_id = Y ORDER BY created_at DESC
    op.create_index(
        'idx_inventory_movement_product_branch_date',
        'inventory_movements',
        ['product_id', 'branch_id', 'created_at'],
        unique=False
    )
    
    # InventoryMovement: Buscar movimientos por referencia (ej: por venta)
    # Query: WHERE reference_type = 'SALE' AND reference_id = X
    op.create_index(
        'idx_inventory_movement_reference',
        'inventory_movements',
        ['reference_type', 'reference_id'],
        unique=False
    )
    
    # ========================================
    # SALES - Queries de ventas
    # ========================================
    
    # Sale: Ventas de sucursal en rango de fechas
    # Query: WHERE branch_id = X AND created_at BETWEEN Y AND Z
    op.create_index(
        'idx_sale_branch_date',
        'sales',
        ['branch_id', 'created_at'],
        unique=False
    )
    
    # Sale: Ventas por usuario en rango
    # Query: WHERE user_id = X AND created_at BETWEEN Y AND Z
    op.create_index(
        'idx_sale_user_date',
        'sales',
        ['user_id', 'created_at'],
        unique=False
    )
    
    # Sale: Órdenes e-commerce por estado
    # Query: WHERE sale_type = 'ECOMMERCE' AND order_status = 'PENDING'
    op.create_index(
        'idx_sale_type_status',
        'sales',
        ['sale_type', 'order_status'],
        unique=False
    )
    
    # Sale: Buscar por email de cliente (reportes, soporte)
    # Query: WHERE customer_email = 'X'
    op.create_index(
        'idx_sale_customer_email',
        'sales',
        ['customer_email'],
        unique=False
    )
    
    # SaleItem: Items de una venta (ya está con sale_id FK)
    # SaleItem: Ventas de un producto específico
    # Query: WHERE product_id = X ORDER BY created_at DESC
    op.create_index(
        'idx_sale_item_product',
        'sale_items',
        ['product_id'],
        unique=False
    )
    
    # ========================================
    # PRODUCTS - Queries de productos
    # ========================================
    
    # Product: Productos de categoría activos
    # Query: WHERE category_id = X AND is_active = true
    op.create_index(
        'idx_product_category_active',
        'products',
        ['category_id', 'is_active'],
        unique=False
    )
    
    # Product: Productos para e-commerce
    # Query: WHERE show_in_ecommerce = true AND is_active = true
    op.create_index(
        'idx_product_ecommerce_active',
        'products',
        ['show_in_ecommerce', 'is_active'],
        unique=False
    )
    
    # Product: Productos por marca
    # Query: WHERE brand_id = X AND is_active = true
    op.create_index(
        'idx_product_brand_active',
        'products',
        ['brand_id', 'is_active'],
        unique=False
    )
    
    # ========================================
    # NOTIFICATIONS - Queries de notificaciones
    # ========================================
    
    # Notification: Notificaciones no leídas de usuario
    # Query: WHERE user_id = X AND is_read = false AND is_active = true
    op.create_index(
        'idx_notification_user_unread',
        'notifications',
        ['user_id', 'is_read', 'is_active'],
        unique=False
    )
    
    # Notification: Notificaciones de sucursal
    # Query: WHERE branch_id = X AND is_active = true ORDER BY created_at DESC
    op.create_index(
        'idx_notification_branch_date',
        'notifications',
        ['branch_id', 'is_active', 'created_at'],
        unique=False
    )
    
    # ========================================
    # ECOMMERCE - Queries de tienda
    # ========================================
    
    # ProductImage: Imágenes de producto ordenadas
    # Query: WHERE product_id = X ORDER BY image_order
    op.create_index(
        'idx_product_image_product_order',
        'product_images',
        ['product_id', 'image_order'],
        unique=False
    )
    
    # ProductImage: Imagen principal de producto
    # Query: WHERE product_id = X AND is_main = true
    op.create_index(
        'idx_product_image_product_main',
        'product_images',
        ['product_id', 'is_main'],
        unique=False
    )
    
    # StoreBanner: Banners activos ordenados
    # Query: WHERE is_active = true ORDER BY banner_order
    op.create_index(
        'idx_store_banner_active_order',
        'store_banners',
        ['is_active', 'banner_order'],
        unique=False
    )
    
    print("✅ Composite indexes created successfully")


def downgrade():
    """Eliminar índices compuestos."""
    
    print("Dropping composite indexes...")
    
    indexes_to_drop = [
        # Inventory
        ('idx_branch_stock_branch_product', 'branch_stock'),
        ('idx_branch_stock_low_stock', 'branch_stock'),
        ('idx_product_size_product_branch_size', 'product_sizes'),
        ('idx_product_size_product_branch', 'product_sizes'),
        ('idx_inventory_movement_product_branch_date', 'inventory_movements'),
        ('idx_inventory_movement_reference', 'inventory_movements'),
        
        # Sales
        ('idx_sale_branch_date', 'sales'),
        ('idx_sale_user_date', 'sales'),
        ('idx_sale_type_status', 'sales'),
        ('idx_sale_customer_email', 'sales'),
        ('idx_sale_item_product', 'sale_items'),
        
        # Products
        ('idx_product_category_active', 'products'),
        ('idx_product_ecommerce_active', 'products'),
        ('idx_product_brand_active', 'products'),
        
        # Notifications
        ('idx_notification_user_unread', 'notifications'),
        ('idx_notification_branch_date', 'notifications'),
        
        # Ecommerce
        ('idx_product_image_product_order', 'product_images'),
        ('idx_product_image_product_main', 'product_images'),
        ('idx_store_banner_active_order', 'store_banners'),
    ]
    
    for index_name, table_name in indexes_to_drop:
        try:
            op.drop_index(index_name, table_name=table_name)
        except:
            print(f"Warning: No se pudo eliminar {index_name}")
    
    print("✅ Indexes dropped successfully")
