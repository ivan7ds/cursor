const axios = require('axios');

const { logJobError } = require('../../api/testMonitoring');
const EMSPCredentialsHelper = require('../../utils/emspCredentialsHelper');
const logger = require('../../utils/logger');

/**
 * Construye la URL del endpoint del EMSP para notificaciones de sesión
 * @param {Object} emspCredentials - Credenciales del EMSP
 * @param {string} sessionId - ID de la sesión
 * @returns {string} URL del endpoint
 */
function buildEMSPNotificationUrl(emspCredentials, sessionId) {
  const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  return `${baseUrl}/ocpi/emsp/2.2/sessions/${countryCode}/${partyId}/${sessionId}`;
}

/**
 * Construye el payload para la notificación de actualización de carga
 * @param {Object} session - Sesión actual
 * @param {number} kwh - Kilovatios hora
 * @param {number} totalCost - Costo total
 * @param {string} tariffId - ID de la tarifa
 * @returns {Object} Payload de la notificación
 */
function buildChargingUpdatePayload(session, kwh, totalCost, tariffId) {
  const now = new Date().toISOString();
  return {
    kwh,
    total_cost: totalCost,
    charging_periods: [
      {
        start_date_time: session.start_datetime.toISOString(),
        dimensions: [
          { type: "ENERGY", volume: kwh }
        ],
        tariff_id: tariffId
      }
    ],
    last_updated: now
  };
}

/**
 * Envía la notificación PATCH al EMSP
 * @param {string} emspUrl - URL del endpoint del EMSP
 * @param {Object} payload - Payload de la notificación
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Respuesta del EMSP
 */
async function sendChargingUpdateNotification(emspUrl, payload, token) {
  return await axios.patch(emspUrl, payload, {
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
    },
    timeout: 10000
  });
}

/**
 * Maneja el error al enviar notificación de actualización de carga
 * @param {Object} error - Error ocurrido
 * @param {string} sessionId - ID de la sesión
 */
function handleChargingNotificationError(error, sessionId) {
  logger.error('❌ Failed to notify EMSP about charging update', {
    session_id: sessionId,
    error: error.message,
    status_code: error.response?.status
  });
  logJobError('Charging Notification Service', `Failed to notify EMSP about charging update for session ${sessionId}: ${error.message}`, 'error');
}

module.exports = {
    buildEMSPNotificationUrl,
    buildChargingUpdatePayload,
    sendChargingUpdateNotification,
    handleChargingNotificationError
};

