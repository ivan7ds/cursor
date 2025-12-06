const { cdrPostBodySchema } = require('./cdrSchemas');

/**
 * Funciones de validación para CDR
 */

/**
 * Validates CDR POST request
 * @param {Object} body - Request body (CDR object)
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateCdrPost(body) {
  const validation = cdrPostBodySchema.validate(body, {
    abortEarly: false,
    stripUnknown: true // Remove unknown fields to comply with OCPI spec
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
 * Express middleware for CDR POST validation
 */
async function validateCdrPostMiddleware(req, res, next) {
  const validation = validateCdrPost(req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ CDR POST validation failed', {
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
      status_message: `Invalid CDR data: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  // Store validated data in request for use in route handler
  req.validatedCdr = validation.value;
  next();
}

/**
 * Validates a single CDR object for GET response
 * @param {Object} cdr - CDR object from database
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateCdrResponse(cdr) {
  const validation = cdrPostBodySchema.validate(cdr, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
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
 * Validates an array of CDR objects for GET response
 * @param {Array} cdrs - Array of CDR objects from database
 * @returns {Object} { valid: boolean, errors: Array, validCdrs: Array, invalidCdrs: Array }
 */
function validateCdrsResponse(cdrs) {
  const validCdrs = [];
  const invalidCdrs = [];
  const allErrors = [];

  cdrs.forEach((cdr, index) => {
    const validation = validateCdrResponse(cdr);

    if (validation.valid) {
      validCdrs.push(validation.value);
    } else {
      invalidCdrs.push({
        index,
        id: cdr.id,
        errors: validation.errors
      });
      allErrors.push({
        cdr_index: index,
        cdr_id: cdr.id,
        errors: validation.errors
      });
    }
  });

  return {
    valid: invalidCdrs.length === 0,
    errors: allErrors,
    validCdrs,
    invalidCdrs
  };
}

/**
 * Express middleware for validating CDR GET responses
 * Wraps the route handler to validate response data before sending
 */
const { processResponseBody } = require('./responseHelpers');

function validateCdrGetResponseMiddleware(_req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function(body) {
    const processedBody = processResponseBody(body, originalJson);
    if (processedBody === null) {
      return; // Error ya fue enviado
    }
    return originalJson(processedBody);
  };

  next();
}

module.exports = {
  validateCdrPost,
  validateCdrPostMiddleware,
  validateCdrResponse,
  validateCdrsResponse,
  validateCdrGetResponseMiddleware
};

