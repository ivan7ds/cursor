const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');

/**
 * Notifica a EMSPs sobre la creación de una tarifa
 * @param {Object} tariff - Tarifa creada
 */
async function notifyTariffCreated(tariff) {
  try {
    const emspNotificationService = require('../../services/emspNotificationService');
    await emspNotificationService.notifyTariffCreated(tariff);
    logger.info(`📤 Notificación PUT de tarifa ${tariff.id} enviada a EMSPs`);
  } catch (notificationError) {
    logger.error('❌ Error notificando tarifa a EMSPs:', notificationError);
    // No fallar la creación de la tarifa si falla la notificación
  }
}

/**
 * Obtiene todos los EVSEs de una location
 * @param {string} locationId - ID de la location
 * @returns {Promise<Array>} Array de EVSEs
 */
async function getEVSEsByLocation(locationId) {
  const [evses] = await sequelize.query(`
    SELECT id, connectors FROM evses 
    WHERE location_id = :locationId AND deleted_at IS NULL
  `, {
    replacements: { locationId }
  });
  
  logger.info(`📍 Encontrados ${evses.length} EVSEs en location ${locationId}`);
  return evses;
}

/**
 * Actualiza los conectores de un EVSE agregando una tarifa
 * @param {Object} evse - EVSE a actualizar
 * @param {string} tariffId - ID de la tarifa
 * @returns {Promise<boolean>} True si se actualizó exitosamente
 */
async function updateEVSEWithTariff(evse, tariffId) {
  try {
    const connectors = evse.connectors || [];
    const updatedConnectors = connectors.map(connector => {
      const existingTariffIds = connector.tariff_ids || [];
      const newTariffIds = [...existingTariffIds, tariffId];
      
      return {
        ...connector,
        tariff_ids: newTariffIds,
        last_updated: new Date().toISOString()
      };
    });
    
    await sequelize.query(`
      UPDATE evses 
      SET connectors = :connectors, last_updated = NOW()
      WHERE id = :evseId
    `, {
      replacements: { 
        connectors: JSON.stringify(updatedConnectors),
        evseId: evse.id 
      }
    });
    
    logger.info(`✅ EVSE ${evse.id} actualizado con tarifa ${tariffId}`);
    return true;
  } catch (evseError) {
    logger.error(`❌ Error actualizando EVSE ${evse.id}:`, evseError);
    return false;
  }
}

/**
 * Asocia una tarifa a todos los EVSEs de una location
 * @param {string} tariffId - ID de la tarifa
 * @param {string} locationId - ID de la location
 * @returns {Promise<Array>} Array de IDs de EVSEs actualizados
 */
async function associateTariffToEVSEs(tariffId, locationId) {
  try {
    logger.info(`🔗 Asociando tarifa ${tariffId} a location ${locationId}`);
    
    const evses = await getEVSEsByLocation(locationId);
    const updatedEvses = [];
    
    // Crear promesas para actualizar todos los EVSEs en paralelo
    const updatePromises = evses.map(async (evse) => {
      const success = await updateEVSEWithTariff(evse, tariffId);
      return { success, evseId: evse.id };
    });

    // Ejecutar todas las promesas y filtrar éxitos
    const results = await Promise.allSettled(updatePromises);
    results.forEach((settledResult) => {
      if (settledResult.status === 'fulfilled' && settledResult.value.success) {
        updatedEvses.push(settledResult.value.evseId);
      }
    });
    
    logger.info(`✅ ${updatedEvses.length} EVSEs actualizados con la tarifa ${tariffId}`);
    return updatedEvses;
  } catch (associationError) {
    logger.error('❌ Error asociando tarifa a EVSEs:', associationError);
    return [];
  }
}

/**
 * Notifica a EMSPs sobre la actualización de un EVSE
 * @param {string} evseId - ID del EVSE
 */
