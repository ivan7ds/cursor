const axios = require('axios');

const { EVSE } = require('../../models');
const EMSPCredentialsHelper = require('../../utils/emspCredentialsHelper');
const logger = require('../../utils/logger');
const { buildAuthorizationHeader } = require('../../utils/tokenEncoding');

/**
 * Construye la URL del endpoint EMSP para notificar cambio de estado de EVSE
 * @param {Object} emspCredentials - Credenciales del EMSP
 * @param {string} locationId - ID de la location
 * @param {string} evseUid - UID del EVSE
 * @returns {string} URL del endpoint
 */
function buildEVSEStatusUrl(emspCredentials, locationId, evseUid) {
  const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  return `${baseUrl}/ocpi/emsp/2.2/locations/${countryCode}/${partyId}/${locationId}/${evseUid}`;
}

/**
 * Envía notificación PATCH de cambio de estado de EVSE a un EMSP
 * @param {Object} emspCredentials - Credenciales del EMSP
 * @param {string} evseUid - UID del EVSE
 * @param {string} newStatus - Nuevo estado
 * @param {string} locationId - ID de la location
 */
async function sendEVSEStatusNotification(emspCredentials, evseUid, newStatus, locationId) {
  const emspUrl = buildEVSEStatusUrl(emspCredentials, locationId, evseUid);
  const payload = {
    status: newStatus,
    last_updated: new Date().toISOString()
  };

  logger.info('📤 Sending PATCH to EMSP about EVSE status change (session end)', {
    emsp_url: emspUrl,
    emsp_party_id: emspCredentials.party_id,
    evse_uid: evseUid,
    new_status: newStatus,
    payload
  });

  const response = await axios.patch(emspUrl, payload, {
    headers: {
      'Authorization': buildAuthorizationHeader(emspCredentials.token, emspCredentials.token_base64_encoded || false),
      'Content-Type': 'application/json',
      'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
    },
    timeout: 10000
  });

  logger.info('✅ EVSE status change notification sent successfully (session end)', {
    emsp_url: emspUrl,
    emsp_party_id: emspCredentials.party_id,
    evse_uid: evseUid,
    new_status: newStatus,
    status_code: response.status
  });
}

/**
 * Notifica al EMSP sobre el cambio de estado del EVSE
 * @param {string} evseUid - UID del EVSE
 * @param {string} newStatus - Nuevo estado
 */
async function notifyEMSPAboutEVSEStatusChange(evseUid, newStatus) {
  try {
    const evse = await EVSE.findByPk(evseUid);

    if (!evse) {
      logger.error('❌ EVSE not found for status change notification', { evseUid });
      return;
    }

    const emspCredentialsList = await EMSPCredentialsHelper.getAllValidCredentials();

    if (!emspCredentialsList || emspCredentialsList.length === 0) {
      logger.error('❌ No valid EMSP credentials found for EVSE status notification');
      return;
    }

    // Crear promesas para enviar todas las notificaciones en paralelo
    const notificationPromises = emspCredentialsList.map(async (emspCredentials) => {
      try {
        await sendEVSEStatusNotification(emspCredentials, evseUid, newStatus, evse.location_id);
        return { success: true };
      } catch (emspError) {
        logger.error('❌ Failed to notify specific EMSP about EVSE status change (session end)', {
          emsp_party_id: emspCredentials.party_id,
          evse_uid: evseUid,
          new_status: newStatus,
          error: emspError.message,
          status_code: emspError.response?.status
        });
        return { success: false };
      }
    });

    // Ejecutar todas las promesas
    await Promise.allSettled(notificationPromises);

  } catch (error) {
    logger.error('❌ Failed to notify EMSP about EVSE status change (session end)', {
      evse_uid: evseUid,
      new_status: newStatus,
      error: error.message,
      status_code: error.response?.status
    });
  }
}

/**
 * Construye el payload para notificar fin de sesión al EMSP
 * @param {Object} session - Sesión finalizada
 * @param {Object} evse - EVSE asociado
 * @param {Object} cdr - CDR asociado
 * @returns {Object} Payload para la notificación
 */
function buildSessionEndPayload(session, evse, cdr) {
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
      type: "OTHER",
      contract_id: "ES-EFI-CE2A21CBB-4"
    } : null,
    auth_method: "WHITELIST",
    currency: "EUR",
    status: session.status,
    kwh: session.kwh || 0,
    last_updated: session.last_updated.toISOString()
  };
}

/**
 * Construye la URL del endpoint EMSP para notificar fin de sesión
 * @param {Object} emspCredentials - Credenciales del EMSP
 * @param {string} sessionId - ID de la sesión
 * @returns {string} URL del endpoint
 */
