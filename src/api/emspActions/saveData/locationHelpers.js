const { sequelize } = require('../../../database/connection');
const logger = require('../../../utils/logger');

const {
  buildBasicLocationValues,
  buildJSONLocationValues,
  buildAdditionalLocationValues
} = require('./locationValuesHelpers');

/**
 * Prepara los valores para insertar/actualizar una location
 * @param {Object} location - Datos de la location
 * @returns {Array} Array de valores para la query SQL
 */
function prepareLocationValues(location) {
  const basicValues = buildBasicLocationValues(location);
  const jsonValues = buildJSONLocationValues(location);
  const additionalValues = buildAdditionalLocationValues(location);

  return [
    ...basicValues,
    ...jsonValues,
    additionalValues[0], // directions
    ...jsonValues.slice(3, 6), // operator, suboperator, owner
    ...jsonValues.slice(6, 7), // facilities
    additionalValues[1], // time_zone
    ...jsonValues.slice(7, 8), // opening_times
    additionalValues[2], // charging_when_closed
    ...jsonValues.slice(8, 10), // images, energy_mix
    additionalValues[3] // last_updated
  ];
}

/**
 * Guarda una location en la base de datos
 * @param {Object} location - Datos de la location
 * @returns {Promise<void>}
 */
async function saveLocation(location) {
  const values = prepareLocationValues(location);
  
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
    replacements: values
  });
}

/**
 * Guarda un EVSE en la base de datos
 * @param {Object} evse - Datos del EVSE
 * @param {Object} location - Datos de la location padre
 * @returns {Promise<void>}
 */
async function saveEVSE(evse, location) {
  await sequelize.query(`
    INSERT INTO external_operator_evses (
      id, external_operator_party_id, external_operator_country_code, location_id, evse_id, 
      status, capabilities, connectors, physical_reference, 
      last_updated, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
      external_operator_party_id = EXCLUDED.external_operator_party_id,
      external_operator_country_code = EXCLUDED.external_operator_country_code,
      location_id = EXCLUDED.location_id,
      evse_id = EXCLUDED.evse_id,
      status = EXCLUDED.status,
      capabilities = EXCLUDED.capabilities,
      connectors = EXCLUDED.connectors,
      physical_reference = EXCLUDED.physical_reference,
      last_updated = EXCLUDED.last_updated,
      updated_at = NOW()
  `, {
    replacements: [
      evse.uid,
      location.party_id,
      location.country_code,
      location.id,
      evse.evse_id,
      evse.status,
      JSON.stringify(evse.capabilities || []),
      JSON.stringify(evse.connectors || []),
      evse.physical_reference || null,
      evse.last_updated || new Date().toISOString()
    ]
  });
}

/**
 * Procesa y guarda los EVSEs de una location
 * @param {Object} location - Datos de la location
 * @param {Array} errors - Array de errores para agregar errores
 */
async function processLocationEVSEs(location, errors) {
  if (!location.evses || !Array.isArray(location.evses) || location.evses.length === 0) {
    return;
  }

  logger.info(`🔌 Procesando ${location.evses.length} EVSEs para location ${location.id}`);

  // Crear promesas para procesar todos los EVSEs en paralelo
  const evsePromises = location.evses.map(async (evse) => {
    try {
      await saveEVSE(evse, location);
      logger.info(`✅ EVSE ${evse.uid} guardado exitosamente`);
      return { success: true };
    } catch (evseError) {
      logger.error(`❌ Error guardando EVSE ${evse.uid}:`, evseError);
      errors.push(`EVSE ${evse.uid}: ${evseError.message}`);
      return { success: false };
    }
  });

  // Ejecutar todas las promesas
  await Promise.allSettled(evsePromises);
}

/**
 * Valida que una location tenga los campos obligatorios
 * @param {Object} location - Datos de la location
 * @returns {boolean} True si es válida, false si no
 */
function validateLocation(location) {
  return !!(location.party_id && location.country_code && location.id);
}

/**
 * Procesa y guarda una location individual
 * @param {Object} location - Datos de la location
 * @param {Array} errors - Array de errores para agregar errores
 * @returns {Promise<boolean>} True si se guardó exitosamente, false si no
 */
async function processLocation(location, errors) {
  if (!validateLocation(location)) {
    logger.warn(`⚠️ Location ${location.id} sin campos obligatorios, saltando...`);
    return false;
  }

  try {
    logger.info(`🔍 Procesando location: ${location.id} (${location.party_id}_${location.country_code})`);
    await saveLocation(location);
    await processLocationEVSEs(location, errors);
    return true;
  } catch (locationError) {
    logger.error(`❌ Error guardando location ${location.id}:`, locationError);
    errors.push(`Location ${location.id}: ${locationError.message}`);
    return false;
  }
}

/**
 * Construye la respuesta exitosa para guardar locations
 * @param {number} savedCount - Número de locations guardadas
 * @param {number} totalReceived - Total de locations recibidas
 * @param {Array} errors - Array de errores
 * @param {string} cpoUrl - URL del CPO
 * @returns {Object} Respuesta JSON
 */
function buildSaveLocationsResponse(savedCount, totalReceived, errors, cpoUrl) {
  return {
    status_code: 1000,
    data: {
      message: `${savedCount} locations guardados exitosamente`,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      total_received: totalReceived,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      saved_count: savedCount,
      errors: errors.length > 0 ? errors : null,
      // eslint-disable-next-line camelcase -- Campos en snake_case según convención de API
      cpo_url: cpoUrl
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
    processLocation,
    buildSaveLocationsResponse
};

