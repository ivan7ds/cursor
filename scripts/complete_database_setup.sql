-- Complete Database Setup Script
-- This script populates the database with clean, consistent data

-- Clear all existing data (only if tables exist)
DO $$ 
BEGIN
    -- Only truncate if the main tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'locations') THEN
        -- Truncate main tables - COMMENTED OUT TO PREVENT DATA LOSS
        -- TRUNCATE TABLE evses, locations, sessions, cdrs, tariffs, tokens, credentials, ocpi_tokens RESTART IDENTITY CASCADE;
        
        -- Truncate emsp tables if they exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emsp_locations') THEN
            TRUNCATE TABLE emsp_locations, emsp_evses, emsp_tariffs, emsp_sessions, emsp_cdrs, emsp_tokens, emsp_contracts RESTART IDENTITY CASCADE;
        END IF;
    END IF;
END $$;

-- Insert Locations (distributed across Spain and Portugal)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
-- Madrid Metropolitan Area (15 locations)
('550e8400-e29b-41d4-a716-446655440001', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Plaza Norte 2', 'Plaza Norte 2, 28760 Tres Cantos', 'Tres Cantos', 'ESP', '{"latitude": 40.6011, "longitude": -3.7083}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial La Gavia', 'Av. de las Suertes, 28047', 'Madrid', 'ESP', '{"latitude": 40.3897, "longitude": -3.6289}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Isla Azul', 'Calle de la Isla Azul, 28042', 'Madrid', 'ESP', '{"latitude": 40.4567, "longitude": -3.6123}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Plaza de Castilla', 'Plaza de Castilla, 28046', 'Madrid', 'ESP', '{"latitude": 40.4667, "longitude": -3.6897}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Príncipe Pío', 'Paseo de la Florida, 28008', 'Madrid', 'ESP', '{"latitude": 40.4233, "longitude": -3.7189}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Barcelona Metropolitan Area (10 locations)
('550e8400-e29b-41d4-a716-446655440006', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Diagonal Mar', 'Passeig del Taulat, 08019', 'Barcelona', 'ESP', '{"latitude": 41.4089, "longitude": 2.2197}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial La Maquinista', 'Carrer de Josep Estivill, 08030', 'Barcelona', 'ESP', '{"latitude": 41.4456, "longitude": 2.1898}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Glòries', 'Av. Diagonal, 208, 08013', 'Barcelona', 'ESP', '{"latitude": 41.4036, "longitude": 2.1897}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Valencia (5 locations)
('550e8400-e29b-41d4-a716-446655440009', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Aqua Multiespacio', 'Carrer de Menorca, 19, 46023', 'València', 'ESP', '{"latitude": 39.4699, "longitude": -0.3763}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Nuevo Centro', 'Carrer de Menorca, 19, 46023', 'València', 'ESP', '{"latitude": 39.4699, "longitude": -0.3763}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Sevilla (5 locations)
('550e8400-e29b-41d4-a716-446655440011', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Los Arcos', 'Av. de Andalucía, 1, 41007', 'Sevilla', 'ESP', '{"latitude": 37.3891, "longitude": -5.9845}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Nervión Plaza', 'Calle Luis Montoto, 41005', 'Sevilla', 'ESP', '{"latitude": 37.3898, "longitude": -5.9767}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Bilbao (5 locations)
('550e8400-e29b-41d4-a716-446655440013', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Zubiarte', 'Paseo de Uribitarte, 48001', 'Bilbao', 'ESP', '{"latitude": 43.2627, "longitude": -2.9253}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Max Center', 'Calle Max, 1, 48950 Erandio', 'Erandio', 'ESP', '{"latitude": 43.3123, "longitude": -2.9567}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Málaga (5 locations)
('550e8400-e29b-41d4-a716-446655440015', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Larios', 'Calle Larios, 29005', 'Málaga', 'ESP', '{"latitude": 36.7213, "longitude": -4.4217}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440016', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Vialia', 'Estación de Málaga-María Zambrano, 29002', 'Málaga', 'ESP', '{"latitude": 36.7456, "longitude": -4.4567}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Lisboa (5 locations)
('550e8400-e29b-41d4-a716-446655440017', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Colombo', 'Av. Lusíada, 1500-392', 'Lisboa', 'PRT', '{"latitude": 38.7223, "longitude": -9.1393}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440018', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Vasco da Gama', 'Av. D. João II, 1990-094', 'Lisboa', 'PRT', '{"latitude": 38.7567, "longitude": -9.0945}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),

-- Porto (5 locations)
('550e8400-e29b-41d4-a716-446655440019', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial NorteShopping', 'Rua Sara Martins de Almeida, 4460-841 Senhora da Hora', 'Senhora da Hora', 'PRT', '{"latitude": 41.1897, "longitude": -8.6567}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440020', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'Centro Comercial Mar Shopping', 'Rua do Mar, 4150-518', 'Porto', 'PRT', '{"latitude": 41.1567, "longitude": -8.6234}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW());

-- Insert EVSEs (distributed across locations, max 50 per location)
INSERT INTO evses (id, location_id, country_code, party_id, evse_id, status, capabilities, connectors, floor_level, coordinates, physical_reference, directions, parking_restrictions, group_id, last_updated, created_at, updated_at) VALUES
-- Location: 550e8400-e29b-41d4-a716-446655440001 (Centro Comercial Plaza Norte 2) - 3 EVSEs
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cee', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.6011, "longitude": -3.7083}', 'A1', '{"text": "Entrada principal, primera fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-001', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cef', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.6011, "longitude": -3.7083}', 'A2', '{"text": "Entrada principal, segunda fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-001', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf0', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.6011, "longitude": -3.7083}', 'A3', '{"text": "Entrada principal, tercera fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-001', NOW(), NOW(), NOW()),

-- Location: 550e8400-e29b-41d4-a716-446655440002 (Centro Comercial La Gavia) - 2 EVSEs
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440002', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf1', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.3897, "longitude": -3.6289}', 'B1', '{"text": "Entrada sur, primera fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-002', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf2', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.3897, "longitude": -3.6289}', 'B2', '{"text": "Entrada sur, segunda fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-002', NOW(), NOW(), NOW()),

-- Location: 550e8400-e29b-41d4-a716-446655440006 (Centro Comercial Diagonal Mar) - 2 EVSEs
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440006', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf3', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 41.4089, "longitude": 2.2197}', 'C1', '{"text": "Entrada mar, primera fila"}', '["RESERVED", "EV_ONLY"]', 'group-bcn-001', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440006', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf4', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 41.4089, "longitude": 2.2197}', 'C2', '{"text": "Entrada mar, segunda fila"}', '["RESERVED", "EV_ONLY"]', 'group-bcn-001', NOW(), NOW(), NOW()),

-- Location: 550e8400-e29b-41d4-a716-446655440017 (Centro Comercial Colombo) - 2 EVSEs
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440017', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf5', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 38.7223, "longitude": -9.1393}', 'D1', '{"text": "Entrada principal, primeira fila"}', '["RESERVED", "EV_ONLY"]', 'group-lis-001', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440017', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf6', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 38.7223, "longitude": -9.1393}', 'D2', '{"text": "Entrada principal, segunda fila"}', '["RESERVED", "EV_ONLY"]', 'group-lis-001', NOW(), NOW(), NOW()),

-- Location: 550e8400-e29b-41d4-a716-446655440009 (Centro Comercial Aqua Multiespacio) - 1 EVSE
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440009', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf7', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 39.4699, "longitude": -0.3763}', 'E1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-val-001', NOW(), NOW(), NOW()),

-- Location: 550e8400-e29b-41d4-a716-446655440011 (Centro Comercial Los Arcos) - 1 EVSE
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440011', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf8', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 37.3891, "longitude": -5.9845}', 'F1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-sev-001', NOW(), NOW(), NOW()),

