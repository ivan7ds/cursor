-- Clear existing test data
DELETE FROM locations WHERE id LIKE 'loc-%';

-- Madrid Metropolitan Area (60 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-mad-001', 'ES', 'ES-CPO', 'Centro Comercial Plaza Norte 2', 'Plaza Norte 2, 28760 Tres Cantos', 'Tres Cantos', 'Spain', '{"latitude": 40.6011, "longitude": -3.7083}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-002', 'ES', 'ES-CPO', 'Centro Comercial La Gavia', 'Av. de las Suertes, 28047', 'Madrid', 'Spain', '{"latitude": 40.3897, "longitude": -3.6289}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-003', 'ES', 'ES-CPO', 'Centro Comercial Isla Azul', 'Calle de la Isla Azul, 28042', 'Madrid', 'Spain', '{"latitude": 40.4567, "longitude": -3.6123}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-004', 'ES', 'ES-CPO', 'Centro Comercial Plaza de Castilla', 'Plaza de Castilla, 28046', 'Madrid', 'Spain', '{"latitude": 40.4667, "longitude": -3.6897}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-005', 'ES', 'ES-CPO', 'Centro Comercial Príncipe Pío', 'Paseo de la Florida, 28008', 'Madrid', 'Spain', '{"latitude": 40.4233, "longitude": -3.7189}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-006', 'ES', 'ES-CPO', 'Centro Comercial Xanadú', 'Autovía A-5, Km 23, 28939 Arroyomolinos', 'Arroyomolinos', 'Spain', '{"latitude": 40.2678, "longitude": -3.9233}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-007', 'ES', 'ES-CPO', 'Centro Comercial Espacio Torrelodones', 'Calle Real, 28250 Torrelodones', 'Torrelodones', 'Spain', '{"latitude": 40.5767, "longitude": -3.9289}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-008', 'ES', 'ES-CPO', 'Centro Comercial Gran Plaza 2', 'Calle de la Gran Plaza, 28922 Alcorcón', 'Alcorcón', 'Spain', '{"latitude": 40.3456, "longitude": -3.8234}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-009', 'ES', 'ES-CPO', 'Centro Comercial Madrid Sur', 'Calle de la Avenida Sur, 28941 Fuenlabrada', 'Fuenlabrada', 'Spain', '{"latitude": 40.2847, "longitude": -3.7945}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-010', 'ES', 'ES-CPO', 'Centro Comercial Las Rozas Village', 'Calle Juan Ramón Jiménez, 28232 Las Rozas', 'Las Rozas', 'Spain', '{"latitude": 40.4923, "longitude": -3.8765}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Barcelona Metropolitan Area (40 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-bcn-001', 'ES', 'ES-CPO', 'Centro Comercial Diagonal Mar', 'Passeig del Taulat, 08019', 'Barcelona', 'Spain', '{"latitude": 41.4089, "longitude": 2.2197}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-002', 'ES', 'ES-CPO', 'Centro Comercial La Maquinista', 'Carrer de Josep Estivill, 08030', 'Barcelona', 'Spain', '{"latitude": 41.4456, "longitude": 2.1898}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-003', 'ES', 'ES-CPO', 'Centro Comercial Glòries', 'Av. Diagonal, 208, 08013', 'Barcelona', 'Spain', '{"latitude": 41.4036, "longitude": 2.1897}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-004', 'ES', 'ES-CPO', 'Centro Comercial Maremagnum', 'Moll d''Espanya, 5, 08039', 'Barcelona', 'Spain', '{"latitude": 41.3678, "longitude": 2.1896}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-005', 'ES', 'ES-CPO', 'Centro Comercial L''Illa Diagonal', 'Av. Diagonal, 557, 08029', 'Barcelona', 'Spain', '{"latitude": 41.3897, "longitude": 2.1567}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Valencia (20 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-val-001', 'ES', 'ES-CPO', 'Centro Comercial Aqua Multiespacio', 'Carrer de Menorca, 19, 46023', 'València', 'Spain', '{"latitude": 39.4699, "longitude": -0.3763}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-002', 'ES', 'ES-CPO', 'Centro Comercial Nuevo Centro', 'Carrer de Menorca, 19, 46023', 'València', 'Spain', '{"latitude": 39.4699, "longitude": -0.3763}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-003', 'ES', 'ES-CPO', 'Centro Comercial Bonaire', 'Carrer de Bonaire, 1, 46008', 'València', 'Spain', '{"latitude": 39.4567, "longitude": -0.3898}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Sevilla (15 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-sev-001', 'ES', 'ES-CPO', 'Centro Comercial Los Arcos', 'Av. de Andalucía, 1, 41007', 'Sevilla', 'Spain', '{"latitude": 37.3891, "longitude": -5.9845}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-002', 'ES', 'ES-CPO', 'Centro Comercial Nervión Plaza', 'Calle Luis Montoto, 41005', 'Sevilla', 'Spain', '{"latitude": 37.3898, "longitude": -5.9767}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Bilbao (15 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-bil-001', 'ES', 'ES-CPO', 'Centro Comercial Zubiarte', 'Paseo de Uribitarte, 48001', 'Bilbao', 'Spain', '{"latitude": 43.2627, "longitude": -2.9253}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bil-002', 'ES', 'ES-CPO', 'Centro Comercial Max Center', 'Calle Max, 1, 48950 Erandio', 'Erandio', 'Spain', '{"latitude": 43.3123, "longitude": -2.9567}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Málaga (15 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-mal-001', 'ES', 'ES-CPO', 'Centro Comercial Larios', 'Calle Larios, 29005', 'Málaga', 'Spain', '{"latitude": 36.7213, "longitude": -4.4217}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mal-002', 'ES', 'ES-CPO', 'Centro Comercial Vialia', 'Estación de Málaga-María Zambrano, 29002', 'Málaga', 'Spain', '{"latitude": 36.7456, "longitude": -4.4567}', 'ON_STREET', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Lisboa (20 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-lis-001', 'PT', 'ES-CPO', 'Centro Comercial Colombo', 'Av. Lusíada, 1500-392', 'Lisboa', 'Portugal', '{"latitude": 38.7223, "longitude": -9.1393}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-002', 'PT', 'ES-CPO', 'Centro Comercial Vasco da Gama', 'Av. D. João II, 1990-094', 'Lisboa', 'Portugal', '{"latitude": 38.7567, "longitude": -9.0945}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-003', 'PT', 'ES-CPO', 'Centro Comercial Amoreiras', 'Av. Eng. Duarte Pacheco, 1070-103', 'Lisboa', 'Portugal', '{"latitude": 38.7234, "longitude": -9.1567}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW());

-- Porto (15 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-por-001', 'PT', 'ES-CPO', 'Centro Comercial NorteShopping', 'Rua Sara Martins de Almeida, 4460-841 Senhora da Hora', 'Senhora da Hora', 'Portugal', '{"latitude": 41.1897, "longitude": -8.6567}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-002', 'PT', 'ES-CPO', 'Centro Comercial Mar Shopping', 'Rua do Mar, 4150-518', 'Porto', 'Portugal', '{"latitude": 41.1567, "longitude": -8.6234}', 'ON_STREET', 'Europe/Lisbon', NOW(), NOW(), NOW());
