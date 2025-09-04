-- Crear tabla emsp_sessions para almacenar sesiones del CPO externo
CREATE TABLE IF NOT EXISTS emsp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL,
    party_id VARCHAR(3) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    start_date_time TIMESTAMP WITH TIME ZONE,
    end_date_time TIMESTAMP WITH TIME ZONE,
    kwh DECIMAL(10,3) DEFAULT 0.0,
    cdr_token JSONB,
    auth_method VARCHAR(50),
    location_id UUID,
    evse_uid VARCHAR(255),
    connector_id VARCHAR(255),
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) DEFAULT 'PENDING',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_cost JSONB,
    charging_periods JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_code, party_id, session_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_country_party ON emsp_sessions(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_session_id ON emsp_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_status ON emsp_sessions(status);
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_created_at ON emsp_sessions(created_at);

-- Comentarios
COMMENT ON TABLE emsp_sessions IS 'Sesiones de carga recibidas de CPOs externos';
COMMENT ON COLUMN emsp_sessions.country_code IS 'Código de país (2 caracteres)';
COMMENT ON COLUMN emsp_sessions.party_id IS 'ID del operador (3 caracteres)';
COMMENT ON COLUMN emsp_sessions.session_id IS 'ID único de la sesión';
COMMENT ON COLUMN emsp_sessions.start_date_time IS 'Fecha y hora de inicio de la sesión';
COMMENT ON COLUMN emsp_sessions.end_date_time IS 'Fecha y hora de fin de la sesión';
COMMENT ON COLUMN emsp_sessions.kwh IS 'Energía consumida en kWh';
COMMENT ON COLUMN emsp_sessions.cdr_token IS 'Token utilizado para la sesión (JSON)';
COMMENT ON COLUMN emsp_sessions.auth_method IS 'Método de autenticación utilizado';
COMMENT ON COLUMN emsp_sessions.location_id IS 'ID de la ubicación';
COMMENT ON COLUMN emsp_sessions.evse_uid IS 'UID del EVSE';
COMMENT ON COLUMN emsp_sessions.connector_id IS 'ID del conector';
COMMENT ON COLUMN emsp_sessions.currency IS 'Moneda utilizada';
COMMENT ON COLUMN emsp_sessions.status IS 'Estado de la sesión (PENDING, ACTIVE, COMPLETED, etc.)';
COMMENT ON COLUMN emsp_sessions.total_cost IS 'Costo total de la sesión (JSON)';
COMMENT ON COLUMN emsp_sessions.charging_periods IS 'Períodos de carga (JSON)';
