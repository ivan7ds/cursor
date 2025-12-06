const logger = require('../../../utils/logger');

/**
 * Obtiene locations de una organización externa
 * @param {Object} org - Organización externa
 * @returns {Promise<Array|null>} Array de locations o null si hay error
 */
async function fetchLocationsFromOrganization(org) {
  try {
    logger.info(`🔍 Consultando locations de ${org.party_id} (${org.url})`);

    const locationsUrl = `${org.url}/ocpi/cpo/2.2/locations`;

    const response = await fetch(locationsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${org.token}`,
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
    await Location.create({
      id: location.id,
      country_code: location.country_code || org.country_code,
      party_id: location.party_id || org.party_id,
      name: location.name,
      address: location.address,
      city: location.city,
      postal_code: location.postal_code,
      state: location.state,
      country: location.country,
      coordinates: location.coordinates,
      last_updated: location.last_updated ? new Date(location.last_updated) : new Date()
    });
    return { saved: true, duplicate: false };
  } catch (dbError) {
    if (dbError.name === 'SequelizeUniqueConstraintError') {
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

