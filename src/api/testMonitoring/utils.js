const logger = require('../../utils/logger');

const { serviceStatus } = require('./state');

/**
 * Utilidades para gestión de servicios
 */

const SERVICE_RESOLVERS = {
  evseNotificationService: () => require('../../services/evseNotificationService'),
  chargingNotificationService: () => require('../../services/chargingNotificationService'),
  emspLocationsSyncService: () => require('../../services/emspLocationsSyncService'),
  emspTariffsSyncService: () => require('../../services/emspTariffsSyncService'),
  emspTokensSyncService: () => require('../../services/emspTokensSyncService'),
  testLocationEVSECreationService: () => require('../../services/testLocationEVSECreationService'),
  testSessionService: () => require('../../services/testSessionService')
};

/**
 * Obtiene el estado en tiempo real de un servicio dado
 * @param {*} serviceInstance Instancia del servicio requerida dinámicamente
 * @param {string} inactiveStatus Etiqueta a usar cuando el servicio no está activo
 * @returns {{status: string, metadata?: object}}
 */
const getRuntimeServiceStatus = (serviceInstance, inactiveStatus = 'inactive') => {
  if (!serviceInstance) {
    return { status: inactiveStatus };
  }

  try {
    let isRunning;

    if (typeof serviceInstance.getStatus === 'function') {
      const runtimeStatus = serviceInstance.getStatus() || {};
      if (Object.prototype.hasOwnProperty.call(runtimeStatus, 'isRunning')) {
        isRunning = runtimeStatus.isRunning;
        return {
          status: isRunning ? 'active' : inactiveStatus,
          metadata: runtimeStatus
        };
      }
    }

    if (Object.prototype.hasOwnProperty.call(serviceInstance, 'isRunning')) {
      isRunning = serviceInstance.isRunning;
      return { status: isRunning ? 'active' : inactiveStatus };
    }

    return { status: inactiveStatus };
  } catch (error) {
    logger.warn(`⚠️ No se pudo determinar el estado del servicio dinámicamente: ${error.message}`);
    return { status: inactiveStatus };
  }
};

/**
 * Map que describe cómo ejecutar y controlar cada servicio individualmente
 */
const SERVICE_EXECUTOR_CONFIG = {
  evseNotificationService: {
    label: 'EVSE Notification Service',
    inactiveStatus: 'paused',
    run: async () => {
      const service = SERVICE_RESOLVERS.evseNotificationService();
      await service.processNotifications();
    },
    start: async () => {
      const service = SERVICE_RESOLVERS.evseNotificationService();
      await Promise.resolve(service.start());
    },
    stop: async () => {
      const service = SERVICE_RESOLVERS.evseNotificationService();
      await Promise.resolve(service.stop());
    }
  },
  chargingNotificationService: {
    label: 'Charging Notification Service',
    inactiveStatus: 'inactive',
    run: async () => {
      const service = SERVICE_RESOLVERS.chargingNotificationService();
      await service.processActiveSessions();
    },
    start: async () => {
      const service = SERVICE_RESOLVERS.chargingNotificationService();
      await Promise.resolve(service.start());
    },
    stop: async () => {
      const service = SERVICE_RESOLVERS.chargingNotificationService();
      await Promise.resolve(service.stop());
    }
  },
  emspLocationsSyncService: {
    label: 'EMSP Locations Sync Service',
    inactiveStatus: 'inactive',
    run: async () => {
      const service = SERVICE_RESOLVERS.emspLocationsSyncService();
      await service.syncEMSPLocations();
    },
    start: async () => {
      const service = SERVICE_RESOLVERS.emspLocationsSyncService();
      await Promise.resolve(service.start());
    },
    stop: async () => {
      const service = SERVICE_RESOLVERS.emspLocationsSyncService();
      await Promise.resolve(service.stop());
    }
  },
  emspTariffsSyncService: {
    label: 'EMSP Tariffs Sync Service',
    inactiveStatus: 'inactive',
    run: async () => {
      const service = SERVICE_RESOLVERS.emspTariffsSyncService();
      await service.syncEMSPTariffs();
    },
    start: async () => {
      const service = SERVICE_RESOLVERS.emspTariffsSyncService();
      await Promise.resolve(service.start());
    },
    stop: async () => {
      const service = SERVICE_RESOLVERS.emspTariffsSyncService();
      await Promise.resolve(service.stop());
    }
  },
  emspTokensSyncService: {
    label: 'EMSP Tokens Sync Service',
    inactiveStatus: 'inactive',
    run: async () => {
      const service = SERVICE_RESOLVERS.emspTokensSyncService();
      await service.syncEMSPTokens();
    },
    start: async () => {
      const service = SERVICE_RESOLVERS.emspTokensSyncService();
      await Promise.resolve(service.start());
    },
    stop: async () => {
      const service = SERVICE_RESOLVERS.emspTokensSyncService();
      await Promise.resolve(service.stop());
    }
  },
  testLocationEVSECreationService: {
    label: 'Test Location EVSE Creation Service',
    inactiveStatus: 'paused',
    run: async () => {
      const service = SERVICE_RESOLVERS.testLocationEVSECreationService();
      await service.runTest();
    },
    start: async () => {
      const service = SERVICE_RESOLVERS.testLocationEVSECreationService();
      await Promise.resolve(service.start());
    },
    stop: async () => {
      const service = SERVICE_RESOLVERS.testLocationEVSECreationService();
      await Promise.resolve(service.stop());
    }
  },
  testSessionService: {
    label: 'Test Session Service',
    inactiveStatus: 'paused',
    run: async () => {
      const service = SERVICE_RESOLVERS.testSessionService();
      await service.runSessionTest();
    },
    start: async () => {
      const service = SERVICE_RESOLVERS.testSessionService();
      await Promise.resolve(service.start());
    },
    stop: async () => {
      const service = SERVICE_RESOLVERS.testSessionService();
      await Promise.resolve(service.stop());
    }
  }
};

