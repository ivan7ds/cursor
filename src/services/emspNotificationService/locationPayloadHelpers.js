/**
 * Construye los valores básicos del payload de location
 */
function buildBasicLocationPayload(locationData) {
  return {
    country_code: locationData.country_code,
    party_id: locationData.party_id,
    id: locationData.id,
    publish: locationData.publish !== undefined ? locationData.publish : true,
    name: locationData.name,
    address: locationData.address,
    city: locationData.city,
    postal_code: locationData.postal_code,
    country: locationData.country,
    coordinates: locationData.coordinates,
    time_zone: locationData.time_zone
  };
}

const {
  buildArrayLocationPayload,
  buildObjectLocationPayload,
  buildBooleanAndDateLocationPayload
} = require('./locationOptionalPayloadHelpers');

/**
 * Construye los valores opcionales del payload de location
 */
function buildOptionalLocationPayload(locationData) {
  const arrayPayload = buildArrayLocationPayload(locationData);
  const objectPayload = buildObjectLocationPayload(locationData);
  const booleanAndDatePayload = buildBooleanAndDateLocationPayload(locationData);

  return {
    ...arrayPayload,
    ...objectPayload,
    ...booleanAndDatePayload
  };
}

module.exports = {
    buildBasicLocationPayload,
    buildOptionalLocationPayload
};

