const { Op } = require('sequelize');

const { Credentials } = require('../../../models');
const logger = require('../../../utils/logger');
const { buildAuthorizationHeader } = require('../../../utils/tokenEncoding');
const { getOurCredentials } = require('../../../api/handshake/utils');

/**
 * Busca las credenciales del EMSP basándose en la URL de respuesta
 */
async function findEMSPCredentials(responseUrl) {
  try {
    const hostname = new URL(responseUrl).hostname;
    const emspCredentials = await Credentials.findOne({
      where: {
        url: {
          [Op.like]: `%${hostname}%`
        }
      }
    });

    if (!emspCredentials) {
      logger.error('❌ EMSP credentials not found for response URL', {
        response_url: responseUrl,
        hostname
      });
      return null;
    }

    // Si requiere Base64, usar nuestro token para peticiones salientes
    // El token del operador es para cuando ellos hacen peticiones a nosotros
    if (emspCredentials.token_base64_encoded) {
      const ourCredentials = getOurCredentials();
      return {
        ...emspCredentials.toJSON(),
        token: ourCredentials.token
      };
    }

    return emspCredentials;
  } catch (error) {
    logger.error('❌ Error finding EMSP credentials:', error);
    return null;
  }
}

/**
 * Construye el payload de notificación de resultado de comando
 */
function buildCommandResultPayload(result) {
  return { result };
}

/**
 * Construye los headers para la notificación
 */
function buildNotificationHeaders(emspCredentials) {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'CPO-OCPI-2.2/1.0.0',
    'Authorization': buildAuthorizationHeader(emspCredentials.token, emspCredentials.token_base64_encoded || false)
  };
}

/**
 * Registra el éxito de la notificación
 */
function logNotificationSuccess(responseUrl, result, response, emspCredentials) {
  logger.info('✅ Command result notification sent successfully', {
    response_url: responseUrl,
    result,
    status_code: response.status,
    emsp_party_id: emspCredentials.party_id,
    response_time: response.headers['x-response-time'] || 'N/A'
  });
}

/**
 * Registra el error de la notificación
 */
function logNotificationError(responseUrl, result, error) {
  logger.error('❌ Failed to send command result notification', {
    response_url: responseUrl,
    result,
    error: error.message,
    status_code: error.response?.status,
    response_data: error.response?.data
  });
}

module.exports = {
    findEMSPCredentials,
    buildCommandResultPayload,
    buildNotificationHeaders,
    logNotificationSuccess,
    logNotificationError
};

