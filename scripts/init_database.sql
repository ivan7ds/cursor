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
    evses JSON,
    directions JSON,
    operator JSON,
    suboperator JSON,
    owner JSON,
    facilities JSON,
    time_zone VARCHAR(255) NOT NULL,
    opening_times JSON,
    charging_when_closed BOOLEAN,
    images JSON,
    energy_mix JSON,
    publish BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
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
    deleted_at TIMESTAMP WITH TIME ZONE,
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
    kwh DECIMAL(10,3) DEFAULT 0.0,
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
    deleted_at TIMESTAMP WITH TIME ZONE,
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
    auth_method VARCHAR(50) NOT NULL,
    contract_id VARCHAR(36),
    visual_number VARCHAR(64),
    issuer VARCHAR(64) NOT NULL,
    group_id VARCHAR(36),
    valid BOOLEAN NOT NULL,
    whitelist VARCHAR(50),
    language VARCHAR(10),
    default_profile_type VARCHAR(50),
    energy_contract JSON,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
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
    external_party_id VARCHAR(10),
    valid BOOLEAN NOT NULL DEFAULT true,
    temp BOOLEAN NOT NULL DEFAULT false,
    token_base64_encoded BOOLEAN NOT NULL DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create ocpi_tokens table for OCPI authentication tokens
CREATE TABLE IF NOT EXISTS ocpi_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    party_id VARCHAR(10) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    metadata JSON
);

