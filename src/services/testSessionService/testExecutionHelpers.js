const { logJobExecution, logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

/**
 * Valida que hay operadores conectados disponibles
 * @param {Array} operators - Array de operadores
 * @returns {Object|null} Error si no hay operadores, null si es válido
 */
function validateOperatorsAvailable(operators) {
  if (operators.length === 0) {
    logger.info('📭 No connected operators found for session test');
    logJobExecution('Test Session Service', 'No connected operators found');
    return {
      error: true,
      message: 'No connected operators found'
    };
  }
  return null;
}

/**
 * Selecciona un operador aleatorio de la lista
 * @param {Array} operators - Array de operadores
 * @returns {Object} Operador seleccionado
 */
function selectRandomOperator(operators) {
  return operators[Math.floor(Math.random() * operators.length)];
}

/**
 * Valida que el operador seleccionado es válido
 * @param {Object} operator - Operador seleccionado
 * @returns {Object|null} Error si es inválido, null si es válido
 */
function validateSelectedOperator(operator) {
  if (!operator) {
    logger.error('❌ Selected operator is undefined');
    logJobError('Test Session Service', 'Selected operator is undefined', 'error');
    return {
      error: true,
      message: 'Selected operator is undefined'
    };
  }
  return null;
}

/**
 * Valida que hay EVSEs disponibles
 * @param {Array} availableEvses - Array de EVSEs disponibles
 * @returns {Object|null} Error si no hay EVSEs, null si es válido
 */
function validateEVSEsAvailable(availableEvses) {
  if (availableEvses.length === 0) {
    logger.info('📭 No available EVSEs found in database for session test');
    logJobExecution('Test Session Service', 'No available EVSEs found in database');
    return {
      error: true,
      message: 'No available EVSEs found in database'
    };
  }
  return null;
}

/**
 * Selecciona un EVSE aleatorio de la lista
 * @param {Array} availableEvses - Array de EVSEs disponibles
 * @returns {Object} EVSE seleccionado
 */
function selectRandomEVSE(availableEvses) {
  return availableEvses[Math.floor(Math.random() * availableEvses.length)];
}

/**
 * Ejecuta las pruebas de sesión con tokens válidos e inválidos
 * @param {Object} operator - Operador seleccionado
 * @param {Object} evse - EVSE seleccionado
 * @param {Object} serviceInstance - Instancia del servicio
 * @returns {Promise<void>}
 */
const { testSessionWithValidToken, testSessionWithInvalidToken } = require('./testMethods');

async function executeSessionTests(operator, evse, serviceInstance) {
  await testSessionWithValidToken(operator, evse, serviceInstance);
  await testSessionWithInvalidToken(operator, evse);
}

/**
 * Construye el mensaje de éxito de la prueba
 * @param {Object} operator - Operador utilizado
 * @returns {string} Mensaje de éxito
 */
function buildSuccessMessage(operator) {
  return `Session test completed with operator ${operator.party_id}`;
}

module.exports = {
    validateOperatorsAvailable,
    selectRandomOperator,
    validateSelectedOperator,
    validateEVSEsAvailable,
    selectRandomEVSE,
    executeSessionTests,
    buildSuccessMessage
};

