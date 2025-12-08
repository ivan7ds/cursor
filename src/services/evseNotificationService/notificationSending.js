const { logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

const { sendEVSEStatusUpdate } = require('./statusUpdate');

/**
 * Notifica a un eMSP específico sobre cambios de estado
 */
async function notifyEMSP(emsp, evseChanges, service) {
  try {
    logger.info(`Notifying eMSP ${emsp.party_id} (${emsp.country_code}) about ${evseChanges.length} EVSE changes`);

    /* eslint-disable no-await-in-loop -- Necesario notificar secuencialmente para evitar sobrecarga */
    for (const change of evseChanges) {
      await sendEVSEStatusUpdate(emsp, change, service);
    }
    /* eslint-enable no-await-in-loop -- Fin de notificación secuencial */
  } catch (error) {
    logger.error(`Error notifying eMSP ${emsp.party_id}:`, error);
    logJobError('EVSE Notification Service', `Error notifying eMSP ${emsp.party_id}: ${error.message}`, 'error');
  }
}

module.exports = {
    notifyEMSP
};
