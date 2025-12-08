const logger = require('../../utils/logger');

const { processNotifications } = require('./notificationProcessing');

/**
 * Inicia el servicio de notificaciones automáticas
 */
function start(service) {
  if (service.isRunning) {
    logger.warn('EVSE Notification Service already running');
    return;
  }

  logger.info(`Starting EVSE Notification Service with interval: ${service.intervalMs}ms`);
  service.isRunning = true;

  service.notificationInterval = setInterval(async () => {
    try {
      await processNotifications(service);
    } catch (error) {
      logger.error('Error in EVSE notification loop:', error);
    }
  }, service.intervalMs);
}

/**
 * Detiene el servicio de notificaciones
 */
function stop(service) {
  if (!service.isRunning) {
    logger.warn('EVSE Notification Service not running');
    return;
  }

  logger.info('Stopping EVSE Notification Service');
  service.isRunning = false;

  if (service.notificationInterval) {
    clearInterval(service.notificationInterval);
    service.notificationInterval = null;
  }
}

/**
 * Obtiene el estado del servicio
 */
function getStatus(service) {
  return {
    isRunning: service.isRunning,
    intervalMs: service.intervalMs,
    nextNotification: service.isRunning ? new Date(Date.now() + service.intervalMs) : null
  };
}

module.exports = {
    start,
    stop,
    getStatus
};

