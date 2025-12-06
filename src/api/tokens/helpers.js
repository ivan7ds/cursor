const { Token, EmspToken } = require('../../models');

/**
 * Mapea un token de la base de datos al formato OCPI 2.2
 */
function mapTokenToOCPI(token) {
  return {
    country_code: token.country_code,
    party_id: token.party_id,
    uid: token.uid,
    type: token.type,
    contract_id: token.contract_id,
    visual_number: token.visual_number,
    issuer: token.issuer,
    group_id: token.group_id,
    valid: token.valid,
    whitelist: token.whitelist,
    language: token.language,
    default_profile_type: token.default_profile_type,
    energy_contract: token.energy_contract,
    last_updated: token.last_updated ? token.last_updated.toISOString() : new Date().toISOString()
  };
}

/**
 * Busca un token por country_code, party_id y uid
 */
async function findToken(country_code, party_id, uid) {
  return EmspToken.findOne({
    where: {
      country_code,
      party_id,
      uid
    }
  });
}

/**
 * Prepara los datos para actualizar un token
 */
function prepareTokenUpdateData(tokenData, country_code, party_id, uid) {
  return {
    ...tokenData,
    country_code,
    party_id,
    uid,
    last_updated: new Date()
  };
}

/**
 * Prepara los datos para crear un token
 */
function prepareTokenCreateData(tokenData, country_code, party_id, uid) {
  return {
    id: require('uuid').v4(),
    ...tokenData,
    country_code,
    party_id,
    uid,
    last_updated: new Date()
  };
}

module.exports = {
    mapTokenToOCPI,
    findToken,
    prepareTokenUpdateData,
    prepareTokenCreateData
};

