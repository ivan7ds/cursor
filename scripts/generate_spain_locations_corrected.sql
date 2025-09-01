-- Script corregido para generar 10 zonas con EVSEs en España
-- Usando ubicaciones y coordenadas reales
-- Fecha: 2025-09-01

-- Limpiar datos existentes (opcional)
-- DELETE FROM evses WHERE location_id IN (SELECT id FROM locations WHERE country = 'ESP' AND city IN ('Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza', 'Granada', 'Alicante', 'Valladolid'));
-- DELETE FROM locations WHERE country = 'ESP' AND city IN ('Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza', 'Granada', 'Alicante', 'Valladolid');

-- 1. MADRID - Centro Comercial Plaza Norte 2
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-MADRID-PLAZA-NORTE', 'ES', 'IPD', 'Plaza Norte 2 - Estación de Carga', 'Calle de la Viña, 3', 'Madrid', '28050', 'Madrid', 'ESP', '{"latitude": "40.4168", "longitude": "-3.7038"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 2. BARCELONA - Centro Comercial Diagonal Mar
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-BARCELONA-DIAGONAL-MAR', 'ES', 'IPD', 'Diagonal Mar - Estación de Carga', 'Passeig del Taulat, 262-264', 'Barcelona', '08019', 'Barcelona', 'ESP', '{"latitude": "41.3851", "longitude": "2.1734"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 3. VALENCIA - Centro Comercial Aqua Multiespacio
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-VALENCIA-AQUA', 'ES', 'IPD', 'Aqua Multiespacio - Estación de Carga', 'Carrer de Menorca, 19', 'Valencia', '46023', 'Valencia', 'ESP', '{"latitude": "39.4699", "longitude": "-0.3763"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 4. SEVILLA - Centro Comercial Plaza de Armas
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-SEVILLA-PLAZA-ARMAS', 'ES', 'IPD', 'Plaza de Armas - Estación de Carga', 'Plaza de Armas, 1', 'Sevilla', '41001', 'Sevilla', 'ESP', '{"latitude": "37.3891", "longitude": "-5.9845"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 5. BILBAO - Centro Comercial Zubiarte
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-BILBAO-ZUBIARTE', 'ES', 'IPD', 'Zubiarte - Estación de Carga', 'Paseo Campo Volantín, 23', 'Bilbao', '48007', 'Vizcaya', 'ESP', '{"latitude": "43.2627", "longitude": "-2.9253"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 6. MÁLAGA - Centro Comercial Larios
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-MALAGA-LARIOS', 'ES', 'IPD', 'Larios - Estación de Carga', 'Calle Larios, 1', 'Málaga', '29005', 'Málaga', 'ESP', '{"latitude": "36.7213", "longitude": "-4.4217"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 7. ZARAGOZA - Centro Comercial Puerto Venecia
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-ZARAGOZA-PUERTO-VENECIA', 'ES', 'IPD', 'Puerto Venecia - Estación de Carga', 'Calle de las Fuentes, 1', 'Zaragoza', '50018', 'Zaragoza', 'ESP', '{"latitude": "41.6488", "longitude": "-0.8891"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 8. GRANADA - Centro Comercial Nevada
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-GRANADA-NEVADA', 'ES', 'IPD', 'Nevada - Estación de Carga', 'Avenida de la Constitución, 1', 'Granada', '18012', 'Granada', 'ESP', '{"latitude": "37.1765", "longitude": "-3.5976"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 9. ALICANTE - Centro Comercial Gran Vía
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-ALICANTE-GRAN-VIA', 'ES', 'IPD', 'Gran Vía - Estación de Carga', 'Avenida de Denia, 1', 'Alicante', '03015', 'Alicante', 'ESP', '{"latitude": "38.3452", "longitude": "-0.4945"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- 10. VALLADOLID - Centro Comercial Vallsur
INSERT INTO locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, parking_type, time_zone, last_updated, created_at, updated_at) VALUES
('ES-IPD-VALLADOLID-VALLSUR', 'ES', 'IPD', 'Vallsur - Estación de Carga', 'Paseo de Zorrilla, 1', 'Valladolid', '47007', 'Valladolid', 'ESP', '{"latitude": "41.6523", "longitude": "-4.7284"}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());
