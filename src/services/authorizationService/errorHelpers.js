const logger = require('../../utils/logger');

/**
 * Construye la respuesta de error para autorización
 * @param {string} tokenUid - UID del token
 * @param {Object} options - Opciones de autorización
 * @param {Error} error - Error ocurrido
 * @returns {Object} Respuesta de error
 */
function buildAuthorizationErrorResponse(tokenUid, options, error) {
  logger.error('❌ Authorization service error:', {
    error: error.message,
    stack: error.stack,
    token_uid: tokenUid,
    options
  });

  return {
    success: false,
    status_code: 2000,
    status_message: "Internal server error during authorization",
    data: {
      allowed: "BLOCKED",
      location_id: options.locationId || null,
      evse_uid: options.evseUid || null,
      validity: "INVALID"
    }
  };
}

/**
 * Logs el éxito de la autorización
 * @param {string} tokenUid - UID del token
 * @param {Object} token - Token autorizado
 * @param {string} locationId - ID de la ubicación
 * @param {string} evseUid - UID del EVSE
 */
function logAuthorizationSuccess(tokenUid, token, locationId, evseUid) {
  logger.info('✅ Authorization: Token authorized successfully', {
    token_uid: tokenUid,
    party_id: token.party_id,
    country_code: token.country_code,
    type: token.type,
    location_id: locationId,
    evse_uid: evseUid
  });
}

module.exports = {
    buildAuthorizationErrorResponse,
    logAuthorizationSuccess
};

