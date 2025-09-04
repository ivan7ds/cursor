-- Actualizar tabla emsp_sessions para OCPI 2.2
ALTER TABLE emsp_sessions 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2),
ADD COLUMN IF NOT EXISTS party_id VARCHAR(3),
ADD COLUMN IF NOT EXISTS start_date_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kwh DECIMAL(10,3) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS cdr_token JSONB,
ADD COLUMN IF NOT EXISTS auth_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS location_id UUID,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS charging_periods JSONB;

-- Actualizar datos existentes si es necesario
UPDATE emsp_sessions 
SET 
    country_code = emsp_country_code,
    party_id = emsp_party_id,
    start_date_time = start_datetime,
    end_date_time = end_datetime
WHERE country_code IS NULL;

-- Crear índices adicionales
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_country_party ON emsp_sessions(country_code, party_id);
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_location_id ON emsp_sessions(location_id);
CREATE INDEX IF NOT EXISTS idx_emsp_sessions_evse_uid ON emsp_sessions(evse_uid);

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
