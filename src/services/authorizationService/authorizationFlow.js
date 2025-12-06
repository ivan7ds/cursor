const logger = require('../../utils/logger');

const {
  validateTokenUidStep,
  findAndValidateTokenStep,
  validateTokenRestrictions,
  finalizeAuthorization
} = require('./authorizationSteps');

/**
 * Ejecuta el flujo completo de autorización de token
 * @param {string} tokenUid - UID del token
 * @param {Object} options - Opciones de autorización
 * @returns {Promise<Object>} Resultado de la autorización
 */
async function executeAuthorizationFlow(tokenUid, options) {
  const { type, issuer, locationId, evseUid } = options;

  logger.info('🔐 Real-time authorization request', {
    token_uid: tokenUid,
    type,
    issuer,
    location_id: locationId,
    evse_uid: evseUid
  });

  const validationError = validateTokenUidStep(tokenUid, locationId, evseUid);
  if (validationError) {
    return validationError;
  }

  const tokenResult = await findAndValidateTokenStep({ tokenUid, type, issuer, locationId, evseUid });
  if (tokenResult.error) {
    return tokenResult.error;
  }

  const restrictionsError = validateTokenRestrictions(tokenResult.token, tokenUid, locationId, evseUid);
  if (restrictionsError) {
    return restrictionsError;
  }

  return await finalizeAuthorization(tokenResult.token, tokenUid, locationId, evseUid);
}

module.exports = {
    executeAuthorizationFlow
};
