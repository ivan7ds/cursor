-- Script para poblar la tabla tokens con tokens eMSP
-- Estos tokens representan tokens que la aplicación tendrá cuando se comporte como eMSP
-- Según la especificación OCPI 2.2, los tipos disponibles son: AD_HOC_USER, APP_USER, OTHER, RFID

-- Limpiar tokens existentes (opcional - comentar si no se desea)
-- DELETE FROM tokens WHERE party_id LIKE 'EMSP%';

-- Insertar 20 tokens eMSP con diferentes tipos
INSERT INTO tokens (id, country_code, party_id, uid, type, auth_method, contract_id, visual_number, issuer, group_id, valid, whitelist, language, default_profile_type, energy_contract, last_updated, created_at, updated_at) VALUES

-- Tokens AD_HOC_USER (usuarios ocasionales)
('emsp-token-001', 'ES', 'EMSP001', 'ad-hoc-user-001', 'AD_HOC_USER', 'APP_USER', 'contract-001', 'AH001', 'EMSP_System', 'group-001', true, 'ALWAYS', 'es', 'REGULAR', '{"provider": "EMSP_System", "type": "ad_hoc"}', NOW(), NOW(), NOW()),
('emsp-token-002', 'ES', 'EMSP001', 'ad-hoc-user-002', 'AD_HOC_USER', 'APP_USER', 'contract-002', 'AH002', 'EMSP_System', 'group-001', true, 'ALLOWED', 'es', 'FAST', '{"provider": "EMSP_System", "type": "ad_hoc"}', NOW(), NOW(), NOW()),
('emsp-token-003', 'ES', 'EMSP001', 'ad-hoc-user-003', 'AD_HOC_USER', 'APP_USER', 'contract-003', 'AH003', 'EMSP_System', 'group-002', true, 'ALLOWED_OFFLINE', 'es', 'CHEAP', '{"provider": "EMSP_System", "type": "ad_hoc"}', NOW(), NOW(), NOW()),
('emsp-token-004', 'ES', 'EMSP001', 'ad-hoc-user-004', 'AD_HOC_USER', 'APP_USER', 'contract-004', 'AH004', 'EMSP_System', 'group-002', true, 'ALWAYS', 'es', 'GREEN', '{"provider": "EMSP_System", "type": "ad_hoc"}', NOW(), NOW(), NOW()),
('emsp-token-005', 'ES', 'EMSP001', 'ad-hoc-user-005', 'AD_HOC_USER', 'APP_USER', 'contract-005', 'AH005', 'EMSP_System', 'group-003', true, 'ALLOWED', 'es', 'REGULAR', '{"provider": "EMSP_System", "type": "ad_hoc"}', NOW(), NOW(), NOW()),

-- Tokens APP_USER (usuarios de aplicación)
('emsp-token-006', 'ES', 'EMSP001', 'app-user-001', 'APP_USER', 'APP_USER', 'contract-006', 'AP001', 'EMSP_System', 'group-003', true, 'ALWAYS', 'es', 'FAST', '{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}', NOW(), NOW(), NOW()),
('emsp-token-007', 'ES', 'EMSP001', 'app-user-002', 'APP_USER', 'APP_USER', 'contract-007', 'AP002', 'EMSP_System', 'group-004', true, 'ALLOWED', 'es', 'REGULAR', '{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}', NOW(), NOW(), NOW()),
('emsp-token-008', 'ES', 'EMSP001', 'app-user-003', 'APP_USER', 'APP_USER', 'contract-008', 'AP003', 'EMSP_System', 'group-004', true, 'ALLOWED_OFFLINE', 'es', 'GREEN', '{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}', NOW(), NOW(), NOW()),
('emsp-token-009', 'ES', 'EMSP001', 'app-user-004', 'APP_USER', 'APP_USER', 'contract-009', 'AP004', 'EMSP_System', 'group-004', true, 'ALWAYS', 'es', 'CHEAP', '{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}', NOW(), NOW(), NOW()),
('emsp-token-010', 'ES', 'EMSP001', 'app-user-005', 'APP_USER', 'APP_USER', 'contract-010', 'AP005', 'EMSP_System', 'group-005', true, 'ALLOWED', 'es', 'FAST', '{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}', NOW(), NOW(), NOW()),

