const { logJobError } = require('../../api/testMonitoring');
const logger = require('../../utils/logger');

/**
 * Construye la URL del endpoint de tokens
 * @param {string} url - URL base del EMSP
 * @returns {string} URL del endpoint de tokens
 */
function buildTokensUrl(url) {
  return `${url}/ocpi/emsp/2.2/tokens/`;
}

/**
 * Construye los headers para la petición GET de tokens
 * @param {string} token - Token de autenticación
 * @returns {Object} Headers de la petición
 */
function buildTokensHeaders(token) {
  return {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Valida que la respuesta tenga tokens
 * @param {Array} tokens - Array de tokens
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @throws {Error} Si no hay tokens
 */
function validateTokensResponse(tokens, partyId, countryCode) {
  if (tokens.length === 0) {
    const errorMessage = `No tokens found for EMSP ${partyId} (${countryCode}) - this is considered an error`;
    logger.error(`❌ ${errorMessage}`);
    logJobError('EMSP Tokens Sync Service', errorMessage, 'error');
    throw new Error(errorMessage);
  }
}

/**
 * Procesa todos los tokens recibidos
 * @param {Array} tokens - Array de tokens
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @param {Function} processToken - Función para procesar cada token
 * @returns {Promise<void>}
 */
async function processAllTokens(tokens, partyId, countryCode, processToken) {
  // Crear promesas para procesar todos los tokens en paralelo
  const tokenPromises = tokens.map(tokenData => processToken(tokenData, partyId, countryCode));
  
  // Ejecutar todas las promesas
  await Promise.allSettled(tokenPromises);
}

module.exports = {
    buildTokensUrl,
    buildTokensHeaders,
    validateTokensResponse,
    processAllTokens
};

