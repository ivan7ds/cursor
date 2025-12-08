const { Session } = require('../models');
const chargingNotificationService = require('../services/chargingNotificationService');
const logger = require('../utils/logger');

/**
 * Inicia el Charging Notification Service solo si hay sesiones activas
 */
async function startChargingNotificationServiceIfNeeded() {
  try {
    const activeSessions = await Session.count({
      where: { status: 'ACTIVE' }
    });

    if (activeSessions > 0) {
      chargingNotificationService.start();
      logger.info(`Charging Notification Service started - ${activeSessions} active sessions found`);
    } else {
      logger.info('Charging Notification Service not started - no active sessions');
    }
  } catch (error) {
    logger.error('Error checking active sessions:', error);
    chargingNotificationService.start();
  }
}

/**
 * Activa el Charging Notification Service cuando se inicia una nueva sesión
 */
async function activateChargingNotificationService() {
  if (!chargingNotificationService.isRunning) {
    chargingNotificationService.start();
    logger.info('Charging Notification Service activated due to new active session');
  }
}

module.exports = {
    startChargingNotificationServiceIfNeeded,
    activateChargingNotificationService
};

