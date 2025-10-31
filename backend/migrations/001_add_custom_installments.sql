-- =====================================================================
-- MIGRATION: Add Custom Installments Table
-- File: 001_add_custom_installments.sql
-- Date: 2025-10-04
-- Description: Creates the custom_installments table for managing
--              custom payment installment plans for credit cards
-- =====================================================================

-- Drop table if exists (for development/testing - REMOVE in production)
-- DROP TABLE IF EXISTS custom_installments CASCADE;

-- Create custom_installments table
CREATE TABLE IF NOT EXISTS custom_installments (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Core configuration
    card_type VARCHAR(50) NOT NULL,
    installments INTEGER NOT NULL,
    surcharge_percentage NUMERIC(5, 2) NOT NULL,

    -- Status and metadata
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(255) NOT NULL,

    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT chk_card_type CHECK (card_type IN ('bancarizadas', 'no_bancarizadas')),
    CONSTRAINT chk_installments_range CHECK (installments >= 1 AND installments <= 60),
    CONSTRAINT chk_surcharge_range CHECK (surcharge_percentage >= 0.00 AND surcharge_percentage <= 100.00),
    CONSTRAINT uk_card_type_installments UNIQUE (card_type, installments)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_installments_card_type ON custom_installments(card_type);
CREATE INDEX IF NOT EXISTS idx_custom_installments_active ON custom_installments(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_installments_card_type_active ON custom_installments(card_type, is_active);

-- Add comments for documentation
COMMENT ON TABLE custom_installments IS 'Custom installment plans for credit cards with personalized surcharges';
COMMENT ON COLUMN custom_installments.id IS 'Unique identifier for the installment plan';
COMMENT ON COLUMN custom_installments.card_type IS 'Card type: bancarizadas or no_bancarizadas';
COMMENT ON COLUMN custom_installments.installments IS 'Number of installments (1-60)';
COMMENT ON COLUMN custom_installments.surcharge_percentage IS 'Surcharge percentage (0.00-100.00)';
COMMENT ON COLUMN custom_installments.is_active IS 'Whether this plan is currently active';
COMMENT ON COLUMN custom_installments.description IS 'Description of the installment plan';
COMMENT ON COLUMN custom_installments.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN custom_installments.updated_at IS 'Timestamp when the record was last updated';

-- =====================================================================
-- INITIAL DATA: Sample custom installment plans
-- =====================================================================

-- Insert sample data for bancarizadas (bank-issued cards)
INSERT INTO custom_installments (card_type, installments, surcharge_percentage, description, is_active)
VALUES
    ('bancarizadas', 15, 30.00, 'Plan especial 15 cuotas', TRUE),
    ('bancarizadas', 18, 35.00, 'Plan especial 18 cuotas', TRUE),
    ('bancarizadas', 24, 45.00, 'Plan especial 24 cuotas', TRUE),
    ('bancarizadas', 30, 55.00, 'Plan especial 30 cuotas', FALSE),
    ('bancarizadas', 36, 60.00, 'Plan especial 36 cuotas', FALSE)
ON CONFLICT (card_type, installments) DO NOTHING;

-- Insert sample data for no_bancarizadas (non-bank cards)
INSERT INTO custom_installments (card_type, installments, surcharge_percentage, description, is_active)
VALUES
    ('no_bancarizadas', 3, 20.00, 'Plan 3 cuotas no bancarizadas', TRUE),
    ('no_bancarizadas', 6, 28.00, 'Plan 6 cuotas no bancarizadas', TRUE),
    ('no_bancarizadas', 12, 40.00, 'Plan 12 cuotas no bancarizadas', FALSE)
ON CONFLICT (card_type, installments) DO NOTHING;

-- =====================================================================
-- VERIFICATION QUERIES (For testing after migration)
-- =====================================================================

-- Verify table structure
-- SELECT
--     column_name,
--     data_type,
--     is_nullable,
--     column_default
-- FROM information_schema.columns
-- WHERE table_name = 'custom_installments'
-- ORDER BY ordinal_position;

-- Verify constraints
-- SELECT
--     conname AS constraint_name,
--     contype AS constraint_type,
--     pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE conrelid = 'custom_installments'::regclass;

-- Verify indexes
-- SELECT
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE tablename = 'custom_installments';

-- Verify initial data
-- SELECT * FROM custom_installments ORDER BY card_type, installments;

-- Count records
-- SELECT
--     card_type,
--     COUNT(*) as total_plans,
--     COUNT(*) FILTER (WHERE is_active = TRUE) as active_plans
-- FROM custom_installments
-- GROUP BY card_type;

-- =====================================================================
-- ROLLBACK SCRIPT (Use with caution - only for development)
-- =====================================================================

-- To rollback this migration, run:
-- DROP INDEX IF EXISTS idx_custom_installments_card_type_active;
-- DROP INDEX IF EXISTS idx_custom_installments_active;
-- DROP INDEX IF EXISTS idx_custom_installments_card_type;
-- DROP TABLE IF EXISTS custom_installments CASCADE;

-- =====================================================================
-- NOTES:
-- =====================================================================
-- 1. This migration creates the custom_installments table with all necessary
--    constraints and indexes for optimal performance
-- 2. Initial sample data is provided for testing purposes
-- 3. The UNIQUE constraint on (card_type, installments) prevents duplicates
-- 4. CHECK constraints ensure data integrity at the database level
-- 5. Indexes on card_type and is_active improve query performance
-- 6. Timestamps are stored with timezone for accurate tracking
-- =====================================================================
