-- Migration script to add application_errors table
-- Run this script if you have an existing database

-- Create application_errors table for tracking application errors (API requests/responses)
CREATE TABLE IF NOT EXISTS application_errors (
    id SERIAL PRIMARY KEY,
    error_type VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    status_code INTEGER,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    request_body TEXT,
    response_body TEXT,
    request_headers JSONB,
    response_headers JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add comments to application_errors columns
COMMENT ON COLUMN application_errors.error_type IS 'Type of error: API_REQUEST, API_RESPONSE, SERVER_ERROR, etc.';
COMMENT ON COLUMN application_errors.direction IS 'Direction: INBOUND (request received) or OUTBOUND (request sent)';
COMMENT ON COLUMN application_errors.endpoint IS 'API endpoint URL';
COMMENT ON COLUMN application_errors.method IS 'HTTP method (GET, POST, PUT, PATCH, DELETE)';
COMMENT ON COLUMN application_errors.status_code IS 'HTTP status code';
COMMENT ON COLUMN application_errors.error_message IS 'Error message or description';
COMMENT ON COLUMN application_errors.error_stack IS 'Error stack trace if available';
COMMENT ON COLUMN application_errors.request_body IS 'Request body (for INBOUND) or request sent (for OUTBOUND)';
COMMENT ON COLUMN application_errors.response_body IS 'Response body received';
COMMENT ON COLUMN application_errors.request_headers IS 'Request headers';
COMMENT ON COLUMN application_errors.response_headers IS 'Response headers';
COMMENT ON COLUMN application_errors.ip_address IS 'IP address of the client (for INBOUND) or target server (for OUTBOUND)';
COMMENT ON COLUMN application_errors.user_agent IS 'User agent string';
COMMENT ON COLUMN application_errors.timestamp IS 'When the error occurred';

-- Create indexes for application_errors
CREATE INDEX IF NOT EXISTS idx_application_errors_timestamp ON application_errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_application_errors_error_type ON application_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_application_errors_direction ON application_errors(direction);
CREATE INDEX IF NOT EXISTS idx_application_errors_status_code ON application_errors(status_code);

-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'application_errors' 
ORDER BY ordinal_position;

