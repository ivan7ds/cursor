/**
 * Construye los valores básicos del token
 */
function buildBasicTokenValues(token, stableId) {
  return [
    stableId,
    token.party_id,
    token.country_code,
    token.uid,
    token.type
  ];
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
 * Obtiene el timestamp de última actualización
 * @param {*} lastUpdated - Timestamp proporcionado
 * @returns {string} Timestamp ISO
 */
function getLastUpdated(lastUpdated) {
  return lastUpdated || new Date().toISOString();
}

/**
 * Construye los valores opcionales del token
 */
function buildOptionalTokenValues(token) {
  return [
    getValueOrNull(token.contract_id),
    getValueOrNull(token.visual_number),
    token.issuer || 'Unknown',
    getValueOrNull(token.group_id),
    getValidValue(token.valid),
    getValueOrNull(token.whitelist),
    getValueOrNull(token.language),
    getValueOrNull(token.default_profile_type),
    stringifyEnergyContract(token.energy_contract),
    getLastUpdated(token.last_updated)
  ];
}

module.exports = {
    buildBasicTokenValues,
    buildOptionalTokenValues
};

