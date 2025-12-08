const logger = require('../../utils/logger');

const {
  removeNonOCPIFields,
  normalizeEmptyArrays,
  normalizeEmptyObjects,
  ensurePublishField
} = require('./transformers/cleanupHelpers');

/**
 * Transforma un conector al formato OCPI 2.2
 * @param {Object} connector - Conector a transformar
 * @param {string} evseLastUpdated - Última actualización del EVSE
 * @returns {Object} Conector transformado
 */
function transformConnector(connector, evseLastUpdated) {
  const cleanConnector = { ...connector };
  
  // Map voltage/amperage to max_voltage/max_amperage
  if (cleanConnector.voltage) {
    // eslint-disable-next-line camelcase -- Campo en snake_case según especificación OCPI
    cleanConnector.max_voltage = cleanConnector.voltage;
    delete cleanConnector.voltage;
  }
  if (cleanConnector.amperage) {
    // eslint-disable-next-line camelcase -- Campo en snake_case según especificación OCPI
    cleanConnector.max_amperage = cleanConnector.amperage;
    delete cleanConnector.amperage;
  }
  
  // Add missing fields
  if (!cleanConnector.tariff_ids) {
    cleanConnector.tariff_ids = [];
  }
  if (!cleanConnector.last_updated) {
    cleanConnector.last_updated = evseLastUpdated;
  }
  
  return cleanConnector;
}

/**
 * Transforma un EVSE al formato OCPI 2.2
 * @param {Object} evse - EVSE a transformar
 * @param {string} locationId - ID de la ubicación
 * @returns {Object} EVSE transformado
 */
function transformEVSE(evse, locationId) {
  const cleanEvse = { ...evse };
  
  // Map id to uid for OCPI 2.2 compliance
  cleanEvse.uid = cleanEvse.id;
  delete cleanEvse.id;
  
  logger.info(`EVSE ${cleanEvse.uid}: evse_id=${cleanEvse.evse_id}, country_code=${cleanEvse.country_code}, party_id=${cleanEvse.party_id}`);
  
  // Transform connectors
  if (cleanEvse.connectors) {
    cleanEvse.connectors = cleanEvse.connectors.map(connector => 
      transformConnector(connector, cleanEvse.last_updated)
    );
  }
  
  // Ensure capabilities is an array
  if (!cleanEvse.capabilities || !Array.isArray(cleanEvse.capabilities)) {
    cleanEvse.capabilities = ['REMOTE_START_STOP_CAPABLE'];
  }
  
  // Ensure physical_reference exists
  if (!cleanEvse.physical_reference) {
    cleanEvse.physical_reference = `${locationId}_${cleanEvse.evse_id.split('*').pop()}`;
  }
  
  return cleanEvse;
}

/**
 * Procesa la lista de EVSEs de una ubicación
 * @param {Object} cleanLocation - Ubicación a procesar
 * @returns {Object} Ubicación con EVSEs procesados
 */
function processEVSEs(cleanLocation) {
  if (cleanLocation.evseList && Array.isArray(cleanLocation.evseList) && cleanLocation.evseList.length > 0) {
    logger.info(`Location ${cleanLocation.id}: Found ${cleanLocation.evseList.length} EVSEs to process`);
    
    cleanLocation.evses = cleanLocation.evseList.map(evse => transformEVSE(evse, cleanLocation.id));
    
    logger.info(`Location ${cleanLocation.id}: Processed ${cleanLocation.evses.length} EVSEs`);
    delete cleanLocation.evseList;
  } else {
    logger.warn(`Location ${cleanLocation.id}: No EVSEs found or evseList is empty`);
    cleanLocation.evses = [];
  }
  
  return cleanLocation;
}

/**
 * Limpia campos opcionales de una ubicación
 * @param {Object} cleanLocation - Ubicación a limpiar
 * @returns {Object} Ubicación con campos limpiados
 */
function cleanOptionalFields(cleanLocation) {
  removeNonOCPIFields(cleanLocation);
  normalizeEmptyArrays(cleanLocation);
  normalizeEmptyObjects(cleanLocation);
  ensurePublishField(cleanLocation);

  return cleanLocation;
}

/**
 * Valida y limpia las facilities según especificación OCPI 2.2
 * @param {Object} cleanLocation - Ubicación a validar
 * @returns {Object} Ubicación con facilities validadas
 */
function validateFacilities(cleanLocation) {
  if (cleanLocation.facilities && Array.isArray(cleanLocation.facilities)) {
    const validFacilities = [
      'HOTEL', 'RESTAURANT', 'CAFE', 'MALL', 'SUPERMARKET', 'SPORT',
      'RECREATION_AREA', 'NATURE', 'MUSEUM', 'BIKE_SHARING', 'BUS_STOP',
      'TAXI_STAND', 'TRAM_STOP', 'METRO_STATION', 'TRAIN_STATION',
      'AIRPORT', 'PARKING_LOT', 'CARPOOL_PARKING', 'FUEL_STATION', 'WIFI'
    ];
    
    const originalFacilities = [...cleanLocation.facilities];
    cleanLocation.facilities = cleanLocation.facilities.filter(facility => {
      if (validFacilities.includes(facility)) {
        return true;
      } else {
        logger.warn(`Location ${cleanLocation.id}: Invalid facility "${facility}" removed. Valid facilities: ${validFacilities.join(', ')}`);
        return false;
      }
    });
    
    if (originalFacilities.length !== cleanLocation.facilities.length) {
      logger.info(`Location ${cleanLocation.id}: Facilities cleaned from ${originalFacilities.join(', ')} to ${cleanLocation.facilities.join(', ')}`);
    }
  }
  
  return cleanLocation;
}

/**
 * Convierte coordenadas a strings según especificación OCPI 2.2
 * @param {Object} cleanLocation - Ubicación a procesar
 * @returns {Object} Ubicación con coordenadas convertidas
 */
function convertCoordinatesToStrings(cleanLocation) {
  if (cleanLocation.coordinates && typeof cleanLocation.coordinates === 'object') {
    if (cleanLocation.coordinates.latitude !== undefined) {
      cleanLocation.coordinates.latitude = cleanLocation.coordinates.latitude.toString();
    }
    if (cleanLocation.coordinates.longitude !== undefined) {
      cleanLocation.coordinates.longitude = cleanLocation.coordinates.longitude.toString();
    }
    logger.info(`Location ${cleanLocation.id}: Coordinates converted to strings - lat: ${cleanLocation.coordinates.latitude}, lon: ${cleanLocation.coordinates.longitude}`);
  }
  
  return cleanLocation;
}

/**
 * Limpia y transforma una ubicación completa al formato OCPI 2.2
 * @param {Object} location - Ubicación a limpiar
 * @param {Function} logLocationData - Función para logging
 * @returns {Object} Ubicación limpia y transformada
 */
function cleanLocation(location, logLocationData) {
  const cleanLocation = location.toJSON();
  
  logger.info(`Processing location ${cleanLocation.id}: evseList length=${cleanLocation.evseList ? cleanLocation.evseList.length : 'undefined'}`);
  logLocationData(logger.info, cleanLocation);
  
  processEVSEs(cleanLocation);
  cleanOptionalFields(cleanLocation);
  validateFacilities(cleanLocation);
  convertCoordinatesToStrings(cleanLocation);
  
  return cleanLocation;
}

module.exports = {
    cleanLocation
};

