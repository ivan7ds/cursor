const logger = require('../../../utils/logger');

const {
  validateEVSEForNotification,
  validateEMSPCredentials,
  buildEVSEStatusNotificationUrl,
  buildEVSEStatusPayload,
  buildEVSEStatusHeaders,
  sendEVSEStatusNotification,
  logEVSEStatusSuccess,
  logEVSEStatusError
} = require('./evseStatusHelpers');

/**
 * Notifica a un EMSP específico sobre el cambio de estado del EVSE
 */
async function notifySingleEMSP(emspCredentials, evse, evseUid, newStatus) {
  try {
    const emspUrl = buildEVSEStatusNotificationUrl(emspCredentials, evse);
    const payload = buildEVSEStatusPayload(newStatus);
    const headers = buildEVSEStatusHeaders(emspCredentials);

    logger.info('📤 Sending PATCH to EMSP about EVSE status change', {
      emsp_url: emspUrl,
      emsp_party_id: emspCredentials.party_id,
      evse_uid: evseUid,
      new_status: newStatus,
      payload
    });

    const response = await sendEVSEStatusNotification(emspUrl, payload, headers);
    logEVSEStatusSuccess({ emspUrl, emspCredentials, evseUid, newStatus, response });
  } catch (emspError) {
    logEVSEStatusError(emspCredentials, evseUid, newStatus, emspError);
  }
}

/**
 * Notifica al EMSP sobre el cambio de estado del EVSE
 */
async function notifyEMSPAboutEVSEStatusChange(evseUid, newStatus) {
  try {
    const evse = await validateEVSEForNotification(evseUid);
    if (!evse) return;

    const emspCredentialsList = await validateEMSPCredentials();
    if (!emspCredentialsList) return;

    /* eslint-disable no-await-in-loop -- Necesario notificar secuencialmente para evitar sobrecarga */
    for (const emspCredentials of emspCredentialsList) {
      await notifySingleEMSP(emspCredentials, evse, evseUid, newStatus);
    }
    /* eslint-enable no-await-in-loop -- Fin de notificación secuencial */
  } catch (error) {
    logger.error('❌ Failed to notify EMSP about EVSE status change', {
      evse_uid: evseUid,
      new_status: newStatus,
      error: error.message,
      status_code: error.response?.status
    });
  }
}

module.exports = {
    notifyEMSPAboutEVSEStatusChange
};
