const { locationPathSchema, locationPatchBodySchema } = require('./locationSchemas');

/**
 * Valida los parámetros de ruta para PATCH de Location
 * @param {Object} params - Parámetros de ruta
 * @returns {Object} Resultado de validación
 */
function validateLocationPatchPath(params) {
  const pathValidation = locationPathSchema.validate(params, {
    abortEarly: false,
    stripUnknown: false
  });

  if (pathValidation.error) {
    return {
      valid: false,
      errors: pathValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  return {
    valid: true,
    value: pathValidation.value
  };
}

/**
 * Valida el body para PATCH de Location
 * @param {Object} body - Body de la petición
 * @returns {Object} Resultado de validación
 */
function validateLocationPatchBody(body) {
  const bodyValidation = locationPatchBodySchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (bodyValidation.error) {
    return {
      valid: false,
      errors: bodyValidation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  return {
    valid: true,
    value: bodyValidation.value
  };
}

/**
 * Valida que los parámetros de ruta coincidan con los valores del body (si están presentes)
 * @param {Object} pathParams - Parámetros de ruta validados
 * @param {Object} bodyData - Datos del body validados
 * @returns {Array} Array de errores de coincidencia (vacío si no hay errores)
 */
function validateLocationPatchPathBodyMatch(pathParams, bodyData) {
  const matchErrors = [];

  if (bodyData.country_code && pathParams.country_code.toUpperCase() !== bodyData.country_code.toUpperCase()) {
    matchErrors.push({
      field: 'country_code',
      message: `country_code in path (${pathParams.country_code}) does not match body (${bodyData.country_code})`,
      type: 'mismatch'
    });
  }

  if (bodyData.party_id && pathParams.party_id.toUpperCase() !== bodyData.party_id.toUpperCase()) {
    matchErrors.push({
      field: 'party_id',
      message: `party_id in path (${pathParams.party_id}) does not match body (${bodyData.party_id})`,
      type: 'mismatch'
    });
  }

  if (bodyData.id && pathParams.location_id.toUpperCase() !== bodyData.id.toUpperCase()) {
    matchErrors.push({
      field: 'id',
      message: `location_id in path (${pathParams.location_id}) does not match body id (${bodyData.id})`,
      type: 'mismatch'
    });
  }

  return matchErrors;
}

module.exports = {
    validateLocationPatchPath,
    validateLocationPatchBody,
    validateLocationPatchPathBodyMatch
};

