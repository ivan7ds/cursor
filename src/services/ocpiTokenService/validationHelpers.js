const { OCPIToken } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Busca el token en la tabla OCPIToken
 * @param {string} token - Token a buscar
 * @returns {Promise<Object|null>} Token encontrado o null
 */
async function findTokenInOCPIToken(token) {
  return await OCPIToken.findOne({
    where: {
      token,
      is_active: true
    }
  });
}

/**
 * Busca el token en la tabla credentials
 * @param {string} token - Token a buscar
 * @returns {Promise<Object|null>} Credencial encontrada o null
 */
async function findTokenInCredentials(token) {
  const { sequelize } = require('../../database/connection');
  const [credentialsResult] = await sequelize.query(`
    SELECT token, party_id, country_code, valid, temp, created_at, updated_at 
    FROM credentials 
    WHERE token = ? AND valid = true
  `, {
    replacements: [token]
  });
  
  if (credentialsResult && credentialsResult.length > 0) {
    return credentialsResult[0];
  }
  
  return null;
}

/**
 * Construye la respuesta del token desde credentials
 * @param {Object} cred - Credencial encontrada
 * @returns {Object} Respuesta del token
 */
function buildCredentialsTokenResponse(cred) {
  return {
    id: cred.token,
    party_id: cred.party_id,
    country_code: cred.country_code,
    valid: cred.valid,
    temp: cred.temp,
    created_at: cred.created_at,
    expires_at: null,
    type: 'credentials'
  };
}

/**
 * Verifica si el token ha expirado y lo desactiva si es necesario
 * @param {Object} tokenRecord - Registro del token
 * @returns {Promise<boolean>} True si está expirado, false si no
 */
async function checkAndDeactivateExpiredToken(tokenRecord) {
  if (tokenRecord.expires_at && new Date() > tokenRecord.expires_at) {
    logger.warn('Token expired', { tokenId: tokenRecord.id, partyId: tokenRecord.party_id });
    const OCPITokenService = require('../ocpiTokenService');
    await OCPITokenService.deactivateToken(tokenRecord.id);
    return true;
  }
  return false;
}

/**
 * Actualiza el último uso del token
 * @param {Object} tokenRecord - Registro del token
 * @returns {Promise<void>}
 */
async function updateTokenLastUsed(tokenRecord) {
  await tokenRecord.update({
    last_used_at: new Date()
  });
}

/**
 * Construye la respuesta del token desde OCPIToken
 * @param {Object} tokenRecord - Registro del token
 * @returns {Object} Respuesta del token
 */
function buildOCPITokenResponse(tokenRecord) {
  return {
    id: tokenRecord.id,
    party_id: tokenRecord.party_id,
    country_code: tokenRecord.country_code,
    created_at: tokenRecord.created_at,
    expires_at: tokenRecord.expires_at,
    type: 'ocpi_token'
  };
}

module.exports = {
    findTokenInOCPIToken,
    findTokenInCredentials,
    buildCredentialsTokenResponse,
    checkAndDeactivateExpiredToken,
    updateTokenLastUsed,
    buildOCPITokenResponse
};

