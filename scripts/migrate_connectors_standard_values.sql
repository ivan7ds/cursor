-- Migración para corregir los valores del campo 'standard' en la columna 'connectors' de la tabla 'evses'
-- Fecha: 2025-09-18
-- Descripción: Corrige los valores de 'standard' para cumplir con el estándar OCPI

-- Crear una función temporal para actualizar los valores de standard
CREATE OR REPLACE FUNCTION update_connectors_standard_values()
RETURNS void AS $$
DECLARE
    evse_record RECORD;
    updated_connectors jsonb;
    connector jsonb;
    updated_connector jsonb;
    connectors_array jsonb;
    standard_value text;
    corrected_standard text;
BEGIN
    -- Iterar sobre todos los EVSEs
    FOR evse_record IN 
        SELECT id, connectors 
        FROM evses 
        WHERE connectors IS NOT NULL
    LOOP
        -- Inicializar el array de connectors actualizado
        connectors_array := '[]'::jsonb;
        
        -- Procesar cada connector en el array
        FOR connector IN 
            SELECT * FROM jsonb_array_elements(evse_record.connectors::jsonb)
        LOOP
            -- Crear una copia del connector
            updated_connector := connector;
            
            -- Obtener el valor actual de standard
            standard_value := updated_connector->>'standard';
            
            -- Corregir los valores según el estándar OCPI
            CASE standard_value
                WHEN 'IEC_62196_T3' THEN
                    -- IEC_62196_T3 no es válido, usar IEC_62196_T3A como reemplazo más común
                    corrected_standard := 'IEC_62196_T3A';
                WHEN 'OTHER' THEN
                    -- OTHER no es válido, usar DOMESTIC_A como reemplazo genérico
                    corrected_standard := 'DOMESTIC_A';
                WHEN 'IEC_60309' THEN
                    -- IEC_60309 no es válido, usar IEC_60309_2_three_32 como reemplazo estándar
                    corrected_standard := 'IEC_60309_2_three_32';
                WHEN 'IEC_61851' THEN
                    -- IEC_61851 no es válido, usar IEC_62196_T2 como reemplazo estándar
                    corrected_standard := 'IEC_62196_T2';
                ELSE
                    -- Si el valor ya es válido, mantenerlo
                    corrected_standard := standard_value;
            END CASE;
            
            -- Actualizar el campo standard si fue corregido
            IF corrected_standard != standard_value THEN
                updated_connector := jsonb_set(
                    updated_connector, 
                    '{standard}', 
                    to_jsonb(corrected_standard)
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
    
    RAISE NOTICE 'Migración completada. Todos los valores de standard corregidos según OCPI.';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la migración
SELECT update_connectors_standard_values();

-- Limpiar la función temporal
DROP FUNCTION update_connectors_standard_values();

-- Verificar el resultado - mostrar valores antes y después
SELECT 
    'ANTES' as estado,
    jsonb_array_elements(connectors::jsonb)->>'standard' as standard_value, 
    COUNT(*) as count 
FROM evses 
GROUP BY jsonb_array_elements(connectors::jsonb)->>'standard' 
ORDER BY count DESC;

-- Mostrar estadísticas de corrección
SELECT 
    COUNT(*) as total_evses,
    COUNT(CASE WHEN connectors::text LIKE '%"standard": "IEC_62196_T3"%' THEN 1 END) as iec_62196_t3_count,
    COUNT(CASE WHEN connectors::text LIKE '%"standard": "OTHER"%' THEN 1 END) as other_count,
    COUNT(CASE WHEN connectors::text LIKE '%"standard": "IEC_60309"%' THEN 1 END) as iec_60309_count,
    COUNT(CASE WHEN connectors::text LIKE '%"standard": "IEC_61851"%' THEN 1 END) as iec_61851_count
FROM evses;
