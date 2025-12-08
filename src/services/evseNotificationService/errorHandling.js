const logger = require('../../utils/logger');

/**
 * Maneja errores de notificación
 */
async function handleNotificationError(emsp, evseChange, error) {
  logger.warn(`Notification failed for eMSP ${emsp.party_id}, EVSE ${evseChange.evse_id} (UID: ${evseChange.evse_uid}): ${error.message}`);
}

module.exports = {
    handleNotificationError
};

