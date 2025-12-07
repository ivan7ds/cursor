-- ============================================================================
-- Script de Migración: Renombrar tablas emsp_* a external_operator_*
-- ============================================================================
-- 
-- Este script renombra todas las tablas, campos e índices relacionados con
-- operadores externos (anteriormente llamados "emsp") a un nombre más descriptivo
-- que refleja que pueden ser CPO, EMSP o ambos.
--
-- IMPORTANTE:
-- 1. Realizar backup completo de la base de datos ANTES de ejecutar este script
-- 2. Ejecutar en entorno de desarrollo primero
-- 3. Verificar que todas las tablas existen antes de ejecutar
-- 4. Este script usa transacciones para permitir rollback
--
-- Fecha de creación: 2024
-- ============================================================================

-- Verificar que las tablas existen antes de proceder
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    tbl_name TEXT;
    required_tables TEXT[] := ARRAY[
        'emsp_locations',
        'emsp_evses',
        'emsp_tariffs',
        'emsp_sessions',
        'emsp_cdrs',
        'emsp_tokens',
        'emsp_contracts'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl_name
        ) THEN
            missing_tables := array_append(missing_tables, tbl_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Las siguientes tablas no existen: %', array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '✅ Todas las tablas requeridas existen. Iniciando migración...';
END $$;

-- Iniciar transacción
BEGIN;

-- ============================================================================
-- PASO 1: Renombrar tablas
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Paso 1: Renombrando tablas...';
END $$;

ALTER TABLE IF EXISTS emsp_locations RENAME TO external_operator_locations;
DO $$ BEGIN RAISE NOTICE '  ✓ emsp_locations → external_operator_locations'; END $$;

ALTER TABLE IF EXISTS emsp_evses RENAME TO external_operator_evses;
DO $$ BEGIN RAISE NOTICE '  ✓ emsp_evses → external_operator_evses'; END $$;

ALTER TABLE IF EXISTS emsp_tariffs RENAME TO external_operator_tariffs;
DO $$ BEGIN RAISE NOTICE '  ✓ emsp_tariffs → external_operator_tariffs'; END $$;

ALTER TABLE IF EXISTS emsp_sessions RENAME TO external_operator_sessions;
DO $$ BEGIN RAISE NOTICE '  ✓ emsp_sessions → external_operator_sessions'; END $$;

ALTER TABLE IF EXISTS emsp_cdrs RENAME TO external_operator_cdrs;
DO $$ BEGIN RAISE NOTICE '  ✓ emsp_cdrs → external_operator_cdrs'; END $$;

ALTER TABLE IF EXISTS emsp_tokens RENAME TO external_operator_tokens;
DO $$ BEGIN RAISE NOTICE '  ✓ emsp_tokens → external_operator_tokens'; END $$;

ALTER TABLE IF EXISTS emsp_contracts RENAME TO external_operator_contracts;
DO $$ BEGIN RAISE NOTICE '  ✓ emsp_contracts → external_operator_contracts'; END $$;

-- ============================================================================
-- PASO 2: Renombrar campos emsp_party_id a external_operator_party_id
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Paso 2: Renombrando campo emsp_party_id → external_operator_party_id...';
END $$;

ALTER TABLE external_operator_locations 
    RENAME COLUMN emsp_party_id TO external_operator_party_id;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_locations.emsp_party_id'; END $$;

ALTER TABLE external_operator_evses 
    RENAME COLUMN emsp_party_id TO external_operator_party_id;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_evses.emsp_party_id'; END $$;

ALTER TABLE external_operator_tariffs 
    RENAME COLUMN emsp_party_id TO external_operator_party_id;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_tariffs.emsp_party_id'; END $$;

ALTER TABLE external_operator_sessions 
    RENAME COLUMN emsp_party_id TO external_operator_party_id;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_sessions.emsp_party_id'; END $$;

ALTER TABLE external_operator_cdrs 
    RENAME COLUMN emsp_party_id TO external_operator_party_id;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_cdrs.emsp_party_id'; END $$;

ALTER TABLE external_operator_tokens 
    RENAME COLUMN emsp_party_id TO external_operator_party_id;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_tokens.emsp_party_id'; END $$;

ALTER TABLE external_operator_contracts 
    RENAME COLUMN emsp_party_id TO external_operator_party_id;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_contracts.emsp_party_id'; END $$;

-- ============================================================================
-- PASO 3: Renombrar campos emsp_country_code a external_operator_country_code
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Paso 3: Renombrando campo emsp_country_code → external_operator_country_code...';
END $$;

ALTER TABLE external_operator_locations 
    RENAME COLUMN emsp_country_code TO external_operator_country_code;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_locations.emsp_country_code'; END $$;

ALTER TABLE external_operator_evses 
    RENAME COLUMN emsp_country_code TO external_operator_country_code;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_evses.emsp_country_code'; END $$;

ALTER TABLE external_operator_tariffs 
    RENAME COLUMN emsp_country_code TO external_operator_country_code;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_tariffs.emsp_country_code'; END $$;

ALTER TABLE external_operator_sessions 
    RENAME COLUMN emsp_country_code TO external_operator_country_code;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_sessions.emsp_country_code'; END $$;

ALTER TABLE external_operator_cdrs 
    RENAME COLUMN emsp_country_code TO external_operator_country_code;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_cdrs.emsp_country_code'; END $$;

ALTER TABLE external_operator_tokens 
    RENAME COLUMN emsp_country_code TO external_operator_country_code;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_tokens.emsp_country_code'; END $$;

ALTER TABLE external_operator_contracts 
    RENAME COLUMN emsp_country_code TO external_operator_country_code;
DO $$ BEGIN RAISE NOTICE '  ✓ external_operator_contracts.emsp_country_code'; END $$;

-- ============================================================================
-- PASO 4: Renombrar índices
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Paso 4: Renombrando índices...';
END $$;

-- Locations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_locations_emsp_party') THEN
        ALTER INDEX idx_emsp_locations_emsp_party RENAME TO idx_external_operator_locations_party;
        RAISE NOTICE '  ✓ idx_emsp_locations_emsp_party → idx_external_operator_locations_party';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_locations_last_updated') THEN
        ALTER INDEX idx_emsp_locations_last_updated RENAME TO idx_external_operator_locations_last_updated;
        RAISE NOTICE '  ✓ idx_emsp_locations_last_updated → idx_external_operator_locations_last_updated';
    END IF;
END $$;

-- EVSEs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_evses_emsp_party') THEN
        ALTER INDEX idx_emsp_evses_emsp_party RENAME TO idx_external_operator_evses_party;
        RAISE NOTICE '  ✓ idx_emsp_evses_emsp_party → idx_external_operator_evses_party';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_evses_evse_id') THEN
        ALTER INDEX idx_emsp_evses_evse_id RENAME TO idx_external_operator_evses_evse_id;
        RAISE NOTICE '  ✓ idx_emsp_evses_evse_id → idx_external_operator_evses_evse_id';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_evses_last_updated') THEN
        ALTER INDEX idx_emsp_evses_last_updated RENAME TO idx_external_operator_evses_last_updated;
        RAISE NOTICE '  ✓ idx_emsp_evses_last_updated → idx_external_operator_evses_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_evses_location_id') THEN
        ALTER INDEX idx_emsp_evses_location_id RENAME TO idx_external_operator_evses_location_id;
        RAISE NOTICE '  ✓ idx_emsp_evses_location_id → idx_external_operator_evses_location_id';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_evses_status') THEN
        ALTER INDEX idx_emsp_evses_status RENAME TO idx_external_operator_evses_status;
        RAISE NOTICE '  ✓ idx_emsp_evses_status → idx_external_operator_evses_status';
    END IF;
