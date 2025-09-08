-- Complete Database Setup Script
-- This script populates the database with clean, consistent data

-- Clear all existing data (only if tables exist)
DO $$ 
BEGIN
    -- Only truncate if the main tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'locations') THEN
        -- Truncate main tables
        TRUNCATE TABLE evses, locations, sessions, cdrs, tariffs, tokens, credentials RESTART IDENTITY CASCADE;
        
        -- Truncate emsp tables if they exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emsp_locations') THEN
            TRUNCATE TABLE emsp_locations, emsp_evses, emsp_tariffs, emsp_sessions, emsp_cdrs, emsp_tokens, emsp_contracts RESTART IDENTITY CASCADE;
        END IF;
    END IF;
END $$;

-- Insert Locations (distributed across Spain and Portugal)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
-- Madrid Metropolitan Area (15 locations)
('loc-mad-001', 'ES', 'ES-CPO', 'Centro Comercial Plaza Norte 2', 'Plaza Norte 2, 28760 Tres Cantos', 'Tres Cantos', 'Spain', '{"latitude": 40.6011, "longitude": -3.7083}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-002', 'ES', 'ES-CPO', 'Centro Comercial La Gavia', 'Av. de las Suertes, 28047', 'Madrid', 'Spain', '{"latitude": 40.3897, "longitude": -3.6289}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-003', 'ES', 'ES-CPO', 'Centro Comercial Isla Azul', 'Calle de la Isla Azul, 28042', 'Madrid', 'Spain', '{"latitude": 40.4567, "longitude": -3.6123}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-004', 'ES', 'ES-CPO', 'Centro Comercial Plaza de Castilla', 'Plaza de Castilla, 28046', 'Madrid', 'Spain', '{"latitude": 40.4667, "longitude": -3.6897}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-005', 'ES', 'ES-CPO', 'Centro Comercial Príncipe Pío', 'Paseo de la Florida, 28008', 'Madrid', 'Spain', '{"latitude": 40.4233, "longitude": -3.7189}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Barcelona Metropolitan Area (10 locations)
('loc-bcn-001', 'ES', 'ES-CPO', 'Centro Comercial Diagonal Mar', 'Passeig del Taulat, 08019', 'Barcelona', 'Spain', '{"latitude": 41.4089, "longitude": 2.2197}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-002', 'ES', 'ES-CPO', 'Centro Comercial La Maquinista', 'Carrer de Josep Estivill, 08030', 'Barcelona', 'Spain', '{"latitude": 41.4456, "longitude": 2.1898}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-003', 'ES', 'ES-CPO', 'Centro Comercial Glòries', 'Av. Diagonal, 208, 08013', 'Barcelona', 'Spain', '{"latitude": 41.4036, "longitude": 2.1897}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Valencia (5 locations)
('loc-val-001', 'ES', 'ES-CPO', 'Centro Comercial Aqua Multiespacio', 'Carrer de Menorca, 19, 46023', 'València', 'Spain', '{"latitude": 39.4699, "longitude": -0.3763}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-002', 'ES', 'ES-CPO', 'Centro Comercial Nuevo Centro', 'Carrer de Menorca, 19, 46023', 'València', 'Spain', '{"latitude": 39.4699, "longitude": -0.3763}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Sevilla (5 locations)
('loc-sev-001', 'ES', 'ES-CPO', 'Centro Comercial Los Arcos', 'Av. de Andalucía, 1, 41007', 'Sevilla', 'Spain', '{"latitude": 37.3891, "longitude": -5.9845}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-002', 'ES', 'ES-CPO', 'Centro Comercial Nervión Plaza', 'Calle Luis Montoto, 41005', 'Sevilla', 'Spain', '{"latitude": 37.3898, "longitude": -5.9767}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Bilbao (5 locations)
('loc-bil-001', 'ES', 'ES-CPO', 'Centro Comercial Zubiarte', 'Paseo de Uribitarte, 48001', 'Bilbao', 'Spain', '{"latitude": 43.2627, "longitude": -2.9253}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bil-002', 'ES', 'ES-CPO', 'Centro Comercial Max Center', 'Calle Max, 1, 48950 Erandio', 'Erandio', 'Spain', '{"latitude": 43.3123, "longitude": -2.9567}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Málaga (5 locations)
('loc-mal-001', 'ES', 'ES-CPO', 'Centro Comercial Larios', 'Calle Larios, 29005', 'Málaga', 'Spain', '{"latitude": 36.7213, "longitude": -4.4217}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mal-002', 'ES', 'ES-CPO', 'Centro Comercial Vialia', 'Estación de Málaga-María Zambrano, 29002', 'Málaga', 'Spain', '{"latitude": 36.7456, "longitude": -4.4567}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),

-- Lisboa (5 locations)
('loc-lis-001', 'PT', 'ES-CPO', 'Centro Comercial Colombo', 'Av. Lusíada, 1500-392', 'Lisboa', 'Portugal', '{"latitude": 38.7223, "longitude": -9.1393}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-002', 'PT', 'ES-CPO', 'Centro Comercial Vasco da Gama', 'Av. D. João II, 1990-094', 'Lisboa', 'Portugal', '{"latitude": 38.7567, "longitude": -9.0945}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),

-- Porto (5 locations)
('loc-por-001', 'PT', 'ES-CPO', 'Centro Comercial NorteShopping', 'Rua Sara Martins de Almeida, 4460-841 Senhora da Hora', 'Senhora da Hora', 'Portugal', '{"latitude": 41.1897, "longitude": -8.6567}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-002', 'PT', 'ES-CPO', 'Centro Comercial Mar Shopping', 'Rua do Mar, 4150-518', 'Porto', 'Portugal', '{"latitude": 41.1567, "longitude": -8.6234}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW());

-- Insert EVSEs (distributed across locations, max 50 per location)
INSERT INTO evses (id, location_id, country_code, party_id, evse_id, status, capabilities, connectors, floor_level, coordinates, physical_reference, directions, parking_restrictions, group_id, last_updated, created_at, updated_at) VALUES
-- Location: loc-mad-001 (Centro Comercial Plaza Norte 2) - 3 EVSEs
('evse-mad-001-001', 'loc-mad-001', 'ES', 'ES-CPO', 'ES-CPO-MAD-001-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.6011, "longitude": -3.7083}', 'A1', '{"text": "Entrada principal, primera fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-001', NOW(), NOW(), NOW()),
('evse-mad-001-002', 'loc-mad-001', 'ES', 'ES-CPO', 'ES-CPO-MAD-001-002', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "2", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.6011, "longitude": -3.7083}', 'A2', '{"text": "Entrada principal, segunda fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-001', NOW(), NOW(), NOW()),
('evse-mad-001-003', 'loc-mad-001', 'ES', 'ES-CPO', 'ES-CPO-MAD-001-003', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "3", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.6011, "longitude": -3.7083}', 'A3', '{"text": "Entrada principal, tercera fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-001', NOW(), NOW(), NOW()),

-- Location: loc-mad-002 (Centro Comercial La Gavia) - 2 EVSEs
('evse-mad-002-001', 'loc-mad-002', 'ES', 'ES-CPO', 'ES-CPO-MAD-002-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.3897, "longitude": -3.6289}', 'B1', '{"text": "Entrada sur, primera fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-002', NOW(), NOW(), NOW()),
('evse-mad-002-002', 'loc-mad-002', 'ES', 'ES-CPO', 'ES-CPO-MAD-002-002', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "2", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 40.3897, "longitude": -3.6289}', 'B2', '{"text": "Entrada sur, segunda fila"}', '["RESERVED", "EV_ONLY"]', 'group-mad-002', NOW(), NOW(), NOW()),

-- Location: loc-bcn-001 (Centro Comercial Diagonal Mar) - 2 EVSEs
('evse-bcn-001-001', 'loc-bcn-001', 'ES', 'ES-CPO', 'ES-CPO-BCN-001-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 41.4089, "longitude": 2.2197}', 'C1', '{"text": "Entrada mar, primera fila"}', '["RESERVED", "EV_ONLY"]', 'group-bcn-001', NOW(), NOW(), NOW()),
('evse-bcn-001-002', 'loc-bcn-001', 'ES', 'ES-CPO', 'ES-CPO-BCN-001-002', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "2", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 41.4089, "longitude": 2.2197}', 'C2', '{"text": "Entrada mar, segunda fila"}', '["RESERVED", "EV_ONLY"]', 'group-bcn-001', NOW(), NOW(), NOW()),

-- Location: loc-lis-001 (Centro Comercial Colombo) - 2 EVSEs
('evse-lis-001-001', 'loc-lis-001', 'PT', 'ES-CPO', 'ES-CPO-LIS-001-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 38.7223, "longitude": -9.1393}', 'D1', '{"text": "Entrada principal, primeira fila"}', '["RESERVED", "EV_ONLY"]', 'group-lis-001', NOW(), NOW(), NOW()),
('evse-lis-001-002', 'loc-lis-001', 'PT', 'ES-CPO', 'ES-CPO-LIS-001-002', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "2", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 38.7223, "longitude": -9.1393}', 'D2', '{"text": "Entrada principal, segunda fila"}', '["RESERVED", "EV_ONLY"]', 'group-lis-001', NOW(), NOW(), NOW()),

-- Location: loc-val-001 (Centro Comercial Aqua Multiespacio) - 1 EVSE
('evse-val-001-001', 'loc-val-001', 'ES', 'ES-CPO', 'ES-CPO-VAL-001-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 39.4699, "longitude": -0.3763}', 'E1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-val-001', NOW(), NOW(), NOW()),

-- Location: loc-sev-001 (Centro Comercial Los Arcos) - 1 EVSE
('evse-sev-001-001', 'loc-sev-001', 'ES', 'ES-CPO', 'ES-CPO-SEV-001-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 37.3891, "longitude": -5.9845}', 'F1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-sev-001', NOW(), NOW(), NOW()),

-- Location: loc-bil-001 (Centro Comercial Zubiarte) - 1 EVSE
('evse-bil-001-001', 'loc-bil-001', 'ES', 'ES-CPO', 'ES-CPO-BIL-001-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 43.2627, "longitude": -2.9253}', 'G1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-bil-001', NOW(), NOW(), NOW()),

-- Location: loc-mal-001 (Centro Comercial Larios) - 1 EVSE
('evse-mal-001-001', 'loc-mal-001', 'ES', 'ES-CPO', 'ES-CPO-MAL-001-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 36.7213, "longitude": -4.4217}', 'H1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-mal-001', NOW(), NOW(), NOW()),

-- Location: loc-por-001 (Centro Comercial NorteShopping) - 1 EVSE
('evse-por-001-001', 'loc-por-001', 'PT', 'ES-CPO', 'ES-CPO-POR-001-001', 'AVAILABLE', '["RESERVABLE", "RFID_READER"]', '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]', 'P0', '{"latitude": 41.1897, "longitude": -8.6567}', 'I1', '{"text": "Entrada principal"}', '["RESERVED", "EV_ONLY"]', 'group-por-001', NOW(), NOW(), NOW());

-- Insert sample tariffs
INSERT INTO tariffs (id, country_code, party_id, currency, type, elements, start_date_time, end_date_time, last_updated, created_at, updated_at) VALUES
('tariff-001', 'ES', 'ES-CPO', 'EUR', 'REGULAR', '[{"price_components": [{"type": "ENERGY", "price": 0.25, "step_size": 1}]}]', NULL, NULL, NOW(), NOW(), NOW()),
('tariff-002', 'ES', 'ES-CPO', 'EUR', 'FAST', '[{"price_components": [{"type": "ENERGY", "price": 0.35, "step_size": 1}]}]', NULL, NULL, NOW(), NOW(), NOW()),
('tariff-003', 'PT', 'ES-CPO', 'EUR', 'REGULAR', '[{"price_components": [{"type": "ENERGY", "price": 0.28, "step_size": 1}]}]', NULL, NULL, NOW(), NOW(), NOW());

-- Insert sample tokens
INSERT INTO tokens (id, country_code, party_id, uid, type, contract_id, issuer, valid, whitelist, language, default_profile_type, energy_contract, last_updated, created_at, updated_at) VALUES
('token-001', 'ES', 'ES-CPO', 'TOKEN-001', 'RFID', 'CONTRACT-001', 'ES-CPO', true, 'ALWAYS', 'es', 'REGULAR', NULL, NOW(), NOW(), NOW()),
('token-002', 'ES', 'ES-CPO', 'TOKEN-002', 'APP_USER', 'CONTRACT-002', 'ES-CPO', true, 'ALLOWED', 'en', 'FAST', NULL, NOW(), NOW(), NOW());

-- Verify data insertion
SELECT 'Locations' as table_name, COUNT(*) as count FROM locations
UNION ALL
SELECT 'EVSEs' as table_name, COUNT(*) as count FROM evses
UNION ALL
SELECT 'Tariffs' as table_name, COUNT(*) as count FROM tariffs
UNION ALL
SELECT 'Tokens' as table_name, COUNT(*) as count FROM tokens;
