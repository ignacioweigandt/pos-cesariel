"""Add version columns for optimistic locking

Revision ID: prod_locking_001
Revises: prod_stock_trigger_001
Create Date: 2024-02-04

Agrega columnas 'version' para implementar optimistic locking en:
- BranchStock (prevenir venta concurrente del mismo stock)
- ProductSize (prevenir venta concurrente de talles)

Esto previene race conditions cuando dos vendedores venden
el último producto simultáneamente.
"""
from alembic import op
import sqlalchemy as sa


revision = '20260204_143700'
down_revision = '20260204_143600'  # Depende de stock trigger
branch_labels = None
depends_on = None


def upgrade():
    """Agregar columnas de versión para locking."""
    
    print("Adding version columns for optimistic locking...")
    
    # BranchStock
    op.add_column('branch_stock', 
        sa.Column('version', sa.Integer(), nullable=False, server_default='0')
    )
    
    # ProductSize
    op.add_column('product_sizes',
        sa.Column('version', sa.Integer(), nullable=False, server_default='0')
    )
    
    # Sale (para prevenir cambios concurrentes de estado)
    op.add_column('sales',
        sa.Column('version', sa.Integer(), nullable=False, server_default='0')
    )
    
    print("✅ Version columns added successfully")


def downgrade():
    """Eliminar columnas de versión."""
    
    print("Dropping version columns...")
    
    op.drop_column('branch_stock', 'version')
    op.drop_column('product_sizes', 'version')
    op.drop_column('sales', 'version')
    
    print("✅ Version columns dropped successfully")
