const { logJobExecution, logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

const { cleanupTestData } = require('./cleanupHelpers');
const { createTestEVSE } = require('./evseCreationHelpers');
const { createTestLocation } = require('./locationCreationHelpers');
const { notifyOrganizations } = require('./organizationNotificationHelpers');
const { validateResponses } = require('./testValidationHelpers');

/**
 * Ejecuta una prueba completa de creación de location y EVSE
 * @param {Object} serviceInstance - Instancia del servicio
 */
async function runTest(serviceInstance) {
  try {
    serviceInstance.testCounter++;
    logger.info(`🧪 Starting test #${serviceInstance.testCounter}: Location and EVSE creation`);

    const locationData = await createTestLocation();
    logger.info(`📍 Test location created: ${locationData.id}`);

    const evseData = await createTestEVSE(locationData.id);
    logger.info(`🔌 Test EVSE created: ${evseData.id}`);

    const notificationResults = await notifyOrganizations(locationData, evseData);
    const validationResult = validateResponses(notificationResults);

    await cleanupTestData(locationData.id, evseData.id);

    const message = `Test #${serviceInstance.testCounter} completed: ${validationResult.success ? 'SUCCESS' : 'FAILED'} - ${validationResult.message}`;
    logger.info(`📊 ${message}`);
    
    if (validationResult.success) {
      logJobExecution('Test Location EVSE Creation Service', message);
    } else {
      logJobError('Test Location EVSE Creation Service', message, 'error');
    }

  } catch (error) {
    logger.error('❌ Error in test execution:', error);
    logJobError('Test Location EVSE Creation Service', `Test execution failed: ${error.message}`, 'error');
  }
}

module.exports = {
    runTest
};

