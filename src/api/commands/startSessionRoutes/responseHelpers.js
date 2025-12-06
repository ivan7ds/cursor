const logger = require('../../../utils/logger');
const { notifyCommandResult } = require('../notifications');

/**
 * Construye respuesta de rechazo
 */
function buildRejectionResponse(statusMessage, result = 'REJECTED', timeout = 0) {
  return {
    status_code: 1000,
    status_message: statusMessage,
    data: {
      result,
      timeout
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Construye respuesta de aceptación
 */
function buildAcceptanceResponse(timeout = 300) {
  return {
    status_code: 1000,
    status_message: 'Start accepted',
    data: {
      result: 'ACCEPTED',
      timeout
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Envía respuesta de rechazo y notifica al EMSP
 */
async function sendRejectionAndNotify(response_url, reason, token_uid, res) {
  const response = buildRejectionResponse(`Start rejected: ${reason}`);
  res.status(200).json(response);

  setImmediate(async () => {
    await notifyCommandResult(
      response_url,
      'REJECTED',
      `Remote start rejected: ${reason}`,
      token_uid
    );
  });
}

/**
 * Envía respuesta de aceptación y notifica al EMSP
 */
async function sendAcceptanceAndNotify(context) {
  const { response_url, token, evse_uid, sessionId, location_id, res } = context;
  const response = buildAcceptanceResponse();
  res.status(200).json(response);

  setImmediate(async () => {
    const { notifyCommandResult, notifyEMSPAboutEVSEStatusChange, notifyEMSPAboutSession } = require('../notifications');

    const notificationResult = await notifyCommandResult(
      response_url,
      'ACCEPTED',
      'Remote start executed',
      token.uid
    );

    if (notificationResult.success) {
      logger.info('✅ START_SESSION: Notification sent successfully', {
        response_url,
        notification_status: notificationResult.status
      });
    } else {
      logger.warn('⚠️ START_SESSION: Notification failed but command accepted', {
        response_url,
        notification_error: notificationResult.error
      });
    }

    await notifyEMSPAboutEVSEStatusChange(evse_uid, 'CHARGING');

    await notifyEMSPAboutSession(sessionId, evse_uid, token, location_id);
  });
}

module.exports = {
    buildRejectionResponse,
    buildAcceptanceResponse,
    sendRejectionAndNotify,
    sendAcceptanceAndNotify
};
