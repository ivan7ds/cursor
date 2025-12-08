const { logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

/**
 * Construye la URL del endpoint de tariffs
 * @param {string} url - URL base del EMSP
 * @returns {string} URL del endpoint de tariffs
 */
function buildTariffsUrl(url) {
  return `${url}/ocpi/cpo/2.2/tariffs/`;
}

/**
 * Construye los headers para la petición GET de tariffs
 * @param {string} token - Token de autenticación
 * @returns {Object} Headers de la petición
 */
function buildTariffsHeaders(token) {
  return {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Valida que la respuesta tenga tariffs
 * @param {Array} tariffs - Array de tariffs
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @throws {Error} Si no hay tariffs
 */
function validateTariffsResponse(tariffs, partyId, countryCode) {
  if (tariffs.length === 0) {
    const errorMessage = `No tariffs found for EMSP ${partyId} (${countryCode}) - this is considered an error`;
    logger.error(`❌ ${errorMessage}`);
    logJobError('EMSP Tariffs Sync Service', errorMessage, 'error');
    throw new Error(errorMessage);
  }
}

/**
 * Procesa todas las tariffs recibidas
 * @param {Array} tariffs - Array de tariffs
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @param {Function} processTariff - Función para procesar cada tariff
 * @returns {Promise<void>}
 */
async function processAllTariffs(tariffs, partyId, countryCode, processTariff) {
  // Crear promesas para procesar todos los tariffs en paralelo
  const tariffPromises = tariffs.map(tariff => processTariff(tariff, partyId, countryCode));
  
  // Ejecutar todas las promesas
  await Promise.allSettled(tariffPromises);
}

module.exports = {
    buildTariffsUrl,
    buildTariffsHeaders,
    validateTariffsResponse,
    processAllTariffs
};

