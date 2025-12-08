/**
 * Construye los valores básicos de la location
 */
function buildBasicLocationValues(locationData, party_id, country_code) {
  return [
    party_id,
    country_code,
    locationData.name || null,
    locationData.address,
    locationData.city,
    locationData.postal_code || null,
    locationData.state || null,
    locationData.country
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
 * Construye los valores JSON de la location
 */
function buildJSONLocationValues(locationData) {
  return [
    stringifyJSONField(locationData.coordinates),
    stringifyJSONField(locationData.related_locations, []),
    stringifyJSONField(locationData.opening_times, null),
    stringifyJSONField(locationData.images, []),
    stringifyJSONField(locationData.energy_mix, null),
    stringifyJSONField(locationData.directions, []),
    stringifyJSONField(locationData.operator, null),
    stringifyJSONField(locationData.suboperator, null),
    stringifyJSONField(locationData.owner, null),
    stringifyJSONField(locationData.facilities, []),
    stringifyJSONField(locationData.publish_allowed_to, [])
  ];
}

/**
 * Construye los valores adicionales de la location
 */
function buildAdditionalLocationValues(locationData) {
  return [
    locationData.parking_type || null,
    locationData.time_zone,
    locationData.charging_when_closed || false,
    locationData.publish,
    locationData.last_updated
  ];
}

module.exports = {
    buildBasicLocationValues,
    buildJSONLocationValues,
    buildAdditionalLocationValues
};

