const chargingNotificationService = require('../../services/chargingNotificationService');
const emspLocationsSyncService = require('../../services/emspLocationsSyncService');
const emspTariffsSyncService = require('../../services/emspTariffsSyncService');
const emspTokensSyncService = require('../../services/emspTokensSyncService');
const evseNotificationService = require('../../services/evseNotificationService');
const testLocationEVSECreationService = require('../../services/testLocationEVSECreationService');
const testSessionService = require('../../services/testSessionService');
const logger = require('../../utils/logger');

/**
 * Detiene un servicio individual si está corriendo
 */
function stopServiceIfRunning(service, serviceName) {
  if (service.isRunning) {
    logger.info(`Stopping ${serviceName}`);
    service.stop();
  }
}

/**
 * Detiene todos los servicios activos
 */
async function stopAllServices() {
  stopServiceIfRunning(evseNotificationService, 'EVSE Notification Service');
  stopServiceIfRunning(chargingNotificationService, 'Charging Notification Service');
  stopServiceIfRunning(emspLocationsSyncService, 'EMSP Locations Sync Service');
  stopServiceIfRunning(emspTariffsSyncService, 'EMSP Tariffs Sync Service');
  stopServiceIfRunning(emspTokensSyncService, 'EMSP Tokens Sync Service');
  stopServiceIfRunning(testLocationEVSECreationService, 'Test Location EVSE Creation Service');
  stopServiceIfRunning(testSessionService, 'Test Session Service');
}

module.exports = {
    stopAllServices
};