END $$;

-- Tariffs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_tariffs_emsp_party') THEN
        ALTER INDEX idx_emsp_tariffs_emsp_party RENAME TO idx_external_operator_tariffs_party;
        RAISE NOTICE '  ✓ idx_emsp_tariffs_emsp_party → idx_external_operator_tariffs_party';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_tariffs_last_updated') THEN
        ALTER INDEX idx_emsp_tariffs_last_updated RENAME TO idx_external_operator_tariffs_last_updated;
        RAISE NOTICE '  ✓ idx_emsp_tariffs_last_updated → idx_external_operator_tariffs_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_tariffs_deleted_at') THEN
        ALTER INDEX idx_emsp_tariffs_deleted_at RENAME TO idx_external_operator_tariffs_deleted_at;
        RAISE NOTICE '  ✓ idx_emsp_tariffs_deleted_at → idx_external_operator_tariffs_deleted_at';
    END IF;
END $$;

-- Sessions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_sessions_emsp_party') THEN
        ALTER INDEX idx_emsp_sessions_emsp_party RENAME TO idx_external_operator_sessions_party;
        RAISE NOTICE '  ✓ idx_emsp_sessions_emsp_party → idx_external_operator_sessions_party';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_sessions_last_updated') THEN
        ALTER INDEX idx_emsp_sessions_last_updated RENAME TO idx_external_operator_sessions_last_updated;
        RAISE NOTICE '  ✓ idx_emsp_sessions_last_updated → idx_external_operator_sessions_last_updated';
    END IF;
