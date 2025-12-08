-- Migración: Agregar columna name a external_operator_tariffs
-- NOTA: Este script ha sido actualizado para usar el nuevo nombre de tabla
-- Si las tablas aún tienen el nombre antiguo (emsp_tariffs), ejecutar primero
-- la migración de renombrado: migrate_rename_emsp_to_external_operator.sql

ALTER TABLE external_operator_tariffs
ADD COLUMN IF NOT EXISTS name VARCHAR(255);
