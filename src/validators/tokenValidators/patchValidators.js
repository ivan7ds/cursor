const { tokenPatchBodySchema } = require('./patchSchemas');
const { tokenPutPathSchema } = require('./putSchemas');
const {
  validatePathParams,
  validateRequestBody,
  validateTokenPathBodyMatch
} = require('./validationHelpers');

/**
 * Validates Token PATCH request
 * @param {Object} params - Path parameters {country_code, party_id, uid}
 * @param {Object} body - Request body (partial Token object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateTokenPatch(params, body) {
  const pathValidation = validatePathParams(params, tokenPutPathSchema);
  if (!pathValidation.valid) {
    return pathValidation;
  }

  const bodyValidation = validateRequestBody(body, tokenPatchBodySchema, true);
  if (!bodyValidation.valid) {
    return bodyValidation;
  }

  const matchErrors = validateTokenPathBodyMatch(pathValidation.value, bodyValidation.value, true);

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
 * Express middleware for Token PATCH validation
 */
async function validateTokenPatchMiddleware(req, res, next) {
  const validation = validateTokenPatch(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

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
      status_message: `Invalid Token PATCH data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedTokenPatch = validation.value;
  next();
}

module.exports = {
    validateTokenPatch,
    validateTokenPatchMiddleware
};