END $$;

-- CDRs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_cdrs_emsp_party') THEN
        ALTER INDEX idx_emsp_cdrs_emsp_party RENAME TO idx_external_operator_cdrs_party;
        RAISE NOTICE '  ✓ idx_emsp_cdrs_emsp_party → idx_external_operator_cdrs_party';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_cdrs_last_updated') THEN
        ALTER INDEX idx_emsp_cdrs_last_updated RENAME TO idx_external_operator_cdrs_last_updated;
        RAISE NOTICE '  ✓ idx_emsp_cdrs_last_updated → idx_external_operator_cdrs_last_updated';
    END IF;
END $$;

-- Tokens
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_tokens_emsp_party') THEN
        ALTER INDEX idx_emsp_tokens_emsp_party RENAME TO idx_external_operator_tokens_party;
        RAISE NOTICE '  ✓ idx_emsp_tokens_emsp_party → idx_external_operator_tokens_party';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_tokens_last_updated') THEN
        ALTER INDEX idx_emsp_tokens_last_updated RENAME TO idx_external_operator_tokens_last_updated;
        RAISE NOTICE '  ✓ idx_emsp_tokens_last_updated → idx_external_operator_tokens_last_updated';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_tokens_deleted_at') THEN
        ALTER INDEX idx_emsp_tokens_deleted_at RENAME TO idx_external_operator_tokens_deleted_at;
        RAISE NOTICE '  ✓ idx_emsp_tokens_deleted_at → idx_external_operator_tokens_deleted_at';
    END IF;
END $$;

-- Contracts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_contracts_emsp_party') THEN
        ALTER INDEX idx_emsp_contracts_emsp_party RENAME TO idx_external_operator_contracts_party;
        RAISE NOTICE '  ✓ idx_emsp_contracts_emsp_party → idx_external_operator_contracts_party';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emsp_contracts_last_updated') THEN
        ALTER INDEX idx_emsp_contracts_last_updated RENAME TO idx_external_operator_contracts_last_updated;
        RAISE NOTICE '  ✓ idx_emsp_contracts_last_updated → idx_external_operator_contracts_last_updated';
    END IF;
END $$;

-- ============================================================================
-- Verificación final
-- ============================================================================
DO $$
DECLARE
    table_count INTEGER;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    tbl_name TEXT;
    expected_tables TEXT[] := ARRAY[
        'external_operator_locations',
        'external_operator_evses',
        'external_operator_tariffs',
        'external_operator_sessions',
        'external_operator_cdrs',
        'external_operator_tokens',
        'external_operator_contracts'
    ];
BEGIN
    RAISE NOTICE 'Verificando migración...';
    
    FOREACH tbl_name IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name;
        
        IF table_count = 0 THEN
            missing_tables := array_append(missing_tables, tbl_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'ERROR: Las siguientes tablas no se renombraron correctamente: %', 
            array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '✅ Migración completada exitosamente!';
    RAISE NOTICE '✅ Todas las tablas fueron renombradas correctamente.';
END $$;

-- Confirmar transacción
COMMIT;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Todas las tablas, campos e índices han sido renombrados.';
    RAISE NOTICE 'Por favor, verifica que la aplicación funciona correctamente.';
    RAISE NOTICE '============================================================================';
END $$;

