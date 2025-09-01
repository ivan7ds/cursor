-- Script para actualizar el party_id de los tokens eMSP
-- Cambiar de 'EMSP001' a 'IPD' para cumplir con la especificación OCPI 2.2

-- Verificar tokens antes de la actualización
SELECT 
    party_id,
    COUNT(*) as count,
    COUNT(CASE WHEN valid = true THEN 1 END) as valid_count
FROM tokens 
GROUP BY party_id 
ORDER BY party_id;

-- Actualizar todos los tokens que tengan party_id = 'EMSP001' a 'IPD'
UPDATE tokens 
SET 
    party_id = 'IPD',
    updated_at = NOW()
WHERE party_id = 'EMSP001';

-- Verificar tokens después de la actualización
SELECT 
    party_id,
    COUNT(*) as count,
    COUNT(CASE WHEN valid = true THEN 1 END) as valid_count
FROM tokens 
GROUP BY party_id 
ORDER BY party_id;

-- Mostrar algunos tokens actualizados como ejemplo
SELECT 
    id,
    party_id,
    uid,
    type,
    valid,
    whitelist,
    last_updated
FROM tokens 
WHERE party_id = 'IPD'
ORDER BY type, uid
LIMIT 10;

-- Comentarios para documentar el cambio
COMMENT ON TABLE tokens IS 'Tabla que almacena tokens de usuarios cuando la aplicación actúa como eMSP con party_id IPD';
COMMENT ON COLUMN tokens.party_id IS 'Identificador de la empresa (IPD) según especificación OCPI 2.2';

