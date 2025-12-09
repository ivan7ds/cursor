const axios = require('axios');

const { EVSE } = require('../../../models');
const EMSPCredentialsHelper = require('../../../utils/emspCredentialsHelper');
const logger = require('../../../utils/logger');
const { buildAuthorizationHeader } = require('../../../utils/tokenEncoding');

/**
 * Valida que el EVSE existe
 */
async function validateEVSEForNotification(evseUid) {
  const evse = await EVSE.findByPk(evseUid);
  if (!evse) {
    logger.error('❌ EVSE not found for status change notification', { evseUid });
    return null;
  }
  return evse;
}

/**
 * Valida que hay credenciales EMSP disponibles
 */
async function validateEMSPCredentials() {
  const emspCredentialsList = await EMSPCredentialsHelper.getAllValidCredentials();

  if (!emspCredentialsList || emspCredentialsList.length === 0) {
    logger.error('❌ No valid EMSP credentials found for EVSE status notification');
    return null;
  }

  return emspCredentialsList;
}

/**
 * Construye la URL del endpoint EMSP para notificación de cambio de estado
 */
function buildEVSEStatusNotificationUrl(emspCredentials, evse) {
  const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  return `${baseUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${evse.location_id}/${evse.id}`;
}

/**
 * Construye el payload de notificación de cambio de estado
 */
function buildEVSEStatusPayload(newStatus) {
  return {
    status: newStatus,
    last_updated: new Date().toISOString()
  };
}

/**
 * Construye los headers para la notificación
 */
function buildEVSEStatusHeaders(emspCredentials) {
  // Construir el header Authorization con codificación Base64 si es necesario
  const requiresBase64 = emspCredentials.token_base64_encoded === true || emspCredentials.token_base64_encoded === 'true';
  const authHeader = buildAuthorizationHeader(emspCredentials.token, requiresBase64);
  
  logger.info(`🔐 Usando token ${requiresBase64 ? 'codificado en Base64' : 'sin codificar'} para organización ${emspCredentials.party_id}`);
  
  return {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
    'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
  };
}

/**
 * Envía la notificación PATCH al EMSP
 */
async function sendEVSEStatusNotification(emspUrl, payload, headers) {
  return axios.patch(emspUrl, payload, {
    headers,
    timeout: 10000
  });
}

/**
 * Registra el éxito de la notificación
 * @param {Object} params - Parámetros de log
 * @param {string} params.emspUrl - URL del EMSP
 * @param {Object} params.emspCredentials - Credenciales del EMSP
 * @param {string} params.evseUid - UID del EVSE
 * @param {string} params.newStatus - Nuevo estado
 * @param {Object} params.response - Respuesta HTTP
 */
function logEVSEStatusSuccess({ emspUrl, emspCredentials, evseUid, newStatus, response }) {
  logger.info('✅ EVSE status change notification sent successfully', {
    emsp_url: emspUrl,
    emsp_party_id: emspCredentials.party_id,
    evse_uid: evseUid,
    new_status: newStatus,
    status_code: response.status
  });
}

/**
 * Registra el error de la notificación
 */
function logEVSEStatusError(emspCredentials, evseUid, newStatus, error) {
  logger.error('❌ Failed to notify specific EMSP about EVSE status change', {
    emsp_party_id: emspCredentials.party_id,
    evse_uid: evseUid,
    new_status: newStatus,
    error: error.message,
    status_code: error.response?.status
  });
}

module.exports = {
    validateEVSEForNotification,
    validateEMSPCredentials,
    buildEVSEStatusNotificationUrl,
    buildEVSEStatusPayload,
    buildEVSEStatusHeaders,
    sendEVSEStatusNotification,
    logEVSEStatusSuccess,
    logEVSEStatusError
};

