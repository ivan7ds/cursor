const axios = require('axios');

const { EVSE, CDR } = require('../../models');
const EMSPCredentialsHelper = require('../../utils/emspCredentialsHelper');
const logger = require('../../utils/logger');

/**
 * Obtiene las credenciales del EMSP para la sesión
 * @param {Object} session - Sesión
 * @returns {Promise<Object|null>} Credenciales del EMSP o null
 */
async function getEMSPCredentials(session) {
  return await EMSPCredentialsHelper.getCredentialsBySession(session);
}

/**
 * Valida que las credenciales del EMSP existan
 * @param {Object} emspCredentials - Credenciales del EMSP
 * @param {Object} session - Sesión
 * @returns {Object|null} Error si no existen, null si es válido
 */
function validateEMSPCredentials(emspCredentials, session) {
  if (!emspCredentials) {
    logger.error('❌ EMSP credentials not found for session end notification', {
      session_party_id: session.party_id,
      session_country_code: session.country_code
    });
    return {
      error: true,
      message: 'EMSP credentials not found'
    };
  }
  return null;
}

/**
 * Obtiene el EVSE asociado a la sesión
 * @param {string} evseUid - UID del EVSE
 * @returns {Promise<Object|null>} EVSE o null
 */
async function getEVSEForSession(evseUid) {
  return await EVSE.findByPk(evseUid);
}

/**
 * Valida que el EVSE exista
 * @param {Object} evse - EVSE
 * @param {Object} session - Sesión
 * @returns {Object|null} Error si no existe, null si es válido
 */
function validateEVSEForSession(evse, session) {
  if (!evse) {
    logger.error('❌ EVSE not found for session end notification', {
      session_id: session.id,
      evse_uid: session.evse_uid
    });
    return {
      error: true,
      message: 'EVSE not found'
    };
  }
  return null;
}

/**
 * Obtiene el CDR asociado a la sesión
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object|null>} CDR o null
 */
async function getCDRForSession(sessionId) {
  return await CDR.findOne({
    where: { session_id: sessionId }
  });
}

/**
 * Construye los headers para la petición PUT de fin de sesión
 * @param {Object} emspCredentials - Credenciales del EMSP
 * @returns {Object} Headers de la petición
 */
function buildSessionEndHeaders(emspCredentials) {
  return {
    'Authorization': `Token ${emspCredentials.token}`,
    'Content-Type': 'application/json',
    'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
  };
}

/**
 * Envía la petición PUT de fin de sesión al EMSP
 * @param {string} emspUrl - URL del EMSP
 * @param {Object} payload - Payload de la petición
 * @param {Object} headers - Headers de la petición
 * @returns {Promise<Object>} Respuesta de la petición
 */
async function sendSessionEndRequest(emspUrl, payload, headers) {
  return await axios.put(emspUrl, payload, {
    headers,
    timeout: 10000
  });
}

/**
 * Logs el éxito de la notificación de fin de sesión
 * @param {string} emspUrl - URL del EMSP
 * @param {Object} session - Sesión
 * @param {number} statusCode - Código de estado HTTP
 */
function logSessionEndSuccess(emspUrl, session, statusCode) {
  logger.info('✅ Session end notification sent successfully', {
    emsp_url: emspUrl,
    session_id: session.id,
    evse_uid: session.evse_uid,
    status_code: statusCode
  });
}

/**
 * Logs el error de la notificación de fin de sesión
 * @param {Object} session - Sesión
 * @param {Error} error - Error ocurrido
 */
function logSessionEndError(session, error) {
  logger.error('❌ Failed to notify EMSP about session end', {
    session_id: session.id,
    evse_uid: session.evse_uid,
    error: error.message,
    status_code: error.response?.status
  });
}

module.exports = {
    getEMSPCredentials,
    validateEMSPCredentials,
    getEVSEForSession,
    validateEVSEForSession,
    getCDRForSession,
    buildSessionEndHeaders,
    sendSessionEndRequest,
    logSessionEndSuccess,
    logSessionEndError
};

