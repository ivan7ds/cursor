/**
 * Utilidades para codificación de tokens OCPI
 * Maneja la codificación Base64 de tokens según la especificación OCPI 2.2
 */

/**
 * Codifica un token en Base64 si la organización requiere codificación
 * @param {string} token - Token a codificar
 * @param {boolean} requiresBase64 - Flag indicando si se requiere codificación Base64
 * @returns {string} Token codificado o sin codificar según corresponda
 */
function encodeTokenForAuth(token, requiresBase64) {
  if (!token) {
    return token;
  }

  if (requiresBase64) {
    // Codificar el token en Base64
    return Buffer.from(token, 'utf8').toString('base64');
  }

  return token;
}

/**
 * Construye el header Authorization con el token codificado si es necesario
 * @param {string} token - Token de autenticación
 * @param {boolean} requiresBase64 - Flag indicando si se requiere codificación Base64
 * @returns {string} Header Authorization formateado
 */
function buildAuthorizationHeader(token, requiresBase64) {
  const encodedToken = encodeTokenForAuth(token, requiresBase64);
  return `Token ${encodedToken}`;
}

module.exports = {
  buildAuthorizationHeader
};

