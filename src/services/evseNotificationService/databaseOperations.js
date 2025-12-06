const { EVSE } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Actualiza el estado del EVSE en nuestra base de datos
 */
async function updateEVSEStatusInDatabase(evseUid, status) {
  try {
    await EVSE.update(
      {
        status,
        last_updated: new Date()
      },
      {
        where: { id: evseUid }
      }
    );

    logger.info(`Updated EVSE UID ${evseUid} status to ${status} in database`);
  } catch (error) {
    logger.error(`Error updating EVSE UID ${evseUid} status in database:`, error);
  }
}

module.exports = {
    updateEVSEStatusInDatabase
};

