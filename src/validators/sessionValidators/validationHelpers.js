/**
 * Helper functions for session validation
 */

/**
 * Valida los parámetros de ruta
 * @param {Object} params - Parámetros de ruta
 * @param {Object} schema - Schema de validación
 * @returns {Object} Resultado de la validación
 */
function validatePathParams(params, schema) {
  const validation = schema.validate(params, {
    abortEarly: false,
    stripUnknown: false
  });

  if (validation.error) {
    return {
      valid: false,
      errors: validation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: validation.value
  };
}

/**
 * Valida el cuerpo de la petición
 * @param {Object} body - Cuerpo de la petición
 * @param {Object} schema - Schema de validación
 * @param {boolean} stripUnknown - Si se deben eliminar campos desconocidos
 * @returns {Object} Resultado de la validación
 */
function validateRequestBody(body, schema, stripUnknown = true) {
  const validation = schema.validate(body, {
    abortEarly: false,
    stripUnknown
  });

  if (validation.error) {
    return {
      valid: false,
      errors: validation.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      })),
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: validation.value
  };
}

/**
 * Valida que los parámetros de ruta coincidan con los valores del cuerpo
 * @param {Object} pathParams - Parámetros de ruta validados
 * @param {Object} bodyData - Datos del cuerpo validados
 * @param {boolean} isPatch - Si es una petición PATCH (campos opcionales)
 * @returns {Array} Array de errores de coincidencia
 */
function validatePathBodyMatch(pathParams, bodyData, isPatch = false) {
  const matchErrors = [];

  const countryCodeMatch = isPatch
    ? !bodyData.country_code || pathParams.country_code.toUpperCase() === bodyData.country_code.toUpperCase()
    : pathParams.country_code.toUpperCase() === bodyData.country_code.toUpperCase();

  if (!countryCodeMatch) {
    matchErrors.push({
      field: 'country_code',
      message: `country_code in path (${pathParams.country_code}) does not match body (${bodyData.country_code})`,
      type: 'mismatch'
    });
  }

  const partyIdMatch = isPatch
    ? !bodyData.party_id || pathParams.party_id.toUpperCase() === bodyData.party_id.toUpperCase()
    : pathParams.party_id.toUpperCase() === bodyData.party_id.toUpperCase();

  if (!partyIdMatch) {
    matchErrors.push({
      field: 'party_id',
      message: `party_id in path (${pathParams.party_id}) does not match body (${bodyData.party_id})`,
      type: 'mismatch'
    });
  }

  const sessionIdMatch = isPatch
    ? !bodyData.id || pathParams.session_id.toUpperCase() === bodyData.id.toUpperCase()
    : pathParams.session_id.toUpperCase() === bodyData.id.toUpperCase();

  if (!sessionIdMatch) {
    matchErrors.push({
      field: 'id',
      message: `session_id in path (${pathParams.session_id}) does not match body id (${bodyData.id})`,
      type: 'mismatch'
    });
  }

  return matchErrors;
}

module.exports = {
    validatePathParams,
    validateRequestBody,
    validatePathBodyMatch
};

