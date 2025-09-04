-- Agregar columna kwh a la tabla sessions
ALTER TABLE sessions ADD COLUMN kwh DECIMAL(10,3) DEFAULT 0.0;

-- Agregar comentario a la columna
COMMENT ON COLUMN sessions.kwh IS 'Energy consumed in kWh';

-- Actualizar sesiones existentes con valor por defecto
UPDATE sessions SET kwh = 0.0 WHERE kwh IS NULL;
