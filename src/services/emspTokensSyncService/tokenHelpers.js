const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');

/**
 * Valida los campos obligatorios del token
 * @param {Object} tokenData - Datos del token
 * @param {string} emspPartyId - Party ID del EMSP
 * @param {string} emspCountryCode - Código de país del EMSP
 * @returns {boolean} True si es válido, false en caso contrario
 */
function validateTokenRequiredFields(tokenData, emspPartyId, emspCountryCode) {
  return !!(tokenData.uid && emspPartyId && emspCountryCode && tokenData.type);
}

/**
 * Genera un ID estable para el token
 * @param {string} emspPartyId - Party ID del EMSP
 * @param {string} uid - UID del token
 * @returns {string} ID estable generado
 */
function generateStableTokenId(emspPartyId, uid) {
  return `${emspPartyId}-${uid}`;
}

/**
 * Obtiene un valor con fallback a null
 * @param {*} value - Valor a obtener
 * @returns {*} Valor o null
 */
function getValueOrNull(value) {
  return value !== undefined ? value : null;
}

/**
 * Obtiene el valor de valid con fallback a true
 * @param {*} value - Valor a obtener
 * @returns {boolean} Valor o true por defecto
 */
function getValidValue(value) {
  return value !== undefined ? value : true;
}

/**
 * Convierte energy_contract a JSON string si existe
 * @param {*} energyContract - Contrato de energía
 * @returns {string|null} JSON string o null
 */
function stringifyEnergyContract(energyContract) {
  return energyContract ? JSON.stringify(energyContract) : null;
}

/**
 * Prepara los valores para insertar/actualizar un token
 * @param {Object} params - Parámetros de preparación
 * @param {Object} params.tokenData - Datos del token
 * @param {string} params.emspPartyId - Party ID del EMSP
 * @param {string} params.emspCountryCode - Código de país del EMSP
 * @param {string} params.stableId - ID estable generado
 * @param {string} params.now - Timestamp actual
 * @returns {Array} Array de valores para la query SQL
 */
function prepareTokenValues({ tokenData, emspPartyId, emspCountryCode, stableId, now }) {
  return [
    stableId,
    emspPartyId,
    emspCountryCode,
    tokenData.uid,
    tokenData.type,
    getValueOrNull(tokenData.contract_id),
    getValueOrNull(tokenData.visual_number),
    tokenData.issuer || 'Unknown',
    getValueOrNull(tokenData.group_id),
    getValidValue(tokenData.valid),
    getValueOrNull(tokenData.whitelist),
    getValueOrNull(tokenData.language),
    getValueOrNull(tokenData.default_profile_type),
    stringifyEnergyContract(tokenData.energy_contract),
    tokenData.last_updated || now
  ];
}

/**
 * Inserta o actualiza un token en la base de datos
 * @param {Array} values - Valores para la query SQL
 * @returns {Promise<void>}
 */
async function upsertToken(values) {
  await sequelize.query(`
    INSERT INTO emsp_tokens (
      id, emsp_party_id, emsp_country_code, token_uid, type, contract_id, 
      visual_number, issuer, group_id, valid, whitelist, language, 
      default_profile_type, energy_contract, last_updated, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
      emsp_party_id = EXCLUDED.emsp_party_id,
      emsp_country_code = EXCLUDED.emsp_country_code,
      token_uid = EXCLUDED.token_uid,
      type = EXCLUDED.type,
      contract_id = EXCLUDED.contract_id,
      visual_number = EXCLUDED.visual_number,
      issuer = EXCLUDED.issuer,
      group_id = EXCLUDED.group_id,
      valid = EXCLUDED.valid,
      whitelist = EXCLUDED.whitelist,
      language = EXCLUDED.language,
      default_profile_type = EXCLUDED.default_profile_type,
      energy_contract = EXCLUDED.energy_contract,
      last_updated = EXCLUDED.last_updated,
      updated_at = NOW()
  `, {
    replacements: values
  });
}

module.exports = {
    validateTokenRequiredFields,
    generateStableTokenId,
    prepareTokenValues,
    upsertToken
};

