const logger = require('../../../utils/logger');
const { testHistory, updateTestStatistics } = require('../state');

/**
 * Valida los datos de entrada para el resultado de prueba
 * @param {Object} body - Body de la petición
 * @returns {Object|null} Error si es inválido, null si es válido
 */
function validateTestResultInput(body) {
  const { testName, status } = body;
  
  if (!testName || !status) {
    return {
      status: 400,
      json: {
        success: false,
        error: 'Nombre de prueba y estado son requeridos'
      }
    };
  }
  
  return null;
}

/**
 * Crea una entrada de prueba
 * @param {Object} body - Body de la petición
 * @returns {Object} Entrada de prueba creada
 */
function createTestEntry(body) {
  const { testName, status, message, duration } = body;
  
  return {
    id: Date.now(),
    testName,
    status,
    message,
    duration,
    timestamp: new Date().toISOString()
  };
}

/**
 * Agrega la entrada al historial y limita el tamaño
 * @param {Object} testEntry - Entrada de prueba
 */
function addToTestHistory(testEntry) {
  testHistory.unshift(testEntry);
  
  // Limitar el historial a los últimos 1000 registros para evitar uso excesivo de memoria
  if (testHistory.length > 1000) {
    testHistory.splice(1000);
  }
}

/**
 * Construye la respuesta de éxito
 * @param {Object} testEntry - Entrada de prueba
 * @returns {Object} Respuesta de éxito
 */
function buildTestResultSuccessResponse(testEntry) {
  return {
    success: true,
    data: testEntry
  };
}

/**
 * Construye la respuesta de error
 * @param {Error} error - Error ocurrido
 * @returns {Object} Respuesta de error
 */
function buildTestResultErrorResponse(error) {
  logger.error('❌ Error registrando resultado de prueba:', error);
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
    validateTestResultInput,
    createTestEntry,
    addToTestHistory,
    buildTestResultSuccessResponse,
    buildTestResultErrorResponse
};

