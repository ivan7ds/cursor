-- Initialize database tables manually (without Sequelize sync)
-- This script creates all the necessary tables for the CPO OCPI 2.2 application

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(36) PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    coordinates JSONB NOT NULL,
    related_locations JSON,
    parking_type VARCHAR(50),
    evse_list JSON,
    directions VARCHAR(500),
    operator JSON,
    suboperator JSON,
    owner JSON,
    facilities JSON,
    time_zone VARCHAR(255) NOT NULL,
    opening_times JSON,
    charging_when_closed BOOLEAN,
    images JSON,
    energy_mix JSON,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create evses table
CREATE TABLE IF NOT EXISTS evses (
    id VARCHAR(36) PRIMARY KEY,
    location_id VARCHAR(36) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    evse_id VARCHAR(48) NOT NULL,
    status VARCHAR(50) NOT NULL,
    capabilities JSON,
    connectors JSON NOT NULL,
    floor_level VARCHAR(4),
    coordinates JSON,
    physical_reference VARCHAR(16),
    directions JSON,
    parking_restrictions JSON,
    group_id VARCHAR(36),
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    evse_uid VARCHAR(36) NOT NULL,
    connector_id VARCHAR(36),
    id_token VARCHAR(36) NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    total_cost DECIMAL(10,2),
    status VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create cdrs table
CREATE TABLE IF NOT EXISTS cdrs (
    id VARCHAR(36) PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    evse_uid VARCHAR(36) NOT NULL,
    connector_id VARCHAR(36),
    id_token VARCHAR(36) NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    total_energy DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2),
    currency VARCHAR(3),
    total_parking_time INTEGER,
    total_time INTEGER NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create tariffs table
CREATE TABLE IF NOT EXISTS tariffs (
    id VARCHAR(36) PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    type VARCHAR(50) NOT NULL,
    elements JSON NOT NULL,
    start_date_time TIMESTAMP WITH TIME ZONE,
    end_date_time TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
    id VARCHAR(36) PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    uid VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    contract_id VARCHAR(36),
    issuer VARCHAR(100) NOT NULL,
    valid BOOLEAN NOT NULL,
    whitelist VARCHAR(50),
    language VARCHAR(10),
    default_profile_type VARCHAR(50),
    energy_contract JSON,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    business_details JSON,
    party_id VARCHAR(10) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_locations_country_party ON locations(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_locations_last_updated ON locations(last_updated);
CREATE INDEX IF NOT EXISTS idx_evses_country_party ON evses(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_evses_evse_id ON evses(evse_id);
CREATE INDEX IF NOT EXISTS idx_evses_last_updated ON evses(last_updated);
CREATE INDEX IF NOT EXISTS idx_evses_location_id ON evses(location_id);
CREATE INDEX IF NOT EXISTS idx_evses_status ON evses(status);
CREATE INDEX IF NOT EXISTS idx_sessions_country_party ON sessions(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_updated ON sessions(last_updated);
CREATE INDEX IF NOT EXISTS idx_cdrs_country_party ON cdrs(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_cdrs_last_updated ON cdrs(last_updated);
CREATE INDEX IF NOT EXISTS idx_tariffs_country_party ON tariffs(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_last_updated ON tariffs(last_updated);
CREATE INDEX IF NOT EXISTS idx_tokens_country_party ON tokens(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_tokens_last_updated ON tokens(last_updated);
CREATE INDEX IF NOT EXISTS idx_credentials_country_party ON credentials(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_credentials_last_updated ON credentials(last_updated);

-- Create foreign key constraints
ALTER TABLE evses ADD CONSTRAINT fk_evses_location_id 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE sessions ADD CONSTRAINT fk_sessions_evse_uid 
    FOREIGN KEY (evse_uid) REFERENCES evses(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE cdrs ADD CONSTRAINT fk_cdrs_session_id 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Create ENUM types for status fields
DO $$ BEGIN
    CREATE TYPE evse_status_enum AS ENUM ('AVAILABLE', 'BLOCKED', 'CHARGING', 'INOPERATIVE', 'MAINTENANCE', 'RESERVED', 'UNKNOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'INVALID', 'PENDING', 'RESERVATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing tables to use ENUM types if they exist
-- (This will be ignored if the columns don't exist yet)
ALTER TABLE evses ALTER COLUMN status TYPE evse_status_enum USING status::evse_status_enum;
ALTER TABLE sessions ALTER COLUMN status TYPE session_status_enum USING status::session_status_enum;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$;
