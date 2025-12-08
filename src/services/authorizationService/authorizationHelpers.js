const { Token, EmspToken } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Construye una respuesta de autorización bloqueada
 * @param {string} statusMessage - Mensaje de estado
 * @param {string} validity - Validez del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Object} Respuesta de autorización
 */
function buildBlockedResponse(statusMessage, validity, locationId, evseUid) {
  return {
    success: false,
    status_code: 1000,
    status_message: statusMessage,
    data: {
      allowed: "BLOCKED",
      location_id: locationId || null,
      evse_uid: evseUid || null,
      validity
    }
  };
}

/**
 * Construye una respuesta de autorización exitosa
 * @param {Object} token - Token autorizado
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Object} Respuesta de autorización
 */
function buildAllowedResponse(token, locationId, evseUid) {
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
}

/**
 * Valida que el token UID esté presente
 * @param {string} tokenUid - UID del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Object|null} Respuesta de error o null si es válido
 */
function validateTokenUid(tokenUid, locationId, evseUid) {
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
  return null;
}

/**
 * Busca un token en la base de datos
 * @param {string} tokenUid - UID del token
 * @returns {Promise<Object|null>} Token encontrado o null
 */
async function findToken(tokenUid) {
  let token = await Token.findOne({
    where: {
      uid: tokenUid,
      valid: true
    }
  });

  if (!token) {
    const emspToken = await EmspToken.findOne({
      where: {
        token_uid: tokenUid,
        valid: true
      }
    });

    if (emspToken) {
      token = {
        uid: emspToken.token_uid,
        country_code: emspToken.emsp_country_code,
        party_id: emspToken.emsp_party_id,
        type: emspToken.type,
        auth_method: 'AUTH_REQUEST',
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
        valid_until: null,
        location_id: null,
        evse_uid: null
      };
    }
  }

  return token;
}

/**
 * Verifica si el token ha expirado
 * @param {Object} token - Token a verificar
 * @param {string} tokenUid - UID del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Object|null} Respuesta de error o null si no ha expirado
 */
function checkTokenExpiration(token, tokenUid, locationId, evseUid) {
  if (token.valid_until && new Date() > new Date(token.valid_until)) {
    logger.warn('⚠️ Authorization: Token expired', {
      token_uid: tokenUid,
      valid_until: token.valid_until,
      current_time: new Date().toISOString()
    });
    
    return buildBlockedResponse("Token expired", "EXPIRED", locationId, evseUid);
  }
  return null;
}

/**
 * Maneja tokens que requieren autorización en tiempo real
 * @param {Object} token - Token a verificar
 * @param {string} tokenUid - UID del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE
 * @returns {Object|null} Respuesta de autorización o null si no aplica
 */
function handleRealTimeAuthorization(token, tokenUid, locationId, evseUid) {
  if (token.whitelist === 'NEVER') {
    logger.info('🔄 Authorization: Token requires real-time authorization (whitelist: NEVER)', {
      token_uid: tokenUid,
      whitelist: token.whitelist
    });
    
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
  return null;
}

/**
 * Verifica restricciones de ubicación
 * @param {Object} token - Token a verificar
 * @param {string} tokenUid - UID del token
 * @param {string} locationId - ID de ubicación solicitada
 * @param {string} evseUid - UID del EVSE
 * @returns {Object|null} Respuesta de error o null si es válido
 */
function checkLocationRestrictions(token, tokenUid, locationId, evseUid) {
  if (locationId && token.location_id && token.location_id !== locationId) {
    logger.warn('⚠️ Authorization: Token not valid for this location', {
      token_uid: tokenUid,
      token_location_id: token.location_id,
      requested_location_id: locationId
    });
    
    return buildBlockedResponse("Token not valid for this location", "INVALID", locationId, evseUid);
  }
  return null;
}

/**
 * Verifica restricciones de EVSE
 * @param {Object} token - Token a verificar
 * @param {string} tokenUid - UID del token
 * @param {string} locationId - ID de ubicación
 * @param {string} evseUid - UID del EVSE solicitado
 * @returns {Object|null} Respuesta de error o null si es válido
 */
function checkEVSERestrictions(token, tokenUid, locationId, evseUid) {
  if (evseUid && token.evse_uid && token.evse_uid !== evseUid) {
    logger.warn('⚠️ Authorization: Token not valid for this EVSE', {
      token_uid: tokenUid,
      token_evse_uid: token.evse_uid,
      requested_evse_uid: evseUid
    });
    
    return buildBlockedResponse("Token not valid for this EVSE", "INVALID", locationId, evseUid);
  }
  return null;
}

/**
 * Actualiza el último uso del token
 * @param {Object} token - Token a actualizar
 * @param {string} tokenUid - UID del token
 */
async function updateTokenLastUsed(token, tokenUid) {
  if (token.update) {
    await token.update({
      last_used_at: new Date()
    });
  } else {
    await EmspToken.update(
      { last_used_at: new Date() },
      { where: { token_uid: tokenUid } }
    );
  }
}

module.exports = {
    buildBlockedResponse,
    buildAllowedResponse,
    validateTokenUid,
    findToken,
    checkTokenExpiration,
    handleRealTimeAuthorization,
    checkLocationRestrictions,
    checkEVSERestrictions,
    updateTokenLastUsed
};

