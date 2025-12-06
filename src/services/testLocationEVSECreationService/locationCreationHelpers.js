const { Location } = require('../../models');
const logger = require('../../utils/logger');

const { buildTestLocationData } = require('./locationDataBuilders');

/**
 * Crea la location en la base de datos
 * @param {Object} locationData - Datos de la location
 * @returns {Promise<Object>} Location creada
 */
async function createLocationInDatabase(locationData) {
  const location = await Location.create(locationData);
  logger.info(`✅ Test location created successfully: ${location.id}`);
  return location;
}

/**
 * Crea una location de prueba
 * @returns {Promise<Object>} Location creada
 */
async function createTestLocation() {
  const testId = `TEST-${Date.now()}`;
  const locationData = buildTestLocationData(testId);
  return createLocationInDatabase(locationData);
}

module.exports = {
    buildTestLocationData,
    createLocationInDatabase,
    createTestLocation
};

