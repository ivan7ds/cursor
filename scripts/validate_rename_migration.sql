-- ============================================================================
-- Script de Validación: Verificar migración de emsp_* a external_operator_*
-- ============================================================================
-- 
-- Este script valida que la migración se haya completado correctamente
-- verificando que todas las tablas, campos e índices tienen los nuevos nombres.
--
-- Fecha de creación: 2024
-- ============================================================================

\echo '============================================================================'
\echo 'VALIDACIÓN DE MIGRACIÓN: emsp_* → external_operator_*'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- Verificar tablas
-- ============================================================================
\echo '1. Verificando tablas...'
\echo ''

DO $$
DECLARE
    table_count INTEGER;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    found_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    expected_tables TEXT[] := ARRAY[
        'external_operator_locations',
        'external_operator_evses',
        'external_operator_tariffs',
        'external_operator_sessions',
        'external_operator_cdrs',
        'external_operator_tokens',
        'external_operator_contracts'
    ];
    old_tables TEXT[] := ARRAY[
        'emsp_locations',
        'emsp_evses',
        'emsp_tariffs',
        'emsp_sessions',
        'emsp_cdrs',
        'emsp_tokens',
        'emsp_contracts'
    ];
BEGIN
    -- Verificar que las nuevas tablas existen
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name;
        
        IF table_count > 0 THEN
            found_tables := array_append(found_tables, table_name);
            RAISE NOTICE '  ✅ % existe', table_name;
        ELSE
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '  ❌ % NO existe', table_name;
        END IF;
    END LOOP;
    
    -- Verificar que las tablas antiguas NO existen
    FOREACH table_name IN ARRAY old_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name;
        
        IF table_count > 0 THEN
            RAISE WARNING '  ⚠️  Tabla antigua % todavía existe!', table_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'ERROR: Faltan las siguientes tablas: %', array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Todas las tablas fueron renombradas correctamente';
END $$;

-- ============================================================================
-- Verificar campos
-- ============================================================================
\echo '2. Verificando campos...'
\echo ''

DO $$
DECLARE
    column_count INTEGER;
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    column_name TEXT;
    tables_to_check TEXT[] := ARRAY[
        'external_operator_locations',
        'external_operator_evses',
        'external_operator_tariffs',
        'external_operator_sessions',
        'external_operator_cdrs',
        'external_operator_tokens',
        'external_operator_contracts'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Verificar external_operator_party_id
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = table_name
        AND column_name = 'external_operator_party_id';
        
        IF column_count = 0 THEN
            missing_columns := array_append(missing_columns, table_name || '.external_operator_party_id');
            RAISE NOTICE '  ❌ % no tiene external_operator_party_id', table_name;
        ELSE
            RAISE NOTICE '  ✅ % tiene external_operator_party_id', table_name;
        END IF;
        
        -- Verificar external_operator_country_code
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = table_name
        AND column_name = 'external_operator_country_code';
        
        IF column_count = 0 THEN
            missing_columns := array_append(missing_columns, table_name || '.external_operator_country_code');
            RAISE NOTICE '  ❌ % no tiene external_operator_country_code', table_name;
        ELSE
            RAISE NOTICE '  ✅ % tiene external_operator_country_code', table_name;
        END IF;
        
        -- Verificar que los campos antiguos NO existen
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = table_name
        AND column_name IN ('emsp_party_id', 'emsp_country_code');
        
        IF column_count > 0 THEN
            RAISE WARNING '  ⚠️  % todavía tiene campos antiguos (emsp_party_id o emsp_country_code)', table_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'ERROR: Faltan los siguientes campos: %', array_to_string(missing_columns, ', ');
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Todos los campos fueron renombrados correctamente';
END $$;

-- ============================================================================
-- Verificar índices
-- ============================================================================
\echo '3. Verificando índices...'
\echo ''

DO $$
DECLARE
    index_count INTEGER;
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
    index_name TEXT;
    expected_indexes TEXT[] := ARRAY[
        'idx_external_operator_locations_party',
        'idx_external_operator_locations_last_updated',
        'idx_external_operator_evses_party',
        'idx_external_operator_evses_evse_id',
        'idx_external_operator_evses_last_updated',
        'idx_external_operator_evses_location_id',
        'idx_external_operator_evses_status',
        'idx_external_operator_tariffs_party',
        'idx_external_operator_tariffs_last_updated',
        'idx_external_operator_tariffs_deleted_at',
        'idx_external_operator_sessions_party',
        'idx_external_operator_sessions_last_updated',
        'idx_external_operator_cdrs_party',
        'idx_external_operator_cdrs_last_updated',
        'idx_external_operator_tokens_party',
        'idx_external_operator_tokens_last_updated',
        'idx_external_operator_tokens_deleted_at',
        'idx_external_operator_contracts_party',
        'idx_external_operator_contracts_last_updated'
    ];
    old_indexes TEXT[] := ARRAY[
        'idx_emsp_locations_emsp_party',
        'idx_emsp_locations_last_updated',
        'idx_emsp_evses_emsp_party',
        'idx_emsp_evses_evse_id',
        'idx_emsp_evses_last_updated',
        'idx_emsp_evses_location_id',
        'idx_emsp_evses_status',
        'idx_emsp_tariffs_emsp_party',
        'idx_emsp_tariffs_last_updated',
        'idx_emsp_tariffs_deleted_at',
        'idx_emsp_sessions_emsp_party',
        'idx_emsp_sessions_last_updated',
        'idx_emsp_cdrs_emsp_party',
        'idx_emsp_cdrs_last_updated',
        'idx_emsp_tokens_emsp_party',
        'idx_emsp_tokens_last_updated',
        'idx_emsp_tokens_deleted_at',
        'idx_emsp_contracts_emsp_party',
        'idx_emsp_contracts_last_updated'
    ];
BEGIN
    -- Verificar que los nuevos índices existen
    FOREACH index_name IN ARRAY expected_indexes
    LOOP
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname = index_name;
        
        IF index_count > 0 THEN
            RAISE NOTICE '  ✅ % existe', index_name;
        ELSE
            missing_indexes := array_append(missing_indexes, index_name);
            RAISE NOTICE '  ❌ % NO existe', index_name;
        END IF;
    END LOOP;
    
    -- Verificar que los índices antiguos NO existen
    FOREACH index_name IN ARRAY old_indexes
    LOOP
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname = index_name;
        
        IF index_count > 0 THEN
            RAISE WARNING '  ⚠️  Índice antiguo % todavía existe!', index_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE WARNING 'ADVERTENCIA: Faltan los siguientes índices: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✅ Todos los índices fueron renombrados correctamente';
    END IF;
END $$;

-- ============================================================================
-- Resumen de validación
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'RESUMEN DE VALIDACIÓN'
\echo '============================================================================'

SELECT 
    'Tablas renombradas' as tipo,
    COUNT(*) as cantidad
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'external_operator_%'

UNION ALL

SELECT 
    'Campos renombrados' as tipo,
    COUNT(*) as cantidad
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name LIKE 'external_operator_%'
AND column_name IN ('external_operator_party_id', 'external_operator_country_code')

UNION ALL

SELECT 
    'Índices renombrados' as tipo,
    COUNT(*) as cantidad
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_external_operator_%';

\echo ''
\echo '============================================================================'
\echo 'VALIDACIÓN COMPLETADA'
\echo '============================================================================'
\echo 'Si todos los checks muestran ✅, la migración fue exitosa.'
\echo 'Si hay ❌ o ⚠️, revisa los mensajes anteriores.'
\echo '============================================================================'

