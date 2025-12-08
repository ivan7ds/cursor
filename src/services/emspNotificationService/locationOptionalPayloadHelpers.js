/**
 * Construye los valores de arrays del payload de location
 */
function buildArrayLocationPayload(locationData) {
  return {
    related_locations: locationData.related_locations || [],
    evses: locationData.evses || [],
    directions: locationData.directions || [],
    facilities: locationData.facilities || [],
    images: locationData.images || []
  };
}

/**
 * Construye los valores de objetos del payload de location
 */
function buildObjectLocationPayload(locationData) {
  return {
    parking_type: locationData.parking_type,
    operator: locationData.operator || null,
    suboperator: locationData.suboperator || null,
    owner: locationData.owner || null,
    opening_times: locationData.opening_times || null,
    energy_mix: locationData.energy_mix || null
  };
}

/**
 * Construye los valores booleanos y de fecha del payload de location
 */
function buildBooleanAndDateLocationPayload(locationData) {
  return {
    charging_when_closed: locationData.charging_when_closed !== undefined ? locationData.charging_when_closed : false,
    last_updated: locationData.last_updated || new Date().toISOString()
  };
}

module.exports = {
    buildArrayLocationPayload,
    buildObjectLocationPayload,
    buildBooleanAndDateLocationPayload
};

