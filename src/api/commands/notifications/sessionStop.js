const axios = require('axios');

const logger = require('../../../utils/logger');

const {
  getEMSPCredentialsForSessionStop,
  buildSessionStopNotificationUrl,
  getCDRForSession,
  buildSessionStopPayload,
  buildSessionStopHeaders,
  logSessionStopSuccess,
  logSessionStopError
} = require('./sessionStopHelpers');

/**
 * Envía la notificación PUT al EMSP
 */
async function sendSessionStopNotification(emspUrl, payload, headers) {
  return axios.put(emspUrl, payload, {
    headers,
    timeout: 10000
  });
}

/**
 * Notifica al EMSP sobre la sesión finalizada
 */
async function notifyEMSPAboutSessionStop(session, evse) {
  try {
    const emspCredentials = await getEMSPCredentialsForSessionStop(session);
    if (!emspCredentials) return;

    const emspUrl = buildSessionStopNotificationUrl(emspCredentials, session.id);
    const cdr = await getCDRForSession(session.id);
    const payload = buildSessionStopPayload(session, evse, cdr);
    const headers = buildSessionStopHeaders(emspCredentials);

    logger.info('📤 Sending PUT to EMSP about session stop', {
      emsp_url: emspUrl,
      session_id: session.id,
      evse_uid: session.evse_uid,
      payload
    });

    const response = await sendSessionStopNotification(emspUrl, payload, headers);
    logSessionStopSuccess(emspUrl, session.id, session.evse_uid, response);
  } catch (error) {
    logSessionStopError(session.id, session.evse_uid, error);
  }
}

module.exports = {
    notifyEMSPAboutSessionStop
};
