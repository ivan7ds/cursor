const logger = require('../../utils/logger');

const {
  validateTokenUid,
  findToken,
  checkTokenExpiration,
  handleRealTimeAuthorization,
  checkLocationRestrictions,
  checkEVSERestrictions,
  updateTokenLastUsed,
  buildBlockedResponse,
  buildAllowedResponse
} = require('./authorizationHelpers');
const {
  logAuthorizationSuccess
} = require('./errorHelpers');

/**
 * Ejecuta la validación inicial del token UID
 * @param {string} tokenUid - UID del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Object|null} Error si es inválido, null si es válido
 */
function validateTokenUidStep(tokenUid, locationId, evseUid) {
  return validateTokenUid(tokenUid, locationId, evseUid);
}

/**
 * Busca y valida que el token existe
 * @param {string} tokenUid - UID del token
 * @param {string} type - Tipo de token
 * @param {string} issuer - Emisor del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Promise<Object>} Token encontrado o respuesta de error
 */
async function findAndValidateTokenStep({ tokenUid, type, issuer, locationId, evseUid }) {
  const token = await findToken(tokenUid);

  if (!token) {
    logger.warn('⚠️ Authorization: Token not found or invalid', {
      token_uid: tokenUid,
      type,
      issuer
    });
    
    return {
      error: buildBlockedResponse("Token not found or invalid", "INVALID", locationId, evseUid)
    };
  }

  return { token };
}

/**
 * Ejecuta todas las validaciones de restricciones del token
 * @param {Object} token - Token a validar
 * @param {string} tokenUid - UID del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Object|null} Error si hay restricción, null si es válido
 */
function validateTokenRestrictions(token, tokenUid, locationId, evseUid) {
  const expirationError = checkTokenExpiration(token, tokenUid, locationId, evseUid);
  if (expirationError) {
    return expirationError;
  }

  const realTimeAuth = handleRealTimeAuthorization(token, tokenUid, locationId, evseUid);
  if (realTimeAuth) {
    return realTimeAuth;
  }

  const locationError = checkLocationRestrictions(token, tokenUid, locationId, evseUid);
  if (locationError) {
    return locationError;
  }

  const evseError = checkEVSERestrictions(token, tokenUid, locationId, evseUid);
  if (evseError) {
    return evseError;
  }

  return null;
}

/**
 * Finaliza la autorización actualizando el token y construyendo la respuesta
 * @param {Object} token - Token autorizado
 * @param {string} tokenUid - UID del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Promise<Object>} Respuesta de autorización exitosa
 */
async function finalizeAuthorization(token, tokenUid, locationId, evseUid) {
  logAuthorizationSuccess(tokenUid, token, locationId, evseUid);
  await updateTokenLastUsed(token, tokenUid);
  return buildAllowedResponse(token, locationId, evseUid);
}

module.exports = {
    validateTokenUidStep,
    findAndValidateTokenStep,
    validateTokenRestrictions,
    finalizeAuthorization
};

