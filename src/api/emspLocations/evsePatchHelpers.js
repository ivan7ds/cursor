const EmspEVSE = require('../../models/EmspEVSE');
const logger = require('../../utils/logger');

/**
 * Valida que el EVSE existe
 * @param {string} evseUid - UID del EVSE
 * @returns {Promise<Object|null>} EVSE encontrado o null
 */
async function validateEVSEExists(evseUid) {
  return EmspEVSE.findByPk(evseUid);
}

/**
 * Construye los campos de actualización para PATCH de EVSE
 * @param {Object} updateData - Datos de actualización
 * @returns {Object} Campos de actualización filtrados
 */
function buildEVSEPatchFields(updateData) {
  const updateFields = {};
  const allowedFields = ['status', 'capabilities', 'connectors', 'physical_reference', 'last_updated'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updateFields[field] = updateData[field];
    }
  }
  
  return updateFields;
}

/**
 * Valida que hay campos para actualizar
 * @param {Object} updateFields - Campos de actualización
 * @param {string} evseUid - UID del EVSE
 * @param {string} locationId - ID de la location
 * @param {string} countryCode - Código de país
 * @param {string} partyId - Party ID
 * @returns {Object|null} Error si no hay campos, null si es válido
 */
function validatePatchFields({ updateFields, evseUid, locationId, countryCode, partyId }) {
  if (Object.keys(updateFields).length === 0) {
    logger.warn(`⚠️ No fields to update for PATCH`, {
      country_code: countryCode,
      party_id: partyId,
      location_id: locationId,
      evse_uid: evseUid
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
 * Construye la respuesta de éxito para PATCH de EVSE
 * @param {string} evseUid - UID del EVSE
 * @param {string} locationId - ID de la location
 * @param {Array} updatedFields - Campos actualizados
 * @returns {Object} Respuesta de éxito
 */
function buildEVSEPatchSuccessResponse(_evseUid, _locationId, _updatedFields) {
  return {
    status_code: 1000,
    status_message: 'Success',
    timestamp: new Date().toISOString()
  };
}

/**
 * Construye la respuesta de error para PATCH de EVSE
 * @param {Error} error - Error ocurrido
 * @param {Object} params - Parámetros de la petición
 * @param {Object} body - Cuerpo de la petición
 * @returns {Object} Respuesta de error
 */
function buildEVSEPatchErrorResponse(error, params, body) {
  logger.error(`❌ Error patching EVSE: ${error.message}`, {
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
    validateEVSEExists,
    buildEVSEPatchFields,
    validatePatchFields,
    buildEVSEPatchSuccessResponse,
    buildEVSEPatchErrorResponse
};

