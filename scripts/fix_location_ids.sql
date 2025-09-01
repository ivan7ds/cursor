-- Script para corregir los IDs de locations y actualizar las referencias
-- Fecha: 2025-09-01

-- 1. Crear tabla temporal para mapear IDs antiguos a nuevos
CREATE TEMP TABLE location_id_mapping (
    old_id VARCHAR(36),
    new_id UUID,
    city VARCHAR(100)
);

-- 2. Insertar mapeo de IDs antiguos a nuevos UUIDs
INSERT INTO location_id_mapping (old_id, new_id, city) VALUES
('ES-IPD-ALICANTE-GRAN-VIA', gen_random_uuid(), 'Alicante'),
('ES-IPD-BARCELONA-DIAGONAL-MAR', gen_random_uuid(), 'Barcelona'),
('ES-IPD-BILBAO-ZUBIARTE', gen_random_uuid(), 'Bilbao'),
('ES-IPD-GRANADA-NEVADA', gen_random_uuid(), 'Granada'),
('ES-IPD-MADRID-PLAZA-NORTE', gen_random_uuid(), 'Madrid'),
('ES-IPD-MALAGA-LARIOS', gen_random_uuid(), 'Málaga'),
('ES-IPD-SEVILLA-PLAZA-ARMAS', gen_random_uuid(), 'Sevilla'),
('ES-IPD-VALLADOLID-VALLSUR', gen_random_uuid(), 'Valladolid'),
('ES-IPD-VALENCIA-AQUA', gen_random_uuid(), 'Valencia'),
('ES-IPD-ZARAGOZA-PUERTO-VENECIA', gen_random_uuid(), 'Zaragoza');

-- 3. Mostrar el mapeo para verificación
SELECT old_id, new_id, city FROM location_id_mapping ORDER BY city;

-- 4. Actualizar las referencias en la tabla evses
UPDATE evses 
SET location_id = mapping.new_id::VARCHAR(36)
FROM location_id_mapping mapping
WHERE evses.location_id = mapping.old_id;

-- 5. Verificar que se actualizaron las referencias
SELECT 
    e.id as evse_id,
    e.location_id as new_location_id,
    l.city,
    l.name
FROM evses e
JOIN locations l ON e.location_id = l.id
WHERE e.country_code = 'ES'
ORDER BY l.city, e.id
LIMIT 10;

-- 6. Ahora actualizar los IDs de locations
UPDATE locations 
SET id = mapping.new_id::VARCHAR(36)
FROM location_id_mapping mapping
WHERE locations.id = mapping.old_id;

-- 7. Verificar que se actualizaron los IDs
SELECT id, city, name FROM locations WHERE country = 'ESP' ORDER BY city;

-- 8. Verificar que las relaciones siguen funcionando
SELECT 
    l.city,
    COUNT(e.id) as evse_count
FROM locations l
LEFT JOIN evses e ON l.id = e.location_id
WHERE l.country = 'ESP'
GROUP BY l.city, l.id
ORDER BY l.city;
