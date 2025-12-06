const { v4: uuidv4 } = require('uuid');

const { OCPIToken } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Genera un token seguro de 64 caracteres
 * @returns {string} Token generado
 */
function generateSecureToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'OCPI_';
  
  for (let i = 0; i < 59; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Construye los metadatos del token
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Código de país
 * @param {Date} now - Fecha actual
 * @param {Object} options - Opciones adicionales
 * @returns {Object} Metadatos del token
 */
function buildTokenMetadata(partyId, countryCode, now, options) {
  return {
    description: `Token generated for ${partyId} (${countryCode})`,
    generated_at: now.toISOString(),
    generated_by: 'OCPI_CPO_SYSTEM',
    ...options.metadata
  };
}

/**
 * Crea el registro del token en la base de datos
 * @param {string} tokenId - ID del token
 * @param {string} token - Token generado
 * @param {string} partyId - Party ID
 * @param {string} countryCode - Código de país
 * @param {Date} now - Fecha actual
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Registro del token creado
 */
async function createTokenRecord({ tokenId, token, partyId, countryCode, now, options }) {
  return await OCPIToken.create({
    id: tokenId,
    token,
    party_id: partyId,
    country_code: countryCode,
    is_active: true,
    expires_at: options.expiresAt || null,
    created_at: now,
    metadata: buildTokenMetadata(partyId, countryCode, now, options)
  });
}

/**
 * Construye la respuesta del token generado
 * @param {Object} tokenRecord - Registro del token
 * @param {string} token - Token generado
 * @returns {Object} Respuesta del token
 */
function buildTokenResponse(tokenRecord, token) {
  return {
    id: tokenRecord.id,
    token,
    party_id: tokenRecord.party_id,
    country_code: tokenRecord.country_code,
    created_at: tokenRecord.created_at,
    expires_at: tokenRecord.expires_at
  };
}

module.exports = {
    generateSecureToken,
    buildTokenMetadata,
    createTokenRecord,
    buildTokenResponse
};

