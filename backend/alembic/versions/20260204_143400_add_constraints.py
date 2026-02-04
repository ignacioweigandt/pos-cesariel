"""Add unique constraints and check constraints for production

Revision ID: prod_constraints_001
Revises: [PREVIOUS_REVISION]
Create Date: 2024-02-04

Este script agrega:
- UNIQUE constraints para prevenir duplicados
- CHECK constraints para validar datos
- Índices compuestos para performance
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260204_143400'
down_revision = '0d1f17c059d8'  # Última revisión actual
branch_labels = None
depends_on = None


def upgrade():
    """Aplicar constraints y validaciones."""
    
    # ========================================
    # 1. UNIQUE CONSTRAINTS (Prevenir duplicados)
    # ========================================
    
    print("Adding UNIQUE constraints...")
    
    # BranchStock: Un producto solo puede tener UN registro por sucursal
    op.create_unique_constraint(
        'uq_branch_stock_branch_product',
        'branch_stock',
        ['branch_id', 'product_id']
    )
    
    # ProductSize: Un talle solo puede existir UNA vez por producto/sucursal
    op.create_unique_constraint(
        'uq_product_size_product_branch_size',
        'product_sizes',
        ['product_id', 'branch_id', 'size']
    )
    
    # BranchTaxRate: Un impuesto solo puede aplicarse UNA vez por sucursal
    op.create_unique_constraint(
        'uq_branch_tax_rate_branch_tax',
        'branch_tax_rates',
        ['branch_id', 'tax_rate_id']
    )
    
    # BranchPaymentMethod: Un método de pago solo puede estar UNA vez por sucursal
    op.create_unique_constraint(
        'uq_branch_payment_method_branch_payment',
        'branch_payment_methods',
        ['branch_id', 'payment_method_id']
    )
    
    # NotificationSetting: Un usuario solo puede tener UNA configuración
    # (Ya existe como unique=True en el modelo, pero por las dudas)
    try:
        op.create_unique_constraint(
            'uq_notification_setting_user',
            'notification_settings',
            ['user_id']
        )
    except:
        print("NotificationSetting.user_id ya es único")
    
    # ========================================
    # 2. CHECK CONSTRAINTS (Validar datos)
    # ========================================
    
    print("Adding CHECK constraints...")
    
    # Stock nunca puede ser negativo
    op.create_check_constraint(
        'chk_branch_stock_quantity_positive',
        'branch_stock',
        'stock_quantity >= 0'
    )
    
    op.create_check_constraint(
        'chk_product_size_quantity_positive',
        'product_sizes',
        'stock_quantity >= 0'
    )
    
    op.create_check_constraint(
        'chk_product_stock_positive',
        'products',
        'stock_quantity >= 0'
    )
    
    # Precios no negativos
    op.create_check_constraint(
        'chk_product_price_positive',
        'products',
        'price >= 0'
    )
    
    op.create_check_constraint(
        'chk_product_cost_positive',
        'products',
        'cost IS NULL OR cost >= 0'
    )
    
    op.create_check_constraint(
        'chk_product_ecommerce_price_positive',
        'products',
        'ecommerce_price IS NULL OR ecommerce_price >= 0'
    )
    
    # Ventas: totales no negativos
    op.create_check_constraint(
        'chk_sale_subtotal_positive',
        'sales',
        'subtotal >= 0'
    )
    
    op.create_check_constraint(
        'chk_sale_total_positive',
        'sales',
        'total_amount >= 0'
    )
    
    op.create_check_constraint(
        'chk_sale_tax_positive',
        'sales',
        'tax_amount >= 0'
    )
    
    op.create_check_constraint(
        'chk_sale_discount_positive',
        'sales',
        'discount_amount >= 0'
    )
    
    # SaleItem: cantidades y precios válidos
    op.create_check_constraint(
        'chk_sale_item_quantity_positive',
        'sale_items',
        'quantity > 0'
    )
    
    op.create_check_constraint(
        'chk_sale_item_price_positive',
        'sale_items',
        'unit_price >= 0 AND total_price >= 0'
    )
    
    # PaymentConfig: recargos válidos (0-100%)
    op.create_check_constraint(
        'chk_payment_config_surcharge_valid',
        'payment_config',
        'surcharge_percentage >= 0 AND surcharge_percentage <= 100'
    )
    
    # TaxRate: rate válido (0-100%)
    op.create_check_constraint(
        'chk_tax_rate_rate_valid',
        'tax_rates',
        'rate >= 0 AND rate <= 100'
    )
    
    # NotificationSetting: threshold positivo
    op.create_check_constraint(
        'chk_notification_threshold_positive',
        'notification_settings',
        'low_stock_threshold > 0'
    )
    
    # WhatsAppSale: si confirmado, debe tener sale_id
    # NOTA: Comentado porque la estructura actual no tiene columna 'status'
    # y sale_id ya es NOT NULL por defecto
    # op.create_check_constraint(
    #     'chk_whatsapp_sale_confirmed_has_sale',
    #     'whatsapp_sales',
    #     "status != 'CONFIRMED' OR sale_id IS NOT NULL"
    # )
    
    print("✅ Constraints agregados exitosamente")


def downgrade():
    """Revertir constraints (por si hay que rollback)."""
    
    print("Removing constraints...")
    
    # UNIQUE constraints
    op.drop_constraint('uq_branch_stock_branch_product', 'branch_stock', type_='unique')
    op.drop_constraint('uq_product_size_product_branch_size', 'product_sizes', type_='unique')
    op.drop_constraint('uq_branch_tax_rate_branch_tax', 'branch_tax_rates', type_='unique')
    op.drop_constraint('uq_branch_payment_method_branch_payment', 'branch_payment_methods', type_='unique')
    
    try:
        op.drop_constraint('uq_notification_setting_user', 'notification_settings', type_='unique')
    except:
        pass
    
    # CHECK constraints
    constraints_to_drop = [
        ('chk_branch_stock_quantity_positive', 'branch_stock'),
        ('chk_product_size_quantity_positive', 'product_sizes'),
        ('chk_product_stock_positive', 'products'),
        ('chk_product_price_positive', 'products'),
        ('chk_product_cost_positive', 'products'),
        ('chk_product_ecommerce_price_positive', 'products'),
        ('chk_sale_subtotal_positive', 'sales'),
        ('chk_sale_total_positive', 'sales'),
        ('chk_sale_tax_positive', 'sales'),
        ('chk_sale_discount_positive', 'sales'),
        ('chk_sale_item_quantity_positive', 'sale_items'),
        ('chk_sale_item_price_positive', 'sale_items'),
        ('chk_payment_config_surcharge_valid', 'payment_config'),
        ('chk_tax_rate_rate_valid', 'tax_rates'),
        ('chk_notification_threshold_positive', 'notification_settings'),
        # ('chk_whatsapp_sale_confirmed_has_sale', 'whatsapp_sales'),  # Comentado
    ]
    
    for constraint_name, table_name in constraints_to_drop:
        try:
            op.drop_constraint(constraint_name, table_name, type_='check')
        except:
            print(f"Warning: No se pudo eliminar {constraint_name}")
    
    print("✅ Rollback completado")
