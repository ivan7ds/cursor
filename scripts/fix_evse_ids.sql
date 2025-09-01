-- Script para corregir los IDs de EVSEs y convertirlos a UUIDs
-- Fecha: 2025-09-01

-- 1. Crear tabla temporal para mapear IDs antiguos de EVSEs a nuevos UUIDs
CREATE TEMP TABLE evse_id_mapping (
    old_id VARCHAR(36),
    new_id UUID,
    evse_id VARCHAR(48),
    city VARCHAR(100)
);

-- 2. Insertar mapeo de IDs antiguos a nuevos UUIDs para EVSEs con IDs compuestos
INSERT INTO evse_id_mapping (old_id, new_id, evse_id, city)
SELECT 
    e.id as old_id,
    gen_random_uuid() as new_id,
    e.evse_id,
    l.city
FROM evses e
JOIN locations l ON e.location_id = l.id
WHERE e.country_code = 'ES' 
AND e.id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
AND l.country = 'ESP';

-- 3. Mostrar el mapeo para verificación
SELECT old_id, new_id, evse_id, city FROM evse_id_mapping ORDER BY city, evse_id;

-- 4. Contar cuántos EVSEs se van a actualizar
SELECT COUNT(*) as evses_to_update FROM evse_id_mapping;

-- 5. Actualizar los IDs de EVSEs
UPDATE evses 
SET id = mapping.new_id::VARCHAR(36)
FROM evse_id_mapping mapping
WHERE evses.id = mapping.old_id;

-- 6. Verificar que se actualizaron los IDs
SELECT COUNT(*) as evses_with_uuid FROM evses 
WHERE country_code = 'ES' 
AND id SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

-- 7. Verificar que las relaciones siguen funcionando
SELECT 
    l.city,
    COUNT(e.id) as evse_count
FROM locations l
LEFT JOIN evses e ON l.id = e.location_id
WHERE l.country = 'ESP'
GROUP BY l.city, l.id
ORDER BY l.city;

-- 8. Mostrar algunos ejemplos de EVSEs actualizados
SELECT 
    e.id as new_evse_id,
    e.evse_id,
    l.city,
    l.name
FROM evses e
JOIN locations l ON e.location_id = l.id
WHERE e.country_code = 'ES' AND l.country = 'ESP'
ORDER BY l.city, e.evse_id
LIMIT 10;

-- 9. Limpiar tabla temporal
DROP TABLE evse_id_mapping;
