-- Create sessions table to track active charging sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(36) NOT NULL UNIQUE,
    evse_uid VARCHAR(36) NOT NULL,
    token_uid VARCHAR(36) NOT NULL,
    location_id VARCHAR(36) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    start_date_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date_time TIMESTAMP WITH TIME ZONE NULL,
    kwh DECIMAL(10,3) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_evse_uid ON sessions(evse_uid);
CREATE INDEX IF NOT EXISTS idx_sessions_token_uid ON sessions(token_uid);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(evse_uid, status) WHERE status = 'ACTIVE';

-- Add foreign key constraints
ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_evse 
FOREIGN KEY (evse_uid) REFERENCES evses(id) ON DELETE CASCADE;

-- Add check constraint for status
ALTER TABLE sessions 
ADD CONSTRAINT chk_sessions_status 
CHECK (status IN ('ACTIVE', 'COMPLETED', 'INVALID', 'PENDING'));

COMMENT ON TABLE sessions IS 'OCPI 2.2 Sessions table to track charging sessions';
COMMENT ON COLUMN sessions.session_id IS 'Unique session identifier';
COMMENT ON COLUMN sessions.evse_uid IS 'Reference to the EVSE where the session is taking place';
COMMENT ON COLUMN sessions.token_uid IS 'Reference to the token used for the session';
COMMENT ON COLUMN sessions.status IS 'Current status of the session: ACTIVE, COMPLETED, INVALID, PENDING';
