const axios = require('axios');

const { logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

/**
 * Construye la URL del endpoint de locations
 * @param {string} url - URL base del EMSP
 * @returns {string} URL del endpoint de locations
 */
function buildLocationsUrl(url) {
  return `${url}/ocpi/cpo/2.2/locations/`;
}

/**
 * Construye los headers para la petición GET de locations
 * @param {string} token - Token de autenticación
 * @returns {Object} Headers de la petición
 */
function buildLocationsHeaders(token) {
  return {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Valida que la respuesta tenga locations
 * @param {Array} locations - Array de locations
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @throws {Error} Si no hay locations
 */
function validateLocationsResponse(locations, partyId, countryCode) {
  if (locations.length === 0) {
    const errorMessage = `No locations found for EMSP ${partyId} (${countryCode}) - this is considered an error`;
    logger.error(`❌ ${errorMessage}`);
    logJobError('EMSP Locations Sync Service', errorMessage, 'error');
    throw new Error(errorMessage);
  }
}

/**
 * Procesa todas las locations recibidas
 * @param {Array} locations - Array de locations
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @param {Function} processLocation - Función para procesar cada location
 * @returns {Promise<void>}
 */
async function processAllLocations(locations, partyId, countryCode, processLocation) {
  // Crear promesas para procesar todas las locations en paralelo
  const locationPromises = locations.map(location => processLocation(location, partyId, countryCode));
  
  // Ejecutar todas las promesas
  await Promise.allSettled(locationPromises);
}

module.exports = {
    buildLocationsUrl,
    buildLocationsHeaders,
    validateLocationsResponse,
    processAllLocations
};

