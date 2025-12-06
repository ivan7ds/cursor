const { EVSE, Location } = require('../../../models');
const logger = require('../../../utils/logger');

/**
 * Obtiene el EVSE y Location asociados a una sesión
 */
async function getEVSEAndLocation(session) {
  const evse = await EVSE.findByPk(session.evse_uid);
  if (!evse) {
    logger.warn(`⚠️ EVSE ${session.evse_uid} no encontrado para CDR`);
    return { evse: null, location: null };
  }

  const location = await Location.findByPk(evse.location_id);
  if (!location) {
    logger.warn(`⚠️ Location ${evse.location_id} no encontrada para CDR`);
    return { evse: null, location: null };
  }

  return { evse, location };
}

/**
 * Construye los datos de sesión para el CDR
 */
function buildSessionData(session) {
  return {
    id: session.id,
    start_date_time: session.start_datetime,
    end_date_time: session.end_datetime,
    kwh: session.kwh || 0.0,
    currency: 'EUR',
    total_cost: session.total_cost || 0.0,
    auth_id: {
      uid: session.auth_id || session.id,
      type: 'OTHER',
      contract_id: 'IPD-001'
    },
    auth_method: 'AUTH_REQUEST',
    connector_id: session.connector_id || '1',
    charging_periods: session.charging_periods || []
  };
}

/**
 * Construye los datos de location para el CDR
 */
function buildLocationData(location) {
  return {
    id: location.id,
    name: location.name,
    address: location.address,
    city: location.city,
    postal_code: location.postal_code,
    country: location.country,
    coordinates: location.coordinates
  };
}

/**
 * Construye los datos de EVSE para el CDR
 */
function buildEVSEData(evse) {
  return {
    uid: evse.id,
    evse_id: evse.evse_id,
    connectors: evse.connectors || []
  };
}

module.exports = {
    getEVSEAndLocation,
    buildSessionData,
    buildLocationData,
    buildEVSEData
};

