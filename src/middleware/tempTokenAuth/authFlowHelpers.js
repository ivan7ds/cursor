const logger = require('../../utils/logger');

/**
 * Construye la respuesta de error cuando falta el token
 * @param {Object} req - Request object
 * @returns {Object} Respuesta de error
 */
function buildMissingTokenResponse(req) {
  logger.warn('Temp token auth failed: No authorization header', {
    ip: req.ip,
    path: req.path,
    method: req.method
  });
  
  return {
    status: 401,
    json: {
      status_code: 2001,
      status_message: 'Authentication failed: Missing token',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Construye la respuesta de error cuando el token es inválido
 * @param {Object} req - Request object
 * @param {string} token - Token proporcionado
 * @returns {Object} Respuesta de error
 */
function buildInvalidTokenResponse(req, token) {
  logger.warn('Temp token auth failed: Invalid or expired token', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    providedToken: `${token.substring(0, 10)}...`
  });
  
  return {
    status: 401,
    json: {
      status_code: 2001,
      status_message: 'Authentication failed: Invalid or expired token',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Construye la respuesta de error cuando el endpoint no está permitido
 * @param {Object} req - Request object
 * @param {string} token - Token proporcionado
 * @returns {Object} Respuesta de error
 */
function buildForbiddenEndpointResponse(req, token) {
  logger.warn('Temp token auth failed: Endpoint not allowed for temporary tokens', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    providedToken: `${token.substring(0, 10)}...`
  });
  
  return {
    status: 403,
    json: {
      status_code: 2002,
      status_message: 'Forbidden: This endpoint requires a permanent token',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Configura las credenciales en el request después de autenticación exitosa
 * @param {Object} req - Request object
 * @param {Object} credentials - Credenciales encontradas
 */
function setRequestCredentials(req, credentials) {
  req.credentials = credentials;
  req.tokenType = 'temp';
  
  logger.info('Temp token auth successful', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    partyId: credentials.party_id,
    countryCode: credentials.country_code
  });
}

module.exports = {
    buildMissingTokenResponse,
    buildInvalidTokenResponse,
    buildForbiddenEndpointResponse,
    setRequestCredentials
};

