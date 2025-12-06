const { logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

const { runSessionTest } = require('./testRunner');

/**
 * Inicia el servicio de pruebas de sesión
 */
function start(service) {
  if (service.isRunning) {
    logger.warn('⚠️ Test Session Service is already running');
    return;
  }

  logger.info(`🔄 Starting Test Session Service with interval: ${service.intervalMs}ms, duration: ${service.sessionDurationMs}ms`);

  service.sessionInterval = setInterval(async () => {
    try {
      await runSessionTest(service);
    } catch (error) {
      logger.error('❌ Error in test session service:', error);
      logJobError('Test Session Service', `Error in test session service: ${error.message}`, 'error');
    }
  }, service.intervalMs);

  service.isRunning = true;
  logger.info('✅ Test Session Service started');
}

/**
 * Detiene el servicio de pruebas de sesión
 */
function stop(service) {
  if (!service.isRunning) {
    logger.warn('⚠️ Test Session Service is not running');
    return;
  }

  clearInterval(service.sessionInterval);
  service.sessionInterval = null;
  service.isRunning = false;
  logger.info('🛑 Test Session Service stopped');
}

/**
 * Obtiene el estado del servicio
 */
function getStatus(service) {
  return {
    isRunning: service.isRunning,
    intervalMs: service.intervalMs,
    sessionDurationMs: service.sessionDurationMs,
    nextTest: service.isRunning ? new Date(Date.now() + service.intervalMs).toISOString() : null,
    activeSessions: service.activeSessions.size
  };
}

module.exports = {
    start,
    stop,
    getStatus
};

