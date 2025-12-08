-- ============================================================================
-- Script de Rollback: Revertir renombrado de external_operator_* a emsp_*
-- ============================================================================
-- 
-- Este script revierte todos los cambios realizados por la migración
-- migrate_rename_emsp_to_external_operator.sql
--
-- IMPORTANTE:
-- 1. Solo ejecutar si es necesario revertir la migración
-- 2. Realizar backup antes de ejecutar
-- 3. Este script usa transacciones para permitir rollback
--
-- Fecha de creación: 2024
-- ============================================================================

-- Verificar que las tablas existen antes de proceder
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    required_tables TEXT[] := ARRAY[
        'external_operator_locations',
        'external_operator_evses',
        'external_operator_tariffs',
        'external_operator_sessions',
        'external_operator_cdrs',
        'external_operator_tokens',
        'external_operator_contracts'
    ];
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Las siguientes tablas no existen: %', array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '✅ Todas las tablas requeridas existen. Iniciando rollback...';
END $$;

-- Iniciar transacción
BEGIN;

-- ============================================================================
-- PASO 1: Revertir renombrado de índices (en orden inverso)
-- ============================================================================
RAISE NOTICE 'Paso 1: Revirtiendo renombrado de índices...';

-- Contracts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_contracts_last_updated') THEN
        ALTER INDEX idx_external_operator_contracts_last_updated RENAME TO idx_emsp_contracts_last_updated;
        RAISE NOTICE '  ✓ idx_external_operator_contracts_last_updated → idx_emsp_contracts_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_contracts_party') THEN
        ALTER INDEX idx_external_operator_contracts_party RENAME TO idx_emsp_contracts_emsp_party;
        RAISE NOTICE '  ✓ idx_external_operator_contracts_party → idx_emsp_contracts_emsp_party';
    END IF;
END $$;

-- Tokens
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_tokens_deleted_at') THEN
        ALTER INDEX idx_external_operator_tokens_deleted_at RENAME TO idx_emsp_tokens_deleted_at;
        RAISE NOTICE '  ✓ idx_external_operator_tokens_deleted_at → idx_emsp_tokens_deleted_at';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_tokens_last_updated') THEN
        ALTER INDEX idx_external_operator_tokens_last_updated RENAME TO idx_emsp_tokens_last_updated;
        RAISE NOTICE '  ✓ idx_external_operator_tokens_last_updated → idx_emsp_tokens_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_tokens_party') THEN
        ALTER INDEX idx_external_operator_tokens_party RENAME TO idx_emsp_tokens_emsp_party;
        RAISE NOTICE '  ✓ idx_external_operator_tokens_party → idx_emsp_tokens_emsp_party';
    END IF;
END $$;

-- CDRs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_cdrs_last_updated') THEN
        ALTER INDEX idx_external_operator_cdrs_last_updated RENAME TO idx_emsp_cdrs_last_updated;
        RAISE NOTICE '  ✓ idx_external_operator_cdrs_last_updated → idx_emsp_cdrs_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_cdrs_party') THEN
        ALTER INDEX idx_external_operator_cdrs_party RENAME TO idx_emsp_cdrs_emsp_party;
        RAISE NOTICE '  ✓ idx_external_operator_cdrs_party → idx_emsp_cdrs_emsp_party';
    END IF;
END $$;

-- Sessions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_sessions_last_updated') THEN
        ALTER INDEX idx_external_operator_sessions_last_updated RENAME TO idx_emsp_sessions_last_updated;
        RAISE NOTICE '  ✓ idx_external_operator_sessions_last_updated → idx_emsp_sessions_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_sessions_party') THEN
        ALTER INDEX idx_external_operator_sessions_party RENAME TO idx_emsp_sessions_emsp_party;
        RAISE NOTICE '  ✓ idx_external_operator_sessions_party → idx_emsp_sessions_emsp_party';
    END IF;
END $$;

