-- Script para corregir country_code de PT a ES en las tablas evses y locations
-- El country_code debe representar el código del país de la empresa, no de las localizaciones

-- Verificar registros que tienen country_code = 'PT' antes del cambio
SELECT 'EVSES con country_code = PT' as tabla, COUNT(*) as cantidad FROM evses WHERE country_code = 'PT'
UNION ALL
SELECT 'LOCATIONS con country_code = PT' as tabla, COUNT(*) as cantidad FROM locations WHERE country_code = 'PT';

-- Actualizar tabla evses: cambiar PT por ES
UPDATE evses 
SET country_code = 'ES', 
    last_updated = NOW()
WHERE country_code = 'PT';

-- Actualizar tabla locations: cambiar PT por ES  
UPDATE locations 
SET country_code = 'ES', 
    last_updated = NOW()
WHERE country_code = 'PT';

-- Verificar que no quedan registros con country_code = 'PT'
SELECT 'EVSES con country_code = PT (después)' as tabla, COUNT(*) as cantidad FROM evses WHERE country_code = 'PT'
UNION ALL
SELECT 'LOCATIONS con country_code = PT (después)' as tabla, COUNT(*) as cantidad FROM locations WHERE country_code = 'PT';

-- Mostrar resumen de cambios
SELECT 'EVSES con country_code = ES' as tabla, COUNT(*) as cantidad FROM evses WHERE country_code = 'ES'
UNION ALL
SELECT 'LOCATIONS con country_code = ES' as tabla, COUNT(*) as cantidad FROM locations WHERE country_code = 'ES';

-- Mostrar algunos registros de ejemplo para verificar
SELECT 'EVSES - Ejemplos con country_code = ES' as info, id, evse_id, country_code, party_id, location_id FROM evses WHERE country_code = 'ES' LIMIT 5;
SELECT 'LOCATIONS - Ejemplos con country_code = ES' as info, id, name, country_code, party_id, city FROM locations WHERE country_code = 'ES' LIMIT 5;
