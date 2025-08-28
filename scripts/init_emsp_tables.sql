-- ===== SCRIPT PARA CREAR TABLAS EMSP =====
-- Este script crea las tablas necesarias para almacenar información de eMSPs
-- cuando actuamos como CPO

-- Tabla para ubicaciones de eMSPs
CREATE TABLE IF NOT EXISTS emsp_locations (
    id VARCHAR(36) PRIMARY KEY,
    emsp_party_id VARCHAR(10) NOT NULL,
    emsp_country_code VARCHAR(2) NOT NULL,
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

-- Tabla para EVSEs de eMSPs
CREATE TABLE IF NOT EXISTS emsp_evses (
    id VARCHAR(36) PRIMARY KEY,
    emsp_party_id VARCHAR(10) NOT NULL,
    emsp_country_code VARCHAR(2) NOT NULL,
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla para tarifas de eMSPs
CREATE TABLE IF NOT EXISTS emsp_tariffs (
    id VARCHAR(36) PRIMARY KEY,
    emsp_party_id VARCHAR(10) NOT NULL,
    emsp_country_code VARCHAR(2) NOT NULL,
    tariff_id VARCHAR(36) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    type VARCHAR(50) NOT NULL,
    elements JSON NOT NULL,
    start_date_time TIMESTAMP WITH TIME ZONE,
    end_date_time TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla para sesiones de eMSPs
CREATE TABLE IF NOT EXISTS emsp_sessions (
    id VARCHAR(36) PRIMARY KEY,
    emsp_party_id VARCHAR(10) NOT NULL,
    emsp_country_code VARCHAR(2) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
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

-- Tabla para CDRs de eMSPs
CREATE TABLE IF NOT EXISTS emsp_cdrs (
    id VARCHAR(36) PRIMARY KEY,
    emsp_party_id VARCHAR(10) NOT NULL,
    emsp_country_code VARCHAR(2) NOT NULL,
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

-- Tabla para tokens de usuarios de eMSPs
CREATE TABLE IF NOT EXISTS emsp_tokens (
    id VARCHAR(36) PRIMARY KEY,
    emsp_party_id VARCHAR(10) NOT NULL,
    emsp_country_code VARCHAR(2) NOT NULL,
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla para contratos de eMSPs
CREATE TABLE IF NOT EXISTS emsp_contracts (
    id VARCHAR(36) PRIMARY KEY,
    emsp_party_id VARCHAR(10) NOT NULL,
    emsp_country_code VARCHAR(2) NOT NULL,
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

-- Crear índices para las nuevas tablas EMSP
CREATE INDEX IF NOT EXISTS idx_emsp_locations_emsp_party ON emsp_locations(emsp_party_id, emsp_country_code);
CREATE INDEX IF NOT EXISTS idx_emsp_locations_last_updated ON emsp_locations(last_updated);
CREATE INDEX IF NOT EXISTS idx_emsp_evses_emsp_party ON emsp_evses(emsp_party_id, emsp_country_code);
CREATE INDEX IF NOT EXISTS idx_emsp_evses_evse_id ON emsp_evses(evse_id);
CREATE INDEX IF NOT EXISTS idx_emsp_evses_last_updated ON emsp_evses(last_updated);
CREATE INDEX IF NOT EXISTS idx_emsp_evses_location_id ON emsp_evses(location_id);
CREATE INDEX IF NOT EXISTS idx_emsp_evses_status ON emsp_evses(status);
CREATE INDEX IF NOT EXISTS idx_emsp_tariffs_emsp_party ON emsp_tariffs(emsp_party_id, emsp_country_code);
CREATE INDEX IF NOT EXISTS idx_emsp_tariffs_last_updated ON emsp_tariffs(last_updated);
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_emsp_party ON emsp_sessions(emsp_party_id, emsp_country_code);
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_last_updated ON emsp_sessions(last_updated);
CREATE INDEX IF NOT EXISTS idx_emsp_cdrs_emsp_party ON emsp_cdrs(emsp_party_id, emsp_country_code);
CREATE INDEX IF NOT EXISTS idx_emsp_cdrs_last_updated ON emsp_cdrs(last_updated);
CREATE INDEX IF NOT EXISTS idx_emsp_tokens_emsp_party ON emsp_tokens(emsp_party_id, emsp_country_code);
CREATE INDEX IF NOT EXISTS idx_emsp_tokens_last_updated ON emsp_tokens(last_updated);
CREATE INDEX IF NOT EXISTS idx_emsp_contracts_emsp_party ON emsp_contracts(emsp_party_id, emsp_country_code);
CREATE INDEX IF NOT EXISTS idx_emsp_contracts_last_updated ON emsp_contracts(last_updated);

-- Log completion of EMSP tables
DO $$
BEGIN
    RAISE NOTICE 'EMSP database tables initialization completed successfully';
END $$;
