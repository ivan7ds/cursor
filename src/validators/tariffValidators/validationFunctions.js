const logger = require('../../utils/logger');

const {
  validateTariffPutPath,
  validateTariffPutBody,
  validateTariffPutPathBodyMatch
} = require('./putHelpers');
const { tariffPutBodySchema, tariffPatchBodySchema, tariffPutPathSchema } = require('./tariffBodySchemas');

/**
 * Funciones de validación para Tariff
 */

/**
 * Validates Tariff PUT request
 * @param {Object} params - Path parameters {country_code, party_id, tariff_id}
 * @param {Object} body - Request body (Tariff object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */

function validateTariffPut(params, body) {
  const pathResult = validateTariffPutPath(params);
  if (!pathResult.valid) {
    return pathResult;
  }

  const bodyResult = validateTariffPutBody(body);
  if (!bodyResult.valid) {
    return bodyResult;
  }

  const matchErrors = validateTariffPutPathBodyMatch(pathResult.value, bodyResult.value);
  if (matchErrors.length > 0) {
    return {
      valid: false,
      errors: matchErrors,
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: bodyResult.value
  };
}

/**
 * Express middleware for Tariff PUT validation
 */
function validateTariffPutMiddleware(req, res, next) {
  const validation = validateTariffPut(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    logger.error('❌ Tariff PUT validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Tariff data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedTariff = validation.value;
  next();
}

/**
 * Validates Tariff PATCH request
 * @param {Object} params - Path parameters {country_code, party_id, tariff_id}
 * @param {Object} body - Request body (partial Tariff object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
const {
  validateTariffPatchPath,
  validateTariffPatchBody,
  validateTariffPatchPathBodyMatch
} = require('./patchHelpers');

function validateTariffPatch(params, body) {
  const pathResult = validateTariffPatchPath(params);
  if (!pathResult.valid) {
    return pathResult;
  }

  const bodyResult = validateTariffPatchBody(body);
  if (!bodyResult.valid) {
    return bodyResult;
  }

  const matchErrors = validateTariffPatchPathBodyMatch(pathResult.value, bodyResult.value);
  if (matchErrors.length > 0) {
    return {
      valid: false,
      errors: matchErrors,
      value: null
    };
  }

  return {
    valid: true,
    errors: [],
    value: bodyResult.value
  };
}

/**
 * Express middleware for Tariff PATCH validation
 */
function validateTariffPatchMiddleware(req, res, next) {
  const validation = validateTariffPatch(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    logger.error('❌ Tariff PATCH validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Tariff PATCH data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedTariffPatch = validation.value;
  next();
}

module.exports = {
  validateTariffPut,
  validateTariffPutMiddleware,
  validateTariffPatch,
  validateTariffPatchMiddleware
};

