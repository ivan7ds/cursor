const { sessionPatchBodySchema } = require('./patchSchemas');
const { sessionPutPathSchema } = require('./putSchemas');
const {
  validatePathParams,
  validateRequestBody,
  validatePathBodyMatch
} = require('./validationHelpers');

/**
 * Validates Session PATCH request
 * @param {Object} params - Path parameters {country_code, party_id, session_id}
 * @param {Object} body - Request body (partial Session object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateSessionPatch(params, body) {
  const pathValidation = validatePathParams(params, sessionPutPathSchema);
  if (!pathValidation.valid) {
    return pathValidation;
  }

  const bodyValidation = validateRequestBody(body, sessionPatchBodySchema, true);
  if (!bodyValidation.valid) {
    return bodyValidation;
  }

  const matchErrors = validatePathBodyMatch(pathValidation.value, bodyValidation.value, true);

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
 * Express middleware for Session PATCH validation
 */
async function validateSessionPatchMiddleware(req, res, next) {
  const validation = validateSessionPatch(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ Session PATCH validation failed', {
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
      status_message: `Invalid Session PATCH data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedSessionPatch = validation.value;
  next();
}

module.exports = {
    validateSessionPatch,
    validateSessionPatchMiddleware
};

