-- Migration script to create validation_errors table
-- This script can be run on existing databases to add the validation_errors table

-- Create validation_errors table if it doesn't exist
CREATE TABLE IF NOT EXISTS validation_errors (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_body TEXT,
    validation_errors JSONB NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add comments to columns
COMMENT ON COLUMN validation_errors.endpoint IS 'API endpoint that received the invalid request';
COMMENT ON COLUMN validation_errors.method IS 'HTTP method (GET, POST, PUT, PATCH, DELETE)';
COMMENT ON COLUMN validation_errors.request_body IS 'JSON string of the request body that failed validation';
COMMENT ON COLUMN validation_errors.validation_errors IS 'Array of validation error details from Joi';
COMMENT ON COLUMN validation_errors.ip_address IS 'IP address of the client that sent the request';
COMMENT ON COLUMN validation_errors.user_agent IS 'User agent string from the request';
COMMENT ON COLUMN validation_errors.timestamp IS 'When the validation error occurred';

-- Create indexes for the table if they don't exist
CREATE INDEX IF NOT EXISTS idx_validation_errors_timestamp ON validation_errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_validation_errors_endpoint ON validation_errors(endpoint);

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'validation_errors'
ORDER BY ordinal_position;
