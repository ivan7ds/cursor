/**
 * Construye coordenadas por defecto
 */
function buildDefaultCoordinates() {
  return {
    latitude: '0.0000000',
    longitude: '0.0000000'
  };
}

/**
 * Construye la información básica de ubicación del CDR
 */
function buildBasicLocationInfo(locationData) {
  return {
    id: locationData?.id || 'unknown',
    name: locationData?.name || 'Unknown Location',
    address: locationData?.address || 'Unknown Address',
    city: locationData?.city || 'Unknown City',
    postal_code: locationData?.postal_code || null,
    country: locationData?.country || process.env.OCPI_COUNTRY_CODE || 'ES',
    coordinates: locationData?.coordinates || buildDefaultCoordinates()
  };
}

/**
 * Construye la información de EVSE del CDR
 */
function buildEVSEInfo(evseData) {
  return {
    evse_uid: evseData?.uid || evseData?.id || 'unknown',
    evse_id: evseData?.evse_id || 'unknown'
  };
}

module.exports = {
    buildBasicLocationInfo,
    buildEVSEInfo,
    buildDefaultCoordinates
};

