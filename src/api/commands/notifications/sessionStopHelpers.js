const { CDR } = require('../../../models');
const EMSPCredentialsHelper = require('../../../utils/emspCredentialsHelper');
const logger = require('../../../utils/logger');

/**
 * Obtiene las credenciales del EMSP basándose en la sesión
 */
async function getEMSPCredentialsForSessionStop(session) {
  const emspCredentials = await EMSPCredentialsHelper.getCredentialsBySession(session);

  if (!emspCredentials) {
    logger.error('❌ EMSP credentials not found for session stop notification', {
      session_party_id: session.party_id,
      session_country_code: session.country_code
    });
    return null;
  }

  return emspCredentials;
}

/**
 * Construye la URL del endpoint EMSP para notificación de sesión detenida
 */
function buildSessionStopNotificationUrl(emspCredentials, sessionId) {
  const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  return `${baseUrl}/ocpi/emsp/2.2/sessions/${countryCode}/${partyId}/${sessionId}`;
}

/**
 * Obtiene el CDR asociado a la sesión
 */
async function getCDRForSession(sessionId) {
  return CDR.findOne({
    where: { session_id: sessionId }
  });
}

/**
 * Construye el payload de notificación de sesión detenida
 */
function buildSessionStopPayload(session, evse, cdr) {
  return {
    country_code: session.country_code,
    party_id: session.party_id,
    id: session.id,
    start_date_time: session.start_datetime.toISOString(),
    end_date_time: session.end_datetime.toISOString(),
    location_id: evse.location_id,
    evse_uid: session.evse_uid,
    connector_id: session.connector_id,
    cdr_token: cdr ? {
      country_code: cdr.country_code,
      party_id: cdr.party_id,
      uid: cdr.id_token,
      type: 'OTHER',
      contract_id: 'ES-EFI-CE2A21CBB-4'
    } : null,
    auth_method: 'WHITELIST',
    currency: 'EUR',
    status: session.status,
    kwh: session.kwh || 0,
    last_updated: session.last_updated.toISOString()
  };
}

/**
 * Construye los headers para la notificación
 */
function buildSessionStopHeaders(emspCredentials) {
  return {
    'Authorization': `Token ${emspCredentials.token}`,
    'Content-Type': 'application/json',
    'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
  };
}

/**
 * Registra el éxito de la notificación
 */
function logSessionStopSuccess(emspUrl, sessionId, evseUid, response) {
  logger.info('✅ Session stop notification sent successfully', {
    emsp_url: emspUrl,
    session_id: sessionId,
    evse_uid: evseUid,
    status_code: response.status
  });
}

/**
 * Registra el error de la notificación
 */
function logSessionStopError(sessionId, evseUid, error) {
  logger.error('❌ Failed to notify EMSP about session stop', {
    session_id: sessionId,
    evse_uid: evseUid,
    error: error.message,
    status_code: error.response?.status
  });
}

module.exports = {
    getEMSPCredentialsForSessionStop,
    buildSessionStopNotificationUrl,
    getCDRForSession,
    buildSessionStopPayload,
    buildSessionStopHeaders,
    logSessionStopSuccess,
    logSessionStopError
};

