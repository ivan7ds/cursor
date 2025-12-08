/**
 * Helper functions for token validation
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
 * Valida que los parámetros de ruta coincidan con los valores del cuerpo para tokens
 * @param {Object} pathParams - Parámetros de ruta validados
 * @param {Object} bodyData - Datos del cuerpo validados
 * @param {boolean} isPatch - Si es una petición PATCH (campos opcionales)
 * @returns {Array} Array de errores de coincidencia
 */
function validateTokenPathBodyMatch(pathParams, bodyData, isPatch = false) {
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

  const uidMatch = isPatch
    ? !bodyData.uid || pathParams.uid.toUpperCase() === bodyData.uid.toUpperCase()
    : pathParams.uid.toUpperCase() === bodyData.uid.toUpperCase();

  if (!uidMatch) {
    matchErrors.push({
      field: 'uid',
      message: `uid in path (${pathParams.uid}) does not match body (${bodyData.uid})`,
      type: 'mismatch'
    });
  }

  return matchErrors;
}

module.exports = {
    validatePathParams,
    validateRequestBody,
    validateTokenPathBodyMatch
};

