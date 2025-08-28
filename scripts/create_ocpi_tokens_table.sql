-- Crear tabla para tokens OCPI
CREATE TABLE IF NOT EXISTS ocpi_tokens (
    id VARCHAR(36) PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    party_id VARCHAR(10) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    metadata JSON,
    created_at_sequelize TIMESTAMP,
    updated_at_sequelize TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_ocpi_tokens_party_country ON ocpi_tokens(party_id, country_code);
CREATE INDEX IF NOT EXISTS idx_ocpi_tokens_token ON ocpi_tokens(token);
CREATE INDEX IF NOT EXISTS idx_ocpi_tokens_active ON ocpi_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_ocpi_tokens_expires ON ocpi_tokens(expires_at);

-- Insertar token por defecto para ES-CPO
INSERT INTO ocpi_tokens (id, token, party_id, country_code, is_active, created_at, metadata) 
VALUES (
    'default-token-id',
    'ocpi_token_es_cpo_2024_secure_key',
    'ES-CPO',
    'ES',
    true,
    CURRENT_TIMESTAMP,
    '{"description": "Default token for ES-CPO", "type": "default"}'
) ON CONFLICT (token) DO NOTHING;

-- Comentarios de la tabla
COMMENT ON TABLE ocpi_tokens IS 'Tabla para almacenar tokens OCPI generados para cada party_id';
COMMENT ON COLUMN ocpi_tokens.id IS 'Identificador único del registro de token';
COMMENT ON COLUMN ocpi_tokens.token IS 'Token OCPI de autenticación (máximo 64 caracteres)';
COMMENT ON COLUMN ocpi_tokens.party_id IS 'Party ID asociado a este token';
COMMENT ON COLUMN ocpi_tokens.country_code IS 'Código de país ISO 3166-1 alpha-2';
COMMENT ON COLUMN ocpi_tokens.is_active IS 'Indica si el token está activo';
COMMENT ON COLUMN ocpi_tokens.expires_at IS 'Fecha de expiración del token (opcional)';
COMMENT ON COLUMN ocpi_tokens.created_at IS 'Fecha de creación del token';
COMMENT ON COLUMN ocpi_tokens.last_used_at IS 'Última vez que se usó el token';
COMMENT ON COLUMN ocpi_tokens.metadata IS 'Metadatos adicionales del token en formato JSON';
