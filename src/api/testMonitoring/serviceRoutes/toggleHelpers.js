const logger = require('../../../utils/logger');
const { serviceStatus } = require('../state');

/**
 * Importa todos los servicios necesarios
 * @returns {Object} Objeto con todas las instancias de servicios
 */
function importAllServices() {
  return {
    evseNotificationService: require('../../../services/evseNotificationService'),
    chargingNotificationService: require('../../../services/chargingNotificationService'),
    emspLocationsSyncService: require('../../../services/emspLocationsSyncService'),
    emspTariffsSyncService: require('../../../services/emspTariffsSyncService'),
    emspTokensSyncService: require('../../../services/emspTokensSyncService'),
    testLocationEVSECreationService: require('../../../services/testLocationEVSECreationService'),
    testSessionService: require('../../../services/testSessionService')
  };
}

/**
 * Verifica el estado actual de los jobs
 * @param {Object} evseNotificationService - Servicio de notificación EVSE
 * @returns {boolean} True si los jobs están activos
 */
function checkJobsStatus(evseNotificationService) {
  const currentStatus = evseNotificationService.getStatus();
  return currentStatus.isRunning;
}

/**
 * Pausa todos los servicios
 * @param {Object} services - Objeto con todas las instancias de servicios
 */
function pauseAllServices(services) {
  logger.info('⏸️ Pausando todos los jobs...');
  
  services.evseNotificationService.stop();
  services.chargingNotificationService.stop();
  services.emspLocationsSyncService.stop();
  services.emspTariffsSyncService.stop();
  services.emspTokensSyncService.stop();
  services.testLocationEVSECreationService.stop();
  services.testSessionService.stop();

  serviceStatus.evseNotificationService.status = 'paused';
  serviceStatus.chargingNotificationService.status = 'paused';
  serviceStatus.emspLocationsSyncService.status = 'paused';
  serviceStatus.emspTariffsSyncService.status = 'paused';
  serviceStatus.emspTokensSyncService.status = 'paused';
  serviceStatus.testLocationEVSECreationService.status = 'paused';
  serviceStatus.testSessionService.status = 'paused';

  logger.info('✅ Todos los jobs pausados');
}

/**
 * Activa todos los servicios excepto el Charging Notification Service
 * @param {Object} services - Objeto con todas las instancias de servicios
 */
function startAllServices(services) {
  logger.info('▶️ Activando todos los jobs...');
  
  services.evseNotificationService.start();
  services.emspLocationsSyncService.start();
  services.emspTariffsSyncService.start();
  services.emspTokensSyncService.start();
  services.testLocationEVSECreationService.start();
  services.testSessionService.start();

  serviceStatus.evseNotificationService.status = 'active';
  serviceStatus.emspLocationsSyncService.status = 'active';
  serviceStatus.emspTariffsSyncService.status = 'active';
  serviceStatus.emspTokensSyncService.status = 'active';
  serviceStatus.testLocationEVSECreationService.status = 'active';
  serviceStatus.testSessionService.status = 'active';

  logger.info('✅ Todos los jobs activados (excepto Charging Notification Service)');
}

/**
 * Construye la respuesta de éxito para pausar jobs
 * @returns {Object} Respuesta de éxito
 */
function buildPauseResponse() {
  return {
    success: true,
    data: {
      jobsActive: false,
      message: 'Todos los jobs han sido pausados'
    }
  };
}

/**
 * Construye la respuesta de éxito para activar jobs
 * @returns {Object} Respuesta de éxito
 */
function buildStartResponse() {
  return {
    success: true,
    data: {
      jobsActive: true,
      message: 'Todos los jobs han sido activados (excepto Charging Notification Service)'
    }
  };
}

module.exports = {
    importAllServices,
    checkJobsStatus,
    pauseAllServices,
    startAllServices,
    buildPauseResponse,
    buildStartResponse
};

