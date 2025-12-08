/**
 * Utilidades para logging optimizado
 * Reduce el tamaño de los logs eliminando payloads grandes innecesarios
 */

/**
 * Determina si un objeto es demasiado grande para logging completo
 * @param {any} obj - Objeto a evaluar
 * @param {number} maxSize - Tamaño máximo en caracteres (default: 1000)
 * @returns {boolean} - true si el objeto es demasiado grande
 */
function isObjectTooLarge(obj, maxSize = 1000) {
  if (!obj || typeof obj !== 'object') return false;
  
  const jsonString = JSON.stringify(obj);
  return jsonString.length > maxSize;
}

/**
 * Crea un resumen de un objeto grande para logging
 * @param {any} obj - Objeto a resumir
 * @param {number} maxFields - Número máximo de campos a mostrar (default: 5)
 * @returns {string} - Resumen del objeto
 */
function createObjectSummary(obj, maxFields = 5) {
  if (!obj || typeof obj !== 'object') return String(obj);
  
  const keys = Object.keys(obj);
  const summary = {};
  
  // Mostrar los primeros campos hasta maxFields
  for (let i = 0; i < Math.min(keys.length, maxFields); i++) {
    const key = keys[i];
    const value = obj[key];
    
    if (Array.isArray(value)) {
      summary[key] = `Array[${value.length}]`;
    } else if (typeof value === 'object' && value !== null) {
      summary[key] = `Object{${Object.keys(value).length} fields}`;
    } else {
      summary[key] = value;
    }
  }
  
  if (keys.length > maxFields) {
    summary['...'] = `${keys.length - maxFields} more fields`;
  }
  
  return JSON.stringify(summary, null, 2);
}

/**
 * Log optimizado para objetos grandes
 * @param {Function} logger - Función de logging (logger.info, logger.error, etc.)
 * @param {string} message - Mensaje base
 * @param {any} data - Datos a loggear
 * @param {Object} options - Opciones de logging
 */
function logOptimized(logger, message, data, options = {}) {
  const {
    maxSize = 1000,
    maxFields = 5,
    showFullData = false
  } = options;
  
  if (showFullData || !isObjectTooLarge(data, maxSize)) {
    // Mostrar datos completos si son pequeños o se solicita explícitamente
    logger(message, data);
  } else {
    // Mostrar resumen para objetos grandes
    const summary = createObjectSummary(data, maxFields);
    logger(`${message} (resumen - objeto grande):`, summary);
  }
}

/**
 * Log específico para datos de Location (muy grandes)
 * @param {Function} logger - Función de logging
 * @param {Object} location - Objeto location
 */
function logLocationData(logger, location) {
  if (!location) return;
  
  const summary = {
    id: location.id,
    country_code: location.country_code,
    party_id: location.party_id,
    name: location.name,
    address: location.address,
    city: location.city,
    postal_code: location.postal_code,
    country: location.country,
    coordinates: location.coordinates,
    evseList: location.evseList ? `Array[${location.evseList.length}]` : 'undefined',
    last_updated: location.last_updated
  };
  
  logger('Location data (resumen):', summary);
}

/**
 * Log específico para datos de EVSE (medianos)
 * @param {Function} logger - Función de logging
 * @param {Object} evse - Objeto EVSE
 */
function logEvseData(logger, evse) {
  if (!evse) return;
  
  const summary = {
    id: evse.id,
    uid: evse.uid,
    evse_id: evse.evse_id,
    country_code: evse.country_code,
    party_id: evse.party_id,
    location_id: evse.location_id,
    status: evse.status,
    capabilities: evse.capabilities,
    connectors: evse.connectors ? `Array[${evse.connectors.length}]` : 'undefined',
    last_updated: evse.last_updated
  };
  
  logger('EVSE data (resumen):', summary);
}

/**
 * Log específico para arrays de datos (locations, evses, etc.)
 * @param {Function} logger - Función de logging
 * @param {Array} dataArray - Array de datos
 * @param {string} dataType - Tipo de datos ('locations', 'evses', etc.)
 */
function logArrayData(logger, dataArray, dataType = 'data') {
  if (!Array.isArray(dataArray)) {
    logger(`${dataType} data:`, dataArray);
    return;
  }
  
  const summary = {
    count: dataArray.length,
    type: dataType,
    first_item: dataArray.length > 0 ? createObjectSummary(dataArray[0], 3) : 'empty'
  };
  
  logger(`${dataType} data (resumen):`, summary);
}

module.exports = {
  logLocationData,
  logArrayData
};
