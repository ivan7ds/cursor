-- Migración para convertir el campo 'id' de los connectors de number a string
-- Fecha: 2025-09-18
-- Descripción: Convierte todos los valores numéricos del campo 'id' en la columna 'connectors' a strings

-- Crear una función temporal para actualizar los connectors
CREATE OR REPLACE FUNCTION update_connectors_id_to_string()
RETURNS void AS $$
DECLARE
    evse_record RECORD;
    updated_connectors jsonb;
    connector jsonb;
    updated_connector jsonb;
    connectors_array jsonb;
BEGIN
    -- Iterar sobre todos los EVSEs
    FOR evse_record IN 
        SELECT id, connectors 
        FROM evses 
        WHERE connectors IS NOT NULL
    LOOP
        -- Inicializar el array de connectors actualizado
        connectors_array := '[]'::jsonb;
        
        -- Procesar cada connector en el array (convertir json a jsonb)
        FOR connector IN 
            SELECT * FROM jsonb_array_elements(evse_record.connectors::jsonb)
        LOOP
            -- Crear una copia del connector
            updated_connector := connector;
            
            -- Si el campo 'id' existe y es un número, convertirlo a string
            IF updated_connector ? 'id' AND jsonb_typeof(updated_connector->'id') = 'number' THEN
                updated_connector := jsonb_set(
                    updated_connector, 
                    '{id}', 
                    to_jsonb(updated_connector->>'id')
                );
            END IF;
            
            -- Agregar el connector actualizado al array
            connectors_array := connectors_array || updated_connector;
        END LOOP;
        
        -- Actualizar el registro con los connectors corregidos
        UPDATE evses 
        SET connectors = connectors_array::json,
            updated_at = NOW()
        WHERE id = evse_record.id;
        
        -- Log del progreso (cada 1000 registros)
        IF (SELECT COUNT(*) FROM evses WHERE id = evse_record.id) % 1000 = 0 THEN
            RAISE NOTICE 'Procesado EVSE: %', evse_record.id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migración completada. Todos los IDs de connectors convertidos a string.';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la migración
SELECT update_connectors_id_to_string();

-- Limpiar la función temporal
DROP FUNCTION update_connectors_id_to_string();

-- Verificar el resultado
SELECT 
    COUNT(*) as total_evses,
    COUNT(CASE WHEN connectors::text LIKE '%"id": [0-9]%' THEN 1 END) as evses_with_numeric_ids,
    COUNT(CASE WHEN connectors::text LIKE '%"id": "[0-9]%' THEN 1 END) as evses_with_string_ids
FROM evses;
