-- Migration script to add valid and temp fields to credentials table
-- This script can be run on existing databases to add the new fields

-- Add new columns to credentials table if they don't exist
DO $$
BEGIN
    -- Add valid column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credentials' AND column_name = 'valid') THEN
        ALTER TABLE credentials ADD COLUMN valid BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    -- Add temp column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credentials' AND column_name = 'temp') THEN
        ALTER TABLE credentials ADD COLUMN temp BOOLEAN NOT NULL DEFAULT false;
    END IF;
END
$$;

-- Create indexes for the new columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_credentials_valid ON credentials(valid);
CREATE INDEX IF NOT EXISTS idx_credentials_temp ON credentials(temp);

-- Update existing credentials to be valid and not temporary
UPDATE credentials SET valid = true, temp = false WHERE valid IS NULL OR temp IS NULL;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'credentials' 
    AND column_name IN ('valid', 'temp')
ORDER BY column_name;