-- Tariffs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_tariffs_deleted_at') THEN
        ALTER INDEX idx_external_operator_tariffs_deleted_at RENAME TO idx_emsp_tariffs_deleted_at;
        RAISE NOTICE '  ✓ idx_external_operator_tariffs_deleted_at → idx_emsp_tariffs_deleted_at';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_tariffs_last_updated') THEN
        ALTER INDEX idx_external_operator_tariffs_last_updated RENAME TO idx_emsp_tariffs_last_updated;
        RAISE NOTICE '  ✓ idx_external_operator_tariffs_last_updated → idx_emsp_tariffs_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_tariffs_party') THEN
        ALTER INDEX idx_external_operator_tariffs_party RENAME TO idx_emsp_tariffs_emsp_party;
        RAISE NOTICE '  ✓ idx_external_operator_tariffs_party → idx_emsp_tariffs_emsp_party';
    END IF;
END $$;

-- EVSEs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_evses_status') THEN
        ALTER INDEX idx_external_operator_evses_status RENAME TO idx_emsp_evses_status;
        RAISE NOTICE '  ✓ idx_external_operator_evses_status → idx_emsp_evses_status';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_evses_location_id') THEN
        ALTER INDEX idx_external_operator_evses_location_id RENAME TO idx_emsp_evses_location_id;
        RAISE NOTICE '  ✓ idx_external_operator_evses_location_id → idx_emsp_evses_location_id';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_evses_last_updated') THEN
        ALTER INDEX idx_external_operator_evses_last_updated RENAME TO idx_emsp_evses_last_updated;
        RAISE NOTICE '  ✓ idx_external_operator_evses_last_updated → idx_emsp_evses_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_evses_evse_id') THEN
        ALTER INDEX idx_external_operator_evses_evse_id RENAME TO idx_emsp_evses_evse_id;
        RAISE NOTICE '  ✓ idx_external_operator_evses_evse_id → idx_emsp_evses_evse_id';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_evses_party') THEN
        ALTER INDEX idx_external_operator_evses_party RENAME TO idx_emsp_evses_emsp_party;
        RAISE NOTICE '  ✓ idx_external_operator_evses_party → idx_emsp_evses_emsp_party';
    END IF;
END $$;

-- Locations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_locations_last_updated') THEN
        ALTER INDEX idx_external_operator_locations_last_updated RENAME TO idx_emsp_locations_last_updated;
        RAISE NOTICE '  ✓ idx_external_operator_locations_last_updated → idx_emsp_locations_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_external_operator_locations_party') THEN
        ALTER INDEX idx_external_operator_locations_party RENAME TO idx_emsp_locations_emsp_party;
        RAISE NOTICE '  ✓ idx_external_operator_locations_party → idx_emsp_locations_emsp_party';
    END IF;
END $$;

-- ============================================================================
-- PASO 2: Revertir renombrado de campos external_operator_country_code
-- ============================================================================
RAISE NOTICE 'Paso 2: Revirtiendo campo external_operator_country_code → emsp_country_code...';

ALTER TABLE external_operator_contracts 
    RENAME COLUMN external_operator_country_code TO emsp_country_code;
RAISE NOTICE '  ✓ external_operator_contracts.external_operator_country_code';

ALTER TABLE external_operator_tokens 
    RENAME COLUMN external_operator_country_code TO emsp_country_code;
RAISE NOTICE '  ✓ external_operator_tokens.external_operator_country_code';

ALTER TABLE external_operator_cdrs 
    RENAME COLUMN external_operator_country_code TO emsp_country_code;
RAISE NOTICE '  ✓ external_operator_cdrs.external_operator_country_code';

ALTER TABLE external_operator_sessions 
    RENAME COLUMN external_operator_country_code TO emsp_country_code;
RAISE NOTICE '  ✓ external_operator_sessions.external_operator_country_code';

ALTER TABLE external_operator_tariffs 
    RENAME COLUMN external_operator_country_code TO emsp_country_code;
RAISE NOTICE '  ✓ external_operator_tariffs.external_operator_country_code';

ALTER TABLE external_operator_evses 
    RENAME COLUMN external_operator_country_code TO emsp_country_code;
RAISE NOTICE '  ✓ external_operator_evses.external_operator_country_code';

