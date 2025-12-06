const { logJobExecution, logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

const { getConnectedOperators, getAvailableEvsesFromDatabase } = require('./dataRetrieval');
const {
  validateOperatorsAvailable,
  selectRandomOperator,
  validateSelectedOperator,
  validateEVSEsAvailable,
  selectRandomEVSE,
  executeSessionTests,
  buildSuccessMessage
} = require('./testExecutionHelpers');

/**
 * Valida y selecciona un operador para la prueba
 */
async function selectOperatorForTest() {
  const operators = await getConnectedOperators();
  logger.info(`🔍 Found ${operators.length} connected operators:`, operators.map(op => `${op.party_id} (${op.country_code})`));

  const operatorsError = validateOperatorsAvailable(operators);
  if (operatorsError) return null;

  const operator = selectRandomOperator(operators);
  const operatorError = validateSelectedOperator(operator);
  if (operatorError) return null;

  logger.info(`🎯 Testing with operator: ${operator.party_id} (${operator.country_code})`);
  return operator;
}

/**
 * Valida y selecciona un EVSE para la prueba
 */
async function selectEVSEForTest() {
  const availableEvses = await getAvailableEvsesFromDatabase();
  const evsesError = validateEVSEsAvailable(availableEvses);
  if (evsesError) return null;

  const evse = selectRandomEVSE(availableEvses);
  logger.info(`🔌 Selected EVSE: ${evse.uid} (${evse.status})`);
  return evse;
}

/**
 * Ejecuta una prueba de sesión completa
 */
async function runSessionTest(service) {
  try {
    logger.info('🧪 Starting session test...');

    const operator = await selectOperatorForTest();
    if (!operator) return;

    const evse = await selectEVSEForTest();
    if (!evse) return;

    await executeSessionTests(operator, evse, service);

    const message = buildSuccessMessage(operator);
    logger.info(`✅ ${message}`);
    logJobExecution('Test Session Service', message);
  } catch (error) {
    logger.error('❌ Error in session test:', error);
    logJobError('Test Session Service', `Error in session test: ${error.message}`, 'error');
  }
}

module.exports = {
    runSessionTest
};
