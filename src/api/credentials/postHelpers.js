const { v4: uuidv4 } = require('uuid');

const logger = require('../../utils/logger');

/**
 * Extrae el token de autenticación del header
 * @param {Object} req - Request object
 * @returns {string} Token extraído
 */
function extractAuthToken(req) {
  return req.headers.authorization.substring(6);
}

/**
 * Construye la respuesta de error para token inválido
 * @param {Object} req - Request object
 * @param {string} authToken - Token proporcionado
 * @returns {Object} Respuesta de error
 */
function buildInvalidTokenResponse(req, authToken) {
  logger.warn('Handshake failed: Invalid or expired temporary token', {
    ip: req.ip,
    providedToken: `${authToken.substring(0, 10)}...`
  });
  
  return {
    status: 401,
    json: {
      status_code: 2001,
      status_message: 'Authentication failed: Invalid or expired temporary token',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Genera un token nuestro para el handshake
 * @returns {string} Nuevo token
 */
function generateOurToken() {
  return `OCPI_${uuidv4().replace(/-/g, '')}`;
}

/**
 * Construye la URL base limpia
 * @param {Object} req - Request object
 * @returns {string} URL base limpia
 */
function buildCleanBaseUrl(req) {
  const baseUrl = process.env.OCPI_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return baseUrl.replace(/\/$/, '');
}

/**
 * Logs el éxito del handshake
 * @param {Object} externalRole - Rol externo
 * @param {string} ourToken - Nuestro token generado
 */
function logHandshakeSuccess(externalRole, ourToken) {
  logger.info('Handshake completed successfully', {
    externalPartyId: externalRole.party_id,
    externalCountryCode: externalRole.country_code,
    ourToken: `${ourToken.substring(0, 10)}...`
  });
}

module.exports = {
    extractAuthToken,
    buildInvalidTokenResponse,
    generateOurToken,
    buildCleanBaseUrl,
    logHandshakeSuccess
};

