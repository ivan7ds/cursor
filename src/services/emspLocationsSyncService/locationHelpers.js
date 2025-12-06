const { sequelize } = require('../../database/connection');
const logger = require('../../utils/logger');

const {
  buildBasicUpdateValues,
  buildJSONUpdateValues,
  buildAdditionalUpdateValues,
  buildBasicInsertValues,
  buildJSONInsertValues,
  buildAdditionalInsertValues
} = require('./locationDataHelpers');

/**
 * Verifica si una location existe en la base de datos
 * @param {string} locationId - ID de la location
 * @returns {Promise<boolean>} True si existe, false en caso contrario
 */
async function locationExists(locationId) {
  const [existingLocation] = await sequelize.query(`
    SELECT id FROM emsp_locations WHERE id = ?
  `, {
    replacements: [locationId],
    type: sequelize.QueryTypes.SELECT
  });

  return !!existingLocation;
}

/**
 * Prepara los datos de location para actualización
 * @param {Object} location - Datos de la location
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @returns {Array} Array de replacements para el query SQL
 */
function prepareLocationUpdateData(location, partyId, countryCode) {
  const basicValues = buildBasicUpdateValues(location, partyId, countryCode);
  const jsonValues = buildJSONUpdateValues(location);
  const additionalValues = buildAdditionalUpdateValues(location);

  return [
    ...basicValues,
    ...jsonValues,
    additionalValues[0], // time_zone
    jsonValues[7], // opening_times
    additionalValues[1], // charging_when_closed
    jsonValues[8], // images
    jsonValues[9], // energy_mix
    additionalValues[2], // last_updated
    additionalValues[3] // location.id (WHERE clause)
  ];
}

/**
 * Prepara los datos de location para inserción
 * @param {Object} location - Datos de la location
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @returns {Array} Array de replacements para el query SQL
 */
function prepareLocationInsertData(location, partyId, countryCode) {
  const basicValues = buildBasicInsertValues(location, partyId, countryCode);
  const jsonValues = buildJSONInsertValues(location);
  const additionalValues = buildAdditionalInsertValues(location);

  return [
    ...basicValues,
    ...jsonValues,
    additionalValues[0], // time_zone
    jsonValues[7], // opening_times
    additionalValues[1], // charging_when_closed
    jsonValues[8], // images
    jsonValues[9], // energy_mix
    additionalValues[2] // last_updated
  ];
}

/**
 * Actualiza una location existente
 * @param {Object} location - Datos de la location
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @returns {Promise<void>}
 */
async function updateLocation(location, partyId, countryCode) {
  const replacements = prepareLocationUpdateData(location, partyId, countryCode);
  
  await sequelize.query(`
    UPDATE emsp_locations SET
      emsp_party_id = ?,
      emsp_country_code = ?,
      location_id = ?,
      name = ?,
      address = ?,
      city = ?,
      postal_code = ?,
      country = ?,
      coordinates = ?,
      evses = ?,
      directions = ?,
      operator = ?,
      suboperator = ?,
      owner = ?,
      facilities = ?,
      time_zone = ?,
      opening_times = ?,
      charging_when_closed = ?,
      images = ?,
      energy_mix = ?,
      last_updated = ?
    WHERE id = ?
  `, {
    replacements,
    type: sequelize.QueryTypes.UPDATE
  });

  logger.debug(`🔄 Updated location ${location.id} for EMSP ${partyId}`);
}

/**
 * Crea una nueva location
 * @param {Object} location - Datos de la location
 * @param {string} partyId - Party ID del EMSP
 * @param {string} countryCode - Código de país del EMSP
 * @returns {Promise<void>}
 */
async function createLocation(location, partyId, countryCode) {
  const replacements = prepareLocationInsertData(location, partyId, countryCode);
  
  await sequelize.query(`
    INSERT INTO emsp_locations (
      id, emsp_party_id, emsp_country_code, location_id, name, address, city, 
      postal_code, country, coordinates, evses, directions, operator, 
      suboperator, owner, facilities, time_zone, opening_times, 
      charging_when_closed, images, energy_mix, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, {
    replacements,
    type: sequelize.QueryTypes.INSERT
  });

  logger.debug(`✅ Created location ${location.id} for EMSP ${partyId}`);
}

module.exports = {
    locationExists,
    updateLocation,
    createLocation
};

