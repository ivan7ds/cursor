const { Credentials } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Extrae el token del header de autorización
 * @param {Object} req - Request object
 * @returns {string|null} Token extraído o null
 */
function extractTempToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Token ')) {
    return null;
  }
  
  return authHeader.substring(6);
}

/**
 * Busca credenciales temporales por token
 * @param {string} token - Token a buscar
 * @returns {Promise<Object|null>} Credenciales encontradas o null
 */
async function findTempCredentials(token) {
  return await Credentials.findOne({
    where: {
      token,
      valid: true,
      temp: true
    }
  });
}

/**
 * Verifica si un path está permitido para tokens temporales
 * @param {string} originalUrl - URL original de la petición
 * @returns {boolean} True si está permitido, false si no
 */
function isTempTokenPathAllowed(originalUrl) {
  const originalPath = originalUrl.split('?')[0];
  const isVersionsEndpoint = originalPath === '/ocpi/versions' || originalPath === '/ocpi/versions/';
  const isCredentialsEndpoint = originalPath.startsWith('/ocpi/cpo/2.2/credentials');
  const isDetailsEndpoint = originalPath.startsWith('/ocpi/cpo/2.2/details');
  
  return isVersionsEndpoint || isCredentialsEndpoint || isDetailsEndpoint;
}

module.exports = {
    extractTempToken,
    findTempCredentials,
    isTempTokenPathAllowed
};