-- Create validation_errors table for tracking validation failures
CREATE TABLE IF NOT EXISTS validation_errors (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_body TEXT,
    validation_errors JSONB NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add comments to validation_errors columns
COMMENT ON COLUMN validation_errors.endpoint IS 'API endpoint that received the invalid request';
COMMENT ON COLUMN validation_errors.method IS 'HTTP method (GET, POST, PUT, PATCH, DELETE)';
COMMENT ON COLUMN validation_errors.request_body IS 'JSON string of the request body that failed validation';
COMMENT ON COLUMN validation_errors.validation_errors IS 'Array of validation error details from Joi';
COMMENT ON COLUMN validation_errors.ip_address IS 'IP address of the client that sent the request';
COMMENT ON COLUMN validation_errors.user_agent IS 'User agent string from the request';
COMMENT ON COLUMN validation_errors.timestamp IS 'When the validation error occurred';

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
CREATE INDEX IF NOT EXISTS idx_tariffs_deleted_at ON tariffs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tokens_country_party ON tokens(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_tokens_last_updated ON tokens(last_updated);
CREATE INDEX IF NOT EXISTS idx_tokens_deleted_at ON tokens(deleted_at);
CREATE INDEX IF NOT EXISTS idx_credentials_country_party ON credentials(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_credentials_last_updated ON credentials(last_updated);
CREATE INDEX IF NOT EXISTS idx_credentials_valid ON credentials(valid);
CREATE INDEX IF NOT EXISTS idx_credentials_temp ON credentials(temp);
CREATE INDEX IF NOT EXISTS idx_credentials_external_party_id ON credentials(external_party_id);
CREATE INDEX IF NOT EXISTS idx_ocpi_tokens_token ON ocpi_tokens(token);
CREATE INDEX IF NOT EXISTS idx_ocpi_tokens_party ON ocpi_tokens(party_id, country_code);
CREATE INDEX IF NOT EXISTS idx_ocpi_tokens_active ON ocpi_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_validation_errors_timestamp ON validation_errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_validation_errors_endpoint ON validation_errors(endpoint);

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

-- Create foreign key constraints
ALTER TABLE evses ADD CONSTRAINT fk_evses_location_id 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE sessions ADD CONSTRAINT fk_sessions_evse_uid 
    FOREIGN KEY (evse_uid) REFERENCES evses(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE cdrs ADD CONSTRAINT fk_cdrs_session_id 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Create ENUM types for status fields
DO $$ BEGIN
    CREATE TYPE evse_status_enum AS ENUM ('AVAILABLE', 'BLOCKED', 'CHARGING', 'INOPERATIVE', 'OUTOFORDER', 'PLANNED', 'REMOVED', 'RESERVED', 'UNKNOWN');
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

-- ===== TABLAS PARA ROL EMSP =====
-- Estas tablas almacenan la información que nos facilitan los eMSPs

-- Tabla para ubicaciones de operadores externos (CPO, EMSP o ambos)
CREATE TABLE IF NOT EXISTS external_operator_locations (
    id VARCHAR(36) PRIMARY KEY,
    external_operator_party_id VARCHAR(10) NOT NULL,
    external_operator_country_code VARCHAR(2) NOT NULL,
    location_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    coordinates JSONB NOT NULL,
    related_locations JSON,
    parking_type VARCHAR(50),
    evses JSON,
    directions JSON,
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

-- Tabla para EVSEs de operadores externos (CPO, EMSP o ambos)
CREATE TABLE IF NOT EXISTS external_operator_evses (
    id VARCHAR(36) PRIMARY KEY,
    external_operator_party_id VARCHAR(10) NOT NULL,
    external_operator_country_code VARCHAR(2) NOT NULL,
    location_id VARCHAR(36) NOT NULL,
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
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla para tarifas de operadores externos (CPO, EMSP o ambos)
CREATE TABLE IF NOT EXISTS external_operator_tariffs (
    id VARCHAR(36) PRIMARY KEY,
    external_operator_party_id VARCHAR(10) NOT NULL,
    external_operator_country_code VARCHAR(2) NOT NULL,
    tariff_id VARCHAR(36) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    elements JSON NOT NULL,
    start_date_time TIMESTAMP WITH TIME ZONE,
    end_date_time TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla para sesiones de operadores externos (CPO, EMSP o ambos)
CREATE TABLE IF NOT EXISTS external_operator_sessions (
    id VARCHAR(36) PRIMARY KEY,
    external_operator_party_id VARCHAR(10) NOT NULL,
    external_operator_country_code VARCHAR(2) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    evse_uid VARCHAR(36) NOT NULL,
    connector_id VARCHAR(36),
    id_token VARCHAR(36) NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    total_cost DECIMAL(10,2),
    kwh DECIMAL(10,3) DEFAULT 0.0,
    status VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla para CDRs de operadores externos (CPO, EMSP o ambos)
CREATE TABLE IF NOT EXISTS external_operator_cdrs (
    id VARCHAR(36) PRIMARY KEY,
    external_operator_party_id VARCHAR(10) NOT NULL,
    external_operator_country_code VARCHAR(2) NOT NULL,
    cdr_id VARCHAR(36) NOT NULL,
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

-- Tabla para tokens de usuarios de operadores externos (CPO, EMSP o ambos)
CREATE TABLE IF NOT EXISTS external_operator_tokens (
    id VARCHAR(36) PRIMARY KEY,
    external_operator_party_id VARCHAR(10) NOT NULL,
    external_operator_country_code VARCHAR(2) NOT NULL,
    token_uid VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    contract_id VARCHAR(36),
    visual_number VARCHAR(255),
    issuer VARCHAR(100) NOT NULL,
    group_id VARCHAR(36),
    valid BOOLEAN NOT NULL,
    whitelist VARCHAR(50),
    language VARCHAR(10),
    default_profile_type VARCHAR(50),
    energy_contract JSON,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla para contratos de operadores externos (CPO, EMSP o ambos)
CREATE TABLE IF NOT EXISTS external_operator_contracts (
    id VARCHAR(36) PRIMARY KEY,
    external_operator_party_id VARCHAR(10) NOT NULL,
    external_operator_country_code VARCHAR(2) NOT NULL,
    contract_id VARCHAR(36) NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    contract_type VARCHAR(50) NOT NULL,
    contract_status VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    terms JSON,
    pricing JSON,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear índices para las tablas de operadores externos
CREATE INDEX IF NOT EXISTS idx_external_operator_locations_party ON external_operator_locations(external_operator_party_id, external_operator_country_code);
CREATE INDEX IF NOT EXISTS idx_external_operator_locations_last_updated ON external_operator_locations(last_updated);
CREATE INDEX IF NOT EXISTS idx_external_operator_evses_party ON external_operator_evses(external_operator_party_id, external_operator_country_code);
CREATE INDEX IF NOT EXISTS idx_external_operator_evses_evse_id ON external_operator_evses(evse_id);
CREATE INDEX IF NOT EXISTS idx_external_operator_evses_last_updated ON external_operator_evses(last_updated);
CREATE INDEX IF NOT EXISTS idx_external_operator_evses_location_id ON external_operator_evses(location_id);
CREATE INDEX IF NOT EXISTS idx_external_operator_evses_status ON external_operator_evses(status);
CREATE INDEX IF NOT EXISTS idx_external_operator_tariffs_party ON external_operator_tariffs(external_operator_party_id, external_operator_country_code);
CREATE INDEX IF NOT EXISTS idx_external_operator_tariffs_last_updated ON external_operator_tariffs(last_updated);
CREATE INDEX IF NOT EXISTS idx_external_operator_tariffs_deleted_at ON external_operator_tariffs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_external_operator_sessions_party ON external_operator_sessions(external_operator_party_id, external_operator_country_code);
CREATE INDEX IF NOT EXISTS idx_external_operator_sessions_last_updated ON external_operator_sessions(last_updated);
CREATE INDEX IF NOT EXISTS idx_external_operator_cdrs_party ON external_operator_cdrs(external_operator_party_id, external_operator_country_code);
CREATE INDEX IF NOT EXISTS idx_external_operator_cdrs_last_updated ON external_operator_cdrs(last_updated);
CREATE INDEX IF NOT EXISTS idx_external_operator_tokens_party ON external_operator_tokens(external_operator_party_id, external_operator_country_code);
CREATE INDEX IF NOT EXISTS idx_external_operator_tokens_last_updated ON external_operator_tokens(last_updated);
CREATE INDEX IF NOT EXISTS idx_external_operator_tokens_deleted_at ON external_operator_tokens(deleted_at);
CREATE INDEX IF NOT EXISTS idx_external_operator_contracts_party ON external_operator_contracts(external_operator_party_id, external_operator_country_code);
CREATE INDEX IF NOT EXISTS idx_external_operator_contracts_last_updated ON external_operator_contracts(last_updated);

-- Log completion of external operator tables
DO $$
BEGIN
    RAISE NOTICE 'External operator database tables initialization completed successfully';
END $$;
