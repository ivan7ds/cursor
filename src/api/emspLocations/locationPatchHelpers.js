const logger = require('../../utils/logger');


/**
 * Verifica si una location existe
 * @param {Object} sequelize - Instancia de Sequelize
 * @param {string} locationId - ID de la location
 * @returns {Promise<boolean>} True si existe, false en caso contrario
 */
async function locationExists(sequelize, locationId) {
  const [results] = await sequelize.query(
    'SELECT id FROM emsp_locations WHERE id = ?',
    { replacements: [locationId] }
  );
  return results.length > 0;
}

/**
 * Valida que la location existe
 * @param {Object} sequelize - Instancia de Sequelize
 * @param {string} locationId - ID de la location
 * @param {string} countryCode - Código de país
 * @param {string} partyId - Party ID
 * @returns {Promise<boolean>} True si existe, false en caso contrario
 */
async function validateLocationExists(sequelize, locationId, countryCode, partyId) {
  const exists = await locationExists(sequelize, locationId);
  if (!exists) {
    logger.warn(`⚠️ Location not found: ${locationId}`, {
      country_code: countryCode,
      party_id: partyId,
      location_id: locationId
    });
  }
  return exists;
}

/**
 * Construye la respuesta de error cuando la location no existe
 * @returns {Object} Respuesta de error
 */
function buildLocationNotFoundResponse() {
  return {
    status: 404,
    json: {
      status_code: 2001,
      status_message: 'Location not found',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Valida que hay campos para actualizar
 * @param {Object} params - Parámetros de validación
 * @param {Array} params.updateFields - Campos de actualización
 * @param {string} params.countryCode - Código de país
 * @param {string} params.partyId - Party ID
 * @param {string} params.locationId - ID de la location
 * @returns {Object|null} Error si no hay campos, null si es válido
 */
function validatePatchFields({ updateFields, countryCode, partyId, locationId }) {
  if (updateFields.length === 0) {
    logger.warn(`⚠️ No fields to update for PATCH`, {
      country_code: countryCode,
      party_id: partyId,
      location_id: locationId
    });
    return {
      status: 400,
      json: {
        status_code: 2001,
        status_message: 'No fields to update',
        timestamp: new Date().toISOString()
      }
    };
  }
  return null;
}

/**
 * Ejecuta la actualización de la location en la base de datos
 * @param {Object} sequelize - Instancia de Sequelize
 * @param {Array} updateFields - Campos de actualización
 * @param {Array} replacements - Valores de reemplazo para la query
 * @param {string} locationId - ID de la location
 * @returns {Promise<void>}
 */
async function executeLocationUpdate(sequelize, updateFields, replacements, locationId) {
  replacements.push(locationId);
  await sequelize.query(`
    UPDATE emsp_locations SET ${updateFields.join(', ')} WHERE id = ?
  `, { replacements });
}

/**
 * Construye la respuesta de éxito para PATCH de location
 * @param {string} locationId - ID de la location
 * @returns {Object} Respuesta de éxito
 */
function buildLocationPatchSuccessResponse(_locationId) {
  return {
    status_code: 1000,
    status_message: 'Success',
    timestamp: new Date().toISOString()
  };
}

/**
 * Construye la respuesta de error para PATCH de location
 * @param {Error} error - Error ocurrido
 * @param {Object} params - Parámetros de la petición
 * @param {Object} body - Cuerpo de la petición
 * @returns {Object} Respuesta de error
 */
function buildLocationPatchErrorResponse(error, params, body) {
  logger.error(`❌ Error patching location: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    params,
    body
  });

  return {
    status: 500,
    json: {
      status_code: 2000,
      status_message: `Internal server error: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
    validateLocationExists,
    buildLocationNotFoundResponse,
    validatePatchFields,
    executeLocationUpdate,
    buildLocationPatchSuccessResponse,
    buildLocationPatchErrorResponse
};

