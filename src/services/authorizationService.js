const logger = require('../utils/logger');

const {
  executeAuthorizationFlow
} = require('./authorizationService/authorizationFlow');
const {
  buildAuthorizationErrorResponse
} = require('./authorizationService/errorHelpers');

/**
 * Servicio de autorización en tiempo real para tokens OCPI
 * Implementa la lógica de validación de tokens según especificación OCPI 2.2.1
 */
class AuthorizationService {
  
  /**
   * Autoriza un token en tiempo real
   * @param {string} tokenUid - UID del token a autorizar
   * @param {Object} options - Opciones de autorización
   * @param {string} options.type - Tipo de token (RFID, APP_USER, etc.)
   * @param {string} options.issuer - Emisor del token
   * @param {string} options.locationId - ID de la ubicación (opcional)
   * @param {string} options.evseUid - UID del EVSE (opcional)
   * @returns {Promise<Object>} Resultado de la autorización
   */
  static async authorizeToken(tokenUid, options = {}) {
    try {
      return executeAuthorizationFlow(tokenUid, options);
    } catch (error) {
      return buildAuthorizationErrorResponse(tokenUid, options, error);
    }
  }

  /**
   * Verifica si un token está autorizado para una ubicación y EVSE específicos
   * @param {string} tokenUid - UID del token
   * @param {string} locationId - ID de la ubicación
   * @param {string} evseUid - UID del EVSE
   * @returns {Promise<boolean>} True si está autorizado, false en caso contrario
   */
  static async isTokenAuthorized(tokenUid, locationId, evseUid) {
    try {
      const result = await this.authorizeToken(tokenUid, {
        locationId,
        evseUid
      });
      
      return result.success && result.data.allowed === "ALLOWED";
    } catch (error) {
      logger.error('❌ Error checking token authorization:', error);
      return false;
    }
  }
}

module.exports = AuthorizationService;
