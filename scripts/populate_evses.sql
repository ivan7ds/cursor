-- Populate EVSEs distributed across all locations
-- This script creates EVSEs with a maximum of 50 per location

-- Clear existing EVSEs
DELETE FROM evses;

-- Function to generate EVSEs for a location
CREATE OR REPLACE FUNCTION generate_evses_for_location(
    p_location_id VARCHAR(36),
    p_country_code VARCHAR(2),
    p_party_id VARCHAR(10),
    p_max_evses INTEGER DEFAULT 50
) RETURNS VOID AS $$
DECLARE
    evse_counter INTEGER;
    evse_id VARCHAR(48);
    evse_status VARCHAR(50);
    connector_id INTEGER;
    capabilities JSON;
    connectors JSON;
    coordinates JSON;
    physical_ref VARCHAR(16);
    directions JSON;
    parking_restrictions JSON;
    group_id VARCHAR(36);
BEGIN
    -- Generate random number of EVSEs (between 10 and max_evses)
    evse_counter := 10 + floor(random() * (p_max_evses - 10 + 1));
    
    -- Generate EVSEs
    FOR i IN 1..evse_counter LOOP
        -- Generate EVSE ID
        evse_id := p_party_id || '-' || p_country_code || '-' || 
                   split_part(p_location_id, '-', 2) || '-' || 
                   split_part(p_location_id, '-', 3) || '-' || 
                   CASE WHEN i < 10 THEN '00' || i::TEXT WHEN i < 100 THEN '0' || i::TEXT ELSE i::TEXT END;
        
        -- Random status
        evse_status := (ARRAY['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'CHARGING', 'MAINTENANCE'])[1 + floor(random() * 5)];
        
        -- Random capabilities
        capabilities := CASE 
            WHEN random() > 0.5 THEN '["RESERVABLE", "RFID_READER"]'
            ELSE '["RESERVABLE"]'
        END;
        
        -- Generate connectors (1-3 connectors per EVSE)
        connector_id := 1 + floor(random() * 3);
        connectors := CASE connector_id
            WHEN 1 THEN '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]'
            WHEN 2 THEN '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}, {"id": "2", "standard": "IEC_62196_CCS", "format": "CABLE", "power_type": "DC", "max_voltage": 1000, "max_amperage": 125, "max_electric_power": 125000}]'
            ELSE '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}, {"id": "2", "standard": "IEC_62196_CCS", "format": "CABLE", "power_type": "DC", "max_voltage": 1000, "max_amperage": 125, "max_electric_power": 125000}, {"id": "3", "standard": "CHAdeMO", "format": "CABLE", "power_type": "DC", "max_voltage": 1000, "max_amperage": 125, "max_electric_power": 125000}]'
        END;
        
        -- Physical reference
        physical_ref := chr(65 + floor(random() * 26)::INTEGER) || CASE WHEN i < 10 THEN '0' || i::TEXT ELSE i::TEXT END;
        
        -- Directions
        directions := '{"text": "Fila ' || chr(65 + floor(random() * 5)::INTEGER) || ', posición ' || i || '"}';
        
        -- Parking restrictions
        parking_restrictions := CASE 
            WHEN random() > 0.7 THEN '["RESERVED", "EV_ONLY"]'
            ELSE '["EV_ONLY"]'
        END;
        
        -- Group ID
        group_id := 'group-' || split_part(p_location_id, '-', 2) || '-' || split_part(p_location_id, '-', 3);
        
        -- Insert EVSE
        INSERT INTO evses (
            id, location_id, country_code, party_id, evse_id, status, 
            capabilities, connectors, floor_level, coordinates, physical_reference, 
            directions, parking_restrictions, group_id, last_updated, created_at, updated_at
        ) VALUES (
            'evse-' || split_part(p_location_id, '-', 2) || '-' || split_part(p_location_id, '-', 3) || '-' || CASE WHEN i < 10 THEN '00' || i::TEXT WHEN i < 100 THEN '0' || i::TEXT ELSE i::TEXT END,
            p_location_id, p_country_code, p_party_id, evse_id, evse_status::evse_status_enum,
            capabilities::JSON, connectors::JSON, 'P0', 
            '{"latitude": 0, "longitude": 0}'::JSON, physical_ref,
            directions::JSON, parking_restrictions::JSON, group_id,
            NOW(), NOW(), NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate EVSEs for all locations
SELECT generate_evses_for_location(id, country_code, party_id, 50) 
FROM locations;

-- Update coordinates for EVSEs based on location coordinates
UPDATE evses 
SET coordinates = l.coordinates
FROM locations l 
WHERE evses.location_id = l.id;

-- Log completion
DO $$
DECLARE
    total_evses INTEGER;
    total_locations INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_evses FROM evses;
    SELECT COUNT(*) INTO total_locations FROM locations;
    RAISE NOTICE 'Generated % EVSEs across % locations', total_evses, total_locations;
    RAISE NOTICE 'Average EVSEs per location: %', round(total_evses::NUMERIC / total_locations, 2);
END $$;

-- Clean up function
DROP FUNCTION generate_evses_for_location(VARCHAR, VARCHAR, VARCHAR, INTEGER);
