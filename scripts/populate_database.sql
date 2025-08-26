-- Populate database with well-distributed locations and EVSEs
-- This script creates a realistic distribution of charging infrastructure across Spain and Portugal

-- Clear existing data
DELETE FROM evses;
DELETE FROM locations;
DELETE FROM tariffs;
DELETE FROM tokens;
DELETE FROM sessions;
DELETE FROM cdrs;
DELETE FROM credentials;

-- Insert locations across Spain and Portugal (target: ~200 locations)
-- Madrid region (20 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-mad-001', 'ES', 'ES-CPO', 'Centro Comercial Plaza Norte 2', 'Plaza Norte 2, 28760 Tres Cantos', 'Tres Cantos', 'Spain', '{"latitude": 40.6011, "longitude": -3.7083}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-002', 'ES', 'ES-CPO', 'Centro Comercial La Gavia', 'Av. de las Suertes, 28047', 'Madrid', 'Spain', '{"latitude": 40.3897, "longitude": -3.6289}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-003', 'ES', 'ES-CPO', 'Centro Comercial Xanadú', 'Autovía A-5, Km 22, 28939 Arroyomolinos', 'Arroyomolinos', 'Spain', '{"latitude": 40.2678, "longitude": -3.9194}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-004', 'ES', 'ES-CPO', 'Centro Comercial Gran Plaza 2', 'Calle de la Gran Plaza, 28924 Alcorcón', 'Alcorcón', 'Spain', '{"latitude": 40.3498, "longitude": -3.8317}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-005', 'ES', 'ES-CPO', 'Centro Comercial Espacio Torrelodones', 'Calle de la Sierra, 28250 Torrelodones', 'Torrelodones', 'Spain', '{"latitude": 40.5769, "longitude": -3.9297}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-006', 'ES', 'ES-CPO', 'Centro Comercial Las Rozas Village', 'Calle Juan Ramón Jiménez, 28232 Las Rozas', 'Las Rozas', 'Spain', '{"latitude": 40.4928, "longitude": -3.8739}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-007', 'ES', 'ES-CPO', 'Centro Comercial Isla Azul', 'Calle de la Isla Azul, 28026 Madrid', 'Madrid', 'Spain', '{"latitude": 40.3789, "longitude": -3.7123}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-008', 'ES', 'ES-CPO', 'Centro Comercial Madrid Sur', 'Calle del Sur, 28026 Madrid', 'Madrid', 'Spain', '{"latitude": 40.3767, "longitude": -3.7145}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-009', 'ES', 'ES-CPO', 'Centro Comercial Príncipe Pío', 'Paseo de la Florida, 28008 Madrid', 'Madrid', 'Spain', '{"latitude": 40.4223, "longitude": -3.7189}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-010', 'ES', 'ES-CPO', 'Centro Comercial Plaza Río 2', 'Calle de la Princesa, 28008 Madrid', 'Madrid', 'Spain', '{"latitude": 40.4245, "longitude": -3.7167}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-011', 'ES', 'ES-CPO', 'Centro Comercial La Vaguada', 'Calle de la Vaguada, 28029 Madrid', 'Madrid', 'Spain', '{"latitude": 40.4567, "longitude": -3.6890}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-012', 'ES', 'ES-CPO', 'Centro Comercial Moraleja Green', 'Calle de la Moraleja, 28109 Alcobendas', 'Alcobendas', 'Spain', '{"latitude": 40.5234, "longitude": -3.6456}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-013', 'ES', 'ES-CPO', 'Centro Comercial Boadilla Centro', 'Calle de Boadilla, 28660 Boadilla del Monte', 'Boadilla del Monte', 'Spain', '{"latitude": 40.4123, "longitude": -3.8765}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-014', 'ES', 'ES-CPO', 'Centro Comercial Pozuelo', 'Calle de Pozuelo, 28223 Pozuelo de Alarcón', 'Pozuelo de Alarcón', 'Spain', '{"latitude": 40.4345, "longitude": -3.8123}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-015', 'ES', 'ES-CPO', 'Centro Comercial Majadahonda', 'Calle de Majadahonda, 28220 Majadahonda', 'Majadahonda', 'Spain', '{"latitude": 40.4567, "longitude": -3.8234}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-016', 'ES', 'ES-CPO', 'Centro Comercial Villaviciosa', 'Calle de Villaviciosa, 28670 Villaviciosa de Odón', 'Villaviciosa de Odón', 'Spain', '{"latitude": 40.3789, "longitude": -3.9012}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-017', 'ES', 'ES-CPO', 'Centro Comercial Valdemoro', 'Calle de Valdemoro, 28340 Valdemoro', 'Valdemoro', 'Spain', '{"latitude": 40.1901, "longitude": -3.6789}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-018', 'ES', 'ES-CPO', 'Centro Comercial Getafe', 'Calle de Getafe, 28901 Getafe', 'Getafe', 'Spain', '{"latitude": 40.3012, "longitude": -3.7234}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-019', 'ES', 'ES-CPO', 'Centro Comercial Fuenlabrada', 'Calle de Fuenlabrada, 28941 Fuenlabrada', 'Fuenlabrada', 'Spain', '{"latitude": 40.2845, "longitude": -3.7945}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-mad-020', 'ES', 'ES-CPO', 'Centro Comercial Móstoles', 'Calle de Móstoles, 28931 Móstoles', 'Móstoles', 'Spain', '{"latitude": 40.3234, "longitude": -3.8567}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Barcelona region (15 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-bcn-001', 'ES', 'ES-CPO', 'Centro Comercial Diagonal Mar', 'Passeig del Taulat, 262-264, 08019 Barcelona', 'Barcelona', 'Spain', '{"latitude": 41.4089, "longitude": 2.2197}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-002', 'ES', 'ES-CPO', 'Centro Comercial La Maquinista', 'Carrer de la Maquinista, 08018 Barcelona', 'Barcelona', 'Spain', '{"latitude": 41.3987, "longitude": 2.1890}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-003', 'ES', 'ES-CPO', 'Centro Comercial Glòries', 'Avinguda Diagonal, 208, 08013 Barcelona', 'Barcelona', 'Spain', '{"latitude": 41.4012, "longitude": 2.1876}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-004', 'ES', 'ES-CPO', 'Centro Comercial Arenas', 'Gran Via de les Corts Catalanes, 373-385, 08015 Barcelona', 'Barcelona', 'Spain', '{"latitude": 41.3756, "longitude": 2.1498}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-005', 'ES', 'ES-CPO', 'Centro Comercial Maremagnum', 'Moll d''Espanya, 5, 08039 Barcelona', 'Barcelona', 'Spain', '{"latitude": 41.3678, "longitude": 2.1890}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-006', 'ES', 'ES-CPO', 'Centro Comercial L''Illa Diagonal', 'Avinguda Diagonal, 557, 08029 Barcelona', 'Barcelona', 'Spain', '{"latitude": 41.3890, "longitude": 2.1567}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-007', 'ES', 'ES-CPO', 'Centro Comercial Pedralbes Centre', 'Avinguda de Pedralbes, 17, 08034 Barcelona', 'Barcelona', 'Spain', '{"latitude": 41.3890, "longitude": 2.1123}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-008', 'ES', 'ES-CPO', 'Centro Comercial Sant Cugat', 'Carrer de Sant Cugat, 08172 Sant Cugat del Vallès', 'Sant Cugat del Vallès', 'Spain', '{"latitude": 41.4678, "longitude": 2.0845}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-009', 'ES', 'ES-CPO', 'Centro Comercial Terrassa', 'Carrer de Terrassa, 08221 Terrassa', 'Terrassa', 'Spain', '{"latitude": 41.5567, "longitude": 2.0123}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-010', 'ES', 'ES-CPO', 'Centro Comercial Sabadell', 'Carrer de Sabadell, 08201 Sabadell', 'Sabadell', 'Spain', '{"latitude": 41.5456, "longitude": 2.1098}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-011', 'ES', 'ES-CPO', 'Centro Comercial Mataró', 'Carrer de Mataró, 08301 Mataró', 'Mataró', 'Spain', '{"latitude": 41.5345, "longitude": 2.4456}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-012', 'ES', 'ES-CPO', 'Centro Comercial Badalona', 'Carrer de Badalona, 08911 Badalona', 'Badalona', 'Spain', '{"latitude": 41.4456, "longitude": 2.2345}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-013', 'ES', 'ES-CPO', 'Centro Comercial Gavà', 'Carrer de Gavà, 08840 Gavà', 'Gavà', 'Spain', '{"latitude": 41.3234, "longitude": 2.0012}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-014', 'ES', 'ES-CPO', 'Centro Comercial Castelldefels', 'Carrer de Castelldefels, 08860 Castelldefels', 'Castelldefels', 'Spain', '{"latitude": 41.2789, "longitude": 1.9765}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-bcn-015', 'ES', 'ES-CPO', 'Centro Comercial Sitges', 'Carrer de Sitges, 08870 Sitges', 'Sitges', 'Spain', '{"latitude": 41.2345, "longitude": 1.8123}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Valencia region (10 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-val-001', 'ES', 'ES-CPO', 'Centro Comercial Aqua Multiespacio', 'Carrer de l''Aigua, 46024 València', 'València', 'Spain', '{"latitude": 39.4567, "longitude": -0.3456}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-002', 'ES', 'ES-CPO', 'Centro Comercial Bonaire', 'Carrer del Bonaire, 46024 València', 'València', 'Spain', '{"latitude": 39.4456, "longitude": -0.3345}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-003', 'ES', 'ES-CPO', 'Centro Comercial El Saler', 'Carrer del Saler, 46013 València', 'València', 'Spain', '{"latitude": 39.4234, "longitude": -0.3234}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-004', 'ES', 'ES-CPO', 'Centro Comercial Nuevo Centro', 'Carrer del Nou Centre, 46001 València', 'València', 'Spain', '{"latitude": 39.4567, "longitude": -0.3789}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-005', 'ES', 'ES-CPO', 'Centro Comercial Gran Turia', 'Carrer del Gran Túria, 46008 València', 'València', 'Spain', '{"latitude": 39.4678, "longitude": -0.3890}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-006', 'ES', 'ES-CPO', 'Centro Comercial Torrent', 'Carrer de Torrent, 46900 Torrent', 'Torrent', 'Spain', '{"latitude": 39.4345, "longitude": -0.4567}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-007', 'ES', 'ES-CPO', 'Centro Comercial Paterna', 'Carrer de Paterna, 46980 Paterna', 'Paterna', 'Spain', '{"latitude": 39.5012, "longitude": -0.4234}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-008', 'ES', 'ES-CPO', 'Centro Comercial Burjassot', 'Carrer de Burjassot, 46100 Burjassot', 'Burjassot', 'Spain', '{"latitude": 39.5123, "longitude": -0.4123}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-009', 'ES', 'ES-CPO', 'Centro Comercial Mislata', 'Carrer de Mislata, 46920 Mislata', 'Mislata', 'Spain', '{"latitude": 39.4789, "longitude": -0.4012}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-val-010', 'ES', 'ES-CPO', 'Centro Comercial Alaquàs', 'Carrer d''Alaquàs, 46970 Alaquàs', 'Alaquàs', 'Spain', '{"latitude": 39.4567, "longitude": -0.4567}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Sevilla region (8 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-sev-001', 'ES', 'ES-CPO', 'Centro Comercial Nervión Plaza', 'Calle de Nervión, 41005 Sevilla', 'Sevilla', 'Spain', '{"latitude": 37.3890, "longitude": -5.9789}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-002', 'ES', 'ES-CPO', 'Centro Comercial Los Arcos', 'Calle de Los Arcos, 41020 Sevilla', 'Sevilla', 'Spain', '{"latitude": 37.3789, "longitude": -5.9678}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-003', 'ES', 'ES-CPO', 'Centro Comercial Torre Sevilla', 'Calle de la Torre, 41092 Sevilla', 'Sevilla', 'Spain', '{"latitude": 37.3678, "longitude": -5.9567}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-004', 'ES', 'ES-CPO', 'Centro Comercial Plaza de Armas', 'Calle de Armas, 41001 Sevilla', 'Sevilla', 'Spain', '{"latitude": 37.3567, "longitude": -5.9456}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-005', 'ES', 'ES-CPO', 'Centro Comercial Alcalá de Guadaíra', 'Calle de Alcalá, 41500 Alcalá de Guadaíra', 'Alcalá de Guadaíra', 'Spain', '{"latitude": 37.3456, "longitude": -5.8345}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-006', 'ES', 'ES-CPO', 'Centro Comercial Dos Hermanas', 'Calle de Dos Hermanas, 41700 Dos Hermanas', 'Dos Hermanas', 'Spain', '{"latitude": 37.3345, "longitude": -5.8234}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-007', 'ES', 'ES-CPO', 'Centro Comercial Utrera', 'Calle de Utrera, 41710 Utrera', 'Utrera', 'Spain', '{"latitude": 37.3234, "longitude": -5.8123}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW()),
('loc-sev-008', 'ES', 'ES-CPO', 'Centro Comercial Carmona', 'Calle de Carmona, 41410 Carmona', 'Carmona', 'Spain', '{"latitude": 37.3123, "longitude": -5.8012}', 'PARKING_GARAGE', 'Europe/Madrid', NOW(), NOW(), NOW());

-- Lisboa region (12 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-lis-001', 'PT', 'ES-CPO', 'Centro Comercial Colombo', 'Avenida Lusíada, 1500-392 Lisboa', 'Lisboa', 'Portugal', '{"latitude": 38.7223, "longitude": -9.1393}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-002', 'PT', 'ES-CPO', 'Centro Comercial Amoreiras', 'Avenida Engenheiro Duarte Pacheco, 1070-103 Lisboa', 'Lisboa', 'Portugal', '{"latitude": 38.7234, "longitude": -9.1567}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-003', 'PT', 'ES-CPO', 'Centro Comercial Vasco da Gama', 'Avenida D. João II, 1990-095 Lisboa', 'Lisboa', 'Portugal', '{"latitude": 38.7345, "longitude": -9.1456}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-004', 'PT', 'ES-CPO', 'Centro Comercial Dolce Vita Tejo', 'Avenida Cruzeiro Seixas, 2650-504 Amadora', 'Amadora', 'Portugal', '{"latitude": 38.7456, "longitude": -9.1345}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-005', 'PT', 'ES-CPO', 'Centro Comercial Cascais', 'Avenida de Cascais, 2750-642 Cascais', 'Cascais', 'Portugal', '{"latitude": 38.7567, "longitude": -9.4234}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-006', 'PT', 'ES-CPO', 'Centro Comercial Sintra', 'Avenida de Sintra, 2710-631 Sintra', 'Sintra', 'Portugal', '{"latitude": 38.7678, "longitude": -9.4123}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-007', 'PT', 'ES-CPO', 'Centro Comercial Oeiras', 'Avenida de Oeiras, 2780-241 Oeiras', 'Oeiras', 'Portugal', '{"latitude": 38.7789, "longitude": -9.4012}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-008', 'PT', 'ES-CPO', 'Centro Comercial Loures', 'Avenida de Loures, 2670-000 Loures', 'Loures', 'Portugal', '{"latitude": 38.7890, "longitude": -9.3901}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-009', 'PT', 'ES-CPO', 'Centro Comercial Vila Franca de Xira', 'Avenida de Vila Franca, 2600-000 Vila Franca de Xira', 'Vila Franca de Xira', 'Portugal', '{"latitude": 38.7901, "longitude": -8.9890}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-010', 'PT', 'ES-CPO', 'Centro Comercial Setúbal', 'Avenida de Setúbal, 2900-000 Setúbal', 'Setúbal', 'Portugal', '{"latitude": 38.8012, "longitude": -8.9789}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-011', 'PT', 'ES-CPO', 'Centro Comercial Almada', 'Avenida de Almada, 2800-000 Almada', 'Almada', 'Portugal', '{"latitude": 38.8123, "longitude": -8.9688}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-lis-012', 'PT', 'ES-CPO', 'Centro Comercial Seixal', 'Avenida de Seixal, 2840-000 Seixal', 'Seixal', 'Portugal', '{"latitude": 38.8234, "longitude": -8.9587}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW());

-- Porto region (10 locations)
INSERT INTO locations (id, country_code, party_id, name, address, city, country, coordinates, parking_type, time_zone, created_at, updated_at, last_updated) VALUES
('loc-por-001', 'PT', 'ES-CPO', 'Centro Comercial NorteShopping', 'Rua Sara Martins de Almeida, 4460-841 Senhora da Hora', 'Senhora da Hora', 'Portugal', '{"latitude": 41.1897, "longitude": -8.6567}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-002', 'PT', 'ES-CPO', 'Centro Comercial Mar Shopping', 'Rua do Mar, 4150-518 Porto', 'Porto', 'Portugal', '{"latitude": 41.1567, "longitude": -8.6234}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-003', 'PT', 'ES-CPO', 'Centro Comercial Arrábida Shopping', 'Rua de Arrábida, 4400-000 Vila Nova de Gaia', 'Vila Nova de Gaia', 'Portugal', '{"latitude": 41.1234, "longitude": -8.6123}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-004', 'PT', 'ES-CPO', 'Centro Comercial Gaia Shopping', 'Rua de Gaia, 4400-000 Vila Nova de Gaia', 'Vila Nova de Gaia', 'Portugal', '{"latitude": 41.1345, "longitude": -8.6234}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-005', 'PT', 'ES-CPO', 'Centro Comercial Matosinhos', 'Rua de Matosinhos, 4450-000 Matosinhos', 'Matosinhos', 'Portugal', '{"latitude": 41.1456, "longitude": -8.6345}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-006', 'PT', 'ES-CPO', 'Centro Comercial Maia', 'Rua da Maia, 4470-000 Maia', 'Maia', 'Portugal', '{"latitude": 41.1567, "longitude": -8.6456}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-007', 'PT', 'ES-CPO', 'Centro Comercial Gondomar', 'Rua de Gondomar, 4420-000 Gondomar', 'Gondomar', 'Portugal', '{"latitude": 41.1678, "longitude": -8.6567}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-008', 'PT', 'ES-CPO', 'Centro Comercial Valongo', 'Rua de Valongo, 4440-000 Valongo', 'Valongo', 'Portugal', '{"latitude": 41.1789, "longitude": -8.6678}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-009', 'PT', 'ES-CPO', 'Centro Comercial Póvoa de Varzim', 'Rua da Póvoa, 4490-000 Póvoa de Varzim', 'Póvoa de Varzim', 'Portugal', '{"latitude": 41.3890, "longitude": -8.6789}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW()),
('loc-por-010', 'PT', 'ES-CPO', 'Centro Comercial Vila do Conde', 'Rua de Vila do Conde, 4480-000 Vila do Conde', 'Vila do Conde', 'Portugal', '{"latitude": 41.4001, "longitude": -8.6890}', 'PARKING_GARAGE', 'Europe/Lisbon', NOW(), NOW(), NOW());

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Inserted % locations', (SELECT COUNT(*) FROM locations);
END $$;
