const logger = require('../../../utils/logger');

const { sendRejectionAndNotify } = require('./responseHelpers');
const { validateTokenAuthorization, validateEVSEAvailability } = require('./validationHelpers');

/**
 * Valida la autorización del token
 */
async function validateTokenAuth(token, location_id, evse_uid) {
  logger.info('🔐 START_SESSION: Performing real-time authorization', {
    token_uid: token.uid,
    location_id,
    evse_uid
  });

  const authResult = await validateTokenAuthorization(token, {
    type: token.type,
    issuer: token.issuer,
    locationId: location_id,
    evseUid: evse_uid
  });

  if (!authResult.success || authResult.data.allowed !== 'ALLOWED') {
    logger.error('❌ START_SESSION: Token authorization failed', {
      token_uid: token.uid,
      auth_result: authResult,
      location_id,
      evse_uid
    });

    return {
      authorized: false,
      message: authResult.status_message || 'Token not authorized'
    };
  }

  logger.info('✅ START_SESSION: Token authorized successfully', {
    token_uid: token.uid,
    validity: authResult.data.validity,
    location_id,
    evse_uid
  });

  return { authorized: true };
}

/**
 * Valida la disponibilidad del EVSE
 */
function validateEVSE(evse, evse_uid) {
  const evseValidation = validateEVSEAvailability(evse);
  if (!evseValidation.available) {
    logger.error('❌ START_SESSION: EVSE not available', {
      evse_uid,
      evse_status: evse.status
    });

    return {
      available: false,
      message: evseValidation.message
    };
  }

  return { available: true };
}

/**
 * Ejecuta el flujo completo de autorización y validación
 */
async function executeAuthorizationFlow(authContext) {
  const { token, evse, location_id, evse_uid, response_url, res } = authContext;

  const tokenAuth = await validateTokenAuth(token, location_id, evse_uid);
  if (!tokenAuth.authorized) {
    await sendRejectionAndNotify(response_url, tokenAuth.message, token.uid, res);
    return false;
  }

  const evseValidation = validateEVSE(evse, evse_uid);
  if (!evseValidation.available) {
    await sendRejectionAndNotify(response_url, evseValidation.message, token.uid, res);
    return false;
  }

  return true;
}

module.exports = {
    executeAuthorizationFlow
};
