const { EVSE } = require('../../models');
const emspNotificationService = require('../../services/emspNotificationService');
const logger = require('../../utils/logger');

/**
 * Detecta cambios en conectores entre dos estados
 * @param {Array} previousConnectors - Conectores anteriores
 * @param {Array} currentConnectors - Conectores actuales
 * @returns {Array} Array de cambios detectados
 */
function detectConnectorChanges(previousConnectors, currentConnectors) {
  const changes = [];
  
  for (const currentConnector of currentConnectors) {
    const previousConnector = previousConnectors.find(c => c.id === currentConnector.id);
    
    if (!previousConnector || JSON.stringify(previousConnector) !== JSON.stringify(currentConnector)) {
      changes.push(currentConnector);
    }
  }
  
  return changes;
}

/**
 * Envía notificaciones para conectores modificados
 * @param {Object} updatedEvse - EVSE actualizado
 * @param {Array} connectorChanges - Cambios en conectores
 * @returns {Promise<void>}
 */
async function notifyConnectorChanges(updatedEvse, connectorChanges) {
  logger.info(`📤 Enviando notificaciones para ${connectorChanges.length} conector(es) modificado(s)`);
  
  // Crear promesas para enviar todas las notificaciones en paralelo
  const notificationPromises = connectorChanges.map(async (connectorChange) => {
    try {
      await emspNotificationService.notifyConnectorUpdated(updatedEvse, connectorChange);
      logger.info(`✅ Notificación enviada para conector ${connectorChange.id}`);
      return { success: true };
    } catch (error) {
      logger.error(`❌ Error notificando cambios del conector ${connectorChange.id}:`, error);
      return { success: false };
    }
  });

  // Ejecutar todas las promesas
  await Promise.allSettled(notificationPromises);
}

/**
 * Envía notificación estándar del EVSE
 * @param {Object} updatedEvse - EVSE actualizado
 * @param {string} evseId - ID del EVSE
 * @returns {Promise<void>}
 */
async function notifyEVSEUpdate(updatedEvse, evseId) {
  logger.info(`📡 No hay cambios en conectores, enviando notificación estándar del EVSE`);
  
  try {
    await emspNotificationService.notifyEVSEUpdated(updatedEvse);
    logger.info(`✅ Notificación de EVSE actualizado completada: ${evseId}`);
  } catch (error) {
    logger.error(`❌ Error notificando a EMSPs sobre actualización de EVSE ${evseId}:`, error);
  }
}

/**
 * Busca un EVSE por ID
 * @param {string} id - ID del EVSE
 * @returns {Promise<Object|null>} EVSE encontrado o null
 */
async function findEVSEById(id) {
  return await EVSE.findOne({
    where: { 
      id,
      deleted_at: null 
    }
  });
}

/**
 * Actualiza un EVSE con nuevos datos
 * @param {Object} evse - EVSE a actualizar
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
async function updateEVSE(evse, updateData) {
  await evse.update({
    ...updateData,
    last_updated: new Date()
  });
}

module.exports = {
    detectConnectorChanges,
    notifyConnectorChanges,
    notifyEVSEUpdate,
    findEVSEById,
    updateEVSE
};

