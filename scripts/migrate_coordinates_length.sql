-- Migración para acortar las coordenadas en la tabla locations
-- Fecha: 2025-09-18
-- Descripción: Acorta las coordenadas para cumplir con los límites:
-- - latitude: máximo 10 caracteres
-- - longitude: máximo 11 caracteres

-- Crear una función temporal para actualizar las coordenadas
CREATE OR REPLACE FUNCTION update_coordinates_length()
RETURNS void AS $$
DECLARE
    location_record RECORD;
    updated_coordinates jsonb;
    latitude_str text;
    longitude_str text;
    latitude_num numeric;
    longitude_num numeric;
    updated_latitude text;
    updated_longitude text;
BEGIN
    -- Iterar sobre todas las locations
    FOR location_record IN 
        SELECT id, coordinates 
        FROM locations 
        WHERE coordinates IS NOT NULL
    LOOP
        -- Extraer las coordenadas como texto
        latitude_str := location_record.coordinates->>'latitude';
        longitude_str := location_record.coordinates->>'longitude';
        
        -- Convertir a numérico para procesamiento
        latitude_num := latitude_str::numeric;
        longitude_num := longitude_str::numeric;
        
        -- Acortar latitude a máximo 10 caracteres
        -- Mantener precisión suficiente pero dentro del límite
        IF LENGTH(latitude_str) > 10 THEN
            -- Redondear a 6 decimales máximo (formato: -XX.XXXXXX = 10 caracteres)
            updated_latitude := ROUND(latitude_num, 6)::text;
            -- Si aún es muy largo, reducir decimales
            WHILE LENGTH(updated_latitude) > 10 LOOP
                latitude_num := ROUND(latitude_num, GREATEST(0, 6 - (LENGTH(updated_latitude) - 10)));
                updated_latitude := latitude_num::text;
            END LOOP;
        ELSE
            updated_latitude := latitude_str;
        END IF;
        
        -- Acortar longitude a máximo 11 caracteres
        -- Mantener precisión suficiente pero dentro del límite
        IF LENGTH(longitude_str) > 11 THEN
            -- Redondear a 6 decimales máximo (formato: -XXX.XXXXXX = 11 caracteres)
            updated_longitude := ROUND(longitude_num, 6)::text;
            -- Si aún es muy largo, reducir decimales
            WHILE LENGTH(updated_longitude) > 11 LOOP
                longitude_num := ROUND(longitude_num, GREATEST(0, 6 - (LENGTH(updated_longitude) - 11)));
                updated_longitude := longitude_num::text;
            END LOOP;
        ELSE
            updated_longitude := longitude_str;
        END IF;
        
        -- Crear el objeto de coordenadas actualizado
        updated_coordinates := jsonb_build_object(
            'latitude', updated_latitude,
            'longitude', updated_longitude
        );
        
        -- Actualizar el registro con las coordenadas corregidas
        UPDATE locations 
        SET coordinates = updated_coordinates,
            updated_at = NOW()
        WHERE id = location_record.id;
        
        -- Log del progreso (cada 50 registros)
        IF (SELECT COUNT(*) FROM locations WHERE id = location_record.id) % 50 = 0 THEN
            RAISE NOTICE 'Procesada location: % - Lat: % -> %, Lon: % -> %', 
                location_record.id, 
                latitude_str, updated_latitude,
                longitude_str, updated_longitude;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migración completada. Todas las coordenadas acortadas según los límites.';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la migración
SELECT update_coordinates_length();

-- Limpiar la función temporal
DROP FUNCTION update_coordinates_length();

-- Verificar el resultado
SELECT 
    COUNT(*) as total_locations,
    COUNT(CASE WHEN LENGTH(coordinates->>'latitude'::text) > 10 THEN 1 END) as lat_too_long,
    COUNT(CASE WHEN LENGTH(coordinates->>'longitude'::text) > 11 THEN 1 END) as lon_too_long,
    MAX(LENGTH(coordinates->>'latitude'::text)) as max_lat_length,
    MAX(LENGTH(coordinates->>'longitude'::text)) as max_lon_length
FROM locations;

-- Mostrar algunos ejemplos de coordenadas actualizadas
SELECT id, coordinates, 
       LENGTH(coordinates->>'latitude'::text) as lat_length,
       LENGTH(coordinates->>'longitude'::text) as lon_length
FROM locations 
WHERE LENGTH(coordinates->>'latitude'::text) > 8 OR LENGTH(coordinates->>'longitude'::text) > 9
LIMIT 5;
