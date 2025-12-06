const axios = require('axios');

const logger = require('../../../utils/logger');

const {
  findEMSPCredentials,
  buildCommandResultPayload,
  buildNotificationHeaders,
  logNotificationSuccess,
  logNotificationError
} = require('./commandResultHelpers');

/**
 * Envía la notificación HTTP al EMSP
 */
async function sendNotificationRequest(responseUrl, payload, headers) {
  return axios.post(responseUrl, payload, {
    headers,
    timeout: 10000
  });
}

/**
 * Envía notificación al response_url con el resultado del comando
 * @param {string} responseUrl - URL donde notificar el resultado
 * @param {string} result - Resultado del comando (ACCEPTED, REJECTED, etc.)
 * @param {string} message - Mensaje descriptivo del resultado
 * @param {string} tokenUid - UID del token utilizado
 */
async function notifyCommandResult(responseUrl, result, _message, tokenUid) {
  try {
    const emspCredentials = await findEMSPCredentials(responseUrl);
    if (!emspCredentials) {
      return {
        success: false,
        error: 'EMSP credentials not found',
        status: null
      };
    }

    const payload = buildCommandResultPayload(result);

    logger.info('📤 Sending command result notification', {
      response_url: responseUrl,
      result,
      token_uid: tokenUid,
      emsp_party_id: emspCredentials.party_id,
      emsp_country_code: emspCredentials.country_code,
      payload
    });

    const headers = buildNotificationHeaders(emspCredentials);
    const response = await sendNotificationRequest(responseUrl, payload, headers);

    logNotificationSuccess(responseUrl, result, response, emspCredentials);

    return { success: true, status: response.status };
  } catch (error) {
    logNotificationError(responseUrl, result, error);

    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
}

module.exports = {
    notifyCommandResult
};

