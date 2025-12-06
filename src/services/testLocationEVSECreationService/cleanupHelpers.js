const { Location, EVSE } = require('../../models');
const logger = require('../../utils/logger');

const {
  buildEVSEDeletionEndpoint,
  buildLocationDeletionEndpoint,
  buildNotificationHeaders,
  buildEVSEDeletionPayload,
  buildLocationDeletionPayload,
  sendDeletionRequest,
  buildSuccessResponse,
  buildErrorResponse,
  findEVSEForDeletion,
  findLocationForDeletion
} = require('./notificationHelpers');
const { getConnectedOrganizations } = require('./organizationHelpers');

/**
 * Envía notificación de eliminación de EVSE a una organización
 * @param {Object} organization - Datos de la organización
 * @param {string} evseId - ID del EVSE
 * @returns {Promise<Object>} Resultado de la notificación
 */
async function sendEVSEDeletionNotification(organization, evseId) {
  try {
    const evse = await findEVSEForDeletion(evseId);
    if (!evse) {
      logger.warn(`EVSE ${evseId} not found for deletion notification`);
      return buildErrorResponse(404, 'EVSE not found for deletion notification');
    }

    const endpoint = buildEVSEDeletionEndpoint(organization, evseId, evse.location_id);
    logger.info(`📤 Sending EVSE deletion notification to ${organization.party_id} at ${endpoint}`);
    
    const payload = buildEVSEDeletionPayload();
    const headers = buildNotificationHeaders(organization, 'evse-delete');
    const response = await sendDeletionRequest(endpoint, payload, headers);
    
    logger.info(`✅ EVSE deletion notification sent successfully to ${organization.party_id}: ${response.status}`);
    return buildSuccessResponse(response.status, 'EVSE deletion notification accepted');
    
  } catch (error) {
    logger.error(`❌ Failed to send EVSE deletion notification to ${organization.party_id}:`, error.message);
    return buildErrorResponse(error.response?.status, `EVSE deletion notification failed: ${error.message}`);
  }
}

/**
 * Envía notificación de eliminación de location a una organización
 * @param {Object} organization - Datos de la organización
 * @param {string} locationId - ID de la location
 * @returns {Promise<Object>} Resultado de la notificación
 */
async function sendLocationDeletionNotification(organization, locationId) {
  try {
    const location = await findLocationForDeletion(locationId);
    if (!location) {
      logger.warn(`Location ${locationId} not found for deletion notification`);
      return buildErrorResponse(404, 'Location not found for deletion notification');
    }

    const endpoint = buildLocationDeletionEndpoint(organization, locationId);
    logger.info(`📤 Sending location deletion notification to ${organization.party_id} at ${endpoint}`);
    
    const payload = buildLocationDeletionPayload();
    const headers = buildNotificationHeaders(organization, 'location-delete');
    const response = await sendDeletionRequest(endpoint, payload, headers);
    
    logger.info(`✅ Location deletion notification sent successfully to ${organization.party_id}: ${response.status}`);
    return buildSuccessResponse(response.status, 'Location deletion notification accepted');
    
  } catch (error) {
    logger.error(`❌ Failed to send location deletion notification to ${organization.party_id}:`, error.message);
    return buildErrorResponse(error.response?.status, `Location deletion notification failed: ${error.message}`);
  }
}

/**
 * Notifica a las organizaciones sobre la eliminación del EVSE
 * @param {string} evseId - ID del EVSE
 */
async function notifyEVSEDeletion(evseId) {
  try {
    logger.info(`📤 Notifying organizations about EVSE deletion: ${evseId}`);
    
    const organizations = await getConnectedOrganizations();
    
    if (organizations.length === 0) {
      logger.info('📭 No connected organizations found for EVSE deletion notification');
      return;
    }

    // Crear promesas para enviar todas las notificaciones en paralelo
    const notificationPromises = organizations.map(async (org) => {
      try {
        logger.info(`📤 Notifying organization ${org.party_id} about EVSE deletion ${evseId}`);
        
        const response = await sendEVSEDeletionNotification(org, evseId);
        
        if (response.success) {
          logger.info(`✅ Organization ${org.party_id} notified about EVSE deletion`);
        } else {
          logger.warn(`⚠️ Failed to notify organization ${org.party_id} about EVSE deletion`);
        }
        
        return { success: true };
      } catch (error) {
        logger.error(`❌ Error notifying organization ${org.party_id} about EVSE deletion:`, error);
        return { success: false };
      }
    });

    // Ejecutar todas las promesas
    await Promise.allSettled(notificationPromises);
    
  } catch (error) {
    logger.error('❌ Error notifying organizations about EVSE deletion:', error);
  }
}

/**
 * Notifica a las organizaciones sobre la eliminación de la location
 * @param {string} locationId - ID de la location
 */
async function notifyLocationDeletion(locationId) {
  try {
    logger.info(`📤 Notifying organizations about location deletion: ${locationId}`);
    
    const organizations = await getConnectedOrganizations();
    
    if (organizations.length === 0) {
      logger.info('📭 No connected organizations found for location deletion notification');
      return;
    }

    // Crear promesas para enviar todas las notificaciones en paralelo
    const notificationPromises = organizations.map(async (org) => {
      try {
        logger.info(`📤 Notifying organization ${org.party_id} about location deletion ${locationId}`);
        
        const response = await sendLocationDeletionNotification(org, locationId);
        
        if (response.success) {
          logger.info(`✅ Organization ${org.party_id} notified about location deletion`);
        } else {
          logger.warn(`⚠️ Failed to notify organization ${org.party_id} about location deletion`);
        }
        
        return { success: true };
      } catch (error) {
        logger.error(`❌ Error notifying organization ${org.party_id} about location deletion:`, error);
        return { success: false };
      }
    });

    // Ejecutar todas las promesas
    await Promise.allSettled(notificationPromises);
    
  } catch (error) {
    logger.error('❌ Error notifying organizations about location deletion:', error);
  }
}

/**
 * Limpia los datos de prueba creados (hard delete)
 * @param {string} locationId - ID de la location
 * @param {string} evseId - ID del EVSE
 */
async function cleanupTestData(locationId, evseId) {
  try {
    logger.info(`🧹 Cleaning up test data: location ${locationId}, EVSE ${evseId}`);
    
    await notifyEVSEDeletion(evseId);
    await notifyLocationDeletion(locationId);
    
    await EVSE.destroy({
      where: { id: evseId },
      force: true
    });
    
    await Location.destroy({
      where: { id: locationId },
      force: true
    });
    
    logger.info('✅ Test data cleaned up successfully (hard delete)');
    
  } catch (error) {
    logger.error('❌ Error cleaning up test data:', error);
  }
}

module.exports = {
    sendEVSEDeletionNotification,
    sendLocationDeletionNotification,
    notifyEVSEDeletion,
    notifyLocationDeletion,
    cleanupTestData
};

