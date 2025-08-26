-- Generate multiple locations across Spain and Portugal
-- This will create approximately 200 locations to distribute 10,000 EVSEs evenly

-- Spain - Major cities and regions
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, evse_list, time_zone, last_updated, created_at, updated_at) VALUES
('loc-004', 'ES', 'ES-CPO', 'Centro Comercial Valencia', 'Calle Colón 123', 'Valencia', 'Spain', '{"latitude": 39.4699, "longitude": -0.3763}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-005', 'ES', 'ES-CPO', 'Estación de Servicio Sevilla', 'Avenida de la Constitución 45', 'Sevilla', 'Spain', '{"latitude": 37.3891, "longitude": -5.9845}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-006', 'ES', 'ES-CPO', 'Centro Comercial Zaragoza', 'Paseo de la Independencia 67', 'Zaragoza', 'Spain', '{"latitude": 41.6488, "longitude": -0.8891}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-007', 'ES', 'ES-CPO', 'Estación de Servicio Málaga', 'Calle Larios 23', 'Málaga', 'Spain', '{"latitude": 36.7213, "longitude": -4.4217}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-008', 'ES', 'ES-CPO', 'Centro Comercial Murcia', 'Plaza de Santo Domingo 12', 'Murcia', 'Spain', '{"latitude": 37.9922, "longitude": -1.1307}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-009', 'ES', 'ES-CPO', 'Estación de Servicio Palma', 'Avenida de Jaume III 45', 'Palma', 'Spain', '{"latitude": 39.5696, "longitude": 2.6502}', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-010', 'ES', 'ES-CPO', 'Centro Comercial Las Palmas', 'Calle Mayor de Triana 78', 'Las Palmas', 'Spain', '{"latitude": 28.1235, "longitude": -15.4366}', '[]', 'Atlantic/Canary', NOW(), NOW(), NOW()),
('loc-011', 'ES', 'ES-CPO', 'Estación de Servicio Bilbao', 'Gran Vía 89', 'Bilbao', 'Spain', '{"latitude": 43.2627, "longitude": -2.9253}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-012', 'ES', 'ES-CPO', 'Centro Comercial Alicante', 'Rambla de Méndez Núñez 34', 'Alicante', 'Spain', '{"latitude": 38.3452, "longitude": -0.4815}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-013', 'ES', 'ES-CPO', 'Estación de Servicio Córdoba', 'Calle de la Feria 56', 'Córdoba', 'Spain', '{"latitude": 37.8882, "longitude": -4.7794}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-014', 'ES', 'ES-CPO', 'Centro Comercial Valladolid', 'Plaza Mayor 23', 'Valladolid', 'Spain', '{"latitude": 41.6523, "longitude": -4.7286}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-015', 'ES', 'ES-CPO', 'Estación de Servicio Vigo', 'Calle del Príncipe 78', 'Vigo', 'Spain', '{"latitude": 42.2406, "longitude": -8.7207}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-016', 'ES', 'ES-CPO', 'Centro Comercial Gijón', 'Calle de la Luna 45', 'Gijón', 'Spain', '{"latitude": 43.5453, "longitude": -5.6619}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-017', 'ES', 'ES-CPO', 'Estación de Servicio L\'Hospitalet', 'Avenida de la Gran Via 123', 'L\'Hospitalet', 'Spain', '{"latitude": 41.3597, "longitude": 2.0994}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-018', 'ES', 'ES-CPO', 'Centro Comercial A Coruña', 'Calle Real 67', 'A Coruña', 'Spain', '{"latitude": 43.3713, "longitude": -8.3960}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-019', 'ES', 'ES-CPO', 'Estación de Servicio Vitoria', 'Calle de la Paz 89', 'Vitoria', 'Spain', '{"latitude": 42.8467, "longitude": -2.6726}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-020', 'ES', 'ES-CPO', 'Centro Comercial Granada', 'Calle de los Reyes Católicos 34', 'Granada', 'Spain', '{"latitude": 37.1765, "longitude": -3.5976}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Portugal - Major cities and regions
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, evse_list, time_zone, last_updated, created_at, updated_at) VALUES
('loc-021', 'PT', 'ES-CPO', 'Centro Comercial Braga', 'Rua do Souto 45', 'Braga', 'Portugal', '{"latitude": 41.5454, "longitude": -8.4265}', '[]', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-022', 'PT', 'ES-CPO', 'Estación de Servicio Coimbra', 'Rua Ferreira Borges 78', 'Coimbra', 'Portugal', '{"latitude": 40.2033, "longitude": -8.4103}', '[]', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-023', 'PT', 'ES-CPO', 'Centro Comercial Setúbal', 'Avenida Luísa Todi 123', 'Setúbal', 'Portugal', '{"latitude": 38.5243, "longitude": -8.8926}', '[]', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-024', 'PT', 'ES-CPO', 'Estación de Servicio Almada', 'Rua Capitão Leitão 56', 'Almada', 'Portugal', '{"latitude": 38.6792, "longitude": -9.1569}', '[]', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-025', 'PT', 'ES-CPO', 'Centro Comercial Agualva-Cacém', 'Rua da República 89', 'Agualva-Cacém', 'Portugal', '{"latitude": 38.7669, "longitude": -9.2973}', '[]', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-026', 'PT', 'ES-CPO', 'Estación de Servicio Amadora', 'Avenida da República 234', 'Amadora', 'Portugal', '{"latitude": 38.7545, "longitude": -9.2306}', '[]', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-027', 'PT', 'ES-CPO', 'Centro Comercial Queluz', 'Rua Dr. António José de Almeida 67', 'Queluz', 'Portugal', '{"latitude": 38.7564, "longitude": -9.2544}', '[]', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-028', 'PT', 'ES-CPO', 'Estación de Servicio Funchal', 'Rua do Gorgulho 123', 'Funchal', 'Portugal', '{"latitude": 32.6669, "longitude": -16.9241}', '[]', 'Atlantic/Madeira', NOW(), NOW(), NOW()),
('loc-029', 'PT', 'ES-CPO', 'Centro Comercial Ponta Delgada', 'Rua da Mãe de Deus 45', 'Ponta Delgada', 'Portugal', '{"latitude": 37.7412, "longitude": -25.6756}', '[]', 'Atlantic/Azores', NOW(), NOW(), NOW()),
('loc-030', 'PT', 'ES-CPO', 'Estación de Servicio Faro', 'Rua de Santo António 78', 'Faro', 'Portugal', '{"latitude": 37.0194, "longitude": -7.9304}', '[]', 'Europe/Lisbon', NOW(), NOW(), NOW());

-- Continue with more Spanish cities to reach approximately 200 locations
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, evse_list, time_zone, last_updated, created_at, updated_at) VALUES
('loc-031', 'ES', 'ES-CPO', 'Centro Comercial Elche', 'Avenida de la Libertad 123', 'Elche', 'Spain', '{"latitude": 38.2669, "longitude": -0.6987}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-032', 'ES', 'ES-CPO', 'Estación de Servicio Tarrasa', 'Rambla de Egara 67', 'Tarrasa', 'Spain', '{"latitude": 41.5604, "longitude": 2.0084}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-033', 'ES', 'ES-CPO', 'Centro Comercial Jerez de la Frontera', 'Calle Larga 89', 'Jerez de la Frontera', 'Spain', '{"latitude": 36.6866, "longitude": -6.1372}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-034', 'ES', 'ES-CPO', 'Estación de Servicio Alcalá de Henares', 'Calle Mayor 234', 'Alcalá de Henares', 'Spain', '{"latitude": 40.4819, "longitude": -3.3635}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-035', 'ES', 'ES-CPO', 'Centro Comercial Marbella', 'Avenida Ricardo Soriano 56', 'Marbella', 'Spain', '{"latitude": 36.5097, "longitude": -4.8860}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-036', 'ES', 'ES-CPO', 'Estación de Servicio Almería', 'Paseo de Almería 123', 'Almería', 'Spain', '{"latitude": 36.8340, "longitude": -2.4637}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-037', 'ES', 'ES-CPO', 'Centro Comercial Fuenlabrada', 'Avenida de la Comunidad de Madrid 78', 'Fuenlabrada', 'Spain', '{"latitude": 40.2842, "longitude": -3.7946}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-038', 'ES', 'ES-CPO', 'Estación de Servicio Móstoles', 'Avenida de la Constitución 45', 'Móstoles', 'Spain', '{"latitude": 40.3233, "longitude": -3.8649}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-039', 'ES', 'ES-CPO', 'Centro Comercial Alcorcón', 'Avenida de los Castillos 67', 'Alcorcón', 'Spain', '{"latitude": 40.3498, "longitude": -3.8317}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-040', 'ES', 'ES-CPO', 'Estación de Servicio Parla', 'Avenida de la Libertad 89', 'Parla', 'Spain', '{"latitude": 40.2364, "longitude": -3.7675}', '[]', 'Europe/Madrid', NOW(), NOW(), NOW());
