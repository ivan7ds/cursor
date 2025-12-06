/**
 * Mapa de campos permitidos para PATCH de locations
 * @returns {Object} Mapa de campos
 */
function getFieldMap() {
  return {
    name: 'name',
    address: 'address',
    city: 'city',
    postal_code: 'postal_code',
    state: 'state',
    country: 'country',
    coordinates: 'coordinates',
    related_locations: 'related_locations',
    // eslint-disable-next-line camelcase -- Campos en snake_case según especificación OCPI
    parking_type: 'parking_type',
    time_zone: 'time_zone',
    opening_times: 'opening_times',
    // eslint-disable-next-line camelcase -- Campos en snake_case según especificación OCPI
    charging_when_closed: 'charging_when_closed',
    images: 'images',
    energy_mix: 'energy_mix',
    directions: 'directions',
    operator: 'operator',
    suboperator: 'suboperator',
    owner: 'owner',
    facilities: 'facilities',
    publish: 'publish',
    // eslint-disable-next-line camelcase -- Campos en snake_case según especificación OCPI
    publish_allowed_to: 'publish_allowed_to',
    last_updated: 'last_updated'
  };
}

/**
 * Lista de campos que deben ser serializados como JSON
 * @returns {Array<string>} Array de nombres de campos JSON
 */
function getJsonFields() {
  return [
    'coordinates', 'related_locations', 'opening_times', 'images', 'energy_mix',
    'directions', 'operator', 'suboperator', 'owner', 'facilities', 'publish_allowed_to'
  ];
}

/**
 * Procesa un campo individual para el update
 * @param {Object} params - Parámetros de procesamiento
 * @param {string} params.key - Clave del campo
 * @param {string} params.dbField - Campo en la base de datos
 * @param {*} params.value - Valor del campo
 * @param {Array<string>} params.jsonFields - Campos que deben ser JSON
 * @param {Array} params.updateFields - Array de campos de actualización
 * @param {Array} params.replacements - Array de replacements
 */
function processField({ key, dbField, value, jsonFields, updateFields, replacements }) {
  updateFields.push(`${dbField} = ?`);
  if (jsonFields.includes(key)) {
    replacements.push(JSON.stringify(value));
  } else {
    replacements.push(value);
  }
}

module.exports = {
    getFieldMap,
    getJsonFields,
    processField
};