-- Location: 550e8400-e29b-41d4-a716-446655440013 (Centro Comercial Zubiarte) - 1 EVSE
('550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440013', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cf9', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 43.2627, "longitude": -2.9253}', 'G1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-bil-001', NOW(), NOW(), NOW()),

-- Location: 550e8400-e29b-41d4-a716-446655440015 (Centro Comercial Larios) - 1 EVSE
('550e8400-e29b-41d4-a716-446655441101', '550e8400-e29b-41d4-a716-446655440015', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cfa', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 36.7213, "longitude": -4.4217}', 'H1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-mal-001', NOW(), NOW(), NOW()),

-- Location: 550e8400-e29b-41d4-a716-446655440019 (Centro Comercial NorteShopping) - 1 EVSE
('550e8400-e29b-41d4-a716-446655441201', '550e8400-e29b-41d4-a716-446655440019', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE || '*' || :OCPI_PARTY_ID || '*E5bcc4cfb', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 41.1897, "longitude": -8.6567}', 'I1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-por-001', NOW(), NOW(), NOW());

-- Insert sample tariffs
INSERT INTO tariffs (id, country_code, party_id, currency, type, elements, start_date_time, end_date_time, last_updated, created_at, updated_at) VALUES
('tariff-001', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'EUR', 'REGULAR', '[{"price_components": [{"type": "ENERGY", "price": 0.25, "step_size": 1}]}]', NULL, NULL, NOW(), NOW(), NOW()),
('tariff-002', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'EUR', 'FAST', '[{"price_components": [{"type": "ENERGY", "price": 0.35, "step_size": 1}]}]', NULL, NULL, NOW(), NOW(), NOW()),
('tariff-003', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'EUR', 'REGULAR', '[{"price_components": [{"type": "ENERGY", "price": 0.28, "step_size": 1}]}]', NULL, NULL, NOW(), NOW(), NOW());

