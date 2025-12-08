const logger = require('../../utils/logger');

const {
  validateEVSEExists,
  buildEVSEPatchSuccessResponse
} = require('./locationHelpers');

/**
 * Valida que el EVSE existe y retorna error si no existe
 * @param {string} evseUid - UID del EVSE
 * @param {Object} params - Parámetros de la petición
 * @returns {Promise<Object|null>} Error si no existe, null si existe
 */
async function validateEVSEExistsForPatch(evseUid, params) {
  const { country_code, party_id, location_id } = params;
  const evseResult = await validateEVSEExists(evseUid);

  if (!evseResult) {
    logger.warn(`⚠️ EVSE not found in external_operator_evses: ${evseUid}`, {
      country_code,
      party_id,
      location_id,
      evse_uid: evseUid
    });
    return {
      error: {
        status: 404,
        json: {
          status_code: 2001,
          status_message: 'EVSE not found',
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  return { evseResult };
}

/**
 * Ejecuta la actualización del EVSE
 * @param {Object} params - Parámetros de actualización
 * @param {Object} params.evseResult - Resultado del EVSE encontrado
 * @param {Object} params.updateFields - Campos a actualizar
 * @param {string} params.evseUid - UID del EVSE
 * @param {string} params.locationId - ID de la location
 * @param {Object} params.updateData - Datos de actualización
 * @returns {Promise<Object>} Resultado exitoso
 */
async function executeEVSEUpdate({ evseResult, updateFields, evseUid, locationId, updateData }) {
  await evseResult.update(updateFields);

  logger.info(`✅ EVSE patched in location`, {
    evse_uid: evseUid,
    location_id: locationId,
    updatedFields: Object.keys(updateData)
  });

  return {
    success: buildEVSEPatchSuccessResponse(evseUid, locationId, Object.keys(updateData))
  };
}

module.exports = {
    validateEVSEExistsForPatch,
    executeEVSEUpdate
};