function buildSessionEndUrl(emspCredentials, sessionId) {
  const baseUrl = emspCredentials.url.replace('/ocpi/versions', '');
  const partyId = process.env.OCPI_PARTY_ID || 'IPD';
  const countryCode = process.env.OCPI_COUNTRY_CODE || 'ES';
  return `${baseUrl}/ocpi/emsp/2.2/sessions/${countryCode}/${partyId}/${sessionId}`;
}

/**
 * Notifica al EMSP sobre el final de la sesión
 * @param {Object} session - Sesión finalizada
 */
const {
  getEMSPCredentials,
  validateEMSPCredentials,
  getEVSEForSession,
  validateEVSEForSession,
  getCDRForSession,
  buildSessionEndHeaders,
  sendSessionEndRequest,
  logSessionEndSuccess,
  logSessionEndError
} = require('./sessionEndHelpers');

async function notifyEMSPAboutSessionEnd(session) {
  try {
    const emspCredentials = await getEMSPCredentials(session);
    const credentialsError = validateEMSPCredentials(emspCredentials, session);
    if (credentialsError) return;

    const evse = await getEVSEForSession(session.evse_uid);
    const evseError = validateEVSEForSession(evse, session);
    if (evseError) return;

    const cdr = await getCDRForSession(session.id);
    const emspUrl = buildSessionEndUrl(emspCredentials, session.id);
    const payload = buildSessionEndPayload(session, evse, cdr);

    logger.info('📤 Sending PUT to EMSP about session end', {
      emsp_url: emspUrl,
      session_id: session.id,
      evse_uid: session.evse_uid,
      payload
    });

    const headers = buildSessionEndHeaders(emspCredentials);
    const response = await sendSessionEndRequest(emspUrl, payload, headers);
    logSessionEndSuccess(emspUrl, session, response.status);

  } catch (error) {
    logSessionEndError(session, error);
  }
}

/**
 * Prepara los datos necesarios para enviar un CDR
 * @param {Object} session - Sesión finalizada
 * @param {Object} evse - EVSE asociado
 * @param {Object} location - Location asociada
 * @returns {Object} Objeto con sessionData, locationData y evseData
 */
function prepareCDRData(session, evse, location) {
  const sessionData = {
    id: session.id,
    start_date_time: session.start_datetime,
    end_date_time: session.end_datetime,
    kwh: session.kwh || 0.0,
    currency: 'EUR',
    total_cost: session.total_cost || 0.0,
    auth_id: {
      uid: session.auth_id || session.id,
      type: 'OTHER',
      contract_id: 'IPD-001'
    },
    auth_method: 'AUTH_REQUEST',
    connector_id: session.connector_id || '1',
    charging_periods: session.charging_periods || []
  };

  const locationData = {
    id: location.id,
    name: location.name,
    address: location.address,
    city: location.city,
    postal_code: location.postal_code,
    country: location.country,
    coordinates: location.coordinates
  };

  const evseData = {
    uid: evse.id,
    evse_id: evse.evse_id,
    connectors: evse.connectors || []
  };

  return { sessionData, locationData, evseData };
}

/**
 * Envía CDR a todos los EMSPs configurados
 * @param {Object} session - Datos de la sesión completada
 */
async function sendCDRToEMSPs(session) {
  try {
    logger.info(`📤 Enviando CDR para sesión ${session.id} a EMSPs externos`);

    const evse = await EVSE.findByPk(session.evse_uid);
    if (!evse) {
      logger.warn(`⚠️ EVSE ${session.evse_uid} no encontrado para CDR`);
      return;
    }

    const { Location } = require('../../models');
    const location = await Location.findByPk(evse.location_id);
    if (!location) {
      logger.warn(`⚠️ Location ${evse.location_id} no encontrada para CDR`);
      return;
    }

    const cdrSendingService = require('../../services/cdrSendingService');
    const { sessionData, locationData, evseData } = prepareCDRData(session, evse, location);

    const result = await cdrSendingService.processAndSendCDR(sessionData, locationData, evseData);
    
    if (result.success) {
      logger.info(`✅ CDR procesado exitosamente`, {
        cdr_id: result.cdr_id,
        // eslint-disable-next-line camelcase -- Campo en snake_case según convención de API
        sent_to: result.sent_to,
        successful: result.successful,
        failed: result.failed
      });
    } else {
      logger.error(`❌ Error procesando CDR:`, result.error);
    }

  } catch (error) {
    logger.error('❌ Error enviando CDR a EMSPs:', error);
  }
}

module.exports = {
    notifyEMSPAboutEVSEStatusChange,
    notifyEMSPAboutSessionEnd,
    sendCDRToEMSPs
};

