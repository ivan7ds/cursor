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
    logger.info(`🔐 Token info: token=${org.token ? org.token.substring(0, 20) + '...' : 'MISSING'}, token_base64_encoded=${org.token_base64_encoded || false}`);

    const locationsUrl = buildUrl(org.url, '/ocpi/cpo/2.2/locations');
    const authHeader = buildAuthorizationHeader(org.token, org.token_base64_encoded || false);
    logger.info(`🔐 Authorization header: ${authHeader.substring(0, 30)}...`);

    const response = await fetch(locationsUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
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
 * Valida una location contra el esquema OCPI 2.2 (para respuestas GET)
 * Valida campos obligatorios según OCPI 2.2 pero es más flexible con campos opcionales
 * @param {Object} location - Datos de la location a validar
 * @param {Object} org - Organización externa
 * @returns {Object} Resultado de validación { valid: boolean, errors: Array, value: Object }
 */
function validateLocationOCPI(location, org) {
  const errors = [];
  const warnings = [];

  // Validar campos obligatorios según OCPI 2.2
  if (!location.id) {
    errors.push({ field: 'id', message: 'id is required', type: 'required' });
  } else if (typeof location.id !== 'string' || location.id.length > 36) {
    errors.push({ field: 'id', message: 'id must be a string with at most 36 characters', type: 'format' });
  }

  if (!location.country_code && !org.country_code) {
    errors.push({ field: 'country_code', message: 'country_code is required', type: 'required' });
  } else if (location.country_code && (typeof location.country_code !== 'string' || location.country_code.length !== 2)) {
    errors.push({ field: 'country_code', message: 'country_code must be exactly 2 characters (ISO-3166 alpha-2)', type: 'format' });
  }

  if (!location.party_id && !org.party_id) {
    errors.push({ field: 'party_id', message: 'party_id is required', type: 'required' });
  } else if (location.party_id && (typeof location.party_id !== 'string' || location.party_id.length > 3)) {
    errors.push({ field: 'party_id', message: 'party_id must be at most 3 characters', type: 'format' });
  }

  if (!location.address) {
    errors.push({ field: 'address', message: 'address is required', type: 'required' });
  } else if (typeof location.address !== 'string' || location.address.length > 45) {
    errors.push({ field: 'address', message: 'address must be a string with at most 45 characters', type: 'format' });
  }

  if (!location.city) {
    errors.push({ field: 'city', message: 'city is required', type: 'required' });
  } else if (typeof location.city !== 'string' || location.city.length > 45) {
    errors.push({ field: 'city', message: 'city must be a string with at most 45 characters', type: 'format' });
  }

  if (!location.country) {
    errors.push({ field: 'country', message: 'country is required', type: 'required' });
  } else if (typeof location.country !== 'string' || location.country.length !== 3) {
    errors.push({ field: 'country', message: 'country must be exactly 3 characters (ISO 3166-1 alpha-3)', type: 'format' });
  }

  if (!location.coordinates) {
    errors.push({ field: 'coordinates', message: 'coordinates is required', type: 'required' });
  } else if (typeof location.coordinates !== 'object' || !location.coordinates.latitude || !location.coordinates.longitude) {
    errors.push({ field: 'coordinates', message: 'coordinates must be a valid GeoLocation object with latitude and longitude', type: 'format' });
  } else {
    // Validar formato de coordenadas
    const latPattern = /^-?[0-9]{1,2}\.[0-9]{5,7}$/;
    const lonPattern = /^-?[0-9]{1,3}\.[0-9]{5,7}$/;
    if (typeof location.coordinates.latitude !== 'string' || !latPattern.test(location.coordinates.latitude)) {
      errors.push({ field: 'coordinates.latitude', message: 'latitude must be a valid coordinate string', type: 'format' });
    }
    if (typeof location.coordinates.longitude !== 'string' || !lonPattern.test(location.coordinates.longitude)) {
      errors.push({ field: 'coordinates.longitude', message: 'longitude must be a valid coordinate string', type: 'format' });
    }
  }

  if (!location.time_zone) {
    errors.push({ field: 'time_zone', message: 'time_zone is required (OCPI 2.2.1)', type: 'required' });
  } else if (typeof location.time_zone !== 'string' || location.time_zone.length > 255) {
    errors.push({ field: 'time_zone', message: 'time_zone must be a string with at most 255 characters (IANA tzdata TZ-value)', type: 'format' });
  }

  if (!location.last_updated) {
    errors.push({ field: 'last_updated', message: 'last_updated is required', type: 'required' });
  } else {
    // Validar formato de fecha ISO 8601
    const date = new Date(location.last_updated);
    if (isNaN(date.getTime())) {
      errors.push({ field: 'last_updated', message: 'last_updated must be a valid ISO 8601 date-time string', type: 'format' });
    }
  }

  // Validar campos opcionales si están presentes
  if (location.evses && !Array.isArray(location.evses)) {
    warnings.push({ field: 'evses', message: 'evses should be an array if present', type: 'format' });
  }

  if (location.facilities && Array.isArray(location.facilities)) {
    // Validar que los facilities sean válidos según OCPI 2.2
    const validFacilities = ['PARKING_RESTAURANT', 'HOTEL', 'RESTAURANT', 'CAFE', 'MALL', 'SUPERMARKET', 'SPORT', 'RECREATION_AREA', 'NATURE', 'MUSEUM', 'BIKE_SHARING', 'BUS_STOP', 'TAXI_STAND', 'TRAM_STOP', 'METRO_STATION', 'TRAIN_STATION', 'AIRPORT', 'PARKING_ENTRANCE', 'OTHER', 'UNKNOWN'];
    location.facilities.forEach((facility, index) => {
      if (!validFacilities.includes(facility)) {
        warnings.push({ field: `facilities[${index}]`, message: `facility '${facility}' is not a valid OCPI 2.2 facility type`, type: 'enum' });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    value: errors.length === 0 ? location : null
  };
}

/**
 * Guarda una location individual en la base de datos
 * @param {Object} location - Datos de la location
 * @param {Object} org - Organización externa
 * @returns {Promise<Object>} Objeto con saved y duplicate
 */
async function saveLocation(location, org) {
  try {
    // Validar la location contra el esquema OCPI 2.2
    const validation = validateLocationOCPI(location, org);
    
    if (!validation.valid) {
      const errorMessages = validation.errors.map(err => `${err.field}: ${err.message}`).join('; ');
      const warningMessages = validation.warnings.length > 0 
        ? '; Warnings: ' + validation.warnings.map(w => `${w.field}: ${w.message}`).join('; ')
        : '';
      
      logger.warn(`⚠️ Location ${location.id} from ${org.party_id} failed OCPI 2.2 validation:`, {
        location_id: location.id,
        organization: org.party_id,
        errors: validation.errors,
        warnings: validation.warnings
      });
      
      // Loguear errores de validación pero continuar procesando
      // Esto permite identificar problemas de conformidad OCPI sin bloquear el proceso
      // Si se quiere rechazar locations inválidas, descomentar la siguiente línea:
      // throw new Error(`Location ${location.id} does not conform to OCPI 2.2: ${errorMessages}${warningMessages}`);
    } else {
      if (validation.warnings.length > 0) {
        logger.info(`⚠️ Location ${location.id} from ${org.party_id} passed OCPI validation with warnings:`, {
          location_id: location.id,
          warnings: validation.warnings
        });
      } else {
        logger.debug(`✅ Location ${location.id} from ${org.party_id} passed OCPI 2.2 validation`);
      }
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
 * Guarda un EVSE individual en la base de datos
 * @param {Object} evse - Datos del EVSE
 * @param {Object} location - Datos de la location padre
 * @param {Object} org - Organización externa
 * @returns {Promise<void>}
 */
async function saveEVSE(evse, location, org) {
  const partyId = location.party_id || org.party_id;
  const countryCode = location.country_code || org.country_code;
  const evseUid = evse.uid || evse.id;
  const evseId = evse.evse_id || evseUid;

  if (!evseUid) {
    throw new Error(`EVSE sin uid o id en location ${location.id}`);
  }

  await sequelize.query(`
    INSERT INTO external_operator_evses (
      id, external_operator_party_id, external_operator_country_code, location_id, evse_id, 
      status, capabilities, connectors, floor_level, coordinates, physical_reference, 
      directions, parking_restrictions, group_id, last_updated, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
      external_operator_party_id = EXCLUDED.external_operator_party_id,
      external_operator_country_code = EXCLUDED.external_operator_country_code,
      location_id = EXCLUDED.location_id,
      evse_id = EXCLUDED.evse_id,
      status = EXCLUDED.status,
      capabilities = EXCLUDED.capabilities,
      connectors = EXCLUDED.connectors,
      floor_level = EXCLUDED.floor_level,
      coordinates = EXCLUDED.coordinates,
      physical_reference = EXCLUDED.physical_reference,
      directions = EXCLUDED.directions,
      parking_restrictions = EXCLUDED.parking_restrictions,
      group_id = EXCLUDED.group_id,
      last_updated = EXCLUDED.last_updated,
      updated_at = NOW()
  `, {
    replacements: [
      evseUid,
      partyId,
      countryCode,
      location.id,
      evseId,
      evse.status || 'UNKNOWN',
      evse.capabilities ? JSON.stringify(evse.capabilities) : null,
      JSON.stringify(evse.connectors || []),
      evse.floor_level || null,
      evse.coordinates ? JSON.stringify(evse.coordinates) : null,
      evse.physical_reference || null,
      evse.directions ? JSON.stringify(evse.directions) : null,
      evse.parking_restrictions ? JSON.stringify(evse.parking_restrictions) : null,
      evse.group_id || null,
      evse.last_updated || location.last_updated || new Date().toISOString()
    ]
  });
}

/**
 * Procesa y guarda los EVSEs de una location
 * @param {Object} location - Datos de la location
 * @param {Object} org - Organización externa
 * @param {Array} errors - Array de errores para agregar errores
 * @returns {Promise<number>} Número de EVSEs guardados exitosamente
 */
async function processLocationEVSEs(location, org, errors) {
  if (!location.evses || !Array.isArray(location.evses) || location.evses.length === 0) {
    return 0;
  }

  logger.info(`🔌 Procesando ${location.evses.length} EVSEs para location ${location.id}`);

  // Crear promesas para procesar todos los EVSEs en paralelo
  const evsePromises = location.evses.map(async (evse) => {
    try {
      await saveEVSE(evse, location, org);
      logger.info(`✅ EVSE ${evse.uid || evse.id} guardado exitosamente para location ${location.id}`);
      return { success: true };
    } catch (evseError) {
      logger.error(`❌ Error guardando EVSE ${evse.uid || evse.id}:`, evseError);
      errors.push(`EVSE ${evse.uid || evse.id} en location ${location.id}: ${evseError.message}`);
      return { success: false };
    }
  });

  // Ejecutar todas las promesas y contar éxitos
  const results = await Promise.allSettled(evsePromises);
  const savedCount = results.filter(result => 
    result.status === 'fulfilled' && result.value.success
  ).length;

  return savedCount;
}

/**
 * Procesa una location individual
 * @param {Object} location - Datos de la location
 * @param {Object} org - Organización externa
 * @param {Array} errors - Array de errores
 * @returns {Promise<Object>} Objeto con la location procesada y el resultado
 */
async function processSingleLocation(location, org, errors) {
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
  
  // Si la location se guardó exitosamente, procesar los EVSEs
  if (result.saved && location.evses && Array.isArray(location.evses) && location.evses.length > 0) {
    await processLocationEVSEs(location, org, errors);
  }
  
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
  const locationPromises = locations.map(location => processSingleLocation(location, org, errors));

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

