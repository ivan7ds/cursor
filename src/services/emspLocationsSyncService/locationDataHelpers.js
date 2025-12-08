/**
 * Construye los valores básicos de la location para actualización
 */
function buildBasicUpdateValues(location, partyId, countryCode) {
  return [
    partyId,
    countryCode,
    location.id,
    location.name || 'Unknown',
    location.address || 'Address not provided',
    location.city || 'Unknown',
    location.postal_code || '00000',
    location.country || countryCode
  ];
}

/**
 * Convierte un campo a JSON string con valor por defecto
 * @param {*} value - Valor a convertir
 * @param {*} defaultValue - Valor por defecto
 * @returns {string} JSON string
 */
function stringifyJSONField(value, defaultValue) {
  return JSON.stringify(value !== undefined ? value : defaultValue);
}

/**
 * Construye los valores JSON de la location para actualización
 */
function buildJSONUpdateValues(location) {
  return [
    stringifyJSONField(location.coordinates, {}),
    stringifyJSONField(location.evses, []),
    stringifyJSONField(location.directions, []),
    stringifyJSONField(location.operator, {}),
    stringifyJSONField(location.suboperator, {}),
    stringifyJSONField(location.owner, {}),
    stringifyJSONField(location.facilities, []),
    stringifyJSONField(location.opening_times, {}),
    stringifyJSONField(location.images, []),
    stringifyJSONField(location.energy_mix, {})
  ];
}

/**
 * Construye los valores adicionales de la location para actualización
 */
function buildAdditionalUpdateValues(location) {
  return [
    location.time_zone || 'Europe/Madrid',
    location.charging_when_closed || false,
    location.last_updated || new Date().toISOString(),
    location.id
  ];
}

/**
 * Construye los valores básicos de la location para inserción
 */
function buildBasicInsertValues(location, partyId, countryCode) {
  return [
    location.id,
    partyId,
    countryCode,
    location.id,
    location.name || 'Unknown',
    location.address || 'Address not provided',
    location.city || 'Unknown',
    location.postal_code || '00000',
    location.country || countryCode
  ];
}

/**
 * Construye los valores JSON de la location para inserción
 */
function buildJSONInsertValues(location) {
  return [
    stringifyJSONField(location.coordinates, {}),
    stringifyJSONField(location.evses, []),
    stringifyJSONField(location.directions, []),
    stringifyJSONField(location.operator, {}),
    stringifyJSONField(location.suboperator, {}),
    stringifyJSONField(location.owner, {}),
    stringifyJSONField(location.facilities, []),
    stringifyJSONField(location.opening_times, {}),
    stringifyJSONField(location.images, []),
    stringifyJSONField(location.energy_mix, {})
  ];
}

/**
 * Construye los valores adicionales de la location para inserción
 */
function buildAdditionalInsertValues(location) {
  return [
    location.time_zone || 'Europe/Madrid',
    location.charging_when_closed || false,
    location.last_updated || new Date().toISOString()
  ];
}

module.exports = {
    buildBasicUpdateValues,
    buildJSONUpdateValues,
    buildAdditionalUpdateValues,
    buildBasicInsertValues,
    buildJSONInsertValues,
    buildAdditionalInsertValues
};