-- Tokens RFID (tokens físicos)
('emsp-token-011', 'ES', 'EMSP001', 'rfid-user-001', 'RFID', 'RFID', 'contract-011', 'RF001', 'EMSP_System', 'group-006', true, 'ALWAYS', 'es', 'REGULAR', '{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}', NOW(), NOW(), NOW()),
('emsp-token-012', 'ES', 'EMSP001', 'rfid-user-002', 'RFID', 'RFID', 'contract-012', 'RF002', 'EMSP_System', 'group-006', true, 'ALLOWED', 'es', 'FAST', '{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}', NOW(), NOW(), NOW()),
('emsp-token-013', 'ES', 'EMSP001', 'rfid-user-003', 'RFID', 'RFID', 'contract-013', 'RF003', 'EMSP_System', 'group-007', true, 'ALLOWED_OFFLINE', 'es', 'GREEN', '{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}', NOW(), NOW(), NOW()),
('emsp-token-014', 'ES', 'EMSP001', 'rfid-user-004', 'RFID', 'RFID', 'contract-014', 'RF004', 'EMSP_System', 'group-007', true, 'ALWAYS', 'es', 'CHEAP', '{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}', NOW(), NOW(), NOW()),
('emsp-token-015', 'ES', 'EMSP001', 'rfid-user-005', 'RFID', 'RFID', 'contract-015', 'RF005', 'EMSP_System', 'group-008', true, 'ALLOWED', 'es', 'REGULAR', '{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}', NOW(), NOW(), NOW()),

-- Tokens OTHER (otros tipos)
('emsp-token-016', 'ES', 'EMSP001', 'other-user-001', 'OTHER', 'OTHER', 'contract-016', 'OT001', 'EMSP_System', 'group-008', true, 'ALWAYS', 'es', 'FAST', '{"provider": "EMSP_System", "type": "other", "description": "Token especial para vehículos comerciales"}', NOW(), NOW(), NOW()),
('emsp-token-017', 'ES', 'EMSP001', 'other-user-002', 'OTHER', 'OTHER', 'contract-017', 'OT002', 'EMSP_System', 'group-009', true, 'ALLOWED', 'es', 'REGULAR', '{"provider": "EMSP_System", "type": "other", "description": "Token para flotas corporativas"}', NOW(), NOW(), NOW()),
('emsp-token-018', 'ES', 'EMSP001', 'other-user-003', 'OTHER', 'OTHER', 'contract-018', 'OT003', 'EMSP_System', 'group-009', true, 'ALLOWED_OFFLINE', 'es', 'GREEN', '{"provider": "EMSP_System", "type": "other", "description": "Token para vehículos de emergencia"}', NOW(), NOW(), NOW()),
('emsp-token-019', 'ES', 'EMSP001', 'other-user-004', 'OTHER', 'OTHER', 'contract-019', 'OT004', 'EMSP_System', 'group-010', true, 'ALWAYS', 'es', 'CHEAP', '{"provider": "EMSP_System", "type": "other", "description": "Token para vehículos de prueba"}', NOW(), NOW(), NOW()),
('emsp-token-020', 'ES', 'EMSP001', 'other-user-005', 'OTHER', 'OTHER', 'contract-020', 'OT005', 'EMSP_System', 'group-010', true, 'ALLOWED', 'es', 'FAST', '{"provider": "EMSP_System", "type": "other", "description": "Token para vehículos de demostración"}', NOW(), NOW(), NOW());

-- Crear índices para optimizar consultas de tokens eMSP
CREATE INDEX IF NOT EXISTS idx_emsp_tokens_party_id ON tokens(party_id) WHERE party_id LIKE 'EMSP%';
CREATE INDEX IF NOT EXISTS idx_emsp_tokens_type ON tokens(type) WHERE party_id LIKE 'EMSP%';
CREATE INDEX IF NOT EXISTS idx_emsp_tokens_valid ON tokens(valid) WHERE party_id LIKE 'EMSP%';

-- Comentarios para documentar la tabla
COMMENT ON TABLE tokens IS 'Tabla que almacena tokens de usuarios eMSP cuando la aplicación actúa como eMSP';
COMMENT ON COLUMN tokens.type IS 'Tipo de token según OCPI 2.2: AD_HOC_USER, APP_USER, OTHER, RFID';
COMMENT ON COLUMN tokens.whitelist IS 'Tipo de whitelist: ALWAYS, ALLOWED, ALLOWED_OFFLINE, NEVER';
COMMENT ON COLUMN tokens.default_profile_type IS 'Perfil por defecto: CHEAP, FAST, GREEN, REGULAR';

-- Mostrar resumen de tokens insertados
SELECT 
    type,
    COUNT(*) as count,
    COUNT(CASE WHEN valid = true THEN 1 END) as valid_count,
    COUNT(CASE WHEN valid = false THEN 1 END) as invalid_count
FROM tokens 
WHERE party_id LIKE 'EMSP%' 
GROUP BY type 
ORDER BY type;