ALTER TABLE external_operator_locations 
    RENAME COLUMN external_operator_country_code TO emsp_country_code;
RAISE NOTICE '  ✓ external_operator_locations.external_operator_country_code';

-- ============================================================================
-- PASO 3: Revertir renombrado de campos external_operator_party_id
-- ============================================================================
RAISE NOTICE 'Paso 3: Revirtiendo campo external_operator_party_id → emsp_party_id...';

ALTER TABLE external_operator_contracts 
    RENAME COLUMN external_operator_party_id TO emsp_party_id;
RAISE NOTICE '  ✓ external_operator_contracts.external_operator_party_id';

ALTER TABLE external_operator_tokens 
    RENAME COLUMN external_operator_party_id TO emsp_party_id;
RAISE NOTICE '  ✓ external_operator_tokens.external_operator_party_id';

ALTER TABLE external_operator_cdrs 
    RENAME COLUMN external_operator_party_id TO emsp_party_id;
RAISE NOTICE '  ✓ external_operator_cdrs.external_operator_party_id';

ALTER TABLE external_operator_sessions 
    RENAME COLUMN external_operator_party_id TO emsp_party_id;
RAISE NOTICE '  ✓ external_operator_sessions.external_operator_party_id';

ALTER TABLE external_operator_tariffs 
    RENAME COLUMN external_operator_party_id TO emsp_party_id;
RAISE NOTICE '  ✓ external_operator_tariffs.external_operator_party_id';

ALTER TABLE external_operator_evses 
    RENAME COLUMN external_operator_party_id TO emsp_party_id;
RAISE NOTICE '  ✓ external_operator_evses.external_operator_party_id';

ALTER TABLE external_operator_locations 
    RENAME COLUMN external_operator_party_id TO emsp_party_id;
RAISE NOTICE '  ✓ external_operator_locations.external_operator_party_id';

-- ============================================================================
-- PASO 4: Revertir renombrado de tablas
-- ============================================================================
RAISE NOTICE 'Paso 4: Revirtiendo renombrado de tablas...';

ALTER TABLE external_operator_contracts RENAME TO emsp_contracts;
RAISE NOTICE '  ✓ external_operator_contracts → emsp_contracts';

ALTER TABLE external_operator_tokens RENAME TO emsp_tokens;
RAISE NOTICE '  ✓ external_operator_tokens → emsp_tokens';

ALTER TABLE external_operator_cdrs RENAME TO emsp_cdrs;
RAISE NOTICE '  ✓ external_operator_cdrs → emsp_cdrs';

ALTER TABLE external_operator_sessions RENAME TO emsp_sessions;
RAISE NOTICE '  ✓ external_operator_sessions → emsp_sessions';

ALTER TABLE external_operator_tariffs RENAME TO emsp_tariffs;
RAISE NOTICE '  ✓ external_operator_tariffs → emsp_tariffs';

ALTER TABLE external_operator_evses RENAME TO emsp_evses;
RAISE NOTICE '  ✓ external_operator_evses → emsp_evses';

ALTER TABLE external_operator_locations RENAME TO emsp_locations;
RAISE NOTICE '  ✓ external_operator_locations → emsp_locations';

-- ============================================================================
-- Verificación final
-- ============================================================================
DO $$
DECLARE
    table_count INTEGER;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    expected_tables TEXT[] := ARRAY[
        'emsp_locations',
        'emsp_evses',
        'emsp_tariffs',
        'emsp_sessions',
        'emsp_cdrs',
        'emsp_tokens',
        'emsp_contracts'
    ];
BEGIN
    RAISE NOTICE 'Verificando rollback...';
    
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name;
        
        IF table_count = 0 THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'ERROR: Las siguientes tablas no se revirtieron correctamente: %', 
            array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '✅ Rollback completado exitosamente!';
    RAISE NOTICE '✅ Todas las tablas fueron revertidas correctamente.';
END $$;

-- Confirmar transacción
COMMIT;

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'ROLLBACK COMPLETADO EXITOSAMENTE';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'Todas las tablas, campos e índices han sido revertidos a sus nombres originales.';
RAISE NOTICE '============================================================================';

