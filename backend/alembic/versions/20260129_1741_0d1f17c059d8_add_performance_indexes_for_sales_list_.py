"""add performance indexes for sales list filters

Revision ID: 0d1f17c059d8
Revises: e23e20872fc1
Create Date: 2026-01-29 17:41:04.431084-03:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0d1f17c059d8'
down_revision = 'e23e20872fc1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Apply migration changes to upgrade the database schema.
    
    Creates performance indexes for sales list advanced filters:
    - idx_sales_created_at: Date range filtering
    - idx_sales_total_amount: Amount range filtering
    - idx_sales_payment_method_lower: Case-insensitive payment method filtering
    - idx_sales_order_status: Order status filtering
    - idx_sales_created_status: Composite index for date + status queries
    - idx_sales_customer_name_trgm: Full-text search on customer names
    - idx_sales_sale_number_trgm: Full-text search on sale numbers
    """
    # Create pg_trgm extension for trigram indexes
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')
    
    # Single-column indexes
    op.create_index('idx_sales_created_at', 'sales', ['created_at'], unique=False)
    op.create_index('idx_sales_total_amount', 'sales', ['total_amount'], unique=False)
    op.create_index('idx_sales_order_status', 'sales', ['order_status'], unique=False)
    
    # Functional index for case-insensitive payment method filtering
    op.create_index(
        'idx_sales_payment_method_lower', 
        'sales', 
        [sa.text('lower(payment_method::text)')], 
        unique=False
    )
    
    # Composite index for common query pattern (date + status)
    op.create_index('idx_sales_created_status', 'sales', ['created_at', 'order_status'], unique=False)
    
    # GIN trigram indexes for full-text search
    op.create_index(
        'idx_sales_customer_name_trgm', 
        'sales', 
        [sa.text('lower(customer_name::text)')], 
        unique=False, 
        postgresql_using='gin',
        postgresql_ops={'lower': 'gin_trgm_ops'}
    )
    op.create_index(
        'idx_sales_sale_number_trgm', 
        'sales', 
        [sa.text('lower(sale_number::text)')], 
        unique=False, 
        postgresql_using='gin',
        postgresql_ops={'lower': 'gin_trgm_ops'}
    )


def downgrade() -> None:
    """
    Revert migration changes to downgrade the database schema.
    
    Removes all performance indexes created in upgrade().
    """
    # Drop indexes in reverse order
    op.drop_index('idx_sales_sale_number_trgm', table_name='sales', postgresql_using='gin')
    op.drop_index('idx_sales_customer_name_trgm', table_name='sales', postgresql_using='gin')
    op.drop_index('idx_sales_created_status', table_name='sales')
    op.drop_index('idx_sales_payment_method_lower', table_name='sales')
    op.drop_index('idx_sales_order_status', table_name='sales')
    op.drop_index('idx_sales_total_amount', table_name='sales')
    op.drop_index('idx_sales_created_at', table_name='sales')
