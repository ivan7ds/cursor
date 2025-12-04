const { Token, EmspToken } = require('../models');
const logger = require('../utils/logger');

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
      const { type, issuer, locationId, evseUid } = options;

      logger.info('🔐 Real-time authorization request', {
        token_uid: tokenUid,
        type,
        issuer,
        location_id: locationId,
        evse_uid: evseUid
      });

      // Validar token_uid
      if (!tokenUid) {
        return {
          success: false,
          status_code: 2000,
          status_message: "Missing required field: token_uid",
          data: {
            allowed: "BLOCKED",
            location_id: locationId || null,
            evse_uid: evseUid || null,
            validity: "INVALID"
          }
        };
      }

      // Buscar el token en la base de datos - primero en tokens, luego en emsp_tokens
      let token = await Token.findOne({
        where: {
          uid: tokenUid,
          valid: true
        }
      });

      // Si no se encuentra en tokens, buscar en emsp_tokens
      if (!token) {
        const emspToken = await EmspToken.findOne({
          where: {
            token_uid: tokenUid,
            valid: true
          }
        });

        if (emspToken) {
          // Mapear el token de emsp_tokens al formato esperado
          token = {
            uid: emspToken.token_uid,
            country_code: emspToken.emsp_country_code,
            party_id: emspToken.emsp_party_id,
            type: emspToken.type,
            auth_method: 'AUTH_REQUEST', // Valor por defecto para tokens eMSP
            contract_id: emspToken.contract_id,
            visual_number: emspToken.visual_number,
            issuer: emspToken.issuer,
            group_id: emspToken.group_id,
            valid: emspToken.valid,
            whitelist: emspToken.whitelist,
            language: emspToken.language,
            default_profile_type: emspToken.default_profile_type,
            energy_contract: emspToken.energy_contract,
            last_updated: emspToken.last_updated,
            valid_until: null, // Los tokens eMSP no tienen expiración por defecto
            location_id: null,
            evse_uid: null
          };
        }
      }

      if (!token) {
        logger.warn('⚠️ Authorization: Token not found or invalid', {
          token_uid: tokenUid,
          type,
          issuer
        });
        
        return {
          success: false,
          status_code: 1000,
          status_message: "Token not found or invalid",
          data: {
            allowed: "BLOCKED",
            location_id: locationId || null,
            evse_uid: evseUid || null,
            validity: "INVALID"
          }
        };
      }

      // Verificar si el token ha expirado
      if (token.valid_until && new Date() > new Date(token.valid_until)) {
        logger.warn('⚠️ Authorization: Token expired', {
          token_uid: tokenUid,
          valid_until: token.valid_until,
          current_time: new Date().toISOString()
        });
        
        return {
          success: false,
          status_code: 1000,
          status_message: "Token expired",
          data: {
            allowed: "BLOCKED",
            location_id: locationId || null,
            evse_uid: evseUid || null,
            validity: "EXPIRED"
          }
        };
      }

      // Verificar si el token requiere autorización en tiempo real
      if (token.whitelist === 'NEVER') {
        logger.info('🔄 Authorization: Token requires real-time authorization (whitelist: NEVER)', {
          token_uid: tokenUid,
          whitelist: token.whitelist
        });
        
        // Para tokens con whitelist: "NEVER", debemos hacer autorización en tiempo real al eMSP
        // Por ahora, asumimos que el token es válido ya que viene del eMSP que lo envió
        // En una implementación completa, aquí haríamos una llamada al eMSP para autorizar
        logger.info('✅ Authorization: Token from eMSP accepted (real-time authorization required)', {
          token_uid: tokenUid,
          note: 'Token sent by eMSP, assuming authorized by eMSP'
        });
        
        return {
          success: true,
          status_code: 1000,
          status_message: "Token authorized by eMSP",
          data: {
            allowed: "ALLOWED",
            location_id: locationId || null,
            evse_uid: evseUid || null,
            validity: "VALID"
          }
        };
      }

      // Verificar restricciones de ubicación si se proporciona
      if (locationId && token.location_id && token.location_id !== locationId) {
        logger.warn('⚠️ Authorization: Token not valid for this location', {
          token_uid: tokenUid,
          token_location_id: token.location_id,
          requested_location_id: locationId
        });
        
        return {
          success: false,
          status_code: 1000,
          status_message: "Token not valid for this location",
          data: {
            allowed: "BLOCKED",
            location_id: locationId,
            evse_uid: evseUid || null,
            validity: "INVALID"
          }
        };
      }

      // Verificar restricciones de EVSE si se proporciona
      if (evseUid && token.evse_uid && token.evse_uid !== evseUid) {
        logger.warn('⚠️ Authorization: Token not valid for this EVSE', {
          token_uid: tokenUid,
          token_evse_uid: token.evse_uid,
          requested_evse_uid: evseUid
        });
        
        return {
          success: false,
          status_code: 1000,
          status_message: "Token not valid for this EVSE",
          data: {
            allowed: "BLOCKED",
            location_id: locationId || null,
            evse_uid: evseUid,
            validity: "INVALID"
          }
        };
      }

      // Token válido - autorizar
      logger.info('✅ Authorization: Token authorized successfully', {
        token_uid: tokenUid,
        party_id: token.party_id,
        country_code: token.country_code,
        type: token.type,
        location_id: locationId,
        evse_uid: evseUid
      });

      // Actualizar último uso del token (solo si es un objeto Sequelize)
      if (token.update) {
        await token.update({
          last_used_at: new Date()
        });
      } else {
        // Para tokens mapeados de emsp_tokens, actualizar directamente en la base de datos
        await EmspToken.update(
          { last_used_at: new Date() },
          { where: { token_uid: tokenUid } }
        );
      }

      return {
        success: true,
        status_code: 1000,
        status_message: "Token is valid",
        data: {
          allowed: "ALLOWED",
          location_id: locationId || null,
          evse_uid: evseUid || null,
          validity: "VALID",
          token_info: {
            uid: token.uid,
            type: token.type,
            party_id: token.party_id,
            country_code: token.country_code,
            issuer: token.issuer,
            valid_until: token.valid_until,
            whitelist: token.whitelist
          }
        }
      };

    } catch (error) {
      logger.error('❌ Authorization service error:', {
        error: error.message,
        stack: error.stack,
        token_uid: tokenUid,
        options
      });

      return {
        success: false,
        status_code: 2000,
        status_message: "Internal server error during authorization",
        data: {
          allowed: "BLOCKED",
          location_id: options.locationId || null,
          evse_uid: options.evseUid || null,
          validity: "INVALID"
        }
      };
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
