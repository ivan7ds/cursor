/**
 * Construye los valores básicos de la location
 */
function buildBasicLocationValues(location) {
  return [
    location.id,
    location.party_id || null,
    location.country_code || null,
    location.id || null,
    location.name || 'Sin nombre',
    location.address || 'Sin dirección',
    location.city || 'Sin ciudad',
    location.postal_code || null,
    location.country || 'Sin país'
  ];
}

/**
 * Construye los valores JSON de la location
 */
function buildJSONLocationValues(location) {
  return [
    JSON.stringify(location.coordinates || {}),
    JSON.stringify(location.evses || []),
    JSON.stringify(location.operator || {}),
    JSON.stringify(location.suboperator || {}),
    JSON.stringify(location.owner || {}),
    JSON.stringify(location.facilities || []),
    JSON.stringify(location.opening_times || {}),
    JSON.stringify(location.images || []),
    JSON.stringify(location.energy_mix || {})
  ];
}

/**
 * Construye los valores adicionales de la location
 */
function buildAdditionalLocationValues(location) {
  return [
    location.directions || null,
    location.time_zone || 'UTC',
    location.charging_when_closed || null,
    location.last_updated || new Date().toISOString()
  ];
}

module.exports = {
    buildBasicLocationValues,
    buildJSONLocationValues,
    buildAdditionalLocationValues
};

