-- Script para actualizar max_electric_power a 400 en la columna connectors de la tabla evses
-- Fecha: 2025-01-16

-- Verificar el estado actual de los conectores
SELECT 
    id,
    jsonb_array_length(connectors::jsonb) as connector_count,
    jsonb_pretty(connectors::jsonb) as connectors_data
FROM evses 
WHERE connectors IS NOT NULL 
LIMIT 3;

-- Actualizar max_electric_power a 400 para todos los conectores
UPDATE evses 
SET connectors = (
    SELECT jsonb_agg(
        jsonb_set(
            connector, 
            '{max_electric_power}', 
            '400'::jsonb
        )
    )
    FROM jsonb_array_elements(connectors::jsonb) AS connector
)
WHERE connectors IS NOT NULL;

-- Verificar los cambios aplicados
SELECT 
    id,
    jsonb_array_length(connectors::jsonb) as connector_count,
    jsonb_pretty(connectors::jsonb) as connectors_data
FROM evses 
WHERE connectors IS NOT NULL 
LIMIT 3;

-- Mostrar estadísticas de la actualización
SELECT 
    COUNT(*) as total_evses,
    COUNT(CASE WHEN connectors IS NOT NULL THEN 1 END) as evses_with_connectors,
    SUM(jsonb_array_length(connectors::jsonb)) as total_connectors
FROM evses;
