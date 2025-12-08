-- Migration: Add token_base64_encoded column to existing credentials table
-- Date: 2025-12-08
-- Description: Adds token_base64_encoded column to credentials table if it doesn't exist
-- This script is safe to run multiple times (idempotent)

-- Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'credentials' 
        AND column_name = 'token_base64_encoded'
    ) THEN
        ALTER TABLE credentials ADD COLUMN token_base64_encoded BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE '✅ Column token_base64_encoded added to credentials table';
    ELSE
        RAISE NOTICE 'ℹ️ Column token_base64_encoded already exists in credentials table';
    END IF;
END $$;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'credentials' 
    AND column_name = 'token_base64_encoded';

