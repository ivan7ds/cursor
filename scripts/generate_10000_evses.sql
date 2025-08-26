-- Script to generate 10,000 EVSEs distributed across all locations
-- Each location will have between 30-50 EVSEs

-- Function to generate random EVSE data
CREATE OR REPLACE FUNCTION generate_evse_data(
    evse_number INTEGER,
    location_id VARCHAR(36),
    country_code VARCHAR(2),
    party_id VARCHAR(10),
    city_name VARCHAR(100)
) RETURNS VOID AS $$
DECLARE
    evse_id VARCHAR(48);
    status_val VARCHAR(20);
    capabilities_val JSON;
    connectors_val JSON;
    floor_level_val VARCHAR(4);
    coordinates_val JSON;
    physical_ref VARCHAR(16);
    directions_val JSON;
    group_id_val VARCHAR(36);
BEGIN
    -- Generate EVSE ID
    evse_id := country_code || '-' || party_id || '-' || city_name || '-' || LPAD(evse_number::TEXT, 3, '0');
    
    -- Random status (mostly AVAILABLE, some CHARGING, few others)
    status_val := CASE 
        WHEN random() < 0.7 THEN 'AVAILABLE'
        WHEN random() < 0.85 THEN 'CHARGING'
        WHEN random() < 0.9 THEN 'BLOCKED'
        WHEN random() < 0.95 THEN 'INOPERATIVE'
        ELSE 'OUTOFORDER'
    END;
    
    -- Random capabilities
    capabilities_val := CASE 
        WHEN random() < 0.3 THEN '["RESERVABLE", "RENTABLE"]'
        WHEN random() < 0.6 THEN '["RESERVABLE"]'
        WHEN random() < 0.8 THEN '["RENTABLE"]'
        ELSE '[]'
    END::JSON;
    
    -- Random connectors (mix of power levels)
    connectors_val := CASE 
        WHEN random() < 0.4 THEN '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]'
        WHEN random() < 0.7 THEN '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_1_PHASE", "max_voltage": 230, "max_amperage": 16, "max_electric_power": 3680}]'
        WHEN random() < 0.85 THEN '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_1_PHASE", "max_voltage": 230, "max_amperage": 32, "max_electric_power": 7360}]'
        ELSE '[{"id": "1", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 63, "max_electric_power": 43000}]'
    END::JSON;
    
    -- Random floor level
    floor_level_val := CASE 
        WHEN random() < 0.3 THEN 'P0'
        WHEN random() < 0.5 THEN 'P1'
        WHEN random() < 0.7 THEN 'P2'
        WHEN random() < 0.85 THEN 'G'
        ELSE 'L1'
    END;
    
    -- Generate coordinates with slight variation from location center
    coordinates_val := CASE 
        WHEN country_code = 'ES' THEN 
            CASE city_name
                WHEN 'Madrid' THEN json_build_object('latitude', 40.4168 + (random() - 0.5) * 0.01, 'longitude', -3.7038 + (random() - 0.5) * 0.01)
                WHEN 'Barcelona' THEN json_build_object('latitude', 41.3851 + (random() - 0.5) * 0.01, 'longitude', 2.1734 + (random() - 0.5) * 0.01)
                WHEN 'Valencia' THEN json_build_object('latitude', 39.4699 + (random() - 0.5) * 0.01, 'longitude', -0.3763 + (random() - 0.5) * 0.01)
                WHEN 'Sevilla' THEN json_build_object('latitude', 37.3891 + (random() - 0.5) * 0.01, 'longitude', -5.9845 + (random() - 0.5) * 0.01)
                WHEN 'Bilbao' THEN json_build_object('latitude', 43.2627 + (random() - 0.5) * 0.01, 'longitude', -2.9253 + (random() - 0.5) * 0.01)
                WHEN 'Málaga' THEN json_build_object('latitude', 36.7213 + (random() - 0.5) * 0.01, 'longitude', -4.4217 + (random() - 0.5) * 0.01)
                WHEN 'Zaragoza' THEN json_build_object('latitude', 41.6488 + (random() - 0.5) * 0.01, 'longitude', -0.8891 + (random() - 0.5) * 0.01)
                WHEN 'Murcia' THEN json_build_object('latitude', 37.9922 + (random() - 0.5) * 0.01, 'longitude', -1.1307 + (random() - 0.5) * 0.01)
                WHEN 'Alicante' THEN json_build_object('latitude', 38.3452 + (random() - 0.5) * 0.01, 'longitude', -0.4815 + (random() - 0.5) * 0.01)
                WHEN 'Córdoba' THEN json_build_object('latitude', 37.8882 + (random() - 0.5) * 0.01, 'longitude', -4.7794 + (random() - 0.5) * 0.01)
                WHEN 'Valladolid' THEN json_build_object('latitude', 41.6523 + (random() - 0.5) * 0.01, 'longitude', -4.7286 + (random() - 0.5) * 0.01)
                WHEN 'Granada' THEN json_build_object('latitude', 37.1765 + (random() - 0.5) * 0.01, 'longitude', -3.5976 + (random() - 0.5) * 0.01)
                WHEN 'Oviedo' THEN json_build_object('latitude', 43.3623 + (random() - 0.5) * 0.01, 'longitude', -5.8493 + (random() - 0.5) * 0.01)
                WHEN 'Santander' THEN json_build_object('latitude', 43.4623 + (random() - 0.5) * 0.01, 'longitude', -3.8099 + (random() - 0.5) * 0.01)
                WHEN 'Pamplona' THEN json_build_object('latitude', 42.8185 + (random() - 0.5) * 0.01, 'longitude', -1.6442 + (random() - 0.5) * 0.01)
                WHEN 'Logroño' THEN json_build_object('latitude', 42.4627 + (random() - 0.5) * 0.01, 'longitude', -2.4449 + (random() - 0.5) * 0.01)
                WHEN 'Vitoria' THEN json_build_object('latitude', 42.8467 + (random() - 0.5) * 0.01, 'longitude', -2.6728 + (random() - 0.5) * 0.01)
                WHEN 'San Sebastián' THEN json_build_object('latitude', 43.3224 + (random() - 0.5) * 0.01, 'longitude', -1.9839 + (random() - 0.5) * 0.01)
                WHEN 'A Coruña' THEN json_build_object('latitude', 43.3623 + (random() - 0.5) * 0.01, 'longitude', -8.4115 + (random() - 0.5) * 0.01)
                ELSE json_build_object('latitude', 40.0 + (random() - 0.5) * 0.01, 'longitude', -3.0 + (random() - 0.5) * 0.01)
            END
        WHEN country_code = 'PT' THEN
            CASE city_name
                WHEN 'Porto' THEN json_build_object('latitude', 41.1579 + (random() - 0.5) * 0.01, 'longitude', -8.6291 + (random() - 0.5) * 0.01)
                WHEN 'Lisboa' THEN json_build_object('latitude', 38.7223 + (random() - 0.5) * 0.01, 'longitude', -9.1393 + (random() - 0.5) * 0.01)
                WHEN 'Braga' THEN json_build_object('latitude', 41.5454 + (random() - 0.5) * 0.01, 'longitude', -8.4265 + (random() - 0.5) * 0.01)
                WHEN 'Coimbra' THEN json_build_object('latitude', 40.2033 + (random() - 0.5) * 0.01, 'longitude', -8.4103 + (random() - 0.5) * 0.01)
                WHEN 'Setúbal' THEN json_build_object('latitude', 38.5243 + (random() - 0.5) * 0.01, 'longitude', -8.8926 + (random() - 0.5) * 0.01)
                WHEN 'Évora' THEN json_build_object('latitude', 38.5724 + (random() - 0.5) * 0.01, 'longitude', -7.9075 + (random() - 0.5) * 0.01)
                WHEN 'Faro' THEN json_build_object('latitude', 37.0194 + (random() - 0.5) * 0.01, 'longitude', -7.9304 + (random() - 0.5) * 0.01)
                WHEN 'Funchal' THEN json_build_object('latitude', 32.6669 + (random() - 0.5) * 0.01, 'longitude', -16.9241 + (random() - 0.5) * 0.01)
                WHEN 'Ponta Delgada' THEN json_build_object('latitude', 37.7412 + (random() - 0.5) * 0.01, 'longitude', -25.6756 + (random() - 0.5) * 0.01)
                WHEN 'Angra do Heroísmo' THEN json_build_object('latitude', 38.6595 + (random() - 0.5) * 0.01, 'longitude', -27.2188 + (random() - 0.5) * 0.01)
                ELSE json_build_object('latitude', 39.0 + (random() - 0.5) * 0.01, 'longitude', -8.0 + (random() - 0.5) * 0.01)
            END
        ELSE json_build_object('latitude', 40.0 + (random() - 0.5) * 0.01, 'longitude', -3.0 + (random() - 0.5) * 0.01)
    END;
    
    -- Physical reference
    physical_ref := city_name || '-' || LPAD(evse_number::TEXT, 3, '0');
    
    -- Directions
    directions_val := json_build_object('text', 'EVSE ubicado en ' || city_name || ', zona de parking');
    
    -- Group ID
    group_id_val := city_name || '-group';
    
    -- Insert EVSE
    INSERT INTO evses (
        id,
        location_id,
        country_code,
        party_id,
        evse_id,
        status,
        capabilities,
        connectors,
        floor_level,
        coordinates,
        physical_reference,
        directions,
        parking_restrictions,
        group_id,
        last_updated,
        created_at,
        updated_at
    ) VALUES (
        'evse-' || LPAD(evse_number::TEXT, 6, '0'),
        location_id,
        country_code,
        party_id,
        evse_id,
        status_val,
        capabilities_val,
        connectors_val,
        floor_level_val,
        coordinates_val,
        physical_ref,
        directions_val,
        '[]'::JSON,
        group_id_val,
        NOW(),
        NOW(),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Generate EVSEs for each location
-- Madrid (loc-001): 45 EVSEs
SELECT generate_evse_data(i, 'loc-001', 'ES', 'ES-CPO', 'Madrid') FROM generate_series(1, 45) i;

-- Barcelona (loc-002): 42 EVSEs  
SELECT generate_evse_data(i, 'loc-002', 'ES', 'ES-CPO', 'Barcelona') FROM generate_series(1, 42) i;

-- Porto (loc-003): 38 EVSEs
SELECT generate_evse_data(i, 'loc-003', 'PT', 'ES-CPO', 'Porto') FROM generate_series(1, 38) i;

-- Valencia (loc-004): 47 EVSEs
SELECT generate_evse_data(i, 'loc-004', 'ES', 'ES-CPO', 'Valencia') FROM generate_series(1, 47) i;

-- Sevilla (loc-005): 41 EVSEs
SELECT generate_evse_data(i, 'loc-005', 'ES', 'ES-CPO', 'Sevilla') FROM generate_series(1, 41) i;

-- Bilbao (loc-006): 44 EVSEs
SELECT generate_evse_data(i, 'loc-006', 'ES', 'ES-CPO', 'Bilbao') FROM generate_series(1, 44) i;

-- Málaga (loc-007): 43 EVSEs
SELECT generate_evse_data(i, 'loc-007', 'ES', 'ES-CPO', 'Málaga') FROM generate_series(1, 43) i;

-- Zaragoza (loc-008): 46 EVSEs
SELECT generate_evse_data(i, 'loc-008', 'ES', 'ES-CPO', 'Zaragoza') FROM generate_series(1, 46) i;

-- Murcia (loc-009): 40 EVSEs
SELECT generate_evse_data(i, 'loc-009', 'ES', 'ES-CPO', 'Murcia') FROM generate_series(1, 40) i;

-- Alicante (loc-010): 45 EVSEs
SELECT generate_evse_data(i, 'loc-010', 'ES', 'ES-CPO', 'Alicante') FROM generate_series(1, 45) i;

-- Córdoba (loc-011): 39 EVSEs
SELECT generate_evse_data(i, 'loc-011', 'ES', 'ES-CPO', 'Córdoba') FROM generate_series(1, 39) i;

-- Valladolid (loc-012): 42 EVSEs
SELECT generate_evse_data(i, 'loc-012', 'ES', 'ES-CPO', 'Valladolid') FROM generate_series(1, 42) i;

-- Granada (loc-013): 41 EVSEs
SELECT generate_evse_data(i, 'loc-013', 'ES', 'ES-CPO', 'Granada') FROM generate_series(1, 41) i;

-- Oviedo (loc-014): 38 EVSEs
SELECT generate_evse_data(i, 'loc-014', 'ES', 'ES-CPO', 'Oviedo') FROM generate_series(1, 38) i;

-- Santander (loc-015): 40 EVSEs
SELECT generate_evse_data(i, 'loc-015', 'ES', 'ES-CPO', 'Santander') FROM generate_series(1, 40) i;

-- Pamplona (loc-016): 43 EVSEs
SELECT generate_evse_data(i, 'loc-016', 'ES', 'ES-CPO', 'Pamplona') FROM generate_series(1, 43) i;

-- Logroño (loc-017): 37 EVSEs
SELECT generate_evse_data(i, 'loc-017', 'ES', 'ES-CPO', 'Logroño') FROM generate_series(1, 37) i;

-- Vitoria (loc-018): 39 EVSEs
SELECT generate_evse_data(i, 'loc-018', 'ES', 'ES-CPO', 'Vitoria') FROM generate_series(1, 39) i;

-- San Sebastián (loc-019): 41 EVSEs
SELECT generate_evse_data(i, 'loc-019', 'ES', 'ES-CPO', 'San Sebastián') FROM generate_series(1, 41) i;

-- A Coruña (loc-020): 42 EVSEs
SELECT generate_evse_data(i, 'loc-020', 'ES', 'ES-CPO', 'A Coruña') FROM generate_series(1, 42) i;

-- Braga (loc-021): 40 EVSEs
SELECT generate_evse_data(i, 'loc-021', 'PT', 'ES-CPO', 'Braga') FROM generate_series(1, 40) i;

-- Coimbra (loc-022): 38 EVSEs
SELECT generate_evse_data(i, 'loc-022', 'PT', 'ES-CPO', 'Coimbra') FROM generate_series(1, 38) i;

-- Setúbal (loc-023): 41 EVSEs
SELECT generate_evse_data(i, 'loc-023', 'PT', 'ES-CPO', 'Setúbal') FROM generate_series(1, 41) i;

-- Évora (loc-024): 37 EVSEs
SELECT generate_evse_data(i, 'loc-024', 'PT', 'ES-CPO', 'Évora') FROM generate_series(1, 37) i;

-- Faro (loc-025): 39 EVSEs
SELECT generate_evse_data(i, 'loc-025', 'PT', 'ES-CPO', 'Faro') FROM generate_series(1, 39) i;

-- Funchal (loc-026): 36 EVSEs
SELECT generate_evse_data(i, 'loc-026', 'PT', 'ES-CPO', 'Funchal') FROM generate_series(1, 36) i;

-- Ponta Delgada (loc-027): 35 EVSEs
SELECT generate_evse_data(i, 'loc-027', 'PT', 'ES-CPO', 'Ponta Delgada') FROM generate_series(1, 35) i;

-- Angra do Heroísmo (loc-028): 34 EVSEs
SELECT generate_evse_data(i, 'loc-028', 'PT', 'ES-CPO', 'Angra do Heroísmo') FROM generate_series(1, 34) i;

-- Clean up function
DROP FUNCTION generate_evse_data(INTEGER, VARCHAR(36), VARCHAR(2), VARCHAR(10), VARCHAR(100));
