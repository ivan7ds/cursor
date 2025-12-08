const Joi = require('joi');

const { ciString } = require('../../utils/ocpiValidators');

const { urlSchema } = require('./schemas');

/**
 * STOP_SESSION command body validator
 *
 * Required fields:
 * - response_url: URL for CommandResult POST
 * - session_id: Session.id to stop
 */
const stopSessionSchema = Joi.object({
  response_url: urlSchema,

  session_id: ciString(36).required()
    .messages({
      'any.required': 'session_id is required',
      'string.max': 'session_id must be at most 36 characters'
    })
}).messages({
  'object.base': 'Request body must be a valid JSON object'
});

/**
 * Validates STOP_SESSION command request
 * @param {Object} body - Request body
 * @returns {Object} { valid: boolean, errors: Array, value: Object }
 */
function validateStopSession(body) {
  const validation = stopSessionSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
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
 * Express middleware for STOP_SESSION validation
 */
function validateStopSessionMiddleware(req, res, next) {
  const validation = validateStopSession(req.body);

  if (!validation.valid) {
    const errorMessage = validation.errors
      .map(err => `${err.field}: ${err.message}`)
      .join('; ');

    const logger = require('../../utils/logger');
    logger.error('❌ STOP_SESSION validation failed', {
      errors: validation.errors,
      body: req.body
    });

    return res.status(400).json({
      status_code: 2001,
      status_message: `Invalid STOP_SESSION command: ${errorMessage}`,
      data: {
        result: 'REJECTED',
        timeout: 0
      },
      timestamp: new Date().toISOString(),
      errors: validation.errors
    });
  }

  req.validatedCommand = validation.value;
  next();
}

module.exports = {
    stopSessionSchema,
    validateStopSession,
    validateStopSessionMiddleware
};

