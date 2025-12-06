const { Location, EVSE } = require('../../models');
const logger = require('../../utils/logger');

const { cleanLocation } = require('./transformers');

/**
 * Ejecuta la consulta de locations con EVSEs
 * @param {Object} where - Condiciones where
 * @param {number} offsetInt - Offset como número
 * @param {number} limitInt - Limit como número
 * @returns {Promise<Array>} Array de locations con EVSEs
 */
async function queryLocationsWithEVSEs(where, offsetInt, limitInt) {
  logger.info('Querying locations with EVSEs...');
  
  const locations = await Location.findAll({
    where,
    attributes: ['id', 'country_code', 'party_id', 'name', 'address', 'city', 'postal_code', 'state', 'country', 'coordinates', 'related_locations', 'parking_type', 'directions', 'operator', 'suboperator', 'owner', 'facilities', 'time_zone', 'opening_times', 'charging_when_closed', 'images', 'energy_mix', 'last_updated', 'publish'],
    include: [{
      model: EVSE,
      as: 'evseList',
      where: { deleted_at: null },
      required: false,
      attributes: ['id', 'country_code', 'party_id', 'evse_id', 'status', 'capabilities', 'connectors', 'physical_reference', 'last_updated']
    }],
    offset: offsetInt,
    limit: limitInt,
    order: [['last_updated', 'DESC']]
  });
  
  logger.info(`Found ${locations.length} locations`);
  locations.forEach((location, index) => {
    logger.info(`Location ${index + 1}: ${location.id} has ${location.evseList ? location.evseList.length : 0} EVSEs`);
  });

  return locations;
}

/**
 * Procesa y limpia las locations para respuesta OCPI
 * @param {Array} locations - Array de locations
 * @param {Function} logLocationData - Función para logging
 * @param {Function} logArrayData - Función para logging de arrays
 * @returns {Array} Array de locations limpiadas
 */
function processLocationsForResponse(locations, logLocationData, logArrayData) {
  const cleanedLocations = locations.map(location => cleanLocation(location, logLocationData));
  
  logger.info(`Response structure: cleanedLocations type=${typeof cleanedLocations}, length=${cleanedLocations ? cleanedLocations.length : 'undefined'}`);
  logArrayData(logger.info, cleanedLocations, 'locations');
  
  return cleanedLocations;
}

module.exports = {
    queryLocationsWithEVSEs,
    processLocationsForResponse
};

