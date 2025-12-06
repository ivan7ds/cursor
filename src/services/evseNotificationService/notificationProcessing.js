const { logJobExecution, logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

const { getConnectedEMSPs, getEVSEStatusChanges } = require('./dataRetrieval');
const { notifyEMSP } = require('./notificationSending');

/**
 * Procesa las notificaciones pendientes
 */
async function processNotifications(service) {
  try {
    const emsps = await getConnectedEMSPs();

    if (emsps.length === 0) {
      logger.debug('No connected eMSPs found, skipping notifications');
      logJobExecution('EVSE Notification Service', 'No connected eMSPs found, job completed');
      return;
    }

    const evseChanges = await getEVSEStatusChanges();

    if (evseChanges.length === 0) {
      logger.debug('No EVSE status changes found, skipping notifications');
      logJobExecution('EVSE Notification Service', 'No EVSE status changes found, job completed');
      return;
    }

    logger.info(`Processing ${evseChanges.length} EVSE status changes for ${emsps.length} eMSPs`);

    /* eslint-disable no-await-in-loop -- Necesario notificar secuencialmente para evitar sobrecarga */
    for (const emsp of emsps) {
      await notifyEMSP(emsp, evseChanges, service);
    }
    /* eslint-enable no-await-in-loop -- Fin de notificación secuencial */

    logJobExecution('EVSE Notification Service', `Processed ${evseChanges.length} EVSE changes for ${emsps.length} eMSPs`);
  } catch (error) {
    logger.error('Error processing EVSE notifications:', error);
    logJobError('EVSE Notification Service', `Error processing notifications: ${error.message}`, 'error');
  }
}

module.exports = {
    processNotifications
};
