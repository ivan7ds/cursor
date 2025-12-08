const cdrSendingService = require('../../../services/cdrSendingService');
const logger = require('../../../utils/logger');

const {
  getEVSEAndLocation,
  buildSessionData,
  buildLocationData,
  buildEVSEData
} = require('./cdrHelpers');

/**
 * Procesa y envía el CDR
 */
async function processAndSendCDRData(sessionData, locationData, evseData) {
  const result = await cdrSendingService.processAndSendCDR(sessionData, locationData, evseData);

  if (result.success) {
    logger.info('✅ CDR procesado exitosamente', {
      cdr_id: result.cdr_id,
      // eslint-disable-next-line camelcase -- Campo en snake_case según convención de API
      sent_to: result.sent_to,
      successful: result.successful,
      failed: result.failed
    });
  } else {
    logger.error('❌ Error procesando CDR:', result.error);
  }
}

/**
 * Envía CDR a todos los EMSPs configurados
 * @param {Object} session - Datos de la sesión completada
 */
async function sendCDRToEMSPs(session) {
  try {
    logger.info(`📤 Enviando CDR para sesión ${session.id} a EMSPs externos`);

    const { evse, location } = await getEVSEAndLocation(session);
    if (!evse || !location) {
      return;
    }

    const sessionData = buildSessionData(session);
    const locationData = buildLocationData(location);
    const evseData = buildEVSEData(evse);

    await processAndSendCDRData(sessionData, locationData, evseData);
  } catch (error) {
    logger.error('❌ Error enviando CDR a EMSPs:', error);
  }
}

module.exports = {
    sendCDRToEMSPs
};