-- Insert sample tokens with various combinations
INSERT INTO tokens (id, country_code, party_id, uid, type, auth_method, contract_id, visual_number, issuer, valid, whitelist, language, default_profile_type, energy_contract, last_updated, created_at, updated_at) VALUES
-- RFID Tokens
('token-001', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-001', 'RFID', 'RFID', 'CONTRACT-001', 'RF001', :OCPI_PARTY_ID, true, 'ALWAYS', 'es', 'REGULAR', NULL, NOW(), NOW(), NOW()),
('token-002', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-002', 'RFID', 'RFID', 'CONTRACT-002', 'RF002', :OCPI_PARTY_ID, true, 'ALLOWED', 'es', 'FAST', NULL, NOW(), NOW(), NOW()),
('token-003', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-003', 'RFID', 'RFID', 'CONTRACT-003', 'RF003', :OCPI_PARTY_ID, false, 'NEVER', 'en', 'GREEN', NULL, NOW(), NOW(), NOW()),

-- APP_USER Tokens
('token-004', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-004', 'APP_USER', 'APP_USER', 'CONTRACT-004', 'AP001', :OCPI_PARTY_ID, true, 'ALWAYS', 'en', 'FAST', NULL, NOW(), NOW(), NOW()),
('token-005', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-005', 'APP_USER', 'APP_USER', 'CONTRACT-005', 'AP002', :OCPI_PARTY_ID, true, 'ALLOWED_OFFLINE', 'es', 'REGULAR', NULL, NOW(), NOW(), NOW()),
('token-006', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-006', 'APP_USER', 'APP_USER', 'CONTRACT-006', 'AP003', :OCPI_PARTY_ID, true, 'ALLOWED', 'en', 'CHEAP', NULL, NOW(), NOW(), NOW()),

-- AD_HOC_USER Tokens
('token-007', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'ad-hoc-user-001', 'AD_HOC_USER', 'APP_USER', 'contract-001', 'AH001', 'EMSP_System', true, 'ALWAYS', 'es', 'REGULAR', '{"provider": "EMSP_System", "type": "ad_hoc"}', NOW(), NOW(), NOW()),
('token-008', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'ad-hoc-user-002', 'AD_HOC_USER', 'WHITELIST', 'contract-002', 'AH002', 'EMSP_System', true, 'ALWAYS', 'en', 'FAST', '{"provider": "EMSP_System", "type": "ad_hoc"}', NOW(), NOW(), NOW()),
('token-009', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'ad-hoc-user-003', 'AD_HOC_USER', 'RFID', 'contract-003', 'AH003', 'EMSP_System', true, 'ALLOWED', 'es', 'GREEN', '{"provider": "EMSP_System", "type": "ad_hoc"}', NOW(), NOW(), NOW()),

-- OTHER Tokens
('token-010', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-010', 'OTHER', 'WHITELIST', 'CONTRACT-010', 'OT001', :OCPI_PARTY_ID, true, 'ALWAYS', 'es', 'REGULAR', NULL, NOW(), NOW(), NOW()),
('token-011', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-011', 'OTHER', 'COMMAND', 'CONTRACT-011', 'OT002', :OCPI_PARTY_ID, true, 'ALLOWED', 'en', 'FAST', NULL, NOW(), NOW(), NOW()),
('token-012', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'TOKEN-012', 'OTHER', 'AUTH_REQUEST', 'CONTRACT-012', 'OT003', :OCPI_PARTY_ID, false, 'NEVER', 'es', 'CHEAP', NULL, NOW(), NOW(), NOW()),

-- Test Tokens for external charging
('token-013', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'test_token1', 'RFID', 'RFID', 'CONTRACT-TEST-001', 'TT001', 'TEST_SYSTEM', true, 'ALWAYS', 'es', 'REGULAR', NULL, NOW(), NOW(), NOW()),
('token-014', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'test_token2', 'APP_USER', 'APP_USER', 'CONTRACT-TEST-002', 'TT002', 'TEST_SYSTEM', true, 'ALWAYS', 'en', 'FAST', NULL, NOW(), NOW(), NOW()),
('token-015', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'test_token3', 'OTHER', 'WHITELIST', 'CONTRACT-TEST-003', 'TT003', 'TEST_SYSTEM', true, 'ALWAYS', 'es', 'GREEN', NULL, NOW(), NOW(), NOW()),

-- Group Tokens
('token-016', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'group-token-001', 'RFID', 'RFID', 'CONTRACT-GROUP-001', 'GT001', :OCPI_PARTY_ID, true, 'ALWAYS', 'es', 'REGULAR', NULL, NOW(), NOW(), NOW()),
('token-017', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'group-token-002', 'APP_USER', 'APP_USER', 'CONTRACT-GROUP-002', 'GT002', :OCPI_PARTY_ID, true, 'ALLOWED', 'en', 'FAST', NULL, NOW(), NOW(), NOW()),

-- Invalid/Expired Tokens
('token-018', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'expired-token-001', 'RFID', 'RFID', 'CONTRACT-EXP-001', 'EX001', :OCPI_PARTY_ID, false, 'NEVER', 'es', 'REGULAR', NULL, NOW(), NOW(), NOW()),
('token-019', :OCPI_COUNTRY_CODE, :OCPI_PARTY_ID, 'invalid-token-001', 'APP_USER', 'APP_USER', 'CONTRACT-INV-001', 'IN001', :OCPI_PARTY_ID, false, 'NEVER', 'en', 'FAST', NULL, NOW(), NOW(), NOW());

-- Insert OCPI authentication token using environment variables
INSERT INTO ocpi_tokens (id, token, party_id, country_code, is_active, metadata) VALUES
(gen_random_uuid(), :OCPI_TOKEN, :OCPI_PARTY_ID, :OCPI_COUNTRY_CODE, true, 
 '{"description": "Default OCPI authentication token", "created_by": "setup_script"}'::json);

-- Verify data insertion
SELECT 'Locations' as table_name, COUNT(*) as count FROM locations
UNION ALL
SELECT 'EVSEs' as table_name, COUNT(*) as count FROM evses
UNION ALL
SELECT 'Tariffs' as table_name, COUNT(*) as count FROM tariffs
UNION ALL
SELECT 'Tokens' as table_name, COUNT(*) as count FROM tokens
UNION ALL
SELECT 'OCPI Tokens' as table_name, COUNT(*) as count FROM ocpi_tokens;
