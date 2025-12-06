const axios = require('axios');

const logger = require('../../../utils/logger');

const {
  validateSessionAndEVSE,
  getEMSPCredentialsForSession,
  buildSessionNotificationUrl,
  buildSessionPayload,
  buildSessionHeaders,
  logSessionNotificationSuccess,
  logSessionNotificationError
} = require('./sessionStartHelpers');

/**
 * Envía la notificación PUT al EMSP
 */
async function sendSessionNotification(emspUrl, payload, headers) {
  return axios.put(emspUrl, payload, {
    headers,
    timeout: 10000
  });
}

/**
 * Notifica al EMSP sobre una nueva sesión iniciada
 */
async function notifyEMSPAboutSession(sessionId, evseUid, token, locationId) {
  try {
    const { session, evse } = await validateSessionAndEVSE(sessionId, evseUid);
    if (!session || !evse) return;

    const emspCredentials = await getEMSPCredentialsForSession(token);
    if (!emspCredentials) return;

    const emspUrl = buildSessionNotificationUrl(emspCredentials, sessionId);
    const payload = buildSessionPayload({ session, sessionId, locationId, evseUid, token });
    const headers = buildSessionHeaders(emspCredentials);

    logger.info('📤 Sending PUT to EMSP about new session', {
      emsp_url: emspUrl,
      session_id: sessionId,
      evse_uid: evseUid,
      payload
    });

    const response = await sendSessionNotification(emspUrl, payload, headers);
    logSessionNotificationSuccess(emspUrl, sessionId, evseUid, response);
  } catch (error) {
    logSessionNotificationError(sessionId, evseUid, error);
  }
}

module.exports = {
    notifyEMSPAboutSession
};

