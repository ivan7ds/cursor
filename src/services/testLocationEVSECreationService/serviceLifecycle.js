const { logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

/**
 * Inicia el servicio de prueba de creación de location y EVSE
 * @param {Object} serviceInstance - Instancia del servicio
 */
function startService(serviceInstance) {
  if (serviceInstance.isRunning) {
    logger.warn('⚠️ Test Location EVSE Creation Service is already running');
    return;
  }

  logger.info(`🔄 Starting Test Location EVSE Creation Service with interval: ${serviceInstance.intervalMs}ms`);

  serviceInstance.testInterval = setInterval(async () => {
    try {
      await serviceInstance.runTest();
    } catch (error) {
      logger.error('❌ Error in Test Location EVSE Creation Service:', error);
      logJobError('Test Location EVSE Creation Service', `Error in test service: ${error.message}`, 'error');
    }
  }, serviceInstance.intervalMs);

  serviceInstance.isRunning = true;
  logger.info('✅ Test Location EVSE Creation Service started');
}

/**
 * Detiene el servicio de prueba
 * @param {Object} serviceInstance - Instancia del servicio
 */
function stopService(serviceInstance) {
  if (!serviceInstance.isRunning) {
    logger.warn('⚠️ Test Location EVSE Creation Service is not running');
    return;
  }

  clearInterval(serviceInstance.testInterval);
  serviceInstance.testInterval = null;
  serviceInstance.isRunning = false;
  logger.info('🛑 Test Location EVSE Creation Service stopped');
}

/**
 * Obtiene el estado del servicio
 * @param {Object} serviceInstance - Instancia del servicio
 * @returns {Object} Estado del servicio
 */
function getServiceStatus(serviceInstance) {
  return {
    isRunning: serviceInstance.isRunning,
    intervalMs: serviceInstance.intervalMs,
    nextTest: serviceInstance.isRunning ? new Date(Date.now() + serviceInstance.intervalMs).toISOString() : null,
    testCounter: serviceInstance.testCounter
  };
}

module.exports = {
    startService,
    stopService,
    getServiceStatus
};

