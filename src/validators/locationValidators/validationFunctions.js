const { locationPutBodySchema, locationPatchBodySchema, locationPathSchema } = require('./locationSchemas');

/**
 * Funciones de validación para Location
 */

/**
 * Validates Location PUT request
 */
const {
  validateLocationPutPath,
  validateLocationPutBody,
  validateLocationPutPathBodyMatch
} = require('./putHelpers');

function validateLocationPut(params, body) {
  const pathResult = validateLocationPutPath(params);
  if (!pathResult.valid) {
    return pathResult;
  }

  const bodyResult = validateLocationPutBody(body);
  if (!bodyResult.valid) {
    return bodyResult;
  }

  const matchErrors = validateLocationPutPathBodyMatch(pathResult.value, bodyResult.value);
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
 * Express middleware for Location PUT validation
 */
async function validateLocationPutMiddleware(req, res, next) {
  const validation = validateLocationPut(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ Location PUT validation failed', {
      errors: validation.errors,
      body: req.body
    });

    // Log validation error to database
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
      status_message: `Invalid Location data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedLocation = validation.value;
  next();
}

/**
 * Validates Location PATCH request
 */
const {
  validateLocationPatchPath,
  validateLocationPatchBody,
  validateLocationPatchPathBodyMatch
} = require('./patchHelpers');

function validateLocationPatch(params, body) {
  const pathResult = validateLocationPatchPath(params);
  if (!pathResult.valid) {
    return pathResult;
  }

  const bodyResult = validateLocationPatchBody(body);
  if (!bodyResult.valid) {
    return bodyResult;
  }

  const matchErrors = validateLocationPatchPathBodyMatch(pathResult.value, bodyResult.value);
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
 * Express middleware for Location PATCH validation
 */
function validateLocationPatchMiddleware(req, res, next) {
  const validation = validateLocationPatch(req.params, req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ Location PATCH validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid Location PATCH data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedLocationPatch = validation.value;
  next();
}

module.exports = {
  validateLocationPut,
  validateLocationPutMiddleware,
  validateLocationPatch,
  validateLocationPatchMiddleware
};

