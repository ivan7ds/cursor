const logger = require('../../../utils/logger');
const { jobErrors, serviceStatus } = require('../state');

/**
 * Valida los datos de entrada para el error
 * @param {Object} body - Body de la petición
 * @returns {Object|null} Error si es inválido, null si es válido
 */
function validateErrorInput(body) {
  const { service, message } = body;
  
  if (!service || !message) {
    return {
      status: 400,
      json: {
        success: false,
        error: 'Servicio y mensaje son requeridos'
      }
    };
  }
  
  return null;
}

/**
 * Crea una entrada de error
 * @param {Object} body - Body de la petición
 * @returns {Object} Entrada de error creada
 */
function createErrorEntry(body) {
  const { service, message, level = 'error' } = body;
  
  return {
    id: Date.now(),
    service,
    message,
    level,
    timestamp: new Date().toISOString()
  };
}

/**
 * Agrega el error al historial y actualiza contadores
 * @param {Object} errorEntry - Entrada de error
 */
function addErrorToHistory(errorEntry) {
  jobErrors.unshift(errorEntry);

  // Actualizar contador de errores del servicio
  if (errorEntry.service === 'EVSE Notification Service') {
    serviceStatus.evseNotificationService.errorCount++;
  } else if (errorEntry.service === 'Charging Notification Service') {
    serviceStatus.chargingNotificationService.errorCount++;
  }
}

/**
 * Construye la respuesta de éxito
 * @param {Object} errorEntry - Entrada de error
 * @returns {Object} Respuesta de éxito
 */
function buildErrorSuccessResponse(errorEntry) {
  logger.warn(`🚨 Error de job registrado: [${errorEntry.service}] ${errorEntry.message}`);
  
  return {
    success: true,
    data: errorEntry
  };
}

/**
 * Construye la respuesta de error
 * @param {Error} error - Error ocurrido
 * @returns {Object} Respuesta de error
 */
function buildErrorErrorResponse(error) {
  logger.error('❌ Error agregando error de job:', error);
  return {
    status: 500,
    json: {
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    }
  };
}

module.exports = {
    validateErrorInput,
    createErrorEntry,
    addErrorToHistory,
    buildErrorSuccessResponse,
    buildErrorErrorResponse
};

