const { ValidationError } = require('../models');

const logger = require('./logger');

/**
 * Logs a validation error to the database
 * @param {Object} params - Parameters for logging
 * @param {string} params.endpoint - API endpoint that received the invalid request
 * @param {string} params.method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {Object} params.requestBody - The request body that failed validation
 * @param {Array} params.validationErrors - Array of validation error details
 * @param {Object} params.req - Express request object (for IP and user agent)
 */
async function logValidationError({ endpoint, method, requestBody, validationErrors, req }) {
  try {
    await ValidationError.create({
      endpoint,
      method,
      request_body: JSON.stringify(requestBody),
      validation_errors: validationErrors,
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.get('user-agent') || null,
      timestamp: new Date()
    });
  } catch (error) {
    // Log error but don't throw - we don't want to break the API flow
    logger.error('Failed to log validation error to database:', error);
  }
}

/**
 * Helper to wrap validation middleware and log errors
 * @param {Function} validationFunction - Function that returns { valid, errors, value }
 * @param {string} resourceName - Name of the resource being validated (e.g., 'Session', 'CDR')
 * @returns {Function} Express middleware function
 */
function _createValidationMiddleware(validationFunction, resourceName) {
  return async function(req, res, next) {
    const validation = validationFunction(req.body);

    if (!validation.valid) {
      const errorMessage = validation.errors
        .map(err => `${err.field}: ${err.message}`)
        .join('; ');

      logger.error(`❌ ${resourceName} validation failed`, {
        errors: validation.errors,
        body: req.body
      });

      // Log validation error to database
      await logValidationError({
        endpoint: req.originalUrl || req.url,
        method: req.method,
        requestBody: req.body,
        validationErrors: validation.errors,
        req
      });

      return res.status(400).json({
        status_code: 2001,
        status_message: `Invalid ${resourceName} data: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        errors: validation.errors
      });
    }

    // Store validated data in request for use in route handler
    req[`validated${resourceName}`] = validation.value;
    next();
  };
}

module.exports = {
  logValidationError
};
