const logger = require('../../../utils/logger');

const {
  buildBasicLocationValues,
  buildJSONLocationValues,
  buildAdditionalLocationValues
} = require('./locationValuesHelpers');

/**
 * Prepara los valores para actualizar o crear una location
 * @param {Object} locationData - Datos de la location
 * @param {string} party_id - Party ID
 * @param {string} country_code - Country code
 * @returns {Array} Array de valores para la query SQL
 */
function prepareLocationValues(locationData, party_id, country_code) {
  const basicValues = buildBasicLocationValues(locationData, party_id, country_code);
  const jsonValues = buildJSONLocationValues(locationData);
  const additionalValues = buildAdditionalLocationValues(locationData);

  return [
    ...basicValues,
    jsonValues[0], // coordinates
    jsonValues[1], // related_locations
    additionalValues[0], // parking_type
    additionalValues[1], // time_zone
    jsonValues[2], // opening_times
    additionalValues[2], // charging_when_closed
    jsonValues[3], // images
    jsonValues[4], // energy_mix
    jsonValues[5], // directions
    jsonValues[6], // operator
    jsonValues[7], // suboperator
    jsonValues[8], // owner
    jsonValues[9], // facilities
    additionalValues[3], // publish
    jsonValues[10], // publish_allowed_to
    additionalValues[4] // last_updated
  ];
}

/**
 * Actualiza una location existente en la base de datos
 * @param {Object} params - Parámetros de actualización
 * @param {Object} params.sequelize - Instancia de Sequelize
 * @param {string} params.location_id - ID de la location
 * @param {Object} params.locationData - Datos de la location
 * @param {string} params.party_id - Party ID
 * @param {string} params.country_code - Country code
 */
async function updateLocation({ sequelize, location_id, locationData, party_id, country_code }) {
  const values = prepareLocationValues(locationData, party_id, country_code);
  values.push(location_id);

  await sequelize.query(`
    UPDATE emsp_locations SET
      emsp_party_id = ?,
      emsp_country_code = ?,
      name = ?,
      address = ?,
      city = ?,
      postal_code = ?,
      state = ?,
      country = ?,
      coordinates = ?,
      related_locations = ?,
      parking_type = ?,
      time_zone = ?,
      opening_times = ?,
      charging_when_closed = ?,
      images = ?,
      energy_mix = ?,
      directions = ?,
      operator = ?,
      suboperator = ?,
      owner = ?,
      facilities = ?,
      publish = ?,
      publish_allowed_to = ?,
      last_updated = ?
    WHERE id = ?
  `, {
    replacements: values,
    type: sequelize.QueryTypes.UPDATE
  });

  logger.info(`✅ Location updated in emsp_locations: ${location_id}`);
}

/**
 * Crea una nueva location en la base de datos
 * @param {Object} params - Parámetros de creación
 * @param {Object} params.sequelize - Instancia de Sequelize
 * @param {string} params.location_id - ID de la location
 * @param {Object} params.locationData - Datos de la location
 * @param {string} params.party_id - Party ID
 * @param {string} params.country_code - Country code
 */
async function createLocation({ sequelize, location_id, locationData, party_id, country_code }) {
  const values = prepareLocationValues(locationData, party_id, country_code);
  values.unshift(location_id, party_id, country_code, location_id);

  await sequelize.query(`
    INSERT INTO emsp_locations (
      id, emsp_party_id, emsp_country_code, location_id, name, address, city,
      postal_code, state, country, coordinates, related_locations, parking_type,
      time_zone, opening_times, charging_when_closed, images, energy_mix,
      directions, operator, suboperator, owner, facilities, publish,
      publish_allowed_to, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, {
    replacements: values,
    type: sequelize.QueryTypes.INSERT
  });

  logger.info(`✅ Location created in emsp_locations: ${location_id}`);
}

/**
 * Verifica si una location existe
 * @param {Object} sequelize - Instancia de Sequelize
 * @param {string} location_id - ID de la location
 * @returns {boolean} true si existe, false si no
 */
async function locationExists(sequelize, location_id) {
  const [results] = await sequelize.query(`
    SELECT COUNT(*) as count FROM emsp_locations WHERE id = ?
  `, {
    replacements: [location_id],
    type: sequelize.QueryTypes.SELECT
  });

  return results.count > 0;
}

/**
 * Crea una location mínima si no existe
 * @param {Object} params - Parámetros de creación
 * @param {Object} params.sequelize - Instancia de Sequelize
 * @param {string} params.location_id - ID de la location
 * @param {string} params.party_id - Party ID
 * @param {string} params.country_code - Country code
 * @param {string} params.evse_uid - UID del EVSE (para nombre por defecto)
 */
async function ensureLocationExists({ sequelize, location_id, party_id, country_code, evse_uid }) {
  const exists = await locationExists(sequelize, location_id);

  if (!exists) {
    logger.info(`📍 Creating new location in emsp_locations: ${location_id}`, {
      country_code,
      party_id,
      location_id
    });

    await sequelize.query(`
      INSERT INTO emsp_locations (
        id, emsp_party_id, emsp_country_code, location_id, name, address, city,
        postal_code, country, coordinates, time_zone, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        location_id,
        party_id,
        country_code,
        location_id,
        `Location for ${evse_uid}`,
        'Address not provided',
        'Unknown',
        '00000',
        country_code,
        JSON.stringify({ latitude: '0.0', longitude: '0.0' }),
        'Europe/Madrid',
        new Date().toISOString()
      ],
      type: sequelize.QueryTypes.INSERT
    });

    logger.info(`✅ Created location in emsp_locations: ${location_id}`);
  }
}

module.exports = {
    prepareLocationValues,
    updateLocation,
    createLocation,
    locationExists,
    ensureLocationExists
};

