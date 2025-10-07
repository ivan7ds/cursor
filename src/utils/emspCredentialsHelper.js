const { Credentials } = require('../models');
const logger = require('./logger');

/**
 * Helper para obtener credenciales del eMSP dinámicamente
 * basándose en la información del token o sesión
 */
class EMSPCredentialsHelper {
  
  /**
   * Obtiene las credenciales del eMSP basándose en la información del token
   * @param {Object} tokenInfo - Información del token (debe tener party_id y country_code)
   * @returns {Promise<Object|null>} Credenciales del eMSP o null si no se encuentran
   */
  static async getCredentialsByToken(tokenInfo) {
    try {
      if (!tokenInfo || !tokenInfo.party_id || !tokenInfo.country_code) {
        logger.warn('⚠️ Token info missing party_id or country_code', { tokenInfo });
        return null;
      }

      const credentials = await Credentials.findOne({
        where: {
          party_id: tokenInfo.party_id,
          country_code: tokenInfo.country_code,
          valid: true
        }
      });

      if (credentials) {
        logger.info('✅ EMSP credentials found by token info', {
          party_id: tokenInfo.party_id,
          country_code: tokenInfo.country_code,
          url: credentials.url
        });
      } else {
        logger.warn('⚠️ EMSP credentials not found for token info', {
          party_id: tokenInfo.party_id,
          country_code: tokenInfo.country_code
        });
      }

      return credentials;
    } catch (error) {
      logger.error('❌ Error getting EMSP credentials by token info:', error);
      return null;
    }
  }

  /**
   * Obtiene las credenciales del eMSP basándose en la información de la sesión
   * @param {Object} session - Objeto de sesión (debe tener party_id y country_code)
   * @returns {Promise<Object|null>} Credenciales del eMSP o null si no se encuentran
   */
  static async getCredentialsBySession(session) {
    try {
      if (!session || !session.party_id || !session.country_code) {
        logger.warn('⚠️ Session missing party_id or country_code', { 
          session_id: session?.id,
          party_id: session?.party_id,
          country_code: session?.country_code
        });
        return null;
      }

      const credentials = await Credentials.findOne({
        where: {
          party_id: session.party_id,
          country_code: session.country_code,
          valid: true
        }
      });

      if (credentials) {
        logger.info('✅ EMSP credentials found by session info', {
          party_id: session.party_id,
          country_code: session.country_code,
          url: credentials.url
        });
      } else {
        logger.warn('⚠️ EMSP credentials not found for session info', {
          party_id: session.party_id,
          country_code: session.country_code
        });
      }

      return credentials;
    } catch (error) {
      logger.error('❌ Error getting EMSP credentials by session info:', error);
      return null;
    }
  }

  /**
   * Obtiene las credenciales del eMSP basándose en el CDR
   * @param {Object} cdr - Objeto CDR (debe tener party_id y country_code)
   * @returns {Promise<Object|null>} Credenciales del eMSP o null si no se encuentran
   */
  static async getCredentialsByCDR(cdr) {
    try {
      if (!cdr || !cdr.party_id || !cdr.country_code) {
        logger.warn('⚠️ CDR missing party_id or country_code', { 
          cdr_id: cdr?.id,
          party_id: cdr?.party_id,
          country_code: cdr?.country_code
        });
        return null;
      }

      const credentials = await Credentials.findOne({
        where: {
          party_id: cdr.party_id,
          country_code: cdr.country_code,
          valid: true
        }
      });

      if (credentials) {
        logger.info('✅ EMSP credentials found by CDR info', {
          party_id: cdr.party_id,
          country_code: cdr.country_code,
          url: credentials.url
        });
      } else {
        logger.warn('⚠️ EMSP credentials not found for CDR info', {
          party_id: cdr.party_id,
          country_code: cdr.country_code
        });
      }

      return credentials;
    } catch (error) {
      logger.error('❌ Error getting EMSP credentials by CDR info:', error);
      return null;
    }
  }

  /**
   * Obtiene todas las credenciales de eMSPs válidas
   * @returns {Promise<Array>} Lista de credenciales de eMSPs
   */
  static async getAllValidCredentials() {
    try {
      const credentials = await Credentials.findAll({
        where: {
          valid: true,
          party_id: {
            [require('sequelize').Op.ne]: process.env.OCPI_PARTY_ID || 'IPD' // Excluir nuestro CPO
          }
        }
      });

      logger.info(`📋 Found ${credentials.length} valid EMSP credentials`);
      return credentials;
    } catch (error) {
      logger.error('❌ Error getting all valid EMSP credentials:', error);
      return [];
    }
  }
}

module.exports = EMSPCredentialsHelper;
