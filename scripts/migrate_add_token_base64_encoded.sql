-- Migration: Add token_base64_encoded column to credentials table
-- Date: 2025-12-06
-- Description: Adds a flag to indicate if the external organization requires Base64 encoded tokens

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
        RAISE NOTICE 'Column token_base64_encoded added to credentials table';
    ELSE
        RAISE NOTICE 'Column token_base64_encoded already exists in credentials table';
    END IF;
END $$;

