const axios = require('axios');

const { logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

const { updateEVSEStatusInDatabase } = require('./databaseOperations');
const { handleNotificationError } = require('./errorHandling');
const { buildEMSPEndpointURL } = require('./urlBuilder');

/**
 * Envía una actualización de estado de EVSE a un eMSP
 */
async function sendEVSEStatusUpdate(emsp, evseChange, service) {
  try {
    const emspUrl = buildEMSPEndpointURL(emsp, evseChange, service);

    const payload = {
      status: evseChange.status,
      last_updated: evseChange.last_updated.toISOString()
    };

    logger.info(`Sending PATCH to ${emspUrl} with payload:`, payload);

    const response = await axios.patch(emspUrl, payload, {
      headers: {
        'Authorization': `Token ${emsp.token}`,
        'Content-Type': 'application/json',
        'User-Agent': `${process.env.OCPI_PARTY_ID || 'IPD'}-CPO-OCPI-${process.env.OCPI_VERSION || '2.2'}`
      },
      timeout: 10000
    });

    logger.info(`Successfully notified eMSP ${emsp.party_id} about EVSE ${evseChange.evse_id} (UID: ${evseChange.evse_uid}): ${response.status}`);

    await updateEVSEStatusInDatabase(evseChange.evse_uid, evseChange.status);
  } catch (error) {
    logger.error(`Failed to notify eMSP ${emsp.party_id} about EVSE ${evseChange.evse_id} (UID: ${evseChange.evse_uid}):`, error.message);

    logJobError('EVSE Notification Service', `Failed to notify eMSP ${emsp.party_id} about EVSE ${evseChange.evse_id}: ${error.message}`, 'error');

    await handleNotificationError(emsp, evseChange, error);
  }
}

module.exports = {
    sendEVSEStatusUpdate
};
