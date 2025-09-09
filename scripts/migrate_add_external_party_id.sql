-- Migración para agregar campo external_party_id a la tabla credentials
-- Fecha: 2025-09-09
-- Descripción: Permite identificar para qué operador externo es válido cada token

-- Agregar el nuevo campo
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS external_party_id VARCHAR(10);

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_credentials_external_party_id ON credentials(external_party_id);

-- Actualizar registros existentes donde party_id = 'IPD' para establecer external_party_id
-- Esto se hará basándose en la URL o en la lógica de negocio existente
-- Por ahora, se dejan como NULL para ser actualizados manualmente o por lógica de aplicación

-- Comentario: Los tokens con party_id = 'IPD' y external_party_id = NULL son tokens del sistema
-- Los tokens con party_id = 'IPD' y external_party_id != NULL son nuestros tokens para operadores externos
