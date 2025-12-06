const OCPITokenService = require('../../services/ocpiTokenService');
const logger = require('../../utils/logger');

const DEFAULT_OCPI_TOKEN = process.env.OCPI_TOKEN || 'ocpi_token_ipd_2024_secure_key';

/**
 * Extrae el token de las cabeceras de la petición
 * @param {Object} req - Request object
 * @returns {string|null} Token extraído o null
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  const token = req.headers['ocpi-token'] || req.headers['OCPI-Token'];
  
  if (authHeader && authHeader.startsWith('Token ')) {
    return authHeader.substring(6);
  } else if (token) {
    return token;
  }
  
  return null;
}

/**
 * Valida si un token temporal está permitido en el endpoint
 * @param {string} originalUrl - URL original de la petición
 * @returns {boolean} True si está permitido, false si no
 */
function isTempTokenAllowed(originalUrl) {
  const tempTokenAllowedPaths = [
    '/ocpi/versions',
    '/ocpi/cpo/2.2/details', 
    '/ocpi/cpo/2.2/credentials'
  ];
  
  return tempTokenAllowedPaths.some(path => originalUrl.startsWith(path));
}

/**
 * Valida el token y retorna información del token o null
 * @param {string} providedToken - Token proporcionado
 * @returns {Promise<Object|null>} Información del token o null
 */
async function validateToken(providedToken) {
  const tokenInfo = await OCPITokenService.validateToken(providedToken);
  
  if (!tokenInfo) {
    if (providedToken !== DEFAULT_OCPI_TOKEN) {
      return null;
    }
  }
  
  return tokenInfo;
}

/**
 * Verifica si el token temporal está permitido para el endpoint
 * @param {Object} tokenInfo - Información del token
 * @param {string} originalUrl - URL original de la petición
 * @returns {Object|null} Objeto con error o null si está permitido
 */
function checkTempTokenPermission(tokenInfo, originalUrl) {
  if (tokenInfo && tokenInfo.temp === true) {
    if (!isTempTokenAllowed(originalUrl)) {
      return {
        status: 403,
        json: {
          status_code: 2002,
          status_message: 'Forbidden: This endpoint requires a permanent token',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
  
  return null;
}

/**
 * Construye el objeto de token para la request
 * @param {Object|null} tokenInfo - Información del token validado
 * @returns {Object} Objeto de token para req.ocpiToken
 */
function buildTokenObject(tokenInfo) {
  return tokenInfo || { 
    party_id: process.env.OCPI_PARTY_ID || 'IPD', 
    country_code: process.env.OCPI_COUNTRY_CODE || 'ES',
    type: 'default' 
  };
}

module.exports = {
    extractToken,
    validateToken,
    checkTempTokenPermission,
    buildTokenObject,
    DEFAULT_OCPI_TOKEN
};

