const { Session, EVSE } = require('../../../models');
const EMSPCredentialsHelper = require('../../../utils/emspCredentialsHelper');
const logger = require('../../../utils/logger');

/**
 * Valida que la sesión y el EVSE existen
 */
async function validateSessionAndEVSE(sessionId, evseUid) {
  const session = await Session.findByPk(sessionId);
  const evse = await EVSE.findByPk(evseUid);

  if (!session || !evse) {
    logger.error('❌ Session or EVSE not found for session notification', {
      sessionId, evseUid
    });
    return { session: null, evse: null };
  }

  return { session, evse };
}

/**
 * Obtiene las credenciales del EMSP basándose en el token
 */
async function getEMSPCredentialsForSession(token) {
  const emspCredentials = await EMSPCredentialsHelper.getCredentialsByToken(token);

  if (!emspCredentials) {
    logger.error('❌ EMSP credentials not found for session notification', {
      token_party_id: token.party_id,
      token_country_code: token.country_code
    });
    return null;
  }

  return emspCredentials;
}

/**
 * Construye la URL del endpoint EMSP para notificación de sesión
 */
function buildSessionNotificationUrl(emspCredentials, sessionId) {
  const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  return `${baseUrl}/ocpi/emsp/2.2/sessions/${countryCode}/${partyId}/${sessionId}`;
}

/**
 * Construye el payload de notificación de sesión
 * @param {Object} params - Parámetros de construcción
 * @param {Object} params.session - Datos de la sesión
 * @param {string} params.sessionId - ID de la sesión
 * @param {string} params.locationId - ID de la location
 * @param {string} params.evseUid - UID del EVSE
 * @param {Object} params.token - Datos del token
 */
function buildSessionPayload({ session, sessionId, locationId, evseUid, token }) {
  return {
    country_code: session.country_code,
    party_id: session.party_id,
    id: sessionId,
    start_date_time: session.start_datetime.toISOString(),
    location_id: locationId,
    evse_uid: evseUid,
    connector_id: session.connector_id,
    cdr_token: {
      country_code: token.country_code,
      party_id: token.party_id,
      uid: token.uid,
      type: token.type,
      contract_id: token.contract_id
    },
    auth_method: 'WHITELIST',
    currency: 'EUR',
    status: session.status,
    kwh: 0.0,
    last_updated: session.last_updated.toISOString()
  };
}

/**
 * Construye los headers para la notificación
 */
function buildSessionHeaders(emspCredentials) {
  return {
    'Authorization': `Token ${emspCredentials.token}`,
    'Content-Type': 'application/json',
    'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
  };
}

/**
 * Registra el éxito de la notificación
 */
function logSessionNotificationSuccess(emspUrl, sessionId, evseUid, response) {
  logger.info('✅ Session notification sent successfully', {
    emsp_url: emspUrl,
    session_id: sessionId,
    evse_uid: evseUid,
    status_code: response.status
  });
}

/**
 * Registra el error de la notificación
 */
function logSessionNotificationError(sessionId, evseUid, error) {
  logger.error('❌ Failed to notify EMSP about new session', {
    session_id: sessionId,
    evse_uid: evseUid,
    error: error.message,
    status_code: error.response?.status
  });
}

module.exports = {
    validateSessionAndEVSE,
    getEMSPCredentialsForSession,
    buildSessionNotificationUrl,
    buildSessionPayload,
    buildSessionHeaders,
    logSessionNotificationSuccess,
    logSessionNotificationError
};

