const { EmspToken } = require('../../models');
const logger = require('../../utils/logger');

/**
 * Busca un token existente en la base de datos
 * @param {string} countryCode - Country code
 * @param {string} partyId - Party ID
 * @param {string} uid - Token UID
 * @returns {Promise<Object|null>} Token encontrado o null
 */
async function findToken(countryCode, partyId, uid) {
  return await EmspToken.findOne({
    where: {
      external_operator_country_code: countryCode,
      external_operator_party_id: partyId,
      token_uid: uid
    }
  });
}

/**
 * Prepara los datos para actualizar un token existente
 * @param {Object} tokenData - Datos del token del request
 * @param {string} countryCode - Country code
 * @param {string} partyId - Party ID
 * @param {string} uid - Token UID
 * @returns {Object} Datos para actualizar
 */
function prepareTokenUpdateData(tokenData, countryCode, partyId, uid) {
  return {
    type: tokenData.type,
    contract_id: tokenData.contract_id || `${countryCode}-${partyId}-${uid}`,
    issuer: tokenData.issuer,
    valid: tokenData.valid !== undefined ? tokenData.valid : true,
    whitelist: tokenData.whitelist || 'NEVER',
    language: tokenData.language || null,
    default_profile_type: tokenData.default_profile_type || null,
    energy_contract: tokenData.energy_contract || null,
    last_updated: new Date()
  };
}

/**
 * Prepara los datos para crear un nuevo token
 * @param {Object} tokenData - Datos del token del request
 * @param {string} countryCode - Country code
 * @param {string} partyId - Party ID
 * @param {string} uid - Token UID
 * @returns {Object} Datos para crear
 */
function prepareTokenCreateData(tokenData, countryCode, partyId, uid) {
  const tokenId = `${partyId}-${uid}`;
  
  return {
    id: tokenId,
    external_operator_party_id: partyId,
    external_operator_country_code: countryCode,
    token_uid: uid,
    type: tokenData.type,
    contract_id: tokenData.contract_id || `${countryCode}-${partyId}-${uid}`,
    issuer: tokenData.issuer,
    valid: tokenData.valid !== undefined ? tokenData.valid : true,
    whitelist: tokenData.whitelist || 'NEVER',
    language: tokenData.language || null,
    default_profile_type: tokenData.default_profile_type || null,
    energy_contract: tokenData.energy_contract || null,
    last_updated: new Date()
  };
}

/**
 * Mapea un token de la base de datos al formato OCPI 2.2
 * Maneja tanto tokens regulares (Token) como tokens EMSP (EmspToken)
 * @param {Object} token - Token de la base de datos
 * @returns {Object} Token mapeado según OCPI 2.2
 */
function mapTokenToOCPI(token) {
  // Determinar si es un token de operador externo o un token regular
  const isExternalOperatorToken = token.external_operator_country_code !== undefined;
  
  const mappedToken = {
    country_code: isExternalOperatorToken ? token.external_operator_country_code : token.country_code,
    party_id: isExternalOperatorToken ? token.external_operator_party_id : token.party_id,
    uid: isEmspToken ? token.token_uid : token.uid,
    type: token.type,
    contract_id: token.contract_id,
    issuer: token.issuer,
    valid: token.valid,
    whitelist: token.whitelist,
    last_updated: token.last_updated.toISOString()
  };

  // Agregar campos opcionales si existen
  if (token.visual_number) {
    mappedToken.visual_number = token.visual_number;
  }
  
  if (token.group_id) {
    mappedToken.group_id = token.group_id;
  }
  
  if (token.language) {
    mappedToken.language = token.language;
  }
  
  if (token.default_profile_type) {
    mappedToken.default_profile_type = token.default_profile_type;
  }
  
  if (token.energy_contract) {
    mappedToken.energy_contract = token.energy_contract;
  }

  return mappedToken;
}

module.exports = {
    findToken,
    prepareTokenUpdateData,
    prepareTokenCreateData,
    mapTokenToOCPI
};

