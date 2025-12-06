const logger = require('../../../utils/logger');

const { createSession, createCDRForSession, updateEVSEToCharging } = require('./sessionHelpers');

/**
 * Procesa la creación de sesión, CDR y actualización de EVSE
 */
async function processSessionCreation(token, evse_uid, evse) {
  const sessionId = await createSession(token, evse_uid, evse);

  const { activateChargingNotificationService } = require('../../../server');
  await activateChargingNotificationService();

  const cdrId = await createCDRForSession(token, sessionId, evse_uid, evse);

  await updateEVSEToCharging(evse_uid);

  logger.info('✅ START_SESSION: Session and CDR created, EVSE status updated', {
    session_id: sessionId,
    cdr_id: cdrId,
    evse_uid,
    new_status: 'CHARGING',
    token_country_code: token.country_code,
    token_party_id: token.party_id,
    token_uid: token.uid
  });

  return sessionId;
}

module.exports = {
    processSessionCreation
};

