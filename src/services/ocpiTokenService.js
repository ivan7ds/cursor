const { v4: uuidv4 } = require('uuid');
const { OCPIToken } = require('../models');
const logger = require('../utils/logger');

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
      // Desactivar tokens anteriores para este party_id
      await this.deactivatePreviousTokens(partyId, countryCode);
      
      // Generar nuevo token
      const token = this.generateSecureToken();
      const tokenId = uuidv4();
      const now = new Date();
      
      // Crear registro en base de datos
      const tokenRecord = await OCPIToken.create({
        id: tokenId,
        token,
        party_id: partyId,
        country_code: countryCode,
        is_active: true,
        expires_at: options.expiresAt || null,
        created_at: now,
        metadata: {
          description: `Token generated for ${partyId} (${countryCode})`,
          generated_at: now.toISOString(),
          generated_by: 'OCPI_CPO_SYSTEM',
          ...options.metadata
        }
      });
      
      logger.info('New OCPI token generated', {
        partyId,
        countryCode,
        tokenId: tokenRecord.id,
        tokenPrefix: token.substring(0, 8) + '...'
      });
      
      return {
        id: tokenRecord.id,
        token,
        party_id: partyId,
        country_code: countryCode,
        created_at: tokenRecord.created_at,
        expires_at: tokenRecord.expires_at
      };
      
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
      // Primero buscar en la tabla OCPIToken
      let tokenRecord = await OCPIToken.findOne({
        where: {
          token,
          is_active: true
        }
      });
      
      // Si no se encuentra en OCPIToken, buscar en la tabla credentials
      if (!tokenRecord) {
        const { sequelize } = require('../database/connection');
        const [credentialsResult] = await sequelize.query(`
          SELECT token, party_id, country_code, valid, temp, created_at, updated_at 
          FROM credentials 
          WHERE token = ? AND valid = true
        `, {
          replacements: [token]
        });
        
        if (credentialsResult && credentialsResult.length > 0) {
          const cred = credentialsResult[0];
          return {
            id: cred.token, // Usar el token como ID
            party_id: cred.party_id,
            country_code: cred.country_code,
            valid: cred.valid,
            temp: cred.temp,
            created_at: cred.created_at,
            expires_at: null, // Los tokens de credentials no expiran
            type: 'credentials'
          };
        }
        
        return null;
      }
      
      // Verificar si el token ha expirado
      if (tokenRecord.expires_at && new Date() > tokenRecord.expires_at) {
        logger.warn('Token expired', { tokenId: tokenRecord.id, partyId: tokenRecord.party_id });
        await this.deactivateToken(tokenRecord.id);
        return null;
      }
      
      // Actualizar último uso
      await tokenRecord.update({
        last_used_at: new Date()
      });
      
      return {
        id: tokenRecord.id,
        party_id: tokenRecord.party_id,
        country_code: tokenRecord.country_code,
        created_at: tokenRecord.created_at,
        expires_at: tokenRecord.expires_at,
        type: 'ocpi_token'
      };
      
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'OCPI_';
    
    // Generar 59 caracteres aleatorios (5 + 59 = 64)
    for (let i = 0; i < 59; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
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
      
      for (const token of expiredTokens) {
        await this.deactivateToken(token.id);
      }
      
      if (expiredTokens.length > 0) {
        logger.info('Expired tokens cleaned up', { count: expiredTokens.length });
      }
      
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
    }
  }
}

module.exports = OCPITokenService;
