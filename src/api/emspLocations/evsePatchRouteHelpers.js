const logger = require('../../utils/logger');

const { buildEVSEPatchFields, validatePatchFields } = require('./evsePatchHelpers');

/**
 * Procesa la petición PATCH de EVSE
 * @param {Object} params - Parámetros de la ruta
 * @param {Object} updateData - Datos de actualización
 * @returns {Promise<Object>} Resultado de la operación
 */
const {
  validateEVSEExistsForPatch,
  executeEVSEUpdate
} = require('./evsePatchRequestHelpers');

async function processEVSEPatchRequest(params, updateData) {
  const { location_id, evse_uid } = params;

  logger.info(`📥 PATCH EVSE in Location received`, {
    ...params,
    updateFields: Object.keys(updateData),
    timestamp: new Date().toISOString()
  });

  const evseValidation = await validateEVSEExistsForPatch(evse_uid, params);
  if (evseValidation.error) {
    return evseValidation;
  }

  const updateFields = buildEVSEPatchFields(updateData);
  const validationError = validatePatchFields({ updateFields, evseUid: evse_uid, locationId: location_id, countryCode: params.country_code, partyId: params.party_id });
  
  if (validationError) {
    return { error: validationError };
  }

  return executeEVSEUpdate({ evseResult: evseValidation.evseResult, updateFields, evseUid: evse_uid, locationId: location_id, updateData });
}

module.exports = {
    processEVSEPatchRequest
};

