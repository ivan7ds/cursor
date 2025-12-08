const AuthorizationService = require('../../../services/authorizationService');
const logger = require('../../../utils/logger');

/**
 * Valida la autorización del token
 */
async function validateTokenAuthorization(token, evse_uid) {
  try {
    const authResult = await AuthorizationService.authorizeToken(token.uid, evse_uid);
    return {
      authorized: authResult.allowed,
      message: authResult.message || null
    };
  } catch (error) {
    logger.error('❌ START_SESSION: Authorization error', {
      token_uid: token.uid,
      evse_uid,
      error: error.message
    });
    return {
      authorized: false,
      message: 'Authorization service error'
    };
  }
}

/**
 * Valida que el EVSE esté disponible
 */
function validateEVSEAvailability(evse) {
  if (!evse) {
    return {
      available: false,
      message: 'EVSE not found'
    };
  }

  if (evse.status !== 'AVAILABLE') {
    return {
      available: false,
      message: `EVSE not available (status: ${evse.status})`
    };
  }

  return {
    available: true,
    message: null
  };
}

module.exports = {
    validateTokenAuthorization,
    validateEVSEAvailability
};

