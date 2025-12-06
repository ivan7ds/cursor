const logger = require('../../utils/logger');

const { sendLocationNotification, sendEVSENotification } = require('./notificationSenders');
const { getConnectedOrganizations } = require('./organizationHelpers');

/**
 * Notifica a las organizaciones sobre la nueva location
 * @param {Array} organizations - Lista de organizaciones
 * @param {Object} locationData - Datos de la location
 * @returns {Promise<Array>} Resultados de las notificaciones
 */
async function notifyLocationToOrganizations(organizations, locationData) {
  const results = [];
  
  // Crear promesas para enviar todas las notificaciones en paralelo
  const notificationPromises = organizations.map(async (org) => {
    try {
      logger.info(`📤 Notifying organization ${org.party_id} about location ${locationData.id}`);
      
      const response = await sendLocationNotification(org, locationData);
      
      return {
        organization: `${org.party_id}_${org.country_code}`,
        type: 'location',
        success: response.success,
        statusCode: response.statusCode,
        message: response.message
      };
    } catch (error) {
      logger.error(`❌ Error notifying organization ${org.party_id} about location:`, error);
      return {
        organization: `${org.party_id}_${org.country_code}`,
        type: 'location',
        success: false,
        statusCode: 0,
        message: error.message
      };
    }
  });

  // Ejecutar todas las promesas y recopilar resultados
  const settledResults = await Promise.allSettled(notificationPromises);
  settledResults.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      results.push(settledResult.value);
    }
  });
  
  return results;
}

/**
 * Notifica a las organizaciones sobre el nuevo EVSE
 * @param {Array} organizations - Lista de organizaciones
 * @param {Object} evseData - Datos del EVSE
 * @returns {Promise<Array>} Resultados de las notificaciones
 */
async function notifyEVSEToOrganizations(organizations, evseData) {
  const results = [];
  
  // Crear promesas para enviar todas las notificaciones en paralelo
  const notificationPromises = organizations.map(async (org) => {
    try {
      logger.info(`📤 Notifying organization ${org.party_id} about EVSE ${evseData.id}`);
      
      const response = await sendEVSENotification(org, evseData);
      
      return {
        organization: `${org.party_id}_${org.country_code}`,
        type: 'evse',
        success: response.success,
        statusCode: response.statusCode,
        message: response.message
      };
    } catch (error) {
      logger.error(`❌ Error notifying organization ${org.party_id} about EVSE:`, error);
      return {
        organization: `${org.party_id}_${org.country_code}`,
        type: 'evse',
        success: false,
        statusCode: 0,
        message: error.message
      };
    }
  });

  // Ejecutar todas las promesas y recopilar resultados
  const settledResults = await Promise.allSettled(notificationPromises);
  settledResults.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      results.push(settledResult.value);
    }
  });
  
  return results;
}

/**
 * Notifica a las organizaciones conectadas sobre la nueva location y EVSE
 * @param {Object} locationData - Datos de la location
 * @param {Object} evseData - Datos del EVSE
 * @returns {Promise<Object>} Resultados de las notificaciones
 */
async function notifyOrganizations(locationData, evseData) {
  try {
    logger.info('📤 Notifying connected organizations about test location and EVSE...');
    
    const organizations = await getConnectedOrganizations();
    
    if (organizations.length === 0) {
      logger.warn('⚠️ No connected organizations found for notification');
      return {
        success: false,
        message: 'No connected organizations found',
        responses: []
      };
    }

    logger.info(`📡 Found ${organizations.length} connected organizations`);

    const locationNotificationResults = await notifyLocationToOrganizations(organizations, locationData);
    const evseNotificationResults = await notifyEVSEToOrganizations(organizations, evseData);

    const allResults = [...locationNotificationResults, ...evseNotificationResults];
    
    logger.info(`📊 Notification results: ${allResults.filter(r => r.success).length}/${allResults.length} successful`);
    
    return {
      success: allResults.length > 0,
      message: `Notified ${organizations.length} organizations`,
      responses: allResults
    };

  } catch (error) {
    logger.error('❌ Error notifying organizations:', error);
    return {
      success: false,
      message: `Notification error: ${error.message}`,
      responses: []
    };
  }
}

module.exports = {
    notifyLocationToOrganizations,
    notifyEVSEToOrganizations,
    notifyOrganizations
};

