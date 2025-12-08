const { v4: uuidv4 } = require('uuid');

const { OCPIToken } = require('../models');
const logger = require('../utils/logger');

const {
  generateSecureToken,
  createTokenRecord,
  buildTokenResponse
} = require('./ocpiTokenService/tokenGenerationHelpers');
const {
  findTokenInOCPIToken,
  findTokenInCredentials,
  buildCredentialsTokenResponse,
  checkAndDeactivateExpiredToken,
  updateTokenLastUsed,
  buildOCPITokenResponse
} = require('./ocpiTokenService/validationHelpers');

/**
 * Servicio para gestionar tokens OCPI
 */
class OCPITokenService {
  
  /**
   * Genera un nuevo token OCPI para un party_id específico
   * @param {string} partyId - Party ID del eMSP
   * @param {string} countryCode - Código de país del eMSP
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Token generado
   */
  static async generateToken(partyId, countryCode, options = {}) {
    try {
      await this.deactivatePreviousTokens(partyId, countryCode);
      
      const token = generateSecureToken();
      const tokenId = uuidv4();
      const now = new Date();
      
      const tokenRecord = await createTokenRecord({ tokenId, token, partyId, countryCode, now, options });
      
      logger.info('New OCPI token generated', {
        partyId,
        countryCode,
        tokenId: tokenRecord.id,
        tokenPrefix: `${token.substring(0, 8)}...`
      });
      
      return buildTokenResponse(tokenRecord, token);
      
    } catch (error) {
      logger.error('Error generating OCPI token:', error);
      throw error;
    }
  }
  
  /**
   * Valida un token OCPI
   * @param {string} token - Token a validar
   * @returns {Promise<Object|null>} Información del token si es válido
   */
  static async validateToken(token) {
    try {
      const tokenRecord = await findTokenInOCPIToken(token);
      
      if (!tokenRecord) {
        const cred = await findTokenInCredentials(token);
        if (cred) {
          return buildCredentialsTokenResponse(cred);
        }
        return null;
      }
      
      const isExpired = await checkAndDeactivateExpiredToken(tokenRecord);
      if (isExpired) {
        return null;
      }
      
      await updateTokenLastUsed(tokenRecord);
      return buildOCPITokenResponse(tokenRecord);
      
    } catch (error) {
      logger.error('Error validating OCPI token:', error);
      return null;
    }
  }
  
  /**
   * Obtiene el token activo para un party_id
   * @param {string} partyId - Party ID
   * @param {string} countryCode - Código de país
   * @returns {Promise<Object|null>} Token activo
   */
  static async getActiveToken(partyId, countryCode) {
    try {
      const tokenRecord = await OCPIToken.findOne({
        where: {
          party_id: partyId,
          country_code: countryCode,
          is_active: true
        }
      });
      
      return tokenRecord;
      
    } catch (error) {
      logger.error('Error getting active token:', error);
      return null;
    }
  }
  
  /**
   * Desactiva tokens anteriores para un party_id
   * @param {string} partyId - Party ID
   * @param {string} countryCode - Código de país
   */
  static async deactivatePreviousTokens(partyId, countryCode) {
    try {
      await OCPIToken.update(
        { is_active: false },
        {
          where: {
            party_id: partyId,
            country_code: countryCode,
            is_active: true
          }
        }
      );
      
      logger.info('Previous tokens deactivated', { partyId, countryCode });
      
    } catch (error) {
      logger.error('Error deactivating previous tokens:', error);
    }
  }
  
  /**
   * Desactiva un token específico
   * @param {string} tokenId - ID del token
   */
  static async deactivateToken(tokenId) {
    try {
      await OCPIToken.update(
        { is_active: false },
        { where: { id: tokenId } }
      );
      
      logger.info('Token deactivated', { tokenId });
      
    } catch (error) {
      logger.error('Error deactivating token:', error);
    }
  }
  
  /**
   * Genera un token seguro de 64 caracteres
   * @returns {string} Token generado
   */
  static generateSecureToken() {
    return generateSecureToken();
  }
  
  /**
   * Obtiene el historial de tokens para un party_id
   * @param {string} partyId - Party ID
   * @param {string} countryCode - Código de país
   * @returns {Promise<Array>} Historial de tokens
   */
  static async getTokenHistory(partyId, countryCode) {
    try {
      const tokens = await OCPIToken.findAll({
        where: {
          party_id: partyId,
          country_code: countryCode
        },
        order: [['created_at', 'DESC']]
      });
      
      return tokens;
      
    } catch (error) {
      logger.error('Error getting token history:', error);
      return [];
    }
  }
  
  /**
   * Limpia tokens expirados
   */
  static async cleanupExpiredTokens() {
    try {
      const expiredTokens = await OCPIToken.findAll({
        where: {
          expires_at: {
            [require('sequelize').Op.lt]: new Date()
          },
          is_active: true
        }
      });
      
      // Desactivar todos los tokens expirados en paralelo
      const deactivationPromises = expiredTokens.map(token => this.deactivateToken(token.id));
      await Promise.allSettled(deactivationPromises);
      
      if (expiredTokens.length > 0) {
        logger.info('Expired tokens cleaned up', { count: expiredTokens.length });
      }
      
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
    }
  }
}

module.exports = OCPITokenService;