async function notifyEVSEUpdated(evseId) {
  try {
    const [evseData] = await sequelize.query(`
      SELECT e.*, l.name as location_name
      FROM evses e
      LEFT JOIN locations l ON e.location_id = l.id
      WHERE e.id = :evseId
    `, {
      replacements: { evseId }
    });
    
    if (evseData && evseData.length > 0) {
      const evse = evseData[0];
      if (evse.connectors && typeof evse.connectors === 'string') {
        try {
          evse.connectors = JSON.parse(evse.connectors);
        } catch (parseError) {
          logger.warn(`⚠️ Error parseando conectores del EVSE ${evseId}:`, parseError);
          evse.connectors = [];
        }
      }
      
      const emspNotificationService = require('../../services/emspNotificationService');
      await emspNotificationService.notifyEVSEUpdated(evse);
      logger.info(`📤 Notificación PATCH enviada para EVSE ${evseId}`);
    }
  } catch (notificationError) {
    logger.error(`❌ Error enviando notificación para EVSE ${evseId}:`, notificationError);
  }
}

/**
 * Notifica a EMSPs sobre la eliminación de una tarifa
 * @param {Object} tariff - Tarifa eliminada
 */
async function notifyTariffDeleted(tariff) {
  try {
    const emspNotificationService = require('../../services/emspNotificationService');
    await emspNotificationService.notifyTariffDeleted(tariff);
    logger.info(`📤 Notificación DELETE de tarifa ${tariff.id} enviada a EMSPs`);
  } catch (notificationError) {
    logger.error('❌ Error notificando eliminación de tarifa a EMSPs:', notificationError);
    // No fallar la eliminación si falla la notificación
  }
}

/**
 * Obtiene todos los EVSEs que tienen una tarifa específica
 * @param {string} tariffId - ID de la tarifa
 * @returns {Promise<Array>} Array de EVSEs
 */
async function getEVSEsWithTariff(tariffId) {
  const [evses] = await sequelize.query(`
    SELECT id, connectors FROM evses 
    WHERE connectors::text LIKE :tariffId AND deleted_at IS NULL
  `, {
    replacements: { tariffId: `%"${tariffId}"%` }
  });
  
  logger.info(`🔗 Desasociando tarifa ${tariffId} de ${evses.length} EVSEs`);
  return evses;
}

/**
 * Actualiza los conectores de un EVSE removiendo una tarifa
 * @param {Object} evse - EVSE a actualizar
 * @param {string} tariffId - ID de la tarifa
 * @returns {Promise<boolean>} True si se actualizó exitosamente
 */
async function removeTariffFromEVSE(evse, tariffId) {
  try {
    const connectors = evse.connectors || [];
    const updatedConnectors = connectors.map(connector => {
      const existingTariffIds = connector.tariff_ids || [];
      const newTariffIds = existingTariffIds.filter(id => id !== tariffId);
      
      return {
        ...connector,
        tariff_ids: newTariffIds,
        last_updated: new Date().toISOString()
      };
    });
    
    await sequelize.query(`
      UPDATE evses 
      SET connectors = :connectors, last_updated = NOW()
      WHERE id = :evseId
    `, {
      replacements: { 
        connectors: JSON.stringify(updatedConnectors),
        evseId: evse.id 
      }
    });
    
    logger.info(`✅ EVSE ${evse.id} desasociado de tarifa ${tariffId}`);
    return true;
  } catch (evseError) {
    logger.error(`❌ Error desasociando EVSE ${evse.id}:`, evseError);
    return false;
  }
}

/**
 * Desasocia una tarifa de todos los EVSEs que la usan
 * @param {string} tariffId - ID de la tarifa
 * @returns {Promise<Array>} Array de IDs de EVSEs actualizados
 */
async function disassociateTariffFromEVSEs(tariffId) {
  try {
    const evses = await getEVSEsWithTariff(tariffId);
    const updatedEvses = [];
    
    // Crear promesas para actualizar todos los EVSEs en paralelo
    const updatePromises = evses.map(async (evse) => {
      const success = await removeTariffFromEVSE(evse, tariffId);
      return { success, evseId: evse.id };
    });

    // Ejecutar todas las promesas y filtrar éxitos
    const results = await Promise.allSettled(updatePromises);
    results.forEach((settledResult) => {
      if (settledResult.status === 'fulfilled' && settledResult.value.success) {
        updatedEvses.push(settledResult.value.evseId);
      }
    });
    
    return updatedEvses;
  } catch (disassociationError) {
    logger.error('❌ Error desasociando tarifa de EVSEs:', disassociationError);
    return [];
  }
}

module.exports = {
    notifyTariffCreated,
    associateTariffToEVSEs,
    notifyEVSEUpdated,
    notifyTariffDeleted,
    disassociateTariffFromEVSEs
};