/**
 * Construye un snapshot del estado de los servicios combinando los datos almacenados con el estado runtime real
 */
const buildServicesStatusSnapshot = () => {
  const servicesSnapshot = {};

  // Copiar estado almacenado
  Object.entries(serviceStatus).forEach(([serviceKey, statusValue]) => {
    servicesSnapshot[serviceKey] = { ...statusValue };
  });

  // Mezclar con estado runtime real
  Object.entries(SERVICE_EXECUTOR_CONFIG).forEach(([serviceKey, config]) => {
    const resolver = SERVICE_RESOLVERS[serviceKey];
    if (!resolver) {
      return;
    }

    const serviceInstance = resolver();
    const runtimeStatus = getRuntimeServiceStatus(serviceInstance, config.inactiveStatus);

    servicesSnapshot[serviceKey] = {
      ...(servicesSnapshot[serviceKey] || {}),
      status: runtimeStatus.status
    };
  });

  return servicesSnapshot;
};

/**
 * Ejecuta una tarea de servicio individual y devuelve la información de resultado
 * @param {string} serviceKey
 */
const executeServiceJobOnce = async (serviceKey) => {
  const config = SERVICE_EXECUTOR_CONFIG[serviceKey];
  if (!config) {
    const error = new Error(`Servicio no soportado: ${serviceKey}`);
    error.statusCode = 400;
    throw error;
  }

  logger.info(`▶️ Ejecutando job manual: ${config.label}`);
  await config.run();
  logger.info(`✅ Job manual completado: ${config.label}`);

  const servicesSnapshot = buildServicesStatusSnapshot();
  return {
    jobName: config.label,
    services: servicesSnapshot
  };
};

/**
 * Alterna la ejecución continua de un servicio (start/stop)
 * @param {string} serviceKey
 */
const {
  validateServiceConfig,
  validateServiceResolver,
  initializeServiceStatus,
  stopService,
  startService,
  buildToggleResponse
} = require('./utils/toggleHelpers');

const toggleServiceExecution = async (serviceKey) => {
  const config = SERVICE_EXECUTOR_CONFIG[serviceKey];
  validateServiceConfig(config, serviceKey);

  const resolver = SERVICE_RESOLVERS[serviceKey];
  validateServiceResolver(resolver, serviceKey);

  const serviceInstance = resolver();
  const runtimeStatus = getRuntimeServiceStatus(serviceInstance, config.inactiveStatus);
  const isCurrentlyActive = runtimeStatus.status === 'active';

  initializeServiceStatus(serviceKey, config);

  const toggleResult = isCurrentlyActive
    ? await stopService(config, serviceKey)
    : await startService(config, serviceKey);

  return buildToggleResponse(toggleResult, serviceKey);
};

module.exports = {
  getRuntimeServiceStatus,
  buildServicesStatusSnapshot,
  executeServiceJobOnce,
  toggleServiceExecution
};

