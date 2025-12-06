const { serviceStatus } = require('../state');
const { getRuntimeServiceStatus, buildServicesStatusSnapshot } = require('../utils.js');

/**
 * Valida que el servicio existe en la configuración
 * @param {Object} config - Configuración del servicio
 * @param {string} serviceKey - Clave del servicio
 * @throws {Error} Si el servicio no está soportado
 */
function validateServiceConfig(config, serviceKey) {
  if (!config) {
    const error = new Error(`Servicio no soportado: ${serviceKey}`);
    error.statusCode = 400;
    throw error;
  }
}

/**
 * Valida que el resolver del servicio existe
 * @param {Function} resolver - Resolver del servicio
 * @param {string} serviceKey - Clave del servicio
 * @throws {Error} Si el resolver no está definido
 */
function validateServiceResolver(resolver, serviceKey) {
  if (!resolver) {
    const error = new Error(`Resolver no definido para el servicio: ${serviceKey}`);
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Inicializa el estado del servicio si no existe
 * @param {string} serviceKey - Clave del servicio
 * @param {Object} config - Configuración del servicio
 */
function initializeServiceStatus(serviceKey, config) {
  if (!serviceStatus[serviceKey]) {
    serviceStatus[serviceKey] = {
      status: config.inactiveStatus,
      lastRun: null,
      errorCount: 0
    };
  }
}

/**
 * Detiene el servicio y actualiza su estado
 * @param {Object} config - Configuración del servicio
 * @param {string} serviceKey - Clave del servicio
 * @returns {Object} Resultado con estado y mensaje
 */
async function stopService(config, serviceKey) {
  await config.stop();
  serviceStatus[serviceKey].status = config.inactiveStatus;
  return {
    isActive: false,
    message: `${config.label} desactivado`
  };
}

/**
 * Inicia el servicio y actualiza su estado
 * @param {Object} config - Configuración del servicio
 * @param {string} serviceKey - Clave del servicio
 * @returns {Object} Resultado con estado y mensaje
 */
async function startService(config, serviceKey) {
  await config.start();
  serviceStatus[serviceKey].status = 'active';
  return {
    isActive: true,
    message: `${config.label} activado`
  };
}

/**
 * Construye la respuesta final del toggle
 * @param {Object} toggleResult - Resultado del toggle
 * @param {string} serviceKey - Clave del servicio
 * @returns {Object} Respuesta completa
 */
function buildToggleResponse(toggleResult, serviceKey) {
  const servicesSnapshot = buildServicesStatusSnapshot();
  return {
    isActive: toggleResult.isActive,
    status: servicesSnapshot[serviceKey]?.status || serviceStatus[serviceKey].status,
    message: toggleResult.message,
    services: servicesSnapshot
  };
}

module.exports = {
    validateServiceConfig,
    validateServiceResolver,
    initializeServiceStatus,
    stopService,
    startService,
    buildToggleResponse
};

