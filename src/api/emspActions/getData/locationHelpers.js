const logger = require('../../../utils/logger');
const { buildAuthorizationHeader } = require('../../../utils/tokenEncoding');
const { buildUrl } = require('../../../utils/urlSanitizer');
const { sequelize } = require('../../../database/connection');

/**
 * Obtiene locations de una organización externa
 * @param {Object} org - Organización externa
 * @returns {Promise<Array|null>} Array de locations o null si hay error
 */
async function fetchLocationsFromOrganization(org) {
  try {
    logger.info(`🔍 Consultando locations de ${org.party_id} (${org.url})`);

    const locationsUrl = buildUrl(org.url, '/ocpi/cpo/2.2/locations');

    const response = await fetch(locationsUrl, {
      method: 'GET',
      headers: {
        'Authorization': buildAuthorizationHeader(org.token, org.token_base64_encoded || false),
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        logger.info(`📥 Procesando ${data.data.length} locations de ${org.party_id}`);
        return data.data;
      }
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} - ${errorText}`);
    }
  } catch (error) {
    logger.error(`❌ Error consultando ${org.party_id}:`, error);
    throw error;
  }
  
  return null;
}

/**
 * Guarda una location individual en la base de datos
 * @param {Object} location - Datos de la location
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con saved y duplicate
 */
async function saveLocation(location, org) {
  try {
    // Validar que time_zone esté presente (campo obligatorio según OCPI 2.2.1)
    if (!location.time_zone) {
      const error = new Error(`Location ${location.id} from ${org.party_id} is missing required field 'time_zone' (OCPI 2.2.1 violation)`);
      error.ocpiViolation = true;
      error.missingField = 'time_zone';
      error.locationId = location.id;
      error.organizationId = org.party_id;
      throw error;
    }

    const partyId = location.party_id || org.party_id;
    const countryCode = location.country_code || org.country_code;

    // Guardar en external_operator_locations (no en locations) para que aparezca en la pestaña Ext Locations
    await sequelize.query(`
      INSERT INTO external_operator_locations (
        id, external_operator_party_id, external_operator_country_code, location_id, name, address, city, 
        postal_code, country, coordinates, evses, directions, operator, 
        suboperator, owner, facilities, time_zone, opening_times, 
        charging_when_closed, images, energy_mix, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) 
      DO UPDATE SET
        external_operator_party_id = EXCLUDED.external_operator_party_id,
        external_operator_country_code = EXCLUDED.external_operator_country_code,
        location_id = EXCLUDED.location_id,
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        coordinates = EXCLUDED.coordinates,
        evses = EXCLUDED.evses,
        directions = EXCLUDED.directions,
        operator = EXCLUDED.operator,
        suboperator = EXCLUDED.suboperator,
        owner = EXCLUDED.owner,
        facilities = EXCLUDED.facilities,
        time_zone = EXCLUDED.time_zone,
        opening_times = EXCLUDED.opening_times,
        charging_when_closed = EXCLUDED.charging_when_closed,
        images = EXCLUDED.images,
        energy_mix = EXCLUDED.energy_mix,
        last_updated = EXCLUDED.last_updated,
        updated_at = NOW()
    `, {
      replacements: [
        location.id,
        partyId,
        countryCode,
        location.id,
        location.name,
        location.address,
        location.city,
        location.postal_code || null,
        location.country,
        JSON.stringify(location.coordinates),
        JSON.stringify(location.evses || []),
        location.directions ? JSON.stringify(location.directions) : null,
        location.operator ? JSON.stringify(location.operator) : null,
        location.suboperator ? JSON.stringify(location.suboperator) : null,
        location.owner ? JSON.stringify(location.owner) : null,
        location.facilities ? JSON.stringify(location.facilities) : null,
        location.time_zone,
        location.opening_times ? JSON.stringify(location.opening_times) : null,
        location.charging_when_closed || null,
        location.images ? JSON.stringify(location.images) : null,
        location.energy_mix ? JSON.stringify(location.energy_mix) : null,
        location.last_updated ? new Date(location.last_updated).toISOString() : new Date().toISOString()
      ]
    });

    return { saved: true, duplicate: false };
  } catch (dbError) {
    // Verificar si es un error de constraint único (duplicado)
    if (dbError.message && dbError.message.includes('duplicate key') || 
        dbError.message && dbError.message.includes('unique constraint')) {
      return { saved: false, duplicate: true };
    } else {
      logger.error(`❌ Error guardando location ${location.id}:`, dbError.message);
      throw dbError;
    }
  }
}

/**
 * Procesa una location individual
 * @param {Object} location - Datos de la location
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con la location procesada y el resultado
 */
async function processSingleLocation(location, org) {
  const processedLocation = {
    ...location,
    // eslint-disable-next-line camelcase -- Campo requerido por la estructura de datos
    source_organization: {
      party_id: org.party_id,
      country_code: org.country_code,
      url: org.url
    }
  };

  const result = await saveLocation(location, org);
  return { processedLocation, result };
}

/**
 * Procesa y guarda locations de una organización
 * @param {Array} locations - Array de locations
 * @param {Object} org - Organización externa
 * @param {Array} allLocations - Array acumulativo de todas las locations
 * @param {Array} errors - Array de errores
 * @returns {Promise<Object>} Objeto con savedCount y duplicateCount
 */
async function processLocationsFromOrg(locations, org, allLocations, errors) {
  let savedCount = 0;
  let duplicateCount = 0;

  // Crear promesas para procesar todas las locations en paralelo
  const locationPromises = locations.map(location => processSingleLocation(location, org));

  // Ejecutar todas las promesas y procesar resultados
  const results = await Promise.allSettled(locationPromises);

  results.forEach((settledResult) => {
    if (settledResult.status === 'fulfilled') {
      const { processedLocation, result } = settledResult.value;
      allLocations.push(processedLocation);
      
      if (result.saved) {
        savedCount++;
      } else if (result.duplicate) {
        duplicateCount++;
      }
    } else {
      logger.error(`❌ Error procesando location:`, settledResult.reason);
      errors.push(`Error procesando location: ${settledResult.reason.message}`);
    }
  });

  return { savedCount, duplicateCount };
}

/**
 * Construye la respuesta exitosa para obtener locations externas
 * @param {Object} params - Parámetros de la respuesta
 * @param {Array} params.allLocations - Todas las locations obtenidas
 * @param {number} params.organizationsCount - Número de organizaciones consultadas
 * @param {number} params.savedCount - Número de locations guardadas
 * @param {number} params.duplicateCount - Número de locations duplicadas
 * @param {Array} params.errors - Array de errores
 * @returns {Object} Respuesta JSON
 */
function buildGetLocationsResponse({ allLocations, organizationsCount, savedCount, duplicateCount, errors }) {
  return {
    status_code: 1000,
    data: allLocations,
    metadata: {
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      total_locations: allLocations.length,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      organizations_consulted: organizationsCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      locations_saved: savedCount,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      locations_duplicates: duplicateCount,
      errors,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    fetchLocationsFromOrganization,
    processLocationsFromOrg,
    buildGetLocationsResponse
};

