"""Add database trigger to auto-calculate Product.stock_quantity

Revision ID: prod_stock_trigger_001
Revises: prod_indexes_001
Create Date: 2024-02-04

Este trigger garantiza que Product.stock_quantity SIEMPRE sea calculado
automáticamente desde BranchStock y ProductSize, evitando ediciones manuales.

IMPORTANTE: Después de aplicar este trigger, Product.stock_quantity será
read-only en el sentido práctico (cualquier UPDATE será sobreescrito).
"""
from alembic import op


revision = '20260204_143600'
down_revision = '20260204_143500'  # Depende de indexes
branch_labels = None
depends_on = None


def upgrade():
    """Crear trigger para calcular stock automáticamente."""
    
    print("Creating Product.stock_quantity auto-calculation triggers...")
    
    # ========================================
    # FUNCIÓN: Recalcular stock de producto
    # ========================================
    
    op.execute("""
    CREATE OR REPLACE FUNCTION recalculate_product_stock()
    RETURNS TRIGGER AS $$
    DECLARE
        v_product_id INTEGER;
        v_has_sizes BOOLEAN;
        v_total_stock INTEGER;
    BEGIN
        -- Determinar qué producto cambió
        IF TG_OP = 'DELETE' THEN
            v_product_id := OLD.product_id;
        ELSE
            v_product_id := NEW.product_id;
        END IF;
        
        -- Obtener si el producto maneja talles
        SELECT has_sizes INTO v_has_sizes
        FROM products
        WHERE id = v_product_id;
        
        -- Calcular stock según tipo de producto
        IF v_has_sizes THEN
            -- Producto CON talles: Sumar ProductSize
            SELECT COALESCE(SUM(stock_quantity), 0) INTO v_total_stock
            FROM product_sizes
            WHERE product_id = v_product_id;
        ELSE
            -- Producto SIN talles: Sumar BranchStock
            SELECT COALESCE(SUM(stock_quantity), 0) INTO v_total_stock
            FROM branch_stock
            WHERE product_id = v_product_id;
        END IF;
        
        -- Actualizar Product.stock_quantity
        UPDATE products
        SET stock_quantity = v_total_stock,
            updated_at = NOW()
        WHERE id = v_product_id;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)
    
    # ========================================
    # TRIGGERS en BranchStock
    # ========================================
    
    op.execute("""
    CREATE TRIGGER trigger_branch_stock_insert_update
    AFTER INSERT OR UPDATE ON branch_stock
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_product_stock();
    """)
    
    op.execute("""
    CREATE TRIGGER trigger_branch_stock_delete
    AFTER DELETE ON branch_stock
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_product_stock();
    """)
    
    # ========================================
    # TRIGGERS en ProductSize
    # ========================================
    
    op.execute("""
    CREATE TRIGGER trigger_product_size_insert_update
    AFTER INSERT OR UPDATE ON product_sizes
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_product_stock();
    """)
    
    op.execute("""
    CREATE TRIGGER trigger_product_size_delete
    AFTER DELETE ON product_sizes
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_product_stock();
    """)
    
    # ========================================
    # RECALCULAR stock de todos los productos existentes
    # ========================================
    
    print("Recalculating existing product stock...")
    
    op.execute("""
    -- Productos SIN talles
    UPDATE products p
    SET stock_quantity = COALESCE(
        (SELECT SUM(stock_quantity) 
         FROM branch_stock bs 
         WHERE bs.product_id = p.id), 
        0
    ),
    updated_at = NOW()
    WHERE has_sizes = false;
    """)
    
    op.execute("""
    -- Productos CON talles
    UPDATE products p
    SET stock_quantity = COALESCE(
        (SELECT SUM(stock_quantity) 
         FROM product_sizes ps 
         WHERE ps.product_id = p.id), 
        0
    ),
    updated_at = NOW()
    WHERE has_sizes = true;
    """)
    
    print("✅ Triggers created and stock recalculated successfully")


def downgrade():
    """Eliminar triggers de stock automático."""
    
    print("Dropping Product.stock_quantity triggers...")
    
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS trigger_branch_stock_insert_update ON branch_stock;")
    op.execute("DROP TRIGGER IF EXISTS trigger_branch_stock_delete ON branch_stock;")
    op.execute("DROP TRIGGER IF EXISTS trigger_product_size_insert_update ON product_sizes;")
    op.execute("DROP TRIGGER IF EXISTS trigger_product_size_delete ON product_sizes;")
    
    # Drop function
    op.execute("DROP FUNCTION IF EXISTS recalculate_product_stock();")
    
    print("✅ Triggers dropped successfully")
