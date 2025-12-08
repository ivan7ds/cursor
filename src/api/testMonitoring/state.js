const logger = require('../../utils/logger');

/**
 * Estado y almacenamiento temporal de servicios y pruebas
 */

// Almacenamiento temporal de errores de jobs (en producción esto debería ser en base de datos)
const jobErrors = [];

const serviceStatus = {
  evseNotificationService: {
    status: 'active',
    lastRun: null,
    errorCount: 0
  },
  chargingNotificationService: {
    status: 'active',
    lastRun: null,
    errorCount: 0
  },
  emspLocationsSyncService: {
    status: 'active',
    lastRun: null,
    errorCount: 0
  },
  emspTariffsSyncService: {
    status: 'active',
    lastRun: null,
    errorCount: 0
  },
  emspTokensSyncService: {
    status: 'active',
    lastRun: null,
    errorCount: 0
  },
  testLocationEVSECreationService: {
    status: 'active',
    lastRun: null,
    errorCount: 0
  },
  testSessionService: {
    status: 'active',
    lastRun: null,
    errorCount: 0
  }
};

// Estadísticas de pruebas (datos reales)
const testStatistics = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  runningTests: 0
};

// Historial de pruebas para estadísticas reales
const testHistory = [];

/**
 * Función para actualizar estadísticas basadas en datos reales
 */
const updateTestStatistics = () => {
  // Calcular estadísticas reales basadas en el historial de pruebas
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Filtrar pruebas de las últimas 24 horas
  const recentTests = testHistory.filter(test =>
    new Date(test.timestamp) >= last24Hours
  );

  // Calcular estadísticas reales
  testStatistics.totalTests = recentTests.length;
  testStatistics.passedTests = recentTests.filter(test => test.status === 'passed').length;
  testStatistics.failedTests = recentTests.filter(test => test.status === 'failed').length;
  testStatistics.runningTests = recentTests.filter(test => test.status === 'running').length;

  logger.info(`📊 Estadísticas reales actualizadas: ${testStatistics.totalTests} total, ${testStatistics.passedTests} exitosas, ${testStatistics.failedTests} fallidas, ${testStatistics.runningTests} en ejecución`);
};

/**
 * Función para registrar errores de jobs (llamada desde otros servicios)
 */
function logJobError(service, message, level = 'error') {
  const errorEntry = {
    id: Date.now(),
    service,
    message,
    level,
    timestamp: new Date().toISOString()
  };

  jobErrors.unshift(errorEntry);

  // Actualizar contador de errores del servicio
  if (service === 'EVSE Notification Service') {
    serviceStatus.evseNotificationService.errorCount++;
  } else if (service === 'Charging Notification Service') {
    serviceStatus.chargingNotificationService.errorCount++;
  } else if (service === 'EMSP Locations Sync Service') {
    serviceStatus.emspLocationsSyncService.errorCount++;
  } else if (service === 'EMSP Tariffs Sync Service') {
    serviceStatus.emspTariffsSyncService.errorCount++;
  } else if (service === 'EMSP Tokens Sync Service') {
    serviceStatus.emspTokensSyncService.errorCount++;
  } else if (service === 'Test Location EVSE Creation Service') {
    serviceStatus.testLocationEVSECreationService.errorCount++;
  } else if (service === 'Test Session Service') {
    serviceStatus.testSessionService.errorCount++;
  }

  logger.warn(`🚨 Error de job registrado: [${service}] ${message}`);
}

/**
 * Función para registrar ejecución exitosa de jobs (llamada desde otros servicios)
 */
function logJobExecution(service, message = 'Job executed successfully') {
  const now = new Date().toISOString();

  // Actualizar timestamp de última ejecución del servicio
  if (service === 'EVSE Notification Service') {
    serviceStatus.evseNotificationService.lastRun = now;
    logger.info(`✅ EVSE Notification Service ejecutado: ${message}`);
  } else if (service === 'Charging Notification Service') {
    serviceStatus.chargingNotificationService.lastRun = now;
    logger.info(`✅ Charging Notification Service ejecutado: ${message}`);
  } else if (service === 'EMSP Locations Sync Service') {
    serviceStatus.emspLocationsSyncService.lastRun = now;
    logger.info(`✅ EMSP Locations Sync Service ejecutado: ${message}`);
  } else if (service === 'EMSP Tariffs Sync Service') {
    serviceStatus.emspTariffsSyncService.lastRun = now;
    logger.info(`✅ EMSP Tariffs Sync Service ejecutado: ${message}`);
  } else if (service === 'EMSP Tokens Sync Service') {
    serviceStatus.emspTokensSyncService.lastRun = now;
    logger.info(`✅ EMSP Tokens Sync Service ejecutado: ${message}`);
  } else if (service === 'Test Location EVSE Creation Service') {
    serviceStatus.testLocationEVSECreationService.lastRun = now;
    logger.info(`✅ Test Location EVSE Creation Service ejecutado: ${message}`);
  } else if (service === 'Test Session Service') {
    serviceStatus.testSessionService.lastRun = now;
    logger.info(`✅ Test Session Service ejecutado: ${message}`);
  }
}

module.exports = {
  jobErrors,
  serviceStatus,
  testStatistics,
  testHistory,
  updateTestStatistics,
  logJobError,
  logJobExecution
};

