-- Insert test locations
INSERT INTO locations (
  id, 
  country_code, 
  party_id, 
  name, 
  address, 
  city, 
  country, 
  coordinates, 
  evse_list, 
  time_zone, 
  last_updated, 
  created_at, 
  updated_at
) VALUES (
  'loc-001',
  'ES',
  'ES-CPO',
  'Centro Comercial Madrid',
  'Calle Gran Vía 28',
  'Madrid',
  'Spain',
  '{"latitude": 40.4168, "longitude": -3.7038}',
  '[]',
  'Europe/Madrid',
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO locations (
  id, 
  country_code, 
  party_id, 
  name, 
  address, 
  city, 
  country, 
  coordinates, 
  evse_list, 
  time_zone, 
  last_updated, 
  created_at, 
  updated_at
) VALUES (
  'loc-002',
  'ES',
  'ES-CPO',
  'Estación de Servicio Barcelona',
  'Avinguda Diagonal 123',
  'Barcelona',
  'Spain',
  '{"latitude": 41.3851, "longitude": 2.1734}',
  '[]',
  'Europe/Madrid',
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO locations (
  id, 
  country_code, 
  party_id, 
  name, 
  address, 
  city, 
  country, 
  coordinates, 
  evse_list, 
  time_zone, 
  last_updated, 
  created_at, 
  updated_at
) VALUES (
  'loc-003',
  'PT',
  'ES-CPO',
  'Centro Comercial Porto',
  'Rua de Santa Catarina 123',
  'Porto',
  'Portugal',
  '{"latitude": 41.1579, "longitude": -8.6291}',
  '[]',
  'Europe/Lisbon',
  NOW(),
  NOW(),
  NOW()
);
