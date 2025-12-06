const { tokenPutBodySchema, tokenPutPathSchema } = require('./putSchemas');
const {
  validatePathParams,
  validateRequestBody,
  validateTokenPathBodyMatch
} = require('./validationHelpers');

/**
 * Validates Token PUT request
 * @param {Object} params - Path parameters {country_code, party_id, uid}
 * @param {Object} body - Request body (Token object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateTokenPut(params, body) {
  const pathValidation = validatePathParams(params, tokenPutPathSchema);
  if (!pathValidation.valid) {
    return pathValidation;
  }

  const bodyValidation = validateRequestBody(body, tokenPutBodySchema, true);
  if (!bodyValidation.valid) {
    return bodyValidation;
  }

  const matchErrors = validateTokenPathBodyMatch(pathValidation.value, bodyValidation.value, false);

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
    value: bodyValidation.value
  };
}

/**
 * Express middleware for Token PUT validation
 */
async function validateTokenPutMiddleware(req, res, next) {
  const validation = validateTokenPut(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ Token PUT validation failed', {
      errors: validation.errors,
      body: req.body
    });

    const { logValidationError } = require('../../utils/validationErrorLogger');
    await logValidationError({
      endpoint: req.originalUrl || req.url,
      method: req.method,
      requestBody: req.body,
      validationErrors: validation.errors,
      req
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Token PUT data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedTokenPut = validation.value;
  next();
}

module.exports = {
    validateTokenPut,
    validateTokenPutMiddleware
};

