const logger = require('../../utils/logger');

const {
  detectConnectorChanges,
  notifyConnectorChanges,
  notifyEVSEUpdate
} = require('./evseHelpers');

/**
 * Valida que el EVSE existe
 */
async function validateEVSEExists(evse) {
  if (!evse) {
    return {
      valid: false,
      status: 404,
      response: {
        status_code: 2004,
        status_message: 'EVSE not found',
        timestamp: new Date().toISOString()
      }
    };
  }
  return { valid: true };
}

/**
 * Prepara los datos de actualización del EVSE
 */
function prepareUpdateData(reqBody) {
  return {
    ...reqBody,
    last_updated: new Date()
  };
}

/**
 * Procesa los cambios de conectores y envía notificaciones
 */
async function processConnectorChangesAndNotify(evse, previousConnectors) {
  const connectorChanges = detectConnectorChanges(previousConnectors, evse.connectors || []);

  if (connectorChanges.length > 0) {
    await notifyConnectorChanges(evse, connectorChanges);
  }

  await notifyEVSEUpdate(evse);
}

/**
 * Construye la respuesta exitosa de actualización
 */
function buildUpdateSuccessResponse(evse) {
  return {
    status_code: 1000,
    data: evse,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    validateEVSEExists,
    prepareUpdateData,
    processConnectorChangesAndNotify,
    buildUpdateSuccessResponse
};

