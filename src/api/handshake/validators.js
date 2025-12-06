const { validateAndSanitizeUrl } = require('./utils');

/**
 * Valida los datos de entrada del handshake
 * @param {Object} body - Request body
 * @returns {Object|null} Objeto con error o null si es válido
 */
function validateHandshakeInput(body) {
  const { url, token, partyId, countryCode } = body;
  
  if (!url || !token || !partyId || !countryCode) {
    return {
      status: 400,
      json: {
        status_code: 2001,
        status_message: 'Missing required fields: url, token, partyId, countryCode',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  const sanitizedUrl = validateAndSanitizeUrl(url);
  if (!sanitizedUrl) {
    return {
      status: 400,
      json: {
        status_code: 2001,
        status_message: 'Invalid or unsafe URL provided',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  return null;
}

/**
 * Valida los datos de entrada para generar credenciales
 * @param {Object} body - Request body
 * @returns {Object|null} Objeto con error o null si es válido
 */
function validateGenerateCredentialsInput(body) {
  const { partyId, countryCode, url } = body;
  
  if (!partyId || !countryCode || !url) {
    return {
      status: 400,
      json: {
        status_code: 2001,
        status_message: 'Missing required fields: partyId, countryCode, url',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  return null;
}

module.exports = {
    validateHandshakeInput,
    validateGenerateCredentialsInput
};

